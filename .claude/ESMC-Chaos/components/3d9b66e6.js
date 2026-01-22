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
/** ESMC 3.5 PREFERENCE LEARNING | 2025-09-30 | v3.5.0 | PROD | TIER 2
 *  Purpose: COLONEL DELTA learn user decision patterns, preferences, and pivot moments
 *  Features: Decision recognition | Preference inference | Pivot detection | Learning patterns | User intelligence
 * - Communication Style Learning
 * - Problem-Solving Approach Profiling
 *
 * Philosophy:
 * "Watch what they do, not just what they say"
 * - Actions reveal true preferences
 * - Pivots reveal flexible thinking
 * - Patterns reveal cognitive style
 */

// ═══════════════════════════════════════════════════════════════════════
// 🧠 PREFERENCE LEARNING ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════

class PreferenceLearningEngine {
    constructor() {
        this.patterns = {
            decisions: [],
            actions: [],
            pivots: [],
            communications: []
        };
    }

    /**
     * Learn from a decision made by user
     */
    learnFromDecision(decision, context = {}) {
        const pattern = {
            decision,
            context,
            timestamp: new Date().toISOString(),

            // Extract decision characteristics
            characteristics: {
                riskyVsSafe: this._assessRiskLevel(decision, context),
                speedVsThorough: this._assessSpeed(context),
                innovativeVsProven: this._assessInnovation(decision),
                independentVsCollaborative: this._assessCollaboration(context)
            }
        };

        this.patterns.decisions.push(pattern);
        return pattern;
    }

    /**
     * Learn from user actions (what they actually do)
     */
    learnFromAction(action, result = null) {
        const pattern = {
            action,
            result,
            timestamp: new Date().toISOString(),

            // Action preferences
            preferences: {
                usedESMC: action.includes('ESMC'),
                createdBackup: action.includes('backup') || action.includes('Backup'),
                askedForHelp: action.includes('help') || action.includes('?'),
                madeDirectChange: action.includes('implement') || action.includes('fix')
            }
        };

        this.patterns.actions.push(pattern);
        return pattern;
    }

    /**
     * Detect pivot moments (when user changes approach)
     */
    detectPivot(previousApproach, newApproach, reason = '') {
        const pivot = {
            from: previousApproach,
            to: newApproach,
            reason,
            timestamp: new Date().toISOString(),

            // Pivot characteristics
            pivotType: this._classifyPivot(previousApproach, newApproach)
        };

        this.patterns.pivots.push(pivot);
        return pivot;
    }

    /**
     * Learn communication style from messages
     */
    learnCommunicationStyle(message, context = {}) {
        const pattern = {
            message,
            timestamp: new Date().toISOString(),

            // Communication characteristics
            style: {
                length: message.length,
                hasQuestions: message.includes('?'),
                hasExclamations: message.includes('!'),
                usesEmoji: /[\u{1F300}-\u{1F9FF}]/u.test(message),
                tone: this._inferTone(message),
                verbosity: this._assessVerbosity(message)
            }
        };

        this.patterns.communications.push(pattern);
        return pattern;
    }

    /**
     * Generate user cognitive profile from learned patterns
     */
    generateCognitiveProfile() {
        const profile = {
            generatedAt: new Date().toISOString(),
            sampleSize: {
                decisions: this.patterns.decisions.length,
                actions: this.patterns.actions.length,
                pivots: this.patterns.pivots.length,
                communications: this.patterns.communications.length
            },

            // Decision-making style
            decisionMaking: this._analyzeDecisionStyle(),

            // Problem-solving approach
            problemSolving: this._analyzeProblemSolving(),

            // Communication preferences
            communication: this._analyzeCommunicationStyle(),

            // Flexibility and adaptation
            adaptability: this._analyzeAdaptability(),

            // Tool usage patterns
            toolUsage: this._analyzeToolUsage()
        };

        return profile;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔍 ANALYSIS METHODS
    // ═══════════════════════════════════════════════════════════════════════

    _analyzeDecisionStyle() {
        if (this.patterns.decisions.length === 0) {
            return { style: 'INSUFFICIENT_DATA', confidence: 0 };
        }

        const decisions = this.patterns.decisions;

        // Average risk level
        const avgRisk = this._average(decisions.map(d => d.characteristics.riskyVsSafe));

        // Average speed
        const avgSpeed = this._average(decisions.map(d => d.characteristics.speedVsThorough));

        // Average innovation
        const avgInnovation = this._average(decisions.map(d => d.characteristics.innovativeVsProven));

        // Determine style
        let style = 'BALANCED';
        if (avgRisk > 0.7) style = 'RISK_TAKING';
        else if (avgRisk < 0.3) style = 'CAUTIOUS';

        if (avgSpeed > 0.7) style += '_FAST';
        else if (avgSpeed < 0.3) style += '_THOROUGH';

        return {
            style,
            characteristics: {
                riskTolerance: avgRisk,
                decisionSpeed: avgSpeed,
                innovationPreference: avgInnovation
            },
            confidence: Math.min(decisions.length / 10, 1.0) // Confidence grows with data
        };
    }

    _analyzeProblemSolving() {
        if (this.patterns.actions.length === 0) {
            return { approach: 'INSUFFICIENT_DATA', confidence: 0 };
        }

        const actions = this.patterns.actions;

        // Count action types
        const esmcUsage = actions.filter(a => a.preferences.usedESMC).length;
        const backupCreation = actions.filter(a => a.preferences.createdBackup).length;
        const helpRequests = actions.filter(a => a.preferences.askedForHelp).length;
        const directChanges = actions.filter(a => a.preferences.madeDirectChange).length;

        // Determine approach
        let approach = 'EXPLORATORY';
        if (esmcUsage / actions.length > 0.6) approach = 'FRAMEWORK_DRIVEN';
        if (backupCreation / actions.length > 0.5) approach = 'SAFETY_FIRST';
        if (directChanges / actions.length > 0.7) approach = 'ACTION_ORIENTED';

        return {
            approach,
            patterns: {
                usesFrameworks: esmcUsage / actions.length,
                prioritizesSafety: backupCreation / actions.length,
                seeksGuidance: helpRequests / actions.length,
                takesDirectAction: directChanges / actions.length
            },
            confidence: Math.min(actions.length / 15, 1.0)
        };
    }

    _analyzeCommunicationStyle() {
        if (this.patterns.communications.length === 0) {
            return { style: 'INSUFFICIENT_DATA', confidence: 0 };
        }

        const comms = this.patterns.communications;

        // Average characteristics
        const avgLength = this._average(comms.map(c => c.style.length));
        const questionRate = comms.filter(c => c.style.hasQuestions).length / comms.length;
        const exclamationRate = comms.filter(c => c.style.hasExclamations).length / comms.length;
        const emojiRate = comms.filter(c => c.style.usesEmoji).length / comms.length;

        // Determine style
        let style = 'NEUTRAL';
        if (avgLength > 200) style = 'VERBOSE';
        else if (avgLength < 50) style = 'CONCISE';

        if (exclamationRate > 0.3) style += '_ENTHUSIASTIC';
        if (questionRate > 0.5) style += '_INQUISITIVE';
        if (emojiRate > 0.3) style += '_EXPRESSIVE';

        return {
            style,
            characteristics: {
                avgMessageLength: avgLength,
                questionFrequency: questionRate,
                expressiveness: exclamationRate + emojiRate,
                preferredVerbosity: avgLength > 100 ? 'DETAILED' : 'BRIEF'
            },
            confidence: Math.min(comms.length / 10, 1.0)
        };
    }

    _analyzeAdaptability() {
        if (this.patterns.pivots.length === 0) {
            return { adaptability: 'INSUFFICIENT_DATA', confidence: 0 };
        }

        const pivots = this.patterns.pivots;

        // Pivot frequency (pivots per week)
        const timeSpan = this._getTimeSpan(pivots);
        const pivotsPerWeek = (pivots.length / timeSpan) * 7;

        // Determine adaptability
        let adaptability = 'MODERATE';
        if (pivotsPerWeek > 5) adaptability = 'HIGHLY_FLEXIBLE';
        else if (pivotsPerWeek < 1) adaptability = 'STEADY';

        return {
            adaptability,
            pivotFrequency: pivotsPerWeek,
            totalPivots: pivots.length,
            commonPivotTypes: this._getMostCommonPivotTypes(pivots),
            confidence: Math.min(pivots.length / 5, 1.0)
        };
    }

    _analyzeToolUsage() {
        const actions = this.patterns.actions;

        if (actions.length === 0) {
            return { usage: 'INSUFFICIENT_DATA' };
        }

        return {
            esmcUsageRate: actions.filter(a => a.preferences.usedESMC).length / actions.length,
            backupFrequency: actions.filter(a => a.preferences.createdBackup).length / actions.length,
            preferredWorkflow: this._inferPreferredWorkflow(actions)
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🛠️ UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════

    _assessRiskLevel(decision, context) {
        // Simple heuristic: contains keywords
        const riskKeywords = ['experimental', 'untested', 'new', 'complete rewrite', 'major'];
        const safeKeywords = ['backup', 'safe', 'tested', 'incremental', 'minor'];

        const decisionLower = decision.toLowerCase();
        const riskScore = riskKeywords.filter(k => decisionLower.includes(k)).length;
        const safeScore = safeKeywords.filter(k => decisionLower.includes(k)).length;

        return Math.max(0, Math.min(1, 0.5 + (riskScore - safeScore) * 0.2));
    }

    _assessSpeed(context) {
        // Fast indicators: "quick", "now", "immediately"
        // Thorough indicators: "careful", "complete", "comprehensive"
        if (context.userMessage) {
            const msg = context.userMessage.toLowerCase();
            if (msg.includes('quick') || msg.includes('now') || msg.includes('fast')) return 0.8;
            if (msg.includes('careful') || msg.includes('complete') || msg.includes('thorough')) return 0.2;
        }
        return 0.5;
    }

    _assessInnovation(decision) {
        const innovativeKeywords = ['new', 'innovative', 'creative', 'experimental'];
        const provenKeywords = ['standard', 'established', 'proven', 'conventional'];

        const decisionLower = decision.toLowerCase();
        const innovScore = innovativeKeywords.filter(k => decisionLower.includes(k)).length;
        const provenScore = provenKeywords.filter(k => decisionLower.includes(k)).length;

        return Math.max(0, Math.min(1, 0.5 + (innovScore - provenScore) * 0.2));
    }

    _assessCollaboration(context) {
        if (context.userMessage) {
            const msg = context.userMessage.toLowerCase();
            if (msg.includes('with me') || msg.includes('together') || msg.includes('help me')) return 0.8;
            if (msg.includes('do it') || msg.includes('just implement') || msg.includes('go ahead')) return 0.2;
        }
        return 0.5;
    }

    _classifyPivot(from, to) {
        if (from.includes('manual') && to.includes('automatic')) return 'AUTOMATION';
        if (from.includes('simple') && to.includes('complex')) return 'ESCALATION';
        if (from.includes('complex') && to.includes('simple')) return 'SIMPLIFICATION';
        return 'GENERAL';
    }

    _inferTone(message) {
        const msg = message.toLowerCase();
        if (msg.includes('please') || msg.includes('thank')) return 'POLITE';
        if (msg.includes('!')) return 'ENTHUSIASTIC';
        if (msg.includes('?')) return 'INQUISITIVE';
        return 'NEUTRAL';
    }

    _assessVerbosity(message) {
        if (message.length > 300) return 'VERY_VERBOSE';
        if (message.length > 150) return 'VERBOSE';
        if (message.length < 50) return 'CONCISE';
        return 'MODERATE';
    }

    _average(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    _getTimeSpan(events) {
        if (events.length === 0) return 1;
        const timestamps = events.map(e => new Date(e.timestamp).getTime());
        const span = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24);
        return Math.max(span, 1); // At least 1 day
    }

    _getMostCommonPivotTypes(pivots) {
        const typeCounts = {};
        pivots.forEach(p => {
            typeCounts[p.pivotType] = (typeCounts[p.pivotType] || 0) + 1;
        });

        return Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type, count]) => ({ type, count }));
    }

    _inferPreferredWorkflow(actions) {
        const esmcFirst = actions.filter(a => a.preferences.usedESMC).length;
        const backupFirst = actions.filter(a => a.preferences.createdBackup).length;

        if (esmcFirst > backupFirst) return 'FRAMEWORK_FIRST';
        if (backupFirst > esmcFirst) return 'SAFETY_FIRST';
        return 'BALANCED';
    }

    /**
     * Get current patterns
     */
    getPatterns() {
        return this.patterns;
    }

    /**
     * Clear patterns (for testing or reset)
     */
    clearPatterns() {
        this.patterns = {
            decisions: [],
            actions: [],
            pivots: [],
            communications: []
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🎖️ MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = PreferenceLearningEngine;

// ═══════════════════════════════════════════════════════════════════════
// 🎖️ CLI INTERFACE (for testing)
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    const engine = new PreferenceLearningEngine();

    // Example usage
    console.log('🧠 PREFERENCE LEARNING ENGINE - Demo\n');

    // Simulate learning
    engine.learnFromDecision('Use ESMC with maximum care', { userMessage: 'be careful' });
    engine.learnFromAction('Created backup before implementation');
    engine.learnCommunicationStyle('Yes that\'ll be something nice to have.');
    engine.detectPivot('Manual backups', 'Automated TIME MACHINE', 'Efficiency');

    // Generate profile
    const profile = engine.generateCognitiveProfile();
    console.log('Generated Cognitive Profile:');
    console.log(JSON.stringify(profile, null, 2));
}