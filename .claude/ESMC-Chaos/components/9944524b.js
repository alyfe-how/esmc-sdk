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
/**
 * ESMC 3.69 - AEGIS PRECEDENT REGISTRAR
 *
 * Auto-registration module for solution precedents from successful problem resolutions
 * Completes ATHENA 3.69 write path architecture
 *
 * Architecture: AEGIS memory system component
 * Parent: ECHELON intelligence network
 * Token Cost: 0 (subprocess execution only)
 *
 * Purpose: Auto-write solution precedents AS THEY HAPPEN (when user confirms success)
 * Creates self-learning system with zero manual intervention
 *
 * Trigger: User confirmation detected (keywords: works, validated, confirmed, success, fixed, solved)
 * Integration: SCRIBE conversation tracking (b8c4eb7e.js)
 *
 * @module AEGIS_PRECEDENT_REGISTRAR
 * @version 3.69.0
 * @requires .esmc-precedent-registry.json (dual-index storage)
 */

const fs = require('fs');
const path = require('path');

class AegisPrecedentRegistrar {
    constructor(options = {}) {
        this.registryPath = options.registryPath || '.claude/.esmc-precedent-registry.json';
        this.ttlDays = options.ttlDays || 30;
        this.maxTotalEntries = options.maxTotalEntries || 100;
        this.maxRecentEntries = options.maxRecentEntries || 10;
        this.maxImportantEntries = options.maxImportantEntries || 5;

        // Confirmation keywords (user validation patterns)
        this.confirmationKeywords = [
            'works', 'working', 'worked',
            'validated', 'validation confirmed',
            'confirmed', 'confirm',
            'success', 'successful', 'successfully',
            'fixed', 'fix complete',
            'solved', 'solution works',
            'perfect', 'perfectly',
            'complete', 'completed',
            'verified', 'verification passed',
            'tested', 'tests pass', 'all tests pass'
        ];

        this.registry = null;
        this.initialized = false;
    }

    /**
     * Initialize registrar by loading registry
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            this.registry = this._loadRegistry();
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('⚠️ PRECEDENT REGISTRAR initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Detect user confirmation from message
     *
     * CRITICAL: This is the TRIGGER DETECTION that enables auto-registration
     * Called by SCRIBE during conversation tracking
     *
     * @param {string} userMessage - User's message
     * @returns {Object} Detection result
     */
    detectConfirmation(userMessage) {
        const messageLower = userMessage.toLowerCase();
        const detectedKeywords = [];
        let confidence = 0;

        // Check for confirmation keywords
        for (const keyword of this.confirmationKeywords) {
            if (messageLower.includes(keyword)) {
                detectedKeywords.push(keyword);
                confidence += 0.15; // Each keyword adds 15% confidence
            }
        }

        // Confidence capped at 100%
        confidence = Math.min(confidence, 1.0);

        return {
            detected: detectedKeywords.length > 0,
            confidence: confidence,
            keywords: detectedKeywords,
            shouldRegister: confidence >= 0.30 // 30% threshold = 2+ keywords
        };
    }

    /**
     * Register solution precedent from successful resolution
     *
     * CRITICAL: This is the WRITE PATH that completes ATHENA 3.69
     * Triggered automatically when user confirms solution worked
     *
     * @param {Object} precedentData - Solution data from successful session
     * @param {Object} precedentData.problem - Problem that was solved
     * @param {Object} precedentData.solution - Solution that worked
     * @param {Object} precedentData.confirmation - User confirmation data
     * @param {Object} precedentData.session_context - Current session metadata
     * @returns {Object} Registration result
     */
    async registerPrecedent(precedentData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Build precedent entry from confirmation data
            const precedentEntry = this._buildPrecedentEntry(precedentData);

            // Add to recent index (FIFO)
            this.registry.indices.recent.precedents.unshift(precedentEntry);

            // Prune recent to max
            if (this.registry.indices.recent.precedents.length > this.maxRecentEntries) {
                this.registry.indices.recent.precedents =
                    this.registry.indices.recent.precedents.slice(0, this.maxRecentEntries);
            }

            // Add to important index if impact warrants
            if (precedentEntry.impact_score >= 70) {
                this._addToImportantIndex(precedentEntry);
            }

            // Update metrics
            this.registry.performance_metrics.total_registered++;
            this._updateMetrics();

            // Prune expired entries
            this._pruneExpired();

            // Save registry
            this._saveRegistry();

            // Update registry metadata
            this.registry.last_updated = new Date().toISOString();

            return {
                success: true,
                entry: precedentEntry,
                total_precedents: this._getTotalPrecedents(),
                message: `Precedent registered: ${precedentEntry.problem_signature.problem_type} (impact: ${precedentEntry.impact_score})`
            };

        } catch (error) {
            console.error('❌ PRECEDENT REGISTRAR failed to register:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Build precedent entry from confirmation data
     *
     * @private
     * @param {Object} precedentData - Raw precedent data
     * @returns {Object} Formatted precedent entry
     */
    _buildPrecedentEntry(precedentData) {
        const {
            problem,
            solution,
            confirmation,
            session_context,
            metadata
        } = precedentData;

        return {
            timestamp: new Date().toISOString(),
            session_id: session_context.session_id || this._generateSessionId(),
            rank: session_context.rank || null,
            problem_signature: {
                problem_type: this._inferProblemType(problem),
                technical_context: problem.keywords || problem.technical_context || [],
                problem_description: this._truncate(problem.description || '', 300),
                complexity_score: problem.complexity_score || 50
            },
            solution: {
                approach: this._truncate(solution.approach || '', 300),
                implementation_details: this._truncate(solution.implementation_details || '', 500),
                verification_method: solution.verification_method || 'User confirmation',
                outcome: this._truncate(confirmation.user_message || 'Solution confirmed working', 200)
            },
            confirmation_data: {
                confirmation_keywords: confirmation.keywords || [],
                user_message: this._truncate(confirmation.user_message || '', 200),
                confidence: confirmation.confidence || 0.5
            },
            metadata: {
                waves_deployed: metadata?.waves_deployed || 0,
                files_modified: metadata?.files_modified || 0,
                lines_changed: metadata?.lines_changed || 0,
                execution_time_ms: metadata?.execution_time_ms || 0
            },
            impact_score: this._calculateImpactScore(problem, solution, metadata),
            registration_source: 'user_confirmation'
        };
    }

    /**
     * Add precedent to important index (impact-ranked)
     *
     * @private
     * @param {Object} precedentEntry - Precedent entry to add
     */
    _addToImportantIndex(precedentEntry) {
        // Add to important index
        this.registry.indices.important.precedents.push(precedentEntry);

        // Sort by impact (descending)
        this.registry.indices.important.precedents.sort(
            (a, b) => b.impact_score - a.impact_score
        );

        // Prune to max
        if (this.registry.indices.important.precedents.length > this.maxImportantEntries) {
            this.registry.indices.important.precedents =
                this.registry.indices.important.precedents.slice(0, this.maxImportantEntries);
        }
    }

    /**
     * Calculate impact score for ranking
     *
     * @private
     * @param {Object} problem - Problem data
     * @param {Object} solution - Solution data
     * @param {Object} metadata - Execution metadata
     * @returns {number} Impact score (0-100)
     */
    _calculateImpactScore(problem, solution, metadata = {}) {
        let score = 0;

        // Problem complexity (max 40 points)
        score += (problem.complexity_score || 50) * 0.4;

        // Solution scope - files modified (max 20 points)
        const filesModified = metadata.files_modified || 0;
        score += Math.min(filesModified * 2, 20);

        // Solution scope - lines changed (max 20 points)
        const linesChanged = metadata.lines_changed || 0;
        score += Math.min(linesChanged / 10, 20);

        // Waves deployed (ESMC deployments = higher impact, max 20 points)
        const wavesDeployed = metadata.waves_deployed || 0;
        score += Math.min(wavesDeployed * 2, 20);

        return Math.min(Math.round(score), 100);
    }

    /**
     * Infer problem type from problem data
     *
     * @private
     * @param {Object} problem - Problem data
     * @returns {string} Problem type
     */
    _inferProblemType(problem) {
        const keywords = (problem.keywords || problem.technical_context || [])
            .join(' ')
            .toLowerCase();

        if (keywords.includes('sync') || keywords.includes('injection')) {
            return 'sync_injection';
        } else if (keywords.includes('api') || keywords.includes('integration')) {
            return 'api_integration';
        } else if (keywords.includes('state') || keywords.includes('data')) {
            return 'state_management';
        } else if (keywords.includes('auth') || keywords.includes('permission')) {
            return 'authentication';
        } else if (keywords.includes('performance') || keywords.includes('optimization')) {
            return 'performance';
        } else if (keywords.includes('test') || keywords.includes('validation')) {
            return 'testing';
        } else if (keywords.includes('ui') || keywords.includes('ux')) {
            return 'user_interface';
        } else {
            return problem.problem_type || 'general';
        }
    }

    /**
     * Prune expired entries (TTL-based)
     *
     * @private
     */
    _pruneExpired() {
        const now = new Date();
        const ttlMs = this.ttlDays * 24 * 60 * 60 * 1000;
        let prunedCount = 0;

        // Prune recent index
        const recentBefore = this.registry.indices.recent.precedents.length;
        this.registry.indices.recent.precedents = this.registry.indices.recent.precedents.filter(p => {
            const age = now - new Date(p.timestamp);
            return age < ttlMs;
        });
        prunedCount += recentBefore - this.registry.indices.recent.precedents.length;

        // Prune important index
        const importantBefore = this.registry.indices.important.precedents.length;
        this.registry.indices.important.precedents = this.registry.indices.important.precedents.filter(p => {
            const age = now - new Date(p.timestamp);
            return age < ttlMs;
        });
        prunedCount += importantBefore - this.registry.indices.important.precedents.length;

        // Update metrics
        if (prunedCount > 0) {
            this.registry.performance_metrics.total_pruned += prunedCount;
            this.registry.maintenance.last_pruned = now.toISOString();
        }

        // Count-based pruning (if total exceeds max)
        const totalPrecedents = this._getTotalPrecedents();
        if (totalPrecedents > this.maxTotalEntries) {
            const excess = totalPrecedents - this.maxTotalEntries;
            // Remove oldest from recent index
            this.registry.indices.recent.precedents =
                this.registry.indices.recent.precedents.slice(0, -excess);
            this.registry.performance_metrics.total_pruned += excess;
        }
    }

    /**
     * Update performance metrics
     *
     * @private
     */
    _updateMetrics() {
        const allPrecedents = [
            ...this.registry.indices.recent.precedents,
            ...this.registry.indices.important.precedents
        ];

        if (allPrecedents.length === 0) return;

        // Average impact
        const avgImpact = allPrecedents.reduce((sum, p) => sum + p.impact_score, 0) / allPrecedents.length;
        this.registry.performance_metrics.avg_impact_score = Math.round(avgImpact);

        // Most common problem type
        const typeCounts = {};
        allPrecedents.forEach(p => {
            const type = p.problem_signature.problem_type;
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const mostCommon = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0];

        this.registry.performance_metrics.most_common_problem_type = mostCommon
            ? `${mostCommon[0]} (${mostCommon[1]} occurrences)`
            : null;
    }

    /**
     * Get total precedent count (deduped across indices)
     *
     * @private
     * @returns {number} Total unique precedents
     */
    _getTotalPrecedents() {
        const recent = this.registry.indices.recent.precedents.length;
        const important = this.registry.indices.important.precedents.length;

        // Simple count (indices may overlap, but that's acceptable for pruning logic)
        return recent + important;
    }

    /**
     * Generate session ID if not provided
     *
     * @private
     * @returns {string} Session ID
     */
    _generateSessionId() {
        const date = new Date().toISOString().split('T')[0];
        return `${date}-precedent-registration`;
    }

    /**
     * Truncate string to max length
     *
     * @private
     * @param {string} str - String to truncate
     * @param {number} maxLen - Max length
     * @returns {string} Truncated string
     */
    _truncate(str, maxLen) {
        if (str.length <= maxLen) return str;
        return str.substring(0, maxLen - 3) + '...';
    }

    /**
     * Load registry from file
     *
     * @private
     * @returns {Object} Registry data
     */
    _loadRegistry() {
        try {
            const registryPath = path.resolve(this.registryPath);
            if (!fs.existsSync(registryPath)) {
                console.warn('⚠️ PRECEDENT REGISTRAR: Registry not found, creating new registry');
                return this._createDefaultRegistry();
            }

            const data = fs.readFileSync(registryPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('⚠️ PRECEDENT REGISTRAR: Failed to load registry:', error.message);
            return this._createDefaultRegistry();
        }
    }

    /**
     * Save registry to file
     *
     * @private
     */
    _saveRegistry() {
        try {
            const registryPath = path.resolve(this.registryPath);
            const dir = path.dirname(registryPath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(
                registryPath,
                JSON.stringify(this.registry, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('❌ PRECEDENT REGISTRAR: Failed to save registry:', error.message);
            throw error;
        }
    }

    /**
     * Create default registry structure
     *
     * @private
     * @returns {Object} Default registry
     */
    _createDefaultRegistry() {
        return {
            version: '1.0.0',
            system: 'AEGIS',
            component: 'PRECEDENT_REGISTRAR',
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            description: 'Auto-registered solution precedents from successful resolutions',
            indices: {
                recent: {
                    max_entries: this.maxRecentEntries,
                    rotation_policy: 'FIFO (pure temporal)',
                    purpose: 'Recent solutions',
                    precedents: []
                },
                important: {
                    max_entries: this.maxImportantEntries,
                    rotation_policy: 'Impact ranking',
                    purpose: 'High-impact solutions',
                    precedents: []
                }
            },
            maintenance: {
                ttl_days: this.ttlDays,
                max_total_entries: this.maxTotalEntries,
                pruning_strategy: 'Age-based (>30 days) OR count-based (>100 total)',
                last_pruned: null
            },
            performance_metrics: {
                total_registered: 0,
                total_pruned: 0,
                avg_impact_score: 0,
                most_common_problem_type: null,
                reuse_count: 0
            }
        };
    }

    /**
     * Increment reuse counter (when CSPM matches precedent)
     *
     * @param {string} sessionId - Session ID of reused precedent
     */
    async incrementReuse(sessionId) {
        if (!this.initialized) {
            await this.initialize();
        }

        this.registry.performance_metrics.reuse_count++;
        this._saveRegistry();
    }

    /**
     * Get registry statistics
     *
     * @returns {Object} Registry stats
     */
    getStats() {
        if (!this.initialized) {
            return { error: 'Registrar not initialized' };
        }

        return {
            recent_count: this.registry.indices.recent.precedents.length,
            important_count: this.registry.indices.important.precedents.length,
            total_registered: this.registry.performance_metrics.total_registered,
            total_pruned: this.registry.performance_metrics.total_pruned,
            reuse_count: this.registry.performance_metrics.reuse_count,
            avg_impact: this.registry.performance_metrics.avg_impact_score,
            most_common_problem: this.registry.performance_metrics.most_common_problem_type,
            last_updated: this.registry.last_updated
        };
    }
}

module.exports = AegisPrecedentRegistrar;
