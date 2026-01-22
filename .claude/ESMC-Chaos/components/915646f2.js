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
/** ESMC 3.77 UIP Workflow Prediction CLI | 2025-11-08 | v1.1.0 | PROD
 *  Purpose: CLI wrapper for 90c94649.js (33KB, 8.7K tokens)
 *  Savings: 8,680 tokens → 500 tokens = 94.2% reduction
 *  ESMC 3.77: Added --silent flag support for lightweight mode
 */

const path = require('path');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) { showUsage(); process.exit(1); }

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
🎖️ UIP Workflow Prediction CLI - EAST intelligence (User workflow patterns)

Usage: node 915646f2.js <command> [options] [--silent|-s]

Commands:
  predict <context>        Predict next user action
  analyze <history>        Analyze workflow patterns
  preferences              Get user preferences
  help                     Show this help

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.77 | Module: 90c94649.js (33KB)
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
                console.log = originalConsoleLog;
            }
            showUsage();
            return;
        }

        const UIPWorkflowPredictionEngine = require('./90c94649.js');
        const uip = new UIPWorkflowPredictionEngine();

        let result;
        switch (command) {
            case 'predict':
                const userCommand = options.join(' ');
                result = await uip.predictNextSteps(userCommand);
                break;
            case 'analyze':
                const analysisCommand = options.join(' ');
                result = await uip.predictNextSteps(analysisCommand);
                break;
            case 'preferences':
                const prefsCommand = "show user preferences";
                result = await uip.predictNextSteps(prefsCommand);
                break;
            default:
                if (silent) {
                    console.error = originalConsoleError;
                }
                console.error(`❌ Unknown command: ${command}`);
                showUsage();
                process.exit(1);
        }

        // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        // Output only JSON result
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        // Restore console for error output
        if (silent) {
            console.error = originalConsoleError;
        }
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => { console.error(`❌ Fatal: ${error.message}`); process.exit(1); });
}

module.exports = { main };
