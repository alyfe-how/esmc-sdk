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
/** ESMC 3.20 TIER DETECTOR | 2025-10-19 | v3.20.0 | PROD | ALL_TIERS
 *  Purpose: Tier detection via encrypted license file (FREE/PRO/MAX/VIP) with feature gating
 *  Features: License Manager integration | Capability mapping | 1min cache | hasFeature() | Phase 1 critical infrastructure
 *
 *  Integration Points:
 *  - Retrieval Orchestrator: Routing decisions based on tier
 *  - ATLAS/HYDRA: Tier-gated method selection
 */

const path = require('path');

class TierDetector {
    constructor() {
        this.version = "3.20.0";
        this.systemName = "TIER_DETECTOR";
        this.cachedTier = null;
        this.cacheTimestamp = null;
        this.CACHE_TTL = 60000; // 1 minute cache

        console.log(`🎖️ Tier Detector ${this.version} initialized`);
    }

    /**
     * Detect user tier from license file
     * @param {boolean} forceRefresh - Skip cache
     * @returns {string} - User tier ('FREE', 'PRO', 'MAX')
     */
    detectTier(forceRefresh = false) {
        const now = Date.now();

        // Use cached tier if valid
        if (!forceRefresh && this.cachedTier && this.cacheTimestamp) {
            if (now - this.cacheTimestamp < this.CACHE_TTL) {
                return this.cachedTier;
            }
        }

        // Try to load License Manager
        let validation = null;
        try {
            // Attempt to require license manager from esmc-sdk
            const licenseManagerPath = path.join(__dirname, '..', '..', '..', 'esmc-sdk', 'core', '0b1c5e26.js');
            const { validateLicense } = require(licenseManagerPath);
            validation = validateLicense();
        } catch (error) {
            // License Manager not found or validation failed - default to FREE
            console.log(`   ℹ️ No license file found - defaulting to FREE tier`);
        }

        let tier = 'FREE';

        if (validation && validation.valid) {
            tier = validation.tier;

            // Normalize tier names (ENTERPRISE → MAX, VIP → MAX)
            if (tier === 'ENTERPRISE' || tier === 'VIP') {
                tier = 'MAX';
            }

            console.log(`   ✅ License valid: ${tier} tier`);
        }

        // Cache result
        this.cachedTier = tier;
        this.cacheTimestamp = now;

        return tier;
    }

    /**
     * Get tier capabilities
     * @returns {object} - Tier feature flags
     */
    getTierCapabilities() {
        const tier = this.detectTier();

        const capabilities = {
            FREE: {
                tier_name: 'FREE',
                atlas_tiers: ['T1_LIGHT'],
                echo_checkpoints: true, // 🆕 ESMC 3.22: ECHO v3.0 available in FREE tier
                hydra_enabled: false,
                working_memory: false,
                self_healing: false,
                pattern_recognition: false,
                dual_intelligence: false,
                max_sessions_searchable: null, // 🆕 ESMC 3.22: Removed cap (unlimited sessions)
                description: 'Recent memory (ATLAS T1 Light) + ECHO v3.0 checkpoints'
            },
            PRO: {
                tier_name: 'PRO',
                atlas_tiers: ['T1', 'T2'],
                hydra_enabled: false,
                working_memory: 'branch1_only',
                self_healing: 'delayed',
                pattern_recognition: false,
                dual_intelligence: false,
                max_sessions_searchable: null, // unlimited
                description: 'Recent + Topic clustering'
            },
            MAX: {
                tier_name: 'MAX',
                atlas_tiers: ['T1', 'T2', 'T3'],
                hydra_enabled: true,
                working_memory: 'full',
                self_healing: 'realtime',
                pattern_recognition: true,
                dual_intelligence: true,
                max_sessions_searchable: null, // unlimited
                description: 'Full depth + HYDRA parallel + cognitive recognition'
            }
        };

        return capabilities[tier] || capabilities.FREE;
    }

    /**
     * Check if feature is enabled for current tier
     * @param {string} feature - Feature name
     * @returns {boolean} - True if enabled
     */
    hasFeature(feature) {
        const capabilities = this.getTierCapabilities();

        const featureMap = {
            'hydra': capabilities.hydra_enabled,
            'working_memory': capabilities.working_memory !== false,
            'self_healing': capabilities.self_healing !== false,
            'pattern_recognition': capabilities.pattern_recognition,
            'dual_intelligence': capabilities.dual_intelligence,
            't1': capabilities.atlas_tiers.includes('T1') || capabilities.atlas_tiers.includes('T1_LIGHT'),
            't2': capabilities.atlas_tiers.includes('T2'),
            't3': capabilities.atlas_tiers.includes('T3'),
            't1_light': capabilities.atlas_tiers.includes('T1_LIGHT')
        };

        return featureMap[feature.toLowerCase()] || false;
    }

    /**
     * Get tier status for display
     */
    getStatus() {
        const tier = this.detectTier();
        const capabilities = this.getTierCapabilities();

        return {
            system: this.systemName,
            version: this.version,
            tier: tier,
            capabilities: capabilities,
            cached: this.cachedTier !== null,
            cache_age_ms: this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Clear tier cache (force re-detection on next call)
     */
    clearCache() {
        this.cachedTier = null;
        this.cacheTimestamp = null;
        console.log(`   🔄 Tier cache cleared`);
    }
}

module.exports = { TierDetector };

// ═══════════════════════════════════════════════════════════════════════
// TESTING
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    console.log('\n🎖️ ESMC 3.20 - Tier Detector Test\n');

    const detector = new TierDetector();
    const status = detector.getStatus();

    console.log('📊 TIER STATUS:\n');
    console.log(JSON.stringify(status, null, 2));

    console.log('\n🔍 FEATURE FLAGS:\n');
    const features = ['hydra', 't1', 't2', 't3', 'working_memory', 'pattern_recognition', 'dual_intelligence'];
    features.forEach(feature => {
        const enabled = detector.hasFeature(feature);
        console.log(`   ${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
    });

    console.log('\n✅ Tier Detector Test Complete');
}
