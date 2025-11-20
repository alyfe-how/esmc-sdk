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
 * ESMC 3.79.0 - ESMC-REASON (5W1H Reasoning Framework + Gating Logic)
 * ═══════════════════════════════════════════════════════════════════════
 * 🧠 SHARED REASONING SUBSTRATE FOR ATHENA + ECHELON
 *
 * Purpose: Universal decision-making framework based on 5W1H questioning
 * Architecture: CLI-wrapped reasoning engine (parallel execution in BRAIN PHASE 1)
 * Users: ATHENA (strategic questions) + ECHELON (validator selection)
 * Integration: 5th parallel component alongside PIU/DKI/UIP/PCA
 *
 * NEW in 3.79: Sequential Decision Gating (Phase 2B - Logical Gate)
 * - performGatingAnalysis() method - PROCEED/DEFER/REJECT verdicts
 * - WHERE/WHEN/WHY context validation (threat model, timing, purpose)
 * - Logical halt conditions (context mismatches, clarity issues, timing conflicts)
 *
 * Philosophy:
 * - "Questions before conclusions" - Eliminates bias via comprehensive inquiry
 * - "Context-first thinking" - Understand fully before deciding
 * - "Exposes hidden assumptions" - Forces explicit consideration
 * - "Preserves reasoning freedom" - Framework, not rigid rules
 *
 * Token Budget: ~300 tokens output (CLI JSON)
 * Latency: ~300ms (runs in parallel with mesh components)
 *
 * ESMC Version: 3.79.0 (5W1H Meta-Reasoning + Sequential Gating)
 * Created: 2025-11-08
 * Updated: 2025-11-08 (Gating logic added)
 * Status: PRODUCTION READY
 */

const fs = require('fs');
const path = require('path');

// 🆕 ESMC 3.79: CIE as internal enrichment layer
const { ContextInferenceEngine } = require('./a1ce941e.js');

/**
 * ESMCReason - 5W1H Reasoning Framework
 * Provides neutral decision-making substrate for ATHENA + ECHELON
 *
 * 🆕 ESMC 3.79: CIE-Enriched Reasoning
 * - CIE extracts emphasis patterns (capitalized, markdown, quoted, repeated)
 * - Each 5W1H dimension uses CIE keywords for enhanced inference
 * - 2-layer keyword mesh: Primary keywords + Contextual modifiers
 */
class ESMCReason {
    constructor() {
        this.version = "1.2.0"; // CIE enrichment integrated
        this.esmcVersion = "3.79.0"; // Sequential Decision Gating + CIE

        // 🆕 CIE as internal enrichment layer
        this.cie = new ContextInferenceEngine();

        // 🆕 Semantic category definitions (2-layer keyword mesh)
        this._initializeSemanticCategories();
    }

    /**
     * Main entry point - Analyze topic using 5W1H framework
     * @param {string} topic - What we're analyzing (e.g., "PMO validator selection")
     * @param {object} context - Context data from mesh intelligence
     * @param {string} caller - Who's calling (ECHELON or ATHENA)
     * @param {object} memoryContext - Memory data from .esmc-working-memory.json (NEW in 3.99.1)
     * @returns {object} 5W1H analysis with scoring
     */
    analyze(topic, context = {}, caller = 'UNKNOWN', memoryContext = null) {
        // 🆕 ESMC 3.79: Extract CIE emphasis context FIRST
        const cieContext = this.cie.extractEmphasis(topic);
        // {capitalized: [], markdown: [], quoted: [], repeated: [], technical: []}

        // Run 5W1H inquiry (enriched by CIE + 🆕 3.99.1: Memory context)
        const inquiry = {
            what: this._askWhat(topic, context, cieContext, memoryContext),
            why: this._askWhy(topic, context, cieContext, memoryContext),
            when: this._askWhen(topic, context, cieContext, memoryContext),
            where: this._askWhere(topic, context, cieContext, memoryContext),
            how: this._askHow(topic, context, cieContext, memoryContext),
            who: this._askWho(topic, context, cieContext, memoryContext)
        };

        // Calculate composite scores
        const scores = {
            urgency: this._calculateUrgency(inquiry.when),
            priority: this._calculatePriority(inquiry.why),
            confidence: this._calculateConfidence(inquiry, context),
            complexity: this._calculateComplexity(inquiry.how)
        };

        // Generate recommendations
        const recommendation = this._generateRecommendation(inquiry, scores, caller);

        return {
            version: this.version,
            esmc_version: this.esmcVersion,
            timestamp: new Date().toISOString(),
            topic,
            caller,
            inquiry,
            scores,
            recommendation,
            metadata: {
                context_completeness: this._assessContextCompleteness(context),
                analysis_depth: this._assessAnalysisDepth(inquiry)
            }
        };
    }

    /**
     * 🆕 ESMC 3.79 - Sequential Decision Gating (Phase 2B)
     *
     * Perform logical gating analysis using 5W1H + mesh synthesis
     *
     * @param {string} topic - User request/task
     * @param {object} meshSynthesis - Phase 2A mesh fusion output
     * @param {object} reason5W1H - Phase 1 REASON output (from parallel execution)
     * @param {object} additionalContext - Optional additional context
     * @returns {object} {verdict: 'PROCEED'|'DEFER'|'REJECT', confidence: 0-100, reasoning: {...}}
     *
     * Verdict Logic:
     * - PROCEED: confidence > 70%, no logical flaws, timing/purpose aligned
     * - DEFER: confidence 40-70%, needs clarification, timing issues
     * - REJECT: confidence < 40%, WHERE/WHEN/WHY context invalidates request
     *
     * Halt Conditions:
     * - verdict === 'REJECT': Return reasoning, skip Phase 2C
     * - verdict === 'DEFER': Ask clarifying questions, skip Phase 2C
     * - verdict === 'PROCEED': Continue to Phase 2C (decision synthesis)
     */
    performGatingAnalysis(topic, meshSynthesis, reason5W1H, additionalContext = {}) {
        // Step 1: Run full 5W1H inquiry (if not already provided)
        const inquiry = reason5W1H?.inquiry || this.analyze(topic, additionalContext, 'GATING').inquiry;

        // Step 2-7: Perform ALL 6 validations (5W + 1H) - Full logical validation
        const whereValidation = this._validateWhereContext(inquiry.where, meshSynthesis, topic);
        const whenValidation = this._validateWhenContext(inquiry.when, reason5W1H?.scores || this._calculateScores(inquiry, additionalContext));
        const whyValidation = this._validateWhyContext(inquiry.why, meshSynthesis, topic);
        const whatValidation = this._validateWhatContext(inquiry.what, meshSynthesis, topic);
        const howValidation = this._validateHowContext(inquiry.how, meshSynthesis, topic);
        const whoValidation = this._validateWhoContext(inquiry.who, meshSynthesis, topic);

        // Step 8: Detect logical flaws (context mismatches, over-engineering, scope creep)
        const logicalFlaws = this._detectLogicalFlaws(inquiry, meshSynthesis, {
            where: whereValidation,
            when: whenValidation,
            why: whyValidation,
            what: whatValidation,
            how: howValidation,
            who: whoValidation
        });

        // Step 9: Calculate gating confidence (0-100) - PURE logical confidence (all 6 scopes)
        const confidence = this._calculateGatingConfidence({
            where: whereValidation,
            when: whenValidation,
            why: whyValidation,
            what: whatValidation,
            how: howValidation,
            who: whoValidation,
            logicalFlaws
        });

        // Step 10: Determine verdict (PROCEED/DEFER/REJECT)
        const verdict = this._determineGatingVerdict(confidence, logicalFlaws, {
            where: whereValidation,
            when: whenValidation,
            why: whyValidation,
            what: whatValidation,
            how: howValidation,
            who: whoValidation
        });

        // Step 11: Generate reasoning + next steps
        const reasoning = this._generateGatingReasoning(inquiry, verdict, confidence, logicalFlaws, {
            where: whereValidation,
            when: whenValidation,
            why: whyValidation,
            what: whatValidation,
            how: howValidation,
            who: whoValidation
        });

        return {
            phase: '2B_LOGICAL_GATING',
            verdict, // 'PROCEED' | 'DEFER' | 'REJECT'
            confidence, // 0-100
            reasoning, // Full 5W1H + validation results + logical flaws
            scores: reason5W1H?.scores || this._calculateScores(inquiry, additionalContext),
            next_steps: this._generateNextSteps(verdict, logicalFlaws, reasoning),
            halt: verdict !== 'PROCEED' // true for DEFER/REJECT
        };
    }

    /**
     * Detect context mismatches (generalized, not IFDS-specific)
     *
     * Patterns:
     * - Local/offline environment + network-dependent tools
     * - Serverless environment + stateful session tools
     * - Single-user app + multi-tenant security
     * - Browser-only app + server-side technologies
     * - Mobile-first + desktop-only patterns
     *
     * @private
     */
    _detectContextMismatches(environment, topic, meshSynthesis) {
        const mismatches = [];
        const topicLower = String(topic || '').toLowerCase();

        // Pattern 1: Local/offline + network-dependent tools
        const isLocal = environment.includes('local') ||
                       environment.includes('CLI') ||
                       environment.includes('SDK') ||
                       environment.includes('offline');

        const needsNetwork = topicLower.includes('api ') ||
                            topicLower.includes('websocket') ||
                            topicLower.includes('real-time') ||
                            topicLower.includes('network') ||
                            topicLower.includes('taint') ||
                            topicLower.includes('xss') ||
                            topicLower.includes('csrf');

        if (isLocal && needsNetwork) {
            mismatches.push({
                type: 'deployment_context_mismatch',
                severity: 'critical',
                details: `WHERE context mismatch: Local/offline deployment but network-dependent tool/pattern requested. Local environment = no network connectivity required.`,
                recommendation: 'REJECT - Use offline-compatible alternatives or clarify if deployment is actually network-connected'
            });
        }

        // Pattern 2: Serverless + stateful tools
        const isServerless = environment.includes('serverless') ||
                            environment.includes('lambda') ||
                            environment.includes('edge');

        const needsState = topicLower.includes('session') ||
                          topicLower.includes('cache') ||
                          topicLower.includes('websocket') ||
                          topicLower.includes('stateful');

        if (isServerless && needsState) {
            mismatches.push({
                type: 'architecture_context_mismatch',
                severity: 'critical',
                details: `WHERE context mismatch: Serverless/ephemeral environment but stateful pattern requested. Serverless = stateless by design.`,
                recommendation: 'REJECT - Use external state storage (Redis, DynamoDB) or reconsider serverless architecture'
            });
        }

        // Pattern 3: Single-user + multi-tenant security
        const isSingleUser = environment.includes('single') ||
                            environment.includes('personal') ||
                            topicLower.includes('desktop app');

        const needsMultiTenant = topicLower.includes('tenant') ||
                                topicLower.includes('isolation') ||
                                topicLower.includes('row-level');

        if (isSingleUser && needsMultiTenant) {
            mismatches.push({
                type: 'scale_context_mismatch',
                severity: 'high',
                details: `WHERE context mismatch: Single-user application but multi-tenant security pattern requested. Single-user = no tenant isolation needed.`,
                recommendation: 'DEFER - Clarify if future multi-user expansion planned, otherwise remove multi-tenant complexity'
            });
        }

        // Pattern 4: Browser-only + server-side tech
        const isBrowserOnly = environment.includes('browser') ||
                             environment.includes('frontend') ||
                             environment.includes('client-side');

        const needsServer = topicLower.includes('database') ||
                           topicLower.includes('file system') ||
                           topicLower.includes('server') ||
                           topicLower.includes('backend');

        if (isBrowserOnly && needsServer) {
            mismatches.push({
                type: 'tier_context_mismatch',
                severity: 'critical',
                details: `WHERE context mismatch: Browser-only/client-side environment but server-side technology requested. Browser = no direct database/filesystem access.`,
                recommendation: 'REJECT - Use browser APIs (LocalStorage, IndexedDB) or add backend tier'
            });
        }

        // Pattern 5: Mobile-first + desktop-only patterns
        const isMobile = environment.includes('mobile') ||
                        environment.includes('ios') ||
                        environment.includes('android');

        const needsDesktop = topicLower.includes('keyboard shortcut') ||
                            topicLower.includes('mouse') ||
                            topicLower.includes('desktop');

        if (isMobile && needsDesktop) {
            mismatches.push({
                type: 'platform_context_mismatch',
                severity: 'medium',
                details: `WHERE context mismatch: Mobile platform but desktop-specific pattern requested. Mobile = touch-first interaction.`,
                recommendation: 'DEFER - Use mobile-friendly alternatives (gestures, touch) or clarify if hybrid app'
            });
        }

        return mismatches;
    }

    /**
     * Validate WHERE context (deployment environment, threat model, scope boundaries)
     *
     * Key checks:
     * - Deployment environment matches solution/tool type (generalized detection)
     * - Context mismatches identified across multiple patterns
     * - Scope boundaries realistic for environment
     *
     * @private
     */
    _validateWhereContext(whereInquiry, meshSynthesis, topic) {
        const validation = {
            valid: true,
            confidence: 1.0,
            issues: [],
            context: whereInquiry
        };

        // Defensive: ensure environment is a string
        const environment = String(whereInquiry?.environment || 'unknown');

        // Check 1: Context mismatch detection (generalized, not IFDS-specific)
        const contextMismatches = this._detectContextMismatches(environment, topic, meshSynthesis);

        if (contextMismatches.length > 0) {
            // Critical context mismatch found
            const criticalMismatch = contextMismatches.find(m => m.severity === 'critical');

            if (criticalMismatch) {
                validation.valid = false;
                validation.confidence = 0.25;
                validation.issues.push(criticalMismatch);
            } else {
                // Non-critical mismatches
                validation.confidence *= 0.6;
                validation.issues.push(...contextMismatches);
            }
        }

        // Check 2: Environment unknown/vague
        if (environment === 'unknown' || environment.includes('unclear')) {
            validation.confidence *= 0.6;
            validation.issues.push({
                type: 'environment_unclear',
                severity: 'medium',
                details: 'Deployment environment not specified - cannot validate threat model',
                recommendation: 'DEFER - Clarify: local-only, internal network, public internet, hybrid?'
            });
        }

        return validation;
    }

    /**
     * Validate WHEN context (urgency vs priority alignment, timing realism)
     *
     * Key checks:
     * - Urgency and priority alignment (high urgency + low priority = mismatch)
     * - Timeline realistic vs complexity
     * - Timing conflicts with other factors
     *
     * @private
     */
    _validateWhenContext(whenInquiry, scores) {
        const validation = {
            valid: true,
            confidence: 1.0,
            issues: [],
            context: whenInquiry
        };

        const urgency = scores.urgency || 0.5;
        const priority = scores.priority || 0.5;

        // Check 1: Urgency/Priority mismatch (rushed without strategic value)
        const urgencyPriorityGap = Math.abs(urgency - priority);
        if (urgencyPriorityGap > 0.3) {
            validation.confidence *= 0.7;

            if (urgency > 0.7 && priority < 0.5) {
                // High urgency, low priority = rushed request
                validation.valid = false;
                validation.issues.push({
                    type: 'urgency_priority_mismatch',
                    severity: 'high',
                    details: `High urgency (${(urgency * 100).toFixed(0)}%) but low priority (${(priority * 100).toFixed(0)}%) suggests rushed request without strategic value`,
                    recommendation: 'DEFER - Clarify business driver. High urgency without clear priority often indicates miscommunication.'
                });
            }
        }

        // Check 2: Timeline unknown
        const timeline = String(whenInquiry?.timeline || 'unknown');
        if (timeline === 'unknown' || timeline.includes('unclear')) {
            validation.confidence *= 0.8;
            validation.issues.push({
                type: 'timeline_unclear',
                severity: 'low',
                details: 'Timeline not specified - cannot assess urgency accurately',
                recommendation: 'Clarify expected delivery timeline'
            });
        }

        return validation;
    }

    /**
     * Validate WHY context (purpose clarity, stakeholder needs, business value)
     *
     * Key checks:
     * - Purpose clearly stated vs vague
     * - Stakeholder needs identified
     * - Business value articulated
     *
     * @private
     */
    _validateWhyContext(whyInquiry, meshSynthesis, topic) {
        const validation = {
            valid: true,
            confidence: 1.0,
            issues: [],
            context: whyInquiry
        };

        // Check 1: Purpose vague/missing
        const primaryGoal = String(whyInquiry?.primary_goal || 'unknown');
        if (primaryGoal === 'unknown' || primaryGoal.includes('unclear')) {
            validation.confidence *= 0.5;
            validation.issues.push({
                type: 'purpose_unclear',
                severity: 'medium',
                details: 'Primary goal not clearly stated - purpose ambiguous',
                recommendation: 'DEFER - Ask: What business outcome does this enable? Who benefits?'
            });
        }

        // Check 2: Low PIU confidence (intent unclear)
        const piuConfidence = meshSynthesis?.synthesis?.intent_project_alignment || 0.5;
        if (piuConfidence < 0.4) {
            validation.confidence *= 0.6;
            validation.issues.push({
                type: 'intent_ambiguity',
                severity: 'medium',
                details: `Low intent clarity (PIU confidence: ${(piuConfidence * 100).toFixed(0)}%)`,
                recommendation: 'DEFER - Request more context to clarify intent'
            });
        }

        return validation;
    }

    /**
     * Validate WHAT context (scope reasonableness, over/under-engineering)
     *
     * Key checks:
     * - Scope appropriate for stated goal (over-engineering vs under-engineering)
     * - Scope creep detection (task expanding beyond original intent)
     * - Deliverable clarity (what is being built is well-defined)
     *
     * @private
     */
    _validateWhatContext(whatInquiry, meshSynthesis, topic) {
        const validation = {
            valid: true,
            confidence: 1.0,
            issues: [],
            context: whatInquiry
        };

        // Check 1: Deliverable clarity (what is clearly defined)
        const deliverable = String(whatInquiry?.deliverable || whatInquiry?.technical_spec || 'unknown');
        if (deliverable === 'unknown' || deliverable.includes('unclear') || deliverable.length < 10) {
            validation.confidence *= 0.6;
            validation.issues.push({
                type: 'deliverable_unclear',
                severity: 'medium',
                details: 'WHAT is being built is not clearly specified',
                recommendation: 'DEFER - Clarify specific deliverable, acceptance criteria, scope boundaries'
            });
        }

        // Check 2: Scope creep detection (task mentions multiple unrelated features)
        const scopeIndicators = String(topic || '').toLowerCase();
        const featureCount = (scopeIndicators.match(/\band\b/g) || []).length +
                            (scopeIndicators.match(/\balso\b/g) || []).length +
                            (scopeIndicators.match(/\bplus\b/g) || []).length;

        if (featureCount > 3) {
            validation.confidence *= 0.7;
            validation.issues.push({
                type: 'scope_creep',
                severity: 'medium',
                details: `Multiple features detected in single request (${featureCount + 1} items) - scope may be too broad`,
                recommendation: 'Consider breaking into separate tasks for focused delivery'
            });
        }

        // Check 3: Over-engineering (complex solution for simple problem)
        const complexity = whatInquiry?.implementation_complexity || 'unknown';
        const isSimpleProblem = scopeIndicators.includes('add') ||
                               scopeIndicators.includes('update') ||
                               scopeIndicators.includes('fix');

        if ((complexity === 'high' || complexity === 'very high') && isSimpleProblem) {
            validation.confidence *= 0.8;
            validation.issues.push({
                type: 'potential_over_engineering',
                severity: 'low',
                details: 'High complexity solution proposed for seemingly simple problem',
                recommendation: 'Verify: Is complex approach necessary? Consider simpler alternatives'
            });
        }

        return validation;
    }

    /**
     * Validate HOW context (implementation approach, complexity vs value)
     *
     * Key checks:
     * - Approach complexity justified by value delivered
     * - Known patterns vs reinventing wheel
     * - Resource intensity realistic vs available resources
     *
     * @private
     */
    _validateHowContext(howInquiry, meshSynthesis, topic) {
        const validation = {
            valid: true,
            confidence: 1.0,
            issues: [],
            context: howInquiry
        };

        // Check 1: Implementation approach defined
        const approach = String(howInquiry?.approach || howInquiry?.implementation_steps || 'unknown');
        if (approach === 'unknown' || approach.length < 10) {
            validation.confidence *= 0.7;
            validation.issues.push({
                type: 'approach_undefined',
                severity: 'low',
                details: 'HOW to implement is not specified - approach unclear',
                recommendation: 'Acceptable if ECHELON will determine approach, otherwise clarify'
            });
        }

        // Check 2: Complexity vs resource constraints
        const projectConfidence = meshSynthesis?.synthesis?.intent_project || 0.5;
        const stepsCount = howInquiry?.implementation_steps?.length || 0;

        if (stepsCount > 7 && projectConfidence < 0.4) {
            validation.confidence *= 0.6;
            validation.valid = false;
            validation.issues.push({
                type: 'resource_constraint',
                severity: 'high',
                details: `Complex implementation (${stepsCount} steps) but low project alignment (${(projectConfidence * 100).toFixed(0)}%) - resource mismatch`,
                recommendation: 'DEFER - Complex approach requires strong codebase foundation. Build prerequisites first'
            });
        }

        // Check 3: Reinventing wheel (pattern exists but not being used)
        const suggestedPatterns = meshSynthesis?.synthesis?.suggested_patterns || [];
        const usesKnownPattern = approach.toLowerCase().includes('pattern') ||
                                approach.toLowerCase().includes('existing');

        if (suggestedPatterns.length > 0 && !usesKnownPattern && approach !== 'unknown') {
            validation.confidence *= 0.85;
            validation.issues.push({
                type: 'potential_reinvention',
                severity: 'low',
                details: 'Known patterns available in codebase, ensure approach leverages existing vs reinventing',
                recommendation: 'Consider: Can existing patterns be reused vs building from scratch?'
            });
        }

        return validation;
    }

    /**
     * Validate WHO context (stakeholder alignment, user vs business needs)
     *
     * Key checks:
     * - Stakeholder needs identified and aligned
     * - User vs business vs compliance conflicts
     * - Correct stakeholder prioritized
     *
     * @private
     */
    _validateWhoContext(whoInquiry, meshSynthesis, topic) {
        const validation = {
            valid: true,
            confidence: 1.0,
            issues: [],
            context: whoInquiry
        };

        // Check 1: Stakeholders identified
        const primaryUsers = whoInquiry?.primary_users || [];
        const stakeholders = whoInquiry?.stakeholders || [];
        const totalStakeholders = primaryUsers.length + stakeholders.length;

        if (totalStakeholders === 0) {
            validation.confidence *= 0.7;
            validation.issues.push({
                type: 'stakeholders_unclear',
                severity: 'medium',
                details: 'WHO benefits from this is not identified - stakeholder ambiguity',
                recommendation: 'DEFER - Clarify: Who are the primary users/beneficiaries?'
            });
        }

        // Check 2: Compliance stakeholders missing (security/legal topics)
        const requiresCompliance = String(topic || '').toLowerCase().includes('auth') ||
                                  String(topic || '').toLowerCase().includes('security') ||
                                  String(topic || '').toLowerCase().includes('payment') ||
                                  String(topic || '').toLowerCase().includes('data') ||
                                  String(topic || '').toLowerCase().includes('gdpr') ||
                                  String(topic || '').toLowerCase().includes('hipaa');

        const hasComplianceStakeholder = stakeholders.some(s =>
            String(s).toLowerCase().includes('compliance') ||
            String(s).toLowerCase().includes('legal') ||
            String(s).toLowerCase().includes('security')
        );

        if (requiresCompliance && !hasComplianceStakeholder) {
            validation.confidence *= 0.6;
            validation.valid = false;
            validation.issues.push({
                type: 'missing_compliance_stakeholder',
                severity: 'high',
                details: 'Request involves compliance/security topic but compliance stakeholders not identified',
                recommendation: 'DEFER - Involve security/compliance team before implementation'
            });
        }

        // Check 3: Stakeholder conflict (user vs business needs mismatch)
        const hasUserStakeholder = stakeholders.some(s => String(s).toLowerCase().includes('user'));
        const hasBusinessStakeholder = stakeholders.some(s =>
            String(s).toLowerCase().includes('business') ||
            String(s).toLowerCase().includes('management') ||
            String(s).toLowerCase().includes('ops')
        );

        if (hasUserStakeholder && hasBusinessStakeholder && totalStakeholders === 2) {
            validation.confidence *= 0.85;
            validation.issues.push({
                type: 'potential_stakeholder_conflict',
                severity: 'low',
                details: 'User and business stakeholders identified - ensure needs align',
                recommendation: 'Verify: User needs vs business goals compatible? Prioritization clear?'
            });
        }

        return validation;
    }

    /**
     * Detect logical flaws (context mismatches, over-engineering, scope creep)
     *
     * @private
     */
    _detectLogicalFlaws(inquiry, meshSynthesis, validations) {
        const flaws = [];

        // Flaw 1: WHERE validation failed (threat model mismatch)
        if (!validations.where.valid) {
            flaws.push({
                type: 'context_mismatch',
                dimension: 'WHERE',
                severity: 'critical',
                details: validations.where.issues.find(i => i.type === 'threat_model_mismatch')?.details || 'WHERE context invalid',
                impact: 'Request logically unsound given deployment context'
            });
        }

        // Flaw 2: WHEN validation failed (urgency/priority mismatch)
        if (!validations.when.valid) {
            flaws.push({
                type: 'timing_conflict',
                dimension: 'WHEN',
                severity: 'high',
                details: validations.when.issues[0]?.details || 'WHEN context invalid',
                impact: 'Timeline/priority misalignment suggests miscommunication'
            });
        }

        // Flaw 3: WHY validation low confidence (purpose unclear)
        if (validations.why.confidence < 0.5) {
            flaws.push({
                type: 'purpose_ambiguity',
                dimension: 'WHY',
                severity: 'medium',
                details: 'Purpose not clearly articulated',
                impact: 'Cannot assess business value without clear goal'
            });
        }

        // Flaw 4: WHAT validation failed (scope issues)
        if (!validations.what.valid || validations.what.confidence < 0.5) {
            const scopeIssue = validations.what.issues.find(i => i.type === 'scope_creep' || i.type === 'deliverable_unclear');
            if (scopeIssue) {
                flaws.push({
                    type: scopeIssue.type,
                    dimension: 'WHAT',
                    severity: scopeIssue.severity,
                    details: scopeIssue.details,
                    impact: 'Unclear deliverable or scope creep risk'
                });
            }
        }

        // Flaw 5: HOW validation failed (implementation approach issues)
        if (!validations.how.valid) {
            const approachIssue = validations.how.issues.find(i => i.severity === 'high');
            if (approachIssue) {
                flaws.push({
                    type: approachIssue.type,
                    dimension: 'HOW',
                    severity: approachIssue.severity,
                    details: approachIssue.details,
                    impact: 'Implementation approach resource mismatch or complexity issues'
                });
            }
        }

        // Flaw 6: WHO validation failed (stakeholder issues)
        if (!validations.who.valid) {
            const stakeholderIssue = validations.who.issues.find(i => i.type === 'missing_compliance_stakeholder');
            if (stakeholderIssue) {
                flaws.push({
                    type: 'missing_compliance_stakeholder',
                    dimension: 'WHO',
                    severity: 'high',
                    details: stakeholderIssue.details,
                    impact: 'Compliance/security stakeholders not involved in sensitive request'
                });
            }
        }

        // Flaw 7: Over-engineering (high complexity + low value) - Cross-dimension check
        const complexity = inquiry.how.implementation_steps?.length || 0;
        const value = validations.why.confidence;
        if (complexity > 5 && value < 0.5) {
            flaws.push({
                type: 'over_engineering',
                dimension: 'HOW vs WHY',
                severity: 'medium',
                details: `High complexity (${complexity} steps) but unclear value (${(value * 100).toFixed(0)}% purpose confidence)`,
                impact: 'Risk of building complex solution for vague problem'
            });
        }

        return flaws;
    }

    /**
     * Calculate gating confidence (0-100)
     *
     * Weighted formula:
     * - WHERE validation: 35% (most critical - context must be valid)
     * - WHY validation: 30% (purpose clarity essential)
     * - WHEN validation: 20% (timing matters but less critical)
     * - Mesh feasibility: 15% (technical already gated in Phase 2A)
     *
     * @private
     */
    _calculateGatingConfidence(inputs) {
        // PURE logical confidence (all 6 scopes, 0-100 scale)
        // INDEPENDENT of Phase 2A mesh synthesis (no meshFeasibility leakage)
        //
        // Weighting philosophy:
        // - WHERE (20%): Deployment context, threat model (critical for security/context)
        // - WHY (20%): Purpose clarity, business value (critical for strategic alignment)
        // - WHEN (15%): Timing/urgency alignment (important for prioritization)
        // - WHAT (15%): Scope reasonableness (important for deliverable clarity)
        // - HOW (15%): Approach validation (important for implementation soundness)
        // - WHO (15%): Stakeholder alignment (important for user/business needs)
        // Total: 100% (balanced across all logical dimensions)

        const baseConfidence = (
            inputs.where.confidence * 0.20 +
            inputs.why.confidence * 0.20 +
            inputs.when.confidence * 0.15 +
            inputs.what.confidence * 0.15 +
            inputs.how.confidence * 0.15 +
            inputs.who.confidence * 0.15
        ) * 100;

        // Penalty for logical flaws
        let flawPenalty = 0;
        inputs.logicalFlaws.forEach(flaw => {
            if (flaw.severity === 'critical') flawPenalty += 30;
            else if (flaw.severity === 'high') flawPenalty += 15;
            else if (flaw.severity === 'medium') flawPenalty += 7;
        });

        return Math.max(0, Math.min(100, Math.round(baseConfidence - flawPenalty)));
    }

    /**
     * Determine gating verdict (PROCEED/DEFER/REJECT)
     *
     * Rules:
     * - REJECT: confidence < 40% OR critical WHERE flaw
     * - DEFER: confidence 40-70% OR medium flaws need clarification
     * - PROCEED: confidence > 70% AND no critical flaws
     *
     * @private
     */
    _determineGatingVerdict(confidence, logicalFlaws, validations) {
        // Critical WHERE flaw = automatic REJECT (threat model invalid)
        const hasCriticalWhereFlaw = logicalFlaws.some(f => f.dimension === 'WHERE' && f.severity === 'critical');
        if (hasCriticalWhereFlaw) {
            return 'REJECT';
        }

        // Confidence-based verdict
        if (confidence < 40) {
            return 'REJECT'; // Low confidence = logical unsound
        } else if (confidence >= 40 && confidence < 70) {
            return 'DEFER'; // Medium confidence = needs clarification
        } else {
            return 'PROCEED'; // High confidence = green light
        }
    }

    /**
     * Generate gating reasoning (full 5W1H + validation results)
     *
     * @private
     */
    _generateGatingReasoning(inquiry, verdict, confidence, logicalFlaws, validations) {
        const reasoning = {
            what: inquiry.what.subject,
            why: inquiry.why.primary_goal,
            when: inquiry.when.timeline,
            where: inquiry.where.environment,
            how: inquiry.how.approach,
            who: inquiry.who.primary_users.join(', '),
            verdict,
            confidence,
            validation_results: {
                where_valid: validations.where.valid,
                where_confidence: Math.round(validations.where.confidence * 100),
                when_valid: validations.when.valid,
                when_confidence: Math.round(validations.when.confidence * 100),
                why_valid: validations.why.valid,
                why_confidence: Math.round(validations.why.confidence * 100),
                what_valid: validations.what.valid,
                what_confidence: Math.round(validations.what.confidence * 100),
                how_valid: validations.how.valid,
                how_confidence: Math.round(validations.how.confidence * 100),
                who_valid: validations.who.valid,
                who_confidence: Math.round(validations.who.confidence * 100)
            },
            logical_flaws: logicalFlaws.length > 0 ? logicalFlaws : 'None detected'
        };

        // Add specific reasoning based on verdict
        if (verdict === 'REJECT') {
            const criticalFlaw = logicalFlaws.find(f => f.severity === 'critical');
            reasoning.rejection_reason = criticalFlaw?.details || 'Confidence too low for informed decision';
            reasoning.recommendation = criticalFlaw?.impact || 'Re-assess request scope and context';
        } else if (verdict === 'DEFER') {
            reasoning.deferral_reason = 'Needs clarification before proceeding';
            reasoning.clarifying_questions = this._generateClarifyingQuestions(logicalFlaws, validations);
        } else {
            reasoning.proceed_rationale = `High confidence (${confidence}%) + no critical flaws detected`;
        }

        return reasoning;
    }

    /**
     * Generate clarifying questions for DEFER verdict
     *
     * @private
     */
    _generateClarifyingQuestions(logicalFlaws, validations) {
        const questions = [];

        // WHERE issues
        if (validations.where.issues.length > 0) {
            questions.push('What is the deployment environment? (local-only, internal network, public internet)');
        }

        // WHEN issues
        if (validations.when.issues.some(i => i.type === 'urgency_priority_mismatch')) {
            questions.push('What business outcome justifies the urgency? Is the timeline user-requested or assumed?');
        }

        // WHY issues
        if (validations.why.issues.some(i => i.type === 'purpose_unclear')) {
            questions.push('What is the primary goal? Who are the stakeholders who will benefit?');
        }

        return questions.length > 0 ? questions : ['Provide more context about the request'];
    }

    /**
     * Generate next steps based on verdict
     *
     * @private
     */
    _generateNextSteps(verdict, logicalFlaws, reasoning) {
        if (verdict === 'PROCEED') {
            return [
                'Continue to PHASE 2C (ECHELON Decision Synthesis)',
                'Technical feasibility ✅ + Logical context ✅ → Ready for final orchestration'
            ];
        } else if (verdict === 'DEFER') {
            return [
                'HALT - Do not proceed to Phase 2C',
                'Ask clarifying questions: ' + (reasoning.clarifying_questions?.join('; ') || 'Gather context'),
                'Re-submit request after clarification'
            ];
        } else {
            // REJECT
            return [
                'HALT - Do not proceed to Phase 2C',
                'Logical flaw detected: ' + (logicalFlaws[0]?.details || 'Context invalid'),
                'Re-assess request context or abandon approach'
            ];
        }
    }

    /**
     * Helper to calculate scores if not provided
     * @private
     */
    _calculateScores(inquiry, context) {
        return {
            urgency: this._calculateUrgency(inquiry.when),
            priority: this._calculatePriority(inquiry.why),
            confidence: this._calculateConfidence(inquiry, context),
            complexity: this._calculateComplexity(inquiry.how)
        };
    }

    /**
     * WHAT - Define the subject/object clearly
     * 🆕 ESMC 3.99.1: Memory-enriched (precedent detection, rebuild prevention)
     */
    _askWhat(topic, context, cieContext = {}, memoryContext = null) {
        const base = {
            question: `What exactly is "${topic}"?`,
            subject: topic,
            context_type: this._inferContextType(topic),
            characteristics: this._extractCharacteristics(context),
            scope: this._defineScope(topic, context),
            boundaries: this._identifyBoundaries(context)
        };

        // 🆕 Memory enrichment: Precedent matching
        if (memoryContext) {
            const t1Match = memoryContext.atlas_t1?.top_match;
            if (t1Match && t1Match.score >= 0.85) {
                base.precedent_match = {
                    found: true,
                    rank: t1Match.rank,
                    similarity: (t1Match.score * 100).toFixed(0) + '%',
                    date: t1Match.date,
                    title: t1Match.title,
                    recommendation: 'Review existing implementation before rebuilding - high similarity detected'
                };
            } else if (t1Match && t1Match.score >= 0.65) {
                base.precedent_match = {
                    found: true,
                    rank: t1Match.rank,
                    similarity: (t1Match.score * 100).toFixed(0) + '%',
                    date: t1Match.date,
                    title: t1Match.title,
                    recommendation: 'Similar work exists - consider reusing patterns/components'
                };
            }
        }

        return base;
    }

    /**
     * WHY - Understand purpose and motivation
     * 🆕 ESMC 3.99.1: Memory-enriched (lesson violations, already-implemented detection)
     */
    _askWhy(topic, context, cieContext = {}, memoryContext = null) {
        const base = {
            question: `Why do we need "${topic}"?`,
            purpose: this._inferPurpose(topic, context),
            motivation: this._inferMotivation(context),
            business_criticality: this._assessCriticality(context),
            user_impact: this._assessUserImpact(context),
            value_proposition: this._identifyValue(topic, context)
        };

        // 🆕 Memory enrichment: Lesson violation detection
        if (memoryContext && memoryContext.lessons) {
            const topicLower = topic.toLowerCase();
            const matchedLesson = memoryContext.lessons.find(lesson =>
                lesson.trigger_keywords.some(kw => topicLower.includes(kw.toLowerCase()))
            );

            if (matchedLesson) {
                base.lesson_violation = {
                    detected: true,
                    lesson_id: matchedLesson.id,
                    severity: matchedLesson.severity,
                    frustration_score: matchedLesson.frustration_score,
                    lesson: matchedLesson.lesson,
                    recommendation: `REJECT - ${matchedLesson.lesson}`,
                    context: matchedLesson.context
                };
                // Override purpose when lesson violated
                base.purpose = `VIOLATION OF LESSON ${matchedLesson.id}`;
            }
        }

        // 🆕 Memory enrichment: Already implemented detection
        if (memoryContext && !base.lesson_violation) {
            const t1Match = memoryContext.atlas_t1?.top_match;
            if (t1Match && t1Match.score >= 0.85) {
                base.already_implemented = {
                    detected: true,
                    rank: t1Match.rank,
                    similarity: (t1Match.score * 100).toFixed(0) + '%',
                    date: t1Match.date,
                    title: t1Match.title,
                    recommendation: 'DEFER - Review existing implementation before rebuilding'
                };
                // Enrich purpose
                base.purpose = `Already implemented in ${t1Match.title} (Rank ${t1Match.rank})`;
            }
        }

        return base;
    }

    /**
     * WHEN - Understand timing and urgency
     * 🆕 ESMC 3.99.1: Memory-enriched (historical timeline calibration, iteration context)
     */
    _askWhen(topic, context, cieContext = {}, memoryContext = null) {
        const base = {
            question: `When is "${topic}" needed?`,
            timeline: this._extractTimeline(context),
            deployment_phase: this._inferDeploymentPhase(context),
            urgency_factors: this._identifyUrgencyFactors(context),
            temporal_constraints: this._identifyTimeConstraints(context)
        };

        // 🆕 Memory enrichment: Historical timeline context
        if (memoryContext) {
            const t1Sessions = memoryContext.t1_sessions || [];
            if (t1Sessions.length > 0) {
                // Calculate average timeline from similar past sessions
                const pastTimelines = t1Sessions
                    .map(s => s.metadata?.timeline)
                    .filter(t => t && t !== 'unknown');

                if (pastTimelines.length > 0) {
                    base.historical_timeline = {
                        past_attempts: t1Sessions.length,
                        avg_timeline: 'Varies by session',
                        calibration: pastTimelines.length > 2
                            ? 'Multiple similar sessions - realistic timeline estimation available'
                            : 'Limited history - timeline may need adjustment'
                    };
                }
            }

            // Iteration count (affects urgency calibration)
            const t1Match = memoryContext.atlas_t1?.top_match;
            if (t1Match && t1Match.score >= 0.75) {
                base.iteration_context = {
                    previous_attempt: true,
                    rank: t1Match.rank,
                    date: t1Match.date,
                    note: 'This is a retry/refinement of previous work - urgency may be artificially inflated'
                };
            }
        }

        return base;
    }

    /**
     * WHERE - Understand location and environment
     * 🆕 ESMC 3.99.1: Memory-enriched (deployment consistency, threat model memory)
     */
    _askWhere(topic, context, cieContext = {}, memoryContext = null) {
        // 🆕 Extract CIE keywords for semantic detection
        const cieKeywords = [
            ...(cieContext.capitalized || []),
            ...(cieContext.markdown || []),
            ...(cieContext.quoted || []),
            ...(cieContext.repeated || [])
        ];

        // 🆕 Semantic category detection (2-layer keyword mesh)
        const deployment = this._detectSemanticCategory(cieKeywords, 'deployment_');
        const network = this._detectSemanticCategory(cieKeywords, 'network_');
        const trust = this._detectSemanticCategory(cieKeywords, 'trust_');
        const threat = this._detectSemanticCategory(cieKeywords, 'threat_');

        const base = {
            question: `Where will "${topic}" be used/deployed?`,
            environment: deployment.category !== 'UNKNOWN' ? deployment.category : this._inferEnvironment(context),
            deployment_target: this._inferDeploymentTarget(context),
            infrastructure: this._inferInfrastructure(context),
            distribution: this._inferDistribution(context),
            network_exposure: network.category !== 'UNKNOWN' ? network.category : this._assessNetworkExposure(context),
            // 🆕 CIE-enriched semantic detection
            cie_deployment: deployment,
            cie_network: network,
            cie_trust: trust,
            cie_threat: threat,
            cie_keywords: cieKeywords,
            cie_confidence: (deployment.confidence + network.confidence + trust.confidence) / 3
        };

        // 🆕 Memory enrichment: Deployment consistency checking
        if (memoryContext) {
            const t1Sessions = memoryContext.t1_sessions || [];
            if (t1Sessions.length > 0) {
                // Extract past deployment targets
                const pastDeployments = t1Sessions
                    .map(s => s.metadata?.where?.environment || s.metadata?.where?.deployment_target)
                    .filter(d => d && d !== 'unknown');

                if (pastDeployments.length > 0) {
                    const mostCommon = pastDeployments.reduce((acc, d) => {
                        acc[d] = (acc[d] || 0) + 1;
                        return acc;
                    }, {});
                    const dominant = Object.keys(mostCommon).sort((a, b) => mostCommon[b] - mostCommon[a])[0];

                    base.deployment_history = {
                        past_environments: [...new Set(pastDeployments)],
                        dominant_pattern: dominant,
                        frequency: mostCommon[dominant],
                        consistency_check: dominant !== base.environment
                            ? `⚠️ Architecture shift detected: Past = ${dominant}, Current = ${base.environment}`
                            : `✅ Consistent with past deployment pattern (${dominant})`
                    };
                }
            }
        }

        return base;
    }

    /**
     * HOW - Understand implementation and approach
     * 🆕 ESMC 3.99.1: Memory-enriched (precedent patterns, complexity calibration, failed approach memory)
     */
    _askHow(topic, context, cieContext = {}, memoryContext = null) {
        const base = {
            question: `How should "${topic}" be implemented?`,
            current_state: this._assessCurrentState(context),
            approach_options: this._identifyApproaches(topic, context),
            implementation_complexity: this._assessImplementationComplexity(context),
            integration_points: this._identifyIntegrationPoints(context)
        };

        // 🆕 Memory enrichment: Precedent-informed approach
        if (memoryContext) {
            const t1Match = memoryContext.atlas_t1?.top_match;
            if (t1Match && t1Match.score >= 0.70) {
                base.precedent_approach = {
                    rank: t1Match.rank,
                    similarity: (t1Match.score * 100).toFixed(0) + '%',
                    date: t1Match.date,
                    title: t1Match.title,
                    recommendation: t1Match.score >= 0.85
                        ? 'Strong precedent - reuse patterns/approach from this session'
                        : 'Similar work exists - review approach for applicable patterns'
                };
            }

            // Complexity calibration from history
            const t1Sessions = memoryContext.t1_sessions || [];
            if (t1Sessions.length > 0) {
                const pastComplexities = t1Sessions
                    .map(s => s.metadata?.complexity)
                    .filter(c => c && c !== 'unknown');

                if (pastComplexities.length > 0) {
                    base.complexity_calibration = {
                        historical_avg: pastComplexities.length > 2 ? 'medium' : 'varies',
                        note: `${pastComplexities.length} similar past sessions available for complexity estimation`
                    };
                }
            }
        }

        return base;
    }

    /**
     * WHO - Understand stakeholders and users
     * 🆕 ESMC 3.99.1: Memory-enriched (user adaptation layer, stakeholder patterns, compliance history)
     */
    _askWho(topic, context, cieContext = {}, memoryContext = null) {
        const base = {
            question: `Who are the stakeholders for "${topic}"?`,
            primary_users: this._identifyPrimaryUsers(context),
            stakeholders: this._identifyStakeholders(context),
            user_expectations: this._extractUserExpectations(context),
            availability_requirements: this._inferAvailabilityNeeds(context)
        };

        // 🆕 Memory enrichment: User adaptation layer
        if (memoryContext && memoryContext.user_adaptation) {
            base.user_profile = {
                name: memoryContext.user_adaptation.name,
                structure: memoryContext.user_adaptation.structure,
                tone: memoryContext.user_adaptation.tone,
                detail_level: memoryContext.user_adaptation.detailLevel,
                preferred_keywords: memoryContext.user_adaptation.preferredKeywords,
                tbi_context: memoryContext.user_adaptation.tbiContext
            };
        }

        // 🆕 Memory enrichment: Stakeholder patterns from history
        if (memoryContext) {
            const t1Sessions = memoryContext.t1_sessions || [];
            if (t1Sessions.length > 0) {
                const pastStakeholders = t1Sessions
                    .map(s => s.metadata?.who?.primary_users || s.metadata?.who?.stakeholders)
                    .flat()
                    .filter(st => st && st !== 'unknown');

                if (pastStakeholders.length > 0) {
                    const stakeholderFreq = pastStakeholders.reduce((acc, st) => {
                        acc[st] = (acc[st] || 0) + 1;
                        return acc;
                    }, {});
                    const mostFrequent = Object.keys(stakeholderFreq)
                        .sort((a, b) => stakeholderFreq[b] - stakeholderFreq[a])[0];

                    base.stakeholder_patterns = {
                        historical_primary: mostFrequent,
                        frequency: stakeholderFreq[mostFrequent],
                        consistency_check: base.primary_users.includes(mostFrequent)
                            ? `✅ Consistent with typical stakeholder (${mostFrequent})`
                            : `⚠️ Stakeholder shift detected: Typical = ${mostFrequent}, Current = ${base.primary_users.join(', ')}`
                    };
                }
            }
        }

        return base;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SCORING METHODS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculate urgency score (0-1) based on timing factors
     */
    _calculateUrgency(whenData) {
        const timeline = (whenData.timeline || 'unknown').toLowerCase();
        const constraints = whenData.temporal_constraints || [];

        let score = 0.5; // Default medium urgency

        // Timeline-based urgency
        if (/urgent|asap|immediately|critical|emergency/i.test(timeline)) score = 0.95;
        else if (/week|days|next week/i.test(timeline)) score = 0.85;
        else if (/month|next month|soon/i.test(timeline)) score = 0.6;
        else if (/quarter|q[1-4]|months/i.test(timeline)) score = 0.4;
        else if (/year|future|eventually|someday/i.test(timeline)) score = 0.2;

        // Adjust for temporal constraints
        if (constraints.length > 0) score = Math.min(score + 0.1, 1.0);

        return parseFloat(score.toFixed(2));
    }

    /**
     * Calculate priority score (0-1) based on business impact
     */
    _calculatePriority(whyData) {
        const criticality = (whyData.business_criticality || 'medium').toLowerCase();
        const impact = (whyData.user_impact || 'medium').toLowerCase();

        let score = 0.5; // Default medium priority

        // Business criticality weight
        if (criticality === 'critical' || criticality === 'high') score += 0.3;
        else if (criticality === 'low') score -= 0.2;

        // User impact weight
        if (impact === 'high' || impact === 'critical') score += 0.2;
        else if (impact === 'low') score -= 0.1;

        return Math.max(0, Math.min(parseFloat(score.toFixed(2)), 1.0));
    }

    /**
     * Calculate confidence score (0-1) based on information completeness
     */
    _calculateConfidence(inquiry, context) {
        // Count known vs unknown factors across all 5W1H
        let knownFactors = 0;
        let totalFactors = 0;

        Object.values(inquiry).forEach(dimension => {
            Object.values(dimension).forEach(value => {
                totalFactors++;
                if (value &&
                    value !== 'unknown' &&
                    value !== 'unclear' &&
                    value !== 'unspecified' &&
                    !(Array.isArray(value) && value.length === 0)) {
                    knownFactors++;
                }
            });
        });

        // Base confidence on information completeness
        const completeness = totalFactors > 0 ? knownFactors / totalFactors : 0;

        // Adjust for context richness
        const contextKeys = Object.keys(context).length;
        const contextBonus = Math.min(contextKeys / 20, 0.1); // Up to +10% for rich context

        return parseFloat(Math.min(completeness + contextBonus, 1.0).toFixed(2));
    }

    /**
     * Calculate complexity score (0-1) based on implementation factors
     */
    _calculateComplexity(howData) {
        const complexity = (howData.implementation_complexity || 'medium').toLowerCase();
        const integrationPoints = howData.integration_points || [];
        const options = howData.approach_options || [];

        let score = 0.5; // Default medium complexity

        // Implementation complexity base
        if (complexity === 'high' || complexity === 'complex') score = 0.8;
        else if (complexity === 'low' || complexity === 'simple') score = 0.3;

        // Adjust for integration complexity
        score += Math.min(integrationPoints.length * 0.05, 0.2);

        // Adjust for decision complexity (many options = harder choice)
        score += Math.min(options.length * 0.03, 0.1);

        return Math.max(0, Math.min(parseFloat(score.toFixed(2)), 1.0));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INFERENCE METHODS (Extract insights from context)
    // ═══════════════════════════════════════════════════════════════════════

    _inferContextType(topic) {
        const lowerTopic = topic.toLowerCase();
        if (/validator|standard|pmo/i.test(lowerTopic)) return 'standards_selection';
        if (/implementation|feature|build/i.test(lowerTopic)) return 'feature_development';
        if (/security|vulnerability|attack/i.test(lowerTopic)) return 'security_analysis';
        if (/architecture|design|pattern/i.test(lowerTopic)) return 'architectural_decision';
        return 'general_analysis';
    }

    _extractCharacteristics(context) {
        const characteristics = [];
        if (context.hasAPI) characteristics.push('API-based');
        if (context.hasDatabase) characteristics.push('database-driven');
        if (context.hasMicroservices) characteristics.push('microservices');
        if (context.domain) characteristics.push(`${context.domain} domain`);
        return characteristics;
    }

    _defineScope(topic, context) {
        if (context.scope) return context.scope;
        if (/project|pmo/i.test(topic)) return 'project-wide';
        if (/module|component/i.test(topic)) return 'component-level';
        return 'task-specific';
    }

    _identifyBoundaries(context) {
        const boundaries = [];
        if (context.codeContext) boundaries.push('codebase');
        if (context.projectContext) boundaries.push('project');
        if (context.domain) boundaries.push('domain-specific');
        return boundaries.length > 0 ? boundaries : ['unspecified'];
    }

    _inferPurpose(topic, context) {
        if (/validator|standard/i.test(topic)) return 'Establish quality standards';
        if (/security|protection/i.test(topic)) return 'Protect system from threats';
        if (/implementation|feature/i.test(topic)) return 'Deliver functionality';
        return context.purpose || 'unspecified';
    }

    _inferMotivation(context) {
        if (context.userRequest) return `User requested: ${context.userRequest}`;
        if (context.businessNeed) return context.businessNeed;
        return 'implicit requirement';
    }

    _assessCriticality(context) {
        const criticality = context.business_criticality || context.criticality;
        if (criticality) return criticality;

        // Infer from domain
        if (context.domain === 'HEALTHCARE' || context.domain === 'FINANCE') return 'high';
        return 'medium';
    }

    _assessUserImpact(context) {
        if (context.user_impact) return context.user_impact;
        if (context.userCount > 10000) return 'high';
        if (context.userCount > 100) return 'medium';
        return 'low';
    }

    _identifyValue(topic, context) {
        return `Enable ${this._inferPurpose(topic, context)} with ${this._assessCriticality(context)} criticality`;
    }

    _extractTimeline(context) {
        return context.timeline || context.deploymentTimeline || 'unknown';
    }

    _inferDeploymentPhase(context) {
        if (context.phase) return context.phase;
        if (context.projectPhase) return context.projectPhase;
        if (/poc|prototype|mvp/i.test(context.timeline || '')) return 'POC/Prototype';
        if (/production|prod/i.test(context.timeline || '')) return 'Production';
        return 'Development';
    }

    _identifyUrgencyFactors(context) {
        const factors = [];
        if (context.deadline) factors.push(`Deadline: ${context.deadline}`);
        if (context.blockingIssue) factors.push('Blocking issue present');
        if (context.customerRequest) factors.push('Customer-requested');
        return factors;
    }

    _identifyTimeConstraints(context) {
        const constraints = [];
        if (context.deadline) constraints.push(`Hard deadline: ${context.deadline}`);
        if (context.sprint) constraints.push(`Sprint commitment: ${context.sprint}`);
        return constraints;
    }

    _inferEnvironment(context) {
        return context.environment || context.deploymentEnvironment || 'unknown';
    }

    _inferDeploymentTarget(context) {
        if (context.cloud) return 'cloud';
        if (context.local || context.environment === 'local') return 'local';
        if (context.hybrid) return 'hybrid';
        return 'unspecified';
    }

    _inferInfrastructure(context) {
        if (context.infrastructure) return context.infrastructure;
        if (context.serverless) return 'serverless';
        if (context.kubernetes) return 'kubernetes';
        if (context.containers) return 'containerized';
        return 'traditional';
    }

    _inferDistribution(context) {
        if (context.multiRegion) return 'multi-region';
        if (context.global) return 'global';
        return 'single-region';
    }

    _assessNetworkExposure(context) {
        if (context.networkExposure) return context.networkExposure;
        if (context.public || context.internet) return 'public';
        if (context.internal || context.local) return 'internal';
        return 'unknown';
    }

    _assessCurrentState(context) {
        if (context.existingImplementation) return 'existing implementation (refactor/enhance)';
        if (context.greenfield) return 'greenfield (new implementation)';
        return 'unknown state';
    }

    _identifyApproaches(topic, context) {
        // Return possible approaches based on topic type
        const approaches = [];
        if (/architecture/i.test(topic)) {
            approaches.push('Monolithic', 'Microservices', 'Serverless');
        }
        if (/security/i.test(topic)) {
            approaches.push('Preventive controls', 'Detective controls', 'Reactive measures');
        }
        return approaches.length > 0 ? approaches : ['context-dependent'];
    }

    _assessImplementationComplexity(context) {
        if (context.complexity) return context.complexity;
        if (context.codeLength > 500) return 'high';
        if (context.codeLength > 100) return 'medium';
        return 'low';
    }

    _identifyIntegrationPoints(context) {
        const points = [];
        if (context.hasAPI) points.push('API layer');
        if (context.hasDatabase) points.push('Database layer');
        if (context.hasAuth) points.push('Authentication layer');
        return points;
    }

    _identifyPrimaryUsers(context) {
        if (context.primaryUsers) return context.primaryUsers;
        if (context.userType) return [context.userType];
        return ['end users'];
    }

    _identifyStakeholders(context) {
        const stakeholders = [];
        if (context.businessOwner) stakeholders.push('business owner');
        if (context.technical) stakeholders.push('technical team');
        if (context.security) stakeholders.push('security team');
        return stakeholders.length > 0 ? stakeholders : ['development team'];
    }

    _extractUserExpectations(context) {
        if (context.performanceExpectations) return context.performanceExpectations;
        if (context.userCount > 10000) return 'high performance required';
        return 'standard performance acceptable';
    }

    _inferAvailabilityNeeds(context) {
        if (context.availabilityRequirements) return context.availabilityRequirements;
        if (context.domain === 'HEALTHCARE' || context.domain === 'FINANCE') return '99.9%+ uptime';
        return '99% uptime';
    }

    _assessContextCompleteness(context) {
        const keys = Object.keys(context).length;
        if (keys > 10) return 'rich';
        if (keys > 5) return 'moderate';
        if (keys > 0) return 'sparse';
        return 'minimal';
    }

    _assessAnalysisDepth(inquiry) {
        const totalInsights = Object.values(inquiry)
            .reduce((sum, dim) => sum + Object.keys(dim).length, 0);

        if (totalInsights > 30) return 'comprehensive';
        if (totalInsights > 20) return 'detailed';
        return 'standard';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RECOMMENDATION GENERATION
    // ═══════════════════════════════════════════════════════════════════════

    _generateRecommendation(inquiry, scores, caller) {
        const recommendations = [];

        // Urgency-based recommendations
        if (scores.urgency > 0.8) {
            recommendations.push({
                type: 'urgency',
                level: 'high',
                message: 'High urgency detected - prioritize working solution over perfect implementation',
                action: 'Simplify approach, defer optimizations, focus on delivery'
            });
        } else if (scores.urgency < 0.3) {
            recommendations.push({
                type: 'urgency',
                level: 'low',
                message: 'Low urgency - opportunity for thorough design and testing',
                action: 'Invest in architecture, comprehensive testing, documentation'
            });
        }

        // Confidence-based recommendations
        if (scores.confidence < 0.6) {
            recommendations.push({
                type: 'confidence',
                level: 'low',
                message: 'Low confidence - insufficient context for informed decision',
                action: caller === 'ATHENA'
                    ? 'Generate strategic questions to fill information gaps'
                    : 'Request more context before proceeding'
            });
        }

        // Priority-based recommendations
        if (scores.priority > 0.9) {
            recommendations.push({
                type: 'priority',
                level: 'critical',
                message: 'Critical priority task - allocate full resources',
                action: 'Full colonel deployment, no shortcuts, comprehensive validation'
            });
        }

        // Complexity-based recommendations
        if (scores.complexity > 0.7) {
            recommendations.push({
                type: 'complexity',
                level: 'high',
                message: 'High complexity detected - break down into phases',
                action: 'Incremental delivery, frequent validation, risk mitigation'
            });
        }

        return {
            summary: this._generateSummary(scores),
            actions: recommendations,
            caller_specific: this._generateCallerSpecificGuidance(caller, scores, inquiry)
        };
    }

    _generateSummary(scores) {
        return `Urgency: ${(scores.urgency * 100).toFixed(0)}%, Priority: ${(scores.priority * 100).toFixed(0)}%, Confidence: ${(scores.confidence * 100).toFixed(0)}%, Complexity: ${(scores.complexity * 100).toFixed(0)}%`;
    }

    _generateCallerSpecificGuidance(caller, scores, inquiry) {
        if (caller === 'ECHELON') {
            return {
                validator_selection: scores.confidence > 0.7
                    ? 'Proceed with standard selection based on 5W1H context'
                    : 'Consult ATHENA for strategic input before selecting standards',
                deployment_approach: scores.urgency > 0.8
                    ? 'Fast-track deployment, skip optional waves'
                    : 'Full 5-wave deployment recommended'
            };
        }

        if (caller === 'ATHENA') {
            return {
                strategic_questions: scores.confidence < 0.6
                    ? 'Generate questions to clarify: ' + this._identifyMissingContext(inquiry)
                    : 'Sufficient context - proceed with validation dialogue',
                wisdom_mode: scores.complexity > 0.7
                    ? 'Proactive strategic guidance needed'
                    : 'Standard validation dialogue sufficient'
            };
        }

        return { note: 'No caller-specific guidance (unknown caller)' };
    }

    _identifyMissingContext(inquiry) {
        const missing = [];

        if (inquiry.when.timeline === 'unknown') missing.push('timeline/urgency');
        if (inquiry.where.environment === 'unknown') missing.push('deployment environment');
        if (inquiry.who.primary_users.includes('end users')) missing.push('specific user types');

        return missing.length > 0 ? missing.join(', ') : 'general context enrichment';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 ESMC 3.79: CIE SEMANTIC CATEGORIES (2-LAYER KEYWORD MESH)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Initialize semantic category definitions for WHERE validation
     * 2-layer mesh: Primary keywords (deployment type) + Modifiers (context enrichment)
     *
     * @private
     */
    _initializeSemanticCategories() {
        this.semanticCategories = {
            // DEPLOYMENT LOCATION
            deployment_local: {
                primary: ['CLI', 'SDK', 'desktop', 'local', 'standalone', 'laptop', 'workstation'],
                modifiers: ['machine', 'offline', 'command-line'],
                weight: 1.0
            },
            deployment_cloud: {
                primary: ['cloud', 'AWS', 'Azure', 'GCP', 'SaaS', 'hosted', 'serverless'],
                modifiers: ['container', 'Kubernetes', 'Lambda', 'function'],
                weight: 1.0
            },
            deployment_internal: {
                primary: ['internal', 'intranet', 'corporate', 'private network', 'LAN', 'VPN'],
                modifiers: ['on-premise', 'data center', 'enterprise'],
                weight: 1.0
            },
            deployment_mobile: {
                primary: ['mobile', 'iOS', 'Android', 'tablet', 'smartphone'],
                modifiers: ['app', 'native', 'React Native'],
                weight: 1.0
            },

            // NETWORK EXPOSURE
            network_isolated: {
                primary: ['offline', 'air-gapped', 'isolated', 'no network', 'disconnected'],
                modifiers: ['standalone', 'single-user'],
                weight: 1.0
            },
            network_outbound: {
                primary: ['fetches', 'calls', 'downloads', 'HTTP client', 'REST client', 'requests'],
                modifiers: ['remote', 'API', 'external', 'third-party', 'endpoint'],
                weight: 0.8  // Needs modifiers to confirm
            },
            network_inbound: {
                primary: ['server', 'API endpoint', 'listens', 'accepts', 'service', 'daemon'],
                modifiers: ['port', 'route', 'handler', 'controller'],
                weight: 1.0
            },
            network_bidirectional: {
                primary: ['API', 'web service', 'microservice', 'client-server'],
                modifiers: ['full-stack', 'backend', 'frontend'],
                weight: 1.0
            },

            // TRUST BOUNDARY
            trust_local_user: {
                primary: ['local user', 'authenticated', 'trusted source', 'internal'],
                modifiers: ['file', 'input', 'configuration'],
                weight: 0.7  // Context-dependent
            },
            trust_remote_data: {
                primary: ['remote', 'external', 'third-party', 'public', 'untrusted'],
                modifiers: ['API', 'data', 'source', 'endpoint', 'internet'],
                weight: 0.8  // Needs modifiers
            },

            // SECURITY THREATS
            threat_network: {
                primary: ['IFDS', 'XSS', 'injection', 'CSRF', 'taint', 'SQL injection', 'command injection'],
                modifiers: ['attack', 'vulnerability', 'exploit', 'malicious'],
                weight: 1.0
            },
            threat_local: {
                primary: ['dependency', 'supply chain', 'secrets', 'credentials', 'environment variable'],
                modifiers: ['npm', 'package', 'leak', 'exposure'],
                weight: 1.0
            },
            threat_infrastructure: {
                primary: ['DDoS', 'rate limiting', 'load balancing', 'CDN', 'scalability'],
                modifiers: ['traffic', 'requests', 'bandwidth', 'throughput'],
                weight: 1.0
            }
        };
    }

    /**
     * Detect semantic category using 2-layer keyword mesh
     * Layer 1: Primary keywords (core concept)
     * Layer 2: Modifiers (contextual enrichment)
     *
     * @param {Array<string>} keywords - CIE extracted keywords
     * @param {string} categoryPrefix - Category prefix (e.g., 'deployment_', 'network_')
     * @returns {Object} {category: string, score: number, confidence: number, matches: {}}
     * @private
     */
    _detectSemanticCategory(keywords, categoryPrefix) {
        const keywordsLower = keywords.map(k => k.toLowerCase());
        let bestMatch = { category: 'UNKNOWN', score: 0, confidence: 0, primaryMatches: 0, modifierMatches: 0 };

        // Filter categories by prefix
        const relevantCategories = Object.entries(this.semanticCategories)
            .filter(([key]) => key.startsWith(categoryPrefix));

        for (const [catKey, config] of relevantCategories) {
            let score = 0;
            let primaryMatches = 0;
            let modifierMatches = 0;

            // Layer 1: Primary keyword matches
            for (const primary of config.primary) {
                if (keywordsLower.some(k => k.includes(primary.toLowerCase()))) {
                    score += 1.0 * config.weight;
                    primaryMatches++;
                }
            }

            // Layer 2: Modifier keyword matches (contextual enrichment)
            for (const modifier of config.modifiers) {
                if (keywordsLower.some(k => k.includes(modifier.toLowerCase()))) {
                    score += 0.5 * config.weight;  // Modifiers worth half
                    modifierMatches++;
                }
            }

            // Only consider if at least 1 primary match
            if (primaryMatches > 0 && score > bestMatch.score) {
                const categoryName = catKey.replace(categoryPrefix, '').toUpperCase();
                bestMatch = {
                    category: categoryName,
                    score,
                    primaryMatches,
                    modifierMatches,
                    confidence: Math.min(score / 2.0, 1.0)  // Normalize to 0-1
                };
            }
        }

        return bestMatch;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = ESMCReason;

// CLI execution check
if (require.main === module) {
    console.log('⚠️  d5969c27.js is a library module - use 5395b3af.js for CLI access');
    console.log('📖 Usage: node 5395b3af.js analyze "<topic>" --context \'{"key": "value"}\'');
    process.exit(1);
}
