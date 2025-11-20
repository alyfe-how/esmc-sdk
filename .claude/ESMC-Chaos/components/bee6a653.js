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
 * ESMC 3.68 - ATHENA USER INTERVENTION DETECTOR (UID)
 *
 * Tracks user correction frequency and intervention patterns
 * Detects when user frequently corrects or provides "brilliant insights"
 *
 * Architecture: CLI subprocess component (zero main context overhead)
 * Parent: epsilon-athena-coordinator.js
 * Token Cost: 0 (subprocess execution only)
 *
 * Purpose: Identify when ESMC/Claude is repeatedly missing the mark (requires course correction)
 *
 * @module UID
 * @version 3.68.0
 * @requires .esmc-working-memory.json (T1 sessions)
 */

const fs = require('fs');
const path = require('path');

class AthenaUserInterventionDetector {
    constructor(options = {}) {
        this.workingMemoryPath = options.workingMemoryPath || '.esmc-working-memory.json';
        this.warningThreshold = options.warningThreshold || 3; // 3+ corrections in recent sessions
        this.criticalThreshold = options.criticalThreshold || 5; // 5+ corrections = critical
        this.lookbackLimit = options.lookbackLimit || 10; // Check last 10 sessions

        this.initialized = false;

        // Intervention keywords (user correction patterns from Rank 1 analysis)
        this.interventionKeywords = [
            'no', 'wrong', 'incorrect', 'you missed', "you're missing",
            'actually', 'brilliant insight', 'brilliant correction', 'user teaching',
            'user corrected', 'user identified', 'user challenged', 'user questioned',
            'architectural challenge', 'precise challenge', 'exposed', 'revealed',
            'misunderstanding', 'misplaced', 'wrong layer', 'wrong timing',
            'forensic re-analysis', 'correction via', 'user\'s correction'
        ];
    }

    /**
     * Initialize detector by loading memory sources
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            this.workingMemory = this._loadJSON(this.workingMemoryPath);
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('⚠️ UID initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Detect user intervention patterns across recent sessions
     *
     * @param {Object} context - Current session context (optional)
     * @returns {Object} Intervention analysis with frequency and patterns
     */
    async detectInterventions(context = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const results = {
            interventionCount: 0,
            severity: 'none', // none | warning | critical
            interventionSessions: [],
            patterns: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };

        if (!this.workingMemory?.t1_sessions) {
            return results;
        }

        // Analyze recent sessions for intervention patterns
        const recentSessions = this.workingMemory.t1_sessions.slice(0, this.lookbackLimit);

        for (const session of recentSessions) {
            const interventions = this._detectSessionInterventions(session);

            if (interventions.found) {
                results.interventionCount++;
                results.interventionSessions.push({
                    session_id: session.session_id,
                    rank: session.rank,
                    date: session.date,
                    intervention_type: interventions.type,
                    intervention_details: interventions.details,
                    keywords_matched: interventions.keywords
                });

                // Track patterns
                if (!results.patterns.includes(interventions.type)) {
                    results.patterns.push(interventions.type);
                }
            }
        }

        // Determine severity
        if (results.interventionCount >= this.criticalThreshold) {
            results.severity = 'critical';
            results.recommendations.push('⛔ CRITICAL: User correcting frequently - Review architectural understanding');
            results.recommendations.push(`${results.interventionCount} corrections in last ${this.lookbackLimit} sessions`);
        } else if (results.interventionCount >= this.warningThreshold) {
            results.severity = 'warning';
            results.recommendations.push('⚠️ WARNING: User intervention pattern detected');
            results.recommendations.push(`${results.interventionCount} corrections suggest systematic gap`);
        }

        // Pattern-specific recommendations
        if (results.patterns.includes('architectural_misunderstanding')) {
            results.recommendations.push('Pattern: Architectural misunderstandings - Review system design');
        }
        if (results.patterns.includes('execution_gap')) {
            results.recommendations.push('Pattern: Execution gaps - Review protocol compliance');
        }
        if (results.patterns.includes('teaching_moment')) {
            results.recommendations.push('Pattern: User teaching moments - Extract learnings');
        }

        // Most recent intervention
        if (results.interventionSessions.length > 0) {
            const mostRecent = results.interventionSessions[0];
            results.recommendations.push(`Most recent: Rank ${mostRecent.rank} (${mostRecent.intervention_type})`);
        }

        return results;
    }

    /**
     * Detect interventions in a single session
     * @private
     */
    _detectSessionInterventions(session) {
        const result = {
            found: false,
            type: 'none',
            details: '',
            keywords: []
        };

        const summary = (session.summary || '').toLowerCase();
        const keywords = (session.keywords || []).map(k => k.toLowerCase());

        const text = `${summary} ${keywords.join(' ')}`;

        // Check for intervention keywords
        const matchedKeywords = this.interventionKeywords.filter(kw =>
            text.includes(kw.toLowerCase())
        );

        if (matchedKeywords.length === 0) {
            return result;
        }

        result.found = true;
        result.keywords = matchedKeywords;

        // Classify intervention type
        if (/architectural|misplaced|wrong layer|wrong timing|architecture correction/.test(text)) {
            result.type = 'architectural_misunderstanding';
            result.details = this._extractDetails(summary, /architectural[^.]+/i);
        } else if (/protocol.*violation|execution.*gap|compliance|checkpoint/.test(text)) {
            result.type = 'execution_gap';
            result.details = this._extractDetails(summary, /execution[^.]+/i);
        } else if (/brilliant|teaching|precise challenge|exposed|revealed/.test(text)) {
            result.type = 'teaching_moment';
            result.details = this._extractDetails(summary, /user[^.]+/i);
        } else if (/wrong|incorrect|you missed|no/.test(text)) {
            result.type = 'correction';
            result.details = this._extractDetails(summary, /(wrong|incorrect|missed)[^.]+/i);
        } else {
            result.type = 'general_intervention';
            result.details = 'User provided correction or guidance';
        }

        return result;
    }

    /**
     * Extract intervention details
     * @private
     */
    _extractDetails(summary, pattern) {
        const match = summary.match(pattern);
        if (match) {
            return match[0].substring(0, 150);
        }

        // Fallback: first sentence mentioning user
        const sentences = summary.split('.');
        for (const sentence of sentences) {
            if (/user|brilliant|correction|challenge/i.test(sentence)) {
                return sentence.trim().substring(0, 150);
            }
        }

        return 'See session for details';
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
     * Format intervention result for ATHENA dialogue
     */
    formatForDialogue(intervention) {
        if (intervention.interventionCount < this.warningThreshold) {
            return null;
        }

        const severity = intervention.severity === 'critical' ? '⛔ CRITICAL' : '⚠️ WARNING';

        return {
            severity: intervention.severity,
            message: `${severity}: User intervention pattern detected (${intervention.interventionCount} corrections in recent sessions)`,
            details: {
                intervention_count: intervention.interventionCount,
                patterns: intervention.patterns,
                recommendations: intervention.recommendations,
                recent_interventions: intervention.interventionSessions.slice(0, 3).map(s => ({
                    rank: s.rank,
                    date: s.date,
                    type: s.intervention_type
                }))
            }
        };
    }

    /**
     * Analyze current user message for intervention signals
     * (Real-time detection - called during active session)
     */
    analyzeCurrentMessage(message) {
        const text = message.toLowerCase();

        const signals = {
            is_intervention: false,
            intervention_type: 'none',
            confidence: 0,
            matched_keywords: []
        };

        // Check for intervention keywords
        const matchedKeywords = this.interventionKeywords.filter(kw =>
            text.includes(kw.toLowerCase())
        );

        if (matchedKeywords.length === 0) {
            return signals;
        }

        signals.is_intervention = true;
        signals.matched_keywords = matchedKeywords;
        signals.confidence = Math.min(matchedKeywords.length * 0.25, 1.0);

        // Classify intervention type
        if (/architectural|wrong layer|wrong timing|misplaced/.test(text)) {
            signals.intervention_type = 'architectural_correction';
        } else if (/protocol|execution|compliance/.test(text)) {
            signals.intervention_type = 'execution_correction';
        } else if (/brilliant|precise|insight/.test(text)) {
            signals.intervention_type = 'teaching_moment';
        } else if (/wrong|incorrect|no|you missed/.test(text)) {
            signals.intervention_type = 'direct_correction';
        } else {
            signals.intervention_type = 'general_guidance';
        }

        return signals;
    }
}

module.exports = AthenaUserInterventionDetector;

// CLI interface for standalone execution
if (require.main === module) {
    const args = process.argv.slice(2);

    const detector = new AthenaUserInterventionDetector();

    if (args.length === 0) {
        // Historical analysis mode
        detector.detectInterventions().then(result => {
            console.log(JSON.stringify(result, null, 2));
            process.exit(result.severity !== 'none' ? 1 : 0);
        }).catch(error => {
            console.error('Error:', error.message);
            process.exit(2);
        });
    } else {
        // Real-time message analysis mode
        const message = args.join(' ');
        const analysis = detector.analyzeCurrentMessage(message);
        console.log(JSON.stringify(analysis, null, 2));
        process.exit(analysis.is_intervention ? 1 : 0);
    }
}
