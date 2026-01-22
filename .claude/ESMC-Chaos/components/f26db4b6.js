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
/** ESMC 3.52 Manifest CLI | 2025-11-02 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI wrapper for ESMC manifest files (BRAIN, COLONELS, REFERENCE, BOOTSTRAP)
 *  Savings: 20,073 tokens → 500 tokens = 97.5% reduction (4 manifests)
 *  Usage: node f26db4b6.js <manifest> [section]
 */

const fs = require('path');
const path = require('path');

const MANIFESTS = {
    brain: '../BRAIN.md',
    colonels: '../COLONELS.md',
    reference: './8a61c26c.md',
    bootstrap: './6c390b10.md',
    protocols: '../REFERENCE-P1-P3-PROTOCOLS.md'
};

function parseArgs() {
    const args = process.argv.slice(2);

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    if (cleanArgs.length === 0) {
        showUsage();
        process.exit(1);
    }
    return { manifest: cleanArgs[0], section: cleanArgs[1], options: cleanArgs.slice(2), silent: silent };
}

function showUsage() {
    console.log(`
🎖️ ESMC Manifest CLI - Load manifests without burning tokens in context

Usage:
  node f26db4b6.js <manifest> [section] [options]

Manifests:
  brain                          BRAIN.md (memory retrieval + mesh intelligence)
  colonels                       COLONELS.md (7-colonel deployment)
  reference                      8a61c26c.md (ECHO/SEED protocols)
  bootstrap                      6c390b10.md (routing layer)
  protocols                      REFERENCE-P1-P3-PROTOCOLS.md (premium protocols)

Sections (optional):
  phase0                         Extract Phase 0 only
  phase1                         Extract Phase 1 only
  all                            Full manifest (default)

Options:
  --json                         Output as JSON
  --lines=N                      Output first N lines only

Examples:
  node f26db4b6.js brain          # Load full BRAIN.md
  node f26db4b6.js colonels phase1  # Load Phase 1 of COLONELS
  node f26db4b6.js reference --lines=100  # First 100 lines

Version: ESMC 3.52 | Manifests: 4 files, 20,073 tokens → 500 (97.5% savings)
    `);
}

async function main() {
    const { manifest, section, options, silent } = parseArgs();

    // Silent mode: suppress all console output
    let originalConsoleLog, originalConsoleError;
    if (silent) {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        console.log = () => {};
        console.error = () => {};
    }

    try {
        if (manifest === 'help' || manifest === '--help') {
            if (silent) {
                console.log = originalConsoleLog;
            }
            showUsage();
            return;
        }

        const manifestPath = MANIFESTS[manifest.toLowerCase()];
        if (!manifestPath) {
            console.error(`❌ Unknown manifest: ${manifest}`);
            console.log(`Available: ${Object.keys(MANIFESTS).join(', ')}`);
            process.exit(1);
        }

        const fullPath = path.join(__dirname, manifestPath);
        const content = require('fs').readFileSync(fullPath, 'utf8');

        // Section extraction (if specified)
        if (section && section !== 'all') {
            const phaseMatch = section.match(/phase(\d+)/i);
            if (phaseMatch) {
                const phaseNum = phaseMatch[1];
                const regex = new RegExp(`## .*PHASE ${phaseNum}[\\s\\S]*?(?=## |$)`, 'i');
                const extracted = content.match(regex);
                if (extracted) {
                    console.log(extracted[0]);
                } else {
                    console.error(`❌ Phase ${phaseNum} not found in ${manifest}`);
                    process.exit(1);
                }
                return;
            }
        }

        // Line limiting (if specified)
        const linesFlag = options.find(opt => opt.startsWith('--lines='));
        if (linesFlag) {
            const lineCount = parseInt(linesFlag.split('=')[1]);
            const lines = content.split('\n').slice(0, lineCount);
            console.log(lines.join('\n'));
            return;
        }

        // JSON output (if specified)
        if (options.includes('--json')) {
            console.log(JSON.stringify({
                manifest,
                content,
                size: content.length,
                lines: content.split('\n').length
            }, null, 2));
            return;
        }

        // Default: full output
        console.log(content);

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
