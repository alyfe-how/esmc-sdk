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
/** ESMC 3.101.0 ATHENA PA (Project Analyzer) CLI | 2025-11-15 | v1.0.0
 *  Purpose: L2 - Project Analyzer - Discover project structure and architecture gaps
 *  Token Cost: ~200 tokens (file discovery + gap analysis)
 *  Innovation: Proactive discovery - knows what exists before reading
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) { showUsage(); process.exit(1); }

    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    return {
        command: cleanArgs[0],
        query: cleanArgs.slice(1).join(' '),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🛡️ ATHENA PA (Project Analyzer) CLI - L2 Intelligence

Usage: node 50fb4af9.js <command> <query> [--silent|-s]

Commands:
  discover <keywords>      Discover project files and architecture gaps
  help                     Show this help

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.101.0 | L2 - Project Analyzer
    `);
}

async function discoverProject(query) {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);

    const discovered = {
        files_discovered: {},
        architecture_patterns: { detected: [], missing: [] },
        project_structure: {},
        gaps_identified: []
    };

    // Extract keywords for Glob patterns
    for (const keyword of keywords) {
        try {
            const pattern = `**/*${keyword}*`;
            const files = await glob(pattern, {
                ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
                nodir: true,
                maxDepth: 5
            });
            if (files.length > 0) {
                discovered.files_discovered[`${keyword}_related`] = files.slice(0, 10); // Limit to 10
            }
        } catch (error) {
            // Skip pattern if it fails
        }
    }

    // Check common architecture patterns
    const patterns = {
        'src': await glob('src/**/*.js', { nodir: true }),
        'tests': await glob('**/*.test.js', { nodir: true }),
        'config': await glob('**/*.config.js', { nodir: true }),
        'docs': await glob('docs/**/*.md', { nodir: true })
    };

    discovered.project_structure = {
        src: patterns.src.length > 0,
        tests: patterns.tests.length > 0,
        config: patterns.config.length > 0,
        docs: patterns.docs.length > 0
    };

    // Detect architecture patterns
    if (patterns.src.length > 0) discovered.architecture_patterns.detected.push('Source Directory');
    if (patterns.tests.length > 0) discovered.architecture_patterns.detected.push('Test Coverage');
    if (!patterns.tests.length) discovered.architecture_patterns.missing.push('Test Infrastructure');
    if (!patterns.docs.length) discovered.architecture_patterns.missing.push('Documentation');

    // Identify gaps based on query
    if (query.includes('auth') && discovered.files_discovered.auth_related?.length === 0) {
        discovered.gaps_identified.push('No authentication files found');
    }
    if (query.includes('session') && discovered.files_discovered.session_related?.length === 0) {
        discovered.gaps_identified.push('No session management detected');
    }
    if (query.includes('test') && !patterns.tests.length) {
        discovered.gaps_identified.push('No test files found');
    }

    discovered.timestamp = new Date().toISOString();
    return discovered;
}

async function main() {
    const { command, query, silent } = parseArgs();

    try {
        switch (command) {
            case 'discover': {
                if (!query) {
                    console.error(JSON.stringify({ error: 'Query required for discover command' }, null, 2));
                    process.exit(1);
                }
                const result = await discoverProject(query);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'help':
                showUsage();
                break;
            default:
                console.error(`Unknown command: ${command}`);
                showUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }, null, 2));
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error(JSON.stringify({ error: error.message }, null, 2));
        process.exit(1);
    });
}

module.exports = { discoverProject };
