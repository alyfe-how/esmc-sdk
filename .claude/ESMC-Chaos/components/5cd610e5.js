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
 * CIFS Gate CLI (Context-Integrity Flag System)
 * ESMC 3.103.0 - Universal Enforcement Substrate
 *
 * Purpose: Check CIFS flags and block/allow execution at manifest entry points
 * Usage: node 5cd610e5.js <checkpoint_name> --require-flags=<flag1,flag2,...>
 *
 * Architecture:
 * - Reads .esmc-cifs-state.json (external state file)
 * - Validates required flags are set to true
 * - Returns JSON: {action: "PROCEED"|"HALT", reason, instruction}
 * - Exit code 0 = PROCEED, Exit code 1 = HALT
 *
 * L002 Compliance: Execution evidence via flag validation (not instruction compliance)
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const checkpointName = process.argv[2];
const args = process.argv.slice(3);

if (!checkpointName) {
  console.error(JSON.stringify({
    error: "ERROR: Checkpoint name required",
    usage: "node 5cd610e5.js <checkpoint_name> --require-flags=<flag1,flag2,...>"
  }, null, 2));
  process.exit(1);
}

// Parse --require-flags argument
let requiredFlags = [];
const flagsArg = args.find(arg => arg.startsWith('--require-flags='));
if (flagsArg) {
  const flagsValue = flagsArg.split('=')[1];
  requiredFlags = flagsValue ? flagsValue.split(',').map(f => f.trim()).filter(f => f) : [];
}

// Read CIFS state file
const cifsPath = path.join(process.cwd(), '.esmc-cifs-state.json');

if (!fs.existsSync(cifsPath)) {
  // CIFS state file missing = routing never initialized
  console.log(JSON.stringify({
    action: "HALT",
    reason: "CIFS state file missing - context-integrity never validated",
    checkpoint: checkpointName,
    required_flags: requiredFlags,
    instruction: "Execute: node \"./.claude/ESMC-Chaos/components/db8a0273.js\" check A [SUB_TOTAL] [current_turn]"
  }, null, 2));
  process.exit(1);
}

// Parse CIFS state
let cifsState;
try {
  const cifsContent = fs.readFileSync(cifsPath, 'utf8');
  cifsState = JSON.parse(cifsContent);
} catch (error) {
  console.log(JSON.stringify({
    action: "HALT",
    reason: `CIFS state file corrupted: ${error.message}`,
    checkpoint: checkpointName,
    instruction: "Delete .esmc-cifs-state.json and re-run db8a0273.js"
  }, null, 2));
  process.exit(1);
}

// Validate CIFS state structure
if (!cifsState.flags || typeof cifsState.flags !== 'object') {
  console.log(JSON.stringify({
    action: "HALT",
    reason: "CIFS state missing 'flags' object",
    checkpoint: checkpointName,
    instruction: "CIFS state file corrupted - delete and re-initialize"
  }, null, 2));
  process.exit(1);
}

// Check all required flags (supports negation with !)
const failedFlags = [];
for (const flag of requiredFlags) {
  const isNegated = flag.startsWith('!');
  const flagName = isNegated ? flag.substring(1) : flag;

  if (isNegated) {
    // Negated flag: should be false or undefined
    if (cifsState.flags[flagName] === true) {
      failedFlags.push(flag); // Use original (with !) for error message
    }
  } else {
    // Normal flag: should be true
    if (cifsState.flags[flagName] !== true) {
      failedFlags.push(flag);
    }
  }
}

if (failedFlags.length > 0) {
  // One or more required flags not set
  console.log(JSON.stringify({
    action: "HALT",
    reason: `Required flags not validated: ${failedFlags.join(', ')}`,
    checkpoint: checkpointName,
    failed_flags: failedFlags,
    current_flags: cifsState.flags,
    last_validation_turn: cifsState.last_validation_turn,
    current_turn: cifsState.current_turn,
    instruction: "Complete previous phases that set these flags before proceeding"
  }, null, 2));
  process.exit(1);
}

// All required flags validated - allow execution
console.log(JSON.stringify({
  action: "PROCEED",
  checkpoint: checkpointName,
  validated_flags: requiredFlags,
  all_flags: cifsState.flags,
  validation_timestamp: cifsState.last_validation_timestamp,
  validation_turn: cifsState.last_validation_turn
}, null, 2));

process.exit(0);
