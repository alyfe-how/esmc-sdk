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
/** ESMC 3.101.0 Reflex Check CLI | 2025-11-16 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: Lightning-fast license validation + status/tier feedback
 *  Pattern: Reflex bypass (0 ESMC framework load, <100ms response)
 *  Protection: Guardian Blessing Token validation (Option C - Hybrid)
 *  Injection: db8a0273.js + 6c390b10.md PHASE 1
 *
 *  Option C Architecture (Hybrid Validation):
 *  1. Fast path: File exists check
 *  2. Guardian validation: Blessing token + Vercel checksum
 *  3. Offline support: Local expiry check
 *  4. Graceful degradation: Works without blessing (warns but doesn't block)
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════
// USER CONTEXT (SDK-ONLY - Injected during sync)
// ═══════════════════════════════════════════════════════════════════════
// PRODUCTION: This marker remains as-is (no user context)
// SDK: Replaced with actual user email, tier, and sync date
// SYNC_INJECT_USER_CONTEXT_HERE

// ═══════════════════════════════════════════════════════════════════════
// PROJECT ROOT DISCOVERY
// ═══════════════════════════════════════════════════════════════════════

/**
 * Find project root containing .claude/ directory
 * Walks up directory tree until .claude found or filesystem root reached
 */
function findProjectRoot() {
    let current = process.cwd();

    while (current !== path.dirname(current)) {
        const claudePath = path.join(current, '.claude');
        if (fs.existsSync(claudePath)) {
            return current;
        }
        current = path.dirname(current);
    }

    return process.cwd(); // Fallback to CWD if not found
}

// ═══════════════════════════════════════════════════════════════════════
// LICENSE VALIDATION (Option C - Hybrid)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Read and validate .esmc-license.json
 * Returns: { valid: boolean, license: object|null, error: string|null }
 *
 * Option C Validation Stages:
 * 1. File exists check (fast path)
 * 2. JSON parse validation
 * 3. Guardian Blessing validation (if blessing exists)
 * 4. Vercel checksum validation (if available)
 * 5. Expiry check (local validation)
 */
function validateLicense() {
    const projectRoot = findProjectRoot();
    const licensePath = path.join(projectRoot, '.claude', '.esmc-license.json');

    // 1️⃣ FAST PATH: File exists check
    if (!fs.existsSync(licensePath)) {
        return {
            valid: false,
            license: null,
            error: 'Not configured'
        };
    }

    // 2️⃣ READ LICENSE FILE
    try {
        const licenseData = fs.readFileSync(licensePath, 'utf8');
        const license = JSON.parse(licenseData);

        // Validate required fields
        if (!license.email || !license.tier) {
            return {
                valid: false,
                license: null,
                error: 'Invalid license format (missing email or tier)'
            };
        }

        // 3️⃣ GUARDIAN BLESSING VALIDATION (if blessing exists)
        if (license.blessing) {
            const blessingPath = path.join(projectRoot, '.claude', '.esmc-guardian-blessing.json');

            if (!fs.existsSync(blessingPath)) {
                // Graceful degradation - allow offline usage with warning
                if (process.env.ESMC_VERBOSE === 'true') {
                    console.warn('⚠️  Guardian Blessing missing - License authenticity cannot be verified');
                }
            } else {
                try {
                    const blessing = JSON.parse(fs.readFileSync(blessingPath, 'utf8'));

                    // Validate blessing token matches license
                    if (blessing.token !== license.blessing) {
                        return {
                            valid: false,
                            license: null,
                            error: 'Blessing validation failed (tampered license detected)'
                        };
                    }

                    // 4️⃣ VALIDATE VERCEL CHECKSUM (if present)
                    if (license.vercelChecksum && blessing.vercelChecksum) {
                        if (blessing.vercelChecksum !== license.vercelChecksum) {
                            return {
                                valid: false,
                                license: null,
                                error: 'Checksum validation failed (license authenticity check failed)'
                            };
                        }
                    }
                } catch (error) {
                    // Graceful degradation - blessing file corrupted
                    if (process.env.ESMC_VERBOSE === 'true') {
                        console.warn('⚠️  Blessing validation error:', error.message);
                    }
                }
            }
        }

        // 5️⃣ EXPIRY CHECK (local validation - works offline)
        if (license.subscriptionEndDate) {
            const expiryDate = new Date(license.subscriptionEndDate);
            const now = new Date();

            if (now > expiryDate) {
                return {
                    valid: true, // File is valid, but tier is FREE
                    license: { ...license, tier: 'FREE', expired: true },
                    error: null
                };
            }
        }

        // ✅ All validations passed
        return {
            valid: true,
            license: license,
            error: null
        };

    } catch (error) {
        return {
            valid: false,
            license: null,
            error: `Parse error: ${error.message}`
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// REFLEX COMMANDS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Execute: esmc tier
 * Returns: Tier name only (for scripting)
 * Exit codes: 0 = authenticated, 1 = not authenticated
 */
function executeEsmcTier() {
    const result = validateLicense();

    if (!result.valid) {
        console.log('Not configured');
        return 1;
    }

    console.log(result.license.tier);
    return 0;
}

/**
 * Execute: esmc status
 * Returns: Formatted status display
 * Exit codes: 0 = authenticated, 1 = not authenticated
 */
function executeEsmcStatus() {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('🎖️  ESMC SDK - Status Check');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    const result = validateLicense();

    if (!result.valid) {
        console.log('❌ Not authenticated');
        console.log('\n📋 To authenticate, run:');
        console.log('   npm run login\n');
        console.log('═══════════════════════════════════════════════════════════════════════');
        return 1;
    }

    const license = result.license;

    // Calculate status
    let status = 'Active';
    if (license.subscriptionEndDate) {
        const expiryDate = new Date(license.subscriptionEndDate);
        const now = new Date();
        const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

        if (license.expired) {
            status = 'Expired (downgraded to FREE)';
        } else {
            status = `Active (${daysLeft} days left)`;
        }
    }

    console.log(`👤 User: ${license.displayName || license.email}`);
    console.log(`📧 Email: ${license.email}`);
    console.log(`🎖️  Tier: ${license.tier}`);
    console.log(`📊 Status: ${status}`);

    if (license.subscriptionEndDate) {
        const expiryDate = new Date(license.subscriptionEndDate);
        console.log(`⏰ Expires: ${expiryDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`);
    }

    console.log(`\n🔐 Security:`);
    console.log(`   Guardian Blessing: ${license.blessing ? '✅ Protected' : '❌ Missing'}`);

    console.log(`\n📂 License File:`);
    console.log(`   Location: .claude/.esmc-license.json`);
    console.log(`   Issued: ${new Date(license.issuedAt).toLocaleString('en-US')}`);
    if (license.subscriptionEndDate) {
        const endDate = new Date(license.subscriptionEndDate);
        console.log(`   Subscription Ends: ${endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`);
    } else {
        console.log(`   Subscription Ends: No expiration`);
    }

    if (license.tier === 'FREE') {
        console.log('\n💡 Upgrade to PRO or MAX for advanced features:');
        console.log('   Visit https://esmc-sdk.com/pricing');
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════');
    return 0;
}

// ═══════════════════════════════════════════════════════════════════════
// PRE-FLIGHT CHECK (Called by db8a0273.js)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Pre-flight check for db8a0273.js injection
 * Returns: { handled: boolean, licenseValid: boolean, output: string, exitCode: number }
 *
 * This function is called BEFORE context-integrity logic executes.
 * Purpose: Provide <100ms reflex response for status/tier queries
 */
function preFlightCheck(argv) {
    // Check for status/tier commands
    const command = argv[2]?.toLowerCase();

    if (command === 'status') {
        const exitCode = executeEsmcStatus();
        return {
            handled: true,
            licenseValid: exitCode === 0,
            output: '',  // Already printed
            exitCode: exitCode
        };
    }

    if (command === 'tier') {
        const exitCode = executeEsmcTier();
        return {
            handled: true,
            licenseValid: exitCode === 0,
            output: '',  // Already printed
            exitCode: exitCode
        };
    }

    // Not a reflex command - validate license and return
    const licenseResult = validateLicense();

    return {
        handled: false,
        licenseValid: licenseResult.valid,
        output: '',
        exitCode: licenseResult.valid ? 0 : 1
    };
}

// ═══════════════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════════════

function main() {
    const command = process.argv[2]?.toLowerCase();

    if (!command || command === 'help' || command === '--help') {
        console.log(`
🎖️  ESMC Reflex Check CLI (Option C - Hybrid Validation)

Usage:
  node 12d8a408.js <command>

Commands:
  tier       Get current user tier (minimal output for scripting)
  status     Get detailed authentication status
  help       Show this help message

Examples:
  node 12d8a408.js tier     # Output: MAX
  node 12d8a408.js status   # Formatted status display

Exit Codes:
  0          Authenticated
  1          Not authenticated

Option C Validation:
  ✅ Fast path: File exists check
  ✅ Guardian validation: Blessing token + Vercel checksum
  ✅ Offline support: Local expiry check
  ✅ Graceful degradation: Works without blessing (warns but doesn't block)

Guardian Protection: Blessing token validated (if available)
        `);
        process.exit(1);
    }

    if (command === 'tier') {
        process.exit(executeEsmcTier());
    }

    if (command === 'status') {
        process.exit(executeEsmcStatus());
    }

    console.error(`❌ Unknown command: ${command}`);
    console.error('   Run: node 12d8a408.js help');
    process.exit(1);
}

// Export for injection into db8a0273.js
module.exports = {
    preFlightCheck,
    validateLicense,
    executeEsmcTier,
    executeEsmcStatus
};

// CLI execution
if (require.main === module) {
    main();
}
