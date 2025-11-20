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
/** ESMC 3.10 PSE | 2025-10-14 | v3.10.0 | PROD | ALL_TIERS
 *  Purpose: Profile Synthesis Engine - CUP integration layer orchestrating MBTI + linguistic analysis + memory bank
 *  Features: 7-step flow (message→MBTI→linguistic→synthesis→memory→adaptation→return) | Unified profiling | TBI integration
 *  Author: COLONEL GAMMA
 *
 *  PRIVACY:
 *  - All processing local
 *  - No external API calls
 *  - User profile stored in .claude/memory/profiles/
 *  - User can delete profile anytime
 */

const fs = require('fs').promises;
const path = require('path');
const MBTIProfiler = require('./c2413cef.js');
const LinguisticAnalyzer = require('./abd99d2f.js');
const ResponseAdapter = require('./8c92d1e8.js');
const { TemporalBehavioralIntelligence } = require('./c7e48afd.js');

class ProfileSynthesisEngine {
    constructor(config = {}) {
        this.config = {
            projectRoot: config.projectRoot || process.cwd(),
            profilePath: config.profilePath || path.join(process.cwd(), '.claude', 'memory', '.user-profile.json'),
            confidenceThreshold: config.confidenceThreshold || 0.6,
            updateFrequency: config.updateFrequency || 'every_message', // 'every_message' or 'every_session'
            debugMode: config.debugMode || false
        };

        // Initialize modules
        this.mbtiProfiler = new MBTIProfiler({
            confidenceThreshold: this.config.confidenceThreshold,
            debugMode: this.config.debugMode
        });

        this.linguisticAnalyzer = new LinguisticAnalyzer({
            debugMode: this.config.debugMode
        });

        this.responseAdapter = new ResponseAdapter({
            debugMode: this.config.debugMode
        });

        // 🎖️ ESMC 3.10 - TBI Engine (Hidden Feature)
        this.tbiEngine = new TemporalBehavioralIntelligence({
            debugMode: this.config.debugMode
        });

        this.userProfile = null;
        this.initialized = false;
    }

    /**
     * Initialize Profile Synthesis Engine
     */
    async initialize() {
        try {
            if (this.config.debugMode) {
                console.log('🧠 ESMC 3.10 - Profile Synthesis Engine initializing...');
            }

            // Load existing profile or create new one
            await this._loadUserProfile();

            this.initialized = true;

            if (this.config.debugMode) {
                console.log('🧠 Profile Synthesis Engine: READY');
                console.log(`   MBTI Type: ${this.userProfile.personalityProfile?.mbti?.type || 'Learning...'}`);
                console.log(`   Messages Analyzed: ${this.userProfile.linguisticProfile?.totalMessagesAnalyzed || 0}`);
            }

            return { success: true };

        } catch (error) {
            console.error('Profile Synthesis Engine initialization failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process user message and update profile (MAIN METHOD)
     * @param {string} message - User's message text
     * @returns {Object} - Adaptation parameters + profile updates
     */
    async processMessage(message) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!message || message.trim().length === 0) {
            return this._createDefaultAdaptation();
        }

        try {
            // === STEP 1: MBTI INFERENCE ===
            const mbtiAnalysis = this.mbtiProfiler.analyzeMessage(message);
            const messageCount = (this.userProfile.personalityProfile?.mbti?.dimensionScores?.messageCount || 0) + 1;

            // Update MBTI scores incrementally
            const updatedMBTI = this.mbtiProfiler.updateScores(
                this.userProfile.personalityProfile?.mbti?.dimensionScores || {},
                mbtiAnalysis,
                messageCount
            );

            // Calculate MBTI type
            const mbtiResult = this.mbtiProfiler.calculateMBTI(updatedMBTI);

            // === STEP 2: LINGUISTIC ANALYSIS ===
            const linguisticAnalysis = this.linguisticAnalyzer.analyzeMessage(message);

            // Update linguistic profile incrementally
            const updatedLinguisticProfile = this.linguisticAnalyzer.updateProfile(
                this.userProfile.linguisticProfile || {},
                linguisticAnalysis,
                messageCount
            );

            // Generate insights
            const linguisticInsights = this.linguisticAnalyzer.generateInsights(updatedLinguisticProfile);

            // === STEP 3: TEMPORAL-BEHAVIORAL INTELLIGENCE (TBI) ===
            // 🎖️ ESMC 3.10 - Hidden Feature: Always-active circadian analysis
            const currentTime = new Date();
            const recentActivity = []; // TODO: Load from session history if needed

            const tbiState = await this.tbiEngine.inferMentalState(
                currentTime,
                this.userProfile,
                recentActivity
            );

            if (this.config.debugMode) {
                console.log(`🕒 TBI: ${tbiState.circadianPhase} phase detected`);
                console.log(`   Cognitive state: ${tbiState.cognitiveMode}`);
            }

            // === STEP 4: RESPONSE ADAPTATION (with TBI state) ===
            const adaptation = this.responseAdapter.adaptResponse(
                mbtiResult,
                updatedLinguisticProfile,
                tbiState  // 🎖️ NEW: Pass TBI state for time-aware adaptation
            );

            // === STEP 5: PROFILE SYNTHESIS ===
            await this._synthesizeProfile({
                mbti: {
                    ...mbtiResult,
                    dimensionScores: {
                        ...updatedMBTI,
                        messageCount
                    }
                },
                linguistic: updatedLinguisticProfile,
                insights: linguisticInsights,
                adaptation,
                tbiState  // 🎖️ Store TBI state in profile
            });

            // === STEP 6: RETURN ADAPTATION ===
            return {
                success: true,
                adaptation,
                mbti: mbtiResult,
                linguisticInsights,
                tbiState,  // 🎖️ Return TBI state for caller
                profileUpdated: true
            };

        } catch (error) {
            console.error('Message processing failed:', error.message);
            return this._createDefaultAdaptation();
        }
    }

    /**
     * Get current user profile
     */
    getUserProfile() {
        return this.userProfile;
    }

    /**
     * Get personality summary (for display)
     */
    getPersonalitySummary() {
        if (!this.userProfile || !this.userProfile.personalityProfile) {
            return {
                ready: false,
                message: 'Learning your personality... (need a few more messages)'
            };
        }

        const mbti = this.userProfile.personalityProfile.mbti;
        const linguistic = this.userProfile.linguisticProfile;

        if (!mbti || !mbti.type) {
            return {
                ready: false,
                confidence: mbti?.confidence || 0,
                message: `Confidence: ${((mbti?.confidence || 0) * 100).toFixed(0)}% - Need more messages to determine MBTI type`
            };
        }

        return {
            ready: true,
            mbti: {
                type: mbti.type,
                confidence: mbti.confidence,
                description: mbti.description
            },
            communicationStyle: {
                formality: linguistic?.communicationStyle?.formality?.level || 'neutral',
                directness: linguistic?.communicationStyle?.directness?.level || 'balanced',
                technicality: linguistic?.communicationStyle?.technicality?.level || 'moderate'
            },
            typingStyle: {
                verbosity: linguistic?.averageMessageLength > 200 ? 'verbose' : linguistic?.averageMessageLength > 50 ? 'moderate' : 'concise',
                accuracy: linguistic?.overallTypoRate < 0.02 ? 'high' : 'moderate'
            },
            messagesAnalyzed: linguistic?.totalMessagesAnalyzed || 0
        };
    }

    /**
     * Generate response template for ESMC
     * @param {string} contentType - 'explanation', 'implementation', 'debug', 'general'
     * @returns {Object} - Response structure template
     */
    async generateResponseTemplate(contentType = 'general') {
        if (!this.initialized) {
            await this.initialize();
        }

        const mbti = this.userProfile.personalityProfile?.mbti;
        const linguistic = this.userProfile.linguisticProfile;

        // 🎖️ ESMC 3.10 - Get current TBI state for template generation
        const currentTime = new Date();
        const tbiState = await this.tbiEngine.inferMentalState(currentTime, this.userProfile, []);

        const adaptation = this.responseAdapter.adaptResponse(mbti, linguistic, tbiState);
        const template = this.responseAdapter.generateResponseTemplate(adaptation, contentType);

        return template;
    }

    // ========================================
    // PRIVATE METHODS
    // ========================================

    /**
     * Load user profile from file
     */
    async _loadUserProfile() {
        try {
            const profileData = await fs.readFile(this.config.profilePath, 'utf8');
            this.userProfile = JSON.parse(profileData);

            // Ensure ESMC 3.10 structure exists
            if (!this.userProfile.personalityProfile) {
                this.userProfile.personalityProfile = this._createEmptyPersonalityProfile();
            }
            if (!this.userProfile.linguisticProfile) {
                this.userProfile.linguisticProfile = this._createEmptyLinguisticProfile();
            }

        } catch (error) {
            // Profile doesn't exist - create new one
            this.userProfile = this._createNewProfile();
            await this._saveUserProfile();
        }
    }

    /**
     * Save user profile to file
     */
    async _saveUserProfile() {
        try {
            // Ensure directory exists
            const profileDir = path.dirname(this.config.profilePath);
            await fs.mkdir(profileDir, { recursive: true });

            await fs.writeFile(
                this.config.profilePath,
                JSON.stringify(this.userProfile, null, 2),
                'utf8'
            );

        } catch (error) {
            console.error('Failed to save user profile:', error.message);
        }
    }

    /**
     * Synthesize all analysis into unified profile
     */
    async _synthesizeProfile(analysis) {
        // Update personality profile
        this.userProfile.personalityProfile = {
            mbti: analysis.mbti,
            lastUpdated: new Date().toISOString()
        };

        // Update linguistic profile
        this.userProfile.linguisticProfile = analysis.linguistic;

        // 🎖️ ESMC 3.10 - Update temporal-behavioral profile (if TBI state provided)
        if (analysis.tbiState) {
            if (!this.userProfile.temporalBehavioralProfile) {
                this.userProfile.temporalBehavioralProfile = {};
            }

            // Store latest TBI state (lightweight - just current phase)
            this.userProfile.temporalBehavioralProfile.latestState = {
                circadianPhase: analysis.tbiState.circadianPhase,
                cognitiveMode: analysis.tbiState.cognitiveMode,
                state: analysis.tbiState.state,
                energy: analysis.tbiState.energy,
                timestamp: new Date().toISOString()
            };
        }

        // Update cognitive profile (merge with existing MEMORY BANK 3.5 data)
        if (!this.userProfile.cognitiveProfile) {
            this.userProfile.cognitiveProfile = {};
        }

        // Infer learning style from MBTI + linguistic
        this.userProfile.cognitiveProfile.learningStyle = this._inferLearningStyle(analysis);

        // Infer problem-solving approach
        this.userProfile.cognitiveProfile.problemSolvingApproach = this._inferProblemSolving(analysis);

        // Store insights
        this.userProfile.insights = analysis.insights;

        // Store latest adaptation parameters (for debugging)
        this.userProfile.latestAdaptation = analysis.adaptation;

        // Save to file
        await this._saveUserProfile();
    }

    /**
     * Infer learning style from MBTI + linguistic
     */
    _inferLearningStyle(analysis) {
        const mbtiType = analysis.mbti?.type;
        if (!mbtiType) return 'visual_and_textual';

        // Sensing (S) vs Intuition (N) - primary indicator
        if (mbtiType[1] === 'S') {
            return 'concrete_examples_and_step_by_step'; // Sensing prefers hands-on
        } else {
            return 'conceptual_frameworks_and_big_picture'; // Intuition prefers theory
        }
    }

    /**
     * Infer problem-solving approach from MBTI
     */
    _inferProblemSolving(analysis) {
        const mbtiType = analysis.mbti?.type;
        if (!mbtiType) return 'analytical';

        // Thinking (T) vs Feeling (F)
        if (mbtiType[2] === 'T') {
            // Judging (J) vs Perceiving (P)
            if (mbtiType[3] === 'J') {
                return 'systematic_and_structured'; // TJ: Logical + Organized
            } else {
                return 'analytical_and_exploratory'; // TP: Logical + Flexible
            }
        } else {
            // Feeling (F)
            if (mbtiType[3] === 'J') {
                return 'collaborative_and_planned'; // FJ: People-oriented + Organized
            } else {
                return 'adaptive_and_values_driven'; // FP: People-oriented + Flexible
            }
        }
    }

    /**
     * Create new user profile (ESMC 3.10 schema)
     */
    _createNewProfile() {
        return {
            userId: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            created: new Date().toISOString(),
            lastSession: null,

            // ESMC 3.10 CUP - Personality Profile
            personalityProfile: this._createEmptyPersonalityProfile(),

            // ESMC 3.10 CUP - Linguistic Profile
            linguisticProfile: this._createEmptyLinguisticProfile(),

            // ESMC 3.5 - Cognitive Profile (enhanced)
            cognitiveProfile: {
                learningStyle: null,
                decisionPatterns: [],
                problemSolvingApproach: null,
                pivotTendencies: []
            },

            // ESMC 3.5 - Project context
            projects: [],

            // ESMC 3.5 - Development preferences
            preferences: {
                backupStyle: {
                    format: 'YYYYMMDD HHMM Backup TYPE Description',
                    strategy: 'Filesystem-based, visible folders',
                    retentionDays: 30
                },
                codeQuality: {
                    preferredApproach: 'Maximum care, no placeholders',
                    qualityThreshold: 80,
                    testingRequired: true
                },
                communication: {
                    verbosity: 'concise_but_complete',
                    preferredTone: 'professional_friendly'
                }
            },

            // Statistics
            stats: {
                sessionsCount: 0,
                totalBackups: 0,
                favoriteFeatures: [],
                mostUsedCommands: []
            }
        };
    }

    _createEmptyPersonalityProfile() {
        return {
            mbti: {
                type: null,
                confidence: 0,
                dimensionScores: {
                    E_I: { score: 0, confidence: 0, type: 'X' },
                    S_N: { score: 0, confidence: 0, type: 'X' },
                    T_F: { score: 0, confidence: 0, type: 'X' },
                    J_P: { score: 0, confidence: 0, type: 'X' },
                    messageCount: 0
                },
                description: 'Type being determined...',
                needsMoreData: true
            },
            lastUpdated: null
        };
    }

    _createEmptyLinguisticProfile() {
        return {
            averageMessageLength: 0,
            averageWordCount: 0,
            averageSentenceLength: 0,
            averageWordLength: 0,
            typoPatterns: {},
            wordChoiceProfile: {},
            punctuationProfile: {},
            communicationStyle: {},
            complexityTrend: [],
            totalMessagesAnalyzed: 0,
            lastAnalyzed: null,
            overallTypoRate: 0
        };
    }

    _createDefaultAdaptation() {
        return {
            success: true,
            adaptation: {
                structure: 'hierarchical_breakdown',
                tone: 'professional_friendly',
                detailLevel: 'moderate',
                validationStyle: 'balanced',
                adaptationStrength: 0.5
            },
            mbti: { type: null, confidence: 0, needsMoreData: true },
            linguisticInsights: { ready: false },
            profileUpdated: false
        };
    }
}

// ========================================
// CLI TESTING INTERFACE
// ========================================

if (require.main === module) {
    (async () => {
        const pse = new ProfileSynthesisEngine({ debugMode: true });
        await pse.initialize();

        console.log('\n🧠 ESMC 3.10 - PROFILE SYNTHESIS ENGINE');
        console.log('='.repeat(60));

        const testMessages = [
            "I believe this hasn't been properly or fully or truly been maximized: user personality.",
            "Use ESMC, audit and analyze...",
            "Why downgrade me again @@ I should be 3.10 now!!!",
            "Use ESMC analyze... and let me know what you think",
            "Use ESMC, proceed, be careful...",
            "this is nuts hahaha... even with ESMC 3.10"
        ];

        console.log('\n📊 Processing sample messages...\n');

        for (let i = 0; i < testMessages.length; i++) {
            const msg = testMessages[i];
            console.log(`\n--- MESSAGE ${i + 1} ---`);
            console.log(`Text: "${msg.substring(0, 60)}${msg.length > 60 ? '...' : ''}"`);

            const result = await pse.processMessage(msg);

            if (result.mbti && result.mbti.type) {
                console.log(`MBTI: ${result.mbti.type} (confidence: ${(result.mbti.confidence * 100).toFixed(0)}%)`);
            } else {
                console.log(`MBTI: Learning... (${(result.mbti?.confidence * 100 || 0).toFixed(0)}%)`);
            }

            console.log(`Adaptation:`);
            console.log(`  - Structure: ${result.adaptation.structure}`);
            console.log(`  - Tone: ${result.adaptation.tone}`);
            console.log(`  - Detail Level: ${result.adaptation.detailLevel}`);
        }

        console.log('\n📈 FINAL PERSONALITY SUMMARY');
        console.log('='.repeat(60));

        const summary = pse.getPersonalitySummary();
        console.log(JSON.stringify(summary, null, 2));

        console.log('\n✅ Profile Synthesis Engine: OPERATIONAL\n');
        process.exit(0);
    })();
}

module.exports = ProfileSynthesisEngine;
