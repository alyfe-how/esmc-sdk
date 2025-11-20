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
/** ESMC 3.77 PIU Intent Understanding CLI | 2025-11-08 | v1.1.0 | PROD
 *  Purpose: CLI wrapper for 322a6ec7.js (33KB, 8.5K tokens)
 *  Savings: 8,546 tokens → 500 tokens = 94.2% reduction
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
🎖️ PIU Intent Understanding CLI - NORTH intelligence (Universal PM patterns)

Usage: node 42112527.js <command> [options] [--silent|-s]

Commands:
  analyze <prompt>         Analyze user intent
  patterns                 Get universal PM patterns
  confidence <text>        Calculate intent confidence
  help                     Show this help

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.77 | Module: 322a6ec7.js (33KB)
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

        const PIUIntentUnderstandingEngine = require('./322a6ec7.js');
        const piu = new PIUIntentUnderstandingEngine();

        let result;
        switch (command) {
            case 'analyze':
                const userCommand = options.join(' ');
                result = await piu.analyzeIntent(userCommand);
                break;
            case 'patterns':
                result = await piu.getUniversalPatterns();
                break;
            case 'confidence':
                result = await piu.calculateConfidence({ text: options.join(' ') });
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
