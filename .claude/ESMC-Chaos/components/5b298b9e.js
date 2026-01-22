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
 * ESMC 3.68 - ATHENA ERROR SIGNATURE DETECTOR (AESD)
 *
 * Strategic error pattern recognition - detects when proposed approach matches recent error signatures
 * Integrates into ATHENA pre-presentation review (COLONELS-CORE.md lines 36-56)
 *
 * Architecture: CLI subprocess component (zero main context overhead)
 * Parent: epsilon-athena-coordinator.js
 * Token Cost: 0 (subprocess execution only)
 *
 * Purpose: Prevent repeating failed approaches from recent sessions
 *
 * @module AESD
 * @version 3.68.0
 * @requires .esmc-working-memory.json (T1 sessions)
 * @requires .esmc-lessons.json (frustration patterns)
 */

const fs = require('fs');
const path = require('path');

class AthenaErrorSignatureDetector {
    constructor(options = {}) {
        this.workingMemoryPath = options.workingMemoryPath || '.esmc-working-memory.json';
        this.lessonsPath = options.lessonsPath || '.claude/.esmc-lessons.json';
        this.errorRegistryPath = options.errorRegistryPath || '.claude/.esmc-error-registry.json'; // 🆕 ESMC 3.69
        this.matchThreshold = options.matchThreshold || 0.70; // 70% similarity = warning
        this.criticalThreshold = options.criticalThreshold || 0.85; // 85% = halt recommended
        this.lookbackLimit = options.lookbackLimit || 5; // Check last 5 sessions

        this.errorSignatureCache = new Map();
        this.initialized = false;
    }

    /**
     * Initialize detector by loading memory sources
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // Load working memory (T1 sessions)
            this.workingMemory = this._loadJSON(this.workingMemoryPath);

            // Load lessons (frustration patterns)
            this.lessons = this._loadJSON(this.lessonsPath);

            // 🆕 ESMC 3.69: Load error registry (auto-registered error signatures)
            this.errorRegistry = this._loadJSON(this.errorRegistryPath);

            this.initialized = true;
            return true;
        } catch (error) {
            console.error('⚠️ AESD initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Detect if proposed approach matches error signatures from recent sessions
     *
     * @param {Object} proposal - Proposed approach from ECHELON
     * @param {string} proposal.description - What ECHELON plans to do
     * @param {string[]} proposal.keywords - Key technical terms
     * @param {string} proposal.approach - Implementation approach
     * @returns {Object} Detection result with match percentage and precedents
     */
    async detectErrorSignature(proposal) {
        if (!this.initialized) {
            await this.initialize();
        }

        const results = {
            detected: false,
            matchPercentage: 0,
            severity: 'none', // none | warning | critical
            matchedSessions: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };

        // Extract error signatures from T1 sessions
        const errorSignatures = this._extractErrorSignatures();

        // Match proposal against error signatures
        for (const signature of errorSignatures) {
            const match = this._calculateSignatureMatch(proposal, signature);

            if (match.score >= this.matchThreshold) {
                results.detected = true;
                results.matchPercentage = Math.max(results.matchPercentage, match.score);
                results.matchedSessions.push({
                    session_id: signature.session_id,
                    rank: signature.rank,
                    error_type: signature.error_type,
                    similarity: match.score,
                    matched_patterns: match.matchedPatterns,
                    root_cause: signature.root_cause,
                    failed_approach: signature.failed_approach
                });
            }
        }

        // Determine severity
        if (results.matchPercentage >= this.criticalThreshold) {
            results.severity = 'critical';
            results.recommendations.push('⛔ ATHENA HALT recommended - High similarity to recent failure');
        } else if (results.matchPercentage >= this.matchThreshold) {
            results.severity = 'warning';
            results.recommendations.push('⚠️ Review precedent before proceeding');
        }

        // Add specific recommendations
        if (results.detected) {
            const topMatch = results.matchedSessions[0];
            results.recommendations.push(`Rank ${topMatch.rank} shows similar approach failed: ${topMatch.error_type}`);
            if (topMatch.root_cause) {
                results.recommendations.push(`Root cause was: ${topMatch.root_cause}`);
            }
        }

        return results;
    }

    /**
     * Extract error signatures from T1 sessions
     * @private
     */
    _extractErrorSignatures() {
        const signatures = [];

        if (!this.workingMemory?.t1_sessions) {
            return signatures;
        }

        // Analyze recent sessions for error patterns
        const recentSessions = this.workingMemory.t1_sessions.slice(0, this.lookbackLimit);

        for (const session of recentSessions) {
            // Check if session has error indicators
            const hasErrors = this._sessionHasErrors(session);

            if (hasErrors) {
                const signature = this._buildErrorSignature(session);
                if (signature) {
                    signatures.push(signature);
                }
            }
        }

        // Also check lessons for high-severity frustration patterns
        if (this.lessons?.lessons) {
            for (const lesson of this.lessons.lessons) {
                if (lesson.frustration_score >= 80) {
                    signatures.push(this._buildErrorSignatureFromLesson(lesson));
                }
            }
        }

        // 🆕 ESMC 3.69: Check ERROR REGISTRY for auto-registered error signatures
        if (this.errorRegistry?.indices) {
            // Add recent errors from registry
            if (this.errorRegistry.indices.recent?.errors) {
                for (const error of this.errorRegistry.indices.recent.errors) {
                    signatures.push(this._buildErrorSignatureFromRegistry(error));
                }
            }
            // Add critical errors from registry
            if (this.errorRegistry.indices.critical?.errors) {
                for (const error of this.errorRegistry.indices.critical.errors) {
                    signatures.push(this._buildErrorSignatureFromRegistry(error));
                }
            }
        }

        return signatures;
    }

    /**
     * Check if session contains error indicators
     * @private
     */
    _sessionHasErrors(session) {
        const errorKeywords = [
            'bug', 'error', 'failed', 'failure', 'wrong', 'incorrect',
            'cascading', 'debugging', 'fix', 'correction', 'issue',
            'overwriting', 'mismatch', 'missing', 'broken'
        ];

        const text = `${session.summary || ''} ${(session.keywords || []).join(' ')}`.toLowerCase();

        return errorKeywords.some(keyword => text.includes(keyword));
    }

    /**
     * Build error signature from session data
     * @private
     */
    _buildErrorSignature(session) {
        const keywords = session.keywords || [];
        const summary = session.summary || '';

        // Extract error type
        const errorType = this._extractErrorType(summary, keywords);

        // Extract technical patterns (what was being attempted)
        const technicalPatterns = this._extractTechnicalPatterns(keywords);

        // Extract root cause if mentioned
        const rootCause = this._extractRootCause(summary);

        // Extract what approach failed
        const failedApproach = this._extractFailedApproach(summary);

        return {
            session_id: session.session_id,
            rank: session.rank,
            date: session.date,
            error_type: errorType,
            technical_patterns: technicalPatterns,
            root_cause: rootCause,
            failed_approach: failedApproach,
            keywords: keywords,
            summary: summary.substring(0, 200) // First 200 chars
        };
    }

    /**
     * Build error signature from lesson
     * @private
     */
    _buildErrorSignatureFromLesson(lesson) {
        return {
            session_id: lesson.id,
            rank: 99, // Lessons are high priority
            date: lesson.date,
            error_type: lesson.category,
            technical_patterns: lesson.trigger_keywords || [],
            root_cause: lesson.lesson,
            failed_approach: lesson.context,
            keywords: lesson.trigger_keywords || [],
            summary: lesson.lesson
        };
    }

    /**
     * 🆕 ESMC 3.69 - Build error signature from registry entry
     * @private
     */
    _buildErrorSignatureFromRegistry(registryError) {
        return {
            session_id: registryError.session_id,
            rank: registryError.rank || 0,
            date: registryError.timestamp.split('T')[0], // Extract date from ISO timestamp
            error_type: registryError.error_signature.error_type,
            technical_patterns: registryError.error_signature.technical_patterns,
            root_cause: registryError.error_signature.root_cause,
            failed_approach: registryError.error_signature.failed_approach,
            keywords: registryError.error_signature.technical_patterns,
            summary: `Registry error: ${registryError.error_signature.error_type}`,
            severity_score: registryError.severity_score // Additional field from registry
        };
    }

    /**
     * Calculate signature match score
     * @private
     */
    _calculateSignatureMatch(proposal, signature) {
        const proposalText = `${proposal.description || ''} ${(proposal.keywords || []).join(' ')} ${proposal.approach || ''}`.toLowerCase();
        const signatureText = `${signature.summary} ${signature.keywords.join(' ')} ${signature.failed_approach || ''}`.toLowerCase();

        const matchedPatterns = [];
        let matchScore = 0;

        // Keyword overlap (40% weight)
        const proposalKeywords = this._extractKeywords(proposalText);
        const signatureKeywords = new Set(signature.technical_patterns);
        const keywordMatches = proposalKeywords.filter(k => signatureKeywords.has(k));

        if (proposalKeywords.length > 0) {
            const keywordScore = keywordMatches.length / proposalKeywords.length;
            matchScore += keywordScore * 0.4;
            if (keywordMatches.length > 0) {
                matchedPatterns.push(`Keywords: ${keywordMatches.join(', ')}`);
            }
        }

        // Technical pattern match (30% weight)
        let patternMatches = 0;
        for (const pattern of signature.technical_patterns) {
            if (proposalText.includes(pattern.toLowerCase())) {
                patternMatches++;
                matchedPatterns.push(`Pattern: ${pattern}`);
            }
        }
        if (signature.technical_patterns.length > 0) {
            matchScore += (patternMatches / signature.technical_patterns.length) * 0.3;
        }

        // Approach similarity (30% weight)
        if (signature.failed_approach) {
            const approachWords = signature.failed_approach.toLowerCase().split(/\s+/);
            const matchingWords = approachWords.filter(word =>
                word.length > 3 && proposalText.includes(word)
            );
            if (approachWords.length > 0) {
                const approachScore = matchingWords.length / approachWords.length;
                matchScore += approachScore * 0.3;
                if (matchingWords.length > 2) {
                    matchedPatterns.push(`Approach: Similar to failed attempt`);
                }
            }
        }

        return {
            score: Math.min(matchScore, 1.0),
            matchedPatterns
        };
    }

    /**
     * Extract keywords from text
     * @private
     */
    _extractKeywords(text) {
        const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        return [...new Set(words)]; // Unique words
    }

    /**
     * Extract error type from summary
     * @private
     */
    _extractErrorType(summary, keywords) {
        const types = {
            'injection': /injection|inject|overwrite/i,
            'sync': /sync|synchronization/i,
            'build': /build|compilation/i,
            'validation': /validation|verify/i,
            'path': /path|file.*not.*found/i,
            'marker': /marker|placeholder/i,
            'authentication': /auth|login|permission/i
        };

        for (const [type, pattern] of Object.entries(types)) {
            if (pattern.test(summary) || keywords.some(k => pattern.test(k))) {
                return type;
            }
        }

        return 'general';
    }

    /**
     * Extract technical patterns from keywords
     * @private
     */
    _extractTechnicalPatterns(keywords) {
        // Keywords that contain technical context (dash-separated or specific terms)
        return keywords.filter(k =>
            k.includes('-') ||
            k.includes('bug') ||
            k.includes('fix') ||
            k.includes('error') ||
            k.length > 15 // Likely compound technical terms
        );
    }

    /**
     * Extract root cause from summary
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
     * Extract failed approach from summary
     * @private
     */
    _extractFailedApproach(summary) {
        const patterns = [
            /attempted[:\s]+([^.]+)/i,
            /approach[:\s]+([^.]+)/i,
            /tried[:\s]+([^.]+)/i
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
     * Format detection result for ATHENA dialogue
     */
    formatForDialogue(detection) {
        if (!detection.detected) {
            return null;
        }

        const topMatch = detection.matchedSessions[0];
        const severity = detection.severity === 'critical' ? '⛔ CRITICAL' : '⚠️ WARNING';

        return {
            severity: detection.severity,
            message: `${severity}: Similar approach detected in Rank ${topMatch.rank} (${Math.round(detection.matchPercentage * 100)}% match)`,
            details: {
                session_id: topMatch.session_id,
                error_type: topMatch.error_type,
                similarity: topMatch.similarity,
                root_cause: topMatch.root_cause,
                recommendations: detection.recommendations
            }
        };
    }
}

module.exports = AthenaErrorSignatureDetector;

// CLI interface for standalone execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node 5b298b9e.js <description> <keywords> <approach>');
        process.exit(1);
    }

    const proposal = {
        description: args[0] || '',
        keywords: args[1] ? args[1].split(',') : [],
        approach: args[2] || ''
    };

    const detector = new AthenaErrorSignatureDetector();

    detector.detectErrorSignature(proposal).then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.detected ? 1 : 0);
    }).catch(error => {
        console.error('Error:', error.message);
        process.exit(2);
    });
}
