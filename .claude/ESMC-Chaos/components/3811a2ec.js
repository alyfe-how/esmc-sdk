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
/** ESMC SDK MODULE C: LICENSE MANAGER | 2025-10-19 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: Missing link between CLI (Module B) and SDK (Module A) - encrypted license management
 *  Features: AES-256-GCM encryption | HMAC-SHA256 signature | Filename obfuscation | Write/read/validate operations
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
 *
 * SUPERCHAOS V3.0 UPDATE:
 * - Secrets REMOVED from SDK (security vulnerability)
 * - License validation now via Vercel Edge API
 * - Local license file only stores encrypted user data + tier cache
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
  // 🔐 SECURITY: Keys NO LONGER in SDK - validation via Vercel API
  // These are placeholder values only used for local file structure
  MASTER_KEY: null, // ⚠️ REMOVED - Use Vercel API for validation
  SIGNATURE_KEY: null, // ⚠️ REMOVED - Use Vercel API for validation

  // License file directory (ESMC 3.64: Dynamic project root detection)
  // Pattern: {PROJECT_ROOT}/.claude/ (unified path for both SDK and Claude Code)
  LICENSE_DIR: path.join(findProjectRoot(), '.claude'),

  // File extension
  FILE_EXTENSION: '.lic',

  // License version
  VERSION: '3.0.0', // SUPERCHAOS V3.0

  // Vercel API endpoint for license validation (🔧 FIXED: Using production domain)
  VERCEL_API_URL: 'https://esmc-sdk.com/api/esmc/sdk/verify-license',

  // ESMC 3.78: Dual Grace Period System
  // - Offline grace: 7 days (network unavailable - full offline support)
  // - Tier sync grace: 24 hours (tier validation - catches tier changes faster)
  GRACE_PERIOD_OFFLINE_DAYS: 7,        // Full offline work window
  GRACE_PERIOD_TIER_SYNC_HOURS: 24,    // Tier revalidation window

  // Legacy support (maps to offline grace)
  GRACE_PERIOD_DAYS: 7
};

// ============================================================================
// MACHINE FINGERPRINTING
// ============================================================================

/**
 * Generate unique machine ID (hardware fingerprint)
 * Binds license to specific machine
 * @returns {string} - Machine ID hash
 */
function generateMachineId() {
  const platform = os.platform();
  const hostname = os.hostname();
  const cpus = os.cpus().map(cpu => cpu.model).join('');
  const totalmem = os.totalmem();

  // Get network interfaces
  const networkInterfaces = os.networkInterfaces();
  const macAddresses = [];

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
        macAddresses.push(iface.mac);
      }
    }
  }

  // Combine all hardware identifiers
  const hardwareString = `${platform}|${hostname}|${cpus}|${totalmem}|${macAddresses.sort().join(',')}`;

  // Hash to create machine ID
  return crypto.createHash('sha256').update(hardwareString).digest('hex');
}

/**
 * Generate obfuscated license filename
 * Based on machine ID + timestamp (deterministic for same machine)
 * @param {string} machineId - Machine ID
 * @returns {string} - Obfuscated filename (e.g., "0x7f3a2b1c.lic")
 */
function generateLicenseFilename(machineId) {
  // Use first 8 characters of machine ID hash for filename
  const hash = crypto.createHash('sha256').update(machineId + 'ESMC').digest('hex');
  return `0x${hash.substring(0, 8)}${LICENSE_CONFIG.FILE_EXTENSION}`;
}

/**
 * Get full license file path for current machine
 * @returns {string} - Full path to license file
 */
function getLicenseFilePath() {
  const machineId = generateMachineId();
  const filename = generateLicenseFilename(machineId);
  return path.join(LICENSE_CONFIG.LICENSE_DIR, filename);
}

// ============================================================================
// GUARDIAN BLESSING TOKENS (Auth-Guardian Fusion)
// ============================================================================

/**
 * Guardian Blessing Secret (used for HMAC signing) - ESMC 3.20.2
 * CRITICAL: This is the Auth-Guardian fusion secret
 *
 * SECURITY: Reads from environment variables (auto-rotates every sync)
 * - Primary: GUARDIAN_BLESSING_SECRET_ROTATION (rotating secret - syncs with every SUPERCHAOS)
 * - Legacy: GUARDIAN_BLESSING_SECRET (static fallback for backwards compatibility)
 * - Hardcoded: Fallback only if environment variables unavailable
 */
const GUARDIAN_SECRET =
  process.env.GUARDIAN_BLESSING_SECRET_ROTATION ||
  process.env.GUARDIAN_BLESSING_SECRET ||
  'ESMC_GUARDIAN_BLESSING_SECRET_2025_AUTH_FUSION';

/**
 * Generate Guardian Blessing Token
 * This token is required to decrypt ESMC components
 * @param {object} userData - User data from authentication
 * @param {string} machineId - Machine ID for binding
 * @returns {object} - Blessing token
 */
function generateBlessingToken(userData, machineId, deviceInfo = null) {
  const now = Date.now();

  // 🔧 FIXED: Standardized on subscriptionEndDate (matches Firestore schema)
  const expiresAt = userData.subscriptionEndDate
    ? new Date(userData.subscriptionEndDate).getTime()
    : now + (365 * 24 * 60 * 60 * 1000); // 1 year default

  const sessionId = crypto.randomBytes(8).toString('hex');

  // Blessing payload
  const blessing = {
    valid: true,
    tier: userData.tier || 'FREE',
    userId: userData.userId,
    machineId: machineId,
    timestamp: now,
    expiresAt: expiresAt,
    sessionId: sessionId,

    // 🆕 Device metadata for Active Device tracking
    device: deviceInfo ? {
      platform: deviceInfo.platform,
      hostname: deviceInfo.hostname,
      arch: deviceInfo.arch,
      release: deviceInfo.release,
      displayName: deviceInfo.displayName, // e.g., "Windows 11 - DESKTOP-XYZ"
      lastSeen: now
    } : null
  };

  // HMAC signature for blessing authenticity
  const hmac = crypto.createHmac('sha256', GUARDIAN_SECRET);
  hmac.update(JSON.stringify(blessing));
  blessing.signature = hmac.digest('hex');

  return blessing;
}

/**
 * Verify Guardian Blessing Token
 * @param {object} blessing - Blessing token to verify
 * @returns {boolean} - True if blessing is valid
 */
function verifyBlessingToken(blessing) {
  if (!blessing || !blessing.signature) {
    return false;
  }

  // Check expiration
  if (Date.now() > blessing.expiresAt) {
    console.warn('⚠️  Blessing token expired');
    return false;
  }

  // Verify machine binding
  const currentMachineId = generateMachineId();
  if (blessing.machineId !== currentMachineId) {
    console.warn('⚠️  Blessing token machine binding mismatch');
    return false;
  }

  // Verify HMAC signature
  const {signature, ...blessingWithoutSig} = blessing;
  const hmac = crypto.createHmac('sha256', GUARDIAN_SECRET);
  hmac.update(JSON.stringify(blessingWithoutSig));
  const expectedSignature = hmac.digest('hex');

  if (expectedSignature !== signature) {
    console.warn('⚠️  Blessing token signature verification failed');
    return false;
  }

  return true;
}

// ============================================================================
// LICENSE DATA STRUCTURE
// ============================================================================

/**
 * Get device information for display
 * @returns {object} - Device metadata
 */
function getDeviceInfo() {
  const platform = os.platform();
  const hostname = os.hostname();
  const arch = os.arch();
  const release = os.release();

  // Create human-readable display name
  let displayName = '';

  if (platform === 'win32') {
    // Windows - show version from release
    const winVersion = release.startsWith('10.0') ? '11' : '10';
    displayName = `Windows ${winVersion} - ${hostname}`;
  } else if (platform === 'darwin') {
    // macOS
    displayName = `macOS - ${hostname}`;
  } else if (platform === 'linux') {
    // Linux
    displayName = `Linux ${arch} - ${hostname}`;
  } else {
    displayName = `${platform} - ${hostname}`;
  }

  return {
    platform,
    hostname,
    arch,
    release,
    displayName
  };
}

/**
 * Create license data object with embedded blessing token
 * @param {object} userData - User data from authentication
 * @returns {object} - License data structure with blessing
 */
function createLicenseData(userData) {
  const machineId = generateMachineId();
  const deviceInfo = getDeviceInfo();

  // Generate Guardian Blessing Token (Auth-Guardian Fusion) with device info
  const blessing = generateBlessingToken(userData, machineId, deviceInfo);

  return {
    version: LICENSE_CONFIG.VERSION,

    // User information
    email: userData.email,
    userId: userData.userId,
    displayName: userData.displayName || userData.email.split('@')[0],

    // Subscription information (🔧 FIXED: Using subscriptionEndDate consistently)
    tier: userData.tier || 'FREE', // FREE, PRO, ENTERPRISE
    subscriptionStatus: userData.subscriptionStatus || 'active', // active, expired, cancelled
    subscriptionEndDate: userData.subscriptionEndDate || null,

    // Machine binding
    machineId: machineId,

    // 🆕 Device information
    device: deviceInfo,

    // Timestamps
    issuedAt: new Date().toISOString(),
    lastValidated: new Date().toISOString(),

    // Additional metadata
    features: userData.features || [],
    maxDevices: userData.maxDevices || 1,

    // Security
    licenseId: crypto.randomBytes(16).toString('hex'),

    // AUTH-GUARDIAN FUSION: Blessing token embedded in license
    blessing: blessing
  };
}

// ============================================================================
// ENCRYPTION & DECRYPTION
// ============================================================================

/**
 * Derive encryption key from master key + machine ID
 * @param {string} machineId - Machine ID
 * @returns {Buffer} - Derived key (32 bytes for AES-256)
 */
function deriveKey(machineId) {
  return crypto.pbkdf2Sync(
    LICENSE_CONFIG.MASTER_KEY,
    machineId,
    100000, // iterations
    32,     // key length (256 bits)
    'sha256'
  );
}

/**
 * Encrypt license data
 * @param {object} licenseData - License data object
 * @param {string} machineId - Machine ID
 * @returns {object} - Encrypted license package
 */
function encryptLicense(licenseData, machineId) {
  // Derive encryption key
  const key = deriveKey(machineId);
  const iv = crypto.randomBytes(12); // 12 bytes for GCM

  // Encrypt license data
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const licenseJSON = JSON.stringify(licenseData);

  let encrypted = cipher.update(licenseJSON, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Generate HMAC signature for integrity
  const hmac = crypto.createHmac('sha256', LICENSE_CONFIG.SIGNATURE_KEY);
  hmac.update(encrypted);
  const signature = hmac.digest('hex');

  return {
    version: LICENSE_CONFIG.VERSION,
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    signature: signature,
    machineId: machineId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Decrypt license data
 * @param {object} encryptedPackage - Encrypted license package
 * @returns {object} - Decrypted license data or null if invalid
 */
function decryptLicense(encryptedPackage) {
  try {
    const currentMachineId = generateMachineId();

    // Verify machine ID matches
    if (encryptedPackage.machineId !== currentMachineId) {
      throw new Error('License is bound to different machine');
    }

    // Verify signature (integrity check)
    const hmac = crypto.createHmac('sha256', LICENSE_CONFIG.SIGNATURE_KEY);
    hmac.update(encryptedPackage.encrypted);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== encryptedPackage.signature) {
      throw new Error('License signature verification failed - file may be tampered');
    }

    // Decrypt
    const key = deriveKey(currentMachineId);
    const iv = Buffer.from(encryptedPackage.iv, 'hex');
    const authTag = Buffer.from(encryptedPackage.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedPackage.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);

  } catch (error) {
    console.error('License decryption failed:', error.message);
    return null;
  }
}

// ============================================================================
// LICENSE FILE I/O
// ============================================================================

/**
 * Write encrypted license file
 * Called by Dashboard/CLI after successful login
 * @param {object} userData - User data from authentication
 * @returns {object} - Result with success status and file path
 */
function writeLicenseFile(userData) {
  try {
    const machineId = generateMachineId();
    const licenseData = createLicenseData(userData);
    const encryptedPackage = encryptLicense(licenseData, machineId);
    const filePath = getLicenseFilePath();

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(encryptedPackage, null, 2), 'utf8');

    console.log('✅ License file created successfully');
    console.log(`   User: ${userData.email}`);
    console.log(`   Tier: ${userData.tier}`);
    console.log(`   File: ${path.basename(filePath)}`);
    console.log(`   Machine: ${machineId.substring(0, 16)}...`);

    return {
      success: true,
      filePath: filePath,
      filename: path.basename(filePath),
      machineId: machineId,
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
 * Read and decrypt license file
 * Called by tier-gate module for validation
 * @returns {object|null} - Decrypted license data or null if not found/invalid
 */
function readLicenseFile() {
  try {
    const filePath = getLicenseFilePath();

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('⚠️  No license file found - user not logged in or FREE tier');
      return null;
    }

    // Read encrypted package
    const encryptedPackage = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Decrypt and validate
    const licenseData = decryptLicense(encryptedPackage);

    if (!licenseData) {
      console.error('❌ License decryption failed');
      return null;
    }

    // Check expiry (🔧 FIXED: Using subscriptionEndDate consistently)
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
// LICENSE VALIDATION (SUPERCHAOS V3.0 - Vercel API)
// ============================================================================

/**
 * Validate license via Vercel Edge API
 * SUPERCHAOS V3.0: Server-side validation with zero secret exposure
 * @returns {Promise<object>} - Validation result with tier information
 */
async function validateLicenseRemote() {
  try {
    const machineId = generateMachineId();
    const deviceInfo = getDeviceInfo();
    const localLicense = readLicenseFile(); // Read cached license

    // Prepare request payload (🆕 includes device metadata)
    const payload = {
      machineId: machineId,
      userId: localLicense?.userId,
      email: localLicense?.email,
      tier: localLicense?.tier,
      lastValidated: localLicense?.lastValidated,

      // 🆕 Device metadata for Active Device tracking
      device: deviceInfo
    };

    // Call Vercel Edge API
    const response = await fetch(LICENSE_CONFIG.VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Vercel API returned ${response.status}`);
    }

    const result = await response.json();

    // Update local cache with fresh validation
    if (result.valid && result.userId) {
      const updatedLicense = {
        version: LICENSE_CONFIG.VERSION,
        email: result.email,
        userId: result.userId,
        displayName: result.displayName || result.email?.split('@')[0],
        tier: result.tier,
        subscriptionStatus: result.subscriptionStatus || 'active',
        subscriptionEndDate: result.subscriptionEndDate, // 🔧 FIXED: Standardized field name
        machineId: machineId,
        device: deviceInfo, // 🆕 Store device info
        issuedAt: localLicense?.issuedAt || new Date().toISOString(),
        lastValidated: new Date().toISOString(),
        features: result.features,
        blessing: result.blessing
      };

      // Write updated license to cache
      const filePath = getLicenseFilePath();
      fs.writeFileSync(filePath, JSON.stringify(updatedLicense, null, 2), 'utf8');
    }

    return {
      valid: result.valid,
      tier: result.tier,
      email: result.email,
      userId: result.userId,
      subscriptionStatus: result.subscriptionStatus,
      subscriptionEndDate: result.subscriptionEndDate, // 🔧 FIXED: Standardized field name
      features: result.features,
      blessing: result.blessing,
      gracePeriod: result.gracePeriod || false,
      lastValidated: new Date().toISOString()
    };

  } catch (error) {
    console.warn('⚠️  Vercel API validation failed:', error.message);

    // Fallback to local validation with grace period
    return validateLicenseLocal(error.message);
  }
}

/**
 * Validate license locally (fallback for offline mode)
 * Uses grace period to allow offline usage
 * @param {string} apiError - Error message from API call
 * @returns {object} - Validation result
 */
function validateLicenseLocal(apiError) {
  const licenseData = readLicenseFile();

  if (!licenseData) {
    return {
      valid: false,
      tier: 'FREE',
      reason: 'No license file found',
      error: apiError
    };
  }

  // Check grace period (7 days from last validation)
  const lastValidated = new Date(licenseData.lastValidated || 0);
  const now = new Date();
  const daysSinceValidation = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceValidation > LICENSE_CONFIG.GRACE_PERIOD_DAYS) {
    console.warn(`⚠️  License grace period expired (${Math.floor(daysSinceValidation)} days since last validation)`);
    return {
      valid: false,
      tier: 'FREE',
      reason: `Grace period expired. Please connect to internet to revalidate. (Offline for ${Math.floor(daysSinceValidation)} days)`,
      error: apiError
    };
  }

  console.log(`✅ Using offline grace period (${LICENSE_CONFIG.GRACE_PERIOD_DAYS - Math.floor(daysSinceValidation)} days remaining)`);

  return {
    valid: true,
    tier: licenseData.tier,
    email: licenseData.email,
    userId: licenseData.userId,
    subscriptionStatus: licenseData.subscriptionStatus,
    subscriptionEndDate: licenseData.subscriptionEndDate, // 🔧 FIXED: Standardized field name
    features: licenseData.features,
    blessing: licenseData.blessing,
    issuedAt: licenseData.issuedAt,
    lastValidated: licenseData.lastValidated,
    gracePeriod: true,
    graceDaysRemaining: LICENSE_CONFIG.GRACE_PERIOD_DAYS - Math.floor(daysSinceValidation)
  };
}

/**
 * Synchronous wrapper for validateLicense (for backward compatibility)
 * @returns {object} - Validation result (uses cached data)
 */
function validateLicense() {
  // For synchronous calls, use local validation only
  return validateLicenseLocal('Synchronous call - using cached license');
}

/**
 * Get license info (for dashboard display)
 * @returns {object|null} - License info or null
 */
function getLicenseInfo() {
  return readLicenseFile();
}

// ============================================================================
// VERCEL CHECKSUM VALIDATION (LAYER 2 DEFENSE - ESMC 3.79)
// ============================================================================

/**
 * Validate Vercel Checksum Rotation (Anti-Replay Layer)
 * SECURITY: Prevents license file replay attacks by validating rotation timestamp
 *
 * Layer 2 of 5-layer defense:
 * - Layer 1: Guardian Blessing HMAC (prevents tampering)
 * - Layer 2: Vercel Checksum Rotation (prevents replay) ← THIS FUNCTION
 * - Layer 3: Machine ID Binding (prevents cross-device)
 * - Layer 4: Timestamp Expiry (blocks expired)
 * - Layer 5: Smart Revalidation (24h tier sync)
 *
 * Checksum structure: { rotation: timestamp, value: HMAC(email+tier+rotation+SALT) }
 *
 * @param {string} email - User email
 * @param {string} tier - User tier (FREE/PRO/MAX/VIP)
 * @param {object} vercelChecksum - Checksum object {rotation, value}
 * @returns {Promise<boolean>} - True if checksum valid, false otherwise
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
// EXPORTS
// ============================================================================

module.exports = {
  // Write operations (for Dashboard/CLI)
  writeLicenseFile,
  updateLicenseFile,
  deleteLicenseFile,

  // Read operations (for tier-gate)
  readLicenseFile,
  validateLicense,         // Synchronous (uses cached data)
  validateLicenseRemote,   // 🆕 Async (calls Vercel API)
  validateLicenseLocal,    // 🆕 Fallback (offline grace period)
  getLicenseInfo,

  // Security validation (ESMC 3.79 - Layer 2 Defense)
  validateVercelChecksum,  // 🆕 Anti-replay checksum validation

  // Utilities
  generateMachineId,
  getLicenseFilePath,
  getDeviceInfo,           // 🆕 Device metadata

  // Auth-Guardian Fusion
  generateBlessingToken,
  verifyBlessingToken,
  GUARDIAN_SECRET,

  // Configuration
  LICENSE_CONFIG,

  // For testing
  _test: {
    createLicenseData,
    encryptLicense,
    decryptLicense,
    deriveKey,
    generateBlessingToken,
    verifyBlessingToken,
    getDeviceInfo,
    validateVercelChecksum  // 🆕 Expose for testing
  }
};
