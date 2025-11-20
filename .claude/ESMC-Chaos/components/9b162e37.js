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
 * ESMC 4.1 - ATHENA PROACTIVE HALT CHECKPOINT (PHC)
 *
 * Triggers halt BEFORE colonel deployment if error signature + precedent found
 * Most critical component - prevents repeating failed approaches
 *
 * Architecture: CLI subprocess component (zero main context overhead)
 * Parent: epsilon-athena-coordinator.js
 * Token Cost: 0 (subprocess execution only)
 *
 * Purpose: Stop execution when high probability of repeating known error
 *
 * ESMC 4.1 Learning Loop:
 *   - PHC halt → Auto-create lesson in .esmc-lessons.json
 *   - Closes the loop: Detect pattern → Create lesson → Prevent future halts
 *
 * @module PHC
 * @version 4.1.0
 * @requires AESD, IC, CSPM (integrates their results)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AthenaProactiveHaltCheckpoint {
    constructor(options = {}) {
        // Component dependencies
        this.aesd = options.aesd || null; // Error Signature Detector
        this.ic = options.ic || null; // Iteration Counter
        this.cspm = options.cspm || null; // Cross-Session Matcher
        this.uid = options.uid || null; // User Intervention Detector

        // Thresholds for halt decision
        this.errorMatchThreshold = options.errorMatchThreshold || 0.70; // 70% error match
        this.iterationThreshold = options.iterationThreshold || 2; // 3rd attempt
        this.interventionThreshold = options.interventionThreshold || 3; // 3+ corrections

        this.haltReasons = [];
        this.initialized = false;
    }

    /**
     * Initialize checkpoint with component instances
     */
    async initialize(components = {}) {
        this.aesd = components.aesd || this.aesd;
        this.ic = components.ic || this.ic;
        this.cspm = components.cspm || this.cspm;
        this.uid = components.uid || this.uid;

        this.initialized = true;
        return true;
    }

    /**
     * Evaluate whether to halt execution before proceeding
     *
     * @param {Object} proposal - ECHELON's proposed approach
     * @param {Object} proposal.description - What ECHELON plans to do
     * @param {string[]} proposal.keywords - Key technical terms
     * @param {string} proposal.approach - Implementation approach
     * @returns {Object} Halt decision with reasoning and precedents
     */
    async evaluateHalt(proposal) {
        if (!this.initialized) {
            await this.initialize();
        }

        const decision = {
            shouldHalt: false,
            severity: 'none', // none | warning | critical
            reasons: [],
            precedents: [],
            recommendations: [],
            component_results: {},
            timestamp: new Date().toISOString()
        };

        // Run all detection components in parallel
        const results = await this._runAllDetectors(proposal);

        decision.component_results = results;

        // Evaluate AESD (Error Signature Detection)
        if (results.aesd && results.aesd.detected) {
            const severity = results.aesd.severity;

            if (results.aesd.matchPercentage >= this.errorMatchThreshold) {
                decision.reasons.push({
                    component: 'AESD',
                    severity: severity,
                    message: `Error signature match: ${Math.round(results.aesd.matchPercentage * 100)}%`,
                    details: results.aesd.matchedSessions[0]
                });

                if (severity === 'critical') {
                    decision.shouldHalt = true;
                    decision.severity = 'critical';
                }

                // Add precedents
                for (const session of results.aesd.matchedSessions.slice(0, 2)) {
                    decision.precedents.push({
                        source: 'AESD',
                        rank: session.rank,
                        session_id: session.session_id,
                        similarity: session.similarity,
                        error_type: session.error_type,
                        root_cause: session.root_cause
                    });
                }
            }
        }

        // Evaluate IC (Iteration Counter)
        if (results.ic && results.ic.iterationCount > this.iterationThreshold) {
            decision.reasons.push({
                component: 'IC',
                severity: results.ic.severity,
                message: `Iteration #${results.ic.iterationCount + 1} - Problem attempted multiple times`,
                details: results.ic.similarSessions[0]
            });

            if (results.ic.severity === 'critical' || results.ic.iterationCount >= 4) {
                decision.shouldHalt = true;
                decision.severity = decision.severity === 'critical' ? 'critical' : 'warning';
            }
        }

        // Evaluate CSPM (Cross-Session Problem Matcher)
        if (results.cspm && results.cspm.found) {
            const topPrecedent = results.cspm.precedents[0];

            decision.reasons.push({
                component: 'CSPM',
                severity: 'info',
                message: `Precedent found: Rank ${topPrecedent.rank} (${Math.round(topPrecedent.similarity * 100)}% match)`,
                details: topPrecedent
            });

            // Add solution precedents
            for (const precedent of results.cspm.precedents.slice(0, 2)) {
                decision.precedents.push({
                    source: 'CSPM',
                    rank: precedent.rank,
                    session_id: precedent.session_id,
                    similarity: precedent.similarity,
                    problem: precedent.problem_description,
                    solution: precedent.solution
                });
            }
        }

        // Evaluate UID (User Intervention Detector)
        if (results.uid && results.uid.interventionCount >= this.interventionThreshold) {
            decision.reasons.push({
                component: 'UID',
                severity: results.uid.severity,
                message: `User intervention pattern: ${results.uid.interventionCount} corrections in recent sessions`,
                details: results.uid.patterns
            });

            if (results.uid.severity === 'critical') {
                decision.shouldHalt = true;
                decision.severity = 'critical';
            }
        }

        // HALT LOGIC: Combine signals for final decision
        const criticalSignals = decision.reasons.filter(r => r.severity === 'critical').length;
        const warningSignals = decision.reasons.filter(r => r.severity === 'warning').length;

        // Critical halt conditions
        if (criticalSignals >= 1) {
            decision.shouldHalt = true;
            decision.severity = 'critical';
        }
        // Warning halt conditions (2+ warning signals)
        else if (warningSignals >= 2) {
            decision.shouldHalt = true;
            decision.severity = 'warning';
        }
        // Combined conditions (error match + iteration + precedent)
        else if (
            results.aesd?.detected &&
            results.ic?.iterationCount > 1 &&
            results.cspm?.found
        ) {
            decision.shouldHalt = true;
            decision.severity = 'warning';
            decision.reasons.push({
                component: 'PHC',
                severity: 'warning',
                message: 'Combined signals: Error signature + Iteration + Precedent detected',
                details: 'Multiple indicators suggest reviewing approach before proceeding'
            });
        }

        // Generate recommendations
        if (decision.shouldHalt) {
            decision.recommendations.push('⛔ ATHENA HALT: Review precedents before proceeding');

            if (results.cspm?.found) {
                decision.recommendations.push('✅ Precedent available - Review solution from previous session');
            }

            if (results.aesd?.detected) {
                const topMatch = results.aesd.matchedSessions[0];
                decision.recommendations.push(`⚠️ Rank ${topMatch.rank} shows similar approach failed: ${topMatch.error_type}`);
            }

            if (results.ic?.iterationCount > this.iterationThreshold) {
                decision.recommendations.push(`🔄 Attempted ${results.ic.iterationCount + 1} times - Consider alternative approach`);
            }

            decision.recommendations.push('📋 Display precedent details to user for validation');

            // 🆕 ESMC 3.69: AUTO-REGISTER ERROR SIGNATURE TO AEGIS ERROR REGISTRY
            // CRITICAL TRIGGER: Write path integration for self-learning system
            // This creates the automatic error signature registration from PHC halt
            await this._registerErrorSignature(proposal, decision, results.aesd);

            // 🆕 ESMC 4.1: AUTO-CREATE LESSON FROM PHC HALT
            // Closes learning loop: PHC halt → lesson created → future prevention
            await this._createAutoLessonFromHalt(proposal, decision, results);
        }

        return decision;
    }

    /**
     * 🆕 ESMC 3.69 - Register error signature to AEGIS error registry
     *
     * CRITICAL TRIGGER: This is the write path integration point
     * Auto-registers error signatures when PHC halts = self-learning system
     *
     * @private
     * @param {Object} proposal - ECHELON proposal that triggered halt
     * @param {Object} decision - PHC halt decision
     * @param {Object} aesd_match - AESD match data
     */
    async _registerErrorSignature(proposal, decision, aesd_match) {
        try {
            // Only register on halt (auto-registration trigger)
            if (!decision.shouldHalt) {
                return;
            }

            // Build error data for registration
            const errorData = {
                proposal: proposal,
                phc_decision: {
                    shouldHalt: decision.shouldHalt,
                    severity: decision.severity,
                    match_percentage: aesd_match?.matchPercentage || 0,
                    iteration_count: decision.component_results.ic?.iterationCount || 0,
                    precedent_found: decision.component_results.cspm?.found || false
                },
                aesd_match: aesd_match?.matchedSessions?.[0] || null,
                session_context: {
                    session_id: this._getCurrentSessionId(),
                    rank: null, // Will be set by memory system
                    project: 'ESMC', // Default, override if available
                    user_message: proposal.description || ''
                }
            };

            // Load and execute ERROR REGISTRAR
            const AegisErrorRegistrar = require('./baeef7f4.js');
            const registrar = new AegisErrorRegistrar();
            await registrar.initialize();

            // Register error signature
            const result = await registrar.registerError(errorData);

            if (result.success) {
                console.log(`✅ AEGIS: Error signature registered (severity: ${result.entry.severity_score})`);
            }

        } catch (error) {
            // Non-blocking - registration failure doesn't affect PHC decision
            console.error('⚠️ AEGIS ERROR REGISTRAR: Auto-registration failed (non-blocking):', error.message);
        }
    }

    /**
     * Get current session ID (helper for error registration)
     * @private
     */
    _getCurrentSessionId() {
        const date = new Date().toISOString().split('T')[0];
        return `${date}-phc-halt-registration`;
    }

    /**
     * 🆕 ESMC 4.1 - Create auto-lesson from PHC halt
     *
     * Closes the learning loop: PHC halt → Lesson created → Future prevention
     * Only creates lesson if similar one doesn't exist
     *
     * @private
     * @param {Object} proposal - ECHELON proposal that triggered halt
     * @param {Object} decision - PHC halt decision
     * @param {Object} results - All detector results
     */
    async _createAutoLessonFromHalt(proposal, decision, results) {
        try {
            const lessonsPath = path.resolve(process.cwd(), '.claude/memory/.esmc-lessons.json');

            let lessons;
            if (fs.existsSync(lessonsPath)) {
                lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8'));
            } else {
                lessons = {
                    version: '1.0.0',
                    system: 'AEGIS + CUP',
                    created: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                    lessons: [],
                    max_entries: 25
                };
            }

            // Check if similar lesson already exists
            const topic = proposal.topic || proposal.description || '';
            const topicLower = topic.toLowerCase();
            const exists = lessons.lessons.some(l =>
                l.trigger_keywords?.some(kw => topicLower.includes(kw.toLowerCase()))
            );

            if (exists) {
                return { created: false, reason: 'Similar lesson already exists' };
            }

            // Generate next lesson ID
            const existingIds = lessons.lessons.map(l => parseInt(l.id.replace('L', ''))).filter(n => !isNaN(n));
            const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 3;
            const lessonId = `L${String(nextId).padStart(3, '0')}`;

            // Extract trigger keywords
            const triggerKeywords = this._extractKeywords(topic);

            // Build lesson from PHC halt
            const lesson = {
                id: lessonId,
                date: new Date().toISOString().split('T')[0],
                category: 'phc_halt_pattern',
                severity: decision.severity === 'critical' ? 'critical' : 'high',
                lesson: `PHC halted approach: "${topic}" - Review precedents before attempting`,
                context: `Auto-generated by PHC halt. Reasons: ${decision.reasons.map(r => r.message).join('; ')}`,
                trigger_keywords: triggerKeywords,
                components_affected: ['ECHELON', 'ATHENA', 'PHC'],
                frustration_score: decision.severity === 'critical' ? 90 : 70,
                repetition_count: results.ic?.iterationCount || 0,
                auto_generated: true,
                phc_halt: true,
                precedent_count: decision.precedents.length,
                halt_reasons: decision.reasons.map(r => ({
                    component: r.component,
                    message: r.message
                }))
            };

            lessons.lessons.push(lesson);
            lessons.last_updated = new Date().toISOString();

            // Enforce max_entries (FIFO rotation for non-critical)
            if (lessons.lessons.length > lessons.max_entries) {
                const nonCritical = lessons.lessons.filter(l => l.severity !== 'critical');
                if (nonCritical.length > 0) {
                    const oldest = nonCritical[0];
                    lessons.lessons = lessons.lessons.filter(l => l.id !== oldest.id);
                }
            }

            fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));

            console.log(`🧠 ATHENA Learning: Auto-created ${lessonId} from PHC halt (severity: ${lesson.severity})`);

            return { created: true, lesson_id: lessonId };
        } catch (error) {
            console.error('⚠️ PHC Auto-lesson creation failed (non-blocking):', error.message);
            return { created: false, error: error.message };
        }
    }

    /**
     * Extract keywords from topic string
     * @private
     */
    _extractKeywords(topic) {
        if (!topic) return [];

        const patterns = [
            'auth', 'login', 'session', 'token', 'jwt', 'oauth',
            'sync', 'build', 'deploy', 'test', 'fix', 'bug',
            'api', 'endpoint', 'route', 'handler', 'middleware',
            'database', 'query', 'schema', 'migration',
            'component', 'hook', 'state', 'props', 'render'
        ];

        const topicLower = topic.toLowerCase();
        const found = patterns.filter(p => topicLower.includes(p));
        const caps = topic.match(/\b[A-Z][A-Za-z]+\b/g) || [];

        return [...new Set([...found, ...caps.map(c => c.toLowerCase())])].slice(0, 10);
    }

    /**
     * Run all detector components
     * @private
     */
    async _runAllDetectors(proposal) {
        const results = {};

        try {
            // Run detectors in parallel
            const promises = [];

            if (this.aesd) {
                promises.push(
                    this.aesd.detectErrorSignature(proposal)
                        .then(r => { results.aesd = r; })
                        .catch(e => { results.aesd = { error: e.message }; })
                );
            }

            if (this.ic) {
                promises.push(
                    this.ic.countIterations(proposal)
                        .then(r => { results.ic = r; })
                        .catch(e => { results.ic = { error: e.message }; })
                );
            }

            if (this.cspm) {
                promises.push(
                    this.cspm.findProblemPrecedents(proposal)
                        .then(r => { results.cspm = r; })
                        .catch(e => { results.cspm = { error: e.message }; })
                );
            }

            if (this.uid) {
                promises.push(
                    this.uid.detectInterventions()
                        .then(r => { results.uid = r; })
                        .catch(e => { results.uid = { error: e.message }; })
                );
            }

            await Promise.all(promises);
        } catch (error) {
            console.error('⚠️ PHC detector execution error:', error.message);
        }

        return results;
    }

    /**
     * Format halt decision for ATHENA dialogue
     */
    formatForDialogue(decision) {
        if (!decision.shouldHalt) {
            return null;
        }

        const severity = decision.severity === 'critical' ? '⛔ CRITICAL HALT' : '⚠️ HALT RECOMMENDED';

        // Build precedent summary
        const precedentSummary = decision.precedents.slice(0, 3).map(p => {
            if (p.source === 'AESD') {
                return `  • Rank ${p.rank}: Error - ${p.error_type} (${Math.round(p.similarity * 100)}% match)`;
            } else if (p.source === 'CSPM') {
                return `  • Rank ${p.rank}: Solution - ${p.solution?.substring(0, 80)}... (${Math.round(p.similarity * 100)}% match)`;
            }
            return `  • Rank ${p.rank}: Reference (${Math.round(p.similarity * 100)}% match)`;
        }).join('\n');

        // Build reason summary
        const reasonSummary = decision.reasons.map(r =>
            `  • ${r.component}: ${r.message}`
        ).join('\n');

        return {
            severity: decision.severity,
            message: `${severity}: Multiple indicators suggest reviewing approach`,
            dialogue: `General, before we proceed, ATHENA has detected multiple warning signals:

${reasonSummary}

Relevant precedents from memory:
${precedentSummary}

Recommendation: Review these precedents before colonel deployment. Shall we adjust our strategic plan based on this intelligence?`,
            details: {
                should_halt: decision.shouldHalt,
                severity: decision.severity,
                reason_count: decision.reasons.length,
                precedent_count: decision.precedents.length,
                recommendations: decision.recommendations,
                component_results: decision.component_results
            }
        };
    }

    /**
     * Create visual precedent display for user review
     */
    formatPrecedentDisplay(decision) {
        if (decision.precedents.length === 0) {
            return null;
        }

        const lines = ['⚠️ ATHENA PRECEDENT REVIEW', '━'.repeat(60), ''];

        for (const [idx, precedent] of decision.precedents.entries()) {
            lines.push(`${idx + 1}. Rank ${precedent.rank} - ${precedent.session_id || 'N/A'}`);
            lines.push(`   Similarity: ${Math.round(precedent.similarity * 100)}%`);

            if (precedent.error_type) {
                lines.push(`   Error Type: ${precedent.error_type}`);
            }
            if (precedent.problem) {
                lines.push(`   Problem: ${precedent.problem.substring(0, 100)}...`);
            }
            if (precedent.solution) {
                lines.push(`   Solution: ${precedent.solution.substring(0, 100)}...`);
            }
            if (precedent.root_cause) {
                lines.push(`   Root Cause: ${precedent.root_cause.substring(0, 100)}...`);
            }

            lines.push('');
        }

        lines.push('━'.repeat(60));
        lines.push('Proceed with current approach or adjust based on precedents?');

        return lines.join('\n');
    }
}

module.exports = AthenaProactiveHaltCheckpoint;

// CLI interface for standalone execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node 9b162e37.js <description> <keywords> <approach>');
        console.log('Note: PHC requires other components (AESD, IC, CSPM, UID) to be initialized');
        process.exit(1);
    }

    // This is a simplified standalone mode - in practice PHC is called by epsilon-athena-coordinator
    console.log('⚠️ PHC standalone mode - Limited functionality');
    console.log('For full functionality, integrate PHC into epsilon-athena-coordinator.js');
    process.exit(0);
}
