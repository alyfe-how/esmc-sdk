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
/** ESMC 3.40 AEGIS Seed CLI Wrapper | 2025-10-30 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI entry point for AEGIS SmartSeed operations
 *  Parent: aegis-seed.js (modular library)
 *  Usage: node aegis-seed-cli.js <command> [options]
 */

const { getMemoryRegistry, IntelligentMemorySeeder, closeRegistryWatcher } = require('./aegis-seed');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════
// CLI ARGUMENT PARSING
// ═══════════════════════════════════════════════════════════════════════

function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showUsage();
        process.exit(1);
    }

    const command = args[0];
    const options = {};

    // Parse flags
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            options[key] = value || true;
        } else {
            options.sessionFile = arg;
        }
    }

    return { command, options };
}

function showUsage() {
    console.log(`
🌱 AEGIS SmartSeed CLI - Intelligent Session Memory Routing

Usage:
  node aegis-seed-cli.js <command> [options]

Commands:
  seed <session-file>        Seed a session file into AEGIS memory
  query <project>            Query project info from registry
  list                       List all registered projects
  stats                      Show memory statistics
  rebuild                    Rebuild project map from sessions
  help                       Show this help message

Options:
  --project=<name>           Specify project name (for seed command)
  --force                    Force re-seed (update existing entry)
  --verbose                  Show detailed output

Examples:
  # Seed a session file
  node aegis-seed-cli.js seed .claude/memory/sessions/2025-10-30-audit-example.json

  # Seed with specific project override
  node aegis-seed-cli.js seed session.json --project="ESMC SDK"

  # Query project info
  node aegis-seed-cli.js query "ESMC SDK"

  # List all projects
  node aegis-seed-cli.js list

  # Rebuild project map
  node aegis-seed-cli.js rebuild

Version: ESMC 3.40 | Module: aegis-seed.js
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

async function handleSeed(options) {
    const { sessionFile, project, force, verbose } = options;

    if (!sessionFile) {
        console.error('❌ Error: Session file path required');
        console.log('Usage: node aegis-seed-cli.js seed <session-file>');
        process.exit(1);
    }

    // Resolve absolute path
    const sessionPath = path.resolve(sessionFile);

    if (!fs.existsSync(sessionPath)) {
        console.error(`❌ Error: Session file not found: ${sessionPath}`);
        process.exit(1);
    }

    try {
        // Load session data
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

        if (verbose) {
            console.log(`\n📂 Session File: ${sessionPath}`);
            console.log(`📋 Session ID: ${sessionData.session_id || 'N/A'}`);
            console.log(`📅 Date: ${sessionData.date || 'N/A'}`);
        }

        // Override project if specified
        if (project) {
            sessionData.project = project;
            console.log(`🎯 Project override: ${project}`);
        }

        console.log(`\n🌱 Starting AEGIS SmartSeed...`);

        // Initialize registry and seeder
        const registry = await getMemoryRegistry();
        const seeder = new IntelligentMemorySeeder(registry);

        // Execute seed
        const result = await seeder.smartSeed(sessionData, { force });

        // Check result format (smartSeed returns { action, sessionId, file, changes })
        if (result.action === 'updated' || result.action === 'created') {
            console.log(`\n✅ Seed operation complete!`);
            console.log(`   📄 Session: ${result.sessionId || result.file}`);
            console.log(`   📈 Changes: +${result.changes.added_learnings} learnings, +${result.changes.added_patterns} patterns`);
            if (result.changes.removed_tasks > 0) {
                console.log(`   ✓ Removed ${result.changes.removed_tasks} completed tasks`);
            }
        } else {
            console.error(`\n❌ Seed operation failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Seed operation failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleQuery(options) {
    const { project, verbose } = options;

    if (!project) {
        console.error('❌ Error: Project name required');
        console.log('Usage: node aegis-seed-cli.js query <project-name>');
        process.exit(1);
    }

    try {
        const registry = await getMemoryRegistry();
        const projectInfo = registry.getProject(project);

        if (projectInfo) {
            console.log(`\n📊 Project: ${project}`);
            console.log(`   🔢 Total sessions: ${projectInfo.session_count || 0}`);
            console.log(`   📅 Last updated: ${projectInfo.last_updated || 'N/A'}`);

            if (verbose && projectInfo.topics) {
                console.log(`   🏷️  Topics: ${projectInfo.topics.length}`);
                projectInfo.topics.forEach(topic => {
                    console.log(`      - ${topic}`);
                });
            }
        } else {
            console.log(`\n⚠️  Project not found: ${project}`);
            console.log('Run "node aegis-seed-cli.js list" to see all registered projects');
        }

    } catch (error) {
        console.error(`\n❌ Query failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleList(options) {
    const { verbose } = options;

    try {
        const registry = await getMemoryRegistry();
        const projects = Object.keys(registry.projects || {});

        console.log(`\n📚 Registered Projects (${projects.length}):\n`);

        if (projects.length === 0) {
            console.log('   (No projects registered yet)');
        } else {
            projects.forEach((projectName, index) => {
                const project = registry.projects[projectName];
                console.log(`${index + 1}. ${projectName}`);
                console.log(`   📊 Sessions: ${project.session_count || 0}`);
                console.log(`   📅 Last updated: ${project.last_updated || 'N/A'}`);

                if (verbose) {
                    console.log(`   🏷️  Topics: ${(project.topics || []).length}`);
                }
                console.log('');
            });
        }

    } catch (error) {
        console.error(`\n❌ List failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleStats(options) {
    const { verbose } = options;

    try {
        const registry = await getMemoryRegistry();
        const stats = await registry.getStats();

        console.log(`\n📊 AEGIS Memory Statistics:\n`);
        console.log(`   🗂️  Total projects: ${stats.total_projects || 0}`);
        console.log(`   📄 Total sessions: ${stats.total_sessions || 0}`);
        console.log(`   🏷️  Total topics: ${stats.total_topics || 0}`);
        console.log(`   💾 Memory path: ${registry.memoryPath}`);
        console.log(`   🎖️  Tier: ${registry.tier}`);
        console.log(`   🔢 Version: ${registry.version}`);

        if (verbose && stats.projects) {
            console.log(`\n   📈 Top Projects by Session Count:`);
            const sorted = Object.entries(stats.projects)
                .sort((a, b) => (b[1].session_count || 0) - (a[1].session_count || 0))
                .slice(0, 5);

            sorted.forEach(([name, info], index) => {
                console.log(`      ${index + 1}. ${name}: ${info.session_count} sessions`);
            });
        }

    } catch (error) {
        console.error(`\n❌ Stats failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleRebuild(options) {
    const { verbose } = options;

    try {
        console.log(`\n🔄 Rebuilding project map from sessions...`);

        const registry = await getMemoryRegistry();
        const result = await registry.rebuildProjectMap();

        console.log(`\n✅ Project map rebuilt!`);
        console.log(`   📊 Projects indexed: ${result.projects_indexed || 0}`);
        console.log(`   📄 Sessions scanned: ${result.sessions_scanned || 0}`);

        if (verbose && result.projects) {
            console.log(`\n   📈 Projects discovered:`);
            result.projects.forEach((project, index) => {
                console.log(`      ${index + 1}. ${project.name} (${project.session_count} sessions)`);
            });
        }

    } catch (error) {
        console.error(`\n❌ Rebuild failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    const { command, options } = parseArgs();

    try {
        switch (command) {
            case 'seed':
                await handleSeed(options);
                break;
            case 'query':
                await handleQuery({ project: options.sessionFile, verbose: options.verbose });
                break;
            case 'list':
                await handleList(options);
                break;
            case 'stats':
                await handleStats(options);
                break;
            case 'rebuild':
                await handleRebuild(options);
                break;
            case 'help':
            case '--help':
            case '-h':
                showUsage();
                break;
            default:
                console.error(`❌ Unknown command: ${command}`);
                showUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    } finally {
        // Clean up watchers
        closeRegistryWatcher();
    }
}

// Run CLI if invoked directly
if (require.main === module) {
    main().catch(error => {
        console.error(`\n❌ Unhandled error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { main };
