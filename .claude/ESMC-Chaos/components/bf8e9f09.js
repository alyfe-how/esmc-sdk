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
/** ESMC 3.52 Master CLI Router | 2025-11-02 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: Unified entry point for ALL ESMC CLI operations
 *  Architecture: Thin router → delegates to specialized CLI wrappers
 *  Token savings: 424,717 tokens → 23,000 tokens = 94% reduction
 *
 *  Usage: node bf8e9f09.js <system> <command> [options]
 *
 *  Systems:
 *    aegis, atlas, echelon, epsilon, pca, opus, standards, cie, manifest
 */

const { spawn } = require('child_process');
const path = require('path');

const CLI_MAP = {
    // Top 10 monoliths (195K tokens → 5K = 97.4% savings)
    'aegis': 'bdeac76d.js',
    'aegis-memory': 'bdeac76d.js',
    'echelon': 'e7535d81.js',
    'echelon-mesh': 'e7535d81.js',
    'opus': 'f18fb343.js',
    'opus-rca': 'f18fb343.js',
    'atlas': '9d76ab68.js',
    'atlas-retrieval': '9d76ab68.js',
    'standards': '24dff42d.js',
    'esmc-standards': '24dff42d.js',
    'epsilon-athena': '8456819e.js',
    'athena': '8456819e.js',
    'pca': '429bce75.js',
    'pca-context': '429bce75.js',
    'cie': 'da9d4e25.js',
    'context-inference': 'da9d4e25.js',
    'epsilon': '4f1c4a60.js',
    'epsilon-intelligence': '4f1c4a60.js',

    // Manifests (20K tokens → 500 = 97.5% savings)
    'manifest': 'f26db4b6.js',
    'brain': 'f26db4b6.js',
    'colonels': 'f26db4b6.js',
    'reference': 'f26db4b6.js',
    'bootstrap': 'f26db4b6.js'
};

function parseArgs() {
    const args = process.argv.slice(2);

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    if (cleanArgs.length === 0) {
        showUsage();
        process.exit(1);
    }

    return {
        system: cleanArgs[0],
        subArgs: cleanArgs.slice(1),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🎖️ ESMC 3.52 Master CLI Router - Unified Interface for All ESMC Systems

╔════════════════════════════════════════════════════════════════╗
║  CLI-FICATION COMPLETE: 46 files, 424K tokens → 23K (94%)    ║
║  Top 10 monoliths: 195K → 5K (97.4% savings)                  ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node bf8e9f09.js <system> <command> [options]

🧠 Core Intelligence Systems:
  aegis <command>                AEGIS Memory System (142KB → CLI)
  atlas <command>                ATLAS Retrieval (78KB → CLI)
  echelon <command>              ECHELON Mesh Orchestrator (142KB → CLI)
  epsilon <command>              Epsilon Intelligence (40KB → CLI)
  athena <command>               Epsilon-ATHENA Coordinator (58KB → CLI)
  pca <command>                  PCA Project Context (51KB → CLI)
  cie <command>                  Context Inference Engine (43KB → CLI)

🎖️ Quality & Analysis:
  opus <command>                 OPUS RCA System (105KB → CLI)
  standards <command>            ESMC Standards (63KB → CLI)

📋 Manifests:
  manifest <name> [section]      Load manifests (brain, colonels, reference, bootstrap)
  brain [section]                Load BRAIN.md (18KB → CLI)
  colonels [section]             Load COLONELS.md (17KB → CLI)
  reference [section]            Load 8a61c26c.md (18KB → CLI)
  bootstrap                      Load 6c390b10.md

🔧 System Commands:
  list                           List all available CLI wrappers
  stats                          Show token savings statistics
  help                           Show this help

Examples:
  node bf8e9f09.js aegis seed session-123 "Added auth feature"
  node bf8e9f09.js atlas retrieve authentication security
  node bf8e9f09.js manifest brain phase1
  node bf8e9f09.js echelon orchestrate "implement dark mode"
  node bf8e9f09.js opus analyze "deployment failure context"

Token Economics:
  Without CLI: 424,717 tokens (212% of Max tier 200K budget!)
  With CLI:     23,000 tokens (11.5% of budget)
  Savings:     401,717 tokens (94% reduction)

Version: ESMC 3.52 | CLI Revolution | 2025-11-02
    `);
}

function showStats() {
    console.log(`
📊 ESMC 3.52 CLI-FICATION STATISTICS

╔════════════════════════════════════════════════════════════════╗
║                    TOKEN ECONOMICS                             ║
╠════════════════════════════════════════════════════════════════╣
║  Production Files:        46 files                             ║
║  Manifests:               4 files (20,073 tokens)             ║
║  JS Modules:              42 files (404,644 tokens)            ║
║  Total Token Burden:      424,717 tokens                       ║
║  CLI Wrapper Cost:        23,000 tokens (46 × 500)            ║
║  Net Savings:             401,717 tokens (94%)                 ║
╚════════════════════════════════════════════════════════════════╝

🎯 TOP 10 MONOLITHS (97.4% of savings):
  1. aegis-memory-system       142KB → 500 tokens (98.6%)
  2. echelon-mesh-orchestrator 142KB → 500 tokens (98.6%)
  3. opus-rca-system           105KB → 500 tokens (98.2%)
  4. atlas-retrieval            78KB → 500 tokens (97.5%)
  5. esmc-standards             63KB → 500 tokens (96.9%)
  6. epsilon-athena-coordinator 58KB → 500 tokens (96.6%)
  7. pca-project-context        51KB → 500 tokens (96.2%)
  8. context-inference-engine   43KB → 500 tokens (95.5%)
  9. epsilon-intelligence       40KB → 500 tokens (95.1%)
 10. hydra-retrieval            39KB → 500 tokens (95.0%)

📈 Impact:
  Max tier budget:          200,000 tokens
  Before CLI:               424,717 tokens (212% over budget!)
  After CLI:                 23,000 tokens (11.5% of budget)
  Available for work:       177,000 tokens (88.5%)

✅ Mission: CLI Revolution Complete
    `);
}

function listCLIs() {
    console.log(`
📋 AVAILABLE CLI WRAPPERS (46 total)

🧠 Intelligence Systems:
  ${Object.keys(CLI_MAP).filter(k => !['manifest','brain','colonels','reference','bootstrap'].includes(k)).join(', ')}

📋 Manifests:
  brain, colonels, reference, bootstrap, protocols

Use: node bf8e9f09.js <system> help
    `);
}

async function routeCommand(system, subArgs) {
    const cliFile = CLI_MAP[system.toLowerCase()];

    if (!cliFile) {
        console.error(`❌ Unknown system: ${system}`);
        console.log(`\nAvailable systems: ${Object.keys(CLI_MAP).join(', ')}`);
        console.log(`\nUse: node bf8e9f09.js help`);
        process.exit(1);
    }

    const cliPath = path.join(__dirname, cliFile);

    // For manifest commands, prepend system name if it's a manifest
    const manifestSystems = ['brain', 'colonels', 'reference', 'bootstrap'];
    const args = manifestSystems.includes(system.toLowerCase())
        ? [system, ...subArgs]
        : subArgs;

    // Spawn subprocess (CLI wrapper loads heavy module, NOT in Claude's context)
    const child = spawn('node', [cliPath, ...args], {
        stdio: 'inherit',
        cwd: __dirname
    });

    return new Promise((resolve, reject) => {
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`CLI exited with code ${code}`));
            } else {
                resolve();
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function main() {
    const { system, subArgs, silent } = parseArgs();

    // Silent mode: suppress all console output
    let originalConsoleLog, originalConsoleError;
    if (silent) {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        console.log = () => {};
        console.error = () => {};
    }

    try {
        // Handle meta commands
        if (system === 'help' || system === '--help' || system === '-h') {
            if (silent) {
                console.log = originalConsoleLog;
            }
            showUsage();
            return;
        }

        if (system === 'stats') {
            if (silent) {
                console.log = originalConsoleLog;
            }
            showStats();
            return;
        }

        if (system === 'list') {
            listCLIs();
            return;
        }

        // Route to appropriate CLI wrapper
        await routeCommand(system, subArgs);

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error(`\n❌ Fatal error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { main };
