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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.52 ECHELON Mesh Orchestrator CLI | 2025-11-02 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI wrapper for cb40e14b.js (142KB, 36.5K tokens)
 *  Savings: 36,474 tokens → 500 tokens = 98.6% reduction
 *  Usage: node e7535d81.js <command> [options]
 */

const path = require('path');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        showUsage();
        process.exit(1);
    }

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    // Checks for --verbose flag or ESMC_VERBOSE=true, otherwise defaults to silent
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    return {
        command: cleanArgs[0],
        options: cleanArgs.slice(1),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🎖️ ECHELON Mesh Orchestrator CLI - 4-component mesh intelligence coordinator

Usage:
  node e7535d81.js <command> [options]

Commands:
  orchestrate <request>          Run full mesh orchestration (processMINRequest)
  standards <code>               Get standards selection for code patterns
  colonels                       List enabled colonels for current tier
  help                           Show this help

Version: ESMC 3.72 | Module: cb40e14b.js (142KB)
    `);
}

async function main() {
    const { command, options, silent } = parseArgs();

    // Silent mode: suppress all console output from engine
    let originalConsoleLog, originalConsoleError, originalConsoleInfo, originalConsoleWarn;
    if (silent) {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        originalConsoleInfo = console.info;
        originalConsoleWarn = console.warn;

        console.log = () => {};
        console.error = () => {};
        console.info = () => {};
        console.warn = () => {};
    }

    try {
        if (command === 'help' || command === '--help') {
            if (silent) {
                // Restore console for help output
                console.log = originalConsoleLog;
            }
            showUsage();
            return;
        }

        // Load heavy module in subprocess
        const { ECHELONMeshOrchestrator } = require('./cb40e14b.js');
        const echelon = new ECHELONMeshOrchestrator();

        // 🆕 CRITICAL FIX: Initialize mesh BEFORE processing requests
        // Components (PIU/DKI/UIP/PCA) are null until initializeMesh() is called
        await echelon.initializeMesh();

        switch (command) {
            case 'orchestrate':
                // Map to actual method: processMINRequest
                // Pass request as STRING (first param), not object
                const result = await echelon.processMINRequest(
                    options.join(' '),  // request string
                    {}                   // context object
                );
                // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify(result, null, 2));
                break;

            case 'standards':
                // Standards selection for code
                const code = options.join(' ');
                const standards = echelon.selectStandardsForColonels(code, {});
                console.log(JSON.stringify(standards, null, 2));
                break;

            case 'colonels':
                // Get enabled colonels for current tier
                const colonels = echelon.getEnabledColonels();
                console.log(JSON.stringify(colonels, null, 2));
                break;

            default:
                console.error(`❌ Unknown command: ${command}`);
                showUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error(`❌ Fatal: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { main };
