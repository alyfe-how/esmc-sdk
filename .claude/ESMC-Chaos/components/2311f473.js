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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.52 Memory Retrieval Engine CLI | 2025-11-02 | v1.0.0 | PROD
 *  Purpose: CLI wrapper for memory-retrieval-engine.js (34KB, 8.8K tokens)
 *  Savings: 8,793 tokens → 500 tokens = 94.3% reduction
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
function showUsage() { console.log(`🎖️ Memory Retrieval Engine CLI - Advanced memory search\nUsage: node 2311f473.js <command> [options]\nCommands:\n  retrieve <keywords>  Retrieve memories\n  search <query>       Advanced search\n  index                Update search index\n  help                 Show help\nVersion: ESMC 3.52 | Module: memory-retrieval-engine.js (34KB)`); }
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
    } try { if (command === 'help') { showUsage(); return; } const { MemoryRetrievalEngine } = require('../memory-retrieval-engine.js'); const engine = new MemoryRetrievalEngine(); switch (command) { case 'retrieve': // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify(await engine.retrieve({ keywords: options }), null, 2)); break; case 'search': console.log(JSON.stringify(await engine.search({ query: options.join(' ') }), null, 2)); break; case 'index': console.log(JSON.stringify(await engine.updateIndex(), null, 2)); break; default: console.error(`❌ Unknown: ${command}`); showUsage(); process.exit(1); } } catch (error) { console.error(`❌ Error: ${error.message}`); process.exit(1); } }
if (require.main === module) { main().catch(error => { console.error(`❌ Fatal: ${error.message}`); process.exit(1); }); }
module.exports = { main };
