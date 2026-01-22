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
/** ESMC 3.40 AEGIS Audit CLI Wrapper | 2025-10-30 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: CLI entry point for AEGIS audit logging operations
 *  Parent: aegis-audit.js (modular library)
 *  Usage: node aegis-audit-cli.js <command> [options]
 */

const { AuditLogger } = require('./aegis-audit');
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
        }
    }

    return { command, options };
}

function showUsage() {
    console.log(`
📊 AEGIS Audit Logger CLI - Execution Forensics & Evidence Capture

Usage:
  node aegis-audit-cli.js <command> [options]

Commands:
  capture <context-file>     Capture execution log from context JSON
  list                       List all audit logs
  view <audit-id>            View specific audit log
  stats                      Show audit statistics
  search <keyword>           Search audit logs by keyword
  help                       Show this help message

Options:
  --mode=<mode>              Execution mode (full_deployment/lightweight)
  --prompt=<text>            User prompt text
  --verbose                  Show detailed output
  --json                     Output as JSON

Examples:
  # Capture execution log from context file
  node aegis-audit-cli.js capture ./execution-context.json

  # Capture with inline prompt
  node aegis-audit-cli.js capture context.json --prompt="audit AEGIS modules"

  # List all audit logs
  node aegis-audit-cli.js list

  # View specific audit log
  node aegis-audit-cli.js view 2025-10-30-aegis-module-audit

  # Show audit statistics
  node aegis-audit-cli.js stats

  # Search audit logs
  node aegis-audit-cli.js search "AEGIS"

Version: ESMC 3.40 | Module: aegis-audit.js
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

async function handleCapture(options) {
    const { firstArg, mode, prompt, verbose } = options;

    if (!firstArg) {
        console.error('❌ Error: Context file required');
        console.log('Usage: node aegis-audit-cli.js capture <context-file>');
        process.exit(1);
    }

    const contextPath = path.resolve(firstArg);

    if (!fs.existsSync(contextPath)) {
        console.error(`❌ Error: Context file not found: ${contextPath}`);
        process.exit(1);
    }

    try {
        console.log(`\n📊 Capturing execution audit log...`);

        // Load context data
        const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));

        // Override with CLI options
        if (mode) context.mode = mode;
        if (prompt) context.userPrompt = prompt;

        const logger = new AuditLogger();
        const result = await logger.captureExecutionLog(context);

        if (result.success) {
            console.log(`\n✅ Audit log captured!`);
            console.log(`   📄 Audit ID: ${result.audit_id}`);
            console.log(`   📁 Filename: ${result.filename}`);
            console.log(`   📍 Location: ${result.filepath}`);

            if (verbose && context) {
                console.log(`\n   📋 Context Summary:`);
                console.log(`      🔧 Mode: ${context.mode || 'N/A'}`);
                console.log(`      💬 Prompt: ${(context.userPrompt || 'N/A').substring(0, 60)}...`);
                console.log(`      📊 ATLAS T1 hits: ${context.atlas?.t1_hits || 0}`);
                console.log(`      🎖️  Colonel deployments: ${context.colonels?.deployed?.length || 0}`);
            }
        } else {
            console.error(`\n❌ Audit capture failed: ${result.error || 'Unknown error'}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Audit capture failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleList(options) {
    const { verbose, json } = options;

    try {
        const logger = new AuditLogger();
        const logsPath = logger.logsPath;

        if (!fs.existsSync(logsPath)) {
            console.log(`\n⚠️  No audit logs directory found`);
            console.log('   (No audit logs have been created yet)');
            return;
        }

        const files = fs.readdirSync(logsPath).filter(f => f.endsWith('.json'));

        if (json) {
            console.log(JSON.stringify({ total: files.length, logs: files }, null, 2));
            return;
        }

        console.log(`\n📊 Audit Logs (${files.length}):\n`);

        if (files.length === 0) {
            console.log('   (No audit logs found)');
        } else {
            files.forEach((filename, index) => {
                const filepath = path.join(logsPath, filename);
                const stats = fs.statSync(filepath);
                const auditId = filename.replace('.json', '');

                console.log(`${index + 1}. ${auditId}`);
                console.log(`   📅 Created: ${stats.mtime.toISOString()}`);
                console.log(`   📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);

                if (verbose) {
                    try {
                        const log = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                        console.log(`   🔧 Mode: ${log.mode || 'N/A'}`);
                        console.log(`   💬 Prompt: ${(log.user_prompt || 'N/A').substring(0, 50)}...`);
                    } catch (err) {
                        console.log(`   ⚠️  Could not parse log`);
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

async function handleView(options) {
    const { firstArg, verbose, json } = options;

    if (!firstArg) {
        console.error('❌ Error: Audit ID required');
        console.log('Usage: node aegis-audit-cli.js view <audit-id>');
        process.exit(1);
    }

    const auditId = firstArg;

    try {
        const logger = new AuditLogger();
        const logPath = path.join(logger.logsPath, `${auditId}.json`);

        if (!fs.existsSync(logPath)) {
            console.error(`❌ Error: Audit log not found: ${auditId}`);
            console.log('Run "node aegis-audit-cli.js list" to see available logs');
            process.exit(1);
        }

        const log = JSON.parse(fs.readFileSync(logPath, 'utf8'));

        if (json) {
            console.log(JSON.stringify(log, null, 2));
            return;
        }

        console.log(`\n📊 Audit Log: ${auditId}\n`);
        console.log(`   📅 Date: ${log.date || 'N/A'}`);
        console.log(`   🔧 Mode: ${log.mode || 'N/A'}`);
        console.log(`   🆔 Audit ID: ${log.audit_id || 'N/A'}`);
        console.log(`   📦 ESMC Version: ${log.esmc_version || 'N/A'}`);
        console.log(`   💬 User Prompt: ${log.user_prompt || 'N/A'}`);

        console.log(`\n   🔍 Execution Evidence:`);
        console.log(`      📍 Bootstrap Phase: ${log.execution_evidence?.bootstrap_routing?.phase || 'N/A'}`);
        console.log(`      📊 ATLAS T1 hits: ${log.execution_evidence?.atlas_retrieval?.t1_hits || 0}`);
        console.log(`      📊 ATLAS T2 hits: ${log.execution_evidence?.atlas_retrieval?.t2_hits || 0}`);
        console.log(`      🔥 HYDRA used: ${log.execution_evidence?.atlas_retrieval?.hydra_used ? 'Yes' : 'No'}`);

        if (verbose) {
            console.log(`\n   🧠 Mesh Intelligence:`);
            console.log(`      🧭 PIU: ${JSON.stringify(log.execution_evidence?.mesh_intelligence?.piu || {}, null, 2)}`);
            console.log(`      📚 DKI: ${JSON.stringify(log.execution_evidence?.mesh_intelligence?.dki || {}, null, 2)}`);
            console.log(`      🔮 UIP: ${JSON.stringify(log.execution_evidence?.mesh_intelligence?.uip || {}, null, 2)}`);
            console.log(`      🌐 PCA: ${JSON.stringify(log.execution_evidence?.mesh_intelligence?.pca || {}, null, 2)}`);

            console.log(`\n   🎖️  ECHELON-ATHENA Dialogue:`);
            console.log(`      🎯 Confidence: ${log.execution_evidence?.echelon_athena_dialogue?.consensus_confidence || 0}`);
            console.log(`      💡 Strategic Plan: ${log.execution_evidence?.echelon_athena_dialogue?.strategic_plan || 'N/A'}`);

            console.log(`\n   ⚡ Performance Metrics:`);
            console.log(`      ⏱️  Total Time: ${log.execution_evidence?.performance_metrics?.total_time || 'N/A'}`);
            console.log(`      🪙 Token Usage: ${log.execution_evidence?.performance_metrics?.token_usage || 0}`);
            console.log(`      🔍 ATLAS Time: ${log.execution_evidence?.performance_metrics?.atlas_cascade_time || 'N/A'}`);
        } else {
            console.log(`\n   💡 Use --verbose to see full mesh intelligence and performance metrics`);
        }

    } catch (error) {
        console.error(`\n❌ View failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleStats(options) {
    const { verbose, json } = options;

    try {
        const logger = new AuditLogger();
        const logsPath = logger.logsPath;

        if (!fs.existsSync(logsPath)) {
            console.log(`\n⚠️  No audit logs found`);
            return;
        }

        const files = fs.readdirSync(logsPath).filter(f => f.endsWith('.json'));

        // Aggregate statistics
        const stats = {
            total_logs: files.length,
            by_mode: {},
            by_trigger: {},
            total_size_kb: 0,
            date_range: { earliest: null, latest: null }
        };

        files.forEach(filename => {
            const filepath = path.join(logsPath, filename);
            const fileStats = fs.statSync(filepath);
            stats.total_size_kb += fileStats.size / 1024;

            try {
                const log = JSON.parse(fs.readFileSync(filepath, 'utf8'));

                // Count by mode
                const mode = log.mode || 'unknown';
                stats.by_mode[mode] = (stats.by_mode[mode] || 0) + 1;

                // Count by trigger
                const trigger = log.trigger || 'unknown';
                stats.by_trigger[trigger] = (stats.by_trigger[trigger] || 0) + 1;

                // Date range
                const date = log.date;
                if (date) {
                    if (!stats.date_range.earliest || date < stats.date_range.earliest) {
                        stats.date_range.earliest = date;
                    }
                    if (!stats.date_range.latest || date > stats.date_range.latest) {
                        stats.date_range.latest = date;
                    }
                }
            } catch (err) {
                // Skip malformed logs
            }
        });

        if (json) {
            console.log(JSON.stringify(stats, null, 2));
            return;
        }

        console.log(`\n📊 Audit Statistics:\n`);
        console.log(`   📄 Total logs: ${stats.total_logs}`);
        console.log(`   💾 Total size: ${stats.total_size_kb.toFixed(2)} KB`);
        console.log(`   📅 Date range: ${stats.date_range.earliest || 'N/A'} to ${stats.date_range.latest || 'N/A'}`);

        console.log(`\n   🔧 By Mode:`);
        Object.entries(stats.by_mode).forEach(([mode, count]) => {
            console.log(`      ${mode}: ${count}`);
        });

        console.log(`\n   🎯 By Trigger:`);
        Object.entries(stats.by_trigger).forEach(([trigger, count]) => {
            console.log(`      ${trigger}: ${count}`);
        });

    } catch (error) {
        console.error(`\n❌ Stats failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

async function handleSearch(options) {
    const { firstArg, verbose, json } = options;

    if (!firstArg) {
        console.error('❌ Error: Search keyword required');
        console.log('Usage: node aegis-audit-cli.js search <keyword>');
        process.exit(1);
    }

    const keyword = firstArg.toLowerCase();

    try {
        const logger = new AuditLogger();
        const logsPath = logger.logsPath;

        if (!fs.existsSync(logsPath)) {
            console.log(`\n⚠️  No audit logs found`);
            return;
        }

        const files = fs.readdirSync(logsPath).filter(f => f.endsWith('.json'));
        const results = [];

        files.forEach(filename => {
            const filepath = path.join(logsPath, filename);

            try {
                const log = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                const searchText = JSON.stringify(log).toLowerCase();

                if (searchText.includes(keyword)) {
                    results.push({
                        audit_id: log.audit_id,
                        filename,
                        date: log.date,
                        mode: log.mode,
                        prompt: log.user_prompt
                    });
                }
            } catch (err) {
                // Skip malformed logs
            }
        });

        if (json) {
            console.log(JSON.stringify({ keyword, total: results.length, results }, null, 2));
            return;
        }

        console.log(`\n🔍 Search Results for "${keyword}" (${results.length} matches):\n`);

        if (results.length === 0) {
            console.log('   (No matches found)');
        } else {
            results.forEach((result, index) => {
                console.log(`${index + 1}. ${result.audit_id}`);
                console.log(`   📅 Date: ${result.date || 'N/A'}`);
                console.log(`   🔧 Mode: ${result.mode || 'N/A'}`);
                console.log(`   💬 Prompt: ${(result.prompt || 'N/A').substring(0, 60)}...`);
                console.log('');
            });
        }

    } catch (error) {
        console.error(`\n❌ Search failed: ${error.message}`);
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
            case 'capture':
                await handleCapture(options);
                break;
            case 'list':
                await handleList(options);
                break;
            case 'view':
                await handleView(options);
                break;
            case 'stats':
                await handleStats(options);
                break;
            case 'search':
                await handleSearch(options);
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
