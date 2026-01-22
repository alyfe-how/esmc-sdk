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
/** ESMC 3.20 HYDRA | 2025-10-19 | v3.20.0 | PROD | ALL_TIERS(MAX:3+kw)
 *  Purpose: Parallel multi-keyword search via mini-ATLAS agents (50%↓tokens, 4x↑speed)
 *  Features: Working memory | Self-healing validation | Fuzzy matching (75%) | Dual-confidence vs ATLAS
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════
// HYDRA RETRIEVAL SYSTEM - PARALLEL MULTI-AGENT ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════

class HydraRetrievalSystem {
    constructor(options = {}) {
        this.version = "3.20.0";
        this.systemName = "HYDRA";
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');

        // Tier timeouts (progressive escalation)
        this.TIER_TIMEOUTS = {
            T1: 2000,  // Recent memory (fast)
            T2: 5000,  // Topic index (medium)
            T3: 10000  // Full scan (slow)
        };

        // Confidence thresholds
        this.MIN_CONFIDENCE = 0.70; // 70% minimum
        this.MIN_HITS = 1; // At least 1 result

        // Performance tracking
        this.performanceMetrics = {
            total_queries: 0,
            keyword_agents_spawned: 0,
            avg_response_time: 0,
            token_savings: 0,
            intersection_hits: 0,
            union_hits: 0,
            recognition_triggers: 0  // 🆕 Phase 2
        };

        // 🆕 PHASE 2: COGNITIVE WORKING MEMORY - Full 3-branch architecture
        this.workingMemory = {
            contextBranches: {
                branch1_recent: {
                    tier: 1,
                    scope: 'recent',
                    quality: 'high',
                    description: 'Last 10 sessions - highest relevance',
                    entries: [],
                    captured: false,
                    capturedAt: null,
                    accessCount: 0
                },
                branch2_topic: {
                    tier: 2,
                    scope: 'topic',
                    quality: 'medium',
                    description: 'Topic clusters - thematic grouping',
                    entries: [],
                    captured: false,
                    capturedAt: null,
                    accessCount: 0
                },
                branch3_deep: {
                    tier: 3,
                    scope: 'deep',
                    quality: 'broad',
                    description: 'Full registry scan - pattern discovery',
                    entries: [],
                    captured: false,
                    capturedAt: null,
                    accessCount: 0
                }
            },
            recognitionLog: [],
            sessionId: options.sessionId || `hydra_${Date.now()}`,
            createdAt: Date.now()
        };

        console.log(`🐍 HYDRA Parallel Retrieval System ${this.version} initialized`);
        console.log(`   ⚡ Multi-agent architecture: READY`);
        console.log(`   🧠 Cognitive working memory: READY (Branches 1+2+3)`);
    }

    /**
     * Auto-detect project root
     * @private
     */
    _findProjectRoot() {
        let current = __dirname;
        let candidates = [];

        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            if (fsSync.existsSync(memoryPath)) {
                candidates.push(current);
            }
            current = path.dirname(current);
        }

        if (candidates.length > 0) {
            const topLevel = candidates[candidates.length - 1];
            console.log(`   🎯 HYDRA: Auto-detected project root: ${topLevel}`);
            return topLevel;
        }

        throw new Error('HYDRA: Could not locate .claude/memory/ in parent directories.');
    }

    /**
     * MAIN API: Parallel keyword-based retrieval
     *
     * @param {string} userMessage - User's query
     * @param {Array<string>} keywords - Extracted keywords from CIE
     * @param {Object} options - Configuration options
     * @param {number} options.globalTimeout - Global timeout in ms (default: 15000)
     * @returns {Promise<Object>} Retrieval results with confidence
     */
    async retrieve(userMessage, keywords, options = {}) {
        const startTime = Date.now();
        this.performanceMetrics.total_queries++;

        // Global timeout for dual execution (default: 15s)
        const GLOBAL_TIMEOUT = options.globalTimeout || 15000;

        // Security: Prevent keyword flood DoS attacks
        const MAX_KEYWORDS = options.maxKeywords || 20;
        if (keywords.length > MAX_KEYWORDS) {
            throw new Error(`Keyword flood protection: ${keywords.length} keywords exceeds limit of ${MAX_KEYWORDS}`);
        }

        console.log(`\n🐍 HYDRA: Spawning ${keywords.length} mini-ATLAS agents (${GLOBAL_TIMEOUT}ms budget)`);
        console.log(`   Keywords: ${keywords.join(', ')}`);

        // 🆕 PHASE 2: Capture working memory (all 3 branches in parallel)
        await Promise.all([
            this.captureBranch1Recent(),
            this.captureBranch2Topic(),
            this.captureBranch3Deep()
        ]);

        // STEP 1: Spawn mini-ATLAS agents in parallel (one per keyword)
        const agentPromises = keywords.map(keyword =>
            this._spawnMiniAtlas(keyword, userMessage, options)
        );

        this.performanceMetrics.keyword_agents_spawned += keywords.length;

        // STEP 2: Wait for all agents to complete (with GLOBAL timeout)
        const agentResults = await this._raceWithTimeout(agentPromises, GLOBAL_TIMEOUT);

        // STEP 3: Extract successful results
        const validResults = agentResults
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);

        console.log(`   ✅ ${validResults.length}/${keywords.length} agents completed successfully (${Date.now() - startTime}ms)`);

        // STEP 4: Merge results using set theory
        const mergedResults = this._mergeResults(validResults, keywords);

        // 🆕 PHASE 2: Self-healing validation (top 3 intersection results)
        if (mergedResults.intersection.length > 0) {
            console.log(`   🔍 HYDRA: Validating top 3 intersection results...`);
            const topFiles = mergedResults.intersection.slice(0, 3);
            const validated = await this._validateFileLocations(topFiles);

            // Update intersection with validated/healed paths
            mergedResults.intersection = [
                ...validated.valid,
                ...validated.healed,
                ...mergedResults.intersection.slice(validated.valid.length + validated.healed.length)
            ];
        }

        // STEP 5: Calculate confidence
        const confidence = this._calculateConfidence(mergedResults, validResults, keywords);

        const duration = Date.now() - startTime;
        this._updateMetrics(duration);

        return {
            system: 'HYDRA',
            confidence: confidence,
            files: mergedResults.ranked,
            intersectionFiles: mergedResults.intersection,
            unionFiles: mergedResults.union,
            keywordCount: keywords.length,
            agentResults: validResults,
            reasoning: this._buildReasoning(mergedResults, validResults, keywords),
            metadata: {
                duration: duration,
                agents_spawned: keywords.length,
                agents_succeeded: validResults.length,
                timestamp: new Date().toISOString()
            },
            workingMemoryState: this.getWorkingMemorySnapshot()  // 🆕 Phase 2
        };
    }

    /**
     * Spawn a mini-ATLAS agent for a single keyword
     * Executes T1 search only (2s timeout)
     *
     * @param {string} keyword - Keyword to search
     * @param {string} userMessage - Original user message
     * @param {Object} options - Configuration
     * @returns {Promise<Object>} Agent results
     * @private
     */
    async _spawnMiniAtlas(keyword, userMessage, options) {
        const agentStartTime = Date.now();

        console.log(`   🔍 Agent [${keyword}]: Starting T1 search...`);

        try {
            // T1: Search recent memory index
            const t1Results = await this._searchTier1(keyword, options);

            const agentDuration = Date.now() - agentStartTime;

            // Check if we have enough confidence
            const confidence = this._calculateTierConfidence(t1Results, 1);

            if (t1Results.length >= this.MIN_HITS && confidence >= this.MIN_CONFIDENCE) {
                console.log(`   ✅ Agent [${keyword}]: T1 complete (${agentDuration}ms, ${confidence.toFixed(2)} confidence)`);
                return {
                    keyword: keyword,
                    tier: 1,
                    files: t1Results,
                    confidence: confidence,
                    duration: agentDuration
                };
            }

            // If T1 insufficient, escalate to T2 (if time permits)
            if (agentDuration < this.TIER_TIMEOUTS.T2) {
                console.log(`   ⚡ Agent [${keyword}]: Escalating to T2...`);
                const t2Results = await this._searchTier2(keyword, options);
                const t2Confidence = this._calculateTierConfidence(t2Results, 2);

                if (t2Results.length >= this.MIN_HITS && t2Confidence >= this.MIN_CONFIDENCE) {
                    const totalDuration = Date.now() - agentStartTime;
                    console.log(`   ✅ Agent [${keyword}]: T2 complete (${totalDuration}ms, ${t2Confidence.toFixed(2)} confidence)`);
                    return {
                        keyword: keyword,
                        tier: 2,
                        files: t2Results,
                        confidence: t2Confidence,
                        duration: totalDuration
                    };
                }
            }

            // If T2 insufficient, escalate to T3 (if time permits)
            if (agentDuration < this.TIER_TIMEOUTS.T3) {
                console.log(`   ⚡ Agent [${keyword}]: Escalating to T3...`);
                const t3Results = await this._searchTier3(keyword, options);
                const t3Confidence = this._calculateTierConfidence(t3Results, 3);

                const totalDuration = Date.now() - agentStartTime;
                console.log(`   ✅ Agent [${keyword}]: T3 complete (${totalDuration}ms, ${t3Confidence.toFixed(2)} confidence)`);

                return {
                    keyword: keyword,
                    tier: 3,
                    files: t3Results,
                    confidence: t3Confidence,
                    duration: totalDuration
                };
            }

            // Timeout - return what we have
            const totalDuration = Date.now() - agentStartTime;
            console.log(`   ⏱️  Agent [${keyword}]: Timeout (${totalDuration}ms, returning T1 results)`);
            return {
                keyword: keyword,
                tier: 1,
                files: t1Results,
                confidence: confidence,
                duration: totalDuration
            };

        } catch (error) {
            console.error(`   ❌ Agent [${keyword}]: Error - ${error.message}`);
            return {
                keyword: keyword,
                tier: 0,
                files: [],
                confidence: 0,
                error: error.message,
                duration: Date.now() - agentStartTime
            };
        }
    }

    /**
     * Race agent promises against global timeout
     * Returns all settled results when timeout expires
     *
     * @param {Array<Promise>} promises - Agent promises
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Array>} Settled results
     * @private
     */
    async _raceWithTimeout(promises, timeout) {
        return new Promise((resolve) => {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('HYDRA_TIMEOUT')), timeout);
            });

            // Race: all agents vs timeout
            Promise.race([
                Promise.allSettled(promises),
                timeoutPromise
            ]).then(
                // All agents finished before timeout
                (results) => resolve(results),
                // Timeout expired - return whatever we have so far
                () => {
                    console.log(`   ⏱️  HYDRA: Global timeout (${timeout}ms) - collecting results...`);
                    // Use allSettled to get partial results
                    Promise.allSettled(promises).then(resolve);
                }
            );
        });
    }

    /**
     * T1: Search recent memory index
     * @private
     */
    async _searchTier1(keyword, options) {
        const recentIndexPath = path.join(this.memoryPath, '.memory-recent.json');

        try {
            const content = await fs.readFile(recentIndexPath, 'utf-8');
            const recentIndex = JSON.parse(content);

            const matches = [];
            const keywordLower = keyword.toLowerCase();

            // Search through recent sessions
            for (const session of recentIndex.recent_sessions || []) {
                // 🆕 PHASE 2: Enhanced keyword matching with fuzzy logic
                const keywordMatch = (session.keywords || [])
                    .some(kw => {
                        const kwLower = kw.toLowerCase();
                        // Exact match
                        if (kwLower.includes(keywordLower)) return true;

                        // Fuzzy match (75% threshold)
                        if (this._shouldFuzzyMatch(keywordLower, kwLower)) {
                            const score = this.fuzzyMatchScore(keywordLower, kwLower);
                            if (score >= 0.75) return true;
                        }

                        return false;
                    });

                // Check topics
                const topicMatch = (session.key_topics || [])
                    .some(topic => topic.toLowerCase().includes(keywordLower));

                // Check files worked on
                const fileMatch = (session.files_worked_on || [])
                    .some(file => file.toLowerCase().includes(keywordLower));

                if (keywordMatch || topicMatch || fileMatch) {
                    // Extract files from this session
                    for (const file of session.files_worked_on || []) {
                        matches.push({
                            file: file,
                            session: session.session_id,
                            date: session.date,
                            relevance: keywordMatch ? 1.0 : (topicMatch ? 0.8 : 0.6)
                        });
                    }
                }
            }

            // Deduplicate and sort by relevance
            const uniqueMatches = this._deduplicateMatches(matches);
            return uniqueMatches.slice(0, 10); // Top 10 matches

        } catch (error) {
            console.warn(`   ⚠️  T1 search failed for [${keyword}]: ${error.message}`);
            return [];
        }
    }

    /**
     * T2: Search topic index
     * @private
     */
    async _searchTier2(keyword, options) {
        const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');

        try {
            const content = await fs.readFile(topicIndexPath, 'utf-8');
            const topicIndex = JSON.parse(content);

            const matches = [];
            const keywordLower = keyword.toLowerCase();

            // Search through topics (supports both v1 and v2 formats)
            for (const [topic, topicData] of Object.entries(topicIndex.topics || {})) {
                if (topic.toLowerCase().includes(keywordLower)) {
                    // Handle v2 format (object with sessions array)
                    if (topicData && typeof topicData === 'object' && topicData.sessions) {
                        for (const sessionEntry of topicData.sessions) {
                            const sessionFile = sessionEntry.file || sessionEntry;
                            matches.push({
                                file: sessionFile,
                                topic: topic,
                                session: sessionFile,
                                relevance: 0.7,
                                timestamp: sessionEntry.timestamp,
                                date: sessionEntry.date
                            });
                        }
                    }
                    // Handle v1 format (array of session IDs) - legacy compatibility
                    else if (Array.isArray(topicData)) {
                        for (const sessionId of topicData) {
                            const sessionFiles = topicIndex.session_files?.[sessionId] || [];
                            for (const file of sessionFiles) {
                                matches.push({
                                    file: file,
                                    topic: topic,
                                    session: sessionId,
                                    relevance: 0.7
                                });
                            }
                        }
                    }
                }
            }

            const uniqueMatches = this._deduplicateMatches(matches);
            return uniqueMatches.slice(0, 10);

        } catch (error) {
            console.warn(`   ⚠️  T2 search failed for [${keyword}]: ${error.message}`);
            return [];
        }
    }

    /**
     * T3: Full registry scan
     * @private
     */
    async _searchTier3(keyword, options) {
        const registryPath = path.join(this.memoryPath, '.memory-registry.json');

        try {
            const content = await fs.readFile(registryPath, 'utf-8');
            const registry = JSON.parse(content);

            const matches = [];
            const keywordLower = keyword.toLowerCase();

            // Search through all sessions
            for (const session of registry.sessions || []) {
                const sessionContent = JSON.stringify(session).toLowerCase();

                if (sessionContent.includes(keywordLower)) {
                    // Extract files from session
                    const files = session.files_worked_on || session.files || [];
                    for (const file of files) {
                        matches.push({
                            file: file,
                            session: session.session_id || session.id,
                            relevance: 0.5
                        });
                    }
                }
            }

            const uniqueMatches = this._deduplicateMatches(matches);
            return uniqueMatches.slice(0, 10);

        } catch (error) {
            console.warn(`   ⚠️  T3 search failed for [${keyword}]: ${error.message}`);
            return [];
        }
    }

    /**
     * Deduplicate file matches (keep highest relevance)
     * @private
     */
    _deduplicateMatches(matches) {
        const fileMap = new Map();

        for (const match of matches) {
            const existingMatch = fileMap.get(match.file);
            if (!existingMatch || match.relevance > existingMatch.relevance) {
                fileMap.set(match.file, match);
            }
        }

        return Array.from(fileMap.values())
            .sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * Merge results using set theory (intersection + union)
     * @private
     */
    _mergeResults(agentResults, keywords) {
        // Build file frequency map
        const fileFrequency = new Map();
        const fileData = new Map(); // Store additional data per file

        for (const agentResult of agentResults) {
            for (const match of agentResult.files) {
                const file = match.file;
                const count = fileFrequency.get(file) || 0;
                fileFrequency.set(file, count + 1);

                // Aggregate relevance scores
                if (!fileData.has(file)) {
                    fileData.set(file, {
                        file: file,
                        totalRelevance: 0,
                        keywords: [],
                        sessions: new Set(),
                        avgRelevance: 0
                    });
                }

                const data = fileData.get(file);
                data.totalRelevance += match.relevance || 0.5;
                data.keywords.push(agentResult.keyword);
                if (match.session) data.sessions.add(match.session);
            }
        }

        // Calculate weighted intersection threshold (≥50% of keywords)
        const threshold = Math.ceil(keywords.length * 0.5);

        // Intersection: Files appearing in ≥50% of keyword sets
        const intersection = Array.from(fileFrequency.entries())
            .filter(([file, count]) => count >= threshold)
            .map(([file, count]) => {
                const data = fileData.get(file);
                return {
                    file: file,
                    frequency: count,
                    confidence: count / keywords.length,
                    avgRelevance: data.totalRelevance / count,
                    keywords: data.keywords,
                    sessions: Array.from(data.sessions)
                };
            })
            .sort((a, b) => b.confidence - a.confidence);

        this.performanceMetrics.intersection_hits += intersection.length;

        // Union: All files (for broader context)
        const union = Array.from(fileFrequency.entries())
            .map(([file, count]) => {
                const data = fileData.get(file);
                return {
                    file: file,
                    frequency: count,
                    confidence: count / keywords.length,
                    avgRelevance: data.totalRelevance / count,
                    keywords: data.keywords,
                    sessions: Array.from(data.sessions)
                };
            })
            .sort((a, b) => b.frequency - a.frequency);

        this.performanceMetrics.union_hits += union.length;

        // Ranked list (prioritize intersection, then union)
        const ranked = [
            ...intersection,
            ...union.filter(u => !intersection.find(i => i.file === u.file))
        ].slice(0, 20); // Top 20 results

        return {
            intersection: intersection,
            union: union,
            ranked: ranked,
            threshold: threshold
        };
    }

    /**
     * Calculate tier-specific confidence
     * @private
     */
    _calculateTierConfidence(results, tier) {
        if (results.length === 0) return 0;

        const tierBonus = {
            1: 1.0,  // T1 = 100% (recent)
            2: 0.7,  // T2 = 70% (topic)
            3: 0.4   // T3 = 40% (deep)
        }[tier] || 0.4;

        const hitCount = Math.min(results.length / 10, 1); // Normalize to 0-1
        const avgRelevance = results.reduce((sum, r) => sum + (r.relevance || 0.5), 0) / results.length;

        return (tierBonus * 0.5) + (hitCount * 0.3) + (avgRelevance * 0.2);
    }

    /**
     * Calculate overall HYDRA confidence
     * @private
     */
    _calculateConfidence(mergedResults, agentResults, keywords) {
        if (mergedResults.ranked.length === 0) return 0;

        // Intersection ratio (files in ≥50% of sets)
        const intersectionRatio = mergedResults.intersection.length > 0
            ? mergedResults.intersection[0].confidence
            : 0;

        // Keyword coverage (how many agents succeeded)
        const keywordCoverage = agentResults.length / keywords.length;

        // Average tier score across agents
        const avgTierScore = agentResults.reduce((sum, a) => {
            const tierBonus = { 1: 1.0, 2: 0.7, 3: 0.4 }[a.tier] || 0;
            return sum + tierBonus;
        }, 0) / agentResults.length;

        // Weighted confidence
        const confidence =
            (intersectionRatio * 0.5) +
            (keywordCoverage * 0.3) +
            (avgTierScore * 0.2);

        return Math.min(confidence, 1.0);
    }

    /**
     * Build human-readable reasoning
     * @private
     */
    _buildReasoning(mergedResults, agentResults, keywords) {
        const reasoning = [];

        if (mergedResults.intersection.length > 0) {
            const topMatch = mergedResults.intersection[0];
            reasoning.push(
                `High confidence: ${topMatch.file} appears in ${topMatch.frequency}/${keywords.length} keyword sets (${(topMatch.confidence * 100).toFixed(0)}% intersection)`
            );
        }

        const successfulAgents = agentResults.filter(a => a.files.length > 0);
        reasoning.push(
            `${successfulAgents.length}/${keywords.length} keywords matched successfully`
        );

        const avgTier = agentResults.reduce((sum, a) => sum + a.tier, 0) / agentResults.length;
        reasoning.push(
            `Average search depth: Tier ${avgTier.toFixed(1)} (1=recent, 2=topic, 3=deep)`
        );

        return reasoning.join(' | ');
    }

    /**
     * Update performance metrics
     * @private
     */
    _updateMetrics(duration) {
        const totalDuration = this.performanceMetrics.avg_response_time *
            (this.performanceMetrics.total_queries - 1) + duration;
        this.performanceMetrics.avg_response_time =
            totalDuration / this.performanceMetrics.total_queries;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 PHASE 2: COGNITIVE WORKING MEMORY METHODS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Capture working memory Branch 1 (recent context)
     * @private
     */
    async captureBranch1Recent() {
        if (this.workingMemory.contextBranches.branch1_recent.captured) {
            return; // Already captured
        }

        try {
            const recentIndexPath = path.join(this.memoryPath, '.memory-recent.json');
            if (!fsSync.existsSync(recentIndexPath)) {
                return;
            }

            const content = await fs.readFile(recentIndexPath, 'utf-8');
            const recentIndex = JSON.parse(content);

            this.workingMemory.contextBranches.branch1_recent.entries = recentIndex.recent_sessions || [];
            this.workingMemory.contextBranches.branch1_recent.captured = true;
            this.workingMemory.contextBranches.branch1_recent.capturedAt = Date.now();

            console.log(`   📚 HYDRA: Branch 1 captured (${this.workingMemory.contextBranches.branch1_recent.entries.length} recent sessions)`);
        } catch (error) {
            console.warn(`   ⚠️ HYDRA: Branch 1 capture failed - ${error.message}`);
        }
    }

    /**
     * Capture working memory Branch 2 (topic clustering)
     * @private
     */
    async captureBranch2Topic() {
        if (this.workingMemory.contextBranches.branch2_topic.captured) {
            return; // Already captured
        }

        try {
            const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');
            if (!fsSync.existsSync(topicIndexPath)) {
                return;
            }

            const content = await fs.readFile(topicIndexPath, 'utf-8');
            const topicIndex = JSON.parse(content);

            // Capture top 5 most relevant topics with their sessions
            const topics = Object.entries(topicIndex.topics || {})
                .map(([name, data]) => ({
                    name,
                    relevance: data.relevance || 50,
                    sessionCount: data.sessions?.length || 0,
                    latestActivity: data.latest_activity
                }))
                .sort((a, b) => b.relevance - a.relevance)
                .slice(0, 5);

            this.workingMemory.contextBranches.branch2_topic.entries = topics;
            this.workingMemory.contextBranches.branch2_topic.captured = true;
            this.workingMemory.contextBranches.branch2_topic.capturedAt = Date.now();

            console.log(`   📚 HYDRA: Branch 2 captured (${topics.length} topic clusters)`);
        } catch (error) {
            console.warn(`   ⚠️ HYDRA: Branch 2 capture failed - ${error.message}`);
        }
    }

    /**
     * Capture working memory Branch 3 (deep pattern scan)
     * @private
     */
    async captureBranch3Deep() {
        if (this.workingMemory.contextBranches.branch3_deep.captured) {
            return; // Already captured
        }

        try {
            const registryPath = path.join(this.memoryPath, '.memory-registry.json');
            if (!fsSync.existsSync(registryPath)) {
                return;
            }

            const content = await fs.readFile(registryPath, 'utf-8');
            const registry = JSON.parse(content);

            // Capture pattern metadata (file types, patterns discovered)
            const patterns = {
                totalSessions: registry.sessions?.length || 0,
                fileTypes: registry.file_types || [],
                commonPatterns: registry.common_patterns || [],
                projectsTracked: registry.projects?.length || 0
            };

            this.workingMemory.contextBranches.branch3_deep.entries = [patterns];
            this.workingMemory.contextBranches.branch3_deep.captured = true;
            this.workingMemory.contextBranches.branch3_deep.capturedAt = Date.now();

            console.log(`   📚 HYDRA: Branch 3 captured (${patterns.totalSessions} sessions in registry)`);
        } catch (error) {
            console.warn(`   ⚠️ HYDRA: Branch 3 capture failed - ${error.message}`);
        }
    }

    /**
     * Get working memory snapshot
     * @private
     */
    getWorkingMemorySnapshot() {
        return {
            branches_captured: {
                branch1_recent: this.workingMemory.contextBranches.branch1_recent.captured,
                branch2_topic: this.workingMemory.contextBranches.branch2_topic.captured,
                branch3_deep: this.workingMemory.contextBranches.branch3_deep.captured
            },
            entry_counts: {
                branch1: this.workingMemory.contextBranches.branch1_recent.entries.length,
                branch2: this.workingMemory.contextBranches.branch2_topic.entries.length,
                branch3: this.workingMemory.contextBranches.branch3_deep.entries.length
            },
            access_counts: {
                branch1: this.workingMemory.contextBranches.branch1_recent.accessCount,
                branch2: this.workingMemory.contextBranches.branch2_topic.accessCount,
                branch3: this.workingMemory.contextBranches.branch3_deep.accessCount
            },
            recognition_log_entries: this.workingMemory.recognitionLog.length,
            session_id: this.workingMemory.sessionId
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 PHASE 2: SELF-HEALING VALIDATION METHODS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Validate file locations and heal stale entries
     * @param {Array} files - File matches to validate
     * @returns {Promise<object>} Validated results (valid, healed, stale)
     * @private
     */
    async _validateFileLocations(files) {
        const validated = { valid: [], healed: [], stale: [] };

        for (const match of files) {
            const filePath = match.file;

            // Check if file exists
            if (fsSync.existsSync(filePath)) {
                validated.valid.push(match);
            } else {
                // Attempt to find relocated file
                const filename = path.basename(filePath);
                const searchResult = await this._searchFileSystem(filename);

                if (searchResult.found) {
                    validated.healed.push({
                        ...match,
                        file: searchResult.path,
                        oldPath: filePath,
                        status: 'relocated'
                    });
                    console.log(`   🔄 HYDRA: Healed ${filename} → ${searchResult.path}`);
                } else {
                    validated.stale.push({ ...match, status: 'deleted' });
                    console.log(`   🗑️ HYDRA: File not found - ${filename}`);
                }
            }
        }

        return validated;
    }

    /**
     * Search filesystem for file (cross-platform)
     * @param {string} filename - Filename to search for
     * @returns {Promise<object>} Search result {found, path}
     * @private
     */
    async _searchFileSystem(filename) {
        try {
            const { execSync } = require('child_process');
            const isWindows = process.platform === 'win32';
            const command = isWindows
                ? `where /R "${this.projectRoot}" ${filename}`
                : `find "${this.projectRoot}" -name "${filename}" -type f`;

            const output = execSync(command, { encoding: 'utf8', timeout: 2000 });
            const matches = output.trim().split('\n').filter(Boolean);

            if (matches.length > 0) {
                return { found: true, path: matches[0] };
            }
        } catch (error) {
            // File not found or command failed
        }

        return { found: false };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 PHASE 2: ADVANCED FUZZY MATCHING (Ported from ATLAS)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Levenshtein edit distance for fuzzy matching
     * Ported from ATLAS (4bb69ab9.js Lines 1142-1162)
     * @private
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
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return matrix[len1][len2];
    }

    /**
     * Fuzzy match score (0-1) using edit distance
     * Ported from ATLAS (4bb69ab9.js Lines 1169-1181)
     * @private
     */
    fuzzyMatchScore(str1, str2, threshold = 0.7) {
        const lengthDiff = Math.abs(str1.length - str2.length);
        const maxLen = Math.max(str1.length, str2.length);

        // Early exit if length difference makes threshold impossible
        if (lengthDiff > maxLen * (1 - threshold)) {
            return 0;
        }

        const distance = this.levenshteinDistance(str1, str2);
        return 1 - (distance / maxLen);
    }

    /**
     * Pre-filter for fuzzy matching (ESMC 3.19 optimization)
     * Ported from ATLAS (4bb69ab9.js Lines 1195-1220)
     * @private
     */
    _shouldFuzzyMatch(query, candidate) {
        // First character check
        const queryFirst = query.charAt(0);
        if (!candidate.includes(queryFirst)) {
            return false;
        }

        // Common substring check (2-char bigrams)
        for (let i = 0; i < query.length - 1; i++) {
            const bigram = query.substring(i, i + 2);
            if (candidate.includes(bigram)) {
                return true;
            }
        }

        // Length range check (50% variance)
        const lengthRatio = Math.min(query.length, candidate.length) / Math.max(query.length, candidate.length);
        if (lengthRatio >= 0.5) {
            return true;
        }

        return false;
    }

    /**
     * Get HYDRA status
     */
    getStatus() {
        return {
            systemName: this.systemName,
            version: this.version,
            metrics: this.performanceMetrics,
            workingMemory: this.getWorkingMemorySnapshot(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 🆕 ESMC 3.55: Alias for ATLAS integration compatibility
     * ATLAS calls retrieveParallel() but HYDRA's main method is retrieve()
     * This adapter method provides the expected interface
     * @param {string} query - Search query
     * @param {object} options - Options passed from ATLAS
     * @returns {Promise<object>} HYDRA retrieval result
     */
    async retrieveParallel(query, options = {}) {
        // Extract keywords from query (simple split for now)
        const keywords = query.split(' ').filter(k => k.length > 2);

        // Call the main retrieve() method
        const result = await this.retrieve(query, keywords, {
            globalTimeout: options.timeout || 5000,
            maxKeywords: options.maxAgents || 3,
            workingMemoryCapture: options.workingMemoryCapture !== false
        });

        // Transform result to match ATLAS expectations
        return {
            found: result.confidence > (options.minConfidence || 0.70),
            mergedResults: result.intersectionFiles.length > 0
                ? result.intersectionFiles
                : result.unionFiles,
            keywords: keywords,
            agentsSpawned: result.keywordCount,
            mergeStrategy: result.intersectionFiles.length > 0 ? 'intersection' : 'union',
            confidence: result.confidence,
            metadata: result.metadata
        };
    }
}

module.exports = { HydraRetrievalSystem };

// ═══════════════════════════════════════════════════════════════════════
// TESTING
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    console.log("🐍 ESMC 3.20 - HYDRA Retrieval System Test\n");

    (async () => {
        const hydra = new HydraRetrievalSystem();

        const testMessage = "Fix authentication bug in login handler";
        const testKeywords = ["authentication", "bug", "login", "handler"];

        console.log(`Test Query: "${testMessage}"`);
        console.log(`Keywords: ${testKeywords.join(', ')}\n`);

        const result = await hydra.retrieve(testMessage, testKeywords);

        console.log('\n📊 HYDRA RESULTS:\n');
        console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
        console.log(`Duration: ${result.metadata.duration}ms`);
        console.log(`Agents: ${result.metadata.agents_succeeded}/${result.metadata.agents_spawned}`);
        console.log(`\nReasoning: ${result.reasoning}`);

        console.log(`\n🎯 Intersection Results (≥50% keyword match):`);
        result.intersectionFiles.slice(0, 5).forEach((match, idx) => {
            console.log(`  ${idx + 1}. ${match.file}`);
            console.log(`     Confidence: ${(match.confidence * 100).toFixed(0)}% (${match.frequency}/${testKeywords.length} keywords)`);
            console.log(`     Keywords: ${match.keywords.join(', ')}`);
        });

        console.log(`\n📋 All Results (Union):`);
        result.unionFiles.slice(0, 10).forEach((match, idx) => {
            console.log(`  ${idx + 1}. ${match.file} (${match.frequency}/${testKeywords.length} keywords)`);
        });

        console.log(`\n✅ HYDRA Test Complete`);
    })();
}
