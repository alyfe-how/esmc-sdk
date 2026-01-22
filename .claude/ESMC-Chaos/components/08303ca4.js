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
 * ESMC 4.1 - L5 STRATEGIC FORECASTER CHECKPOINT CLI
 *
 * Purpose: HARD ACTIVATION of L5 Strategic Forecaster mode when iteration/intervention thresholds exceeded
 * L003 Compliance: Execution context validation (WHERE/WHEN/WHO before HOW)
 * Architecture: Token protection + architectural questioning enforcement
 *
 * Boolean Decision: activate_l5 (true/false) - No reasoning, just threshold enforcement
 *
 * WHY THIS EXISTS:
 * - Guardian Blessing failure: 9 iterations fixing symptoms, never questioned architecture
 * - IC/UID thresholds crossed but L5 never activated
 * - L3 (reactive) mode persisted when L5 (strategic) should have engaged
 * - This CLI FORCES L5 activation via hard thresholds
 *
 * ESMC 4.1: POST-ACTION context detection from .esmc-execution-state.json
 *
 * PREPROCESSABLE: Boolean output (activate_l5) can be computed in hybrid mode
 *
 * Commands:
 *   check [--silent]
 *     - Reads ATHENA vetting result
 *     - Calculates active triggers (IC/UID/AESD/POST-ACTION)
 *     - Returns boolean: activate_l5 (true = L5 MANDATORY, false = L3 default)
 *
 * Returns: JSON with {activate_l5: boolean, mandatory, triggers, questions}
 * Exit code: 0 = L5 activated, 1 = L5 not needed
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// L5 ACTIVATION LOGIC (BOOLEAN DECISION)
// ============================================================================

function evaluateL5Activation(triggers = {}) {
  const ic = triggers.iterationCount || 0;
  const uid = triggers.interventionCount || 0;
  const aesd = triggers.errorMatchPercentage || 0;
  const postAction = triggers.postActionContext || false;

  // Count active triggers
  const activeTriggers = [
    ic >= 3,                    // Iteration Counter: 3rd attempt (0-indexed = 2)
    uid >= 3,                   // User Intervention: 3 corrections
    aesd >= 0.70,               // Error Signature: 70%+ match
    postAction === true         // POST-ACTION context (fixing previous implementation)
  ].filter(Boolean).length;

  // HARD THRESHOLD: 2+ triggers = MANDATORY L5 (BOOLEAN DECISION)
  const activateL5 = activeTriggers >= 2;

  const result = {
    activate_l5: activateL5,  // BOOLEAN OUTPUT
    mandatory: activateL5,
    triggers: {
      iterationCount: ic,
      interventionCount: uid,
      errorMatchPercentage: aesd,
      postActionContext: postAction,
      active_count: activeTriggers,
      threshold: 2
    },
    questions: activateL5 ? generateStrategicQuestions(triggers) : [],
    block_implementation: activateL5,
    personality_switch: activateL5 ? 'L3_REACTIVE → L5_STRATEGIC' : 'L3_REACTIVE (default)'
  };

  return result;
}

// ============================================================================
// STRATEGIC QUESTIONS GENERATION
// ============================================================================

function generateStrategicQuestions(triggers) {
  const questions = [];

  // MANDATORY Questions (always ask when L5 activates)
  questions.push({
    dimension: 'WHERE',
    question: 'WHERE is this code executing?',
    elaboration: 'build-time vs runtime, server vs client, deployment environment',
    why_it_matters: 'Execution context determines available resources and architectural constraints'
  });

  questions.push({
    dimension: 'WHEN',
    question: 'WHEN does this feature run?',
    elaboration: 'lifecycle phase, timing requirements, execution order',
    why_it_matters: 'Timing determines what artifacts exist and what dependencies are available'
  });

  questions.push({
    dimension: 'WHO',
    question: 'WHO triggers this?',
    elaboration: 'user action vs automation vs system event',
    why_it_matters: 'Trigger source determines input validation and trust boundaries'
  });

  questions.push({
    dimension: 'WHY',
    question: 'WHY are we fixing symptoms instead of questioning root cause?',
    elaboration: `${triggers.iterationCount || 0} iteration(s), ${triggers.interventionCount || 0} intervention(s) - pattern suggests architectural mismatch`,
    why_it_matters: 'Multiple attempts with no success indicates wrong approach, not wrong implementation'
  });

  return questions;
}

// ============================================================================
// COMMAND: check
// ============================================================================

async function checkL5Activation(options = {}) {
  const silent = options.silent !== false;

  try {
    // Read ATHENA vetting result
    const vettingResultPath = path.resolve(process.cwd(), '.esmc-athena-vetting-result.json');

    if (!fs.existsSync(vettingResultPath)) {
      // No vetting result = no triggers = L5 not needed
      const result = {
        activate_l5: false,
        mandatory: false,
        triggers: {
          iterationCount: 0,
          interventionCount: 0,
          errorMatchPercentage: 0,
          postActionContext: false,
          active_count: 0,
          threshold: 2
        },
        questions: [],
        block_implementation: false,
        note: 'No vetting result found - L5 activation skipped'
      };

      if (!silent) {
        console.log('⚠️  No ATHENA vetting result found - L5 checkpoint skipped');
      }

      return result;
    }

    const vettingResult = JSON.parse(fs.readFileSync(vettingResultPath, 'utf-8'));

    // ESMC 4.1: Detect POST-ACTION context from execution state file
    let postActionContext = false;
    const executionStatePath = path.resolve(process.cwd(), '.esmc-execution-state.json');
    if (fs.existsSync(executionStatePath)) {
      try {
        const executionState = JSON.parse(fs.readFileSync(executionStatePath, 'utf-8'));
        postActionContext = executionState.executionComplete === true;
      } catch (e) {
        // Graceful fallback - continue without POST-ACTION detection
      }
    }

    // Extract triggers from vetting result
    const triggers = {
      iterationCount: vettingResult.component_results?.IC?.iterationCount || 0,
      interventionCount: vettingResult.component_results?.UID?.interventionCount || 0,
      errorMatchPercentage: vettingResult.component_results?.AESD?.matchPercentage || 0,
      postActionContext: postActionContext  // ESMC 4.1: Now detected from execution state
    };

    const result = evaluateL5Activation(triggers);

    if (!silent) {
      console.log('\n🧠 L5 Strategic Checkpoint Evaluation:');
      console.log(`   Activate L5: ${result.activate_l5}`);
      console.log(`   Active Triggers: ${result.triggers.active_count}/${result.triggers.threshold}`);

      if (result.activate_l5) {
        console.log('\n🚨 L5 STRATEGIC FORECASTER ACTIVATED - MANDATORY QUESTIONS:');
        result.questions.forEach((q, i) => {
          console.log(`\n${i + 1}. [${q.dimension}] ${q.question}`);
          console.log(`   → ${q.elaboration}`);
          console.log(`   ⚠️ Why it matters: ${q.why_it_matters}`);
        });
        console.log('\n🛑 Implementation BLOCKED until questions answered');
      } else {
        console.log('\n✅ L5 activation not required - proceed with L3 reactive mode');
      }
    }

    return result;

  } catch (error) {
    const errorResult = {
      activate_l5: false,
      error: error.message
    };

    if (!silent) {
      console.error('❌ L5 Checkpoint Error:', error.message);
    }

    return errorResult;
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'check') {
    const silent = args.includes('--silent');
    const result = await checkL5Activation({ silent });

    // Write result to file
    const outputPath = path.resolve(process.cwd(), '.esmc-l5-checkpoint-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    // Exit code: 0 = L5 activated, 1 = L5 not needed
    process.exit(result.activate_l5 ? 0 : 1);

  } else {
    console.error('Usage: node 08303ca4.js check [--silent]');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { evaluateL5Activation, checkL5Activation };
