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
/** ESMC 3.9.1 CONVERSATION SCOPE MANAGER | 2025-10-13 | v3.9.1 | PROD | TIER 2
 *  Purpose: ATLAS scope detection with intelligent persistence and shift detection
 *  Features: Scope shift detection | ATLAS persistence | Scan ↓80% redundancy | Keyword overlap analysis | Smart triggering
 *  ✅ Keyword-based scope detection | ✅ Scope overlap calculation | ✅ ATLAS result caching per scope
 *  ✅ Automatic scope shift detection | ✅ Configurable overlap threshold
 */

class ConversationScopeManager {
    constructor(options = {}) {
        this.version = "3.9.1";
        this.scopeShiftThreshold = options.scopeShiftThreshold || 0.40; // < 40% overlap = scope shift

        // Current conversation scope
        this.currentScope = {
            keywords: new Set(),
            primaryKeywords: [],
            domain: null,
            atlasResults: null,
            sessionStarted: Date.now(),
            lastUpdated: Date.now()
        };

        // Scope history
        this.scopeHistory = [];

        console.log(`🎯 Conversation Scope Manager ${this.version} initialized`);
        console.log(`   Scope shift threshold: ${(this.scopeShiftThreshold * 100).toFixed(0)}% keyword overlap`);
    }

    /**
     * Analyze new prompt and determine if scope shift occurred
     * @param {Object} keywords - Extracted keywords from KeywordExtractor
     * @returns {Object} Scope analysis with shift detection
     */
    analyzeScopeShift(keywords) {
        console.log(`\n🎯 SCOPE MANAGER: Analyzing scope shift...`);

        // First prompt of conversation - establish initial scope
        if (this.currentScope.keywords.size === 0) {
            this._establishScope(keywords);
            return {
                isFirstPrompt: true,
                scopeShift: false,
                shouldTriggerATLAS: true,
                reason: 'First prompt - establishing conversation scope',
                currentScope: this._getCurrentScopeInfo(),
                atlasCacheAvailable: false
            };
        }

        // Extract new keywords
        const newKeywords = this._extractKeywordSet(keywords);

        // Calculate overlap with current scope
        const overlap = this._calculateOverlap(this.currentScope.keywords, newKeywords);

        console.log(`   Current scope: ${Array.from(this.currentScope.keywords).join(', ')}`);
        console.log(`   New keywords: ${Array.from(newKeywords).join(', ')}`);
        console.log(`   Keyword overlap: ${(overlap * 100).toFixed(1)}%`);

        // Scope shift detected
        if (overlap < this.scopeShiftThreshold) {
            console.log(`   🔄 SCOPE SHIFT DETECTED (overlap < ${(this.scopeShiftThreshold * 100).toFixed(0)}%)`);

            // Archive current scope
            this._archiveCurrentScope();

            // Establish new scope
            this._establishScope(keywords);

            return {
                isFirstPrompt: false,
                scopeShift: true,
                shouldTriggerATLAS: true,
                reason: `Scope shift detected - ${(overlap * 100).toFixed(0)}% overlap below ${(this.scopeShiftThreshold * 100).toFixed(0)}% threshold`,
                previousScope: this.scopeHistory[this.scopeHistory.length - 1],
                currentScope: this._getCurrentScopeInfo(),
                overlap: overlap,
                atlasCacheAvailable: false
            };
        }

        // Same scope - use cached ATLAS results
        console.log(`   ✅ SAME SCOPE (overlap ${(overlap * 100).toFixed(0)}% >= ${(this.scopeShiftThreshold * 100).toFixed(0)}%)`);

        // Update scope with new keywords (expand scope within same domain)
        this._updateScope(keywords, newKeywords);

        return {
            isFirstPrompt: false,
            scopeShift: false,
            shouldTriggerATLAS: false,
            reason: `Same scope - reusing ATLAS cache (${(overlap * 100).toFixed(0)}% overlap)`,
            currentScope: this._getCurrentScopeInfo(),
            atlasCacheAvailable: !!this.currentScope.atlasResults,
            cachedATLASResults: this.currentScope.atlasResults
        };
    }

    /**
     * Cache ATLAS scan results for current scope
     * @param {Object} atlasResults - Results from ATLAS pattern scanner
     */
    cacheATLASResults(atlasResults) {
        this.currentScope.atlasResults = {
            ...atlasResults,
            cachedAt: Date.now()
        };

        console.log(`📦 SCOPE MANAGER: ATLAS results cached for scope "${this.currentScope.domain || 'general'}"`);
        console.log(`   Patterns found: ${atlasResults.totalFound || 0}`);
    }

    /**
     * Get cached ATLAS results for current scope
     * @returns {Object|null} Cached ATLAS results or null
     */
    getCachedATLASResults() {
        if (!this.currentScope.atlasResults) return null;

        const age = Date.now() - this.currentScope.atlasResults.cachedAt;
        const ageMinutes = Math.floor(age / 1000 / 60);

        console.log(`📦 SCOPE MANAGER: Retrieving cached ATLAS results (age: ${ageMinutes} minutes)`);

        return this.currentScope.atlasResults;
    }

    /**
     * Establish initial or new scope
     * @private
     */
    _establishScope(keywords) {
        const keywordSet = this._extractKeywordSet(keywords);
        const primaryKeywords = keywords.primaryKeywords?.map(k => k.keyword) || [];
        const domain = this._inferDomain(keywords);

        this.currentScope = {
            keywords: keywordSet,
            primaryKeywords: primaryKeywords,
            domain: domain,
            atlasResults: null,
            sessionStarted: Date.now(),
            lastUpdated: Date.now()
        };

        console.log(`   🎯 NEW SCOPE ESTABLISHED: "${domain || 'general'}"`);
        console.log(`   Keywords: ${Array.from(keywordSet).join(', ')}`);
    }

    /**
     * Update existing scope with new keywords
     * @private
     */
    _updateScope(keywords, newKeywords) {
        // Add new keywords to existing scope (scope expansion)
        newKeywords.forEach(keyword => this.currentScope.keywords.add(keyword));

        this.currentScope.lastUpdated = Date.now();

        console.log(`   📝 Scope updated: ${Array.from(this.currentScope.keywords).join(', ')}`);
    }

    /**
     * Archive current scope to history
     * @private
     */
    _archiveCurrentScope() {
        const scopeDuration = Date.now() - this.currentScope.sessionStarted;

        this.scopeHistory.push({
            ...this.currentScope,
            scopeEnded: Date.now(),
            duration: scopeDuration
        });

        console.log(`   📚 Scope archived: "${this.currentScope.domain || 'general'}" (duration: ${Math.floor(scopeDuration / 1000 / 60)} minutes)`);
    }

    /**
     * Extract keyword set from keyword extraction results
     * @private
     */
    _extractKeywordSet(keywords) {
        const keywordSet = new Set();

        // Add primary keywords
        if (keywords.primaryKeywords) {
            keywords.primaryKeywords.forEach(k => {
                keywordSet.add(k.keyword.toLowerCase());
            });
        }

        // Add action keywords
        if (keywords.actionKeywords) {
            keywords.actionKeywords.forEach(k => {
                keywordSet.add(k.action.toLowerCase());
            });
        }

        // Add entity keywords
        if (keywords.entityKeywords) {
            keywords.entityKeywords.forEach(k => {
                keywordSet.add(k.entity.toLowerCase());
            });
        }

        // Add technology keywords
        if (keywords.technologyKeywords) {
            keywords.technologyKeywords.forEach(k => {
                keywordSet.add(k.technology.toLowerCase());
            });
        }

        // Add domain keywords
        if (keywords.domainKeywords) {
            keywords.domainKeywords.forEach(k => {
                keywordSet.add(k.domain.toLowerCase());
            });
        }

        return keywordSet;
    }

    /**
     * Calculate overlap between two keyword sets
     * @private
     */
    _calculateOverlap(set1, set2) {
        if (set1.size === 0 || set2.size === 0) return 0;

        const intersection = new Set([...set1].filter(k => set2.has(k)));
        const union = new Set([...set1, ...set2]);

        // Jaccard similarity coefficient
        return intersection.size / union.size;
    }

    /**
     * Infer conversation domain from keywords
     * @private
     */
    _inferDomain(keywords) {
        // Priority 1: Explicit domain keywords
        if (keywords.domainKeywords && keywords.domainKeywords.length > 0) {
            return keywords.domainKeywords[0].domain;
        }

        // Priority 2: Technology keywords
        if (keywords.technologyKeywords && keywords.technologyKeywords.length > 0) {
            return keywords.technologyKeywords[0].technology;
        }

        // Priority 3: Entity keywords
        if (keywords.entityKeywords && keywords.entityKeywords.length > 0) {
            return keywords.entityKeywords[0].entity;
        }

        // Priority 4: Primary keywords
        if (keywords.primaryKeywords && keywords.primaryKeywords.length > 0) {
            return keywords.primaryKeywords[0].keyword;
        }

        return 'general';
    }

    /**
     * Get current scope information
     * @private
     */
    _getCurrentScopeInfo() {
        return {
            domain: this.currentScope.domain,
            keywords: Array.from(this.currentScope.keywords),
            primaryKeywords: this.currentScope.primaryKeywords,
            atlasCached: !!this.currentScope.atlasResults,
            sessionDuration: Math.floor((Date.now() - this.currentScope.sessionStarted) / 1000 / 60)
        };
    }

    /**
     * Get manager status
     */
    getStatus() {
        return {
            version: this.version,
            currentScope: this._getCurrentScopeInfo(),
            scopeShiftThreshold: this.scopeShiftThreshold,
            scopeHistoryCount: this.scopeHistory.length,
            atlasCacheAvailable: !!this.currentScope.atlasResults,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reset conversation scope (new conversation)
     */
    reset() {
        if (this.currentScope.keywords.size > 0) {
            this._archiveCurrentScope();
        }

        this.currentScope = {
            keywords: new Set(),
            primaryKeywords: [],
            domain: null,
            atlasResults: null,
            sessionStarted: Date.now(),
            lastUpdated: Date.now()
        };

        console.log(`🔄 SCOPE MANAGER: Conversation scope reset`);
    }
}

module.exports = { ConversationScopeManager };

// Example usage
if (require.main === module) {
    console.log("🎯 ESMC 3.9.1 - Conversation Scope Manager Test");

    const scopeManager = new ConversationScopeManager();

    // Simulate conversation flow
    console.log("\n=== PROMPT 1: Implement OAuth2 authentication ===");
    const scope1 = scopeManager.analyzeScopeShift({
        primaryKeywords: [
            { keyword: 'oauth2', weight: 1.0 },
            { keyword: 'authentication', weight: 0.9 }
        ],
        technologyKeywords: [
            { technology: 'passport', category: 'authentication' }
        ]
    });
    console.log(`Result: ${scope1.reason}`);
    console.log(`Should trigger ATLAS: ${scope1.shouldTriggerATLAS}`);

    // Cache ATLAS results
    scopeManager.cacheATLASResults({ totalFound: 3, scanTime: 30 });

    console.log("\n=== PROMPT 2: Add JWT refresh tokens ===");
    const scope2 = scopeManager.analyzeScopeShift({
        primaryKeywords: [
            { keyword: 'jwt', weight: 1.0 },
            { keyword: 'authentication', weight: 0.9 },
            { keyword: 'refresh', weight: 0.8 }
        ],
        technologyKeywords: [
            { technology: 'jsonwebtoken', category: 'authentication' }
        ]
    });
    console.log(`Result: ${scope2.reason}`);
    console.log(`Should trigger ATLAS: ${scope2.shouldTriggerATLAS}`);
    console.log(`ATLAS cache available: ${scope2.atlasCacheAvailable}`);

    console.log("\n=== PROMPT 3: Create analytics dashboard ===");
    const scope3 = scopeManager.analyzeScopeShift({
        primaryKeywords: [
            { keyword: 'analytics', weight: 1.0 },
            { keyword: 'dashboard', weight: 0.9 }
        ],
        technologyKeywords: [
            { technology: 'chart.js', category: 'visualization' }
        ]
    });
    console.log(`Result: ${scope3.reason}`);
    console.log(`Should trigger ATLAS: ${scope3.shouldTriggerATLAS}`);
    console.log(`Overlap: ${scope3.overlap ? (scope3.overlap * 100).toFixed(0) + '%' : 'N/A'}`);

    console.log("\n✅ Conversation scope manager test completed");
}
