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
/** ESMC 3.13 EPSILON-ATHENA COORDINATOR | 2025-10-14 | v3.13.0 | PROD | ALL_TIERS(PRO+:Strategic)
 *  Purpose: Partnership orchestration "The Marriage" - EPSILON (tech) + ATHENA (wisdom) synthesis
 *  Features: MESH→EPSILON→ATHENA→Refined plan | ATLAS 3-tier memory | Spatial awareness | Tier-based capabilities (FREE:dialogue | PRO:Five Whys | MAX:creative synthesis)
 *  Philosophy: "Technical brilliance + strategic wisdom = complete"
 */

// 🎖️ ESMC 3.67.2: ATHENA Submodule Loading (CLI Subprocess Optimization)
// Strategy: ATHENA coordinator called via 378d473d.js subprocess
// These submodule requires happen in subprocess context (out of main conversation)
const AthenaDialoguePartner = require('./0b226c54.js'); // 13.8KB
const AthenaStrategicQuestioner = require('./94ab9364.js'); // 17.2KB
const AthenaCreativeSynthesizer = require('./1122a694.js'); // 22.2KB

// 🆕 ESMC 3.68: ATHENA Error Detection Components (Pre-Presentation Review Enhancement)
// Architecture: CLI subprocess components - zero main context overhead
// Purpose: Prevent repetitive debugging via cross-session error pattern recognition
const AthenaErrorSignatureDetector = require('./c3b41feb.js'); // 4.2KB - AESD
const AthenaIterationCounter = require('./22eb3d4f.js'); // 2.3KB - IC
const AthenaCrossSessionMatcher = require('./588c119f.js'); // 5.1KB - CSPM
const AthenaUserInterventionDetector = require('./bee6a653.js'); // 2.4KB - UID
const AthenaProactiveHaltCheckpoint = require('./9b162e37.js'); // 3.2KB - PHC

// ESMC 3.93.1: Using tier-gate CLI wrapper for token optimization (700 tokens → 100 tokens)
const { execSync } = require('child_process');
const AtlasRetrievalSystem = require('./8cacf104.js'); // ATLAS 3.13: Memory + Structural awareness (78KB - uses 673f584d.js)
// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)
const fs = require('fs');
const path = require('path');

class EpsilonAthenaCoordinator {
  constructor() {
    this.version = '3.69.1'; // 🆕 ESMC 3.69.1: MySQL graceful degradation fix
    this.dialogue = null;
    this.strategic = null;
    this.creative = null;
    this.currentTier = null; // Tier from esmc-tier-gate (standalone auth)
    this.db = null;
    this.infinityConfig = null; // Cached infinity mode configuration
    this.atlas = null; // ATLAS 3.13: Memory + Structural awareness

    // 🆕 ESMC 3.68: Error Detection Components (ALL TIERS - prevention is universal)
    this.aesd = null; // Error Signature Detector
    this.ic = null; // Iteration Counter
    this.cspm = null; // Cross-Session Problem Matcher
    this.uid = null; // User Intervention Detector
    this.phc = null; // Proactive Halt Checkpoint
  }

  /**
   * Load Infinity Mode configuration from manifest
   * ESMC 3.99.1: Infinity Mode disabled - return defaults silently (no error spam)
   * @returns {Object} Infinity mode config (enabled, threshold, max_rounds)
   */
  loadInfinityConfig() {
    // Return cached config if available
    if (this.infinityConfig !== null) {
      return this.infinityConfig;
    }

    // ESMC 3.99.1: Infinity Mode disabled - skip manifest loading (feature deprecated)
    // Return defaults silently (no error logs)
    this.infinityConfig = {
      enabled: false,
      status: 'disabled',
      consensus_threshold: 0.70,
      max_dialogue_rounds: 5
    };
    return this.infinityConfig;

    // Original code commented out (Infinity Mode deprecated - dynamic manifest hot-swapping removed)
    /*
    try {
      const manifestPath = path.join(__dirname, '.esmc-manifest-3f8a2b9c.md');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');

      // Extract infinity_mode JSON block from manifest
      const infinityMatch = manifestContent.match(/```json\s*\n\s*\{[\s\S]*?"infinity_mode":[\s\S]*?\}\s*\n\}\s*\n```/m);

      if (!infinityMatch) {
        console.warn('⚠️ Infinity Mode config not found in manifest. Using defaults.');
        this.infinityConfig = {
          enabled: false,
          status: 'infinity-ready',
          consensus_threshold: 0.70,
          max_dialogue_rounds: 5
        };
        return this.infinityConfig;
      }

      // Parse the JSON block
      const jsonBlock = infinityMatch[0].replace(/```json\s*\n/, '').replace(/\n```/, '');
      const parsed = JSON.parse(jsonBlock);
      this.infinityConfig = parsed.infinity_mode;

      console.log(`🔄 Infinity Mode: ${this.infinityConfig.enabled ? 'ENABLED' : 'DISABLED'} (threshold: ${this.infinityConfig.consensus_threshold})`);
      return this.infinityConfig;
    } catch (error) {
      console.error('❌ Failed to load Infinity Mode config:', error.message);
      // Default config on error
      this.infinityConfig = {
        enabled: false,
        status: 'infinity-ready',
        consensus_threshold: 0.70,
        max_dialogue_rounds: 5
      };
      return this.infinityConfig;
    }
    */
  }

  /**
   * Initialize coordinator and all ATHENA modules
   */
  async initialize() {
    try {
      // Load Infinity Mode configuration
      this.loadInfinityConfig();

      // ESMC 3.93.1: Get tier via CLI wrapper (token-optimized: 700→100 tokens)
      const tierCliPath = path.join(__dirname, 'cli', '670a08df.js');
      const tierOutput = execSync(`node "${tierCliPath}" get-tier`, { encoding: 'utf8' });
      // Extract tier from output (last line, ignoring log messages)
      const tierLines = tierOutput.trim().split('\n');
      this.currentTier = tierLines[tierLines.length - 1].trim();

      // 🆕 ESMC 3.26: Initialize ALL ATHENA modules (tier-agnostic)
      // Tier gating moved to ECHELON - decides which components to CALL, not which to initialize
      this.dialogue = new AthenaDialoguePartner();
      await this.dialogue.initialize();

      this.strategic = new AthenaStrategicQuestioner();
      await this.strategic.initialize();

      this.creative = new AthenaCreativeSynthesizer();
      await this.creative.initialize();

      // ESMC 3.26: ORACLE Integration (always initialize, ECHELON decides when to use)
      // ESMC 3.67.2: Oracle lazy-loaded (13.4KB), runs in subprocess context
      try {
        const ATHENAOracleEnforcer = require('./fa44658b.js');
        this.oracle = new ATHENAOracleEnforcer();
        const oracleInit = this.oracle.initialize();
        if (oracleInit.success) {
          console.log('📊 ORACLE Standards Enforcement: ACTIVE');
        }
      } catch (oracleError) {
        console.warn('⚠️  ORACLE unavailable (graceful fallback):', oracleError.message);
        this.oracle = null;
      }

      // 🆕 ESMC 3.68: Initialize Error Detection Components (ALL TIERS - prevention is universal)
      this.aesd = new AthenaErrorSignatureDetector();
      await this.aesd.initialize();

      this.ic = new AthenaIterationCounter();
      await this.ic.initialize();

      this.cspm = new AthenaCrossSessionMatcher();
      await this.cspm.initialize();

      this.uid = new AthenaUserInterventionDetector();
      await this.uid.initialize();

      // PHC requires other components as dependencies
      this.phc = new AthenaProactiveHaltCheckpoint();
      await this.phc.initialize({
        aesd: this.aesd,
        ic: this.ic,
        cspm: this.cspm,
        uid: this.uid
      });

      console.log('🛡️ ATHENA Error Detection: ACTIVE (AESD, IC, CSPM, UID, PHC)');

      // Initialize ATLAS 3.13: Memory + Structural awareness (ALL TIERS)
      this.atlas = new AtlasRetrievalSystem();
      await this.atlas.loadProjectIndex(); // Load project structure index

      // 🆕 ESMC 3.99.1: MySQL Battlefield Dashboard (OPTIONAL - non-blocking graceful degradation)
      // Skip MySQL connection if ESMC_SILENT=true (CLI mode) - AEGIS file-based supremacy
      if (process.env.ESMC_SILENT === 'true') {
        this.db = null; // CLI mode: Skip MySQL, use ATLAS/AEGIS file-based retrieval
      } else {
        // Production mode: Attempt MySQL connection (optional)
        try {
          // 🆕 ESMC 4.1: Dynamic require for SDK compatibility
          const mysql = require('mysql2/promise');
          this.db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.DB_PASSWORD || '',
            database: 'battlefield_intelligence'
          });
          console.log('📊 Battlefield Dashboard: CONNECTED');
        } catch (dbError) {
          console.warn('⚠️  Battlefield Dashboard unavailable (graceful fallback):', dbError.message);
          this.db = null; // Graceful degradation - core functionality unaffected
        }
      }

      console.log(`🎖️ EPSILON-ATHENA COORDINATOR - Initialized (v3.69.1) [${this.currentTier}]`);
      return {
        success: true,
        version: this.version,
        tier: this.currentTier,
        modules: {
          dialogue: true,
          strategic: this.strategic !== null,
          creative: this.creative !== null,
          atlas_structural_awareness: true,
          error_detection: {
            aesd: this.aesd !== null,
            ic: this.ic !== null,
            cspm: this.cspm !== null,
            uid: this.uid !== null,
            phc: this.phc !== null
          }
        }
      };
    } catch (error) {
      console.error('❌ EPSILON-ATHENA coordinator initialization failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * CORE FUNCTION: EPSILON-ATHENA Partnership Flow
   *
   * @param {Object} meshIntelligence - Output from ECHELON MESH (PIU, DKI, UIP, PCA)
   * @param {Object} epsilonPlan - EPSILON's initial technical plan
   * @param {Object} context - Mission context (user message, complexity, etc)
   * @returns {Object} Refined plan after ATHENA's strategic input
   */
  async coordinatePartnership(meshIntelligence, epsilonPlan, context) {
    try {
      // Load Infinity Mode configuration
      const infinityConfig = this.loadInfinityConfig();

      // BEHAVIORAL SWITCHING: Route to appropriate mode
      if (infinityConfig.enabled && context.complexity_score > 70) {
        console.log('🔄 INFINITY MODE ACTIVATED - Recursive dialogue enabled\n');
        return await this.infinityModePartnership(meshIntelligence, epsilonPlan, context, infinityConfig);
      } else {
        // DEFAULT MODE: Standard single-pass dialogue
        return await this.standardModePartnership(meshIntelligence, epsilonPlan, context);
      }
    } catch (error) {
      console.error('❌ EPSILON-ATHENA partnership coordination failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * STANDARD MODE: Original single-pass EPSILON-ATHENA dialogue
   * (Current behavior preserved as default)
   */
  async standardModePartnership(meshIntelligence, epsilonPlan, context) {
    const partnership = {
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      session_id: context.session_id,
      tier: this.currentTier,
      mode: 'standard',
      epsilon_initial_confidence: epsilonPlan.confidence || 0.85,
      mesh_intelligence: meshIntelligence,
      epsilon_plan: epsilonPlan,
      athena_dialogue: null,
      athena_strategic_analysis: null,
      athena_creative_synthesis: null,
      epsilon_final_confidence: null,
      refined_plan: null,
      partnership_metrics: {}
    };

    console.log('\n🎖️ EPSILON-ATHENA PARTNERSHIP - Standard Mode Engagement...\n');

    // ============================================================================
    // PHASE 0: ATHENA ERROR DETECTION PRE-PRESENTATION REVIEW (ESMC 3.68 - ALL TIERS)
    // ============================================================================
    console.log('🛡️ PHASE 0: ATHENA Error Detection - Pre-Presentation Review...');
    partnership.error_detection = await this.runErrorDetection(epsilonPlan, context);

    // Check if PHC recommends halt
    if (partnership.error_detection.phc_decision?.shouldHalt) {
      console.log('⛔ ATHENA PROACTIVE HALT CHECKPOINT TRIGGERED');
      console.log(`   Severity: ${partnership.error_detection.phc_decision.severity.toUpperCase()}`);
      console.log(`   Reasons: ${partnership.error_detection.phc_decision.reasons.length} indicators detected`);

      // Return halt decision for ECHELON to present to user
      return {
        success: true,
        halt_triggered: true,
        halt_decision: partnership.error_detection.phc_decision,
        recommendations: partnership.error_detection.phc_decision.recommendations,
        precedents: partnership.error_detection.phc_decision.precedents,
        partnership: partnership
      };
    }

    // ============================================================================
    // PHASE 1: ATHENA DIALOGUE (ALL TIERS)
    // ============================================================================
    console.log('💬 PHASE 1: ATHENA Dialogue Partner engaging...');
    partnership.athena_dialogue = await this.dialogue.engage(epsilonPlan, context);

    // Check if ATHENA raised concerns that require deeper analysis
    const questionsRaised = partnership.athena_dialogue.questions_raised?.length || 0;
    const needsStrategicAnalysis = questionsRaised > 2 || context.complexity_score > 60;

    // ============================================================================
    // PHASE 2: ATHENA STRATEGIC ANALYSIS (PRO+)
    // ============================================================================
    if (this.strategic && needsStrategicAnalysis) {
      console.log('🧠 PHASE 2: ATHENA Strategic Questioner analyzing...');
      partnership.athena_strategic_analysis = await this.strategic.analyze(epsilonPlan, context);

      // Check if strategic analysis reveals need for creative solutions
      const highComplexity = context.complexity_score > 80;
      const multipleAlternatives = partnership.athena_strategic_analysis.alternative_approaches?.length > 3;
      const needsCreativity = highComplexity || multipleAlternatives;

      // ============================================================================
      // PHASE 3: ATHENA CREATIVE SYNTHESIS (MAX/VIP)
      // ============================================================================
      if (this.creative && needsCreativity) {
        console.log('🎨 PHASE 3: ATHENA Creative Synthesizer synthesizing...');
        partnership.athena_creative_synthesis = await this.creative.synthesize(
          epsilonPlan,
          partnership.athena_strategic_analysis,
          context
        );
      }
    }

    // ============================================================================
    // PHASE 3.5: ORACLE STANDARDS ENFORCEMENT (MAX/VIP - ESMC 3.25)
    // ============================================================================
    if (this.oracle && this.oracle.isOperational()) {
      console.log('📊 PHASE 3.5: ORACLE Standards Enforcement analyzing...');

      // Extract colonels from context (or use default set)
      const colonels = context.colonels || ['ALPHA', 'DELTA', 'ETA'];

      // Enforce standards
      const oracleResult = this.oracle.enforceCodeStandards({
        task: context.user_message || epsilonPlan.summary,
        code: context.code || '',
        context: meshIntelligence?.PCA?.codebasePatterns || {},
        colonels: colonels
      });

      // Get formatted summary for ATHENA dialogue
      const oracleSummary = this.oracle.getViolationSummary(oracleResult);

      if (oracleSummary) {
        console.log(oracleSummary);
      }

      // Inject ORACLE results into partnership
      partnership.oracle_enforcement = {
        timestamp: new Date().toISOString(),
        status: oracleResult.status,
        violations: oracleResult.violations || [],
        recommendations: oracleResult.recommendations || [],
        selectedStandards: oracleResult.selectedStandards || {},
        summary: oracleSummary
      };

      // If violations detected, append to strategic analysis
      if (oracleResult.violations && oracleResult.violations.length > 0) {
        if (!partnership.athena_strategic_analysis) {
          partnership.athena_strategic_analysis = { concerns: [] };
        }
        partnership.athena_strategic_analysis.oracle_violations = oracleResult.violations;
      }
    }

    // ============================================================================
    // PHASE 4: EPSILON REFINEMENT
    // ============================================================================
    console.log('🔧 PHASE 4: EPSILON refining plan with ATHENA\'s wisdom...');
    partnership.refined_plan = this.refineEpsilonPlan(epsilonPlan, partnership);

    // ============================================================================
    // 🆕 ESMC 3.26 - PHASE 4.5: STRATEGIC APPROACH REVIEW (Optional)
    // ============================================================================
    // Review architectural approach BEFORE code exists
    // Triggers: complexity >= 50 OR strategic_analysis OR colonels >= 5
    if (this.oracle && this.oracle.isOperational()) {
      const phase45Result = this.oracle.reviewStrategicApproach({
        refined_plan: partnership.refined_plan,
        approach: epsilonPlan.approach || '',
        patterns: context.patterns || {},
        complexity: context.complexity_score || 0,
        colonels: context.colonels || []
      });

      // Store Phase 4.5 result in partnership (for Phase 6.5 escalation logic)
      partnership.phase45_strategic_review = phase45Result;

      // If violations detected, append to ATHENA strategic analysis
      if (!phase45Result.skipped && phase45Result.violations && phase45Result.violations.length > 0) {
        if (!partnership.athena_strategic_analysis) {
          partnership.athena_strategic_analysis = { concerns: [] };
        }
        partnership.athena_strategic_analysis.phase45_violations = phase45Result.violations;

        console.log(`⚠️  PHASE 4.5: ${phase45Result.violations.length} strategic violations detected`);
      }
    }

    // Calculate final confidence and metrics
    partnership.epsilon_final_confidence = this.calculateFinalConfidence(partnership);
    partnership.partnership_metrics = this.calculateMetrics(partnership);

    // Log partnership to MySQL
    await this.logPartnership(partnership);

    console.log('✅ EPSILON-ATHENA PARTNERSHIP - Standard Mode Complete\n');

    return partnership;
  }

  /**
   * INFINITY MODE: Recursive EPSILON-ATHENA dialogue with consensus checking
   * (New behavioral set for both partners)
   */
  async infinityModePartnership(meshIntelligence, epsilonPlan, context, infinityConfig) {
    const partnership = {
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      session_id: context.session_id,
      tier: this.currentTier,
      mode: 'infinity',
      epsilon_initial_confidence: epsilonPlan.confidence || 0.85,
      mesh_intelligence: meshIntelligence,
      epsilon_plan: epsilonPlan,
      dialogue_rounds: [],
      epsilon_final_confidence: null,
      refined_plan: null,
      partnership_metrics: {},
      infinity_metrics: {
        rounds_completed: 0,
        consensus_trajectory: [],
        termination_reason: null
      }
    };

    console.log('\n🔄 INFINITY MODE: EPSILON-ATHENA Recursive Dialogue Initiated\n');
    console.log(`📊 Target Consensus: ${infinityConfig.consensus_threshold * 100}%`);
    console.log(`🔁 Max Rounds: ${infinityConfig.max_dialogue_rounds}\n`);

    // Initialize dialogue state tracking
    const dialogueState = {
      topics_explored: [],
      confidence_history: [partnership.epsilon_initial_confidence],
      memory_references: [],
      pivot_points: []
    };

    let currentPlan = JSON.parse(JSON.stringify(epsilonPlan)); // Deep copy
    let round = 0;
    let consensus = await this.calculateConsensus(currentPlan, context, meshIntelligence);

    console.log(`🎯 Initial Consensus: ${(consensus * 100).toFixed(1)}% (Target: ${infinityConfig.consensus_threshold * 100}%)\n`);

    // RECURSIVE DIALOGUE LOOP
    while (
      round < infinityConfig.max_dialogue_rounds &&
      consensus < infinityConfig.consensus_threshold
    ) {
      round++;
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🔄 INFINITY ROUND ${round}/${infinityConfig.max_dialogue_rounds}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // ATHENA INFINITY MODE: Deeper questioning, pattern matching, intrigue
      console.log('🗣️ ATHENA (Infinity Mode): Engaging with recursive questioning...\n');
      const athenaChallenge = await this.athenaInfinityDialogue(currentPlan, context, dialogueState, round);

      // EPSILON INFINITY MODE: Organic responses, visible pivots
      console.log('\n🎖️ EPSILON (Infinity Mode): Responding and refining strategy...\n');
      const epsilonRefinement = await this.epsilonInfinityRefinement(currentPlan, athenaChallenge, dialogueState);

      // Update plan based on refinement
      currentPlan = epsilonRefinement.refined_plan;

      // Recalculate consensus
      const previousConsensus = consensus;
      consensus = await this.calculateConsensus(currentPlan, context, meshIntelligence);
      const consensusDelta = consensus - previousConsensus;

      // Track dialogue round
      partnership.dialogue_rounds.push({
        round,
        athena_challenge: athenaChallenge,
        epsilon_refinement: epsilonRefinement,
        consensus_before: previousConsensus,
        consensus_after: consensus,
        consensus_delta: consensusDelta
      });

      // Update dialogue state
      dialogueState.confidence_history.push(consensus);
      partnership.infinity_metrics.consensus_trajectory.push({
        round,
        consensus: consensus,
        delta: consensusDelta
      });

      console.log(`\n📊 Round ${round} Results:`);
      console.log(`   Consensus: ${(previousConsensus * 100).toFixed(1)}% → ${(consensus * 100).toFixed(1)}% (Δ ${consensusDelta >= 0 ? '+' : ''}${(consensusDelta * 100).toFixed(1)}%)`);
      console.log(`   Target: ${infinityConfig.consensus_threshold * 100}%`);

      // TERMINATION CHECK: Diminishing returns (<5% improvement)
      if (Math.abs(consensusDelta) < 0.05 && round > 1) {
        console.log('\n⚠️ TERMINATION: Diminishing returns detected (<5% improvement)\n');
        partnership.infinity_metrics.termination_reason = 'diminishing_returns';
        break;
      }

      // TERMINATION CHECK: Consensus threshold reached
      if (consensus >= infinityConfig.consensus_threshold) {
        console.log(`\n✅ CONSENSUS ACHIEVED: ${(consensus * 100).toFixed(1)}% ≥ ${infinityConfig.consensus_threshold * 100}%\n`);
        partnership.infinity_metrics.termination_reason = 'consensus_achieved';
        break;
      }
    }

    // If max rounds reached
    if (round >= infinityConfig.max_dialogue_rounds && consensus < infinityConfig.consensus_threshold) {
      console.log('\n⚠️ TERMINATION: Max dialogue rounds reached\n');
      partnership.infinity_metrics.termination_reason = 'max_rounds_reached';
    }

    // Finalize partnership
    partnership.refined_plan = currentPlan;
    partnership.epsilon_final_confidence = consensus;
    partnership.infinity_metrics.rounds_completed = round;
    partnership.partnership_metrics = this.calculateInfinityMetrics(partnership);

    // Log partnership to MySQL
    await this.logPartnership(partnership);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ INFINITY MODE: Partnership Complete');
    console.log(`   Rounds: ${round}/${infinityConfig.max_dialogue_rounds}`);
    console.log(`   Final Consensus: ${(consensus * 100).toFixed(1)}%`);
    console.log(`   Termination: ${partnership.infinity_metrics.termination_reason}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return partnership;
  }

  /**
   * Refine EPSILON's plan based on ATHENA's input
   */
  refineEpsilonPlan(originalPlan, partnership) {
    const refinedPlan = JSON.parse(JSON.stringify(originalPlan)); // Deep copy

    // Apply dialogue refinements (ALL TIERS)
    if (partnership.athena_dialogue?.refinements_suggested) {
      refinedPlan.refinements = partnership.athena_dialogue.refinements_suggested;
    }

    // Apply strategic refinements (PRO+)
    if (partnership.athena_strategic_analysis) {
      const recommendation = partnership.athena_strategic_analysis.recommendation;

      if (recommendation?.verdict === 'proceed_with_validation') {
        refinedPlan.validation_required = recommendation.conditions;
        refinedPlan.confidence_adjustment = -0.15; // Lower confidence until validated
      }

      if (recommendation?.verdict === 'proceed_with_mitigation') {
        refinedPlan.risk_mitigations = recommendation.conditions;
        refinedPlan.confidence_adjustment = -0.10;
      }

      // Add alternative approaches for consideration
      if (partnership.athena_strategic_analysis.alternative_approaches) {
        refinedPlan.alternatives = partnership.athena_strategic_analysis.alternative_approaches;
      }
    }

    // Apply creative refinements (MAX/VIP)
    if (partnership.athena_creative_synthesis) {
      const topMetaphor = partnership.athena_creative_synthesis.metaphorical_solutions?.[0];
      if (topMetaphor && topMetaphor.applicability_score > 0.75) {
        refinedPlan.creative_approach = {
          metaphor: topMetaphor.metaphor,
          insight: topMetaphor.insight.creative_solution,
          confidence_boost: 0.1 // Creative solutions increase confidence
        };
      }

      // Add cross-domain innovations
      if (partnership.athena_creative_synthesis.cross_domain_innovations) {
        refinedPlan.innovations = partnership.athena_creative_synthesis.cross_domain_innovations
          .slice(0, 2); // Top 2 most relevant
      }
    }

    return refinedPlan;
  }

  /**
   * Calculate final EPSILON confidence after ATHENA's input
   */
  calculateFinalConfidence(partnership) {
    let finalConfidence = partnership.epsilon_initial_confidence;

    // Dialogue impact (ALL TIERS)
    const questionsCount = partnership.athena_dialogue?.questions_raised?.length || 0;
    if (questionsCount > 0) {
      finalConfidence -= questionsCount * 0.02; // Each question raises healthy doubt
    }

    // Strategic impact (PRO+)
    if (partnership.athena_strategic_analysis) {
      const recommendationConfidence = partnership.athena_strategic_analysis.recommendation?.confidence || 0.8;
      finalConfidence = (finalConfidence + recommendationConfidence) / 2; // Average with strategic confidence
    }

    // Creative impact (MAX/VIP)
    if (partnership.athena_creative_synthesis) {
      const creativityScore = partnership.athena_creative_synthesis.synthesized_recommendation?.creativity_score || 0.5;
      finalConfidence += creativityScore * 0.1; // Creative solutions boost confidence
    }

    // Ensure confidence stays within bounds
    return Math.max(0.5, Math.min(1.0, finalConfidence));
  }

  /**
   * 🆕 ESMC 3.68: ATHENA ERROR DETECTION - Pre-Presentation Review
   *
   * Runs all 5 error detection components BEFORE ATHENA presents plan to user
   * Prevents repetitive debugging by detecting error patterns from recent sessions
   *
   * @param {Object} epsilonPlan - EPSILON's proposed technical plan
   * @param {Object} context - Mission context
   * @returns {Object} Error detection results from all 5 components
   */
  async runErrorDetection(epsilonPlan, context) {
    const detection = {
      timestamp: new Date().toISOString(),
      aesd_result: null,
      ic_result: null,
      cspm_result: null,
      uid_result: null,
      phc_decision: null
    };

    try {
      // Build proposal signature from EPSILON's plan
      const proposal = {
        description: epsilonPlan.description || epsilonPlan.task || context.user_message || '',
        keywords: this._extractKeywords(epsilonPlan, context),
        approach: epsilonPlan.approach || epsilonPlan.implementation_steps?.join(', ') || ''
      };

      // Run AESD: Error Signature Detection
      if (this.aesd) {
        detection.aesd_result = await this.aesd.detectErrorSignature(proposal);
        if (detection.aesd_result.detected) {
          console.log(`   ⚠️  AESD: Error signature detected (${Math.round(detection.aesd_result.matchPercentage * 100)}% match)`);
        }
      }

      // Run IC: Iteration Counter
      if (this.ic) {
        detection.ic_result = await this.ic.countIterations(proposal);
        if (detection.ic_result.iterationCount > 0) {
          console.log(`   🔄 IC: ${detection.ic_result.iterationCount + 1} iteration(s) detected`);
        }
      }

      // Run CSPM: Cross-Session Problem Matcher
      if (this.cspm) {
        detection.cspm_result = await this.cspm.findProblemPrecedents(proposal);
        if (detection.cspm_result.found) {
          console.log(`   📚 CSPM: ${detection.cspm_result.precedents.length} precedent(s) found`);
        }
      }

      // Run UID: User Intervention Detector
      if (this.uid) {
        detection.uid_result = await this.uid.detectInterventions();
        if (detection.uid_result.interventionCount > 0) {
          console.log(`   👤 UID: ${detection.uid_result.interventionCount} user intervention(s) in recent sessions`);
        }
      }

      // Run PHC: Proactive Halt Checkpoint (integrates all above)
      if (this.phc) {
        detection.phc_decision = await this.phc.evaluateHalt(proposal);

        if (detection.phc_decision.shouldHalt) {
          console.log(`   ⛔ PHC: HALT ${detection.phc_decision.severity.toUpperCase()} - ${detection.phc_decision.reasons.length} reason(s)`);
        } else {
          console.log('   ✅ PHC: No halt indicators - Proceeding to ATHENA dialogue');
        }
      }

      return detection;
    } catch (error) {
      console.error('⚠️  Error detection failed (non-fatal):', error.message);
      return detection;
    }
  }

  /**
   * Extract keywords from EPSILON plan and context for error detection
   * @private
   */
  _extractKeywords(epsilonPlan, context) {
    const keywords = [];

    // From plan
    if (epsilonPlan.keywords) {
      keywords.push(...epsilonPlan.keywords);
    }

    // From task/description
    const taskText = epsilonPlan.task || epsilonPlan.description || '';
    const taskWords = taskText.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || []; // CamelCase
    keywords.push(...taskWords);

    // From context
    if (context.user_message) {
      const userWords = context.user_message.match(/\b\w{5,}\b/g) || []; // 5+ char words
      keywords.push(...userWords.slice(0, 10)); // Limit to 10
    }

    // From mesh intelligence (if available)
    if (context.mesh_intelligence) {
      const mesh = context.mesh_intelligence;
      if (mesh.piu?.goals) {
        keywords.push(...mesh.piu.goals.map(g => g.goal));
      }
      if (mesh.dki?.detectedDomains) {
        keywords.push(...mesh.dki.detectedDomains);
      }
    }

    return [...new Set(keywords)]; // Unique only
  }

  /**
   * ATHENA INFINITY MODE DIALOGUE: Deeper questioning, intrigue, pattern matching
   */
  async athenaInfinityDialogue(currentPlan, context, dialogueState, round) {
    // ATHENA's behavioral set for Infinity Mode (different from standard)
    const challenge = {
      round,
      question_type: null,
      question: null,
      reasoning: null,
      memory_reference: null,
      suggested_pivot: null
    };

    // Round 1: Intrigue - Reframe the problem
    if (round === 1) {
      challenge.question_type = 'intrigue';
      challenge.question = `I'm curious... what if we approached "${currentPlan.task}" from the user's pain point first, rather than the technical solution? What problem are we REALLY solving?`;
      challenge.reasoning = 'First round focuses on understanding the deeper "why" behind the task.';
    }

    // Round 2+: Pattern matching from memory, deeper probing
    else {
      challenge.question_type = 'pattern_match';

      // ATLAS 3-tier retrieval: Find relevant past work
      const memoryResult = await this.retrieveRelevantMemory(currentPlan.task, context);

      if (memoryResult.found) {
        const daysAgo = memoryResult.scribe_enrichment?.temporal_context || 'recently';
        challenge.question = `This approach reminds me of similar work we did ${daysAgo}. Back then, we chose ${memoryResult.data.key_learnings?.[0]?.topic || 'a different path'}. Should we revisit that decision, or does this context warrant the new approach?`;
        challenge.memory_reference = {
          session_id: memoryResult.data.session_id,
          project: memoryResult.data.project,
          tier_used: memoryResult.tier_used,
          file_path: memoryResult.data.file_path || 'unknown',
          key_learning: memoryResult.data.key_learnings?.[0] || null
        };
      } else {
        // Fallback if no memory found
        challenge.question = `I don't recall us tackling "${currentPlan.task}" before. That's exciting - new territory. What unique constraints or opportunities does this present?`;
        challenge.memory_reference = null;
      }

      challenge.reasoning = 'Connecting current plan to past patterns to identify if we are repeating mistakes or iterating intelligently.';
    }

    // Suggest pivot if confidence is stagnating
    if (dialogueState.confidence_history.length > 2) {
      const recentDelta = dialogueState.confidence_history[dialogueState.confidence_history.length - 1] -
                          dialogueState.confidence_history[dialogueState.confidence_history.length - 2];
      if (Math.abs(recentDelta) < 0.03) {
        challenge.suggested_pivot = `Confidence plateauing. Consider alternative: ${currentPlan.alternatives?.[0] || 'explore different approach'}`;
      }
    }

    console.log(`   💬 "${challenge.question}"`);
    if (challenge.suggested_pivot) {
      console.log(`   🔄 Pivot Suggestion: ${challenge.suggested_pivot}`);
    }

    return challenge;
  }

  /**
   * EPSILON INFINITY MODE REFINEMENT: Organic responses, visible pivots
   */
  async epsilonInfinityRefinement(currentPlan, athenaChallenge, dialogueState) {
    // EPSILON's behavioral set for Infinity Mode (different from standard)
    const refinement = {
      response_type: null,
      response: null,
      plan_changes: [],
      refined_plan: null
    };

    // Acknowledge ATHENA's wisdom organically
    if (athenaChallenge.question_type === 'intrigue') {
      refinement.response_type = 'acknowledge_and_reframe';
      refinement.response = `That's... actually a better angle. Let me rethink this from the user's perspective.`;
      refinement.plan_changes.push('Reframed task to focus on user pain point rather than technical implementation');
    }

    if (athenaChallenge.question_type === 'pattern_match') {
      refinement.response_type = 'build_on_memory';
      refinement.response = `You're right to bring that up. The difference this time is [simulated context change]. Let me incorporate that learning: [adjustment].`;
      refinement.plan_changes.push('Incorporated pattern from past session');
    }

    // If ATHENA suggested pivot
    if (athenaChallenge.suggested_pivot) {
      refinement.response_type = 'pivot';
      refinement.response = `Agreed. Confidence stagnating means we're missing something. Pivoting strategy...`;
      refinement.plan_changes.push('Strategic pivot based on ATHENA recommendation');
      dialogueState.pivot_points.push({ round: athenaChallenge.round, reason: athenaChallenge.suggested_pivot });
    }

    // Apply changes to plan
    refinement.refined_plan = JSON.parse(JSON.stringify(currentPlan)); // Deep copy
    refinement.refined_plan.athena_refinements = refinement.plan_changes;
    refinement.refined_plan.confidence = (refinement.refined_plan.confidence || 0.85) + 0.05; // Simulate improvement

    console.log(`   🎖️ "${refinement.response}"`);
    refinement.plan_changes.forEach(change => {
      console.log(`   ✏️ ${change}`);
    });

    return refinement;
  }

  /**
   * CALCULATE CONSENSUS: CUP + TBI + Memory pattern matching
   * Returns score from 0.0 to 1.0 representing "what Exa would want"
   */
  async calculateConsensus(plan, context, meshIntelligence) {
    let consensusScore = 0.0;

    // Component 1: CUP (Contextual User Profiling) - 40% weight
    // TODO: Integrate with actual CUP system
    const cupScore = 0.75; // Simulated: How well does plan match user's known preferences?
    consensusScore += cupScore * 0.4;

    // Component 2: TBI (Temporal-Behavioral Intelligence) - 20% weight
    // TODO: Integrate with actual TBI system
    const tbiScore = 0.80; // Simulated: Is plan appropriate for user's current cognitive state/time of day?
    consensusScore += tbiScore * 0.2;

    // Component 3: Memory Pattern Matching - 40% weight
    // ATLAS 3-tier retrieval for pattern alignment
    const memoryResult = await this.retrieveRelevantMemory(plan.task, context);
    let memoryScore = 0.50; // Default: No relevant memory found

    if (memoryResult.found) {
      // Score based on tier used (recent memory = higher confidence)
      const tierScores = { 1: 0.90, 2: 0.75, 3: 0.65 }; // TIER 1 = most relevant
      memoryScore = tierScores[memoryResult.tier_used] || 0.50;

      // Bonus for temporal recency (Scribe enrichment)
      if (memoryResult.scribe_enrichment?.recency_score) {
        memoryScore = (memoryScore + memoryResult.scribe_enrichment.recency_score) / 2;
      }
    }

    consensusScore += memoryScore * 0.4;

    // Bonus: Mesh intelligence alignment
    if (meshIntelligence) {
      const meshAlignmentBonus = 0.05; // 5% bonus if plan aligns with all 4 mesh components
      consensusScore += meshAlignmentBonus;
    }

    // Ensure within bounds
    return Math.max(0.0, Math.min(1.0, consensusScore));
  }

  /**
   * Calculate Infinity Mode specific metrics
   */
  calculateInfinityMetrics(partnership) {
    return {
      mode: 'infinity',
      rounds_completed: partnership.infinity_metrics.rounds_completed,
      termination_reason: partnership.infinity_metrics.termination_reason,
      initial_consensus: partnership.infinity_metrics.consensus_trajectory[0]?.consensus || 0,
      final_consensus: partnership.epsilon_final_confidence,
      consensus_improvement: partnership.epsilon_final_confidence - (partnership.infinity_metrics.consensus_trajectory[0]?.consensus || 0),
      average_consensus_delta: partnership.infinity_metrics.consensus_trajectory.reduce((sum, r) => sum + Math.abs(r.delta), 0) / partnership.infinity_metrics.rounds_completed
    };
  }

  /**
   * Calculate partnership effectiveness metrics
   */
  calculateMetrics(partnership) {
    return {
      confidence_delta: partnership.epsilon_final_confidence - partnership.epsilon_initial_confidence,
      questions_count: partnership.athena_dialogue?.questions_raised?.length || 0,
      refinements_applied: partnership.refined_plan?.refinements?.length || 0,
      strategic_analysis_depth: partnership.athena_strategic_analysis ? 'deep' : 'none',
      creative_synthesis_used: partnership.athena_creative_synthesis !== null,
      partnership_effectiveness_score: this.calculateEffectivenessScore(partnership)
    };
  }

  /**
   * Calculate overall partnership effectiveness
   */
  calculateEffectivenessScore(partnership) {
    let score = 0.0;

    // Base score from dialogue engagement
    score += 0.2; // Dialogue always happens

    // Strategic analysis bonus (PRO+)
    if (partnership.athena_strategic_analysis) {
      score += 0.3;
    }

    // Creative synthesis bonus (MAX/VIP)
    if (partnership.athena_creative_synthesis) {
      score += 0.2;
    }

    // Confidence improvement bonus
    const confidenceDelta = partnership.epsilon_final_confidence - partnership.epsilon_initial_confidence;
    score += Math.min(Math.max(confidenceDelta, 0), 0.3); // Up to 0.3 bonus for confidence improvement

    return Math.min(score, 1.0);
  }

  /**
   * Log partnership to MySQL
   */
  async logPartnership(partnership) {
    if (!this.db) return;

    try {
      await this.db.query(`
        INSERT INTO athena_epsilon_partnership_metrics
        (session_id, tier, epsilon_initial_confidence, athena_dialogue_engaged,
         athena_strategic_analysis_used, athena_creative_synthesis_used,
         epsilon_final_confidence, confidence_delta, questions_count,
         refinements_applied, partnership_effectiveness_score, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        partnership.session_id,
        partnership.tier,
        partnership.epsilon_initial_confidence,
        partnership.athena_dialogue !== null,
        partnership.athena_strategic_analysis !== null,
        partnership.athena_creative_synthesis !== null,
        partnership.epsilon_final_confidence,
        partnership.partnership_metrics.confidence_delta,
        partnership.partnership_metrics.questions_count,
        partnership.partnership_metrics.refinements_applied,
        partnership.partnership_metrics.partnership_effectiveness_score,
        partnership.timestamp
      ]);
    } catch (error) {
      console.warn('⚠️ Partnership metrics logging failed:', error.message);
    }
  }

  /**
   * Retrieve relevant memory using ATLAS 3-tier system
   * @param {string} query - Task/topic to search for
   * @param {object} context - Mission context
   * @returns {Promise<object>} ATLAS retrieval result
   */
  async retrieveRelevantMemory(query, context) {
    if (!this.atlas) {
      console.warn('⚠️ ATLAS not initialized - memory retrieval unavailable');
      return { found: false };
    }

    try {
      // 🆕 ESMC 3.22: Use retrieveV3() for ECHO+HYDRA cascade
      const result = await this.atlas.retrieveV3(query, { retrieveEcho: true });
      return result;
    } catch (error) {
      console.warn(`⚠️ Memory retrieval failed: ${error.message}`);
      return { found: false };
    }
  }

  /**
   * 🆕 Find file using ATLAS structural awareness
   * @param {string} query - File search query (name, path, or purpose)
   * @returns {Promise<object>} ATLAS search result
   */
  async findFile(query) {
    if (!this.atlas) {
      return { found: false, message: 'ATLAS not initialized' };
    }
    return await this.atlas.findFile(query);
  }

  /**
   * 🆕 Get all files in a domain using ATLAS
   * @param {string} domainName - Domain identifier (e.g., "website", "sdk")
   * @returns {Promise<object>} Domain files metadata
   */
  async getDomainFiles(domainName) {
    if (!this.atlas) {
      return { found: false, message: 'ATLAS not initialized' };
    }
    return await this.atlas.getDomainFiles(domainName);
  }

  /**
   * Get partnership summary for user display
   */
  getPartnershipSummary(partnership) {
    const summary = {
      tier: partnership.tier,
      modules_engaged: [],
      key_insights: [],
      confidence_change: partnership.partnership_metrics.confidence_delta,
      effectiveness: partnership.partnership_metrics.partnership_effectiveness_score
    };

    // Modules engaged
    if (partnership.athena_dialogue) {
      summary.modules_engaged.push('Dialogue Partner');
    }
    if (partnership.athena_strategic_analysis) {
      summary.modules_engaged.push('Strategic Questioner');
    }
    if (partnership.athena_creative_synthesis) {
      summary.modules_engaged.push('Creative Synthesizer');
    }

    // Key insights
    if (partnership.athena_dialogue?.athena_response?.question) {
      summary.key_insights.push(partnership.athena_dialogue.athena_response.question);
    }

    if (partnership.athena_strategic_analysis?.recommendation?.strategic_summary) {
      summary.key_insights.push(partnership.athena_strategic_analysis.recommendation.strategic_summary);
    }

    if (partnership.athena_creative_synthesis?.synthesized_recommendation?.athena_wisdom) {
      summary.key_insights.push(partnership.athena_creative_synthesis.synthesized_recommendation.athena_wisdom);
    }

    return summary;
  }

  /**
   * 🆕 ESMC 3.26 - PHASE 6.5: Code Presentation Review (BEFORE implementation)
   * Reviews drafted code using ORACLE standards
   * @param {Object} codeContext - Code presentation context
   * @param {string} codeContext.presentedCode - Drafted code (not yet written to files)
   * @param {Object} codeContext.task - Task description
   * @param {Object} codeContext.patterns - Codebase patterns from PCA
   * @param {number} codeContext.complexity - Complexity score
   * @param {boolean} codeContext.security_critical - Security flag
   * @param {boolean} codeContext.user_requested - User explicitly requested review
   * @param {Object} codeContext.phase45Result - Result from Phase 4.5 (if ran)
   * @param {Array} codeContext.colonels - Colonels being deployed
   * @returns {Object} Code-level violations, user decision required
   */
  async reviewCodeBeforeImplementation(codeContext = {}) {
    // Graceful degradation if ORACLE not operational
    if (!this.oracle || !this.oracle.isOperational()) {
      return {
        skipped: true,
        reason: 'oracle_not_operational',
        violations: [],
        user_decision: null
      };
    }

    try {
      const {
        presentedCode = '',
        task = '',
        patterns = {},
        complexity = 0,
        security_critical = false,
        user_requested = false,
        phase45Result = null,
        colonels = []
      } = codeContext;

      // Trigger logic: complexity >= 70 OR security_critical OR user_requested OR Phase 4.5 HIGH violations
      const phase45HighViolations = phase45Result &&
                                    !phase45Result.skipped &&
                                    phase45Result.violations &&
                                    phase45Result.violations.some(v => v.severity === 'HIGH');

      const shouldReview = complexity >= 70 ||
                          security_critical ||
                          user_requested ||
                          phase45HighViolations;

      if (!shouldReview) {
        return {
          skipped: true,
          reason: 'trigger_threshold_not_met',
          violations: [],
          user_decision: null
        };
      }

      // 🆕 BUG FIX #3: Validate code exists before review (semantic correctness)
      if (!presentedCode || presentedCode.trim().length === 0) {
        return {
          skipped: true,
          reason: 'no_code_presented',
          violations: [],
          user_decision: null
        };
      }

      // 🆕 ESMC 3.27: CL PROTOCOL INTEGRATION - Detect CL tags and lazy-load context
      let clContext = {};
      let clTokenCost = 0;
      const clTags = this.detectCLTags(presentedCode);

      if (clTags.length > 0) {
        console.log(`📸 PHASE 6.5: Detected ${clTags.length} CL tags - loading historical context...`);
        const clResult = await this.readCLContext(codeContext.filename || 'unknown.js', clTags);

        if (clResult.found) {
          clContext = clResult.context;
          clTokenCost = clResult.token_cost;
          console.log(`📸 PHASE 6.5: Loaded ${clResult.files_read}/${clTags.length} CL files (~${clTokenCost} tokens)`);
          console.log(`📸 Token efficiency: ${clResult.efficiency_vs_full_changelog}`);
        }
      }

      console.log('📊 PHASE 6.5: Code presentation review analyzing...');

      // Enforce standards on presented code using ORACLE (CL-enhanced context)
      const enforcementResult = this.oracle.enforceCodeStandards({
        task,
        code: presentedCode,
        context: {
          ...patterns,
          cl_context: clContext,           // 🆕 CL historical context
          cl_tags_detected: clTags.length, // 🆕 CL metadata
          cl_token_cost: clTokenCost       // 🆕 Token tracking
        },
        colonels: colonels.length > 0 ? colonels : ['BETA', 'DELTA', 'GAMMA']
      });

      const result = {
        skipped: false,
        violations: enforcementResult.violations || [],
        recommendations: enforcementResult.recommendations || [],
        selectedStandards: enforcementResult.selectedStandards || {},
        complexity,
        review_type: 'code_presentation',
        // 🆕 ESMC 3.27: CL Protocol metadata
        cl_integration: {
          tags_detected: clTags.length,
          tags_list: clTags.map(t => t.tag),
          files_loaded: clTags.length > 0 ? Object.keys(clContext).filter(k => clContext[k].content !== null).length : 0,
          token_cost: clTokenCost,
          efficiency_vs_full_changelog: clTokenCost > 0 ? `${Math.round((1 - (clTokenCost / 1750)) * 100)}% savings` : 'N/A'
        }
      };

      // If violations found, require user decision
      if (result.violations.length > 0) {
        console.log(`⚠️  PHASE 6.5: ${result.violations.length} violations detected - user decision required`);
        result.user_decision_required = true;
      } else {
        console.log(`✅ PHASE 6.5: Complete (no violations)`);
        result.user_decision_required = false;
      }

      // 🆕 ESMC 3.27: Log CL integration metrics
      if (clTags.length > 0) {
        console.log(`\n📸 CL PROTOCOL METRICS:`);
        console.log(`   Tags detected: ${result.cl_integration.tags_detected}`);
        console.log(`   Files loaded: ${result.cl_integration.files_loaded}`);
        console.log(`   Token cost: ${result.cl_integration.token_cost} tokens`);
        console.log(`   Efficiency: ${result.cl_integration.efficiency_vs_full_changelog}\n`);
      }

      return result;

    } catch (error) {
      console.error('[ATHENA ORACLE] Phase 6.5 failed:', error.message);
      return {
        skipped: true,
        reason: 'review_error',
        error: error.message,
        violations: [],
        user_decision: null
      };
    }
  }

  /**
   * Cleanup
   */
  async cleanup() {
    if (this.dialogue) await this.dialogue.cleanup();
    if (this.strategic) await this.strategic.cleanup();
    if (this.creative) await this.creative.cleanup();
    if (this.db) await this.db.end();
    console.log('🎖️ EPSILON-ATHENA COORDINATOR - Cleanup complete');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CL PROTOCOL (ESMC 3.27) - CHANGELOG CONTEXT INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * 🗣️ ATHENA CL PROTOCOL - Detect CL tags in presented code
   * @param {string} code - Source code to analyze
   * @returns {Array<object>} Array of detected CL tags with metadata
   *
   * Pattern matching for inline CL tags: // CL{number} - {description}
   * Returns: [{ tag: 'CL15', number: 15, description: 'Levenshtein optimization', line: 847 }]
   */
  detectCLTags(code) {
    if (!code || typeof code !== 'string') {
      return [];
    }

    const clTagRegex = /\/\/\s*CL(\d+)\s*-\s*(.+?)$/gm;
    const tags = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const match = clTagRegex.exec(line);
      if (match) {
        tags.push({
          tag: `CL${match[1]}`,
          number: parseInt(match[1], 10),
          description: match[2].trim(),
          line: index + 1,
          fullLine: line.trim()
        });
      }
      clTagRegex.lastIndex = 0; // Reset regex for next iteration
    });

    if (tags.length > 0) {
      console.log(`📸 ATHENA CL Detection: Found ${tags.length} CL tags`);
      tags.forEach(t => console.log(`   ${t.tag}: ${t.description} (line ${t.line})`));
    }

    return tags;
  }

  /**
   * 🗣️ ATHENA CL PROTOCOL - Read relevant CL files (lazy-loading)
   * @param {string} filename - Source filename (e.g., 'atlas-retrieval.js')
   * @param {Array<object>} tags - Detected CL tags from detectCLTags()
   * @returns {Promise<object>} CL context object with file contents
   *
   * Surgical precision: Only reads CL files for tags in edited code
   * Token savings: 85-90% vs reading full changelog
   */
  async readCLContext(filename, tags) {
    if (!tags || tags.length === 0) {
      return { found: false, context: {}, token_cost: 0 };
    }

    const clContext = {};
    const baseFilename = path.basename(filename, path.extname(filename));
    const ext = path.extname(filename) || '.md';
    const clDir = path.join(this.atlas?.projectRoot || __dirname, '.claude/memory/documents/changelogs');

    let totalTokens = 0;
    let filesRead = 0;

    console.log(`📸 ATHENA CL Reading: Loading ${tags.length} CL files for ${filename}...`);

    for (const tag of tags) {
      const clFilename = `${baseFilename}-${tag.tag}${ext}`;
      const clFilePath = path.join(clDir, clFilename);

      try {
        if (fs.existsSync(clFilePath)) {
          const content = fs.readFileSync(clFilePath, 'utf8');
          clContext[tag.tag] = {
            filename: clFilename,
            content: content,
            tag: tag.tag,
            number: tag.number,
            description: tag.description,
            line: tag.line,
            token_cost: Math.ceil(content.length / 3.5) // Estimate: ~3.5 chars per token
          };

          totalTokens += clContext[tag.tag].token_cost;
          filesRead++;

          console.log(`   ✅ ${tag.tag}: ${clFilename} (~${clContext[tag.tag].token_cost} tokens)`);
        } else {
          console.warn(`   ⚠️  ${tag.tag}: File not found (${clFilename})`);
          clContext[tag.tag] = {
            filename: clFilename,
            content: null,
            tag: tag.tag,
            number: tag.number,
            description: tag.description,
            line: tag.line,
            error: 'file_not_found',
            token_cost: 0
          };
        }
      } catch (error) {
        console.error(`   ❌ ${tag.tag}: Read error - ${error.message}`);
        clContext[tag.tag] = {
          filename: clFilename,
          content: null,
          tag: tag.tag,
          number: tag.number,
          description: tag.description,
          line: tag.line,
          error: error.message,
          token_cost: 0
        };
      }
    }

    console.log(`📸 ATHENA CL Reading: ${filesRead}/${tags.length} files loaded (~${totalTokens} tokens total)`);

    return {
      found: filesRead > 0,
      context: clContext,
      files_read: filesRead,
      files_missing: tags.length - filesRead,
      token_cost: totalTokens,
      efficiency_vs_full_changelog: totalTokens > 0 ?
        `${Math.round((1 - (totalTokens / 1750)) * 100)}% savings` :
        'N/A'
    };
  }

  /**
   * 🗣️ ATHENA CL PROTOCOL - Review code with CL historical context
   * @param {object} reviewContext - Review context object
   * @returns {Promise<object>} ATHENA review result with CL-informed wisdom
   *
   * Context-aware code review: ATHENA reviews with full evolutionary history
   * Prevents regression, maintains optimizations, follows established patterns
   */
  async reviewWithCLContext(reviewContext) {
    const {
      code = '',
      clContext = {},
      patterns = {},
      task = '',
      complexity = 0,
      security_critical = false
    } = reviewContext;

    console.log('\n📸 ATHENA CL REVIEW: Context-aware code review starting...\n');

    // Step 1: Analyze CL context for historical wisdom
    const historicalInsights = this.analyzeCLHistory(clContext);

    // Step 2: Build ATHENA wisdom prompt with CL context
    const wisdomPrompt = this.buildCLWisdomPrompt({
      code,
      clContext,
      historicalInsights,
      patterns,
      task
    });

    // Step 3: Generate ATHENA strategic dialogue (existing method)
    const athenaDialogue = await this.dialogue?.generateStrategicDialogue({
      task,
      epsilon_plan: {
        code_to_implement: code,
        historical_context: historicalInsights,
        cl_tags_detected: Object.keys(clContext).length
      },
      mesh_intelligence: patterns,
      context: {
        complexity,
        security_critical,
        cl_context_available: Object.keys(clContext).length > 0
      }
    });

    // Step 4: Compile review result
    const review = {
      cl_tags_analyzed: Object.keys(clContext).length,
      historical_insights: historicalInsights,
      athena_dialogue: athenaDialogue,
      wisdom_enhanced: true,
      violations_detected: this.detectCLViolations(code, clContext),
      recommendations: this.generateCLRecommendations(code, clContext, historicalInsights),
      decision: this.determineCLDecision(code, clContext, historicalInsights),
      next_cl_number: this.calculateNextCLNumber(clContext),
      timestamp: new Date().toISOString()
    };

    console.log(`\n📸 ATHENA CL REVIEW: Complete`);
    console.log(`   CL Tags Analyzed: ${review.cl_tags_analyzed}`);
    console.log(`   Violations: ${review.violations_detected.length}`);
    console.log(`   Decision: ${review.decision.verdict}`);

    return review;
  }

  /**
   * Helper: Analyze CL history for patterns and insights
   */
  analyzeCLHistory(clContext) {
    const insights = {
      total_changes: Object.keys(clContext).length,
      optimizations_found: [],
      patterns_found: [],
      warnings: [],
      summary: ''
    };

    for (const [tag, clData] of Object.entries(clContext)) {
      if (!clData.content) continue;

      const content = clData.content.toLowerCase();

      // Detect optimization patterns
      if (content.includes('optimization') || content.includes('performance')) {
        insights.optimizations_found.push({
          tag,
          description: clData.description,
          type: 'performance'
        });
      }

      // Detect architectural patterns
      if (content.includes('refactor') || content.includes('architecture')) {
        insights.patterns_found.push({
          tag,
          description: clData.description,
          type: 'architecture'
        });
      }

      // Detect warnings/breaking changes
      if (content.includes('breaking') || content.includes('deprecated')) {
        insights.warnings.push({
          tag,
          description: clData.description,
          severity: 'high'
        });
      }
    }

    insights.summary = `Analyzed ${insights.total_changes} CL entries: ` +
      `${insights.optimizations_found.length} optimizations, ` +
      `${insights.patterns_found.length} patterns, ` +
      `${insights.warnings.length} warnings`;

    return insights;
  }

  /**
   * Helper: Build CL wisdom prompt for ATHENA
   */
  buildCLWisdomPrompt(context) {
    const { code, clContext, historicalInsights, task } = context;

    let prompt = `🗣️ ATHENA: Reviewing code with historical CL context...\n\n`;
    prompt += `**Task:** ${task}\n\n`;
    prompt += `**Historical Insights:**\n${historicalInsights.summary}\n\n`;

    if (historicalInsights.optimizations_found.length > 0) {
      prompt += `**Past Optimizations to Preserve:**\n`;
      historicalInsights.optimizations_found.forEach(opt => {
        prompt += `- ${opt.tag}: ${opt.description}\n`;
      });
      prompt += `\n`;
    }

    if (historicalInsights.warnings.length > 0) {
      prompt += `**⚠️  Historical Warnings:**\n`;
      historicalInsights.warnings.forEach(warn => {
        prompt += `- ${warn.tag}: ${warn.description}\n`;
      });
      prompt += `\n`;
    }

    return prompt;
  }

  /**
   * Helper: Detect CL violations (regression prevention)
   */
  detectCLViolations(code, clContext) {
    const violations = [];

    // Check if code removes optimizations from CL history
    for (const [tag, clData] of Object.entries(clContext)) {
      if (!clData.content) continue;

      const content = clData.content.toLowerCase();

      // Example: Check if early termination optimization is preserved
      if (content.includes('early termination') && !code.includes('threshold')) {
        violations.push({
          tag,
          severity: 'HIGH',
          type: 'optimization_removed',
          message: `${tag} introduced early termination optimization - missing in new code`,
          recommendation: 'Preserve optimization from historical CL entry'
        });
      }
    }

    return violations;
  }

  /**
   * Helper: Generate CL recommendations
   */
  generateCLRecommendations(code, clContext, historicalInsights) {
    const recommendations = [];

    // Recommend preserving optimizations
    if (historicalInsights.optimizations_found.length > 0) {
      recommendations.push({
        type: 'preserve_optimization',
        priority: 'high',
        message: `Preserve ${historicalInsights.optimizations_found.length} historical optimizations`,
        tags: historicalInsights.optimizations_found.map(o => o.tag)
      });
    }

    // Recommend following established patterns
    if (historicalInsights.patterns_found.length > 0) {
      recommendations.push({
        type: 'follow_pattern',
        priority: 'medium',
        message: `Follow established patterns from ${historicalInsights.patterns_found.length} CL entries`,
        tags: historicalInsights.patterns_found.map(p => p.tag)
      });
    }

    return recommendations;
  }

  /**
   * Helper: Determine CL decision verdict
   */
  determineCLDecision(code, clContext, historicalInsights) {
    const violations = this.detectCLViolations(code, clContext);

    if (violations.length === 0 && historicalInsights.warnings.length === 0) {
      return {
        verdict: 'proceed_as_is',
        confidence: 0.95,
        rationale: 'Code maintains historical optimizations and patterns. No violations detected.'
      };
    }

    if (violations.length > 0) {
      return {
        verdict: 'refine_code',
        confidence: 0.60,
        rationale: `${violations.length} violations detected. Code may remove historical optimizations.`,
        violations
      };
    }

    return {
      verdict: 'proceed_with_caution',
      confidence: 0.75,
      rationale: `${historicalInsights.warnings.length} historical warnings found. Review carefully.`
    };
  }

  /**
   * Helper: Calculate next CL number for new entries
   */
  calculateNextCLNumber(clContext) {
    const numbers = Object.keys(clContext)
      .map(tag => parseInt(tag.replace('CL', ''), 10))
      .filter(n => !isNaN(n));

    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  }

  /**
   * 🗣️ ATHENA CL PROTOCOL - Tell ECHELON decision with CL rationale
   * @param {object} decision - ATHENA decision object
   * @returns {string} Formatted strategic dialogue for ECHELON
   *
   * Strategic communication: ATHENA informs ECHELON with CL-enhanced wisdom
   */
  tellECHELON(decision) {
    const {
      verdict = 'proceed_as_is',
      confidence = 0.90,
      rationale = '',
      violations = [],
      recommendations = [],
      next_cl_number = null,
      cl_tags_analyzed = 0
    } = decision;

    let dialogue = `\n🗣️ ATHENA: "General, I've reviewed the code with CL historical context...\n\n`;

    // CL context summary
    if (cl_tags_analyzed > 0) {
      dialogue += `   📸 Analyzed ${cl_tags_analyzed} CL entries for historical wisdom.\n`;
    }

    // Decision verdict
    const verdictEmoji = {
      'proceed_as_is': '✅',
      'proceed_with_caution': '⚠️',
      'refine_code': '🔴',
      'abort': '❌'
    }[verdict] || '❓';

    dialogue += `\n   ${verdictEmoji} **Decision:** ${verdict.toUpperCase().replace(/_/g, ' ')}\n`;
    dialogue += `   **Confidence:** ${(confidence * 100).toFixed(0)}%\n\n`;

    // Rationale
    dialogue += `   **Rationale:** ${rationale}\n`;

    // Violations
    if (violations.length > 0) {
      dialogue += `\n   **⚠️  Violations Detected:**\n`;
      violations.forEach((v, i) => {
        dialogue += `   ${i + 1}. [${v.severity}] ${v.message} (${v.tag})\n`;
      });
    }

    // Recommendations
    if (recommendations.length > 0) {
      dialogue += `\n   **Recommendations:**\n`;
      recommendations.forEach((r, i) => {
        dialogue += `   ${i + 1}. [${r.priority.toUpperCase()}] ${r.message}\n`;
      });
    }

    // Next CL number
    if (next_cl_number) {
      dialogue += `\n   **Next CL Number:** CL${next_cl_number} (for new changes)\n`;
    }

    dialogue += `\n   General, recommend: ${verdict === 'proceed_as_is' ? 'Proceed with implementation' :
                                         verdict === 'proceed_with_caution' ? 'Proceed but monitor carefully' :
                                         verdict === 'refine_code' ? 'Refine code to address violations' :
                                         'Abort and redesign'}"\n`;

    console.log(dialogue);
    return dialogue;
  }
}

// Export for integration
module.exports = EpsilonAthenaCoordinator;

// CLI testing interface
if (require.main === module) {
  (async () => {
    const coordinator = new EpsilonAthenaCoordinator();
    const initResult = await coordinator.initialize();

    console.log('\n🎖️ EPSILON-ATHENA COORDINATOR - Test Interface\n');
    console.log('Initialization:', JSON.stringify(initResult, null, 2));

    // Test partnership flow
    const mockMeshIntelligence = {
      PIU: { intent: 'Implement OAuth2 authentication' },
      DKI: { standards: ['OAuth 2.0 RFC 6749', 'JWT RFC 7519'] },
      UIP: { preferences: 'User prefers secure, production-ready solutions' },
      PCA: { patterns: 'Project uses JWT for session management' }
    };

    const mockEpsilonPlan = {
      task: 'Implement OAuth2 with JWT tokens',
      approach: 'Use passport.js with JWT strategy',
      complexity: 85,
      confidence: 0.85,
      timeline: 'normal'
    };

    const mockContext = {
      session_id: 'test-2025-01-epsilon-athena',
      user_tier: coordinator.currentTier,
      complexity_score: 85,
      mission_type: 'feature_implementation',
      user_message: 'Implement OAuth2 authentication'
    };

    const partnership = await coordinator.coordinatePartnership(
      mockMeshIntelligence,
      mockEpsilonPlan,
      mockContext
    );

    console.log('\n📊 Partnership Result:');
    console.log(JSON.stringify(coordinator.getPartnershipSummary(partnership), null, 2));

    await coordinator.cleanup();
  })();
}
