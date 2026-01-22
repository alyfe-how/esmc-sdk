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
/** ESMC 3.68.2 CL Reader CLI | 2025-11-07 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: Read changelog documentation for CL-tagged code sections
 *  Innovation: Consolidates CL file lookup + read into single CLI call
 *  Savings: ~100 tokens per CL read (manual path construction + Read tool → 1 Bash call)
 *  Usage: node a8a997cf.js <baseFilename> <clNumber>
 *  Example: node a8a997cf.js BRAIN 19
 *  Returns: CL metadata + full content (or graceful error if CL not found)
 */

const fs = require('fs');

// 🆕 ESMC 3.101.0: Silent by default
const VERBOSE = process.env.ESMC_VERBOSE === 'true' || process.argv.includes('--verbose');
if (!VERBOSE) {
    console.log = console.error = () => {};
}
const path = require('path');

class CLReaderCLI {
    constructor() {
        this.version = "1.0.0";
        this.projectRoot = this._findProjectRoot();
        this.changelogsDir = path.join(this.projectRoot, '.claude', 'memory', 'documents', 'changelogs');
    }

    /**
     * Auto-detect project root by walking up from module location
     * @returns {string} Absolute path to project root
     */
    _findProjectRoot() {
        let current = __dirname;
        while (current !== path.dirname(current)) {
            const claudePath = path.join(current, '.claude', 'memory');
            if (fs.existsSync(claudePath)) {
                return current;
            }
            current = path.dirname(current);
        }
        return process.cwd();
    }

    /**
     * Read CL file for given base filename and CL number
     * @param {string} baseFilename - Base filename (e.g., "BRAIN", "memory-bundle-cli")
     * @param {string|number} clNumber - CL number (e.g., "19", 0)
     * @returns {Object} CL data with metadata and content
     */
    readCL(baseFilename, clNumber) {
        console.log(`📖 CL Reader CLI ${this.version}`);
        console.log(`   Reading: ${baseFilename}-CL${clNumber}.md`);

        // Construct CL file path
        const clFilename = `${baseFilename}-CL${clNumber}.md`;
        const clFilePath = path.join(this.changelogsDir, clFilename);

        // Security: Validate path stays within changelogs directory
        const resolvedPath = path.resolve(clFilePath);
        const resolvedChangelogsDir = path.resolve(this.changelogsDir);
        if (!resolvedPath.startsWith(resolvedChangelogsDir)) {
            console.error(`   🚨 Security: Path traversal attempt blocked`);
            return {
                found: false,
                error: 'Path traversal attempt detected',
                baseFilename,
                clNumber
            };
        }

        // Check if CL file exists
        if (!fs.existsSync(clFilePath)) {
            console.warn(`   ⚠️ CL file not found: ${clFilename}`);
            console.warn(`   Expected path: ${clFilePath}`);
            return {
                found: false,
                error: 'CL file not found',
                baseFilename,
                clNumber,
                expectedPath: clFilePath
            };
        }

        // Read CL file
        try {
            const content = fs.readFileSync(clFilePath, 'utf8');
            const lines = content.split('\n');

            // Extract metadata from first line (# CL{number} - {description})
            const firstLine = lines[0];
            const titleMatch = firstLine.match(/^#\s+CL(\d+)\s+-\s+(.+)$/);

            let title = 'Unknown';
            let description = 'Unknown';
            if (titleMatch) {
                title = `CL${titleMatch[1]}`;
                description = titleMatch[2];
            }

            // Extract date from "**Date:**" line
            const dateLine = lines.find(line => line.startsWith('**Date:**'));
            const date = dateLine ? dateLine.replace('**Date:**', '').trim() : 'Unknown';

            // Extract component from "**Component:**" line
            const componentLine = lines.find(line => line.startsWith('**Component:**'));
            const component = componentLine ? componentLine.replace('**Component:**', '').trim() : baseFilename;

            console.log(`   ✅ CL Found: ${title} - ${description}`);
            console.log(`   📅 Date: ${date}`);
            console.log(`   🔧 Component: ${component}`);
            console.log(`   📄 Size: ${content.length} bytes (${lines.length} lines)`);

            return {
                found: true,
                baseFilename,
                clNumber,
                title,
                description,
                date,
                component,
                path: clFilePath,
                size: content.length,
                lines: lines.length,
                content
            };

        } catch (error) {
            console.error(`   ❌ Error reading CL file: ${error.message}`);
            return {
                found: false,
                error: error.message,
                baseFilename,
                clNumber,
                path: clFilePath
            };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
        showUsage();
        process.exit(args[0] === 'help' || args[0] === '--help' ? 0 : 1);
    }

    if (args.length < 2) {
        console.error('❌ Error: Both baseFilename and clNumber are required\n');
        showUsage();
        process.exit(1);
    }

    return {
        baseFilename: args[0],
        clNumber: args[1]
    };
}

function showUsage() {
    console.log(`
📖 CL Reader CLI - Read Changelog Documentation (ESMC 3.68.2)

Usage:
  node a8a997cf.js <baseFilename> <clNumber>
  node a8a997cf.js help

Arguments:
  baseFilename      Base filename of the component (e.g., "BRAIN", "memory-bundle-cli")
  clNumber          CL number (e.g., "19", "0")

Examples:
  node a8a997cf.js BRAIN 19
  node a8a997cf.js memory-bundle-cli 0
  node a8a997cf.js COLONELS-CORE 15

Output:
  JSON object containing CL metadata and full content

Token Savings:
  Manual (Read tool + path construction): ~150 tokens
  CLI wrapper: ~50 tokens
  Savings: ~100 tokens per CL read (67% reduction)

Version: ESMC 3.68.2 | CL Reader v1.0.0
    `);
}

function main() {
    const { baseFilename, clNumber } = parseArgs();

    try {
        const cli = new CLReaderCLI();
        const result = cli.readCL(baseFilename, clNumber);

        // Output JSON result
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(JSON.stringify(result, null, 2));

        // Exit with appropriate code
        process.exit(result.found ? 0 : 1);

    } catch (error) {
        console.error(`❌ Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = CLReaderCLI;
