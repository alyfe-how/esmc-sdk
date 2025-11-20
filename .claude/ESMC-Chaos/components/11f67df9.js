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
/** ESMC 3.4 MILESTONE INTELLIGENCE | 2025-09-30 | v3.4.0 | PROD | ALL_TIERS
 *  Purpose: 7-factor milestone analysis with feasibility assessment - intelligent restore point detection
 *  Features: Strategic learning integration (PIE/ASS/RMA/KGS) | Significance scoring | Feasibility assessment
 *  Author: COLONEL EPSILON
 */

class MilestoneIntelligenceSystem {
    constructor(database, strategicLearning = null) {
        this.db = database;
        this.strategicLearning = strategicLearning;

        // Strategic learning system components (if available)
        this.pie = strategicLearning?.pie || null;
        this.ass = strategicLearning?.ass || null;
        this.rma = strategicLearning?.rma || null;
        this.kgs = strategicLearning?.kgs || null;

        console.log('🎖️ Milestone Intelligence System initialized');
    }

    /**
     * Main assessment method - 7-factor analysis + feasibility conclusion
     * @param {string} missionRequest - User's mission request
     * @param {Object} context - Mission context
     * @returns {Object} Complete milestone assessment
     */
    async assessMilestone(missionRequest, context = {}) {
        try {
            console.log('🎖️ MIS: Analyzing milestone significance...');

            // 7-FACTOR ANALYSIS
            const factors = await this._calculate7Factors(missionRequest, context);

            // Calculate weighted milestone score
            const milestoneScore = this._calculateMilestoneScore(factors);

            // Classify milestone
            const classification = this._classifyMilestone(milestoneScore);

            // Generate reasoning
            const reasoning = this._generateReasoning(factors, milestoneScore, classification);

            // FEASIBILITY & UNCERTAINTY (Conclusion)
            const feasibility = await this._assessFeasibility(missionRequest, factors);
            const uncertainty = this._assessUncertainty(factors, feasibility);

            const assessment = {
                milestoneScore: Math.round(milestoneScore),
                classification: classification,
                factors: factors,
                reasoning: reasoning,
                feasibility: feasibility,
                uncertainty: uncertainty,
                restorePointStrategy: this._determineRestoreStrategy(classification),
                timestamp: new Date().toISOString()
            };

            console.log(`   Milestone Score: ${assessment.milestoneScore}/100`);
            console.log(`   Classification: ${classification}`);
            console.log(`   Feasibility: ${feasibility.score}/100`);
            console.log(`   Uncertainty: ${uncertainty.score}/100`);

            return assessment;

        } catch (error) {
            console.error('🚨 Milestone Assessment Error:', error.message);
            // Return safe fallback assessment
            return this._getFallbackAssessment(missionRequest);
        }
    }

    /**
     * Calculate all 7 factors
     * @private
     */
    async _calculate7Factors(missionRequest, context) {
        const factors = {
            complexity: await this._factorComplexity(missionRequest),
            riskScore: await this._factorRiskScore(missionRequest),
            domain: await this._factorDomain(missionRequest),
            novelty: await this._factorNovelty(missionRequest),
            uniqueness: await this._factorUniqueness(missionRequest),
            keywords: this._factorKeywords(missionRequest),
            fileImpact: await this._factorFileImpact(missionRequest, context)
        };

        return factors;
    }

    /**
     * FACTOR 1: Complexity (from PIE if available)
     * @private
     */
    async _factorComplexity(missionRequest) {
        if (this.pie) {
            try {
                const prediction = await this.pie.predictMissionCharacteristics(missionRequest);
                return {
                    value: prediction.estimatedComplexity,
                    score: this._complexityToScore(prediction.estimatedComplexity),
                    confidence: prediction.confidenceInterval || 0.5
                };
            } catch (error) {
                // PIE failed, use heuristic
            }
        }

        // Heuristic complexity assessment
        const wordCount = missionRequest.split(/\s+/).length;
        const technicalTerms = (missionRequest.match(/api|database|architecture|integration|security|performance|authentication|payment/gi) || []).length;

        let complexityLevel = 'simple';
        let score = 30;

        if (wordCount > 50 || technicalTerms > 5) {
            complexityLevel = 'extreme';
            score = 95;
        } else if (wordCount > 30 || technicalTerms > 3) {
            complexityLevel = 'complex';
            score = 75;
        } else if (wordCount > 15 || technicalTerms > 1) {
            complexityLevel = 'moderate';
            score = 50;
        }

        return { value: complexityLevel, score: score, confidence: 0.6 };
    }

    _complexityToScore(complexity) {
        const map = { 'trivial': 10, 'simple': 30, 'moderate': 50, 'complex': 75, 'extreme': 95 };
        return map[complexity] || 50;
    }

    /**
     * FACTOR 2: Risk Score (from PIE if available)
     * @private
     */
    async _factorRiskScore(missionRequest) {
        if (this.pie) {
            try {
                const prediction = await this.pie.predictMissionCharacteristics(missionRequest);
                return {
                    value: prediction.riskScore,
                    score: prediction.riskScore,
                    confidence: prediction.confidenceInterval || 0.5
                };
            } catch (error) {
                // PIE failed, use heuristic
            }
        }

        // Heuristic risk assessment
        const highRiskKeywords = ['migrate', 'breaking', 'delete', 'remove', 'refactor', 'replace', 'authentication', 'payment', 'security'];
        const riskMatches = highRiskKeywords.filter(keyword =>
            new RegExp(`\\b${keyword}\\b`, 'gi').test(missionRequest)
        ).length;

        const riskScore = Math.min(100, riskMatches * 20 + 20);

        return { value: riskScore, score: riskScore, confidence: 0.6 };
    }

    /**
     * FACTOR 3: Domain (from ASS if available)
     * @private
     */
    async _factorDomain(missionRequest) {
        if (this.ass) {
            try {
                const strategy = await this.ass.selectOptimalStrategy(missionRequest);
                const domainScore = this._domainToScore(strategy.domain);
                return {
                    value: strategy.domain,
                    score: domainScore,
                    confidence: strategy.confidenceScore || 0.5
                };
            } catch (error) {
                // ASS failed, use heuristic
            }
        }

        // Heuristic domain classification
        const domainKeywords = {
            architecture: ['architect', 'design', 'pattern', 'structure', 'framework'],
            security: ['security', 'auth', 'permission', 'encrypt', 'secure'],
            integration: ['integrate', 'api', 'connect', 'external', 'third-party'],
            performance: ['performance', 'optimi', 'speed', 'cache', 'fast'],
            data: ['database', 'sql', 'query', 'data', 'schema'],
            bugfix: ['fix', 'bug', 'error', 'issue', 'problem'],
            testing: ['test', 'testing', 'spec', 'coverage'],
            frontend: ['ui', 'ux', 'frontend', 'interface', 'design'],
            deployment: ['deploy', 'release', 'production', 'launch']
        };

        let detectedDomain = 'general';
        let highestMatch = 0;

        for (const [domain, keywords] of Object.entries(domainKeywords)) {
            const matches = keywords.filter(kw =>
                new RegExp(`\\b${kw}`, 'gi').test(missionRequest)
            ).length;
            if (matches > highestMatch) {
                highestMatch = matches;
                detectedDomain = domain;
            }
        }

        return {
            value: detectedDomain,
            score: this._domainToScore(detectedDomain),
            confidence: 0.6
        };
    }

    _domainToScore(domain) {
        const scores = {
            architecture: 90,
            security: 90,
            integration: 80,
            performance: 70,
            data: 75,
            bugfix: 40,
            testing: 50,
            frontend: 60,
            deployment: 85,
            general: 50
        };
        return scores[domain] || 50;
    }

    /**
     * FACTOR 4: Novelty (from RMA if available)
     * @private
     */
    async _factorNovelty(missionRequest) {
        if (this.rma) {
            try {
                const riskAssessment = await this.rma.assessRisk(missionRequest);
                return {
                    value: riskAssessment.noveltyFactor || 50,
                    score: riskAssessment.noveltyFactor || 50,
                    confidence: 0.7
                };
            } catch (error) {
                // RMA failed, use heuristic
            }
        }

        // Heuristic novelty assessment
        const noveltyKeywords = ['new', 'first time', 'never', 'implement', 'create', 'build', 'unfamiliar'];
        const noveltyMatches = noveltyKeywords.filter(kw =>
            new RegExp(`\\b${kw}\\b`, 'gi').test(missionRequest)
        ).length;

        const noveltyScore = Math.min(100, noveltyMatches * 25 + 30);

        return { value: noveltyScore, score: noveltyScore, confidence: 0.6 };
    }

    /**
     * FACTOR 5: Uniqueness (from KGS if available)
     * @private
     */
    async _factorUniqueness(missionRequest) {
        if (this.kgs) {
            try {
                const analogies = await this.kgs.findAnalogousProblems(missionRequest, 5);
                if (analogies.length === 0) {
                    return { value: 100, score: 100, confidence: 0.8 };
                }
                const topSimilarity = analogies[0].similarity || 0;
                const uniquenessScore = Math.round(100 - topSimilarity);
                return { value: uniquenessScore, score: uniquenessScore, confidence: 0.8 };
            } catch (error) {
                // KGS failed, use heuristic
            }
        }

        // Heuristic uniqueness (assume moderate uniqueness)
        return { value: 60, score: 60, confidence: 0.5 };
    }

    /**
     * FACTOR 6: Keywords analysis
     * @private
     */
    _factorKeywords(missionRequest) {
        const keywordScores = {
            critical: {
                keywords: ['migrate', 'architecture', 'redesign', 'rebuild', 'authentication', 'authorization', 'payment', 'security', 'schema', 'breaking change', 'major refactor', 'complete rewrite', 'new framework'],
                weight: 100
            },
            major: {
                keywords: ['implement', 'create', 'add feature', 'new system', 'optimization', 'performance', 'real-time', 'caching', 'dashboard', 'module', 'significant', 'enhancement', 'major', 'complex'],
                weight: 75
            },
            moderate: {
                keywords: ['enhance', 'improve', 'refactor', 'fix bug', 'add endpoint', 'update', 'modify', 'extend', 'component', 'feature'],
                weight: 50
            },
            minor: {
                keywords: ['tweak', 'adjust', 'small fix', 'minor', 'ui fix', 'text change', 'config', 'documentation'],
                weight: 25
            }
        };

        let maxScore = 0;
        let matchedCategory = 'minor';

        for (const [category, data] of Object.entries(keywordScores)) {
            const matches = data.keywords.filter(kw =>
                new RegExp(`\\b${kw}\\b`, 'gi').test(missionRequest)
            ).length;
            if (matches > 0 && data.weight > maxScore) {
                maxScore = data.weight;
                matchedCategory = category;
            }
        }

        return { value: matchedCategory, score: maxScore, confidence: 0.9 };
    }

    /**
     * FACTOR 7: File Impact estimation
     * @private
     */
    async _factorFileImpact(missionRequest, context) {
        // Estimate files affected based on keywords
        let estimatedFiles = 1;

        if (/system|framework|architecture|migrate/.test(missionRequest)) {
            estimatedFiles = 15;
        } else if (/module|feature|integration/.test(missionRequest)) {
            estimatedFiles = 8;
        } else if (/component|endpoint|function/.test(missionRequest)) {
            estimatedFiles = 3;
        }

        const fileImpactScore = Math.min(100, estimatedFiles * 8);

        return {
            value: estimatedFiles,
            score: fileImpactScore,
            confidence: 0.6
        };
    }

    /**
     * Calculate weighted milestone score from 7 factors
     * @private
     */
    _calculateMilestoneScore(factors) {
        const weights = {
            complexity: 0.15,
            riskScore: 0.15,
            domain: 0.15,
            novelty: 0.20,
            uniqueness: 0.15,
            keywords: 0.10,
            fileImpact: 0.10
        };

        const score = (
            factors.complexity.score * weights.complexity +
            factors.riskScore.score * weights.riskScore +
            factors.domain.score * weights.domain +
            factors.novelty.score * weights.novelty +
            factors.uniqueness.score * weights.uniqueness +
            factors.keywords.score * weights.keywords +
            factors.fileImpact.score * weights.fileImpact
        );

        return score;
    }

    /**
     * Classify milestone based on score
     * @private
     */
    _classifyMilestone(score) {
        if (score >= 80) return 'CRITICAL';
        if (score >= 60) return 'MAJOR';
        if (score >= 40) return 'MODERATE';
        if (score >= 20) return 'MINOR';
        return 'TRIVIAL';
    }

    /**
     * Generate human-readable reasoning
     * @private
     */
    _generateReasoning(factors, score, classification) {
        const reasons = [];

        if (factors.complexity.score >= 75) {
            reasons.push(`High complexity (${factors.complexity.value})`);
        }
        if (factors.riskScore.score >= 70) {
            reasons.push(`High risk (${Math.round(factors.riskScore.value)}/100)`);
        }
        if (factors.domain.score >= 80) {
            reasons.push(`Critical domain (${factors.domain.value})`);
        }
        if (factors.novelty.score >= 70) {
            reasons.push(`High novelty (new implementation)`);
        }
        if (factors.uniqueness.score >= 80) {
            reasons.push(`Unique problem (no similar missions)`);
        }
        if (factors.keywords.score >= 75) {
            reasons.push(`Critical keywords detected (${factors.keywords.value})`);
        }
        if (factors.fileImpact.score >= 60) {
            reasons.push(`Significant file impact (~${factors.fileImpact.value} files)`);
        }

        if (reasons.length === 0) {
            reasons.push('Routine operation with low impact');
        }

        return reasons.join(', ');
    }

    /**
     * Assess feasibility (CONCLUSION, not scoring factor)
     * @private
     */
    async _assessFeasibility(missionRequest, factors) {
        // Clarity assessment
        const wordCount = missionRequest.split(/\s+/).length;
        const hasDetails = wordCount > 10;
        const hasContext = /\b(with|using|via|through|by)\b/gi.test(missionRequest);

        let clarityScore = 50;
        if (hasDetails && hasContext) clarityScore = 85;
        else if (hasDetails) clarityScore = 70;
        else if (hasContext) clarityScore = 60;

        // Approach risk (derived from complexity and risk factors)
        const approachRisk = factors.complexity.score > 75 || factors.riskScore.score > 70 ? 'HIGH' :
                            factors.complexity.score > 50 || factors.riskScore.score > 50 ? 'MODERATE' : 'LOW';

        // Overall feasibility (inverse of complexity/risk)
        const feasibilityScore = Math.round(
            100 - ((factors.complexity.score * 0.4 + factors.riskScore.score * 0.4 + (100 - clarityScore) * 0.2))
        );

        return {
            score: Math.max(0, Math.min(100, feasibilityScore)),
            clarityScore: clarityScore,
            approachRisk: approachRisk,
            assessment: feasibilityScore >= 70 ? 'HIGH' : feasibilityScore >= 50 ? 'MODERATE' : 'LOW'
        };
    }

    /**
     * Assess uncertainty (CONCLUSION, not scoring factor)
     * @private
     */
    _assessUncertainty(factors, feasibility) {
        // Average confidence from all factors
        const avgConfidence = (
            factors.complexity.confidence +
            factors.riskScore.confidence +
            factors.domain.confidence +
            factors.novelty.confidence +
            factors.uniqueness.confidence +
            factors.keywords.confidence +
            factors.fileImpact.confidence
        ) / 7;

        // Uncertainty is inverse of confidence and feasibility
        const uncertaintyScore = Math.round(
            100 - (avgConfidence * 50 + (feasibility.score * 0.5))
        );

        return {
            score: Math.max(0, Math.min(100, uncertaintyScore)),
            avgConfidence: Math.round(avgConfidence * 100),
            assessment: uncertaintyScore >= 70 ? 'HIGH' : uncertaintyScore >= 40 ? 'MODERATE' : 'LOW'
        };
    }

    /**
     * Determine restore point strategy based on classification
     * @private
     */
    _determineRestoreStrategy(classification) {
        const strategies = {
            'CRITICAL': {
                preMission: true,
                postMission: true,
                backupType: 'FULL',
                backups: 2, // before + after
                description: 'Full backup before and after mission'
            },
            'MAJOR': {
                preMission: true,
                postMission: true,
                backupType: 'FULL',
                backups: 2,
                description: 'Full backup before and after mission'
            },
            'MODERATE': {
                preMission: false,
                postMission: true,
                backupType: 'INCREMENTAL',
                backups: 1,
                description: 'Incremental backup after mission'
            },
            'MINOR': {
                preMission: false,
                postMission: false,
                backupType: 'NONE',
                backups: 0,
                description: 'No dedicated backup (wave-based coverage)'
            },
            'TRIVIAL': {
                preMission: false,
                postMission: false,
                backupType: 'NONE',
                backups: 0,
                description: 'No dedicated backup (wave-based coverage)'
            }
        };

        return strategies[classification] || strategies['MODERATE'];
    }

    /**
     * Fallback assessment if analysis fails
     * @private
     */
    _getFallbackAssessment(missionRequest) {
        return {
            milestoneScore: 50,
            classification: 'MODERATE',
            factors: {
                complexity: { value: 'moderate', score: 50, confidence: 0.5 },
                riskScore: { value: 50, score: 50, confidence: 0.5 },
                domain: { value: 'general', score: 50, confidence: 0.5 },
                novelty: { value: 50, score: 50, confidence: 0.5 },
                uniqueness: { value: 60, score: 60, confidence: 0.5 },
                keywords: { value: 'moderate', score: 50, confidence: 0.5 },
                fileImpact: { value: 3, score: 40, confidence: 0.5 }
            },
            reasoning: 'Fallback assessment (analysis failed)',
            feasibility: { score: 60, clarityScore: 60, approachRisk: 'MODERATE', assessment: 'MODERATE' },
            uncertainty: { score: 50, avgConfidence: 50, assessment: 'MODERATE' },
            restorePointStrategy: {
                preMission: false,
                postMission: true,
                backupType: 'INCREMENTAL',
                backups: 1,
                description: 'Incremental backup after mission (fallback)'
            },
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { MilestoneIntelligenceSystem };

console.log('🎖️ ESMC 3.4 - Milestone Intelligence System loaded');