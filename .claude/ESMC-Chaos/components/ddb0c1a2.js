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
/** ESMC 3.25 ATHENA ORACLE | 2025-10-27 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: ORACLE standards enforcement bridge - wraps StandardValidators for ATHENA coordinator integration
 *  Features: Option A bridge | Strategic dialogue integration | Tier-agnostic (gating in ECHELON) | Phase 6.5 review support
 */

const path = require('path');
const fs = require('fs');

class ATHENAOracleEnforcer {
    constructor() {
        this.version = "1.0.0";
        // 🆕 ESMC 3.26: Tier-agnostic design - tier gating moved to ECHELON orchestrator
        // ORACLE is pure business logic, ECHELON decides when to call it
        this.initialized = false;
        this.standardValidators = null;
        this.echelonSelection = null;
    }

    /**
     * Initialize ORACLE components (StandardValidators + ECHELON selection engine)
     * @returns {Object} Initialization status
     */
    initialize() {
        try {
            // Load bf98e40d.js (ORACLE core)
            const standardsPath = path.join(__dirname, 'bf98e40d.js');

            if (!fs.existsSync(standardsPath)) {
                console.warn('[ATHENA ORACLE] bf98e40d.js not found - graceful degradation');
                return { success: false, reason: 'module_not_found' };
            }

            const StandardsModule = require(standardsPath);

            // Initialize validators
            if (StandardsModule.StandardValidators) {
                this.standardValidators = new StandardsModule.StandardValidators();
            }

            // Initialize ECHELON selection engine
            if (StandardsModule.ECHELONSelection) {
                this.echelonSelection = new StandardsModule.ECHELONSelection();
            }

            this.initialized = true;

            console.log(`[ATHENA ORACLE] Initialized successfully`);

            return {
                success: true,
                version: this.version,
                validators: !!this.standardValidators,
                echelonSelection: !!this.echelonSelection
            };

        } catch (error) {
            console.error('[ATHENA ORACLE] Initialization failed:', error.message);
            return { success: false, reason: 'initialization_error', error: error.message };
        }
    }

    /**
     * Enforce standards on code context (main enforcement entry point)
     * @param {Object} codeContext - Code analysis context
     * @param {string} codeContext.task - User task description
     * @param {string} codeContext.code - Code to validate (optional)
     * @param {Object} codeContext.context - PCA codebase patterns
     * @param {Array} codeContext.colonels - Colonels being deployed
     * @returns {Object} Violations and recommendations
     */
    enforceCodeStandards(codeContext = {}) {
        if (!this.initialized || !this.standardValidators || !this.echelonSelection) {
            return {
                violations: [],
                recommendations: [],
                status: 'not_initialized'
            };
        }

        try {
            const { task = '', code = '', context = {}, colonels = [] } = codeContext;

            // Use ECHELON selection engine to pick standards for each colonel
            const colonelStandards = this.echelonSelection.selectStandardsForColonels(
                colonels,
                { task, codebasePatterns: context }
            );

            // Aggregate all selected standards (deduplicate)
            const selectedStandardsSet = new Set();
            Object.values(colonelStandards).forEach(standards => {
                standards.forEach(std => selectedStandardsSet.add(std));
            });

            const selectedStandards = Array.from(selectedStandardsSet);

            // If no code provided, return standards selection only (planning phase)
            if (!code || code.trim().length === 0) {
                return {
                    violations: [],
                    recommendations: selectedStandards.map(std =>
                        `Standard ${std} selected for enforcement`
                    ),
                    selectedStandards: colonelStandards,
                    status: 'planning_phase'
                };
            }

            // Enforce standards on provided code
            const enforcementResult = this.standardValidators.enforceStandards(
                code,
                selectedStandards,
                { fileType: context.fileType, length: code.length }
            );

            return {
                violations: enforcementResult.violations || [],
                recommendations: enforcementResult.recommendations || [],
                selectedStandards: colonelStandards,
                status: 'enforcement_complete'
            };

        } catch (error) {
            console.error('[ATHENA ORACLE] Enforcement failed:', error.message);
            return {
                violations: [],
                recommendations: [],
                status: 'enforcement_error',
                error: error.message
            };
        }
    }

    /**
     * Get formatted violation summary for ATHENA dialogue integration
     * @param {Object} enforcementResult - Result from enforceCodeStandards()
     * @returns {string} Formatted summary for strategic dialogue
     */
    getViolationSummary(enforcementResult) {
        if (!enforcementResult || enforcementResult.status === 'not_initialized') {
            return '';
        }

        const { violations = [], recommendations = [], selectedStandards = {} } = enforcementResult;

        // Planning phase (no code yet) - show selected standards
        if (enforcementResult.status === 'planning_phase') {
            const standardsList = Object.entries(selectedStandards)
                .map(([colonel, standards]) => `   ${colonel}: ${standards.join(', ')}`)
                .join('\n');

            return `📊 ORACLE Standards Selected:\n${standardsList}`;
        }

        // No violations - clean report
        if (violations.length === 0) {
            return `✅ ORACLE Enforcement: All standards passed (${recommendations.length} recommendations)`;
        }

        // Format violations for ATHENA dialogue
        const violationsByStandard = {};
        violations.forEach(v => {
            if (!violationsByStandard[v.standard]) {
                violationsByStandard[v.standard] = [];
            }
            violationsByStandard[v.standard].push(v);
        });

        const violationSummary = Object.entries(violationsByStandard)
            .map(([standard, viols]) => {
                const severityCounts = viols.reduce((acc, v) => {
                    acc[v.severity] = (acc[v.severity] || 0) + 1;
                    return acc;
                }, {});

                const severityStr = Object.entries(severityCounts)
                    .map(([sev, count]) => `${count} ${sev}`)
                    .join(', ');

                return `   ⚠️  ${standard}: ${severityStr}`;
            })
            .join('\n');

        return `🔴 ORACLE Detected ${violations.length} Standard Violations:\n${violationSummary}`;
    }

    /**
     * Check if ORACLE is operational (initialized and ready)
     * 🆕 ESMC 3.26: Tier-agnostic - no tier checking (ECHELON handles tier gating)
     * @returns {boolean} True if ORACLE can run
     */
    isOperational() {
        return this.initialized &&
               this.standardValidators !== null &&
               this.echelonSelection !== null;
    }

    /**
     * 🆕 ESMC 3.26 - PHASE 4.5: Strategic Approach Review (BEFORE code exists)
     * Reviews architectural approach using ORACLE standards
     * @param {Object} strategicContext - Strategic planning context
     * @param {Object} strategicContext.refined_plan - Plan from EPSILON
     * @param {string} strategicContext.approach - Implementation approach
     * @param {Object} strategicContext.patterns - Codebase patterns from PCA
     * @param {number} strategicContext.complexity - Complexity score
     * @param {Array} strategicContext.colonels - Colonels to be deployed
     * @returns {Object} Strategic violations and recommendations
     */
    reviewStrategicApproach(strategicContext = {}) {
        // Graceful degradation if ORACLE not operational
        if (!this.isOperational()) {
            return {
                skipped: true,
                reason: 'oracle_not_operational',
                violations: [],
                recommendations: []
            };
        }

        try {
            const {
                refined_plan = {},
                approach = '',
                patterns = {},
                complexity = 0,
                colonels = []
            } = strategicContext;

            // Trigger logic: complexity >= 50 OR strategic_analysis engaged OR colonels >= 5
            // 🆕 BUG FIX #2: Use truthy check (not !== undefined) to avoid triggering on false/null/0
            const shouldReview = complexity >= 50 ||
                               (refined_plan.strategic_analysis) ||
                               colonels.length >= 5;

            if (!shouldReview) {
                return {
                    skipped: true,
                    reason: 'trigger_threshold_not_met',
                    violations: [],
                    recommendations: []
                };
            }

            console.log('📊 PHASE 4.5: Strategic approach review analyzing...');

            // Use ECHELON selection to pick relevant standards for strategic review
            const colonelStandards = this.echelonSelection.selectStandardsForColonels(
                colonels.length > 0 ? colonels : ['ALPHA', 'BETA', 'GAMMA'], // Default colonels for moderate tasks
                {
                    task: refined_plan.task || approach,
                    codebasePatterns: patterns
                }
            );

            // Aggregate selected standards
            const selectedStandardsSet = new Set();
            Object.values(colonelStandards).forEach(standards => {
                standards.forEach(std => selectedStandardsSet.add(std));
            });

            const selectedStandards = Array.from(selectedStandardsSet);

            // Analyze approach text for pattern-level violations
            // Convert refined_plan + approach into analyzable text
            const approachText = this._buildStrategicApproachText(refined_plan, approach, patterns);

            // Use validators on approach text (pattern-based, not line-based)
            const validationResult = this.standardValidators.enforceStandards(
                approachText,
                selectedStandards,
                { fileType: 'strategic_plan', length: approachText.length }
            );

            const result = {
                skipped: false,
                violations: validationResult.violations || [],
                recommendations: validationResult.recommendations || [],
                selectedStandards: colonelStandards,
                complexity,
                review_type: 'strategic_approach'
            };

            console.log(`✅ PHASE 4.5: Complete (${result.violations.length} violations found)`);

            return result;

        } catch (error) {
            console.error('[ATHENA ORACLE] Phase 4.5 failed:', error.message);
            return {
                skipped: true,
                reason: 'review_error',
                error: error.message,
                violations: [],
                recommendations: []
            };
        }
    }

    /**
     * Helper: Build strategic approach text for pattern-level analysis
     * @private
     */
    _buildStrategicApproachText(refined_plan, approach, patterns) {
        const sections = [];

        // Include task description
        if (refined_plan.task) {
            sections.push(`Task: ${refined_plan.task}`);
        }

        // Include approach description
        if (approach) {
            sections.push(`Approach: ${approach}`);
        }

        // Include strategic considerations
        if (refined_plan.considerations) {
            sections.push(`Considerations: ${JSON.stringify(refined_plan.considerations)}`);
        }

        // Include relevant pattern context
        if (patterns.architecture) {
            sections.push(`Architecture: ${JSON.stringify(patterns.architecture)}`);
        }

        return sections.join('\n\n');
    }

    /**
     * Get ORACLE system status (diagnostics)
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            version: this.version,
            // 🆕 ESMC 3.26: Tier removed - tier gating handled by ECHELON
            initialized: this.initialized,
            operational: this.isOperational(),
            components: {
                validators: !!this.standardValidators,
                echelonSelection: !!this.echelonSelection
            }
        };
    }
}

module.exports = ATHENAOracleEnforcer;
