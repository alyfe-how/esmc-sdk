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
/** ESMC 3.10 RAE | 2025-10-14 | v3.10.0 | PROD | ALL_TIERS
 *  Purpose: Response Adaptation Engine - personality-based response customization via MBTI + linguistic profile
 *  Features: Dynamic adaptation (structure, tone, depth, validation, questions) | MBTI integration | Linguistic integration | TBI modifiers
 *  Author: COLONEL DELTA
 */

const fs = require('fs').promises;
const path = require('path');

class ResponseAdapter {
    constructor(config = {}) {
        this.config = {
            defaultMBTI: config.defaultMBTI || 'INTJ',
            adaptationStrength: config.adaptationStrength || 0.7, // 0-1 scale
            debugMode: config.debugMode || false
        };

        // MBTI-based response templates
        this.mbtiAdaptations = {
            'INTJ': {
                name: 'The Architect',
                structure: 'frameworks_and_systems',
                tone: 'analytical_strategic',
                detailLevel: 'comprehensive_with_rationale',
                validationStyle: 'show_logical_patterns',
                explanationStyle: 'top_down_architecture',
                questionFraming: 'strategic_and_purposeful',
                preferredKeywords: ['framework', 'architecture', 'strategic', 'systematic', 'optimize', 'efficiency'],
                responseFormat: {
                    opening: 'direct_statement_of_goal',
                    body: 'hierarchical_breakdown',
                    closing: 'next_steps_and_implications'
                }
            },
            'INTP': {
                name: 'The Logician',
                structure: 'logical_exploration',
                tone: 'analytical_curious',
                detailLevel: 'deep_technical_with_alternatives',
                validationStyle: 'show_reasoning_chains',
                explanationStyle: 'bottom_up_analysis',
                questionFraming: 'exploratory_and_precise',
                preferredKeywords: ['logic', 'analysis', 'theory', 'mechanism', 'how it works', 'alternatives'],
                responseFormat: {
                    opening: 'problem_definition',
                    body: 'detailed_analysis_with_options',
                    closing: 'tradeoffs_and_recommendations'
                }
            },
            'ENTJ': {
                name: 'The Commander',
                structure: 'action_oriented_plans',
                tone: 'confident_decisive',
                detailLevel: 'executive_summary_with_details',
                validationStyle: 'show_outcomes_and_metrics',
                explanationStyle: 'goal_oriented_steps',
                questionFraming: 'direct_and_purposeful',
                preferredKeywords: ['execute', 'implement', 'results', 'strategy', 'leadership', 'decision'],
                responseFormat: {
                    opening: 'objective_and_approach',
                    body: 'action_steps_with_rationale',
                    closing: 'expected_outcomes'
                }
            },
            'ENTP': {
                name: 'The Debater',
                structure: 'conceptual_exploration',
                tone: 'innovative_challenging',
                detailLevel: 'ideas_with_possibilities',
                validationStyle: 'show_creative_solutions',
                explanationStyle: 'brainstorm_and_refine',
                questionFraming: 'thought_provoking',
                preferredKeywords: ['innovative', 'possibilities', 'experiment', 'debate', 'alternative', 'creative'],
                responseFormat: {
                    opening: 'concept_introduction',
                    body: 'multiple_approaches_comparison',
                    closing: 'best_path_forward'
                }
            },
            'INFJ': {
                name: 'The Advocate',
                structure: 'vision_aligned_solutions',
                tone: 'empathetic_insightful',
                detailLevel: 'meaningful_with_context',
                validationStyle: 'show_alignment_with_values',
                explanationStyle: 'narrative_with_purpose',
                questionFraming: 'thoughtful_and_considerate',
                preferredKeywords: ['vision', 'purpose', 'meaningful', 'harmony', 'insight', 'understanding'],
                responseFormat: {
                    opening: 'context_and_vision',
                    body: 'holistic_solution',
                    closing: 'impact_and_meaning'
                }
            },
            'INFP': {
                name: 'The Mediator',
                structure: 'values_driven_exploration',
                tone: 'supportive_authentic',
                detailLevel: 'personal_relevance',
                validationStyle: 'show_alignment_with_ideals',
                explanationStyle: 'story_based_examples',
                questionFraming: 'open_ended_and_gentle',
                preferredKeywords: ['authentic', 'values', 'meaningful', 'personal', 'creative', 'potential'],
                responseFormat: {
                    opening: 'empathetic_acknowledgment',
                    body: 'personalized_guidance',
                    closing: 'encouragement'
                }
            },
            'ENFJ': {
                name: 'The Protagonist',
                structure: 'people_centered_solutions',
                tone: 'inspiring_collaborative',
                detailLevel: 'clear_with_encouragement',
                validationStyle: 'show_team_benefits',
                explanationStyle: 'mentorship_approach',
                questionFraming: 'inclusive_and_motivating',
                preferredKeywords: ['together', 'team', 'inspire', 'growth', 'collaboration', 'empower'],
                responseFormat: {
                    opening: 'motivational_context',
                    body: 'collaborative_plan',
                    closing: 'team_success_vision'
                }
            },
            'ENFP': {
                name: 'The Campaigner',
                structure: 'enthusiastic_brainstorming',
                tone: 'energetic_optimistic',
                detailLevel: 'big_picture_with_excitement',
                validationStyle: 'show_possibilities',
                explanationStyle: 'conversational_exploration',
                questionFraming: 'exciting_and_open',
                preferredKeywords: ['exciting', 'possibilities', 'creative', 'explore', 'enthusiastic', 'innovation'],
                responseFormat: {
                    opening: 'enthusiastic_intro',
                    body: 'creative_options',
                    closing: 'encouraging_next_steps'
                }
            },
            'ISTJ': {
                name: 'The Logistician',
                structure: 'detailed_procedures',
                tone: 'practical_reliable',
                detailLevel: 'step_by_step_thorough',
                validationStyle: 'show_proven_methods',
                explanationStyle: 'sequential_instructions',
                questionFraming: 'specific_and_clear',
                preferredKeywords: ['procedure', 'reliable', 'proven', 'standard', 'detailed', 'organized'],
                responseFormat: {
                    opening: 'clear_objective',
                    body: 'numbered_steps',
                    closing: 'verification_checklist'
                }
            },
            'ISFJ': {
                name: 'The Defender',
                structure: 'supportive_guidance',
                tone: 'caring_dependable',
                detailLevel: 'considerate_with_examples',
                validationStyle: 'show_stability',
                explanationStyle: 'helpful_walkthrough',
                questionFraming: 'patient_and_clear',
                preferredKeywords: ['support', 'reliable', 'helpful', 'care', 'stable', 'practical'],
                responseFormat: {
                    opening: 'reassuring_context',
                    body: 'careful_guidance',
                    closing: 'supportive_summary'
                }
            },
            'ESTJ': {
                name: 'The Executive',
                structure: 'efficient_execution',
                tone: 'direct_organized',
                detailLevel: 'practical_and_clear',
                validationStyle: 'show_efficiency',
                explanationStyle: 'directive_instructions',
                questionFraming: 'direct_and_clear',
                preferredKeywords: ['efficient', 'organize', 'execute', 'manage', 'practical', 'structure'],
                responseFormat: {
                    opening: 'clear_directive',
                    body: 'organized_steps',
                    closing: 'completion_criteria'
                }
            },
            'ESFJ': {
                name: 'The Consul',
                structure: 'collaborative_harmony',
                tone: 'friendly_helpful',
                detailLevel: 'clear_with_consideration',
                validationStyle: 'show_team_harmony',
                explanationStyle: 'cooperative_guidance',
                questionFraming: 'considerate_and_inclusive',
                preferredKeywords: ['together', 'helpful', 'cooperative', 'harmony', 'support', 'community'],
                responseFormat: {
                    opening: 'friendly_greeting',
                    body: 'collaborative_approach',
                    closing: 'positive_closure'
                }
            },
            'ISTP': {
                name: 'The Virtuoso',
                structure: 'hands_on_solutions',
                tone: 'pragmatic_concise',
                detailLevel: 'practical_with_examples',
                validationStyle: 'show_working_proof',
                explanationStyle: 'demonstrate_by_doing',
                questionFraming: 'direct_and_practical',
                preferredKeywords: ['practical', 'hands-on', 'tool', 'fix', 'build', 'experiment'],
                responseFormat: {
                    opening: 'direct_problem_statement',
                    body: 'practical_solution',
                    closing: 'test_and_verify'
                }
            },
            'ISFP': {
                name: 'The Adventurer',
                structure: 'flexible_exploration',
                tone: 'gentle_creative',
                detailLevel: 'experiential_with_freedom',
                validationStyle: 'show_creative_expression',
                explanationStyle: 'exploratory_suggestions',
                questionFraming: 'open_and_gentle',
                preferredKeywords: ['creative', 'explore', 'flexible', 'personal', 'experience', 'artistic'],
                responseFormat: {
                    opening: 'gentle_introduction',
                    body: 'flexible_options',
                    closing: 'freedom_to_choose'
                }
            },
            'ESTP': {
                name: 'The Entrepreneur',
                structure: 'quick_action_plans',
                tone: 'bold_energetic',
                detailLevel: 'concise_with_action',
                validationStyle: 'show_immediate_results',
                explanationStyle: 'fast_paced_execution',
                questionFraming: 'direct_and_energetic',
                preferredKeywords: ['action', 'now', 'fast', 'bold', 'results', 'seize'],
                responseFormat: {
                    opening: 'immediate_action',
                    body: 'rapid_steps',
                    closing: 'go_execute'
                }
            },
            'ESFP': {
                name: 'The Entertainer',
                structure: 'engaging_interaction',
                tone: 'enthusiastic_fun',
                detailLevel: 'simple_and_exciting',
                validationStyle: 'show_fun_outcomes',
                explanationStyle: 'interactive_demonstration',
                questionFraming: 'exciting_and_engaging',
                preferredKeywords: ['fun', 'exciting', 'engaging', 'enjoy', 'experience', 'lively'],
                responseFormat: {
                    opening: 'exciting_hook',
                    body: 'engaging_steps',
                    closing: 'celebratory_finish'
                }
            }
        };
    }

    /**
     * Generate adaptive response parameters based on MBTI + linguistic profile + TBI state
     * @param {Object} mbtiProfile - MBTI profile from MBTIProfiler
     * @param {Object} linguisticProfile - Linguistic profile from LinguisticAnalyzer
     * @param {Object} tbiState - Temporal-Behavioral Intelligence state (optional)
     * @returns {Object} - Adaptation parameters for response generation
     */
    adaptResponse(mbtiProfile, linguisticProfile, tbiState = null) {
        const mbtiType = mbtiProfile?.type || this.config.defaultMBTI;
        const mbtiConfidence = mbtiProfile?.confidence || 0.5;

        // Get base MBTI adaptation
        const baseAdaptation = this.mbtiAdaptations[mbtiType] || this.mbtiAdaptations['INTJ'];

        // Apply linguistic profile modifiers
        let adaptation = this._applyLinguisticModifiers(baseAdaptation, linguisticProfile, mbtiConfidence);

        // 🎖️ ESMC 3.10 - Apply TBI modifiers (time-aware adaptation)
        if (tbiState) {
            adaptation = this._applyTBIModifiers(adaptation, tbiState);
        }

        // Add meta information
        adaptation.meta = {
            mbtiType,
            mbtiConfidence,
            adaptationStrength: this.config.adaptationStrength,
            timestamp: new Date().toISOString(),
            tbiPhase: tbiState?.circadianPhase || null  // 🎖️ Track TBI phase (string)
        };

        return adaptation;
    }

    /**
     * Apply linguistic profile to modify MBTI-based adaptation
     * @param {Object} baseAdaptation - MBTI-based adaptation
     * @param {Object} linguisticProfile - User's linguistic profile
     * @param {number} mbtiConfidence - Confidence in MBTI type
     * @returns {Object} - Modified adaptation
     */
    _applyLinguisticModifiers(baseAdaptation, linguisticProfile, mbtiConfidence) {
        const adaptation = { ...baseAdaptation };

        if (!linguisticProfile || !linguisticProfile.totalMessagesAnalyzed) {
            return adaptation;
        }

        // Modifier 1: Adjust detail level based on user's verbosity
        if (linguisticProfile.averageMessageLength > 200) {
            adaptation.detailLevel = this._increaseDetailLevel(adaptation.detailLevel);
        } else if (linguisticProfile.averageMessageLength < 50) {
            adaptation.detailLevel = this._decreaseDetailLevel(adaptation.detailLevel);
        }

        // Modifier 2: Adjust tone based on user's formality
        if (linguisticProfile.communicationStyle?.formality) {
            const formality = linguisticProfile.communicationStyle.formality.level;
            if (formality === 'formal') {
                adaptation.tone = this._formalizeTone(adaptation.tone);
            } else if (formality === 'informal') {
                adaptation.tone = this._casualizeTone(adaptation.tone);
            }
        }

        // Modifier 3: Adjust structure based on user's structure preference
        if (linguisticProfile.wordChoiceProfile?.technical > 15) {
            adaptation.structure = 'technical_with_code_examples';
        }

        // Modifier 4: Adjust validation based on user's certainty patterns
        if (linguisticProfile.wordChoiceProfile?.certainty > linguisticProfile.wordChoiceProfile?.uncertainty) {
            adaptation.validationStyle = 'direct_confirmation';
        } else {
            adaptation.validationStyle = 'exploratory_validation';
        }

        // Modifier 5: Reduce adaptation strength if MBTI confidence is low
        if (mbtiConfidence < 0.6) {
            adaptation.adaptationStrength = Math.min(this.config.adaptationStrength, 0.5);
        } else {
            adaptation.adaptationStrength = this.config.adaptationStrength;
        }

        return adaptation;
    }

    /**
     * Generate response template based on adaptation parameters
     * @param {Object} adaptation - Adaptation parameters
     * @param {string} contentType - Type of response (explanation, implementation, debug, etc.)
     * @returns {Object} - Response template with structure guidance
     */
    generateResponseTemplate(adaptation, contentType = 'general') {
        const template = {
            contentType,
            structure: this._getStructureTemplate(adaptation, contentType),
            tone: this._getToneGuidelines(adaptation),
            keywords: this._selectKeywords(adaptation),
            validationApproach: this._getValidationApproach(adaptation),
            meta: adaptation.meta
        };

        return template;
    }

    /**
     * Validate if current response matches user's adaptation preferences
     * @param {string} response - Generated response text
     * @param {Object} adaptation - Adaptation parameters
     * @returns {Object} - Validation results with suggestions
     */
    validateResponse(response, adaptation) {
        const validation = {
            matches: true,
            score: 1.0,
            suggestions: []
        };

        // Check 1: Length alignment
        const responseLength = response.length;
        if (adaptation.detailLevel.includes('comprehensive') && responseLength < 200) {
            validation.matches = false;
            validation.score -= 0.2;
            validation.suggestions.push('Increase detail level for comprehensive explanation');
        } else if (adaptation.detailLevel.includes('concise') && responseLength > 500) {
            validation.matches = false;
            validation.score -= 0.2;
            validation.suggestions.push('Reduce verbosity for concise preference');
        }

        // Check 2: Keyword presence
        const keywordMatches = adaptation.preferredKeywords.filter(keyword =>
            response.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        const keywordScore = keywordMatches / Math.max(adaptation.preferredKeywords.length, 1);
        if (keywordScore < 0.3) {
            validation.suggestions.push('Include more personality-aligned keywords');
            validation.score -= 0.1;
        }

        // Check 3: Structure alignment
        if (adaptation.structure === 'frameworks_and_systems' && !response.includes('framework')) {
            validation.suggestions.push('Frame response around frameworks and systems');
            validation.score -= 0.1;
        }

        validation.score = Math.max(validation.score, 0);
        return validation;
    }

    // ========================================
    // PRIVATE ADAPTATION METHODS
    // ========================================

    _increaseDetailLevel(currentLevel) {
        const detailLevels = ['concise', 'moderate', 'comprehensive', 'comprehensive_with_rationale', 'deep_technical'];
        const currentIndex = detailLevels.findIndex(level => currentLevel.includes(level.split('_')[0]));
        return detailLevels[Math.min(currentIndex + 1, detailLevels.length - 1)];
    }

    _decreaseDetailLevel(currentLevel) {
        const detailLevels = ['concise', 'moderate', 'comprehensive', 'comprehensive_with_rationale', 'deep_technical'];
        const currentIndex = detailLevels.findIndex(level => currentLevel.includes(level.split('_')[0]));
        return detailLevels[Math.max(currentIndex - 1, 0)];
    }

    _formalizeTone(currentTone) {
        const toneMap = {
            'energetic_optimistic': 'professional_positive',
            'enthusiastic_fun': 'professional_friendly',
            'friendly_helpful': 'professional_supportive',
            'bold_energetic': 'confident_professional'
        };
        return toneMap[currentTone] || currentTone;
    }

    _casualizeTone(currentTone) {
        const toneMap = {
            'analytical_strategic': 'analytical_friendly',
            'analytical_curious': 'curious_conversational',
            'confident_decisive': 'confident_approachable',
            'pragmatic_concise': 'practical_friendly'
        };
        return toneMap[currentTone] || currentTone;
    }

    _getStructureTemplate(adaptation, contentType) {
        const format = adaptation.responseFormat;

        const templates = {
            explanation: {
                opening: format.opening,
                body: format.body,
                closing: format.closing,
                suggestedSections: this._getSuggestedSections(adaptation, 'explanation')
            },
            implementation: {
                opening: 'objective_and_approach',
                body: 'step_by_step_with_code',
                closing: 'verification_and_testing',
                suggestedSections: this._getSuggestedSections(adaptation, 'implementation')
            },
            debug: {
                opening: 'problem_identification',
                body: 'root_cause_analysis',
                closing: 'solution_and_prevention',
                suggestedSections: this._getSuggestedSections(adaptation, 'debug')
            },
            general: format
        };

        return templates[contentType] || templates.general;
    }

    _getSuggestedSections(adaptation, contentType) {
        const sectionMap = {
            explanation: {
                'frameworks_and_systems': ['Overview', 'Architecture', 'Components', 'Integration', 'Implications'],
                'logical_exploration': ['Problem', 'Analysis', 'Options', 'Tradeoffs', 'Recommendation'],
                'action_oriented_plans': ['Objective', 'Strategy', 'Action Steps', 'Expected Outcomes'],
                'hands_on_solutions': ['Problem', 'Solution', 'Implementation', 'Testing']
            },
            implementation: {
                'frameworks_and_systems': ['Architecture Design', 'Module Implementation', 'Integration', 'Validation'],
                'logical_exploration': ['Approach Analysis', 'Implementation Options', 'Selected Solution', 'Testing'],
                'action_oriented_plans': ['Implementation Plan', 'Execution Steps', 'Validation', 'Deployment'],
                'hands_on_solutions': ['Setup', 'Build', 'Test', 'Deploy']
            },
            debug: {
                'frameworks_and_systems': ['System Analysis', 'Root Cause', 'Systematic Fix', 'Prevention'],
                'logical_exploration': ['Problem Analysis', 'Hypothesis', 'Investigation', 'Solution'],
                'action_oriented_plans': ['Issue Identification', 'Fix Strategy', 'Execution', 'Verification'],
                'hands_on_solutions': ['Reproduce', 'Fix', 'Test', 'Verify']
            }
        };

        return sectionMap[contentType]?.[adaptation.structure] || ['Introduction', 'Body', 'Conclusion'];
    }

    _getToneGuidelines(adaptation) {
        return {
            style: adaptation.tone,
            formality: this._inferFormality(adaptation.tone),
            emotionality: this._inferEmotionality(adaptation.tone),
            directness: this._inferDirectness(adaptation.tone)
        };
    }

    _inferFormality(tone) {
        const formalTones = ['analytical_strategic', 'analytical_curious', 'professional_positive'];
        const informalTones = ['enthusiastic_fun', 'energetic_optimistic', 'friendly_helpful'];

        if (formalTones.some(t => tone.includes(t))) return 'formal';
        if (informalTones.some(t => tone.includes(t))) return 'informal';
        return 'neutral';
    }

    _inferEmotionality(tone) {
        const highEmotionality = ['enthusiastic', 'energetic', 'inspiring', 'exciting'];
        const lowEmotionality = ['analytical', 'pragmatic', 'direct', 'concise'];

        if (highEmotionality.some(e => tone.includes(e))) return 'high';
        if (lowEmotionality.some(e => tone.includes(e))) return 'low';
        return 'moderate';
    }

    _inferDirectness(tone) {
        const directTones = ['confident_decisive', 'direct_organized', 'pragmatic_concise'];
        const indirectTones = ['gentle_creative', 'thoughtful_considerate', 'supportive_authentic'];

        if (directTones.some(t => tone.includes(t))) return 'direct';
        if (indirectTones.some(t => tone.includes(t))) return 'indirect';
        return 'balanced';
    }

    _selectKeywords(adaptation) {
        return {
            preferred: adaptation.preferredKeywords.slice(0, 3),
            secondary: adaptation.preferredKeywords.slice(3),
            avoid: this._getAvoidKeywords(adaptation)
        };
    }

    _getAvoidKeywords(adaptation) {
        // Keywords to avoid based on MBTI type
        const avoidMap = {
            'INTJ': ['feelings', 'emotional', 'gut feeling'],
            'INTP': ['just do it', 'don\'t think', 'trust me'],
            'ENTJ': ['maybe', 'uncertain', 'we\'ll see'],
            'ISTJ': ['experimental', 'unproven', 'risky'],
            'ENFP': ['boring', 'routine', 'rigid']
        };

        return avoidMap[adaptation.meta?.mbtiType] || [];
    }

    _getValidationApproach(adaptation) {
        return {
            style: adaptation.validationStyle,
            frequency: this._getValidationFrequency(adaptation),
            method: this._getValidationMethod(adaptation)
        };
    }

    _getValidationFrequency(adaptation) {
        // Sensing types prefer frequent validation
        const mbtiType = adaptation.meta?.mbtiType || 'INTJ';
        if (mbtiType[1] === 'S') return 'frequent'; // Sensing
        if (mbtiType[1] === 'N') return 'periodic'; // Intuition
        return 'moderate';
    }

    _getValidationMethod(adaptation) {
        const mbtiType = adaptation.meta?.mbtiType || 'INTJ';

        if (mbtiType[2] === 'T') return 'logical_proof'; // Thinking
        if (mbtiType[2] === 'F') return 'value_alignment'; // Feeling
        return 'balanced';
    }

    /**
     * 🎖️ ESMC 3.10 - Apply TBI modifiers (time-aware adaptation)
     * @param {Object} adaptation - Current adaptation parameters
     * @param {Object} tbiState - Temporal-Behavioral Intelligence state
     * @returns {Object} - Modified adaptation
     */
    _applyTBIModifiers(adaptation, tbiState) {
        if (!tbiState || !tbiState.circadianPhase) {
            return adaptation;
        }

        const modifiedAdaptation = { ...adaptation };
        const phase = tbiState.circadianPhase;  // String, e.g., "metaAnalytical"
        const cognitiveMode = tbiState.cognitiveMode;  // e.g., "strategist"
        const cognitiveState = tbiState.state;  // e.g., "meta_analytical"
        const fatigueLevel = tbiState.fatigueLevel;

        // Modifier 1: Adjust detail level based on circadian phase
        if (phase === 'peakTechnical' || phase === 'strategicFlow') {
            // User is in peak cognitive state - can handle complex details
            modifiedAdaptation.detailLevel = this._increaseDetailLevel(adaptation.detailLevel);
        } else if (phase === 'rest' || phase === 'lowActivity') {
            // User is likely resting - keep responses concise
            modifiedAdaptation.detailLevel = this._decreaseDetailLevel(adaptation.detailLevel);
        } else if (phase === 'operational' && fatigueLevel > 0.6) {
            // Post-lunch or tired - simplify responses
            modifiedAdaptation.detailLevel = this._decreaseDetailLevel(adaptation.detailLevel);
        }

        // Modifier 2: Adjust tone based on cognitive state
        if (cognitiveState === 'peak_focus' || cognitiveState === 'strategic_thinking') {
            // User is focused - use direct, efficient tone
            modifiedAdaptation.tone = this._formalizeTone(adaptation.tone);
        } else if (cognitiveState === 'fatigued' || cognitiveState === 'recovering') {
            // User is tired - use supportive, gentle tone
            modifiedAdaptation.tone = this._casualizeTone(adaptation.tone);
        }

        // Modifier 3: Adjust structure based on optimal task types
        const optimalTasks = tbiState.optimalFor || [];
        if (optimalTasks.includes('philosophy') || optimalTasks.includes('meta_analysis')) {
            // User is in reflective phase - use narrative structure
            modifiedAdaptation.structure = 'conceptual_exploration';
        } else if (optimalTasks.includes('admin') || optimalTasks.includes('testing')) {
            // User is in operational phase - use practical structure
            modifiedAdaptation.structure = 'hands_on_solutions';
        }

        // Modifier 4: Add TBI-specific context
        if (!modifiedAdaptation.tbiContext) {
            modifiedAdaptation.tbiContext = {
                phase,
                cognitiveMode,
                cognitiveState,
                optimalFor: optimalTasks.slice(0, 3),
                fatigueLevel,
                energy: tbiState.energy,
                suggestion: tbiState.suggestion || null
            };
        }

        return modifiedAdaptation;
    }
}

// ========================================
// CLI TESTING INTERFACE
// ========================================

if (require.main === module) {
    const adapter = new ResponseAdapter({ debugMode: true });

    console.log('\n🎯 ESMC 3.10 - RESPONSE ADAPTATION ENGINE');
    console.log('='.repeat(60));

    const testProfiles = [
        {
            mbti: { type: 'INTJ', confidence: 0.85 },
            linguistic: {
                averageMessageLength: 180,
                communicationStyle: {
                    formality: { level: 'formal' },
                    directness: { level: 'direct' },
                    technicality: { level: 'highly_technical' }
                },
                wordChoiceProfile: { technical: 18, directive: 12, certainty: 8 },
                totalMessagesAnalyzed: 25
            }
        },
        {
            mbti: { type: 'ENFP', confidence: 0.75 },
            linguistic: {
                averageMessageLength: 90,
                communicationStyle: {
                    formality: { level: 'informal' },
                    directness: { level: 'balanced' },
                    technicality: { level: 'moderate' }
                },
                wordChoiceProfile: { collaborative: 10, emphatic: 6, uncertainty: 4 },
                totalMessagesAnalyzed: 15
            }
        }
    ];

    testProfiles.forEach((profile, index) => {
        console.log(`\n--- TEST PROFILE ${index + 1}: ${profile.mbti.type} ---`);

        const adaptation = adapter.adaptResponse(profile.mbti, profile.linguistic);
        console.log(`\n📊 Adaptation Parameters:`);
        console.log(`  - Structure: ${adaptation.structure}`);
        console.log(`  - Tone: ${adaptation.tone}`);
        console.log(`  - Detail Level: ${adaptation.detailLevel}`);
        console.log(`  - Validation Style: ${adaptation.validationStyle}`);
        console.log(`  - Adaptation Strength: ${(adaptation.adaptationStrength * 100).toFixed(0)}%`);

        const template = adapter.generateResponseTemplate(adaptation, 'implementation');
        console.log(`\n📝 Response Template (Implementation):`);
        console.log(`  - Opening: ${template.structure.opening}`);
        console.log(`  - Body: ${template.structure.body}`);
        console.log(`  - Closing: ${template.structure.closing}`);
        console.log(`  - Suggested Sections: ${template.structure.suggestedSections.join(' → ')}`);

        console.log(`\n🎯 Tone Guidelines:`);
        console.log(`  - Style: ${template.tone.style}`);
        console.log(`  - Formality: ${template.tone.formality}`);
        console.log(`  - Directness: ${template.tone.directness}`);

        console.log(`\n🔑 Keywords:`);
        console.log(`  - Preferred: ${template.keywords.preferred.join(', ')}`);
        console.log(`  - Avoid: ${template.keywords.avoid.length > 0 ? template.keywords.avoid.join(', ') : 'None specific'}`);
    });

    console.log('\n✅ Response Adaptation Engine: OPERATIONAL\n');
}

module.exports = ResponseAdapter;
