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
/** ESMC 3.40 AEGIS Echo CLI Wrapper | 2025-10-30 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI entry point for AEGIS ECHO checkpoint operations
 *  Parent: aegis-echo.js (modular library)
 *  Usage: node aegis-echo-cli.js <command> [options]
 */

const { EchoManager } = require('./aegis-echo');
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
📸 AEGIS ECHO CLI - Current Conversation Context Capture

Usage:
  node aegis-echo-cli.js <command> [options]

Commands:
  create <prompt>            Create ECHO checkpoint from first message
  retrieve                   Retrieve latest ECHO from today
  list [date]                List ECHO files (today or specific date)
  checkpoint <context>       Manual checkpoint (context JSON string or file)
  increment <echo-file>      Increment counter (post-compact)
  detect                     Detect post-compact signals and suggest restoration
  help                       Show this help message

Options:
  --date=YYYY-MM-DD          Filter by specific date
  --tokens=<count>           Set token estimate (for context tracking)
  --verbose                  Show detailed output
  --compact-trigger=<type>   Specify compact trigger type (auto/manual/threshold)

Examples:
  # Create ECHO from first message
  node aegis-echo-cli.js create "Use ESMC I want to implement dark mode"

  # Retrieve today's ECHO
  node aegis-echo-cli.js retrieve

  # List ECHO files from today
  node aegis-echo-cli.js list

  # List ECHO files from specific date
  node aegis-echo-cli.js list --date=2025-10-30

  # Manual checkpoint with context JSON file
  node aegis-echo-cli.js checkpoint ./context.json --tokens=180000

  # Increment counter (post-compact)
  node aegis-echo-cli.js increment .claude/memory/echo/2025-10-30-example-154500-0.json

Version: ESMC 3.40 | Module: aegis-echo.js
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

async function handleCreate(options) {
    const { firstArg, tokens, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: First prompt required');
        console.log('Usage: node aegis-echo-cli.js create <first-message>');
        process.exit(1);
    }

    try {
        console.log(`\n📸 Creating ECHO checkpoint...`);

        const echo = new EchoManager();
        const result = await echo.createEchoOnFirstMessage({
            firstPrompt: firstArg,
            context: {
                estimated_tokens: parseInt(tokens) || 500
            }
        });

        if (result.success) {
            console.log(`\n✅ ECHO created successfully!`);
            console.log(`   📁 Filename: ${result.filename}`);
            console.log(`   🆔 Echo ID: ${result.echo_id}`);
            console.log(`   📍 Location: ${result.filepath || '.claude/memory/echo/'}`);
            if (!result.created) {
                console.log(`   ⚠️  Note: File already existed (idempotent)`);
            }
        } else {
            console.error(`\n❌ ECHO creation failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ ECHO creation failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleRetrieve(options) {
    const { date, verbose } = options;

    try {
        console.log(`\n📸 Retrieving ECHO context...`);

        const echo = new EchoManager();
        const targetDate = date || new Date().toISOString().split('T')[0];
        const result = await echo.retrieveTodaysEcho(targetDate);

        if (result && result.length > 0) {
            console.log(`\n✅ Found ${result.length} ECHO file(s):\n`);

            result.forEach((echoData, index) => {
                console.log(`${index + 1}. ${echoData.filename}`);
                console.log(`   🆔 Echo ID: ${echoData.echo_id || 'N/A'}`);
                console.log(`   📅 Created: ${echoData.created_at || 'N/A'}`);
                console.log(`   🔢 Counter: ${echoData.compact_counter || 0}`);
                console.log(`   📝 First prompt: ${(echoData.first_prompt || '').substring(0, 60)}...`);

                if (verbose) {
                    console.log(`   📊 Todos: ${(echoData.current_context?.todos || []).length}`);
                    console.log(`   💭 Decisions: ${(echoData.current_context?.key_decisions || []).length}`);
                }
                console.log('');
            });
        } else {
            console.log(`\n⚠️  No ECHO files found for date: ${targetDate}`);
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
    const { date, verbose } = options;

    try {
        const echo = new EchoManager();
        const echoDir = echo.echoDir;

        if (!fs.existsSync(echoDir)) {
            console.log(`\n⚠️  No ECHO directory found`);
            return;
        }

        const files = fs.readdirSync(echoDir);
        const targetDate = date || new Date().toISOString().split('T')[0];

        const filtered = files.filter(f => {
            return f.endsWith('.json') && f.startsWith(targetDate);
        });

        console.log(`\n📸 ECHO Files (${targetDate}):\n`);

        if (filtered.length === 0) {
            console.log('   (No ECHO files found)');
        } else {
            filtered.forEach((filename, index) => {
                const filepath = path.join(echoDir, filename);
                const stats = fs.statSync(filepath);

                console.log(`${index + 1}. ${filename}`);
                console.log(`   📏 Size: ${stats.size} bytes`);
                console.log(`   📅 Modified: ${stats.mtime.toISOString()}`);

                if (verbose) {
                    try {
                        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                        console.log(`   🔢 Counter: ${content.compact_counter || 0}`);
                        console.log(`   📝 First prompt: ${(content.first_prompt || '').substring(0, 50)}...`);
                    } catch (err) {
                        console.log(`   ⚠️  Could not parse JSON`);
                    }
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

async function handleCheckpoint(options) {
    const { firstArg, tokens, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: Context data required (JSON string or file path)');
        console.log('Usage: node aegis-echo-cli.js checkpoint <context.json>');
        process.exit(1);
    }

    try {
        console.log(`\n📸 Creating manual checkpoint...`);

        let contextData;

        // Try to parse as file path first
        if (fs.existsSync(firstArg)) {
            contextData = JSON.parse(fs.readFileSync(firstArg, 'utf8'));
        } else {
            // Parse as JSON string
            contextData = JSON.parse(firstArg);
        }

        const echo = new EchoManager();
        const result = await echo.createManualCheckpoint({
            context: contextData,
            estimatedTokens: parseInt(tokens) || contextData.estimated_tokens || 0
        });

        if (result.success) {
            console.log(`\n✅ Checkpoint created!`);
            console.log(`   📁 Filename: ${result.filename}`);
            console.log(`   📊 Tokens: ${result.estimated_tokens || 'N/A'}`);
        } else {
            console.error(`\n❌ Checkpoint failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Checkpoint failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleIncrement(options) {
    const { firstArg, compactTrigger, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: ECHO file path required');
        console.log('Usage: node aegis-echo-cli.js increment <echo-file>');
        process.exit(1);
    }

    const echoPath = path.resolve(firstArg);

    if (!fs.existsSync(echoPath)) {
        console.error(`❌ Error: ECHO file not found: ${echoPath}`);
        process.exit(1);
    }

    try {
        console.log(`\n📸 Incrementing ECHO counter...`);

        const echo = new EchoManager();
        const result = await echo.incrementCompactCounter({
            echoFilePath: echoPath,
            trigger: compactTrigger || 'manual_cli',
            tokensBefore: 180000, // Default assumption
            tokensAfter: 60000    // Default post-compact
        });

        if (result.success) {
            console.log(`\n✅ Counter incremented!`);
            console.log(`   📁 Old file: ${result.old_filename}`);
            console.log(`   📁 New file: ${result.new_filename}`);
            console.log(`   🔢 Counter: ${result.old_counter} → ${result.new_counter}`);
        } else {
            console.error(`\n❌ Increment failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Increment failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleDetect(options) {
    const { verbose } = options;

    try {
        console.log(`\n📸 Detecting post-compact signals...`);

        const echo = new EchoManager();
        const signals = await echo.detectPostCompactSignals();

        console.log(`\n📊 Detection Results:`);
        console.log(`   🔢 Signal count: ${signals.count || 0}`);
        console.log(`   ✅ Summary block detected: ${signals.hasSummaryBlock ? 'Yes' : 'No'}`);
        console.log(`   ✅ Low message count: ${signals.hasLowMessageCount ? 'Yes' : 'No'}`);
        console.log(`   ✅ Low token count: ${signals.hasLowTokens ? 'Yes' : 'No'}`);

        if (signals.count >= 2) {
            console.log(`\n💡 Recommendation: Post-compact likely detected!`);
            console.log(`   Run: node aegis-echo-cli.js retrieve`);
        } else {
            console.log(`\n✅ No post-compact detected (signal count < 2)`);
        }

        if (verbose && signals.details) {
            console.log(`\n   📋 Details:`);
            console.log(JSON.stringify(signals.details, null, 2));
        }

    } catch (error) {
        console.error(`\n❌ Detection failed: ${error.message}`);
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
            case 'create':
                await handleCreate(options);
                break;
            case 'retrieve':
                await handleRetrieve(options);
                break;
            case 'list':
                await handleList(options);
                break;
            case 'checkpoint':
                await handleCheckpoint(options);
                break;
            case 'increment':
                await handleIncrement(options);
                break;
            case 'detect':
                await handleDetect(options);
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
