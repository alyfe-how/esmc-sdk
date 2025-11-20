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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.52 AEGIS Memory System CLI | 2025-11-02 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI wrapper for be989519.js (142KB, 36.5K tokens)
 *  Savings: 36,525 tokens → 500 tokens = 98.6% reduction
 *  Usage: node f6ea6b55.js <command> [options]
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
🎖️ AEGIS Memory System CLI - Memory management, ECHO, SEED, WRITE operations

Usage:
  node f6ea6b55.js <command> [options]

Commands:
  seed <sessionId> <summary>     Create session seed
  echo <prompt>                  Create ECHO checkpoint
  write <data>                   Write to memory system
  audit                          Audit memory system
  help                           Show this help

Version: ESMC 3.52 | Module: be989519.js (142KB)
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

        // Load heavy module in subprocess (NOT in Claude's context)
        const { AEGISSystem } = require('./be989519.js');
        const aegis = new AEGISSystem();

        switch (command) {
            case 'seed':
                const result = await aegis.smartSeed({
                    sessionId: options[0] || 'cli-session',
                    summary: options[1] || 'CLI-triggered seed'
                });
                // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify(result, null, 2));
                break;

            case 'echo':
                const echoResult = await aegis.createEcho({
                    prompt: options.join(' ')
                });
                console.log(JSON.stringify(echoResult, null, 2));
                break;

            case 'write':
                const writeResult = await aegis.safeWrite({
                    data: options[0]
                });
                console.log(JSON.stringify(writeResult, null, 2));
                break;

            case 'audit':
                const auditResult = await aegis.auditMemorySystem();
                console.log(JSON.stringify(auditResult, null, 2));
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
