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
/** ESMC 3.101.0 ATHENA CWA (Context Window Analyzer) CLI | 2025-11-15 | v1.0.0
 *  Purpose: L1 - Context Window Analyzer - Introspective inventory of loaded context
 *  Token Cost: 0 tokens (pure introspection, no file I/O)
 *  Innovation: Bridges awareness gap - makes Claude aware of context window contents
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) { showUsage(); process.exit(1); }

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
🛡️ ATHENA CWA (Context Window Analyzer) CLI - L1 Intelligence

Usage: node ef51aca2.js <command> [options] [--silent|-s]

Commands:
  analyze                  Analyze context window contents (introspective)
  help                     Show this help

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.101.0 | L1 - Context Window Analyzer
    `);
}

function analyzeContextWindow() {
    const cwd = process.cwd();
    const claudeDir = path.join(cwd, '.claude');

    // Check what manifests are loaded (by checking if files exist in expected locations)
    const manifests = {
        BOOTSTRAP: fs.existsSync(path.join(claudeDir, 'ESMC Complete/core/6c390b10.md')),
        BRAIN_CORE: fs.existsSync(path.join(claudeDir, 'ESMC Complete/core/b4fe7dcb.md')),
        COLONELS_TALK: fs.existsSync(path.join(claudeDir, 'ESMC Complete/core/2dfb6b92.md')),
        REFERENCE: fs.existsSync(path.join(claudeDir, 'ESMC Complete/core/8a61c26c.md'))
    };

    // Check if memory loaded
    const memoryLoaded = fs.existsSync(path.join(claudeDir, 'memory/.esmc-working-memory.json'));

    // Check manifest counters
    let counters = { A: 0, B: 0, C: 0, D: 0, X: 0 };
    try {
        const countersPath = path.join(claudeDir, '.esmc-manifest-counters.json');
        if (fs.existsSync(countersPath)) {
            counters = JSON.parse(fs.readFileSync(countersPath, 'utf8'));
        }
    } catch (error) {
        // Counters not available
    }

    // Check lessons
    let lessons = [];
    try {
        const lessonsPath = path.join(claudeDir, 'memory/.esmc-lessons.json');
        if (fs.existsSync(lessonsPath)) {
            const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
            lessons = lessonsData.lessons || [];
        }
    } catch (error) {
        // Lessons not available
    }

    // Check user profile
    let userProfile = null;
    try {
        const memoryPath = path.join(claudeDir, 'memory/.esmc-working-memory.json');
        if (fs.existsSync(memoryPath)) {
            const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
            userProfile = memory.user_adaptation || null;
        }
    } catch (error) {
        // User profile not available
    }

    return {
        manifests_loaded: Object.keys(manifests).filter(k => manifests[k]),
        manifest_counters: counters,
        memory_loaded: memoryLoaded,
        lessons_active: lessons.map(l => l.id),
        user_profile: userProfile ? userProfile.name : null,
        context_summary: `${Object.keys(manifests).filter(k => manifests[k]).length} manifests, ${memoryLoaded ? 'memory loaded' : 'no memory'}, ${lessons.length} lessons`,
        timestamp: new Date().toISOString()
    };
}

async function main() {
    const { command, options, silent } = parseArgs();

    try {
        switch (command) {
            case 'analyze': {
                const result = analyzeContextWindow();
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

module.exports = { analyzeContextWindow };
