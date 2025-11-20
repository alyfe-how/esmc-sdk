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
/** ESMC 3.40 AEGIS GC CLI Wrapper | 2025-10-30 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI entry point for AEGIS garbage collection operations
 *  Parent: aegis-gc.js (modular library)
 *  Usage: node aegis-gc-cli.js <command> [options]
 */

const { MemoryGarbageCollector } = require('./aegis-gc');
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
            options.firstArg = arg;
        }
    }

    return { command, options };
}

function showUsage() {
    console.log(`
🗑️  AEGIS Memory Garbage Collector CLI - Automatic Memory Maintenance

Usage:
  node aegis-gc-cli.js <command> [options]

Commands:
  run                        Run garbage collection (archive old sessions)
  stats                      Show GC statistics
  retrieve <session-id>      Retrieve archived session
  list                       List archived sessions
  cleanup                    Clean orphaned topic index references
  staleness                  Check topic index staleness
  help                       Show this help message

Options:
  --ttl=<days>               Time-to-live in days (default: 90)
  --dry-run                  Preview without making changes
  --force                    Force archival (skip confirmations)
  --verbose                  Show detailed output

Examples:
  # Run GC with default TTL (90 days)
  node aegis-gc-cli.js run

  # Dry run (preview only)
  node aegis-gc-cli.js run --dry-run

  # Run with custom TTL (30 days)
  node aegis-gc-cli.js run --ttl=30

  # Show GC statistics
  node aegis-gc-cli.js stats

  # List archived sessions
  node aegis-gc-cli.js list

  # Retrieve archived session
  node aegis-gc-cli.js retrieve 2025-09-15-example-session

  # Clean orphaned references
  node aegis-gc-cli.js cleanup

  # Check staleness
  node aegis-gc-cli.js staleness

Version: ESMC 3.40 | Module: aegis-gc.js
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

async function handleRun(options) {
    const { ttl, dryRun, force, verbose } = options;

    try {
        const ttlDays = ttl ? parseInt(ttl) : 90;

        console.log(`\n🗑️  Running AEGIS Memory Garbage Collector...`);
        console.log(`   ⏰ TTL: ${ttlDays} days`);
        console.log(`   🔄 Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE'}`);

        const gc = new MemoryGarbageCollector({ ttlDays });
        const result = await gc.run({ dryRun: !!dryRun });

        console.log(`\n📊 GC Results:`);
        console.log(`   📦 Sessions archived: ${result.archived_count || 0}`);
        console.log(`   💾 Space saved: ${((result.bytes_saved || 0) / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   📉 Compression ratio: ${result.compression_ratio || 'N/A'}`);
        console.log(`   ⏱️  Duration: ${result.duration_ms || 0}ms`);

        if (verbose && result.archived_files) {
            console.log(`\n   📁 Archived files:`);
            result.archived_files.forEach((file, index) => {
                console.log(`      ${index + 1}. ${file}`);
            });
        }

        if (dryRun) {
            console.log(`\n💡 This was a dry run. Run without --dry-run to apply changes.`);
        } else {
            console.log(`\n✅ GC complete!`);
        }

    } catch (error) {
        console.error(`\n❌ GC failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleStats(options) {
    const { verbose } = options;

    try {
        console.log(`\n📊 Loading GC statistics...`);

        const gc = new MemoryGarbageCollector();
        const stats = await gc.getStats();

        console.log(`\n📊 AEGIS Memory Statistics:\n`);
        console.log(`   📂 Active sessions: ${stats.active_sessions || 0}`);
        console.log(`   📦 Archived sessions: ${stats.archived_sessions || 0}`);
        console.log(`   💾 Active storage: ${((stats.active_bytes || 0) / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   💾 Archived storage: ${((stats.archived_bytes || 0) / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   📉 Compression ratio: ${stats.compression_ratio || 'N/A'}`);
        console.log(`   🗑️  TTL: ${stats.ttl_days || 90} days`);

        if (verbose && stats.oldest_session) {
            console.log(`\n   📅 Oldest active session: ${stats.oldest_session}`);
            console.log(`   📅 Newest archived session: ${stats.newest_archived || 'N/A'}`);
        }

    } catch (error) {
        console.error(`\n❌ Stats failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleRetrieve(options) {
    const { firstArg, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: Session ID required');
        console.log('Usage: node aegis-gc-cli.js retrieve <session-id>');
        process.exit(1);
    }

    const sessionId = firstArg;

    try {
        console.log(`\n🔍 Retrieving archived session: ${sessionId}...`);

        const gc = new MemoryGarbageCollector();
        const result = await gc.retrieveArchivedSession(sessionId);

        if (result.success) {
            console.log(`\n✅ Session retrieved!`);
            console.log(`   📄 Session ID: ${result.session_id}`);
            console.log(`   📅 Archived date: ${result.archived_date || 'N/A'}`);
            console.log(`   💾 Compressed size: ${((result.compressed_bytes || 0) / 1024).toFixed(2)} KB`);
            console.log(`   💾 Uncompressed size: ${((result.uncompressed_bytes || 0) / 1024).toFixed(2)} KB`);

            if (verbose && result.data) {
                console.log(`\n   📋 Session Data:`);
                console.log(JSON.stringify(result.data, null, 2));
            } else {
                console.log(`\n   💡 Use --verbose to see full session data`);
            }
        } else {
            console.error(`\n❌ Retrieve failed: ${result.error || 'Session not found'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Retrieve failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleList(options) {
    const { verbose } = options;

    try {
        console.log(`\n📦 Loading archived sessions...`);

        const gc = new MemoryGarbageCollector();
        const coldStoragePath = gc.coldStoragePath;

        if (!fs.existsSync(coldStoragePath)) {
            console.log(`\n⚠️  No cold storage found`);
            console.log('   (No sessions have been archived yet)');
            return;
        }

        const files = fs.readdirSync(coldStoragePath).filter(f => f.endsWith('.json.gz'));

        console.log(`\n📦 Archived Sessions (${files.length}):\n`);

        if (files.length === 0) {
            console.log('   (No archived sessions)');
        } else {
            files.forEach((filename, index) => {
                const filepath = path.join(coldStoragePath, filename);
                const stats = fs.statSync(filepath);
                const sessionId = filename.replace('.json.gz', '');

                console.log(`${index + 1}. ${sessionId}`);
                console.log(`   📏 Size: ${(stats.size / 1024).toFixed(2)} KB (compressed)`);
                console.log(`   📅 Archived: ${stats.mtime.toISOString()}`);
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

async function handleCleanup(options) {
    const { verbose } = options;

    try {
        console.log(`\n🧹 Cleaning orphaned topic index references...`);

        const gc = new MemoryGarbageCollector();
        const result = await gc.cleanOrphanedTopicReferences();

        if (result.success) {
            console.log(`\n✅ Cleanup complete!`);
            console.log(`   🗑️  Orphans removed: ${result.orphansRemoved || 0}`);
        } else {
            console.warn(`\n⚠️  Cleanup failed: ${result.error || 'Unknown error'}`);
        }

    } catch (error) {
        console.error(`\n❌ Cleanup failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleStaleness(options) {
    const { verbose } = options;

    try {
        console.log(`\n🔍 Checking topic index staleness...`);

        const gc = new MemoryGarbageCollector();
        const result = await gc.checkTopicIndexStaleness();

        console.log(`\n📊 Staleness Check:`);
        console.log(`   🏷️  Total topics: ${result.total_topics || 0}`);
        console.log(`   ⚠️  Stale topics: ${result.stale_topics || 0}`);
        console.log(`   ✅ Fresh topics: ${(result.total_topics || 0) - (result.stale_topics || 0)}`);

        if (result.stale_topics > 0) {
            console.log(`\n💡 Recommendation: Run cleanup to remove stale references`);
            console.log(`   Command: node aegis-gc-cli.js cleanup`);
        } else {
            console.log(`\n✅ All topic references are fresh!`);
        }

        if (verbose && result.stale_topic_names) {
            console.log(`\n   🏷️  Stale topics:`);
            result.stale_topic_names.forEach((topic, index) => {
                console.log(`      ${index + 1}. ${topic}`);
            });
        }

    } catch (error) {
        console.error(`\n❌ Staleness check failed: ${error.message}`);
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
            case 'run':
                await handleRun(options);
                break;
            case 'stats':
                await handleStats(options);
                break;
            case 'retrieve':
                await handleRetrieve(options);
                break;
            case 'list':
                await handleList(options);
                break;
            case 'cleanup':
                await handleCleanup(options);
                break;
            case 'staleness':
                await handleStaleness(options);
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
