/**
 * ESMC 3.8 MCP Server - Tier Management
 * Adapted from .claude/ESMC Complete/core/tier-manager.js
 * Updated to validate tokens with Vercel backend
 */

const { loadCredentials, isExpired, clearCredentials } = require('./credentials.js');
const { getHardwareId } = require('./hardware.js');
const { TIER_FEATURES, API_URL } = require('../config/constants.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 🔐 BRAIN CHECKSUMS (Read from Environment Variables)
// These SHA-256 checksums identify the OBFUSCATED real brain files among 898 decoys
// Updated during sync from production (obfuscated brain checksums)
// Sync session: 58fe0a53d04c6380 (2025-11-05)
//
// Local: Read from .env.local (auto-updated by sync script)
// Vercel: Read from Vercel Environment Variables (copy from .env.local after sync)
const BRAIN_CHECKSUMS = {
  FREE: process.env.ESMC_BRAIN_CHECKSUM_FREE || '5aaa515d2f69b2218593ac199a0df15560918e077020a8eb4fd257f9c2d5e682',
  PRO: process.env.ESMC_BRAIN_CHECKSUM_PRO || '952c81d89959f1c67c7d52264d7633d904b2ea99babe93844c5ae7e514b5b27b',
  MAX: process.env.ESMC_BRAIN_CHECKSUM_MAX || '1d55a5b27a5fa85cc89e98878201eba6e9a211e386da69e2f7a79df65f601897',
};

// SECURITY: Fail fast if environment variables not configured
if (!BRAIN_CHECKSUMS.FREE || !BRAIN_CHECKSUMS.PRO || !BRAIN_CHECKSUMS.MAX) {
  throw new Error(
    'ESMC brain checksums not configured. ' +
    'Local: Ensure esmc-website/.env.local exists (run sync script). ' +
    'Vercel: Set ESMC_BRAIN_CHECKSUM_FREE/PRO/MAX in Environment Variables.'
  );
}

class TierManager {
  constructor() {
    this.currentTier = 'FREE';
    this.credentials = null;
    this.features = TIER_FEATURES.FREE;
    this.brainPath = null; // Discovered brain file path
  }

  /**
   * Validate token with backend API
   */
  async validateWithBackend(token, hardwareId) {
    try {
      const response = await fetch(`${API_URL}/esmc/mcp/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, hardwareId })
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        return null;
      }

      return {
        tier: data.user.tier,
        email: data.user.email,
        name: data.user.name,
        expiresAt: data.user.expiresAt
      };
    } catch (error) {
      console.error('⚠️ Backend validation failed:', error.message);
      return null; // Fall back to local validation
    }
  }

  /**
   * Initialize tier system with backend validation
   */
  async initialize() {
    this.credentials = loadCredentials();

    if (!this.credentials) {
      // Not logged in - use FREE tier
      this.currentTier = 'FREE';
      this.features = TIER_FEATURES.FREE;
      return {
        tier: 'FREE',
        source: 'default',
        authenticated: false,
        message: 'Not logged in - using FREE tier'
      };
    }

    // Try backend validation first (server authority)
    const hardwareId = getHardwareId();
    const backendValidation = await this.validateWithBackend(this.credentials.token, hardwareId);

    if (backendValidation) {
      // Backend validation successful - use server data
      this.currentTier = backendValidation.tier || 'FREE';
      this.features = TIER_FEATURES[this.currentTier] || TIER_FEATURES.FREE;

      return {
        tier: this.currentTier,
        source: 'backend',
        authenticated: true,
        email: backendValidation.email,
        name: backendValidation.name,
        expiresAt: backendValidation.expiresAt
      };
    }

    // Backend validation failed - fall back to local validation
    // Check if expired and auto-cleanup
    if (isExpired(this.credentials)) {
      console.error('⚠️ Subscription expired - cleaning up credentials');
      clearCredentials();
      this.credentials = null;
      this.currentTier = 'FREE';
      this.features = TIER_FEATURES.FREE;
      return {
        tier: 'FREE',
        source: 'expired',
        authenticated: false,
        message: 'Subscription expired - reverted to FREE tier'
      };
    }

    // Valid local credentials (offline mode)
    this.currentTier = this.credentials.tier || 'FREE';
    this.features = TIER_FEATURES[this.currentTier] || TIER_FEATURES.FREE;

    return {
      tier: this.currentTier,
      source: 'local',
      authenticated: true,
      email: this.credentials.email,
      name: this.credentials.name,
      expiresAt: this.credentials.expiresAt
    };
  }

  /**
   * Get current tier
   */
  getTier() {
    return this.currentTier;
  }

  /**
   * Get enabled features
   */
  getFeatures() {
    return this.features;
  }

  /**
   * Check if intelligence component is enabled
   */
  isIntelligenceEnabled(component) {
    return this.features.intelligence.includes(component);
  }

  /**
   * Check if colonel is enabled
   */
  isColonelEnabled(colonel) {
    return this.features.colonels.includes(colonel);
  }

  /**
   * Check if module is enabled
   */
  isModuleEnabled(module) {
    return this.features.modules.includes(module);
  }

  /**
   * Get available colonels for task
   */
  getAvailableColonels(requiredColonels) {
    return requiredColonels.filter(colonel => this.isColonelEnabled(colonel));
  }

  /**
   * Check memory type
   */
  getMemoryType() {
    return this.features.memory;
  }

  /**
   * Validate tier access for command
   */
  validateAccess(requiredTier) {
    const tierHierarchy = ['FREE', 'PRO', 'MAX', 'VIP'];
    const currentLevel = tierHierarchy.indexOf(this.currentTier);
    const requiredLevel = tierHierarchy.indexOf(requiredTier);

    return currentLevel >= requiredLevel;
  }

  /**
   * Get user info
   */
  getUserInfo() {
    if (!this.credentials) {
      return null;
    }

    return {
      email: this.credentials.email,
      name: this.credentials.name,
      tier: this.currentTier,
      expiresAt: this.credentials.expiresAt
    };
  }

  /**
   * Check if user has MAX or VIP tier (for MySQL logging)
   */
  isMaxOrVip() {
    return this.currentTier === 'MAX' || this.currentTier === 'VIP';
  }

  /**
   * Check if MySQL battlefield intelligence is enabled (MAX/VIP feature)
   */
  isMySQLEnabled() {
    return this.isMaxOrVip();
  }

  /**
   * 🧠 DISCOVER REAL BRAIN FILE (300-File Decoy System)
   * Scans brain/ folder, calculates SHA-256, finds match for current tier
   * Returns path to real brain file (hidden among ~898 decoys)
   */
  async discoverBrainFile() {
    // If already discovered, return cached path
    if (this.brainPath) {
      return this.brainPath;
    }

    const brainDir = path.join(__dirname, '..', '..', '..', '.claude', 'ESMC Complete', 'core', 'brain');
    const targetChecksum = BRAIN_CHECKSUMS[this.currentTier];

    if (!targetChecksum) {
      throw new Error(`No brain checksum defined for tier: ${this.currentTier}`);
    }

    try {
      // Read all files in brain directory
      const files = fs.readdirSync(brainDir);

      console.log(`🔍 Searching ${files.length} brain files for ${this.currentTier} tier...`);

      // Scan files and calculate checksums
      for (const file of files) {
        if (!file.endsWith('.js')) continue;

        const filePath = path.join(brainDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Calculate SHA-256 checksum
        const checksum = crypto.createHash('sha256').update(content).digest('hex');

        // Check if this is the real brain
        if (checksum === targetChecksum) {
          this.brainPath = filePath;
          console.log(`✅ Real brain discovered: ${file} (${this.currentTier} tier)`);
          return filePath;
        }
      }

      // No match found - this shouldn't happen unless sync failed
      throw new Error(`Brain file not found for ${this.currentTier} tier (scanned ${files.length} files)`);

    } catch (error) {
      console.error('❌ Brain discovery failed:', error.message);
      throw error;
    }
  }

  /**
   * 🧠 LOAD BRAIN MODULE
   * Discovers and loads the real brain file for current tier
   */
  async loadBrain() {
    const brainPath = await this.discoverBrainFile();

    try {
      // Require the discovered brain file
      const brain = require(brainPath);
      console.log(`✅ Brain loaded successfully (${this.currentTier} tier)`);
      return brain;
    } catch (error) {
      console.error('❌ Brain loading failed:', error.message);
      throw error;
    }
  }
}

module.exports = TierManager;
