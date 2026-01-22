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
/** ESMC 3.93.1 Tier Gate CLI Wrapper | 2025-11-14 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI wrapper for esmc-tier-gate.js (557 lines → 150 tokens via CLI)
 *  Pattern: Thin wrapper (150 tokens) → subprocess loads tier-gate (0 context cost)
 *  Savings: 94% token reduction (700 tokens → 100 tokens per call)
 *  Usage: Token-optimized access to tier validation, feature checking, metadata
 */

const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

const MODULE_CONFIG = {
    name: 'ESMC Tier Gate',
    modulePath: './c3bfadda.js',  // ESMC 3.93.1: Renamed for SDK pattern matching
    version: '3.93.1',
    description: 'Unified tier management & license validation (PRE-BRAIN)'
};

// ═══════════════════════════════════════════════════════════════════════
// CLI ARGUMENT PARSING
// ═══════════════════════════════════════════════════════════════════════

function parseArgs() {
    const args = process.argv.slice(2);

    // 🆕 ESMC 3.101.0: Silent by default
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;

    if (args.length === 0) {
        showUsage();
        process.exit(1);
    }

    const command = args[0];
    const options = {};
    const positionalArgs = [];

    // Parse flags and positional args
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            options[key] = value || true;
        } else if (arg.startsWith('-') && arg.length === 2) {
            options[arg.slice(1)] = true;
        } else {
            positionalArgs.push(arg);
        }
    }

    return { command, options, positionalArgs, silent };
}

function showUsage() {
    console.log(`
🎖️ ${MODULE_CONFIG.name} CLI - ${MODULE_CONFIG.description}

Usage:
  node ${path.basename(__filename)} <command> [args] [options]

Commands:
  get-tier                   Get current user tier (FREE/PRO/MAX)
  check-access <feature>     Check if feature is accessible
                            Examples: "memory.hydra_enabled", "intelligence.PIU"
  list-features              List all features for current tier
  get-info                   Get detailed tier information (JSON)
  validate                   Validate license and show status
  help                       Show this help message

Options:
  --json                     Output as JSON
  --verbose, -v              Show detailed output
  --force-refresh            Skip cache, force license re-validation

Examples:
  # Get current tier name
  node ee1bb133.js get-tier

  # Check HYDRA access
  node ee1bb133.js check-access memory.hydra_enabled

  # Get full tier info as JSON
  node ee1bb133.js get-info --json

  # List all features for current tier
  node ee1bb133.js list-features

Version: ESMC ${MODULE_CONFIG.version}
Module: ${MODULE_CONFIG.modulePath}
Token savings: ~600 tokens per call vs direct require()
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

async function handleCommand(command, positionalArgs, options, silent) {
    // Silent mode
    let originalLog;
    if (silent) {
        originalLog = console.log;
        console.log = () => {};
    }
    try {
        // Load tier-gate module (happens in subprocess, NOT in Claude's context)
        const { tierGate, TIER_FEATURES } = require(path.join(__dirname, MODULE_CONFIG.modulePath));

        switch (command) {
            case 'get-tier': {
                const forceRefresh = options['force-refresh'] || false;
                const tierInfo = tierGate.getCurrentTier(forceRefresh);

                if (options.json) {
                    console.log(JSON.stringify({ tier: tierInfo.tier }, null, 2));
                } else {
                    console.log(tierInfo.tier);
                }
                break;
            }

            case 'check-access': {
                if (positionalArgs.length === 0) {
                    console.error('❌ Error: Feature path required');
                    console.error('Example: check-access memory.hydra_enabled');
                    process.exit(1);
                }

                const featurePath = positionalArgs[0];
                const hasAccess = tierGate.hasAccess(featurePath);

                if (options.json) {
                    console.log(JSON.stringify({
                        feature: featurePath,
                        hasAccess: hasAccess
                    }, null, 2));
                } else {
                    if (hasAccess) {
                        console.log(`✅ Access GRANTED: ${featurePath}`);
                    } else {
                        console.log(`❌ Access DENIED: ${featurePath}`);
                    }
                }

                // Exit with appropriate code for scripting
                process.exit(hasAccess ? 0 : 1);
                break;
            }

            case 'list-features': {
                const forceRefresh = options['force-refresh'] || false;
                const tierInfo = tierGate.getCurrentTier(forceRefresh);
                const features = tierInfo.features;

                if (options.json) {
                    console.log(JSON.stringify(features, null, 2));
                } else {
                    console.log(`\n🎖️ Features for ${tierInfo.tier} tier:\n`);

                    // Memory features
                    console.log('📦 MEMORY SYSTEMS:');
                    Object.entries(features.memory || {}).forEach(([key, value]) => {
                        const icon = value ? '✅' : '❌';
                        console.log(`  ${icon} ${key}: ${value}`);
                    });

                    // Intelligence features
                    console.log('\n🧠 INTELLIGENCE:');
                    Object.entries(features.intelligence || {}).forEach(([key, value]) => {
                        const icon = value ? '✅' : '❌';
                        console.log(`  ${icon} ${key}: ${value}`);
                    });
                }
                break;
            }

            case 'get-info': {
                const forceRefresh = options['force-refresh'] || false;
                const tierInfo = tierGate.getCurrentTier(forceRefresh);

                if (options.json) {
                    console.log(JSON.stringify(tierInfo, null, 2));
                } else {
                    console.log('\n🎖️ TIER INFORMATION\n');
                    console.log(`Tier: ${tierInfo.tier}`);
                    console.log(`Valid: ${tierInfo.valid ? '✅' : '❌'}`);
                    if (tierInfo.email) console.log(`Email: ${tierInfo.email}`);
                    if (tierInfo.userId) console.log(`User ID: ${tierInfo.userId}`);
                    if (tierInfo.subscriptionStatus) console.log(`Status: ${tierInfo.subscriptionStatus}`);
                    if (tierInfo.reason) console.log(`Reason: ${tierInfo.reason}`);

                    console.log(`\nDescription: ${tierInfo.features.description}`);
                }
                break;
            }

            case 'validate': {
                const forceRefresh = true; // Always force refresh for validate
                const tierInfo = tierGate.getCurrentTier(forceRefresh);

                console.log('\n🔐 LICENSE VALIDATION\n');
                console.log(`Status: ${tierInfo.valid ? '✅ VALID' : '❌ INVALID'}`);
                console.log(`Tier: ${tierInfo.tier}`);
                if (tierInfo.reason) console.log(`Reason: ${tierInfo.reason}`);
                if (tierInfo.email) console.log(`Email: ${tierInfo.email}`);
                if (tierInfo.subscriptionStatus) console.log(`Subscription: ${tierInfo.subscriptionStatus}`);
                if (tierInfo.subscriptionEndDate) console.log(`Expiry: ${tierInfo.subscriptionEndDate}`);

                process.exit(tierInfo.valid ? 0 : 1);
                break;
            }

            case 'help':
            case '--help':
            case '-h':
                showUsage();
                break;

            default:
                console.error(`❌ Unknown command: ${command}\n`);
                showUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (options.verbose || options.v) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    const { command, options, positionalArgs, silent } = parseArgs();

    try {
        await handleCommand(command, positionalArgs, options, silent);
    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        if (options.verbose || options.v) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run CLI if invoked directly
if (require.main === module) {
    main().catch(error => {
        console.error(`\n❌ Unhandled error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { main };
