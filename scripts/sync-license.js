#!/usr/bin/env node
/**
 * ESMC License Sync Script
 * Converts ~/.esmc/credentials.json → .claude/ESMC Complete/{hash}.lic
 *
 * This bridges the MCP authentication (credentials.json) with ESMC's
 * encrypted license system (.lic files)
 */

const path = require('path');
const fs = require('fs');

// Import credentials reader from esmc-auth (standalone authentication)
const { loadCredentials } = require('../esmc-auth/src/auth/credentials.js');

// Import ESMC license manager (now in esmc-auth for chaos compatibility)
const { writeLicenseFile, getLicenseFilePath } = require('../esmc-auth/src/core/esmc-license-manager.js');

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('🔐 ESMC License Sync');
console.log('   Converting MCP credentials → ESMC license file');
console.log('═══════════════════════════════════════════════════════════════════════\n');

try {
  // Step 1: Load credentials from ~/.esmc/credentials.json
  console.log('📥 Loading MCP credentials from ~/.esmc/credentials.json...');
  const credentials = loadCredentials();

  if (!credentials) {
    console.error('❌ No credentials found.');
    console.log('\n💡 Run `npm run login` first to authenticate.\n');
    process.exit(1);
  }

  console.log(`✅ Credentials loaded for ${credentials.email}`);
  console.log(`   Tier: ${credentials.tier}`);
  console.log('');

  // Step 2: Convert to ESMC license format
  console.log('🔄 Converting to ESMC license format...');

  const esmcUserData = {
    email: credentials.email,
    userId: credentials.userId || `MCP_${credentials.email.split('@')[0]}`,
    displayName: credentials.name || credentials.email.split('@')[0],
    tier: credentials.tier || 'FREE',
    subscriptionStatus: 'active',
    subscriptionEndDate: credentials.expiresAt || null,  // ✅ Matches license-manager schema
    features: [],
    maxDevices: credentials.tier === 'FREE' ? 1 : credentials.tier === 'PRO' ? 3 : 10
  };

  // Step 3: Write ESMC license file
  console.log('💾 Writing encrypted ESMC license file...');
  const result = writeLicenseFile(esmcUserData);

  if (!result.success) {
    console.error(`❌ License sync failed: ${result.error}`);
    process.exit(1);
  }

  // Success!
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('✅ LICENSE SYNC SUCCESSFUL');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(`📁 License file: ${path.basename(result.filePath)}`);
  console.log(`📍 Location: .claude/ESMC Complete/`);
  console.log(`👤 User: ${esmcUserData.email}`);
  console.log(`🎖️  Tier: ${esmcUserData.tier}`);

  if (esmcUserData.subscriptionEndDate) {
    const expiryDate = new Date(esmcUserData.subscriptionEndDate);
    console.log(`⏰ Expires: ${expiryDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`);
  }

  console.log('');
  console.log('🚀 ESMC is now fully activated!');
  console.log('   Restart Cursor/Claude Code to see your tier.');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  process.exit(0);

} catch (error) {
  console.error('');
  console.error('❌ License sync failed:');
  console.error(`   ${error.message}`);
  console.error('');
  console.error('Stack trace:');
  console.error(error.stack);
  console.error('');
  process.exit(1);
}
