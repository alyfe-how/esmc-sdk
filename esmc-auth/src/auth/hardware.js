/**
 * ESMC 3.8 MCP Server - Hardware Identification
 * Reused from cli/utils/hardware.js
 */

const os = require('os');
const crypto = require('crypto');

/**
 * Generate base machine ID without external dependencies
 * Replicates node-machine-id functionality using Node.js built-ins
 */
function generateBaseMachineId() {
  const platform = os.platform();
  const hostname = os.hostname();
  const cpus = os.cpus().map(cpu => cpu.model).join('');
  const totalmem = os.totalmem();

  // Get all MAC addresses
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

  // Combine hardware identifiers
  const hardwareString = `${platform}|${hostname}|${cpus}|${totalmem}|${macAddresses.sort().join(',')}`;
  return crypto.createHash('sha256').update(hardwareString).digest('hex');
}

/**
 * Get unique hardware ID (Multi-factor cryptographic fingerprint)
 *
 * Security: Combines multiple hardware characteristics to prevent spoofing
 * - Machine ID (platform, hostname, CPU, memory, MAC addresses)
 * - System characteristics (hostname, RAM, CPU model)
 * - Cryptographic hash (SHA-256)
 *
 * CRITICAL: NEVER allow environment variable override
 */
function getHardwareId() {
  try {
    // Base machine ID (cryptographically secure, no external deps)
    const machineId = generateBaseMachineId();

    // Additional hardware factors (harder to spoof)
    const hostname = os.hostname();
    const cpuModel = os.cpus()[0]?.model || 'unknown';
    const totalMemory = os.totalmem();
    const arch = os.arch();

    // Get primary network interface MAC (if available)
    let primaryMac = 'no-mac';
    try {
      const networkInterfaces = os.networkInterfaces();
      const primaryInterface = Object.keys(networkInterfaces).find(name =>
        !name.includes('loopback') && !name.includes('virtual')
      );
      if (primaryInterface && networkInterfaces[primaryInterface][0]) {
        primaryMac = networkInterfaces[primaryInterface][0].mac;
      }
    } catch (e) {
      // MAC detection failed, continue with other factors
    }

    // Combine all factors with delimiters
    const fingerprintData = [
      machineId,
      hostname,
      cpuModel.substring(0, 50), // Truncate long CPU names
      totalMemory.toString(),
      arch,
      primaryMac
    ].join('|');

    // SHA-256 hash of combined fingerprint
    const fingerprint = crypto.createHash('sha256')
      .update(fingerprintData)
      .digest('hex');

    // SECURITY: Explicitly reject environment variable override attempts
    if (process.env.ESMC_HARDWARE_ID && process.env.ESMC_HARDWARE_ID !== fingerprint) {
      console.warn('⚠️  SECURITY WARNING: Attempted hardware ID spoofing detected!');
      console.warn('   Environment variable ESMC_HARDWARE_ID will be ignored.');
      console.warn('   Using cryptographically derived hardware fingerprint.');
    }

    return fingerprint;
  } catch (error) {
    console.error('Error getting hardware ID:', error.message);
    // Fallback: still return a deterministic ID, but log the issue
    const fallbackId = crypto.createHash('sha256')
      .update(os.hostname() + os.arch())
      .digest('hex');
    return fallbackId;
  }
}

/**
 * Get device name
 */
function getDeviceName() {
  return os.hostname() || 'Unknown Device';
}

/**
 * Get OS information
 */
function getOSInfo() {
  return {
    platform: os.type(),
    release: os.release(),
    arch: os.arch(),
    toString() {
      return `${this.platform} ${this.release} (${this.arch})`;
    }
  };
}

module.exports = {
  getHardwareId,
  getDeviceName,
  getOSInfo
};
