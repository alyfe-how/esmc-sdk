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
/** ESMC 3.6 EPSILON INTELLIGENCE | 2025-09-30 | v3.6.0 | PROD | TIER 2
 *  Purpose: COLONEL EPSILON "The Eye" intelligence coordinator integrating PIU/DKI/UIP
 *  Features: Command clarification | Intent understanding | RCA awareness | Workflow prediction | Proactive intelligence
 */

// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)
const PIUIntentUnderstandingEngine = require('./322a6ec7');
const DKIDomainKnowledgeEngine = require('./18548b52');
const UIPIntentPredictionEngine = require('./bb990d95');
const PreEmptiveFileIntelligence = require('./61a66169');
const ProfileSynthesisEngine = require('./8107990d');

class EPSILONIntelligenceCoordinator {
    constructor(dbConfig = null) {
        this.dbConfig = dbConfig || {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'battlefield_intelligence'
        };

        this.connection = null;

        // Initialize intelligence engines
        this.piu = new PIUIntentUnderstandingEngine(this.dbConfig);
        this.dki = new DKIDomainKnowledgeEngine(this.dbConfig);
        this.uip = new UIPIntentPredictionEngine(this.dbConfig);
        this.pfi = new PreEmptiveFileIntelligence(this.dbConfig);
        this.cup = new ProfileSynthesisEngine({
            projectRoot: process.cwd(),
            debugMode: false
        });

        // Intelligence thresholds
        this.THRESHOLDS = {
            COMMAND_CLARITY_MIN: 0.80,      // 80%+ clarity required to proceed
            MISSION_ALIGNMENT_MIN: 0.85,     // 85%+ alignment for completion approval
            PROACTIVE_SUGGESTION_MIN: 0.70   // 70%+ confidence to suggest proactively
        };

        // Session intelligence cache
        this.intelligenceCache = {
            projectIntent: null,
            domainContext: null,
            workflowPrediction: null,
            clarityScore: 0.0,
            alignmentScore: 0.0
        };
    }

    /**
     * Initialize EPSILON Intelligence system
     */
    async initialize() {
        console.log('\n🎖️ EPSILON INTELLIGENCE COORDINATOR - INITIALIZING...');

        try {
            // Initialize database connection
            // 🆕 ESMC 4.1: Dynamic require for SDK compatibility
            const mysql = require('mysql2/promise');
            this.connection = await mysql.createConnection(this.dbConfig);
            console.log('✅ EPSILON - Database connection established');

            // Initialize intelligence engines
            await this.piu.initialize();
            await this.dki.initialize();
            await this.uip.initialize();
            await this.pfi.initialize();
            await this.cup.initialize();

            console.log('✅ EPSILON Intelligence Coordinator (with PFI 3.10 + CUP 3.10) - Ready\n');
            return true;

        } catch (error) {
            console.error('❌ EPSILON - Initialization failed:', error.message);
            return false;
        }
    }

    /**
     * 🎯 PHASE 1: COMMAND CLARIFICATION WITH INTELLIGENCE
     * Analyze command before execution to ensure clarity
     *
     * @param {string} userCommand - Raw user command
     * @param {object} userProfile - User profile data
     * @param {object} projectContext - Project metadata
     * @returns {Promise<object>} Clarification result
     */
    async analyzeCommandClarity(userCommand, userProfile = {}, projectContext = {}) {
        console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║   🎖️ COLONEL EPSILON - COMMAND CLARIFICATION PROTOCOL                       ║');
        console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

        try {
            // Step 0: CUP - Continuous User Profiling (Silent Background Processing)
            let userPersonality = null;
            try {
                const cupResult = await this.cup.processMessage(userCommand);
                if (cupResult.success && cupResult.adaptation) {
                    userPersonality = {
                        mbti: cupResult.mbti,
                        adaptation: cupResult.adaptation,
                        profileUpdated: cupResult.profileUpdated
                    };
                }
            } catch (cupError) {
                // CUP failure is non-critical - continue without personality data
                console.log('ℹ️  CUP profiling unavailable (non-critical)');
            }

            // Step 1: PIU - Understand project intent
            console.log('🎯 PHASE 1.1 - PROJECT INTENT UNDERSTANDING (PIU)');
            const projectIntent = await this.piu.analyzeIntent(
                userCommand,
                null,  // missionId (not assigned yet)
                projectContext.projectId || null,
                { projectDomain: projectContext.domain }
            );

            // Step 2: DKI - Detect domain and compliance requirements
            console.log('\n🏢 PHASE 1.2 - DOMAIN KNOWLEDGE INTEGRATION (DKI)');
            const domainContext = await this.dki.analyzeDomain(
                userCommand,
                projectContext,
                null  // missionId (not assigned yet)
            );

            // Step 3: UIP - Predict workflow and next steps
            console.log('\n🔮 PHASE 1.3 - USER INTENT PREDICTION (UIP)');
            const workflowPrediction = await this.uip.predictNextSteps(
                userCommand,
                {
                    userId: userProfile.userId || null,
                    completedSteps: userProfile.recentSteps || [],
                    completedWorkflows: userProfile.completedWorkflows || 0
                },
                null  // missionId (not assigned yet)
            );

            // Step 4: Calculate command clarity score
            const clarityScore = this._calculateClarityScore(projectIntent, domainContext, workflowPrediction);

            // Step 5: Generate clarifying questions if needed
            const clarifyingQuestions = this._generateClarifyingQuestions(
                projectIntent,
                domainContext,
                workflowPrediction,
                clarityScore
            );

            // Step 6: Generate enhanced mission briefing
            const missionBriefing = this._generateMissionBriefing(
                userCommand,
                projectIntent,
                domainContext,
                workflowPrediction,
                clarityScore
            );

            // Cache intelligence for later phases
            this.intelligenceCache = {
                projectIntent,
                domainContext,
                workflowPrediction,
                clarityScore,
                alignmentScore: 0.0,  // Will be calculated in Phase 3
                userPersonality  // Store personality data for later use
            };

            const result = {
                clarityScore,
                needsClarification: clarityScore < this.THRESHOLDS.COMMAND_CLARITY_MIN,
                clarifyingQuestions,
                missionBriefing,
                projectIntent,
                domainContext,
                workflowPrediction,
                userPersonality,  // Include personality data in result
                timestamp: new Date().toISOString()
            };

            // Display clarification report
            this._displayClarificationReport(result);

            return result;

        } catch (error) {
            console.error('❌ EPSILON - Command clarification failed:', error.message);
            return {
                success: false,
                error: error.message,
                clarityScore: 0.0,
                needsClarification: true
            };
        }
    }

    /**
     * Calculate command clarity score (0.0 - 1.0)
     */
    _calculateClarityScore(projectIntent, domainContext, workflowPrediction) {
        let score = 0.0;

        // PIU confidence (40% weight)
        if (projectIntent && projectIntent.confidenceScore) {
            score += projectIntent.confidenceScore * 0.40;
        }

        // DKI domain detection (20% weight)
        if (domainContext && domainContext.detectedDomains) {
            const avgDomainConfidence = domainContext.detectedDomains.reduce(
                (sum, d) => sum + d.confidence, 0
            ) / Math.max(domainContext.detectedDomains.length, 1);
            score += avgDomainConfidence * 0.20;
        }

        // UIP workflow prediction (40% weight)
        if (workflowPrediction && workflowPrediction.predictionConfidence) {
            score += workflowPrediction.predictionConfidence * 0.40;
        }

        return Math.round(score * 100) / 100;
    }

    /**
     * Generate clarifying questions if clarity is insufficient
     */
    _generateClarifyingQuestions(projectIntent, domainContext, workflowPrediction, clarityScore) {
        const questions = [];

        // If clarity is sufficient, no questions needed
        if (clarityScore >= this.THRESHOLDS.COMMAND_CLARITY_MIN) {
            return questions;
        }

        // Collect questions from PIU
        if (projectIntent && projectIntent.clarifyingQuestions) {
            questions.push(...projectIntent.clarifyingQuestions);
        }

        // Add domain-specific questions if multiple domains detected
        if (domainContext && domainContext.detectedDomains && domainContext.detectedDomains.length > 1) {
            questions.push({
                question: `This task involves multiple domains (${domainContext.detectedDomains.map(d => d.domain).join(', ')}). Which domain's compliance requirements are most critical?`,
                reason: 'Multiple domains detected - prioritization needed',
                priority: 'MEDIUM'
            });
        }

        // Add workflow-specific questions if gaps detected
        if (workflowPrediction && workflowPrediction.gapDetection && workflowPrediction.gapDetection.length > 0) {
            const highGaps = workflowPrediction.gapDetection.filter(g => g.severity === 'HIGH');
            if (highGaps.length > 0) {
                questions.push({
                    question: `Detected missing critical steps: ${highGaps.map(g => g.gap).join(', ')}. Should these be included?`,
                    reason: 'Workflow gap detection',
                    priority: 'HIGH'
                });
            }
        }

        return questions;
    }

    /**
     * Generate enhanced mission briefing
     */
    _generateMissionBriefing(userCommand, projectIntent, domainContext, workflowPrediction, clarityScore) {
        const briefing = {
            command: userCommand,
            clarity: clarityScore,
            readyToExecute: clarityScore >= this.THRESHOLDS.COMMAND_CLARITY_MIN
        };

        // Intent summary
        if (projectIntent && projectIntent.intentSummary) {
            briefing.intentSummary = projectIntent.intentSummary;
        }

        // Domain context
        if (domainContext && domainContext.detectedDomains && domainContext.detectedDomains.length > 0) {
            briefing.domains = domainContext.detectedDomains.map(d => d.domain);
            briefing.complianceRequirements = domainContext.complianceRequirements?.length || 0;
        }

        // Workflow prediction
        if (workflowPrediction && workflowPrediction.detectedWorkflow) {
            briefing.workflow = workflowPrediction.detectedWorkflow.displayName;
            briefing.currentStep = workflowPrediction.currentStep?.step;
            briefing.nextSteps = workflowPrediction.nextSteps?.length || 0;
        }

        return briefing;
    }

    /**
     * Display clarification report
     */
    _displayClarificationReport(result) {
        console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║   📊 COMMAND CLARIFICATION ANALYSIS COMPLETE                                 ║');
        console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

        console.log(`📊 CLARITY SCORE: ${(result.clarityScore * 100).toFixed(0)}%`);
        console.log(`   Threshold: ${this.THRESHOLDS.COMMAND_CLARITY_MIN * 100}%`);
        console.log(`   Status: ${result.needsClarification ? '⚠️ NEEDS CLARIFICATION' : '✅ CLEAR TO PROCEED'}\n`);

        // Mission briefing
        if (result.missionBriefing) {
            console.log('📋 MISSION BRIEFING:');
            console.log(`   Intent: ${result.missionBriefing.intentSummary || 'Not specified'}`);
            console.log(`   Domains: ${result.missionBriefing.domains?.join(', ') || 'Generic'}`);
            console.log(`   Workflow: ${result.missionBriefing.workflow || 'Unknown'}`);
            console.log(`   Current Step: ${result.missionBriefing.currentStep || 'Unknown'}`);
            console.log(`   Compliance Requirements: ${result.missionBriefing.complianceRequirements || 0}\n`);
        }

        // Clarifying questions
        if (result.clarifyingQuestions.length > 0) {
            console.log(`❓ CLARIFYING QUESTIONS NEEDED (${result.clarifyingQuestions.length}):`);
            result.clarifyingQuestions.forEach((q, index) => {
                console.log(`   ${index + 1}. [${q.priority}] ${q.question}`);
                console.log(`      Reason: ${q.reason}`);
            });
            console.log();
        }

        console.log('═'.repeat(80) + '\n');
    }

    /**
     * 🎯 PHASE 2: INTELLIGENT MISSION EXECUTION
     * Provide real-time intelligence during mission execution
     *
     * @param {number} missionId - ESMC mission ID
     * @param {object} executionContext - Current execution context
     * @returns {Promise<object>} Intelligence updates
     */
    async provideExecutionIntelligence(missionId, executionContext = {}) {
        console.log('\n🎖️ EPSILON - PROVIDING EXECUTION INTELLIGENCE...\n');

        try {
            // Retrieve cached intelligence
            const { projectIntent, domainContext, workflowPrediction } = this.intelligenceCache;

            // Generate real-time intelligence
            const intelligence = {
                complianceReminders: this._generateComplianceReminders(domainContext, executionContext),
                workflowGuidance: this._generateWorkflowGuidance(workflowPrediction, executionContext),
                proactiveSuggestions: this._generateProactiveSuggestions(workflowPrediction, executionContext),
                riskAlerts: this._generateRiskAlerts(domainContext, projectIntent, executionContext)
            };

            // Display intelligence updates
            this._displayExecutionIntelligence(intelligence);

            return intelligence;

        } catch (error) {
            console.error('❌ EPSILON - Execution intelligence failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate compliance reminders during execution
     */
    _generateComplianceReminders(domainContext, executionContext) {
        if (!domainContext || !domainContext.complianceRequirements) {
            return [];
        }

        const reminders = [];
        const criticalCompliance = domainContext.complianceRequirements.filter(
            c => c.severity === 'CRITICAL'
        );

        for (const compliance of criticalCompliance) {
            reminders.push({
                standard: compliance.standard,
                reminder: `Ensure ${compliance.standard} compliance: ${compliance.requirements[0] || 'See full requirements'}`,
                severity: 'CRITICAL'
            });
        }

        return reminders;
    }

    /**
     * Generate workflow guidance during execution
     */
    _generateWorkflowGuidance(workflowPrediction, executionContext) {
        if (!workflowPrediction || !workflowPrediction.nextSteps) {
            return [];
        }

        const guidance = [];

        for (const nextStep of workflowPrediction.nextSteps) {
            if (nextStep.critical) {
                guidance.push({
                    step: nextStep.step,
                    guidance: `Critical step coming: ${nextStep.step}`,
                    priority: 'HIGH'
                });
            }
        }

        return guidance;
    }

    /**
     * Generate proactive suggestions during execution
     */
    _generateProactiveSuggestions(workflowPrediction, executionContext) {
        if (!workflowPrediction || !workflowPrediction.proactiveSuggestions) {
            return [];
        }

        // Filter suggestions by confidence threshold
        return workflowPrediction.proactiveSuggestions.filter(
            s => s.confidence >= this.THRESHOLDS.PROACTIVE_SUGGESTION_MIN
        );
    }

    /**
     * Generate risk alerts during execution
     */
    _generateRiskAlerts(domainContext, projectIntent, executionContext) {
        const alerts = [];

        // Check for high-severity compliance risks
        if (domainContext && domainContext.complianceRequirements) {
            const criticalCompliance = domainContext.complianceRequirements.filter(
                c => c.severity === 'CRITICAL'
            );

            if (criticalCompliance.length > 0) {
                alerts.push({
                    type: 'COMPLIANCE',
                    severity: 'CRITICAL',
                    alert: `${criticalCompliance.length} critical compliance requirements must be addressed`,
                    requirements: criticalCompliance.map(c => c.standard)
                });
            }
        }

        // Check for workflow gaps
        if (executionContext.gapsDetected && executionContext.gapsDetected.length > 0) {
            alerts.push({
                type: 'WORKFLOW_GAP',
                severity: 'HIGH',
                alert: 'Detected missing workflow steps',
                gaps: executionContext.gapsDetected
            });
        }

        return alerts;
    }

    /**
     * Display execution intelligence
     */
    _displayExecutionIntelligence(intelligence) {
        console.log('═'.repeat(80));
        console.log('🎖️ EPSILON - EXECUTION INTELLIGENCE UPDATES');
        console.log('═'.repeat(80));

        // Compliance reminders
        if (intelligence.complianceReminders.length > 0) {
            console.log(`\n⚖️ COMPLIANCE REMINDERS (${intelligence.complianceReminders.length}):`);
            intelligence.complianceReminders.forEach((reminder, index) => {
                console.log(`   ${index + 1}. [${reminder.severity}] ${reminder.reminder}`);
            });
        }

        // Workflow guidance
        if (intelligence.workflowGuidance.length > 0) {
            console.log(`\n🎯 WORKFLOW GUIDANCE (${intelligence.workflowGuidance.length}):`);
            intelligence.workflowGuidance.forEach((guidance, index) => {
                console.log(`   ${index + 1}. [${guidance.priority}] ${guidance.guidance}`);
            });
        }

        // Proactive suggestions
        if (intelligence.proactiveSuggestions.length > 0) {
            console.log(`\n💡 PROACTIVE SUGGESTIONS (${intelligence.proactiveSuggestions.length}):`);
            intelligence.proactiveSuggestions.forEach((suggestion, index) => {
                console.log(`   ${index + 1}. [${suggestion.priority}] ${suggestion.suggestion}`);
            });
        }

        // Risk alerts
        if (intelligence.riskAlerts.length > 0) {
            console.log(`\n⚠️ RISK ALERTS (${intelligence.riskAlerts.length}):`);
            intelligence.riskAlerts.forEach((alert, index) => {
                console.log(`   ${index + 1}. [${alert.severity}] ${alert.alert}`);
            });
        }

        console.log('\n' + '═'.repeat(80) + '\n');
    }

    /**
     * 🎯 PHASE 3: MISSION FULFILLMENT RCA WITH INTELLIGENCE
     * Validate mission outcome against original intent
     *
     * @param {number} missionId - ESMC mission ID
     * @param {object} missionOutcome - Completed mission results
     * @returns {Promise<object>} Fulfillment analysis
     */
    async validateMissionFulfillment(missionId, missionOutcome = {}) {
        console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║   🎖️ COLONEL EPSILON - MISSION FULFILLMENT RCA                              ║');
        console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

        try {
            // Retrieve cached intelligence
            const { projectIntent, domainContext, workflowPrediction } = this.intelligenceCache;

            // Step 1: Validate against project intent
            const intentAlignment = this._validateIntentAlignment(projectIntent, missionOutcome);

            // Step 2: Validate domain compliance
            const complianceValidation = this._validateComplianceAlignment(domainContext, missionOutcome);

            // Step 3: Validate workflow completion
            const workflowValidation = this._validateWorkflowCompletion(workflowPrediction, missionOutcome);

            // Step 4: Calculate overall alignment score
            const alignmentScore = this._calculateAlignmentScore(
                intentAlignment,
                complianceValidation,
                workflowValidation
            );

            // Step 5: Identify fulfillment gaps
            const gaps = this._identifyFulfillmentGaps(
                intentAlignment,
                complianceValidation,
                workflowValidation,
                alignmentScore
            );

            // Step 6: Generate correction recommendations
            const recommendations = this._generateCorrectionRecommendations(gaps);

            // Update cache
            this.intelligenceCache.alignmentScore = alignmentScore;

            const result = {
                alignmentScore,
                passesThreshold: alignmentScore >= this.THRESHOLDS.MISSION_ALIGNMENT_MIN,
                intentAlignment,
                complianceValidation,
                workflowValidation,
                gaps,
                recommendations,
                timestamp: new Date().toISOString()
            };

            // Store in database
            if (this.connection && missionId) {
                await this._storeFulfillmentAnalysis(result, missionId);
            }

            // Display fulfillment report
            this._displayFulfillmentReport(result);

            return result;

        } catch (error) {
            console.error('❌ EPSILON - Mission fulfillment validation failed:', error.message);
            return {
                success: false,
                error: error.message,
                alignmentScore: 0.0,
                passesThreshold: false
            };
        }
    }

    /**
     * Validate alignment with original project intent
     */
    _validateIntentAlignment(projectIntent, missionOutcome) {
        if (!projectIntent || !projectIntent.goals) {
            return { aligned: false, score: 0.0, details: 'No project intent defined' };
        }

        let alignedGoals = 0;
        const totalGoals = projectIntent.goals.length;

        // Check if each goal was addressed
        for (const goal of projectIntent.goals) {
            const isAddressed = this._isGoalAddressed(goal, missionOutcome);
            if (isAddressed) {
                alignedGoals++;
            }
        }

        const score = totalGoals > 0 ? alignedGoals / totalGoals : 0.0;

        return {
            aligned: score >= 0.80,
            score: Math.round(score * 100) / 100,
            totalGoals,
            alignedGoals,
            details: `${alignedGoals}/${totalGoals} goals addressed`
        };
    }

    /**
     * Check if goal was addressed in mission outcome
     */
    _isGoalAddressed(goal, missionOutcome) {
        // Simplified check - In production, this would be more sophisticated
        if (!missionOutcome.deliverables) {
            return false;
        }

        const goalKeywords = goal.goal.toLowerCase().split(' ');
        const outcomeText = JSON.stringify(missionOutcome.deliverables).toLowerCase();

        // Check if at least 50% of goal keywords appear in outcome
        const matchedKeywords = goalKeywords.filter(kw => outcomeText.includes(kw));
        return matchedKeywords.length >= goalKeywords.length * 0.5;
    }

    /**
     * Validate compliance requirements were met
     */
    _validateComplianceAlignment(domainContext, missionOutcome) {
        if (!domainContext || !domainContext.complianceRequirements) {
            return { aligned: true, score: 1.0, details: 'No compliance requirements' };
        }

        const criticalCompliance = domainContext.complianceRequirements.filter(
            c => c.severity === 'CRITICAL'
        );

        if (criticalCompliance.length === 0) {
            return { aligned: true, score: 1.0, details: 'No critical compliance requirements' };
        }

        // Check if compliance was validated (simplified)
        const complianceChecked = missionOutcome.complianceValidated || false;
        const score = complianceChecked ? 1.0 : 0.0;

        return {
            aligned: complianceChecked,
            score,
            totalRequirements: criticalCompliance.length,
            details: complianceChecked
                ? 'All compliance requirements validated'
                : `${criticalCompliance.length} critical compliance requirements not validated`
        };
    }

    /**
     * Validate workflow was completed correctly
     */
    _validateWorkflowCompletion(workflowPrediction, missionOutcome) {
        if (!workflowPrediction || !workflowPrediction.detectedWorkflow) {
            return { complete: true, score: 1.0, details: 'No workflow detected' };
        }

        const workflow = workflowPrediction.detectedWorkflow;
        const standardSequence = workflow.standardSequence || [];

        if (standardSequence.length === 0) {
            return { complete: true, score: 1.0, details: 'No workflow sequence defined' };
        }

        // Check critical steps
        const criticalSteps = standardSequence.filter(s => s.critical);
        const completedSteps = missionOutcome.completedSteps || [];

        let completedCritical = 0;
        for (const step of criticalSteps) {
            if (completedSteps.some(cs => cs.toLowerCase().includes(step.step.toLowerCase()))) {
                completedCritical++;
            }
        }

        const score = criticalSteps.length > 0 ? completedCritical / criticalSteps.length : 1.0;

        return {
            complete: score === 1.0,
            score: Math.round(score * 100) / 100,
            totalCriticalSteps: criticalSteps.length,
            completedCriticalSteps: completedCritical,
            details: `${completedCritical}/${criticalSteps.length} critical workflow steps completed`
        };
    }

    /**
     * Calculate overall alignment score
     */
    _calculateAlignmentScore(intentAlignment, complianceValidation, workflowValidation) {
        // Weighted average
        const score = (
            (intentAlignment.score * 0.50) +         // 50% weight - intent is most important
            (complianceValidation.score * 0.30) +    // 30% weight - compliance is critical
            (workflowValidation.score * 0.20)        // 20% weight - workflow completeness
        );

        return Math.round(score * 100) / 100;
    }

    /**
     * Identify fulfillment gaps
     */
    _identifyFulfillmentGaps(intentAlignment, complianceValidation, workflowValidation, alignmentScore) {
        const gaps = [];

        // Intent gaps
        if (!intentAlignment.aligned) {
            gaps.push({
                type: 'INTENT',
                severity: 'HIGH',
                gap: `Only ${intentAlignment.alignedGoals}/${intentAlignment.totalGoals} goals addressed`,
                impact: 'Mission does not fully achieve original intent'
            });
        }

        // Compliance gaps
        if (!complianceValidation.aligned) {
            gaps.push({
                type: 'COMPLIANCE',
                severity: 'CRITICAL',
                gap: complianceValidation.details,
                impact: 'Legal/regulatory requirements not validated'
            });
        }

        // Workflow gaps
        if (!workflowValidation.complete) {
            gaps.push({
                type: 'WORKFLOW',
                severity: 'MEDIUM',
                gap: `Only ${workflowValidation.completedCriticalSteps}/${workflowValidation.totalCriticalSteps} critical steps completed`,
                impact: 'Workflow may be incomplete'
            });
        }

        return gaps;
    }

    /**
     * Generate correction recommendations
     */
    _generateCorrectionRecommendations(gaps) {
        const recommendations = [];

        for (const gap of gaps) {
            switch (gap.type) {
                case 'INTENT':
                    recommendations.push({
                        priority: 'HIGH',
                        recommendation: 'Review unaddressed goals and implement missing functionality',
                        action: 'Reopen mission with focus on missing goals'
                    });
                    break;

                case 'COMPLIANCE':
                    recommendations.push({
                        priority: 'CRITICAL',
                        recommendation: 'Conduct compliance validation before deployment',
                        action: 'Run COLONEL ZETA compliance checks with domain-specific requirements'
                    });
                    break;

                case 'WORKFLOW':
                    recommendations.push({
                        priority: 'MEDIUM',
                        recommendation: 'Complete missing critical workflow steps',
                        action: 'Review workflow sequence and address gaps'
                    });
                    break;
            }
        }

        return recommendations;
    }

    /**
     * Store fulfillment analysis in database
     */
    async _storeFulfillmentAnalysis(result, missionId) {
        try {
            const query = `
                INSERT INTO mission_fulfillment_analysis (
                    mission_id, alignment_score, intent_alignment, compliance_validation,
                    workflow_validation, detected_gaps, recommendations, analyzed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await this.connection.execute(query, [
                missionId,
                result.alignmentScore,
                JSON.stringify(result.intentAlignment),
                JSON.stringify(result.complianceValidation),
                JSON.stringify(result.workflowValidation),
                JSON.stringify(result.gaps),
                JSON.stringify(result.recommendations)
            ]);

            console.log('✅ EPSILON - Fulfillment analysis stored in database');

        } catch (error) {
            console.error('❌ EPSILON - Failed to store fulfillment analysis:', error.message);
        }
    }

    /**
     * Display fulfillment report
     */
    _displayFulfillmentReport(result) {
        console.log('═'.repeat(80));
        console.log('📊 MISSION FULFILLMENT ANALYSIS COMPLETE');
        console.log('═'.repeat(80));

        console.log(`\n📊 ALIGNMENT SCORE: ${(result.alignmentScore * 100).toFixed(0)}%`);
        console.log(`   Threshold: ${this.THRESHOLDS.MISSION_ALIGNMENT_MIN * 100}%`);
        console.log(`   Status: ${result.passesThreshold ? '✅ MISSION APPROVED' : '❌ MISSION NEEDS CORRECTION'}\n`);

        // Intent alignment
        console.log('🎯 INTENT ALIGNMENT:');
        console.log(`   Score: ${(result.intentAlignment.score * 100).toFixed(0)}%`);
        console.log(`   Details: ${result.intentAlignment.details}\n`);

        // Compliance validation
        console.log('⚖️ COMPLIANCE VALIDATION:');
        console.log(`   Score: ${(result.complianceValidation.score * 100).toFixed(0)}%`);
        console.log(`   Details: ${result.complianceValidation.details}\n`);

        // Workflow validation
        console.log('🎯 WORKFLOW VALIDATION:');
        console.log(`   Score: ${(result.workflowValidation.score * 100).toFixed(0)}%`);
        console.log(`   Details: ${result.workflowValidation.details}\n`);

        // Gaps
        if (result.gaps.length > 0) {
            console.log(`⚠️ IDENTIFIED GAPS (${result.gaps.length}):`);
            result.gaps.forEach((gap, index) => {
                console.log(`   ${index + 1}. [${gap.severity}] ${gap.type}: ${gap.gap}`);
                console.log(`      Impact: ${gap.impact}`);
            });
            console.log();
        }

        // Recommendations
        if (result.recommendations.length > 0) {
            console.log(`💡 RECOMMENDATIONS (${result.recommendations.length}):`);
            result.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. [${rec.priority}] ${rec.recommendation}`);
                console.log(`      Action: ${rec.action}`);
            });
            console.log();
        }

        console.log('═'.repeat(80) + '\n');
    }

    /**
     * Get current intelligence cache (utility method)
     */
    getIntelligenceCache() {
        return this.intelligenceCache;
    }

    /**
     * Reset intelligence cache
     */
    resetIntelligenceCache() {
        this.intelligenceCache = {
            projectIntent: null,
            domainContext: null,
            workflowPrediction: null,
            clarityScore: 0.0,
            alignmentScore: 0.0
        };
    }

    /**
     * Close all connections
     */
    async close() {
        if (this.connection) {
            await this.connection.end();
        }
        await this.piu.close();
        await this.dki.close();
        await this.uip.close();
        await this.pfi.close();
        // CUP doesn't have async close(), skip

        console.log('🎖️ EPSILON Intelligence Coordinator (with PFI 3.10 + CUP 3.10) - All connections closed');
    }

    /**
     * 🎯 PRE-EMPTIVE FILE INTELLIGENCE (PFI 3.10)
     * Analyze file before reading to determine optimal read strategy
     *
     * @param {string} filePath - Path to file
     * @param {object} context - Additional context (keywords, target sections)
     * @returns {Promise<object>} File analysis and read strategy
     */
    async analyzeFileIntelligently(filePath, context = {}) {
        console.log('\n🔍 EPSILON - PFI 3.10 Pre-emptive File Analysis...');

        try {
            // Step 1: Analyze file before reading
            const fileAnalysis = await this.pfi.analyzeFileBeforeRead(filePath, context);

            // Step 2: Execute intelligent read if strategy is not single read
            let readResult = null;
            if (fileAnalysis.readStrategy !== 'SINGLE_READ') {
                console.log(`\n⚡ EPSILON - Executing ${fileAnalysis.readStrategy}...`);
                readResult = await this.pfi.executeIntelligentRead(fileAnalysis.executionPlan);
            }

            return {
                success: true,
                fileAnalysis: fileAnalysis,
                readResult: readResult,
                recommendation: this._generatePFIRecommendation(fileAnalysis)
            };

        } catch (error) {
            console.error('❌ EPSILON - PFI analysis failed:', error.message);
            return {
                success: false,
                error: error.message,
                fallbackToStandardRead: true
            };
        }
    }

    /**
     * Generate PFI recommendation for ESMC colonels
     */
    _generatePFIRecommendation(fileAnalysis) {
        const recommendations = [];

        if (fileAnalysis.readStrategy === 'PARALLEL_CHUNKED_READ') {
            recommendations.push({
                priority: 'HIGH',
                recommendation: `File is large (${fileAnalysis.estimatedLines} lines). Use parallel chunked read for 93% performance improvement.`,
                action: 'Execute PFI parallel read strategy'
            });
        }

        if (fileAnalysis.readStrategy === 'TARGETED_SECTION_READ') {
            recommendations.push({
                priority: 'MEDIUM',
                recommendation: 'Targeted keyword-based read will save 70-90% tokens',
                action: 'Use PFI targeted read with specified keywords'
            });
        }

        if (fileAnalysis.estimatedTokens > 10000) {
            recommendations.push({
                priority: 'CRITICAL',
                recommendation: `File exceeds comfortable token limit (${fileAnalysis.estimatedTokens} estimated tokens)`,
                action: 'MUST use PFI chunking to avoid token overflow'
            });
        }

        return recommendations;
    }

    /**
     * Get PFI performance metrics
     */
    getPFIMetrics() {
        return this.pfi.getPerformanceMetrics();
    }

    /**
     * 🎯 CONTINUOUS USER PROFILING (CUP 3.10)
     * Get user personality profile and adaptation parameters
     *
     * @returns {object} User profile summary (MBTI, preferences, communication style)
     */
    getCUPProfile() {
        try {
            const summary = this.cup.getPersonalitySummary();
            return {
                success: true,
                profile: summary
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                profile: { ready: false }
            };
        }
    }

    /**
     * Get full user profile from CUP (detailed)
     */
    getCUPFullProfile() {
        try {
            return this.cup.getUserProfile();
        } catch (error) {
            console.error('❌ EPSILON - CUP profile retrieval failed:', error.message);
            return null;
        }
    }
}

// Export
module.exports = EPSILONIntelligenceCoordinator;

// Example usage (if run directly)
if (require.main === module) {
    (async () => {
        const epsilon = new EPSILONIntelligenceCoordinator();
        await epsilon.initialize();

        // Test command clarification
        const clarification = await epsilon.analyzeCommandClarity(
            'Use ESMC implement GDPR-compliant user authentication with password reset for nonprofit donor portal',
            { userId: 1, completedWorkflows: 5 },
            { projectId: 1, domain: 'NONPROFIT' }
        );

        console.log('\nClarity Result:', clarification.needsClarification ? 'NEEDS CLARIFICATION' : 'CLEAR TO PROCEED');

        await epsilon.close();
    })();
}