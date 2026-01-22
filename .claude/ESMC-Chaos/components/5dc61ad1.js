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
/** ESMC 3.10 TBI | 2025-10-14 | v3.10.0 | PROD | ALL_TIERS | HIDDEN
 *  Purpose: Temporal-Behavioral Intelligence - circadian state inference from time-of-day + activity patterns + MBTI
 *  Features: Circadian rhythms | 8 cognitive phases | Mental state inference | Time-aware adaptation | 5min cache | Privacy-first
 *  Philosophy: "Not all hours are equal - 2AM ≠ 2PM" | Invisible UX | Runs before response generation
 *  Author: COLONEL ECHELON
 */

const fs = require('fs').promises;
const path = require('path');

class TemporalBehavioralIntelligence {
    constructor(options = {}) {
        this.version = "3.10.1";
        this.componentName = "TBI";
        this.hiddenFeature = true; // Not advertised, always-active

        // User profile path
        this.profilePath = options.profilePath || path.join(process.cwd(), '.claude', 'memory', '.user-profile.json');

        // Circadian mapping (personalized from analysis)
        this.circadianMap = this._buildCircadianMap();

        // Mental state cache (avoid recalculation)
        this.stateCache = {
            lastCalculation: null,
            lastState: null,
            cacheDuration: 300000 // 5 minutes
        };

        console.log(`🕐 TBI ${this.version} initialized (hidden feature)`);
    }

    /**
     * PRIMARY API: Infer current mental state
     * @param {Date} currentTime - Current timestamp (user's local time)
     * @param {Object} userProfile - MBTI profile from CUP
     * @param {Array} recentActivity - Recent session timestamps
     * @returns {Object} Mental state inference
     */
    async inferMentalState(currentTime = new Date(), userProfile = null, recentActivity = []) {
        // Check cache first
        const now = Date.now();
        if (this.stateCache.lastCalculation &&
            (now - this.stateCache.lastCalculation < this.stateCache.cacheDuration)) {
            console.log(`   🕐 TBI: Using cached state (${Math.round((now - this.stateCache.lastCalculation) / 1000)}s old)`);
            return this.stateCache.lastState;
        }

        try {
            // Extract temporal features
            const hour = currentTime.getHours();
            const dayOfWeek = currentTime.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            // Get circadian phase
            const circadianPhase = this._getCircadianPhase(hour);

            // Analyze recent activity patterns
            const activityAnalysis = this._analyzeRecentActivity(recentActivity);

            // Calculate fatigue level
            const fatigueLevel = this._calculateFatigue(currentTime, activityAnalysis);

            // Get MBTI influence
            const mbtiInfluence = this._getMBTIInfluence(userProfile, hour);

            // Synthesize mental state
            const mentalState = this._synthesizeMentalState({
                hour,
                dayOfWeek,
                isWeekend,
                circadianPhase,
                activityAnalysis,
                fatigueLevel,
                mbtiInfluence
            });

            // Cache result
            this.stateCache.lastCalculation = now;
            this.stateCache.lastState = mentalState;

            console.log(`   🕐 TBI: Mental state inferred - ${mentalState.state} (energy: ${mentalState.energy})`);

            return mentalState;

        } catch (error) {
            console.error(`   ❌ TBI: Mental state inference failed - ${error.message}`);
            // Graceful fallback
            return this._getDefaultState(currentTime.getHours());
        }
    }

    /**
     * Build personalized circadian map from user analysis
     * @private
     */
    _buildCircadianMap() {
        // Personalized for Malaysian night owl (from analysis)
        return {
            // 22:00 - 00:30 (10 PM - 12:30 AM): Warm-up phase
            warmup: {
                hourStart: 22,
                hourEnd: 0.5, // 00:30
                state: "warmup_focus",
                energy: "ramping",
                cognitiveMode: "transitioning",
                optimalFor: ["admin", "consolidation", "file_organization", "setup"],
                avoid: ["complex_architecture", "critical_decisions", "deep_debugging"]
            },

            // 00:30 - 02:00 (12:30 AM - 2 AM): Peak technical focus
            peakTechnical: {
                hourStart: 0.5,
                hourEnd: 2,
                state: "peak_technical",
                energy: "maximum",
                cognitiveMode: "engineering",
                optimalFor: ["database_design", "complex_implementation", "system_architecture", "algorithm_design", "debugging"],
                avoid: ["philosophy", "long_discussions", "documentation"]
            },

            // 02:00 - 05:00 (2 AM - 5 AM): Strategic flow state
            strategicFlow: {
                hourStart: 2,
                hourEnd: 5,
                state: "strategic_flow",
                energy: "high_sustained",
                cognitiveMode: "architect",
                optimalFor: ["architecture", "standards_design", "quality_validation", "framework_design", "integration"],
                avoid: ["mundane_tasks", "repetitive_work", "data_entry"]
            },

            // 05:00 - 06:00 (5 AM - 6 AM): Reflective synthesis
            reflectiveSynthesis: {
                hourStart: 5,
                hourEnd: 6,
                state: "reflective_synthesis",
                energy: "winding_down",
                cognitiveMode: "philosopher",
                optimalFor: ["philosophy", "meta_analysis", "paradigm_exploration", "reflection", "big_picture_thinking"],
                avoid: ["new_implementation", "detailed_debugging", "complex_setup"]
            },

            // 06:00 - 10:30 (6 AM - 10:30 AM): Rest/sleep period
            rest: {
                hourStart: 6,
                hourEnd: 10.5,
                state: "rest_recovery",
                energy: "sleeping",
                cognitiveMode: "offline",
                optimalFor: ["sleep", "recovery"],
                avoid: ["everything"]
            },

            // 10:30 - 12:00 (10:30 AM - 12 PM): Meta-analytical fresh start
            metaAnalytical: {
                hourStart: 10.5,
                hourEnd: 12,
                state: "meta_analytical",
                energy: "fresh_perspective",
                cognitiveMode: "strategist",
                optimalFor: ["planning", "optimization", "strategic_direction", "system_design", "analysis"],
                avoid: ["deep_implementation", "debugging"]
            },

            // 12:00 - 17:00 (12 PM - 5 PM): Operational maintenance
            operational: {
                hourStart: 12,
                hourEnd: 17,
                state: "operational_maintenance",
                energy: "declining",
                cognitiveMode: "maintenance",
                optimalFor: ["testing", "documentation", "code_review", "minor_fixes", "refactoring"],
                avoid: ["complex_new_features", "architecture_decisions", "critical_systems"]
            },

            // 17:00 - 22:00 (5 PM - 10 PM): Low activity / family time
            lowActivity: {
                hourStart: 17,
                hourEnd: 22,
                state: "low_activity",
                energy: "minimal",
                cognitiveMode: "recovery",
                optimalFor: ["light_reading", "casual_planning", "leisure"],
                avoid: ["any_serious_work"]
            }
        };
    }

    /**
     * Get circadian phase for given hour
     * @private
     */
    _getCircadianPhase(hour) {
        // Convert hour to decimal (e.g., 00:30 = 0.5)
        const hourDecimal = hour + (new Date().getMinutes() / 60);

        const map = this.circadianMap;

        // Check each phase
        for (const [phaseName, phase] of Object.entries(map)) {
            // Handle wrap-around for midnight (e.g., 22:00 - 00:30)
            if (phase.hourStart > phase.hourEnd) {
                if (hourDecimal >= phase.hourStart || hourDecimal < phase.hourEnd) {
                    return { phaseName, ...phase };
                }
            } else {
                if (hourDecimal >= phase.hourStart && hourDecimal < phase.hourEnd) {
                    return { phaseName, ...phase };
                }
            }
        }

        // Fallback to operational if no match
        return { phaseName: 'operational', ...map.operational };
    }

    /**
     * Analyze recent activity patterns
     * @private
     */
    _analyzeRecentActivity(recentActivity = []) {
        if (recentActivity.length === 0) {
            return {
                sessionCount: 0,
                totalDuration: 0,
                averageDuration: 0,
                longestStreak: 0,
                breaksSince: null
            };
        }

        // Sort by timestamp
        const sorted = recentActivity.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Calculate metrics
        const sessionCount = sorted.length;
        const firstSession = new Date(sorted[0].timestamp);
        const lastSession = new Date(sorted[sorted.length - 1].timestamp);
        const totalDuration = lastSession.getTime() - firstSession.getTime();
        const averageDuration = totalDuration / sessionCount;

        // Calculate longest continuous work streak
        let longestStreak = 0;
        let currentStreak = 0;
        for (let i = 1; i < sorted.length; i++) {
            const gap = new Date(sorted[i].timestamp).getTime() -
                        new Date(sorted[i-1].timestamp).getTime();
            if (gap < 3600000) { // Less than 1 hour gap
                currentStreak++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 0;
            }
        }
        longestStreak = Math.max(longestStreak, currentStreak);

        // Time since last break
        const now = Date.now();
        const timeSinceLastSession = now - lastSession.getTime();

        return {
            sessionCount,
            totalDuration,
            averageDuration,
            longestStreak,
            breaksSince: timeSinceLastSession
        };
    }

    /**
     * Calculate fatigue level
     * @private
     */
    _calculateFatigue(currentTime, activityAnalysis) {
        const hour = currentTime.getHours();

        // Fatigue increases with continuous work
        let fatigue = 0;

        // Base fatigue from circadian rhythm
        if (hour >= 5 && hour < 6) fatigue += 0.3; // Winding down
        if (hour >= 6 && hour < 11) fatigue += 0.0; // Rested
        if (hour >= 12 && hour < 17) fatigue += 0.2; // Post-lunch dip
        if (hour >= 17 && hour < 22) fatigue += 0.4; // Evening decline

        // Additional fatigue from continuous work
        if (activityAnalysis.longestStreak > 4) {
            fatigue += 0.1 * (activityAnalysis.longestStreak - 4);
        }

        // Reduce fatigue if recent break
        if (activityAnalysis.breaksSince && activityAnalysis.breaksSince > 3600000) {
            fatigue -= 0.2; // 1+ hour break reduces fatigue
        }

        return Math.max(0, Math.min(1, fatigue)); // Clamp 0-1
    }

    /**
     * Get MBTI influence on mental state
     * @private
     */
    _getMBTIInfluence(userProfile, hour) {
        if (!userProfile || !userProfile.mbti) {
            return {
                socialEnergy: 0.5,
                detailOrientation: 0.5,
                decisionStyle: 0.5,
                structurePreference: 0.5
            };
        }

        const mbti = userProfile.mbti;

        return {
            // E/I: Introverts gain energy from solitude (night work)
            socialEnergy: mbti.E_I < 0.5 ? (hour >= 22 || hour < 6 ? 1.0 : 0.6) : 0.5,

            // S/N: iNtuitive types prefer abstract thinking (philosophy hours)
            detailOrientation: mbti.S_N > 0.5 ? 0.8 : 0.5,

            // T/F: Thinking types focus better on logic during peak hours
            decisionStyle: mbti.T_F < 0.5 ? 0.9 : 0.6,

            // J/P: Judging types maintain structure even in flexible schedule
            structurePreference: mbti.J_P < 0.5 ? 0.9 : 0.5
        };
    }

    /**
     * Synthesize final mental state
     * @private
     */
    _synthesizeMentalState(inputs) {
        const { circadianPhase, fatigueLevel, mbtiInfluence } = inputs;

        // Adjust energy based on fatigue
        let adjustedEnergy = circadianPhase.energy;
        if (fatigueLevel > 0.5) {
            adjustedEnergy = adjustedEnergy === "maximum" ? "high" :
                            adjustedEnergy === "high_sustained" ? "moderate" :
                            adjustedEnergy === "ramping" ? "low" : adjustedEnergy;
        }

        return {
            // Core state
            state: circadianPhase.state,
            energy: adjustedEnergy,
            cognitiveMode: circadianPhase.cognitiveMode,

            // Recommendations
            optimalFor: circadianPhase.optimalFor,
            avoid: circadianPhase.avoid,

            // Metrics
            fatigueLevel: fatigueLevel,
            confidence: this._calculateConfidence(inputs),

            // Metadata
            timestamp: new Date().toISOString(),
            circadianPhase: circadianPhase.phaseName,

            // MBTI influence
            mbtiBoost: mbtiInfluence.socialEnergy > 0.8 ||
                       mbtiInfluence.structurePreference > 0.8
        };
    }

    /**
     * Calculate confidence in mental state inference
     * @private
     */
    _calculateConfidence(inputs) {
        let confidence = 0.7; // Base confidence

        // Higher confidence if we have activity data
        if (inputs.activityAnalysis.sessionCount > 5) confidence += 0.1;

        // Higher confidence if MBTI data available
        if (inputs.mbtiInfluence.socialEnergy !== 0.5) confidence += 0.1;

        // Higher confidence during established phases (not transition periods)
        if (inputs.circadianPhase.phaseName !== 'operational') confidence += 0.1;

        return Math.min(0.95, confidence);
    }

    /**
     * Get default state when inference fails
     * @private
     */
    _getDefaultState(hour) {
        // Simple fallback based only on hour
        if (hour >= 22 || hour < 6) {
            return {
                state: "night_work",
                energy: "variable",
                cognitiveMode: "unknown",
                optimalFor: ["general_work"],
                avoid: [],
                fatigueLevel: 0.5,
                confidence: 0.3,
                timestamp: new Date().toISOString(),
                circadianPhase: "unknown",
                mbtiBoost: false
            };
        }

        return {
            state: "day_work",
            energy: "moderate",
            cognitiveMode: "unknown",
            optimalFor: ["general_work"],
            avoid: [],
            fatigueLevel: 0.5,
            confidence: 0.3,
            timestamp: new Date().toISOString(),
            circadianPhase: "unknown",
            mbtiBoost: false
        };
    }

    /**
     * Generate proactive suggestion based on mental state
     * @param {string} requestType - Type of user request (implementation, debug, architecture, etc.)
     * @param {Object} mentalState - Current mental state
     * @returns {string|null} Suggestion or null if none
     */
    generateProactiveSuggestion(requestType, mentalState) {
        const { state, optimalFor, avoid, energy } = mentalState;

        // Check if request type conflicts with current state
        if (avoid.includes(requestType)) {
            // Find optimal window for this request type
            const optimalPhase = this._findOptimalPhaseFor(requestType);

            if (optimalPhase) {
                return `💡 TBI Note: This task (${requestType}) might be better suited for your ${optimalPhase.phaseName} window (${optimalPhase.hourStart}:00 - ${Math.floor(optimalPhase.hourEnd)}:00). Current energy: ${energy}.`;
            }
        }

        // Suggest breaks if fatigue is high
        if (mentalState.fatigueLevel > 0.7) {
            return `💡 TBI Note: High fatigue detected (${Math.round(mentalState.fatigueLevel * 100)}%). Consider taking a break before continuing.`;
        }

        return null; // No suggestion needed
    }

    /**
     * Find optimal circadian phase for given task type
     * @private
     */
    _findOptimalPhaseFor(taskType) {
        for (const [phaseName, phase] of Object.entries(this.circadianMap)) {
            if (phase.optimalFor && phase.optimalFor.includes(taskType)) {
                return { phaseName, ...phase };
            }
        }
        return null;
    }

    /**
     * Get TBI status for debugging
     */
    getStatus() {
        return {
            component: this.componentName,
            version: this.version,
            hiddenFeature: this.hiddenFeature,
            cacheStatus: {
                cached: !!this.stateCache.lastState,
                age: this.stateCache.lastCalculation ?
                     Date.now() - this.stateCache.lastCalculation : null
            },
            circadianPhases: Object.keys(this.circadianMap).length,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { TemporalBehavioralIntelligence };

// Example usage
if (require.main === module) {
    console.log("🕐 ESMC 3.10 - TBI Test");

    (async () => {
        const tbi = new TemporalBehavioralIntelligence();

        // Simulate different times of day
        const testTimes = [
            { hour: 23, desc: "11 PM - Warmup phase" },
            { hour: 1, desc: "1 AM - Peak technical" },
            { hour: 3, desc: "3 AM - Strategic flow" },
            { hour: 5, desc: "5 AM - Reflective synthesis" },
            { hour: 11, desc: "11 AM - Meta-analytical" },
            { hour: 14, desc: "2 PM - Operational maintenance" }
        ];

        for (const test of testTimes) {
            const testTime = new Date();
            testTime.setHours(test.hour, 0, 0, 0);

            console.log(`\n📊 Testing: ${test.desc}`);
            const state = await tbi.inferMentalState(testTime, null, []);
            console.log(`   State: ${state.state}`);
            console.log(`   Energy: ${state.energy}`);
            console.log(`   Cognitive Mode: ${state.cognitiveMode}`);
            console.log(`   Optimal for: ${state.optimalFor.join(', ')}`);
        }

        console.log("\n✅ TBI test completed");
    })();
}
