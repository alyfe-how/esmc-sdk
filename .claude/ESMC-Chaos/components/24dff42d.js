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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.52 ESMC Standards CLI | 2025-11-02 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI wrapper for bf98e40d.js (63KB, 16.2K tokens)
 *  Savings: 16,245 tokens → 500 tokens = 96.9% reduction
 *  Usage: node 24dff42d.js <command> [options]
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
🎖️ ESMC Standards CLI - Coding standards, patterns, and best practices

Usage:
  node 24dff42d.js <command> [options]

Commands:
  validate <file>                Validate code against standards
  patterns <domain>              Get domain-specific patterns
  check <code>                   Check code compliance
  help                           Show this help

Version: ESMC 3.52 | Module: bf98e40d.js (63KB)
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
        const { ESMCStandards } = require('./bf98e40d.js');
        const standards = new ESMCStandards();

        switch (command) {
            case 'validate':
                const result = await standards.validate({
                    file: options[0]
                });
                // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify(result, null, 2));
                break;

            case 'patterns':
                const patterns = await standards.getPatterns({
                    domain: options[0]
                });
                console.log(JSON.stringify(patterns, null, 2));
                break;

            case 'check':
                const check = await standards.checkCompliance({
                    code: options.join(' ')
                });
                console.log(JSON.stringify(check, null, 2));
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
