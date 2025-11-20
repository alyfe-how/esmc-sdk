/**
 * ESMC 3.8 MCP Server - Credential Management
 * Reused from cli/utils/credentials.js with MCP-specific adaptations
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');
const { CREDENTIALS_PATH } = require('../config/constants.js');

const ALGORITHM = 'aes-256-cbc';

/**
 * Generate machine-specific encryption key
 * Hardware-bound security (same machine only)
 */
function getMachineKey() {
  const machineId = machineIdSync();
  return crypto.createHash('sha256').update(machineId).digest();
}

/**
 * Encrypt credential data
 */
function encrypt(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt credential data
 */
function decrypt(encryptedData, key) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = parts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

/**
 * Save encrypted credentials
 */
function saveCredentials(credentials) {
  const credDir = path.dirname(CREDENTIALS_PATH);

  // Create .esmc directory if not exists
  if (!fs.existsSync(credDir)) {
    fs.mkdirSync(credDir, { recursive: true });
  }

  // Encrypt with machine-specific key
  const key = getMachineKey();
  const encrypted = encrypt(credentials, key);

  // Write encrypted data
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify({ encrypted }), 'utf8');
}

/**
 * Load and decrypt credentials
 */
function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const key = getMachineKey();
    return decrypt(data.encrypted, key);
  } catch (error) {
    console.error('⚠️ Credentials corrupted or tampered:', error.message);
    return null;
  }
}

/**
 * Clear credentials (logout)
 */
function clearCredentials() {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    fs.unlinkSync(CREDENTIALS_PATH);
  }
}

/**
 * Check if credentials are expired
 */
function isExpired(credentials) {
  if (!credentials || !credentials.expiresAt) {
    return false; // FREE tier or no expiry
  }
  return new Date(credentials.expiresAt) < new Date();
}

module.exports = {
  saveCredentials,
  loadCredentials,
  clearCredentials,
  isExpired,
  getMachineKey
};
