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
/** ESMC 3.77 CUP Signal Extraction CLI | 2025-11-08 | v1.0.0 | PROD
 *  Purpose: CLI wrapper for 9a1b110a.js (continuous profiling)
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
        message: cleanArgs.join(' '),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🔍 CUP Signal Extraction CLI - Continuous User Profiling (Passive)

Usage: node 61764c1d.js "<message>" [--silent|-s]

Arguments:
  <message>               User message to analyze (required)

Options:
  --silent, -s           Suppress verbose output, silent execution

What it does:
  - Extracts linguistic/behavioral signals from user messages
  - Appends to .user-profiling-buffer.json (passive accumulation)
  - Signals: Vocabulary complexity, question patterns, discourse markers,
    hedging language, technical density, conversation flow, education level

Version: ESMC 3.77 | Module: 9a1b110a.js
    `);
}

async function main() {
    const { message, silent } = parseArgs();

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
        // Load SignalExtractor class
        const SignalExtractor = require('./9a1b110a.js');
        const extractor = new SignalExtractor();

        // Extract signals
        const signals = extractor.extractSignals(message);

        if (!signals) {
            if (silent) {
                console.error = originalConsoleError;
            }
            console.error('❌ Failed to extract signals');
            process.exit(1);
        }

        // Append to buffer (critical side effect - file write)
        const result = extractor.appendToBuffer(signals);

        // Restore console for output
        if (silent) {
            console.log = originalConsoleLog;
        }

        // Silent mode: Just return success status (no verbose output)
        // Non-silent mode: Show extraction summary
        if (!silent) {
            console.log('✅ Signals extracted and buffered');
            console.log(`   Message count: ${result.message_count}`);
        }

        // Return success code
        process.exit(0);

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
