#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════
 * ESMC SDK v4.1 © 2025 Abelitie Designs Malaysia
 * Build: 2025-11-20 | https://esmc-sdk.com
 * ════════════════════════════════════════════════════════════════
 * ⚠️  PROPRIETARY SOFTWARE - Licensed, Not Sold
 *
 *    ESMC is a commercial AI-powered development framework.
 *    Unauthorized use, copying, or distribution is strictly
 *    prohibited and will be prosecuted to the fullest extent
 *    of applicable law.
 *
 *    If you obtained this without purchase or valid license:
 *    → Report to: security@esmc-sdk.com
 *    → Purchase at: https://esmc-sdk.com
 * ════════════════════════════════════════════════════════════════
 */
/** ESMC 3.14.2 ATLAS | 2025-11-04 | v3.14.2 | PROD | ALL_TIERS
 *  Purpose: 3-tier memory retrieval (Recent→Topic→Keyword) + structural awareness
 *  Features: 5-10x↑speed | 80% T1 hits (~0.5s) | Unified .claude/memory/ index path
 *  Philosophy: "Passing vs Diving" - Session memories (brief) vs Documents (deep)
 *  ESMC 3.14.2: Consolidated all indexes to .claude/memory/ (.project-index.json)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════
// ATLAS RETRIEVAL SYSTEM - 3-TIER PROTOCOL
// ═══════════════════════════════════════════════════════════════════════

class AtlasRetrievalSystem {
    constructor(options = {}) {
        this.version = "3.14.2";
        this.systemName = "ATLAS";
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');
        this.silent = options.silent || false; // 🆕 ESMC 3.88.0: Silent mode support

        // Index paths (all consolidated to .claude/memory/)
        this.recentIndexPath = path.join(this.memoryPath, '.memory-recent.json');
        this.topicIndexPath = path.join(this.memoryPath, '.topic-index.json');
        this.registryPath = path.join(this.memoryPath, '.memory-registry.json');
        this.structureIndexPath = path.join(this.memoryPath, '.project-index.json');

        // Performance tracking
        this.performanceMetrics = {
            tier1_hits: 0,
            tier2_hits: 0,
            tier3_hits: 0,
            total_queries: 0,
            avg_response_time: 0
        };

        // 🆕 Project Structure Index (loaded on demand)
        this.projectIndex = null;
        this.indexLastLoaded = null;

        // 🆕 ECHO CONTEXT CACHE (ESMC 3.22 v3.0)
        // Current conversation checkpoint (loaded once per session)
        this.echoContext = null;

        // 🆕 SESSION-SCOPED FOOTPRINT CACHE (ESMC 3.14)
        // "Professor" mode - remembers what ATLAS has seen during conversation
        this.footprint = {
            sessionId: null,              // Current conversation ID
            startedAt: null,              // Session start timestamp
            expiresAt: null,              // Auto-clear after 4 hours

            // What ATLAS has "seen" during tier searches
            memory: {
                t1_recent: {
                    sessions: [],          // All 10 sessions from .memory-recent
                    filesMentioned: new Map(), // file → {sessionId, snippet, timestamp}
                    lastScanned: null
                },
                t2_topics: {
                    topics: [],            // Topics encountered
                    sessions: new Map(),   // topic → [sessionIds]
                    lastScanned: null
                },
                t3_keywords: {
                    sessions: [],          // Sessions from keyword search
                    keywords: [],          // Keywords that had hits
                    lastScanned: null
                }
            },

            // Project Map footprint (from Scribe)
            projectMap: {
                files: new Map(),          // file → {path, lastVerified, status}
                lastSync: null
            },

            // Quick lookup cache
            quickLookup: {
                fileToSession: new Map(),  // "tier-manager.js" → sessionId
                sessionToFiles: new Map()  // sessionId → [files]
            }
        };

        if (!this.silent) {
            console.log(`🗺️ ATLAS Retrieval & Structure System ${this.version} initialized`);
        }
    }

    /**
     * Auto-detect project root by walking up from module location
     * Searches for .claude/memory/ directory AND verifies memory-registry.json with content
     * @returns {string} Absolute path to project root
     * @throws {Error} If .claude/memory/ not found in parent directories
     * @fixed ESMC 3.14.1 - Added registry validation to prevent nested .claude/ false positives
     */
    _findProjectRoot() {
        const fsSync = require('fs');
        let current = __dirname;  // Start from module location

        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            const registryPath = path.join(memoryPath, '.memory-registry.json');

            // Verify .claude/memory/ exists AND memory-registry.json has content (real project root)
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(registryPath)) {
                try {
                    const registryContent = fsSync.readFileSync(registryPath, 'utf8');
                    const registry = JSON.parse(registryContent);
                    // Validate it's a real registry with projects (not empty test fixture)
                    if (registry.projects && Object.keys(registry.projects).length > 0) {
                        console.log(`   🎯 ATLAS: Auto-detected project root: ${current}`);
                        return current;
                    }
                } catch (error) {
                    // Invalid or empty registry, continue searching
                }
            }
            current = path.dirname(current);
        }

        throw new Error('ATLAS: Could not locate project root with valid .claude/memory/.memory-registry.json. Pass explicit projectRoot option.');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 SESSION-SCOPED FOOTPRINT METHODS (ESMC 3.14 - Professor Mode)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Initialize footprint for new conversation session
     * Called at start of each conversation
     * @param {string} sessionId - Current conversation/session ID
     */
    initFootprint(sessionId) {
        this.footprint.sessionId = sessionId;
        this.footprint.startedAt = Date.now();
        this.footprint.expiresAt = Date.now() + (4 * 60 * 60 * 1000); // 4 hours

        console.log(`   👣 ATLAS Footprint initialized for session: ${sessionId}`);
    }

    /**
     * Capture T1 scan results into footprint
     * Stores all sessions + file mentions for quick recall
     * @param {Array} recentSessions - Sessions from .memory-recent.json
     */
    captureT1Footprint(recentSessions) {
        if (!Array.isArray(recentSessions)) return;

        this.footprint.memory.t1_recent.sessions = recentSessions;
        this.footprint.memory.t1_recent.lastScanned = Date.now();

        // Extract file mentions from all T1 sessions
        recentSessions.forEach((session, index) => {
            if (session.files_modified && Array.isArray(session.files_modified)) {
                session.files_modified.forEach(file => {
                    const fileName = path.basename(file);
                    this.footprint.memory.t1_recent.filesMentioned.set(fileName, {
                        sessionId: session.session_id,
                        path: file,
                        rank: index + 1, // 1-10 (position in recent)
                        snippet: session.summary || '',
                        timestamp: session.timestamp
                    });

                    // Populate quick lookup
                    this.footprint.quickLookup.fileToSession.set(fileName, session.session_id);

                    if (!this.footprint.quickLookup.sessionToFiles.has(session.session_id)) {
                        this.footprint.quickLookup.sessionToFiles.set(session.session_id, []);
                    }
                    this.footprint.quickLookup.sessionToFiles.get(session.session_id).push(fileName);
                });
            }
        });

        console.log(`   👣 T1 Footprint: Captured ${recentSessions.length} sessions, ${this.footprint.memory.t1_recent.filesMentioned.size} files`);
    }

    /**
     * Capture T2 scan results into footprint
     * @param {Array} topicsFound - Topics from topic-index
     * @param {Array} sessionsFound - Sessions associated with topics
     */
    captureT2Footprint(topicsFound, sessionsFound = []) {
        if (!Array.isArray(topicsFound)) return;

        this.footprint.memory.t2_topics.topics = topicsFound;
        this.footprint.memory.t2_topics.lastScanned = Date.now();

        topicsFound.forEach(topic => {
            if (topic.name && topic.sessionIds) {
                this.footprint.memory.t2_topics.sessions.set(topic.name, topic.sessionIds);
            }
        });

        console.log(`   👣 T2 Footprint: Captured ${topicsFound.length} topics`);
    }

    /**
     * Capture T3 scan results into footprint
     * @param {Array} keywordsUsed - Keywords from query
     * @param {Array} sessionsFound - Sessions found in registry
     */
    captureT3Footprint(keywordsUsed, sessionsFound) {
        if (!Array.isArray(sessionsFound)) return;

        this.footprint.memory.t3_keywords.sessions = sessionsFound;
        this.footprint.memory.t3_keywords.keywords = keywordsUsed || [];
        this.footprint.memory.t3_keywords.lastScanned = Date.now();

        console.log(`   👣 T3 Footprint: Captured ${sessionsFound.length} sessions for ${keywordsUsed.length} keywords`);
    }

    /**
     * Query footprint: "Have I seen this file/session before in this conversation?"
     * Returns immediately without disk I/O - pure memory lookup
     * @param {string} query - File name or session ID to look up
     * @returns {Object} Footprint hit result
     */
    queryFootprint(query) {
        // Check if footprint expired
        if (this.footprint.expiresAt && Date.now() > this.footprint.expiresAt) {
            console.log(`   👣 Footprint expired, auto-clearing...`);
            this.clearFootprint();
            return { found: false, message: `Footprint expired` };
        }

        // Check T1 recent files first (most common case)
        if (this.footprint.memory.t1_recent.filesMentioned.has(query)) {
            const info = this.footprint.memory.t1_recent.filesMentioned.get(query);
            return {
                found: true,
                source: 't1_recent',
                rank: info.rank,
                sessionId: info.sessionId,
                path: info.path,
                snippet: info.snippet,
                message: `I remember ${query} from T1 (session ${info.sessionId}, rank #${info.rank})`
            };
        }

        // Check quick lookup (file → session)
        if (this.footprint.quickLookup.fileToSession.has(query)) {
            const sessionId = this.footprint.quickLookup.fileToSession.get(query);
            return {
                found: true,
                source: 'quick_lookup',
                sessionId,
                message: `I remember ${query} from session ${sessionId}`
            };
        }

        // Check project map (file location)
        if (this.footprint.projectMap.files.has(query)) {
            const info = this.footprint.projectMap.files.get(query);
            return {
                found: true,
                source: 'project_map',
                path: info.path,
                lastVerified: info.lastVerified,
                status: info.status,
                message: `I know ${query} is at ${info.path} (verified: ${new Date(info.lastVerified).toLocaleTimeString()})`
            };
        }

        return {
            found: false,
            message: `No footprint for "${query}" in current session`
        };
    }

    /**
     * Sync Project Map from Scribe into Footprint
     * Called once per session or when project map updates
     * Includes self-healing: removes ghosts (missing files)
     * @returns {Promise<boolean>} Success status
     */
    async syncProjectMap() {
        try {
            await this.loadProjectIndex(); // Load .project-index.json

            if (!this.projectIndex?.files) {
                console.log(`   ⚠️ No project map to sync`);
                return false;
            }

            // Clear existing
            this.footprint.projectMap.files.clear();

            let ghostsRemoved = 0;
            const toRemove = [];

            // Copy into footprint with validation (self-healing)
            for (const [fileKey, metadata] of Object.entries(this.projectIndex.files)) {
                const fileName = path.basename(metadata.path);
                const exists = fsSync.existsSync(metadata.path);

                this.footprint.projectMap.files.set(fileName, {
                    path: metadata.path,
                    relativePath: metadata.relativePath,
                    lastVerified: exists ? Date.now() : metadata.lastModified,
                    status: exists ? 'exists' : 'missing',
                    purpose: metadata.purpose
                });

                // Self-healing: mark ghosts for removal
                if (!exists) {
                    console.log(`   🔧 Self-healing: ${fileName} missing, marking for removal`);
                    toRemove.push(fileKey);
                    ghostsRemoved++;
                }
            }

            // Remove ghosts from index
            toRemove.forEach(key => delete this.projectIndex.files[key]);

            // Save cleaned index if ghosts were removed
            if (ghostsRemoved > 0) {
                await this.saveProjectIndex();
                console.log(`   🧹 Self-healing complete: Removed ${ghostsRemoved} ghost entries`);
            }

            this.footprint.projectMap.lastSync = Date.now();
            console.log(`   👣 Project Map synced: ${this.footprint.projectMap.files.size} files (${ghostsRemoved} ghosts removed)`);
            return true;

        } catch (error) {
            console.error(`   ❌ Project Map sync failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Clear footprint (called at end of conversation or expiry)
     */
    clearFootprint() {
        if (!this.footprint.sessionId) return;

        console.log(`   🧹 Clearing footprint for session: ${this.footprint.sessionId}`);

        this.footprint.memory.t1_recent.sessions = [];
        this.footprint.memory.t1_recent.filesMentioned.clear();
        this.footprint.memory.t2_topics.topics = [];
        this.footprint.memory.t2_topics.sessions.clear();
        this.footprint.memory.t3_keywords.sessions = [];
        this.footprint.memory.t3_keywords.keywords = [];
        this.footprint.quickLookup.fileToSession.clear();
        this.footprint.quickLookup.sessionToFiles.clear();
        this.footprint.projectMap.files.clear();

        this.footprint.sessionId = null;
        this.footprint.startedAt = null;
        this.footprint.expiresAt = null;
    }

    /**
     * Get footprint stats for debugging
     * @returns {Object} Footprint statistics
     */
    getFootprintStats() {
        return {
            sessionId: this.footprint.sessionId,
            active: this.footprint.sessionId !== null,
            age_ms: this.footprint.startedAt ? Date.now() - this.footprint.startedAt : 0,
            expires_in_ms: this.footprint.expiresAt ? this.footprint.expiresAt - Date.now() : 0,
            memory: {
                t1_sessions: this.footprint.memory.t1_recent.sessions.length,
                t1_files: this.footprint.memory.t1_recent.filesMentioned.size,
                t2_topics: this.footprint.memory.t2_topics.topics.length,
                t3_sessions: this.footprint.memory.t3_keywords.sessions.length
            },
            projectMap: {
                files: this.footprint.projectMap.files.size,
                lastSync: this.footprint.projectMap.lastSync
            },
            quickLookup: {
                fileToSession: this.footprint.quickLookup.fileToSession.size,
                sessionToFiles: this.footprint.quickLookup.sessionToFiles.size
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 ESMC 3.22 v3.0: INTELLIGENCE FUSION - ECHO + ATLAS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculate joint confidence from ECHO + ATLAS results
     * Merges current conversation context (ECHO) with historical patterns (ATLAS)
     *
     * @param {object} echoResult - ECHO context (current conversation)
     * @param {object} atlasResult - ATLAS retrieval result (historical sessions)
     * @param {string} query - Original search query
     * @returns {object} Joint confidence analysis
     */
    calculateJointConfidence(echoResult, atlasResult, query) {
        // Intelligence fusion: ECHO provides current context, ATLAS provides history
        const fusion = {
            query,
            confidence: 0,
            breakdown: {
                echo_contribution: 0,
                atlas_contribution: 0
            },
            narrative: '',
            recommendation: '',
            sources: {
                echo: null,
                atlas: null
            }
        };

        // ECHO contribution (current conversation weight: 40%)
        if (echoResult && echoResult.compact_counter > 0) {
            const echoRelevance = this._calculateEchoRelevance(echoResult, query);
            fusion.breakdown.echo_contribution = echoRelevance * 0.4;
            fusion.sources.echo = {
                filename: echoResult.filename,
                task: echoResult.current_task,
                relevance: echoRelevance,
                todos: echoResult.todos.length,
                files_modified: echoResult.files_modified.length
            };
        }

        // ATLAS contribution (historical wisdom weight: 60%)
        if (atlasResult && atlasResult.found) {
            const atlasRelevance = this._calculateAtlasRelevance(atlasResult, query);
            fusion.breakdown.atlas_contribution = atlasRelevance * 0.6;
            fusion.sources.atlas = {
                tier_used: atlasResult.tier_used,
                relevance: atlasRelevance,
                session_id: atlasResult.data?.session_id || null,
                response_time_ms: atlasResult.response_time_ms
            };
        }

        // Joint confidence (0-100 scale)
        fusion.confidence = Math.min(100, Math.round(
            (fusion.breakdown.echo_contribution + fusion.breakdown.atlas_contribution) * 100
        ));

        // Generate intelligence fusion narrative
        if (fusion.sources.echo && fusion.sources.atlas) {
            fusion.narrative = `Based on THIS conversation (ECHO: ${fusion.sources.echo.task}) AND past work (ATLAS: ${fusion.sources.atlas.session_id}), confidence is ${fusion.confidence}%.`;
        } else if (fusion.sources.echo) {
            fusion.narrative = `Based on THIS conversation only (ECHO), confidence is ${fusion.confidence}%.`;
        } else if (fusion.sources.atlas) {
            fusion.narrative = `Based on past work only (ATLAS), confidence is ${fusion.confidence}%.`;
        } else {
            fusion.narrative = `No context available from ECHO or ATLAS.`;
        }

        // Recommendation based on confidence threshold
        if (fusion.confidence >= 70) {
            fusion.recommendation = 'HIGH_CONFIDENCE';
        } else if (fusion.confidence >= 40) {
            fusion.recommendation = 'MEDIUM_CONFIDENCE';
        } else {
            fusion.recommendation = 'LOW_CONFIDENCE';
        }

        return fusion;
    }

    /**
     * Calculate ECHO relevance score (0-1 scale)
     * @private
     */
    _calculateEchoRelevance(echoResult, query) {
        let score = 0;

        // Base score: ECHO exists = 0.5
        score += 0.5;

        // Boost if current task mentions query keywords
        if (echoResult.current_task) {
            const taskLower = echoResult.current_task.toLowerCase();
            const queryKeywords = query.toLowerCase().split(/\s+/);
            const matches = queryKeywords.filter(kw => taskLower.includes(kw)).length;
            score += (matches / queryKeywords.length) * 0.3;
        }

        // Boost if files modified contain relevant terms
        if (echoResult.files_modified && echoResult.files_modified.length > 0) {
            const filesStr = echoResult.files_modified.join(' ').toLowerCase();
            const queryKeywords = query.toLowerCase().split(/\s+/);
            const matches = queryKeywords.filter(kw => filesStr.includes(kw)).length;
            score += (matches / queryKeywords.length) * 0.2;
        }

        return Math.min(1, score);
    }

    /**
     * Calculate ATLAS relevance score (0-1 scale)
     * @private
     */
    _calculateAtlasRelevance(atlasResult, query) {
        let score = 0;

        // Base score by tier (T1 = best match)
        if (atlasResult.tier_used === 1) {
            score += 0.8; // Recent cache hit = high relevance
        } else if (atlasResult.tier_used === 2) {
            score += 0.6; // Topic index = medium relevance
        } else if (atlasResult.tier_used === 3) {
            score += 0.4; // Full scan = lower relevance
        }

        // Boost if exact session ID match
        if (atlasResult.data?.session_id && query.includes(atlasResult.data.session_id)) {
            score += 0.2;
        }

        return Math.min(1, score);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 PROJECT STRUCTURE INDEX - SPATIAL AWARENESS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Initialize or load project structure index
     */
    async loadProjectIndex() {
        try {
            if (fsSync.existsSync(this.structureIndexPath)) {
                const content = await fs.readFile(this.structureIndexPath, 'utf8');
                this.projectIndex = JSON.parse(content);
                this.indexLastLoaded = Date.now();
                if (!this.silent) {
                    console.log(`   🗺️ Project structure index loaded (${Object.keys(this.projectIndex.files || {}).length} files tracked)`);
                }
                return true;
            } else {
                if (!this.silent) {
                    console.log(`   ℹ️ No project index found - will create on first scan`);
                }
                return false;
            }
        } catch (error) {
            console.warn(`   ⚠️ Failed to load project index: ${error.message}`);
            return false;
        }
    }

    /**
     * Find files by name, path fragment, or purpose
     */
    async findFile(query) {
        if (!this.projectIndex) {
            await this.loadProjectIndex();
        }

        if (!this.projectIndex || !this.projectIndex.files) {
            return { found: false, message: 'Project index not initialized. Run initial scan first.' };
        }

        const queryLower = query.toLowerCase();
        const matches = [];

        for (const [fileKey, metadata] of Object.entries(this.projectIndex.files)) {
            const pathMatch = metadata.path.toLowerCase().includes(queryLower) ||
                            metadata.relativePath.toLowerCase().includes(queryLower);
            const purposeMatch = metadata.purpose && metadata.purpose.toLowerCase().includes(queryLower);
            const nameMatch = path.basename(metadata.path).toLowerCase().includes(queryLower);

            if (pathMatch || purposeMatch || nameMatch) {
                matches.push({
                    name: path.basename(metadata.path),
                    path: metadata.path,
                    relativePath: metadata.relativePath,
                    purpose: metadata.purpose,
                    category: metadata.category,
                    lastModified: metadata.lastModified
                });
            }
        }

        return {
            found: matches.length > 0,
            count: matches.length,
            matches: matches.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        };
    }

    /**
     * Get all files in a domain (e.g., "website", "sdk")
     */
    async getDomainFiles(domainName) {
        if (!this.projectIndex) {
            await this.loadProjectIndex();
        }

        if (!this.projectIndex || !this.projectIndex.domains) {
            return { found: false, message: 'Project index not initialized.' };
        }

        const domain = this.projectIndex.domains[domainName];
        if (!domain) {
            return { found: false, message: `Domain "${domainName}" not found` };
        }

        return {
            found: true,
            domain: domainName,
            root: domain.root,
            purpose: domain.purpose,
            keyDirs: domain.keyDirs || []
        };
    }

    /**
     * Link session to files (bidirectional)
     */
    async linkSessionToFiles(sessionId, filesModified) {
        if (!this.projectIndex) {
            await this.loadProjectIndex();
        }

        if (!this.projectIndex) {
            console.warn(`   ⚠️ Cannot link session - project index not loaded`);
            return false;
        }

        // Add files to session's file list
        if (!this.projectIndex.sessionFileLinks) {
            this.projectIndex.sessionFileLinks = {};
        }

        this.projectIndex.sessionFileLinks[sessionId] = {
            files: filesModified,
            timestamp: new Date().toISOString()
        };

        // Add session reference to each file
        for (const filePath of filesModified) {
            const fileKey = path.relative(this.projectRoot, filePath);

            if (this.projectIndex.files && this.projectIndex.files[fileKey]) {
                if (!this.projectIndex.files[fileKey].relatedSessions) {
                    this.projectIndex.files[fileKey].relatedSessions = [];
                }

                if (!this.projectIndex.files[fileKey].relatedSessions.includes(sessionId)) {
                    this.projectIndex.files[fileKey].relatedSessions.push(sessionId);
                }
            }
        }

        // Save updated index
        await this.saveProjectIndex();
        console.log(`   🔗 Linked session ${sessionId} to ${filesModified.length} files`);
        return true;
    }

    /**
     * Save project index to disk
     */
    async saveProjectIndex() {
        try {
            await fs.mkdir(this.projectContextPath, { recursive: true });
            await fs.writeFile(this.structureIndexPath, JSON.stringify(this.projectIndex, null, 2));
            return true;
        } catch (error) {
            console.error(`   ❌ Failed to save project index: ${error.message}`);
            return false;
        }
    }

    /**
     * 🆕 REBUILD PROJECT MAP - Sync structure index with filesystem
     * Triggered by: seed operation, manual request, or staleness detection
     *
     * @param {object} options - Rebuild configuration
     * @returns {Promise<object>} Rebuild result with summary
     */
    async rebuild(options = {}) {
        const {
            mode = 'incremental',      // 'incremental' | 'full' | 'smart'
            reason = 'manual',          // Why rebuild was triggered
            domains = 'all',            // Which domains to scan
            validateExisting = true,    // Remove ghosts
            addNew = true,              // Discover new files
            sessionContext = null       // Optional: session data for linking
        } = options;

        const startTime = Date.now();
        console.log(`\n🔄 ATLAS PROJECT MAP REBUILD`);
        console.log(`   Mode: ${mode.toUpperCase()}`);
        console.log(`   Reason: ${reason}`);

        try {
            // Load existing index or create new
            await this.loadProjectIndex();
            if (!this.projectIndex) {
                console.log(`   📝 Creating new project structure index...`);
                this.projectIndex = await this.readProjectStructure();
            }

            const beforeCounts = this.getIndexCounts();

            // Execute rebuild based on mode
            if (mode === 'smart') {
                // Analyze and decide
                const changeCount = sessionContext?.files_modified?.length || 0;
                const actualMode = changeCount > 10 ? 'full' : 'incremental';
                console.log(`   🧠 Smart mode: Detected ${changeCount} changes → ${actualMode} rebuild`);
                return await this.rebuild({ ...options, mode: actualMode });
            }

            if (mode === 'full') {
                // Full filesystem rescan
                this.projectIndex = await this.readProjectStructure();
            } else {
                // Incremental: validate + add new
                if (validateExisting) {
                    await this.validateAndRemoveGhosts();
                }
                if (addNew && sessionContext?.files_modified) {
                    await this.addNewFilesToIndex(sessionContext.files_modified);
                }
            }

            // Save updated index
            await this.saveProjectIndex();

            const afterCounts = this.getIndexCounts();
            const summary = {
                success: true,
                mode,
                reason,
                duration_ms: Date.now() - startTime,
                changes: {
                    files_before: beforeCounts.files,
                    files_after: afterCounts.files,
                    added: afterCounts.files - beforeCounts.files,
                    domains: afterCounts.domains
                }
            };

            console.log(`   ✅ Rebuild complete (${summary.duration_ms}ms)`);
            console.log(`      Files: ${summary.changes.files_before} → ${summary.changes.files_after} (${summary.changes.added >= 0 ? '+' : ''}${summary.changes.added})`);

            return summary;

        } catch (error) {
            console.error(`   ❌ ATLAS rebuild failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                duration_ms: Date.now() - startTime
            };
        }
    }

    /**
     * Read full project structure (for full rebuild)
     */
    async readProjectStructure() {
        // Simplified placeholder - uses existing atlas-structure-index.json as template
        if (fsSync.existsSync(this.structureIndexPath)) {
            const content = await fs.readFile(this.structureIndexPath, 'utf8');
            const existing = JSON.parse(content);
            existing.timestamp = new Date().toISOString();
            existing.last_rebuild = { mode: 'full', timestamp: new Date().toISOString() };
            return existing;
        }

        // Fallback: minimal structure
        return {
            version: this.version,
            system: 'ATLAS',
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            project_root: this.projectRoot,
            domains: {},
            files: {},
            metadata: {
                total_domains: 0,
                total_files: 0
            }
        };
    }

    /**
     * Validate existing entries and remove ghosts
     */
    async validateAndRemoveGhosts() {
        if (!this.projectIndex?.fileRegistry) return;

        const toRemove = [];
        for (const [fileKey, metadata] of Object.entries(this.projectIndex.files)) {
            if (!fsSync.existsSync(metadata.path)) {
                toRemove.push(fileKey);
            }
        }

        toRemove.forEach(key => delete this.projectIndex.files[key]);
        if (toRemove.length > 0) {
            console.log(`   🗑️ Removed ${toRemove.length} ghost entries`);
        }
    }

    /**
     * Add new files to index (incremental)
     */
    async addNewFilesToIndex(modifiedFiles) {
        if (!this.projectIndex?.fileRegistry) return;

        let added = 0;
        for (const filePath of modifiedFiles) {
            const fileKey = path.relative(this.projectRoot, filePath);
            if (!this.projectIndex.files[fileKey]) {
                this.projectIndex.files[fileKey] = {
                    path: filePath,
                    relativePath: fileKey,
                    lastModified: new Date().toISOString(),
                    relatedSessions: []
                };
                added++;
            }
        }

        if (added > 0) {
            console.log(`   ➕ Added ${added} new file entries`);
        }
    }

    /**
     * Get index counts for comparison
     */
    getIndexCounts() {
        if (!this.projectIndex) return { files: 0, domains: 0 };
        return {
            files: Object.keys(this.projectIndex.files || {}).length,
            domains: Object.keys(this.projectIndex.domains || {}).length
        };
    }

    /**
     * MAIN ENTRY POINT: Retrieve memory using 3-tier protocol
     *
     * @param {string} query - Search query (keywords, topic, or session ID)
     * @param {object} options - Retrieval options
     * @returns {Promise<object>} Retrieval result with metadata
     */
    async retrieve(query, options = {}) {
        const startTime = Date.now();
        console.log(`\n🗺️ ATLAS RETRIEVAL - Query: "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`);

        // ═══════════════════════════════════════════════════════════════════════
        // PHASE 0.0: ECHO CONTEXT RETRIEVAL (v3.0 - Context Parity Architecture)
        // ═══════════════════════════════════════════════════════════════════════
        // @added ESMC 3.22 v3.0
        // @philosophy "Recent Work (Current) = Session Parity"
        //
        // ECHO retrieval happens FIRST (before TIER 1) to ensure current
        // conversation context is available to all intelligence components.
        // Silent retrieval - context injected without verbose output.
        // ═══════════════════════════════════════════════════════════════════════

        if (!this.echoContext && options.retrieveEcho !== false) {
            try {
                const { EchoManager } = require('./27c20532.js');
                const echoManager = new EchoManager({ projectRoot: this.projectRoot });
                const echoContext = await echoManager.retrieveEchoContext();

                if (echoContext) {
                    // Cache ECHO context for session (avoid repeated reads)
                    this.echoContext = echoContext;

                    console.log(`   📸 [Silent] ECHO loaded: ${echoContext.filename}`);
                    console.log(`      Task: ${echoContext.current_task || 'N/A'}`);
                    console.log(`      Compacts: ${echoContext.compact_counter}`);
                    console.log(`      Todos: ${echoContext.todos.length} tracked`);
                    console.log(`      Files: ${echoContext.files_modified.length} modified`);

                    // ECHO context now available to all retrieval tiers
                    options.echoContext = echoContext;
                }
            } catch (error) {
                // Silent failure - fall back to TIER 1 (defensive error handling)
                console.warn(`   ⚠️ ECHO retrieval failed (continuing to TIER 1): ${error.message}`);
            }
        }

        // 🆕 Initialize footprint if first query in session
        if (!this.footprint.sessionId && options.sessionId) {
            this.initFootprint(options.sessionId);
            await this.syncProjectMap(); // Load project map once per session
        }

        // 🆕 CHECK FOOTPRINT FIRST (Professor mode - "I've seen this before")
        const footprintHit = this.queryFootprint(query);
        if (footprintHit.found && options.useFootprint !== false) {
            console.log(`   🧠 FOOTPRINT HIT: ${footprintHit.message}`);

            // Return cached knowledge without re-reading
            return {
                query,
                found: true,
                tier_used: 'footprint',
                response_time_ms: Date.now() - startTime,
                data: footprintHit,
                from_cache: true,
                echo_context: this.echoContext || null // 🆕 Include ECHO context
            };
        }

        const result = {
            query,
            found: false,
            tier_used: null,
            response_time_ms: 0,
            data: null,
            fallback_attempts: [],
            scribe_enrichment: null,
            echo_context: this.echoContext || null // 🆕 Include ECHO context in results
        };

        try {
            // TIER 1: Recent Index (Lightning Fast - 0.5s)
            console.log(`   🔵 TIER 1: Searching recent index (.memory-recent.json)...`);
            const tier1Result = await this.searchRecentIndex(query);

            // 🆕 CAPTURE T1 FOOTPRINT (even on miss - remembers what it saw)
            if (tier1Result.sessions || tier1Result.data?.sessions) {
                const sessionsToCapture = tier1Result.sessions || tier1Result.data?.sessions || [];
                this.captureT1Footprint(sessionsToCapture);
            }

            if (tier1Result.found) {
                result.found = true;
                result.tier_used = 1;
                result.data = tier1Result.data;
                result.response_time_ms = Date.now() - startTime;
                this.performanceMetrics.tier1_hits++;

                console.log(`   ✅ TIER 1 HIT: Found in recent cache (${result.response_time_ms}ms)`);

                // 🆕 ESMC 3.94.0: ATHENA Memory Correction Filter
                // Apply correction quarantine before returning sessions
                if (result.data && result.data.sessions) {
                    result.data.sessions = await this.applyATHENACorrections(result.data.sessions);
                }

                // Parallel: Enrich with Scribe temporal context
                result.scribe_enrichment = await this.enrichWithScribe(result.data, query);

                this.updateMetrics(result.response_time_ms);
                return result;
            }

            result.fallback_attempts.push('tier1_miss');
            console.log(`   ⚪ TIER 1 MISS: Not found in recent cache, falling back to TIER 2...`);

            // TIER 2: Topic Index (Fast - 1-2s)
            console.log(`   🟡 TIER 2: Searching topic index (.topic-index.json)...`);
            const tier2Result = await this.searchTopicIndex(query);

            // 🆕 CAPTURE T2 FOOTPRINT (even on miss)
            if (tier2Result.topics || tier2Result.data?.topics) {
                const topicsToCapture = tier2Result.topics || tier2Result.data?.topics || [];
                const sessionsFound = tier2Result.sessions || tier2Result.data?.sessions || [];
                this.captureT2Footprint(topicsToCapture, sessionsFound);
            }

            if (tier2Result.found) {
                result.found = true;
                result.tier_used = 2;
                result.data = tier2Result.data;
                result.response_time_ms = Date.now() - startTime;
                this.performanceMetrics.tier2_hits++;

                console.log(`   ✅ TIER 2 HIT: Found in topic index (${result.response_time_ms}ms)`);

                // Parallel: Enrich with Scribe temporal context
                result.scribe_enrichment = await this.enrichWithScribe(result.data, query);

                this.updateMetrics(result.response_time_ms);
                return result;
            }

            result.fallback_attempts.push('tier2_miss');
            console.log(`   ⚪ TIER 2 MISS: Not found in topic index, falling back to TIER 3...`);

            // TIER 3: Full Keyword Scan (Comprehensive - 3-5s)
            console.log(`   🔴 TIER 3: Performing full AEGIS registry scan...`);
            const tier3Result = await this.searchFullRegistry(query);

            // 🆕 CAPTURE T3 FOOTPRINT
            if (tier3Result.sessions || tier3Result.data?.sessions) {
                const sessionsFound = tier3Result.sessions || tier3Result.data?.sessions || [];
                const keywordsUsed = query.split(/\s+/).filter(k => k.length > 2);
                this.captureT3Footprint(keywordsUsed, sessionsFound);
            }

            if (tier3Result.found) {
                result.found = true;
                result.tier_used = 3;
                result.data = tier3Result.data;
                result.response_time_ms = Date.now() - startTime;
                this.performanceMetrics.tier3_hits++;

                console.log(`   ✅ TIER 3 HIT: Found via keyword scan (${result.response_time_ms}ms)`);

                // Parallel: Enrich with Scribe temporal context
                result.scribe_enrichment = await this.enrichWithScribe(result.data, query);

                this.updateMetrics(result.response_time_ms);
                return result;
            }

            result.fallback_attempts.push('tier3_miss');
            result.response_time_ms = Date.now() - startTime;
            console.log(`   ❌ NO RESULTS: Query not found in any tier (${result.response_time_ms}ms)`);

            this.updateMetrics(result.response_time_ms);
            return result;

        } catch (error) {
            console.error(`❌ ATLAS retrieval failed: ${error.message}`);
            result.error = error.message;
            result.response_time_ms = Date.now() - startTime;
            return result;
        }
    }

    /**
     * 🆕 ESMC 3.22 v3.0: PARALLEL ECHO+ATLAS RETRIEVAL WITH CONFIDENCE CASCADE
     * Implements full v3.0 specification:
     * - Parallel ECHO+T1 execution (Promise.all)
     * - Joint confidence calculation (ECHO 40% + ATLAS 60%)
     * - Confidence cascade (T1→T2→HYDRA→T3 with 70% thresholds)
     * - Intelligence fusion narrative
     *
     * @param {string} query - Search query
     * @param {object} options - Retrieval options
     * @returns {Promise<object>} Retrieval result with joint confidence
     */

    /**
     * 🆕 ESMC 3.34 P1-1: Auto-detect when to use HYDRA vs ATLAS
     * Decision tree: 1 keyword → ATLAS, 2 keywords → Dual, 3+ → HYDRA
     * @param {array} keywords - CIE-extracted keywords
     * @returns {string} 'atlas' | 'dual' | 'hydra'
     */
    shouldUseHydra(keywords) {
        if (!keywords || keywords.length === 0) return 'atlas';

        const keywordCount = keywords.length;

        if (keywordCount === 1) {
            // Single keyword: ATLAS sequential is faster
            return 'atlas';
        } else if (keywordCount === 2) {
            // Two keywords: Run both systems (dual intelligence)
            return 'dual';
        } else {
            // 3+ keywords: HYDRA parallel wins (50% tokens, 4x faster)
            return 'hydra';
        }
    }

    /**
     * 🆕 ESMC 3.34 P1-1: Unified retrieval with auto-routing
     * Automatically selects ATLAS sequential vs HYDRA parallel based on keyword count
     * @param {string} query - Search query
     * @param {array} keywords - CIE-extracted keywords
     * @param {object} options - Retrieval options
     * @returns {Promise<object>} Retrieval result
     */
    async retrieveWithAutoRouting(query, keywords = [], options = {}) {
        const strategy = this.shouldUseHydra(keywords);

        console.log(`   🔀 ATLAS: Auto-routing strategy = ${strategy.toUpperCase()} (${keywords.length} keywords)`);

        switch (strategy) {
            case 'atlas':
                // Sequential T1→T2→T3
                return await this.retrieveV3(query, options);

            case 'dual':
                // Run ATLAS + HYDRA in parallel (MAX/VIP only)
                try {
                    const { HydraRetrievalSystem } = require('./38ace47f.js');
                    const hydra = new HydraRetrievalSystem({ projectRoot: this.projectRoot });

                    const [atlasResult, hydraResult] = await Promise.all([
                        this.retrieveV3(query, options),
                        hydra.parallelMultiKeywordSearch(keywords, options)
                    ]);

                    return {
                        strategy: 'dual',
                        atlas: atlasResult,
                        hydra: hydraResult,
                        token_savings: 0, // Both run, no savings
                        confidence: Math.max(atlasResult.joint_confidence || 0, hydraResult.confidence || 0)
                    };
                } catch (error) {
                    console.warn(`   ⚠️ HYDRA not available (MAX/VIP tier only), falling back to ATLAS`);
                    return await this.retrieveV3(query, options);
                }

            case 'hydra':
                // Parallel multi-keyword search (MAX/VIP only)
                console.log(`   🐍 HYDRA: Activating parallel search (saving 50 tokens vs sequential)`);
                try {
                    const { HydraRetrievalSystem } = require('./38ace47f.js');
                    const hydra = new HydraRetrievalSystem({ projectRoot: this.projectRoot });

                    const result = await hydra.parallelMultiKeywordSearch(keywords, options);
                    return {
                        ...result,
                        strategy: 'hydra',
                        token_savings: 50, // vs sequential ATLAS
                        from_auto_routing: true
                    };
                } catch (error) {
                    console.warn(`   ⚠️ HYDRA not available (MAX/VIP tier only), falling back to ATLAS`);
                    return await this.retrieveV3(query, options);
                }
        }
    }

    async retrieveV3(query, options = {}) {
        const startTime = Date.now();
        console.log(`\n🗺️ ATLAS v3.0 RETRIEVAL - Query: "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`);

        // Initialize footprint if needed
        if (!this.footprint.sessionId && options.sessionId) {
            this.initFootprint(options.sessionId);
            await this.syncProjectMap();
        }

        // Check footprint first
        const footprintHit = this.queryFootprint(query);
        if (footprintHit.found && options.useFootprint !== false) {
            console.log(`   🧠 FOOTPRINT HIT: ${footprintHit.message}`);
            return {
                query,
                found: true,
                tier_used: 'footprint',
                response_time_ms: Date.now() - startTime,
                data: footprintHit,
                from_cache: true,
                echo_context: this.echoContext || null,
                joint_confidence: null
            };
        }

        // ═══════════════════════════════════════════════════════════════════
        // 🆕 v3.0: PARALLEL EXECUTION - ECHO + ATLAS T1
        // ═══════════════════════════════════════════════════════════════════
        console.log(`   ⚡ PARALLEL: Launching ECHO counter check + ATLAS T1...`);

        const [echoResult, tier1Result] = await Promise.all([
            // ECHO: Counter-based conditional reading
            (async () => {
                if (this.echoContext) return this.echoContext; // Already cached

                if (options.retrieveEcho === false) return null;

                try {
                    const { EchoManager } = require('./27c20532.js');
                    const echoManager = new EchoManager({ projectRoot: this.projectRoot });

                    const shouldRead = await echoManager.shouldReadEcho();
                    if (!shouldRead) {
                        console.log(`   📸 [Parallel] ECHO counter = -0 (skip read)`);
                        return null;
                    }

                    const context = await echoManager.retrieveEchoContext();
                    if (context) {
                        this.echoContext = context; // Cache
                        console.log(`   📸 [Parallel] ECHO loaded: ${context.filename}`);
                    }
                    return context;
                } catch (error) {
                    console.warn(`   ⚠️ ECHO retrieval failed: ${error.message}`);
                    return null;
                }
            })(),

            // ATLAS T1: Recent index search
            (async () => {
                console.log(`   🔵 [Parallel] TIER 1: Searching recent index...`);
                const result = await this.searchRecentIndex(query);

                if (result.sessions || result.data?.sessions) {
                    const sessions = result.sessions || result.data?.sessions || [];
                    this.captureT1Footprint(sessions);
                }

                return result;
            })()
        ]);

        // ═══════════════════════════════════════════════════════════════════
        // 🆕 v3.0: JOINT CONFIDENCE CALCULATION
        // ═══════════════════════════════════════════════════════════════════
        const tier1Found = tier1Result && tier1Result.found;

        const jointConfidence = this.calculateJointConfidence(
            echoResult,
            tier1Found ? { found: true, tier_used: 1, data: tier1Result.data, response_time_ms: Date.now() - startTime } : { found: false },
            query
        );

        console.log(`   🧠 JOINT CONFIDENCE: ${jointConfidence.confidence}% (ECHO: ${Math.round(jointConfidence.breakdown.echo_contribution * 100)}% + ATLAS: ${Math.round(jointConfidence.breakdown.atlas_contribution * 100)}%)`);
        console.log(`      ${jointConfidence.narrative}`);

        // ═══════════════════════════════════════════════════════════════════
        // 🆕 v3.0: CONFIDENCE CASCADE (T1 → T2 → HYDRA → T3)
        // ═══════════════════════════════════════════════════════════════════

        // T1 found + confidence >= 70%: Return immediately
        if (tier1Found && jointConfidence.confidence >= 70) {
            console.log(`   ✅ TIER 1 HIT (High Confidence): Returning immediately`);

            return {
                query,
                found: true,
                tier_used: 1,
                data: tier1Result.data,
                response_time_ms: Date.now() - startTime,
                echo_context: echoResult,
                joint_confidence: jointConfidence,
                scribe_enrichment: await this.enrichWithScribe(tier1Result.data, query)
            };
        }

        // T1 found but low confidence: Continue cascade
        if (tier1Found) {
            console.log(`   ⚪ TIER 1 HIT (Low Confidence ${jointConfidence.confidence}%): Continuing cascade...`);
        } else {
            console.log(`   ⚪ TIER 1 MISS: Falling back to TIER 2...`);
        }

        // T2: Topic Index
        console.log(`   🟡 TIER 2: Searching topic index...`);
        const tier2Result = await this.searchTopicIndex(query);

        if (tier2Result.topics || tier2Result.data?.topics) {
            const topics = tier2Result.topics || tier2Result.data?.topics || [];
            const sessions = tier2Result.sessions || tier2Result.data?.sessions || [];
            this.captureT2Footprint(topics, sessions);
        }

        if (tier2Result.found) {
            const t2Confidence = this.calculateJointConfidence(
                echoResult,
                { found: true, tier_used: 2, data: tier2Result.data, response_time_ms: Date.now() - startTime },
                query
            );

            console.log(`   🧠 T2 JOINT CONFIDENCE: ${t2Confidence.confidence}%`);

            if (t2Confidence.confidence >= 70) {
                console.log(`   ✅ TIER 2 HIT (High Confidence): Returning`);
                return {
                    query,
                    found: true,
                    tier_used: 2,
                    data: tier2Result.data,
                    response_time_ms: Date.now() - startTime,
                    echo_context: echoResult,
                    joint_confidence: t2Confidence,
                    scribe_enrichment: await this.enrichWithScribe(tier2Result.data, query)
                };
            }

            console.log(`   ⚪ TIER 2 HIT (Low Confidence ${t2Confidence.confidence}%): Continuing cascade...`);
        } else {
            console.log(`   ⚪ TIER 2 MISS: Falling back to HYDRA session memory...`);
        }

        // 🆕 ESMC 3.22 PHASE 2: HYDRA SESSION-LEVEL MEMORY (T2.5)
        // Insert HYDRA between T2 and T3 for session-scoped keyword search
        console.log(`   🐍 HYDRA: Session-level keyword search...`);
        const hydraResult = await this._searchHydraSessionMemory(query, echoResult);

        if (hydraResult.found) {
            const hydraConfidence = this.calculateJointConfidence(
                echoResult,
                { found: true, tier_used: 2.5, data: hydraResult.data, response_time_ms: Date.now() - startTime },
                query
            );

            console.log(`   🧠 HYDRA JOINT CONFIDENCE: ${hydraConfidence.confidence}%`);

            if (hydraConfidence.confidence >= 70) {
                console.log(`   ✅ HYDRA HIT (High Confidence): Returning`);
                return {
                    query,
                    found: true,
                    tier_used: 2.5,
                    tier_name: 'HYDRA',
                    data: hydraResult.data,
                    response_time_ms: Date.now() - startTime,
                    echo_context: echoResult,
                    joint_confidence: hydraConfidence,
                    scribe_enrichment: await this.enrichWithScribe(hydraResult.data, query)
                };
            }

            console.log(`   ⚪ HYDRA HIT (Low Confidence ${hydraConfidence.confidence}%): Continuing to T3...`);
        } else {
            console.log(`   ⚪ HYDRA MISS: Falling back to TIER 3...`);
        }

        // T3: Full Registry Scan
        console.log(`   🔴 TIER 3: Performing full AEGIS registry scan...`);
        const tier3Result = await this.searchFullRegistry(query);

        if (tier3Result.sessions || tier3Result.data?.sessions) {
            const sessions = tier3Result.sessions || tier3Result.data?.sessions || [];
            const keywords = query.split(/\s+/).filter(k => k.length > 2);
            this.captureT3Footprint(keywords, sessions);
        }

        if (tier3Result.found) {
            const t3Confidence = this.calculateJointConfidence(
                echoResult,
                { found: true, tier_used: 3, data: tier3Result.data, response_time_ms: Date.now() - startTime },
                query
            );

            console.log(`   ✅ TIER 3 HIT: Confidence ${t3Confidence.confidence}%`);
            return {
                query,
                found: true,
                tier_used: 3,
                data: tier3Result.data,
                response_time_ms: Date.now() - startTime,
                echo_context: echoResult,
                joint_confidence: t3Confidence,
                scribe_enrichment: await this.enrichWithScribe(tier3Result.data, query)
            };
        }

        // No results found
        console.log(`   ❌ NO RESULTS: Query not found in any tier (${Date.now() - startTime}ms)`);
        return {
            query,
            found: false,
            tier_used: null,
            data: null,
            response_time_ms: Date.now() - startTime,
            echo_context: echoResult,
            joint_confidence: jointConfidence
        };
    }

    /**
     * 🆕 ESMC 3.22 PHASE 2: HYDRA Session-Level Memory Search
     * Integrated between T2 and T3 for keyword-based session retrieval
     * @param {string} query - Search query
     * @param {object} echoContext - Current ECHO context
     * @returns {Promise<object>} HYDRA search result
     * @private
     */
    async _searchHydraSessionMemory(query, echoContext) {
        try {
            // Dynamically import HYDRA (lazy load to avoid circular dependencies)
            const { HydraRetrievalSystem } = require('./38ace47f.js');
            const hydra = new HydraRetrievalSystem({ projectRoot: this.projectRoot });

            // Execute HYDRA parallel keyword search
            const result = await hydra.retrieveParallel(query, {
                minConfidence: 0.70,
                maxAgents: 3, // Limit to 3 concurrent agents (T1 only)
                timeout: 5000, // 5s total timeout
                workingMemoryCapture: true // Enable working memory
            });

            if (result.found && result.mergedResults && result.mergedResults.length > 0) {
                // Return first merged result
                return {
                    found: true,
                    data: result.mergedResults[0], // Top result from intersection/union
                    hydra_metadata: {
                        keywords_used: result.keywords,
                        agents_spawned: result.agentsSpawned,
                        merge_strategy: result.mergeStrategy,
                        confidence: result.confidence
                    }
                };
            }

            return { found: false };

        } catch (error) {
            console.warn(`   ⚠️ HYDRA search failed (non-blocking): ${error.message}`);
            return { found: false };
        }
    }

    /**
     * 🆕 ESMC 3.20: T3 DEEP DIVE EXTENSION
     * Extended T3 search with +15s timeout when user selects "none of the above"
     *
     * @param {string} query - Search query
     * @param {object} options - Retrieval options
     * @param {number} options.extensionTimeout - Extension timeout in ms (default: 15000)
     * @returns {Promise<object>} Extended retrieval result
     */
    async retrieveT3Extension(query, options = {}) {
        const startTime = Date.now();
        const EXTENSION_TIMEOUT = options.extensionTimeout || 15000;

        console.log(`\n🔍 ATLAS T3 DEEP DIVE EXTENSION (+${EXTENSION_TIMEOUT}ms)`);
        console.log(`   Query: "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`);

        const result = {
            query,
            found: false,
            tier_used: 3,
            response_time_ms: 0,
            data: null,
            extension: true
        };

        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('T3_EXTENSION_TIMEOUT')), EXTENSION_TIMEOUT);
            });

            // Race: T3 search vs extension timeout
            const tier3Promise = this.searchFullRegistry(query, { extended: true });

            const tier3Result = await Promise.race([tier3Promise, timeoutPromise]).catch((error) => {
                if (error.message === 'T3_EXTENSION_TIMEOUT') {
                    console.log(`   ⏱️  T3 extension timeout (${EXTENSION_TIMEOUT}ms) - returning partial results`);
                    return tier3Promise; // Return whatever we have
                }
                throw error;
            });

            if (tier3Result.found) {
                result.found = true;
                result.data = tier3Result.data;
                result.response_time_ms = Date.now() - startTime;
                this.performanceMetrics.tier3_hits++;

                console.log(`   ✅ T3 EXTENSION SUCCESS: Found via deep scan (${result.response_time_ms}ms)`);

                // Enrich with Scribe temporal context
                result.scribe_enrichment = await this.enrichWithScribe(result.data, query);

                this.updateMetrics(result.response_time_ms);
                return result;
            }

            result.response_time_ms = Date.now() - startTime;
            console.log(`   ❌ T3 EXTENSION COMPLETE: No results found (${result.response_time_ms}ms)`);

            this.updateMetrics(result.response_time_ms);
            return result;

        } catch (error) {
            console.error(`❌ T3 extension failed: ${error.message}`);
            result.error = error.message;
            result.response_time_ms = Date.now() - startTime;
            return result;
        }
    }

    /**
     * TIER 1: Search recent index (lightweight 10-entry cache)
     * 🆕 ESMC 3.55 P2: Reuses .esmc-working-memory.json if available (file-based shared state)
     * (avoids duplicate file read - 50 tokens saved, works across CLI subprocess boundaries)
     */
    async searchRecentIndex(query) {
        try {
            let index;

            // 🆕 ESMC 3.55 P2: Check file-based shared state (CLI-to-CLI reuse)
            const workingMemoryPath = path.join(path.dirname(this.recentIndexPath), '.esmc-working-memory.json');

            try {
                const workingMemory = JSON.parse(await fs.readFile(workingMemoryPath, 'utf8'));

                // Validate TTL (5 minute expiry)
                const age = Date.now() - new Date(workingMemory.created_at).getTime();
                const ttl = (workingMemory.ttl_seconds || 300) * 1000; // milliseconds

                if (age < ttl && workingMemory.t1_sessions) {
                    console.log(`   🧠 ATLAS T1: Reusing cached sessions from shared state file (50 tokens saved, age: ${Math.floor(age/1000)}s)`);
                    index = {
                        recent_sessions: workingMemory.t1_sessions
                    };
                } else {
                    throw new Error('Working memory expired or invalid');
                }
            } catch (wmError) {
                // Fallback: Read .memory-recent.json directly
                const content = await fs.readFile(this.recentIndexPath, 'utf8');
                index = JSON.parse(content);

                // 🆕 ESMC 3.100.0: Normalize v4.1.0 format (indices.recent.sessions → recent_sessions)
                if (index.indices && index.indices.recent && index.indices.recent.sessions) {
                    index = {
                        recent_sessions: index.indices.recent.sessions
                    };
                } else if (!index.recent_sessions) {
                    // Unexpected format - use empty array
                    index = { recent_sessions: [] };
                }
            }

            const queryLower = query.toLowerCase();

            // Search strategies (in order of priority):
            // 1. Exact session ID match
            // 2. Keyword match
            // 3. Topic match
            // 4. Summary substring match

            for (const session of index.recent_sessions) {
                // Strategy 1: Exact session ID
                if (session.session_id.toLowerCase() === queryLower) {
                    return {
                        found: true,
                        match_type: 'session_id',
                        data: await this.loadFullSession(session.file_path),
                        sessions: index.recent_sessions // 🆕 For footprint capture
                    };
                }

                // Strategy 2: Keyword match
                if (session.keywords && session.keywords.some(k => k.toLowerCase().includes(queryLower) || queryLower.includes(k.toLowerCase()))) {
                    return {
                        found: true,
                        match_type: 'keyword',
                        data: await this.loadFullSession(session.file_path),
                        sessions: index.recent_sessions // 🆕 For footprint capture
                    };
                }

                // Strategy 3: Key topic match
                if (session.key_topics && session.key_topics.some(t => t.toLowerCase().includes(queryLower) || queryLower.includes(t.toLowerCase()))) {
                    return {
                        found: true,
                        match_type: 'topic',
                        data: await this.loadFullSession(session.file_path),
                        sessions: index.recent_sessions // 🆕 For footprint capture
                    };
                }

                // Strategy 4: Summary substring match
                if (session.summary && session.summary.toLowerCase().includes(queryLower)) {
                    return {
                        found: true,
                        match_type: 'summary',
                        data: await this.loadFullSession(session.file_path),
                        sessions: index.recent_sessions // 🆕 For footprint capture
                    };
                }
            }

            return {
                found: false,
                sessions: index.recent_sessions // 🆕 Capture even on miss
            };

        } catch (error) {
            console.warn(`   ⚠️ Recent index unavailable: ${error.message}`);
            return { found: false };
        }
    }

    /**
     * TIER 2: Search topic index
     * @fixed ESMC 3.13.1 - Enhanced matching (topic + aliases + session keywords)
     * @fixed ESMC 3.13.2 - Added fuzzy matching with edit distance (80% threshold)
     */
    async searchTopicIndex(query) {
        try {
            const content = await fs.readFile(this.topicIndexPath, 'utf8');
            const index = JSON.parse(content);

            const queryLower = query.toLowerCase();
            const queryKeywords = queryLower.split(/\s+/).filter(w => w.length > 2);

            // 🆕 Collect all topics for footprint
            const allTopics = Object.entries(index.topics || {}).map(([name, data]) => ({
                name,
                sessionIds: data.sessions ? data.sessions.map(s => s.session_id || s) : [],
                aliases: data.aliases || []
            }));

            // Search through topics
            for (const [topic, topicData] of Object.entries(index.topics || {})) {
                // Strategy 1: Exact match topic name
                if (topic.toLowerCase().includes(queryLower) || queryLower.includes(topic.toLowerCase())) {
                    const result = await this.loadTopicSession(topicData);
                    result.topics = allTopics; // 🆕 For footprint
                    return result;
                }

                // Strategy 2: Fuzzy match topic name (80% similarity threshold)
                const fuzzyScore = this.fuzzyMatchScore(queryLower, topic.toLowerCase());
                if (fuzzyScore >= 0.8) {
                    const result = await this.loadTopicSession(topicData);
                    result.topics = allTopics; // 🆕 For footprint
                    return result;
                }

                // Strategy 3: Match aliases (exact)
                if (topicData.aliases && topicData.aliases.some(alias =>
                    queryKeywords.some(qk => alias.toLowerCase().includes(qk) || qk.includes(alias.toLowerCase()))
                )) {
                    const result = await this.loadTopicSession(topicData);
                    result.topics = allTopics; // 🆕 For footprint
                    return result;
                }

                // Strategy 4: Fuzzy match aliases (70% threshold for shorter strings)
                if (topicData.aliases) {
                    for (const alias of topicData.aliases) {
                        for (const qk of queryKeywords) {
                            const score = this.fuzzyMatchScore(qk, alias.toLowerCase());
                            if (score >= 0.7) {
                                const result = await this.loadTopicSession(topicData);
                                result.topics = allTopics; // 🆕 For footprint
                                return result;
                            }
                        }
                    }
                }

                // Strategy 5: Match session keywords/snippets
                if (topicData.sessions && topicData.sessions.length > 0) {
                    for (const session of topicData.sessions) {
                        const sessionText = JSON.stringify(session).toLowerCase();
                        if (queryKeywords.some(qk => sessionText.includes(qk))) {
                            const result = await this.loadTopicSession(topicData);
                            result.topics = allTopics; // 🆕 For footprint
                            return result;
                        }
                    }
                }
            }

            return {
                found: false,
                topics: allTopics // 🆕 Capture even on miss
            };

        } catch (error) {
            console.warn(`   ⚠️ Topic index unavailable: ${error.message}`);
            return { found: false };
        }
    }

    /**
     * Load session from topic data
     */
    async loadTopicSession(topicData) {
        if (topicData.sessions && topicData.sessions.length > 0) {
            const session = topicData.sessions[0]; // Most recent
            const sessionPath = session.file
                ? path.join(this.memoryPath, session.file)
                : path.join(this.memoryPath, 'sessions', `${session}.json`);

            return {
                found: true,
                match_type: 'topic',
                data: await this.loadFullSession(sessionPath)
            };
        }
        return { found: false };
    }

    /**
     * TIER 3: Full AEGIS registry scan with keyword matching
     */
    async searchFullRegistry(query) {
        try {
            const content = await fs.readFile(this.registryPath, 'utf8');
            const registry = JSON.parse(content);

            const queryKeywords = this.extractKeywords(query);

            // Calculate relevance scores for all projects
            const scores = {};

            for (const [projectId, project] of Object.entries(registry.projects || {})) {
                scores[projectId] = this.calculateRelevance(queryKeywords, project);
            }

            // Find best match (>30% relevance threshold)
            const matches = Object.entries(scores)
                .filter(([_, score]) => score > 0.3)
                .sort(([_, a], [__, b]) => b - a);

            if (matches.length > 0) {
                const [bestProjectId, score] = matches[0];
                const project = registry.projects[bestProjectId];
                const sessionPath = path.join(this.memoryPath, 'sessions', project.file);

                return {
                    found: true,
                    match_type: 'keyword_scan',
                    relevance_score: score,
                    data: await this.loadFullSession(sessionPath)
                };
            }

            return { found: false };

        } catch (error) {
            console.warn(`   ⚠️ Registry scan failed: ${error.message}`);
            return { found: false };
        }
    }

    /**
     * SCRIBE ENRICHMENT: Add temporal context (parallel, always runs)
     * TODO: Full Scribe integration for Time Machine temporal pinpointing
     */
    async enrichWithScribe(sessionData, query) {
        // Placeholder for Scribe integration
        // This will be enhanced when Scribe module is integrated with Time Machine

        if (!sessionData) return null;

        try {
            const sessionDate = new Date(sessionData.date || sessionData.timestamp);
            const now = new Date();
            const daysAgo = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));

            return {
                temporal_context: `This memory is from ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`,
                session_date: sessionDate.toISOString().split('T')[0],
                recency_score: Math.max(0, 1 - (daysAgo / 365)), // Decay over 1 year
                scribe_note: "Future: Scribe will add pattern matching to related past sessions"
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Increment retrieval count for session (usage intelligence)
     * @added ESMC 3.13.2
     * @fixed ESMC 3.13.3 - Added logging and error reporting
     */
    async incrementRetrievalCount(sessionPath) {
        try {
            // Normalize path handling
            const absolutePath = path.isAbsolute(sessionPath)
                ? sessionPath
                : path.join(this.memoryPath, sessionPath.replace('.claude/memory/', ''));

            const content = await fs.readFile(absolutePath, 'utf8');
            const session = JSON.parse(content);

            // Increment retrieval count
            session.retrieval_count = (session.retrieval_count || 0) + 1;
            session.last_retrieved = new Date().toISOString();

            // Save back (non-blocking)
            await fs.writeFile(absolutePath, JSON.stringify(session, null, 2), 'utf8');

            // ✅ VERIFICATION: Log successful increment
            console.log(`   📊 Usage +1: ${session.session_id || 'unknown'} (${session.retrieval_count} retrievals)`);
        } catch (error) {
            // ⚠️ NON-CRITICAL: Log warning but don't fail retrieval
            console.warn(`   ⚠️ Failed to increment retrieval count for ${sessionPath}: ${error.message}`);
        }
    }

    /**
     * Load full session data from file path
     */
    async loadFullSession(filePath) {
        try {
            // Handle both absolute and relative paths
            const absolutePath = path.isAbsolute(filePath)
                ? filePath
                : path.join(this.memoryPath, filePath.replace('.claude/memory/', ''));

            const content = await fs.readFile(absolutePath, 'utf8');
            const session = JSON.parse(content);

            // Increment retrieval count (usage intelligence)
            this.incrementRetrievalCount(absolutePath);

            return session;
        } catch (error) {
            console.error(`   ❌ Failed to load session: ${error.message}`);
            return null;
        }
    }

    /**
     * Calculate Levenshtein edit distance for fuzzy matching
     * @added ESMC 3.13.2
     */
    levenshteinDistance(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return matrix[len1][len2];
    }

    /**
     * Fuzzy match score (0-1) using edit distance
     * @added ESMC 3.13.2
     * @optimized ESMC 3.13.3 - Early termination for impossible thresholds
     */
    fuzzyMatchScore(str1, str2, threshold = 0.7) {
        // ⚡ OPTIMIZATION: Early exit if length difference makes threshold impossible
        const lengthDiff = Math.abs(str1.length - str2.length);
        const maxLen = Math.max(str1.length, str2.length);

        // If length difference alone exceeds threshold, skip expensive calculation
        if (lengthDiff > maxLen * (1 - threshold)) {
            return 0;  // Impossible to meet threshold
        }

        const distance = this.levenshteinDistance(str1, str2);
        return 1 - (distance / maxLen);
    }

    /**
     * Extract keywords from query using AEGIS REGEX standard
     */
    extractKeywords(query) {
        const text = query.toLowerCase();
        const words = text.match(/\b[a-z]{3,}\b/g) || [];
        const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'been', 'will', 'what', 'when', 'where', 'which', 'who']);

        const keywords = [];
        words.forEach(word => {
            if (!stopWords.has(word)) {
                keywords.push(word);
            }
        });

        return keywords;
    }

    /**
     * Calculate relevance score (0-1) between query keywords and project
     */
    calculateRelevance(queryKeywords, project) {
        const projectKeywords = new Set((project.keywords || []).map(k => k.toLowerCase()));
        const projectPatterns = new Set((project.patterns || []).map(p => p.toLowerCase()));

        let matchCount = 0;
        let totalWeight = 0;

        for (const keyword of queryKeywords) {
            const kw = keyword.toLowerCase();

            // Exact keyword match (highest weight)
            if (projectKeywords.has(kw)) {
                matchCount += 1.0;
                totalWeight += 1.0;
            }
            // Pattern match (medium weight)
            else if (Array.from(projectPatterns).some(p => p.includes(kw) || kw.includes(p))) {
                matchCount += 0.6;
                totalWeight += 1.0;
            }
            // Partial match (low weight)
            else if (Array.from(projectKeywords).some(k => k.includes(kw) || kw.includes(k))) {
                matchCount += 0.3;
                totalWeight += 1.0;
            }
            else {
                totalWeight += 1.0;
            }
        }

        return totalWeight > 0 ? matchCount / totalWeight : 0;
    }

    /**
     * Update performance metrics
     */
    updateMetrics(responseTime) {
        this.performanceMetrics.total_queries++;
        const totalTime = this.performanceMetrics.avg_response_time * (this.performanceMetrics.total_queries - 1) + responseTime;
        this.performanceMetrics.avg_response_time = totalTime / this.performanceMetrics.total_queries;
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const total = this.performanceMetrics.total_queries;

        return {
            total_queries: total,
            tier1_hit_rate: total > 0 ? (this.performanceMetrics.tier1_hits / total * 100).toFixed(1) + '%' : 'N/A',
            tier2_hit_rate: total > 0 ? (this.performanceMetrics.tier2_hits / total * 100).toFixed(1) + '%' : 'N/A',
            tier3_hit_rate: total > 0 ? (this.performanceMetrics.tier3_hits / total * 100).toFixed(1) + '%' : 'N/A',
            avg_response_time_ms: this.performanceMetrics.avg_response_time.toFixed(0),
            performance_target: '< 1000ms average',
            status: this.performanceMetrics.avg_response_time < 1000 ? '✅ TARGET MET' : '⚠️ NEEDS OPTIMIZATION'
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ATHENA MEMORY CORRECTION FILTER (ESMC 3.94.0)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Apply ATHENA memory corrections to filter quarantined citations
     * @added ESMC 3.94.0
     * @param {Array} sessions - Sessions from T1/T2/T3 retrieval
     * @returns {Promise<Array>} Filtered sessions with correction metadata
     */
    async applyATHENACorrections(sessions) {
        try {
            const { ATHENAMemoryCorrection } = require('./cli/14ab1f6e.js');
            const athena = new ATHENAMemoryCorrection(this.projectRoot);

            // Filter each session
            const filteredSessions = await Promise.all(
                sessions.map(session => athena.filterSession(session))
            );

            // Count corrections applied
            const quarantinedCount = filteredSessions.filter(s => s._quarantined_citations).length;
            const warningCount = filteredSessions.filter(s => s._citation_warning).length;

            if (quarantinedCount > 0 || warningCount > 0) {
                console.log(`   🧠 ATHENA: Filtered ${quarantinedCount} quarantined, ${warningCount} warnings`);
            }

            return filteredSessions;
        } catch (error) {
            // Silent failure - corrections not critical to retrieval
            console.warn(`   ⚠️ ATHENA filter failed: ${error.message}`);
            return sessions; // Return unfiltered
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = AtlasRetrievalSystem;

// Example usage / CLI testing
if (require.main === module) {
    (async () => {
        console.log("🎖️ ESMC 3.9.4 - ATLAS Retrieval System Test\n");

        const atlas = new AtlasRetrievalSystem();

        // Test queries
        const testQueries = [
            "auth-guardian fusion",
            "cold startup optimization",
            "regex standardization",
            "infinity mode",
            "where did we stop"
        ];

        for (const query of testQueries) {
            const result = await atlas.retrieve(query);

            console.log(`\n📊 RESULT: ${result.found ? '✅ FOUND' : '❌ NOT FOUND'}`);
            console.log(`   Tier Used: ${result.tier_used || 'None'}`);
            console.log(`   Response Time: ${result.response_time_ms}ms`);

            if (result.found && result.data) {
                console.log(`   Session: ${result.data.session_id}`);
                console.log(`   Project: ${result.data.project.substring(0, 60)}...`);
            }

            if (result.scribe_enrichment) {
                console.log(`   Temporal: ${result.scribe_enrichment.temporal_context}`);
            }
        }

        // Performance stats
        console.log(`\n\n📊 ATLAS PERFORMANCE STATISTICS`);
        console.log('═'.repeat(60));
        const stats = atlas.getPerformanceStats();
        console.log(JSON.stringify(stats, null, 2));

        console.log("\n✅ ATLAS Retrieval System test completed");
    })();
}
