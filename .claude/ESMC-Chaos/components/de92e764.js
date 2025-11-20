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
/** ESMC 3.77 PCA Project Context CLI | 2025-11-08 | v1.1.0 | PROD | ALL_TIERS
 *  Purpose: CLI wrapper for a3226f07.js (51KB, 13.1K tokens)
 *  Savings: 13,074 tokens → 500 tokens = 96.2% reduction
 *  ESMC 3.77: Added --silent flag support for lightweight mode
 *  Usage: node de92e764.js <command> [options] [--silent|-s]
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
🎖️ PCA Project Context CLI - Project-specific context & patterns (SOUTH intelligence)

Usage:
  node de92e764.js <command> [options] [--silent|-s]

Commands:
  analyze <keywords>             Analyze project context
  patterns                       Get project patterns
  context <component>            Get component context
  help                           Show this help

Options:
  --silent, -s                   Suppress verbose output, only return JSON

Version: ESMC 3.77 | Module: a3226f07.js (51KB)
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

        // Load heavy module in subprocess
        const { ProjectContextAnalyzer } = require('./a3226f07.js');
        const pca = new ProjectContextAnalyzer({ silent: silent }); // 🆕 ESMC 3.88.0: Pass silent flag

        let result;
        switch (command) {
            case 'analyze':
                const keywords = options; // Keep as array
                result = await pca.analyzeWithT1Reuse(keywords);
                break;

            case 'patterns':
                const patternKeywords = ['project', 'patterns']; // Array
                result = await pca.analyzeWithT1Reuse(patternKeywords);
                break;

            case 'context':
                const componentKeywords = options; // Keep as array
                result = await pca.analyzeWithT1Reuse(componentKeywords);
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
    main().catch(error => {
        console.error(`❌ Fatal: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { main };
