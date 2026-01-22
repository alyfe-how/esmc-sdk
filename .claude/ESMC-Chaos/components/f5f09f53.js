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
/** ESMC 3.10 MBTI PROFILER | 2025-10-14 | v3.10.0 | PROD | ALL_TIERS
 *  Purpose: Myers-Briggs inference engine - infer MBTI from conversation patterns (4-dimension E/I, S/N, T/F, J/P)
 *  Features: Incremental confidence (Bayesian) | 16 personality types | Privacy-first (local) | Memory Bank integration | Response Adapter integration
 *  Author: COLONEL EPSILON
 */

class MBTIProfiler {
    constructor(config = {}) {
        this.config = {
            confidenceThreshold: config.confidenceThreshold || 0.6,
            minMessageSamples: config.minMessageSamples || 5,
            decayFactor: config.decayFactor || 0.95, // Older samples weighted less
            debugMode: config.debugMode || false
        };

        // MBTI indicator patterns (keyword-based detection)
        this.indicators = {
            // Extraversion (E) vs Introversion (I)
            E: {
                keywords: ['we should', 'let\'s', 'together', 'everyone', 'team', 'collaborative', 'sharing', 'discuss with'],
                patterns: /\b(we|us|together|team|group|collaborate|share with)\b/gi,
                weight: 1.0
            },
            I: {
                keywords: ['I think', 'I believe', 'my approach', 'personally', 'in my view', 'I prefer', 'my way'],
                patterns: /\b(I think|I believe|my (approach|way|view|preference)|personally)\b/gi,
                weight: 1.0
            },

            // Sensing (S) vs Intuition (N)
            S: {
                keywords: ['specific', 'exactly', 'step 1', 'step 2', 'concrete', 'practical', 'detail', 'precisely', 'fact'],
                patterns: /\b(specific|exact|step \d+|concrete|practical|detail|precise|fact|data)\b/gi,
                weight: 1.0
            },
            N: {
                keywords: ['maximize', 'optimize', 'framework', 'pattern', 'holistic', 'big picture', 'concept', 'abstract', 'possibility'],
                patterns: /\b(maximize|optimize|framework|pattern|holistic|big picture|concept|abstract|possibilit|theory)\b/gi,
                weight: 1.0
            },

            // Thinking (T) vs Feeling (F)
            T: {
                keywords: ['analyze', 'audit', 'logical', 'efficiency', 'objective', 'rational', 'correct', 'accurate', 'systematic'],
                patterns: /\b(analyz|audit|logic|efficien|objective|rational|correct|accurate|systematic)\b/gi,
                weight: 1.0
            },
            F: {
                keywords: ['feel', 'value', 'important to me', 'care about', 'appreciate', 'empathy', 'harmony', 'compassion'],
                patterns: /\b(feel|value|important to (me|us)|care about|appreciate|empath|harmon|compassion)\b/gi,
                weight: 1.0
            },

            // Judging (J) vs Perceiving (P)
            J: {
                keywords: ['should', 'must', 'properly', 'complete', 'finish', 'organized', 'planned', 'structured', 'deadline'],
                patterns: /\b(should|must|properl|complet|finish|organiz|plan|structur|deadline|schedule)\b/gi,
                weight: 1.0
            },
            P: {
                keywords: ['maybe', 'explore', 'flexible', 'adapt', 'spontaneous', 'open to', 'experiment', 'try different'],
                patterns: /\b(maybe|explore|flexible|adapt|spontaneous|open to|experiment|try (different|various))\b/gi,
                weight: 1.0
            }
        };

        // MBTI type descriptions (for reference)
        this.typeDescriptions = {
            'INTJ': 'Analytical, strategic, independent thinker',
            'INTP': 'Logical, theoretical, analytical problem solver',
            'ENTJ': 'Commanding, strategic, efficient leader',
            'ENTP': 'Innovative, strategic, resourceful debater',
            'INFJ': 'Insightful, idealistic, principled advocate',
            'INFP': 'Idealistic, loyal, empathetic mediator',
            'ENFJ': 'Charismatic, empathetic, inspiring leader',
            'ENFP': 'Enthusiastic, creative, sociable free spirit',
            'ISTJ': 'Practical, fact-minded, reliable organizer',
            'ISFJ': 'Dedicated, warm, practical caretaker',
            'ESTJ': 'Organized, practical, efficient administrator',
            'ESFJ': 'Caring, social, supportive helper',
            'ISTP': 'Bold, practical, experimental craftsman',
            'ISFP': 'Flexible, charming, artistic explorer',
            'ESTP': 'Smart, energetic, perceptive entrepreneur',
            'ESFP': 'Spontaneous, energetic, enthusiastic entertainer'
        };
    }

    /**
     * Analyze user message and extract MBTI dimension scores
     * @param {string} message - User's message text
     * @returns {Object} Dimension scores for E/I, S/N, T/F, J/P
     */
    analyzeMessage(message) {
        if (!message || typeof message !== 'string') {
            return null;
        }

        const scores = {
            E_I: this._analyzeDimension(message, 'E', 'I'),
            S_N: this._analyzeDimension(message, 'S', 'N'),
            T_F: this._analyzeDimension(message, 'T', 'F'),
            J_P: this._analyzeDimension(message, 'J', 'P')
        };

        if (this.config.debugMode) {
            console.log('\n🧠 MBTI ANALYSIS:');
            console.log(`   E/I: ${scores.E_I.score.toFixed(2)} (${scores.E_I.tendency})`);
            console.log(`   S/N: ${scores.S_N.score.toFixed(2)} (${scores.S_N.tendency})`);
            console.log(`   T/F: ${scores.T_F.score.toFixed(2)} (${scores.T_F.tendency})`);
            console.log(`   J/P: ${scores.J_P.score.toFixed(2)} (${scores.J_P.tendency})`);
        }

        return scores;
    }

    /**
     * Analyze single dimension (e.g., E vs I)
     * @param {string} message - User message
     * @param {string} typeA - First type (e.g., 'E')
     * @param {string} typeB - Second type (e.g., 'I')
     * @returns {Object} Score and tendency
     */
    _analyzeDimension(message, typeA, typeB) {
        const indicatorA = this.indicators[typeA];
        const indicatorB = this.indicators[typeB];

        // Count pattern matches
        const matchesA = (message.match(indicatorA.patterns) || []).length;
        const matchesB = (message.match(indicatorB.patterns) || []).length;

        // Calculate raw score (-1.0 to +1.0)
        // Negative = typeB, Positive = typeA
        const totalMatches = matchesA + matchesB;
        if (totalMatches === 0) {
            return { score: 0, tendency: 'neutral', matchesA: 0, matchesB: 0 };
        }

        const score = (matchesA - matchesB) / totalMatches;

        // Determine tendency
        let tendency = 'neutral';
        if (Math.abs(score) >= 0.3) {
            tendency = score > 0 ? typeA : typeB;
        }

        return {
            score,
            tendency,
            matchesA,
            matchesB,
            confidence: Math.abs(score)
        };
    }

    /**
     * Update cumulative MBTI scores with new message analysis
     * @param {Object} currentScores - Existing dimension scores
     * @param {Object} newAnalysis - New message analysis
     * @param {number} messageCount - Total messages analyzed
     * @returns {Object} Updated dimension scores
     */
    updateScores(currentScores, newAnalysis, messageCount) {
        if (!newAnalysis) return currentScores;

        const updated = {};

        // Apply weighted average (recent messages weighted more)
        const weight = 1.0 / Math.sqrt(messageCount + 1); // Diminishing weight for newer messages

        for (const dimension of ['E_I', 'S_N', 'T_F', 'J_P']) {
            const current = currentScores[dimension] || { score: 0, confidence: 0 };
            const newScore = newAnalysis[dimension]?.score || 0;

            // Weighted update
            const updatedScore = current.score * (1 - weight) + newScore * weight;
            const updatedConfidence = Math.min(0.95, current.confidence + (Math.abs(newScore) * weight * 0.1));

            updated[dimension] = {
                score: updatedScore,
                confidence: updatedConfidence,
                type: this._getType(dimension, updatedScore),
                lastUpdated: new Date().toISOString()
            };
        }

        return updated;
    }

    /**
     * Determine type from score (e.g., E or I from E_I score)
     * @param {string} dimension - Dimension name (e.g., 'E_I')
     * @param {number} score - Score value (-1.0 to +1.0)
     * @returns {string} Type letter (e.g., 'E' or 'I')
     */
    _getType(dimension, score) {
        const [typeA, typeB] = dimension.split('_');

        if (Math.abs(score) < 0.2) return 'X'; // Neutral/ambiguous
        return score > 0 ? typeA : typeB;
    }

    /**
     * Calculate MBTI type from dimension scores
     * @param {Object} dimensionScores - Scores for all 4 dimensions
     * @returns {Object} MBTI type, confidence, and details
     */
    calculateMBTI(dimensionScores) {
        const types = {
            E_I: this._getType('E_I', dimensionScores.E_I?.score || 0),
            S_N: this._getType('S_N', dimensionScores.S_N?.score || 0),
            T_F: this._getType('T_F', dimensionScores.T_F?.score || 0),
            J_P: this._getType('J_P', dimensionScores.J_P?.score || 0)
        };

        // Check if any dimension is ambiguous
        const hasAmbiguous = Object.values(types).includes('X');

        // Calculate overall confidence (average of dimension confidences)
        const confidences = Object.values(dimensionScores).map(d => d.confidence || 0);
        const overallConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

        const mbtiType = `${types.E_I}${types.S_N}${types.T_F}${types.J_P}`;

        return {
            type: hasAmbiguous ? null : mbtiType,
            confidence: overallConfidence,
            dimensionTypes: types,
            dimensionScores,
            description: this.typeDescriptions[mbtiType] || 'Type being determined...',
            needsMoreData: hasAmbiguous || overallConfidence < this.config.confidenceThreshold
        };
    }

    /**
     * Get response adaptation recommendations based on MBTI type
     * @param {string} mbtiType - 4-letter MBTI type (e.g., 'INTJ')
     * @returns {Object} Response adaptation recommendations
     */
    getResponseAdaptation(mbtiType) {
        if (!mbtiType || mbtiType.includes('X')) {
            return this._getDefaultAdaptation();
        }

        const adaptations = {
            // Analysts (NT)
            'INTJ': {
                structure: 'frameworks_and_architectures',
                tone: 'analytical_strategic',
                detailLevel: 'comprehensive_with_logic',
                validationStyle: 'show_patterns_and_systems',
                preferredKeywords: ['framework', 'architecture', 'strategic', 'systematic', 'optimize']
            },
            'INTP': {
                structure: 'logical_breakdowns',
                tone: 'analytical_theoretical',
                detailLevel: 'deep_technical_exploration',
                validationStyle: 'explore_alternatives_and_tradeoffs',
                preferredKeywords: ['analyze', 'theory', 'logic', 'explore', 'understand']
            },
            'ENTJ': {
                structure: 'action_plans_and_steps',
                tone: 'direct_commanding',
                detailLevel: 'efficiency_focused',
                validationStyle: 'clear_directives_and_outcomes',
                preferredKeywords: ['execute', 'efficient', 'goal', 'strategy', 'lead']
            },
            'ENTP': {
                structure: 'innovative_possibilities',
                tone: 'challenging_innovative',
                detailLevel: 'big_picture_with_alternatives',
                validationStyle: 'debate_and_refine',
                preferredKeywords: ['innovate', 'possibility', 'challenge', 'debate', 'create']
            },

            // Diplomats (NF)
            'INFJ': {
                structure: 'insights_and_vision',
                tone: 'insightful_principled',
                detailLevel: 'meaningful_with_purpose',
                validationStyle: 'align_with_values',
                preferredKeywords: ['insight', 'purpose', 'vision', 'meaningful', 'ideal']
            },
            'INFP': {
                structure: 'values_and_authenticity',
                tone: 'gentle_authentic',
                detailLevel: 'personal_and_meaningful',
                validationStyle: 'support_values',
                preferredKeywords: ['authentic', 'value', 'meaningful', 'personal', 'ideal']
            },
            'ENFJ': {
                structure: 'inspiring_collaboration',
                tone: 'warm_inspiring',
                detailLevel: 'people_focused',
                validationStyle: 'encourage_and_support',
                preferredKeywords: ['together', 'inspire', 'collaborate', 'support', 'empower']
            },
            'ENFP': {
                structure: 'possibilities_and_enthusiasm',
                tone: 'enthusiastic_creative',
                detailLevel: 'big_picture_with_examples',
                validationStyle: 'encourage_creativity',
                preferredKeywords: ['explore', 'create', 'possibility', 'inspire', 'imagine']
            },

            // Sentinels (SJ)
            'ISTJ': {
                structure: 'step_by_step_procedures',
                tone: 'practical_reliable',
                detailLevel: 'exhaustive_detail',
                validationStyle: 'proven_methods',
                preferredKeywords: ['reliable', 'procedure', 'detail', 'proven', 'standard']
            },
            'ISFJ': {
                structure: 'supportive_practical',
                tone: 'warm_conscientious',
                detailLevel: 'detailed_with_care',
                validationStyle: 'support_and_nurture',
                preferredKeywords: ['support', 'care', 'detail', 'practical', 'reliable']
            },
            'ESTJ': {
                structure: 'organized_efficient',
                tone: 'direct_organized',
                detailLevel: 'practical_and_efficient',
                validationStyle: 'clear_standards',
                preferredKeywords: ['organize', 'efficient', 'standard', 'manage', 'execute']
            },
            'ESFJ': {
                structure: 'collaborative_supportive',
                tone: 'warm_cooperative',
                detailLevel: 'practical_examples',
                validationStyle: 'consensus_and_harmony',
                preferredKeywords: ['together', 'support', 'harmony', 'practical', 'help']
            },

            // Explorers (SP)
            'ISTP': {
                structure: 'hands_on_practical',
                tone: 'direct_practical',
                detailLevel: 'action_oriented',
                validationStyle: 'try_and_experiment',
                preferredKeywords: ['practical', 'hands-on', 'try', 'experiment', 'build']
            },
            'ISFP': {
                structure: 'flexible_artistic',
                tone: 'gentle_flexible',
                detailLevel: 'present_focused',
                validationStyle: 'explore_and_create',
                preferredKeywords: ['explore', 'create', 'flexible', 'artistic', 'experience']
            },
            'ESTP': {
                structure: 'action_oriented',
                tone: 'energetic_direct',
                detailLevel: 'quick_and_practical',
                validationStyle: 'immediate_results',
                preferredKeywords: ['action', 'quick', 'practical', 'results', 'now']
            },
            'ESFP': {
                structure: 'spontaneous_engaging',
                tone: 'enthusiastic_fun',
                detailLevel: 'engaging_examples',
                validationStyle: 'enjoy_and_celebrate',
                preferredKeywords: ['fun', 'engage', 'spontaneous', 'enjoy', 'celebrate']
            }
        };

        return adaptations[mbtiType] || this._getDefaultAdaptation();
    }

    /**
     * Get default adaptation (when MBTI type unknown)
     * @returns {Object} Default response adaptation
     */
    _getDefaultAdaptation() {
        return {
            structure: 'balanced_professional',
            tone: 'professional_friendly',
            detailLevel: 'moderate',
            validationStyle: 'evidence_based',
            preferredKeywords: ['understand', 'analyze', 'implement', 'solution', 'effective']
        };
    }

    /**
     * Get system status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            module: 'ESMC 3.10 - MBTI Profiler',
            version: '3.10.0',
            confidenceThreshold: this.config.confidenceThreshold,
            typesSupported: 16,
            dimensionsTracked: 4
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🎖️ MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = MBTIProfiler;

// ═══════════════════════════════════════════════════════════════════════
// 🎖️ CLI TESTING INTERFACE
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    const profiler = new MBTIProfiler({ debugMode: true });

    // Test messages
    const testMessages = [
        "I believe this hasn't been properly maximized. Ideally, with my way of thoughts, my decision making preference, it should analyze and optimize the framework.",
        "We should collaborate together and share our ideas with the team to build something amazing!",
        "Let me analyze the specific details step by step. We need exactly 5 concrete facts to proceed.",
        "I feel this is really important to me. I care deeply about creating harmony and supporting everyone."
    ];

    console.log('\n🧠 ESMC 3.10 MBTI PROFILER - Test Suite\n');

    testMessages.forEach((msg, idx) => {
        console.log(`\n--- Test Message ${idx + 1} ---`);
        console.log(`Message: "${msg.substring(0, 60)}..."`);

        const analysis = profiler.analyzeMessage(msg);
        const mbti = profiler.calculateMBTI(analysis);

        console.log(`\nPredicted Type: ${mbti.type || 'UNKNOWN'} (${(mbti.confidence * 100).toFixed(1)}% confidence)`);
        console.log(`Description: ${mbti.description}`);
    });
}
