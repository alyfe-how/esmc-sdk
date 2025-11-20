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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.52 Response Adapter CLI | 2025-11-02 | v1.0.0 | PROD
 *  Purpose: CLI wrapper for 8c92d1e8.js (32KB, 8.2K tokens)
 *  Savings: 8,193 tokens → 500 tokens = 93.9% reduction
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
🎖️ Response Adapter CLI - Adaptive response formatting based on user profile

Usage: node ecd1917d.js <command> [options]

Commands:
  adapt <text>             Adapt response to user profile
  format <content>         Format response
  style <preferences>      Apply style preferences
  help                     Show this help

Version: ESMC 3.52 | Module: 8c92d1e8.js (32KB)
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
        if (command === 'help' || command === '--help') { if (silent) {
                // Restore console for help output
                console.log = originalConsoleLog;
            }
            showUsage(); return; }
        const { ResponseAdapter } = require('./8c92d1e8.js');
        const adapter = new ResponseAdapter();
        switch (command) {
            case 'adapt':
                const result = await adapter.adaptResponse({ text: options.join(' ') });
                // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify(result, null, 2));
                break;
            case 'format':
                const formatted = await adapter.formatResponse({ content: options.join(' ') });
                console.log(JSON.stringify(formatted, null, 2));
                break;
            case 'style':
                const styled = await adapter.applyStyle({ preferences: options[0] });
                console.log(JSON.stringify(styled, null, 2));
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
    main().catch(error => { console.error(`❌ Fatal: ${error.message}`); process.exit(1); });
}

module.exports = { main };
