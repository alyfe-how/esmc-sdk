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
 * ESMC 3.71.0 - PMO CLI WRAPPER
 * ═══════════════════════════════════════════════════════════════════════
 * 🎖️ PROJECT MODUS OPERANDI COMMAND-LINE INTERFACE
 *
 * Purpose:
 * - CLI wrapper for PMO generation, loading, validation, and management
 * - Provides manual commands for PMO operations
 * - Integrates with BRAIN.md PHASE 0.5 for auto-initialization
 *
 * Commands:
 * - generate [projectRoot] - Generate new PMO file
 * - load [projectRoot] - Load and display PMO
 * - validate [projectRoot] - Validate PMO file integrity
 * - stats - Display cache statistics
 * - invalidate - Clear PMO cache
 * - exists [projectRoot] - Check if PMO file exists
 *
 * ESMC Version: 3.71.0 (PMO Architecture)
 * Created: 2025-11-07
 * Author: ECHELON
 * Status: PRODUCTION READY
 */

const { PMOGenerator } = require('./d9d8b031');
const { PMOLoader } = require('./b25eed84');

/**
 * PMO CLI - Command-line interface
 */
class PMOCLI {
    constructor() {
        this.version = "1.0.0";
        this.esmcVersion = "3.71.0";
        this.generator = new PMOGenerator();
        this.loader = PMOLoader.getInstance();
    }

    /**
     * Execute CLI Command
     * @param {Array} args - Command arguments
     */
    async execute(args) {
    // 🆕 ESMC 3.101.0: Silent by default
    const verbose = process.env.ESMC_VERBOSE === 'true';
    const silent = !verbose;

    let originalConsoleLog;
    if (silent) {
        originalConsoleLog = console.log;
        console.log = () => {};
    }
        const command = args[0];
        const projectRoot = args[1] || process.cwd();

        switch (command) {
            case 'generate':
                await this.cmdGenerate(projectRoot);
                break;

            case 'load':
                await this.cmdLoad(projectRoot);
                break;

            case 'validate':
                await this.cmdValidate(projectRoot);
                break;

            case 'stats':
                this.cmdStats();
                break;

            case 'invalidate':
                this.cmdInvalidate();
                break;

            case 'exists':
                this.cmdExists(projectRoot);
                break;

            case 'extract':
                await this.cmdExtract(args[1], args[2]);
                break;

            case 'help':
            default:
                this.cmdHelp();
                break;
        }
    }

    /**
     * Generate PMO
     */
    async cmdGenerate(projectRoot) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - PMO GENERATOR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        try {
            const pmo = await this.generator.generatePMO(projectRoot);
            console.log('\n✅ PMO Generation Successful');
            console.log('═══════════════════════════════════════════════════════════════');
            return pmo;
        } catch (error) {
            console.error('\n❌ PMO Generation Failed');
            console.error('═══════════════════════════════════════════════════════════════');
            throw error;
        }
    }

    /**
     * Load PMO
     */
    async cmdLoad(projectRoot) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - PMO LOADER');
        console.log('═══════════════════════════════════════════════════════════════\n');

        try {
            const pmo = await this.loader.loadPMO(projectRoot);

            if (!pmo) {
                console.log('⚠️ PMO Not Found');
                console.log('   Run: node f229bbe9.js generate');
                console.log('═══════════════════════════════════════════════════════════════');
                return null;
            }

            console.log('\n📋 PMO DETAILS:');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log(`   Project ID: ${pmo.project_id}`);
            console.log(`   Domain: ${pmo.project_domain}`);
            console.log(`   Generated: ${pmo.generated_at}`);
            console.log(`   Locked: ${pmo.locked ? 'YES' : 'NO'}`);
            console.log(`   Audit Threshold: ${(pmo.audit_threshold * 100).toFixed(0)}% (${Math.ceil(pmo.audit_threshold * 5)}/5 categories)`);

            console.log('\n📊 SELECTED STANDARDS:');
            console.log('═══════════════════════════════════════════════════════════════');
            Object.entries(pmo.standards_selected).forEach(([category, standard]) => {
                if (standard) {
                    console.log(`\n   [${category.toUpperCase()}]`);
                    console.log(`   Standard: ${standard.name} (${standard.id})`);
                    console.log(`   Category: ${standard.category}`);
                    console.log(`   Enforcement: ${standard.enforcement_level}`);
                    console.log(`   Checks: ${standard.key_checks?.length || 0}`);
                }
            });

            console.log('\n═══════════════════════════════════════════════════════════════');
            return pmo;

        } catch (error) {
            console.error('\n❌ PMO Load Failed');
            console.error('═══════════════════════════════════════════════════════════════');
            throw error;
        }
    }

    /**
     * Validate PMO
     */
    async cmdValidate(projectRoot) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - PMO VALIDATOR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        try {
            const pmo = await this.loader.loadPMO(projectRoot);

            if (!pmo) {
                console.log('❌ PMO Not Found - Cannot Validate');
                console.log('═══════════════════════════════════════════════════════════════');
                return false;
            }

            const validation = this.loader.validatePMO(pmo);

            console.log(`\n📋 VALIDATION RESULT: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
            console.log('═══════════════════════════════════════════════════════════════');

            if (validation.errors.length > 0) {
                console.log('\n❌ ERRORS:');
                validation.errors.forEach(err => {
                    console.log(`   - ${err}`);
                });
            }

            if (validation.warnings.length > 0) {
                console.log('\n⚠️ WARNINGS:');
                validation.warnings.forEach(warn => {
                    console.log(`   - ${warn}`);
                });
            }

            if (validation.valid && validation.warnings.length === 0) {
                console.log('\n✅ No errors or warnings - PMO is healthy');
            }

            console.log('═══════════════════════════════════════════════════════════════');
            return validation.valid;

        } catch (error) {
            console.error('\n❌ Validation Failed');
            console.error('═══════════════════════════════════════════════════════════════');
            throw error;
        }
    }

    /**
     * Display Cache Statistics
     */
    cmdStats() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - PMO CACHE STATISTICS');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const stats = this.loader.getStats();

        console.log('📊 CACHE PERFORMANCE:');
        console.log(`   Loads (file reads): ${stats.loads}`);
        console.log(`   Cache hits: ${stats.hits} (0 tokens each)`);
        console.log(`   Cache misses: ${stats.misses}`);
        console.log(`   Invalidations: ${stats.invalidations}`);

        const hitRate = stats.loads > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) : 0;
        console.log(`   Hit rate: ${hitRate}%`);

        console.log('\n💰 TOKEN ECONOMICS:');
        console.log(`   Tokens saved: ${stats.tokenSavings} (cache hits)`);
        console.log(`   Tokens spent: ${stats.estimatedCost} (file loads)`);
        console.log(`   Net savings: ${stats.tokenSavings - stats.estimatedCost} tokens`);

        console.log('\n⏰ CACHE STATUS:');
        console.log(`   Valid: ${stats.cacheValid ? 'YES' : 'NO'}`);
        if (stats.cacheAge !== null) {
            console.log(`   Age: ${(stats.cacheAge / 60000).toFixed(1)} minutes`);
            console.log(`   TTL: ${(stats.cacheTTL / 60000).toFixed(0)} minutes`);
            const remaining = stats.cacheTTL - stats.cacheAge;
            console.log(`   Remaining: ${(remaining / 60000).toFixed(1)} minutes`);
        } else {
            console.log(`   Cache: Empty`);
        }

        console.log('═══════════════════════════════════════════════════════════════');
    }

    /**
     * Invalidate Cache
     */
    cmdInvalidate() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - PMO CACHE INVALIDATION');
        console.log('═══════════════════════════════════════════════════════════════\n');

        this.loader.invalidateCache('manual CLI command');

        console.log('✅ Cache Invalidated - Next access will reload from file');
        console.log('═══════════════════════════════════════════════════════════════');
    }

    /**
     * Check PMO Exists
     */
    cmdExists(projectRoot) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - PMO EXISTENCE CHECK');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const exists = this.loader.exists(projectRoot);
        const pmoPath = this.loader.getPMOPath(projectRoot);

        console.log(`   Project Root: ${projectRoot}`);
        console.log(`   PMO Path: ${pmoPath}`);
        console.log(`   Exists: ${exists ? '✅ YES' : '❌ NO'}`);

        if (!exists) {
            console.log('\n   Generate PMO: node f229bbe9.js generate');
        }

        console.log('═══════════════════════════════════════════════════════════════');
        return exists;
    }

    /**
     * Extract Standard Metadata (for PMO generation)
     */
    async cmdExtract(standardId, format = 'json') {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - STANDARD METADATA EXTRACTOR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        if (!standardId) {
            console.log('❌ Missing standard ID');
            console.log('   Usage: node f229bbe9.js extract <STANDARD_ID>');
            console.log('   Example: node f229bbe9.js extract OWASP');
            console.log('═══════════════════════════════════════════════════════════════');
            return;
        }

        try {
            const standard = this.generator.standardsRegistry.standards[standardId];

            if (!standard) {
                console.log(`❌ Standard not found: ${standardId}`);
                console.log('═══════════════════════════════════════════════════════════════');
                return;
            }

            console.log(`✅ Standard Found: ${standard.name}`);
            console.log('\n📋 METADATA:');
            console.log('═══════════════════════════════════════════════════════════════');

            if (format === 'json') {
                console.log(JSON.stringify(standard, null, 2));
            } else {
                console.log(`   ID: ${standard.id}`);
                console.log(`   Name: ${standard.name}`);
                console.log(`   Category: ${standard.category}`);
                console.log(`   Colonel: ${standard.colonel}`);
                console.log(`   Wave: ${standard.wave}`);
                console.log(`   Tier: ${standard.tier}`);
                console.log(`   Priority: ${standard.priority}`);
                console.log(`   Description: ${standard.description}`);
                console.log(`   Checks: ${standard.checks?.join(', ')}`);
            }

            console.log('═══════════════════════════════════════════════════════════════');

        } catch (error) {
            console.error('❌ Extraction Failed:', error.message);
            console.log('═══════════════════════════════════════════════════════════════');
        }
    }

    /**
     * Display Help
     */
    cmdHelp() {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎖️ ESMC 3.71.0 - PMO CLI HELP');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('USAGE:');
        console.log('   node f229bbe9.js <command> [options]\n');

        console.log('COMMANDS:');
        console.log('   generate [projectRoot]     Generate new PMO file');
        console.log('   load [projectRoot]         Load and display PMO');
        console.log('   validate [projectRoot]     Validate PMO file integrity');
        console.log('   stats                      Display cache statistics');
        console.log('   invalidate                 Clear PMO cache');
        console.log('   exists [projectRoot]       Check if PMO file exists');
        console.log('   extract <standardId>       Extract standard metadata');
        console.log('   help                       Display this help message\n');

        console.log('EXAMPLES:');
        console.log('   node f229bbe9.js generate');
        console.log('   node f229bbe9.js load');
        console.log('   node f229bbe9.js validate');
        console.log('   node f229bbe9.js stats');
        console.log('   node f229bbe9.js extract OWASP\n');

        console.log('═══════════════════════════════════════════════════════════════');
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = { PMOCLI };

// CLI Execution
if (require.main === module) {
    const cli = new PMOCLI();
    const args = process.argv.slice(2);

    cli.execute(args)
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Error:', error.message);
            process.exit(1);
        });
}
