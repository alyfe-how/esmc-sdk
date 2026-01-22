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
/** ESMC 3.37 AEGIS SEED | 2025-10-30 | v1.0.0 | PROD | MAX/VIP
 *  Purpose: Smart Seed system - intelligently merge sessions into existing project memory
 *  Features: Memory routing | Intelligent merge | FIFO maintenance | Project map rebuild
 *  Philosophy: "Passing vs Diving" - Sessions (brief) vs Documents (deep)
 *  Token Budget: ~14,500 tokens (61.8% savings vs monolith)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { findProjectRoot, AEGIS_VERSION, AEGIS_SYSTEM_NAME, AEGIS_TIER, validateSessionFilename, extractTopicSlug, formatDate } = require('./aegis-core');

// ═══════════════════════════════════════════════════════════════════════
// SINGLETON REGISTRY INSTANCE (Session-scoped, Race-Safe)
// ═══════════════════════════════════════════════════════════════════════
let _registryPromise = null;
let _registryWatcher = null;

/**
 * Close registry file watcher (prevent resource leaks)
 * @added ESMC 3.13.3
 */
function closeRegistryWatcher() {
    if (_registryWatcher) {
        try {
            _registryWatcher.close();
            _registryWatcher = null;
            console.log('   🔒 Registry file watcher closed');
        } catch (error) {
            console.warn(`   ⚠️ Failed to close watcher: ${error.message}`);
        }
    }
}

// Auto-cleanup on process exit (prevent resource leaks)
process.on('exit', closeRegistryWatcher);
process.on('SIGINT', () => {
    closeRegistryWatcher();
    process.exit(0);
});
process.on('SIGTERM', () => {
    closeRegistryWatcher();
    process.exit(0);
});

/**
 * 🎖️ ESMC 3.13 P1 - Get singleton MemoryRegistry instance (Race-Safe)
 * Lazy loads registry once per session, reuses across requests
 * Invalidates on file change via fs.watch
 *
 * @fixed ESMC 3.13.1 - Promise-based locking prevents race condition
 */
async function getMemoryRegistry(options = {}) {
    if (!_registryPromise) {
        _registryPromise = (async () => {
            try {
                const registry = new MemoryRegistry(options);
                await registry.load();

                // Setup file watcher for invalidation (non-blocking)
                if (!_registryWatcher) {
                    try {
                        const registryPath = path.join(registry.memoryPath, '.memory-registry.json');
                        _registryWatcher = fsSync.watch(registryPath, (eventType) => {
                            if (eventType === 'change') {
                                console.log('   🔄 Registry changed on disk, invalidating singleton...');
                                _registryPromise = null;
                            }
                        });
                    } catch (error) {
                        // Non-critical if watch fails
                        console.warn(`   ⚠️ Registry watch setup failed: ${error.message}`);
                    }
                }

                return registry;
            } catch (error) {
                // P2 Fix: Clear promise on failure to allow retry
                _registryPromise = null;
                throw error;
            }
        })();
    }

    return _registryPromise;
}

// ═══════════════════════════════════════════════════════════════════════
// MEMORY REGISTRY - UNIFIED ROUTING SYSTEM
// ═══════════════════════════════════════════════════════════════════════

class MemoryRegistry {
    constructor(options = {}) {
        this.version = "3.37.0"; // Modular split version
        this.systemName = AEGIS_SYSTEM_NAME;
        this.tier = AEGIS_TIER;
        this.projectRoot = options.projectRoot || findProjectRoot(undefined, { validateRegistry: true });
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');
        this.registryPath = path.join(this.memoryPath, '.memory-registry.json');
        this.registry = null;
        this.loadTime = null; // Track load time for singleton

        console.log(`🎖️ AEGIS Memory Registry ${this.version} initialized (${this.tier})`);
    }

    /**
     * Load registry from disk or create default
     */
    async load() {
        try {
            const content = await fs.readFile(this.registryPath, 'utf8');
            this.registry = JSON.parse(content);
            console.log(`   📚 Loaded registry: ${Object.keys(this.registry.projects || {}).length} projects`);

            return this.registry;
        } catch (error) {
            console.log(`   📝 Creating default registry...`);
            this.registry = this.createDefaultRegistry();
            await this.save();
            return this.registry;
        }
    }

    /**
     * Create default registry structure
     */
    createDefaultRegistry() {
        return {
            version: this.version,
            system: AEGIS_SYSTEM_NAME,
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            total_projects: 0,
            total_sessions: 0,
            total_size_kb: 0,

            projects: {},

            categories: {
                frontend: [],
                backend: [],
                security: [],
                devops: [],
                core: [],
                documentation: []
            },

            routing_rules: {
                keyword_patterns: {
                    "website|dashboard|pricing|landing|frontend|nextjs": "esmc-website",
                    "sdk|mcp|portable|cli|build|package": "esmc-sdk",
                    "auth|oauth|jwt|login|firebase|session|token": "authentication-security",
                    "build|deploy|pipeline|vercel|production|ci/cd": "build-deployment",
                    "colonel|intelligence|echelon|atlas|phoenix": "esmc-core"
                },

                file_patterns: {
                    "src/app/**": "esmc-website",
                    "esmc-sdk/**": "esmc-sdk",
                    "*/api/auth/**": "authentication-security",
                    "scripts/build*": "build-deployment",
                    ".claude/ESMC Complete/**": "esmc-core"
                },

                default_project: "esmc-general"
            },

            metadata: {
                migration_date: null,
                original_sessions: 0,
                consolidated_projects: 0,
                compression_ratio: 0
            }
        };
    }

    /**
     * Route for seeding (WRITE) - Find best project for new session
     */
    routeForSeeding(sessionData) {
        const keywords = this.extractKeywords(sessionData);
        const projectId = this.findBestProject(keywords, sessionData);

        console.log(`   🎯 ATLAS: Routed to project "${projectId}"`);

        return {
            projectId,
            keywords,
            projectInfo: this.registry.projects[projectId] || null
        };
    }

    /**
     * Route for retrieval (READ) - Find relevant projects for query
     */
    routeForRetrieval(query) {
        const keywords = this.extractKeywords({ summary: query, keywords: [] });
        const relevantProjects = this.findRelevantProjects(keywords);

        console.log(`   🔍 ATLAS: Found ${relevantProjects.length} relevant projects`);

        return relevantProjects;
    }

    /**
     * Extract keywords from session data or query
     */
    extractKeywords(data) {
        const text = typeof data === 'string'
            ? data
            : JSON.stringify({
                summary: data.summary || '',
                project: data.project || '',
                keywords: data.keywords || []
            });

        const keywords = new Set();

        // Extract from existing keywords array
        if (data.keywords && Array.isArray(data.keywords)) {
            data.keywords.forEach(k => keywords.add(k.toLowerCase()));
        }

        // Extract significant words from text
        const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'been', 'will']);

        words.forEach(word => {
            if (!stopWords.has(word)) {
                keywords.add(word);
            }
        });

        return Array.from(keywords);
    }

    /**
     * Find best single project for seeding
     */
    findBestProject(keywords, sessionData = {}) {
        // Try routing rules first (keyword patterns)
        for (const [pattern, projectId] of Object.entries(this.registry.routing_rules.keyword_patterns)) {
            const regex = new RegExp(pattern, 'i');
            if (keywords.some(kw => regex.test(kw))) {
                return projectId;
            }
        }

        // Try file patterns if files provided
        if (sessionData.files && Array.isArray(sessionData.files)) {
            for (const file of sessionData.files) {
                for (const [pattern, projectId] of Object.entries(this.registry.routing_rules.file_patterns)) {
                    if (this.matchesFilePattern(file, pattern)) {
                        return projectId;
                    }
                }
            }
        }

        // Fall back to relevance scoring
        const relevantProjects = this.findRelevantProjects(keywords);
        if (relevantProjects.length > 0) {
            return relevantProjects[0].projectId;
        }

        // Use default project
        return this.registry.routing_rules.default_project;
    }

    /**
     * Find multiple relevant projects for retrieval (sorted by relevance)
     */
    findRelevantProjects(keywords) {
        const scores = {};

        // Score each project
        for (const [projectId, project] of Object.entries(this.registry.projects)) {
            scores[projectId] = this.calculateRelevance(keywords, project);
        }

        // Return projects with >30% relevance, sorted by score
        return Object.entries(scores)
            .filter(([_, score]) => score > 0.3)
            .sort(([_, a], [__, b]) => b - a)
            .map(([projectId, score]) => ({
                projectId,
                file: this.registry.projects[projectId].file,
                score,
                category: this.registry.projects[projectId].category
            }));
    }

    /**
     * Calculate relevance score (0-1) between query keywords and project
     */
    calculateRelevance(queryKeywords, project) {
        const projectKeywords = new Set((project.keywords || []).map(k => k.toLowerCase()));
        const projectPatterns = new Set((project.patterns || []).map(p => p.toLowerCase()));

        let matchCount = 0;
        let totalWeight = 0;

        for (const keyword of queryKeywords) {
            const kw = keyword.toLowerCase();

            // Exact keyword match (highest weight)
            if (projectKeywords.has(kw)) {
                matchCount += 1.0;
                totalWeight += 1.0;
            }
            // Pattern match (medium weight)
            else if (Array.from(projectPatterns).some(p => p.includes(kw) || kw.includes(p))) {
                matchCount += 0.6;
                totalWeight += 1.0;
            }
            // Partial match (low weight)
            else if (Array.from(projectKeywords).some(k => k.includes(kw) || kw.includes(k))) {
                matchCount += 0.3;
                totalWeight += 1.0;
            }
            else {
                totalWeight += 1.0;
            }
        }

        return totalWeight > 0 ? matchCount / totalWeight : 0;
    }

    /**
     * Check if file path matches pattern
     */
    matchesFilePattern(filePath, pattern) {
        // Convert glob pattern to regex
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.');

        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(filePath);
    }

    /**
     * Add or update project in registry
     */
    async addProject(projectId, projectInfo) {
        if (!this.registry.projects[projectId]) {
            this.registry.total_projects++;
        }

        this.registry.projects[projectId] = {
            ...projectInfo,
            projectId
        };

        // Update category
        const category = projectInfo.category || 'general';
        if (!this.registry.categories[category]) {
            this.registry.categories[category] = [];
        }
        if (!this.registry.categories[category].includes(projectId)) {
            this.registry.categories[category].push(projectId);
        }

        await this.save();
    }

    /**
     * Update project statistics
     */
    async updateProjectStats(projectId, updates) {
        if (!this.registry.projects[projectId]) {
            console.warn(`   ⚠️ Project "${projectId}" not found in registry`);
            return;
        }

        Object.assign(this.registry.projects[projectId], updates);
        this.registry.last_updated = new Date().toISOString();

        await this.save();
    }

    /**
     * Save registry to disk
     */
    async save() {
        try {
            await fs.mkdir(this.memoryPath, { recursive: true });
            await fs.writeFile(this.registryPath, JSON.stringify(this.registry, null, 2), 'utf8');

            // Also generate markdown index
            await this.generateMarkdownIndex();
        } catch (error) {
            console.error(`   ❌ Failed to save registry: ${error.message}`);
        }
    }

    /**
     * Generate human-readable MEMORY-INDEX.md
     */
    async generateMarkdownIndex() {
        const projects = Object.values(this.registry.projects);
        const categories = this.registry.categories;

        let markdown = `# ESMC Memory Index (AEGIS ${this.version})\n`;
        markdown += `**Last Updated:** ${new Date().toISOString().split('T')[0]}  \n`;
        markdown += `**Total Projects:** ${this.registry.total_projects} | **Total Sessions:** ${this.registry.total_sessions}\n\n`;
        markdown += `---\n\n`;

        // Projects by category
        for (const [category, projectIds] of Object.entries(categories)) {
            if (projectIds.length === 0) continue;

            markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Projects\n\n`;

            for (const projectId of projectIds) {
                const project = this.registry.projects[projectId];
                if (!project) continue;

                markdown += `### **${project.project_name || projectId}** (\`${project.file}\`)\n`;
                markdown += `- **Sessions:** ${project.sessions_count || 0}\n`;
                markdown += `- **Period:** ${project.date_range || 'N/A'}\n`;
                markdown += `- **Keywords:** ${(project.keywords || []).join(', ')}\n\n`;
            }
        }

        markdown += `---\n\n`;
        markdown += `**🎖️ AEGIS Memory System v${this.version}**  \n`;
        markdown += `*Intelligent memory routing and consolidation*\n`;

        const indexPath = path.join(this.memoryPath, 'MEMORY-INDEX.md');
        await fs.writeFile(indexPath, markdown, 'utf8');
    }

    /**
     * Get registry status
     */
    getStatus() {
        return {
            version: this.version,
            system: AEGIS_SYSTEM_NAME,
            total_projects: this.registry.total_projects,
            total_sessions: this.registry.total_sessions,
            projects: Object.keys(this.registry.projects),
            last_updated: this.registry.last_updated
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// INTELLIGENT MEMORY SEEDER - SMART SEED
// ═══════════════════════════════════════════════════════════════════════

/**
 * IntelligentMemorySeeder - Smart Seed System
 *
 * Purpose: Intelligently merge session into existing project memory
 * Features:
 * - Append + deduplicate learnings/patterns (Map-based O(n))
 * - Remove obsolete tasks
 * - Temporal tracking (session history)
 * - Auto-maintenance (recent index, topic index, project map)
 *
 * Philosophy: "Passing vs Diving"
 * - Sessions = Brief summaries (what was learned)
 * - Documents = Deep technical docs (how it was done)
 */
class IntelligentMemorySeeder {
    constructor(registry) {
        this.registry = registry;
        this.memoryPath = registry.memoryPath;
        this.sessionsPath = path.join(this.memoryPath, 'sessions');
    }

    /**
     * Smart seed - Intelligently merge session into existing project memory
     */
    async smartSeed(sessionData) {
        console.log(`\n🧠 AEGIS Smart Seed Activated`);

        // 1. Generate session filename with YYYY-MM-DD-{title} format
        const sessionFilename = this._generateSessionFilename(sessionData);

        // 2. Validate filename format (SECURITY: Prevent injection attacks)
        if (!validateSessionFilename(sessionFilename)) {
            throw new Error(`AEGIS: Invalid session filename format. Must be YYYY-MM-DD-{title}.json. Got: ${sessionFilename}`);
        }

        // 3. Load existing session memory (or create new)
        const memoryFile = path.join(this.sessionsPath, sessionFilename);
        let existingMemory = await this.loadMemory(memoryFile);
        const isNewSession = !existingMemory;

        if (!existingMemory) {
            console.log(`   📝 Creating new session: ${sessionFilename}`);
            existingMemory = this.createNewSessionMemory(sessionFilename, sessionData);
        }

        // 4. Intelligent merge
        console.log(`   ✨ Merging intelligence...`);
        const merged = await this.intelligentMerge(existingMemory, sessionData);

        // 5. Save updated memory (AEGIS IS SOLE WRITE AUTHORITY)
        await fs.mkdir(this.sessionsPath, { recursive: true });
        await fs.writeFile(memoryFile, JSON.stringify(merged, null, 2), 'utf8');

        // 6. Update recent index (.memory-recent.json) - FIFO maintenance
        await this.updateRecentIndex(sessionData, sessionFilename, memoryFile, merged);

        // 6.5. Run Semantic Learner (every 5th seed - vocabulary learning)
        await this.runSemanticLearner();

        // 7. Generate summary
        const changes = isNewSession
            ? {
                added_learnings: sessionData.key_learnings?.length || 0,
                added_patterns: sessionData.code_patterns?.length || 0,
                removed_tasks: 0
            }
            : this.analyzeDifferences(existingMemory, merged);

        console.log(`   ✅ Memory ${isNewSession ? 'created' : 'updated'}: ${sessionFilename}`);
        console.log(`      + ${changes.added_learnings} learnings`);
        console.log(`      + ${changes.added_patterns} patterns`);
        console.log(`      ✓ Removed ${changes.removed_tasks} completed tasks`);

        return {
            action: 'updated',
            sessionId: sessionFilename,
            file: sessionFilename,
            changes
        };
    }

    /**
     * Generate session filename with YYYY-MM-DD-{title} format
     * @added ESMC 3.20 - Enforce timestamp-based naming
     * @fixed ESMC 3.22.2 - Use session_id if provided (prevents truncation)
     * @fixed ESMC 3.25.1 - ALWAYS sanitize session_id (security bypass fix)
     */
    _generateSessionFilename(sessionData) {
        // If session_id provided with date prefix, extract and sanitize the title portion
        if (sessionData.session_id && sessionData.session_id.match(/^\d{4}-\d{2}-\d{2}-/)) {
            // Extract date prefix (YYYY-MM-DD) and title portion
            const datePrefix = sessionData.session_id.substring(0, 10); // YYYY-MM-DD
            const titlePortion = sessionData.session_id.substring(11).replace(/\.json$/i, ''); // Remove .json if present

            // CRITICAL: Always sanitize, even if user-provided (defense in depth)
            const sanitizedTitle = this._sanitizeFilename(titlePortion);

            return `${datePrefix}-${sanitizedTitle}.json`;
        }

        // Fallback: Generate from current date + title (original logic)
        const datePrefix = formatDate();

        // Extract title from session data (sanitize for filename safety)
        const title = sessionData.title || sessionData.summary || sessionData.project || 'untitled-session';
        const sanitizedTitle = this._sanitizeFilename(title);

        return `${datePrefix}-${sanitizedTitle}.json`;
    }

    /**
     * Sanitize filename component (alphanumeric + hyphens only)
     * SECURITY: Prevent directory traversal, injection attacks
     * @added ESMC 3.20
     */
    _sanitizeFilename(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-')          // Spaces to hyphens
            .replace(/-+/g, '-')           // Collapse multiple hyphens
            .replace(/^-|-$/g, '')         // Trim hyphens
            .slice(0, 100);                // Max 100 chars
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
     * Create new session memory structure
     * @added ESMC 3.20 - Changed from project-based to session-based
     */
    createNewSessionMemory(sessionFilename, sessionData) {
        return {
            session_id: sessionFilename.replace('.json', ''),
            session_file: sessionFilename,
            project_name: sessionData.project || 'Untitled Project',
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            total_sessions: 1,
            date_range: formatDate(),

            keywords: sessionData.keywords || [],
            key_learnings: sessionData.key_learnings || [],
            code_patterns: sessionData.code_patterns || [],
            decisions: sessionData.decisions || [],
            technical_architecture: sessionData.technical_architecture || {},
            pending_tasks: sessionData.pending_tasks || [],
            session_history: [{
                date: new Date().toISOString(),
                summary: sessionData.summary || 'Session captured',
                session_file: sessionFilename
            }]
        };
    }

    /**
     * Intelligent merge - Append, update, deduplicate, remove obsolete
     */
    async intelligentMerge(existing, newSession) {
        return {
            ...existing,

            // Update metadata
            last_updated: new Date().toISOString(),
            total_sessions: existing.total_sessions + 1,
            date_range: this.updateDateRange(existing.date_range, newSession.date),

            // APPEND + DEDUPLICATE: Key learnings (Map-based, O(n))
            key_learnings: this.appendUnique(
                existing.key_learnings || [],
                newSession.key_learnings || [],
                (item) => item.topic,  // Key extractor
                (oldItem, newItem) => ({  // Consolidator - merge intelligence
                    ...oldItem,
                    learning: newItem.learning || oldItem.learning,
                    examples: [...new Set([...(oldItem.examples || []), ...(newItem.examples || [])])],
                    last_updated: newItem.timestamp || new Date().toISOString()
                })
            ),

            // APPEND + DEDUPLICATE: Code patterns (Map-based, O(n))
            code_patterns: this.appendUnique(
                existing.code_patterns || [],
                newSession.code_patterns || [],
                (item) => item.pattern,  // Key extractor
                (oldItem, newItem) => ({  // Consolidator
                    ...oldItem,
                    occurrences: (oldItem.occurrences || 1) + 1,
                    last_seen: newItem.timestamp || new Date().toISOString()
                })
            ),

            // UPDATE: Decisions (keep most recent)
            decisions: this.mergeDecisions(
                existing.decisions || [],
                newSession.decisions || []
            ),

            // UPDATE: Technical architecture (merge objects)
            technical_architecture: {
                ...existing.technical_architecture || {},
                ...newSession.technical_architecture || {}
            },

            // DEDUPLICATE: Keywords
            keywords: [...new Set([
                ...(existing.keywords || []),
                ...(newSession.keywords || [])
            ])],

            // REMOVE OBSOLETE: Pending tasks
            pending_tasks: this.removeCompletedTasks(
                existing.pending_tasks || [],
                newSession.pending_tasks || []
            ),

            // TEMPORAL TRACKING: Session history
            session_history: [
                ...(existing.session_history || []),
                {
                    date: newSession.date,
                    session_id: newSession.session_id,
                    summary: newSession.summary
                }
            ]
        };
    }

    /**
     * Append items only if not duplicate - Map-based for O(n) performance
     * @fixed ESMC 3.13.1 - Reduced from O(n²) to O(n) using Map
     * @param {Array} existing - Current items
     * @param {Array} newItems - New items to merge
     * @param {Function} getKey - Extract unique key from item
     * @param {Function} consolidate - Merge old + new if duplicate exists
     */
    appendUnique(existing, newItems, getKey, consolidate = null) {
        const map = new Map();

        // Index existing items
        existing.forEach(item => {
            const key = getKey(item);
            map.set(key, item);
        });

        // Merge or add new items
        for (const item of newItems) {
            const key = getKey(item);
            if (map.has(key)) {
                // Duplicate found - consolidate if function provided
                if (consolidate) {
                    map.set(key, consolidate(map.get(key), item));
                }
                // Otherwise keep existing (older takes precedence)
            } else {
                map.set(key, item);
            }
        }

        return Array.from(map.values());
    }

    /**
     * Merge decisions (replace if same decision, otherwise append)
     */
    mergeDecisions(existing, newDecisions) {
        const result = [...existing];

        for (const newDec of newDecisions) {
            const index = result.findIndex(d => d.decision === newDec.decision);
            if (index >= 0) {
                result[index] = newDec; // Replace with newer version
            } else {
                result.push(newDec); // Add new decision
            }
        }

        return result;
    }

    /**
     * Remove completed tasks
     */
    removeCompletedTasks(existingTasks, newTasks) {
        const completedTopics = newTasks
            .filter(t => t.status === 'completed')
            .map(t => t.topic || t.content);

        return existingTasks.filter(t =>
            !completedTopics.includes(t.topic || t.content)
        );
    }

    /**
     * Update date range
     */
    updateDateRange(existingRange, newDate) {
        if (!existingRange) return newDate || formatDate();
        if (!newDate) return existingRange;

        const [start] = existingRange.split(' to ');
        return `${start} to ${newDate}`;
    }

    /**
     * Analyze differences between old and new memory
     */
    analyzeDifferences(old, merged) {
        return {
            added_learnings: (merged.key_learnings?.length || 0) - (old.key_learnings?.length || 0),
            added_patterns: (merged.code_patterns?.length || 0) - (old.code_patterns?.length || 0),
            removed_tasks: (old.pending_tasks?.length || 0) - (merged.pending_tasks?.length || 0)
        };
    }

    /**
     * Run Semantic Learner every 5th seed to learn vocabulary from CUP
     * @added ESMC 3.43 - Semantic Learner integration
     */
    async runSemanticLearner() {
        try {
            // Track seed count (simple counter file)
            const seedCountPath = path.join(this.memoryPath, '.seed-count.json');
            let seedCount = 1;

            try {
                const countData = await fs.readFile(seedCountPath, 'utf8');
                const countJson = JSON.parse(countData);
                seedCount = (countJson.count || 0) + 1;
            } catch (error) {
                // File doesn't exist, start from 1
                seedCount = 1;
            }

            // Save updated count
            await fs.writeFile(seedCountPath, JSON.stringify({ count: seedCount, last_updated: new Date().toISOString() }, null, 2), 'utf8');

            // Run Semantic Learner every 3 seeds
            if (seedCount % 3 === 0) {
                console.log(`   📚 Seed #${seedCount} - Running Semantic Learner...`);

                const SemanticLearner = require('./44f81c3d.js');
                const learner = new SemanticLearner();

                const results = await learner.learnFromCUP();

                if (results.learned > 0) {
                    console.log(`   ✅ Learned ${results.learned} new keywords:`);
                    if (results.categories.actions.length > 0) {
                        console.log(`      - Actions: ${results.categories.actions.join(', ')}`);
                    }
                    if (results.categories.temporal.length > 0) {
                        console.log(`      - Temporal: ${results.categories.temporal.join(', ')}`);
                    }
                    if (results.categories.domain.length > 0) {
                        console.log(`      - Domain: ${results.categories.domain.join(', ')}`);
                    }
                } else {
                    console.log(`   ℹ️  No new keywords learned (${results.learned} below threshold)`);
                }
            }
        } catch (error) {
            // Non-critical error - don't fail seed operation
            console.log(`   ⚠️  Semantic Learner error (non-critical): ${error.message}`);
        }
    }

    /**
     * Update .memory-recent.json - FIFO maintenance (keep 15 most recent)
     * Called automatically after successful seed operation
     * @updated ESMC 3.37 - Simplified version (removed full complexity for modular split)
     */
    async updateRecentIndex(sessionData, projectId, memoryFile, merged) {
        const recentIndexPath = path.join(this.memoryPath, '.memory-recent.json');

        try {
            // Load existing recent index
            let recentIndex;
            try {
                const content = await fs.readFile(recentIndexPath, 'utf8');
                recentIndex = JSON.parse(content);
            } catch (error) {
                // Create default v4.0.0 dual-index structure if doesn't exist
                recentIndex = {
                    version: "4.0.0",
                    system: AEGIS_SYSTEM_NAME,
                    created: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                    description: "Optimized 10+5 dual-index: 10 recent (temporal FIFO) + 5 important (importance-ranked) = 15 entries max, ~12 unique sessions. Balanced token cost (~7,800 tokens = v3.0.0 baseline) with 10-session pattern recognition window. 72% faster AEGIS sorting vs 15+15.",
                    indices: {
                        recent: {
                            max_entries: 10,
                            rotation_policy: "FIFO (pure temporal)",
                            purpose: "Pattern recognition - multi-session problem-solving arcs",
                            sessions: []
                        },
                        important: {
                            max_entries: 5,
                            rotation_policy: "Importance score ranking (descending)",
                            purpose: "High-value learnings - permanent visibility for key insights",
                            sessions: []
                        }
                    },
                    performance_metrics: {
                        total_entries: 15,
                        unique_sessions: 0,
                        target_read_time: "0.6-1.0 seconds",
                        avg_file_size: "32-35 KB",
                        cache_hit_rate_target: "92%",
                        token_cost_phase0: "~7,867 tokens (15 entries, v3.0.0 parity)",
                        deduplication_rate: "~20% (sessions in both indices)",
                        fallback_chain: ["Recent (temporal) → Important (high-value) → Topic → Keyword → Scribe"]
                    },
                    maintenance_protocol: {
                        update_trigger: "AEGIS smartSeed() completion",
                        rotation_policy_recent: "FIFO (pure temporal) - Ranks 1-10",
                        rotation_policy_important: "Importance score DESC (top 5 only) - Ranks 1-5",
                        max_age_days: null,
                        backup_strategy: "None (lightweight cache, not primary storage)"
                    }
                };
            }

            // ═══════════════════════════════════════════════════════════════
            // SCHEMA MIGRATION: v2.0.0 (hot/warm) → v3.0.0 (recent_sessions)
            // ═══════════════════════════════════════════════════════════════
            if (recentIndex.hot && recentIndex.warm && !recentIndex.recent_sessions) {
                console.log(`   🔄 Migrating .memory-recent.json: v2.0.0 → v3.0.0`);

                // Flatten hot + warm into recent_sessions (preserve rank order)
                recentIndex.recent_sessions = [...recentIndex.hot, ...recentIndex.warm];

                // Remove old schema properties
                delete recentIndex.hot;
                delete recentIndex.warm;
                delete recentIndex.compression_strategy;

                // Update schema version and config
                recentIndex.version = "3.0.0";
                recentIndex.max_entries = 15; // Expanded from 10 (ESMC 3.34 P0-2)
                recentIndex.description = "Lightweight 15-entry cache for fastest memory retrieval (ESMC 3.34 P0-2 expansion). 3+12 FIFO: Ranks 1-3 temporal recent, Ranks 4-15 importance-based. Updated by AEGIS during seed operations. Target: 90% T1 hit rate.";

                // Update maintenance protocol
                if (recentIndex.maintenance_protocol) {
                    recentIndex.maintenance_protocol.rotation_policy = "3+12 FIFO (Ranks 1-3: temporal recent, Ranks 4-15: importance-based)";
                }

                console.log(`   ✅ Migration complete: ${recentIndex.recent_sessions.length} sessions migrated`);
            }

            // ═══════════════════════════════════════════════════════════════
            // SCHEMA MIGRATION: v3.0.0 (single index) → v4.0.0 (dual index)
            // ═══════════════════════════════════════════════════════════════
            if (recentIndex.recent_sessions && !recentIndex.indices) {
                console.log(`   🔄 Migrating .memory-recent.json: v3.0.0 → v4.0.0 (dual-index)`);

                // Create dual-index structure
                const sortedByImportance = [...recentIndex.recent_sessions].sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0));

                recentIndex.version = "4.0.0";
                recentIndex.description = "Dual-index T1 cache: 15 recent (temporal FIFO) + 15 important (importance-ranked) = 30 entries max, ~18-22 unique sessions with deduplication. Pattern recognition optimized for multi-session problem-solving arcs + high-value learning preservation.";
                recentIndex.indices = {
                    recent: {
                        max_entries: 15,
                        rotation_policy: "FIFO (pure temporal)",
                        purpose: "Pattern recognition - multi-session problem-solving arcs",
                        sessions: recentIndex.recent_sessions.slice(0, 15)
                    },
                    important: {
                        max_entries: 15,
                        rotation_policy: "Importance score ranking (descending)",
                        purpose: "High-value learnings - permanent visibility for key insights",
                        sessions: sortedByImportance.slice(0, 15)
                    }
                };

                // Update performance metrics
                const uniqueSessions = new Set([
                    ...recentIndex.indices.recent.sessions.map(s => s.session_id),
                    ...recentIndex.indices.important.sessions.map(s => s.session_id)
                ]).size;

                recentIndex.performance_metrics = {
                    total_entries: 30,
                    unique_sessions: uniqueSessions,
                    target_read_time: "0.8-1.2 seconds",
                    avg_file_size: "50-60 KB",
                    cache_hit_rate_target: "95%",
                    token_cost_phase0: "~7600 tokens (30 entries)",
                    deduplication_rate: "~50% (sessions in both indices)",
                    fallback_chain: ["Recent (temporal) → Important (high-value) → Topic → Keyword → Scribe"]
                };

                // Update maintenance protocol
                if (recentIndex.maintenance_protocol) {
                    recentIndex.maintenance_protocol.rotation_policy_recent = "FIFO (pure temporal) - Ranks 1-15";
                    recentIndex.maintenance_protocol.rotation_policy_important = "Importance score DESC - Ranks 1-15";
                    delete recentIndex.maintenance_protocol.rotation_policy; // Remove old single-index policy
                }

                // Remove old schema properties
                delete recentIndex.recent_sessions;
                delete recentIndex.max_entries;

                console.log(`   ✅ Migration complete: ${uniqueSessions} unique sessions in dual-index (${recentIndex.indices.recent.sessions.length} recent, ${recentIndex.indices.important.sessions.length} important)`);
            }

            // Defensive: Ensure indices exist (handles corrupt files)
            if (!recentIndex.indices || !recentIndex.indices.recent || !recentIndex.indices.important) {
                console.log(`   ⚠️ Defensive: Initializing missing dual-index structure`);
                recentIndex.indices = {
                    recent: { max_entries: 15, rotation_policy: "FIFO (pure temporal)", purpose: "Pattern recognition - multi-session problem-solving arcs", sessions: [] },
                    important: { max_entries: 15, rotation_policy: "Importance score ranking (descending)", purpose: "High-value learnings - permanent visibility for key insights", sessions: [] }
                };
            }

            // Extract domain/subdomain from sessionData
            const domain = sessionData.domain || (projectId.includes('-') ? projectId.split('-')[0] : projectId);
            const subdomain = sessionData.subdomain || (projectId.includes('-') ? projectId.split('-').slice(1).join('-') : 'general');

            // Calculate importance score (simplified)
            const importanceScore = (merged.key_learnings?.length || 0) * 5 + (merged.code_patterns?.length || 0) * 3;

            // Create new entry (no rank yet - will be assigned per-index)
            const newEntry = {
                session_id: sessionData.session_id || `${sessionData.date}-${projectId}`,
                domain: domain,
                subdomain: subdomain,
                date: sessionData.date || formatDate(),
                project: sessionData.project || merged.project_name || projectId,
                summary: sessionData.summary || `Session for ${projectId}`,
                file_path: path.relative(path.join(this.memoryPath, '..', '..'), memoryFile).replace(/\\/g, '/'),
                timestamp: new Date().toISOString(),
                keywords: merged.keywords?.slice(0, 10) || [],
                key_topics: sessionData.key_topics || sessionData.topics || [],
                importance_score: importanceScore
            };

            // ═══════════════════════════════════════════════════════════════
            // DUAL-INDEX MAINTENANCE (ESMC 3.67.7)
            // ═══════════════════════════════════════════════════════════════

            // INDEX 1: RECENT (Temporal FIFO)
            const recentArray = recentIndex.indices.recent.sessions;
            const existingRecentIndex = recentArray.findIndex(s => s.session_id === newEntry.session_id);

            if (existingRecentIndex !== -1) {
                // Update existing entry
                recentArray[existingRecentIndex] = { ...newEntry };
            } else {
                // Prepend new entry (most recent first)
                recentArray.unshift({ ...newEntry });
            }

            // Keep max entries (configured limit)
            const maxRecent = recentIndex.indices.recent.max_entries || 10;
            if (recentArray.length > maxRecent) {
                recentArray.splice(maxRecent);
            }

            // Assign ranks
            recentArray.forEach((entry, index) => {
                entry.rank = index + 1;
            });

            // INDEX 2: IMPORTANT (Importance Score Ranking)
            const importantArray = recentIndex.indices.important.sessions;
            const existingImportantIndex = importantArray.findIndex(s => s.session_id === newEntry.session_id);

            if (existingImportantIndex !== -1) {
                // Update existing entry
                importantArray[existingImportantIndex] = { ...newEntry };
            } else {
                // Add new entry
                importantArray.push({ ...newEntry });
            }

            // Sort by importance_score (descending)
            importantArray.sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0));

            // Keep max entries (configured limit)
            const maxImportant = recentIndex.indices.important.max_entries || 5;
            if (importantArray.length > maxImportant) {
                importantArray.splice(maxImportant);
            }

            // Assign ranks
            importantArray.forEach((entry, index) => {
                entry.rank = index + 1;
            });

            // Update performance metrics
            const uniqueSessions = new Set([
                ...recentArray.map(s => s.session_id),
                ...importantArray.map(s => s.session_id)
            ]).size;

            recentIndex.performance_metrics.total_entries = recentArray.length + importantArray.length;
            recentIndex.performance_metrics.unique_sessions = uniqueSessions;

            // Update metadata
            recentIndex.last_updated = new Date().toISOString();

            // Save updated index
            await fs.writeFile(recentIndexPath, JSON.stringify(recentIndex, null, 2), 'utf8');
            console.log(`   ⚡ Updated dual-index: ${recentArray.length} recent, ${importantArray.length} important (${uniqueSessions} unique)`);

        } catch (error) {
            console.error(`   ⚠️ Failed to update recent index: ${error.message}`);
            // Non-critical error - don't fail seed operation
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
    MemoryRegistry,
    IntelligentMemorySeeder,
    getMemoryRegistry,
    closeRegistryWatcher
};
