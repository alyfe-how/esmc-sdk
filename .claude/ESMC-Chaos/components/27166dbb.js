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
 * ESMC 3.102.0 - ITERATION COUNTER AUTO-HALT CLI
 *
 * Purpose: Token protection via automatic halt at iteration threshold
 * L003 Compliance: Prevents token hemorrhage from repeated symptom fixes
 * Architecture: Boolean enforcement wrapper for IC thresholds
 *
 * Boolean Decision: should_halt (true/false) - No reasoning, just threshold enforcement
 *
 * WHY THIS EXISTS:
 * - Guardian Blessing failure: 9 iterations = ~135K tokens wasted
 * - 2f147253.js has thresholds but no auto-halt wrapper
 * - IC counted iterations but didn't BLOCK execution
 * - This CLI converts counts to BOOLEAN HALT decision
 *
 * PREPROCESSABLE: Boolean output (should_halt) can be computed in hybrid mode
 *
 * Commands:
 *   check [--silent]
 *     - Reads ATHENA vetting result (IC component)
 *     - Returns boolean: should_halt (true = HALT at iteration 3, false = proceed)
 *
 * Returns: JSON with {should_halt: boolean, iteration_count, token_cost, recommendations}
 * Exit code: 0 = halt triggered, 1 = proceed allowed
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// IC AUTO-HALT LOGIC (BOOLEAN DECISION)
// ============================================================================

function evaluateAutoHalt(iterationCount = 0) {
  // HARD THRESHOLD: 3 iterations = MANDATORY HALT (0-indexed, so >= 2)
  const shouldHalt = iterationCount >= 2;

  const estimatedTokenCost = (iterationCount + 1) * 15000;  // ~15K tokens per iteration
  const projectedWaste = shouldHalt ? (iterationCount + 3) * 15000 : 0;  // If we continue

  const result = {
    should_halt: shouldHalt,  // BOOLEAN OUTPUT
    iteration_count: iterationCount,
    iteration_number: iterationCount + 1,  // Human-readable (1st, 2nd, 3rd)
    threshold: 2,  // 0-indexed threshold (2 = 3rd attempt)
    severity: shouldHalt ? 'critical' : (iterationCount >= 1 ? 'warning' : 'none'),
    token_cost_so_far: estimatedTokenCost,
    token_cost_projection: projectedWaste,
    recommendations: []
  };

  if (shouldHalt) {
    result.recommendations.push('⛔ CRITICAL: Token protection activated');
    result.recommendations.push(`${result.iteration_number} iterations attempted with no success`);
    result.recommendations.push('HALT execution - review strategic approach');
    result.recommendations.push('Ask WHERE/WHEN/WHO before continuing HOW');
    result.recommendations.push(`Projected waste if continuing: ${projectedWaste.toLocaleString()} tokens`);
  } else if (iterationCount >= 1) {
    result.recommendations.push(`⚠️ WARNING: Iteration ${result.iteration_number} detected`);
    result.recommendations.push('Previous attempt(s) may indicate systematic issue');
  }

  return result;
}

// ============================================================================
// COMMAND: check
// ============================================================================

async function checkAutoHalt(options = {}) {
  const silent = options.silent !== false;

  try {
    // Read ATHENA vetting result
    const vettingResultPath = path.resolve(process.cwd(), '.esmc-athena-vetting-result.json');

    if (!fs.existsSync(vettingResultPath)) {
      // No vetting result = iteration 0 = no halt
      const result = {
        should_halt: false,
        iteration_count: 0,
        iteration_number: 1,
        threshold: 2,
        severity: 'none',
        token_cost_so_far: 15000,
        token_cost_projection: 0,
        recommendations: [],
        note: 'No vetting result found - first iteration assumed'
      };

      if (!silent) {
        console.log('✅ IC Auto-Halt: First iteration - proceed');
      }

      return result;
    }

    const vettingResult = JSON.parse(fs.readFileSync(vettingResultPath, 'utf-8'));

    // Extract iteration count from IC component
    const iterationCount = vettingResult.component_results?.IC?.iterationCount || 0;

    const result = evaluateAutoHalt(iterationCount);

    if (!silent) {
      console.log('\n🛡️ IC Auto-Halt Evaluation:');
      console.log(`   Iteration: ${result.iteration_number} (count: ${result.iteration_count})`);
      console.log(`   Should Halt: ${result.should_halt}`);
      console.log(`   Severity: ${result.severity}`);
      console.log(`   Token Cost: ${result.token_cost_so_far.toLocaleString()}`);

      if (result.should_halt) {
        console.log('\n🚨 AUTO-HALT TRIGGERED:');
        result.recommendations.forEach(r => console.log(`   ${r}`));
        console.log('\n🛑 Execution BLOCKED - User review required');
      } else if (result.iteration_count >= 1) {
        console.log('\n⚠️ WARNING:');
        result.recommendations.forEach(r => console.log(`   ${r}`));
      } else {
        console.log('\n✅ First iteration - proceed');
      }
    }

    return result;

  } catch (error) {
    const errorResult = {
      should_halt: false,
      error: error.message
    };

    if (!silent) {
      console.error('❌ IC Auto-Halt Error:', error.message);
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
    const result = await checkAutoHalt({ silent });

    // Write result to file
    const outputPath = path.resolve(process.cwd(), '.esmc-ic-auto-halt-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    // Exit code: 0 = halt triggered, 1 = proceed
    process.exit(result.should_halt ? 0 : 1);

  } else {
    console.error('Usage: node 27166dbb.js check [--silent]');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { evaluateAutoHalt, checkAutoHalt };
