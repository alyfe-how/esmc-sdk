#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════
 * ESMC SDK v5.0 © 2025 Abelitie Designs Malaysia
 * Build: 2026-01-22 | https://esmc-sdk.com
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
// CL0 - Selective Memory Loading with 65% Threshold Architecture
/** ESMC 3.76.0 Memory Bundle CLI | 2025-11-08 | v2.1.0 | PROD | ALL_TIERS
 *  Purpose: Selective memory loading + Enhanced working-memory output
 *  Innovation: Single-file output with Claude essentials (lessons, atlas_t1, project, user adaptation)
 *  Savings: 12,134 tokens → ~2,700 tokens (77% reduction) + 5,500 tokens (enhanced working-memory)
 *  Files: .esmc-lessons.json, .memory-recent.json, .project-brief.json, .user-profile-lite.json
 *  Usage: node b4a5c63c.js load-selective [query] [threshold] [maxSessions] [--silent]
 *  ESMC 3.76.0: Enhanced working-memory.json eliminates bundle-output.json in silent mode
 *  Architecture: Keyword scoring → Threshold filter → Selective reads → Enhanced working-memory
 *  Documentation: See memory-bundle-cli-CL0.md for validation tests & token economics
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class MemoryBundleCLI {
    constructor(silent = false) {
        this.version = "2.1.0"; // ESMC 3.76.0: Enhanced working-memory output
        this.projectRoot = this._findProjectRoot();
        this.memoryDir = path.join(this.projectRoot, '.claude', 'memory');
        this.sessionsDir = path.join(this.memoryDir, 'sessions');
        this.silent = silent; // ESMC 3.74.1: Silent mode for verbose suppression
    }

    /**
     * Console.log wrapper that respects silent mode
     */
    log(...args) {
        if (!this.silent) {
            console.log(...args);
        }
    }

    /**
     * Auto-detect project root by walking up from module location
     * Searches for .claude/memory/ directory
     * @returns {string} Absolute path to project root
     */
    _findProjectRoot() {
        let current = __dirname;
        while (current !== path.dirname(current)) {
            const claudePath = path.join(current, '.claude', 'memory');
            if (fsSync.existsSync(claudePath)) {
                return current;
            }
            current = path.dirname(current);
        }
        // Fallback to cwd
        return process.cwd();
    }

    /**
     * 🆕 ESMC 3.68.1: Selective memory loading with threshold-based filtering
     * Two-stage architecture: Load metadata → Score → Filter → Read full sessions
     * @param {string} query - Search query for keyword matching
     * @param {number} threshold - Match score threshold (0.0-1.0, default 0.65 = 65%)
     * @param {number} maxSessions - Maximum sessions to read (default 3)
     * @returns {Object} Consolidated bundle with selective session loading
     */
    loadBundleSelective(query = null, threshold = 0.65, maxSessions = 3, useDifferential = true) {
        this.log(`📦 Memory Bundle CLI ${this.version} (Selective Loading)`);
        this.log(`   Threshold: ${Math.round(threshold * 100)}% | Max sessions: ${maxSessions}`);
        if (useDifferential) {
            this.log(`   Mode: Differential (load only new sessions)`);
        }

        const bundle = {
            lessons: this.loadLessons(),
            recent: useDifferential ? this.loadRecentDifferential() : this.loadRecentMetadata(), // Stage 1: Differential or full metadata
            brief: this.loadBrief(),
            profile: this.loadProfile(),
            atlas_t1: null,
            matched_sessions: [], // Stage 3: Selective full session reads
            timestamp: new Date().toISOString()
        };

        // Stage 2: Score and filter sessions if query provided
        if (query && bundle.recent.available) {
            // 🆕 ESMC 4.0: Cascading ATLAS T1 (2-layer architecture)
            if (bundle.recent.cascading) {
                this.log(`   🔄 Cascading ATLAS T1 (2-layer search)...`);

                // Layer 1: Try narrow sessions first (date-filtered)
                const narrowScored = this.scoreAndFilterSessions(
                    query,
                    bundle.recent.metadata_sessions_narrow,
                    threshold,
                    maxSessions
                );

                if (narrowScored.atlas_result.found && narrowScored.matched_sessions.length > 0) {
                    // T1 Layer 1 HIT
                    bundle.atlas_t1 = {
                        ...narrowScored.atlas_result,
                        layer: 'narrow',
                        token_cost_estimate: 600
                    };
                    bundle.matched_sessions = this.loadSelectedSessions(narrowScored.matched_sessions);
                    this.log(`   ✅ T1 Layer 1 (Narrow) HIT: ${narrowScored.matched_sessions.length} sessions matched (~600 tokens)`);
                } else {
                    // T1 Layer 1 MISS → Try Layer 2
                    this.log(`   ⚠️ T1 Layer 1 (Narrow) MISS → Trying Layer 2 (Wide)...`);

                    const wideScored = this.scoreAndFilterSessions(
                        query,
                        bundle.recent.metadata_sessions_wide,
                        threshold,
                        maxSessions
                    );

                    if (wideScored.atlas_result.found && wideScored.matched_sessions.length > 0) {
                        // T1 Layer 2 HIT
                        bundle.atlas_t1 = {
                            ...wideScored.atlas_result,
                            layer: 'wide',
                            token_cost_estimate: 1800
                        };
                        bundle.matched_sessions = this.loadSelectedSessions(wideScored.matched_sessions);
                        this.log(`   ✅ T1 Layer 2 (Wide) HIT: ${wideScored.matched_sessions.length} sessions matched (~1,800 tokens)`);
                    } else {
                        // Both layers MISS → T2 fallback
                        bundle.atlas_t1 = {
                            found: false,
                            layer: 'both_miss',
                            reason: 'Both T1 layers missed, T2/T3 fallback required',
                            token_cost_estimate: 6800
                        };
                        this.log(`   ❌ T1 Layer 2 (Wide) MISS → T2/T3 fallback required (~6,800 tokens)`);
                    }
                }

            } else {
                // Non-cascading mode (legacy or fallback)
                const scoredSessions = this.scoreAndFilterSessions(
                    query,
                    bundle.recent.metadata_sessions,
                    threshold,
                    maxSessions
                );

                bundle.atlas_t1 = scoredSessions.atlas_result;

                // Stage 3: Selective loading - read ONLY sessions above threshold
                if (scoredSessions.matched_sessions.length > 0) {
                    bundle.matched_sessions = this.loadSelectedSessions(scoredSessions.matched_sessions);
                    this.log(`   📊 Selective Load: ${bundle.matched_sessions.length}/${bundle.recent.metadata_sessions.length} sessions read (${Math.round((bundle.matched_sessions.length / bundle.recent.metadata_sessions.length) * 100)}% of total)`);
                } else {
                    this.log(`   📊 Selective Load: 0 sessions matched threshold (${Math.round(threshold * 100)}%)`);
                }
            }
        }

        return bundle;
    }

    /**
     * Load all 4 essential memory files (LEGACY - kept for backward compatibility)
     * @param {string} query - Optional search query for ATLAS T1
     * @returns {Object} Consolidated bundle
     */
    loadBundle(query = null) {
        this.log(`📦 Memory Bundle CLI ${this.version}`);
        this.log(`   Loading 4 essential files + ATLAS T1 search...`);

        const bundle = {
            lessons: this.loadLessons(),
            recent: this.loadRecent(),
            brief: this.loadBrief(),
            profile: this.loadProfile(),
            atlas_t1: null,
            timestamp: new Date().toISOString()
        };

        // Perform ATLAS T1 search if query provided and recent sessions available
        if (query && bundle.recent.available) {
            bundle.atlas_t1 = this.searchRecentIndex(query, bundle.recent.sessions);
        }

        return bundle;
    }

    /**
     * Load .esmc-lessons.json
     * @returns {Object} Lessons data with availability flag
     */
    loadLessons() {
        const filePath = path.join(this.memoryDir, '.esmc-lessons.json');

        try {
            if (!fsSync.existsSync(filePath)) {
                this.log(`   ⚠️ Lessons: Not found (${filePath})`);
                return { lessons: [], available: false };
            }

            const data = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));
            this.log(`   ✅ Lessons: Loaded ${data.lessons?.length || 0} lessons`);

            return {
                lessons: data.lessons || [],
                available: true,
                version: data.version,
                last_updated: data.last_updated
            };
        } catch (error) {
            console.error(`   ❌ Lessons: Error loading (${error.message})`);
            return { lessons: [], available: false, error: error.message };
        }
    }

    /**
     * Load .memory-recent.json
     * @returns {Object} Recent sessions data with availability flag
     */
    loadRecent() {
        const filePath = path.join(this.memoryDir, '.memory-recent.json');

        try {
            if (!fsSync.existsSync(filePath)) {
                console.log(`   ⚠️ Recent: Not found (${filePath})`);
                return { sessions: [], available: false };
            }

            const data = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));

            // v4.0.0+ dual-index support
            if (data.indices && data.indices.recent && data.indices.important) {
                const uniqueSessions = data.performance_metrics?.unique_sessions || 0;
                this.log(`   ✅ Recent: Loaded ${data.indices.recent.sessions.length} recent + ${data.indices.important.sessions.length} important (${uniqueSessions} unique)`);

                return {
                    recent_sessions: data.indices.recent.sessions, // Backward compatible field name
                    important_sessions: data.indices.important.sessions, // New field for important index
                    indices: data.indices, // Full dual-index structure
                    available: true,
                    version: data.version,
                    last_updated: data.last_updated,
                    performance_metrics: data.performance_metrics
                };
            }

            // Fallback: v3.0.0 single-index (backward compatible)
            this.log(`   ✅ Recent: Loaded ${data.recent_sessions?.length || 0} sessions (v${data.version})`);

            return {
                sessions: data.recent_sessions || [],
                available: true,
                version: data.version,
                last_updated: data.last_updated
            };
        } catch (error) {
            console.error(`   ❌ Recent: Error loading (${error.message})`);
            return { sessions: [], available: false, error: error.message };
        }
    }

    /**
     * Load .project-brief.json
     * @returns {Object} Project brief data with availability flag
     */
    loadBrief() {
        const filePath = path.join(this.memoryDir, '.project-brief.json');

        try {
            if (!fsSync.existsSync(filePath)) {
                this.log(`   ⚠️ Brief: Not found (${filePath})`);
                return { available: false };
            }

            const data = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));
            this.log(`   ✅ Brief: Loaded (project: ${data.project_name || 'Unknown'})`);

            return {
                ...data,
                available: true
            };
        } catch (error) {
            console.error(`   ❌ Brief: Error loading (${error.message})`);
            return { available: false, error: error.message };
        }
    }

    /**
     * Load .user-profile-lite.json (fallback to .user-profile.json)
     * @returns {Object} User profile data with availability flag
     */
    loadProfile() {
        const litePath = path.join(this.memoryDir, '.user-profile-lite.json');
        const fullPath = path.join(this.memoryDir, '.user-profile.json');

        try {
            // Prefer lite version
            if (fsSync.existsSync(litePath)) {
                const data = JSON.parse(fsSync.readFileSync(litePath, 'utf8'));
                this.log(`   ✅ Profile: Loaded lite version`);
                return {
                    ...data,
                    available: true,
                    source: 'lite'
                };
            }

            // Fallback to full version
            if (fsSync.existsSync(fullPath)) {
                const data = JSON.parse(fsSync.readFileSync(fullPath, 'utf8'));
                this.log(`   ✅ Profile: Loaded full version (fallback)`);
                return {
                    ...data,
                    available: true,
                    source: 'full'
                };
            }

            this.log(`   ⚠️ Profile: Not found (lite or full)`);
            return { available: false };

        } catch (error) {
            console.error(`   ❌ Profile: Error loading (${error.message})`);
            return { available: false, error: error.message };
        }
    }

    /**
     * 🆕 ESMC 4.0: Cascading differential memory loading (tokenomics optimization)
     * Returns BOTH narrow (date-filtered) and wide (all recent) for 2-layer ATLAS T1
     * Token savings: 80-90% for returning conversations
     * @param {boolean} useDifferential - Enable differential loading (default: true)
     * @returns {Object} Cascading differential session metadata (narrow + wide)
     */
    loadRecentDifferential(useDifferential = true) {
        if (!useDifferential) {
            // Fallback to full metadata load
            return this.loadRecentMetadata();
        }

        try {
            // Execute differential loader CLI
            const { execSync } = require('child_process');
            const loaderPath = path.join(__dirname, 'ac8f31c2.js');

            const result = execSync(`node "${loaderPath}" --silent`, {
                encoding: 'utf8',
                cwd: this.projectRoot
            });

            const parsed = JSON.parse(result.trim().split('\n').pop()); // Last line is JSON

            if (!parsed.success) {
                console.error('   ⚠️ Differential loader failed, falling back to full load');
                return this.loadRecentMetadata();
            }

            // Read the cascading differential bundle (v2.0.0)
            const bundlePath = parsed.bundle_path;
            const bundle = JSON.parse(fsSync.readFileSync(bundlePath, 'utf8'));

            this.log(`   ✅ Cascading Differential:`);
            this.log(`      Narrow (T1-L1): ${bundle.cascading.narrow.count} sessions`);
            this.log(`      Wide (T1-L2): ${bundle.cascading.wide.count} sessions`);
            this.log(`      Savings: ${bundle.token_savings_percent}% (mode: ${bundle.mode})`);

            return {
                metadata_sessions_narrow: bundle.cascading.narrow.sessions,
                metadata_sessions_wide: bundle.cascading.wide.sessions,
                available: true,
                mode: bundle.mode,
                savings_percent: bundle.token_savings_percent,
                differential: true,
                cascading: true
            };

        } catch (error) {
            console.error(`   ⚠️ Differential load error: ${error.message}, falling back`);
            return this.loadRecentMetadata();
        }
    }

    /**
     * 🆕 ESMC 3.68.1: Load metadata-only from .memory-recent.json
     * Stage 1 of selective loading - returns lightweight session metadata
     * @returns {Object} Metadata sessions (no full summaries)
     */
    loadRecentMetadata() {
        const filePath = path.join(this.memoryDir, '.memory-recent.json');

        try {
            if (!fsSync.existsSync(filePath)) {
                console.log(`   ⚠️ Recent: Not found (${filePath})`);
                return { metadata_sessions: [], available: false };
            }

            const data = JSON.parse(fsSync.readFileSync(filePath, 'utf8'));

            // Extract metadata-only from dual-index structure
            let metadataSessions = [];

            if (data.indices && data.indices.recent && data.indices.important) {
                // Combine recent + important indices
                const allSessions = [
                    ...data.indices.recent.sessions,
                    ...data.indices.important.sessions
                ];

                // Deduplicate by session_id (sessions can appear in both indices)
                const uniqueSessions = [];
                const seenIds = new Set();
                for (const session of allSessions) {
                    if (!seenIds.has(session.session_id)) {
                        uniqueSessions.push(session);
                        seenIds.add(session.session_id);
                    }
                }

                // Strip full summaries, keep only metadata
                metadataSessions = uniqueSessions.map(s => ({
                    session_id: s.session_id,
                    date: s.date,
                    project: s.project,
                    summary_compact: s.summary_compact || (s.summary ? s.summary.substring(0, 200) + '...' : ''),
                    keywords: s.keywords || [],
                    key_topics: s.key_topics || [],
                    importance_score: s.importance_score,
                    rank: s.rank,
                    file_path: s.file_path || `.claude/memory/sessions/${s.domain}/${s.subdomain}`
                }));

                this.log(`   ✅ Recent: Loaded ${metadataSessions.length} session metadata (lightweight)`);

                return {
                    metadata_sessions: metadataSessions,
                    available: true,
                    version: data.version,
                    last_updated: data.last_updated
                };
            }

            return { metadata_sessions: [], available: false };
        } catch (error) {
            console.error(`   ❌ Recent: Error loading metadata (${error.message})`);
            return { metadata_sessions: [], available: false, error: error.message };
        }
    }

    /**
     * 🆕 ESMC 3.68.1: Score sessions and filter by threshold
     * Stage 2 of selective loading - keyword matching + threshold filtering
     * @param {string} query - Search query
     * @param {Array} metadataSessions - Metadata-only sessions
     * @param {number} threshold - Score threshold (0.0-1.0)
     * @param {number} maxSessions - Maximum sessions to return
     * @returns {Object} Scored and filtered sessions
     */
    scoreAndFilterSessions(query, metadataSessions, threshold = 0.65, maxSessions = 3) {
        const keywords = this._tokenizeQuery(query);

        if (keywords.length === 0) {
            return {
                atlas_result: { found: false, reason: 'No keywords extracted' },
                matched_sessions: []
            };
        }

        // Score each session (reuse existing scoring logic)
        const scoredSessions = metadataSessions.map((session, index) => {
            let score = 0;
            const matchDetails = {
                keyword_hits: 0,
                topic_hits: 0,
                summary_hits: 0,
                matched_keywords: []
            };

            keywords.forEach(keyword => {
                // Field 1: session.keywords[] (weight: 3 points)
                if (session.keywords && Array.isArray(session.keywords)) {
                    const keywordMatch = session.keywords.some(k =>
                        k.toLowerCase().includes(keyword) || keyword.includes(k.toLowerCase())
                    );
                    if (keywordMatch) {
                        score += 3;
                        matchDetails.keyword_hits++;
                        matchDetails.matched_keywords.push(keyword);
                    }
                }

                // Field 2: session.key_topics[] (weight: 2 points)
                if (session.key_topics && Array.isArray(session.key_topics)) {
                    const topicMatch = session.key_topics.some(t =>
                        t.toLowerCase().includes(keyword) || keyword.includes(t.toLowerCase())
                    );
                    if (topicMatch) {
                        score += 2;
                        matchDetails.topic_hits++;
                        if (!matchDetails.matched_keywords.includes(keyword)) {
                            matchDetails.matched_keywords.push(keyword);
                        }
                    }
                }

                // Field 3: session.summary_compact (weight: 1 point)
                if (session.summary_compact && session.summary_compact.toLowerCase().includes(keyword)) {
                    score += 1;
                    matchDetails.summary_hits++;
                    if (!matchDetails.matched_keywords.includes(keyword)) {
                        matchDetails.matched_keywords.push(keyword);
                    }
                }
            });

            const maxScore = keywords.length * 3;
            const percentScore = maxScore > 0 ? (score / maxScore) : 0;

            return {
                session,
                score,
                maxScore,
                percentScore,
                rank: session.rank || (index + 1),
                matchDetails
            };
        });

        // Sort by score DESC, then by rank ASC
        scoredSessions.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.rank - b.rank;
        });

        // Filter by threshold and limit
        const filtered = scoredSessions.filter(s => s.percentScore >= threshold).slice(0, maxSessions);

        // Create ATLAS T1 result
        const atlasResult = filtered.length > 0 ? {
            query,
            found: true,
            match_type: 'selective_threshold',
            threshold: Math.round(threshold * 100) + '%',
            matched_count: filtered.length,
            top_match: {
                session_id: filtered[0].session.session_id,
                score: `${Math.round(filtered[0].percentScore * 100)}%`,
                matched_keywords: filtered[0].matchDetails.matched_keywords
            },
            all_matches: filtered.map(f => ({
                session_id: f.session.session_id,
                score: Math.round(f.percentScore * 100),
                rank: f.rank
            }))
        } : {
            query,
            found: false,
            reason: `No sessions scored >= ${Math.round(threshold * 100)}%`,
            searched_sessions: metadataSessions.length
        };

        this.log(`   🔍 T1 Selective: ${filtered.length} sessions >= ${Math.round(threshold * 100)}% threshold`);
        if (filtered.length > 0) {
            filtered.forEach(f => {
                this.log(`      - ${f.session.session_id}: ${Math.round(f.percentScore * 100)}%`);
            });
        }

        return {
            atlas_result: atlasResult,
            matched_sessions: filtered.map(f => f.session)
        };
    }

    /**
     * 🆕 ESMC 3.68.1: Load full session files for matched sessions only
     * Stage 3 of selective loading - reads complete session JSON from files
     * @param {Array} metadataSessions - Metadata sessions that passed threshold
     * @returns {Array} Full session objects
     */
    loadSelectedSessions(metadataSessions) {
        const fullSessions = [];

        for (const metadata of metadataSessions) {
            try {
                // Construct full file path
                let sessionPath;
                if (metadata.file_path) {
                    // Use file_path from metadata
                    sessionPath = path.join(this.projectRoot, metadata.file_path);
                } else {
                    // Fallback: construct from session_id
                    sessionPath = path.join(this.sessionsDir, `${metadata.session_id}.json`);
                }

                // Security: Validate path stays within project root (prevent path traversal)
                const resolvedPath = path.resolve(sessionPath);
                const resolvedRoot = path.resolve(this.projectRoot);
                if (!resolvedPath.startsWith(resolvedRoot)) {
                    console.error(`   🚨 Security: Path traversal attempt blocked - ${sessionPath}`);
                    // Fallback: use metadata as-is (degraded mode)
                    fullSessions.push(metadata);
                    continue;
                }

                if (fsSync.existsSync(sessionPath)) {
                    const sessionData = JSON.parse(fsSync.readFileSync(sessionPath, 'utf8'));
                    fullSessions.push(sessionData);
                } else {
                    console.warn(`   ⚠️ Session file not found: ${sessionPath}`);
                    // Fallback: use metadata as-is (degraded mode)
                    fullSessions.push(metadata);
                }
            } catch (error) {
                console.error(`   ❌ Error loading session ${metadata.session_id}: ${error.message}`);
                // Fallback: use metadata
                fullSessions.push(metadata);
            }
        }

        this.log(`   ✅ Sessions: Loaded ${fullSessions.length} full session files`);
        return fullSessions;
    }

    /**
     * 🆕 ESMC 3.56: Tokenize query into keywords (restores KeywordExtractor functionality)
     * Mirrors keyword-extractor.js:71-75 logic
     * @param {string} query - Raw user query
     * @returns {Array<string>} Extracted keywords (filtered: length > 2)
     * @private
     */
    _tokenizeQuery(query) {
        if (!query || typeof query !== 'string') return [];

        return query
            .toLowerCase()
            .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
            .split(/\s+/)               // Split on whitespace
            .filter(word => word.length > 2); // Filter short words
    }

    /**
     * ATLAS T1 Search - Enhanced with keyword tokenization + scoring
     * ESMC 3.56 P1: Restores KeywordExtractor preprocessing lost in ESMC 3.54
     * Searches recent sessions using multi-keyword scoring algorithm
     * @param {string} query - Search query
     * @param {Array} sessions - Recent sessions array
     * @returns {Object} Search result
     */
    searchRecentIndex(query, sessions) {
        if (!query || !sessions || sessions.length === 0) {
            return {
                query: query || null,
                found: false,
                reason: 'No query or no sessions available'
            };
        }

        const queryLower = query.toLowerCase();

        // 🔥 Priority 1: Exact session ID match (backward compatible)
        for (const session of sessions) {
            if (session.session_id && session.session_id.toLowerCase() === queryLower) {
                this.log(`   🔍 T1 HIT: Session ID match (${session.session_id})`);
                return {
                    query,
                    found: true,
                    match_type: 'session_id',
                    matched_session: session,
                    confidence: 100
                };
            }
        }

        // 🆕 ESMC 3.56: Tokenize query into keywords
        const keywords = this._tokenizeQuery(query);

        // If no keywords extracted (query too short/generic), fall back to substring match
        if (keywords.length === 0) {
            this.log(`   🔍 T1 MISS: No keywords extracted from "${query}"`);
            return {
                query,
                found: false,
                reason: 'No keywords extracted (query too short)',
                searched_sessions: sessions.length
            };
        }

        // 🔥 Priority 2: Multi-keyword scoring algorithm
        // Score each session by keyword hits across multiple fields
        const scoredSessions = sessions.map((session, index) => {
            let score = 0;
            const matchDetails = {
                keyword_hits: 0,
                topic_hits: 0,
                summary_hits: 0,
                matched_keywords: []
            };

            keywords.forEach(keyword => {
                // Field 1: session.keywords[] (weight: 3 points per match)
                if (session.keywords && Array.isArray(session.keywords)) {
                    const keywordMatch = session.keywords.some(k =>
                        k.toLowerCase().includes(keyword) || keyword.includes(k.toLowerCase())
                    );
                    if (keywordMatch) {
                        score += 3;
                        matchDetails.keyword_hits++;
                        matchDetails.matched_keywords.push(keyword);
                    }
                }

                // Field 2: session.key_topics[] (weight: 2 points per match)
                if (session.key_topics && Array.isArray(session.key_topics)) {
                    const topicMatch = session.key_topics.some(t =>
                        t.toLowerCase().includes(keyword) || keyword.includes(t.toLowerCase())
                    );
                    if (topicMatch) {
                        score += 2;
                        matchDetails.topic_hits++;
                        if (!matchDetails.matched_keywords.includes(keyword)) {
                            matchDetails.matched_keywords.push(keyword);
                        }
                    }
                }

                // Field 3: session.summary (weight: 1 point per match)
                if (session.summary && session.summary.toLowerCase().includes(keyword)) {
                    score += 1;
                    matchDetails.summary_hits++;
                    if (!matchDetails.matched_keywords.includes(keyword)) {
                        matchDetails.matched_keywords.push(keyword);
                    }
                }
            });

            return {
                session,
                score,
                rank: session.rank || (index + 1), // For tie-breaking (prefer recent)
                matchDetails
            };
        });

        // Sort by score DESC, then by rank ASC (recency tie-breaker)
        scoredSessions.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.rank - b.rank; // Lower rank = more recent
        });

        // Return best match if score > 0
        const best = scoredSessions[0];
        if (best.score > 0) {
            const matchedKeywordsStr = best.matchDetails.matched_keywords.join(', ');
            const maxScore = keywords.length * 3; // Max possible score
            const percentScore = Math.round((best.score / maxScore) * 100);

            this.log(`   🔍 T1 HIT: Keyword scoring (score: ${best.score}/${maxScore} = ${percentScore}%, session: ${best.session.session_id})`);
            this.log(`   🔍 Matched keywords: [${matchedKeywordsStr}] (${best.matchDetails.matched_keywords.length}/${keywords.length})`);

            return {
                query,
                found: true,
                match_type: 'keyword_scoring',
                matched_session: best.session,
                score: best.score,
                max_score: maxScore,
                score_percent: percentScore,
                keywords_extracted: keywords,
                keywords_matched: best.matchDetails.matched_keywords,
                match_breakdown: best.matchDetails,
                confidence: Math.min(100, percentScore)
            };
        }

        this.log(`   🔍 T1 MISS: No match for "${query}" (keywords: [${keywords.join(', ')}])`);
        return {
            query,
            found: false,
            reason: 'No matching sessions found',
            searched_sessions: sessions.length,
            keywords_extracted: keywords
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
        showUsage();
        process.exit(args[0] === 'help' || args[0] === '--help' ? 0 : 1);
    }

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    // Checks for --verbose flag or ESMC_VERBOSE=true, otherwise defaults to silent
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    const command = cleanArgs[0];
    const restArgs = cleanArgs.slice(1);

    // New selective loading syntax: load-selective <query> [threshold] [maxSessions] [--silent]
    if (command === 'load-selective') {
        const thresholdParsed = parseFloat(restArgs[1]);
        const maxSessionsParsed = parseInt(restArgs[2]);
        return {
            command: 'load-selective',
            query: restArgs[0] || null,
            threshold: !isNaN(thresholdParsed) ? thresholdParsed : 0.65,
            maxSessions: !isNaN(maxSessionsParsed) ? maxSessionsParsed : 3,
            silent
        };
    }

    // Legacy load syntax
    return {
        command: cleanArgs[0],
        query: restArgs.join(' ') || null,
        silent
    };
}

function showUsage() {
    console.log(`
📦 Memory Bundle CLI - Selective Memory Loading (ESMC 3.68.1)

Usage:
  node b4a5c63c.js load [query] [--silent|-s]                          Legacy mode: Load ALL sessions
  node b4a5c63c.js load-selective <query> [threshold] [max] [--silent|-s]   Selective mode: Threshold filtering
  node b4a5c63c.js help                                  Show this help

Commands:
  load              Load all 4 files + ALL recent sessions (12,134 tokens - LEGACY)
  load-selective    Load metadata + SELECTIVE sessions based on threshold (2,700 tokens avg)

Arguments (load-selective):
  query             Search query for keyword matching (REQUIRED for selective mode)
  threshold         Score threshold 0.0-1.0 (default: 0.65 = 65%)
  max               Maximum sessions to load (default: 3)
  --silent, -s      Suppress progress output, only show final JSON result

Output:
  JSON bundle containing lessons, recent metadata, matched sessions, brief, profile, T1 results

Examples:
  node b4a5c63c.js load "memory optimization"
  node b4a5c63c.js load-selective "memory optimization"
  node b4a5c63c.js load-selective "memory optimization" 0.70 5
  node b4a5c63c.js load-selective "token cost threshold" 0.65 3
  node b4a5c63c.js load-selective "PMO test" --silent  (quiet mode)

Version: ESMC 3.68.1 | Innovation: Selective loading (77% token reduction)
Token Economics: Metadata ~1,500 + (N matched × ~1,200) vs ALL × ~1,200
    `);
}

async function main() {
    const parsed = parseArgs();
    const { command, query, threshold, maxSessions, silent } = parsed;

    try {
        if (command !== 'load' && command !== 'load-selective') {
            console.error(`❌ Unknown command: ${command}`);
            showUsage();
            process.exit(1);
        }

        const cli = new MemoryBundleCLI(silent);
        let bundle;

        if (command === 'load-selective') {
            if (!query) {
                console.error(`❌ Selective loading requires a query parameter`);
                showUsage();
                process.exit(1);
            }
            bundle = cli.loadBundleSelective(query, threshold, maxSessions);
        } else {
            // Legacy load command
            bundle = cli.loadBundle(query);
        }

        // 🆕 ESMC 3.55 P2: Write T1 data to shared state file for subprocess reuse
        // File-based shared state enables CLI-to-CLI T1 reuse (not possible via global.workingMemory due to subprocess isolation)
        // This enables PCA, DKI, ATLAS to reuse T1 data without re-reading .memory-recent.json (50 tokens saved per component)
        // 🆕 ESMC 3.57 JINJA: Add keywords_extracted for PIU/DKI/UIP reuse (350 tokens saved total)
        // 🆕 ESMC 3.72.1: Dual-mode support (legacy full load + ESMC 3.68.1 selective loading)

        // Determine mode and session data source (handles both legacy and selective)
        const hasLegacySessions = bundle.recent?.sessions && bundle.recent.sessions.length > 0;
        const hasMetadataSessions = bundle.recent?.metadata_sessions && bundle.recent.metadata_sessions.length > 0;

        if (hasLegacySessions || hasMetadataSessions) {
            // Select data source based on mode
            // Selective mode: Use matched_sessions (filtered results, can be empty array)
            // Legacy mode: Use recent.sessions (full load)
            const isSelectiveMode = hasMetadataSessions;
            const sessionData = isSelectiveMode ? (bundle.matched_sessions || []) : bundle.recent.sessions;
            const mode = isSelectiveMode ? 'selective' : 'legacy';

            // 🆕 ESMC 3.76: Enhanced working memory - includes Claude-needed data
            const enhancedWorkingMemory = {
                version: "1.3.0", // ESMC 3.76: Enhanced with Claude data (5,500 token savings)
                created_at: new Date().toISOString(),
                created_by: "memory-bundle-cli",
                ttl_seconds: 3600, // 60 minute TTL (typical ESMC session length)
                mode: mode, // Track which mode created this file (for debugging)

                // For CLI reuse (existing)
                t1_sessions: sessionData,
                session_count: sessionData.length,
                keywords_extracted: bundle.atlas_t1?.keywords_extracted || [],

                // 🆕 For Claude (ESMC 3.76) - eliminates need for bundle-output.json read
                lessons: bundle.lessons?.lessons || [],
                atlas_t1: bundle.atlas_t1 || null,
                project_name: bundle.brief?.project_name || "Unknown Project",
                user_adaptation: bundle.profile?.latestAdaptation || null
            };

            const workingMemoryPath = path.join(cli.memoryDir, '.esmc-working-memory.json');
            await fs.writeFile(workingMemoryPath, JSON.stringify(enhancedWorkingMemory, null, 2), 'utf8');
            cli.log(`   🧠 Working Memory: Wrote ${sessionData.length} T1 sessions + ${enhancedWorkingMemory.keywords_extracted.length} keywords + Claude essentials (${mode} mode, ESMC 3.76 enhanced)`);
        }

        // 🆕 ESMC 3.76: Enhanced working memory eliminates bundle-output.json in silent mode
        if (silent) {
            // Silent mode: Enhanced working-memory.json written above (no bundle-output, no stdout)
            // Token savings: ~5,500 tokens per session (no 511-line bundle-output.json read)
            process.exit(0);
        } else {
            // Normal mode: show full bundle to stdout (for debugging/development)
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(JSON.stringify(bundle, null, 2));
        }

    } catch (error) {
        console.error(`❌ Fatal error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Execute if run directly
if (require.main === module) {
    main().catch(error => {
        console.error(`❌ Unhandled error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { MemoryBundleCLI, main };
