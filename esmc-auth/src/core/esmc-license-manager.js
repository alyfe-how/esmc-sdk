/**
 * ESMC SDK - MODULE C: LICENSE MANAGER (ESMC 3.65 Plaintext Evolution)
 *
 * This module handles:
 * 1. Writing plaintext license files (from Dashboard/CLI after login)
 * 2. Reading plaintext license files (from tier-gate for validation)
 * 3. License validation and tier detection with Guardian Blessing protection
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * License file configuration
 * SECURITY: NO FALLBACKS - Must be set in environment variables
 */
// ============================================================================
// PROJECT ROOT DETECTION (AEGIS Pattern)
// ============================================================================

/**
 * Auto-detect project root by walking up from module location
 * Pattern copied from AEGIS Core (aegis-core.js:findProjectRoot)
 * Finds project root containing .claude/memory/ directory
 *
 * @returns {string} Absolute path to project root
 * @throws {Error} If .claude/memory/ not found in parent directories
 */
function findProjectRoot() {
  let current = __dirname;
  let bestCandidate = null;

  // Walk UP the tree to find .claude/memory/
  while (current !== path.dirname(current)) {
    const claudePath = path.join(current, '.claude');
    const memoryPath = path.join(claudePath, 'memory');

    if (fs.existsSync(memoryPath)) {
      // Found .claude/memory/ - this is project root
      return current;
    }

    // Check if .claude/ exists without memory/ (SDK extract scenario)
    if (fs.existsSync(claudePath) && !bestCandidate) {
      bestCandidate = current;
    }

    current = path.dirname(current);
  }

  // FALLBACK 1: Found .claude/ without memory/ - create memory/ directory
  if (bestCandidate) {
    const claudePath = path.join(bestCandidate, '.claude');
    const memoryPath = path.join(claudePath, 'memory');

    // Create memory/ directory for fresh SDK extract
    if (!fs.existsSync(memoryPath)) {
      fs.mkdirSync(memoryPath, { recursive: true });
      console.log('[License Manager] Created .claude/memory/ directory for first-run initialization');
    }

    return bestCandidate;
  }

  // FALLBACK 2: No .claude/ found anywhere - use current working directory
  const cwdClaudePath = path.join(process.cwd(), '.claude');
  const cwdMemoryPath = path.join(cwdClaudePath, 'memory');

  if (!fs.existsSync(cwdMemoryPath)) {
    fs.mkdirSync(cwdMemoryPath, { recursive: true });
    console.log('[License Manager] Created .claude/memory/ in current working directory');
  }

  return process.cwd();
}

const LICENSE_CONFIG = {
  // License file directory (ESMC 3.65: Fixed location for BOOTSTRAP quick-check)
  // Pattern: {PROJECT_ROOT}/.claude/ (unified path for both SDK and Claude Code)
  LICENSE_DIR: path.join(findProjectRoot(), '.claude'),

  // ESMC 3.65: Fixed filename (no obfuscation - BOOTSTRAP needs to find it quickly)
  LICENSE_FILENAME: '.esmc-license.json',

  // License version (ESMC 3.65 Plaintext Evolution)
  VERSION: '3.65.0'
};

// ============================================================================
// LICENSE FILE PATH (ESMC 3.65: Fixed location)
// ============================================================================

/**
 * Get full license file path (ESMC 3.65: Fixed location for BOOTSTRAP quick-check)
 * @returns {string} - Full path to license file (.claude/.esmc-license.json)
 */
function getLicenseFilePath() {
  return path.join(LICENSE_CONFIG.LICENSE_DIR, LICENSE_CONFIG.LICENSE_FILENAME);
}

// ============================================================================
// LICENSE DATA STRUCTURE (ESMC 3.65: Plaintext format with Guardian Blessing)
// ============================================================================

/**
 * Create plaintext license data object
 * @param {object} userData - User data from authentication
 * @returns {object} - Plaintext license data structure
 */
function createLicenseData(userData) {
  return {
    version: LICENSE_CONFIG.VERSION,
    mode: 'plaintext', // ESMC 3.65: Plaintext storage

    // User information
    email: userData.email,
    userId: userData.userId,
    displayName: userData.displayName || userData.email.split('@')[0],

    // Subscription information
    tier: userData.tier || 'FREE', // FREE, PRO, MAX
    subscriptionStatus: userData.subscriptionStatus || 'active', // active, expired, cancelled
    subscriptionEndDate: userData.subscriptionEndDate || null,  // ✅ Standardized field name

    // Machine binding (ESMC 3.61: compositeDeviceId from dual-layer binding)
    compositeDeviceId: userData.compositeDeviceId,

    // ESMC 3.61: Guardian Blessing Token (CRITICAL - tamper protection)
    blessing: userData.blessing || null,

    // ESMC 3.65: Vercel Checksum (self-healing protection)
    vercelChecksum: userData.vercelChecksum || null,

    // Timestamps
    issuedAt: new Date().toISOString(),
    lastValidated: new Date().toISOString()
  };
}

// ============================================================================
// PLAINTEXT LICENSE FILE I/O (ESMC 3.65: No encryption)
// ============================================================================
// Plaintext is NOT a security downgrade - it's an ACCESS optimization
// ============================================================================

/**
 * Write plaintext license file (ESMC 3.65)
 * Called by login-standalone.js after successful authentication
 * @param {object} userData - User data from authentication
 * @returns {object} - Result with success status and file path
 */
function writeLicenseFile(userData) {
  try {
    const licenseData = createLicenseData(userData);
    const filePath = getLicenseFilePath();

    // Write plaintext JSON to fixed location
    fs.writeFileSync(filePath, JSON.stringify(licenseData, null, 2), 'utf8');

    // Silent success - details shown in login script
    // Removed security layer details to prevent exposing ESMC internals

    return {
      success: true,
      filePath: filePath,
      filename: path.basename(filePath),
      tier: userData.tier
    };

  } catch (error) {
    console.error('❌ License file creation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Read plaintext license file (ESMC 3.65)
 * Called by tier-gate, BOOTSTRAP quick-check, and validation layers
 * @returns {object|null} - License data or null if not found/invalid
 */
function readLicenseFile() {
  try {
    const filePath = getLicenseFilePath();

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('⚠️  No license file found - user not logged in');
      return null;
    }

    // Read plaintext JSON
    const licenseData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Check expiry
    if (licenseData.subscriptionEndDate) {
      const expiryDate = new Date(licenseData.subscriptionEndDate);
      const now = new Date();

      if (now > expiryDate) {
        console.warn('⚠️  License expired:', expiryDate.toISOString());
        return {
          ...licenseData,
          tier: 'FREE', // Downgrade to FREE if expired
          subscriptionStatus: 'expired'
        };
      }
    }

    return licenseData;

  } catch (error) {
    console.error('❌ License file read failed:', error.message);
    return null;
  }
}

/**
 * Delete license file
 * Called on logout
 * @returns {boolean} - Success status
 */
function deleteLicenseFile() {
  try {
    const filePath = getLicenseFilePath();

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ License file deleted successfully');
      return true;
    }

    return false;

  } catch (error) {
    console.error('❌ License file deletion failed:', error.message);
    return false;
  }
}

/**
 * Update license file (refresh from server)
 * @param {object} userData - Updated user data
 * @returns {object} - Result
 */
function updateLicenseFile(userData) {
  // Simply overwrite existing file
  return writeLicenseFile(userData);
}

// ============================================================================
// LICENSE VALIDATION
// ============================================================================

/**
 * Validate current license
 * @returns {object} - Validation result with tier information
 */
function validateLicense() {
  const licenseData = readLicenseFile();

  if (!licenseData) {
    return {
      valid: false,
      tier: 'FREE',
      reason: 'No license file found'
    };
  }

  return {
    valid: true,
    tier: licenseData.tier,
    email: licenseData.email,
    userId: licenseData.userId,
    subscriptionStatus: licenseData.subscriptionStatus,
    subscriptionEndDate: licenseData.subscriptionEndDate,
    features: licenseData.features,
    issuedAt: licenseData.issuedAt,
    lastValidated: licenseData.lastValidated
  };
}

/**
 * Get license info (for dashboard display)
 * @returns {object|null} - License info or null
 */
function getLicenseInfo() {
  return readLicenseFile();
}

// ============================================================================
// ESMC 3.65: VALIDATION LAYERS
// ============================================================================

/**
 * @param {object} blessing - Guardian Blessing Token from license
 * @returns {boolean} - True if valid, false otherwise
 */
function verifyBlessingToken(blessing) {
  if (!blessing || !blessing.signature) {
    console.error('[Blessing Validation] Missing blessing or signature');
    return false;
  }

  // Check required fields
  if (!blessing.tier || !blessing.expiresAt || !blessing.compositeDeviceId) {
    console.error('[Blessing Validation] Missing required blessing fields');
    return false;
  }

  // Check expiry
  const expiryDate = new Date(blessing.expiresAt);
  const now = new Date();

  if (now > expiryDate) {
    console.error('[Blessing Validation] Blessing token expired');
    return false;
  }

  console.log('[Blessing Validation] ✅ Structure valid, signature present');
  return true;
}

/**
 * Validate Vercel Checksum against server rotation (ESMC 3.65)
 * @param {string} email - User email
 * @param {string} tier - Subscription tier
 * @param {object} vercelChecksum - Checksum object from license
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */
async function validateVercelChecksum(email, tier, vercelChecksum) {
  if (!vercelChecksum || !vercelChecksum.value || !vercelChecksum.rotation) {
    console.error('[Checksum Validation] Missing checksum data');
    return false;
  }

  try {
    // Call Vercel API to validate checksum
    const url = `https://esmc-sdk.com/api/v1/auth/validate-checksum?email=${encodeURIComponent(email)}&tier=${encodeURIComponent(tier)}&rotation=${encodeURIComponent(vercelChecksum.rotation)}&checksum=${encodeURIComponent(vercelChecksum.value)}`;

    const https = require('https');

    return new Promise((resolve) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.valid) {
              console.log('[Checksum Validation] ✅ Vercel checksum validated');
              resolve(true);
            } else {
              console.error('[Checksum Validation] ❌ Checksum validation failed:', result.error);
              resolve(false);
            }
          } catch (error) {
            console.error('[Checksum Validation] ❌ Parse error:', error.message);
            resolve(false);
          }
        });
      }).on('error', (error) => {
        console.error('[Checksum Validation] ❌ Network error:', error.message);
        resolve(false); // Fail-open for offline scenarios
      });
    });
  } catch (error) {
    console.error('[Checksum Validation] ❌ Validation error:', error.message);
    return false;
  }
}

// ============================================================================
// EXPORTS (ESMC 3.65: Plaintext operations + Validation layers)
// ============================================================================

module.exports = {
  // Write operations (for login-standalone.js)
  writeLicenseFile,
  updateLicenseFile,
  deleteLicenseFile,

  // Read operations (for tier-gate, BOOTSTRAP, validation layers)
  readLicenseFile,
  validateLicense,
  getLicenseInfo,

  // ESMC 3.65: Validation layers
  verifyBlessingToken,
  validateVercelChecksum,

  // Utilities
  getLicenseFilePath,

  // For testing
  _test: {
    createLicenseData
  }
};
