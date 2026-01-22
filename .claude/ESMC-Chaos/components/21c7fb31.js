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
/** ESMC 3.13 PIU | 2025-10-17 | v3.13.0 | PROD | ALL_TIERS
 *  Purpose: Project intent understanding - infers "why" behind commands (goals, stakeholders, success criteria)
 *  Features: ATLAS spatial awareness | File lookup | Domain awareness | ECHO working memory | Intent confidence scoring
 */

// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)
const AtlasRetrievalSystem = require('./4bb69ab9.js'); // ATLAS 3.13: Memory + Structural awareness

class PIUIntentUnderstandingEngine {
    constructor(dbConfig = null) {
        this.dbConfig = dbConfig || {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'battlefield_intelligence'
        };

        this.connection = null;
        this.atlas = null; // ATLAS 3.13: Memory + Structural awareness
        this.echoContext = null; // 🆕 ESMC 3.22: ECHO working memory (current conversation)

        // Intent analysis confidence thresholds
        this.CONFIDENCE_THRESHOLDS = {
            HIGH: 0.80,
            MODERATE: 0.60,
            LOW: 0.40,
            NEEDS_CLARIFICATION: 0.40  // Below this = ask clarifying questions
        };

        // Goal categories
        this.GOAL_CATEGORIES = {
            USER_EXPERIENCE: 'user_experience',
            TECHNICAL_IMPROVEMENT: 'technical_improvement',
            COMPLIANCE: 'compliance',
            BUSINESS_VALUE: 'business_value',
            SECURITY: 'security',
            PERFORMANCE: 'performance',
            MAINTAINABILITY: 'maintainability'
        };

        // Stakeholder types
        this.STAKEHOLDER_TYPES = {
            END_USERS: 'end_users',
            DEVELOPERS: 'developers',
            BUSINESS_STAKEHOLDERS: 'business_stakeholders',
            COMPLIANCE_OFFICERS: 'compliance_officers',
            SECURITY_TEAM: 'security_team',
            OPERATIONS: 'operations'
        };

        // Success metric types
        this.SUCCESS_METRICS = {
            USER_FACING: 'user_facing',
            TECHNICAL: 'technical',
            COMPLIANCE: 'compliance',
            BUSINESS: 'business'
        };
    }

    /**
     * Initialize database connection
     * ESMC 3.99.1: Skip MySQL in CLI mode (ESMC_SILENT env var) - AEGIS file-based supremacy
     */
    async initialize() {
        // ESMC 3.99.1: Skip MySQL connection if ESMC_SILENT=true (CLI mode)
        if (process.env.ESMC_SILENT === 'true') {
            // CLI mode: Skip database, use ATLAS file-based retrieval only
            this.atlas = new AtlasRetrievalSystem();
            await this.atlas.loadProjectIndex();
            return true;
        }

        // Production mode: Attempt MySQL connection (optional fallback)
        try {
            // 🆕 ESMC 4.1: Dynamic require for SDK compatibility
            const mysql = require('mysql2/promise');
            this.connection = await mysql.createConnection(this.dbConfig);
            console.log('🎯 PIU Engine - Database connection established');

            // Initialize ATLAS 3.13: Memory + Structural awareness
            this.atlas = new AtlasRetrievalSystem();
            await this.atlas.loadProjectIndex();

            // 🆕 ESMC 3.22: Load ECHO working memory (current conversation context)
            // 🗑️ ESMC 3.60: ECHO deprecated - SEED supremacy (L003, Nov 1 2025)
            // await this._loadEchoContext();

            return true;
        } catch (error) {
            // Graceful fallback: MySQL unavailable, use ATLAS-only mode
            console.error('❌ PIU Engine - Database connection failed:', error.message);
            console.log('⚠️  PIU Engine - Falling back to ATLAS file-based retrieval (AEGIS mode)');

            this.atlas = new AtlasRetrievalSystem();
            await this.atlas.loadProjectIndex();
            return true; // Continue execution without MySQL
        }
    }

    /**
     * Main entry point: Analyze user command for project intent
     *
     * @param {string} userCommand - Raw user command
     * @param {number} missionId - ESMC mission ID
     * @param {number} projectId - User project ID
     * @param {object} contextData - Additional context (files, history, etc.)
     * @returns {Promise<object>} Intent analysis result
     */
    async analyzeIntent(userCommand, missionId = null, projectId = null, contextData = {}) {
        console.log(`\n🎯 PIU - PROJECT INTENT UNDERSTANDING ANALYSIS`);
        console.log(`Command: "${userCommand.substring(0, 100)}${userCommand.length > 100 ? '...' : ''}"`);

        try {
            // Step 1: Extract feature/task name
            const featureName = this._extractFeatureName(userCommand);

            // Step 2: Infer goals (primary + secondary)
            const goals = await this._inferGoals(userCommand, contextData);

            // Step 3: Identify stakeholders
            const stakeholders = await this._identifyStakeholders(userCommand, goals, contextData);

            // Step 4: Define success criteria
            const successCriteria = await this._defineSuccessCriteria(userCommand, goals, stakeholders);

            // Step 5: Calculate overall confidence score
            const confidenceScore = this._calculateConfidenceScore(goals, stakeholders, successCriteria);

            // Step 6: Generate clarifying questions if confidence is low
            const clarifyingQuestions = confidenceScore < this.CONFIDENCE_THRESHOLDS.NEEDS_CLARIFICATION
                ? this._generateClarifyingQuestions(goals, stakeholders, successCriteria)
                : [];

            // Step 7: Generate intent summary
            const intentSummary = this._generateIntentSummary(featureName, goals, stakeholders, successCriteria);

            const result = {
                featureName,
                goals,
                stakeholders,
                successCriteria,
                confidenceScore,
                clarifyingQuestions,
                intentSummary,
                timestamp: new Date().toISOString()
            };

            // Step 8: Store in database if connection available
            if (this.connection && missionId && projectId) {
                await this._storeIntentAnalysis(result, missionId, projectId);
            }

            // Step 9: 🆕 Enrich with ECHO working memory context
            const enrichedResult = this._enrichWithEchoContext(result);

            // Step 10: Display analysis report
            this._displayIntentReport(enrichedResult);

            return enrichedResult;

        } catch (error) {
            console.error('❌ PIU - Intent analysis failed:', error.message);
            return {
                success: false,
                error: error.message,
                featureName: 'Unknown',
                confidenceScore: 0.0
            };
        }
    }

    /**
     * Extract feature/task name from user command
     */
    _extractFeatureName(command) {
        // Remove ESMC triggers
        let cleaned = command.replace(/\b(use\s+)?esmc\b/gi, '').trim();

        // Extract action + object patterns
        const actionObjectPatterns = [
            /\b(implement|add|create|build|fix|update|refactor|optimize)\s+([a-z0-9\s\-_]+)/i,
            /\b(authentication|payment|dashboard|api|user\s+management|search|notification)/i,
            /(feature|functionality|system|component|module)\s+for\s+([a-z0-9\s\-_]+)/i
        ];

        for (const pattern of actionObjectPatterns) {
            const match = cleaned.match(pattern);
            if (match) {
                return match[0].trim().substring(0, 100);  // Max 100 chars
            }
        }

        // Fallback: Use first 50 chars
        return cleaned.substring(0, 50).trim() || 'Unspecified Task';
    }

    /**
     * Infer project goals from user command
     */
    async _inferGoals(command, contextData) {
        const goals = [];
        const commandLower = command.toLowerCase();

        // Pattern-based goal inference
        const goalPatterns = [
            // User Experience Goals
            {
                pattern: /\b(user|ux|experience|interface|ui|usability|accessibility)\b/,
                category: this.GOAL_CATEGORIES.USER_EXPERIENCE,
                goal: 'Improve user experience and accessibility',
                confidence: 0.85
            },
            {
                pattern: /\b(authentication|login|signup|register|password|oauth)\b/,
                category: this.GOAL_CATEGORIES.USER_EXPERIENCE,
                goal: 'Enable secure user authentication',
                confidence: 0.90
            },

            // Technical Goals
            {
                pattern: /\b(performance|speed|optimize|fast|cache|latency)\b/,
                category: this.GOAL_CATEGORIES.PERFORMANCE,
                goal: 'Improve system performance and response times',
                confidence: 0.85
            },
            {
                pattern: /\b(refactor|clean|maintainability|technical debt|architecture)\b/,
                category: this.GOAL_CATEGORIES.MAINTAINABILITY,
                goal: 'Improve code maintainability and architecture',
                confidence: 0.80
            },
            {
                pattern: /\b(api|integration|endpoint|rest|graphql|webhook)\b/,
                category: this.GOAL_CATEGORIES.TECHNICAL_IMPROVEMENT,
                goal: 'Enhance API capabilities and integrations',
                confidence: 0.85
            },

            // Security Goals
            {
                pattern: /\b(security|secure|vulnerability|encryption|auth|authorization)\b/,
                category: this.GOAL_CATEGORIES.SECURITY,
                goal: 'Strengthen security posture and protect data',
                confidence: 0.90
            },

            // Compliance Goals
            {
                pattern: /\b(gdpr|hipaa|pci|compliance|regulation|privacy|consent)\b/,
                category: this.GOAL_CATEGORIES.COMPLIANCE,
                goal: 'Ensure regulatory compliance and data privacy',
                confidence: 0.95
            },

            // Business Value Goals
            {
                pattern: /\b(payment|monetization|revenue|subscription|billing)\b/,
                category: this.GOAL_CATEGORIES.BUSINESS_VALUE,
                goal: 'Enable revenue generation and monetization',
                confidence: 0.90
            },
            {
                pattern: /\b(analytics|tracking|metrics|reporting|dashboard)\b/,
                category: this.GOAL_CATEGORIES.BUSINESS_VALUE,
                goal: 'Provide business insights through analytics',
                confidence: 0.80
            }
        ];

        // Match patterns and calculate confidence
        for (const { pattern, category, goal, confidence } of goalPatterns) {
            if (pattern.test(commandLower)) {
                goals.push({
                    goal,
                    category,
                    confidence,
                    reasoning: `Detected keyword match: ${pattern.source}`
                });
            }
        }

        // Infer additional goals from context data (project domain, recent history)
        if (contextData.projectDomain) {
            const domainGoals = this._inferDomainSpecificGoals(contextData.projectDomain, commandLower);
            goals.push(...domainGoals);
        }

        // If no goals detected, provide generic fallback
        if (goals.length === 0) {
            goals.push({
                goal: 'Complete technical task as specified',
                category: this.GOAL_CATEGORIES.TECHNICAL_IMPROVEMENT,
                confidence: 0.50,
                reasoning: 'No specific goal patterns detected - generic technical task'
            });
        }

        // Sort by confidence (highest first)
        return goals.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Infer domain-specific goals
     */
    _inferDomainSpecificGoals(domain, commandLower) {
        const domainGoals = {
            'NONPROFIT': [
                {
                    pattern: /\b(donor|donation|fundraising|giving|supporter)\b/,
                    goal: 'Support donor engagement and fundraising',
                    category: this.GOAL_CATEGORIES.BUSINESS_VALUE,
                    confidence: 0.85
                },
                {
                    pattern: /\b(beneficiary|impact|transparency|trust)\b/,
                    goal: 'Demonstrate impact and build public trust',
                    category: this.GOAL_CATEGORIES.BUSINESS_VALUE,
                    confidence: 0.80
                }
            ],
            'HEALTHCARE': [
                {
                    pattern: /\b(patient|medical|health|hipaa|phi)\b/,
                    goal: 'Ensure HIPAA compliance for patient data',
                    category: this.GOAL_CATEGORIES.COMPLIANCE,
                    confidence: 0.95
                }
            ],
            'FINANCE': [
                {
                    pattern: /\b(transaction|payment|pci|financial|banking)\b/,
                    goal: 'Ensure PCI DSS compliance for financial data',
                    category: this.GOAL_CATEGORIES.COMPLIANCE,
                    confidence: 0.95
                }
            ],
            'ECOMMERCE': [
                {
                    pattern: /\b(checkout|cart|product|payment|order)\b/,
                    goal: 'Optimize conversion funnel and revenue',
                    category: this.GOAL_CATEGORIES.BUSINESS_VALUE,
                    confidence: 0.85
                }
            ]
        };

        const goals = [];
        const domainPatterns = domainGoals[domain] || [];

        for (const { pattern, goal, category, confidence } of domainPatterns) {
            if (pattern.test(commandLower)) {
                goals.push({
                    goal,
                    category,
                    confidence,
                    reasoning: `Domain-specific goal for ${domain}`
                });
            }
        }

        return goals;
    }

    /**
     * Identify stakeholders affected by this task
     */
    async _identifyStakeholders(command, goals, contextData) {
        const stakeholders = {
            primary: [],
            secondary: [],
            technical: [],
            compliance: []
        };

        // Infer stakeholders from goals
        for (const { category } of goals) {
            switch (category) {
                case this.GOAL_CATEGORIES.USER_EXPERIENCE:
                    stakeholders.primary.push(this.STAKEHOLDER_TYPES.END_USERS);
                    stakeholders.secondary.push(this.STAKEHOLDER_TYPES.BUSINESS_STAKEHOLDERS);
                    break;

                case this.GOAL_CATEGORIES.COMPLIANCE:
                    stakeholders.primary.push(this.STAKEHOLDER_TYPES.COMPLIANCE_OFFICERS);
                    stakeholders.secondary.push(this.STAKEHOLDER_TYPES.END_USERS);
                    stakeholders.compliance.push(this.STAKEHOLDER_TYPES.COMPLIANCE_OFFICERS);
                    break;

                case this.GOAL_CATEGORIES.SECURITY:
                    stakeholders.primary.push(this.STAKEHOLDER_TYPES.SECURITY_TEAM);
                    stakeholders.secondary.push(this.STAKEHOLDER_TYPES.END_USERS);
                    break;

                case this.GOAL_CATEGORIES.BUSINESS_VALUE:
                    stakeholders.primary.push(this.STAKEHOLDER_TYPES.BUSINESS_STAKEHOLDERS);
                    stakeholders.secondary.push(this.STAKEHOLDER_TYPES.END_USERS);
                    break;

                case this.GOAL_CATEGORIES.PERFORMANCE:
                case this.GOAL_CATEGORIES.MAINTAINABILITY:
                case this.GOAL_CATEGORIES.TECHNICAL_IMPROVEMENT:
                    stakeholders.technical.push(this.STAKEHOLDER_TYPES.DEVELOPERS);
                    stakeholders.secondary.push(this.STAKEHOLDER_TYPES.OPERATIONS);
                    break;
            }
        }

        // Deduplicate
        stakeholders.primary = [...new Set(stakeholders.primary)];
        stakeholders.secondary = [...new Set(stakeholders.secondary)];
        stakeholders.technical = [...new Set(stakeholders.technical)];
        stakeholders.compliance = [...new Set(stakeholders.compliance)];

        return stakeholders;
    }

    /**
     * Define success criteria for this task
     */
    async _defineSuccessCriteria(command, goals, stakeholders) {
        const criteria = {
            userSuccess: [],
            technicalSuccess: [],
            complianceSuccess: [],
            businessSuccess: []
        };

        // Generate criteria based on goals
        for (const { goal, category, confidence } of goals) {
            switch (category) {
                case this.GOAL_CATEGORIES.USER_EXPERIENCE:
                    criteria.userSuccess.push({
                        criterion: 'User can complete the task without errors',
                        measurable: true,
                        metric: 'Error rate < 1%',
                        confidence
                    });
                    criteria.userSuccess.push({
                        criterion: 'User experience is intuitive and accessible',
                        measurable: true,
                        metric: 'WCAG 2.1 AA compliance',
                        confidence: confidence * 0.9
                    });
                    break;

                case this.GOAL_CATEGORIES.PERFORMANCE:
                    criteria.technicalSuccess.push({
                        criterion: 'System performance meets or exceeds baseline',
                        measurable: true,
                        metric: 'Response time < 200ms (p95)',
                        confidence
                    });
                    break;

                case this.GOAL_CATEGORIES.SECURITY:
                    criteria.technicalSuccess.push({
                        criterion: 'No security vulnerabilities introduced',
                        measurable: true,
                        metric: 'Zero HIGH/CRITICAL security findings',
                        confidence
                    });
                    criteria.complianceSuccess.push({
                        criterion: 'Security best practices followed (OWASP)',
                        measurable: true,
                        metric: 'OWASP Top 10 compliance',
                        confidence: confidence * 0.95
                    });
                    break;

                case this.GOAL_CATEGORIES.COMPLIANCE:
                    criteria.complianceSuccess.push({
                        criterion: 'Regulatory compliance requirements met',
                        measurable: true,
                        metric: 'Compliance audit passes',
                        confidence
                    });
                    break;

                case this.GOAL_CATEGORIES.BUSINESS_VALUE:
                    criteria.businessSuccess.push({
                        criterion: 'Business metrics improve measurably',
                        measurable: true,
                        metric: 'Conversion rate increase or cost reduction',
                        confidence: confidence * 0.8
                    });
                    break;

                case this.GOAL_CATEGORIES.MAINTAINABILITY:
                    criteria.technicalSuccess.push({
                        criterion: 'Code complexity reduced and maintainability improved',
                        measurable: true,
                        metric: 'Cyclomatic complexity < 10, test coverage > 80%',
                        confidence
                    });
                    break;
            }
        }

        // Add universal technical criteria
        criteria.technicalSuccess.push({
            criterion: 'Implementation is complete and functional',
            measurable: true,
            metric: 'All tests pass, no regressions',
            confidence: 0.95
        });

        return criteria;
    }

    /**
     * Calculate overall confidence score for intent analysis
     */
    _calculateConfidenceScore(goals, stakeholders, successCriteria) {
        let score = 0.0;
        let components = 0;

        // Goals confidence (40% weight)
        if (goals.length > 0) {
            const avgGoalConfidence = goals.reduce((sum, g) => sum + g.confidence, 0) / goals.length;
            score += avgGoalConfidence * 0.40;
            components++;
        }

        // Stakeholders clarity (20% weight)
        const stakeholderCount = stakeholders.primary.length + stakeholders.secondary.length;
        const stakeholderScore = Math.min(stakeholderCount / 3, 1.0);  // Ideal: 2-4 stakeholder types
        score += stakeholderScore * 0.20;
        components++;

        // Success criteria clarity (40% weight)
        const criteriaCount =
            successCriteria.userSuccess.length +
            successCriteria.technicalSuccess.length +
            successCriteria.complianceSuccess.length +
            successCriteria.businessSuccess.length;
        const criteriaScore = Math.min(criteriaCount / 4, 1.0);  // Ideal: 3-5 criteria
        score += criteriaScore * 0.40;
        components++;

        return Math.round(score * 100) / 100;  // Round to 2 decimals
    }

    /**
     * Generate clarifying questions if confidence is low
     */
    _generateClarifyingQuestions(goals, stakeholders, successCriteria) {
        const questions = [];

        // If goals are vague
        if (goals.length === 0 || goals[0].confidence < this.CONFIDENCE_THRESHOLDS.MODERATE) {
            questions.push({
                question: 'What is the primary goal or outcome you want to achieve with this task?',
                reason: 'Goal clarity is low',
                priority: 'HIGH'
            });
        }

        // If stakeholders are unclear
        if (stakeholders.primary.length === 0) {
            questions.push({
                question: 'Who are the primary users or stakeholders who will benefit from this?',
                reason: 'Stakeholder identification needed',
                priority: 'MEDIUM'
            });
        }

        // If success criteria are vague
        const totalCriteria =
            successCriteria.userSuccess.length +
            successCriteria.technicalSuccess.length +
            successCriteria.complianceSuccess.length +
            successCriteria.businessSuccess.length;

        if (totalCriteria < 2) {
            questions.push({
                question: 'How will you know this task is complete and successful?',
                reason: 'Success criteria need definition',
                priority: 'HIGH'
            });
        }

        return questions;
    }

    /**
     * Generate human-readable intent summary
     */
    _generateIntentSummary(featureName, goals, stakeholders, successCriteria) {
        const primaryGoal = goals[0]?.goal || 'Complete task';
        const primaryStakeholders = stakeholders.primary.join(', ') || 'team';
        const keyMetric = successCriteria.userSuccess[0]?.metric ||
                         successCriteria.technicalSuccess[0]?.metric ||
                         'task completion';

        return `Implementing "${featureName}" to ${primaryGoal} for ${primaryStakeholders}, measured by ${keyMetric}.`;
    }

    /**
     * Store intent analysis in database
     */
    async _storeIntentAnalysis(result, missionId, projectId) {
        try {
            const query = `
                INSERT INTO project_intents (
                    project_id, mission_id, feature_name, inferred_goals,
                    stakeholders, success_criteria, confidence_score,
                    clarifying_questions, intent_summary, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await this.connection.execute(query, [
                projectId,
                missionId,
                result.featureName,
                JSON.stringify(result.goals),
                JSON.stringify(result.stakeholders),
                JSON.stringify(result.successCriteria),
                result.confidenceScore,
                JSON.stringify(result.clarifyingQuestions),
                result.intentSummary
            ]);

            console.log('✅ PIU - Intent analysis stored in database');

        } catch (error) {
            console.error('❌ PIU - Failed to store intent analysis:', error.message);
        }
    }

    /**
     * Display intent analysis report
     */
    _displayIntentReport(result) {
        console.log(`\n${'='.repeat(80)}`);
        console.log('🎯 PIU - PROJECT INTENT UNDERSTANDING REPORT');
        console.log('='.repeat(80));

        console.log(`\n📋 Feature: ${result.featureName}`);
        console.log(`🎯 Intent Summary: ${result.intentSummary}`);
        console.log(`📊 Confidence Score: ${(result.confidenceScore * 100).toFixed(0)}%`);

        // Goals
        console.log(`\n🎯 INFERRED GOALS (${result.goals.length}):`);
        result.goals.forEach((goal, index) => {
            console.log(`   ${index + 1}. ${goal.goal}`);
            console.log(`      Category: ${goal.category} | Confidence: ${(goal.confidence * 100).toFixed(0)}%`);
        });

        // Stakeholders
        console.log(`\n👥 STAKEHOLDERS:`);
        if (result.stakeholders.primary.length > 0) {
            console.log(`   Primary: ${result.stakeholders.primary.join(', ')}`);
        }
        if (result.stakeholders.secondary.length > 0) {
            console.log(`   Secondary: ${result.stakeholders.secondary.join(', ')}`);
        }
        if (result.stakeholders.technical.length > 0) {
            console.log(`   Technical: ${result.stakeholders.technical.join(', ')}`);
        }
        if (result.stakeholders.compliance.length > 0) {
            console.log(`   Compliance: ${result.stakeholders.compliance.join(', ')}`);
        }

        // Success Criteria
        console.log(`\n✅ SUCCESS CRITERIA:`);
        if (result.successCriteria.userSuccess.length > 0) {
            console.log(`   User Success:`);
            result.successCriteria.userSuccess.forEach(c => {
                console.log(`      - ${c.criterion} (${c.metric})`);
            });
        }
        if (result.successCriteria.technicalSuccess.length > 0) {
            console.log(`   Technical Success:`);
            result.successCriteria.technicalSuccess.forEach(c => {
                console.log(`      - ${c.criterion} (${c.metric})`);
            });
        }
        if (result.successCriteria.complianceSuccess.length > 0) {
            console.log(`   Compliance Success:`);
            result.successCriteria.complianceSuccess.forEach(c => {
                console.log(`      - ${c.criterion} (${c.metric})`);
            });
        }
        if (result.successCriteria.businessSuccess.length > 0) {
            console.log(`   Business Success:`);
            result.successCriteria.businessSuccess.forEach(c => {
                console.log(`      - ${c.criterion} (${c.metric})`);
            });
        }

        // Clarifying Questions
        if (result.clarifyingQuestions.length > 0) {
            console.log(`\n❓ CLARIFYING QUESTIONS NEEDED (Confidence < ${this.CONFIDENCE_THRESHOLDS.NEEDS_CLARIFICATION * 100}%):`);
            result.clarifyingQuestions.forEach((q, index) => {
                console.log(`   ${index + 1}. [${q.priority}] ${q.question}`);
                console.log(`      Reason: ${q.reason}`);
            });
        }

        console.log(`\n${'='.repeat(80)}\n`);
    }

    /**
     * 🆕 ESMC 3.22: Load ECHO working memory context
     * Retrieves current conversation checkpoint for context awareness
     * @private
     */
    async _loadEchoContext() {
        if (!this.atlas) {
            console.log('   ⚠️ PIU: ATLAS not initialized, skipping ECHO load');
            return;
        }

        try {
            // Use ATLAS retrieveV3() to get ECHO context
            const result = await this.atlas.retrieveV3('current conversation', {
                retrieveEcho: true,
                useFootprint: false
            });

            if (result.echo_context) {
                this.echoContext = result.echo_context;
                console.log(`   📸 PIU: ECHO context loaded - ${result.echo_context.current_task || 'N/A'}`);
            } else {
                console.log('   📸 PIU: No ECHO context available (new conversation)');
            }
        } catch (error) {
            console.warn(`   ⚠️ PIU: ECHO load failed (non-blocking): ${error.message}`);
        }
    }

    /**
     * 🆕 ESMC 3.22: Enrich intent analysis with ECHO working memory
     * Auto-injects current conversation context into all results
     * @param {object} result - Base intent analysis result
     * @returns {object} Enriched result with ECHO context
     * @private
     */
    _enrichWithEchoContext(result) {
        if (!this.echoContext) {
            // No ECHO context available - return original result
            return {
                ...result,
                echo_working_memory: null,
                echo_enrichment: {
                    available: false,
                    reason: 'No ECHO context (new conversation or counter=0)'
                }
            };
        }

        // Extract relevant ECHO intelligence for intent understanding
        const echoIntelligence = {
            current_conversation_task: this.echoContext.current_task || null,
            todos_in_progress: this.echoContext.todos || [],
            files_modified_today: this.echoContext.files_modified || [],
            key_decisions_made: this.echoContext.key_decisions || [],
            conversation_compact_count: this.echoContext.compact_counter || 0,
            esmc_state: this.echoContext.context?.esmc_state || null
        };

        // Calculate context alignment score
        const alignmentScore = this._calculateEchoAlignment(result, echoIntelligence);

        return {
            ...result,
            echo_working_memory: echoIntelligence,
            echo_enrichment: {
                available: true,
                alignment_score: alignmentScore,
                insight: this._generateEchoInsight(result, echoIntelligence, alignmentScore)
            }
        };
    }

    /**
     * Calculate alignment between intent analysis and ECHO context
     * @private
     */
    _calculateEchoAlignment(intentResult, echoIntelligence) {
        let score = 0;
        let factors = 0;

        // Factor 1: Task continuity (is this intent aligned with current task?)
        if (echoIntelligence.current_conversation_task) {
            const taskLower = echoIntelligence.current_conversation_task.toLowerCase();
            const intentLower = intentResult.featureName.toLowerCase();
            const overlap = taskLower.split(/\s+/).filter(word => intentLower.includes(word)).length;
            score += Math.min(overlap / 5, 1.0) * 0.4;
            factors++;
        }

        // Factor 2: File context (are we working on related files?)
        if (echoIntelligence.files_modified_today.length > 0) {
            score += 0.3; // Boost if files were modified today
            factors++;
        }

        // Factor 3: Todo alignment (is this intent related to pending todos?)
        if (echoIntelligence.todos_in_progress.length > 0) {
            score += 0.3; // Boost if todos exist
            factors++;
        }

        return factors > 0 ? Math.min(score, 1.0) : 0.5; // Default 0.5 if no factors
    }

    /**
     * Generate ECHO insight narrative
     * @private
     */
    _generateEchoInsight(intentResult, echoIntelligence, alignmentScore) {
        if (alignmentScore >= 0.7) {
            return `HIGH alignment with current work: "${echoIntelligence.current_conversation_task}". This intent continues the active conversation thread.`;
        } else if (alignmentScore >= 0.4) {
            return `MEDIUM alignment with current work. This intent is related but may represent a context shift.`;
        } else {
            return `LOW alignment with current work. This appears to be a new conversation direction.`;
        }
    }

    /**
     * Retrieve relevant memory using ATLAS 3-tier system
     * Used to inform intent understanding with past patterns
     */
    async retrieveRelevantMemory(query) {
        if (!this.atlas) return { found: false };

        try {
            // 🆕 ESMC 3.22: Use retrieveV3() for ECHO+HYDRA cascade
            const result = await this.atlas.retrieveV3(query, {
                retrieveEcho: true,
                useFootprint: true
            });
            return result;
        } catch (error) {
            console.warn(`⚠️ PIU memory retrieval failed: ${error.message}`);
            return { found: false };
        }
    }

    /**
     * 🆕 Find file using ATLAS structural awareness
     */
    async findFile(query) {
        if (!this.atlas) return { found: false, message: 'ATLAS not initialized' };
        return await this.atlas.findFile(query);
    }

    /**
     * 🆕 Get domain files using ATLAS
     */
    async getDomainFiles(domainName) {
        if (!this.atlas) return { found: false, message: 'ATLAS not initialized' };
        return await this.atlas.getDomainFiles(domainName);
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('🎯 PIU Engine - Database connection closed');
        }
    }
}

// Export
module.exports = PIUIntentUnderstandingEngine;

// Example usage (if run directly)
if (require.main === module) {
    (async () => {
        const piu = new PIUIntentUnderstandingEngine();
        await piu.initialize();

        // Test command
        const result = await piu.analyzeIntent(
            'Use ESMC implement user authentication with password reset for nonprofit donor portal',
            1,  // missionId
            1,  // projectId
            { projectDomain: 'NONPROFIT' }
        );

        await piu.close();
    })();
}