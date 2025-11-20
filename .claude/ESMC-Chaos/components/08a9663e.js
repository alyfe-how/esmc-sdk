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
/** ESMC 3.9.1 PROJECT MATURITY TIER | 2025-10-13 | v3.9.1 | PROD | TIER 3
 *  Purpose: ATLAS age-aware intelligence with maturity tier assignment
 *  Features: Project age tracking | Maturity tiers (4 levels) | Scanning optimization | cda0ca75.md integration | MAX/VIP only
 *  Skip expensive scans on new projects. Tiers: GENESIS (0-1d), EMERGING (2-7d), ESTABLISHED (7-30d), MATURE (30d+)
 */

const fs = require('fs').promises;
const path = require('path');

class ProjectMaturityTierSystem {
    constructor(options = {}) {
        this.version = "3.9.1";
        this.tier = "MAX/VIP";
        this.projectRoot = options.projectRoot || process.cwd();
        this.claudeMdPath = path.join(this.projectRoot, 'cda0ca75.md');

        // Maturity tier boundaries (in days)
        this.tiers = {
            GENESIS: { min: 0, max: 1, name: 'GENESIS', scanLevel: 'NONE' },
            EMERGING: { min: 2, max: 7, name: 'EMERGING', scanLevel: 'LIGHT' },
            ESTABLISHED: { min: 8, max: 30, name: 'ESTABLISHED', scanLevel: 'FULL' },
            MATURE: { min: 31, max: Infinity, name: 'MATURE', scanLevel: 'CACHED' }
        };

        this.projectStarted = null;
        this.projectAge = null;
        this.maturityTier = null;

        console.log(`🎖️ Project Maturity Tier System ${this.version} initialized (${this.tier})`);
    }

    /**
     * Analyze project maturity and return optimization strategy
     * @returns {Promise<Object>} Maturity analysis with scanning recommendations
     */
    async analyzeProjectMaturity() {
        console.log(`\n🎖️ MATURITY TIER: Analyzing project age...`);

        try {
            // Read PROJECT_STARTED from cda0ca75.md
            const projectStarted = await this._readProjectStarted();

            if (!projectStarted) {
                // First time - create PROJECT_STARTED timestamp
                await this._writeProjectStarted();
                return this._generateAnalysis(0, 'GENESIS');
            }

            // Calculate project age
            const ageInDays = this._calculateAge(projectStarted);

            // Determine maturity tier
            const tier = this._determineTier(ageInDays);

            return this._generateAnalysis(ageInDays, tier);

        } catch (error) {
            console.warn(`   ⚠️ MATURITY TIER: Analysis limited - ${error.message}`);
            // Default to ESTABLISHED tier if cannot determine
            return this._generateAnalysis(7, 'ESTABLISHED');
        }
    }

    /**
     * Get scanning optimization recommendations based on maturity
     * @param {string} tierName - Maturity tier name
     * @returns {Object} Scanning optimization strategy
     */
    getOptimizationStrategy(tierName) {
        const strategies = {
            GENESIS: {
                shouldScanProject: false,
                shouldScanBackups: false,
                shouldTriggerATLAS: false,
                reason: 'Day 0-1: No codebase exists yet - skip all scans',
                efficiency: '95% time saved',
                recommendations: [
                    'Skip ATLAS pattern scanning',
                    'Skip project file analysis',
                    'Skip backup folder scanning',
                    'Focus on initial setup and planning'
                ]
            },
            EMERGING: {
                shouldScanProject: true,
                shouldScanBackups: false,
                shouldTriggerATLAS: false,
                scanDepth: 2, // Shallow scan
                reason: 'Day 2-7: Minimal codebase - light scan only',
                efficiency: '60% time saved',
                recommendations: [
                    'Light project file scan (depth: 2)',
                    'Skip backup folder scanning',
                    'Skip expensive pattern analysis',
                    'Focus on rapid development'
                ]
            },
            ESTABLISHED: {
                shouldScanProject: true,
                shouldScanBackups: true,
                shouldTriggerATLAS: true,
                scanDepth: 5, // Full scan
                reason: 'Day 7-30: Substantial codebase - full scan recommended',
                efficiency: 'Full intelligence',
                recommendations: [
                    'Full project file scan (depth: 5)',
                    'Backup folder pattern analysis',
                    'ATLAS pattern recognition',
                    'Comprehensive intelligence gathering'
                ]
            },
            MATURE: {
                shouldScanProject: true,
                shouldScanBackups: true,
                shouldTriggerATLAS: true,
                usePatternCache: true,
                scanDepth: 5,
                reason: 'Day 30+: Mature project - use pattern cache',
                efficiency: 'Cached patterns + full scan',
                recommendations: [
                    'Use cached pattern database',
                    'Incremental scan (new files only)',
                    'ATLAS with historical context',
                    'Leverage established patterns'
                ]
            }
        };

        return strategies[tierName] || strategies.ESTABLISHED;
    }

    /**
     * Read PROJECT_STARTED timestamp from cda0ca75.md
     * @private
     */
    async _readProjectStarted() {
        try {
            const content = await fs.readFile(this.claudeMdPath, 'utf8');

            // Search for PROJECT_STARTED marker
            const match = content.match(/PROJECT_STARTED:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);

            if (match) {
                this.projectStarted = new Date(match[1]);
                console.log(`   📅 PROJECT_STARTED: ${this.projectStarted.toISOString()}`);
                return this.projectStarted;
            }

            return null;

        } catch (error) {
            // cda0ca75.md doesn't exist or can't be read
            return null;
        }
    }

    /**
     * Write PROJECT_STARTED timestamp to cda0ca75.md
     * @private
     */
    async _writeProjectStarted() {
        const now = new Date();
        this.projectStarted = now;

        try {
            let content = '';

            try {
                // Try to read existing cda0ca75.md
                content = await fs.readFile(this.claudeMdPath, 'utf8');
            } catch {
                // cda0ca75.md doesn't exist - will create new
            }

            // Check if PROJECT_STARTED already exists
            if (content.includes('PROJECT_STARTED:')) {
                console.log(`   ℹ️ PROJECT_STARTED already exists in cda0ca75.md`);
                return;
            }

            // Add PROJECT_STARTED marker at the BOTTOM (cda0ca75.md belongs to user, not ESMC)
            // ESMC 4.1: Moved from top to bottom - respects cda0ca75.md as user's file
            const marker = `\n\n<!-- ESMC 4 Project Maturity Tracking (MAX/VIP) -->\n` +
                          `<!-- PROJECT_STARTED: ${now.toISOString()} -->\n` +
                          `<!-- Auto-generated by ESMC - Do not modify -->`;

            const newContent = content + marker;

            await fs.writeFile(this.claudeMdPath, newContent, 'utf8');

            console.log(`   ✅ PROJECT_STARTED written to cda0ca75.md: ${now.toISOString()}`);

        } catch (error) {
            console.warn(`   ⚠️ Could not write PROJECT_STARTED: ${error.message}`);
        }
    }

    /**
     * Calculate project age in days
     * @private
     */
    _calculateAge(projectStarted) {
        const now = Date.now();
        const started = projectStarted.getTime();
        const ageInMs = now - started;
        const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));

        this.projectAge = ageInDays;

        console.log(`   📊 Project age: ${ageInDays} days`);

        return ageInDays;
    }

    /**
     * Determine maturity tier based on age
     * @private
     */
    _determineTier(ageInDays) {
        let tier = null;

        if (ageInDays >= this.tiers.GENESIS.min && ageInDays <= this.tiers.GENESIS.max) {
            tier = 'GENESIS';
        } else if (ageInDays >= this.tiers.EMERGING.min && ageInDays <= this.tiers.EMERGING.max) {
            tier = 'EMERGING';
        } else if (ageInDays >= this.tiers.ESTABLISHED.min && ageInDays <= this.tiers.ESTABLISHED.max) {
            tier = 'ESTABLISHED';
        } else {
            tier = 'MATURE';
        }

        this.maturityTier = tier;

        console.log(`   🎖️ Maturity tier: ${tier} (${this.tiers[tier].scanLevel} scan)`);

        return tier;
    }

    /**
     * Generate maturity analysis report
     * @private
     */
    _generateAnalysis(ageInDays, tierName) {
        const tier = this.tiers[tierName];
        const strategy = this.getOptimizationStrategy(tierName);

        return {
            projectAge: ageInDays,
            projectStarted: this.projectStarted,
            maturityTier: {
                name: tierName,
                scanLevel: tier.scanLevel,
                boundaries: `${tier.min}-${tier.max === Infinity ? '∞' : tier.max} days`
            },
            optimization: strategy,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get maturity tier status
     */
    getStatus() {
        return {
            version: this.version,
            tier: this.tier,
            projectRoot: this.projectRoot,
            projectStarted: this.projectStarted,
            projectAge: this.projectAge,
            maturityTier: this.maturityTier,
            claudeMdPath: this.claudeMdPath,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { ProjectMaturityTierSystem };

// Example usage
if (require.main === module) {
    console.log("🎖️ ESMC 3.9.1 - Project Maturity Tier System Test");

    (async () => {
        const maturitySystem = new ProjectMaturityTierSystem();

        // Analyze project maturity
        const analysis = await maturitySystem.analyzeProjectMaturity();

        console.log("\n📊 MATURITY ANALYSIS RESULTS:");
        console.log(`   Age: ${analysis.projectAge} days`);
        console.log(`   Tier: ${analysis.maturityTier.name}`);
        console.log(`   Scan level: ${analysis.maturityTier.scanLevel}`);

        console.log("\n🎯 OPTIMIZATION STRATEGY:");
        console.log(`   Scan project: ${analysis.optimization.shouldScanProject}`);
        console.log(`   Scan backups: ${analysis.optimization.shouldScanBackups}`);
        console.log(`   Trigger ATLAS: ${analysis.optimization.shouldTriggerATLAS}`);
        console.log(`   Reason: ${analysis.optimization.reason}`);
        console.log(`   Efficiency: ${analysis.optimization.efficiency}`);

        console.log("\n📋 RECOMMENDATIONS:");
        analysis.optimization.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });

        // Test all tiers
        console.log("\n═══ TESTING ALL MATURITY TIERS ═══");

        ['GENESIS', 'EMERGING', 'ESTABLISHED', 'MATURE'].forEach(tier => {
            console.log(`\n🎖️ ${tier} TIER:`);
            const strategy = maturitySystem.getOptimizationStrategy(tier);
            console.log(`   ATLAS: ${strategy.shouldTriggerATLAS ? '✅' : '❌'}`);
            console.log(`   Project scan: ${strategy.shouldScanProject ? '✅' : '❌'}`);
            console.log(`   Backup scan: ${strategy.shouldScanBackups ? '✅' : '❌'}`);
            console.log(`   Efficiency: ${strategy.efficiency}`);
        });

        console.log("\n✅ Project maturity tier system test completed");

    })();
}
