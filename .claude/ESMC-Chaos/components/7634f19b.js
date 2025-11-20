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
/** ESMC 3.40 AEGIS CL CLI Wrapper | 2025-10-30 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI entry point for AEGIS changelog automation operations
 *  Parent: aegis-cl.js (modular library)
 *  Usage: node aegis-cl-cli.js <command> [options]
 */

const { CLAutomation } = require('./aegis-cl');
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
        } else if (!options.firstArg) {
            options.firstArg = arg;
        } else if (!options.secondArg) {
            options.secondArg = arg;
        }
    }

    return { command, options };
}

function showUsage() {
    console.log(`
📸 AEGIS CL Automation CLI - Edit Once, Document Automatically

Usage:
  node aegis-cl-cli.js <command> [options]

Commands:
  find <source-file>         Find existing CL files for a source file
  create <source-file>       Create new CL file for a source file
  insert <file> <line>       Insert inline CL tag at code location
  atomic <file>              Atomic file edit + CL generation
  index                      List all CL files
  help                       Show this help message

Options:
  --change=<description>     Change description (for create)
  --impact=<description>     Impact description (for create)
  --rationale=<text>         Rationale for change (for create)
  --component=<name>         Component name (default: ESMC)
  --tag=<cl-tag>             CL tag to insert (e.g., "CL5 - Fix bug")
  --old=<text>               Old string (for atomic edit)
  --new=<text>               New string (for atomic edit)
  --force-cl                 Force CL creation (for atomic edit)
  --no-cl                    Skip CL creation (for atomic edit)
  --dry-run                  Preview without making changes
  --verbose                  Show detailed output

Examples:
  # Find CL files for a source file
  node aegis-cl-cli.js find BRAIN.md

  # Create new CL file
  node aegis-cl-cli.js create BRAIN.md --change="Add feature X" --impact="New functionality"

  # Insert inline CL tag at line 150
  node aegis-cl-cli.js insert BRAIN.md 150 --tag="CL5 - Feature X implementation"

  # Atomic edit with automatic CL
  node aegis-cl-cli.js atomic ./src/file.js --old="foo" --new="bar" --change="Rename variable"

  # Dry run (preview only)
  node aegis-cl-cli.js atomic ./src/file.js --old="foo" --new="bar" --dry-run

  # List all CL files
  node aegis-cl-cli.js index

Version: ESMC 3.40 | Module: aegis-cl.js
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

async function handleFind(options) {
    const { firstArg, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: Source filename required');
        console.log('Usage: node aegis-cl-cli.js find <source-file>');
        process.exit(1);
    }

    const sourceFile = firstArg;

    try {
        console.log(`\n📸 Searching for CL files: ${sourceFile}...`);

        const cl = new CLAutomation();
        const results = await cl.findCLFiles(sourceFile);

        if (results.length === 0) {
            console.log(`\n⚠️  No CL files found for: ${sourceFile}`);
            console.log('   (This is the first changelog for this file)');
        } else {
            console.log(`\n✅ Found ${results.length} CL file(s):\n`);

            results.forEach((clFile, index) => {
                console.log(`${index + 1}. ${clFile.tag}: ${clFile.filename}`);
                console.log(`   📍 Path: ${clFile.path}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error(`\n❌ Find failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleCreate(options) {
    const { firstArg, change, impact, rationale, component, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: Source filename required');
        console.log('Usage: node aegis-cl-cli.js create <source-file> --change="..."');
        process.exit(1);
    }

    if (!change) {
        console.error('❌ Error: --change description required');
        console.log('Usage: node aegis-cl-cli.js create <source-file> --change="..."');
        process.exit(1);
    }

    const sourceFile = firstArg;

    try {
        console.log(`\n📸 Creating CL file for: ${sourceFile}...`);

        const cl = new CLAutomation();
        const result = await cl.createCLFile({
            sourceFilename: sourceFile,
            change,
            impact: impact || 'Not specified',
            rationale: rationale || 'Not specified',
            component: component || 'ESMC'
        });

        if (result.success) {
            console.log(`\n✅ CL file created!`);
            console.log(`   📁 Filename: ${result.filename}`);
            console.log(`   📍 Location: ${result.path}`);
            console.log(`   🏷️  Tag: ${result.tag}`);
            console.log(`   📋 Inline tag: ${result.inline_tag}`);
        } else {
            console.error(`\n❌ Create failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Create failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleInsert(options) {
    const { firstArg, secondArg, tag, verbose } = options;

    if (!firstArg || !secondArg) {
        console.error('❌ Error: File path and line number required');
        console.log('Usage: node aegis-cl-cli.js insert <file> <line-number> --tag="CL5 - Description"');
        process.exit(1);
    }

    if (!tag) {
        console.error('❌ Error: --tag required');
        console.log('Usage: node aegis-cl-cli.js insert <file> <line-number> --tag="CL5 - Description"');
        process.exit(1);
    }

    const filePath = path.resolve(firstArg);
    const lineNumber = parseInt(secondArg);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: File not found: ${filePath}`);
        process.exit(1);
    }

    if (isNaN(lineNumber) || lineNumber < 1) {
        console.error(`❌ Error: Invalid line number: ${secondArg}`);
        process.exit(1);
    }

    try {
        console.log(`\n📸 Inserting CL tag at ${path.basename(filePath)}:${lineNumber}...`);

        const cl = new CLAutomation();
        const result = await cl.insertCLTag(filePath, lineNumber, tag);

        if (result.success) {
            console.log(`\n✅ Tag inserted successfully!`);
            console.log(`   📁 File: ${result.file}`);
            console.log(`   📍 Line: ${result.line}`);
            console.log(`   🏷️  Tag: ${result.tag}`);
        } else {
            console.error(`\n❌ Insert failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Insert failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleAtomic(options) {
    const { firstArg, old, new: newStr, change, forceCl, noCl, dryRun, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: File path required');
        console.log('Usage: node aegis-cl-cli.js atomic <file> --old="..." --new="..." --change="..."');
        process.exit(1);
    }

    if (!old || !newStr) {
        console.error('❌ Error: --old and --new are required');
        console.log('Usage: node aegis-cl-cli.js atomic <file> --old="..." --new="..." --change="..."');
        process.exit(1);
    }

    const filePath = path.resolve(firstArg);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: File not found: ${filePath}`);
        process.exit(1);
    }

    try {
        console.log(`\n📸 Atomic Edit+CL: ${path.basename(filePath)}...`);

        if (dryRun) {
            console.log(`   🔍 Mode: DRY RUN (preview only)`);
        }

        const cl = new CLAutomation();
        const result = await cl.atomicEditWithCL({
            file_path: filePath,
            old_string: old,
            new_string: newStr,
            change_description: change || 'Code update',
            force_cl: !!forceCl,
            no_cl: !!noCl,
            dry_run: !!dryRun
        });

        if (result.success) {
            if (dryRun) {
                console.log(`\n✅ Dry run complete!`);
                console.log(`\n   📋 Preview:`);
                console.log(`      📁 File: ${filePath}`);
                console.log(`      🔧 Old string: ${old.substring(0, 60)}...`);
                console.log(`      🔧 New string: ${newStr.substring(0, 60)}...`);
                console.log(`      📸 CL Decision: ${result.cl_decision.trigger ? 'CREATE' : 'SKIP'}`);
                console.log(`      💡 Reason: ${result.cl_decision.reason}`);
            } else {
                console.log(`\n✅ Atomic edit complete!`);
                console.log(`   ✅ File edited: ${result.edit_result.success ? 'Yes' : 'No'}`);
                console.log(`   📸 CL created: ${result.cl_file ? 'Yes' : 'No'}`);

                if (result.cl_file) {
                    console.log(`   📁 CL file: ${result.cl_file.filename}`);
                    console.log(`   🏷️  CL tag: ${result.cl_file.tag}`);
                }

                if (result.inline_tag) {
                    console.log(`   ✅ Inline tag inserted: ${result.inline_tag.tag}`);
                }
            }

            if (verbose && result.cl_decision) {
                console.log(`\n   📋 CL Decision Details:`);
                console.log(JSON.stringify(result.cl_decision, null, 2));
            }
        } else {
            console.error(`\n❌ Atomic edit failed: ${result.error || 'Unknown error'}`);

            if (result.rollback_info?.attempted) {
                console.log(`   ↩️  Rollback: ${result.rollback_info.success ? 'Success' : 'Failed'}`);
            }

            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Atomic edit failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleIndex(options) {
    const { verbose } = options;

    try {
        console.log(`\n📚 Loading CL index...`);

        const cl = new CLAutomation();
        const indexPath = path.join(cl.memoryPath, '.cl-index.json');

        if (!fs.existsSync(indexPath)) {
            console.log(`\n⚠️  No CL index found`);
            console.log('   (No CL files have been created yet)');
            return;
        }

        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const changelogs = index.changelogs || [];

        console.log(`\n📚 CL Index (${changelogs.length} changelogs):\n`);

        if (changelogs.length === 0) {
            console.log('   (No changelogs indexed)');
        } else {
            // Group by source file
            const bySource = {};
            changelogs.forEach(cl => {
                const source = cl.sourceFile || 'unknown';
                if (!bySource[source]) bySource[source] = [];
                bySource[source].push(cl);
            });

            Object.entries(bySource).forEach(([sourceFile, cls]) => {
                console.log(`📄 ${sourceFile} (${cls.length} CLs):`);
                cls.forEach(cl => {
                    console.log(`   ${cl.tag}: ${cl.change || 'No description'}`);
                    console.log(`      📁 File: ${cl.filename}`);
                    console.log(`      📅 Date: ${cl.date || 'N/A'}`);

                    if (verbose) {
                        console.log(`      📊 Number: ${cl.number}`);
                    }
                });
                console.log('');
            });
        }

        console.log(`   📅 Last updated: ${index.last_updated || 'N/A'}`);
        console.log(`   📊 Total changelogs: ${index.total_changelogs || 0}`);

    } catch (error) {
        console.error(`\n❌ Index read failed: ${error.message}`);
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
            case 'find':
                await handleFind(options);
                break;
            case 'create':
                await handleCreate(options);
                break;
            case 'insert':
                await handleInsert(options);
                break;
            case 'atomic':
                await handleAtomic(options);
                break;
            case 'index':
                await handleIndex(options);
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
