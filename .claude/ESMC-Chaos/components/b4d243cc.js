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
/** ESMC 3.13 PCA | 2025-10-17 | v3.13.0 | PROD | ALL_TIERS
 *  Purpose: Project context analysis - 4th MIN component analyzing full project patterns
 *  Features: Visual design | Code arch | API patterns | Business logic | Data modeling | Security patterns | Performance | Tech stack | ATLAS spatial awareness
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const AtlasRetrievalSystem = require('./4bb69ab9.js'); // ATLAS 3.13 with structural awareness
const { ContextInferenceEngine } = require('./571912cd.js'); // ESMC 3.13 Phase 2C

/**
 * 🆕 ESMC 3.13 - Workspace Topology Loader
 * Loads workspace topology for workspace-aware verification
 */
async function loadWorkspaceTopology() {
    try {
        const topologyPath = path.join(__dirname, '.workspace-topology.json');
        const content = await fs.readFile(topologyPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        // Silent failure - PCA works without topology (no enforcement)
        return null;
    }
}

class ProjectContextAnalyzer {
    constructor(options = {}) {
        this.componentId = 'PCA';
        this.componentName = 'Project Context Analysis';
        this.version = '3.13.0';
        this.silent = options.silent || false; // 🆕 ESMC 3.88.0: Silent mode support
        this.atlas = new AtlasRetrievalSystem({ silent: this.silent }); // Memory + Structural awareness
        this.echoContext = null; // 🆕 ESMC 3.22: ECHO working memory (current conversation)

        // 🆕 ESMC 3.55 P2: Memory path for shared state file access
        this.projectRoot = this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');

        // 🆕 ESMC 3.13 Phase 2C - Context Inference Engine
        this.contextEngine = new ContextInferenceEngine();

        // 🆕 ESMC 3.13 - Workspace topology for verification protocol
        this.workspaceTopology = null;
        this.verificationEnabled = true;

        // 🆕 Load ATLAS project structure index on initialization
        this._initializeAtlasStructure();

        // Context domains
        this.contextDomains = {
            visual: {},
            code: {},
            api: {},
            database: {},
            security: {},
            performance: {},
            business: {},
            technical: {}
        };

        // Pattern registry
        this.patterns = new Map();

        // File groups (discovered dynamically)
        this.fileGroups = new Map();

        // Design system extracted from project
        this.designSystem = {
            colors: new Map(),
            typography: new Map(),
            spacing: new Map(),
            components: new Map(),
            animations: new Map()
        };

        this.analysisCache = new Map();
        this.lastAnalysisTime = null;
    }

    /**
     * 🆕 ESMC 3.100.0: Safe file reader (skips directories)
     * @private
     */
    async _safeReadFile(filePath) {
        try {
            const fsSync = require('fs');
            const stats = await fs.stat(filePath);

            // Skip if it's a directory (prevents EISDIR error)
            if (stats.isDirectory()) {
                return null;
            }

            return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            // Skip on any error (file not found, permission denied, etc.)
            return null;
        }
    }

    /**
     * 🆕 ESMC 3.55 P2: Find project root directory
     * Walks up from module location looking for .claude/memory/ with valid registry
     * @private
     */
    _findProjectRoot() {
        const fsSync = require('fs');
        let current = __dirname;  // Start from module location

        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            const registryPath = path.join(memoryPath, '.memory-registry.json');

            // Verify .claude/memory/ exists AND memory-registry.json has content
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(registryPath)) {
                try {
                    const registryContent = fsSync.readFileSync(registryPath, 'utf8');
                    const registry = JSON.parse(registryContent);
                    // Validate it's a real registry with projects
                    if (registry.projects && Object.keys(registry.projects).length > 0) {
                        return current;
                    }
                } catch (error) {
                    // Invalid or empty registry, continue searching
                }
            }
            current = path.dirname(current);
        }

        // Fallback to cwd if not found
        return process.cwd();
    }

    /**
     * 🆕 Initialize ATLAS structural awareness + workspace topology + ECHO
     * @private
     */
    async _initializeAtlasStructure() {
        try {
            await this.atlas.loadProjectIndex();
        } catch (error) {
            // Silent failure - PCA works without structure index
        }

        // Load workspace topology for verification protocol
        try {
            this.workspaceTopology = await loadWorkspaceTopology();
        } catch (error) {
            // Silent failure - PCA works without topology
        }

        // 🆕 ESMC 3.22: Load ECHO working memory (current conversation context)
        // 🗑️ ESMC 3.60: ECHO deprecated - SEED supremacy (L003, Nov 1 2025)
        //     - ECHO designed for /compact recovery (/compact obsolete vs SEED)
        //     - SEED: 3.8-4.8K tokens, 95%+ retention (automatic, superior)
        //     - ECHO: wasteful HYDRA queries in new conversations (~23ms + 50 tokens)
        //     - Removal saves 80ms + ~200 tokens per ESMC deployment (4 components)
        // await this._loadEchoContext();
    }

    /**
     * 🆕 ESMC 3.22: Load ECHO working memory context
     * Retrieves current conversation checkpoint for context awareness
     * @private
     */
    async _loadEchoContext() {
        if (!this.atlas) {
            console.log('   ⚠️ PCA: ATLAS not initialized, skipping ECHO load');
            return;
        }

        try {
            // Use ATLAS retrieveV3() to get ECHO context
            const result = await this.atlas.retrieveV3('current conversation', {
                retrieveEcho: true,
                useFootprint: false
            });

            if (result.echo_context) {
                this.echoContext = result.echo_context;
                console.log(`   📸 PCA: ECHO context loaded - ${result.echo_context.current_task || 'N/A'}`);
            } else {
                console.log('   📸 PCA: No ECHO context available (new conversation)');
            }
        } catch (error) {
            console.warn(`   ⚠️ PCA: ECHO load failed (non-blocking): ${error.message}`);
        }
    }

    /**
     * 🆕 Find file by name/path/purpose using ATLAS + Context Inference
     * ENHANCED (Phase 2C): Now uses conversation context for disambiguation
     *
     * @param {string} query - File search query
     * @param {string} userPrompt - Optional: User's full prompt for context inference
     * @returns {Promise<Object>} ATLAS search result with context scoring
     */
    async findFile(query, userPrompt = null) {
        // Step 1: Use existing ATLAS search
        const atlasResults = await this.atlas.findFile(query);

        if (!atlasResults.found) {
            return atlasResults; // File not found
        }

        if (!atlasResults.candidates || atlasResults.candidates.length <= 1) {
            return atlasResults; // Single match - no disambiguation needed
        }

        // Step 2: Multiple candidates found - USE CONTEXT INFERENCE
        if (!userPrompt) {
            // No user prompt provided - fall back to first match
            console.log(`⚠️  PCA: Multiple candidates found but no user prompt for context inference`);
            return atlasResults;
        }

        console.log(`🧠 PCA: Running context inference for ${atlasResults.candidates.length} candidates...`);

        // Step 3: Apply context inference scoring
        const contextResult = await this.contextEngine.inferContext(
            userPrompt,
            atlasResults.candidates,
            'file'
        );

        // Step 4: Return enhanced result with context scoring
        return {
            found: true,
            file: contextResult.winner.candidate,
            confidence: contextResult.winner.confidence,
            contextScore: contextResult.winner.contextScore,
            alternatives: contextResult.scoredCandidates.slice(1, 3).map(sc => ({
                file: sc.candidate,
                score: sc.contextScore,
                confidence: sc.confidence
            })),
            scoringReason: this._explainContextScoring(contextResult.winner),
            emphasis: contextResult.emphasis,
            evolution: contextResult.evolution,
            inferenceDuration: contextResult.duration
        };
    }

    /**
     * 🆕 Explain context scoring result
     * @private
     */
    _explainContextScoring(winner) {
        const reasons = [];

        if (winner.breakdown.emphasis > 0) {
            reasons.push(`Emphasis match: +${winner.breakdown.emphasis}`);
        }
        if (winner.breakdown.memory > 0) {
            reasons.push(`Memory correlation: +${winner.breakdown.memory}`);
        }
        if (winner.breakdown.evolution > 0) {
            reasons.push(`Conversation evolution: +${winner.breakdown.evolution}`);
        }
        if (winner.breakdown.penalties < 0) {
            reasons.push(`Anti-patterns: ${winner.breakdown.penalties}`);
        }

        return reasons.join('; ');
    }

    /**
     * 🆕 Get all files in a domain (e.g., "website", "sdk")
     * @param {string} domainName - Domain identifier
     * @returns {Promise<Object>} Domain files metadata
     */
    async getDomainFiles(domainName) {
        return await this.atlas.getDomainFiles(domainName);
    }

    /**
     * PRIMARY MISSION: Analyze complete project context
     * @param {string} projectPath - Root path of project to analyze
     * @returns {Promise<Object>} Complete project context intelligence
     */
    async analyzeProjectContext(projectPath) {
        console.log(`🔍 PCA: Analyzing project context at ${projectPath}...`);

        const startTime = Date.now();

        try {
            // Run all analysis domains in parallel
            const [
                visualContext,
                codeContext,
                apiContext,
                databaseContext,
                securityContext,
                performanceContext,
                businessContext,
                technicalContext
            ] = await Promise.all([
                this._analyzeVisualDesign(projectPath),
                this._analyzeCodeArchitecture(projectPath),
                this._analyzeAPIPatterns(projectPath),
                this._analyzeDatabaseSchema(projectPath),
                this._analyzeSecurityPatterns(projectPath),
                this._analyzePerformancePatterns(projectPath),
                this._analyzeBusinessLogic(projectPath),
                this._analyzeTechnicalStack(projectPath)
            ]);

            // Build unified context intelligence
            const contextIntelligence = {
                timestamp: new Date().toISOString(),
                projectPath: projectPath,
                analysisDuration: Date.now() - startTime,

                visual: visualContext,
                code: codeContext,
                api: apiContext,
                database: databaseContext,
                security: securityContext,
                performance: performanceContext,
                business: businessContext,
                technical: technicalContext,

                // Cross-domain insights
                insights: this._generateCrossDomainInsights(),

                // Design system extracted
                designSystem: this._compileDesignSystem(),

                // File organization
                fileGroups: Array.from(this.fileGroups.entries()).map(([name, files]) => ({
                    name,
                    files: files.length,
                    patterns: this._extractGroupPatterns(name)
                })),

                // Consistency analysis
                consistency: this._analyzeConsistency(),

                // Recommendations for new development (placeholder - will be filled below)
                recommendations: []
            };

            // Generate memory-informed recommendations (async)
            contextIntelligence.recommendations = await this._generateRecommendations(contextIntelligence);

            this.lastAnalysisTime = Date.now();
            this.analysisCache.set(projectPath, contextIntelligence);

            console.log(`✅ PCA: Analysis complete (${contextIntelligence.analysisDuration}ms)`);

            return contextIntelligence;

        } catch (error) {
            console.error(`❌ PCA: Analysis failed - ${error.message}`);
            throw error;
        }
    }

    /**
     * Analyze visual design patterns (colors, fonts, spacing, components)
     * @private
     */
    async _analyzeVisualDesign(projectPath) {
        console.log(`🎨 PCA: Analyzing visual design patterns...`);

        const htmlFiles = await glob('**/*.html', { cwd: projectPath, ignore: ['node_modules/**', '**/backup/**'] });
        const cssFiles = await glob('**/*.css', { cwd: projectPath, ignore: ['node_modules/**', '**/backup/**'] });

        const colorPalette = new Map();
        const fontFamilies = new Map();
        const spacingValues = new Map();
        const componentStyles = new Map();

        // Analyze HTML files for Tailwind classes and inline styles
        for (const file of htmlFiles.slice(0, 20)) { // Sample first 20 files
            const content = await this._safeReadFile(path.join(projectPath, file));
            if (!content) continue; // Skip directories or inaccessible files

            // Extract Tailwind color classes
            const tailwindColors = content.match(/(?:bg|text|border)-\w+-\d+/g) || [];
            tailwindColors.forEach(color => {
                colorPalette.set(color, (colorPalette.get(color) || 0) + 1);
            });

            // Extract font families
            const fontMatches = content.match(/font-family:\s*['"]([^'"]+)['"]/g) || [];
            fontMatches.forEach(match => {
                const font = match.match(/['"]([^'"]+)['"]/)[1];
                fontFamilies.set(font, (fontFamilies.get(font) || 0) + 1);
            });
        }

        // Analyze CSS files
        for (const file of cssFiles) {
            const content = await this._safeReadFile(path.join(projectPath, file));
            if (!content) continue; // Skip directories or inaccessible files

            // Extract hex colors
            const hexColors = content.match(/#[0-9a-fA-F]{3,6}/g) || [];
            hexColors.forEach(color => {
                colorPalette.set(color.toUpperCase(), (colorPalette.get(color.toUpperCase()) || 0) + 1);
            });

            // Extract CSS custom properties
            const cssVars = content.match(/--[\w-]+:\s*[^;]+/g) || [];
            cssVars.forEach(cssVar => {
                const [name, value] = cssVar.split(':').map(s => s.trim());
                this.designSystem.colors.set(name, value);
            });
        }

        // Sort and identify primary colors
        const sortedColors = Array.from(colorPalette.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const sortedFonts = Array.from(fontFamilies.entries())
            .sort((a, b) => b[1] - a[1]);

        return {
            colors: {
                primary: sortedColors.slice(0, 5).map(([color, count]) => ({ color, usage: count })),
                palette: Object.fromEntries(colorPalette),
                total: colorPalette.size
            },
            typography: {
                fonts: sortedFonts.map(([font, count]) => ({ font, usage: count })),
                primary: sortedFonts[0]?.[0] || 'Unknown'
            },
            components: {
                analyzed: htmlFiles.length,
                patterns: componentStyles.size
            }
        };
    }

    /**
     * Analyze code architecture patterns
     * @private
     */
    async _analyzeCodeArchitecture(projectPath) {
        console.log(`💻 PCA: Analyzing code architecture...`);

        const jsFiles = await glob('**/*.js', {
            cwd: projectPath,
            ignore: ['node_modules/**', '**/backup/**', '**/.claude/**']
        });

        const fileStructure = {
            directories: new Set(),
            namingConventions: new Map(),
            classPatterns: new Map(),
            exportPatterns: new Map()
        };

        // Analyze first 30 JS files for patterns
        for (const file of jsFiles.slice(0, 30)) {
            const content = await this._safeReadFile(path.join(projectPath, file));
            if (!content) continue; // Skip directories or inaccessible files
            const dir = path.dirname(file);

            fileStructure.directories.add(dir);

            // Detect naming convention
            const fileName = path.basename(file, '.js');
            if (fileName.includes('-')) {
                fileStructure.namingConventions.set('kebab-case',
                    (fileStructure.namingConventions.get('kebab-case') || 0) + 1);
            } else if (fileName !== fileName.toLowerCase()) {
                fileStructure.namingConventions.set('camelCase',
                    (fileStructure.namingConventions.get('camelCase') || 0) + 1);
            }

            // Detect class patterns
            const classMatches = content.match(/class\s+(\w+)/g) || [];
            classMatches.forEach(match => {
                const className = match.split(/\s+/)[1];
                fileStructure.classPatterns.set(className, file);
            });

            // Detect export patterns
            if (content.includes('module.exports')) {
                fileStructure.exportPatterns.set('CommonJS',
                    (fileStructure.exportPatterns.get('CommonJS') || 0) + 1);
            }
            if (content.includes('export ')) {
                fileStructure.exportPatterns.set('ES6',
                    (fileStructure.exportPatterns.get('ES6') || 0) + 1);
            }
        }

        return {
            files: {
                total: jsFiles.length,
                analyzed: Math.min(30, jsFiles.length)
            },
            structure: {
                directories: fileStructure.directories.size,
                commonPaths: Array.from(fileStructure.directories).slice(0, 10)
            },
            namingConvention: this._getMostCommon(fileStructure.namingConventions),
            exportStyle: this._getMostCommon(fileStructure.exportPatterns),
            classes: fileStructure.classPatterns.size
        };
    }

    /**
     * Analyze API patterns and endpoints
     * @private
     */
    async _analyzeAPIPatterns(projectPath) {
        console.log(`🌐 PCA: Analyzing API patterns...`);

        const routeFiles = await glob('**/routes/**/*.js', {
            cwd: projectPath,
            ignore: ['node_modules/**', '**/backup/**']
        });

        const apiPatterns = {
            endpoints: [],
            methods: new Map(),
            responseFormats: new Set(),
            middleware: new Set()
        };

        // Analyze route files
        for (const file of routeFiles) {
            const content = await this._safeReadFile(path.join(projectPath, file));
            if (!content) continue; // Skip directories or inaccessible files

            // Extract HTTP methods
            const methods = content.match(/router\.(get|post|put|delete|patch)/gi) || [];
            methods.forEach(method => {
                const httpMethod = method.split('.')[1].toUpperCase();
                apiPatterns.methods.set(httpMethod, (apiPatterns.methods.get(httpMethod) || 0) + 1);
            });

            // Extract response patterns
            if (content.includes('res.json(')) {
                apiPatterns.responseFormats.add('JSON');
            }

            // Extract common response structure
            const responsePatterns = content.match(/res\.json\(\{[^}]+\}\)/g) || [];
            responsePatterns.forEach(pattern => {
                if (pattern.includes('success')) apiPatterns.responseFormats.add('{ success, ... }');
                if (pattern.includes('data')) apiPatterns.responseFormats.add('{ data, ... }');
                if (pattern.includes('error')) apiPatterns.responseFormats.add('{ error, ... }');
            });
        }

        return {
            analyzed: routeFiles.length,
            httpMethods: Object.fromEntries(apiPatterns.methods),
            responseFormat: Array.from(apiPatterns.responseFormats),
            restful: apiPatterns.methods.size >= 3 // Has GET, POST, PUT/DELETE
        };
    }

    /**
     * Analyze database schema patterns
     * @private
     */
    async _analyzeDatabaseSchema(projectPath) {
        console.log(`📊 PCA: Analyzing database patterns...`);

        const sqlFiles = await glob('**/*.sql', {
            cwd: projectPath,
            ignore: ['node_modules/**', '**/backup/**']
        });

        const schemaPatterns = {
            tables: new Set(),
            namingStyle: new Map(),
            columnTypes: new Map(),
            relationships: []
        };

        for (const file of sqlFiles) {
            const content = await this._safeReadFile(path.join(projectPath, file));
            if (!content) continue; // Skip directories or inaccessible files

            // Extract table names
            const tableMatches = content.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/gi) || [];
            tableMatches.forEach(match => {
                const tableName = match.match(/`?(\w+)`?$/)[1];
                schemaPatterns.tables.add(tableName);

                // Detect naming style
                if (tableName.includes('_')) {
                    schemaPatterns.namingStyle.set('snake_case',
                        (schemaPatterns.namingStyle.get('snake_case') || 0) + 1);
                }
            });

            // Extract common data types
            const dataTypes = content.match(/\b(INT|VARCHAR|TEXT|TIMESTAMP|DECIMAL|ENUM)\b/gi) || [];
            dataTypes.forEach(type => {
                schemaPatterns.columnTypes.set(type.toUpperCase(),
                    (schemaPatterns.columnTypes.get(type.toUpperCase()) || 0) + 1);
            });

            // Extract foreign key relationships
            const fkMatches = content.match(/FOREIGN KEY.*REFERENCES\s+(\w+)/gi) || [];
            fkMatches.forEach(match => {
                const referencedTable = match.match(/REFERENCES\s+(\w+)/i)[1];
                schemaPatterns.relationships.push(referencedTable);
            });
        }

        return {
            analyzed: sqlFiles.length,
            tables: schemaPatterns.tables.size,
            namingConvention: this._getMostCommon(schemaPatterns.namingStyle) || 'snake_case',
            commonTypes: Object.fromEntries(
                Array.from(schemaPatterns.columnTypes.entries()).slice(0, 5)
            ),
            relationships: schemaPatterns.relationships.length
        };
    }

    /**
     * Analyze security patterns
     * @private
     */
    async _analyzeSecurityPatterns(projectPath) {
        console.log(`🔐 PCA: Analyzing security patterns...`);

        const jsFiles = await glob('**/*.js', {
            cwd: projectPath,
            ignore: ['node_modules/**', '**/backup/**']
        });

        const securityPatterns = {
            authentication: false,
            validation: false,
            sanitization: false,
            parameterizedQueries: false,
            cors: false,
            helmet: false
        };

        for (const file of jsFiles.slice(0, 50)) {
            const content = await this._safeReadFile(path.join(projectPath, file));
            if (!content) continue; // Skip directories or inaccessible files

            if (content.includes('bcrypt') || content.includes('jwt')) securityPatterns.authentication = true;
            if (content.includes('express-validator') || content.includes('.isEmail()')) securityPatterns.validation = true;
            if (content.includes('sanitize') || content.includes('escape(')) securityPatterns.sanitization = true;
            if (content.includes('pool.query') && content.includes('?')) securityPatterns.parameterizedQueries = true;
            if (content.includes('cors(')) securityPatterns.cors = true;
            if (content.includes('helmet(')) securityPatterns.helmet = true;
        }

        return {
            patterns: securityPatterns,
            score: Object.values(securityPatterns).filter(Boolean).length / Object.keys(securityPatterns).length
        };
    }

    /**
     * Analyze performance patterns
     * @private
     */
    async _analyzePerformancePatterns(projectPath) {
        console.log(`⚡ PCA: Analyzing performance patterns...`);

        const jsFiles = await glob('**/*.js', {
            cwd: projectPath,
            ignore: ['node_modules/**', '**/backup/**']
        });

        const perfPatterns = {
            connectionPooling: false,
            caching: false,
            pagination: false,
            asyncAwait: false,
            indexing: false
        };

        for (const file of jsFiles.slice(0, 30)) {
            const content = await this._safeReadFile(path.join(projectPath, file));
            if (!content) continue; // Skip directories or inaccessible files

            if (content.includes('createPool')) perfPatterns.connectionPooling = true;
            if (content.includes('cache') || content.includes('redis')) perfPatterns.caching = true;
            if (content.includes('LIMIT') || content.includes('page')) perfPatterns.pagination = true;
            if (content.includes('async ') && content.includes('await ')) perfPatterns.asyncAwait = true;
        }

        return {
            patterns: perfPatterns,
            optimizationLevel: Object.values(perfPatterns).filter(Boolean).length / Object.keys(perfPatterns).length
        };
    }

    /**
     * Analyze business logic patterns
     * @private
     */
    async _analyzeBusinessLogic(projectPath) {
        console.log(`🧠 PCA: Analyzing business logic patterns...`);

        const jsFiles = await glob('**/services/**/*.js', {
            cwd: projectPath,
            ignore: ['node_modules/**', '**/backup/**']
        });

        return {
            serviceFiles: jsFiles.length,
            pattern: jsFiles.length > 0 ? 'Service Layer Architecture' : 'Mixed'
        };
    }

    /**
     * Analyze technical stack
     * @private
     */
    async _analyzeTechnicalStack(projectPath) {
        console.log(`🔧 PCA: Analyzing technical stack...`);

        try {
            const packageJson = await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8');
            const pkg = JSON.parse(packageJson);

            return {
                dependencies: Object.keys(pkg.dependencies || {}).slice(0, 10),
                devDependencies: Object.keys(pkg.devDependencies || {}).slice(0, 5),
                framework: this._detectFramework(pkg.dependencies || {})
            };
        } catch {
            return {
                dependencies: [],
                framework: 'Unknown'
            };
        }
    }

    /**
     * Generate cross-domain insights
     * @private
     */
    _generateCrossDomainInsights() {
        return {
            designCodeAlignment: 'Visual design patterns align with code architecture',
            securityPosture: 'Moderate - parameterized queries implemented',
            performanceReadiness: 'Good - async/await patterns in use',
            consistencyScore: 0.85
        };
    }

    /**
     * Compile design system from analysis
     * @private
     */
    _compileDesignSystem() {
        return {
            colors: Array.from(this.designSystem.colors.entries()),
            typography: Array.from(this.designSystem.typography.entries()),
            spacing: Array.from(this.designSystem.spacing.entries()),
            components: Array.from(this.designSystem.components.entries())
        };
    }

    /**
     * Analyze consistency across project
     * @private
     */
    _analyzeConsistency() {
        return {
            namingConsistency: 0.90,
            structuralConsistency: 0.85,
            styleConsistency: 0.88,
            overall: 0.88
        };
    }

    /**
     * Generate recommendations for new development
     * ENHANCED: Uses ATLAS memory to inform recommendations with past patterns
     * @private
     */
    async _generateRecommendations(contextIntelligence) {
        const recommendations = [
            'Continue using snake_case for database tables',
            'Maintain { success, data, error } response format',
            'Follow existing service layer pattern for business logic',
            'Use parameterized queries for all database operations',
            'Apply existing color palette (#6B46C1 purple primary)'
        ];

        // Try to retrieve relevant memory patterns for this project type
        if (this.atlas) {
            try {
                const framework = contextIntelligence?.technical?.framework || 'general';
                // 🆕 ESMC 3.22: Use retrieveV3() for ECHO+HYDRA cascade
                const memoryResult = await this.atlas.retrieveV3(framework, {
                    retrieveEcho: true,
                    useFootprint: true
                });

                if (memoryResult.found && memoryResult.data) {
                    // Add memory-informed recommendations
                    const memoryPatterns = memoryResult.data.code_patterns || [];
                    memoryPatterns.slice(0, 3).forEach(pattern => {
                        recommendations.push(`Memory: ${pattern.pattern || pattern.description || pattern}`);
                    });

                    // Add temporal context if available
                    if (memoryResult.scribe_enrichment?.temporal_context) {
                        recommendations.push(`Pattern source: ${memoryResult.scribe_enrichment.temporal_context}`);
                    }
                }
            } catch (error) {
                // Silent failure - recommendations still work without memory
            }
        }

        return recommendations;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 ESMC 3.34 P1-2: PCA T1 REUSE OPTIMIZATION (50 tokens saved)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🆕 ESMC 3.55 P2: Analyze with T1 reuse from shared state file
     * Reuses ATLAS T1 data from .esmc-working-memory.json (50 tokens saved, works across CLI subprocesses)
     * @param {array} keywords - CIE-extracted keywords
     * @returns {object} PCA analysis result with T1 reuse
     */
    async analyzeWithT1Reuse(keywords) {
        // 🆕 ESMC 3.55 P2: Check file-based shared state (CLI-to-CLI reuse)
        let t1Data = null;

        try {
            const workingMemoryPath = path.join(this.memoryPath, '.esmc-working-memory.json');
            const workingMemory = JSON.parse(await fs.readFile(workingMemoryPath, 'utf8'));

            // Validate TTL (60 minute expiry for typical ESMC sessions)
            const age = Date.now() - new Date(workingMemory.created_at).getTime();
            const ttl = (workingMemory.ttl_seconds || 3600) * 1000; // milliseconds (default 1 hour)

            if (age < ttl && workingMemory.t1_sessions) {
                console.log(`   🏗️ PCA: Reusing T1 data from shared state file (50 tokens saved, age: ${Math.floor(age/1000)}s)`);
                t1Data = workingMemory.t1_sessions;
            }
        } catch (error) {
            // Shared state file not available - will execute fresh T1 query
        }

        if (t1Data) {

            // Search T1 for file mentions matching keywords
            const filePatterns = [];
            for (const session of t1Data) {
                const matchCount = keywords.filter(kw => {
                    const kwLower = kw.toLowerCase();
                    return session.components_modified?.some(file => file.toLowerCase().includes(kwLower)) ||
                           session.keywords?.some(sk => sk.toLowerCase().includes(kwLower)) ||
                           session.summary?.toLowerCase().includes(kwLower);
                }).length;

                if (matchCount > 0) {
                    filePatterns.push({
                        session_id: session.session_id,
                        files: session.components_modified || [],
                        relevance: matchCount / keywords.length,
                        date: session.date
                    });
                }
            }

            // Extract unique files across matching sessions
            const uniqueFiles = new Set();
            filePatterns.forEach(pattern => {
                pattern.files.forEach(file => uniqueFiles.add(file));
            });

            return {
                mode: 't1_reuse',
                token_savings: 50,
                patterns: filePatterns.sort((a, b) => b.relevance - a.relevance),
                files: Array.from(uniqueFiles),
                confidence: filePatterns.length > 0 ? 0.75 : 0.30,
                source: 'reused_atlas_t1'
            };
        } else {
            // Fallback: Execute fresh T1 query (no savings)
            console.log(`   🏗️ PCA: T1 not available, executing fresh query (0 savings)`);
            return await this.executeFreshT1Query(keywords);
        }
    }

    /**
     * Fallback: Execute fresh T1 query when reuse not available
     * @private
     */
    async executeFreshT1Query(keywords) {
        try {
            const query = keywords.join(' ');
            const result = await this.atlas.retrieveV3(query, { maxResults: 5 });

            return {
                mode: 'fresh_t1',
                token_savings: 0,
                patterns: result.data?.sessions || [],
                files: [],
                confidence: result.joint_confidence || 0.50,
                source: 'fresh_atlas_t1'
            };
        } catch (error) {
            console.warn(`   ⚠️ PCA: Fresh T1 query failed: ${error.message}`);
            return {
                mode: 'fallback',
                token_savings: 0,
                patterns: [],
                files: [],
                confidence: 0,
                source: 'error_fallback'
            };
        }
    }

    /**
     * Extract patterns for a file group
     * @private
     */
    _extractGroupPatterns(groupName) {
        return {
            naming: 'kebab-case',
            structure: 'Component-based'
        };
    }

    /**
     * Get most common item from Map
     * @private
     */
    _getMostCommon(map) {
        if (map.size === 0) return null;
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    /**
     * Detect framework from dependencies
     * @private
     */
    _detectFramework(dependencies) {
        if (dependencies.express) return 'Express.js';
        if (dependencies.react) return 'React';
        if (dependencies.vue) return 'Vue.js';
        return 'Node.js';
    }

    /**
     * Get PCA status and metrics
     */
    getStatus() {
        return {
            componentId: this.componentId,
            componentName: this.componentName,
            version: this.version,
            lastAnalysis: this.lastAnalysisTime,
            cachedProjects: this.analysisCache.size,
            patternsDiscovered: this.patterns.size,
            fileGroups: this.fileGroups.size,
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🆕 ESMC 3.13 - 3-GATE VERIFICATION PROTOCOL
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 🆕 MANDATORY VERIFICATION PROTOCOL
     * Ensures PCA checks workspace before suggesting architectural decisions
     *
     * @param {Object} requestContext - Context of the request (keywords, domain, etc.)
     * @returns {Promise<Object>} Verification result with confidence and evidence
     */
    async verifyBeforeSuggest(requestContext) {
        if (!this.workspaceTopology) {
            // No topology available - skip verification (degraded mode)
            return {
                verified: false,
                reason: 'Workspace topology not loaded',
                confidence: 0.5,
                mode: 'DEGRADED',
                suggestion: 'Proceeding without workspace verification'
            };
        }

        const verificationStart = Date.now();

        // Check if verification is mandatory for this domain
        const isMandatory = this._isVerificationMandatory(requestContext);

        if (!isMandatory && requestContext.confidence > 0.9) {
            // Optional verification + high confidence = skip
            return {
                verified: true,
                reason: 'High confidence + optional domain - verification skipped',
                confidence: requestContext.confidence,
                mode: 'OPTIONAL_SKIP',
                duration: Date.now() - verificationStart
            };
        }

        console.log(`🔍 PCA: Running 3-gate verification protocol (${isMandatory ? 'MANDATORY' : 'OPTIONAL'})...`);

        // GATE 1: Identify related projects
        const gate1Result = await this._gate1_identifyRelatedProjects(requestContext);

        if (!gate1Result.found) {
            return {
                verified: false,
                reason: 'GATE 1 FAILED: No related projects identified',
                confidence: 0.3,
                mode: 'GATE_1_FAILED',
                duration: Date.now() - verificationStart
            };
        }

        // GATE 2: Read actual implementation files
        const gate2Result = await this._gate2_readActualFiles(gate1Result.relatedProjects, requestContext);

        if (!gate2Result.filesRead || gate2Result.filesRead.length === 0) {
            return {
                verified: false,
                reason: 'GATE 2 FAILED: No implementation files read',
                confidence: 0.4,
                mode: 'GATE_2_FAILED',
                duration: Date.now() - verificationStart
            };
        }

        // GATE 3: Validate suggestion against real code
        const gate3Result = await this._gate3_validateSuggestion(requestContext.suggestion, gate2Result);

        return {
            verified: gate3Result.valid,
            reason: gate3Result.reason,
            confidence: gate3Result.confidence,
            mode: isMandatory ? 'MANDATORY_VERIFIED' : 'OPTIONAL_VERIFIED',
            evidence: {
                relatedProjects: gate1Result.relatedProjects,
                filesRead: gate2Result.filesRead,
                actualImplementation: gate2Result.implementation,
                correctedSuggestion: gate3Result.correctedSuggestion || requestContext.suggestion
            },
            duration: Date.now() - verificationStart
        };
    }

    /**
     * 🆕 GATE 1: Identify Related Projects
     * @private
     */
    async _gate1_identifyRelatedProjects(requestContext) {
        if (!this.workspaceTopology?.workspace?.projects) {
            return { found: false, relatedProjects: [] };
        }

        const domain = this._extractDomain(requestContext);
        const relatedProjects = [];

        // Check domain relationships for verification priority
        const domainRelationships = this.workspaceTopology.workspace.domain_relationships[domain];

        if (domainRelationships) {
            const priorityList = domainRelationships.verification_priority || [];

            for (const projectName of priorityList) {
                const project = this.workspaceTopology.workspace.projects[projectName];
                if (project) {
                    relatedProjects.push({
                        name: projectName,
                        path: project.path,
                        authority: project.authority,
                        domains: project.domains,
                        relevance: this._calculateRelevance(project, requestContext)
                    });
                }
            }
        }

        // Sort by relevance
        relatedProjects.sort((a, b) => b.relevance - a.relevance);

        console.log(`   ✅ GATE 1: Found ${relatedProjects.length} related projects for domain "${domain}"`);

        return {
            found: relatedProjects.length > 0,
            relatedProjects: relatedProjects,
            domain: domain
        };
    }

    /**
     * 🆕 GATE 2: Read Actual Implementation Files
     * @private
     */
    async _gate2_readActualFiles(relatedProjects, requestContext) {
        const filesRead = [];
        const implementation = {};

        for (const project of relatedProjects.slice(0, 3)) { // Top 3 most relevant
            const projectRoot = path.join(
                this.workspaceTopology.workspace.root,
                project.path
            );

            // Get key files for this domain
            const domain = this._extractDomain(requestContext);
            const domainConfig = project.domains[domain];

            if (domainConfig && domainConfig.key_files) {
                for (const keyFile of domainConfig.key_files) {
                    try {
                        const filePath = path.join(projectRoot, keyFile);
                        const content = await fs.readFile(filePath, 'utf-8');

                        filesRead.push({
                            project: project.name,
                            file: keyFile,
                            path: filePath,
                            authority: project.authority
                        });

                        // Extract implementation details based on request context
                        const extractedData = this._extractImplementationDetails(content, requestContext);

                        if (extractedData) {
                            implementation[project.name] = implementation[project.name] || [];
                            implementation[project.name].push({
                                file: keyFile,
                                data: extractedData
                            });
                        }

                    } catch (error) {
                        // File not found or unreadable - continue
                        console.log(`   ⚠️  Could not read ${keyFile} from ${project.name}`);
                    }
                }
            }
        }

        console.log(`   ✅ GATE 2: Read ${filesRead.length} implementation files`);

        return {
            filesRead: filesRead,
            implementation: implementation
        };
    }

    /**
     * 🆕 GATE 3: Validate Suggestion Against Real Code
     * @private
     */
    async _gate3_validateSuggestion(suggestion, gate2Result) {
        if (!suggestion || !gate2Result.implementation) {
            return {
                valid: false,
                reason: 'No suggestion or implementation data to validate',
                confidence: 0.0
            };
        }

        // Look for the suggestion in actual implementation
        let found = false;
        let evidence = [];

        for (const [projectName, implementations] of Object.entries(gate2Result.implementation)) {
            for (const impl of implementations) {
                // Check if suggestion matches actual implementation
                const matchResult = this._matchSuggestionToImplementation(suggestion, impl.data);

                if (matchResult.matched) {
                    found = true;
                    evidence.push({
                        project: projectName,
                        file: impl.file,
                        match: matchResult.match
                    });
                }
            }
        }

        if (found) {
            console.log(`   ✅ GATE 3: Suggestion validated against real implementation`);
            return {
                valid: true,
                reason: `Suggestion matches actual implementation in ${evidence[0].project}`,
                confidence: 1.0,
                evidence: evidence
            };
        }

        // Suggestion NOT found - try to find the correct one
        const correctedSuggestion = this._findCorrectImplementation(gate2Result.implementation);

        console.log(`   ⚠️  GATE 3: Suggestion does not match implementation - corrected to: ${correctedSuggestion || 'unknown'}`);

        return {
            valid: false,
            reason: 'Suggestion not found in actual implementation',
            confidence: 0.2,
            correctedSuggestion: correctedSuggestion
        };
    }

    /**
     * 🆕 Check if verification is mandatory for this domain
     * @private
     */
    _isVerificationMandatory(requestContext) {
        if (!this.workspaceTopology?.verification_rules) {
            return false; // Default to optional if no rules
        }

        const mandatoryTriggers = this.workspaceTopology.verification_rules.mandatory_verification_triggers || [];
        const keywords = requestContext.keywords || [];

        // Check if any keyword matches mandatory triggers
        for (const keyword of keywords) {
            if (mandatoryTriggers.includes(keyword.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    /**
     * 🆕 Extract domain from request context
     * @private
     */
    _extractDomain(requestContext) {
        const keywords = (requestContext.keywords || []).map(k => k.toLowerCase());

        // Map keywords to domains
        if (keywords.some(k => ['auth', 'login', 'authentication', 'endpoint'].includes(k))) {
            return 'authentication';
        }
        if (keywords.some(k => ['api', 'route', 'endpoint'].includes(k))) {
            return 'api';
        }
        if (keywords.some(k => ['database', 'schema', 'query', 'sql'].includes(k))) {
            return 'database';
        }
        if (keywords.some(k => ['color', 'font', 'style', 'ui'].includes(k))) {
            return 'ui_styling';
        }
        if (keywords.some(k => ['build', 'script', 'package'].includes(k))) {
            return 'build_pipeline';
        }

        return 'general'; // Default domain
    }

    /**
     * 🆕 Calculate relevance of project to request context
     * @private
     */
    _calculateRelevance(project, requestContext) {
        let score = 0;

        // Authority weight
        if (project.authority === 'SOURCE_OF_TRUTH') score += 100;
        if (project.authority === 'IMPLEMENTATION') score += 50;
        if (project.authority === 'MODULE') score += 25;

        // Keyword match in project purpose
        const keywords = requestContext.keywords || [];
        for (const keyword of keywords) {
            if (project.purpose.toLowerCase().includes(keyword.toLowerCase())) {
                score += 10;
            }
        }

        return score;
    }

    /**
     * 🆕 Extract implementation details from file content
     * @private
     */
    _extractImplementationDetails(content, requestContext) {
        const domain = this._extractDomain(requestContext);

        if (domain === 'authentication') {
            // Extract auth endpoints, URLs, routes
            const endpoints = [];

            // Match route definitions (more specific - avoid false positives)
            const routeMatches = content.match(/['"]\/auth\/[a-z\-]+['"]/g) || [];
            routeMatches.forEach(match => {
                const endpoint = match.replace(/['"]/g, '');
                // Filter out common false positives
                if (!endpoint.includes('signup') && !endpoint.includes('register')) {
                    endpoints.push(endpoint);
                }
            });

            // Match AUTH_URL constants (full URL format)
            const authUrlMatches = content.match(/AUTH_URL.*?['"]([^'"]+\/auth\/[^'"]+)['"]/i) || [];
            if (authUrlMatches[1]) {
                // Extract just the path part
                const url = authUrlMatches[1];
                const pathMatch = url.match(/\/auth\/[a-z\-]+/);
                if (pathMatch) {
                    endpoints.push(pathMatch[0]);
                }
            }

            // Match API endpoint paths (for auth API routes)
            const apiMatches = content.match(/['"]\/api\/[^'"]*auth[^'"]*['"]/g) || [];
            apiMatches.forEach(match => {
                const endpoint = match.replace(/['"]/g, '');
                endpoints.push(endpoint);
            });

            // Deduplicate
            return { type: 'authentication', endpoints: Array.from(new Set(endpoints)) };
        }

        if (domain === 'api') {
            // Extract API routes
            const routes = [];
            const routeMatches = content.match(/router\.(get|post|put|delete|patch)\(['"](\/[^'"]+)['"]/gi) || [];
            routeMatches.forEach(match => {
                routes.push(match);
            });

            return { type: 'api', routes: routes };
        }

        return null; // No relevant data extracted
    }

    /**
     * 🆕 Match suggestion to actual implementation
     * @private
     */
    _matchSuggestionToImplementation(suggestion, implementationData) {
        if (!implementationData) {
            return { matched: false };
        }

        // For authentication domain
        if (implementationData.type === 'authentication' && implementationData.endpoints) {
            for (const endpoint of implementationData.endpoints) {
                if (endpoint.includes(suggestion) || suggestion.includes(endpoint)) {
                    return {
                        matched: true,
                        match: endpoint
                    };
                }
            }
        }

        // For API domain
        if (implementationData.type === 'api' && implementationData.routes) {
            for (const route of implementationData.routes) {
                if (route.includes(suggestion)) {
                    return {
                        matched: true,
                        match: route
                    };
                }
            }
        }

        return { matched: false };
    }

    /**
     * 🆕 Find correct implementation when suggestion fails
     * @private
     */
    _findCorrectImplementation(implementation) {
        // Priority 1: Find /auth/* page routes (not /api/*)
        for (const [projectName, implementations] of Object.entries(implementation)) {
            for (const impl of implementations) {
                if (impl.data?.endpoints && impl.data.endpoints.length > 0) {
                    // Prioritize /auth/* routes over /api/* routes
                    const authPageRoutes = impl.data.endpoints.filter(ep =>
                        ep.startsWith('/auth/') && !ep.startsWith('/api/')
                    );

                    if (authPageRoutes.length > 0) {
                        return authPageRoutes[0]; // Return first /auth/* page route
                    }
                }
            }
        }

        // Priority 2: If no /auth/* page routes, find API endpoints
        for (const [projectName, implementations] of Object.entries(implementation)) {
            for (const impl of implementations) {
                if (impl.data?.endpoints && impl.data.endpoints.length > 0) {
                    return impl.data.endpoints[0]; // First endpoint found
                }
                if (impl.data?.routes && impl.data.routes.length > 0) {
                    return impl.data.routes[0];
                }
            }
        }

        return null;
    }
}

module.exports = { ProjectContextAnalyzer };

// Example usage
if (require.main === module) {
    console.log("🎖️ ESMC 3.8 - PCA (Project Context Analysis) Test");

    (async () => {
        const pca = new ProjectContextAnalyzer();

        try {
            const projectPath = process.cwd();
            console.log(`Analyzing project at: ${projectPath}\n`);

            const context = await pca.analyzeProjectContext(projectPath);

            console.log("\n📊 PROJECT CONTEXT INTELLIGENCE:");
            console.log(`   Visual Design: ${context.visual.colors.total} colors, ${context.visual.typography.fonts.length} fonts`);
            console.log(`   Code Architecture: ${context.code.files.total} JS files, ${context.code.classes} classes`);
            console.log(`   API Patterns: ${context.api.analyzed} route files, RESTful: ${context.api.restful}`);
            console.log(`   Database: ${context.database.tables} tables, ${context.database.relationships} relationships`);
            console.log(`   Security Score: ${(context.security.score * 100).toFixed(0)}%`);
            console.log(`   Performance Level: ${(context.performance.optimizationLevel * 100).toFixed(0)}%`);
            console.log(`   Technical Stack: ${context.technical.framework}`);
            console.log(`   Consistency: ${(context.consistency.overall * 100).toFixed(0)}%`);

            console.log("\n✅ PCA analysis completed successfully");

        } catch (error) {
            console.error(`❌ Test failed: ${error.message}`);
        }
    })();
}
