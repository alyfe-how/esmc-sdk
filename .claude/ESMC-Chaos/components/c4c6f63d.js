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
/** ESMC 4.1 ATHENA Omniscient Mesh Coordinator CLI | 2025-11-19 | v1.1.0
 *  Purpose: Coordinate 5-component ATHENA mesh + mode-based weighting
 *  Token Cost: ~50 tokens (coordination overhead) + component costs
 *  Innovation: Mode switching - PRE-ACTION = REACTIVE, POST-ACTION = PROACTIVE
 *  ESMC 4.1: Proactive forecast delivery + execution state tracking + CIE integration
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) { showUsage(); process.exit(1); }

    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    return {
        command: cleanArgs[0],
        mode: cleanArgs[1] || 'reactive',
        query: cleanArgs.slice(2).join(' '),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🛡️ ATHENA Omniscient Mesh Coordinator CLI - Complete Proactive Intelligence

Usage: node c4c6f63d.js <command> <mode> <query> [--silent|-s]

Commands:
  coordinate <reactive|proactive> <query>    Execute 5-component mesh with mode weighting
  help                                        Show this help

Modes:
  reactive       PRE-ACTION weights (L3=0.3, L5=0.1) - Conservative, validate user wants
  proactive      POST-ACTION weights (L3=0.1, L5=0.3) - Strategic, forecast user needs

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 4.1 | ATHENA Omniscient Mesh Coordinator
    `);
}

function executeComponent(cliPath, command, args) {
    return new Promise((resolve, reject) => {
        const proc = spawn('node', [cliPath, command, ...args], {
            cwd: process.cwd(),
            stdio: ['inherit', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', data => stdout += data.toString());
        proc.stderr.on('data', data => stderr += data.toString());

        proc.on('close', code => {
            if (code !== 0) {
                reject(new Error(`${path.basename(cliPath)} failed: ${stderr}`));
            } else {
                try {
                    resolve(JSON.parse(stdout));
                } catch (error) {
                    resolve({ raw: stdout });
                }
            }
        });
    });
}

async function coordinateMesh(mode, query) {
    const cliDir = path.join(__dirname);
    const weights = getWeights(mode);

    // Execute L1 (CWA) - Context Window Analyzer
    const cwa = await executeComponent(
        path.join(cliDir, 'ef51aca2.js'),
        'analyze',
        []
    );

    // Execute L2 (PA) - Project Analyzer
    const pa = await executeComponent(
        path.join(cliDir, '50fb4af9.js'),
        'discover',
        [query]
    );

    // L3 (TS) and L4 (LS) require PHASE 1 mesh outputs
    // Check if they exist
    const piuPath = '.esmc-piu-output.json';
    const dkiPath = '.esmc-dki-output.json';
    const uipPath = '.esmc-uip-output.json';
    const pcaPath = '.esmc-pca-output.json';
    const reasonPath = '.esmc-reason-output.json';

    let ts, ls;

    if (fs.existsSync(piuPath) && fs.existsSync(dkiPath) &&
        fs.existsSync(uipPath) && fs.existsSync(pcaPath)) {
        // Parse existing mesh outputs
        const piu = fs.readFileSync(piuPath, 'utf8');
        const dki = fs.readFileSync(dkiPath, 'utf8');
        const uip = fs.readFileSync(uipPath, 'utf8');
        const pca = fs.readFileSync(pcaPath, 'utf8');

        // Execute L3 (TS) - Technical Synthesizer
        ts = await executeComponent(
            path.join(cliDir, '509c1c08.js'),
            'synthesize',
            [piu, dki, uip, pca]
        );
    } else {
        ts = {
            technical_summary: { intent: query, confidence: 0.5 },
            complexity: 'unknown'
        };
    }

    if (fs.existsSync(reasonPath)) {
        const reason = fs.readFileSync(reasonPath, 'utf8');

        // Execute L4 (LS) - Logical Synthesizer
        ls = await executeComponent(
            path.join(cliDir, '34d43c60.js'),
            'synthesize',
            [reason]
        );
    } else {
        ls = {
            logical_summary: {
                WHAT: query,
                WHY: 'Unknown',
                WHERE: 'Unknown',
                WHEN: 'Unknown',
                HOW: 'Unknown',
                WHO: 'Unknown'
            }
        };
    }

    // Execute L5 (SF) - Strategic Forecaster
    const sf = await executeComponent(
        path.join(cliDir, '47621b27.js'),
        'forecast',
        [JSON.stringify(cwa), JSON.stringify(pa), JSON.stringify(ts), JSON.stringify(ls)]
    );

    // Apply mode-based weighting
    const omniscient = {
        mode: mode,
        weights: weights,
        layers: {
            L1_context: cwa,
            L2_project: pa,
            L3_technical: ts,
            L4_logical: ls,
            L5_strategic: sf
        },
        strategic_question: mode === 'reactive'
            ? `Should we execute: ${query}?`
            : `What will user need after: ${ts.technical_summary?.intent}?`,
        next_steps: sf.next_steps_ranked || [],
        // ESMC 4.1: Proactive forecast delivery (L5 = 0.3 weight in proactive mode)
        proactive_forecast: mode === 'proactive' ? {
            top_prediction: sf.strategic_gaps?.[0]?.gap || null,
            justification: sf.strategic_gaps?.[0]?.justification || null,
            source: sf.strategic_gaps?.[0]?.source || 'structural_analysis',
            confidence: sf.strategic_gaps?.[0]?.confidence || 0,
            cie_suggestions: sf.cie_suggestions || [],
            delivery_required: true  // MANDATORY: Display to user in POST-ACTION dialogue
        } : null,
        timestamp: new Date().toISOString()
    };

    // Write omniscient view
    fs.writeFileSync('.claude/.esmc-athena-omniscient-view.json', JSON.stringify(omniscient, null, 2));

    // ESMC 4.1: Write execution state for POST-ACTION mode detection
    if (mode === 'proactive') {
        const executionState = {
            executionComplete: true,
            lastQuery: query,
            timestamp: new Date().toISOString(),
            forecast_delivered: false  // Set to true after Claude displays forecast
        };
        fs.writeFileSync('.esmc-execution-state.json', JSON.stringify(executionState, null, 2));
    }

    return omniscient;
}

function getWeights(mode) {
    if (mode === 'reactive') {
        return {
            L1_context: 0.2,
            L2_project: 0.2,
            L3_technical: 0.3,  // Highest - conservative, validate feasibility
            L4_logical: 0.2,
            L5_strategic: 0.1   // Lowest - minimal forecasting
        };
    } else { // proactive
        return {
            L1_context: 0.2,
            L2_project: 0.2,
            L3_technical: 0.1,  // Lowest - don't sweat details
            L4_logical: 0.2,
            L5_strategic: 0.3   // Highest - strategic forecasting
        };
    }
}

async function main() {
    const { command, mode, query, silent } = parseArgs();

    try {
        switch (command) {
            case 'coordinate': {
                if (!['reactive', 'proactive'].includes(mode)) {
                    console.error(JSON.stringify({ error: 'Mode must be: reactive or proactive' }, null, 2));
                    process.exit(1);
                }
                if (!query) {
                    console.error(JSON.stringify({ error: 'Query required' }, null, 2));
                    process.exit(1);
                }
                const result = await coordinateMesh(mode, query);
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

module.exports = { coordinateMesh, getWeights };
