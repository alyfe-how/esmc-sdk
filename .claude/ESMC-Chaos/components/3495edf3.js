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
/** ESMC 3.19 SEMANTIC LEARNER | 2025-10-18 | v3.19.0 | PROD | ALL_TIERS
 *  Purpose: Semantic category learner - grows keyword dictionaries from CUP word-use patterns
 *  Features: 3 categories (Action/Temporal/Domain) | 30-kw starters | CUP linguistic integration | Dynamic regex | Vocabulary personalization | CIE updates
 *  Philosophy: "Learn user's language over time"
 *
 *  Growth Strategy:
 *  "30 is enough to start, but the system grows with you"
 */

const fs = require('fs').promises;
const path = require('path');

class SemanticCategoryLearner {
    constructor(config = {}) {
        const projectRoot = config.projectRoot || this._findProjectRoot();
        this.config = {
            projectRoot: projectRoot,
            cupProfilePath: config.cupProfilePath || path.join(projectRoot, '.claude', 'memory', '.user-profile.json'),
            categoriesPath: config.categoriesPath || path.join(projectRoot, '.claude', 'memory', 'semantic-categories.json'),
            learningThreshold: config.learningThreshold || 5, // Word must appear 5+ times to be learned
            maxLearnedPerCategory: config.maxLearnedPerCategory || 20, // Max 20 learned keywords per category
            debugMode: config.debugMode || false
        };

        // SEMANTIC CATEGORIES - 30 Keywords Each (Starter Set)
        this.categories = {
            // 1. ACTION/STATE (what the user wants to do)
            actions: {
                base: [
                    'stop', 'start', 'build', 'implement', 'deploy', 'create',
                    'fix', 'update', 'refactor', 'optimize', 'test', 'debug',
                    'add', 'remove', 'modify', 'change', 'improve', 'enhance',
                    'configure', 'setup', 'install', 'run', 'execute', 'launch',
                    'delete', 'restore', 'backup', 'migrate', 'merge', 'commit'
                ],
                learned: [],
                pattern: null
            },

            // 2. TEMPORAL (time-related keywords)
            temporal: {
                base: [
                    'before', 'after', 'during', 'while', 'until', 'since',
                    'now', 'today', 'yesterday', 'tomorrow', 'recent', 'latest',
                    'previous', 'next', 'current', 'last', 'first', 'final',
                    'earlier', 'later', 'soon', 'eventually', 'immediately', 'quickly',
                    'slowly', 'gradually', 'suddenly', 'ongoing', 'pending', 'complete'
                ],
                learned: [],
                pattern: null
            },

            // 3. DOMAIN (technical/project-specific terms)
            domain: {
                base: [
                    'authentication', 'authorization', 'database', 'api', 'endpoint', 'schema',
                    'component', 'module', 'service', 'function', 'class', 'method',
                    'variable', 'constant', 'parameter', 'argument', 'return', 'callback',
                    'async', 'await', 'promise', 'error', 'exception', 'validation',
                    'security', 'encryption', 'token', 'session', 'cache', 'performance'
                ],
                learned: [],
                pattern: null
            }
        };

        this.version = "3.19.0";
        this.systemName = "SemanticCategoryLearner";

        if (this.config.debugMode) {
            console.log(`🧠 Semantic Category Learner ${this.version} initialized`);
        }
    }

    // Find project root by searching for .claude directory
    _findProjectRoot() {
        let currentDir = __dirname;
        const maxDepth = 10;
        let depth = 0;

        while (depth < maxDepth) {
            const claudeDir = path.join(currentDir, '.claude');
            try {
                if (require('fs').existsSync(claudeDir)) {
                    return currentDir;
                }
            } catch (e) {
                // Directory doesn't exist, continue searching
            }

            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) break; // Reached filesystem root
            currentDir = parentDir;
            depth++;
        }

        // Fallback: assume we're in .claude/ESMC Complete/core
        return path.join(__dirname, '../../..');
    }

    /**
     * Load CUP user profile and extract word frequency patterns
     */
    async loadCUPProfile() {
        try {
            const profileData = await fs.readFile(this.config.cupProfilePath, 'utf-8');
            const profile = JSON.parse(profileData);

            if (!profile.linguisticProfile || !profile.linguisticProfile.wordChoiceProfile) {
                if (this.config.debugMode) {
                    console.log('⚠️ CUP profile missing wordChoiceProfile, skipping learning');
                }
                return null;
            }

            return profile.linguisticProfile.wordChoiceProfile;
        } catch (error) {
            if (this.config.debugMode) {
                console.log(`⚠️ Failed to load CUP profile: ${error.message}`);
            }
            return null;
        }
    }

    /**
     * Analyze word frequency and learn new keywords
     */
    async learnFromCUP() {
        const wordChoiceProfile = await this.loadCUPProfile();
        if (!wordChoiceProfile) return { learned: 0, categories: {} };

        const results = {
            learned: 0,
            categories: {
                actions: [],
                temporal: [],
                domain: []
            }
        };

        // Load existing learned categories
        await this.loadLearnedCategories();

        // Analyze each category
        for (const [category, data] of Object.entries(this.categories)) {
            const newKeywords = this._identifyNewKeywords(
                wordChoiceProfile,
                data.base,
                data.learned,
                category
            );

            if (newKeywords.length > 0) {
                // Add to learned array (max limit)
                const slotsAvailable = this.config.maxLearnedPerCategory - data.learned.length;
                const toAdd = newKeywords.slice(0, slotsAvailable);

                data.learned.push(...toAdd);
                results.categories[category] = toAdd;
                results.learned += toAdd.length;

                if (this.config.debugMode) {
                    console.log(`📚 Learned ${toAdd.length} new ${category}: ${toAdd.join(', ')}`);
                }
            }
        }

        // Save learned categories
        if (results.learned > 0) {
            await this.saveLearnedCategories();
            this._regeneratePatterns();
        }

        return results;
    }

    /**
     * Identify new keywords from word choice profile
     */
    _identifyNewKeywords(wordChoiceProfile, baseKeywords, learnedKeywords, category) {
        const allExisting = [...baseKeywords, ...learnedKeywords];
        const newKeywords = [];

        // Extract high-frequency words
        const frequentWords = Object.entries(wordChoiceProfile)
            .filter(([word, count]) => count >= this.config.learningThreshold)
            .map(([word]) => word.toLowerCase())
            .filter(word => !allExisting.includes(word));

        // Category-specific filtering
        for (const word of frequentWords) {
            if (this._matchesCategory(word, category)) {
                newKeywords.push(word);
            }
        }

        return newKeywords;
    }

    /**
     * Check if word matches category pattern
     */
    _matchesCategory(word, category) {
        // Simple heuristic matching
        if (category === 'actions') {
            // Action words typically end in common verb suffixes
            return /^(add|create|delete|remove|update|build|deploy|fix|test|run|execute|start|stop|modify|change|improve|setup|install|configure|migrate|restore|backup|merge|commit|implement|refactor|optimize|debug|enhance|launch)/i.test(word);
        }

        if (category === 'temporal') {
            // Temporal words relate to time
            return /^(before|after|during|while|until|since|now|today|yesterday|tomorrow|recent|latest|previous|next|current|last|first|final|earlier|later|soon|eventually|immediately|quickly|slowly|gradually|suddenly|ongoing|pending|complete)/i.test(word);
        }

        if (category === 'domain') {
            // Domain words are technical terms (typically longer, lowercase)
            return word.length >= 5 && /^[a-z]+$/.test(word);
        }

        return false;
    }

    /**
     * Load learned categories from disk
     */
    async loadLearnedCategories() {
        try {
            const data = await fs.readFile(this.config.categoriesPath, 'utf-8');
            const saved = JSON.parse(data);

            if (saved.version === this.version) {
                this.categories.actions.learned = saved.actions || [];
                this.categories.temporal.learned = saved.temporal || [];
                this.categories.domain.learned = saved.domain || [];

                if (this.config.debugMode) {
                    console.log(`📂 Loaded learned categories (${saved.actions.length + saved.temporal.length + saved.domain.length} total)`);
                }
            }
        } catch (error) {
            // File doesn't exist or invalid JSON, start fresh
            if (this.config.debugMode) {
                console.log('📂 No existing learned categories, starting fresh');
            }
        }
    }

    /**
     * Save learned categories to disk
     */
    async saveLearnedCategories() {
        const data = {
            version: this.version,
            lastUpdated: new Date().toISOString(),
            actions: this.categories.actions.learned,
            temporal: this.categories.temporal.learned,
            domain: this.categories.domain.learned
        };

        await fs.writeFile(this.config.categoriesPath, JSON.stringify(data, null, 2), 'utf-8');

        if (this.config.debugMode) {
            console.log(`💾 Saved learned categories to ${this.config.categoriesPath}`);
        }
    }

    /**
     * Regenerate regex patterns from base + learned keywords
     */
    _regeneratePatterns() {
        for (const [category, data] of Object.entries(this.categories)) {
            const allKeywords = [...data.base, ...data.learned];
            data.pattern = new RegExp(`\\b(${allKeywords.join('|')})\\b`, 'i');
        }
    }

    /**
     * Get all keywords for a category (base + learned)
     */
    getCategory(categoryName) {
        const category = this.categories[categoryName];
        if (!category) return [];

        return [...category.base, ...category.learned];
    }

    /**
     * Get regex pattern for a category
     */
    getCategoryPattern(categoryName) {
        const category = this.categories[categoryName];
        if (!category) return null;

        if (!category.pattern) {
            this._regeneratePatterns();
        }

        return category.pattern;
    }

    /**
     * Get status and statistics
     */
    getStatus() {
        return {
            version: this.version,
            system: this.systemName,
            categories: {
                actions: {
                    base: this.categories.actions.base.length,
                    learned: this.categories.actions.learned.length,
                    total: this.categories.actions.base.length + this.categories.actions.learned.length
                },
                temporal: {
                    base: this.categories.temporal.base.length,
                    learned: this.categories.temporal.learned.length,
                    total: this.categories.temporal.base.length + this.categories.temporal.learned.length
                },
                domain: {
                    base: this.categories.domain.base.length,
                    learned: this.categories.domain.learned.length,
                    total: this.categories.domain.base.length + this.categories.domain.learned.length
                }
            },
            config: {
                learningThreshold: this.config.learningThreshold,
                maxLearnedPerCategory: this.config.maxLearnedPerCategory
            }
        };
    }
}

// Export for integration
module.exports = SemanticCategoryLearner;

// Standalone test execution
if (require.main === module) {
    (async () => {
        console.log('🧪 Testing Semantic Category Learner 3.19...\n');

        const learner = new SemanticCategoryLearner({ debugMode: true });

        // Load learned categories
        await learner.loadLearnedCategories();

        // Show status
        const status = learner.getStatus();
        console.log('\n📊 Current Status:');
        console.log(JSON.stringify(status, null, 2));

        // Try learning from CUP
        console.log('\n🧠 Attempting to learn from CUP profile...');
        const results = await learner.learnFromCUP();
        console.log(`\n✅ Learning complete: ${results.learned} new keywords`);

        if (results.learned > 0) {
            console.log('New keywords by category:');
            for (const [category, keywords] of Object.entries(results.categories)) {
                if (keywords.length > 0) {
                    console.log(`  ${category}: ${keywords.join(', ')}`);
                }
            }
        }

        // Final status
        const finalStatus = learner.getStatus();
        console.log('\n📊 Final Status:');
        console.log(JSON.stringify(finalStatus, null, 2));
    })();
}
