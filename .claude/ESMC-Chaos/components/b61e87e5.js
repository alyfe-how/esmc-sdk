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

// ESMC 3.79.0 - ECHELON Decision Synthesizer CLI
// CLI wrapper for echelon-decision-synthesizer.js (PHASE 2C)
// Token-optimized silent mode (~100 tokens output)

const EchelonDecisionSynthesizer = require('../echelon-decision-synthesizer.js');
const path = require('path');

/**
 * Parse command-line arguments
 *
 * Usage:
 *   node b61e87e5.js synthesize \
 *     --mesh-synthesis '{"feasible":true,"score":85,...}' \
 *     --gating-verdict '{"verdict":"PROCEED","confidence":78,...}' \
 *     --topic "User profile editing" \
 *     [--silent]
 *
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
  const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');

  const config = {
    command: args[0] || 'synthesize',
    meshSynthesis: null,
    gatingVerdict: null,
    topic: '',
    silent: !verbose  // Default silent unless verbose explicitly requested
  };

  // Parse --mesh-synthesis (required - Phase 2A output)
  const meshIndex = args.indexOf('--mesh-synthesis');
  if (meshIndex !== -1 && args[meshIndex + 1]) {
    try {
      config.meshSynthesis = JSON.parse(args[meshIndex + 1]);
    } catch (e) {
      console.error(`❌ Invalid JSON in --mesh-synthesis: ${e.message}`);
      process.exit(1);
    }
  }

  // Parse --gating-verdict (required - Phase 2B output)
  const gatingIndex = args.indexOf('--gating-verdict');
  if (gatingIndex !== -1 && args[gatingIndex + 1]) {
    try {
      config.gatingVerdict = JSON.parse(args[gatingIndex + 1]);
    } catch (e) {
      console.error(`❌ Invalid JSON in --gating-verdict: ${e.message}`);
      process.exit(1);
    }
  }

  // Parse --topic (required - user request)
  const topicIndex = args.indexOf('--topic');
  if (topicIndex !== -1 && args[topicIndex + 1]) {
    config.topic = args[topicIndex + 1];
  }

  return config;
}

/**
 * Validate required arguments
 *
 * @param {Object} config - Parsed arguments
 */
function validateArgs(config) {
  if (!config.meshSynthesis) {
    console.error('❌ Missing required --mesh-synthesis argument (Phase 2A output JSON)');
    console.error('Usage: node b61e87e5.js synthesize --mesh-synthesis \'{...}\' --gating-verdict \'{...}\' --topic "..." [--silent]');
    process.exit(1);
  }

  if (!config.gatingVerdict) {
    console.error('❌ Missing required --gating-verdict argument (Phase 2B output JSON)');
    console.error('Usage: node b61e87e5.js synthesize --mesh-synthesis \'{...}\' --gating-verdict \'{...}\' --topic "..." [--silent]');
    process.exit(1);
  }

  if (!config.topic) {
    console.error('❌ Missing required --topic argument (user request)');
    console.error('Usage: node b61e87e5.js synthesize --mesh-synthesis \'{...}\' --gating-verdict \'{...}\' --topic "..." [--silent]');
    process.exit(1);
  }

  // Validate Phase 2B verdict is 'PROCEED' (halt check)
  if (config.gatingVerdict.verdict !== 'PROCEED') {
    // Phase 2B halted (REJECT or DEFER) - should not reach Phase 2C
    console.error(`❌ Phase 2B halted with verdict: ${config.gatingVerdict.verdict}`);
    console.error('Phase 2C (ECHELON Decision Synthesizer) should only execute if verdict === \'PROCEED\'');
    console.error('Halt at Phase 2B and handle verdict (REJECT or DEFER) before continuing.');
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  const config = parseArgs();

  // Validate arguments
  validateArgs(config);

  // Initialize synthesizer
  const synthesizer = new EchelonDecisionSynthesizer();

  // Execute decision synthesis
  const decision = synthesizer.synthesizeDecision(
    config.meshSynthesis,
    config.gatingVerdict,
    config.topic
  );

  // Output mode
  if (config.silent) {
    // Silent mode: Minimal JSON output (~100 tokens)
    const minimalOutput = {
      phase: decision.phase,
      decision: decision.decision,
      approach: decision.approach,
      final_confidence: decision.final_confidence,
      waves: decision.waves,
      parallel_execution: decision.parallel_execution,
      reasoning: decision.reasoning
    };

    console.log(JSON.stringify(minimalOutput, null, 2));
  } else {
    // Verbose mode: Visual presentation
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎖️ ECHELON DECISION SYNTHESIZER');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`📊 PHASE: ${decision.phase}`);
    console.log(`🎯 DECISION: ${decision.decision}`);
    console.log(`🚀 APPROACH: ${decision.approach}`);
    console.log(`📈 FINAL CONFIDENCE: ${decision.final_confidence}%`);
    console.log(`⚡ PARALLEL EXECUTION: ${decision.parallel_execution ? 'YES' : 'NO'}\n`);

    console.log('📋 REASONING:');
    console.log(`   ${decision.reasoning}\n`);

    console.log('🌊 WAVE CONFIGURATION:');
    if (decision.waves.length === 0) {
      console.log('   No waves configured (SKIP approach - lightweight direct response)\n');
    } else {
      decision.waves.forEach(wave => {
        console.log(`   Wave ${wave.wave}: ${wave.colonels.join(', ')}`);
        console.log(`   └─ ${wave.reason}`);
      });
      console.log('');
    }

    console.log('🔍 INPUT SCORES:');
    console.log(`   Technical Score: ${decision.technical_score}%`);
    console.log(`   Logical Confidence: ${decision.logical_confidence}%`);
    console.log(`   Complexity: ${Math.round(decision.complexity * 100)}%`);
    console.log(`   Urgency: ${Math.round(decision.urgency * 100)}%\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Phase 2C Complete | Confidence: ${decision.final_confidence}% | Approach: ${decision.approach}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Also output JSON for programmatic consumption
    console.log('📦 JSON OUTPUT:');
    console.log(JSON.stringify(decision, null, 2));
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { parseArgs, validateArgs };
