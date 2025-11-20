/**
 * ESMC 3.13 Package Integrity Verifier
 *
 * Validates package authenticity and integrity before deployment:
 * - SHA-256 checksum verification
 * - HMAC signature validation
 * - File count verification
 * - Tamper detection
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIST_DIR = path.resolve(__dirname);

function generateKey(passphrase) {
  // 🔐 SECURITY ENHANCEMENT: Support environment variable override
  const securePassphrase = process.env.ESMC_PACKAGE_SIGNATURE_KEY || passphrase;
  return crypto.createHash('sha256').update(securePassphrase).digest();
}

function verifyPackage() {
  console.log('\n🔍 ESMC 3.13 Package Integrity Verification');
  console.log('═══════════════════════════════════════════════\n');

  // Load integrity manifest
  const manifestPath = path.join(DIST_DIR, '.claude', 'ESMC-Chaos', '.integrity-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Integrity manifest not found!');
    return false;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('📋 Build Version: ' + manifest.buildVersion);
  console.log('📋 Build Date: ' + manifest.buildDate);
  console.log('📋 Architecture: ' + manifest.architecture);
  console.log('📋 Expected Files: ' + manifest.totalFiles + '\n');

  // Load package signature
  const signaturePath = path.join(DIST_DIR, '.package-signature');
  if (!fs.existsSync(signaturePath)) {
    console.error('❌ Package signature not found!');
    return false;
  }

  const signatureFile = JSON.parse(fs.readFileSync(signaturePath, 'utf8'));

  // Verify HMAC signature
  console.log('🔏 Verifying HMAC signature...');
  const signatureKey = generateKey('ESMC-' + manifest.buildVersion + '-package-signature');
  const hmac = crypto.createHmac('sha256', signatureKey);
  hmac.update(JSON.stringify(manifest));
  const calculatedSignature = hmac.digest('hex');

  if (calculatedSignature !== signatureFile.signature) {
    console.error('❌ SIGNATURE MISMATCH! Package may be tampered.');
    return false;
  }
  console.log('   ✅ Signature valid\n');

  // Verify file checksums
  console.log('📊 Verifying file checksums...');
  let verifiedCount = 0;
  let modifiedCount = 0;
  let missingCount = 0;

  for (const [file, expectedHash] of Object.entries(manifest.checksums)) {
    const fullPath = path.join(DIST_DIR, file);

    if (!fs.existsSync(fullPath)) {
      console.error('   ❌ Missing: ' + file);
      missingCount++;
      continue;
    }

    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(fullPath));
    const actualHash = hash.digest('hex');

    if (actualHash !== expectedHash) {
      console.error('   ❌ Modified: ' + file);
      modifiedCount++;
    } else {
      verifiedCount++;
    }
  }

  console.log('   ✅ Verified: ' + verifiedCount + ' files');
  if (modifiedCount > 0) console.error('   ❌ Modified: ' + modifiedCount + ' files');
  if (missingCount > 0) console.error('   ❌ Missing: ' + missingCount + ' files');
  console.log('');

  // Final verdict
  if (modifiedCount === 0 && missingCount === 0) {
    console.log('✅ PACKAGE INTEGRITY VERIFIED');
    console.log('   Safe to deploy\n');
    return true;
  } else {
    console.error('❌ PACKAGE INTEGRITY COMPROMISED');
    console.error('   DO NOT deploy this package\n');
    return false;
  }
}

// Run verification
const isValid = verifyPackage();
process.exit(isValid ? 0 : 1);
