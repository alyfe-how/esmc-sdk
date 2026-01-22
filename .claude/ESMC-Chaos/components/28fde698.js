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
/** ESMC 3.13 ATHENA DIALOGUE | 2025-10-14 | v3.13.0 | PROD | ALL_TIERS
 *  Purpose: Strategic partnership with ECHELON - conversational interface ("The Wife" to ECHELON's "Husband")
 *  Features: Strategic wisdom | Thoughtful questioning | MESH synthesis | Refined execution flow
 *  Architecture: MESH→ECHELON→ATHENA→Refinement | Technical mastery + strategic wisdom = complete intelligence
 */

const fs = require('fs').promises;
const path = require('path');
// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)
const AtlasRetrievalSystem = require('./4bb69ab9.js'); // 🆕 ESMC 3.14.1: Bulletproof path resolution

class AthenaDialoguePartner {
  constructor() {
    this.version = '3.14.1'; // 🆕 Updated for bulletproof path resolution
    this.tier = 'ALL'; // Available to all subscription tiers
    this.personality = {
      role: 'strategic_confidant',
      metaphor: 'the_wife',
      relationship: 'epsilon_partner',
      communication_style: 'thoughtful_questioning',
      core_traits: ['wisdom', 'patience', 'strategic_thinking', 'empathy']
    };
    this.db = null;

    // 🆕 ESMC 3.14.1: Use ATLAS bulletproof path resolution instead of process.cwd()
    // 🆕 ESMC 3.100.0: Point to sessions directory (AEGIS seed files live here)
    const atlas = new AtlasRetrievalSystem();
    this.memoryPath = path.join(atlas.projectRoot, '.claude/memory/sessions');
  }

  /**
   * Initialize ATHENA dialogue system
   * ESMC 3.99.2: Skip MySQL in CLI mode (ESMC_SILENT env var) - AEGIS file-based supremacy
   */
  async initialize() {
    try {
      // ESMC 3.99.2: Skip MySQL connection if ESMC_SILENT=true (CLI mode)
      if (process.env.ESMC_SILENT === 'true') {
        // CLI mode: Skip database, use file-based memory only
        await this.loadMemory();
        console.log('🎖️ ATHENA DIALOGUE PARTNER - Initialized (CLI mode - AEGIS)');
        return { success: true, version: this.version, tier: this.tier };
      }

      // Production mode: Attempt MySQL connection (optional fallback)
      // 🆕 ESMC 4.1: Dynamic require for SDK compatibility
      const mysql = require('mysql2/promise');
      this.db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'battlefield_intelligence'
      });

      // Load ATHENA memory files
      await this.loadMemory();

      console.log('🎖️ ATHENA DIALOGUE PARTNER - Initialized (v3.13.0)');
      return { success: true, version: this.version, tier: this.tier };
    } catch (error) {
      console.error('❌ ATHENA initialization failed:', error.message);
      // Graceful fallback: Continue with file-based memory
      await this.loadMemory();
      console.log('⚠️  ATHENA - Falling back to file-based memory (AEGIS mode)');
      return { success: false, error: error.message };
    }
  }

  /**
   * Load ATHENA's memory (strategic intelligence + partnership architecture)
   * 🆕 ESMC 3.100.0: Dynamic AEGIS seed file discovery
   */
  async loadMemory() {
    try {
      // 🆕 ESMC 3.100.0: Dynamically find AEGIS seed files matching pattern
      // Pattern: YYYY-MM-DD-athena-strategic-intelligence.json
      // Pattern: YYYY-MM-DD-athena-partnership-architecture.json
      const fsSync = require('fs');
      const allFiles = await fs.readdir(this.memoryPath);

      // Find ATHENA memory files (dated AEGIS format)
      const strategyFiles = allFiles
        .filter(f => f.includes('athena-strategic-intelligence.json'))
        .sort()
        .reverse(); // Most recent first

      const partnershipFiles = allFiles
        .filter(f => f.includes('athena-partnership-architecture.json'))
        .sort()
        .reverse(); // Most recent first

      if (strategyFiles.length === 0 || partnershipFiles.length === 0) {
        throw new Error('ATHENA memory files not found in sessions directory');
      }

      // Load most recent files
      const strategyFile = path.join(this.memoryPath, strategyFiles[0]);
      const partnershipFile = path.join(this.memoryPath, partnershipFiles[0]);

      const [strategy, partnership] = await Promise.all([
        fs.readFile(strategyFile, 'utf-8').then(JSON.parse),
        fs.readFile(partnershipFile, 'utf-8').then(JSON.parse)
      ]);

      this.memory = { strategy, partnership };

      // Silent success (no log spam)
      return this.memory;
    } catch (error) {
      console.warn('⚠️ ATHENA memory files not found - using defaults');
      console.warn(`   Searched in: ${this.memoryPath}`);
      console.warn(`   Pattern: *athena-strategic-intelligence.json, *athena-partnership-architecture.json`);
      this.memory = { strategy: null, partnership: null };
      return this.memory;
    }
  }

  /**
   * CORE FUNCTION: ATHENA's conversational interface
   * Called by EPSILON after MESH consensus
   *
   * @param {Object} epsilonPlan - EPSILON's synthesized plan from MESH intelligence
   * @param {Object} context - Mission context (user message, complexity, tier)
   * @returns {Object} ATHENA's strategic dialogue response
   */
  async engage(epsilonPlan, context) {
    try {
      const dialogue = {
        timestamp: this.getMySQLTimestamp(),
        mission_id: context.session_id,
        tier: context.user_tier || 'FREE',
        epsilon_plan: epsilonPlan,
        athena_response: null,
        questions_raised: [],
        strategic_insights: [],
        refinements_suggested: []
      };

      // ATHENA's conversational response based on complexity
      if (context.complexity_score < 30) {
        // Simple tasks - Brief acknowledgment
        dialogue.athena_response = this.simpleAcknowledgment(epsilonPlan);
      } else if (context.complexity_score < 60) {
        // Medium tasks - Thoughtful question
        dialogue.athena_response = await this.thoughtfulQuestion(epsilonPlan, context);
        dialogue.questions_raised = this.generateQuestions(epsilonPlan, 'medium');
      } else {
        // Complex tasks - Deep strategic dialogue
        dialogue.athena_response = await this.strategicDialogue(epsilonPlan, context);
        dialogue.questions_raised = this.generateQuestions(epsilonPlan, 'complex');
        dialogue.strategic_insights = await this.gatherInsights(epsilonPlan, context);
      }

      // Log to MySQL (ALL TIERS)
      await this.logDialogue(dialogue);

      return dialogue;
    } catch (error) {
      console.error('❌ ATHENA dialogue engagement failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Simple acknowledgment for low-complexity tasks
   */
  simpleAcknowledgment(epsilonPlan) {
    const acknowledgments = [
      "That approach makes sense.",
      "I trust your technical judgment here.",
      "Straightforward and effective.",
      "This will work well.",
      "I see no concerns with this plan."
    ];
    return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
  }

  /**
   * Thoughtful questioning for medium-complexity tasks
   */
  async thoughtfulQuestion(epsilonPlan, context) {
    const questions = [
      `Before we proceed, what's the user's end goal here? Sometimes the stated task isn't what they truly need.`,
      `Have we considered the long-term implications of this approach?`,
      `Is there a simpler way to achieve the same result?`,
      `What could go wrong, and how would we recover?`,
      `Does this align with what the user has done before?`
    ];

    // Select contextually appropriate question
    const question = questions[Math.floor(Math.random() * questions.length)];

    return {
      type: 'thoughtful_question',
      question: question,
      reasoning: 'Medium complexity warrants strategic consideration',
      action: 'epsilon_to_refine'
    };
  }

  /**
   * Deep strategic dialogue for high-complexity tasks
   */
  async strategicDialogue(epsilonPlan, context) {
    return {
      type: 'strategic_dialogue',
      opening: "Let's think through this carefully together.",
      key_questions: this.generateQuestions(epsilonPlan, 'complex'),
      concerns: await this.identifyConcerns(epsilonPlan, context),
      alternative_perspectives: await this.suggestAlternatives(epsilonPlan, context),
      recommendation: this.synthesizeRecommendation(epsilonPlan, context),
      closing: "What do you think? Does this feel right?"
    };
  }

  /**
   * Generate strategic questions based on plan complexity
   */
  generateQuestions(epsilonPlan, complexity) {
    const baseQuestions = [
      "Why this approach over alternatives?",
      "What are we optimizing for - speed, security, maintainability?",
      "Have we seen the user do something similar before?"
    ];

    if (complexity === 'complex') {
      return [
        ...baseQuestions,
        "What are the second-order consequences of this decision?",
        "How does this fit into the user's broader project goals?",
        "What assumptions are we making that might be wrong?",
        "If we had 10x the time, would we do this differently?",
        "What would cause us to regret this decision in 6 months?"
      ];
    }

    return baseQuestions.slice(0, 2); // Medium complexity = 2 questions
  }

  /**
   * Identify strategic concerns
   */
  async identifyConcerns(epsilonPlan, context) {
    const concerns = [];

    // Check for common pitfalls
    if (epsilonPlan.implementation?.includes('TODO')) {
      concerns.push({
        type: 'incomplete_planning',
        severity: 'medium',
        description: 'Plan contains placeholders - needs full specification'
      });
    }

    if (epsilonPlan.security_considerations?.length === 0) {
      concerns.push({
        type: 'security_oversight',
        severity: 'high',
        description: 'No security considerations identified - potential blind spot'
      });
    }

    if (epsilonPlan.testing_strategy === 'none') {
      concerns.push({
        type: 'validation_gap',
        severity: 'medium',
        description: 'No testing strategy defined - how will we verify success?'
      });
    }

    return concerns;
  }

  /**
   * Suggest alternative perspectives
   */
  async suggestAlternatives(epsilonPlan, context) {
    return [
      {
        perspective: 'user_experience',
        question: 'How will this feel from the user\'s perspective?',
        consideration: 'Sometimes technically correct ≠ user-friendly'
      },
      {
        perspective: 'maintenance',
        question: 'Will the user (or next developer) understand this in 6 months?',
        consideration: 'Clever code can become technical debt'
      },
      {
        perspective: 'scalability',
        question: 'What happens when this grows 10x?',
        consideration: 'Early architectural decisions compound over time'
      }
    ];
  }

  /**
   * Synthesize strategic recommendation
   */
  synthesizeRecommendation(epsilonPlan, context) {
    return {
      verdict: 'proceed_with_refinements',
      confidence: 0.85,
      reasoning: 'Plan is technically sound but would benefit from strategic refinements',
      suggested_refinements: [
        'Add explicit error handling strategy',
        'Consider user workflow implications',
        'Define success metrics before implementation'
      ]
    };
  }

  /**
   * Gather strategic insights from memory and patterns
   */
  async gatherInsights(epsilonPlan, context) {
    const insights = [];

    // Query past similar missions from MySQL
    if (this.db) {
      try {
        const [pastMissions] = await this.db.query(`
          SELECT session_id, mission_type, results
          FROM general_intel
          WHERE mission_type LIKE ?
          ORDER BY timestamp DESC
          LIMIT 5
        `, [`%${context.mission_type}%`]);

        if (pastMissions.length > 0) {
          insights.push({
            type: 'historical_pattern',
            insight: `We've done ${pastMissions.length} similar missions before`,
            relevance: 'Past lessons can inform current approach'
          });
        }
      } catch (error) {
        console.warn('⚠️ Could not retrieve historical insights:', error.message);
      }
    }

    return insights;
  }

  /**
   * Log ATHENA dialogue to MySQL
   */
  async logDialogue(dialogue) {
    if (!this.db) return;

    try {
      await this.db.query(`
        INSERT INTO athena_dialogue_log
        (session_id, tier, epsilon_plan, athena_response, questions_raised, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        dialogue.mission_id,
        dialogue.tier,
        JSON.stringify(dialogue.epsilon_plan),
        JSON.stringify(dialogue.athena_response),
        JSON.stringify(dialogue.questions_raised),
        dialogue.timestamp
      ]);
    } catch (error) {
      // Table might not exist yet (created in Wave 4)
      console.warn('⚠️ ATHENA dialogue log table not ready:', error.message);
    }
  }

  /**
   * Get ATHENA's personality profile
   */
  getPersonality() {
    return {
      name: 'ATHENA',
      role: 'Strategic Confidant',
      relationship: 'EPSILON\'s Partner',
      metaphor: 'The Wife - Wisdom to balance brilliance',
      core_philosophy: 'Technical mastery + Strategic wisdom = Complete intelligence',
      communication_style: {
        approach: 'Thoughtful questioning',
        tone: 'Patient and empathetic',
        goal: 'Refine execution through strategic dialogue'
      },
      example_dialogue: {
        epsilon: "We'll implement OAuth2 with JWT tokens and refresh rotation.",
        athena: "That's technically sound. But let's pause - why is the user asking for this now? Have we confirmed they actually need OAuth2, or might a simpler auth strategy work? Sometimes users request complex solutions when they truly need something simpler.",
        epsilon: "Good point. Let me clarify the requirements first.",
        athena: "And when we do implement, let's think about error handling - what happens when refresh tokens expire during a transaction? That's where things usually break in production."
      }
    };
  }

  /**
   * Cleanup MySQL connection
   */
  getMySQLTimestamp() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  async cleanup() {
    if (this.db) {
      await this.db.end();
      console.log('🎖️ ATHENA DIALOGUE PARTNER - Connection closed');
    }
  }
}

// Export for integration with EPSILON
module.exports = AthenaDialoguePartner;

// CLI testing interface
if (require.main === module) {
  (async () => {
    const athena = new AthenaDialoguePartner();
    await athena.initialize();

    console.log('\n🎖️ ATHENA DIALOGUE PARTNER - Test Interface\n');
    console.log(JSON.stringify(athena.getPersonality(), null, 2));

    // Test simple engagement
    const testPlan = {
      task: 'Fix authentication bug',
      complexity: 25,
      approach: 'Validate JWT token expiration logic'
    };

    const testContext = {
      session_id: 'test-2025-01-athena',
      user_tier: 'FREE',
      complexity_score: 25,
      mission_type: 'bug_fix'
    };

    const dialogue = await athena.engage(testPlan, testContext);
    console.log('\n📝 Test Dialogue:');
    console.log(JSON.stringify(dialogue, null, 2));

    await athena.cleanup();
  })();
}
