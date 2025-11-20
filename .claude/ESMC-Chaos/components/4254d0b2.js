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
/** ESMC 3.101.0 ATHENA LS (Logical Synthesizer) CLI | 2025-11-15 | v1.0.0
 *  Purpose: L4 - Logical Synthesizer - Parse REASON 5W1H from general intelligence
 *  Type: PARSER (not new intelligence - synthesizes existing PHASE 1 output)
 *  Token Cost: ~100 tokens (synthesis from cached output)
 *  Innovation: No redundant execution - reuses general intelligence reasoning
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
        input: cleanArgs.slice(1).join(' '),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🛡️ ATHENA LS (Logical Synthesizer) CLI - L4 Intelligence

Usage: node 4254d0b2.js <command> <input> [--silent|-s]

Commands:
  synthesize <reason>      Synthesize logical context from REASON 5W1H output
  help                     Show this help

Input: JSON string from REASON output

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.101.0 | L4 - Logical Synthesizer (PARSER)
    `);
}

function synthesizeLogical(reasonJson) {
    let reason;

    try {
        reason = typeof reasonJson === 'string' ? JSON.parse(reasonJson) : reasonJson;
    } catch (error) {
        throw new Error(`Failed to parse REASON input: ${error.message}`);
    }

    // Extract 5W1H inquiry
    const inquiry = reason.inquiry || {};
    const scores = reason.scores || {};

    const synthesis = {
        logical_summary: {
            WHAT: inquiry.what?.subject || 'Unknown',
            WHY: inquiry.why?.primary_goal || 'Unknown purpose',
            WHERE: inquiry.where?.environment || 'Unknown environment',
            WHEN: inquiry.when?.timeline || 'Unknown timeline',
            HOW: inquiry.how?.approach || 'Unknown approach',
            WHO: inquiry.who?.primary_users?.join(', ') || 'Unknown users'
        },
        context_appropriateness: scores.confidence > 0.7 ? 'High - context well-understood' :
                                 (scores.confidence > 0.5 ? 'Medium - some uncertainty' : 'Low - needs clarification'),
        timing_urgency: scores.urgency > 0.7 ? 'High urgency' :
                       (scores.urgency > 0.4 ? 'Medium urgency' : 'Low urgency'),
        deployment_context: inquiry.where?.environment || 'Unknown',
        timestamp: new Date().toISOString()
    };

    return synthesis;
}

async function main() {
    const { command, input, silent } = parseArgs();

    try {
        switch (command) {
            case 'synthesize': {
                if (!input) {
                    console.error(JSON.stringify({ error: 'REASON JSON input required' }, null, 2));
                    process.exit(1);
                }
                const result = synthesizeLogical(input);
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

module.exports = { synthesizeLogical };
