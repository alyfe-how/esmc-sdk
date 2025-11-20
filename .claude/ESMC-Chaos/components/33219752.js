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
/** ESMC 4.1 ATHENA+ POST-ACTION Auto-Trigger CLI | 2025-11-19 | v1.0.0
 *  Purpose: Automatic proactive intelligence after task completion
 *  Token Cost: ~150 tokens (orchestration + L5 forecast delivery)
 *  Innovation: Closes the ATHENA+ loop - auto-triggers proactive mode
 *
 *  This CLI makes ATHENA truly ATHENA+ by:
 *  1. Writing execution state (task complete)
 *  2. Running proactive mode coordination (L5=0.3)
 *  3. Extracting and formatting forecast for dialogue
 *  4. Recording user response for L5 learning
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) { showUsage(); process.exit(1); }

    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const cleanArgs = args.filter(arg => !['--verbose', '-v'].includes(arg));

    return {
        command: cleanArgs[0],
        inputs: cleanArgs.slice(1),
        silent: !verbose
    };
}

function showUsage() {
    console.log(`
🧠 ATHENA+ POST-ACTION Auto-Trigger CLI

Usage: node 33219752.js <command> [inputs]

Commands:
  trigger <task_summary>     Trigger proactive mode after task completion
  record <accepted|rejected> Record user response to forecast for L5 learning
  status                     Show current ATHENA+ state
  help                       Show this help

Examples:
  node 33219752.js trigger "Implemented FORTRESS MODE verification"
  node 33219752.js record accepted

Version: ESMC 4.1 | ATHENA+ Proactive Intelligence
    `);
}

/**
 * Trigger POST-ACTION proactive mode
 * This is the core ATHENA+ automation
 */
async function triggerPostAction(taskSummary) {
    const cliDir = __dirname;

    // Step 1: Write execution state
    const executionState = {
        executionComplete: true,
        lastTask: taskSummary,
        timestamp: new Date().toISOString(),
        forecast_delivered: false
    };
    fs.writeFileSync('.esmc-execution-state.json', JSON.stringify(executionState, null, 2));

    // Step 2: Run proactive mode coordination
    let omniscientResult;
    try {
        const output = execSync(
            `node "${path.join(cliDir, '28f96cf3.js')}" coordinate proactive "${taskSummary}"`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
        );
        omniscientResult = JSON.parse(output);
    } catch (error) {
        return {
            success: false,
            error: `Proactive coordination failed: ${error.message}`,
            forecast: null
        };
    }

    // Step 3: Extract forecast for dialogue delivery
    const forecast = omniscientResult.proactive_forecast;

    if (!forecast || !forecast.top_prediction) {
        return {
            success: true,
            has_forecast: false,
            message: 'No strategic forecast generated',
            omniscient: omniscientResult
        };
    }

    // Step 4: Format for dialogue (COLONELS-TALK integration)
    const dialogueOutput = {
        success: true,
        has_forecast: true,
        forecast: {
            prediction: forecast.top_prediction,
            justification: forecast.justification,
            confidence: forecast.confidence,
            source: forecast.source,
            cie_suggestions: forecast.cie_suggestions || []
        },
        dialogue_template: formatForDialogue(forecast, taskSummary),
        omniscient: omniscientResult
    };

    // Mark forecast as delivered
    executionState.forecast_delivered = true;
    executionState.forecast_prediction = forecast.top_prediction;
    fs.writeFileSync('.esmc-execution-state.json', JSON.stringify(executionState, null, 2));

    return dialogueOutput;
}

/**
 * Format forecast for COLONELS-TALK dialogue
 */
function formatForDialogue(forecast, taskSummary) {
    const confidence = Math.round((forecast.confidence || 0) * 100);
    const source = forecast.source === 'cie_proactive' ? 'CIE proactive intelligence' :
                   forecast.source === 'precedent_database' ? 'precedent analysis' :
                   'structural analysis';

    return `🗣️ ATHENA: "Task complete: ${taskSummary}

   Strategic forecast (L5=0.3, ${source}):

   You WILL need: ${forecast.top_prediction}

   Confidence: ${confidence}%
   Evidence: ${forecast.justification || 'Pattern-based prediction'}

   ${forecast.cie_suggestions?.length > 0 ? `CIE also suggests: ${forecast.cie_suggestions.join(', ')}` : ''}"`;
}

/**
 * Record user response for L5 learning
 */
function recordResponse(userAction) {
    const statePath = '.esmc-execution-state.json';

    if (!fs.existsSync(statePath)) {
        return { success: false, error: 'No execution state found - trigger POST-ACTION first' };
    }

    const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));

    if (!state.forecast_prediction) {
        return { success: false, error: 'No forecast to record response for' };
    }

    // Call L5 learning CLI
    try {
        const sessionId = new Date().toISOString().split('T')[0] + '-post-action';
        const forecastJson = JSON.stringify({
            gap: state.forecast_prediction,
            confidence: 0.7,
            source: 'proactive_forecast'
        });

        const cliPath = path.join(__dirname, '68e2ca6d.js');
        execSync(
            `node "${cliPath}" record "${sessionId}" '${forecastJson.replace(/'/g, "\\'")}' "${userAction}"`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
        );

        // Update state
        state.user_response = userAction;
        state.learning_recorded = true;
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

        return {
            success: true,
            recorded: {
                prediction: state.forecast_prediction,
                response: userAction,
                learning_updated: true
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Show ATHENA+ status
 */
function showStatus() {
    const statePath = '.esmc-execution-state.json';
    const omniscientPath = '.claude/.esmc-athena-omniscient-view.json';
    const precedentsPath = '.claude/memory/.l5-precedents.json';

    const status = {
        execution_state: fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf-8')) : null,
        last_omniscient: fs.existsSync(omniscientPath) ? JSON.parse(fs.readFileSync(omniscientPath, 'utf-8')) : null,
        l5_stats: null
    };

    if (fs.existsSync(precedentsPath)) {
        const precedents = JSON.parse(fs.readFileSync(precedentsPath, 'utf-8'));
        status.l5_stats = {
            total_patterns: precedents.metadata.total_patterns,
            total_forecasts: precedents.metadata.total_forecasts,
            accuracy_rate: precedents.metadata.accuracy_rate
        };
    }

    return status;
}

async function main() {
    const { command, inputs, silent } = parseArgs();

    try {
        switch (command) {
            case 'trigger': {
                const taskSummary = inputs.join(' ') || 'Task completed';
                const result = await triggerPostAction(taskSummary);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'record': {
                const userAction = inputs[0];
                if (!['accepted', 'rejected', 'ignored'].includes(userAction)) {
                    console.error(JSON.stringify({ error: 'Action must be: accepted, rejected, or ignored' }, null, 2));
                    process.exit(1);
                }
                const result = recordResponse(userAction);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'status': {
                const result = showStatus();
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

module.exports = { triggerPostAction, recordResponse, showStatus };
