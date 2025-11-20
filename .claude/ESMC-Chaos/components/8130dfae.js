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
/** ESMC 3.40 AEGIS Write CLI Wrapper | 2025-10-30 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI entry point for AEGIS document writing operations
 *  Parent: aegis-write.js (modular library)
 *  Usage: node aegis-write-cli.js <command> [options]
 */

const { DocumentWriting } = require('./aegis-write');
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
📝 AEGIS Document Writing CLI - Strategic Documentation System

Usage:
  node aegis-write-cli.js <command> [options]

Commands:
  write <title> <content>    Write a new document
  brief <title> <summary>    Write a BRIEF document (lightweight)
  index                      List all indexed documents
  query <keyword>            Search documents by keyword
  help                       Show this help message

Options:
  --category=<name>          Document category (architecture/audit/whitepaper/etc)
  --metadata=<json>          Additional metadata (JSON string)
  --file=<path>              Read content from file instead of command line
  --tags=<tag1,tag2>         Comma-separated tags
  --verbose                  Show detailed output

Examples:
  # Write a new document (inline content)
  node aegis-write-cli.js write "AEGIS Architecture" "This document describes..."

  # Write document from file
  node aegis-write-cli.js write "API Documentation" --file=./api-docs.md --category=technical

  # Write a BRIEF (lightweight summary)
  node aegis-write-cli.js brief "Sprint Summary" "Completed 8 tasks, 2 bugs fixed"

  # List all documents
  node aegis-write-cli.js index

  # Search documents
  node aegis-write-cli.js query "authentication"

Version: ESMC 3.40 | Module: aegis-write.js
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

async function handleWrite(options) {
    const { firstArg, secondArg, category, metadata, file, tags, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: Document title required');
        console.log('Usage: node aegis-write-cli.js write <title> <content>');
        console.log('   Or: node aegis-write-cli.js write <title> --file=<path>');
        process.exit(1);
    }

    const title = firstArg;
    let content;

    // Get content from file or command line
    if (file) {
        const filePath = path.resolve(file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Error: File not found: ${filePath}`);
            process.exit(1);
        }
        content = fs.readFileSync(filePath, 'utf8');
    } else if (secondArg) {
        content = secondArg;
    } else {
        console.error('❌ Error: Document content required (or use --file=<path>)');
        process.exit(1);
    }

    try {
        console.log(`\n📝 Writing document: ${title}...`);

        const writer = new DocumentWriting();

        // Parse metadata if provided
        let parsedMetadata = {};
        if (metadata) {
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (err) {
                console.warn(`⚠️  Warning: Could not parse metadata JSON, ignoring`);
            }
        }

        // Add tags if provided
        if (tags) {
            parsedMetadata.tags = tags.split(',').map(t => t.trim());
        }

        const result = await writer.writeDocument({
            title,
            content,
            category: category || 'general',
            metadata: parsedMetadata
        });

        if (result.success) {
            console.log(`\n✅ Document written successfully!`);
            console.log(`   📁 Filename: ${result.filename}`);
            console.log(`   📍 Location: ${result.filepath}`);
            console.log(`   📊 Size: ${content.length} characters`);
            console.log(`   🏷️  Category: ${category || 'general'}`);

            if (verbose && result.metadata) {
                console.log(`\n   📋 Metadata:`);
                console.log(JSON.stringify(result.metadata, null, 2));
            }
        } else {
            console.error(`\n❌ Write failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Write failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleBrief(options) {
    const { firstArg, secondArg, tags, verbose } = options;

    if (!firstArg || !secondArg) {
        console.error('❌ Error: BRIEF title and summary required');
        console.log('Usage: node aegis-write-cli.js brief <title> <summary>');
        process.exit(1);
    }

    const title = firstArg;
    const summary = secondArg;

    try {
        console.log(`\n📝 Writing BRIEF: ${title}...`);

        const writer = new DocumentWriting();

        const result = await writer.writeBRIEF({
            title,
            summary,
            tags: tags ? tags.split(',').map(t => t.trim()) : []
        });

        if (result.success) {
            console.log(`\n✅ BRIEF written successfully!`);
            console.log(`   📁 Filename: ${result.filename}`);
            console.log(`   📍 Location: ${result.filepath}`);
            console.log(`   📏 Length: ${summary.length} characters`);
        } else {
            console.error(`\n❌ BRIEF write failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ BRIEF write failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleIndex(options) {
    const { verbose } = options;

    try {
        console.log(`\n📚 Loading document index...`);

        const writer = new DocumentWriting();
        const indexPath = writer.indexPath;

        if (!fs.existsSync(indexPath)) {
            console.log(`\n⚠️  No document index found`);
            console.log('   (No documents have been written yet)');
            return;
        }

        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const documents = index.documents || [];

        console.log(`\n📚 Document Index (${documents.length} documents):\n`);

        if (documents.length === 0) {
            console.log('   (No documents indexed)');
        } else {
            // Group by category
            const byCategory = {};
            documents.forEach(doc => {
                const cat = doc.category || 'general';
                if (!byCategory[cat]) byCategory[cat] = [];
                byCategory[cat].push(doc);
            });

            Object.entries(byCategory).forEach(([category, docs]) => {
                console.log(`📁 ${category.toUpperCase()} (${docs.length}):`);
                docs.forEach((doc, index) => {
                    console.log(`   ${index + 1}. ${doc.title}`);
                    console.log(`      📄 File: ${doc.filename}`);
                    console.log(`      📅 Created: ${doc.created || 'N/A'}`);

                    if (verbose && doc.metadata) {
                        console.log(`      🏷️  Tags: ${(doc.metadata.tags || []).join(', ') || 'None'}`);
                    }
                });
                console.log('');
            });
        }

        console.log(`   📅 Last updated: ${index.last_updated || 'N/A'}`);

    } catch (error) {
        console.error(`\n❌ Index read failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleQuery(options) {
    const { firstArg, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: Search keyword required');
        console.log('Usage: node aegis-write-cli.js query <keyword>');
        process.exit(1);
    }

    const keyword = firstArg.toLowerCase();

    try {
        console.log(`\n🔍 Searching for: "${keyword}"...`);

        const writer = new DocumentWriting();
        const indexPath = writer.indexPath;

        if (!fs.existsSync(indexPath)) {
            console.log(`\n⚠️  No document index found`);
            return;
        }

        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const documents = index.documents || [];

        // Search by title, filename, tags
        const results = documents.filter(doc => {
            const titleMatch = doc.title.toLowerCase().includes(keyword);
            const filenameMatch = doc.filename.toLowerCase().includes(keyword);
            const categoryMatch = (doc.category || '').toLowerCase().includes(keyword);
            const tagMatch = (doc.metadata?.tags || []).some(tag =>
                tag.toLowerCase().includes(keyword)
            );

            return titleMatch || filenameMatch || categoryMatch || tagMatch;
        });

        console.log(`\n📊 Found ${results.length} matching document(s):\n`);

        if (results.length === 0) {
            console.log('   (No matches found)');
        } else {
            results.forEach((doc, index) => {
                console.log(`${index + 1}. ${doc.title}`);
                console.log(`   📄 File: ${doc.filename}`);
                console.log(`   📁 Category: ${doc.category || 'general'}`);
                console.log(`   📅 Created: ${doc.created || 'N/A'}`);

                if (verbose && doc.metadata) {
                    console.log(`   🏷️  Tags: ${(doc.metadata.tags || []).join(', ') || 'None'}`);
                }
                console.log('');
            });
        }

    } catch (error) {
        console.error(`\n❌ Query failed: ${error.message}`);
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
            case 'write':
                await handleWrite(options);
                break;
            case 'brief':
                await handleBrief(options);
                break;
            case 'index':
                await handleIndex(options);
                break;
            case 'query':
                await handleQuery(options);
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
