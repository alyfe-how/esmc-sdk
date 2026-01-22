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
/** ESMC 3.10 LIA | 2025-10-14 | v3.10.0 | PROD | ALL_TIERS
 *  Purpose: Linguistic Intelligence Analyzer - typing patterns, word choice, message structure for CUP
 *  Features: Communication style analysis | Typo patterns | Privacy-first (local) | Feeds MBTI + profile synthesis
 *  Author: COLONEL BETA
 */

const fs = require('fs').promises;
const path = require('path');

class LinguisticAnalyzer {
    constructor(config = {}) {
        this.config = {
            minMessageLength: config.minMessageLength || 10,
            typoThreshold: config.typoThreshold || 0.02, // 2% typo rate = notable
            debugMode: config.debugMode || false
        };

        // Common typo patterns (for pattern recognition, not correction)
        this.commonTypos = {
            'actualyl': 'actually',
            'everytime': 'every time',
            'alot': 'a lot',
            'teh': 'the',
            'recieve': 'receive',
            'seperate': 'separate',
            'occured': 'occurred',
            'untill': 'until',
            'occassion': 'occasion'
        };

        // Word choice indicators
        this.wordChoiceCategories = {
            technical: ['implementation', 'framework', 'architecture', 'algorithm', 'optimization', 'deployment', 'infrastructure'],
            analytical: ['analyze', 'evaluate', 'assess', 'determine', 'investigate', 'examine', 'compare'],
            directive: ['implement', 'fix', 'create', 'build', 'deploy', 'execute', 'proceed', 'continue'],
            collaborative: ['we', 'us', 'together', 'team', 'our', 'let\'s', 'shall we'],
            individual: ['I', 'me', 'my', 'mine', 'myself', 'personally'],
            certainty: ['definitely', 'absolutely', 'certainly', 'clearly', 'obviously', 'undoubtedly'],
            uncertainty: ['maybe', 'perhaps', 'possibly', 'might', 'could be', 'I think', 'I believe'],
            emphatic: ['very', 'really', 'extremely', 'absolutely', 'totally', 'completely'],
            hedging: ['kind of', 'sort of', 'somewhat', 'relatively', 'fairly', 'rather']
        };

        // Punctuation style indicators
        this.punctuationPatterns = {
            exclamation: /!/g,
            question: /\?/g,
            ellipsis: /\.{2,}|…/g,
            emphasis: /[!]{2,}/g,
            multiQuestion: /\?{2,}/g,
            emoticons: /[\u{1F300}-\u{1F9FF}]/gu // Emoji unicode range (all emoji blocks)
        };
    }

    /**
     * Analyze a single message for linguistic patterns
     * @param {string} message - User message text
     * @returns {Object} - Linguistic analysis results
     */
    analyzeMessage(message) {
        if (!message || message.length < this.config.minMessageLength) {
            return this._createEmptyAnalysis();
        }

        const analysis = {
            messageLength: message.length,
            wordCount: this._countWords(message),
            sentenceCount: this._countSentences(message),
            typos: this._detectTypos(message),
            wordChoice: this._analyzeWordChoice(message),
            punctuationStyle: this._analyzePunctuation(message),
            messageStructure: this._analyzeStructure(message),
            communicationStyle: this._inferCommunicationStyle(message),
            timestamp: new Date().toISOString()
        };

        // Calculate derived metrics
        analysis.averageWordLength = this._calculateAverageWordLength(message);
        analysis.averageSentenceLength = analysis.wordCount / Math.max(analysis.sentenceCount, 1);
        analysis.typoRate = analysis.typos.count / Math.max(analysis.wordCount, 1);
        analysis.complexity = this._calculateComplexity(analysis);

        return analysis;
    }

    /**
     * Update cumulative linguistic profile with new message analysis
     * @param {Object} currentProfile - Current linguistic profile
     * @param {Object} newAnalysis - New message analysis
     * @param {number} messageCount - Total messages analyzed
     * @returns {Object} - Updated linguistic profile
     */
    updateProfile(currentProfile, newAnalysis, messageCount) {
        const profile = currentProfile || this._createEmptyProfile();
        const weight = 1.0 / messageCount; // Weight decreases as more messages analyzed

        // Update averages with exponential moving average
        profile.averageMessageLength = this._updateAverage(profile.averageMessageLength, newAnalysis.messageLength, weight);
        profile.averageWordCount = this._updateAverage(profile.averageWordCount, newAnalysis.wordCount, weight);
        profile.averageSentenceLength = this._updateAverage(profile.averageSentenceLength, newAnalysis.averageSentenceLength, weight);
        profile.averageWordLength = this._updateAverage(profile.averageWordLength, newAnalysis.averageWordLength, weight);

        // Accumulate typo patterns
        if (newAnalysis.typos && newAnalysis.typos.detected.length > 0) {
            profile.typoPatterns = profile.typoPatterns || {};
            newAnalysis.typos.detected.forEach(typo => {
                profile.typoPatterns[typo] = (profile.typoPatterns[typo] || 0) + 1;
            });
        }

        // Update word choice frequencies
        profile.wordChoiceProfile = this._updateWordChoiceProfile(profile.wordChoiceProfile, newAnalysis.wordChoice);

        // Update punctuation style
        profile.punctuationProfile = this._updatePunctuationProfile(profile.punctuationProfile, newAnalysis.punctuationStyle);

        // Update communication style confidence
        profile.communicationStyle = this._updateCommunicationStyle(profile.communicationStyle, newAnalysis.communicationStyle, weight);

        // Update complexity trend
        profile.complexityTrend = this._updateComplexityTrend(profile.complexityTrend, newAnalysis.complexity);

        // Metadata
        profile.totalMessagesAnalyzed = messageCount;
        profile.lastAnalyzed = new Date().toISOString();
        profile.overallTypoRate = this._calculateOverallTypoRate(profile);

        return profile;
    }

    /**
     * Generate linguistic insights from profile
     * @param {Object} profile - Linguistic profile
     * @returns {Object} - Actionable insights
     */
    generateInsights(profile) {
        if (!profile || !profile.totalMessagesAnalyzed) {
            return { ready: false, reason: 'Insufficient data' };
        }

        const insights = {
            ready: true,
            confidence: this._calculateInsightConfidence(profile),
            typingStyle: this._inferTypingStyle(profile),
            communicationPreferences: this._inferCommunicationPreferences(profile),
            expressionPatterns: this._inferExpressionPatterns(profile),
            recommendedAdaptations: this._generateAdaptations(profile)
        };

        return insights;
    }

    // ========================================
    // PRIVATE ANALYSIS METHODS
    // ========================================

    _countWords(message) {
        return message.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    _countSentences(message) {
        const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return Math.max(sentences.length, 1);
    }

    _detectTypos(message) {
        const words = message.toLowerCase().split(/\s+/);
        const detected = [];

        words.forEach(word => {
            // Remove punctuation for typo detection
            const cleanWord = word.replace(/[^\w]/g, '');
            if (this.commonTypos[cleanWord]) {
                detected.push(cleanWord);
            }
        });

        return {
            count: detected.length,
            detected: detected,
            rate: detected.length / Math.max(words.length, 1)
        };
    }

    _analyzeWordChoice(message) {
        const lowerMessage = message.toLowerCase();
        const wordChoice = {};

        Object.keys(this.wordChoiceCategories).forEach(category => {
            const keywords = this.wordChoiceCategories[category];
            const matches = keywords.filter(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );
            wordChoice[category] = {
                count: matches.length,
                matched: matches
            };
        });

        return wordChoice;
    }

    _analyzePunctuation(message) {
        const punctuation = {};

        Object.keys(this.punctuationPatterns).forEach(type => {
            const matches = message.match(this.punctuationPatterns[type]);
            punctuation[type] = matches ? matches.length : 0;
        });

        // Calculate ratios
        const totalChars = message.length;
        punctuation.exclamationRatio = punctuation.exclamation / totalChars;
        punctuation.questionRatio = punctuation.question / totalChars;

        return punctuation;
    }

    _analyzeStructure(message) {
        const lines = message.split('\n').filter(line => line.trim().length > 0);
        const hasBulletPoints = /^[\s]*[-*•]/.test(message);
        const hasNumbering = /^[\s]*\d+[.)]\s/.test(message);
        const hasCodeBlocks = message.includes('```') || message.includes('`');

        return {
            lineCount: lines.length,
            hasBulletPoints,
            hasNumbering,
            hasCodeBlocks,
            isMultiLine: lines.length > 1,
            structureType: this._inferStructureType(lines, hasBulletPoints, hasNumbering, hasCodeBlocks)
        };
    }

    _inferStructureType(lines, bullets, numbering, code) {
        if (bullets) return 'bulleted_list';
        if (numbering) return 'numbered_list';
        if (code) return 'technical_with_code';
        if (lines.length > 3) return 'multi_paragraph';
        if (lines.length === 1) return 'single_line';
        return 'conversational';
    }

    _inferCommunicationStyle(message) {
        const wordChoice = this._analyzeWordChoice(message);
        const punctuation = this._analyzePunctuation(message);
        const structure = this._analyzeStructure(message);

        const style = {
            formality: this._calculateFormality(wordChoice, punctuation),
            directness: this._calculateDirectness(wordChoice),
            emotionality: this._calculateEmotionality(punctuation),
            technicality: this._calculateTechnicality(wordChoice),
            collaboration: this._calculateCollaboration(wordChoice)
        };

        return style;
    }

    _calculateFormality(wordChoice, punctuation) {
        const formalIndicators = wordChoice.technical.count + wordChoice.analytical.count;
        const informalIndicators = punctuation.exclamation + punctuation.emoticons;
        const score = (formalIndicators - informalIndicators) / Math.max(formalIndicators + informalIndicators, 1);
        return { score, level: this._scoreToLevel(score, ['informal', 'neutral', 'formal']) };
    }

    _calculateDirectness(wordChoice) {
        const directIndicators = wordChoice.directive.count + wordChoice.certainty.count;
        const indirectIndicators = wordChoice.uncertainty.count + wordChoice.hedging.count;
        const score = (directIndicators - indirectIndicators) / Math.max(directIndicators + indirectIndicators, 1);
        return { score, level: this._scoreToLevel(score, ['indirect', 'balanced', 'direct']) };
    }

    _calculateEmotionality(punctuation) {
        const emotionalIndicators = punctuation.exclamation + punctuation.emoticons + punctuation.emphasis;
        const score = Math.min(emotionalIndicators / 10, 1.0); // Normalize to 0-1
        return { score, level: this._scoreToLevel(score, ['reserved', 'moderate', 'expressive']) };
    }

    _calculateTechnicality(wordChoice) {
        const technicalIndicators = wordChoice.technical.count;
        const score = Math.min(technicalIndicators / 5, 1.0); // Normalize to 0-1
        return { score, level: this._scoreToLevel(score, ['non_technical', 'moderate', 'highly_technical']) };
    }

    _calculateCollaboration(wordChoice) {
        const collaborativeIndicators = wordChoice.collaborative.count;
        const individualIndicators = wordChoice.individual.count;
        const score = (collaborativeIndicators - individualIndicators) / Math.max(collaborativeIndicators + individualIndicators, 1);
        return { score, level: this._scoreToLevel(score, ['individual', 'balanced', 'collaborative']) };
    }

    _scoreToLevel(score, labels) {
        if (score < -0.2) return labels[0];
        if (score > 0.2) return labels[2];
        return labels[1];
    }

    _calculateAverageWordLength(message) {
        const words = message.split(/\s+/).filter(w => w.length > 0);
        const totalLength = words.reduce((sum, word) => sum + word.length, 0);
        return totalLength / Math.max(words.length, 1);
    }

    _calculateComplexity(analysis) {
        // Complexity = f(sentence length, word length, technical terms)
        const sentenceLengthScore = Math.min(analysis.averageSentenceLength / 20, 1.0);
        const wordLengthScore = Math.min(analysis.averageWordLength / 8, 1.0);
        const technicalScore = analysis.wordChoice.technical.count / Math.max(analysis.wordCount, 1);

        const complexity = (sentenceLengthScore + wordLengthScore + technicalScore) / 3;
        return {
            score: complexity,
            level: this._scoreToLevel(complexity - 0.5, ['simple', 'moderate', 'complex'])
        };
    }

    // ========================================
    // PROFILE UPDATE METHODS
    // ========================================

    _updateAverage(currentAvg, newValue, weight) {
        return (currentAvg || 0) * (1 - weight) + newValue * weight;
    }

    _updateWordChoiceProfile(currentProfile, newWordChoice) {
        const profile = currentProfile || {};

        Object.keys(newWordChoice).forEach(category => {
            profile[category] = (profile[category] || 0) + newWordChoice[category].count;
        });

        return profile;
    }

    _updatePunctuationProfile(currentProfile, newPunctuation) {
        const profile = currentProfile || {};

        Object.keys(newPunctuation).forEach(type => {
            if (typeof newPunctuation[type] === 'number') {
                profile[type] = (profile[type] || 0) + newPunctuation[type];
            }
        });

        return profile;
    }

    _updateCommunicationStyle(currentStyle, newStyle, weight) {
        const style = currentStyle || {};

        Object.keys(newStyle).forEach(dimension => {
            if (newStyle[dimension].score !== undefined) {
                const currentScore = style[dimension]?.score || 0;
                const updatedScore = currentScore * (1 - weight) + newStyle[dimension].score * weight;
                style[dimension] = {
                    score: updatedScore,
                    level: this._scoreToLevel(updatedScore, ['low', 'moderate', 'high'])
                };
            }
        });

        return style;
    }

    _updateComplexityTrend(currentTrend, newComplexity) {
        const trend = currentTrend || [];
        trend.push(newComplexity.score);

        // Keep only last 20 complexity scores
        if (trend.length > 20) {
            trend.shift();
        }

        return trend;
    }

    _calculateOverallTypoRate(profile) {
        if (!profile.typoPatterns || Object.keys(profile.typoPatterns).length === 0) {
            return 0;
        }

        const totalTypos = Object.values(profile.typoPatterns).reduce((sum, count) => sum + count, 0);
        const totalWords = profile.averageWordCount * profile.totalMessagesAnalyzed;
        return totalTypos / Math.max(totalWords, 1);
    }

    // ========================================
    // INSIGHT GENERATION METHODS
    // ========================================

    _calculateInsightConfidence(profile) {
        const messageCount = profile.totalMessagesAnalyzed || 0;

        if (messageCount < 5) return 0.3;
        if (messageCount < 10) return 0.5;
        if (messageCount < 20) return 0.7;
        if (messageCount < 50) return 0.85;
        return 0.95;
    }

    _inferTypingStyle(profile) {
        const style = {
            accuracy: profile.overallTypoRate < this.config.typoThreshold ? 'high' : 'moderate',
            verbosity: profile.averageMessageLength > 200 ? 'verbose' : profile.averageMessageLength > 50 ? 'moderate' : 'concise',
            structure: profile.averageSentenceLength > 15 ? 'complex' : 'simple'
        };

        return style;
    }

    _inferCommunicationPreferences(profile) {
        const prefs = {};

        if (profile.communicationStyle) {
            prefs.formality = profile.communicationStyle.formality?.level || 'neutral';
            prefs.directness = profile.communicationStyle.directness?.level || 'balanced';
            prefs.technicality = profile.communicationStyle.technicality?.level || 'moderate';
        }

        return prefs;
    }

    _inferExpressionPatterns(profile) {
        const patterns = [];

        if (profile.punctuationProfile?.exclamation > 5) {
            patterns.push('uses_exclamations_frequently');
        }
        if (profile.punctuationProfile?.ellipsis > 3) {
            patterns.push('uses_ellipsis_for_emphasis');
        }
        if (profile.wordChoiceProfile?.directive > 10) {
            patterns.push('action_oriented_language');
        }
        if (profile.wordChoiceProfile?.analytical > 10) {
            patterns.push('analytical_mindset');
        }

        return patterns;
    }

    _generateAdaptations(profile) {
        const adaptations = {
            responseLength: 'moderate',
            responseStructure: 'paragraphs',
            technicalDepth: 'moderate',
            toneFormality: 'professional'
        };

        // Adapt response length to user's verbosity
        if (profile.averageMessageLength > 200) {
            adaptations.responseLength = 'detailed';
        } else if (profile.averageMessageLength < 50) {
            adaptations.responseLength = 'concise';
        }

        // Adapt structure to user's structure preference
        if (profile.wordChoiceProfile?.technical > 15) {
            adaptations.responseStructure = 'technical_with_examples';
            adaptations.technicalDepth = 'high';
        }

        // Adapt formality to user's style
        if (profile.communicationStyle?.formality?.level === 'formal') {
            adaptations.toneFormality = 'formal';
        } else if (profile.communicationStyle?.formality?.level === 'informal') {
            adaptations.toneFormality = 'conversational';
        }

        return adaptations;
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    _createEmptyAnalysis() {
        return {
            messageLength: 0,
            wordCount: 0,
            sentenceCount: 0,
            typos: { count: 0, detected: [], rate: 0 },
            wordChoice: {},
            punctuationStyle: {},
            messageStructure: {},
            communicationStyle: {},
            timestamp: new Date().toISOString()
        };
    }

    _createEmptyProfile() {
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
}

// ========================================
// CLI TESTING INTERFACE
// ========================================

if (require.main === module) {
    const analyzer = new LinguisticAnalyzer({ debugMode: true });

    console.log('\n🧠 ESMC 3.10 - LINGUISTIC INTELLIGENCE ANALYZER');
    console.log('='.repeat(60));

    const testMessages = [
        "I believe this hasn't been properly or fully or truly been maximized: user personality. I believe we have this feature but it doesn't seem to be able to learn about me everytime I use the ESMC framework.",
        "Use ESMC, audit and analyze...",
        "Why downgrade me again @@ ● ✅ Mission complete | ESMC 3.2... I should be 3.10 now!!!",
        "Use ESMC analyze... and let me know what you think",
        "Use ESMC, proceed, be careful..."
    ];

    console.log('\n📊 Analyzing sample messages...\n');

    let profile = analyzer._createEmptyProfile();

    testMessages.forEach((msg, index) => {
        console.log(`\n--- MESSAGE ${index + 1} ---`);
        console.log(`Text: "${msg.substring(0, 60)}${msg.length > 60 ? '...' : ''}"`);

        const analysis = analyzer.analyzeMessage(msg);
        console.log(`Words: ${analysis.wordCount} | Sentences: ${analysis.sentenceCount} | Typos: ${analysis.typos.count}`);
        console.log(`Communication Style:`);
        console.log(`  - Formality: ${analysis.communicationStyle.formality?.level}`);
        console.log(`  - Directness: ${analysis.communicationStyle.directness?.level}`);
        console.log(`  - Technicality: ${analysis.communicationStyle.technicality?.level}`);

        profile = analyzer.updateProfile(profile, analysis, index + 1);
    });

    console.log('\n📈 CUMULATIVE LINGUISTIC PROFILE');
    console.log('='.repeat(60));
    console.log(`Total messages analyzed: ${profile.totalMessagesAnalyzed}`);
    console.log(`Average message length: ${profile.averageMessageLength.toFixed(1)} chars`);
    console.log(`Average word count: ${profile.averageWordCount.toFixed(1)} words`);
    console.log(`Average sentence length: ${profile.averageSentenceLength.toFixed(1)} words`);
    console.log(`Overall typo rate: ${(profile.overallTypoRate * 100).toFixed(2)}%`);

    const insights = analyzer.generateInsights(profile);
    console.log('\n💡 INSIGHTS & ADAPTATIONS');
    console.log('='.repeat(60));
    console.log(`Confidence: ${(insights.confidence * 100).toFixed(0)}%`);
    console.log(`Typing style: ${insights.typingStyle?.verbosity} (accuracy: ${insights.typingStyle?.accuracy})`);
    console.log(`Recommended adaptations:`);
    Object.entries(insights.recommendedAdaptations).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
    });

    console.log('\n✅ Linguistic Intelligence Analyzer: OPERATIONAL\n');
}

module.exports = LinguisticAnalyzer;
