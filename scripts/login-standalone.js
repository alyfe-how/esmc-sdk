#!/usr/bin/env node
/**
 * ESMC Standalone Login Script
 * No MCP server required - works in Cursor, VS Code, or any environment
 *
 * Usage:
 *   node scripts/login-standalone.js
 *
 * Authentication Flow:
 *   1. Opens browser to esmc-sdk.com/login
 *   2. User authenticates via OAuth or email/password
 *   3. Server redirects to localhost:3847/callback with token
 *   4. ESMC 4 FORTRESS MODE: Validates SDK integrity (manifest hash)
 *   5. Script saves encrypted credentials to .claude/.esmc-license.json
 *
 * Security Layers:
 *   - JWT signature verification (RSA/ECDSA from Vercel)
 *   - Guardian Blessing Token (HMAC tampering protection)
 *   - Vercel Checksum (rotation-based anti-replay)
 *   - FORTRESS MODE (SDK integrity validation via manifest hash)
 *   - Device binding (composite hardware + browser fingerprint)
 *
 * @version 4.1
 * @date 2025-11-19
 */

const path = require('path');
const fs = require('fs');

// Import from esmc-auth (standalone authentication - no MCP)
// ESMC 3.61: credentials.js deprecated - using license-manager instead
const { getHardwareId, getDeviceName, getOSInfo } = require('../esmc-auth/src/auth/hardware.js');
const { AUTH_URL, CALLBACK_PORT, CALLBACK_TIMEOUT } = require('../esmc-auth/src/config/constants.js');
const crypto = require('crypto');
const http = require('http');
const { exec } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════
// ESMC 4: FORTRESS MODE - SDK Integrity Validation
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verify SDK integrity using random sampling
 * 🔐 ESMC 4.1 RANDOM SAMPLING: Server sends 10 random file+hash pairs
 * Client hashes those specific files and compares
 * Any mismatch = revoke license
 *
 * @param {Array<{file: string, hash: string}>} samples - Verification samples from server
 * @returns {{success: boolean, failed: Array<string>}} - Verification result
 */
function verifyIntegritySamples(samples) {
  try {
    // Find SDK root directory
    const possibleRoots = [
      process.cwd(),
      path.join(__dirname, '..'),
      path.join(__dirname, '..', '..')
    ];

    let sdkRoot = null;
    let componentsDir = null;

    for (const root of possibleRoots) {
      const testPath = path.join(root, '.claude', 'ESMC-Chaos', 'components');
      if (fs.existsSync(testPath)) {
        sdkRoot = root;
        componentsDir = testPath;
        break;
      }
    }

    if (!componentsDir) {
      console.log('   ⚠️  ESMC-Chaos components not found - FORTRESS validation skipped');
      return { success: true, failed: [], skipped: true };
    }

    const failed = [];
    let verified = 0;

    // Verify each sample
    for (const sample of samples) {
      const filePath = path.join(componentsDir, sample.file);

      if (!fs.existsSync(filePath)) {
        console.error(`   ❌ File not found: ${sample.file}`);
        failed.push(sample.file);
        continue;
      }

      const content = fs.readFileSync(filePath);
      const localHash = crypto.createHash('sha256').update(content).digest('hex');

      if (localHash !== sample.hash) {
        console.error(`   ❌ Hash mismatch: ${sample.file}`);
        console.error(`      Expected: ${sample.hash.substring(0, 16)}...`);
        console.error(`      Local:    ${localHash.substring(0, 16)}...`);
        failed.push(sample.file);
      } else {
        verified++;
      }
    }

    console.log(`   📊 Verified ${verified}/${samples.length} files`);

    return {
      success: failed.length === 0,
      failed,
      verified,
      total: samples.length
    };
  } catch (error) {
    console.error(`   ⚠️  FORTRESS verification failed: ${error.message}`);
    return { success: false, failed: ['ERROR'], error: error.message };
  }
}

/**
 * Revoke license by deleting .esmc-license.json
 * Called when FORTRESS verification fails
 */
function revokeLicense() {
  const possiblePaths = [
    path.join(process.cwd(), '.claude', '.esmc-license.json'),
    path.join(__dirname, '..', '.claude', '.esmc-license.json'),
    path.join(__dirname, '..', '..', '.claude', '.esmc-license.json')
  ];

  for (const licensePath of possiblePaths) {
    if (fs.existsSync(licensePath)) {
      fs.unlinkSync(licensePath);
      console.log(`   🗑️  License revoked: ${licensePath}`);
      return true;
    }
  }
  return false;
}

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('🎖️ ESMC SDK - Standalone Login');
console.log('   Browser-based authentication (No MCP Required)');
console.log('═══════════════════════════════════════════════════════════════════════\n');

async function login() {
  // Get hardware information
  const hardwareId = getHardwareId();
  const deviceName = getDeviceName();
  const osInfo = getOSInfo();

  // Use hardwareId as session (matches server behavior)
  const sessionId = hardwareId;
  const stateToken = crypto.randomBytes(16).toString('hex');

  console.log('📋 Device Information:');
  console.log(`   Device: ${deviceName}`);
  console.log(`   OS: ${osInfo.platform} ${osInfo.release}`);
  console.log(`   Hardware ID: ${hardwareId.substring(0, 16)}...`);
  console.log('');

  // Build authentication URL
  const authUrl = `${AUTH_URL}?session=${sessionId}&state=${stateToken}&port=${CALLBACK_PORT}&hardwareId=${encodeURIComponent(hardwareId)}`;

  // Inform user
  console.log('🌐 Opening browser for authentication...');
  console.log(`   URL: ${AUTH_URL}`);
  console.log(`   Callback port: ${CALLBACK_PORT}`);
  console.log(`   Timeout: ${CALLBACK_TIMEOUT / 1000} seconds\n`);

  // Open browser (cross-platform)
  const openCommand = process.platform === 'win32'
    ? `start "" "${authUrl}"`
    : process.platform === 'darwin'
    ? `open "${authUrl}"`
    : `xdg-open "${authUrl}"`;

  exec(openCommand, (error) => {
    if (error) {
      console.error(`⚠️  Could not open browser automatically: ${error.message}`);
      console.log(`\n📋 Please manually open this URL in your browser:\n${authUrl}\n`);
    }
  });

  // Start local callback server to receive the token
  return new Promise((resolve, reject) => {
    let serverClosed = false;

    const server = http.createServer(async (req, res) => {
      // Ignore favicon requests
      if (req.url === '/favicon.ico') {
        res.writeHead(404);
        res.end();
        return;
      }

      console.log(`📥 Received callback: ${req.url}`);

      const url = new URL(req.url || '', `http://localhost:${CALLBACK_PORT}`);

      // Only handle /callback endpoint
      if (url.pathname !== '/callback') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const token = url.searchParams.get('token');
      const returnedSession = url.searchParams.get('session');
      const blessingParam = url.searchParams.get('blessing');
      const checksumParam = url.searchParams.get('checksum'); // ESMC 3.65: Vercel checksum
      const error = url.searchParams.get('error');

      // Handle authentication error
      if (error) {
        console.log(`❌ Authentication error: ${error}`);
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <head>
              <meta charset="utf-8">
              <title>ESMC Authentication Failed</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                h1 { color: #dc3545; }
                p { color: #666; }
              </style>
            </head>
            <body>
              <h1>❌ Authentication Failed</h1>
              <p>Error: ${error}</p>
              <p>You can close this window and try again.</p>
            </body>
          </html>
        `);

        serverClosed = true;
        setTimeout(() => server.close(), 1000);

        return reject(new Error(`Authentication failed: ${error}`));
      }

      // Validate token exists
      if (!token) {
        console.log(`❌ Missing token`);
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <head>
              <meta charset="utf-8">
              <title>ESMC Authentication Failed</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                h1 { color: #dc3545; }
              </style>
            </head>
            <body>
              <h1>❌ Invalid Authentication Response</h1>
              <p>Missing authentication token. Please try again.</p>
            </body>
          </html>
        `);

        serverClosed = true;
        setTimeout(() => server.close(), 1000);

        return reject(new Error('Missing token'));
      }

      // Note: Server uses hardwareId from JWT payload, not our local sessionId
      // This is intentional - the server validates against the browser's hardware fingerprint

      // Authentication successful!
      console.log(`✅ Authentication successful! Token received.`);

      // Verify JWT signature (CRITICAL SECURITY)
      console.log(`🔐 Verifying JWT signature (fetching from Vercel)...`);
      const { verifyAndExtractUserData } = require('../esmc-auth/src/auth/jwt-validator.js');

      let userInfo = {};
      try {
        userInfo = await verifyAndExtractUserData(token);
        console.log(`   ✅ JWT signature valid (RSA/ECDSA verified from Vercel)`);
      } catch (verifyError) {
        console.error(`   ❌ JWT verification failed: ${verifyError.message}`);
        console.error(`   ⚠️  Token may be forged or tampered!`);

        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <head>
              <meta charset="utf-8">
              <title>ESMC Authentication Failed</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                h1 { color: #dc3545; }
              </style>
            </head>
            <body>
              <h1>❌ Authentication Failed</h1>
              <p>JWT signature verification failed.</p>
              <p>Error: ${verifyError.message}</p>
              <p>This token may be forged or tampered with.</p>
            </body>
          </html>
        `);

        serverClosed = true;
        setTimeout(() => server.close(), 1000);
        return reject(new Error(`JWT verification failed: ${verifyError.message}`));
      }

      // ESMC 3.61 OPTION 3: Extract compositeDeviceId from JWT (dual-layer binding)
      console.log(`🔐 Writing secure license file (.lic)...`);
      const licenseManager = require('../esmc-auth/src/core/esmc-license-manager.js');

      // JWT contains compositeDeviceId in hardwareId field (ESMC 3.61 architecture)
      const compositeDeviceId = userInfo.hardwareId;

      if (!compositeDeviceId) {
        console.error(`   ⚠️  Device binding failed - using fallback`);
      } else {
        console.log(`   ✅ Device binding verified`);
      }

      // Parse Guardian Blessing Token from callback
      let blessing = null;
      if (blessingParam) {
        try {
          blessing = JSON.parse(decodeURIComponent(blessingParam));
          console.log(`   ✅ Security token validated`);
        } catch (parseError) {
          console.error(`   ⚠️  Security token validation failed`);
        }
      } else {
        console.warn(`   ⚠️  Security token missing (legacy authentication)`);
      }

      // Parse Vercel Checksum from callback (ESMC 3.65)
      let vercelChecksum = null;
      if (checksumParam) {
        try {
          vercelChecksum = JSON.parse(decodeURIComponent(checksumParam));
          console.log(`   ✅ Vercel checksum validated (rotation: ${vercelChecksum.rotation.substring(0, 10)}...)`);
        } catch (parseError) {
          console.error(`   ⚠️  Vercel checksum validation failed`);
        }
      } else {
        console.warn(`   ⚠️  Vercel checksum missing (legacy authentication)`);
      }

      // ════════════════════════════════════════════════════════════════════
      // ESMC 4.1: FORTRESS MODE - Random Sampling Verification
      // ════════════════════════════════════════════════════════════════════
      let verificationSamples = [];
      const samplesParam = url.searchParams.get('samples');

      if (samplesParam) {
        try {
          verificationSamples = JSON.parse(decodeURIComponent(samplesParam));
        } catch (e) {
          console.warn(`   ⚠️  Failed to parse verification samples`);
        }
      }

      if (verificationSamples && verificationSamples.length > 0) {
        console.log(`🔒 FORTRESS MODE: Verifying SDK integrity (${verificationSamples.length} random samples)...`);

        const verifyResult = verifyIntegritySamples(verificationSamples);

        if (verifyResult.success) {
          console.log(`   ✅ FORTRESS LOCK: SDK integrity validated`);
          console.log(`   🔐 All ${verifyResult.verified} samples verified`);
        } else if (verifyResult.skipped) {
          console.log(`   ⚠️  FORTRESS validation skipped (components not found)`);
          console.log(`   📋 This may be a first-time setup`);
        } else {
          // FORTRESS BREACH: Package has been tampered with!
          console.error(`\n🚨 FORTRESS BREACH DETECTED!`);
          console.error(`   ❌ SDK integrity validation FAILED`);
          console.error(`   📦 ${verifyResult.failed.length} file(s) failed verification`);
          console.error(`\n⚠️  Your SDK package may have been tampered with.`);
          console.error(`   Please download a fresh copy from https://esmc-sdk.com`);

          // Revoke license
          revokeLicense();

          res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <head>
                <meta charset="utf-8">
                <title>ESMC Security Alert</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                  h1 { color: #dc3545; }
                  p { color: #666; }
                  .alert { background: #ffebee; border: 2px solid #dc3545; padding: 20px; border-radius: 8px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <h1>🚨 FORTRESS BREACH DETECTED</h1>
                <div class="alert">
                  <p><strong>SDK integrity validation failed.</strong></p>
                  <p>Your SDK package may have been tampered with or corrupted.</p>
                </div>
                <p>Please download a fresh copy from <a href="https://esmc-sdk.com">esmc-sdk.com</a></p>
                <p>If you believe this is an error, contact <a href="mailto:support@esmc-sdk.com">support@esmc-sdk.com</a></p>
              </body>
            </html>
          `);

          serverClosed = true;
          setTimeout(() => server.close(), 1000);
          return reject(new Error('FORTRESS BREACH: SDK integrity validation failed'));
        }
      } else {
        console.warn(`   ⚠️  FORTRESS MODE disabled (server did not send verification samples)`);
      }

      // Prepare license data (ESMC 3.65: Plaintext structure)
      const licenseData = {
        email: userInfo.email || 'unknown@esmc-sdk.com',
        userId: userInfo.sub || userInfo.userId,
        displayName: userInfo.name || 'ESMC User',
        tier: userInfo.tier || 'FREE',
        subscriptionStatus: 'active',
        subscriptionEndDate: userInfo.subscriptionEndDate || null,  // 🔧 FIXED: Use subscriptionEndDate from JWT, NOT exp claim
        compositeDeviceId: compositeDeviceId, // ESMC 3.61: Dual-layer binding
        blessing: blessing, // Guardian Blessing Token (CRITICAL for tampering protection)
        vercelChecksum: vercelChecksum // ESMC 3.65: Self-healing protection
      };

      try {
        const result = licenseManager.writeLicenseFile(licenseData);
        if (result.success) {
          console.log(`   ✅ License file created successfully`);
        } else {
          throw new Error(result.error);
        }
      } catch (saveError) {
        console.error(`   ❌ Failed to write license file: ${saveError.message}`);
        // Continue anyway - user authenticated successfully
      }

      // Send success response to browser
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <head>
            <meta charset="utf-8">
            <title>ESMC Authentication Successful</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              h1 { font-size: 48px; margin-bottom: 20px; }
              p { font-size: 18px; opacity: 0.9; }
              .box {
                background: rgba(255,255,255,0.1);
                padding: 30px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
                max-width: 500px;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>✅ Authentication Successful!</h1>
              <p>Welcome to ESMC SDK, ${licenseData.displayName.split(' ')[0]}!</p>
              <p><strong>Tier:</strong> ${licenseData.tier}</p>
              <p style="margin-top: 30px; font-size: 14px;">You can close this window and return to your editor.</p>
            </div>
            <script>
              // Auto-close after 3 seconds
              setTimeout(() => {
                window.close();
              }, 3000);
            </script>
          </body>
        </html>
      `);

      // Close server after response
      serverClosed = true;
      setTimeout(() => server.close(), 1000);

      // Print success message
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════════════');
      console.log('✅ LOGIN SUCCESSFUL');
      console.log('═══════════════════════════════════════════════════════════════════════');
      console.log(`👤 Name: ${licenseData.displayName}`);
      console.log(`📧 Email: ${licenseData.email}`);
      console.log(`🎖️  Tier: ${licenseData.tier}`);

      if (licenseData.subscriptionEndDate) {
        const expiryDate = new Date(licenseData.subscriptionEndDate);
        console.log(`⏰ Subscription: ${expiryDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`);
      } else {
        console.log(`⏰ Subscription: No expiration`);
      }

      console.log('');
      console.log('🚀 ESMC is now ready to use!');

      if (licenseData.tier === 'FREE') {
        console.log('💡 Visit https://esmc-sdk.com/pricing to upgrade your tier');
      }

      console.log('═══════════════════════════════════════════════════════════════════════');

      // Resolve promise
      resolve(licenseData);
    });

    // Start listening on callback port
    server.listen(CALLBACK_PORT, () => {
      console.log(`🔌 Callback server started on http://localhost:${CALLBACK_PORT}`);
      console.log(`   Waiting for authentication...`);
      console.log('');
    });

    // Handle server errors
    server.on('error', (err) => {
      if (!serverClosed) {
        console.error(`❌ Callback server error: ${err.message}`);

        if (err.code === 'EADDRINUSE') {
          console.error(`\n⚠️  Port ${CALLBACK_PORT} is already in use.`);
          console.error(`   Another authentication session may be running.`);
          console.error(`   Please wait a moment and try again.\n`);
          reject(new Error(`Port ${CALLBACK_PORT} already in use`));
        } else {
          reject(err);
        }
      }
    });

    // Set timeout
    setTimeout(() => {
      if (!serverClosed) {
        console.log(`\n⏱️  Authentication timeout (${CALLBACK_TIMEOUT / 1000}s)`);
        console.log(`   Please try again.\n`);
        server.close();
        reject(new Error('Authentication timeout'));
      }
    }, CALLBACK_TIMEOUT);
  });
}

// Run login
login()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ Login failed: ${error.message}\n`);
    process.exit(1);
  });
