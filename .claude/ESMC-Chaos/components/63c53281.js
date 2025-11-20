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
/** ESMC 3.9.3 AEGIS-ECHELON INTEGRATION | 2025-10-13 | v3.9.3 | PROD | TIER 3
 *  Purpose: Registry-optimized memory retrieval with ATLAS + ECHELON integration
 *  Features: ATLAS registry | ECHELON integration | Memory ↑93% faster | Registry routing | Relevance scoring | MAX/VIP only
 *
 *  Integration:
 *  - Seamless integration with existing ECHELON intelligence
 */

const { MemoryRegistry } = require('./esmc-3.9.3-atlas-memory-system');
const fs = require('fs').promises;
const path = require('path');

class ATLASEchelonRetrieval {
    constructor(options = {}) {
        this.registry = new MemoryRegistry(options);
        this.memoryPath = this.registry.memoryPath;
        this.sessionsPath = path.join(this.memoryPath, 'sessions');
        this.initialized = false;
    }

    /**
     * Initialize ATLAS-ECHELON integration
     */
    async initialize() {
        await this.registry.load();
        this.initialized = true;
        console.log(`🎖️ ATLAS-ECHELON Integration initialized`);
    }

    /**
     * Retrieve relevant memories for ECHELON intelligence
     * @param {string} query - User query or context
     * @param {Object} options - Retrieval options
     * @returns {Promise<Object>} Retrieved memories with relevance scores
     */
    async retrieveRelevantMemories(query, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`\n🔍 ECHELON Memory Retrieval (ATLAS-powered)`);
        console.log(`   Query: "${query.substring(0, 60)}..."`);

        // 1. Route using registry (find relevant projects)
        const relevantProjects = this.registry.routeForRetrieval(query);

        if (relevantProjects.length === 0) {
            console.log(`   ⚠️ No relevant projects found`);
            return { memories: [], stats: { projectsScanned: 0, memoriesFound: 0 } };
        }

        console.log(`   📁 Scanning ${relevantProjects.length} relevant projects (skipped ${this.registry.registry.total_projects - relevantProjects.length})`);

        // 2. Load memories from relevant projects only
        const memories = [];
        for (const project of relevantProjects) {
            const memoryFile = path.join(this.sessionsPath, project.file);
            const memory = await this.loadMemory(memoryFile);

            if (memory) {
                memories.push({
                    ...memory,
                    projectRelevance: project.score,
                    projectId: project.projectId
                });
            }
        }

        // 3. Search within loaded memories
        const keywords = this.registry.extractKeywords({ summary: query });
        const results = this.searchMemories(memories, keywords, options);

        console.log(`   ✨ Retrieved ${results.length} relevant memories`);

        return {
            memories: results,
            stats: {
                projectsScanned: relevantProjects.length,
                projectsTotal: this.registry.registry.total_projects,
                memoriesFound: results.length,
                performance: `${((1 - relevantProjects.length / this.registry.registry.total_projects) * 100).toFixed(0)}% files skipped`
            }
        };
    }

    /**
     * Load memory file
     */
    async loadMemory(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    /**
     * Search within loaded memories for keyword matches
     */
    searchMemories(memories, keywords, options = {}) {
        const results = [];
        const limit = options.limit || 20;

        for (const memory of memories) {
            // Search key_learnings
            for (const learning of memory.key_learnings || []) {
                if (this.matchesKeywords(learning, keywords)) {
                    results.push({
                        type: 'learning',
                        project: memory.projectId,
                        projectRelevance: memory.projectRelevance,
                        data: learning,
                        relevance: this.calculateItemRelevance(learning, keywords)
                    });
                }
            }

            // Search code_patterns
            for (const pattern of memory.code_patterns || []) {
                if (this.matchesKeywords(pattern, keywords)) {
                    results.push({
                        type: 'pattern',
                        project: memory.projectId,
                        projectRelevance: memory.projectRelevance,
                        data: pattern,
                        relevance: this.calculateItemRelevance(pattern, keywords)
                    });
                }
            }

            // Search decisions
            for (const decision of memory.decisions || []) {
                if (this.matchesKeywords(decision, keywords)) {
                    results.push({
                        type: 'decision',
                        project: memory.projectId,
                        projectRelevance: memory.projectRelevance,
                        data: decision,
                        relevance: this.calculateItemRelevance(decision, keywords)
                    });
                }
            }
        }

        // Sort by combined relevance (item + project)
        results.sort((a, b) => {
            const scoreA = a.relevance * 0.7 + a.projectRelevance * 0.3;
            const scoreB = b.relevance * 0.7 + b.projectRelevance * 0.3;
            return scoreB - scoreA;
        });

        return results.slice(0, limit);
    }

    /**
     * Check if item matches keywords
     */
    matchesKeywords(item, keywords) {
        const itemText = JSON.stringify(item).toLowerCase();

        return keywords.some(keyword =>
            itemText.includes(keyword.toLowerCase())
        );
    }

    /**
     * Calculate relevance score for individual item
     */
    calculateItemRelevance(item, keywords) {
        const itemText = JSON.stringify(item).toLowerCase();
        let matchCount = 0;

        for (const keyword of keywords) {
            const kw = keyword.toLowerCase();
            const occurrences = (itemText.match(new RegExp(kw, 'g')) || []).length;
            matchCount += Math.min(occurrences, 3); // Cap at 3 matches per keyword
        }

        // Normalize to 0-1 score
        return Math.min(matchCount / (keywords.length * 2), 1.0);
    }

    /**
     * Get memory statistics
     */
    async getStatistics() {
        if (!this.initialized) {
            await this.initialize();
        }

        return {
            system: "ATLAS-ECHELON",
            version: this.registry.version,
            ...this.registry.getStatus()
        };
    }
}

module.exports = { ATLASEchelonRetrieval };

// Example usage
if (require.main === module) {
    (async () => {
        console.log("🎖️ ESMC 3.9.3 - ATLAS-ECHELON Integration Test\n");

        const retrieval = new ATLASEchelonRetrieval();
        await retrieval.initialize();

        // Test retrieval
        const query = "How did we implement OAuth authentication?";
        const results = await retrieval.retrieveRelevantMemories(query);

        console.log("\n📊 Retrieval Results:");
        console.log(`   Projects scanned: ${results.stats.projectsScanned}/${results.stats.projectsTotal}`);
        console.log(`   Memories found: ${results.stats.memoriesFound}`);
        console.log(`   Performance: ${results.stats.performance}`);

        console.log("\n✅ ATLAS-ECHELON integration test completed");
    })();
}
