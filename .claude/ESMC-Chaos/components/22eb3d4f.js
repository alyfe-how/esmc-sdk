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
/**
 * ESMC 3.68 - ATHENA ITERATION COUNTER (IC)
 *
 * Tracks iteration attempts on similar problems across sessions
 * Warns when iteration count exceeds threshold (indicates repetitive debugging)
 *
 * Architecture: CLI subprocess component (zero main context overhead)
 * Parent: epsilon-athena-coordinator.js
 * Token Cost: 0 (subprocess execution only)
 *
 * Purpose: Detect when same problem is being attempted multiple times without progress
 *
 * @module IC
 * @version 3.68.0
 * @requires .esmc-working-memory.json (T1 sessions)
 */

const fs = require('fs');
const path = require('path');

class AthenaIterationCounter {
    constructor(options = {}) {
        this.workingMemoryPath = options.workingMemoryPath || '.esmc-working-memory.json';
        this.warningThreshold = options.warningThreshold || 2; // Warn at 3rd attempt (0-indexed = 2)
        this.criticalThreshold = options.criticalThreshold || 4; // Critical at 5th attempt
        this.similarityThreshold = options.similarityThreshold || 0.6; // 60% similarity = same problem

        this.initialized = false;
    }

    /**
     * Initialize counter by loading memory sources
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            this.workingMemory = this._loadJSON(this.workingMemoryPath);
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('⚠️ IC initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Count iterations of similar problem attempts
     *
     * @param {Object} currentProblem - Current problem being attempted
     * @param {string} currentProblem.description - Problem description
     * @param {string[]} currentProblem.keywords - Key technical terms
     * @returns {Object} Iteration analysis with count and precedents
     */
    async countIterations(currentProblem) {
        if (!this.initialized) {
            await this.initialize();
        }

        const results = {
            iterationCount: 0,
            severity: 'none', // none | warning | critical
            similarSessions: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };

        if (!this.workingMemory?.t1_sessions) {
            return results;
        }

        // Find similar problem attempts in recent sessions
        const currentSignature = this._buildProblemSignature(currentProblem);

        for (const session of this.workingMemory.t1_sessions) {
            const sessionSignature = this._buildProblemSignatureFromSession(session);
            const similarity = this._calculateSimilarity(currentSignature, sessionSignature);

            if (similarity >= this.similarityThreshold) {
                results.iterationCount++;
                results.similarSessions.push({
                    session_id: session.session_id,
                    rank: session.rank,
                    date: session.date,
                    similarity: similarity,
                    summary: session.summary?.substring(0, 150) || 'N/A',
                    outcome: this._extractOutcome(session)
                });
            }
        }

        // Determine severity based on iteration count
        if (results.iterationCount > this.criticalThreshold) {
            results.severity = 'critical';
            results.recommendations.push(`⛔ CRITICAL: Problem attempted ${results.iterationCount + 1} times - Review approach`);
            results.recommendations.push('Consider alternative solution or escalate for review');
        } else if (results.iterationCount > this.warningThreshold) {
            results.severity = 'warning';
            results.recommendations.push(`⚠️ WARNING: Problem attempted ${results.iterationCount + 1} times`);
            results.recommendations.push('Previous attempts may indicate systematic issue');
        }

        // Add historical context
        if (results.similarSessions.length > 0) {
            const failed = results.similarSessions.filter(s => s.outcome === 'failed').length;
            const succeeded = results.similarSessions.filter(s => s.outcome === 'succeeded').length;

            if (failed > 0) {
                results.recommendations.push(`${failed} previous attempt(s) failed - review why`);
            }
            if (succeeded > 0) {
                results.recommendations.push(`${succeeded} previous attempt(s) succeeded - copy that pattern`);
            }

            // Most recent attempt
            const mostRecent = results.similarSessions[0];
            results.recommendations.push(`Most recent: Rank ${mostRecent.rank} (${mostRecent.date})`);
        }

        return results;
    }

    /**
     * Build problem signature from current problem
     * @private
     */
    _buildProblemSignature(problem) {
        return {
            description: (problem.description || '').toLowerCase(),
            keywords: (problem.keywords || []).map(k => k.toLowerCase()),
            technicalTerms: this._extractTechnicalTerms(problem.description, problem.keywords)
        };
    }

    /**
     * Build problem signature from session
     * @private
     */
    _buildProblemSignatureFromSession(session) {
        const description = (session.summary || '').toLowerCase();
        const keywords = (session.keywords || []).map(k => k.toLowerCase());

        return {
            description,
            keywords,
            technicalTerms: this._extractTechnicalTerms(description, keywords)
        };
    }

    /**
     * Extract technical terms from description and keywords
     * @private
     */
    _extractTechnicalTerms(description = '', keywords = []) {
        const terms = new Set();

        // From keywords (dash-separated or compound terms)
        for (const keyword of keywords) {
            if (typeof keyword === 'string') {
                if (keyword.includes('-') || keyword.length > 12) {
                    terms.add(keyword.toLowerCase());
                }
            }
        }

        // From description (capitalized words, camelCase, technical patterns)
        const descStr = String(description);
        const capitalizedWords = descStr.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
        const technicalPatterns = descStr.match(/\b(?:sync|build|auth|inject|validate|fix|bug|error|path|marker|file)\b/gi) || [];

        for (const word of [...capitalizedWords, ...technicalPatterns]) {
            terms.add(word.toLowerCase());
        }

        return Array.from(terms);
    }

    /**
     * Calculate similarity between two problem signatures
     * @private
     */
    _calculateSimilarity(sig1, sig2) {
        let score = 0;

        // Keyword overlap (50% weight)
        const keywords1 = new Set(sig1.keywords);
        const keywords2 = new Set(sig2.keywords);
        const keywordIntersection = [...keywords1].filter(k => keywords2.has(k));

        if (keywords1.size > 0 || keywords2.size > 0) {
            const keywordScore = keywordIntersection.length / Math.max(keywords1.size, keywords2.size);
            score += keywordScore * 0.5;
        }

        // Technical terms overlap (30% weight)
        const terms1 = new Set(sig1.technicalTerms);
        const terms2 = new Set(sig2.technicalTerms);
        const termIntersection = [...terms1].filter(t => terms2.has(t));

        if (terms1.size > 0 || terms2.size > 0) {
            const termScore = termIntersection.length / Math.max(terms1.size, terms2.size);
            score += termScore * 0.3;
        }

        // Description similarity (20% weight) - simple word overlap
        const desc1Words = new Set(sig1.description.match(/\b\w{4,}\b/g) || []);
        const desc2Words = new Set(sig2.description.match(/\b\w{4,}\b/g) || []);
        const descIntersection = [...desc1Words].filter(w => desc2Words.has(w));

        if (desc1Words.size > 0 || desc2Words.size > 0) {
            const descScore = descIntersection.length / Math.max(desc1Words.size, desc2Words.size);
            score += descScore * 0.2;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Extract outcome from session (failed, succeeded, or unknown)
     * @private
     */
    _extractOutcome(session) {
        const summary = (session.summary || '').toLowerCase();
        const keywords = (session.keywords || []).map(k => k.toLowerCase());

        const text = `${summary} ${keywords.join(' ')}`;

        // Failed indicators
        if (/\b(failed|failure|bug|error|cascading|wrong|incorrect|broke|issue)\b/.test(text)) {
            return 'failed';
        }

        // Success indicators
        if (/\b(complete|success|validated|fixed|resolved|deployed|working)\b/.test(text)) {
            return 'succeeded';
        }

        return 'unknown';
    }

    /**
     * Load JSON file safely
     * @private
     */
    _loadJSON(filepath) {
        try {
            const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
            if (!fs.existsSync(fullPath)) {
                return null;
            }
            const content = fs.readFileSync(fullPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`⚠️ Failed to load ${filepath}:`, error.message);
            return null;
        }
    }

    /**
     * Format iteration result for ATHENA dialogue
     */
    formatForDialogue(iteration) {
        if (iteration.iterationCount <= this.warningThreshold) {
            return null;
        }

        const severity = iteration.severity === 'critical' ? '⛔ CRITICAL' : '⚠️ WARNING';

        return {
            severity: iteration.severity,
            message: `${severity}: Problem attempted ${iteration.iterationCount + 1} times across recent sessions`,
            details: {
                iteration_count: iteration.iterationCount + 1,
                similar_sessions: iteration.similarSessions.length,
                recommendations: iteration.recommendations,
                recent_attempts: iteration.similarSessions.slice(0, 3).map(s => ({
                    rank: s.rank,
                    date: s.date,
                    outcome: s.outcome
                }))
            }
        };
    }
}

module.exports = AthenaIterationCounter;

// CLI interface for standalone execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node 22eb3d4f.js <description> <keywords>');
        process.exit(1);
    }

    const problem = {
        description: args[0] || '',
        keywords: args[1] ? args[1].split(',') : []
    };

    const counter = new AthenaIterationCounter();

    counter.countIterations(problem).then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.severity !== 'none' ? 1 : 0);
    }).catch(error => {
        console.error('Error:', error.message);
        process.exit(2);
    });
}
