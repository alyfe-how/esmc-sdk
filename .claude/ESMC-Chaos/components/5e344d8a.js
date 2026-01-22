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
/** ESMC 3.13 ATHENA QUESTIONER | 2025-10-14 | v3.13.0 | PROD | PRO/MAX/VIP
 *  Purpose: Strategic questioning layer - prevents mistakes via deep analysis (why/what-if/should-we)
 *  Features: Root cause | Assumption validation | Trade-off analysis | 2nd-order thinking | Strategic alternatives | ATLAS integration
 *  Philosophy: "Right question at right time prevents 1000 mistakes"
 */

const fs = require('fs').promises;
const path = require('path');
// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)
const AtlasRetrievalSystem = require('./4bb69ab9.js'); // 🆕 ESMC 3.14.1: Bulletproof path resolution

class AthenaStrategicQuestioner {
  constructor() {
    this.version = '3.14.1'; // 🆕 Updated for bulletproof path resolution
    this.tier = 'PRO+'; // PRO, MAX, VIP only
    this.questioningFrameworks = {
      root_cause: 'five_whys',
      assumptions: 'premortem_analysis',
      tradeoffs: 'eisenhower_matrix',
      second_order: 'consequence_mapping',
      alternatives: 'lateral_thinking'
    };
    this.db = null;

    // 🆕 ESMC 3.14.1: Use ATLAS bulletproof path resolution instead of process.cwd()
    const atlas = new AtlasRetrievalSystem();
    this.memoryPath = path.join(atlas.projectRoot, '.claude/memory/sessions/esmc-production');
  }

  /**
   * Initialize strategic questioner
   * ESMC 3.99.1: Skip MySQL in CLI mode (ESMC_SILENT env var) - AEGIS file-based supremacy
   */
  async initialize() {
    // ESMC 3.99.1: Skip MySQL connection if ESMC_SILENT=true (CLI mode)
    if (process.env.ESMC_SILENT === 'true') {
      this.db = null; // CLI mode: Skip MySQL, use ATLAS/AEGIS file-based retrieval
      return { success: true, version: this.version, tier: this.tier };
    }

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

      console.log('🎖️ ATHENA STRATEGIC QUESTIONER - Initialized (v3.13.0) [PRO+ ONLY]');
      return { success: true, version: this.version, tier: this.tier };
    } catch (error) {
      console.error('❌ ATHENA strategic questioner initialization failed:', error.message);
      this.db = null; // Graceful fallback
      return { success: true, version: this.version, tier: this.tier }; // Continue without MySQL
    }
  }

  /**
   * CORE FUNCTION: Deep strategic analysis
   * Called by Dialogue Partner when complexity > 60
   *
   * @param {Object} epsilonPlan - EPSILON's technical plan
   * @param {Object} context - Mission context
   * @returns {Object} Strategic analysis with questions and recommendations
   */
  async analyze(epsilonPlan, context) {
    try {
      const analysis = {
        timestamp: this.getMySQLTimestamp(),
        mission_id: context.session_id,
        tier: context.user_tier,
        complexity_score: context.complexity_score,
        strategic_questions: [],
        assumptions_identified: [],
        tradeoffs_analysis: null,
        second_order_consequences: [],
        alternative_approaches: [],
        recommendation: null
      };

      // 1. Root Cause Questioning (Five Whys)
      analysis.strategic_questions.push(...await this.applyFiveWhys(epsilonPlan, context));

      // 2. Assumption Validation (Premortem Analysis)
      analysis.assumptions_identified = await this.identifyAssumptions(epsilonPlan);

      // 3. Trade-off Analysis
      analysis.tradeoffs_analysis = await this.analyzeTradeoffs(epsilonPlan, context);

      // 4. Second-Order Thinking (Consequence Mapping)
      analysis.second_order_consequences = await this.mapConsequences(epsilonPlan);

      // 5. Alternative Approaches (Lateral Thinking)
      analysis.alternative_approaches = await this.generateAlternatives(epsilonPlan, context);

      // 6. Synthesize Strategic Recommendation
      analysis.recommendation = this.synthesizeRecommendation(analysis);

      // Log to MySQL
      await this.logAnalysis(analysis);

      return analysis;
    } catch (error) {
      console.error('❌ ATHENA strategic analysis failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Five Whys Framework - Root cause questioning
   */
  async applyFiveWhys(epsilonPlan, context) {
    const questions = [];
    const problem = context.user_message || epsilonPlan.task || 'Unknown task';

    questions.push({
      framework: 'five_whys',
      level: 1,
      question: `Why does the user need this? (${problem})`,
      purpose: 'Uncover the real problem behind the stated request'
    });

    questions.push({
      framework: 'five_whys',
      level: 2,
      question: 'Why now? What changed that makes this urgent?',
      purpose: 'Understand timing and context'
    });

    questions.push({
      framework: 'five_whys',
      level: 3,
      question: 'Why this approach instead of alternatives?',
      purpose: 'Challenge the proposed solution'
    });

    questions.push({
      framework: 'five_whys',
      level: 4,
      question: 'Why would this solution fail? (Premortem)',
      purpose: 'Identify weak points before implementation'
    });

    questions.push({
      framework: 'five_whys',
      level: 5,
      question: 'Why is this the right level of complexity?',
      purpose: 'Validate effort vs value tradeoff'
    });

    return questions;
  }

  /**
   * Identify hidden assumptions in the plan
   */
  async identifyAssumptions(epsilonPlan) {
    const assumptions = [];

    // Technical assumptions
    if (epsilonPlan.technology_stack) {
      assumptions.push({
        type: 'technical',
        assumption: `User's environment supports ${epsilonPlan.technology_stack.join(', ')}`,
        validation_needed: 'Verify dependencies and versions',
        risk: 'medium'
      });
    }

    // User behavior assumptions
    assumptions.push({
      type: 'behavioral',
      assumption: 'User will use this feature as intended',
      validation_needed: 'Consider edge cases and misuse scenarios',
      risk: 'high'
    });

    // Performance assumptions
    if (epsilonPlan.performance_considerations) {
      assumptions.push({
        type: 'performance',
        assumption: 'Current infrastructure can handle proposed solution',
        validation_needed: 'Load testing and benchmarking',
        risk: 'medium'
      });
    }

    // Scope assumptions
    assumptions.push({
      type: 'scope',
      assumption: 'This solves the complete problem (not just symptoms)',
      validation_needed: 'Verify with user before implementation',
      risk: 'critical'
    });

    return assumptions;
  }

  /**
   * Trade-off Analysis - What are we optimizing for?
   */
  async analyzeTradeoffs(epsilonPlan, context) {
    return {
      framework: 'eisenhower_matrix',
      dimensions: [
        {
          axis: 'Speed vs Quality',
          current_position: epsilonPlan.timeline === 'urgent' ? 'speed' : 'quality',
          question: 'Are we trading long-term quality for short-term speed?',
          recommendation: 'Consider if technical debt is worth the velocity gain'
        },
        {
          axis: 'Simplicity vs Features',
          current_position: epsilonPlan.features?.length > 5 ? 'features' : 'simplicity',
          question: 'Are we over-engineering this?',
          recommendation: 'Start with MVP, iterate based on user feedback'
        },
        {
          axis: 'Security vs Usability',
          current_position: 'unknown',
          question: 'How much security friction is acceptable?',
          recommendation: 'Define security requirements upfront'
        },
        {
          axis: 'Cost vs Performance',
          current_position: 'unknown',
          question: 'What performance level justifies the implementation cost?',
          recommendation: 'Benchmark acceptable performance thresholds'
        }
      ],
      primary_optimization: this.identifyPrimaryGoal(epsilonPlan)
    };
  }

  /**
   * Identify primary optimization goal
   */
  identifyPrimaryGoal(epsilonPlan) {
    const keywords = JSON.stringify(epsilonPlan).toLowerCase();

    if (keywords.includes('fast') || keywords.includes('performance')) {
      return { goal: 'speed', confidence: 0.8 };
    }
    if (keywords.includes('secure') || keywords.includes('auth')) {
      return { goal: 'security', confidence: 0.8 };
    }
    if (keywords.includes('simple') || keywords.includes('clean')) {
      return { goal: 'simplicity', confidence: 0.7 };
    }
    if (keywords.includes('scale') || keywords.includes('growth')) {
      return { goal: 'scalability', confidence: 0.8 };
    }

    return { goal: 'unknown', confidence: 0.3, note: 'Ask user for explicit priorities' };
  }

  /**
   * Second-Order Thinking - Consequences of consequences
   */
  async mapConsequences(epsilonPlan) {
    const consequences = [];

    // First-order: What happens if we implement this?
    consequences.push({
      order: 1,
      action: 'Implementation',
      consequence: epsilonPlan.expected_outcome || 'Stated goal achieved',
      probability: 0.85
    });

    // Second-order: What happens after that?
    consequences.push({
      order: 2,
      action: 'After implementation',
      consequence: 'User requests extensions/modifications',
      probability: 0.7,
      question: 'Is our architecture extensible enough?'
    });

    consequences.push({
      order: 2,
      action: 'After deployment',
      consequence: 'Edge cases and bugs surface in production',
      probability: 0.6,
      question: 'Do we have monitoring and rollback strategies?'
    });

    // Third-order: Long-term implications
    consequences.push({
      order: 3,
      action: '6 months later',
      consequence: 'Technical debt accumulates if not maintained',
      probability: 0.8,
      question: 'Is this sustainable long-term?'
    });

    consequences.push({
      order: 3,
      action: '6 months later',
      consequence: 'User expectations increase based on this precedent',
      probability: 0.7,
      question: 'Are we setting expectations we can meet consistently?'
    });

    return consequences;
  }

  /**
   * Generate alternative approaches (Lateral Thinking)
   */
  async generateAlternatives(epsilonPlan, context) {
    const alternatives = [];

    // Simpler alternative
    alternatives.push({
      approach: 'Simplification',
      description: 'What if we did 20% of this that solves 80% of the problem?',
      pros: ['Faster delivery', 'Lower complexity', 'Easier maintenance'],
      cons: ['Incomplete solution', 'May need extension later'],
      effort: 'low',
      value: 'medium'
    });

    // Different technology
    alternatives.push({
      approach: 'Technology Pivot',
      description: 'What if we used a different tech stack better suited to this problem?',
      pros: ['Potentially more appropriate', 'Better long-term fit'],
      cons: ['Learning curve', 'Integration challenges'],
      effort: 'high',
      value: 'high'
    });

    // No-code/low-code
    alternatives.push({
      approach: 'No-Code Solution',
      description: 'What if we used an existing service/tool instead of building?',
      pros: ['Immediate availability', 'Zero maintenance', 'Professional support'],
      cons: ['Less customization', 'Ongoing costs', 'Vendor dependency'],
      effort: 'very_low',
      value: 'medium'
    });

    // Defer decision
    alternatives.push({
      approach: 'Strategic Deferral',
      description: 'What if we wait until we have more information?',
      pros: ['Avoid premature optimization', 'Better requirements', 'Technology maturity'],
      cons: ['Delayed value', 'Opportunity cost', 'Competitive risk'],
      effort: 'none',
      value: 'situational'
    });

    return alternatives;
  }

  /**
   * Synthesize strategic recommendation
   */
  synthesizeRecommendation(analysis) {
    const criticalAssumptions = analysis.assumptions_identified.filter(a => a.risk === 'critical');
    const highRiskConsequences = analysis.second_order_consequences.filter(c => c.probability > 0.7);

    let verdict = 'proceed';
    let confidence = 0.85;
    const conditions = [];

    // Check for critical assumptions
    if (criticalAssumptions.length > 0) {
      verdict = 'proceed_with_validation';
      confidence -= 0.2;
      conditions.push({
        type: 'validation_required',
        description: 'Validate critical assumptions with user before implementation',
        blockers: criticalAssumptions.map(a => a.assumption)
      });
    }

    // Check for high-risk consequences
    if (highRiskConsequences.length > 2) {
      verdict = 'proceed_with_mitigation';
      confidence -= 0.15;
      conditions.push({
        type: 'risk_mitigation',
        description: 'Implement safeguards for high-probability consequences',
        mitigations: highRiskConsequences.map(c => c.question)
      });
    }

    // Check if simpler alternative has better value/effort ratio
    const simplerAlt = analysis.alternative_approaches.find(a => a.approach === 'Simplification');
    if (simplerAlt && simplerAlt.value === 'medium' && simplerAlt.effort === 'low') {
      conditions.push({
        type: 'alternative_consideration',
        description: 'Consider simpler approach first (80/20 rule)',
        alternative: simplerAlt
      });
    }

    return {
      verdict,
      confidence: Math.max(confidence, 0.5),
      conditions,
      strategic_summary: this.generateStrategicSummary(analysis, verdict),
      next_steps: this.generateNextSteps(verdict, conditions)
    };
  }

  /**
   * Generate strategic summary
   */
  generateStrategicSummary(analysis, verdict) {
    const questionCount = analysis.strategic_questions.length;
    const assumptionCount = analysis.assumptions_identified.length;
    const alternativeCount = analysis.alternative_approaches.length;

    return `Strategic analysis complete: ${questionCount} questions raised, ${assumptionCount} assumptions identified, ${alternativeCount} alternatives considered. Verdict: ${verdict}.`;
  }

  /**
   * Generate actionable next steps
   */
  generateNextSteps(verdict, conditions) {
    const steps = [];

    if (verdict === 'proceed_with_validation') {
      steps.push({
        step: 1,
        action: 'Validate assumptions with user',
        priority: 'critical',
        estimated_time: '5-10 minutes'
      });
    }

    if (verdict === 'proceed_with_mitigation') {
      steps.push({
        step: 2,
        action: 'Implement risk mitigation strategies',
        priority: 'high',
        estimated_time: '15-30 minutes'
      });
    }

    steps.push({
      step: steps.length + 1,
      action: 'Proceed with implementation',
      priority: 'medium',
      estimated_time: 'varies'
    });

    return steps;
  }

  /**
   * Log strategic analysis to MySQL
   */
  async logAnalysis(analysis) {
    if (!this.db) return;

    try {
      await this.db.query(`
        INSERT INTO athena_strategic_questions
        (session_id, tier, questions, assumptions, tradeoffs, consequences, alternatives, recommendation, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        analysis.mission_id,
        analysis.tier,
        JSON.stringify(analysis.strategic_questions),
        JSON.stringify(analysis.assumptions_identified),
        JSON.stringify(analysis.tradeoffs_analysis),
        JSON.stringify(analysis.second_order_consequences),
        JSON.stringify(analysis.alternative_approaches),
        JSON.stringify(analysis.recommendation),
        analysis.timestamp
      ]);
    } catch (error) {
      console.warn('⚠️ ATHENA strategic analysis log table not ready:', error.message);
    }
  }

  /**
   * Cleanup
   */
  getMySQLTimestamp() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  async cleanup() {
    if (this.db) {
      await this.db.end();
      console.log('🎖️ ATHENA STRATEGIC QUESTIONER - Connection closed');
    }
  }
}

// Export for integration
module.exports = AthenaStrategicQuestioner;

// CLI testing interface
if (require.main === module) {
  (async () => {
    const questioner = new AthenaStrategicQuestioner();
    await questioner.initialize();

    console.log('\n🎖️ ATHENA STRATEGIC QUESTIONER - Test Interface [PRO+ ONLY]\n');

    const testPlan = {
      task: 'Implement OAuth2 with JWT tokens and refresh rotation',
      complexity: 85,
      technology_stack: ['Node.js', 'JWT', 'Redis'],
      timeline: 'normal',
      expected_outcome: 'Secure authentication system'
    };

    const testContext = {
      session_id: 'test-2025-01-athena-strategic',
      user_tier: 'PRO',
      complexity_score: 85,
      mission_type: 'feature_implementation',
      user_message: 'Implement OAuth2 authentication'
    };

    const analysis = await questioner.analyze(testPlan, testContext);
    console.log('\n📊 Strategic Analysis:');
    console.log(JSON.stringify(analysis, null, 2));

    await questioner.cleanup();
  })();
}
