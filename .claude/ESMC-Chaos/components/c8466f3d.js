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
/** ESMC 3.9 PROACTIVE PATTERN SUGGESTER | 2025-10-13 | v3.9.0 | PROD | TIER 2
 *  Purpose: ATLAS user-friendly pattern suggestions with A/B/C option generation
 *  Features: Pattern presentation | A/B/C options | Reasoning explanation | User confirmation | Proactive intelligence
 *  ✅ Handles no-pattern-found scenarios
 */

class ProactivePatternSuggester {
    constructor(options = {}) {
        this.version = "3.9.0";
        this.requireConfirmation = options.requireConfirmation !== false;
        this.maxSuggestionsPerType = options.maxSuggestionsPerType || 3;

        console.log(`💡 Proactive Pattern Suggester ${this.version} initialized`);
    }

    /**
     * Generate pattern suggestions for user
     * @param {Object} viabilityAnalysis - Results from PatternViabilityAnalyzer
     * @param {string} userRequest - Original user request
     * @returns {Object} Formatted suggestions with options
     */
    generateSuggestions(viabilityAnalysis, userRequest) {
        console.log(`\n💡 ATLAS: Generating proactive suggestions...`);

        const viable = viabilityAnalysis.viablePatterns || [];
        const best = viabilityAnalysis.bestPattern;

        // No patterns found
        if (viable.length === 0) {
            return this._generateNoPatternSuggestion(userRequest);
        }

        // Patterns found - generate options
        return this._generatePatternOptions(viable, best, userRequest);
    }

    /**
     * Generate suggestion when no patterns found
     * @private
     */
    _generateNoPatternSuggestion(userRequest) {
        return {
            patternsFound: false,
            suggestion: {
                type: 'scratch',
                confidence: 1.0,
                title: 'No existing patterns found',
                message: `I searched your project files and backup folders but found no existing implementations matching "${userRequest}".`,
                recommendation: 'Create new implementation from scratch',
                options: [
                    {
                        id: 'A',
                        action: 'scratch',
                        label: 'Create from scratch',
                        description: 'Implement new solution based on best practices',
                        confidence: 'HIGH',
                        recommended: true
                    }
                ]
            },
            requiresConfirmation: false, // Can proceed directly
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate pattern options when patterns found
     * @private
     */
    _generatePatternOptions(viablePatterns, bestPattern, userRequest) {
        const options = [];

        // Option A: Reuse best pattern
        if (bestPattern && bestPattern.viabilityScore >= 0.70) {
            options.push(this._createReuseOption(bestPattern));
        }

        // Option B: Create from scratch (always available)
        options.push(this._createScratchOption());

        // Option C: Hybrid approach (if viable pattern exists)
        if (bestPattern && bestPattern.viabilityScore >= 0.50) {
            options.push(this._createHybridOption(bestPattern));
        }

        // Build suggestion message
        const message = this._buildSuggestionMessage(viablePatterns, bestPattern);

        return {
            patternsFound: true,
            totalPatternsFound: viablePatterns.length,
            bestPattern: bestPattern,
            suggestion: {
                type: 'choice',
                title: `Found ${viablePatterns.length} existing pattern(s)`,
                message,
                recommendation: bestPattern ? this._getRecommendation(bestPattern) : 'Create from scratch',
                options
            },
            patternDetails: this._formatPatternDetails(viablePatterns),
            requiresConfirmation: this.requireConfirmation,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create "Reuse" option
     * @private
     */
    _createReuseOption(pattern) {
        const location = pattern.source === 'current'
            ? pattern.filePath
            : pattern.folderName;

        const age = pattern.ageInDays;
        const ageText = age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`;

        return {
            id: 'A',
            action: 'reuse',
            label: 'Reuse existing pattern',
            description: `Use proven implementation from ${location} (${ageText})`,
            confidence: pattern.recommendation.confidence,
            details: {
                location,
                source: pattern.source,
                age: pattern.ageInDays,
                viabilityScore: pattern.viabilityScore,
                status: pattern.hasSubsequentFix ? '⚠️ Had fixes' : '✅ Stable',
                reasons: pattern.viabilityReasons
            },
            recommended: pattern.viabilityScore >= 0.85,
            pattern
        };
    }

    /**
     * Create "From Scratch" option
     * @private
     */
    _createScratchOption() {
        return {
            id: 'B',
            action: 'scratch',
            label: 'Create from scratch',
            description: 'Implement new solution based on current best practices',
            confidence: 'MODERATE',
            details: {
                benefits: [
                    'Fresh implementation tailored to current needs',
                    'No technical debt from old code',
                    'Opportunity to use latest patterns'
                ]
            },
            recommended: false
        };
    }

    /**
     * Create "Hybrid" option
     * @private
     */
    _createHybridOption(pattern) {
        const location = pattern.source === 'current'
            ? pattern.filePath
            : pattern.folderName;

        return {
            id: 'C',
            action: 'hybrid',
            label: 'Hybrid approach',
            description: `Use ${location} as template, customize for new requirements`,
            confidence: 'MODERATE',
            details: {
                template: location,
                approach: 'Reference existing pattern structure, adapt as needed',
                benefits: [
                    'Faster than from scratch',
                    'Customized to current needs',
                    'Learn from existing implementation'
                ]
            },
            recommended: pattern.viabilityScore >= 0.70 && pattern.viabilityScore < 0.85,
            pattern
        };
    }

    /**
     * Build suggestion message
     * @private
     */
    _buildSuggestionMessage(patterns, best) {
        if (!best) {
            return `I found ${patterns.length} pattern(s) but none are highly viable. Consider creating from scratch.`;
        }

        const location = best.source === 'current'
            ? `current project file: ${best.filePath}`
            : `backup folder: ${best.folderName}`;

        const status = best.hasSubsequentFix
            ? '(had subsequent fixes)'
            : '(stable, no fixes needed)';

        const age = best.ageInDays === 0 ? 'today' : best.ageInDays === 1 ? 'yesterday' : `${best.ageInDays} days ago`;

        return `I found ${patterns.length} existing implementation(s). The best match is in ${location}, last modified ${age} ${status}. Viability score: ${(best.viabilityScore * 100).toFixed(0)}%.`;
    }

    /**
     * Get recommendation text
     * @private
     */
    _getRecommendation(pattern) {
        if (pattern.viabilityScore >= 0.85) {
            return `Highly recommend reusing existing pattern (${(pattern.viabilityScore * 100).toFixed(0)}% viable)`;
        } else if (pattern.viabilityScore >= 0.70) {
            return `Recommend reusing pattern with caution (${(pattern.viabilityScore * 100).toFixed(0)}% viable)`;
        } else if (pattern.viabilityScore >= 0.50) {
            return `Consider hybrid approach - use as template (${(pattern.viabilityScore * 100).toFixed(0)}% viable)`;
        } else {
            return `Better to create from scratch (pattern only ${(pattern.viabilityScore * 100).toFixed(0)}% viable)`;
        }
    }

    /**
     * Format pattern details for display
     * @private
     */
    _formatPatternDetails(patterns) {
        return patterns.slice(0, this.maxSuggestionsPerType * 2).map((pattern, index) => {
            const location = pattern.source === 'current'
                ? pattern.filePath
                : pattern.folderName;

            return {
                rank: index + 1,
                location,
                source: pattern.source,
                viabilityScore: pattern.viabilityScore,
                age: `${pattern.ageInDays} days`,
                status: pattern.hasSubsequentFix ? '⚠️ Had fixes' : '✅ Stable',
                recommendation: pattern.recommendation.action,
                confidence: pattern.recommendation.confidence
            };
        });
    }

    /**
     * Format suggestion for display to user
     */
    formatForDisplay(suggestion) {
        if (!suggestion.patternsFound) {
            return {
                title: suggestion.suggestion.title,
                message: suggestion.suggestion.message,
                options: suggestion.suggestion.options,
                requiresConfirmation: suggestion.requiresConfirmation
            };
        }

        const lines = [
            `\n🔍 ATLAS PATTERN RECOGNITION\n`,
            `${'='.repeat(80)}`,
            ``,
            `${suggestion.suggestion.title}`,
            ``,
            suggestion.suggestion.message,
            ``,
            `📊 Recommendation: ${suggestion.suggestion.recommendation}`,
            ``,
            `**Options:**\n`
        ];

        suggestion.suggestion.options.forEach(option => {
            const recommended = option.recommended ? ' (RECOMMENDED)' : '';
            lines.push(`**${option.id}) ${option.label}${recommended}**`);
            lines.push(`   ${option.description}`);
            lines.push(`   Confidence: ${option.confidence}`);

            if (option.details?.reasons) {
                lines.push(`   Reasons:`);
                option.details.reasons.forEach(r => lines.push(`      - ${r}`));
            }
            lines.push(``);
        });

        if (suggestion.patternDetails && suggestion.patternDetails.length > 0) {
            lines.push(`\n📁 Pattern Details:\n`);
            suggestion.patternDetails.forEach(detail => {
                lines.push(`${detail.rank}. ${detail.location}`);
                lines.push(`   Score: ${(detail.viabilityScore * 100).toFixed(0)}% | Age: ${detail.age} | Status: ${detail.status}`);
            });
        }

        lines.push(`\n${'='.repeat(80)}`);
        lines.push(``);

        if (suggestion.requiresConfirmation) {
            lines.push(`⚠️  **User confirmation required before proceeding**`);
            lines.push(``);
        }

        return {
            formatted: lines.join('\n'),
            options: suggestion.suggestion.options,
            requiresConfirmation: suggestion.requiresConfirmation
        };
    }

    /**
     * Get suggester status
     */
    getStatus() {
        return {
            version: this.version,
            requireConfirmation: this.requireConfirmation,
            maxSuggestionsPerType: this.maxSuggestionsPerType,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { ProactivePatternSuggester };

// Example usage
if (require.main === module) {
    console.log("💡 ESMC 3.9 - Proactive Pattern Suggester Test");

    const suggester = new ProactivePatternSuggester();

    // Test with sample viability analysis
    const testAnalysis = {
        bestPattern: {
            source: 'backup',
            folderName: '20251006 1430 Backup OAuth2 Implementation',
            viabilityScore: 0.92,
            ageInDays: 7,
            hasSubsequentFix: false,
            viabilityReasons: [
                '✅ No subsequent fixes needed',
                'Recent backup (7 days ago)',
                '3 keyword match(es)',
                'Backup type: COMPONENT'
            ],
            recommendation: {
                action: 'REUSE',
                confidence: 'HIGH'
            }
        },
        viablePatterns: [
            {
                source: 'backup',
                folderName: '20251006 1430 Backup OAuth2 Implementation',
                viabilityScore: 0.92,
                ageInDays: 7,
                hasSubsequentFix: false,
                recommendation: { action: 'REUSE', confidence: 'HIGH' }
            },
            {
                source: 'current',
                filePath: 'src/auth/oauth2.js',
                viabilityScore: 0.85,
                ageInDays: 7,
                recommendation: { action: 'REUSE', confidence: 'HIGH' }
            }
        ]
    };

    const suggestions = suggester.generateSuggestions(testAnalysis, 'Implement OAuth2 authentication');
    const display = suggester.formatForDisplay(suggestions);

    console.log(display.formatted);
    console.log("\n✅ Pattern suggester test completed");
}
