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
/** ESMC 3.77 DKI Domain Knowledge CLI | 2025-11-08 | v1.1.0 | PROD
 *  Purpose: CLI wrapper for 18548b52.js (36KB, 9.3K tokens)
 *  Savings: 9,296 tokens → 500 tokens = 94.6% reduction
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
🎖️ DKI Domain Knowledge CLI - WEST intelligence (Standards & best practices)

Usage: node 2c423ec8.js <command> [options] [--silent|-s]

Commands:
  search <keywords>        Search domain knowledge
  standards <domain>       Get domain standards
  patterns <type>          Get design patterns
  help                     Show this help

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.77 | Module: 18548b52.js (36KB)
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

        const DKIDomainKnowledgeEngine = require('./18548b52.js');
        const dki = new DKIDomainKnowledgeEngine();

        // 🆕 ESMC 3.70: Call initialize() for graceful degradation (MySQL optional)
        await dki.initialize();

        let result;
        switch (command) {
            case 'search':
                const userCommand = options.join(' ');
                result = await dki.analyzeDomain(userCommand);
                break;
            case 'standards':
                const domain = options.join(' ');
                result = await dki.analyzeDomain(domain);
                break;
            case 'patterns':
                const pattern = options.join(' ');
                result = await dki.analyzeDomain(pattern);
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
