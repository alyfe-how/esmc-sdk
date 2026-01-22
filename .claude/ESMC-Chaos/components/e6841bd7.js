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
 * ESMC 3.82.0 - BRAIN GUIDE CLI (Documentation Lazy-Loader)
 *
 * Purpose: Serve BRAIN documentation on-demand (CLI-wrapped documentation)
 * Token Cost: ~300-500 tokens per query (vs 850 tokens for full documentation read)
 * ROI: 41-65% token savings per documentation access
 *
 * Usage:
 *   node e6841bd7.js show token-budgets
 *   node e6841bd7.js show philosophy
 *   node e6841bd7.js show examples <phase>
 *   node e6841bd7.js show all
 *
 * Architecture:
 *   - Extracted documentation from BRAIN.md (token budgets, philosophy, "What this does" explanations)
 *   - Returns JSON documentation on-demand (lazy-loading pattern)
 *   - Enables surgical documentation access without reading full BRAIN.md
 *
 * ESMC 3.82 Commitment:
 *   "e6841bd7.js serves documentation as executable logic,
 *    returns JSON-formatted guides instead of full manifest read."
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// Documentation Definitions
// ═══════════════════════════════════════════════════════════

const BRAIN_DOCUMENTATION = {
  version: '3.82.0',
  source: 'BRAIN.md dissection (ESMC 3.82 - Phase 2 roadmap)',

  // Token Budgets (Extracted from BRAIN.md)
  token_budgets: {
    phase_0: {
      memory_bundle: '~500 tokens (1 CLI call with 4 files + T1 search)',
      cup_signal: '<50 tokens (subprocess execution, no context load)',
      pmo: '0-500 tokens (cache hit = 0, cache miss/generation = 500)',
      athena_vetting: '~200 tokens (CLI execution + vetting result read)',
      total: '~750-1,250 tokens'
    },
    phase_1: {
      mesh_intelligence: '~550 tokens (5 mesh components - parallel execution)',
      piu: '~100 tokens (vs 8,546 direct read) = 99% savings',
      dki: '~100 tokens (vs 9,296 direct read) = 99% savings',
      uip: '~100 tokens (vs 8,680 direct read) = 99% savings',
      pca: '~100 tokens (vs 13,074 direct read) = 99% savings',
      reason: '~150 tokens (vs 33,000 direct read) = 99.5% savings',
      total: '~550 tokens'
    },
    phase_2: {
      mesh_fusion: '~100 tokens (silent mode)',
      esmc_reason_gating: '~150 tokens (silent mode)',
      echelon_decision: '~100 tokens (silent mode)',
      total: '~350 tokens'
    },
    phase_2_5: {
      context_enrichment: '~150 tokens (0.075% of 200K budget)'
    },
    overall: {
      brain_core_read: '~1,735 tokens (b4fe7dcb.md)',
      operational_total: '~1,400-1,900 tokens (PHASE 2 sequential gating = +250 tokens vs 3.78)',
      cascade_40_turn: '~11,880 tokens (5.94% of 200K budget)',
      note: 'Could run 1,583 turns before overflow'
    },
    savings_history: {
      esmc_3_76: '~5,500 tokens (Enhanced working-memory.json)',
      esmc_3_75: '~170 tokens (Silent mode - suppressed logs)',
      esmc_3_68_1: '~9,000 tokens avg (Selective memory loading - 68% reduction)',
      total_phase_0: '~14,670 tokens saved per session (7.3% of context)'
    }
  },

  // Philosophy Statements (Extracted from BRAIN.md)
  philosophy: {
    phase_0: {
      silent_mode: 'PHASE 0 intelligence runs silently. Only ECHELON-ATHENA dialogue is visible to General.',
      memory_execution: 'Memory loaded → Memory USED (execution, not just capability)',
      pmo_constitution: 'PMO is project constitution - initialized once, used throughout lifecycle',
      vetting_activation: 'Vetting infrastructure without execution = worthless. PHASE 0.7 activates existing capability.'
    },
    phase_2: {
      sequential_gating: 'Sequential gates preserve diagnostic clarity vs multiplicative confidence (technical × logical loses granularity)',
      domain_filtering: 'ECHELON thinks TECHNICAL-FIRST but references logical context for WHY decisions',
      prevention_architecture: 'Prevention (accurate context) > Cure (redesign loops). Domain filtering ensures ECHELON proposes with FULL intelligence, not partial view.'
    },
    overall: {
      architecture: 'ESMC 3.62 uses PRE-BRAIN/POST-BRAIN architecture: Memory depth differentiation, not intelligence capability',
      tier_philosophy: 'Intelligence mesh (PIU/DKI/UIP/PCA/REASON) available to ALL tiers (FREE+) for professional-grade intelligence'
    }
  },

  // "What This Does" Explanations (Extracted from BRAIN.md)
  explanations: {
    phase_0: {
      memory_bundle: {
        title: 'Memory Bundle Selective Loading (ESMC 3.68.1)',
        description: 'Loads memory with 65% keyword threshold filtering',
        steps: [
          'Loads .esmc-lessons.json (T0 - Frustration prevention)',
          'Loads .memory-recent.json metadata only (lightweight index)',
          'Performs keyword scoring on ALL 10+5 sessions (metadata)',
          'FILTERS: Only sessions with score >= 65% are loaded',
          'READS: Full session files ONLY for matched sessions (selective file I/O)',
          'Loads .project-brief.json (PCA L0 - Project context)',
          'Loads .user-profile-lite.json (CUP L0 - User adaptation)',
          'Returns consolidated JSON bundle with selective sessions'
        ]
      },
      pmo: {
        title: 'PMO Auto-Init + Caching (ESMC 3.71.0)',
        description: 'Project Modus Operandi initialization with 1-hour TTL',
        steps: [
          'If PMO exists: Load from cache (0 tokens if within 1-hour TTL, 500 tokens if expired)',
          'If PMO missing + auto-init triggered: Generate PMO via ECHELON cherry-picking (500 tokens)',
          'If PMO missing + query request: Skip (no PMO for queries)'
        ],
        cache_details: {
          ttl: '1 hour (3,600,000ms)',
          singleton: 'Single instance across all colonels + ATHENA',
          token_savings: '85.7% within session (3,500 → 500 tokens)',
          vs_full_registry: '97.6% savings (20,501 → 500 tokens)'
        }
      },
      athena_vetting: {
        title: 'ATHENA Vetting Execution (ESMC 3.80.0 - L002 Compliance)',
        description: 'Proactive error detection before ECHELON dialogue',
        components: [
          'Loads epsilon-athena-coordinator.js (initializes PHC components)',
          'PHC (Proactive Halt Checkpoint) aggregates 4 error detection components:',
          '  1. AESD (Error Signature Detector): Finds similar failed approaches (>70% similarity)',
          '  2. IC (Iteration Counter): Detects repetitive debugging (warning at 3rd attempt, critical at 5th)',
          '  3. CSPM (Cross-Session Problem Matcher): Finds precedents that solved current problem',
          '  4. UID (User Intervention Detector): Tracks correction patterns (>3 interventions = systematic issue)',
          'Aggregates verdicts → {shouldHalt: boolean, severity, recommendations}',
          'Writes result to .esmc-athena-vetting-result.json'
        ],
        l002_compliance: {
          pattern: 'Vetting infrastructure without execution = worthless',
          activation: 'PHASE 0.7 activates existing capability (ESMC 3.68 code)',
          evidence: 'Numbered steps (STEP 1-5), checkpoint enforcement, file output'
        }
      }
    },
    phase_1: {
      mesh_fusion: {
        title: '5-Component Mesh Intelligence (ESMC 3.78)',
        description: 'Parallel execution of PIU/DKI/UIP/PCA/REASON',
        performance: {
          sequential: '500ms (PIU) + 500ms (DKI) + 500ms (UIP) + 500ms (PCA) + 300ms (REASON) = 2,300ms',
          parallel: 'max(500ms, 500ms, 500ms, 500ms, 300ms) = 500ms (REASON finishes first!)',
          savings: '78.3% faster (2,300ms → 500ms)'
        },
        components: {
          PIU: 'Intent Understanding (NORTH) - Universal PM patterns + Project topic history',
          DKI: 'Domain Knowledge (WEST) - Universal standards (OWASP, design patterns) + Project patterns',
          UIP: 'User Workflow Prediction (EAST) - Universal UX/TDD practices + Project workflow',
          PCA: 'Project Context (SOUTH) - Universal + Project memory context',
          REASON: '5W1H Meta-Reasoning (CENTER) - Shared reasoning substrate for ATHENA + ECHELON'
        }
      }
    },
    phase_2: {
      mesh_fusion_gate: {
        title: 'PHASE 2A: Technical Validation Gate (Mesh Fusion Engine)',
        description: 'Cross-component technical feasibility validation',
        validations: [
          'PIU ↔ DKI: Intent vs Domain standards',
          'PIU ↔ UIP: Intent vs User preferences',
          'PIU ↔ PCA: Intent vs Project feasibility',
          'DKI ↔ UIP: Standards vs Workflow',
          'DKI ↔ PCA: Standards vs Project constraints',
          'UIP ↔ PCA: Preferences vs Codebase reality'
        ],
        gap_detection: [
          'missing_prerequisite',
          'standard_conflict',
          'intent_ambiguity',
          'resource_constraint',
          'technical_impossibility'
        ],
        output: '{feasible: boolean, score: 0-100, gaps: [], synthesis: {...}}',
        halt_condition: 'If feasible = false → HALT, display gap report, suggest prerequisites'
      },
      esmc_reason_gate: {
        title: 'PHASE 2B: Logical Purpose Gate (ESMC-REASON Gating)',
        description: 'Full 5W1H logical validation (all 6 scopes)',
        validations: {
          WHERE: '20% - Deployment environment, threat model checking (local vs network)',
          WHY: '20% - Purpose clarity, stakeholder needs, business value',
          WHEN: '15% - Urgency vs priority alignment (gap > 0.3 = timing mismatch)',
          WHAT: '15% - Scope reasonableness, deliverable clarity, scope creep detection',
          HOW: '15% - Implementation approach, complexity vs resources, pattern reuse',
          WHO: '15% - Stakeholder alignment, compliance involvement, user vs business needs'
        },
        verdicts: {
          PROCEED: '>70% confidence',
          DEFER: '40-70% confidence (needs clarification)',
          REJECT: '<40% OR critical flaws (context mismatch)'
        },
        example: {
          scenario: 'IFDS taint analysis for local-only SDK',
          result: 'verdict=REJECT, confidence=25 (WHERE: local-only = no network threat surface = IFDS unnecessary)',
          outcome: 'Halt at Phase 2B, explain WHERE mismatch, suggest dependency scanning instead'
        }
      },
      echelon_decision: {
        title: 'PHASE 2C: Final Decision Synthesis (ECHELON Orchestrator)',
        description: 'Composite confidence calculation + deployment approach selection',
        formula: {
          weighted_composite: '(Phase2A_score × 0.4) + (Phase2B_confidence × 0.6)',
          rationale: 'NOT multiplicative - Additive weighting preserves diagnostic granularity',
          priority: 'Logical > Technical (60/40 split) - context outweighs raw capability'
        },
        adjustments: [
          'Urgency > 0.8: +5% (fast-track boost)',
          'Complexity > 0.7: -5% (increased risk penalty)',
          'Priority > 0.7 + confidence > 70: +3% (high-priority validated request)'
        ],
        deployment_approaches: {
          FULL: '≥80% - All 7 colonels, full ceremony',
          LITE: '60-79% - Strategic subset (STRATEGIC, GUARDIAN, PERFORMANCE)',
          MINIMAL: '40-59% - Single colonel tactical (CRAFTSMAN)',
          SKIP: '<40% - Lightweight direct response (no colonel overhead)'
        }
      }
    },
    phase_2_5: {
      context_enrichment: {
        title: 'Response Context Enrichment (Proactive Intelligence)',
        description: 'Apply loaded context to responses - NO EXCEPTIONS',
        patterns: {
          reference_past_work: 'I see from Rank [X] ([session_id]) you [previous_work]...',
          predict_based_on_history: 'Your past [workflow] shows [pattern] - applying that here...',
          avoid_redundancy: 'Since [completed_work_from_T1], let\'s focus on [new_items_only]...'
        },
        philosophy: 'Memory loaded → Memory USED (execution, not just capability)'
      }
    },
    phase_2_6: {
      domain_filtering: {
        title: 'ECHELON Domain-Filtered Proposal (ESMC 3.80.0 - Prevention Architecture)',
        description: 'Domain filtering for ECHELON proposal generation',
        weighting: {
          technical: '0.8 weight - TECHNICAL_FIRST thinking mode',
          logical: '0.2 weight - CONTEXT_AWARE rationale'
        },
        technical_sources: [
          'PIU: Intent understanding (goals, stakeholders, success criteria)',
          'DKI: Domain knowledge (patterns, standards, best practices)',
          'UIP: Workflow prediction (historical patterns, next steps)',
          'PCA: Project context (session patterns, files, precedents)',
          'Phase 2A: Technical feasibility validation (gaps, synthesis)'
        ],
        logical_sources: [
          'REASON: 5W1H reasoning (urgency, priority, complexity)',
          'Phase 2B: WHERE/WHEN/WHY validation (logical appropriateness)',
          'PMO: Cherry-picked standards (WHY these patterns selected)'
        ],
        proposal_format: {
          technical_approach: '80% - "Implement X using pattern Y from precedent Z"',
          logical_rationale: '20% - "Selected because WHERE=local deployment, WHY=user auth need, PMO standard #3 (security-first)"'
        },
        prevention_strategy: [
          '✅ Context accuracy: Full mesh + REASON loaded',
          '✅ Pattern familiarity: DKI patterns + PCA precedents + PMO standards',
          '✅ Confidence: Phase 2A+2B+2C validation (technical + logical + composite)',
          '✅ Zero iteration: Get it right FIRST time via comprehensive context'
        ]
      }
    }
  },

  // Execution Summary
  execution_flow: {
    title: 'BRAIN-CORE Execution Flow (ESMC 3.82)',
    phases: [
      'PHASE 0: Memory Bundle CLI (lessons + recent + brief + profile + ATLAS T1) → Log results',
      'PHASE 0.5: CUP Signal Extraction (silent - continuous profiling)',
      'PHASE 0.6: PMO Auto-Init + Caching → Conditional (task-oriented only)',
      'PHASE 0.7: ATHENA Vetting Execution (L002 Compliance - error detection)',
      'PHASE 1: PIU + DKI + UIP + PCA + REASON → 5-component parallel mesh',
      'PHASE 1.5: CIE (MAX/VIP only) → Proactive intelligence (inferred needs + gaps + preferences)',
      'PHASE 2: Sequential Decision Gating → Technical (2A) → Logical (2B) → Decision (2C)',
      '  - 2A: bb04c9a1.js (technical feasibility) → feasible check',
      '  - 2B: 854dea21.js gate (WHERE/WHEN/WHY validation) → PROCEED/DEFER/REJECT',
      '  - 2C: b61e87e5.js (composite confidence) → FULL/LITE/MINIMAL/SKIP',
      'PHASE 2.5: Response Context Enrichment (proactive context application)',
      'PHASE 2.6: ECHELON Domain-Filtered Proposal (0.8 technical + 0.2 logical)',
      'PHASE 3: Execute (approach-based deployment + mission signature)'
    ]
  },

  // Innovation Timeline
  innovations: {
    'ESMC 3.82.0': 'BRAIN Dissection - Execution vs Documentation Split (3,037 tokens/session savings)',
    'ESMC 3.80.1': 'Threshold gating (tech>=85% for execution) + Context mismatch generalization',
    'ESMC 3.80.0': 'Prevention architecture - Domain filtering (0.8/0.2) + Redesign loop disabled',
    'ESMC 3.79.0': 'Sequential gating preserves diagnostic clarity + Halt conditions',
    'ESMC 3.78.0': '5-component parallel mesh (PIU/DKI/UIP/PCA/REASON) - Zero additional latency',
    'ESMC 3.77.0': 'All 5 mesh CLI tools support --silent flag',
    'ESMC 3.76.0': 'Enhanced working-memory.json (~5,500 token savings)',
    'ESMC 3.75.0': 'Silent Infrastructure Mode (Orchestrator-Only Visibility)',
    'ESMC 3.74.0': 'Counter Check (Context Integrity)',
    'ESMC 3.71.0': 'PMO Auto-Init + 1-Hour TTL Caching (97.6% savings)',
    'ESMC 3.68.1': 'Selective Loading with 65% Threshold',
    'ESMC 3.68.0': 'ATHENA Vetting Execution (PHC/AESD/IC/CSPM/UID activated)',
    'ESMC 3.62.0': 'PRE-BRAIN/POST-BRAIN architecture (tier differentiation = memory depth)',
    'ESMC 3.58.0': 'Passive Signal Extraction (continuous profiling)'
  }
};

// ═══════════════════════════════════════════════════════════
// CLI Commands
// ═══════════════════════════════════════════════════════════

function showTokenBudgets() {
  return {
    section: 'token_budgets',
    data: BRAIN_DOCUMENTATION.token_budgets,
    token_cost: '~300 tokens (this output)'
  };
}

function showPhilosophy() {
  return {
    section: 'philosophy',
    data: BRAIN_DOCUMENTATION.philosophy,
    token_cost: '~200 tokens (this output)'
  };
}

function showExplanations(phase = 'all') {
  if (phase === 'all') {
    return {
      section: 'explanations',
      data: BRAIN_DOCUMENTATION.explanations,
      token_cost: '~850 tokens (all explanations - full documentation read equivalent)'
    };
  }

  const phaseKey = `phase_${phase}`;
  if (BRAIN_DOCUMENTATION.explanations[phaseKey]) {
    return {
      section: `explanations.${phaseKey}`,
      data: BRAIN_DOCUMENTATION.explanations[phaseKey],
      token_cost: `~150-250 tokens (${phaseKey} explanations only)`
    };
  }

  return {
    error: `Phase ${phase} not found`,
    available_phases: Object.keys(BRAIN_DOCUMENTATION.explanations)
  };
}

function showExecutionFlow() {
  return {
    section: 'execution_flow',
    data: BRAIN_DOCUMENTATION.execution_flow,
    token_cost: '~150 tokens (this output)'
  };
}

function showInnovations() {
  return {
    section: 'innovations',
    data: BRAIN_DOCUMENTATION.innovations,
    token_cost: '~200 tokens (this output)'
  };
}

function showAll() {
  return {
    section: 'all',
    data: BRAIN_DOCUMENTATION,
    token_cost: '~850 tokens (full documentation read equivalent)',
    warning: 'Consider using specific sections (token-budgets, philosophy, etc.) for efficiency'
  };
}

// ═══════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);
    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;

    // Silent mode: suppress all console output
    let originalConsoleLog, originalConsoleError, originalConsoleInfo, originalConsoleWarn;
    if (silent) {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        originalConsoleInfo = console.info;
        originalConsoleWarn = console.warn;

        console.log = () => {};
        console.error = () => {};
        console.info = () => {};
        console.warn = () => {};
    }

  const command = args[0];
  const subcommand = args[1];

  if (command !== 'show') {
    console.error(JSON.stringify({
      error: 'Invalid command',
      usage: 'node e6841bd7.js show <section>',
      available_sections: ['token-budgets', 'philosophy', 'examples', 'execution-flow', 'innovations', 'all']
    }, null, 2));
    process.exit(1);
  }

  let result;

  switch (subcommand) {
    case 'token-budgets':
      result = showTokenBudgets();
      break;
    case 'philosophy':
      result = showPhilosophy();
      break;
    case 'examples':
      const phase = args[2] || 'all';
      result = showExplanations(phase);
      break;
    case 'execution-flow':
      result = showExecutionFlow();
      break;
    case 'innovations':
      result = showInnovations();
      break;
    case 'all':
      result = showAll();
      break;
    default:
      result = {
        error: 'Unknown section',
        requested: subcommand,
        available_sections: ['token-budgets', 'philosophy', 'examples', 'execution-flow', 'innovations', 'all']
      };
  }

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  showTokenBudgets,
  showPhilosophy,
  showExplanations,
  showExecutionFlow,
  showInnovations,
  showAll,
  BRAIN_DOCUMENTATION
};
