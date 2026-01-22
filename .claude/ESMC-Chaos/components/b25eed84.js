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
/**
 * ESMC 3.71.0 - PROJECT MODUS OPERANDI (PMO) LOADER
 * ═══════════════════════════════════════════════════════════════════════
 * 🎖️ CACHING SINGLETON WITH 1-HOUR TTL (PHASE 0.5 Integration)
 *
 * Purpose:
 * - Loads PMO file with 1-hour TTL caching (97.6% token savings)
 * - Singleton pattern ensures single instance across all colonels + ATHENA
 * - Memory-safe auto-expiration prevents stale PMO
 *
 * Token Economics:
 * - WITHOUT cache: 7 reads (6 colonels + ATHENA) × 500 tokens = 3,500 tokens
 * - WITH cache: 1 read (PHASE 0.5) × 500 tokens = 500 tokens
 * - SAVINGS: 85.7% within session, 97.6% vs full registry (20,501 tokens)
 *
 * Architecture:
 * - PHASE 0.5 (BRAIN.md) loads PMO once at session start
 * - All subsequent accesses (colonels, ATHENA) use cached copy (0 tokens)
 * - 1-hour TTL matches typical session duration (30-90 minutes)
 * - Auto-invalidation on regeneration
 *
 * ESMC Version: 3.71.0 (PMO Architecture)
 * Created: 2025-11-07
 * Author: ECHELON
 * Status: PRODUCTION READY
 */

const fs = require('fs');
const path = require('path');

/**
 * PMO Loader - Singleton with TTL Caching
 */
class PMOLoader {
    constructor() {
        // Singleton enforcement
        if (PMOLoader.instance) {
            return PMOLoader.instance;
        }

        this.version = "1.0.0";
        this.esmcVersion = "3.71.0";

        // Cache configuration
        this.cache = null; // Cached PMO object
        this.cacheTimestamp = null; // When cache was loaded
        this.cacheTTL = 3600000; // 1 hour in milliseconds (60 * 60 * 1000)

        // Statistics
        this.stats = {
            loads: 0, // Total loads from file
            hits: 0,  // Cache hits (0 tokens)
            misses: 0, // Cache misses (reload required)
            invalidations: 0 // Manual cache clears
        };

        PMOLoader.instance = this;
    }

    /**
     * Load PMO - Main entry point (with TTL caching)
     * @param {string} projectRoot - Project root directory
     * @param {Object} options - Load options
     * @returns {Promise<Object|null>} PMO object or null if not found
     */
    async loadPMO(projectRoot = process.cwd(), options = {}) {
        const forceFresh = options.forceFresh || false;

        // STEP 1: Check cache validity (unless forceFresh)
        if (!forceFresh && this.isCacheValid()) {
            this.stats.hits++;
            console.log('✅ PMO: Loaded from cache (0 tokens)');
            console.log(`   📊 Cache stats: ${this.stats.hits} hits, ${this.stats.misses} misses, ${this.stats.loads} loads`);
            return this.cache;
        }

        // STEP 2: Cache miss or expired - load from file
        this.stats.misses++;
        const pmoPath = path.join(projectRoot, '.esmc-project-modus-operandi.json');

        try {
            if (!fs.existsSync(pmoPath)) {
                console.log('⚠️ PMO: File not found (project not initialized)');
                console.log(`   Expected: ${pmoPath}`);
                return null;
            }

            // Read PMO file
            const pmoContent = fs.readFileSync(pmoPath, 'utf8');
            const pmo = JSON.parse(pmoContent);

            // Update cache
            this.cache = pmo;
            this.cacheTimestamp = Date.now();
            this.stats.loads++;

            console.log('✅ PMO: Loaded from file (~500 tokens)');
            console.log(`   📄 File: ${pmoPath}`);
            console.log(`   📊 Standards: ${Object.keys(pmo.standards_selected || {}).length}/5 categories`);
            console.log(`   🔒 Locked: ${pmo.locked ? 'YES' : 'NO'}`);
            console.log(`   ⏰ Cache TTL: ${(this.cacheTTL / 60000).toFixed(0)} minutes`);
            console.log(`   📊 Cache stats: ${this.stats.hits} hits, ${this.stats.misses} misses, ${this.stats.loads} loads`);

            return pmo;

        } catch (error) {
            console.error('❌ PMO: Load failed:', error.message);
            return null;
        }
    }

    /**
     * Get PMO - Direct cache access (0 tokens if cached)
     * @returns {Object|null} Cached PMO object or null
     */
    getPMO() {
        if (this.isCacheValid()) {
            this.stats.hits++;
            return this.cache;
        }

        console.warn('⚠️ PMO: Cache expired, use loadPMO() to refresh');
        this.stats.misses++;
        return null;
    }

    /**
     * Check Cache Validity
     * @returns {boolean} True if cache is valid and within TTL
     */
    isCacheValid() {
        if (!this.cache || !this.cacheTimestamp) {
            return false; // No cache exists
        }

        const age = Date.now() - this.cacheTimestamp;
        const isValid = age < this.cacheTTL;

        if (!isValid) {
            console.log(`⏰ PMO: Cache expired (age: ${(age / 60000).toFixed(1)} minutes, TTL: ${(this.cacheTTL / 60000).toFixed(0)} minutes)`);
        }

        return isValid;
    }

    /**
     * Invalidate Cache - Force reload on next access
     * @param {string} reason - Reason for invalidation (logging)
     */
    invalidateCache(reason = 'manual') {
        if (this.cache) {
            console.log(`🗑️ PMO: Cache invalidated (reason: ${reason})`);
            this.cache = null;
            this.cacheTimestamp = null;
            this.stats.invalidations++;
        }
    }

    /**
     * Get Cache Stats
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            ...this.stats,
            cacheAge: this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null,
            cacheTTL: this.cacheTTL,
            cacheValid: this.isCacheValid(),
            tokenSavings: this.stats.hits * 500, // Each hit saves ~500 tokens
            estimatedCost: this.stats.loads * 500 // Each load costs ~500 tokens
        };
    }

    /**
     * Check PMO Exists
     * @param {string} projectRoot - Project root directory
     * @returns {boolean} True if PMO file exists
     */
    exists(projectRoot = process.cwd()) {
        const pmoPath = path.join(projectRoot, '.esmc-project-modus-operandi.json');
        return fs.existsSync(pmoPath);
    }

    /**
     * Get PMO Path
     * @param {string} projectRoot - Project root directory
     * @returns {string} Full path to PMO file
     */
    getPMOPath(projectRoot = process.cwd()) {
        return path.join(projectRoot, '.esmc-project-modus-operandi.json');
    }

    /**
     * Validate PMO - Check file integrity
     * @param {Object} pmo - PMO object to validate
     * @returns {Object} Validation result
     */
    validatePMO(pmo) {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!pmo.version) errors.push('Missing version field');
        if (!pmo.esmc_version) errors.push('Missing esmc_version field');
        if (!pmo.project_id) errors.push('Missing project_id field');
        if (!pmo.standards_selected) errors.push('Missing standards_selected field');
        if (!pmo.audit_threshold) errors.push('Missing audit_threshold field');

        // Standards validation
        if (pmo.standards_selected) {
            const categories = Object.keys(pmo.standards_selected);
            if (categories.length !== 5) {
                warnings.push(`Expected 5 categories, found ${categories.length}`);
            }

            // Check each category has required fields
            categories.forEach(cat => {
                const std = pmo.standards_selected[cat];
                if (std) {
                    if (!std.id) errors.push(`${cat}: Missing id field`);
                    if (!std.name) errors.push(`${cat}: Missing name field`);
                    if (!std.rule_of_thumb) errors.push(`${cat}: Missing rule_of_thumb field`);
                    if (!std.key_checks || !Array.isArray(std.key_checks)) {
                        errors.push(`${cat}: Missing or invalid key_checks array`);
                    }
                }
            });
        }

        // Audit threshold validation
        if (pmo.audit_threshold) {
            if (typeof pmo.audit_threshold !== 'number') {
                errors.push('audit_threshold must be a number');
            } else if (pmo.audit_threshold < 0 || pmo.audit_threshold > 1) {
                errors.push('audit_threshold must be between 0 and 1');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get Standard by Category
     * @param {string} category - Category key (architecture, code_quality, security, testing, operations)
     * @returns {Object|null} Standard object or null
     */
    getStandardByCategory(category) {
        const pmo = this.getPMO();
        if (!pmo || !pmo.standards_selected) {
            return null;
        }

        return pmo.standards_selected[category] || null;
    }

    /**
     * Get All Standards
     * @returns {Array} Array of all 5 standards
     */
    getAllStandards() {
        const pmo = this.getPMO();
        if (!pmo || !pmo.standards_selected) {
            return [];
        }

        return Object.values(pmo.standards_selected).filter(s => s !== null);
    }

    /**
     * Get Audit Threshold
     * @returns {number} Audit threshold (0.6 = 3/5 categories must pass)
     */
    getAuditThreshold() {
        const pmo = this.getPMO();
        return pmo?.audit_threshold || 0.6;
    }

    /**
     * Check if PMO is Locked
     * @returns {boolean} True if PMO is locked (prevents modification)
     */
    isLocked() {
        const pmo = this.getPMO();
        return pmo?.locked || false;
    }

    /**
     * Get Project Domain
     * @returns {string} Project domain (HEALTHCARE, FINANCE, SAAS, GENERAL, etc.)
     */
    getProjectDomain() {
        const pmo = this.getPMO();
        return pmo?.project_domain || 'GENERAL';
    }

    /**
     * Get Generation Timestamp
     * @returns {string|null} ISO timestamp when PMO was generated
     */
    getGenerationTimestamp() {
        const pmo = this.getPMO();
        return pmo?.generated_at || null;
    }

    /**
     * Get Token Cost Estimate
     * @returns {number} Estimated token cost per session
     */
    getTokenCostEstimate() {
        const pmo = this.getPMO();
        return pmo?.metadata?.token_cost_estimate || 500;
    }

    /**
     * Reset Statistics
     */
    resetStats() {
        this.stats = {
            loads: 0,
            hits: 0,
            misses: 0,
            invalidations: 0
        };
        console.log('📊 PMO: Statistics reset');
    }

    /**
     * Get Instance (Singleton accessor)
     * @returns {PMOLoader} Singleton instance
     */
    static getInstance() {
        if (!PMOLoader.instance) {
            return new PMOLoader();
        }
        return PMOLoader.instance;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = { PMOLoader };

// CLI Execution Support
if (require.main === module) {
    const loader = PMOLoader.getInstance();
    const projectRoot = process.argv[2] || process.cwd();

    loader.loadPMO(projectRoot)
        .then(pmo => {
            if (pmo) {
                console.log('\n✅ PMO Loaded Successfully');
                console.log(JSON.stringify(pmo, null, 2));
            } else {
                console.log('\n⚠️ PMO Not Found - Run PMO generator first');
            }
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ PMO Load Failed:', error);
            process.exit(1);
        });
}
