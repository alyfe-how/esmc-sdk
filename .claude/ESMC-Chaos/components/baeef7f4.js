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
 * ESMC 3.69 - AEGIS ERROR REGISTRAR
 *
 * Auto-registration module for error signatures from PHC halt triggers
 * Completes ATHENA 3.69 write path architecture
 *
 * Architecture: AEGIS memory system component
 * Parent: ECHELON intelligence network
 * Token Cost: 0 (subprocess execution only)
 *
 * Purpose: Auto-write error signatures AS THEY HAPPEN (when PHC halts)
 * Creates self-learning system with zero manual intervention
 *
 * Trigger: PHC.evaluateHalt() returns shouldHalt = true
 * Integration: epsilon-athena-coordinator.js PHASE 0 error detection
 *
 * @module AEGIS_ERROR_REGISTRAR
 * @version 3.69.0
 * @requires .esmc-error-registry.json (dual-index storage)
 */

const fs = require('fs');
const path = require('path');

class AegisErrorRegistrar {
    constructor(options = {}) {
        this.registryPath = options.registryPath || '.claude/.esmc-error-registry.json';
        this.ttlDays = options.ttlDays || 30;
        this.maxTotalEntries = options.maxTotalEntries || 100;
        this.maxRecentEntries = options.maxRecentEntries || 10;
        this.maxCriticalEntries = options.maxCriticalEntries || 5;

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
            console.error('⚠️ ERROR REGISTRAR initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Register error signature from PHC halt trigger
     *
     * CRITICAL: This is the WRITE PATH that completes ATHENA 3.69
     * Triggered automatically when PHC.evaluateHalt() returns shouldHalt = true
     *
     * @param {Object} errorData - Error data from PHC halt checkpoint
     * @param {Object} errorData.proposal - Original ECHELON proposal
     * @param {Object} errorData.phc_decision - PHC halt decision
     * @param {Object} errorData.aesd_match - AESD error signature match
     * @param {Object} errorData.session_context - Current session metadata
     * @returns {Object} Registration result
     */
    async registerError(errorData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Build error entry from PHC data
            const errorEntry = this._buildErrorEntry(errorData);

            // Add to recent index (FIFO)
            this.registry.indices.recent.errors.unshift(errorEntry);

            // Prune recent to max
            if (this.registry.indices.recent.errors.length > this.maxRecentEntries) {
                this.registry.indices.recent.errors =
                    this.registry.indices.recent.errors.slice(0, this.maxRecentEntries);
            }

            // Add to critical index if severity warrants
            if (errorEntry.severity_score >= 85) {
                this._addToCriticalIndex(errorEntry);
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
                entry: errorEntry,
                total_errors: this._getTotalErrors(),
                message: `Error registered: ${errorEntry.error_signature.error_type} (severity: ${errorEntry.severity_score})`
            };

        } catch (error) {
            console.error('❌ ERROR REGISTRAR failed to register:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Build error entry from PHC halt data
     *
     * @private
     * @param {Object} errorData - Raw error data from PHC
     * @returns {Object} Formatted error entry
     */
    _buildErrorEntry(errorData) {
        const {
            proposal,
            phc_decision,
            aesd_match,
            session_context
        } = errorData;

        return {
            timestamp: new Date().toISOString(),
            session_id: session_context.session_id || this._generateSessionId(),
            rank: session_context.rank || null,
            error_signature: {
                error_type: this._inferErrorType(proposal, aesd_match),
                technical_patterns: proposal.keywords || [],
                root_cause: aesd_match?.root_cause || 'PHC halt triggered (no historical match)',
                failed_approach: proposal.description || proposal.approach || 'Unknown approach',
                similarity_score: aesd_match?.similarity || 0
            },
            phc_decision: {
                shouldHalt: phc_decision.shouldHalt,
                severity: phc_decision.severity,
                match_percentage: phc_decision.match_percentage || 0,
                iteration_count: phc_decision.iteration_count || 0,
                precedent_found: phc_decision.precedent_found || false
            },
            session_context: {
                project: session_context.project || 'Unknown Project',
                keywords: proposal.keywords || [],
                user_message: this._truncate(session_context.user_message || '', 200)
            },
            severity_score: this._calculateSeverityScore(phc_decision, aesd_match),
            registration_source: 'phc_halt'
        };
    }

    /**
     * Add error to critical index (severity-ranked)
     *
     * @private
     * @param {Object} errorEntry - Error entry to add
     */
    _addToCriticalIndex(errorEntry) {
        // Add to critical index
        this.registry.indices.critical.errors.push(errorEntry);

        // Sort by severity (descending)
        this.registry.indices.critical.errors.sort(
            (a, b) => b.severity_score - a.severity_score
        );

        // Prune to max
        if (this.registry.indices.critical.errors.length > this.maxCriticalEntries) {
            this.registry.indices.critical.errors =
                this.registry.indices.critical.errors.slice(0, this.maxCriticalEntries);
        }
    }

    /**
     * Calculate severity score for ranking
     *
     * @private
     * @param {Object} phc_decision - PHC halt decision
     * @param {Object} aesd_match - AESD error match
     * @returns {number} Severity score (0-100)
     */
    _calculateSeverityScore(phc_decision, aesd_match) {
        let score = 0;

        // Base severity
        if (phc_decision.severity === 'critical') {
            score += 50;
        } else if (phc_decision.severity === 'warning') {
            score += 30;
        }

        // AESD match percentage
        score += (phc_decision.match_percentage || 0) * 0.3;

        // Iteration count (repetitive failures = higher severity)
        score += Math.min((phc_decision.iteration_count || 0) * 5, 20);

        return Math.min(Math.round(score), 100);
    }

    /**
     * Infer error type from proposal and match data
     *
     * @private
     * @param {Object} proposal - ECHELON proposal
     * @param {Object} aesd_match - AESD match data
     * @returns {string} Error type
     */
    _inferErrorType(proposal, aesd_match) {
        // If historical match exists, use that error type
        if (aesd_match && aesd_match.error_type) {
            return aesd_match.error_type;
        }

        // Otherwise infer from keywords
        const keywords = (proposal.keywords || []).join(' ').toLowerCase();

        if (keywords.includes('sync') || keywords.includes('injection')) {
            return 'sync_injection';
        } else if (keywords.includes('validation') || keywords.includes('verify')) {
            return 'validation_failure';
        } else if (keywords.includes('api') || keywords.includes('request')) {
            return 'api_error';
        } else if (keywords.includes('state') || keywords.includes('data')) {
            return 'state_management';
        } else if (keywords.includes('auth') || keywords.includes('permission')) {
            return 'authentication';
        } else {
            return 'unknown';
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
        const recentBefore = this.registry.indices.recent.errors.length;
        this.registry.indices.recent.errors = this.registry.indices.recent.errors.filter(error => {
            const age = now - new Date(error.timestamp);
            return age < ttlMs;
        });
        prunedCount += recentBefore - this.registry.indices.recent.errors.length;

        // Prune critical index
        const criticalBefore = this.registry.indices.critical.errors.length;
        this.registry.indices.critical.errors = this.registry.indices.critical.errors.filter(error => {
            const age = now - new Date(error.timestamp);
            return age < ttlMs;
        });
        prunedCount += criticalBefore - this.registry.indices.critical.errors.length;

        // Update metrics
        if (prunedCount > 0) {
            this.registry.performance_metrics.total_pruned += prunedCount;
            this.registry.maintenance.last_pruned = now.toISOString();
        }

        // Count-based pruning (if total exceeds max)
        const totalErrors = this._getTotalErrors();
        if (totalErrors > this.maxTotalEntries) {
            const excess = totalErrors - this.maxTotalEntries;
            // Remove oldest from recent index
            this.registry.indices.recent.errors =
                this.registry.indices.recent.errors.slice(0, -excess);
            this.registry.performance_metrics.total_pruned += excess;
        }
    }

    /**
     * Update performance metrics
     *
     * @private
     */
    _updateMetrics() {
        const allErrors = [
            ...this.registry.indices.recent.errors,
            ...this.registry.indices.critical.errors
        ];

        if (allErrors.length === 0) return;

        // Average severity
        const avgSeverity = allErrors.reduce((sum, e) => sum + e.severity_score, 0) / allErrors.length;
        this.registry.performance_metrics.avg_severity = Math.round(avgSeverity);

        // Most common error type
        const typeCounts = {};
        allErrors.forEach(e => {
            const type = e.error_signature.error_type;
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const mostCommon = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0];

        this.registry.performance_metrics.most_common_error_type = mostCommon
            ? `${mostCommon[0]} (${mostCommon[1]} occurrences)`
            : null;
    }

    /**
     * Get total error count (deduped across indices)
     *
     * @private
     * @returns {number} Total unique errors
     */
    _getTotalErrors() {
        const recent = this.registry.indices.recent.errors.length;
        const critical = this.registry.indices.critical.errors.length;

        // Simple count (indices may overlap, but that's acceptable for pruning logic)
        return recent + critical;
    }

    /**
     * Generate session ID if not provided
     *
     * @private
     * @returns {string} Session ID
     */
    _generateSessionId() {
        const date = new Date().toISOString().split('T')[0];
        return `${date}-error-registration`;
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
                console.warn('⚠️ ERROR REGISTRAR: Registry not found, creating new registry');
                return this._createDefaultRegistry();
            }

            const data = fs.readFileSync(registryPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('⚠️ ERROR REGISTRAR: Failed to load registry:', error.message);
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
            console.error('❌ ERROR REGISTRAR: Failed to save registry:', error.message);
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
            component: 'ERROR_REGISTRAR',
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            description: 'Auto-registered error signatures from PHC halt triggers',
            indices: {
                recent: {
                    max_entries: this.maxRecentEntries,
                    rotation_policy: 'FIFO (pure temporal)',
                    purpose: 'Recent error patterns',
                    errors: []
                },
                critical: {
                    max_entries: this.maxCriticalEntries,
                    rotation_policy: 'Severity ranking',
                    purpose: 'High-severity errors',
                    errors: []
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
                avg_severity: 0,
                most_common_error_type: null
            }
        };
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
            recent_count: this.registry.indices.recent.errors.length,
            critical_count: this.registry.indices.critical.errors.length,
            total_registered: this.registry.performance_metrics.total_registered,
            total_pruned: this.registry.performance_metrics.total_pruned,
            avg_severity: this.registry.performance_metrics.avg_severity,
            most_common_error: this.registry.performance_metrics.most_common_error_type,
            last_updated: this.registry.last_updated
        };
    }
}

module.exports = AegisErrorRegistrar;
