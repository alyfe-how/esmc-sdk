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
/** ESMC 3.13.5 UIP | 2025-10-19 | v3.13.5 | PROD | ALL_TIERS
 *  Purpose: User intent prediction - workflow pattern recognition with proactive suggestions
 *  Features: Gap detection | Next-step prediction | CIE conversation evolution | ATLAS memory | Temporal intelligence (2025-10-19 update)
 */

// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)
const AtlasRetrievalSystem = require('./8cacf104.js'); // 3-tier memory retrieval
const { ContextInferenceEngine } = require('./a1ce941e.js'); // 🆕 Phase 2C CIE integration

class UIPIntentPredictionEngine {
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

        // 🆕 ESMC 3.13.5: Initialize CIE immediately (no DB dependency)
        this.contextEngine = new ContextInferenceEngine();

        // Prediction confidence thresholds
        this.CONFIDENCE_THRESHOLDS = {
            HIGH: 0.85,
            MODERATE: 0.70,
            LOW: 0.50,
            SUGGEST_THRESHOLD: 0.70  // Suggest only if > 70% confident
        };

        // Workflow pattern cache
        this.workflowPatterns = {};

        // Session state tracking
        this.sessionState = {
            currentWorkflow: null,
            completedSteps: [],
            missedSteps: [],
            nextSuggestions: []
        };
    }

    /**
     * Initialize database connection and load workflow patterns
     * ESMC 3.99.1: Skip MySQL in CLI mode (ESMC_SILENT env var) - AEGIS file-based supremacy
     */
    async initialize() {
        // ESMC 3.99.1: Skip MySQL connection if ESMC_SILENT=true (CLI mode)
        if (process.env.ESMC_SILENT === 'true') {
            // CLI mode: Skip database, use ATLAS file-based retrieval only
            this.atlas = new AtlasRetrievalSystem();
            await this.atlas.loadProjectIndex();
            console.log('🧠 UIP Engine - Context Inference Engine ready (CLI mode - AEGIS)');
            return true;
        }

        // Production mode: Attempt MySQL connection (optional fallback)
        try {
            // 🆕 ESMC 4.1: Dynamic require for SDK compatibility
            const mysql = require('mysql2/promise');
            this.connection = await mysql.createConnection(this.dbConfig);
            console.log('🔮 UIP Engine - Database connection established');

            // Preload workflow patterns
            await this._loadWorkflowPatterns();

            // Initialize ATLAS 3.13: Memory + Structural awareness
            this.atlas = new AtlasRetrievalSystem();
            await this.atlas.loadProjectIndex();

            // 🆕 ESMC 3.22: Load ECHO working memory (current conversation context)
            // 🗑️ ESMC 3.60: ECHO deprecated - SEED supremacy (L003, Nov 1 2025)
            // await this._loadEchoContext();

            console.log('🧠 UIP Engine - Context Inference Engine ready (initialized in constructor)');

            return true;
        } catch (error) {
            // Graceful fallback: MySQL unavailable, use ATLAS-only mode
            console.error('❌ UIP Engine - Initialization failed:', error.message);
            console.log('⚠️  UIP Engine - Falling back to ATLAS file-based retrieval (AEGIS mode)');

            this.atlas = new AtlasRetrievalSystem();
            await this.atlas.loadProjectIndex();
            return true; // Continue execution without MySQL
        }
    }

    /**
     * Load workflow patterns into memory cache
     */
    async _loadWorkflowPatterns() {
        try {
            const [rows] = await this.connection.execute(`
                SELECT workflow_name, display_name, description, standard_sequence,
                       typical_duration_minutes, common_gaps, success_indicators
                FROM workflow_patterns
            `);

            for (const row of rows) {
                this.workflowPatterns[row.workflow_name] = {
                    displayName: row.display_name,
                    description: row.description,
                    standardSequence: JSON.parse(row.standard_sequence || '[]'),
                    typicalDuration: row.typical_duration_minutes,
                    commonGaps: JSON.parse(row.common_gaps || '[]'),
                    successIndicators: JSON.parse(row.success_indicators || '[]')
                };
            }

            console.log(`✅ UIP Engine - Loaded ${Object.keys(this.workflowPatterns).length} workflow patterns`);

        } catch (error) {
            console.error('❌ UIP Engine - Failed to load workflow patterns:', error.message);
        }
    }

    /**
     * Main entry point: Predict next steps based on user command
     *
     * @param {string} userCommand - Raw user command
     * @param {object} sessionContext - Session history, recent actions
     * @param {number} missionId - ESMC mission ID
     * @returns {Promise<object>} Prediction result
     */
    async predictNextSteps(userCommand, sessionContext = {}, missionId = null) {
        console.log(`\n🔮 UIP - USER INTENT PREDICTION ANALYSIS`);
        console.log(`Command: "${userCommand.substring(0, 100)}${userCommand.length > 100 ? '...' : ''}"`);

        try {
            // 🆕 Step 0: Conversation Evolution Tracking (CIE temporal intelligence)
            let conversationEvolution = null;
            let userEmphasis = null;

            if (this.contextEngine) {
                try {
                    // Track conversation trajectory
                    conversationEvolution = this.contextEngine.trackConversationEvolution(userCommand);
                    console.log(`   🧠 CIE: Focus shift detected - ${conversationEvolution.focusShift}`);

                    // Extract emphasis for priority weighting
                    userEmphasis = this.contextEngine.extractEmphasis(userCommand);
                    if (userEmphasis.capitalized.length > 0 || userEmphasis.markdown.length > 0) {
                        console.log(`   🎯 CIE: Emphasis detected - prioritizing workflow steps`);
                    }
                } catch (cieError) {
                    console.warn(`   ⚠️ CIE processing failed (non-blocking): ${cieError.message}`);
                }
            }

            // Step 1: Detect workflow from command
            const detectedWorkflow = this._detectWorkflow(userCommand);

            // Step 2: Identify current step in workflow
            const currentStep = this._identifyCurrentStep(userCommand, detectedWorkflow);

            // Step 3: Predict next 2-3 steps (🆕 enhanced with emphasis weighting)
            const nextSteps = this._predictNextSteps(detectedWorkflow, currentStep, userEmphasis);

            // Step 4: Detect missing/skipped steps (gap detection)
            const gapDetection = this._detectGaps(detectedWorkflow, currentStep, sessionContext);

            // Step 5: Generate proactive suggestions (🆕 trajectory-aware)
            const proactiveSuggestions = this._generateProactiveSuggestions(
                detectedWorkflow,
                currentStep,
                nextSteps,
                gapDetection,
                conversationEvolution // 🆕 Pass evolution context
            );

            // Step 6: Calculate prediction confidence (🆕 factor in trajectory)
            const predictionConfidence = this._calculatePredictionConfidence(
                detectedWorkflow,
                currentStep,
                sessionContext,
                conversationEvolution // 🆕 Higher confidence on REFINEMENT
            );

            // Step 7: Load historical patterns for this user (if available)
            const historicalPatterns = await this._loadHistoricalPatterns(sessionContext.userId, detectedWorkflow);

            // Step 8: Update session state
            this._updateSessionState(detectedWorkflow, currentStep, nextSteps);

            const result = {
                detectedWorkflow,
                currentStep,
                nextSteps,
                gapDetection,
                proactiveSuggestions,
                predictionConfidence,
                historicalPatterns,
                conversationEvolution, // 🆕 Include CIE evolution tracking
                userEmphasis, // 🆕 Include emphasis for downstream use
                timestamp: new Date().toISOString()
            };

            // Step 9: Store in database if connection available
            if (this.connection && missionId) {
                await this._storePredictionAnalysis(result, missionId, sessionContext.userId);
            }

            // Step 10: 🆕 Enrich with ECHO working memory context
            const enrichedResult = this._enrichWithEchoContext(result);

            // Step 11: Display prediction report
            this._displayPredictionReport(enrichedResult);

            return enrichedResult;

        } catch (error) {
            console.error('❌ UIP - Intent prediction failed:', error.message);
            return {
                success: false,
                error: error.message,
                detectedWorkflow: null
            };
        }
    }

    /**
     * Detect workflow from user command
     */
    _detectWorkflow(command) {
        const commandLower = command.toLowerCase();

        // Workflow detection patterns
        const workflowPatterns = [
            {
                workflow: 'authentication',
                keywords: ['auth', 'login', 'signup', 'register', 'password', 'oauth', 'jwt', 'session'],
                confidence: 0.90
            },
            {
                workflow: 'api_endpoint',
                keywords: ['api', 'endpoint', 'rest', 'graphql', 'route', 'controller'],
                confidence: 0.85
            },
            {
                workflow: 'data_migration',
                keywords: ['migration', 'schema', 'database', 'migrate', 'seed', 'alter table'],
                confidence: 0.90
            },
            {
                workflow: 'feature_implementation',
                keywords: ['implement', 'feature', 'functionality', 'add', 'create', 'build'],
                confidence: 0.75
            },
            {
                workflow: 'bug_fix',
                keywords: ['fix', 'bug', 'error', 'issue', 'broken', 'not working'],
                confidence: 0.85
            },
            {
                workflow: 'refactoring',
                keywords: ['refactor', 'clean', 'improve', 'optimize', 'restructure'],
                confidence: 0.85
            },
            {
                workflow: 'testing',
                keywords: ['test', 'unit test', 'integration test', 'e2e', 'coverage'],
                confidence: 0.90
            }
        ];

        // Match workflow with multi-keyword scoring
        let bestMatch = null;
        let highestScore = 0;

        for (const { workflow, keywords, confidence } of workflowPatterns) {
            let matchCount = 0;
            let matchedKeyword = null;

            for (const keyword of keywords) {
                if (commandLower.includes(keyword)) {
                    matchCount++;
                    if (!matchedKeyword) matchedKeyword = keyword;
                }
            }

            if (matchCount > 0) {
                // Score = confidence * (1 + 0.2 * additional matches)
                const score = confidence * (1 + 0.2 * (matchCount - 1));

                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = {
                        workflow,
                        confidence,
                        matchedKeyword,
                        matchCount
                    };
                }
            }
        }

        if (bestMatch) {
            const workflowData = this.workflowPatterns[bestMatch.workflow];
            return {
                ...bestMatch,
                displayName: workflowData?.displayName || bestMatch.workflow,
                description: workflowData?.description || '',
                standardSequence: workflowData?.standardSequence || []
            };
        }

        // Fallback: generic workflow
        return {
            workflow: 'generic',
            displayName: 'Generic Development Task',
            confidence: 0.50,
            standardSequence: []
        };
    }

    /**
     * Identify current step in workflow
     */
    _identifyCurrentStep(command, detectedWorkflow) {
        if (!detectedWorkflow || !detectedWorkflow.standardSequence) {
            return { step: 'unknown', order: 0, confidence: 0.0 };
        }

        const commandLower = command.toLowerCase();
        const sequence = detectedWorkflow.standardSequence;

        // Find matching step in sequence
        for (const stepData of sequence) {
            const stepKeywords = stepData.keywords || [];
            for (const keyword of stepKeywords) {
                if (commandLower.includes(keyword.toLowerCase())) {
                    return {
                        step: stepData.step,
                        order: stepData.order,
                        typical: stepData.typical || false,
                        critical: stepData.critical || false,
                        confidence: 0.85
                    };
                }
            }
        }

        // If no match, assume first step
        return {
            step: sequence[0]?.step || 'Start workflow',
            order: 1,
            confidence: 0.60
        };
    }

    /**
     * Predict next 2-3 steps based on current step
     * 🆕 ESMC 3.13.5 - Enhanced with CIE emphasis weighting
     */
    _predictNextSteps(detectedWorkflow, currentStep, userEmphasis = null) {
        if (!detectedWorkflow || !detectedWorkflow.standardSequence) {
            return [];
        }

        const sequence = detectedWorkflow.standardSequence;
        const currentOrder = currentStep.order;

        // Get next 2-3 steps in sequence
        let nextSteps = sequence
            .filter(step => step.order > currentOrder)
            .sort((a, b) => a.order - b.order)
            .slice(0, 3)
            .map(step => ({
                step: step.step,
                order: step.order,
                typical: step.typical || false,
                critical: step.critical || false,
                estimatedDuration: step.estimatedDuration || 'Unknown',
                confidence: 0.80 - ((step.order - currentOrder - 1) * 0.10),  // Decay confidence for further steps
                emphasisBoost: 0 // 🆕 Track emphasis boost
            }));

        // 🆕 Apply CIE emphasis weighting (boost priority if user emphasized related keywords)
        if (userEmphasis && (userEmphasis.capitalized.length > 0 || userEmphasis.markdown.length > 0)) {
            const allEmphasis = [
                ...userEmphasis.capitalized,
                ...userEmphasis.markdown,
                ...userEmphasis.quoted
            ];

            for (const step of nextSteps) {
                const stepLower = step.step.toLowerCase();

                // Check if user emphasized keywords related to this step
                for (const emphasized of allEmphasis) {
                    if (stepLower.includes(emphasized.toLowerCase())) {
                        step.emphasisBoost = 0.15; // +15% confidence boost
                        step.confidence = Math.min(0.95, step.confidence + step.emphasisBoost);
                        break;
                    }
                }
            }

            // Re-sort by confidence (emphasized steps bubble up)
            nextSteps.sort((a, b) => b.confidence - a.confidence);
        }

        return nextSteps;
    }

    /**
     * Detect gaps (missing/skipped steps)
     */
    _detectGaps(detectedWorkflow, currentStep, sessionContext) {
        if (!detectedWorkflow || !detectedWorkflow.commonGaps) {
            return [];
        }

        const gaps = detectedWorkflow.commonGaps;
        const detectedGaps = [];

        for (const gap of gaps) {
            // Check if gap is applicable based on current step and context
            const isApplicable = this._isGapApplicable(gap, currentStep, sessionContext);

            if (isApplicable) {
                detectedGaps.push({
                    gap: gap.gap,
                    severity: gap.severity || 'MEDIUM',
                    consequence: gap.consequence || 'May cause issues later',
                    recommendation: gap.recommendation || 'Address this before proceeding',
                    confidence: 0.75
                });
            }
        }

        // Sort by severity (HIGH first)
        const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return detectedGaps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }

    /**
     * Check if gap is applicable to current situation
     */
    _isGapApplicable(gap, currentStep, sessionContext) {
        // Check if current step is past the gap point
        const gapOrder = gap.typicalOrder || 0;
        if (currentStep.order <= gapOrder) {
            return false;  // Haven't reached this point yet
        }

        // Check if gap was already addressed in session
        if (sessionContext.completedSteps) {
            const gapKeywords = gap.keywords || [];
            for (const completedStep of sessionContext.completedSteps) {
                for (const keyword of gapKeywords) {
                    if (completedStep.toLowerCase().includes(keyword.toLowerCase())) {
                        return false;  // Gap was addressed
                    }
                }
            }
        }

        return true;  // Gap is applicable
    }

    /**
     * Generate proactive suggestions
     * 🆕 ESMC 3.13.5 - Enhanced with conversation evolution awareness
     */
    _generateProactiveSuggestions(detectedWorkflow, currentStep, nextSteps, gapDetection, conversationEvolution = null) {
        const suggestions = [];

        // 🆕 Trajectory-aware suggestions
        if (conversationEvolution) {
            if (conversationEvolution.focusShift === 'NEW_TOPIC') {
                // User pivoted - suggest exploration/discovery actions
                suggestions.push({
                    type: 'trajectory_aware',
                    priority: 'MEDIUM',
                    suggestion: `Consider exploring foundational steps before diving deep`,
                    reasoning: `CIE detected NEW_TOPIC shift - recommend exploratory approach`,
                    confidence: 0.75
                });
            } else if (conversationEvolution.focusShift === 'REFINEMENT' && conversationEvolution.persistentTopics.length > 2) {
                // User drilling deeper - suggest advanced/detailed actions
                suggestions.push({
                    type: 'trajectory_aware',
                    priority: 'HIGH',
                    suggestion: `Ready for advanced implementation - user focused on: ${conversationEvolution.persistentTopics.join(', ')}`,
                    reasoning: `CIE detected REFINEMENT with ${conversationEvolution.persistentTopics.length} persistent topics`,
                    confidence: 0.85
                });
            }
        }

        // Suggest next steps (if confidence > threshold)
        for (const next of nextSteps) {
            if (next.confidence >= this.CONFIDENCE_THRESHOLDS.SUGGEST_THRESHOLD) {
                suggestions.push({
                    type: 'next_step',
                    priority: next.critical ? 'HIGH' : 'MEDIUM',
                    suggestion: `Next: ${next.step}`,
                    reasoning: `Standard workflow progression (${detectedWorkflow.displayName})${next.emphasisBoost > 0 ? ' - User emphasized this' : ''}`,
                    confidence: next.confidence
                });
            }
        }

        // Suggest gap resolution (if HIGH severity)
        for (const gap of gapDetection) {
            if (gap.severity === 'HIGH') {
                suggestions.push({
                    type: 'gap_resolution',
                    priority: 'HIGH',
                    suggestion: gap.recommendation,
                    reasoning: `Missing critical step: ${gap.gap}. ${gap.consequence}`,
                    confidence: gap.confidence
                });
            }
        }

        // Sort by priority (HIGH first)
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    /**
     * Calculate prediction confidence
     * 🆕 ESMC 3.13.5 - Enhanced with conversation trajectory factor
     */
    _calculatePredictionConfidence(detectedWorkflow, currentStep, sessionContext, conversationEvolution = null) {
        let confidence = 0.0;

        // Workflow detection confidence (35% weight, reduced from 40%)
        confidence += (detectedWorkflow?.confidence || 0.5) * 0.35;

        // Current step identification confidence (25% weight, reduced from 30%)
        confidence += (currentStep?.confidence || 0.5) * 0.25;

        // Historical pattern match (25% weight, reduced from 30%)
        const hasHistoricalData = sessionContext.completedWorkflows > 0;
        const historicalConfidence = hasHistoricalData ? 0.85 : 0.50;
        confidence += historicalConfidence * 0.25;

        // 🆕 Conversation trajectory confidence (15% weight)
        let trajectoryConfidence = 0.50; // Baseline
        if (conversationEvolution) {
            if (conversationEvolution.focusShift === 'REFINEMENT') {
                // User refining same topic - HIGH confidence in workflow continuation
                trajectoryConfidence = 0.90;
            } else if (conversationEvolution.focusShift === 'CONTINUATION') {
                // User continuing - MODERATE confidence
                trajectoryConfidence = 0.75;
            } else if (conversationEvolution.focusShift === 'NEW_TOPIC') {
                // User pivoted - LOWER confidence (may change workflow)
                trajectoryConfidence = 0.40;
            } else if (conversationEvolution.focusShift === 'INITIAL') {
                // First message - BASELINE confidence
                trajectoryConfidence = 0.50;
            }
        }
        confidence += trajectoryConfidence * 0.15;

        return Math.round(confidence * 100) / 100;  // Round to 2 decimals
    }

    /**
     * Load historical patterns for user
     * ENHANCED: Uses ATLAS 3-tier retrieval for memory-based patterns
     */
    async _loadHistoricalPatterns(userId, detectedWorkflow) {
        // Try ATLAS memory retrieval first (memory-based workflow patterns)
        if (this.atlas && detectedWorkflow) {
            try {
                // 🆕 ESMC 3.22: Use retrieveV3() for ECHO+HYDRA cascade
                const memoryResult = await this.atlas.retrieveV3(detectedWorkflow.workflow, {
                    retrieveEcho: true,
                    useFootprint: true
                });

                if (memoryResult.found && memoryResult.data) {
                    return {
                        available: true,
                        source: 'atlas_memory',
                        tier_used: memoryResult.tier_used,
                        completionCount: memoryResult.data.total_sessions || 1,
                        session_id: memoryResult.data.session_id,
                        project: memoryResult.data.project,
                        typicalSteps: memoryResult.data.session_history?.map(s => s.summary) || [],
                        temporal_context: memoryResult.scribe_enrichment?.temporal_context
                    };
                }
            } catch (error) {
                console.warn('⚠️ UIP - ATLAS retrieval failed, falling back to database:', error.message);
            }
        }

        // Fallback: Database historical patterns (original logic)
        if (!this.connection || !userId || !detectedWorkflow) {
            return { available: false };
        }

        try {
            // Load user's past workflow completions
            const [rows] = await this.connection.execute(`
                SELECT workflow_name, completed_steps, duration_minutes, success_rating
                FROM user_workflow_history
                WHERE user_id = ? AND workflow_name = ?
                ORDER BY completed_at DESC
                LIMIT 5
            `, [userId, detectedWorkflow.workflow]);

            if (rows.length === 0) {
                return { available: false };
            }

            // Analyze patterns
            const avgDuration = rows.reduce((sum, r) => sum + r.duration_minutes, 0) / rows.length;
            const avgSuccess = rows.reduce((sum, r) => sum + r.success_rating, 0) / rows.length;

            return {
                available: true,
                source: 'database',
                completionCount: rows.length,
                avgDuration,
                avgSuccessRating: avgSuccess,
                typicalSteps: this._extractTypicalSteps(rows)
            };

        } catch (error) {
            console.error('❌ UIP - Failed to load historical patterns:', error.message);
            return { available: false };
        }
    }

    /**
     * Extract typical steps from historical data
     */
    _extractTypicalSteps(historyRows) {
        const stepFrequency = {};

        for (const row of historyRows) {
            const steps = JSON.parse(row.completed_steps || '[]');
            for (const step of steps) {
                stepFrequency[step] = (stepFrequency[step] || 0) + 1;
            }
        }

        // Return steps that appear in >50% of completions
        const threshold = historyRows.length * 0.5;
        return Object.keys(stepFrequency).filter(step => stepFrequency[step] >= threshold);
    }

    /**
     * Update session state
     */
    _updateSessionState(detectedWorkflow, currentStep, nextSteps) {
        this.sessionState.currentWorkflow = detectedWorkflow?.workflow || null;
        this.sessionState.completedSteps.push(currentStep.step);
        this.sessionState.nextSuggestions = nextSteps.map(s => s.step);
    }

    /**
     * Store prediction analysis in database
     */
    async _storePredictionAnalysis(result, missionId, userId) {
        try {
            const query = `
                INSERT INTO intent_predictions (
                    mission_id, user_id, detected_workflow, current_step,
                    predicted_next_steps, detected_gaps, prediction_confidence, predicted_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await this.connection.execute(query, [
                missionId,
                userId || null,
                result.detectedWorkflow?.workflow || 'unknown',
                result.currentStep?.step || 'unknown',
                JSON.stringify(result.nextSteps),
                JSON.stringify(result.gapDetection),
                result.predictionConfidence
            ]);

            console.log('✅ UIP - Prediction analysis stored in database');

        } catch (error) {
            console.error('❌ UIP - Failed to store prediction analysis:', error.message);
        }
    }

    /**
     * Display prediction report
     */
    _displayPredictionReport(result) {
        console.log(`\n${'='.repeat(80)}`);
        console.log('🔮 UIP - USER INTENT PREDICTION REPORT');
        console.log('='.repeat(80));

        // Detected Workflow
        console.log(`\n🎯 DETECTED WORKFLOW:`);
        console.log(`   ${result.detectedWorkflow.displayName}`);
        console.log(`   Confidence: ${(result.detectedWorkflow.confidence * 100).toFixed(0)}%`);
        if (result.detectedWorkflow.description) {
            console.log(`   ${result.detectedWorkflow.description}`);
        }

        // Current Step
        console.log(`\n📍 CURRENT STEP:`);
        console.log(`   Step ${result.currentStep.order}: ${result.currentStep.step}`);
        console.log(`   Confidence: ${(result.currentStep.confidence * 100).toFixed(0)}%`);
        if (result.currentStep.critical) {
            console.log(`   ⚠️ CRITICAL STEP`);
        }

        // Predicted Next Steps
        if (result.nextSteps.length > 0) {
            console.log(`\n🔮 PREDICTED NEXT STEPS (${result.nextSteps.length}):`);
            result.nextSteps.forEach((step, index) => {
                console.log(`   ${index + 1}. Step ${step.order}: ${step.step}`);
                console.log(`      Confidence: ${(step.confidence * 100).toFixed(0)}% | Duration: ${step.estimatedDuration}`);
                if (step.critical) {
                    console.log(`      ⚠️ CRITICAL`);
                }
            });
        }

        // Gap Detection
        if (result.gapDetection.length > 0) {
            console.log(`\n⚠️ DETECTED GAPS (${result.gapDetection.length}):`);
            result.gapDetection.forEach((gap, index) => {
                console.log(`   ${index + 1}. [${gap.severity}] ${gap.gap}`);
                console.log(`      Consequence: ${gap.consequence}`);
                console.log(`      Recommendation: ${gap.recommendation}`);
            });
        }

        // Proactive Suggestions
        if (result.proactiveSuggestions.length > 0) {
            console.log(`\n💡 PROACTIVE SUGGESTIONS (${result.proactiveSuggestions.length}):`);
            result.proactiveSuggestions.forEach((suggestion, index) => {
                console.log(`   ${index + 1}. [${suggestion.priority}] ${suggestion.suggestion}`);
                console.log(`      Reasoning: ${suggestion.reasoning}`);
                console.log(`      Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
            });
        }

        // Historical Patterns
        if (result.historicalPatterns.available) {
            console.log(`\n📊 HISTORICAL PATTERNS (Based on ${result.historicalPatterns.completionCount} past completions):`);
            console.log(`   Avg Duration: ${result.historicalPatterns.avgDuration} minutes`);
            console.log(`   Avg Success Rating: ${result.historicalPatterns.avgSuccessRating.toFixed(1)}/5.0`);
            if (result.historicalPatterns.typicalSteps.length > 0) {
                console.log(`   Typical Steps: ${result.historicalPatterns.typicalSteps.join(', ')}`);
            }
        }

        // Overall Confidence
        console.log(`\n📊 PREDICTION CONFIDENCE: ${(result.predictionConfidence * 100).toFixed(0)}%`);

        console.log(`\n${'='.repeat(80)}\n`);
    }

    /**
     * Get current session state (utility method)
     */
    getSessionState() {
        return this.sessionState;
    }

    /**
     * Reset session state
     */
    resetSessionState() {
        this.sessionState = {
            currentWorkflow: null,
            completedSteps: [],
            missedSteps: [],
            nextSuggestions: []
        };
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
    /**
     * 🆕 ESMC 3.22: Load ECHO working memory context
     * @private
     */
    async _loadEchoContext() {
        if (!this.atlas) {
            console.log('   ⚠️ UIP: ATLAS not initialized, skipping ECHO load');
            return;
        }

        try {
            const result = await this.atlas.retrieveV3('current conversation', {
                retrieveEcho: true,
                useFootprint: false
            });

            if (result.echo_context) {
                this.echoContext = result.echo_context;
                console.log(`   📸 UIP: ECHO context loaded - ${result.echo_context.current_task || 'N/A'}`);
            } else {
                console.log('   📸 UIP: No ECHO context available (new conversation)');
            }
        } catch (error) {
            console.warn(`   ⚠️ UIP: ECHO load failed (non-blocking): ${error.message}`);
        }
    }

    /**
     * 🆕 ESMC 3.22: Enrich prediction with ECHO working memory
     * @param {object} result - Base prediction result
     * @returns {object} Enriched result with ECHO context
     * @private
     */
    _enrichWithEchoContext(result) {
        if (!this.echoContext) {
            return {
                ...result,
                echo_working_memory: null,
                echo_enrichment: { available: false, reason: 'No ECHO context (new conversation or counter=0)' }
            };
        }

        const echoIntelligence = {
            current_conversation_task: this.echoContext.current_task || null,
            todos_in_progress: this.echoContext.todos || [],
            files_modified_today: this.echoContext.files_modified || [],
            conversation_compact_count: this.echoContext.compact_counter || 0
        };

        const workflowAlignment = this._calculateWorkflowAlignment(result, echoIntelligence);

        return {
            ...result,
            echo_working_memory: echoIntelligence,
            echo_enrichment: {
                available: true,
                workflow_alignment_score: workflowAlignment,
                insight: workflowAlignment >= 0.7
                    ? `HIGH workflow alignment: Predicted steps continue current task "${echoIntelligence.current_conversation_task}"`
                    : workflowAlignment >= 0.4
                    ? `MEDIUM workflow alignment: Some continuity with current work`
                    : `LOW workflow alignment: Predicted workflow may diverge from current task`
            }
        };
    }

    /**
     * Calculate workflow alignment with ECHO context
     * @private
     */
    _calculateWorkflowAlignment(predictionResult, echoIntelligence) {
        let score = 0;
        if (echoIntelligence.current_conversation_task) {
            const taskLower = echoIntelligence.current_conversation_task.toLowerCase();
            const workflowName = predictionResult.detectedWorkflow?.displayName?.toLowerCase() || '';
            score += (taskLower.includes(workflowName.split(' ')[0]) ? 0.5 : 0);
        }
        if (echoIntelligence.todos_in_progress.length > 0) score += 0.3;
        return Math.min(score, 1.0);
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔮 UIP Engine - Database connection closed');
        }
    }
}

// Export
module.exports = UIPIntentPredictionEngine;

// Example usage (if run directly)
if (require.main === module) {
    (async () => {
        const uip = new UIPIntentPredictionEngine();
        await uip.initialize();

        // Test command
        const result = await uip.predictNextSteps(
            'Use ESMC implement core authentication logic',
            {
                userId: 1,
                completedSteps: [],
                completedWorkflows: 5
            },
            1  // missionId
        );

        await uip.close();
    })();
}
