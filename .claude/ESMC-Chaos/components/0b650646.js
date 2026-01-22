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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.52 Memory Bank CLI | 2025-11-02 | v1.0.0 | PROD
 *  Purpose: CLI wrapper for 6b9da301.js (27KB, 7K tokens)
 *  Savings: 7,030 tokens → 500 tokens = 92.9% reduction
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
function showUsage() { console.log(`🎖️ Memory Bank CLI - Long-term memory storage\nUsage: node 0b650646.js <command> [options]\nCommands:\n  store <data>    Store memory\n  retrieve <id>   Retrieve memory\n  search <query>  Search memories\n  help            Show help\nVersion: ESMC 3.52 | Module: 6b9da301.js (27KB)`); }
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
    } try { if (command === 'help') { showUsage(); return; } const { MemoryBank } = require('./6b9da301.js'); const bank = new MemoryBank(); switch (command) { case 'store': // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify(await bank.store({ data: options.join(' ') }), null, 2)); break; case 'retrieve': console.log(JSON.stringify(await bank.retrieve({ id: options[0] }), null, 2)); break; case 'search': console.log(JSON.stringify(await bank.search({ query: options.join(' ') }), null, 2)); break; default: console.error(`❌ Unknown: ${command}`); showUsage(); process.exit(1); } } catch (error) { console.error(`❌ Error: ${error.message}`); process.exit(1); } }
if (require.main === module) { main().catch(error => { console.error(`❌ Fatal: ${error.message}`); process.exit(1); }); }
module.exports = { main };
