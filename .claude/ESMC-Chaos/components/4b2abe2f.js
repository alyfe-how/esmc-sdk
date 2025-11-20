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
/** ESMC 3.9 PATTERN VIABILITY ANALYZER | 2025-10-13 | v3.9.0 | PROD | TIER 2
 *  Purpose: ATLAS pattern stability analysis with viability scoring
 *  Features: Viability scoring (0-1) | Stability detection | Fix attempt analysis | Age consideration | Freshness tracking
 *  ✅ Generates viability reasoning
 */

class PatternViabilityAnalyzer {
    constructor(options = {}) {
        this.version = "3.9.0";

        // Viability scoring weights
        this.weights = {
            noSubsequentFixes: 0.40,    // 40% - No fixes needed after
            recency: 0.25,               // 25% - Recent patterns preferred
            matchQuality: 0.20,          // 20% - How well keywords match
            backupType: 0.15             // 15% - Component > Full > Fix
        };

        // Age preferences (days)
        this.ageBounds = {
            optimal: 14,      // < 2 weeks = optimal
            acceptable: 30,   // < 1 month = acceptable
            stale: 90         // > 3 months = stale
        };

        console.log(`📊 Pattern Viability Analyzer ${this.version} initialized`);
    }

    /**
     * Analyze viability of all found patterns
     * @param {Object} scanResults - Results from CodebasePatternScanner
     * @returns {Object} Viability analysis with rankings
     */
    analyzePatterns(scanResults) {
        console.log(`\n📊 ATLAS: Analyzing pattern viability...`);

        const analyzed = {
            current: this._analyzeCurrentImplementations(scanResults.currentImplementations),
            backups: this._analyzeBackupImplementations(scanResults.backupImplementations),
            timestamp: new Date().toISOString()
        };

        // Combine and rank all patterns
        const allPatterns = [
            ...analyzed.current.map(p => ({ ...p, source: 'current' })),
            ...analyzed.backups.map(p => ({ ...p, source: 'backup' }))
        ];

        // Sort by viability (highest first)
        allPatterns.sort((a, b) => b.viabilityScore - a.viabilityScore);

        const result = {
            ...analyzed,
            ranked: allPatterns,
            bestPattern: allPatterns[0] || null,
            viablePatterns: allPatterns.filter(p => p.viabilityScore >= 0.7),
            totalAnalyzed: allPatterns.length
        };

        console.log(`✅ ATLAS: Analysis complete`);
        console.log(`   Total patterns analyzed: ${result.totalAnalyzed}`);
        console.log(`   Viable patterns (≥70%): ${result.viablePatterns.length}`);
        if (result.bestPattern) {
            console.log(`   Best pattern: ${result.bestPattern.viabilityScore.toFixed(2)} score`);
        }

        return result;
    }

    /**
     * Analyze current implementation patterns
     * @private
     */
    _analyzeCurrentImplementations(implementations) {
        return implementations.map(impl => {
            const viability = this._calculateCurrentViability(impl);

            return {
                ...impl,
                viabilityScore: viability.score,
                viabilityReasons: viability.reasons,
                recommendation: viability.recommendation,
                analyzed: true
            };
        });
    }

    /**
     * Analyze backup implementation patterns
     * @private
     */
    _analyzeBackupImplementations(backups) {
        return backups.map(backup => {
            const viability = this._calculateBackupViability(backup);

            return {
                ...backup,
                viabilityScore: viability.score,
                viabilityReasons: viability.reasons,
                recommendation: viability.recommendation,
                analyzed: true
            };
        });
    }

    /**
     * Calculate viability for current implementation
     * @private
     */
    _calculateCurrentViability(impl) {
        let score = 0;
        const reasons = [];

        // 1. No subsequent fixes (40% weight) - Assumed true for current files
        score += this.weights.noSubsequentFixes;
        reasons.push("Currently active in project");

        // 2. Recency (25% weight)
        const ageScore = this._calculateAgeScore(impl.ageInDays);
        score += ageScore * this.weights.recency;

        if (impl.ageInDays <= this.ageBounds.optimal) {
            reasons.push(`Recent (${impl.ageInDays} days old)`);
        } else if (impl.ageInDays <= this.ageBounds.acceptable) {
            reasons.push(`Moderately recent (${impl.ageInDays} days old)`);
        } else {
            reasons.push(`Older code (${impl.ageInDays} days old)`);
        }

        // 3. Match quality (20% weight)
        const matchScore = this._calculateMatchScore(impl.matches);
        score += matchScore * this.weights.matchQuality;
        reasons.push(`${impl.matches.length} keyword match(es)`);

        // 4. Backup type (15% weight) - N/A for current, give partial credit
        score += this.weights.backupType * 0.8;

        const recommendation = this._generateRecommendation(score, 'current');

        return {
            score: Math.min(1.0, score),
            reasons,
            recommendation
        };
    }

    /**
     * Calculate viability for backup implementation
     * @private
     */
    _calculateBackupViability(backup) {
        let score = 0;
        const reasons = [];

        // 1. No subsequent fixes (40% weight)
        if (!backup.hasSubsequentFix) {
            score += this.weights.noSubsequentFixes;
            reasons.push("✅ No subsequent fixes needed");
        } else {
            reasons.push("⚠️ Had subsequent fixes");
        }

        // 2. Recency (25% weight)
        const ageScore = this._calculateAgeScore(backup.ageInDays);
        score += ageScore * this.weights.recency;

        if (backup.ageInDays <= this.ageBounds.optimal) {
            reasons.push(`Recent backup (${backup.ageInDays} days ago)`);
        } else if (backup.ageInDays <= this.ageBounds.acceptable) {
            reasons.push(`Moderate age (${backup.ageInDays} days ago)`);
        } else if (backup.ageInDays <= this.ageBounds.stale) {
            reasons.push(`Older backup (${backup.ageInDays} days ago)`);
        } else {
            reasons.push(`Stale backup (${backup.ageInDays} days ago)`);
        }

        // 3. Match quality (20% weight)
        const matchScore = backup.matchedTerms.length / 3; // Normalize to 0-1
        score += Math.min(1.0, matchScore) * this.weights.matchQuality;
        reasons.push(`${backup.matchedTerms.length} keyword match(es)`);

        // 4. Backup type (15% weight)
        const typeScore = this._calculateBackupTypeScore(backup.backupType);
        score += typeScore * this.weights.backupType;
        reasons.push(`Backup type: ${backup.backupType}`);

        const recommendation = this._generateRecommendation(score, 'backup');

        return {
            score: Math.min(1.0, score),
            reasons,
            recommendation
        };
    }

    /**
     * Calculate age score (1.0 = newest, 0.0 = oldest)
     * @private
     */
    _calculateAgeScore(ageInDays) {
        if (ageInDays <= this.ageBounds.optimal) {
            return 1.0; // Optimal freshness
        } else if (ageInDays <= this.ageBounds.acceptable) {
            // Linear decay from optimal to acceptable
            const range = this.ageBounds.acceptable - this.ageBounds.optimal;
            const position = ageInDays - this.ageBounds.optimal;
            return 1.0 - (position / range) * 0.3; // 0.7-1.0
        } else if (ageInDays <= this.ageBounds.stale) {
            // Linear decay from acceptable to stale
            const range = this.ageBounds.stale - this.ageBounds.acceptable;
            const position = ageInDays - this.ageBounds.acceptable;
            return 0.7 - (position / range) * 0.5; // 0.2-0.7
        } else {
            // Very old, minimal score
            return 0.2;
        }
    }

    /**
     * Calculate match quality score
     * @private
     */
    _calculateMatchScore(matches) {
        if (!matches || matches.length === 0) return 0;

        // Average relevance across all matches
        const avgRelevance = matches.reduce((sum, m) => sum + (m.relevance || 0), 0) / matches.length;

        // Bonus for multiple matches
        const matchBonus = Math.min(matches.length / 5, 0.3);

        return Math.min(1.0, avgRelevance + matchBonus);
    }

    /**
     * Calculate backup type score
     * @private
     */
    _calculateBackupTypeScore(backupType) {
        const typeScores = {
            'COMPONENT': 1.0,    // Best - specific component backup
            'FULL': 0.6,         // Moderate - full backup
            'FIX': 0.3,          // Lower - was a fix attempt
            'PLATFORM': 0.8,     // Good - platform backup
            'UNKNOWN': 0.5       // Neutral
        };

        return typeScores[backupType] || 0.5;
    }

    /**
     * Generate recommendation based on viability score
     * @private
     */
    _generateRecommendation(score, source) {
        if (score >= 0.85) {
            return {
                action: 'REUSE',
                confidence: 'HIGH',
                reason: `Highly viable pattern (${(score * 100).toFixed(0)}% score) - Recommended for reuse`
            };
        } else if (score >= 0.70) {
            return {
                action: 'REUSE',
                confidence: 'MODERATE',
                reason: `Viable pattern (${(score * 100).toFixed(0)}% score) - Safe to reuse with caution`
            };
        } else if (score >= 0.50) {
            return {
                action: 'HYBRID',
                confidence: 'LOW',
                reason: `Moderate viability (${(score * 100).toFixed(0)}% score) - Use as template, customize`
            };
        } else {
            return {
                action: 'SCRATCH',
                confidence: 'LOW',
                reason: `Low viability (${(score * 100).toFixed(0)}% score) - Better to implement from scratch`
            };
        }
    }

    /**
     * Compare two patterns and determine which is better
     */
    comparePatterns(pattern1, pattern2) {
        if (pattern1.viabilityScore > pattern2.viabilityScore) {
            return {
                better: pattern1,
                worse: pattern2,
                difference: pattern1.viabilityScore - pattern2.viabilityScore,
                recommendation: `Use ${pattern1.source} implementation (${((pattern1.viabilityScore - pattern2.viabilityScore) * 100).toFixed(0)}% higher score)`
            };
        } else {
            return {
                better: pattern2,
                worse: pattern1,
                difference: pattern2.viabilityScore - pattern1.viabilityScore,
                recommendation: `Use ${pattern2.source} implementation (${((pattern2.viabilityScore - pattern1.viabilityScore) * 100).toFixed(0)}% higher score)`
            };
        }
    }

    /**
     * Get analyzer status
     */
    getStatus() {
        return {
            version: this.version,
            weights: this.weights,
            ageBounds: this.ageBounds,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { PatternViabilityAnalyzer };

// Example usage
if (require.main === module) {
    console.log("📊 ESMC 3.9 - Pattern Viability Analyzer Test");

    const analyzer = new PatternViabilityAnalyzer();

    // Test with sample patterns
    const testPatterns = {
        currentImplementations: [
            {
                filePath: 'src/auth/oauth2.js',
                matches: [
                    { term: 'oauth2', occurrences: 15, relevance: 0.8 },
                    { term: 'authentication', occurrences: 8, relevance: 0.6 }
                ],
                ageInDays: 7
            }
        ],
        backupImplementations: [
            {
                folderName: '20251006 1430 Backup OAuth2 Implementation',
                backupType: 'COMPONENT',
                matchedTerms: ['oauth2', 'authentication'],
                ageInDays: 7,
                hasSubsequentFix: false
            },
            {
                folderName: '20250928 0930 Backup Authentication System',
                backupType: 'COMPONENT',
                matchedTerms: ['authentication'],
                ageInDays: 15,
                hasSubsequentFix: true
            }
        ]
    };

    const analysis = analyzer.analyzePatterns(testPatterns);

    console.log("\n📊 VIABILITY ANALYSIS RESULTS:");
    console.log(`   Total analyzed: ${analysis.totalAnalyzed}`);
    console.log(`   Viable patterns: ${analysis.viablePatterns.length}`);

    if (analysis.bestPattern) {
        console.log(`\n🏆 BEST PATTERN:`);
        console.log(`   Source: ${analysis.bestPattern.source}`);
        console.log(`   Score: ${(analysis.bestPattern.viabilityScore * 100).toFixed(0)}%`);
        console.log(`   Recommendation: ${analysis.bestPattern.recommendation.action}`);
        console.log(`   Reasons:`);
        analysis.bestPattern.viabilityReasons.forEach(r => console.log(`      - ${r}`));
    }

    console.log("\n✅ Pattern viability analyzer test completed");
}
