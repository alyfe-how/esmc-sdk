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

/**
 * ESMC 3.79.0 - ESMC-REASON CLI Wrapper (+ Gating Analysis)
 * ═══════════════════════════════════════════════════════════════════════
 * 🧠 CLI INTERFACE FOR 5W1H REASONING FRAMEWORK + SEQUENTIAL GATING
 *
 * Purpose: CLI wrapper for 6f5b01a8.js (ATHENA + ECHELON exclusive)
 * Architecture: Subprocess-based execution (parallel with mesh intelligence)
 * Token Optimization: Returns JSON output only (~300 tokens vs 33KB module)
 * Integration:
 * - BRAIN.md PHASE 1: 5th parallel component (analyze command)
 * - BRAIN.md PHASE 2B: Logical gate (gate command) - NEW in 3.79
 *
 * Usage:
 *   # Phase 1 (Parallel execution)
 *   node 854dea21.js analyze "<topic>" --context '{"key": "value"}' --caller "ECHELON" --silent
 *
 *   # Phase 2B (Sequential gating - NEW)
 *   node 854dea21.js gate "<topic>" --mesh-synthesis '{"score": 75}' --reason5w1h '{"scores": {...}}' --silent
 *
 * Output: JSON with 5W1H analysis + urgency/priority/confidence scoring
 *
 * ESMC Version: 3.79.0 (5W1H Meta-Reasoning + Sequential Gating)
 * Created: 2025-11-08
 * Updated: 2025-11-08 (Gating command added)
 * Status: PRODUCTION READY
 */

const ESMCReason = require('./6f5b01a8');

/**
 * CLI Argument Parser
 */
function parseArgs() {
    const args = process.argv.slice(2);

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');

    const config = {
        command: args[0] || 'help',
        topic: null,
        context: {},
        caller: 'UNKNOWN',
        silent: !verbose,  // Default silent unless verbose explicitly requested
        // NEW in 3.79: Phase 2B gating inputs
        meshSynthesis: null,
        reason5W1H: null,
        // NEW in 3.99.1: Memory context integration (all 6 dimensions)
        memoryContext: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--context' && args[i + 1]) {
            try {
                config.context = JSON.parse(args[i + 1]);
                i++; // Skip next arg (already processed)
            } catch (error) {
                console.error(`❌ Invalid JSON in --context: ${error.message}`);
                process.exit(1);
            }
        } else if (arg === '--caller' && args[i + 1]) {
            config.caller = args[i + 1];
            i++;
        } else if (arg === '--silent' || arg === '-s' || arg === '--verbose' || arg === '-v') {
            // 🆕 ESMC 3.101.0: Silent/verbose flags handled at top of parseArgs (skip here)
            continue;
        } else if (arg === 'analyze' && args[i + 1]) {
            config.topic = args[i + 1];
            i++;
        } else if (arg === 'gate' && args[i + 1]) {
            // NEW in 3.79: gating command
            config.topic = args[i + 1];
            i++;
        } else if (arg === '--mesh-synthesis' && args[i + 1]) {
            // NEW in 3.79: Phase 2A mesh fusion output
            try {
                config.meshSynthesis = JSON.parse(args[i + 1]);
                i++;
            } catch (error) {
                console.error(`❌ Invalid JSON in --mesh-synthesis: ${error.message}`);
                process.exit(1);
            }
        } else if (arg === '--reason5w1h' && args[i + 1]) {
            // NEW in 3.79: Phase 1 REASON output
            try {
                config.reason5W1H = JSON.parse(args[i + 1]);
                i++;
            } catch (error) {
                console.error(`❌ Invalid JSON in --reason5w1h: ${error.message}`);
                process.exit(1);
            }
        } else if (arg === '--memory-context' && args[i + 1]) {
            // NEW in 3.99.1: Memory context integration (from PHASE 0 memory-bundle)
            try {
                config.memoryContext = JSON.parse(args[i + 1]);
                i++;
            } catch (error) {
                console.error(`❌ Invalid JSON in --memory-context: ${error.message}`);
                process.exit(1);
            }
        }
    }

    return config;
}

/**
 * Main CLI Handler
 */
function main() {
    const config = parseArgs();

    // 🆕 ESMC 3.101.0: Silent mode now handled in parseArgs() via ESMC_VERBOSE check

    // Handle help command
    if (config.command === 'help' || config.command === '--help') {
        console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║  ESMC-REASON CLI - 5W1H Reasoning Framework                           ║
║  Version: 3.78.0                                                      ║
╚═══════════════════════════════════════════════════════════════════════╝

USAGE:
  node 854dea21.js analyze "<topic>" [OPTIONS]

OPTIONS:
  --context '{"key": "value"}'   Context data from mesh intelligence (JSON)
  --caller "ECHELON|ATHENA"      Who's calling (for tailored guidance)
  --silent                       Suppress non-JSON output

EXAMPLES:
  # ECHELON: PMO validator selection
  node 854dea21.js analyze "PMO validator selection" \\
    --context '{"hasAPI": true, "domain": "HEALTHCARE"}' \\
    --caller "ECHELON" --silent

  # ATHENA: Strategic question generation
  node 854dea21.js analyze "User authentication implementation" \\
    --context '{"timeline": "1 week", "userCount": 100000}' \\
    --caller "ATHENA" --silent

OUTPUT:
  JSON object with:
  - inquiry: 5W1H analysis (what, why, when, where, how, who)
  - scores: urgency, priority, confidence, complexity (0-1)
  - recommendation: Actionable guidance based on scores

INTEGRATION:
  Called by BRAIN.md PHASE 1 in parallel with PIU/DKI/UIP/PCA
  Exclusive to ATHENA + ECHELON (not accessible to colonels)

TOKEN BUDGET:
  ~300 tokens output (JSON only, module runs in subprocess)
        `);
        process.exit(0);
    }

    // Validate command
    if (config.command !== 'analyze' && config.command !== 'gate') {
        console.error(`❌ Unknown command: ${config.command}`);
        console.error('💡 Run "node 854dea21.js help" for usage');
        process.exit(1);
    }

    // Validate topic
    if (!config.topic) {
        console.error('❌ Missing required argument: <topic>');
        console.error('💡 Usage: node 854dea21.js analyze|gate "<topic>" [OPTIONS]');
        process.exit(1);
    }

    // Execute command
    try {
        const reasoner = new ESMCReason();
        let result;

        if (config.command === 'analyze') {
            // PHASE 1: Standard 5W1H analysis (parallel execution)
            // NEW in 3.99.1: Pass memoryContext to analyze()
            result = reasoner.analyze(config.topic, config.context, config.caller, config.memoryContext);
        } else if (config.command === 'gate') {
            // PHASE 2B: Sequential gating analysis (NEW in 3.79)
            if (!config.meshSynthesis) {
                console.error('❌ Gate command requires --mesh-synthesis argument');
                process.exit(1);
            }
            result = reasoner.performGatingAnalysis(
                config.topic,
                config.meshSynthesis,
                config.reason5W1H,
                config.context
            );
        }

        // Output JSON result
        if (config.silent) {
            // Silent mode: Minimal JSON (matching PIU/DKI/UIP/PCA pattern)
            let minimalOutput;

            if (config.command === 'analyze') {
                // Phase 1 output
                minimalOutput = {
                    topic: result.topic,
                    caller: result.caller,
                    scores: result.scores,
                    recommendation: {
                        summary: result.recommendation.summary,
                        caller_specific: result.recommendation.caller_specific
                    }
                };
            } else if (config.command === 'gate') {
                // Phase 2B output (ESMC 3.79.1 - Full 5W1H validation)
                minimalOutput = {
                    phase: result.phase,
                    verdict: result.verdict,
                    confidence: result.confidence,
                    halt: result.halt,
                    reasoning: {
                        verdict: result.reasoning.verdict,
                        confidence: result.reasoning.confidence,
                        validation_results: result.reasoning.validation_results,
                        logical_flaws: result.reasoning.logical_flaws
                    },
                    next_steps: result.next_steps
                };
            }

            console.log(JSON.stringify(minimalOutput, null, 2));
        } else {
            // Verbose mode: Pretty output with visual formatting
            console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
            console.log('║  ESMC-REASON ANALYSIS RESULT                                          ║');
            console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

            console.log(`📋 Topic: ${result.topic}`);
            console.log(`👤 Caller: ${result.caller}`);
            console.log(`🕐 Timestamp: ${result.timestamp}\n`);

            console.log('📊 SCORES:');
            console.log(`   Urgency:    ${(result.scores.urgency * 100).toFixed(0)}% ${getScoreBar(result.scores.urgency)}`);
            console.log(`   Priority:   ${(result.scores.priority * 100).toFixed(0)}% ${getScoreBar(result.scores.priority)}`);
            console.log(`   Confidence: ${(result.scores.confidence * 100).toFixed(0)}% ${getScoreBar(result.scores.confidence)}`);
            console.log(`   Complexity: ${(result.scores.complexity * 100).toFixed(0)}% ${getScoreBar(result.scores.complexity)}`);

            console.log('\n💡 RECOMMENDATION:');
            console.log(`   ${result.recommendation.summary}`);

            if (result.recommendation.actions.length > 0) {
                console.log('\n📝 ACTIONS:');
                result.recommendation.actions.forEach((action, i) => {
                    console.log(`   ${i + 1}. [${action.type.toUpperCase()}] ${action.message}`);
                    console.log(`      → ${action.action}`);
                });
            }

            console.log('\n📄 FULL JSON OUTPUT:\n');
            console.log(JSON.stringify(result, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error(`❌ Analysis failed: ${error.message}`);
        if (!config.silent) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

/**
 * Visual score bar helper
 */
function getScoreBar(score) {
    const width = 20;
    const filled = Math.round(score * width);
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled);

    let color = '';
    if (score >= 0.8) color = '🔴'; // High
    else if (score >= 0.6) color = '🟡'; // Medium-High
    else if (score >= 0.4) color = '🟢'; // Medium
    else color = '🔵'; // Low

    return `${color} ${bar}`;
}

// Execute CLI
main();
