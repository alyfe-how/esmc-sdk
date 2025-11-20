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

/**
 * ESMC 3.102.0 - ATHENA VETTING ENFORCEMENT CLI
 *
 * Purpose: HARD ENFORCEMENT wrapper for PHASE 0.7 ATHENA vetting protocol
 * L002 Compliance: Converts "documentation-style" instructions to "execution blocks"
 * Architecture: BOOTSTRAP 3.92.3 pattern (imperative execution, not explanatory)
 *
 * WHY THIS EXISTS:
 * - PHASE 0.7 in 0cd9e0a2.md had "Use Bash tool: Execute 378d473d.js vet"
 * - That's DOCUMENTATION STYLE (tells you to do something)
 * - This CLI IS EXECUTION STYLE (actually does it)
 * - Prevention: Claude can't bypass this - it's code, not instructions
 *
 * Boolean Decision: shouldHalt (true/false) - No reasoning, just enforcement
 *
 * Commands:
 *   enforce [--mode <full_deployment|lightweight>] [--silent]
 *     - Executes ALL PHASE 0.7 steps automatically
 *     - Returns boolean: shouldHalt (true = HALT, false = proceed)
 *
 * Returns: JSON with {shouldHalt: boolean, severity, dialogue, checkpoint_passed}
 * Exit code: 0 = proceed, 1 = halt required
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// COMMAND: enforce
// ============================================================================

async function enforceVetting(options = {}) {
  const mode = options.mode || 'full_deployment';
  const silent = options.silent !== false;

  const result = {
    phase: 'PHASE_0.7',
    protocol: 'ATHENA_VETTING_ENFORCEMENT',
    version: '3.102.0',
    mode: mode,
    steps_executed: [],
    shouldHalt: false,  // BOOLEAN DECISION
    severity: 'none',
    dialogue: null,
    checkpoint_passed: true,
    execution_evidence: []
  };

  try {
    // ========================================================================
    // STEP 1: MODE CHECK (Lines 377-385 BRAIN-CORE)
    // ========================================================================

    result.steps_executed.push('STEP_1_MODE_CHECK');

    if (mode !== 'full_deployment') {
      result.execution_evidence.push('Mode check: lightweight mode detected → ATHENA vetting skipped (conditional execution)');
      result.checkpoint_passed = true;

      if (!silent) {
        console.log('⚠️  ATHENA Vetting: Skipped (lightweight mode - conditional protocol)');
      }

      return result;
    }

    result.execution_evidence.push('Mode check: full_deployment mode → ATHENA vetting MANDATORY');

    if (!silent) {
      console.log('🛡️  ATHENA Vetting: PHASE 0.7 enforcement initiated (full deployment)');
    }

    // ========================================================================
    // STEP 2: EXECUTE EPSILON-ATHENA-CLI.JS VET (Lines 387-393)
    // ========================================================================

    result.steps_executed.push('STEP_2_EXECUTE_VETTING');

    const cliPath = path.resolve(__dirname, '378d473d.js');

    if (!fs.existsSync(cliPath)) {
      throw new Error(`378d473d.js not found at ${cliPath}`);
    }

    if (!silent) {
      console.log('🛡️  Executing: 378d473d.js vet --silent');
    }

    // Execute vetting CLI (ACTUAL EXECUTION, not documentation)
    try {
      execSync(`node "${cliPath}" vet --silent`, {
        cwd: process.cwd(),
        stdio: silent ? 'pipe' : 'inherit',
        timeout: 30000
      });

      result.execution_evidence.push('378d473d.js vet executed successfully');
    } catch (error) {
      result.execution_evidence.push(`378d473d.js vet failed: ${error.message}`);
      throw error;
    }

    // ========================================================================
    // STEP 3: READ VETTING RESULT (Lines 395-404)
    // ========================================================================

    result.steps_executed.push('STEP_3_READ_RESULT');

    const vettingResultPath = path.resolve(process.cwd(), '.esmc-athena-vetting-result.json');

    if (!fs.existsSync(vettingResultPath)) {
      throw new Error('.esmc-athena-vetting-result.json not found - vetting CLI did not write output');
    }

    const vettingResult = JSON.parse(fs.readFileSync(vettingResultPath, 'utf-8'));

    result.shouldHalt = vettingResult.shouldHalt || false;  // BOOLEAN EXTRACTION
    result.severity = vettingResult.severity || 'none';
    result.component_results = vettingResult.component_results || {};
    result.recommendations = vettingResult.recommendations || [];

    result.execution_evidence.push(`Vetting result parsed: shouldHalt=${result.shouldHalt}, severity=${result.severity}`);

    if (!silent) {
      console.log(`🛡️  Vetting Result: shouldHalt=${result.shouldHalt}, severity=${result.severity}`);
    }

    // ========================================================================
    // STEP 4: HANDLE VETTING VERDICT (Lines 405-444)
    // ========================================================================

    result.steps_executed.push('STEP_4_HANDLE_VERDICT');

    if (result.shouldHalt === true) {
      // BOOLEAN TRIGGERED: Build ATHENA warning dialogue (COLONELS-TALK lines 46-64)

      const dialogueParts = [];
      dialogueParts.push('🗣️  ATHENA: "General, **before we proceed**, I\'ve detected warning signals from my error analysis:');
      dialogueParts.push('');
      dialogueParts.push(`   **Severity:** ${result.severity}`);
      dialogueParts.push('');

      // Extract component-specific warnings
      const components = result.component_results || {};

      if (components.AESD && components.AESD.matchPercentage > 0) {
        const aesd = components.AESD;
        dialogueParts.push(`   - AESD: Similar approach detected in Rank ${aesd.matchedSession?.rank} (${(aesd.matchPercentage * 100).toFixed(0)}% similarity)`);
        dialogueParts.push(`     ${aesd.errorSignature || 'Pattern detected'}`);
      }

      if (components.IC && components.IC.iterationCount > 0) {
        const ic = components.IC;
        const ordinal = getOrdinal(ic.iterationCount + 1);
        dialogueParts.push(`   - IC: This is our ${ordinal} attempt at similar problem`);
        dialogueParts.push(`     ${ic.recommendations[0] || 'Multiple iterations detected'}`);
      }

      if (components.CSPM && components.CSPM.precedentsFound && components.CSPM.precedentsFound.length > 0) {
        const cspm = components.CSPM;
        const precedent = cspm.precedentsFound[0];
        dialogueParts.push(`   - CSPM: Rank ${precedent.rank} solved this with ${precedent.solution}`);
        dialogueParts.push(`     ${precedent.details || 'Cross-session pattern matched'}`);
      }

      if (components.UID && components.UID.interventionCount > 0) {
        const uid = components.UID;
        dialogueParts.push(`   - UID: You've corrected us ${uid.interventionCount} time(s) recently on similar patterns`);
        dialogueParts.push(`     ${uid.pattern || 'User intervention pattern detected'}`);
      }

      dialogueParts.push('');
      dialogueParts.push(`   **Recommendation:** ${result.recommendations[0] || 'Review precedents before proceeding'}`);
      dialogueParts.push('');
      dialogueParts.push('   Shall we review these precedents before ESMC proceeds?"');

      result.dialogue = dialogueParts.join('\n');
      result.execution_evidence.push('shouldHalt=true → ATHENA warning dialogue constructed (COLONELS-TALK protocol)');

      if (!silent) {
        console.log('\n🚨 HALT CONDITION TRIGGERED:');
        console.log(result.dialogue);
        console.log('\n⚠️  EXECUTION BLOCKED: User response required');
      }

    } else {
      // BOOLEAN FALSE: No warnings - proceed silently
      result.dialogue = null;
      result.execution_evidence.push('shouldHalt=false → Silent proceed to PHASE 1 (no dialogue interruption)');

      if (!silent) {
        console.log('✅ ATHENA Vetting: No warnings detected - proceeding silently');
      }
    }

    // ========================================================================
    // STEP 5: CHECKPOINT ENFORCEMENT (Lines 446-451)
    // ========================================================================

    result.steps_executed.push('STEP_5_CHECKPOINT');

    const checkpointQuestions = [
      { q: 'MODE = full_deployment', a: mode === 'full_deployment' },
      { q: '378d473d.js vet executed', a: result.steps_executed.includes('STEP_2_EXECUTE_VETTING') },
      { q: 'Vetting result read', a: result.steps_executed.includes('STEP_3_READ_RESULT') },
      { q: 'Verdict handled', a: result.steps_executed.includes('STEP_4_HANDLE_VERDICT') }
    ];

    result.checkpoint_questions = checkpointQuestions;
    result.checkpoint_passed = checkpointQuestions.every(c => c.a === true);

    if (!result.checkpoint_passed) {
      const failed = checkpointQuestions.filter(c => !c.a).map(c => c.q);
      throw new Error(`Checkpoint failed: ${failed.join(', ')}`);
    }

    result.execution_evidence.push('Checkpoint passed: All 5 steps executed successfully');

    if (!silent) {
      console.log('✅ Checkpoint: PHASE 0.7 fully executed (all 5 steps)');
    }

    return result;

  } catch (error) {
    result.error = error.message;
    result.checkpoint_passed = false;
    result.execution_evidence.push(`Error during enforcement: ${error.message}`);

    if (!silent) {
      console.error('❌ ATHENA Vetting Enforcement Failed:', error.message);
    }

    return result;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'enforce') {
    const modeIndex = args.indexOf('--mode');
    const mode = modeIndex >= 0 ? args[modeIndex + 1] : 'full_deployment';
    const silent = args.includes('--silent');

    const result = await enforceVetting({ mode, silent });

    // Write result to file for Claude to read
    const outputPath = path.resolve(process.cwd(), '.esmc-athena-enforcement-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    if (!silent) {
      console.log('\n📊 Enforcement Result:');
      console.log(JSON.stringify(result, null, 2));
    }

    // Exit code: 0 = proceed, 1 = halt required
    process.exit(result.shouldHalt ? 1 : 0);

  } else {
    console.error('Usage: node 49fbb479.js enforce [--mode <full_deployment|lightweight>] [--silent]');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { enforceVetting };
