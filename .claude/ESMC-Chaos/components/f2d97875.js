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
/** ESMC 3.20 DIP | 2025-10-19 | v3.20.0 | PROD | MAX/VIP
 *  Purpose: Dual Intelligence Presenter - ATLAS vs HYDRA comparison with user selection interface
 *  Features: Side-by-side results | Confidence scores | Learning feedback | Win tracking | Auto-consensus | Adaptive thresholds (Phase 3.3)
 *
 *  Presentation Modes:
 *  1. SIDE_BY_SIDE: Close race (confidence delta < adaptive threshold)
 *  2. WINNER_RUNNER_UP: Clear winner (delta > adaptive threshold)
 *  3. CONSENSUS: Both systems agree on top result
 *  4. AUTO_SELECT: Historical pattern shows 90%+ win rate
 *
 *  Adaptive Thresholds (Phase 3.3):
 *  - 1 keyword: 20% (ATLAS bias)
 *  - 4+ keywords: 20% (HYDRA bias)
 *  - Conversational: 40% (strong ATLAS bias)
 *  - Default: 30%
 *
 *  Learning Loop:
 *  - Track user selections in .intelligence-preferences.json
 *  - Identify patterns (single-keyword → ATLAS, multi-keyword → HYDRA)
 *  - Adaptive skip logic (skip losing system when pattern is clear)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class DualIntelligencePresenter {
    constructor(options = {}) {
        this.version = "3.20.0";
        this.systemName = "DIP";
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');
        this.preferencesPath = path.join(this.memoryPath, '.intelligence-preferences.json');

        // Presentation thresholds
        this.CONFIDENCE_DELTA_THRESHOLD = 0.30; // 30% difference = clear winner
        this.AUTO_SELECT_THRESHOLD = 0.90; // 90% historical win rate

        // Load preferences
        this.preferences = null;

        console.log(`🧠 Dual Intelligence Presenter ${this.version} initialized`);
    }

    /**
     * Auto-detect project root
     * @private
     */
    _findProjectRoot() {
        let current = __dirname;
        let candidates = [];

        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            if (fsSync.existsSync(memoryPath)) {
                candidates.push(current);
            }
            current = path.dirname(current);
        }

        if (candidates.length > 0) {
            return candidates[candidates.length - 1];
        }

        throw new Error('DIP: Could not locate .claude/memory/');
    }

    /**
     * MAIN API: Present dual intelligence results
     *
     * @param {Object} atlasResult - ATLAS retrieval result
     * @param {Object} hydraResult - HYDRA retrieval result
     * @param {Object} context - Query context (keywords, message type, etc.)
     * @returns {Promise<Object>} Presentation data
     */
    async present(atlasResult, hydraResult, context) {
        // Load preferences for learning
        await this._loadPreferences();

        // Determine presentation mode
        const presentationMode = this._determinePresentationMode(
            atlasResult,
            hydraResult,
            context
        );

        // Build presentation data
        const presentation = {
            mode: presentationMode,
            atlas: this._formatResult(atlasResult, 'ATLAS'),
            hydra: this._formatResult(hydraResult, 'HYDRA'),
            comparison: this._buildComparison(atlasResult, hydraResult),
            recommendation: this._buildRecommendation(atlasResult, hydraResult, presentationMode),
            context: context,
            timestamp: new Date().toISOString()
        };

        return presentation;
    }

    /**
     * 🆕 ESMC 3.20: Generate A/B/C user choice interface
     *
     * @param {Object} atlasResult - ATLAS retrieval result
     * @param {Object} hydraResult - HYDRA retrieval result
     * @param {Object} context - Query context
     * @returns {string} Formatted choice UI for display
     */
    formatChoiceInterface(atlasResult, hydraResult, context = {}) {
        const atlasTop = atlasResult.files?.[0] || {};
        const hydraTop = hydraResult.files?.[0] || {};

        const atlasFile = atlasTop.file || atlasTop.path || 'No results';
        const hydraFile = hydraTop.file || hydraTop.path || 'No results';

        const atlasConfidence = ((atlasResult.confidence || 0) * 100).toFixed(0);
        const hydraConfidence = ((hydraResult.confidence || 0) * 100).toFixed(0);

        // Build A/B/C interface
        let output = '\n';
        output += '🧠 **DUAL INTELLIGENCE RESULTS**\n\n';
        output += 'We\'ve found these entries - do they match what you were looking for?\n\n';

        // Option A: ATLAS result
        output += `**A. ATLAS Result** (${atlasConfidence}% confidence)\n`;
        if (atlasFile !== 'No results') {
            output += `   📁 ${atlasFile}\n`;
            if (atlasResult.reasoning) {
                output += `   💡 ${atlasResult.reasoning.split('\n')[0]}\n`;
            }
            output += `   ⚡ Found in: ${this._getTierName(atlasResult.tier)} (${atlasResult.metadata?.duration || '?'}ms)\n`;
        } else {
            output += `   ⚠️  No matches found\n`;
        }
        output += '\n';

        // Option B: HYDRA result
        output += `**B. HYDRA Result** (${hydraConfidence}% confidence)\n`;
        if (hydraFile !== 'No results') {
            output += `   📁 ${hydraFile}\n`;
            if (hydraResult.reasoning) {
                output += `   💡 ${hydraResult.reasoning.split('\n')[0]}\n`;
            }
            const agents = hydraResult.metadata?.agents_succeeded || '?';
            const keywords = hydraResult.keywordCount || '?';
            output += `   ⚡ Parallel search: ${agents}/${keywords} agents (${hydraResult.metadata?.duration || '?'}ms)\n`;
        } else {
            output += `   ⚠️  No matches found\n`;
        }
        output += '\n';

        // Option C: None of the above
        output += `**C. None of the above**\n`;
        output += `   🔍 Continue ATLAS T3 deep dive (+15s extension)\n`;
        output += '\n';

        // Winner indicator (if applicable)
        const delta = Math.abs(atlasResult.confidence - hydraResult.confidence);
        if (delta > 0.20 && atlasResult.confidence > 0 && hydraResult.confidence > 0) {
            const winner = atlasResult.confidence > hydraResult.confidence ? 'ATLAS' : 'HYDRA';
            output += `💡 **Recommendation:** Option ${winner === 'ATLAS' ? 'A' : 'B'} (${winner} has ${(delta * 100).toFixed(0)}% higher confidence)\n\n`;
        }

        return output;
    }

    /**
     * Get tier name for display
     * @private
     */
    _getTierName(tier) {
        const tierNames = {
            1: 'T1 Recent Memory',
            2: 'T2 Topic Index',
            3: 'T3 Deep Scan'
        };
        return tierNames[tier] || `T${tier}`;
    }

    /**
     * Determine which presentation mode to use
     * 🆕 PHASE 3.3: Adaptive confidence thresholds
     * @private
     */
    _determinePresentationMode(atlasResult, hydraResult, context) {
        const keywordCount = context.keywords?.length || 0;

        // 🆕 PHASE 3.3: Adaptive confidence delta threshold
        let threshold = this.CONFIDENCE_DELTA_THRESHOLD; // Default: 0.30 (30%)

        // Adjust threshold based on query type
        if (keywordCount === 1) {
            // Single-keyword: ATLAS usually wins, tighten threshold
            threshold = 0.20; // 20% delta required (vs 30% default)
        } else if (keywordCount >= 4) {
            // Many keywords: HYDRA usually wins, tighten threshold
            threshold = 0.20;
        } else if (context.messageType === 'CONVERSATIONAL') {
            // Recent work queries: ATLAS favored, relax threshold
            threshold = 0.40; // 40% delta required
        }

        console.log(`   📊 DIP: Adaptive threshold = ${(threshold * 100).toFixed(0)}% (${keywordCount} keywords, ${context.messageType || 'TASK_ORIENTED'})`);

        const confidenceDelta = Math.abs(atlasResult.confidence - hydraResult.confidence);

        // Check for consensus (both agree on top result)
        const atlasTopFile = atlasResult.files?.[0]?.file || atlasResult.files?.[0]?.path;
        const hydraTopFile = hydraResult.files?.[0]?.file || hydraResult.files?.[0]?.path;

        if (atlasTopFile && hydraTopFile && atlasTopFile === hydraTopFile) {
            return 'CONSENSUS';
        }

        // Check historical patterns for auto-select
        const historicalWinner = this._checkHistoricalPattern(context);
        if (historicalWinner && this._shouldAutoSelect(historicalWinner, context)) {
            return 'AUTO_SELECT';
        }

        // Clear winner vs close race (using adaptive threshold)
        if (confidenceDelta > threshold) {
            return 'WINNER_RUNNER_UP';
        } else {
            return 'SIDE_BY_SIDE';
        }
    }

    /**
     * Format result for presentation
     * @private
     */
    _formatResult(result, systemName) {
        return {
            system: systemName,
            confidence: (result.confidence * 100).toFixed(0) + '%',
            confidenceRaw: result.confidence,
            topMatch: result.files?.[0]?.file || result.files?.[0]?.path || 'No results',
            totalFiles: result.files?.length || 0,
            reasoning: result.reasoning || 'No reasoning provided',
            metadata: result.metadata || {},
            summary: this._buildSummary(result, systemName)
        };
    }

    /**
     * Build summary for result
     * @private
     */
    _buildSummary(result, systemName) {
        const topFile = result.files?.[0]?.file || result.files?.[0]?.path;

        if (systemName === 'ATLAS') {
            const tier = result.tier || 'unknown';
            return `${topFile} (Found in T${tier} ${tier === 1 ? 'recent memory' : tier === 2 ? 'topic index' : 'deep scan'})`;
        } else {
            const keywordCount = result.keywordCount || 0;
            const frequency = result.files?.[0]?.frequency || 0;
            return `${topFile} (Matched ${frequency}/${keywordCount} keywords)`;
        }
    }

    /**
     * Build comparison data
     * @private
     */
    _buildComparison(atlasResult, hydraResult) {
        const confidenceDelta = Math.abs(atlasResult.confidence - hydraResult.confidence);
        const winner = atlasResult.confidence > hydraResult.confidence ? 'ATLAS' : 'HYDRA';

        return {
            confidenceDelta: (confidenceDelta * 100).toFixed(0) + '%',
            confidenceDeltaRaw: confidenceDelta,
            winner: winner,
            margin: atlasResult.confidence > hydraResult.confidence
                ? atlasResult.confidence - hydraResult.confidence
                : hydraResult.confidence - atlasResult.confidence
        };
    }

    /**
     * Build recommendation
     * @private
     */
    _buildRecommendation(atlasResult, hydraResult, mode) {
        const atlasTopFile = atlasResult.files?.[0]?.file || atlasResult.files?.[0]?.path;
        const hydraTopFile = hydraResult.files?.[0]?.file || hydraResult.files?.[0]?.path;

        switch (mode) {
            case 'CONSENSUS':
                return {
                    action: 'AUTO_PROCEED',
                    message: `Both systems agree on: ${atlasTopFile}`,
                    confidence: Math.max(atlasResult.confidence, hydraResult.confidence)
                };

            case 'AUTO_SELECT':
                const historicalWinner = atlasResult.confidence > hydraResult.confidence ? 'ATLAS' : 'HYDRA';
                return {
                    action: 'AUTO_PROCEED',
                    message: `Auto-selected ${historicalWinner} based on historical pattern (90%+ win rate)`,
                    confidence: Math.max(atlasResult.confidence, hydraResult.confidence)
                };

            case 'WINNER_RUNNER_UP':
                const winner = atlasResult.confidence > hydraResult.confidence ? 'ATLAS' : 'HYDRA';
                return {
                    action: 'SUGGEST_WINNER',
                    message: `${winner} has significantly higher confidence`,
                    confidence: Math.max(atlasResult.confidence, hydraResult.confidence)
                };

            case 'SIDE_BY_SIDE':
            default:
                return {
                    action: 'ASK_USER',
                    message: 'Close race - user selection recommended',
                    confidence: Math.max(atlasResult.confidence, hydraResult.confidence)
                };
        }
    }

    /**
     * Check historical pattern for query type
     * @private
     */
    _checkHistoricalPattern(context) {
        if (!this.preferences || !this.preferences.patterns) {
            return null;
        }

        const keywordCount = context.keywords?.length || 0;

        // Single-keyword queries
        if (keywordCount === 1) {
            const pattern = this.preferences.patterns.single_keyword_queries;
            if (pattern && pattern.atlas_wins + pattern.hydra_wins > 10) {
                const atlasWinRate = pattern.atlas_wins / (pattern.atlas_wins + pattern.hydra_wins);
                if (atlasWinRate > this.AUTO_SELECT_THRESHOLD) return 'ATLAS';
                if (atlasWinRate < (1 - this.AUTO_SELECT_THRESHOLD)) return 'HYDRA';
            }
        }

        // Multi-keyword queries (3+)
        if (keywordCount >= 3) {
            const pattern = this.preferences.patterns.multi_keyword_queries;
            if (pattern && pattern.atlas_wins + pattern.hydra_wins > 10) {
                const atlasWinRate = pattern.atlas_wins / (pattern.atlas_wins + pattern.hydra_wins);
                if (atlasWinRate > this.AUTO_SELECT_THRESHOLD) return 'ATLAS';
                if (atlasWinRate < (1 - this.AUTO_SELECT_THRESHOLD)) return 'HYDRA';
            }
        }

        return null;
    }

    /**
     * Should we auto-select based on historical pattern?
     * @private
     */
    _shouldAutoSelect(historicalWinner, context) {
        // For now, always ask user (learning phase)
        // Later, can enable auto-select when confidence is very high
        return false;
    }

    /**
     * Record user selection for learning
     *
     * @param {string} selection - User's choice ('ATLAS', 'HYDRA', 'BOTH', 'NEITHER')
     * @param {Object} context - Query context
     */
    async recordSelection(selection, context) {
        await this._loadPreferences();

        // Increment global counters
        if (selection === 'ATLAS') {
            this.preferences.atlas_wins++;
        } else if (selection === 'HYDRA') {
            this.preferences.hydra_wins++;
        } else if (selection === 'BOTH') {
            this.preferences.both_selected++;
        } else if (selection === 'NEITHER') {
            this.preferences.neither_selected++;
        }

        // Update patterns based on query type
        const keywordCount = context.keywords?.length || 0;

        if (keywordCount === 1) {
            this._incrementPattern('single_keyword_queries', selection);
        } else if (keywordCount >= 3) {
            this._incrementPattern('multi_keyword_queries', selection);
        }

        // Check message type
        if (context.messageType === 'CONVERSATIONAL') {
            this._incrementPattern('recent_work_queries', selection);
        }

        // Save preferences
        await this._savePreferences();

        console.log(`📊 DIP: Recorded selection "${selection}" for ${keywordCount}-keyword query`);
    }

    /**
     * Increment pattern counter
     * @private
     */
    _incrementPattern(patternName, selection) {
        if (!this.preferences.patterns[patternName]) {
            this.preferences.patterns[patternName] = {
                atlas_wins: 0,
                hydra_wins: 0
            };
        }

        if (selection === 'ATLAS') {
            this.preferences.patterns[patternName].atlas_wins++;
        } else if (selection === 'HYDRA') {
            this.preferences.patterns[patternName].hydra_wins++;
        }
    }

    /**
     * Load intelligence preferences
     * @private
     */
    async _loadPreferences() {
        if (this.preferences) return; // Already loaded

        try {
            const content = await fs.readFile(this.preferencesPath, 'utf-8');
            this.preferences = JSON.parse(content);
        } catch (error) {
            // Initialize new preferences
            this.preferences = {
                atlas_wins: 0,
                hydra_wins: 0,
                both_selected: 0,
                neither_selected: 0,
                patterns: {
                    single_keyword_queries: { atlas_wins: 0, hydra_wins: 0 },
                    multi_keyword_queries: { atlas_wins: 0, hydra_wins: 0 },
                    recent_work_queries: { atlas_wins: 0, hydra_wins: 0 }
                },
                created_at: new Date().toISOString()
            };
        }
    }

    /**
     * Save intelligence preferences
     * @private
     */
    async _savePreferences() {
        this.preferences.updated_at = new Date().toISOString();
        await fs.writeFile(
            this.preferencesPath,
            JSON.stringify(this.preferences, null, 2),
            'utf-8'
        );
    }

    /**
     * Format presentation for display (markdown output)
     *
     * @param {Object} presentation - Presentation data from present()
     * @returns {string} Formatted markdown
     */
    formatMarkdown(presentation) {
        const { mode, atlas, hydra, comparison, recommendation } = presentation;

        let output = '';

        // Header
        output += '╔══════════════════════════════════════════════════════════════╗\n';
        output += '║  🧠 DUAL INTELLIGENCE RESULTS                                ║\n';
        output += '╚══════════════════════════════════════════════════════════════╝\n\n';

        // Presentation based on mode
        if (mode === 'CONSENSUS') {
            output += `✅ **ATLAS + HYDRA Consensus** (${Math.max(atlas.confidenceRaw, hydra.confidenceRaw) * 100}% confident)\n\n`;
            output += `Both systems agree: **${atlas.topMatch}**\n\n`;
            output += `**ATLAS reasoning:** ${atlas.reasoning}\n`;
            output += `**HYDRA reasoning:** ${hydra.reasoning}\n\n`;
            output += '**Auto-proceeding with high-confidence match...**\n';

        } else if (mode === 'WINNER_RUNNER_UP') {
            const winner = comparison.winner === 'ATLAS' ? atlas : hydra;
            const runnerUp = comparison.winner === 'ATLAS' ? hydra : atlas;

            output += `✅ **${comparison.winner}** (${winner.confidence} confident) - Clear Winner\n\n`;
            output += `**Primary Match:** ${winner.topMatch}\n`;
            output += `**Reasoning:** ${winner.reasoning}\n\n`;
            output += `🐍 **${runnerUp.system}** also found: ${runnerUp.topMatch} (${runnerUp.confidence} confident)\n`;
            output += `   Alternative if ${winner.system} result isn't what you need.\n\n`;
            output += `**Confidence delta:** ${comparison.confidenceDelta} (${comparison.winner} leads)\n`;

        } else {
            // SIDE_BY_SIDE
            output += '╔═══════════════════════════╦═══════════════════════════╗\n';
            output += `║ 📍 ATLAS (${atlas.confidence})     ║ 🐍 HYDRA (${hydra.confidence})     ║\n`;
            output += '╠═══════════════════════════╬═══════════════════════════╣\n';
            output += `║ ${this._pad(atlas.topMatch, 25)} ║ ${this._pad(hydra.topMatch, 25)} ║\n`;

            // Show top 3 results from each
            for (let i = 1; i < 3; i++) {
                const atlasFile = atlas.metadata.files?.[i]?.file || atlas.metadata.files?.[i]?.path || '-';
                const hydraFile = hydra.metadata.files?.[i]?.file || hydra.metadata.files?.[i]?.path || '-';
                output += `║ ${this._pad(atlasFile, 25)} ║ ${this._pad(hydraFile, 25)} ║\n`;
            }

            output += '╠═══════════════════════════╬═══════════════════════════╣\n';
            output += `║ Reasoning:                ║ Reasoning:                ║\n`;
            output += `║ ${this._pad(atlas.reasoning.substring(0, 23), 25)} ║ ${this._pad(hydra.reasoning.substring(0, 23), 25)} ║\n`;
            output += '╚═══════════════════════════╩═══════════════════════════╝\n\n';
            output += `**Confidence delta:** ${comparison.confidenceDelta}\n\n`;
        }

        return output;
    }

    /**
     * Pad string to fixed width
     * @private
     */
    _pad(str, width) {
        if (str.length > width) return str.substring(0, width - 3) + '...';
        return str + ' '.repeat(width - str.length);
    }

    /**
     * Get presenter status
     */
    getStatus() {
        return {
            systemName: this.systemName,
            version: this.version,
            preferences: this.preferences,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { DualIntelligencePresenter };

// ═══════════════════════════════════════════════════════════════════════
// TESTING
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    console.log("🧠 ESMC 3.20 - Dual Intelligence Presenter Test\n");

    (async () => {
        const presenter = new DualIntelligencePresenter();

        // Mock ATLAS result
        const atlasResult = {
            system: 'ATLAS',
            confidence: 0.78,
            files: [
                { path: 'src/auth.js', tier: 1 },
                { path: 'src/userService.ts', tier: 1 }
            ],
            tier: 1,
            reasoning: 'Found in recent session "OAuth debugging"',
            metadata: { duration: 450, tier: 1 }
        };

        // Mock HYDRA result
        const hydraResult = {
            system: 'HYDRA',
            confidence: 0.85,
            files: [
                { file: 'src/auth.js', frequency: 4, confidence: 1.0 },
                { file: 'src/login.tsx', frequency: 3, confidence: 0.75 }
            ],
            keywordCount: 4,
            reasoning: 'High confidence: src/auth.js appears in 4/4 keyword sets (100% intersection)',
            metadata: { duration: 2200, agents_spawned: 4, agents_succeeded: 4 }
        };

        const context = {
            keywords: ['authentication', 'bug', 'login', 'handler'],
            messageType: 'TASK_ORIENTED'
        };

        const presentation = await presenter.present(atlasResult, hydraResult, context);

        console.log('📊 PRESENTATION RESULTS:\n');
        console.log(`Mode: ${presentation.mode}`);
        console.log(`Recommendation: ${presentation.recommendation.message}\n`);

        console.log(presenter.formatMarkdown(presentation));

        console.log('\n✅ Presenter Test Complete');
    })();
}
