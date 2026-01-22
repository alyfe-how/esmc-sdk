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
 * ESMC 3.79.0 - Mesh Fusion CLI (Phase 2A Technical Validator)
 *
 * Purpose: CLI wrapper for mesh-fusion-engine.js
 * Role: Technical feasibility gate in sequential decision flow
 *
 * Usage:
 *   node bb04c9a1.js synthesize --piu <json> --dki <json> --uip <json> --pca <json> [--silent]
 *
 * Input: 4 mesh component JSON outputs (PIU, DKI, UIP, PCA)
 * Output: {feasible: boolean, score: 0-100, gaps: [], synthesis: {...}}
 *
 * Silent Mode (--silent):
 * - Minimal JSON output (no headers, no formatting)
 * - Token cost: ~100 tokens
 *
 * Verbose Mode (default):
 * - Formatted output with visual score bar
 * - Token cost: ~150 tokens
 *
 * @version 3.79.0
 * @date 2025-11-08
 */

const fs = require('fs');
const path = require('path');

// Load mesh-fusion-engine module
const MeshFusionEngine = require('../mesh-fusion-engine.js');

/**
 * Parse command-line arguments
 * @returns {Object} Parsed config
 */
function parseArgs() {
  const args = process.argv.slice(2);
  // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
  const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');

  const config = {
    command: args[0], // 'synthesize'
    piu: null,
    dki: null,
    uip: null,
    pca: null,
    silent: !verbose  // Default silent unless verbose explicitly requested
  };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--piu' && args[i + 1]) {
      config.piu = JSON.parse(args[i + 1]);
      i++;
    } else if (args[i] === '--dki' && args[i + 1]) {
      config.dki = JSON.parse(args[i + 1]);
      i++;
    } else if (args[i] === '--uip' && args[i + 1]) {
      config.uip = JSON.parse(args[i + 1]);
      i++;
    } else if (args[i] === '--pca' && args[i + 1]) {
      config.pca = JSON.parse(args[i + 1]);
      i++;
    } else if (args[i] === '--silent' || args[i] === '-s' || args[i] === '--verbose' || args[i] === '-v') {
      // 🆕 ESMC 3.101.0: Silent/verbose flags handled at top of parseArgs (skip here)
      continue;
    }
  }

  return config;
}

/**
 * Main execution
 */
function main() {
  const config = parseArgs();

  // 🆕 ESMC 3.101.0: Silent mode now handled in parseArgs() via ESMC_VERBOSE check

  if (config.command !== 'synthesize') {
    console.error('Usage: bb04c9a1.js synthesize --piu <json> --dki <json> --uip <json> --pca <json> [--silent]');
    process.exit(1);
  }

  // Validate all 4 components present
  if (!config.piu || !config.dki || !config.uip || !config.pca) {
    console.error('Error: All 4 mesh components required (--piu, --dki, --uip, --pca)');
    process.exit(1);
  }

  // Initialize engine
  const engine = new MeshFusionEngine();

  // Synthesize
  const result = engine.synthesize({
    piu: config.piu,
    dki: config.dki,
    uip: config.uip,
    pca: config.pca
  });

  // Output
  if (config.silent) {
    // Silent mode: Minimal JSON (BRAIN PHASE 2A consumption)
    const minimalOutput = {
      feasible: result.feasible,
      score: result.score,
      gaps: result.gaps.map(gap => ({
        type: gap.type,
        severity: gap.severity,
        details: gap.details,
        suggestion: gap.suggestion
      })),
      synthesis: {
        intent_project: result.synthesis.intent_project_alignment,
        preferences_codebase: result.synthesis.preferences_codebase_alignment,
        standards_project: result.synthesis.standards_project_alignment,
        overall: result.synthesis.overall_technical_feasibility
      }
    };

    console.log(JSON.stringify(minimalOutput, null, 2));
  } else {
    // Verbose mode: Formatted output with visual indicators
    console.log('\n🕸️ MESH FUSION ENGINE (Phase 2A - Technical Validator)');
    console.log('═'.repeat(60));

    // Feasibility verdict
    const verdictIcon = result.feasible ? '✅' : '❌';
    console.log(`\n${verdictIcon} Feasibility: ${result.feasible ? 'PASS' : 'FAIL'}`);
    console.log(`📊 Technical Score: ${result.score}/100`);

    // Visual score bar
    const barLength = 40;
    const filledLength = Math.round((result.score / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    console.log(`   [${bar}] ${result.score}%`);

    // Alignment details
    console.log('\n📐 Alignment Analysis:');
    console.log(`   Intent ↔ Project:       ${(result.synthesis.intent_project_alignment * 100).toFixed(0)}%`);
    console.log(`   Preferences ↔ Codebase: ${(result.synthesis.preferences_codebase_alignment * 100).toFixed(0)}%`);
    console.log(`   Standards ↔ Project:    ${(result.synthesis.standards_project_alignment * 100).toFixed(0)}%`);
    console.log(`   Intent ↔ Domain:        ${(result.synthesis.intent_domain_alignment * 100).toFixed(0)}%`);
    console.log(`   Intent ↔ User:          ${(result.synthesis.intent_user_alignment * 100).toFixed(0)}%`);
    console.log(`   Standards ↔ Workflow:   ${(result.synthesis.standards_workflow_alignment * 100).toFixed(0)}%`);

    // Gaps (if any)
    if (result.gaps.length > 0) {
      console.log(`\n⚠️  Detected Gaps (${result.gaps.length}):`);
      result.gaps.forEach((gap, index) => {
        const severityIcon = gap.severity === 'critical' ? '🔴' : gap.severity === 'high' ? '🟠' : '🟡';
        console.log(`\n   ${index + 1}. ${severityIcon} ${gap.type.toUpperCase().replace(/_/g, ' ')}`);
        console.log(`      Severity: ${gap.severity}`);
        console.log(`      Details: ${gap.details}`);
        console.log(`      Suggestion: ${gap.suggestion}`);
      });
    } else {
      console.log('\n✅ No gaps detected');
    }

    // Next step recommendation
    console.log('\n🚦 Next Step:');
    if (result.feasible) {
      console.log('   → Proceed to PHASE 2B (Logical Gating)');
    } else {
      console.log('   → HALT - Address gaps before proceeding');
      console.log('   → Skip PHASE 2B/2C (technical infeasibility detected)');
    }

    console.log('\n' + '═'.repeat(60));
  }
}

// Execute
main();
