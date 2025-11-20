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
/** ESMC 3.9.3 AEGIS | 2025-10-27 | v3.9.3.1 | PROD | MAX/VIP
 *  Purpose: Adaptive Empirical Guardian Intelligence System - unified memory router (read+write)
 *  Features: Smart Seed | Project auto-detect | Incremental updates | 93%↑retrieval speed | Living documents | ECHO integration | Sanitization security
 *  Philosophy: "Passing vs Diving" - Sessions (brief) vs Documents (deep) | Need-to-know vs How-it-was-done
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// ═══════════════════════════════════════════════════════════════════════
// ESMC 3.13 P1 - SINGLETON REGISTRY INSTANCE (Session-scoped, Race-Safe)
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
        this.version = "3.14.2"; // Added updateEchoSnapshot() for Fix #3
        this.systemName = "AEGIS";
        this.tier = "MAX/VIP";
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');
        this.registryPath = path.join(this.memoryPath, '.memory-registry.json');
        this.registry = null;
        this.loadTime = null; // Track load time for singleton

        console.log(`🎖️ AEGIS Memory Registry ${this.version} initialized (${this.tier})`);
    }

    /**
     * Auto-detect project root by walking up from module location
     * Searches for .claude/memory/ directory AND verifies memory-registry.json with content
     * @returns {string} Absolute path to project root
     * @throws {Error} If .claude/memory/ not found in parent directories
     * @fixed ESMC 3.14.1 - Added registry validation to prevent nested .claude/ false positives
     */
    _findProjectRoot() {
        let current = __dirname;  // Start from module location

        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            const registryPath = path.join(memoryPath, '.memory-registry.json');

            // Verify .claude/memory/ exists AND memory-registry.json has content (real project root)
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(registryPath)) {
                try {
                    const registryContent = fsSync.readFileSync(registryPath, 'utf8');
                    const registry = JSON.parse(registryContent);
                    // Validate it's a real registry with projects (not empty test fixture)
                    if (registry.projects && Object.keys(registry.projects).length > 0) {
                        console.log(`   🎯 AEGIS: Auto-detected project root: ${current}`);
                        return current;
                    }
                } catch (error) {
                    // Invalid or empty registry, continue searching
                }
            }
            current = path.dirname(current);
        }

        throw new Error('AEGIS: Could not locate project root with valid .claude/memory/memory-registry.json. Pass explicit projectRoot option.');
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
            system: "AEGIS",
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

    // CL2 - CL Automation P2 Integration (shouldCreateCL + smartEdit + batchInsertCLTags)
    // CL3 - Heuristic Priority Fixes (100% Test Pass Rate Achievement)
    // ═══════════════════════════════════════════════════════════════════════
    // CL AUTOMATION - ESMC 3.26 P2+P3 INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Auto-detect if CL file should be created (12-condition heuristic)
     * @updated ESMC 3.26 P3 - Fixed priority ordering (security-first, 13/13 tests passing)
     * @param {Object} params - Edit parameters
     * @param {string} params.file_path - File being edited
     * @param {string} params.old_string - Original content
     * @param {string} params.new_string - New content
     * @param {string} params.user_prompt - User's request (for context)
     * @param {boolean} params.force_cl - Override: always create CL
     * @param {boolean} params.no_cl - Override: never create CL
     * @returns {Object} - { trigger: boolean, reason: string, category: string }
     * @added ESMC 3.26 - P2 automation integration
     */
    shouldCreateCL(params) {
        const { file_path, old_string = '', new_string = '', user_prompt = '', force_cl = false, no_cl = false } = params;

        // User override: force CL creation
        if (force_cl) {
            return { trigger: true, reason: 'User override: --force-cl', category: 'override' };
        }

        // User override: suppress CL creation
        if (no_cl) {
            return { trigger: false, reason: 'User override: --no-cl', category: 'override' };
        }

        // Calculate change metrics
        const linesChanged = (new_string.match(/\n/g) || []).length - (old_string.match(/\n/g) || []).length;
        const charsChanged = Math.abs(new_string.length - old_string.length);

        // ALWAYS TRIGGER (5 conditions)

        // 1. Architecture files
        const architectureFiles = ['8e80df94.md', 'BRAIN.md', 'COLONELS.md', 'FOOTER.md', '48c49efe.md'];
        if (architectureFiles.some(f => file_path.includes(f))) {
            return { trigger: true, reason: 'Architecture file change', category: 'always' };
        }

        // 2. Core system files
        if (file_path.includes('esmc-3') && file_path.endsWith('.js')) {
            return { trigger: true, reason: 'Core system file change', category: 'always' };
        }

        // 3. Protocol updates (keyword detection)
        const protocolKeywords = ['ORACLE', 'ECHO', 'SEED', 'ATLAS', 'HYDRA', 'AEGIS', 'ATHENA', 'CUP', 'SCRIBE'];
        if (protocolKeywords.some(kw => user_prompt.toUpperCase().includes(kw))) {
            return { trigger: true, reason: 'Protocol update detected', category: 'always' };
        }

        // 7. Security updates (CHECK EARLY - CRITICAL)
        // Security always wins, even over cosmetic checks
        const securityKeywords = ['security', 'auth', 'encrypt', 'validation', 'sanitize', 'vulnerability'];
        if (securityKeywords.some(kw => user_prompt.toLowerCase().includes(kw))) {
            return { trigger: true, reason: 'Security update', category: 'conditional' };
        }

        // NEVER TRIGGER - CHECK AFTER CRITICAL KEYWORDS (4 conditions)
        // This prevents false positives from keyword overlap (e.g., "Add comment" triggering documentation)

        // 8. Cosmetic updates (typo fixes, small changes <50 chars)
        const cosmeticKeywords = ['typo', 'spelling', 'whitespace', 'formatting'];
        const isCosmeticPrompt = cosmeticKeywords.some(kw => user_prompt.toLowerCase().includes(kw));
        if ((charsChanged < 50 && !user_prompt.toLowerCase().includes('fix')) || isCosmeticPrompt) {
            return { trigger: false, reason: 'Cosmetic change (<50 chars)', category: 'never' };
        }

        // 9. Comment-only changes (check if new content only differs in comments)
        // Fixed regex: Handle line endings properly, trim whitespace
        const codeWithoutComments = (str) => str.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\n/gm, '');
        if (codeWithoutComments(old_string).trim() === codeWithoutComments(new_string).trim()) {
            return { trigger: false, reason: 'Comment-only change', category: 'never' };
        }

        // 10. Temporary debugging (console.log detection)
        if (new_string.includes('console.log') && !old_string.includes('console.log')) {
            return { trigger: false, reason: 'Temporary debugging', category: 'never' };
        }

        // 4. User-requested documentation (NOW CHECKED AFTER "NEVER" CONDITIONS)
        const docKeywords = ['document', 'changelog', 'create cl', 'add cl'];
        if (docKeywords.some(kw => user_prompt.toLowerCase().includes(kw))) {
            return { trigger: true, reason: 'User requested documentation', category: 'always' };
        }

        // CONDITIONALLY TRIGGER (2 remaining conditions)

        // 5. Bug fixes with impact (>100 lines changed)
        if (user_prompt.toLowerCase().includes('fix') && Math.abs(linesChanged) > 100) {
            return { trigger: true, reason: 'Bug fix >100 lines', category: 'conditional' };
        }

        // 6. Performance optimizations (keyword detection)
        const perfKeywords = ['optim', 'performance', 'speed', 'faster', 'efficiency'];
        if (perfKeywords.some(kw => user_prompt.toLowerCase().includes(kw)) && charsChanged > 500) {
            return { trigger: true, reason: 'Performance optimization', category: 'conditional' };
        }

        // DEFAULT: No trigger (not significant enough)
        return { trigger: false, reason: 'Change not significant for CL', category: 'default' };
    }

    /**
     * Smart edit with automatic CL detection (wrapper for atomicEditWithCL)
     * NOTE: This is a simplified version for MemoryRegistry.
     * Full implementation with file I/O exists in DocumentWriter class.
     * @param {Object} params - Edit parameters
     * @returns {Object} - Decision object from shouldCreateCL
     * @added ESMC 3.26 - P2 automation integration
     */
    smartEdit(params) {
        // This method delegates to shouldCreateCL for decision logic
        // Actual file editing is handled by DocumentWriter.atomicEditWithCL
        const decision = this.shouldCreateCL(params);
        return {
            should_create_cl: decision.trigger,
            reason: decision.reason,
            category: decision.category,
            delegate_to: 'DocumentWriter.atomicEditWithCL'
        };
    }

    /**
     * Batch insert multiple CL tags (decision helper)
     * NOTE: This is a decision/planning method for MemoryRegistry.
     * Full implementation with file I/O exists in DocumentWriter class.
     * @param {string} file_path - File to modify
     * @param {Array<Object>} tags - Array of { line: number, text: string }
     * @returns {Object} - Planning data for batch operation
     * @added ESMC 3.26 - P2 automation integration
     */
    batchInsertCLTags(file_path, tags) {
        // Calculate token savings estimate
        const estimatedTokensPerRead = 500; // Rough estimate
        const sequentialCost = estimatedTokensPerRead * tags.length;
        const batchCost = estimatedTokensPerRead;
        const savings = sequentialCost - batchCost;
        const efficiencyPercent = Math.round((savings / sequentialCost) * 100);

        return {
            plan: 'batch_insert',
            file_path,
            tags_count: tags.length,
            estimated_tokens_sequential: sequentialCost,
            estimated_tokens_batch: batchCost,
            estimated_savings: savings,
            efficiency_percent: efficiencyPercent,
            delegate_to: 'DocumentWriter.batchInsertCLTags'
        };
    }

    /**
     * Get registry status
     */
    getStatus() {
        return {
            version: this.version,
            system: "AEGIS",
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
        if (!this._validateSessionFilename(sessionFilename)) {
            throw new Error(`AEGIS: Invalid session filename format. Must be YYYY-MM-DD-{title}.json. Got: ${sessionFilename}`);
        }

        // 2.5. 🆕 ESMC 3.30 - Ensure BRIEF exists (lazy initialization, <1ms if exists)
        const briefCheck = await this._ensureBriefExists();
        if (briefCheck.created) {
            console.log(`   🎯 BRIEF created during seed (first-time initialization)`);
        }

        // 3. Load existing session memory (or create new)
        const memoryFile = path.join(this.sessionsPath, sessionFilename);
        let existingMemory = await this.loadMemory(memoryFile);
        const isNewSession = !existingMemory; // BUG FIX: Track if this is a new session

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

        // 7. 🆕 Update topic index (.topic-index.json) - Auto-maintenance
        await this.updateTopicIndex(sessionData, sessionFilename, merged);

        // 8. 🆕 ATLAS PROJECT MAP REBUILD (incremental sync with filesystem)
        await this.rebuildProjectMap(sessionData);

        // 9. Generate summary (BUG FIX: For new sessions, report actual content counts)
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
        const now = new Date();
        const datePrefix = now.toISOString().split('T')[0]; // YYYY-MM-DD

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
     * Validate session filename format: YYYY-MM-DD-{title}.json
     * SECURITY: Enforce strict format to prevent injection
     * @added ESMC 3.20
     * @enhanced ESMC 3.25.1 - Added detailed validation logging
     */
    _validateSessionFilename(filename) {
        // Regex: YYYY-MM-DD-{alphanumeric-hyphens}.json
        const validFormat = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.json$/;

        if (!validFormat.test(filename)) {
            console.error(`   ❌ AEGIS: Invalid filename format: ${filename}`);
            console.error(`   ℹ️  Expected format: YYYY-MM-DD-{title}.json`);
            console.error(`   ℹ️  Allowed characters: a-z, 0-9, hyphens only`);
            console.error(`   ℹ️  Tip: Version numbers should use hyphens (e.g., 'esmc-3-25' not 'esmc-3.25')`);
            return false;
        }

        // Additional validation: Prevent path traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            console.error(`   ❌ AEGIS: Path traversal detected: ${filename}`);
            return false;
        }

        // ESMC 3.25.1: Defensive check - should never happen if sanitization works
        if (filename !== filename.toLowerCase()) {
            console.error(`   ❌ AEGIS: Uppercase characters detected: ${filename}`);
            console.error(`   ⚠️  CRITICAL: Sanitization bypass detected - this is a bug!`);
            return false;
        }

        return true;
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
     * Create new project memory structure
     */
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
            date_range: new Date().toISOString().split('T')[0],

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
        if (!existingRange) return newDate;
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
     * Update .memory-recent.json - FIFO maintenance (keep 10 most recent)
     * Called automatically after successful seed operation
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
                // Create default structure if doesn't exist
                recentIndex = {
                    version: "1.0.0",
                    system: "AEGIS",
                    created: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                    description: "Lightweight 15-entry cache for fastest memory retrieval (ESMC 3.34 P0-2 expansion). 3+12 FIFO: Ranks 1-3 temporal recent, Ranks 4-15 importance-based. Updated by AEGIS during seed operations. Target: 90% T1 hit rate.",
                    max_entries: 15,
                    recent_sessions: [],
                    performance_metrics: {
                        target_read_time: "0.5-1 second",
                        avg_file_size: "3-4 KB",
                        cache_hit_rate_target: "90%",
                        fallback_chain: ["Recent → Topic → Keyword → Scribe (temporal)"]
                    },
                    maintenance_protocol: {
                        update_trigger: "AEGIS smartSeed() completion",
                        rotation_policy: "3+12 FIFO (Ranks 1-3: temporal recent, Ranks 4-15: importance-based)",
                        max_age_days: null,
                        backup_strategy: "None (lightweight cache, not primary storage)"
                    }
                };
            }

            // Extract domain/subdomain from sessionData (BUG FIX: was parsing from projectId/filename)
            // Fallback to projectId parsing if sessionData doesn't have domain/subdomain
            const domain = sessionData.domain || (projectId.includes('-') ? projectId.split('-')[0] : projectId);
            const subdomain = sessionData.subdomain || (projectId.includes('-') ? projectId.split('-').slice(1).join('-') : 'general');

            // Calculate importance score (0-100) based on session metrics
            const importanceScore = this.calculateImportanceScore(sessionData, merged);

            // Create new recent entry
            const newEntry = {
                rank: 1, // Will be recalculated after insertion
                session_id: sessionData.session_id || `${sessionData.date}-${projectId}`,
                domain: domain,
                subdomain: subdomain,
                date: sessionData.date || new Date().toISOString().split('T')[0],
                project: sessionData.project || merged.project_name || projectId,
                summary: sessionData.summary || `Session for ${projectId}`,
                file_path: path.relative(path.join(this.memoryPath, '..', '..'), memoryFile).replace(/\\/g, '/'),
                timestamp: new Date().toISOString(),
                keywords: merged.keywords?.slice(0, 10) || [], // Top 10 keywords
                key_topics: sessionData.key_topics || sessionData.topics || [],
                importance_score: importanceScore
            };

            // BUG FIX: Check for duplicate session_id before adding
            const existingIndex = recentIndex.recent_sessions.findIndex(s => s.session_id === newEntry.session_id);
            if (existingIndex !== -1) {
                // Update existing entry instead of creating duplicate
                console.log(`   🔄 Updating existing entry (rank ${existingIndex + 1})`);
                recentIndex.recent_sessions[existingIndex] = newEntry;
            } else {
                // 3+7 FIFO: Ranks 1-3 = Most recent (temporal), Ranks 4-10 = Top importance
                // Optimized UX: "Last memory" queries expect rank 1 = newest, not highest importance
                recentIndex.recent_sessions.unshift(newEntry);
            }

            if (recentIndex.recent_sessions.length > recentIndex.max_entries) {
                // Keep 3 most recent (ranks 1-3: temporal FIFO)
                const recent3 = recentIndex.recent_sessions.slice(0, 3);
                const recentIds = new Set(recent3.map(s => s.session_id));

                // Sort remaining by importance, exclude recent3
                const remaining = recentIndex.recent_sessions.slice(3)
                    .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0));

                // Keep top 7 by importance (ranks 4-10: strategic retention)
                const top7 = [];
                for (const session of remaining) {
                    if (!recentIds.has(session.session_id) && top7.length < 7) {
                        top7.push(session);
                    }
                }

                // Final: [recent3 (1-3)] + [top7 importance (4-10)]
                recentIndex.recent_sessions = [...recent3, ...top7];
            }

            // Recalculate ranks (1-based index)
            recentIndex.recent_sessions.forEach((entry, index) => {
                entry.rank = index + 1;
            });

            // Update metadata
            recentIndex.last_updated = new Date().toISOString();

            // Save updated index
            await fs.writeFile(recentIndexPath, JSON.stringify(recentIndex, null, 2), 'utf8');
            console.log(`   ⚡ Updated recent index (${recentIndex.recent_sessions.length} entries)`);

        } catch (error) {
            console.error(`   ⚠️ Failed to update recent index: ${error.message}`);
            // Non-critical error - don't fail seed operation
        }
    }

    /**
     * Calculate importance score for session ranking
     * @fixed ESMC 3.13.1 - Enhanced scoring (quality > quantity, temporal decay, context)
     * Higher score = more important session (unbounded for better differentiation)
     */
    calculateImportanceScore(sessionData, merged, context = {}) {
        let score = 0;

        // ═══════════════════════════════════════════════════════════════
        // QUALITY OVER QUANTITY
        // ═══════════════════════════════════════════════════════════════

        // Factor 1: Critical learnings (high quality)
        const criticalLearnings = (merged.key_learnings || []).filter(l =>
            l.critical === true ||
            l.learning?.toLowerCase().includes('breakthrough') ||
            l.learning?.toLowerCase().includes('critical')
        );
        score += criticalLearnings.length * 15;

        // Factor 2: Standard learnings (normal quality)
        const standardLearnings = (merged.key_learnings || []).length - criticalLearnings.length;
        score += standardLearnings * 3;

        // Factor 3: Unique code patterns (weighted by occurrences)
        (merged.code_patterns || []).forEach(pattern => {
            const occurrences = pattern.occurrences || 1;
            score += Math.min(occurrences * 2, 10); // Cap per pattern at 10
        });

        // Factor 4: Critical decisions (architectural/strategic)
        const criticalDecisions = (sessionData.decisions || []).filter(d =>
            d.decision?.toLowerCase().includes('architectural') ||
            d.decision?.toLowerCase().includes('strategic') ||
            d.decision?.toLowerCase().includes('security')
        );
        score += criticalDecisions.length * 8;

        // Factor 5: Standard decisions
        const standardDecisions = (sessionData.decisions || []).length - criticalDecisions.length;
        score += standardDecisions * 3;

        // Factor 6: Technical architecture complexity
        const architectureDepth = Object.keys(sessionData.technical_architecture || {}).length;
        score += Math.min(architectureDepth * 4, 20);

        // ═══════════════════════════════════════════════════════════════
        // USAGE INTELLIGENCE (retrieval frequency = value signal)
        // @added ESMC 3.13.2
        // ═══════════════════════════════════════════════════════════════

        const retrievalCount = merged.retrieval_count || 0;
        if (retrievalCount > 0) {
            // 5% boost per retrieval, capped at 50% (10 retrievals)
            const usageBoost = Math.min(retrievalCount * 0.05, 0.50);
            score *= (1 + usageBoost);
        }

        // ═══════════════════════════════════════════════════════════════
        // TEMPORAL DECAY (sessions lose relevance over time)
        // ═══════════════════════════════════════════════════════════════

        if (sessionData.date) {
            const sessionDate = new Date(sessionData.date);
            const now = new Date();
            const ageInDays = (now - sessionDate) / (1000 * 60 * 60 * 24);

            // 50% decay after 90 days (exponential)
            const decayFactor = Math.exp(-ageInDays / 90);
            score *= decayFactor;
        }

        // ═══════════════════════════════════════════════════════════════
        // CONTEXT RELEVANCE (boost if related to current work)
        // ═══════════════════════════════════════════════════════════════

        if (context.currentProject) {
            const projectDomain = sessionData.project_id || sessionData.project || '';
            if (projectDomain.includes(context.currentProject)) {
                score *= 1.5; // 50% boost for same project
            }
        }

        if (context.currentKeywords && Array.isArray(context.currentKeywords)) {
            const sessionKeywords = merged.keywords || [];
            const matchCount = context.currentKeywords.filter(ck =>
                sessionKeywords.some(sk => sk.toLowerCase().includes(ck.toLowerCase()))
            ).length;

            if (matchCount > 0) {
                score *= (1 + matchCount * 0.1); // 10% boost per matching keyword
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // FINAL SCORE (no cap - allows better differentiation)
        // ═══════════════════════════════════════════════════════════════

        return Math.round(score);
    }

    /**
     * 🆕 UPDATE TOPIC INDEX - Auto-maintenance for TIER 2 retrieval
     * @fixed ESMC 3.13.1 - Automatic topic index updates on seed
     * @param {Object} sessionData - Session data
     * @param {string} projectId - Project identifier
     * @param {Object} merged - Merged session data
     */
    async updateTopicIndex(sessionData, projectId, merged) {
        const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');

        try {
            let topicIndex;
            try {
                const content = await fs.readFile(topicIndexPath, 'utf8');
                topicIndex = JSON.parse(content);
            } catch (error) {
                // Create default structure
                topicIndex = {
                    version: "2.0.0",
                    index_type: "topic-first-inverted",
                    last_updated: new Date().toISOString(),
                    description: "Topic-based memory index for O(1) retrieval. Topics cluster related keywords for faster lookup.",
                    topics: {}
                };
            }

            // Extract primary topic from keywords
            const primaryTopic = this.extractPrimaryTopic(merged.keywords || [], projectId);

            if (!topicIndex.topics[primaryTopic]) {
                topicIndex.topics[primaryTopic] = {
                    summary: `Sessions related to ${primaryTopic}`,
                    latest_activity: sessionData.date,
                    relevance: merged.importance_score || 50,
                    sessions: [],
                    aliases: this.extractAliases(merged.keywords || [])
                };
            }

            // Add session reference
            // Fix: Strip .json extension if present (prevent .json.json double extension)
            const sessionFile = projectId.endsWith('.json')
                ? projectId
                : `${projectId}.json`;

            const sessionRef = {
                file: `sessions/${sessionFile}`,
                timestamp: Math.floor(Date.now() / 1000),
                date: sessionData.date,
                snippet: (sessionData.summary || '').substring(0, 200),
                key_decisions: (sessionData.key_topics || []).slice(0, 3)
            };

            // Prepend (most recent first), keep 5 most recent
            topicIndex.topics[primaryTopic].sessions.unshift(sessionRef);

            // Validate session files exist (P1 fix from brutal audit)
            // Remove orphaned references to sessions that no longer exist
            const validatedSessions = [];
            for (const session of topicIndex.topics[primaryTopic].sessions) {
                const sessionPath = path.join(this.memoryPath, session.file);
                try {
                    await fs.access(sessionPath); // Check if file exists
                    validatedSessions.push(session);
                } catch (error) {
                    console.warn(`   ⚠️ Removed orphaned session ref: ${session.file}`);
                }
            }

            topicIndex.topics[primaryTopic].sessions = validatedSessions.slice(0, 5);
            topicIndex.topics[primaryTopic].latest_activity = sessionData.date;

            // Update metadata
            topicIndex.last_updated = new Date().toISOString();

            // Save
            await fs.writeFile(topicIndexPath, JSON.stringify(topicIndex, null, 2), 'utf8');
            console.log(`   📊 Updated topic index (${primaryTopic})`);

        } catch (error) {
            console.warn(`   ⚠️ Failed to update topic index: ${error.message}`);
            // Non-critical - don't fail seed
        }
    }

    /**
     * Extract primary topic from keywords using TF-IDF-inspired frequency scoring
     * @fixed ESMC 3.13.2 - Replaced naive keyword-first with frequency analysis
     */
    extractPrimaryTopic(keywords, projectId) {
        // Map keywords to high-level topics
        const topicMap = {
            'authentication': ['oauth', 'login', 'jwt', 'firebase', 'auth', 'session', 'token'],
            'build-pipeline': ['build', 'obfuscation', 'packaging', 'chaos', 'distribution', 'adobe-style'],
            'esmc-framework': ['colonel', 'echelon', 'athena', 'intelligence', 'epsilon', 'mesh'],
            'memory-system': ['atlas', 'aegis', 'scribe', 'memory', 'retrieval', 'seed'],
            'website': ['stripe', 'billing', 'dashboard', 'firestore', 'vercel', 'deployment'],
            'security': ['encryption', 'aes', 'hmac', 'red-teaming', 'audit', 'ip-protection'],
            'deployment': ['vercel', 'production', 'sync', 'parity', 'requirements']
        };

        // Calculate frequency score for each topic
        const topicScores = {};
        for (const [topic, topicKeywords] of Object.entries(topicMap)) {
            topicScores[topic] = 0;
            for (const keyword of keywords) {
                const kwLower = keyword.toLowerCase();
                if (topicKeywords.includes(kwLower)) {
                    topicScores[topic] += 1;
                }
            }
        }

        // Find topic with highest score
        const bestTopic = Object.entries(topicScores)
            .filter(([_, score]) => score > 0)
            .sort(([_, a], [__, b]) => b - a)[0];

        if (bestTopic) {
            return bestTopic[0];
        }

        // Fallback: use project domain
        const domain = projectId.split('/')[0] || projectId.split('-')[0];
        return domain || 'general';
    }

    /**
     * Extract aliases from keywords
     */
    extractAliases(keywords) {
        return keywords.slice(0, 10).map(k => k.toLowerCase());
    }

    /**
     * 🆕 REBUILD PROJECT MAP - Trigger ATLAS spatial awareness update
     * Called automatically after smartSeed() completion
     *
     * @param {Object} sessionData - Session data with files_modified array
     * @returns {Promise<Object>} Rebuild result (non-blocking)
     */
    async rebuildProjectMap(sessionData) {
        try {
            // Load configuration (with fallback defaults)
            const config = await this.loadAtlasConfig();

            // Check if auto-rebuild is disabled
            if (!config.auto_rebuild.enabled) {
                console.log('   🗺️ ATLAS: Disabled (config)');
                return { success: true, skipped: true, reason: 'disabled' };
            }

            // Skip if no files were modified (memory-only seed)
            const filesModified = sessionData.files_modified || sessionData.files || [];
            if (config.auto_rebuild.skip_conditions.no_files_modified && filesModified.length === 0) {
                console.log('   🗺️ ATLAS: Skipped (no files modified)');
                return { success: true, skipped: true, reason: 'no_files' };
            }

            // Skip if below threshold
            if (filesModified.length < config.auto_rebuild.skip_conditions.files_threshold) {
                console.log(`   🗺️ ATLAS: Skipped (${filesModified.length} files < ${config.auto_rebuild.skip_conditions.files_threshold} threshold)`);
                return { success: true, skipped: true, reason: 'below_threshold' };
            }

            // Import ATLAS dynamically
            const AtlasRetrieval = require('./8cacf104.js');
            const atlas = new AtlasRetrieval({ projectRoot: this.registry.projectRoot });

            // Build session context for ATLAS
            const sessionContext = {
                session_id: sessionData.session_id,
                files_modified: filesModified,
                timestamp: new Date().toISOString()
            };

            // Trigger rebuild with timeout protection
            const rebuildMode = config.auto_rebuild.mode || 'smart';
            console.log(`   🗺️ ATLAS: Synchronizing project map (${filesModified.length} files, ${rebuildMode} mode)...`);

            const rebuildPromise = atlas.rebuild({
                mode: rebuildMode,
                reason: 'seed_triggered',
                sessionContext: sessionContext,
                validateExisting: config.ghost_detection.enabled,
                addNew: true
            });

            // Apply timeout
            const result = await Promise.race([
                rebuildPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), config.auto_rebuild.timeout_ms)
                )
            ]);

            if (result.success) {
                const duration = result.duration_ms;
                if (config.performance.log_performance && duration > config.performance.warn_threshold_ms) {
                    console.warn(`   ⚠️ ATLAS: Slow rebuild (${duration}ms > ${config.performance.warn_threshold_ms}ms threshold)`);
                }
                console.log(`   ✅ ATLAS: Map updated (${result.mode}, ${duration}ms)`);
            } else {
                console.warn(`   ⚠️ ATLAS: Rebuild failed (non-blocking): ${result.error}`);
            }

            return result;

        } catch (error) {
            // Non-blocking error - seed operation continues
            if (error.message === 'Timeout') {
                console.warn(`   ⚠️ ATLAS: Rebuild timeout (non-blocking, continuing seed)`);
                return { success: false, error: 'timeout', non_blocking: true };
            }
            console.warn(`   ⚠️ ATLAS: Rebuild error (non-blocking): ${error.message}`);
            return { success: false, error: error.message, non_blocking: true };
        }
    }

    /**
     * Load ATLAS configuration from .atlas-config.json
     * Returns default config if file doesn't exist
     */
    async loadAtlasConfig() {
        try {
            const configPath = path.join(this.memoryPath, '.atlas-config.json');
            const content = await fs.readFile(configPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            // Return default config if file doesn't exist
            return {
                auto_rebuild: {
                    enabled: true,
                    mode: 'smart',
                    timeout_ms: 10000,
                    skip_conditions: {
                        no_files_modified: true,
                        files_threshold: 0
                    }
                },
                ghost_detection: {
                    enabled: true
                },
                performance: {
                    warn_threshold_ms: 5000,
                    log_performance: true
                }
            };
        }
    }

    // CL1 - PCA Partnership Enhancement for BRIEF Quality (ESMC 3.30)
    /**
     * Ensure BRIEF exists - lazy initialization with self-healing + PCA partnership
     *
     * **Architecture:**
     * - Check: Does .project-brief.json exist? (<1ms filesystem stat)
     * - Create: If missing → PCA.analyzeProjectContext() → ECHELON.synthesizeBrief() → writeBrief()
     * - Skip: If exists → Return immediately (zero overhead)
     *
     * **Philosophy:** "Check-create-once" pattern (industry standard lazy init)
     *
     * **PCA Partnership (ESMC 3.30 Enhancement):**
     * - AEGIS: Orchestrates workflow (check → create → write)
     * - PCA: Provides full structural intelligence (8 domains: visual, code, api, db, security, perf, business, tech)
     * - ECHELON: Strategic narrator (synthesizes BRIEF from PCA data)
     * - Result: High-quality BRIEF with comprehensive project understanding (vs empty structural_intelligence)
     *
     * **Token Economics:**
     * - Without BRIEF: 4 components × 500 tokens = 2,000 tokens per request
     * - With BRIEF: 1 read (650) + 4 components × 150 tokens = 1,250 tokens
     * - Savings: 750 tokens per request × 10 requests = 7,500 tokens per session
     *
     * **Called From:**
     * - smartSeed() - First seed creates BRIEF (tied to seed workflow)
     * - BRAIN.md PHASE -0.5 - Fallback if seed was skipped
     *
     * @added ESMC 3.30
     * @updated ESMC 3.30 - Added proper PCA partnership (analyzeProjectContext) for high-quality BRIEF generation
     */
    async _ensureBriefExists() {
        const briefPath = path.join(this.memoryPath, '.project-brief.json');

        try {
            // Step 1: Check existence (<1ms stat call)
            await fs.access(briefPath);
            console.log('   📋 BRIEF exists, skipping creation (zero overhead)');
            return { exists: true, created: false, briefPath };

        } catch (error) {
            // BRIEF missing → lazy initialization triggered
            console.log('   📝 BRIEF missing, initiating lazy creation...');

            // Step 2: Import ECHELON orchestrator + PCA (lazy-loaded)
            const { ECHELONMeshOrchestrator } = require('./6da84f2d.js');
            const { ProjectContextAnalyzer } = require('./a3226f07.js');
            const echelon = new ECHELONMeshOrchestrator();
            const pca = new ProjectContextAnalyzer();

            // Step 3: Gather FULL structural intelligence via PCA partnership
            console.log('   🏗️ PCA: Gathering structural intelligence...');
            const projectRoot = this.registry.projectRoot;
            const structuralIntelligence = await pca.analyzeProjectContext(projectRoot);
            const sessionHistory = await this._loadRecentSessions(3); // Top 3 recent for context

            // Step 4: ECHELON synthesizes BRIEF (strategic narrator with PCA partnership)
            console.log('   🎖️ ECHELON: Synthesizing BRIEF from PCA intelligence...');
            const synthesis = await echelon.synthesizeBrief({
                structural_intelligence: structuralIntelligence,
                session_history: sessionHistory,
                project_goals: { primary: 'Auto-detected from codebase' }
            });

            if (!synthesis.success) {
                console.warn(`   ⚠️ BRIEF synthesis failed: ${synthesis.error}`);
                return { exists: false, created: false, error: synthesis.error };
            }

            // Step 5: AEGIS executes write (tactical executor)
            // Write BRIEF inline (writeBrief is in DocumentWriter class, not accessible here)
            const briefData = {
                ...synthesis.brief,
                metadata: {
                    ...synthesis.brief.metadata,
                    created_via: 'lazy_initialization',
                    trigger: 'first_seed',
                    last_updated: new Date().toISOString()
                }
            };

            await fs.writeFile(briefPath, JSON.stringify(briefData, null, 2));
            const writeResult = { success: true, briefPath };

            if (!writeResult.success) {
                console.warn(`   ⚠️ BRIEF write failed: ${writeResult.error}`);
                return { exists: false, created: false, error: writeResult.error };
            }

            console.log(`   ✅ BRIEF created via lazy initialization → ${briefPath}`);
            return { exists: true, created: true, briefPath, token_estimate: synthesis.token_estimate };
        }
    }

    /**
     * Load recent sessions for BRIEF synthesis context
     * @private
     */
    async _loadRecentSessions(count = 3) {
        try {
            const recentPath = path.join(this.memoryPath, '.memory-recent.json');
            const content = await fs.readFile(recentPath, 'utf-8');
            const data = JSON.parse(content);
            return data.recent_sessions?.slice(0, count) || [];
        } catch (error) {
            return []; // Graceful fallback if no sessions exist yet
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// MEMORY GARBAGE COLLECTOR - 90-DAY TTL ARCHIVING
// @added ESMC 3.13.2
// ═══════════════════════════════════════════════════════════════════════

class MemoryGarbageCollector {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');
        this.coldStoragePath = path.join(this.memoryPath, 'cold-storage');
        this.ttlDays = options.ttlDays || 90;

        console.log(`🗑️ Memory GC initialized (TTL: ${this.ttlDays} days)`);
        console.log(`   📂 Memory path: ${this.memoryPath}`);
    }

    /**
     * Auto-detect project root by walking up from module location
     * Searches for .claude/memory/ directory AND verifies sessions/ has content
     * Prioritizes HIGHEST (furthest) root when multiple candidates exist
     * @returns {string} Absolute path to project root
     * @throws {Error} If .claude/memory/ not found in parent directories
     * @fixed ESMC 3.14.1 - Walk to highest root to avoid nested .claude/ false positives
     */
    _findProjectRoot() {
        let current = __dirname;
        let bestCandidate = null;
        let maxFiles = 0;

        // Walk UP the tree and collect ALL valid candidates
        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            const sessionsPath = path.join(memoryPath, 'sessions');

            // Verify .claude/memory/sessions/ exists AND contains session files
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(sessionsPath)) {
                try {
                    const stats = fsSync.statSync(sessionsPath);
                    if (stats.isDirectory()) {
                        const entries = fsSync.readdirSync(sessionsPath);
                        if (entries.length > 0) {
                            // Count total session files to find most populated root
                            let fileCount = 0;
                            for (const entry of entries) {
                                const entryPath = path.join(sessionsPath, entry);
                                const entryStat = fsSync.statSync(entryPath);
                                if (entryStat.isDirectory()) {
                                    fileCount += fsSync.readdirSync(entryPath).filter(f => f.endsWith('.json')).length;
                                } else if (entry.endsWith('.json')) {
                                    fileCount++;
                                }
                            }
                            // Prefer root with MORE files (real project vs test fixture)
                            if (fileCount > maxFiles) {
                                bestCandidate = current;
                                maxFiles = fileCount;
                            }
                        }
                    }
                } catch (error) {
                    // Invalid directory, continue searching
                }
            }
            current = path.dirname(current);
        }

        if (bestCandidate) {
            console.log(`   🎯 GC: Auto-detected project root: ${bestCandidate}`);
            return bestCandidate;
        }

        throw new Error('GC: Could not locate project root with .claude/memory/.memory-registry.json. Pass explicit projectRoot option.');
    }

    /**
     * Run garbage collection - archive sessions older than TTL
     */
    async run(options = {}) {
        const dryRun = options.dryRun || false;
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - this.ttlDays * 24 * 60 * 60 * 1000);

        console.log(`🗑️ Running memory garbage collection...`);
        console.log(`   Cutoff date: ${cutoffDate.toISOString().split('T')[0]} (${this.ttlDays} days ago)`);
        console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

        const stats = {
            scanned: 0,
            archived: 0,
            compressed: 0,
            bytes_freed: 0,
            errors: 0
        };

        try {
            // Ensure cold storage exists
            if (!dryRun) {
                await fs.mkdir(this.coldStoragePath, { recursive: true });
            }

            // Scan all session directories
            const sessionsPath = path.join(this.memoryPath, 'sessions');
            const sessionDirs = await fs.readdir(sessionsPath);

            for (const dir of sessionDirs) {
                const dirPath = path.join(sessionsPath, dir);
                const dirStats = await fs.stat(dirPath);

                if (!dirStats.isDirectory()) continue;

                // Check all files in directory
                const files = await fs.readdir(dirPath);
                for (const file of files) {
                    if (!file.endsWith('.json')) continue;

                    const filePath = path.join(dirPath, file);
                    const fileStats = await fs.stat(filePath);
                    const fileAge = now - fileStats.mtime;
                    const fileAgeDays = Math.floor(fileAge / (1000 * 60 * 60 * 24));

                    stats.scanned++;

                    if (fileStats.mtime < cutoffDate) {
                        console.log(`   📦 Archiving: ${dir}/${file} (${fileAgeDays} days old)`);

                        if (!dryRun) {
                            try {
                                // Read file content
                                const content = await fs.readFile(filePath, 'utf8');

                                // Compress with gzip
                                const compressed = await gzip(content);

                                // Archive to cold storage with .gz extension
                                const archivePath = path.join(this.coldStoragePath, `${dir}_${file}.gz`);
                                await fs.writeFile(archivePath, compressed);

                                // Delete original
                                await fs.unlink(filePath);

                                const compressedSize = compressed.length;
                                const compressionRatio = ((1 - compressedSize / fileStats.size) * 100).toFixed(1);

                                stats.archived++;
                                stats.bytes_freed += fileStats.size;
                                stats.compressed++;

                                console.log(`      💾 Compressed: ${(fileStats.size / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% savings)`);
                            } catch (error) {
                                console.warn(`   ⚠️ Failed to archive ${file}: ${error.message}`);
                                stats.errors++;
                            }
                        } else {
                            stats.archived++;
                            stats.bytes_freed += fileStats.size;
                        }
                    }
                }
            }

            // Clean orphaned topic index references
            console.log(`\n🧹 Cleaning orphaned topic index references...`);
            const orphanStats = await this.cleanTopicIndexOrphans();
            stats.orphans_removed = orphanStats.orphansRemoved;

            // Check topic index staleness
            console.log(`\n🔍 Checking topic index staleness...`);
            const stalenessCheck = await this.checkTopicIndexStaleness();
            stats.index_staleness = stalenessCheck;

            if (stalenessCheck.isStale) {
                console.log(`   ⚠️ Topic index is STALE: ${stalenessCheck.reason} (severity: ${stalenessCheck.severity})`);
                if (stalenessCheck.severity === 'critical' || stalenessCheck.severity === 'high') {
                    console.log(`   💡 Recommendation: Run AEGIS rebuild to regenerate topic index`);
                }
            } else {
                console.log(`   ✅ Topic index is fresh (age: ${stalenessCheck.ageInDays} days, ${stalenessCheck.sessionCount} sessions)`);
            }

            console.log(`\n📊 Garbage Collection Complete:`);
            console.log(`   Scanned: ${stats.scanned} sessions`);
            console.log(`   Archived: ${stats.archived} sessions`);
            console.log(`   Space freed: ${Math.round(stats.bytes_freed / 1024)} KB`);
            console.log(`   Orphans removed: ${stats.orphans_removed}`);
            console.log(`   Errors: ${stats.errors}`);

            return { success: true, stats };

        } catch (error) {
            console.error(`   ❌ GC failed: ${error.message}`);
            return { success: false, error: error.message, stats };
        }
    }

    /**
     * Retrieve and decompress archived session from cold storage
     * @added ESMC 3.13.4
     * @param {string} sessionId - Session identifier
     * @returns {Promise<object|null>} Decompressed session data or null if not found
     */
    async retrieveArchivedSession(sessionId) {
        try {
            // Look for compressed file in cold storage
            const files = await fs.readdir(this.coldStoragePath);
            const archiveFile = files.find(f => f.includes(sessionId) && f.endsWith('.gz'));

            if (!archiveFile) {
                return null;
            }

            const archivePath = path.join(this.coldStoragePath, archiveFile);
            const compressed = await fs.readFile(archivePath);

            // Decompress
            const decompressed = await gunzip(compressed);
            const session = JSON.parse(decompressed.toString('utf8'));

            console.log(`   📂 Retrieved archived session: ${sessionId} (decompressed ${(compressed.length / 1024).toFixed(1)}KB → ${(decompressed.length / 1024).toFixed(1)}KB)`);

            return session;
        } catch (error) {
            console.warn(`   ⚠️ Failed to retrieve archived session ${sessionId}: ${error.message}`);
            return null;
        }
    }

    /**
     * Check if topic index is stale and needs rebuilding
     * @added ESMC 3.13.4
     * @returns {Promise<object>} Staleness assessment
     */
    async checkTopicIndexStaleness() {
        const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');

        try {
            // Check if index exists
            if (!fsSync.existsSync(topicIndexPath)) {
                return {
                    isStale: true,
                    reason: 'index_missing',
                    severity: 'critical'
                };
            }

            const content = await fs.readFile(topicIndexPath, 'utf8');
            const index = JSON.parse(content);

            // Check 1: Age of index (> 7 days = stale)
            const lastUpdated = new Date(index.last_updated);
            const now = new Date();
            const ageInDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);

            if (ageInDays > 7) {
                return {
                    isStale: true,
                    reason: 'index_outdated',
                    severity: 'medium',
                    ageInDays: ageInDays.toFixed(1)
                };
            }

            // Check 2: Count orphaned references
            let orphanCount = 0;
            for (const [topic, data] of Object.entries(index.topics || {})) {
                for (const session of data.sessions || []) {
                    const sessionPath = path.join(this.memoryPath, session.file);
                    if (!fsSync.existsSync(sessionPath)) {
                        orphanCount++;
                    }
                }
            }

            if (orphanCount > 5) {
                return {
                    isStale: true,
                    reason: 'excessive_orphans',
                    severity: 'medium',
                    orphanCount
                };
            }

            // Check 3: Compare session count vs index
            const sessionsPath = path.join(this.memoryPath, 'sessions');
            let actualSessionCount = 0;

            if (fsSync.existsSync(sessionsPath)) {
                const sessionDirs = await fs.readdir(sessionsPath);
                for (const dir of sessionDirs) {
                    const dirPath = path.join(sessionsPath, dir);
                    const dirStats = await fs.stat(dirPath);
                    if (dirStats.isDirectory()) {
                        const files = await fs.readdir(dirPath);
                        actualSessionCount += files.filter(f => f.endsWith('.json')).length;
                    }
                }
            }

            // Count indexed sessions
            let indexedSessionCount = 0;
            for (const [topic, data] of Object.entries(index.topics || {})) {
                indexedSessionCount += (data.sessions || []).length;
            }

            const discrepancy = Math.abs(actualSessionCount - indexedSessionCount);
            if (discrepancy > 10) {
                return {
                    isStale: true,
                    reason: 'session_count_mismatch',
                    severity: 'low',
                    actualSessions: actualSessionCount,
                    indexedSessions: indexedSessionCount,
                    discrepancy
                };
            }

            // Index is fresh
            return {
                isStale: false,
                ageInDays: ageInDays.toFixed(1),
                orphanCount,
                sessionCount: actualSessionCount
            };

        } catch (error) {
            return {
                isStale: true,
                reason: 'check_failed',
                severity: 'high',
                error: error.message
            };
        }
    }

    /**
     * Clean orphaned session references from topic index
     * @added ESMC 3.13.3
     * @returns {Promise<object>} Cleanup statistics
     */
    async cleanTopicIndexOrphans() {
        const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');
        let orphansRemoved = 0;

        try {
            const content = await fs.readFile(topicIndexPath, 'utf8');
            const index = JSON.parse(content);

            for (const [topic, data] of Object.entries(index.topics || {})) {
                const validSessions = [];

                for (const session of data.sessions || []) {
                    const sessionPath = path.join(this.memoryPath, session.file);

                    // Check if session file still exists
                    if (fsSync.existsSync(sessionPath)) {
                        validSessions.push(session);
                    } else {
                        orphansRemoved++;
                        console.log(`   🗑️ Removed orphaned ref: ${topic} → ${session.file}`);
                    }
                }

                index.topics[topic].sessions = validSessions;
            }

            // Save updated index
            await fs.writeFile(topicIndexPath, JSON.stringify(index, null, 2), 'utf8');
            console.log(`   ✅ Topic index cleaned (${orphansRemoved} orphans removed)`);

            return { success: true, orphansRemoved };

        } catch (error) {
            console.warn(`   ⚠️ Topic index cleanup failed: ${error.message}`);
            return { success: false, orphansRemoved: 0, error: error.message };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// ESMC 3.22 - ECHO MANAGER (v3.0 - Context Parity Architecture)
// ═══════════════════════════════════════════════════════════════════════
/**
 * ECHO Manager - Current Conversation Checkpoint System
 *
 * @philosophy "Recent Work (Current) = Session Parity"
 * @version 3.0.0
 * @added ESMC 3.22
 *
 * Features:
 * - Automatic ECHO creation on first message (session-aligned naming)
 * - Compact counter tracking (filename + JSON metadata)
 * - ATLAS T1 integration (PHASE 0.0 retrieval)
 * - Multi-window support (today's date filter + counter sort)
 * - Context parity with session files (ECHO weight = Session weight)
 */
class EchoManager {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude/memory');
        this.echoDir = path.join(this.memoryPath, 'echo');

        // Ensure echo directory exists
        if (!fsSync.existsSync(this.echoDir)) {
            fsSync.mkdirSync(this.echoDir, { recursive: true });
        }
    }

    /**
     * Auto-detect project root - FIXED to prevent nested .claude paths
     * Walks UP the tree to find HIGHEST .claude/memory with most session files
     * @returns {string} Project root path
     * @fixed ESMC 3.30.1 - Bug #1: Prevent nested .claude paths (stress test finding)
     */
    _findProjectRoot() {
        let current = __dirname;
        let bestCandidate = null;
        let maxFiles = 0;

        // Walk UP the tree and collect ALL valid candidates
        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            const sessionsPath = path.join(memoryPath, 'sessions');

            // Verify .claude/memory/sessions/ exists AND contains session files
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(sessionsPath)) {
                try {
                    const stats = fsSync.statSync(sessionsPath);
                    if (stats.isDirectory()) {
                        const entries = fsSync.readdirSync(sessionsPath);
                        if (entries.length > 0) {
                            // Count total session files to find most populated root
                            let fileCount = 0;
                            for (const entry of entries) {
                                const entryPath = path.join(sessionsPath, entry);
                                const entryStat = fsSync.statSync(entryPath);
                                if (entryStat.isDirectory()) {
                                    fileCount += fsSync.readdirSync(entryPath).filter(f => f.endsWith('.json')).length;
                                } else if (entry.endsWith('.json')) {
                                    fileCount++;
                                }
                            }
                            // Prefer root with MORE files (real project vs test fixture)
                            if (fileCount > maxFiles) {
                                bestCandidate = current;
                                maxFiles = fileCount;
                            }
                        }
                    }
                } catch (error) {
                    // Invalid directory, continue searching
                }
            }
            current = path.dirname(current);
        }

        if (bestCandidate) {
            return bestCandidate;
        }

        throw new Error('EchoManager: Could not locate project root with .claude/memory/sessions/. Pass explicit projectRoot option.');
    }

    /**
     * Format date as YYYY-MM-DD (v3.0 session-aligned format)
     * @param {Date} date - Date to format
     * @returns {string} Formatted date
     */
    _formatDate(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Format time as HHMMSS
     * @param {Date} date - Date to format
     * @returns {string} Formatted time
     */
    _formatTime(date = new Date()) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}${minutes}${seconds}`;
    }

    /**
     * Extract topic slug from first prompt (first 10 words)
     * @param {string} firstPrompt - User's first message
     * @returns {string} Topic slug
     */
    _extractTopicSlug(firstPrompt) {
        const words = firstPrompt
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0)
            .slice(0, 10);

        return words.join('-');
    }

    /**
     * Create ECHO snapshot on first user message
     * @param {object} options - Creation options
     * @param {string} options.firstPrompt - User's first message
     * @param {object} options.context - Initial context (optional)
     * @returns {Promise<object>} Created ECHO metadata
     */
    async createEchoOnFirstMessage(options = {}) {
        try {
            const { firstPrompt, context = {} } = options;

            if (!firstPrompt) {
                throw new Error('firstPrompt is required');
            }

            const now = new Date();
            const topicSlug = this._extractTopicSlug(firstPrompt);
            const date = this._formatDate(now);
            const time = this._formatTime(now);

            // v3.0: Session-aligned format with counter
            const filename = `${date}-${topicSlug}-${time}-0.json`;
            const filepath = path.join(this.echoDir, filename);

            // Check if file already exists (idempotent - don't recreate)
            if (fsSync.existsSync(filepath)) {
                console.log(`   📸 [Skip] ECHO already exists: ${filename}`);
                const existing = JSON.parse(await fs.readFile(filepath, 'utf8'));
                return {
                    success: true,
                    filename,
                    echo_id: existing.echo_id,
                    created: false
                };
            }

            // Build initial snapshot
            const snapshot = {
                echo_id: `${date}-${topicSlug}-${time}`,
                echo_version: '3.0.0',
                created_at: now.toISOString(),
                last_updated: now.toISOString(),
                trigger: 'auto_first_message',
                first_prompt: firstPrompt,
                topic_slug: topicSlug,

                compact_counter: 0,
                compact_history: [
                    {
                        compact_num: 0,
                        timestamp: now.toISOString(),
                        trigger: 'auto_first_message',
                        tokens_before: 0,
                        tokens_after: context.estimated_tokens || 500
                    }
                ],

                context_metrics: {
                    estimated_tokens: context.estimated_tokens || 500,
                    message_count: context.message_count || 1,
                    conversation_duration_minutes: 0,
                    files_modified: 0
                },

                esmc_state: {
                    version: context.esmc_version || '3.69',
                    mode: context.mode || 'lightweight',
                    manifests_loaded: context.manifests_loaded || ['8e80df94.md', 'BRAIN.md']
                },

                conversation_state: {
                    current_task: context.current_task || 'Starting conversation',
                    todo_list: context.todo_list || [],
                    files_modified: context.files_modified || [],
                    key_decisions: context.key_decisions || []
                },

                recovery_metadata: {
                    last_memory_retrieval: context.last_memory_retrieval || null,
                    active_project: context.active_project || null,
                    conversation_context: context.conversation_context || `User started conversation: ${firstPrompt}`,
                    protocols_to_reload: context.protocols_to_reload || ['8e80df94.md', 'BRAIN.md']
                }
            };

            // Atomic write
            await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2), 'utf8');
            console.log(`   📸 ECHO created: ${filename}`);

            return {
                success: true,
                filename,
                echo_id: snapshot.echo_id,
                created: true
            };

        } catch (error) {
            console.error(`   ❌ ECHO creation failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Increment ECHO compact counter (on /compact or auto-compact detection)
     * @param {string} currentFilename - Current ECHO filename (optional - auto-detects today's file)
     * @returns {Promise<object>} Updated ECHO metadata
     */
    async incrementEchoCounter(currentFilename = null) {
        try {
            // Auto-detect today's ECHO if not provided
            if (!currentFilename) {
                const todayContext = await this.retrieveEchoContext();
                if (!todayContext) {
                    throw new Error('No ECHO file found for today');
                }
                currentFilename = todayContext.filename;
            }

            const currentPath = path.join(this.echoDir, currentFilename);

            // Read current ECHO
            const echoContent = await fs.readFile(currentPath, 'utf8');
            const echo = JSON.parse(echoContent);

            // Increment counter
            const newCounter = (echo.compact_counter || 0) + 1;
            echo.compact_counter = newCounter;
            echo.last_updated = new Date().toISOString();

            // Append to compact history
            echo.compact_history = echo.compact_history || [];
            echo.compact_history.push({
                compact_num: newCounter,
                timestamp: new Date().toISOString(),
                trigger: 'manual_compact', // Could be 'auto_compact_180K' if detected
                tokens_before: echo.context_metrics?.estimated_tokens || 180000,
                tokens_after: 60000 // Post-compact estimate
            });

            // Generate new filename (update counter: -0 → -1, -1 → -2, etc.)
            const newFilename = currentFilename.replace(/-(\d+)\.json$/, `-${newCounter}.json`);
            const newPath = path.join(this.echoDir, newFilename);

            // Write updated ECHO to new filename (atomic)
            await fs.writeFile(newPath, JSON.stringify(echo, null, 2), 'utf8');

            // Delete old file (crash-safe: new file written first)
            await fs.unlink(currentPath);

            console.log(`   📸 ECHO compacted: ${currentFilename} → ${newFilename}`);
            console.log(`      Compact #${newCounter}: ${echo.compact_history[newCounter]?.tokens_before || '?'}K → 60K tokens`);

            return {
                success: true,
                old_filename: currentFilename,
                new_filename: newFilename,
                compact_counter: newCounter,
                echo_id: echo.echo_id
            };

        } catch (error) {
            console.error(`   ❌ ECHO counter increment failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update ECHO snapshot with current conversation context
     * Used for manual "echo" trigger to refresh checkpoint data
     * @param {object} updates - Partial ECHO data to update
     * @returns {Promise<object>} Update result
     */
    async updateEchoSnapshot(updates = {}) {
        try {
            // Find today's ECHO file
            const todayContext = await this.retrieveEchoContext();
            if (!todayContext) {
                throw new Error('No ECHO file found for today');
            }

            const echoPath = path.join(this.echoDir, todayContext.filename);

            // Read current ECHO
            const echoContent = await fs.readFile(echoPath, 'utf8');
            const echo = JSON.parse(echoContent);

            // Update timestamp
            echo.last_updated = new Date().toISOString();

            // Merge updates (deep merge for nested objects)
            if (updates.context_metrics) {
                echo.context_metrics = {
                    ...echo.context_metrics,
                    ...updates.context_metrics
                };
            }

            if (updates.conversation_state) {
                echo.conversation_state = {
                    ...echo.conversation_state,
                    ...updates.conversation_state
                };
            }

            if (updates.esmc_state) {
                echo.esmc_state = {
                    ...echo.esmc_state,
                    ...updates.esmc_state
                };
            }

            if (updates.recovery_metadata) {
                echo.recovery_metadata = {
                    ...echo.recovery_metadata,
                    ...updates.recovery_metadata
                };
            }

            // Write updated ECHO (atomic operation)
            await fs.writeFile(echoPath, JSON.stringify(echo, null, 2), 'utf8');

            console.log(`   📸 ECHO updated: ${todayContext.filename}`);
            console.log(`      Tokens: ${echo.context_metrics?.estimated_tokens || '?'}K, Messages: ${echo.context_metrics?.message_count || '?'}`);

            return {
                success: true,
                filename: todayContext.filename,
                echo_id: echo.echo_id,
                updated_fields: Object.keys(updates)
            };

        } catch (error) {
            console.error(`   ❌ ECHO update failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🆕 ESMC 3.22 v3.0: Counter-based conditional reading
     * Check if ECHO should be read based on counter value
     * -0 = new conversation (skip read, no context yet)
     * >0 = post-compact (read file, context loss risk)
     * @returns {Promise<boolean>} True if ECHO should be read
     */
    async shouldReadEcho() {
        try {
            const today = this._formatDate();
            const files = await fs.readdir(this.echoDir);
            const todayEchos = files.filter(f => f.startsWith(today) && f.endsWith('.json'));

            if (todayEchos.length === 0) {
                // No ECHO from today - new conversation
                return false;
            }

            // Find highest counter
            const latestEcho = todayEchos.sort((a, b) => {
                const counterA = parseInt(a.match(/-(\d+)\.json$/)?.[1] || '0');
                const counterB = parseInt(b.match(/-(\d+)\.json$/)?.[1] || '0');
                return counterB - counterA;
            })[0];

            // Extract counter from filename
            const counter = parseInt(latestEcho.match(/-(\d+)\.json$/)?.[1] || '0');

            // Counter-based decision: only read if > 0 (post-compact state)
            // Counter = 0: new conversation, no context yet
            // Counter > 0: compacted conversation, context exists
            return counter > 0;

        } catch (error) {
            // On error, default to false (skip read)
            return false;
        }
    }

    /**
     * Retrieve ECHO context for current conversation (PHASE 0.0 - ATLAS integration)
     * @returns {Promise<object|null>} ECHO context or null if not found
     */
    async retrieveEchoContext() {
        try {
            const today = this._formatDate();

            // List all ECHO files
            const files = await fs.readdir(this.echoDir);

            // Filter by today's date (YYYY-MM-DD prefix)
            const todayEchos = files.filter(f => f.startsWith(today) && f.endsWith('.json'));

            if (todayEchos.length === 0) {
                // Silent return - no ECHO from today (normal case)
                return null;
            }

            // If multiple ECHOs (multi-window), select highest counter (most recent compact)
            const latestEcho = todayEchos.sort((a, b) => {
                const counterA = parseInt(a.match(/-(\d+)\.json$/)?.[1] || '0');
                const counterB = parseInt(b.match(/-(\d+)\.json$/)?.[1] || '0');
                return counterB - counterA; // Descending (highest first)
            })[0];

            // Load ECHO file
            const echoPath = path.join(this.echoDir, latestEcho);
            const echoContent = await fs.readFile(echoPath, 'utf8');
            const echo = JSON.parse(echoContent);

            // Return context object (optimized for ATLAS injection)
            return {
                filename: latestEcho,
                echo_id: echo.echo_id,
                context: echo, // Full snapshot
                current_task: echo.conversation_state?.current_task || null,
                todos: echo.conversation_state?.todo_list || [],
                compact_counter: echo.compact_counter || 0,
                files_modified: echo.conversation_state?.files_modified || [],
                key_decisions: echo.conversation_state?.key_decisions || [],
                esmc_state: echo.esmc_state || {},
                context_metrics: echo.context_metrics || {}
            };

        } catch (error) {
            // Silent failure - fall back to TIER 1 (defensive error handling)
            console.warn(`   ⚠️ ECHO retrieval failed (falling back to TIER 1): ${error.message}`);
            return null;
        }
    }

    /**
     * Update existing ECHO file (continuous updates during conversation)
     * @param {object} updates - Fields to update
     * @returns {Promise<object>} Update result
     */
    async updateEcho(updates = {}) {
        try {
            const todayContext = await this.retrieveEchoContext();
            if (!todayContext) {
                throw new Error('No ECHO file found for today');
            }

            const echoPath = path.join(this.echoDir, todayContext.filename);
            const echo = todayContext.context;

            // Update fields
            echo.last_updated = new Date().toISOString();

            if (updates.current_task) {
                echo.conversation_state.current_task = updates.current_task;
            }
            if (updates.todo_list) {
                echo.conversation_state.todo_list = updates.todo_list;
            }
            if (updates.files_modified) {
                echo.conversation_state.files_modified = updates.files_modified;
            }
            if (updates.key_decisions) {
                echo.conversation_state.key_decisions = updates.key_decisions;
            }
            if (updates.context_metrics) {
                echo.context_metrics = { ...echo.context_metrics, ...updates.context_metrics };
            }

            // Write updated ECHO
            await fs.writeFile(echoPath, JSON.stringify(echo, null, 2), 'utf8');

            return {
                success: true,
                filename: todayContext.filename,
                updated_at: echo.last_updated
            };

        } catch (error) {
            console.error(`   ❌ ECHO update failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🆕 ESMC 3.22: Auto-trigger ECHO checkpoint on token milestones
     * Proactively saves conversation state at 100K and 150K token thresholds
     *
     * @param {number} currentTokens - Current token usage
     * @param {object} updates - Optional context updates to save
     * @returns {Promise<object>} Checkpoint result
     */
    async checkTokenMilestoneAndSave(currentTokens, updates = {}) {
        try {
            // Token milestone thresholds
            const MILESTONES = {
                CHECKPOINT_100K: 100000,
                CHECKPOINT_150K: 150000,
                EMERGENCY_180K: 180000
            };

            // Check if we've crossed a milestone
            const todayContext = await this.retrieveEchoContext();
            if (!todayContext) {
                // No ECHO exists yet - can't save checkpoint
                return { success: false, reason: 'No ECHO file exists' };
            }

            const echo = todayContext.context;
            const lastTokenCheck = echo.context_metrics?.last_token_checkpoint || 0;

            let triggerReason = null;

            // Determine which milestone we crossed
            if (currentTokens >= MILESTONES.EMERGENCY_180K && lastTokenCheck < MILESTONES.EMERGENCY_180K) {
                triggerReason = 'auto_checkpoint_180K_emergency';
            } else if (currentTokens >= MILESTONES.CHECKPOINT_150K && lastTokenCheck < MILESTONES.CHECKPOINT_150K) {
                triggerReason = 'auto_checkpoint_150K';
            } else if (currentTokens >= MILESTONES.CHECKPOINT_100K && lastTokenCheck < MILESTONES.CHECKPOINT_100K) {
                triggerReason = 'auto_checkpoint_100K';
            }

            // No new milestone crossed
            if (!triggerReason) {
                return { success: false, reason: 'No milestone crossed' };
            }

            // Save checkpoint
            console.log(`\n📸 ECHO AUTO-CHECKPOINT TRIGGERED`);
            console.log(`   Reason: ${triggerReason}`);
            console.log(`   Tokens: ${currentTokens.toLocaleString()} / 200,000`);

            // Update context metrics with checkpoint info
            const checkpointUpdates = {
                ...updates,
                context_metrics: {
                    ...echo.context_metrics,
                    estimated_tokens: currentTokens,
                    last_token_checkpoint: currentTokens,
                    checkpoint_history: [
                        ...(echo.context_metrics?.checkpoint_history || []),
                        {
                            trigger: triggerReason,
                            tokens: currentTokens,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }
            };

            const result = await this.updateEcho(checkpointUpdates);

            if (result.success) {
                console.log(`   ✅ Checkpoint saved: ${result.filename}`);
                console.log(`   📊 Next milestone: ${this._getNextMilestone(currentTokens)}K tokens\n`);
            }

            return {
                ...result,
                trigger: triggerReason,
                tokens: currentTokens
            };

        } catch (error) {
            console.error(`   ❌ Auto-checkpoint failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get next token milestone for display
     * @private
     */
    _getNextMilestone(currentTokens) {
        if (currentTokens < 100000) return 100;
        if (currentTokens < 150000) return 150;
        if (currentTokens < 180000) return 180;
        return 200;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// DOCUMENT WRITER - AEGIS OFFICIAL DOCUMENTATION AUTHORITY
// ═══════════════════════════════════════════════════════════════════════

/**
 * DocumentWriter - AEGIS Official Documentation System
 *
 * Purpose: Write formal technical documents (audits, reports, specs) to
 *          .claude/memory/documents/ with proper naming and indexing
 *
 * Philosophy: AEGIS is the sole author of "DIVING" content
 *             (implementation guides, architectural specs, audit reports)
 *
 * Naming Convention: YYYY-MM-DD-title-slug-category.md
 * Example: 2025-10-26-router-perfect-audit-audit-report.md
 *
 * @added ESMC 3.22.2 - Formal Document Authority
 */
class DocumentWriter {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude/memory');
        this.documentsPath = path.join(this.memoryPath, 'documents');
        this.indexPath = path.join(this.memoryPath, '.document-index.json');

        // Ensure documents directory exists
        if (!fsSync.existsSync(this.documentsPath)) {
            fsSync.mkdirSync(this.documentsPath, { recursive: true });
        }
    }

    /**
     * Auto-detect project root - FIXED to prevent nested .claude paths
     * Walks UP the tree to find HIGHEST .claude/memory with most session files
     * @returns {string} Project root path
     * @fixed ESMC 3.30.1 - Bug #1: Prevent nested .claude paths (stress test finding)
     */
    _findProjectRoot() {
        let current = __dirname;
        let bestCandidate = null;
        let maxFiles = 0;

        // Walk UP the tree and collect ALL valid candidates
        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            const sessionsPath = path.join(memoryPath, 'sessions');

            // Verify .claude/memory/sessions/ exists AND contains session files
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(sessionsPath)) {
                try {
                    const stats = fsSync.statSync(sessionsPath);
                    if (stats.isDirectory()) {
                        const entries = fsSync.readdirSync(sessionsPath);
                        if (entries.length > 0) {
                            // Count total session files to find most populated root
                            let fileCount = 0;
                            for (const entry of entries) {
                                const entryPath = path.join(sessionsPath, entry);
                                const entryStat = fsSync.statSync(entryPath);
                                if (entryStat.isDirectory()) {
                                    fileCount += fsSync.readdirSync(entryPath).filter(f => f.endsWith('.json')).length;
                                } else if (entry.endsWith('.json')) {
                                    fileCount++;
                                }
                            }
                            // Prefer root with MORE files (real project vs test fixture)
                            if (fileCount > maxFiles) {
                                bestCandidate = current;
                                maxFiles = fileCount;
                            }
                        }
                    }
                } catch (error) {
                    // Invalid directory, continue searching
                }
            }
            current = path.dirname(current);
        }

        if (bestCandidate) {
            return bestCandidate;
        }

        throw new Error('DocumentWriter: Could not locate project root with .claude/memory/sessions/. Pass explicit projectRoot option.');
    }

    /**
     * Format date as YYYY-MM-DD
     */
    _formatDate(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Generate slug from title (kebab-case, max 50 chars)
     */
    _generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }

    /**
     * Write document with proper AEGIS formatting
     *
     * @param {Object} options - Document options
     * @param {string} options.title - Document title
     * @param {string} options.content - Document markdown content
     * @param {string} options.category - Category (audit-report, implementation, architecture, etc.)
     * @param {Object} options.metadata - Additional metadata (author, version, status, etc.)
     * @returns {Promise<Object>} Result with filename and path
     */
    async writeDocument(options = {}) {
        const {
            title,
            content,
            category = 'general',
            metadata = {}
        } = options;

        if (!title || !content) {
            throw new Error('AEGIS DocumentWriter: title and content are required');
        }

        console.log(`\n📝 AEGIS Document Writer: Creating "${title}"...`);

        // Generate filename: YYYY-MM-DD-title-slug-category.md
        const datestamp = this._formatDate();
        const slug = this._generateSlug(title);
        const filename = `${datestamp}-${slug}-${category}.md`;

        // Determine subdirectory based on category
        const categoryDirs = {
            'audit-report': 'audit-reports',
            'implementation': 'architecture',
            'architecture': 'architecture',
            'test-report': 'audit-reports',
            'deployment': 'deployment',
            'memory-system': 'memory-system',
            'general': ''
        };

        const subdir = categoryDirs[category] || '';
        const docDir = subdir ? path.join(this.documentsPath, subdir) : this.documentsPath;

        // Ensure subdirectory exists
        if (!fsSync.existsSync(docDir)) {
            fsSync.mkdirSync(docDir, { recursive: true });
        }

        const filepath = path.join(docDir, filename);

        // Add AEGIS header to content
        const aegisContent = this._formatDocumentWithHeader(title, content, metadata);

        // Write document
        await fs.writeFile(filepath, aegisContent, 'utf8');

        // Update document index
        await this._updateDocumentIndex({
            filename,
            filepath,
            title,
            category,
            datestamp,
            metadata
        });

        console.log(`✅ AEGIS: Document written → ${filepath}`);
        console.log(`📇 AEGIS: Index updated`);

        return {
            success: true,
            filename,
            filepath,
            category,
            relativePath: path.relative(this.projectRoot, filepath)
        };
    }

    // CL9 - BRIEF Write Executor (ESMC 3.30)
    /**
     * Write Project BRIEF - AEGIS executes file write (authored by ECHELON)
     *
     * @param {Object} options - Write options
     * @param {Object} options.brief - BRIEF JSON structure (from ECHELON.synthesizeBrief())
     * @param {Object} options.metadata - Additional metadata
     * @returns {Promise<Object>} Result with success status and filepath
     *
     * **Architecture (ESMC 3.30):**
     * - ECHELON = Strategic narrator (authored the BRIEF)
     * - PCA = Structural intelligence provider (provided codebase data)
     * - AEGIS = Executor (writes file) ← THIS METHOD
     *
     * **File Location:** `.claude/memory/.project-brief.json`
     *
     * **When Called:**
     * - User types "update brief"
     * - First seed operation
     * - Manual ECHELON.synthesizeBrief() → AEGIS.writeBrief() pipeline
     *
     * **Philosophy:** AEGIS is tactical executor, not strategic author
     */
    async writeBrief({ brief, metadata = {} }) {
        if (!brief || !brief.project_name) {
            throw new Error('AEGIS BriefWriter: valid brief object with project_name is required');
        }

        console.log(`\n📝 AEGIS: Writing BRIEF for "${brief.project_name}"...`);

        try {
            // BRIEF file location (fixed path)
            const briefPath = path.join(this.memoryPath, '.project-brief.json');

            // Update metadata to reflect AEGIS execution
            brief.metadata = {
                ...brief.metadata,
                ...metadata,
                executed_by: 'AEGIS',
                execution_timestamp: new Date().toISOString()
            };

            // Write BRIEF file (pretty-printed JSON)
            await fs.writeFile(
                briefPath,
                JSON.stringify(brief, null, 2),
                'utf-8'
            );

            console.log(`✅ AEGIS: BRIEF written → ${briefPath}`);
            console.log(`📊 AEGIS: Token estimate: ~${brief.metadata.token_size_estimate} tokens`);
            console.log(`📝 AEGIS: Authored by: ${brief.metadata.author}`);

            return {
                success: true,
                filepath: briefPath,
                relativePath: path.relative(this.projectRoot, briefPath),
                token_estimate: brief.metadata.token_size_estimate,
                author: brief.metadata.author,
                project_name: brief.project_name
            };

        } catch (error) {
            console.error(`❌ AEGIS: BRIEF write failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Format document with AEGIS official header
     */
    _formatDocumentWithHeader(title, content, metadata) {
        const datestamp = this._formatDate();
        const header = `<!--
═══════════════════════════════════════════════════════════════════════
AEGIS OFFICIAL DOCUMENTATION
═══════════════════════════════════════════════════════════════════════
Document: ${title}
Date: ${datestamp}
Author: AEGIS (Adaptive Empirical Guardian Intelligence System)
Version: ${metadata.version || 'N/A'}
Status: ${metadata.status || 'Complete'}
Category: ${metadata.category || 'General'}
═══════════════════════════════════════════════════════════════════════
-->

${content}

---

**Document Metadata:**
- Generated by: AEGIS Document Writer (ESMC 3.22.2)
- Date: ${datestamp}
- Location: \`.claude/memory/documents/\`
- Authority: AEGIS (Official Documentation System)
`;

        return header;
    }

    /**
     * Update document index (.document-index.json)
     */
    async _updateDocumentIndex(docInfo) {
        let index = { documents: [], last_updated: null };

        // Load existing index
        if (fsSync.existsSync(this.indexPath)) {
            try {
                const indexContent = await fs.readFile(this.indexPath, 'utf8');
                index = JSON.parse(indexContent);
            } catch (error) {
                console.warn(`⚠️ AEGIS: Could not read index, creating new: ${error.message}`);
            }
        }

        // Add/update document entry
        const existingIndex = index.documents.findIndex(d => d.filename === docInfo.filename);

        const entry = {
            filename: docInfo.filename,
            title: docInfo.title,
            category: docInfo.category,
            datestamp: docInfo.datestamp,
            filepath: docInfo.filepath,
            metadata: docInfo.metadata,
            created: docInfo.datestamp,
            last_modified: this._formatDate()
        };

        if (existingIndex >= 0) {
            index.documents[existingIndex] = entry;
        } else {
            index.documents.push(entry);
        }

        // Sort by datestamp (newest first)
        index.documents.sort((a, b) => b.datestamp.localeCompare(a.datestamp));

        // Update index metadata
        index.last_updated = new Date().toISOString();
        index.document_count = index.documents.length;

        // Write index
        await fs.writeFile(
            this.indexPath,
            JSON.stringify(index, null, 2),
            'utf8'
        );
    }

    /**
     * List all documents by category
     */
    async listDocuments(category = null) {
        if (!fsSync.existsSync(this.indexPath)) {
            return { documents: [], count: 0 };
        }

        const indexContent = await fs.readFile(this.indexPath, 'utf8');
        const index = JSON.parse(indexContent);

        if (category) {
            const filtered = index.documents.filter(d => d.category === category);
            return { documents: filtered, count: filtered.length };
        }

        return { documents: index.documents, count: index.documents.length };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CL PROTOCOL (ESMC 3.27) - CHANGELOG AUTOMATION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 📝 AEGIS CL PROTOCOL - Find existing CL files for a source file
     * @param {string} filename - Source filename (e.g., 'atlas-retrieval.js')
     * @returns {Promise<Array>} List of existing CL files
     *
     * Query filesystem for existing {filename}-CLX.* files
     * Returns: [{ tag: 'CL0', number: 0, path: '...' }, { tag: 'CL1', number: 1, path: '...' }]
     */
    async findCLFiles(filename) {
        const changelogDir = path.join(this.documentsPath, 'changelogs');

        // Ensure changelogs directory exists
        if (!fsSync.existsSync(changelogDir)) {
            return [];
        }

        const baseFilename = path.basename(filename, path.extname(filename));
        const clFiles = [];

        try {
            const files = await fs.readdir(changelogDir);

            // Pattern: {baseFilename}-CL{number}.{ext}
            const clPattern = new RegExp(`^${baseFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-CL(\\d+)\\..*$`);

            files.forEach(file => {
                const match = file.match(clPattern);
                if (match) {
                    const number = parseInt(match[1], 10);
                    clFiles.push({
                        tag: `CL${number}`,
                        number,
                        filename: file,
                        path: path.join(changelogDir, file)
                    });
                }
            });

            // Sort by CL number
            clFiles.sort((a, b) => a.number - b.number);

            console.log(`📸 AEGIS CL Query: Found ${clFiles.length} CL files for ${baseFilename}`);
            clFiles.forEach(cl => console.log(`   ${cl.tag}: ${cl.filename}`));

            return clFiles;
        } catch (error) {
            console.error(`❌ AEGIS CL Query failed: ${error.message}`);
            return [];
        }
    }

    /**
     * 📝 AEGIS CL PROTOCOL - Create new CL file with structured entry
     * @param {Object} clData - CL file data
     * @returns {Promise<Object>} Result with filename and path
     *
     * Structured CL file creation with automatic numbering and formatting
     * Ensures consistency: no gaps, no duplicates, uniform format
     */
    async createCLFile(clData) {
        const {
            sourceFilename,
            change,
            impact,
            rationale,
            codeLocation,
            component = 'ESMC',
            date = new Date().toISOString().split('T')[0]
        } = clData;

        if (!sourceFilename || !change) {
            throw new Error('AEGIS CL Creator: sourceFilename and change are required');
        }

        console.log(`\n📸 AEGIS CL Creator: Creating CL file for ${sourceFilename}...`);

        // Step 1: Find existing CL files to determine next number
        const existingCLs = await this.findCLFiles(sourceFilename);
        const nextNumber = existingCLs.length; // CL0, CL1, CL2, etc.

        // Step 2: Generate CL filename
        const baseFilename = path.basename(sourceFilename, path.extname(sourceFilename));
        const ext = path.extname(sourceFilename) || '.md';
        const clFilename = `${baseFilename}-CL${nextNumber}${ext}`;
        const changelogDir = path.join(this.documentsPath, 'changelogs');

        // Ensure changelogs directory exists
        if (!fsSync.existsSync(changelogDir)) {
            fsSync.mkdirSync(changelogDir, { recursive: true });
        }

        const clFilePath = path.join(changelogDir, clFilename);

        // Step 3: Build structured CL content
        const clContent = `# CL${nextNumber} - ${change}
**Date:** ${date}
**Component:** ${component}

**Change:** ${change}
**Impact:** ${impact || 'Not specified'}
**Rationale:** ${rationale || 'Not specified'}
**Code Location:** ${codeLocation || sourceFilename}

---

**Created by:** AEGIS CL Protocol (ESMC 3.27)
**ATLAS Indexed:** Yes (automatically added to topic index)
`;

        // Step 4: Write CL file
        try {
            await fs.writeFile(clFilePath, clContent, 'utf8');

            console.log(`   ✅ Created: ${clFilename}`);
            console.log(`   📍 Location: ${clFilePath}`);
            console.log(`   📊 CL Number: CL${nextNumber}`);

            // Step 5: Update document index
            await this._updateCLIndex({
                filename: clFilename,
                tag: `CL${nextNumber}`,
                number: nextNumber,
                sourceFile: sourceFilename,
                change,
                date
            });

            return {
                success: true,
                filename: clFilename,
                path: clFilePath,
                tag: `CL${nextNumber}`,
                number: nextNumber,
                inline_tag: `// CL${nextNumber} - ${change.substring(0, 60)}` // Truncate for inline use
            };
        } catch (error) {
            console.error(`   ❌ Failed to create CL file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Helper: Update CL index for ATLAS discovery
     */
    async _updateCLIndex(clEntry) {
        const clIndexPath = path.join(this.memoryPath, '.cl-index.json');
        let clIndex = { version: '1.0.0', changelogs: [] };

        // Load existing index
        if (fsSync.existsSync(clIndexPath)) {
            const content = await fs.readFile(clIndexPath, 'utf8');
            clIndex = JSON.parse(content);
        }

        // Add new entry (avoid duplicates)
        const existingIndex = clIndex.changelogs.findIndex(cl => cl.filename === clEntry.filename);
        if (existingIndex >= 0) {
            clIndex.changelogs[existingIndex] = {
                ...clIndex.changelogs[existingIndex],
                ...clEntry,
                last_updated: new Date().toISOString()
            };
        } else {
            clIndex.changelogs.push({
                ...clEntry,
                created: new Date().toISOString()
            });
        }

        // Sort by source file, then by CL number
        clIndex.changelogs.sort((a, b) => {
            if (a.sourceFile !== b.sourceFile) {
                return a.sourceFile.localeCompare(b.sourceFile);
            }
            return a.number - b.number;
        });

        clIndex.last_updated = new Date().toISOString();
        clIndex.total_changelogs = clIndex.changelogs.length;

        // Write index
        await fs.writeFile(clIndexPath, JSON.stringify(clIndex, null, 2), 'utf8');
        console.log(`   📚 CL Index updated: ${clIndex.total_changelogs} total changelogs`);
    }

    /**
     * 📝 AEGIS CL PROTOCOL - Insert inline CL tag at code location
     * @param {string} sourceFilePath - Path to source file
     * @param {number} lineNumber - Line number to insert tag (1-indexed)
     * @param {string} tag - Inline tag to insert (e.g., '// CL15 - Optimization')
     * @returns {Promise<Object>} Result with success status
     *
     * Inserts inline CL tag at specified location in source code
     * Format: // CL{number} - {brief description}
     */
    async insertCLTag(sourceFilePath, lineNumber, tag) {
        if (!sourceFilePath || !lineNumber || !tag) {
            throw new Error('AEGIS CL Tag Inserter: sourceFilePath, lineNumber, and tag are required');
        }

        console.log(`\n📸 AEGIS CL Tag Inserter: Adding tag to ${path.basename(sourceFilePath)}:${lineNumber}...`);

        try {
            // Read source file
            const content = await fs.readFile(sourceFilePath, 'utf8');
            const lines = content.split('\n');

            // Validate line number
            if (lineNumber < 1 || lineNumber > lines.length) {
                throw new Error(`Line number ${lineNumber} out of range (1-${lines.length})`);
            }

            // Insert tag BEFORE the specified line (array is 0-indexed)
            const insertIndex = lineNumber - 1;

            // Detect indentation from target line
            const targetLine = lines[insertIndex];
            const indentMatch = targetLine.match(/^(\s*)/);
            const indent = indentMatch ? indentMatch[1] : '';

            // Insert tag with same indentation
            lines.splice(insertIndex, 0, `${indent}${tag}`);

            // Write updated content
            await fs.writeFile(sourceFilePath, lines.join('\n'), 'utf8');

            console.log(`   ✅ Tag inserted: ${tag}`);
            console.log(`   📍 Location: ${path.basename(sourceFilePath)}:${lineNumber}`);

            return {
                success: true,
                file: sourceFilePath,
                line: lineNumber,
                tag
            };
        } catch (error) {
            console.error(`   ❌ Failed to insert CL tag: ${error.message}`);
            throw error;
        }
    }

    // CL2 - Atomic Edit+CL Automation (ESMC 3.30)
    /**
     * 📝 AEGIS CL PROTOCOL - Atomic file edit with automatic CL generation
     *
     * **Purpose:** Single atomic operation for file edit + CL automation
     * **Philosophy:** "Edit once, document automatically" - 95% compliance vs 40% manual
     *
     * **Architecture:**
     * - Step 1: Validation (file exists, strings valid)
     * - Step 2: Decision (shouldCreateCL heuristic)
     * - Step 3: Transaction (edit → CL file → inline tag)
     * - Step 4: Rollback (restore on any failure)
     *
     * **Transaction Safety:**
     * - Backs up original file before edit
     * - Rolls back on CL creation failure
     * - All-or-nothing guarantee
     *
     * @param {Object} params - Edit parameters
     * @param {string} params.file_path - Absolute path to file
     * @param {string} params.old_string - Content to replace
     * @param {string} params.new_string - Replacement content
     * @param {string} params.user_prompt - Context for shouldCreateCL
     * @param {string} params.change_description - Brief description for CL
     * @param {boolean} params.force_cl - Override: always create CL
     * @param {boolean} params.no_cl - Override: never create CL
     * @param {boolean} params.dry_run - Preview without executing
     * @returns {Promise<Object>} Unified result object
     *
     * @added ESMC 3.30 - Atomic CL automation
     */
    async atomicEditWithCL(params) {
        const {
            file_path,
            old_string,
            new_string,
            user_prompt = '',
            change_description = 'Code update',
            force_cl = false,
            no_cl = false,
            dry_run = false
        } = params;

        console.log(`\n📝 AEGIS Atomic Edit+CL: ${path.basename(file_path)}...`);

        // Step 1: Validation
        if (!file_path || !old_string || !new_string) {
            throw new Error('AEGIS: file_path, old_string, and new_string are required');
        }

        if (!fsSync.existsSync(file_path)) {
            throw new Error(`AEGIS: File not found: ${file_path}`);
        }

        // Step 2: CL Decision (via shouldCreateCL from MemoryRegistry)
        const registry = await getMemoryRegistry();
        const clDecision = registry.shouldCreateCL({
            file_path,
            old_string,
            new_string,
            user_prompt,
            force_cl,
            no_cl
        });

        console.log(`   🔍 CL Decision: ${clDecision.trigger ? 'CREATE' : 'SKIP'} (${clDecision.reason})`);

        // Dry run: preview without executing
        if (dry_run) {
            return {
                success: true,
                dry_run: true,
                edit_preview: { file_path, old_string, new_string },
                cl_decision: clDecision,
                message: 'Dry run complete - no changes made'
            };
        }

        // Step 3: Atomic Transaction
        let originalContent = null;
        let editSuccess = false;
        let clResult = null;
        let tagResult = null;

        try {
            // Backup original content
            originalContent = await fs.readFile(file_path, 'utf8');
            console.log(`   💾 Backup created (${originalContent.length} bytes)`);

            // Step 3A: File Edit
            const newContent = originalContent.replace(old_string, new_string);

            if (newContent === originalContent) {
                throw new Error('AEGIS: old_string not found in file');
            }

            await fs.writeFile(file_path, newContent, 'utf8');
            editSuccess = true;
            console.log(`   ✅ File edited successfully`);

            // Step 3B: CL File Creation (if triggered)
            if (clDecision.trigger) {
                const sourceFilename = path.basename(file_path);

                clResult = await this.createCLFile({
                    sourceFilename,
                    change: change_description,
                    impact: `${Math.abs(new_string.length - old_string.length)} chars changed`,
                    rationale: user_prompt || 'Automated via atomicEditWithCL',
                    codeLocation: file_path,
                    component: 'ESMC 3.30'
                });

                console.log(`   ✅ CL file created: ${clResult.filename}`);

                // Step 3C: Inline Tag Insertion
                // Find line number where old_string was located
                const lines = originalContent.split('\n');
                const oldLines = old_string.split('\n');
                let targetLine = 1;

                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes(oldLines[0])) {
                        targetLine = i + 1;
                        break;
                    }
                }

                tagResult = await this.insertCLTag(
                    file_path,
                    targetLine,
                    clResult.inline_tag
                );

                console.log(`   ✅ Inline tag inserted at line ${targetLine}`);
            }

            // Success
            console.log(`\n   🎉 Atomic Edit+CL Complete`);
            return {
                success: true,
                edit_result: { success: true, file_path },
                cl_decision: clDecision,
                cl_file: clResult,
                inline_tag: tagResult,
                rollback_info: null,
                error: null
            };

        } catch (error) {
            console.error(`   ❌ Transaction failed: ${error.message}`);

            // Step 4: Rollback (restore original content)
            if (editSuccess && originalContent) {
                try {
                    await fs.writeFile(file_path, originalContent, 'utf8');
                    console.log(`   ↩️  Rollback successful - file restored`);
                } catch (rollbackError) {
                    console.error(`   🚨 ROLLBACK FAILED: ${rollbackError.message}`);
                    return {
                        success: false,
                        edit_result: { success: false, file_path },
                        cl_decision: clDecision,
                        cl_file: null,
                        inline_tag: null,
                        rollback_info: { attempted: true, success: false, error: rollbackError.message },
                        error: `Transaction failed + Rollback failed: ${error.message} | ${rollbackError.message}`
                    };
                }
            }

            return {
                success: false,
                edit_result: { success: editSuccess, file_path },
                cl_decision: clDecision,
                cl_file: clResult,
                inline_tag: tagResult,
                rollback_info: { attempted: editSuccess, success: true },
                error: error.message
            };
        }
    }

    /**
     * 📝 AEGIS CL PROTOCOL - Update ATLAS topic index with CL files
     * @param {Object} updateData - Update data
     * @returns {Promise<void>}
     *
     * Makes CL files discoverable via ATLAS memory retrieval
     * Adds changelogs as special topic for backup reading material
     */
    async updateTopicIndexWithCL(updateData) {
        const { sourceFile, clFiles = [] } = updateData;

        if (!sourceFile) {
            throw new Error('AEGIS CL Index Updater: sourceFile is required');
        }

        const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');
        let topicIndex = { version: '1.0.0', topics: [] };

        // Load existing topic index
        if (fsSync.existsSync(topicIndexPath)) {
            const content = await fs.readFile(topicIndexPath, 'utf8');
            topicIndex = JSON.parse(content);
        }

        // Create or update changelog topic for this source file
        const baseFilename = path.basename(sourceFile, path.extname(sourceFile));
        const topicName = `${baseFilename}-changelogs`;

        const existingTopicIndex = topicIndex.topics.findIndex(t => t.topic_name === topicName);

        const clTopic = {
            topic_name: topicName,
            aliases: [baseFilename, 'changelog', 'CL', sourceFile],
            sessions: clFiles.map(cl => ({
                session_id: cl.tag,
                relevance: 1.0,
                cl_file: cl.filename,
                cl_number: cl.number
            })),
            metadata: {
                source_file: sourceFile,
                total_cl_files: clFiles.length,
                type: 'changelog_topic'
            },
            last_updated: new Date().toISOString()
        };

        if (existingTopicIndex >= 0) {
            topicIndex.topics[existingTopicIndex] = clTopic;
        } else {
            topicIndex.topics.push(clTopic);
        }

        topicIndex.last_updated = new Date().toISOString();

        // Write topic index
        await fs.writeFile(topicIndexPath, JSON.stringify(topicIndex, null, 2), 'utf8');

        console.log(`📚 ATLAS Topic Index updated: ${topicName} (${clFiles.length} CL files)`);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// ESMC 3.33 - AUDIT LOGGER (On-Demand Execution Logging)
// ═══════════════════════════════════════════════════════════════════════

class AuditLogger {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.logsPath = path.join(this.projectRoot, '.claude', 'memory', 'documents', 'logs');
        this.version = '3.33.0';

        console.log(`📊 Audit Logger ${this.version} initialized`);
    }

    _findProjectRoot() {
        let current = __dirname;
        while (current !== path.dirname(current)) {
            const claudePath = path.join(current, '.claude');
            if (fsSync.existsSync(claudePath)) {
                return current;
            }
            current = path.dirname(current);
        }
        return process.cwd();
    }

    /**
     * Capture execution log during audit-triggered sessions
     * @param {object} context - Execution context from ECHELON
     * @returns {Promise<object>} Write result
     */
    async captureExecutionLog(context) {
        try {
            // Ensure logs directory exists
            await fs.mkdir(this.logsPath, { recursive: true });

            // Generate audit ID from user prompt
            const auditSlug = context.userPrompt
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .slice(0, 8)
                .join('-');

            const date = new Date().toISOString().split('T')[0];
            const filename = `${date}-${auditSlug}.json`;
            const filepath = path.join(this.logsPath, filename);

            // Build audit log structure
            const auditLog = {
                audit_id: `${date}-${auditSlug}`,
                date: new Date().toISOString(),
                trigger: 'user_keyword_audit',
                esmc_version: '3.33',
                mode: context.mode || 'full_deployment',
                user_prompt: context.userPrompt,

                execution_evidence: {
                    bootstrap_routing: {
                        phase: context.bootstrap?.phase || '-1',
                        mode_detected: context.bootstrap?.mode_detected || context.mode
                    },
                    atlas_retrieval: {
                        t1_hits: context.atlas?.t1_hits || 0,
                        t2_hits: context.atlas?.t2_hits || 0,
                        hydra_used: context.atlas?.hydra_used || false,
                        t3_hits: context.atlas?.t3_hits || 0,
                        total_sessions_queried: context.atlas?.total_sessions || 0
                    },
                    mesh_intelligence: {
                        piu: context.mesh?.piu || { analysis: 'not captured' },
                        dki: context.mesh?.dki || { standards: 'not captured' },
                        uip: context.mesh?.uip || { patterns: 'not captured' },
                        pca: context.mesh?.pca || { context: 'not captured' }
                    },
                    echelon_athena_dialogue: {
                        consensus_confidence: context.consensus?.confidence || 0,
                        gaps_detected: context.consensus?.gaps || 0,
                        athena_triggered: context.athena?.triggered || false,
                        athena_question: context.athena?.question || null,
                        echelon_response: context.athena?.echelon_response || null
                    },
                    colonel_deployment: context.colonels || {
                        wave_1: [],
                        wave_2: [],
                        wave_3: [],
                        wave_4: [],
                        wave_5: []
                    }
                },

                performance_metrics: {
                    total_time: context.performance?.total_time || 'not captured',
                    token_usage: context.performance?.token_usage || 0,
                    atlas_cascade_time: context.performance?.atlas_time || 'not captured'
                }
            };

            // Write audit log
            await fs.writeFile(filepath, JSON.stringify(auditLog, null, 2), 'utf-8');

            console.log(`📊 Audit log written: ${filename}`);

            return {
                success: true,
                filename: filename,
                filepath: filepath,
                audit_id: auditLog.audit_id
            };

        } catch (error) {
            console.error(`❌ Audit log write failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════

module.exports = {
    MemoryRegistry,
    IntelligentMemorySeeder,
    MemoryGarbageCollector,  // @added ESMC 3.13.2
    getMemoryRegistry, // 🎖️ ESMC 3.13 P1 - Singleton accessor
    EchoManager, // 🎖️ ESMC 3.22 v3.0 - Context Parity Architecture
    DocumentWriter, // 🎖️ ESMC 3.22.2 - Official Documentation Authority
    AuditLogger // 🎖️ ESMC 3.33 - On-Demand Execution Logging
};

// Example usage
if (require.main === module) {
    (async () => {
        console.log("🎖️ ESMC 3.9.3 - AEGIS Memory System Test\n");

        const registry = new MemoryRegistry();
        await registry.load();

        console.log("\n📊 Registry Status:");
        console.log(registry.getStatus());

        console.log("\n✅ AEGIS Memory System test completed");
    })();
}
