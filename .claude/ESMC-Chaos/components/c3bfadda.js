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
/** ESMC 3.62 TIER GATE (Consolidated PRE-BRAIN Architecture) | 2025-11-03 | v3.62.0 | PROD
 *  Purpose: Unified tier management - PRE-BRAIN infrastructure + capability flags
 *  Architecture: Two-stage model (PRE-BRAIN: infrastructure, POST-BRAIN: execution via ECHELON)
 *  Consolidates: tier-gate (old) + tier-detector → Single source of truth
 *  Features: Memory systems | Intelligence flags | License validation | Enforcement API
 *
 *  CHANGELOG 3.62:
 *  - Merged tier-detector memory features (ATLAS T1/T2/T3, HYDRA, ECHO, working memory)
 *  - Moved colonels/modules/limits to POST-BRAIN (ECHELON owns execution)
 *  - Added enforcement API (hasAccess, requireAccess, enforcePreExecution)
 *  - Added telemetry/logging for tier access attempts
 *  - Deprecated tier-detector (all features merged here)
 */

const { validateLicense, getLicenseInfo } = require('./0b1c5e26');
const path = require('path');
const fs = require('fs');

// ============================================================================
// PRE-BRAIN TIER CONFIGURATION (Infrastructure + Capability Flags)
// ============================================================================

/**
 * PRE-BRAIN features: What infrastructure/capabilities are available BEFORE brain execution
 * These control WHAT the brain can access, not HOW it executes (that's POST-BRAIN/ECHELON)
 */
const TIER_FEATURES = {
  FREE: {
    // === MEMORY SYSTEMS (Infrastructure) ===
    memory: {
      atlas_t1: true,           // Recent sessions (T1 keyword search)
      atlas_t2: false,          // Topic clustering (PRO+)
      atlas_t3: false,          // HYDRA deep search (MAX+)
      hydra_enabled: false,     // Parallel ATLAS+HYDRA (MAX+)
      echo_checkpoints: true,   // ECHO save/restore (all tiers)
      working_memory: false,    // AEGIS working memory (PRO+)
      self_healing: false,      // Auto-repair (MAX+)
      pattern_recognition: false // Advanced pattern matching (MAX+)
    },

    // === INTELLIGENCE CAPABILITY FLAGS ===
    // These control which components BRAIN.md can execute
    intelligence: {
      PIU: false,    // Project Intent Understanding (PRO+)
      DKI: false,    // Domain Knowledge Integration (PRO+)
      UIP: false,    // User Intent Prediction (PRO+)
      PCA: true      // Project Context Analysis (all tiers)
    },

    // === INFRASTRUCTURE METADATA ===
    tier_name: 'FREE',
    description: 'ATLAS T1 + Project context (PCA only) + Direct execution (0 colonels)'
  },

  PRO: {
    // === MEMORY SYSTEMS ===
    memory: {
      atlas_t1: true,
      atlas_t2: true,           // ← Unlocked: Topic clustering
      atlas_t3: false,
      hydra_enabled: false,
      echo_checkpoints: true,
      working_memory: true,     // ← Unlocked: AEGIS working memory
      self_healing: false,
      pattern_recognition: false
    },

    // === INTELLIGENCE CAPABILITY FLAGS ===
    intelligence: {
      PIU: true,
      DKI: true,
      UIP: true,
      PCA: true
    },

    // === INFRASTRUCTURE METADATA ===
    tier_name: 'PRO',
    description: 'ATLAS T1+T2 + Full mesh intelligence + Working memory + Direct execution (0 colonels)'
  },

  MAX: {
    // === MEMORY SYSTEMS ===
    memory: {
      atlas_t1: true,
      atlas_t2: true,
      atlas_t3: true,           // ← Unlocked: HYDRA deep search
      hydra_enabled: true,      // ← Unlocked: Parallel retrieval
      echo_checkpoints: true,
      working_memory: true,
      self_healing: true,       // ← Unlocked: Auto-repair
      pattern_recognition: true // ← Unlocked: Advanced patterns
    },

    // === INTELLIGENCE CAPABILITY FLAGS ===
    intelligence: {
      PIU: true,
      DKI: true,
      UIP: true,
      PCA: true
    },

    // === INFRASTRUCTURE METADATA ===
    tier_name: 'MAX',
    description: 'Full ATLAS+HYDRA + All features + Unlimited depth'
  },

  ENTERPRISE: {
    // Alias for MAX (same capabilities)
    memory: {
      atlas_t1: true,
      atlas_t2: true,
      atlas_t3: true,
      hydra_enabled: true,
      echo_checkpoints: true,
      working_memory: true,
      self_healing: true,
      pattern_recognition: true
    },

    intelligence: {
      PIU: true,
      DKI: true,
      UIP: true,
      PCA: true
    },

    tier_name: 'MAX',
    description: 'Enterprise: Full ATLAS+HYDRA + All features + Unlimited depth'
  }
};

// ============================================================================
// TIER DETECTION & CACHING
// ============================================================================

class TierGateSystem {
  constructor() {
    this.version = "3.62.0";
    this.systemName = "TIER_GATE_UNIFIED";
    this.cachedTier = null;
    this.cacheTimestamp = null;
    this.CACHE_TTL = 60000; // 1 minute cache
    this.telemetry = [];      // Access attempt logging

    console.log(`🎖️ Tier Gate ${this.version} initialized (PRE-BRAIN unified architecture)`);
  }

  /**
   * Get current user's tier from license file (with caching)
   * @param {boolean} forceRefresh - Skip cache
   * @returns {object} - Tier validation result
   */
  getCurrentTier(forceRefresh = false) {
    const now = Date.now();

    // Use cached tier if valid
    if (!forceRefresh && this.cachedTier && this.cacheTimestamp) {
      if (now - this.cacheTimestamp < this.CACHE_TTL) {
        return this.cachedTier;
      }
    }

    try {
      const licenseValidation = validateLicense();

      if (!licenseValidation.valid) {
        // No license file or invalid → FREE tier
        const result = {
          tier: 'FREE',
          valid: false,
          reason: licenseValidation.reason || 'No valid license',
          features: TIER_FEATURES.FREE
        };

        this.cachedTier = result;
        this.cacheTimestamp = now;
        return result;
      }

      let tier = licenseValidation.tier || 'FREE';

      // Normalize tier names
      if (tier === 'VIP') tier = 'MAX';

      const result = {
        tier: tier,
        valid: true,
        email: licenseValidation.email,
        userId: licenseValidation.userId,
        subscriptionStatus: licenseValidation.subscriptionStatus,
        subscriptionEndDate: licenseValidation.subscriptionEndDate,
        features: TIER_FEATURES[tier] || TIER_FEATURES.FREE
      };

      this.cachedTier = result;
      this.cacheTimestamp = now;
      return result;

    } catch (error) {
      console.error('❌ Tier validation error:', error.message);
      const result = {
        tier: 'FREE',
        valid: false,
        reason: error.message,
        features: TIER_FEATURES.FREE
      };

      this.cachedTier = result;
      this.cacheTimestamp = now;
      return result;
    }
  }

  /**
   * Check if user has access to specific feature
   * @param {string} featurePath - Feature path (e.g., "memory.hydra_enabled", "intelligence.PIU")
   * @returns {boolean} - Access granted
   */
  hasAccess(featurePath) {
    const tierInfo = this.getCurrentTier();
    const features = tierInfo.features;

    const parts = featurePath.split('.');
    let current = features;

    for (const part of parts) {
      if (current[part] === undefined) {
        this._logAccess(featurePath, false, 'feature_not_found');
        return false;
      }
      current = current[part];
    }

    const hasAccess = current === true || current === -1;
    this._logAccess(featurePath, hasAccess, hasAccess ? 'granted' : 'denied');
    return hasAccess;
  }

  /**
   * Require access to feature (throws if denied)
   * @param {string} featurePath - Feature path
   * @throws {Error} - If access denied
   */
  requireAccess(featurePath) {
    if (!this.hasAccess(featurePath)) {
      const tierInfo = this.getCurrentTier();
      const requiredTier = this._getRequiredTier(featurePath);

      throw new Error(
        `⛔ Feature "${featurePath}" requires ${requiredTier} tier. ` +
        `Current tier: ${tierInfo.tier}. Upgrade at https://esmc-sdk.com`
      );
    }
  }

  /**
   * PRE-EXECUTION enforcement check (for BRAIN.md PHASE 1)
   * Returns { allowed, reason, upgrade } instead of throwing
   * @param {string} component - Component name (e.g., 'intelligence.PIU')
   * @returns {object} - { allowed: boolean, reason: string, tier: string, upgrade: string }
   */
  enforcePreExecution(component) {
    const tierInfo = this.getCurrentTier();
    const allowed = this.hasAccess(component);

    if (allowed) {
      return {
        allowed: true,
        reason: `Access granted (${tierInfo.tier})`,
        tier: tierInfo.tier
      };
    }

    const requiredTier = this._getRequiredTier(component);
    return {
      allowed: false,
      reason: `Feature requires ${requiredTier} tier`,
      tier: tierInfo.tier,
      upgrade: `Upgrade to ${requiredTier} at https://esmc-sdk.com`
    };
  }

  /**
   * Get enabled intelligence components for current tier
   * @returns {Array} - List of enabled component names
   */
  getEnabledIntelligence() {
    const tierInfo = this.getCurrentTier();
    const intelligence = tierInfo.features.intelligence;

    return Object.keys(intelligence).filter(component => intelligence[component] === true);
  }

  /**
   * Get memory capabilities for current tier
   * @returns {object} - Memory feature flags
   */
  getMemoryCapabilities() {
    const tierInfo = this.getCurrentTier();
    return tierInfo.features.memory;
  }

  /**
   * Get ATLAS tier access (for retrieval system)
   * @returns {Array} - Available ATLAS tiers (e.g., ['T1'], ['T1', 'T2'], ['T1', 'T2', 'T3'])
   */
  getAtlasTiers() {
    const memory = this.getMemoryCapabilities();
    const tiers = [];

    if (memory.atlas_t1) tiers.push('T1');
    if (memory.atlas_t2) tiers.push('T2');
    if (memory.atlas_t3) tiers.push('T3');

    return tiers;
  }

  /**
   * Check if HYDRA is enabled (for orchestrator dual-retrieval)
   * @returns {boolean} - HYDRA availability
   */
  isHydraEnabled() {
    const memory = this.getMemoryCapabilities();
    return memory.hydra_enabled === true;
  }

  /**
   * Get tier status for display
   * @returns {object} - Status object
   */
  getStatus() {
    const tierInfo = this.getCurrentTier();

    return {
      system: this.systemName,
      version: this.version,
      tier: tierInfo.tier,
      valid: tierInfo.valid,
      features: tierInfo.features,
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

  /**
   * Get telemetry data (for monitoring/analytics)
   * @returns {Array} - Access attempts
   */
  getTelemetry() {
    return this.telemetry;
  }

  /**
   * Export telemetry to file
   */
  exportTelemetry(filepath) {
    try {
      fs.writeFileSync(filepath, JSON.stringify({
        system: this.systemName,
        version: this.version,
        exported: new Date().toISOString(),
        access_attempts: this.telemetry
      }, null, 2));
      console.log(`📊 Telemetry exported: ${filepath}`);
    } catch (error) {
      console.error(`❌ Telemetry export failed: ${error.message}`);
    }
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Log access attempt (for telemetry)
   */
  _logAccess(feature, granted, reason) {
    const tierInfo = this.getCurrentTier();

    this.telemetry.push({
      timestamp: new Date().toISOString(),
      tier: tierInfo.tier,
      feature: feature,
      granted: granted,
      reason: reason
    });

    // Keep only last 100 entries (prevent memory bloat)
    if (this.telemetry.length > 100) {
      this.telemetry.shift();
    }
  }

  /**
   * Get required tier for a feature
   * @param {string} featurePath - Feature path
   * @returns {string} - Required tier (FREE/PRO/MAX)
   */
  _getRequiredTier(featurePath) {
    if (this._hasAccessInTier('FREE', featurePath)) return 'FREE';
    if (this._hasAccessInTier('PRO', featurePath)) return 'PRO';
    return 'MAX';
  }

  /**
   * Check if tier has access to feature
   * @param {string} tier - Tier name
   * @param {string} featurePath - Feature path
   * @returns {boolean} - Has access
   */
  _hasAccessInTier(tier, featurePath) {
    const features = TIER_FEATURES[tier];
    if (!features) return false;

    const parts = featurePath.split('.');
    let current = features;

    for (const part of parts) {
      if (current[part] === undefined) return false;
      current = current[part];
    }

    return current === true || current === -1;
  }
}

// ============================================================================
// SINGLETON INSTANCE (for backward compatibility)
// ============================================================================

const tierGate = new TierGateSystem();

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS (OLD API)
// ============================================================================

/**
 * Legacy API: getCurrentTier()
 * @deprecated Use tierGate.getCurrentTier() instead
 */
function getCurrentTier() {
  return tierGate.getCurrentTier();
}

/**
 * Legacy API: hasAccess()
 * @deprecated Use tierGate.hasAccess() instead
 */
function hasAccess(featurePath) {
  return tierGate.hasAccess(featurePath);
}

/**
 * Legacy API: requireAccess()
 * @deprecated Use tierGate.requireAccess() instead
 */
function requireAccess(featurePath) {
  return tierGate.requireAccess(featurePath);
}

/**
 * Legacy API: getEnabledIntelligence()
 * @deprecated Use tierGate.getEnabledIntelligence() instead
 */
function getEnabledIntelligence() {
  return tierGate.getEnabledIntelligence();
}

/**
 * Legacy API: getDashboardInfo()
 */
function getDashboardInfo() {
  const licenseInfo = getLicenseInfo();
  const tierInfo = tierGate.getCurrentTier();

  if (!licenseInfo) {
    return {
      loggedIn: false,
      tier: 'FREE',
      message: 'Not logged in - using FREE tier'
    };
  }

  return {
    loggedIn: true,
    tier: tierInfo.tier,
    email: licenseInfo.email,
    displayName: licenseInfo.displayName,
    subscriptionStatus: licenseInfo.subscriptionStatus,
    subscriptionEndDate: licenseInfo.subscriptionEndDate,
    features: tierInfo.features
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // New unified API (recommended)
  TierGateSystem,
  tierGate,  // Singleton instance

  // Legacy API (backward compatibility)
  getCurrentTier,
  hasAccess,
  requireAccess,
  getEnabledIntelligence,
  getDashboardInfo,

  // Constants (for reference)
  TIER_FEATURES
};

// ============================================================================
// CLI TESTING
// ============================================================================

if (require.main === module) {
  console.log('\n🎖️ ESMC 3.62 - Tier Gate (Consolidated PRE-BRAIN)\n');

  const status = tierGate.getStatus();

  console.log('📊 TIER STATUS:\n');
  console.log(JSON.stringify(status, null, 2));

  console.log('\n🔍 INTELLIGENCE COMPONENTS:\n');
  const enabled = tierGate.getEnabledIntelligence();
  enabled.forEach(comp => {
    console.log(`   ✅ ${comp}: Enabled`);
  });

  console.log('\n🧠 MEMORY CAPABILITIES:\n');
  const memory = tierGate.getMemoryCapabilities();
  Object.keys(memory).forEach(feature => {
    const icon = memory[feature] ? '✅' : '❌';
    console.log(`   ${icon} ${feature}: ${memory[feature]}`);
  });

  console.log('\n🗺️ ATLAS TIERS:\n');
  const atlasTiers = tierGate.getAtlasTiers();
  console.log(`   Available: ${atlasTiers.join(', ')}`);

  console.log('\n🔮 HYDRA:\n');
  const hydra = tierGate.isHydraEnabled();
  console.log(`   ${hydra ? '✅' : '❌'} HYDRA Enabled: ${hydra}`);

  console.log('\n✅ Tier Gate Test Complete\n');
}
