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
 * CIFS Set Flag CLI (Context-Integrity Flag System)
 * ESMC 3.103.0 - Universal Enforcement Substrate
 *
 * Purpose: Set CIFS flags to true after phase completion (execution evidence)
 * Usage: node 4e0d67cb.js <flag_name> [--silent]
 *
 * Architecture:
 * - Reads/creates .esmc-cifs-state.json (external state file)
 * - Sets specified flag to true
 * - Appends to validation_history (audit trail)
 * - Returns silently (exit code 0 = success, 1 = error)
 *
 * L002 Compliance: Flag setting IS execution evidence (can't set without completing phase)
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const flagName = process.argv[2];
const isSilent = process.argv.includes('--silent');

if (!flagName) {
  if (!isSilent) {
    console.error(JSON.stringify({
      error: "ERROR: Flag name required",
      usage: "node 4e0d67cb.js <flag_name> [--silent]"
    }, null, 2));
  }
  process.exit(1);
}

// CIFS state file path
const cifsPath = path.join(process.cwd(), '.esmc-cifs-state.json');

// Initialize or read CIFS state
let cifsState;

if (fs.existsSync(cifsPath)) {
  // Read existing state
  try {
    const cifsContent = fs.readFileSync(cifsPath, 'utf8');
    cifsState = JSON.parse(cifsContent);
  } catch (error) {
    if (!isSilent) {
      console.error(JSON.stringify({
        error: `Failed to parse CIFS state: ${error.message}`,
        instruction: "Delete .esmc-cifs-state.json and re-initialize"
      }, null, 2));
    }
    process.exit(1);
  }
} else {
  // Initialize new state (should normally be created by db8a0273.js)
  cifsState = {
    version: "1.0.0",
    flags: {},
    current_turn: null,
    session_id: null,
    last_validation_timestamp: null,
    last_validation_turn: null,
    validation_history: []
  };
}

// Ensure flags object exists
if (!cifsState.flags || typeof cifsState.flags !== 'object') {
  cifsState.flags = {};
}

// Ensure validation_history exists
if (!Array.isArray(cifsState.validation_history)) {
  cifsState.validation_history = [];
}

// Set flag to true
const previousValue = cifsState.flags[flagName];
cifsState.flags[flagName] = true;

// Append to validation history
cifsState.validation_history.push({
  flag: flagName,
  action: "set_true",
  previous_value: previousValue !== undefined ? previousValue : null,
  timestamp: new Date().toISOString(),
  turn: cifsState.current_turn
});

// Write updated state
try {
  fs.writeFileSync(cifsPath, JSON.stringify(cifsState, null, 2));
} catch (error) {
  if (!isSilent) {
    console.error(JSON.stringify({
      error: `Failed to write CIFS state: ${error.message}`
    }, null, 2));
  }
  process.exit(1);
}

// Silent success (no output in silent mode)
if (!isSilent) {
  console.log(JSON.stringify({
    success: true,
    flag: flagName,
    value: true,
    timestamp: new Date().toISOString()
  }, null, 2));
}

process.exit(0);
