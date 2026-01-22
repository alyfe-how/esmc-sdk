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
/** ESMC 3.14.2 ATLAS REBUILD CLI | 2025-11-04 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI tool to rebuild ATLAS project index
 *  Usage: node 0e1a7b05.js [--force]
 */

const fs = require('fs');
const path = require('path');

async function main() {
    const args = process.argv.slice(2);
    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;

    // Silent mode: suppress all console output
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

    const force = args.includes('--force');

    console.log('🗺️ ATLAS Project Index Rebuild\n');

    try {
        // Determine project root
        let current = __dirname;
        let projectRoot = null;

        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            if (fs.existsSync(memoryPath)) {
                projectRoot = current;
                break;
            }
            current = path.dirname(current);
        }

        if (!projectRoot) {
            console.error('❌ Could not locate .claude/memory/ directory');
            process.exit(1);
        }

        const indexPath = path.join(projectRoot, '.claude', 'memory', '.project-index.json');

        // Check if index exists
        if (fs.existsSync(indexPath) && !force) {
            const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
            const fileCount = Object.keys(index.files || {}).length;

            console.log('✅ Index already exists:');
            console.log(`   Files tracked: ${fileCount}`);
            console.log(`   Last updated: ${index.last_updated || index.created}`);
            console.log('');
            console.log('💡 Use --force to rebuild');
            process.exit(0);
        }

        // Delete existing index if force rebuild
        if (force && fs.existsSync(indexPath)) {
            console.log('🗑️  Deleting existing index (--force)...');
            fs.unlinkSync(indexPath);
        }

        // Run validator to rebuild
        console.log('🔨 Building project index...\n');

        const { validateProjectIndex } = require('./576039da.js');
        const result = await validateProjectIndex({ projectRoot });

        if (result.exists && result.valid) {
            console.log('');
            console.log('✅ ATLAS index rebuild complete!');
            console.log(`   Files tracked: ${result.files}`);
            console.log(`   Domains: ${result.domains}`);
            console.log(`   Build time: ${result.buildTime}ms`);
        } else {
            console.error('❌ Index rebuild failed:', result.error);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
