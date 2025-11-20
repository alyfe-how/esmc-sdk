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
 * CIFS Reset Request CLI (Context-Integrity Flag System)
 * ESMC 3.104.0 - Per-Request Enforcement
 *
 * Purpose: Reset execution flags when new "Use ESMC" request detected
 * Usage: node 381c9125.js --mode=full_deployment --turn=N --request=M [--silent]
 *
 * Architecture:
 * - Reads .esmc-cifs-state.json
 * - Resets execution flags (keeps routing_validated for same turn)
 * - Updates current_request_id and last_esmc_request_id
 * - Appends request_reset to validation_history
 * - Forces fresh PHASE 0-3 execution on every "Use ESMC" request
 *
 * L002 Compliance: Prevents cached execution flags from bypassing per-request protocol
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const isSilent = args.includes('--silent');

// Extract mode
const modeArg = args.find(arg => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : null;

// Extract turn and request numbers
const turnArg = args.find(arg => arg.startsWith('--turn='));
const requestArg = args.find(arg => arg.startsWith('--request='));
const currentTurn = turnArg ? parseInt(turnArg.split('=')[1]) : null;
const requestNumber = requestArg ? parseInt(requestArg.split('=')[1]) : 1;

if (!mode) {
  if (!isSilent) {
    console.error(JSON.stringify({
      error: "ERROR: Mode parameter required",
      usage: "node 381c9125.js --mode=<full_deployment|lightweight> --turn=N --request=M [--silent]"
    }, null, 2));
  }
  process.exit(1);
}

// CIFS state file path
const cifsPath = path.join(process.cwd(), '.esmc-cifs-state.json');

// Read CIFS state
if (!fs.existsSync(cifsPath)) {
  if (!isSilent) {
    console.error(JSON.stringify({
      error: "CIFS state file missing - cannot reset request flags",
      instruction: "Execute: node f1849719.js check A [SUB_TOTAL] [current_turn] first"
    }, null, 2));
  }
  process.exit(1);
}

let cifsState;
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

// Ensure validation_history exists
if (!Array.isArray(cifsState.validation_history)) {
  cifsState.validation_history = [];
}

// Generate request ID
const useTurn = currentTurn || cifsState.current_turn || 1;
const requestId = `req_${useTurn}_${requestNumber}`;

// Only reset if mode = full_deployment
if (mode === 'full_deployment') {
  // Reset execution flags (keep routing_validated for same turn)
  const previousFlags = { ...cifsState.flags };

  cifsState.flags.memory_loaded = false;
  cifsState.flags.mesh_intelligence_executed = false;
  cifsState.flags.pmo_checked = false;
  cifsState.flags.athena_vetting_passed = false;
  cifsState.flags.context_enrichment_applied = false;
  cifsState.flags.domain_filtering_applied = false;
  cifsState.flags.athena_omniscient_executed = false;
  cifsState.flags.dialogue_displayed = false;

  // Keep routing_validated (same turn, different request)
  // routing_validated is turn-scoped, not request-scoped

  // Update request tracking
  cifsState.current_request_id = requestId;
  cifsState.last_esmc_request_id = requestId;

  // Append to validation history
  cifsState.validation_history.push({
    action: 'request_reset',
    request_id: requestId,
    turn: useTurn,
    mode: mode,
    timestamp: new Date().toISOString(),
    reason: 'New "Use ESMC" request detected - reset execution flags for fresh deployment',
    flags_reset: Object.keys(previousFlags).filter(key =>
      key !== 'routing_validated' && previousFlags[key] === true
    )
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

  // Silent success or verbose output
  if (!isSilent) {
    console.log(JSON.stringify({
      success: true,
      action: 'request_reset',
      request_id: requestId,
      mode: mode,
      flags_reset: cifsState.validation_history[cifsState.validation_history.length - 1].flags_reset,
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  process.exit(0);
} else {
  // Lightweight mode - no reset needed
  if (!isSilent) {
    console.log(JSON.stringify({
      success: true,
      action: 'skip_reset',
      mode: mode,
      reason: 'Lightweight mode does not require per-request reset'
    }, null, 2));
  }
  process.exit(0);
}
