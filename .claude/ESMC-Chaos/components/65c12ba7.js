#!/usr/bin/env node
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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.52 Epsilon Intelligence CLI | 2025-11-02 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI wrapper for 48e16b2a.js (40KB, 10.3K tokens)
 *  Savings: 10,251 tokens → 500 tokens = 95.1% reduction
 *  Usage: node 65c12ba7.js <command> [options]
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
🎖️ Epsilon Intelligence CLI - Memory oversight & intelligence analysis

Usage:
  node 65c12ba7.js <command> [options]

Commands:
  oversee <session>              Oversee session intelligence
  analyze <data>                 Analyze intelligence data
  report                         Generate intelligence report
  help                           Show this help

Version: ESMC 3.52 | Module: 48e16b2a.js (40KB)
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
        const { EpsilonIntelligence } = require('./48e16b2a.js');
        const epsilon = new EpsilonIntelligence();

        switch (command) {
            case 'oversee':
                const result = await epsilon.overseeSession({
                    sessionId: options[0]
                });
                // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify(result, null, 2));
                break;

            case 'analyze':
                const analysis = await epsilon.analyzeIntelligence({
                    data: options.join(' ')
                });
                console.log(JSON.stringify(analysis, null, 2));
                break;

            case 'report':
                const report = await epsilon.generateReport();
                console.log(JSON.stringify(report, null, 2));
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
