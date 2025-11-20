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
/** ESMC 3.102.0 L5 Learning CLI | 2025-11-15 | v1.0.0
 *  Purpose: Record forecast outcomes for pattern learning accumulation
 *  Called by: AEGIS seed after session completion
 *  Innovation: Cross-session learning - updates precedent confidence based on accuracy
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
        inputs: cleanArgs.slice(1),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🧠 L5 Learning CLI - Cross-Session Pattern Accumulation

Usage: node 68e2ca6d.js <command> <inputs> [--silent|-s]

Commands:
  record <session_id> <forecast_json> <user_action>    Record forecast outcome
  add-pattern <pattern_json>                           Add new precedent pattern
  update-confidence <pattern_id> <success>             Update pattern confidence
  stats                                                Show learning statistics
  help                                                 Show this help

Inputs:
  session_id       Session identifier (e.g., "2025-11-15-session")
  forecast_json    JSON string of forecast that was made
  user_action      User response: "accepted", "ignored", "rejected"
  pattern_json     JSON string of new pattern to add
  pattern_id       Pattern identifier (e.g., "P001")
  success          Boolean: true if forecast was accurate

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.102.0 | L5 Learning System
    `);
}

/**
 * Record forecast outcome for learning
 */
function recordOutcome(sessionId, forecastJson, userAction) {
    const precedentsPath = path.join(process.cwd(), '.claude/memory/.l5-precedents.json');

    let forecast;
    try {
        forecast = typeof forecastJson === 'string' ? JSON.parse(forecastJson) : forecastJson;
    } catch (error) {
        throw new Error(`Failed to parse forecast: ${error.message}`);
    }

    // Load or initialize precedents
    let data;
    if (fs.existsSync(precedentsPath)) {
        data = JSON.parse(fs.readFileSync(precedentsPath, 'utf8'));
    } else {
        data = {
            version: '1.0.0',
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            patterns: [],
            forecast_history: [],
            metadata: {
                total_patterns: 0,
                total_forecasts: 0,
                accuracy_rate: 0,
                last_learning_update: null
            }
        };
    }

    // Record outcome
    const outcome = {
        session_date: new Date().toISOString(),
        session_id: sessionId,
        forecast: forecast.gap || forecast.next_step,
        confidence: forecast.confidence || 0.5,
        user_action: userAction,
        accuracy: userAction === 'accepted',
        source: forecast.source || 'unknown'
    };

    data.forecast_history.push(outcome);
    data.metadata.total_forecasts++;

    // Update pattern confidence if forecast was from precedent database
    if (forecast.source === 'precedent_database' && forecast.pattern_id) {
        const pattern = data.patterns.find(p => p.id === forecast.pattern_id);
        if (pattern && userAction === 'accepted') {
            // Increase confidence (weighted average: 90% old + 10% new success)
            pattern.evidence.success_rate = (pattern.evidence.success_rate * 0.9) + (1.0 * 0.1);
            pattern.evidence.confidence = Math.min(0.95, pattern.evidence.confidence + 0.05);
            pattern.last_success = new Date().toISOString();
        } else if (pattern && userAction === 'rejected') {
            // Decrease confidence slightly
            pattern.evidence.success_rate = Math.max(0.3, pattern.evidence.success_rate * 0.95);
            pattern.evidence.confidence = Math.max(0.5, pattern.evidence.confidence - 0.02);
        }
    }

    // Calculate overall accuracy rate
    const totalAccurate = data.forecast_history.filter(h => h.accuracy).length;
    data.metadata.accuracy_rate = totalAccurate / data.metadata.total_forecasts;
    data.metadata.last_learning_update = new Date().toISOString();
    data.last_updated = new Date().toISOString();

    // Save
    fs.writeFileSync(precedentsPath, JSON.stringify(data, null, 2));

    return {
        success: true,
        outcome_recorded: outcome,
        accuracy_rate: data.metadata.accuracy_rate,
        total_forecasts: data.metadata.total_forecasts
    };
}

/**
 * Add new precedent pattern
 */
function addPattern(patternJson) {
    const precedentsPath = path.join(process.cwd(), '.claude/memory/.l5-precedents.json');

    let pattern;
    try {
        pattern = typeof patternJson === 'string' ? JSON.parse(patternJson) : patternJson;
    } catch (error) {
        throw new Error(`Failed to parse pattern: ${error.message}`);
    }

    // Load or initialize precedents
    let data;
    if (fs.existsSync(precedentsPath)) {
        data = JSON.parse(fs.readFileSync(precedentsPath, 'utf8'));
    } else {
        data = {
            version: '1.0.0',
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            patterns: [],
            forecast_history: [],
            metadata: {
                total_patterns: 0,
                total_forecasts: 0,
                accuracy_rate: 0,
                last_learning_update: null
            }
        };
    }

    // Auto-generate ID if not provided
    if (!pattern.id) {
        pattern.id = `P${String(data.patterns.length + 1).padStart(3, '0')}`;
    }

    // Add creation timestamp
    pattern.created = new Date().toISOString();

    // Add pattern
    data.patterns.push(pattern);
    data.metadata.total_patterns++;
    data.last_updated = new Date().toISOString();

    // Save
    fs.writeFileSync(precedentsPath, JSON.stringify(data, null, 2));

    return {
        success: true,
        pattern_added: pattern,
        total_patterns: data.metadata.total_patterns
    };
}

/**
 * Show learning statistics
 */
function showStats() {
    const precedentsPath = path.join(process.cwd(), '.claude/memory/.l5-precedents.json');

    if (!fs.existsSync(precedentsPath)) {
        return {
            total_patterns: 0,
            total_forecasts: 0,
            accuracy_rate: 0,
            message: 'No learning data yet'
        };
    }

    const data = JSON.parse(fs.readFileSync(precedentsPath, 'utf8'));

    return {
        total_patterns: data.metadata.total_patterns,
        total_forecasts: data.metadata.total_forecasts,
        accuracy_rate: data.metadata.accuracy_rate,
        last_learning_update: data.metadata.last_learning_update,
        top_patterns: data.patterns
            .sort((a, b) => b.evidence.success_rate - a.evidence.success_rate)
            .slice(0, 5)
            .map(p => ({
                id: p.id,
                next_step: p.next_step,
                success_rate: p.evidence.success_rate,
                confidence: p.evidence.confidence
            }))
    };
}

async function main() {
    const { command, inputs, silent } = parseArgs();

    try {
        switch (command) {
            case 'record': {
                if (inputs.length < 3) {
                    console.error(JSON.stringify({ error: 'Requires 3 inputs: session_id, forecast_json, user_action' }, null, 2));
                    process.exit(1);
                }
                const result = recordOutcome(inputs[0], inputs[1], inputs[2]);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'add-pattern': {
                if (inputs.length < 1) {
                    console.error(JSON.stringify({ error: 'Requires 1 input: pattern_json' }, null, 2));
                    process.exit(1);
                }
                const result = addPattern(inputs[0]);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'stats': {
                const result = showStats();
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

module.exports = { recordOutcome, addPattern, showStats };
