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
/**
 * ESMC 3.68 - ATHENA CROSS-SESSION PROBLEM MATCHER (CSPM)
 *
 * Searches T1 sessions for PROBLEM precedents (not just implementation precedents)
 * Extends ATHENA Pattern Recognition Protocol (COLONELS-CORE.md lines 170-197)
 *
 * Architecture: CLI subprocess component (zero main context overhead)
 * Parent: epsilon-athena-coordinator.js
 * Token Cost: 0 (subprocess execution only)
 *
 * Purpose: Find how similar PROBLEMS were solved in past sessions
 *
 * @module CSPM
 * @version 3.68.0
 * @requires .esmc-working-memory.json (T1 sessions)
 * @requires .esmc-lessons.json (problem-solution patterns)
 */

const fs = require('fs');
const path = require('path');

class AthenaCrossSessionMatcher {
    constructor(options = {}) {
        this.workingMemoryPath = options.workingMemoryPath || '.esmc-working-memory.json';
        this.lessonsPath = options.lessonsPath || '.claude/.esmc-lessons.json';
        this.precedentRegistryPath = options.precedentRegistryPath || '.claude/.esmc-precedent-registry.json'; // 🆕 ESMC 3.69
        this.matchThreshold = options.matchThreshold || 0.65; // 65% problem similarity
        this.maxResults = options.maxResults || 3; // Top 3 precedents

        this.initialized = false;
    }

    /**
     * Initialize matcher by loading memory sources
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            this.workingMemory = this._loadJSON(this.workingMemoryPath);
            this.lessons = this._loadJSON(this.lessonsPath);
            // 🆕 ESMC 3.69: Load precedent registry (auto-registered solutions)
            this.precedentRegistry = this._loadJSON(this.precedentRegistryPath);
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('⚠️ CSPM initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Search for problem precedents across sessions
     *
     * @param {Object} problem - Current problem to match
     * @param {string} problem.description - Problem description
     * @param {string[]} problem.keywords - Key technical terms
     * @param {string} problem.errorType - Type of error (optional)
     * @returns {Object} Matching precedents with solutions
     */
    async findProblemPrecedents(problem) {
        if (!this.initialized) {
            await this.initialize();
        }

        const results = {
            found: false,
            precedents: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };

        // Build problem signature
        const problemSig = this._buildProblemSignature(problem);

        // Search T1 sessions
        const sessionPrecedents = this._searchSessions(problemSig);

        // Search lessons
        const lessonPrecedents = this._searchLessons(problemSig);

        // 🆕 ESMC 3.69: Search PRECEDENT REGISTRY (auto-registered solutions)
        const registryPrecedents = this._searchPrecedentRegistry(problemSig);

        // Combine and rank
        const allPrecedents = [...sessionPrecedents, ...lessonPrecedents, ...registryPrecedents];
        allPrecedents.sort((a, b) => b.similarity - a.similarity);

        // Take top N results above threshold
        results.precedents = allPrecedents
            .filter(p => p.similarity >= this.matchThreshold)
            .slice(0, this.maxResults);

        if (results.precedents.length > 0) {
            results.found = true;

            // Generate recommendations
            for (const precedent of results.precedents) {
                if (precedent.solution) {
                    results.recommendations.push({
                        source: `Rank ${precedent.rank || 'Lesson'}`,
                        similarity: Math.round(precedent.similarity * 100),
                        problem: precedent.problem_description,
                        solution: precedent.solution,
                        verification: precedent.verification || 'N/A'
                    });
                }
            }
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
            errorType: (problem.errorType || '').toLowerCase(),
            technicalTerms: this._extractTechnicalTerms(problem.description, problem.keywords)
        };
    }

    /**
     * Search T1 sessions for problem precedents
     * @private
     */
    _searchSessions(problemSig) {
        const precedents = [];

        if (!this.workingMemory?.t1_sessions) {
            return precedents;
        }

        for (const session of this.workingMemory.t1_sessions) {
            const sessionSig = this._buildSessionSignature(session);
            const similarity = this._calculateSimilarity(problemSig, sessionSig);

            if (similarity >= this.matchThreshold) {
                const precedent = {
                    type: 'session',
                    session_id: session.session_id,
                    rank: session.rank,
                    date: session.date,
                    similarity: similarity,
                    problem_description: this._extractProblemFromSession(session),
                    solution: this._extractSolutionFromSession(session),
                    verification: this._extractVerificationFromSession(session),
                    root_cause: this._extractRootCause(session.summary || ''),
                    keywords: session.keywords || []
                };

                precedents.push(precedent);
            }
        }

        return precedents;
    }

    /**
     * Search lessons for problem precedents
     * @private
     */
    _searchLessons(problemSig) {
        const precedents = [];

        if (!this.lessons?.lessons) {
            return precedents;
        }

        for (const lesson of this.lessons.lessons) {
            const lessonSig = this._buildLessonSignature(lesson);
            const similarity = this._calculateSimilarity(problemSig, lessonSig);

            if (similarity >= this.matchThreshold) {
                const precedent = {
                    type: 'lesson',
                    lesson_id: lesson.id,
                    rank: 99, // Lessons are high priority
                    date: lesson.date,
                    similarity: similarity,
                    problem_description: lesson.context || lesson.lesson,
                    solution: lesson.resolution || lesson.lesson,
                    verification: lesson.resolution_date ? `Resolved ${lesson.resolution_date}` : 'Active',
                    root_cause: lesson.lesson,
                    keywords: lesson.trigger_keywords || []
                };

                precedents.push(precedent);
            }
        }

        return precedents;
    }

    /**
     * 🆕 ESMC 3.69 - Search PRECEDENT REGISTRY for auto-registered solutions
     * @private
     */
    _searchPrecedentRegistry(problemSig) {
        const precedents = [];

        if (!this.precedentRegistry?.indices) {
            return precedents;
        }

        // Search recent precedents
        if (this.precedentRegistry.indices.recent?.precedents) {
            for (const registryPrecedent of this.precedentRegistry.indices.recent.precedents) {
                const precedentSig = this._buildRegistrySignature(registryPrecedent);
                const similarity = this._calculateSimilarity(problemSig, precedentSig);

                if (similarity >= this.matchThreshold) {
                    precedents.push(this._formatRegistryPrecedent(registryPrecedent, similarity));
                }
            }
        }

        // Search important precedents
        if (this.precedentRegistry.indices.important?.precedents) {
            for (const registryPrecedent of this.precedentRegistry.indices.important.precedents) {
                const precedentSig = this._buildRegistrySignature(registryPrecedent);
                const similarity = this._calculateSimilarity(problemSig, precedentSig);

                if (similarity >= this.matchThreshold) {
                    precedents.push(this._formatRegistryPrecedent(registryPrecedent, similarity));
                }
            }
        }

        return precedents;
    }

    /**
     * 🆕 ESMC 3.69 - Build signature from registry precedent
     * @private
     */
    _buildRegistrySignature(registryPrecedent) {
        return {
            description: (registryPrecedent.problem_signature?.problem_description || '').toLowerCase(),
            keywords: (registryPrecedent.problem_signature?.technical_context || []).map(k => k.toLowerCase()),
            errorType: registryPrecedent.problem_signature?.problem_type || '',
            technicalTerms: registryPrecedent.problem_signature?.technical_context || []
        };
    }

    /**
     * 🆕 ESMC 3.69 - Format registry precedent for results
     * @private
     */
    _formatRegistryPrecedent(registryPrecedent, similarity) {
        return {
            type: 'registry',
            session_id: registryPrecedent.session_id,
            rank: registryPrecedent.rank || 0,
            date: registryPrecedent.timestamp.split('T')[0],
            similarity: similarity,
            problem_description: registryPrecedent.problem_signature?.problem_description || 'N/A',
            solution: registryPrecedent.solution?.approach || 'Solution not recorded',
            verification: registryPrecedent.solution?.verification_method || 'User confirmation',
            implementation_details: registryPrecedent.solution?.implementation_details || '',
            impact_score: registryPrecedent.impact_score || 0,
            keywords: registryPrecedent.problem_signature?.technical_context || []
        };
    }

    /**
     * Build session signature
     * @private
     */
    _buildSessionSignature(session) {
        return {
            description: (session.summary || '').toLowerCase(),
            keywords: (session.keywords || []).map(k => k.toLowerCase()),
            errorType: this._detectErrorType(session),
            technicalTerms: this._extractTechnicalTerms(session.summary, session.keywords)
        };
    }

    /**
     * Build lesson signature
     * @private
     */
    _buildLessonSignature(lesson) {
        return {
            description: (lesson.lesson || '').toLowerCase(),
            keywords: (lesson.trigger_keywords || []).map(k => k.toLowerCase()),
            errorType: lesson.category || '',
            technicalTerms: lesson.trigger_keywords || []
        };
    }

    /**
     * Calculate similarity between signatures
     * @private
     */
    _calculateSimilarity(sig1, sig2) {
        let score = 0;

        // Keyword overlap (40% weight)
        const keywords1 = new Set(sig1.keywords);
        const keywords2 = new Set(sig2.keywords);
        const keywordIntersection = [...keywords1].filter(k => keywords2.has(k));

        if (keywords1.size > 0 || keywords2.size > 0) {
            const keywordScore = keywordIntersection.length / Math.max(keywords1.size, keywords2.size);
            score += keywordScore * 0.4;
        }

        // Technical terms overlap (30% weight)
        const terms1 = new Set(sig1.technicalTerms);
        const terms2 = new Set(sig2.technicalTerms);
        const termIntersection = [...terms1].filter(t => terms2.has(t));

        if (terms1.size > 0 || terms2.size > 0) {
            const termScore = termIntersection.length / Math.max(terms1.size, terms2.size);
            score += termScore * 0.3;
        }

        // Error type match (20% weight)
        if (sig1.errorType && sig2.errorType && sig1.errorType === sig2.errorType) {
            score += 0.2;
        }

        // Description word overlap (10% weight)
        const desc1Words = new Set((sig1.description.match(/\b\w{4,}\b/g) || []).slice(0, 50));
        const desc2Words = new Set((sig2.description.match(/\b\w{4,}\b/g) || []).slice(0, 50));
        const descIntersection = [...desc1Words].filter(w => desc2Words.has(w));

        if (desc1Words.size > 0 || desc2Words.size > 0) {
            const descScore = descIntersection.length / Math.max(desc1Words.size, desc2Words.size);
            score += descScore * 0.1;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Extract technical terms
     * @private
     */
    _extractTechnicalTerms(description = '', keywords = []) {
        const terms = new Set();

        // From keywords
        for (const keyword of keywords) {
            if (typeof keyword === 'string') {
                if (keyword.includes('-') || keyword.length > 10) {
                    terms.add(keyword.toLowerCase());
                }
            }
        }

        // From description
        const descStr = String(description);
        const technicalPatterns = descStr.match(/\b(?:sync|build|auth|inject|validate|fix|bug|error|path|marker|file|overflow|injection|validation|authentication|permission)\b/gi) || [];

        for (const term of technicalPatterns) {
            terms.add(term.toLowerCase());
        }

        return Array.from(terms);
    }

    /**
     * Detect error type from session
     * @private
     */
    _detectErrorType(session) {
        const text = `${session.summary || ''} ${(session.keywords || []).join(' ')}`.toLowerCase();

        const types = {
            'injection': /injection|inject|overflow/,
            'sync': /sync|synchronization/,
            'build': /build|compilation/,
            'validation': /validation|verify/,
            'path': /path|file.*not.*found/,
            'authentication': /auth|login|permission/
        };

        for (const [type, pattern] of Object.entries(types)) {
            if (pattern.test(text)) {
                return type;
            }
        }

        return '';
    }

    /**
     * Extract problem description from session
     * @private
     */
    _extractProblemFromSession(session) {
        const summary = session.summary || '';

        // Try to find problem statement
        const patterns = [
            /User.*?identified[:\s]+([^.]+)/i,
            /discovered[:\s]+([^.]+)/i,
            /issue[:\s]+([^.]+)/i,
            /bug[:\s]+([^.]+)/i
        ];

        for (const pattern of patterns) {
            const match = summary.match(pattern);
            if (match) {
                return match[1].trim().substring(0, 200);
            }
        }

        // Fallback: first sentence
        const firstSentence = summary.split('.')[0];
        return firstSentence.substring(0, 200);
    }

    /**
     * Extract solution from session
     * @private
     */
    _extractSolutionFromSession(session) {
        const summary = session.summary || '';

        // Try to find solution
        const patterns = [
            /solution[:\s]+([^.]+)/i,
            /fixed[:\s]+([^.]+)/i,
            /resolved[:\s]+([^.]+)/i,
            /implemented[:\s]+([^.]+)/i,
            /applied[:\s]+([^.]+)/i
        ];

        for (const pattern of patterns) {
            const match = summary.match(pattern);
            if (match) {
                return match[1].trim().substring(0, 200);
            }
        }

        // Check key_learnings if available (from session.json structure)
        if (session.key_learnings && Array.isArray(session.key_learnings)) {
            const resolutionLearning = session.key_learnings.find(l => l.topic?.includes('solution') || l.topic?.includes('fix'));
            if (resolutionLearning) {
                return resolutionLearning.details?.substring(0, 200) || 'See session for details';
            }
        }

        return 'See session summary for solution details';
    }

    /**
     * Extract verification steps from session
     * @private
     */
    _extractVerificationFromSession(session) {
        const summary = session.summary || '';

        const patterns = [
            /verified[:\s]+([^.]+)/i,
            /validated[:\s]+([^.]+)/i,
            /tested[:\s]+([^.]+)/i,
            /confirmed[:\s]+([^.]+)/i
        ];

        for (const pattern of patterns) {
            const match = summary.match(pattern);
            if (match) {
                return match[1].trim().substring(0, 150);
            }
        }

        return 'N/A';
    }

    /**
     * Extract root cause
     * @private
     */
    _extractRootCause(summary) {
        const patterns = [
            /root cause[:\s]+([^.]+)/i,
            /because[:\s]+([^.]+)/i,
            /due to[:\s]+([^.]+)/i,
            /caused by[:\s]+([^.]+)/i
        ];

        for (const pattern of patterns) {
            const match = summary.match(pattern);
            if (match) {
                return match[1].trim().substring(0, 150);
            }
        }

        return null;
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
     * Format precedents for ATHENA dialogue
     */
    formatForDialogue(matchResult) {
        if (!matchResult.found || matchResult.precedents.length === 0) {
            return null;
        }

        const topPrecedent = matchResult.precedents[0];

        return {
            severity: 'info',
            message: `📚 Precedent found: Rank ${topPrecedent.rank} solved similar problem (${Math.round(topPrecedent.similarity * 100)}% match)`,
            details: {
                precedent_count: matchResult.precedents.length,
                top_match: {
                    rank: topPrecedent.rank,
                    similarity: topPrecedent.similarity,
                    problem: topPrecedent.problem_description,
                    solution: topPrecedent.solution,
                    root_cause: topPrecedent.root_cause
                },
                recommendations: matchResult.recommendations
            }
        };
    }
}

module.exports = AthenaCrossSessionMatcher;

// CLI interface for standalone execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node a774977f.js <description> <keywords> [errorType]');
        process.exit(1);
    }

    const problem = {
        description: args[0] || '',
        keywords: args[1] ? args[1].split(',') : [],
        errorType: args[2] || ''
    };

    const matcher = new AthenaCrossSessionMatcher();

    matcher.findProblemPrecedents(problem).then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.found ? 0 : 1);
    }).catch(error => {
        console.error('Error:', error.message);
        process.exit(2);
    });
}
