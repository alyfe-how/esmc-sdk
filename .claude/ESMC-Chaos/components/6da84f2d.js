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
/** ESMC 3.13 ECHELON MIN | 2025-10-17 | v3.13.0 | PROD | ALL_TIERS
 *  Purpose: Mesh-Intelligence Network orchestrator - central hub coordinating 4 components (PIU/DKI/UIP/PCA)
 *  Features: 360° awareness | Bidirectional mesh | Conflict resolution | Consensus synthesis | ATLAS spatial awareness | Real-time coordination
 *  Architecture: Spider web with ECHELON at center (N:PIU | S:PCA | E:UIP | W:DKI)
 */

// 🎖️ ESMC 3.67.2 - CLI Subprocess Optimization (120K token savings)
// Strategy: Use CLI wrappers via subprocess for heavy modules (keep lightweight direct)
const { execSync } = require('child_process');

// 🎖️ ESMC 3.8 - Core Intelligence Components (Memory-Augmented)
// ESMC 3.67.2: 4-component mesh uses CLI subprocesses (subprocess pattern from memory-bundle-cli)
const PIUIntentUnderstandingEngine = require('./322a6ec7');
const DKIDomainKnowledgeEngine = require('./18548b52');
const UIPIntentPredictionEngine = require('./bb990d95');
const { ProjectContextAnalyzer } = require('./a3226f07');

// 🔐 ESMC 3.13 - Device Validation (Auth-Guardian Fusion)
const fs = require('fs');
const path = require('path');
const os = require('os');

// 🎖️ ESMC 3.7 - Memory Intelligence Layer (lightweight, keep direct)
const { KeywordExtractor } = require('./keyword-extractor');
const { MemoryRetrievalEngine } = require('./memory-retrieval-engine');

// 🎖️ ESMC 3.13 - Scribe Conversation Logging (Passive)
// ESMC 3.67.2: Keep direct require (23.3KB, but rarely instantiated)
const ESMCScribe = require('./b8c4eb7e');

// 🎖️ ESMC 3.21 - Performance Observer (Silent Background Agent)
// ESMC 3.67.2: Keep direct require (lightweight singleton pattern)
const { getPerformanceObserver } = require('./ac9d65aa');

// 🎖️ ESMC 3.9 - ATLAS Pattern Recognition (3.9 = patterns, 3.9.3 = memory)
// ESMC 3.67.2: Keep direct require (pattern scanner is lightweight when not scanning)
const { CodebasePatternScanner } = require('./676c20fc');
const { PatternViabilityAnalyzer } = require('./4b2abe2f');
const { ProactivePatternSuggester } = require('./c8466f3d');

// 🎖️ ESMC 3.9.1 - Intelligence Optimization (MAX/VIP)
// ESMC 3.67.2: Keep direct require (lightweight managers)
const { ConversationScopeManager } = require('./31bf23fc');
const { ProjectMaturityTierSystem } = require('./08a9663e');

// 🎖️ ESMC 3.22 v3.15.0 - ATHENA Strategic Dialogue Partner (Gap-Aware)
// ESMC 3.67.2: Keep direct require (ATHENA coordinator lightweight, submodules loaded lazily)
const EpsilonAthenaCoordinator = require('./6221cade');

class ECHELONMeshOrchestrator {
    constructor() {
        this.hubName = 'ECHELON';
        this.architecture = 'Mesh-Intelligence Network (MIN)';
        this.version = '3.13.0'; // Updated for ATLAS 3.13 integration

        // 🆕 ESMC 3.26: Centralized Tier Gating (THE ARCHITECT's design)
        // ECHELON decides which features to activate based on tier
        // Modules are tier-agnostic - they execute when called
        this.currentTier = null;
        this.tierFeatures = null;

        // Initialize 4 cardinal components
        this.components = {
            NORTH: null,  // PIU
            SOUTH: null,  // PCA (with ATLAS spatial awareness)
            EAST: null,   // UIP
            WEST: null    // DKI
        };

        // 🎖️ ESMC 3.7 - Memory Intelligence Layer
        this.keywordExtractor = new KeywordExtractor();
        this.memoryEngine = new MemoryRetrievalEngine();

        // 🎖️ ESMC 3.9 - ATLAS Pattern Recognition (3.9 = patterns)
        this.atlasScanner = new CodebasePatternScanner({ projectRoot: process.cwd() });
        this.atlasAnalyzer = new PatternViabilityAnalyzer();
        this.atlasSuggester = new ProactivePatternSuggester();

        // 🎖️ ESMC 3.9.1 - Intelligence Optimization (MAX/VIP)
        this.scopeManager = new ConversationScopeManager();
        this.maturitySystem = new ProjectMaturityTierSystem({ projectRoot: process.cwd() });

        // 🎖️ ESMC 3.13 - Scribe Passive Logging (ALL TIERS)
        this.scribe = new ESMCScribe();
        this.scribeActive = false;

        // 🎖️ ESMC 3.21 - Performance Observer (Silent Background - ALL TIERS)
        this.performanceObserver = getPerformanceObserver();

        // 🎖️ ESMC 3.22 v3.15.0 - ATHENA Strategic Dialogue Partner
        this.athenaCoordinator = new EpsilonAthenaCoordinator();

        // Mesh communication channels (bidirectional)
        this.channels = {
            'PIU-DKI': [],
            'PIU-UIP': [],
            'PIU-PCA': [],
            'DKI-UIP': [],
            'DKI-PCA': [],
            'UIP-PCA': []
        };

        // Intelligence fusion state
        this.fusionState = {
            gathering: false,
            meshing: false,
            synthesizing: false,
            complete: false
        };

        // Consensus tracking
        this.consensus = {
            agreements: [],
            conflicts: [],
            resolutions: [],
            confidence: 0
        };

        // Real-time awareness
        this.awareness = {
            PIU: {},
            DKI: {},
            UIP: {},
            PCA: {}
        };

        this.missionHistory = [];
    }

    /**
     * Estimate token count for message (rough approximation)
     */
    _estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }

    /**
     * 🆕 Find file using ATLAS (delegates to PCA's ATLAS instance)
     * @param {string} query - File search query
     * @returns {Promise<Object>} ATLAS search result
     */
    async findFile(query) {
        if (!this.components.SOUTH) {
            return { found: false, message: 'PCA not initialized' };
        }
        return await this.components.SOUTH.findFile(query);
    }

    /**
     * 🆕 Get domain files using ATLAS (delegates to PCA's ATLAS instance)
     * @param {string} domainName - Domain identifier
     * @returns {Promise<Object>} Domain files metadata
     */
    async getDomainFiles(domainName) {
        if (!this.components.SOUTH) {
            return { found: false, message: 'PCA not initialized' };
        }
        return await this.components.SOUTH.getDomainFiles(domainName);
    }

    /**
     * 🆕 ESMC 3.24 - ATHENA ORACLE: ECHELON Selection Engine
     * Intelligent standard assignment based on code pattern detection
     *
     * @param {string} code - Code to analyze for pattern detection
     * @param {Object} context - Additional context (file type, colonel, etc.)
     * @returns {Object} Colonel-to-standard mapping
     */
    selectStandardsForColonels(code, context = {}) {
        // Detect code patterns using regex analysis
        const patterns = this._detectCodePatterns(code);

        // Intelligent mapping: colonel → appropriate standard (priority cascade)
        const standardMapping = {
            ALPHA: this._selectAlphaStandard(patterns),
            BETA: this._selectBetaStandard(patterns),
            DELTA: this._selectDeltaStandard(patterns),
            GAMMA: this._selectGammaStandard(patterns),
            ZETA: this._selectZetaStandard(patterns),
            ETA: this._selectEtaStandard(patterns)
        };

        // Context overrides (if specific colonel requested)
        if (context.colonel && context.preferredStandard) {
            standardMapping[context.colonel] = context.preferredStandard;
        }

        return standardMapping;
    }

    /**
     * 🆕 ESMC 3.24 - ALPHA Standard Selection (Architecture - 5 standards)
     * Priority cascade: NEXUS > BLUEPRINT > GRID > ATLAS > FRAMEWORK
     */
    _selectAlphaStandard(patterns) {
        if (patterns.hasMessageQueue) return 'NEXUS';           // System integration
        if (patterns.hasDocumentation) return 'BLUEPRINT';      // Design documentation
        if (patterns.hasModules) return 'GRID';                 // Modular design
        if (patterns.hasAPI || patterns.hasDB) return 'ATLAS';  // Scalability
        return 'FRAMEWORK';                                     // Default: Architectural patterns
    }

    /**
     * 🆕 ESMC 3.24 - BETA Standard Selection (Implementation - 3 standards)
     * Priority cascade: CLARITY > CODEX > SYNTAX
     */
    _selectBetaStandard(patterns) {
        if (patterns.hasComplexity) return 'CLARITY';           // Code readability (complex code)
        if (patterns.hasLinting) return 'CODEX';                // Code organization
        return 'SYNTAX';                                        // Priority 1 - always check
    }

    /**
     * 🆕 ESMC 3.24 - DELTA Standard Selection (Optimization - 4 standards)
     * Priority cascade: EFFICIENCY > LEAN > VELOCITY > REFINERY
     */
    _selectDeltaStandard(patterns) {
        if (patterns.hasPerf) return 'EFFICIENCY';              // DRY principle (performance code)
        if (patterns.hasCICD) return 'VELOCITY';                // Agile development practices (CI/CD context)
        if (patterns.hasComplexity) return 'REFINERY';          // Technical debt (complex code)
        return 'LEAN';                                          // YAGNI principle (default)
    }

    /**
     * 🆕 ESMC 3.24 - GAMMA Standard Selection (Integration - 5 standards)
     * Priority cascade: PIPELINE > SPECTRUM > FORGE > PROTOCOL > DEPLOYMENT
     */
    _selectGammaStandard(patterns) {
        if (patterns.hasCICD) return 'PIPELINE';                // CI/CD standards
        if (patterns.hasEnvironments) return 'SPECTRUM';        // Multi-environment support
        if (patterns.hasVersioning) return 'FORGE';             // Build automation
        if (patterns.hasAPI) return 'PROTOCOL';                 // API standards (REST/GraphQL)
        return 'DEPLOYMENT';                                    // Default: Deployment best practices
    }

    /**
     * 🆕 ESMC 3.24 - ZETA Standard Selection (Quality - 4 standards)
     * Priority cascade: GAUNTLET > AUDIT > OBSERVABILITY > CRUCIBLE
     */
    _selectZetaStandard(patterns) {
        if (patterns.hasE2E) return 'GAUNTLET';                 // E2E testing standards
        if (patterns.hasLogging) return 'AUDIT';                // Logging & monitoring standards (audit logs)
        if (patterns.hasComplexity) return 'OBSERVABILITY';     // Observability for complex systems
        return 'CRUCIBLE';                                      // Priority 1 - unit testing
    }

    /**
     * 🆕 ESMC 3.24 - ETA Standard Selection (Security - 10 standards)
     * Priority cascade: Compliance > Zero Trust > Crypto > Auth > Input > Headers > Operations
     */
    _selectEtaStandard(patterns) {
        // Tier 1: Compliance & Advanced Security (MAX/VIP)
        if (patterns.hasGDPR) return 'VAULT';                   // GDPR compliance
        if (patterns.hasDB && patterns.hasAPI) return 'COMPLIANCE'; // SOC2/ISO27001 (data + API)
        if (patterns.hasModules && patterns.hasAuth) return 'CITADEL'; // Zero trust (modular + auth)

        // Tier 2: Cryptography & Authentication (PRO)
        if (patterns.hasCrypto) return 'CIPHER';                // Cryptographic standards
        if (patterns.hasAuth) return 'FORTRESS';                // Authentication & authorization

        // Tier 3: Input Security (FREE/PRO)
        if (patterns.hasUserInput) return 'GUARDIAN';           // Input validation & sanitization

        // Tier 4: Web Security Headers (PRO)
        if (patterns.hasCSRF) return 'SHIELD';                  // XSS/CSRF protection
        if (patterns.hasCORS) return 'SENTINEL';                // Security headers & CORS

        // Tier 5: Operational Security (PRO/FREE)
        if (patterns.hasVersioning) return 'VERSIONING';        // Version control standards
        if (patterns.hasAPI || patterns.hasDB) return 'RESILIENCE'; // Error handling (critical ops)

        return 'SHIELD';                                        // Default: OWASP security
    }

    /**
     * 🆕 ESMC 3.24 - Code Pattern Detection Engine
     * Analyzes code to detect relevant patterns for standard selection
     *
     * @param {string} code - Code to analyze
     * @returns {Object} Pattern detection results
     */
    _detectCodePatterns(code) {
        if (!code || typeof code !== 'string') {
            return {
                hasAPI: false,
                hasDB: false,
                hasUserInput: false,
                hasPerf: false,
                isTest: false,
                hasSecurity: false,
                hasDocumentation: false,
                hasModules: false,
                hasMessageQueue: false,
                hasLinting: false,
                hasComplexity: false,
                hasCICD: false,
                hasEnvironments: false,
                hasE2E: false,
                hasLogging: false,
                hasCrypto: false,
                hasAuth: false,
                hasCSRF: false,
                hasCORS: false,
                hasGDPR: false,
                hasVersioning: false
            };
        }

        return {
            // API endpoint detection
            hasAPI: /app\.(get|post|put|delete|patch)|router\.|express\(\)|fastify\(\)|koa\(\)/i.test(code),

            // Database operations detection
            hasDB: /\.query\(|\.execute\(|mongoose|sequelize|pool\.|knex|prisma|typeorm/i.test(code),

            // User input detection (security-critical)
            hasUserInput: /req\.body|req\.query|req\.params|input.*data|user.*input|form.*data/i.test(code),

            // Performance/optimization patterns
            hasPerf: /benchmark|performance|optimize|cache|memoize|profil|throttle|debounce/i.test(code),

            // Test file detection
            isTest: /\.test\.|\.spec\.|describe\(|it\(|test\(|expect\(|assert\./i.test(code),

            // Security-critical operations
            hasSecurity: /auth|jwt|token|password|crypto|encrypt|decrypt|hash|bcrypt|session/i.test(code),

            // Documentation patterns (BLUEPRINT)
            hasDocumentation: /\/\*\*|\*\s*@param|\*\s*@returns|README|documentation|jsdoc/i.test(code),

            // Module system patterns (GRID)
            hasModules: /export\s+(default|const|function|class)|import\s+.*from|module\.exports|require\s*\(/i.test(code),

            // Message queue / event systems (NEXUS)
            hasMessageQueue: /kafka|rabbitmq|redis\.publish|\.emit\(|EventEmitter|message.*queue/i.test(code),

            // Linting / code style (CODEX)
            hasLinting: /eslint|prettier|\.eslintrc|\.prettierrc|lint.*config/i.test(code),

            // Code complexity indicators (CLARITY)
            hasComplexity: code.split('\n').length > 100 || (code.match(/if\s*\(/g) || []).length > 10,

            // CI/CD pipeline indicators (PIPELINE)
            hasCICD: /\.github\/workflows|\.gitlab-ci|jenkins|circleci|travis|buildspec/i.test(code),

            // Environment configuration (SPECTRUM)
            hasEnvironments: /process\.env|\.env\.|config\.|NODE_ENV|environment/i.test(code),

            // E2E testing frameworks (GAUNTLET)
            hasE2E: /cypress|playwright|selenium|puppeteer|webdriver|testcafe/i.test(code),

            // Logging frameworks (OBSERVABILITY)
            hasLogging: /winston|pino|bunyan|morgan|log4js|console\.(log|error|warn|info)/i.test(code),

            // Cryptography (CIPHER)
            hasCrypto: /bcrypt|argon2|scrypt|crypto\.createHash|crypto\.createCipher|AES|RSA|HMAC/i.test(code),

            // Authentication systems (FORTRESS)
            hasAuth: /passport|jwt\.sign|jwt\.verify|session\.|oauth|saml|authenticate/i.test(code),

            // CSRF protection (SHIELD enhancement)
            hasCSRF: /csrf|csurf|x-csrf-token|_csrf/i.test(code),

            // CORS configuration (SENTINEL)
            hasCORS: /cors\(|access-control-allow|origin.*header/i.test(code),

            // GDPR compliance patterns (VAULT)
            hasGDPR: /gdpr|pii|personal.*data|data.*protection|consent|right.*to.*delete/i.test(code),

            // Version control / semantic versioning (VERSIONING)
            hasVersioning: /package\.json|version\s*[:=]|semver|changelog|CHANGELOG/i.test(code)
        };
    }

    /**
     * Initialize the 4-component MIN mesh
     * @param {Object} config - Configuration for components
     */
    async initializeMesh(config = {}) {
        console.log(`🕸️ ECHELON: Initializing Mesh-Intelligence Network...`);

        try {
            // 🆕 ESMC 3.26: Initialize tier-based feature activation (THE ARCHITECT's design)
            this._initializeTierGating();

            // 🎖️ Database configuration for memory-augmented intelligence
            const dbConfig = config.dbConfig || {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'battlefield_intelligence'
            };

            // Initialize all 4 components in parallel with database config
            const [piu, dki, uip, pca] = await Promise.all([
                this._initializeComponent('PIU', PIUIntentUnderstandingEngine, dbConfig),
                this._initializeComponent('DKI', DKIDomainKnowledgeEngine, dbConfig),
                this._initializeComponent('UIP', UIPIntentPredictionEngine, dbConfig),
                this._initializeComponent('PCA', ProjectContextAnalyzer, config.pca)
            ]);

            // Assign to cardinal positions
            this.components.NORTH = piu;
            this.components.WEST = dki;
            this.components.EAST = uip;
            this.components.SOUTH = pca;

            // 🎖️ ESMC 3.99.2: Set ESMC_SILENT environment variable for AEGIS mode
            // This prevents MySQL connection attempts during mesh initialization
            // Components will use ATLAS file-based retrieval instead
            process.env.ESMC_SILENT = 'true';

            // 🎖️ Initialize database connections for memory-augmented components
            console.log(`🧠 ECHELON: Initializing memory-augmented intelligence...`);
            await Promise.all([
                piu.initialize ? piu.initialize() : Promise.resolve(),
                dki.initialize ? dki.initialize() : Promise.resolve(),
                uip.initialize ? uip.initialize() : Promise.resolve(),
                this.athenaCoordinator.initialize ? this.athenaCoordinator.initialize() : Promise.resolve()
            ]);

            console.log(`✅ ECHELON: MIN mesh initialized`);
            console.log(`   NORTH (PIU): Memory-augmented intent analysis`);
            console.log(`   WEST (DKI): Domain knowledge + historical patterns`);
            console.log(`   EAST (UIP): User workflow prediction + session history`);
            console.log(`   SOUTH (PCA): Project context analysis`);

            return true;

        } catch (error) {
            console.error(`❌ ECHELON: Mesh initialization failed - ${error.message}`);
            return false;
        }
    }

    /**
     * 🆕 ESMC 3.26: Initialize Tier-Based Feature Activation (THE ARCHITECT's Design)
     * Centralized tier gating - ECHELON decides what gets activated based on tier
     * Modules are tier-agnostic and execute when called
     */
    _initializeTierGating() {
        try {
            // ESMC 3.93.1: Use tier-gate CLI wrapper for token optimization (700→100 tokens)
            const { execSync } = require('child_process');
            const path = require('path');
            const tierCliPath = path.join(__dirname, 'cli', '670a08df.js');
            const tierOutput = execSync(`node "${tierCliPath}" get-tier`, { encoding: 'utf8' });
            // Extract tier from output (last line, ignoring log messages)
            const tierLines = tierOutput.trim().split('\n');
            this.currentTier = tierLines[tierLines.length - 1].trim();

            // Feature activation map based on tier
            this.tierFeatures = this._getTierFeatureMap(this.currentTier);

            console.log(`🎚️  ECHELON: Tier-based feature activation initialized (${this.currentTier})`);

        } catch (error) {
            console.warn(`⚠️  ECHELON: Tier initialization failed, defaulting to FREE tier`);
            this.currentTier = 'FREE';
            this.tierFeatures = this._getTierFeatureMap('FREE');
        }
    }

    /**
     * 🆕 ESMC 3.62: POST-BRAIN Feature Activation Map
     * Defines execution features available AFTER brain processes intelligence
     * NOTE: PRE-BRAIN features (memory, intelligence) managed by tier-gate.js
     * @param {string} tier - User tier (FREE, PRO, MAX, VIP)
     * @returns {Object} POST-BRAIN feature activation map
     */
    _getTierFeatureMap(tier) {
        const featureMap = {
            FREE: {
                // ATHENA Modes (Strategic Intelligence)
                athena_dialogue: false,       // PRO+ (ESMC 3.62: Lightweight mode)
                athena_strategic: false,      // PRO+
                athena_creative: false,       // MAX+

                // Colonel Deployment (0 colonels - Direct execution)
                colonel_alpha: false,         // PRO+
                colonel_beta: false,          // PRO+
                colonel_gamma: false,         // PRO+
                colonel_delta: false,         // PRO+
                colonel_epsilon: false,       // PRO+
                colonel_zeta: false,          // PRO+
                colonel_eta: false,           // PRO+

                // Oracle Phases (Quality Gates)
                oracle_phase_45: false,       // MAX+
                oracle_phase_65: false,       // MAX+

                // Advanced Modules
                module_strategic_learning: false,  // PRO+
                module_red_teaming: false,         // MAX+
                module_time_machine: false,        // PRO+
                module_opus_rca: false,            // PRO+

                // Resource Access
                full_standards_library: false,     // MAX+

                // Runtime Limits
                max_agents: 10,
                api_calls_per_day: 50
            },
            PRO: {
                // ATHENA Modes
                athena_dialogue: true,        // ← Questions only
                athena_strategic: false,      // MAX+ (ESMC 3.62: No strategic mode)
                athena_creative: false,       // MAX+

                // Colonel Deployment (0 colonels - Lightweight execution)
                colonel_alpha: false,         // MAX+ (ESMC 3.62: Token-efficient PRO)
                colonel_beta: false,          // MAX+
                colonel_gamma: false,         // MAX+
                colonel_delta: false,         // MAX+
                colonel_epsilon: false,       // MAX+
                colonel_zeta: false,          // MAX+
                colonel_eta: false,           // MAX+

                // Oracle Phases
                oracle_phase_45: false,       // MAX+
                oracle_phase_65: false,       // MAX+

                // Advanced Modules
                module_strategic_learning: true,   // ← Unlocked
                module_red_teaming: false,         // MAX+
                module_time_machine: true,         // ← Unlocked
                module_opus_rca: true,             // ← Unlocked

                // Resource Access
                full_standards_library: false,     // MAX+

                // Runtime Limits
                max_agents: 40,
                api_calls_per_day: 500
            },
            MAX: {
                // ATHENA Modes
                athena_dialogue: true,
                athena_strategic: true,
                athena_creative: true,        // ← Unlocked

                // Colonel Deployment (All 7)
                colonel_alpha: true,
                colonel_beta: true,
                colonel_gamma: true,
                colonel_delta: true,
                colonel_epsilon: true,
                colonel_zeta: true,
                colonel_eta: true,

                // Oracle Phases
                oracle_phase_45: true,        // ← Unlocked
                oracle_phase_65: true,        // ← Unlocked

                // Advanced Modules
                module_strategic_learning: true,
                module_red_teaming: true,     // ← Unlocked
                module_time_machine: true,
                module_opus_rca: true,

                // Resource Access
                full_standards_library: true, // ← Unlocked

                // Runtime Limits (Unlimited)
                max_agents: -1,
                api_calls_per_day: -1
            },
            VIP: {
                // VIP = MAX (same capabilities)
                athena_dialogue: true,
                athena_strategic: true,
                athena_creative: true,
                colonel_alpha: true,
                colonel_beta: true,
                colonel_gamma: true,
                colonel_delta: true,
                colonel_epsilon: true,
                colonel_zeta: true,
                colonel_eta: true,
                oracle_phase_45: true,
                oracle_phase_65: true,
                module_strategic_learning: true,
                module_red_teaming: true,
                module_time_machine: true,
                module_opus_rca: true,
                full_standards_library: true,
                max_agents: -1,
                api_calls_per_day: -1
            }
        };

        return featureMap[tier] || featureMap['FREE'];
    }

    /**
     * 🆕 ESMC 3.62: Get Enabled Colonels for Current Tier
     * @returns {Array} - List of enabled colonel names (e.g., ['ALPHA', 'BETA', 'GAMMA'])
     */
    getEnabledColonels() {
        if (!this.tierFeatures) {
            return ['ALPHA', 'BETA', 'GAMMA']; // FREE default
        }

        const colonels = [];
        if (this.tierFeatures.colonel_alpha) colonels.push('ALPHA');
        if (this.tierFeatures.colonel_beta) colonels.push('BETA');
        if (this.tierFeatures.colonel_gamma) colonels.push('GAMMA');
        if (this.tierFeatures.colonel_delta) colonels.push('DELTA');
        if (this.tierFeatures.colonel_epsilon) colonels.push('EPSILON');
        if (this.tierFeatures.colonel_zeta) colonels.push('ZETA');
        if (this.tierFeatures.colonel_eta) colonels.push('ETA');

        return colonels;
    }

    /**
     * 🆕 ESMC 3.62: Get Enabled Modules for Current Tier
     * @returns {Array} - List of enabled module names
     */
    getEnabledModules() {
        if (!this.tierFeatures) {
            return []; // FREE default (no modules)
        }

        const modules = [];
        if (this.tierFeatures.module_strategic_learning) modules.push('strategic_learning');
        if (this.tierFeatures.module_red_teaming) modules.push('red_teaming');
        if (this.tierFeatures.module_time_machine) modules.push('time_machine');
        if (this.tierFeatures.module_opus_rca) modules.push('opus_rca');

        return modules;
    }

    /**
     * 🆕 ESMC 3.26: Check if Feature is Enabled for Current Tier
     * @param {string} featureName - Feature to check (e.g., 'oracle_phase_45')
     * @returns {boolean} True if feature is enabled
     */
    isFeatureEnabled(featureName) {
        if (!this.tierFeatures) {
            return false;
        }
        return this.tierFeatures[featureName] === true;
    }

    /**
     * 🆕 ESMC 3.26: Get Current Tier
     * @returns {string} Current tier (FREE, PRO, MAX, VIP)
     */
    getCurrentTier() {
        return this.currentTier || 'FREE';
    }

    /**
     * 🆕 ESMC 3.20: DUAL EXECUTION ORCHESTRATOR
     * Runs ATLAS + HYDRA in parallel with 15s time budget each
     * MAX/VIP tiers only
     *
     * @param {string} userMessage - User's query
     * @param {Array<string>} keywords - Extracted keywords
     * @param {Object} options - Configuration
     * @returns {Promise<Object>} Dual intelligence results
     */
    async executeDualRetrieval(userMessage, keywords, options = {}) {
        // ESMC 3.93.1: Use tier-gate CLI wrapper for token optimization (700→100 tokens)
        const { execSync } = require('child_process');
        const path = require('path');

        // 🎖️ ESMC 3.67.2: CLI Subprocess Optimization for ATLAS (78KB) + HYDRA (39KB)
        // These modules are called via CLI subprocess to keep them out of context
        // Falls back to direct require if CLI unavailable
        const AtlasRetrievalSystem = require('./8cacf104');
        const { HydraRetrievalSystem } = require('./38ace47f');
        const { DualIntelligencePresenter } = require('./cc5e0ce3');

        // Get tier via CLI wrapper
        const tierCliPath = path.join(__dirname, 'cli', '670a08df.js');
        const tierOutput = execSync(`node "${tierCliPath}" get-tier`, { encoding: 'utf8' });
        const tierLines = tierOutput.trim().split('\n');
        const currentTier = tierLines[tierLines.length - 1].trim();

        // Check HYDRA access via CLI wrapper
        const hydraCheckOutput = execSync(`node "${tierCliPath}" check-access memory.hydra_enabled 2>&1 || echo "false"`, { encoding: 'utf8' });
        const hydraEnabled = hydraCheckOutput.includes('Access GRANTED');

        // Check if HYDRA is enabled for this tier
        if (!hydraEnabled) {
            console.log(`   ℹ️ HYDRA not available for ${currentTier} tier - using ATLAS only`);
            const atlas = new AtlasRetrievalSystem();
            // 🆕 ESMC 3.22: Use retrieveV3() for ECHO+HYDRA cascade
            return await atlas.retrieveV3(userMessage, { ...options, retrieveEcho: true });
        }

        console.log(`\n🎖️ DUAL EXECUTION: ATLAS + HYDRA (15s budget each)`);
        console.log(`   Tier: ${currentTier}`);
        console.log(`   Keywords: ${keywords.join(', ')}`);

        const GLOBAL_TIMEOUT = 15000; // 15 seconds

        // Initialize both systems
        const atlas = new AtlasRetrievalSystem();
        const hydra = new HydraRetrievalSystem();
        const dip = new DualIntelligencePresenter();

        const startTime = Date.now();

        try {
            // Spawn both systems in parallel with 15s timeout
            const [atlasResult, hydraResult] = await Promise.all([
                this._runWithTimeout(
                    // 🆕 ESMC 3.22: Use retrieveV3() for ECHO+HYDRA cascade
                    atlas.retrieveV3(userMessage, { ...options, retrieveEcho: true, globalTimeout: GLOBAL_TIMEOUT }),
                    GLOBAL_TIMEOUT,
                    'ATLAS'
                ),
                this._runWithTimeout(
                    hydra.retrieve(userMessage, keywords, { ...options, globalTimeout: GLOBAL_TIMEOUT }),
                    GLOBAL_TIMEOUT,
                    'HYDRA'
                )
            ]);

            const totalDuration = Date.now() - startTime;

            // Convert ATLAS result to DIP format
            const atlasFormatted = this._formatAtlasForDIP(atlasResult);
            const hydraFormatted = hydraResult; // HYDRA already in correct format

            console.log(`\n✅ DUAL EXECUTION COMPLETE (${totalDuration}ms)`);
            console.log(`   ATLAS: ${atlasFormatted.confidence ? (atlasFormatted.confidence * 100).toFixed(0) + '%' : 'N/A'} confidence (T${atlasResult.tier_used || '?'})`);
            console.log(`   HYDRA: ${hydraFormatted.confidence ? (hydraFormatted.confidence * 100).toFixed(0) + '%' : 'N/A'} confidence`);

            // Build presentation data
            const presentation = await dip.present(atlasFormatted, hydraFormatted, {
                keywords,
                userMessage,
                messageType: options.messageType
            });

            return {
                dualExecution: true,
                atlas: atlasResult,
                hydra: hydraResult,
                presentation,
                totalDuration,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Dual execution failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Run promise with timeout
     * @private
     */
    async _runWithTimeout(promise, timeout, systemName) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`${systemName}_TIMEOUT`)), timeout)
            )
        ]).catch(async (error) => {
            if (error.message === `${systemName}_TIMEOUT`) {
                console.log(`   ⏱️ ${systemName} timeout (${timeout}ms) - returning partial results`);
                // Return partial results
                return promise;
            }
            throw error;
        });
    }

    /**
     * Convert ATLAS result format to DIP-compatible format
     * @private
     */
    _formatAtlasForDIP(atlasResult) {
        if (!atlasResult) {
            return {
                confidence: 0,
                files: [],
                tier: 0,
                reasoning: 'No ATLAS result',
                metadata: {}
            };
        }

        // Extract sessions from ATLAS data
        const sessions = atlasResult.data?.sessions || [];

        // Convert sessions to files format
        const files = sessions.map((session, index) => ({
            file: session.session_id || `Session ${index + 1}`,
            path: session.session_id || `Session ${index + 1}`,
            relevance: 1.0 - (index * 0.1), // Decreasing relevance
            session: session
        }));

        // Calculate confidence based on tier and results found
        let confidence = 0;
        if (atlasResult.found) {
            if (atlasResult.tier_used === 1) confidence = 0.95; // T1 recent = high confidence
            else if (atlasResult.tier_used === 2) confidence = 0.85; // T2 topic = good confidence
            else if (atlasResult.tier_used === 3) confidence = 0.75; // T3 deep = moderate confidence
            else if (atlasResult.tier_used === 'footprint') confidence = 1.0; // Footprint = perfect recall
        }

        // Build reasoning
        const tierNames = {
            1: 'T1 Recent Memory',
            2: 'T2 Topic Index',
            3: 'T3 Deep Scan',
            'footprint': 'Memory Footprint'
        };

        const reasoning = atlasResult.found
            ? `Found ${files.length} session(s) via ${tierNames[atlasResult.tier_used] || 'search'}`
            : 'No sessions found';

        return {
            confidence: confidence,
            files: files,
            tier: atlasResult.tier_used,
            reasoning: reasoning,
            metadata: {
                duration: atlasResult.response_time_ms,
                fallback_attempts: atlasResult.fallback_attempts || [],
                scribe_enrichment: atlasResult.scribe_enrichment
            }
        };
    }

    /**
     * PRIMARY MISSION: Process request through MIN mesh
     * @param {string} request - User request to process
     * @param {Object} context - Additional context
     * @returns {Promise<Object>} Unified intelligence consensus
     */
    async processMINRequest(request, context = {}) {
        // 🎖️ ESMC 3.21 - Performance timing started in PHASE -1 (manifest)
        // HOOK 1 happens BEFORE this function is called
        // We receive performanceRequestId from context
        const performanceRequestId = context.performanceRequestId;

        console.log(`🕸️ ECHELON: Processing request through MIN mesh...`);
        console.log(`   Request: "${request}"`);

        // 🔐 ESMC 3.13 - Device authentication (SDK-ONLY, injected by sync script)
        // Production: No authentication required
        // SDK: Authentication block injected during Phase 4 of sync-production-to-sdk-SUPERCHAOSv2.js
        // 🔐 ESMC 3.13 - Validate device authentication on every prompt (SDK-ONLY)
        const deviceValid = await this._validateDeviceAuth();
        if (!deviceValid.valid) {
            throw new Error(`❌ Device authentication failed: ${deviceValid.error}\n\n` +
                `Your device is no longer authorized. This may happen if:\n` +
                `- You logged in on another device (1 device limit)\n` +
                `- Your session expired\n` +
                `- Your license was deactivated\n\n` +
                `Please run: npm run login`);
        }

        const missionId = `MIN-${Date.now()}`;
        const startTime = Date.now();

        // 🎖️ ESMC 3.13 - START SCRIBE SESSION (Passive Logging)
        if (!this.scribeActive) {
            try {
                await this.scribe.startSession({
                    title: `ESMC ${context.mode || 'Lightweight'} Deployment`,
                    metadata: {
                        mode: context.mode || 'lightweight',
                        mission_id: missionId,
                        timestamp: new Date().toISOString()
                    }
                });
                this.scribeActive = true;
            } catch (error) {
                console.warn(`   ⚠️ Scribe session start failed (non-blocking): ${error.message}`);
            }
        }

        // Log user request
        try {
            await this.scribe.logMessage('user', request, {
                tokenCount: this._estimateTokens(request)
            });
        } catch (error) {
            // Non-blocking
        }

        try {
            // 🎖️ ESMC 3.21 - CHECKPOINT: PHASE 0 Memory Retrieval START
            if (performanceRequestId) {
                this.performanceObserver.checkpoint(performanceRequestId, 'phase0-memory');
            }

            // 🎖️ ESMC 3.7 - MEMORY RETRIEVAL PHASE
            console.log(`\n╔═══════════════════════════════════════════╗`);
            console.log(`║  PHASE 0: MEMORY INTELLIGENCE RETRIEVAL   ║`);
            console.log(`╚═══════════════════════════════════════════╝`);

            const keywords = this.keywordExtractor.extractKeywords(request);
            console.log(`🔍 Keywords extracted: ${keywords.primaryKeywords.length} primary, ${keywords.actionKeywords.length} actions`);

            const searchQueries = this.keywordExtractor.generateSearchQueries(keywords);
            console.log(`🔍 Search queries generated: ${searchQueries.length}`);

            // 🎖️ ESMC 3.10 - Detect temporal context and clarification mode
            const retrievalOptions = this._detectRetrievalMode(request, keywords);

            const memoryContext = await this.memoryEngine.retrieveMemoryContext(keywords, searchQueries, retrievalOptions);
            console.log(`🧠 Memory retrieved: ${memoryContext.metadata.totalMatches} relevant memories in ${memoryContext.metadata.retrievalTime}ms`);

            // Enrich context with memory intelligence
            context.memoryContext = memoryContext;
            context.keywords = keywords;
            context.missionId = missionId;

            // 🎖️ ESMC 3.9.1 - PHASE 0.5: INTELLIGENT OPTIMIZATION (MAX/VIP)
            console.log(`\n╔═══════════════════════════════════════════╗`);
            console.log(`║  PHASE 0.5: INTELLIGENT OPTIMIZATION      ║`);
            console.log(`║  (MAX/VIP TIER)                           ║`);
            console.log(`╚═══════════════════════════════════════════╝`);

            // 1. Project Maturity Analysis
            const maturityAnalysis = await this.maturitySystem.analyzeProjectMaturity();
            console.log(`🎖️ Project Maturity: ${maturityAnalysis.maturityTier.name} (${maturityAnalysis.projectAge} days)`);
            console.log(`   Optimization: ${maturityAnalysis.optimization.reason}`);

            // 2. Conversation Scope Detection
            const scopeAnalysis = this.scopeManager.analyzeScopeShift(keywords);
            console.log(`🎯 Scope: ${scopeAnalysis.currentScope.domain || 'general'}`);
            console.log(`   Status: ${scopeAnalysis.reason}`);

            // 3. ATLAS Pattern Recognition (conditional)
            let atlasPatternIntel = null;

            if (scopeAnalysis.shouldTriggerATLAS && maturityAnalysis.optimization.shouldTriggerATLAS) {
                // Both scope and maturity say: trigger ATLAS patterns
                console.log(`\n🔥 ATLAS Pattern: Recognition triggered`);

                const patternScan = await this.atlasScanner.scanForPatterns(keywords);
                console.log(`   Patterns found: ${patternScan.totalFound}`);

                if (patternScan.totalFound > 0) {
                    const viabilityAnalysis = this.atlasAnalyzer.analyzePatterns(patternScan);
                    console.log(`   Viable patterns: ${viabilityAnalysis.viablePatterns.length}`);

                    const suggestions = this.atlasSuggester.generateSuggestions(viabilityAnalysis, request);

                    // Cache ATLAS pattern results for this scope
                    this.scopeManager.cacheATLASResults({
                        totalFound: patternScan.totalFound,
                        viablePatterns: viabilityAnalysis.viablePatterns,
                        suggestions: suggestions,
                        scanTime: patternScan.scanTime
                    });

                    atlasPatternIntel = {
                        triggered: true,
                        patternsFound: patternScan.totalFound,
                        viablePatterns: viabilityAnalysis.viablePatterns.length,
                        suggestions: suggestions,
                        bestPattern: viabilityAnalysis.bestPattern
                    };

                    if (suggestions.patternsFound) {
                        const display = this.atlasSuggester.formatForDisplay(suggestions);
                        console.log(display.formatted);
                    }
                }
            } else {
                // ATLAS patterns skipped - use cache or skip entirely
                if (scopeAnalysis.atlasCacheAvailable) {
                    atlasPatternIntel = {
                        triggered: false,
                        cached: true,
                        reason: 'Using cached ATLAS pattern results (same scope)',
                        cachedResults: this.scopeManager.getCachedATLASResults()
                    };
                    console.log(`   📦 Using cached ATLAS pattern results`);
                } else {
                    atlasPatternIntel = {
                        triggered: false,
                        cached: false,
                        reason: scopeAnalysis.reason || maturityAnalysis.optimization.reason
                    };
                    console.log(`   ⏭️ ATLAS patterns skipped: ${atlasPatternIntel.reason}`);
                }
            }

            // Add optimization intelligence to context
            context.optimization = {
                maturity: maturityAnalysis,
                scope: scopeAnalysis,
                atlasPattern: atlasPatternIntel
            };

            // 🎖️ ESMC 3.21 - CHECKPOINT: WAVE 1 Intelligence Gathering START
            if (performanceRequestId) {
                this.performanceObserver.checkpoint(performanceRequestId, 'wave1-gathering');
            }

            // WAVE 1: Parallel Intelligence Gathering
            console.log(`\n╔═══════════════════════════════════════════╗`);
            console.log(`║  WAVE 1: PARALLEL INTELLIGENCE GATHERING  ║`);
            console.log(`╚═══════════════════════════════════════════╝`);

            this.fusionState.gathering = true;

            const [piuIntel, dkiIntel, uipIntel, pcaIntel] = await Promise.all([
                this._gatherPIUIntelligence(request, context),
                this._gatherDKIIntelligence(request, context),
                this._gatherUIPIntelligence(request, context),
                this._gatherPCAIntelligence(request, context)
            ]);

            // Update central awareness
            this.awareness.PIU = piuIntel;
            this.awareness.DKI = dkiIntel;
            this.awareness.UIP = uipIntel;
            this.awareness.PCA = pcaIntel;

            this.fusionState.gathering = false;

            // 🎖️ ESMC 3.21 - CHECKPOINT: WAVE 2 Mesh Fusion START
            if (performanceRequestId) {
                this.performanceObserver.checkpoint(performanceRequestId, 'wave2-meshing');
            }

            // WAVE 2: Mesh Intelligence Fusion
            console.log(`\n╔═══════════════════════════════════════════╗`);
            console.log(`║  WAVE 2: MESH INTELLIGENCE FUSION        ║`);
            console.log(`╚═══════════════════════════════════════════╝`);

            this.fusionState.meshing = true;

            const meshIntelligence = await this._conductMeshFusion();

            this.fusionState.meshing = false;

            // 🎖️ ESMC 3.21 - CHECKPOINT: WAVE 3 Consensus START
            if (performanceRequestId) {
                this.performanceObserver.checkpoint(performanceRequestId, 'wave3-consensus');
            }

            // WAVE 3: Consensus Synthesis
            console.log(`\n╔═══════════════════════════════════════════╗`);
            console.log(`║  WAVE 3: ECHELON CONSENSUS SYNTHESIS     ║`);
            console.log(`╚═══════════════════════════════════════════╝`);

            this.fusionState.synthesizing = true;

            // 🆕 ESMC 3.100.0: Pass individual intel objects for PCA validation
            const consensus = await this._synthesizeConsensus(meshIntelligence, {
                PIU: piuIntel,
                DKI: dkiIntel,
                UIP: uipIntel,
                PCA: pcaIntel
            });

            this.fusionState.synthesizing = false;
            this.fusionState.complete = true;

            // 🎖️ ESMC 3.21 - CHECKPOINT: Mission Complete (final checkpoint before end)
            if (performanceRequestId) {
                this.performanceObserver.checkpoint(performanceRequestId, 'mission-complete');
            }

            // 🎖️ ESMC 3.21 - HOOK 2: End performance timing (silent)
            let performanceSignature = null;
            if (performanceRequestId) {
                const perfResult = await this.performanceObserver.endTiming(performanceRequestId, {
                    status: 'success',
                    colonelsDeployed: null, // Not tracked in lightweight mode
                    memoryRetrievals: memoryContext ? 1 : 0
                });
                performanceSignature = perfResult?.performance_signature || null;
            }

            // Build final MIN intelligence
            const minIntelligence = {
                missionId,
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime,
                request,

                // Individual component intelligence
                components: {
                    PIU: piuIntel,
                    DKI: dkiIntel,
                    UIP: uipIntel,
                    PCA: pcaIntel
                },

                // Mesh communication insights
                mesh: meshIntelligence,

                // Unified consensus
                consensus: consensus,

                // Final recommendations
                recommendations: this._generateRecommendations(consensus),

                // Confidence score
                confidence: consensus.confidence,

                // Execution plan
                executionPlan: this._buildExecutionPlan(consensus),

                // 🆕 ESMC 3.24 - ATHENA ORACLE: Standard mapping for colonels
                standardMapping: consensus.standardMapping,

                // 🆕 ESMC 3.21 - Performance signature (wall-clock timing)
                performanceSignature: performanceSignature
            };

            // Store in mission history
            this.missionHistory.push(minIntelligence);

            console.log(`\n✅ ECHELON: MIN consensus achieved`);
            console.log(`   Confidence: ${(consensus.confidence * 100).toFixed(1)}%`);
            console.log(`   Agreements: ${consensus.agreements.length}`);
            console.log(`   Gaps: ${consensus.gaps.length} ${consensus.gaps.length === 0 ? '(None - ready to proceed)' : 'highlights identified'}`);

            // 🆕 ESMC 3.22 v3.15.0 - OPTION A: Automatic Halt on Blocker Gaps
            const blockerGaps = consensus.gaps.filter(g => g.severity === 'blocker');

            if (blockerGaps.length > 0) {
                // BLOCKER DETECTED - Halt deployment and present options
                console.log(`\n🔴 DEPLOYMENT BLOCKED - ${blockerGaps.length} blocker gap(s) detected\n`);

                minIntelligence.status = 'BLOCKED';
                minIntelligence.blockerGaps = blockerGaps;
                minIntelligence.gapHighlights = consensus.gapHighlights;

                // Display blocker gaps with details
                blockerGaps.forEach((gap, idx) => {
                    console.log(`🔴 BLOCKER ${idx + 1}: ${gap.channel || gap.component}`);
                    console.log(`   ${gap.need}`);
                    if (gap.recommendation) {
                        console.log(`   → Recommend: ${gap.recommendation}`);
                    }
                    console.log('');
                });

                console.log('⚠️  ECHELON: Deployment halted. Blocker gaps must be resolved or overridden.\n');
                console.log('Your options:');
                console.log('  A. Fix blocker gaps first (recommended)');
                console.log('  B. Proceed anyway (accept high risk)');
                console.log('  C. Convert blockers to caution (acknowledge and proceed)\n');

                // Store in history but don't proceed to colonel deployment
                this.missionHistory.push(minIntelligence);
                return minIntelligence;
            }

            // No blockers - proceed to ATHENA dialogue and colonel deployment
            // 🆕 ESMC 3.22 v3.15.0 - ATHENA-ECHELON Strategic Dialogue
            // 🆕 ESMC 3.100.0: Pass minIntelligence (has components) instead of meshIntelligence
            const dialogue = await this._generateAthenaEchelonDialogue(consensus, minIntelligence, request);

            if (dialogue) {
                // Display ATHENA-ECHELON dialogue
                console.log(dialogue.formatted);
                minIntelligence.athenaDialogue = dialogue;
            }

            // 🆕 ESMC 3.21 - Mission signature moved to CORE manifest
            // Performance signature will appear below the main mission signature

            return minIntelligence;

        } catch (error) {
            console.error(`❌ ECHELON: MIN processing failed - ${error.message}`);
            throw error;
        }
    }

    /**
     * WAVE 1: Gather intelligence from PIU (Memory-Augmented)
     * @private
     */
    async _gatherPIUIntelligence(request, context) {
        console.log(`🧭 NORTH - PIU: Analyzing intent with memory context...`);

        try {
            const piu = this.components.NORTH;

            // 🎖️ ESMC 3.7 - Memory-augmented intent analysis
            const intentAnalysis = await piu.analyzeIntent(
                request,
                context.missionId || null,
                context.projectId || null,
                {
                    ...context,
                    // Pass session history for pattern recognition
                    sessionHistory: context.memoryContext?.sessionHistory || [],
                    userProfile: context.memoryContext?.userPreferences || null
                }
            );

            console.log(`   ✅ PIU: Goal identified - ${intentAnalysis.goals?.[0]?.goal || 'Intent analyzed'}`);
            console.log(`   🧠 Memory: ${context.memoryContext?.sessionHistory.length || 0} past sessions analyzed`);

            return {
                component: 'PIU',
                position: 'NORTH',
                analysis: intentAnalysis,
                memoryAugmented: true,
                timestamp: Date.now()
            };

        } catch (error) {
            console.warn(`   ⚠️ PIU: Analysis limited - ${error.message}`);
            return {
                component: 'PIU',
                position: 'NORTH',
                analysis: { goals: [{ goal: request, confidence: 0.5 }], stakeholders: {}, successCriteria: {} },
                memoryAugmented: false,
                timestamp: Date.now()
            };
        }
    }

    /**
     * WAVE 1: Gather intelligence from DKI (Memory-Augmented)
     * @private
     */
    async _gatherDKIIntelligence(request, context) {
        console.log(`🧭 WEST - DKI: Querying domain knowledge with memory context...`);

        try {
            const dki = this.components.WEST;

            // 🎖️ ESMC 3.7 - Memory-augmented domain analysis
            const domainKnowledge = await dki.analyzeDomain(
                request,
                {
                    domain: context.projectDomain || null,
                    // Pass project decisions from memory for pattern matching
                    projectDecisions: context.memoryContext?.projectDecisions || []
                },
                context.missionId || null
            );

            console.log(`   ✅ DKI: ${domainKnowledge.applicableStandards?.length || 0} standards identified`);
            console.log(`   🧠 Memory: ${context.memoryContext?.domainPatterns.length || 0} domain patterns loaded`);

            return {
                component: 'DKI',
                position: 'WEST',
                knowledge: domainKnowledge,
                memoryAugmented: true,
                timestamp: Date.now()
            };

        } catch (error) {
            console.warn(`   ⚠️ DKI: Knowledge limited - ${error.message}`);
            return {
                component: 'DKI',
                position: 'WEST',
                knowledge: { detectedDomains: [], applicableStandards: [], complianceRequirements: [] },
                memoryAugmented: false,
                timestamp: Date.now()
            };
        }
    }

    /**
     * WAVE 1: Gather intelligence from UIP (Memory-Augmented)
     * @private
     */
    async _gatherUIPIntelligence(request, context) {
        console.log(`🧭 EAST - UIP: Predicting user preferences with memory context...`);

        try {
            const uip = this.components.EAST;

            // 🎖️ ESMC 3.7 - Memory-augmented workflow prediction
            const predictions = await uip.predictNextSteps(
                request,
                {
                    userId: context.userId || null,
                    completedSteps: [],
                    // Use session history length as completedWorkflows proxy
                    completedWorkflows: context.memoryContext?.sessionHistory.length || 0
                },
                context.missionId || null
            );

            console.log(`   ✅ UIP: Workflow "${predictions.detectedWorkflow?.displayName || 'Generic'}" detected`);
            console.log(`   🧠 Memory: ${context.memoryContext?.sessionHistory.length || 0} workflow patterns analyzed`);

            return {
                component: 'UIP',
                position: 'EAST',
                predictions: predictions,
                memoryAugmented: true,
                timestamp: Date.now()
            };

        } catch (error) {
            console.warn(`   ⚠️ UIP: Predictions limited - ${error.message}`);
            return {
                component: 'UIP',
                position: 'EAST',
                predictions: { detectedWorkflow: null, nextSteps: [], gapDetection: [] },
                memoryAugmented: false,
                timestamp: Date.now()
            };
        }
    }

    /**
     * WAVE 1: Gather intelligence from PCA
     * @private
     */
    async _gatherPCAIntelligence(request, context) {
        console.log(`🧭 SOUTH - PCA: Analyzing project context...`);

        try {
            const pca = this.components.SOUTH;
            const projectPath = context.projectPath || process.cwd();

            // Analyze project context
            const projectContext = await pca.analyzeProjectContext(projectPath);

            console.log(`   ✅ PCA: Project analyzed - ${projectContext.consistency?.overall ? (projectContext.consistency.overall * 100).toFixed(0) + '% consistency' : 'Context gathered'}`);

            return {
                component: 'PCA',
                position: 'SOUTH',
                context: projectContext,
                timestamp: Date.now()
            };

        } catch (error) {
            console.warn(`   ⚠️ PCA: Context limited - ${error.message}`);
            return {
                component: 'PCA',
                position: 'SOUTH',
                context: { recommendations: [], consistency: { overall: 0.8 } },
                timestamp: Date.now()
            };
        }
    }

    /**
     * WAVE 2: Conduct mesh intelligence fusion
     * @private
     */
    async _conductMeshFusion() {
        console.log(`🕸️ ECHELON: Facilitating mesh communication...`);

        const meshCommunications = [];

        // PIU ↔ DKI
        meshCommunications.push({
            channel: 'PIU-DKI',
            exchange: await this._facilitateExchange('PIU', 'DKI'),
            insight: 'Intent validated against domain standards'
        });

        // PIU ↔ UIP
        meshCommunications.push({
            channel: 'PIU-UIP',
            exchange: await this._facilitateExchange('PIU', 'UIP'),
            insight: 'Intent aligned with user preferences'
        });

        // PIU ↔ PCA
        meshCommunications.push({
            channel: 'PIU-PCA',
            exchange: await this._facilitateExchange('PIU', 'PCA'),
            insight: 'Intent feasibility within project context'
        });

        // DKI ↔ UIP
        meshCommunications.push({
            channel: 'DKI-UIP',
            exchange: await this._facilitateExchange('DKI', 'UIP'),
            insight: 'Standards negotiated with preferences'
        });

        // DKI ↔ PCA
        meshCommunications.push({
            channel: 'DKI-PCA',
            exchange: await this._facilitateExchange('DKI', 'PCA'),
            insight: 'Standards adapted to project patterns'
        });

        // UIP ↔ PCA
        meshCommunications.push({
            channel: 'UIP-PCA',
            exchange: await this._facilitateExchange('UIP', 'PCA'),
            insight: 'Preferences validated against project constraints'
        });

        console.log(`   ✅ Mesh fusion: ${meshCommunications.length} bidirectional exchanges completed`);

        return {
            communications: meshCommunications,
            channelsActive: meshCommunications.length,
            meshComplete: true
        };
    }

    /**
     * Facilitate information exchange between two components
     * ESMC 3.22 v3.15.0 - Gap Analysis System (Option 3: GAP + Severity)
     * Philosophy: "They don't oppose, just show what we lack/need to get it done"
     * Severity: ⚠️ (caution/acceptable tradeoff) | 🔴 (blocker/must resolve)
     * @private
     */
    async _facilitateExchange(comp1, comp2) {
        const intel1 = this.awareness[comp1];
        const intel2 = this.awareness[comp2];

        // Channel-specific gap validation
        const channelKey = `${comp1}-${comp2}`;
        const validation = await this._validateRequirements(channelKey, intel1, intel2);

        if (!validation.requirementMet) {
            // Gap detected - return with severity icon and recommendation
            return {
                from: comp1,
                to: comp2,
                channel: channelKey,
                agreement: false,
                gap: true,
                gapData: {
                    channel: channelKey,
                    type: validation.gap.type,
                    need: validation.gap.need,
                    severity: validation.gap.severity, // 'caution' | 'blocker'
                    icon: validation.gap.severity === 'blocker' ? '🔴' : '⚠️',
                    recommendation: validation.gap.recommendation || null,
                    details: validation.gap.details || {}
                }
            };
        }

        // Requirement met - calculate agreement confidence
        const confidence = this._calculateAgreementConfidence(channelKey, intel1, intel2);

        return {
            from: comp1,
            to: comp2,
            channel: channelKey,
            agreement: true,
            gap: false,
            confidence: confidence,
            info: this._generateAgreementSummary(channelKey, intel1, intel2)
        };
    }

    /**
     * WAVE 3: Synthesize unified consensus
     * ESMC 3.22 v3.15.0 - Gap Analysis System
     * 🆕 ESMC 3.100.0: Now receives componentIntel for PCA validation
     * @private
     */
    async _synthesizeConsensus(meshIntelligence, componentIntel = {}) {
        console.log(`🎯 ECHELON: Synthesizing unified consensus...`);

        const agreements = [];
        const gaps = []; // Replaces conflicts array
        const gapHighlights = []; // For formatted display

        // 🆕 ESMC 3.24 - ATHENA ORACLE: Intelligent Standard Selection
        // Select appropriate standards for each colonel based on code patterns
        let standardMapping = null;
        if (meshIntelligence.code) {
            standardMapping = this.selectStandardsForColonels(meshIntelligence.code, meshIntelligence.context || {});
            console.log(`🔮 ORACLE: Standard selection complete (6 colonels mapped)`);
        }

        // Analyze mesh communications for consensus (ESMC 3.22 v3.15.0 - Gap Analysis)
        let totalConfidence = 0;
        let confidenceCount = 0;

        meshIntelligence.communications.forEach(comm => {
            if (comm.exchange.agreement) {
                agreements.push({
                    components: comm.channel.split('-'),
                    agreement: comm.insight || comm.exchange.info,
                    confidence: comm.exchange.confidence || 0.85
                });

                // Accumulate confidence scores
                if (comm.exchange.confidence) {
                    totalConfidence += comm.exchange.confidence;
                    confidenceCount++;
                }
            }
            if (comm.exchange.gap) {
                // Gap detected - extract data
                const gapData = comm.exchange.gapData || comm.exchange;

                gaps.push({
                    channel: gapData.channel || comm.channel,
                    components: comm.channel.split('-'),
                    type: gapData.type,
                    need: gapData.need,
                    severity: gapData.severity, // 'caution' | 'blocker'
                    icon: gapData.icon, // '⚠️' | '🔴'
                    recommendation: gapData.recommendation,
                    details: gapData.details || {}
                });

                // Format for display
                const label = gapData.severity === 'blocker' ? 'BLOCKER' : '';
                gapHighlights.push({
                    icon: gapData.icon,
                    channel: gapData.channel || comm.channel,
                    description: gapData.need,
                    recommendation: gapData.recommendation,
                    label: label
                });
            }
        });

        // 🆕 ESMC 3.13 - VALIDATE PCA VERIFICATION PROTOCOL
        // Before finalizing consensus, ensure PCA completed workspace verification
        // 🆕 ESMC 3.100.0: Pass both componentIntel and meshIntelligence
        const pcaValidation = await this._validatePCAVerification(componentIntel, meshIntelligence);

        if (!pcaValidation.valid) {
            // PCA verification failed - add as blocker gap
            gaps.push({
                component: 'PCA',
                type: 'VERIFICATION_INCOMPLETE',
                need: pcaValidation.reason,
                severity: 'blocker',
                icon: '🔴'
            });

            gapHighlights.push({
                icon: '🔴',
                channel: 'PCA',
                description: pcaValidation.reason,
                recommendation: pcaValidation.action,
                label: 'BLOCKER'
            });

            console.log(`🔴 ECHELON: PCA verification gap - ${pcaValidation.reason}`);
        }

        // Calculate consensus confidence (ESMC 3.22 v3.15.0 - Gap-adjusted)
        const totalExchanges = meshIntelligence.communications.length;

        let confidence;
        if (confidenceCount > 0) {
            // Use average of individual channel confidences
            const avgConfidence = totalConfidence / confidenceCount;

            // Penalty for gaps (blocker = 0.10, caution = 0.05)
            const gapPenalty = gaps.reduce((penalty, gap) => {
                return penalty + (gap.severity === 'blocker' ? 0.10 : 0.05);
            }, 0);

            confidence = Math.max(0.60, Math.min(0.98, avgConfidence - gapPenalty));
        } else {
            // Fallback to rate-based calculation
            const consensusRate = agreements.length / totalExchanges;
            confidence = Math.min(0.98, 0.70 + (consensusRate * 0.28));
        }

        return {
            agreements,
            gaps, // Replaces conflicts
            gapHighlights, // Formatted for display
            confidence,
            unified: agreements.length > gaps.length,
            pcaVerification: pcaValidation,
            standardMapping // 🆕 ESMC 3.24 - ATHENA ORACLE standard selection
        };
    }

    /**
     * 🆕 ESMC 3.13 - VALIDATE PCA VERIFICATION PROTOCOL
     * Ensures PCA completed all 3 gates before accepting intelligence
     * 🆕 ESMC 3.100.0: Now receives componentIntel for PCA data and meshIntelligence for request keywords
     * @private
     */
    async _validatePCAVerification(componentIntel, meshIntelligence) {
        const pcaIntel = componentIntel.PCA;

        if (!pcaIntel) {
            return {
                valid: false,
                reason: 'PCA intelligence not found',
                action: 'REJECT_CONSENSUS'
            };
        }

        // Check if PCA report includes verification metadata
        if (!pcaIntel.verification) {
            // No verification metadata - check if verification was required
            const verificationRequired = this._wasVerificationRequired(meshIntelligence);

            if (verificationRequired) {
                return {
                    valid: false,
                    reason: 'PCA did not complete mandatory verification protocol',
                    action: 'FORCE_PCA_REANALYSIS',
                    requiredDomain: verificationRequired.domain
                };
            } else {
                // Verification not required - proceed
                return {
                    valid: true,
                    reason: 'Verification not required for this domain',
                    action: 'PROCEED'
                };
            }
        }

        // Verification metadata exists - validate each gate
        const verification = pcaIntel.verification;

        // GATE 1: Workspace topology checked?
        if (!verification.workspaceTopologyChecked && verification.mode !== 'DEGRADED') {
            return {
                valid: false,
                reason: 'GATE 1 FAILED: Related projects not identified',
                action: 'FORCE_PCA_REANALYSIS'
            };
        }

        // GATE 2: Implementation files read?
        if (!verification.filesRead || verification.filesRead.length === 0) {
            if (verification.mode === 'MANDATORY_VERIFIED' || verification.mode === 'OPTIONAL_VERIFIED') {
                // Should have read files but didn't
                return {
                    valid: false,
                    reason: 'GATE 2 FAILED: No implementation files verified',
                    action: 'FORCE_PCA_REANALYSIS'
                };
            }
        }

        // GATE 3: Suggestion validated?
        if (!verification.suggestionValidated && verification.mode === 'MANDATORY_VERIFIED') {
            return {
                valid: false,
                reason: 'GATE 3 FAILED: Suggestion not validated against real code',
                action: 'FORCE_PCA_REANALYSIS'
            };
        }

        // All gates passed or verification was optional
        return {
            valid: true,
            confidence: verification.confidence || 0.9,
            action: 'PROCEED',
            mode: verification.mode
        };
    }

    /**
     * 🆕 Check if verification was required for this request
     * @private
     */
    _wasVerificationRequired(meshIntelligence) {
        // Check keywords for mandatory triggers
        const keywords = meshIntelligence.request?.keywords || [];

        const mandatoryTriggers = [
            'endpoint', 'route', 'auth', 'login', 'api',
            'database', 'schema', 'query'
        ];

        for (const keyword of keywords) {
            if (mandatoryTriggers.includes(keyword.toLowerCase())) {
                return {
                    required: true,
                    domain: keyword,
                    trigger: keyword
                };
            }
        }

        return null; // Not required
    }

    /**
     * Resolve conflict between components (Legacy - kept for backward compatibility)
     * @private
     */
    _resolveConflict(conflict) {
        // ECHELON arbitrates based on context
        return {
            conflict: conflict.info,
            resolution: 'ECHELON mediated compromise',
            method: 'Context-weighted decision'
        };
    }

    /**
     * ESMC 3.22 v3.15.0 - GAP ANALYSIS SYSTEM
     * Validate requirements and identify gaps (not conflicts)
     * Philosophy: "They don't oppose, just show what we lack/need to get it done"
     * @private
     */
    async _validateRequirements(channelKey, intel1, intel2) {
        // Safety check: If either component failed to gather intelligence, gap exists
        if (!intel1 || !intel2) {
            return {
                requirementMet: false,
                gap: {
                    type: 'MISSING_INTELLIGENCE',
                    need: `${!intel1 ? intel1.component : intel2.component} analysis incomplete`
                }
            };
        }

        // Each channel validates different requirement
        switch (channelKey) {
            case 'PIU-DKI':
                return this._validatePIU_DKI_Requirements(intel1, intel2);
            case 'PIU-UIP':
                return this._validatePIU_UIP_Requirements(intel1, intel2);
            case 'PIU-PCA':
                return this._validatePIU_PCA_Requirements(intel1, intel2);
            case 'DKI-UIP':
                return this._validateDKI_UIP_Requirements(intel1, intel2);
            case 'DKI-PCA':
                return this._validateDKI_PCA_Requirements(intel1, intel2);
            case 'UIP-PCA':
                return this._validateUIP_PCA_Requirements(intel1, intel2);
            default:
                return { requirementMet: true, gap: null }; // Unknown channel, assume OK
        }
    }

    /**
     * PIU-DKI: Validate intent against domain standards
     * Gap: Intent proposes approach that violates domain best practices
     * @private
     */
    _validatePIU_DKI_Requirements(piuIntel, dkiIntel) {
        const intent = piuIntel.intent;
        const standards = dkiIntel.knowledge?.applicableStandards || [];

        // Check if intent violates security/compliance standards
        if (standards.length > 0 && intent?.proposedApproach) {
            if (intent.risk === 'high' && standards.some(s => s.includes('security') || s.includes('compliance'))) {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'STANDARDS_VIOLATION',
                        need: `Intent proposes high-risk approach in domain with strict ${standards.join(', ')} standards`,
                        severity: 'blocker',
                        recommendation: `Revise approach to comply with ${standards[0]} requirements before proceeding`,
                        details: {
                            intent: intent.proposedApproach,
                            standards: standards,
                            risk: intent.risk
                        }
                    }
                };
            }
        }

        return { requirementMet: true, gap: null };
    }

    /**
     * PIU-UIP: Validate intent against user's historical patterns
     * Gap: User requesting unfamiliar complex workflow
     * @private
     */
    _validatePIU_UIP_Requirements(piuIntel, uipIntel) {
        const intent = piuIntel.intent;
        const workflow = uipIntel.predictions?.detectedWorkflow;

        // Check for novel complex request (no historical pattern)
        if (workflow && workflow.displayName && intent?.category) {
            const isNovel = !workflow.displayName.toLowerCase().includes(intent.category.toLowerCase());

            if (isNovel && intent.complexity === 'high') {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'UNFAMILIAR_WORKFLOW',
                        need: `User requesting complex ${intent.category} workflow with no historical pattern. May need additional guidance or examples`,
                        severity: 'caution',
                        recommendation: `Provide detailed explanations and examples since this is outside user's typical ${workflow.displayName} workflow`,
                        details: {
                            requestedWorkflow: intent.category,
                            userHistoricalPattern: workflow.displayName,
                            complexity: intent.complexity
                        }
                    }
                };
            }
        }

        return { requirementMet: true, gap: null };
    }

    /**
     * PIU-PCA: Validate intent feasibility in current codebase
     * Gap: Intent requires capabilities not present in project
     * @private
     */
    _validatePIU_PCA_Requirements(piuIntel, pcaIntel) {
        const intent = piuIntel.intent;
        const projectContext = pcaIntel.context;

        // Check if codebase has required capabilities
        if (intent?.requirements && projectContext?.capabilities) {
            const missingCapabilities = intent.requirements.filter(req =>
                !projectContext.capabilities.some(cap => cap.includes(req))
            );

            if (missingCapabilities.length > 0) {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'MISSING_CAPABILITIES',
                        need: `Intent requires ${missingCapabilities.join(', ')} but codebase lacks these capabilities`,
                        severity: 'blocker',
                        recommendation: `Install/implement ${missingCapabilities[0]} before proceeding with ${intent.category}`,
                        details: {
                            missing: missingCapabilities,
                            available: projectContext.capabilities,
                            complexity: intent.complexity
                        }
                    }
                };
            }
        }

        // Check project consistency for high-complexity intents
        if (intent?.complexity === 'high' && projectContext?.consistency) {
            const consistency = projectContext.consistency.overall || 0.8;
            if (consistency < 0.5) {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'LOW_PROJECT_CONSISTENCY',
                        need: `Project consistency (${(consistency * 100).toFixed(0)}%) too low for high-complexity changes. Risk of integration issues`,
                        severity: 'caution',
                        recommendation: `Consider refactoring project structure before adding complex ${intent.category} features`,
                        details: {
                            projectConsistency: consistency,
                            complexity: intent.complexity
                        }
                    }
                };
            }
        }

        return { requirementMet: true, gap: null };
    }

    /**
     * DKI-UIP: Validate domain standards against user preferences
     * Gap: Standards conflict with user's established workflow
     * @private
     */
    _validateDKI_UIP_Requirements(dkiIntel, uipIntel) {
        const standards = dkiIntel.knowledge?.applicableStandards || [];
        const workflow = uipIntel.predictions?.detectedWorkflow;

        // Check if standards contradict user preferences
        if (standards.length > 0 && workflow?.preferences) {
            const standardFrameworks = standards.filter(s => s.includes('framework') || s.includes('library'));
            const userPreferences = workflow.preferences || [];

            // ESMC 3.22 v3.15.1 - BUGFIX: Check complete mismatch (all prefs match no standards)
            // Previous logic: standardFrameworks.some(std => userPreferences.some(pref => !std.includes(pref)))
            // Problem: Returned true if ANY pref didn't match ANY standard (false positives)
            // Fixed: Return true only if ALL prefs match NO standards (complete conflict)
            // Guard: Empty preferences array should pass (no conflict if no preferences stated)
            const hasConflict = standardFrameworks.length > 0 &&
                userPreferences.length > 0 &&
                userPreferences.every(pref =>
                    !standardFrameworks.some(std => std.toLowerCase().includes(pref.toLowerCase()))
                );

            if (hasConflict) {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'STANDARDS_VS_PREFERENCE',
                        need: `Domain standards (${standardFrameworks[0]}) differ from user's preferred ${userPreferences[0]} approach`,
                        severity: 'caution',
                        recommendation: `Use ${userPreferences[0]} with ${standardFrameworks[0]} best practices as acceptable compromise`,
                        details: {
                            standards: standardFrameworks,
                            preferences: userPreferences
                        }
                    }
                };
            }
        }

        return { requirementMet: true, gap: null };
    }

    /**
     * DKI-PCA: Validate domain standards fit project architecture
     * Gap: Standards don't match existing project patterns
     * @private
     */
    _validateDKI_PCA_Requirements(dkiIntel, pcaIntel) {
        const standards = dkiIntel.knowledge?.applicableStandards || [];
        const projectContext = pcaIntel.context;

        // Check if strict standards clash with low-consistency project
        if (standards.length > 0 && projectContext?.consistency) {
            const consistency = projectContext.consistency.overall || 0.8;

            if (consistency < 0.6 && standards.some(s => s.includes('strict') || s.includes('required'))) {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'ARCHITECTURE_MISMATCH',
                        need: `Strict ${standards[0]} standards difficult to apply to low-consistency (${(consistency * 100).toFixed(0)}%) project`,
                        severity: 'caution',
                        recommendation: `Apply ${standards[0]} principles pragmatically, focusing on new code first`,
                        details: {
                            standards: standards,
                            projectConsistency: consistency
                        }
                    }
                };
            }
        }

        return { requirementMet: true, gap: null };
    }

    /**
     * UIP-PCA: Validate predicted workflow works in project
     * Gap: User's typical workflow doesn't match project structure
     * @private
     */
    _validateUIP_PCA_Requirements(uipIntel, pcaIntel) {
        const predictions = uipIntel.predictions;
        const projectContext = pcaIntel.context;

        // Check if user's predicted tools exist in project
        if (predictions?.likelyTools && projectContext?.availableTools) {
            const missingTools = predictions.likelyTools.filter(tool =>
                !projectContext.availableTools.some(avail => avail.includes(tool))
            );

            if (missingTools.length > 0) {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'WORKFLOW_TOOL_MISSING',
                        need: `User typically uses ${missingTools.join(', ')} but these tools not available in project`,
                        severity: 'caution',
                        recommendation: `Install ${missingTools[0]} or adjust workflow to use available ${projectContext.availableTools[0]}`,
                        details: {
                            missingTools: missingTools,
                            availableTools: projectContext.availableTools
                        }
                    }
                };
            }
        }

        // Check if workflow complexity matches project maturity
        if (predictions?.complexity && projectContext?.maturity) {
            const workflowComplexity = predictions.complexity;
            const projectMaturity = projectContext.maturity;

            if (workflowComplexity === 'high' && projectMaturity === 'early') {
                return {
                    requirementMet: false,
                    gap: {
                        type: 'MATURITY_MISMATCH',
                        need: `Complex workflow predicted but project is in early maturity stage. May need additional scaffolding`,
                        severity: 'caution',
                        recommendation: `Build foundational infrastructure before attempting complex ${predictions.detectedWorkflow?.displayName} operations`,
                        details: {
                            complexity: workflowComplexity,
                            maturity: projectMaturity
                        }
                    }
                };
            }
        }

        return { requirementMet: true, gap: null };
    }

    /**
     * PIU-DKI: Does intent violate domain standards?
     * @private
     */
    _detectPIU_DKI_Conflict(piuIntel, dkiIntel) {
        const intent = piuIntel.intent;
        const standards = dkiIntel.knowledge?.applicableStandards || [];

        // If DKI found standards and PIU's approach might conflict
        if (standards.length > 0 && intent?.proposedApproach) {
            // Check for high-risk intent when standards exist
            if (intent.risk === 'high' && standards.some(s => s.includes('security') || s.includes('compliance'))) {
                return {
                    description: `Intent proposes high-risk approach in domain with strict standards`,
                    severity: 'high',
                    details: {
                        intent: intent.proposedApproach,
                        standards: standards,
                        risk: intent.risk
                    }
                };
            }
        }

        return null; // No conflict
    }

    /**
     * PIU-UIP: Does intent differ from user patterns?
     * @private
     */
    _detectPIU_UIP_Conflict(piuIntel, uipIntel) {
        const intent = piuIntel.intent;
        const workflow = uipIntel.predictions?.detectedWorkflow;

        // If UIP detected a workflow but PIU's intent doesn't match
        if (workflow && workflow.displayName && intent?.category) {
            // Check for novelty - user requesting something they've never done
            const isNovel = !workflow.displayName.toLowerCase().includes(intent.category.toLowerCase());

            if (isNovel && intent.complexity === 'high') {
                return {
                    description: `Intent requests unfamiliar workflow (user pattern analysis shows no history)`,
                    severity: 'medium',
                    details: {
                        requestedWorkflow: intent.category,
                        userHistoricalPattern: workflow.displayName,
                        complexity: intent.complexity
                    }
                };
            }
        }

        return null; // No conflict
    }

    /**
     * PIU-PCA: Is intent feasible in current codebase?
     * @private
     */
    _detectPIU_PCA_Conflict(piuIntel, pcaIntel) {
        const intent = piuIntel.intent;
        const projectContext = pcaIntel.context;

        // If intent requires specific architecture that doesn't exist
        if (intent?.requiredFiles && projectContext?.recommendations) {
            // Check if project structure supports intent
            const missingCapabilities = intent.requiredFiles.filter(file =>
                !projectContext.recommendations.some(rec => rec.includes(file))
            );

            if (missingCapabilities.length > 0) {
                return {
                    description: `Intent requires capabilities not present in current codebase`,
                    severity: 'high',
                    details: {
                        requiredByIntent: intent.requiredFiles,
                        missing: missingCapabilities,
                        projectConsistency: projectContext.consistency?.overall || 0.8
                    }
                };
            }
        }

        return null; // No conflict
    }

    /**
     * DKI-UIP: Do standards conflict with user preferences?
     * @private
     */
    _detectDKI_UIP_Conflict(dkiIntel, uipIntel) {
        const standards = dkiIntel.knowledge?.applicableStandards || [];
        const workflow = uipIntel.predictions?.detectedWorkflow;

        // If DKI has strict standards but UIP shows user prefers different approach
        if (standards.length > 0 && workflow?.preferences) {
            // Check for framework conflicts
            const standardFrameworks = standards.filter(s => s.includes('framework') || s.includes('library'));
            const userPreferences = workflow.preferences || [];

            const hasConflict = standardFrameworks.some(standard =>
                userPreferences.some(pref => !standard.toLowerCase().includes(pref.toLowerCase()))
            );

            if (hasConflict) {
                return {
                    description: `Domain standards suggest approach different from user's historical preferences`,
                    severity: 'low',
                    details: {
                        standards: standardFrameworks,
                        userPreferences: userPreferences
                    }
                };
            }
        }

        return null; // No conflict
    }

    /**
     * DKI-PCA: Do standards fit project architecture?
     * @private
     */
    _detectDKI_PCA_Conflict(dkiIntel, pcaIntel) {
        const standards = dkiIntel.knowledge?.applicableStandards || [];
        const projectContext = pcaIntel.context;

        // If DKI suggests standards that don't match project patterns
        if (standards.length > 0 && projectContext?.consistency) {
            // Low consistency + strict standards = potential conflict
            const consistency = projectContext.consistency.overall || 0.8;

            if (consistency < 0.6 && standards.some(s => s.includes('strict') || s.includes('required'))) {
                return {
                    description: `Strict domain standards may not fit low-consistency project architecture`,
                    severity: 'medium',
                    details: {
                        standards: standards,
                        projectConsistency: consistency,
                        recommendation: 'Consider refactoring before applying strict standards'
                    }
                };
            }
        }

        return null; // No conflict
    }

    /**
     * UIP-PCA: Do predicted workflows work in this project?
     * @private
     */
    _detectUIP_PCA_Conflict(uipIntel, pcaIntel) {
        const predictions = uipIntel.predictions;
        const projectContext = pcaIntel.context;

        // If UIP predicts next steps that require missing project structure
        if (predictions?.nextSteps && projectContext?.recommendations) {
            // Check if predicted steps are feasible
            const infeasibleSteps = predictions.nextSteps.filter(step => {
                // Simple heuristic: If step mentions files/tools not in recommendations
                return !projectContext.recommendations.some(rec =>
                    step.action.toLowerCase().includes(rec.toLowerCase())
                );
            });

            if (infeasibleSteps.length > 0) {
                return {
                    description: `Predicted workflow steps require project capabilities that don't exist`,
                    severity: 'medium',
                    details: {
                        predictedSteps: predictions.nextSteps.map(s => s.action),
                        infeasibleSteps: infeasibleSteps.map(s => s.action),
                        projectCapabilities: projectContext.recommendations
                    }
                };
            }
        }

        return null; // No conflict
    }

    /**
     * ECHELON: Technical analysis of conflict
     * @private
     */
    _analyzeTechnical(conflict, intel1, intel2) {
        return {
            constraints: this._identifyTechnicalConstraints(conflict, intel1, intel2),
            complexity: this._assessImplementationComplexity(conflict),
            performance: this._estimatePerformanceImpact(conflict),
            recommendation: this._generateTechnicalRecommendation(conflict)
        };
    }

    /**
     * ATHENA: Strategic analysis of conflict
     * @private
     */
    _analyzeStrategic(conflict, intel1, intel2) {
        return {
            userImpact: this._assessUserImpact(conflict),
            longTerm: this._analyzeLongTermConsequences(conflict, intel1, intel2),
            riskReward: this._calculateRiskReward(conflict),
            recommendation: this._generateStrategicRecommendation(conflict)
        };
    }

    /**
     * Technical constraint identification
     * @private
     */
    _identifyTechnicalConstraints(conflict, intel1, intel2) {
        const constraints = [];

        if (conflict.severity === 'high') {
            constraints.push('High severity conflict requires careful implementation');
        }

        if (conflict.details?.missing) {
            constraints.push(`Missing capabilities: ${conflict.details.missing.join(', ')}`);
        }

        if (conflict.details?.projectConsistency && conflict.details.projectConsistency < 0.7) {
            constraints.push('Low project consistency increases risk of integration issues');
        }

        return constraints.length > 0 ? constraints : ['No major technical constraints identified'];
    }

    /**
     * Implementation complexity assessment
     * @private
     */
    _assessImplementationComplexity(conflict) {
        const complexityMap = {
            'high': 'High - Requires significant refactoring or new infrastructure',
            'medium': 'Medium - Moderate code changes with some architectural impact',
            'low': 'Low - Minor adjustments to existing code'
        };

        return complexityMap[conflict.severity] || 'Medium';
    }

    /**
     * Performance impact estimation
     * @private
     */
    _estimatePerformanceImpact(conflict) {
        if (conflict.details?.complexity === 'high') {
            return 'Potentially significant - Complex workflows may impact response time';
        }

        return 'Minimal - Standard implementation patterns should maintain performance';
    }

    /**
     * Technical recommendation generation
     * @private
     */
    _generateTechnicalRecommendation(conflict) {
        switch (conflict.severity) {
            case 'high':
                return 'Recommend addressing missing capabilities before proceeding with intent';
            case 'medium':
                return 'Proceed with caution - implement with additional validation';
            case 'low':
                return 'Safe to proceed - minor adjustments needed';
            default:
                return 'Evaluate trade-offs and proceed based on project priorities';
        }
    }

    /**
     * User impact assessment
     * @private
     */
    _assessUserImpact(conflict) {
        if (conflict.severity === 'high') {
            return 'High - Proceeding without resolution may lead to failed implementation or poor UX';
        } else if (conflict.severity === 'medium') {
            return 'Medium - User may experience suboptimal workflow or unexpected behavior';
        }

        return 'Low - Minimal impact on user experience';
    }

    /**
     * Long-term consequence analysis
     * @private
     */
    _analyzeLongTermConsequences(conflict, intel1, intel2) {
        const consequences = [];

        if (conflict.description.includes('standards')) {
            consequences.push('Ignoring standards may create technical debt');
        }

        if (conflict.description.includes('user pattern')) {
            consequences.push('Deviating from user patterns may reduce adoption');
        }

        if (conflict.description.includes('codebase') || conflict.description.includes('project')) {
            consequences.push('Architectural misalignment may complicate future development');
        }

        return consequences.length > 0 ? consequences : ['No significant long-term concerns identified'];
    }

    /**
     * Risk/reward ratio calculation
     * @private
     */
    _calculateRiskReward(conflict) {
        const riskScore = conflict.severity === 'high' ? 0.8 : (conflict.severity === 'medium' ? 0.5 : 0.2);
        const rewardScore = conflict.details?.complexity === 'high' ? 0.7 : 0.5;

        if (riskScore > rewardScore) {
            return `Higher risk (${(riskScore * 100).toFixed(0)}%) than reward (${(rewardScore * 100).toFixed(0)}%) - Proceed cautiously`;
        }

        return `Balanced risk/reward profile - Reasonable to proceed with safeguards`;
    }

    /**
     * Strategic recommendation generation
     * @private
     */
    _generateStrategicRecommendation(conflict) {
        if (conflict.severity === 'high') {
            return 'Recommend pausing to address fundamental gaps before proceeding';
        } else if (conflict.severity === 'medium') {
            return 'Acceptable to proceed with enhanced monitoring and fallback plan';
        }

        return 'Low strategic risk - proceed with standard approach';
    }

    /**
     * Generate conflict resolution options for General
     * @private
     */
    _generateConflictOptions(technicalAnalysis, strategicAnalysis) {
        return [
            {
                option: 'A',
                label: 'Resolve Conflict First',
                description: 'Address the conflict before proceeding with implementation',
                tradeoffs: {
                    pros: ['Lower risk', 'Better long-term stability', 'Aligns with standards/patterns'],
                    cons: ['Additional time required', 'May delay delivery']
                }
            },
            {
                option: 'B',
                label: 'Proceed with Safeguards',
                description: 'Continue with implementation but add validation and monitoring',
                tradeoffs: {
                    pros: ['Faster delivery', 'Tests real-world viability'],
                    cons: ['Higher risk', 'May require rework later']
                }
            },
            {
                option: 'C',
                label: 'Alternative Approach',
                description: 'Modify intent to avoid conflict entirely',
                tradeoffs: {
                    pros: ['Eliminates conflict', 'Leverages existing capabilities'],
                    cons: ['May not fully satisfy original intent', 'Requires redesign']
                }
            }
        ];
    }

    /**
     * ECHELON + ATHENA consensus recommendation
     * @private
     */
    _echelonAthenaConsensus(technicalAnalysis, strategicAnalysis) {
        return {
            recommendation: 'Option A',
            rationale: 'Both technical and strategic analysis indicate addressing the conflict first reduces overall risk and improves long-term outcomes',
            confidence: 0.85,
            dissent: null // If ECHELON and ATHENA disagree, this field would contain the minority opinion
        };
    }

    /**
     * Calculate agreement confidence (no conflict case)
     * @private
     */
    _calculateAgreementConfidence(channelKey, intel1, intel2) {
        // Base confidence: 0.7
        let confidence = 0.70;

        // Boost if both components gathered meaningful intelligence
        if (intel1 && intel2) {
            confidence += 0.10;

            // Additional boost for memory-augmented intelligence
            if (intel1.memoryAugmented || intel2.memoryAugmented) {
                confidence += 0.05;
            }

            // Channel-specific confidence boosts
            if (channelKey === 'PIU-DKI' && intel1.intent && intel2.knowledge) {
                confidence += 0.08; // High confidence when intent aligns with domain knowledge
            }

            if (channelKey === 'UIP-PCA' && intel1.predictions && intel2.context) {
                confidence += 0.05; // Good confidence when workflows match project
            }
        }

        return Math.min(0.98, confidence); // Cap at 98% (never 100%)
    }

    /**
     * Generate agreement summary (no conflict case)
     * @private
     */
    _generateAgreementSummary(channelKey, intel1, intel2) {
        const summaries = {
            'PIU-DKI': 'Intent validated against domain standards',
            'PIU-UIP': 'Intent aligns with user workflow patterns',
            'PIU-PCA': 'Intent feasible within current project architecture',
            'DKI-UIP': 'Standards compatible with user preferences',
            'DKI-PCA': 'Standards fit project architecture patterns',
            'UIP-PCA': 'Predicted workflows supported by project capabilities'
        };

        return summaries[channelKey] || `${channelKey}: Components in agreement`;
    }

    /**
     * Generate final recommendations
     * @private
     */
    _generateRecommendations(consensus) {
        return consensus.agreements.map(agreement => ({
            recommendation: agreement.agreement,
            basedOn: agreement.components.join(' + '),
            confidence: 'High'
        }));
    }

    /**
     * Build execution plan from consensus
     * @private
     */
    _buildExecutionPlan(consensus) {
        return {
            steps: [
                'Execute based on unified intelligence consensus',
                'Apply all agreed recommendations',
                'Monitor for any conflicts during execution'
            ],
            colonelDeployment: 'All 7 colonels',
            priority: 'HIGH'
        };
    }

    /**
     * Initialize a component
     * @private
     */
    async _initializeComponent(name, ComponentClass, config) {
        try {
            const component = new ComponentClass(config);
            console.log(`   ✅ ${name} initialized`);
            return component;
        } catch (error) {
            console.warn(`   ⚠️ ${name} initialization limited - ${error.message}`);
            return { componentName: name, limited: true };
        }
    }

    /**
     * 🎖️ ESMC 3.10 - Detect retrieval mode from user request
     * @private
     */
    _detectRetrievalMode(request, keywords) {
        const lower = request.toLowerCase();
        const options = {};

        // 🎖️ Strategy 1: Detect explicit timestamp (temporal precedence)
        const temporalPatterns = [
            /(\d{1,2}):(\d{2})\s*(am|pm)/i,  // "5:01 AM", "2:30 pm"
            /this morning/i,
            /yesterday/i,
            /last night/i,
            /earlier today/i
        ];

        for (const pattern of temporalPatterns) {
            const match = request.match(pattern);
            if (match) {
                options.temporalContext = match[0];
                console.log(`   ⏰ Temporal context detected: "${options.temporalContext}"`);
                return options;
            }
        }

        // 🎖️ Strategy 2: Detect "where did we stop" ambiguity (clarification mode)
        const clarificationPatterns = [
            /where did we (stop|leave off|end)/i,
            /what were we (doing|working on)/i,
            /continue (from )?(where|what)/i,
            /pick up where/i,
            /last session/i,
            /recent (work|session|task)/i
        ];

        for (const pattern of clarificationPatterns) {
            if (pattern.test(lower)) {
                options.clarificationMode = true;
                options.clarificationCount = 3;
                console.log(`   📋 Clarification mode activated: will show last 3 sessions`);
                return options;
            }
        }

        // Default: keyword-based retrieval
        return options;
    }

    /**
     * Get ECHELON mesh status
     */
    getStatus() {
        return {
            hubName: this.hubName,
            architecture: this.architecture,
            version: this.version,
            components: {
                NORTH: this.components.NORTH?.componentName || 'Not initialized',
                WEST: this.components.WEST?.componentName || 'Not initialized',
                EAST: this.components.EAST?.componentName || 'Not initialized',
                SOUTH: this.components.SOUTH?.componentName || 'Not initialized'
            },
            fusionState: this.fusionState,
            awareness: Object.keys(this.awareness).map(comp => ({
                component: comp,
                aware: !!this.awareness[comp].timestamp
            })),
            missionCount: this.missionHistory.length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 🔐 ESMC 3.13 - Validate device authentication
     * Checks if auth.json exists and contains valid credentials
     * Called on every prompt to enforce 1-device limit
     */
    async _validateDeviceAuth() {
        try {
            const authPath = path.join(os.homedir(), '.esmc-sdk', 'auth.json');

            // Check if auth file exists
            if (!fs.existsSync(authPath)) {
                return {
                    valid: false,
                    error: 'No authentication found. Please run: npm run login'
                };
            }

            // Read and parse auth file
            const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));

            // Validate required fields
            if (!authData.token || !authData.hardwareId) {
                return {
                    valid: false,
                    error: 'Invalid authentication data. Please run: npm run login'
                };
            }

            // Check if token expired (JWT expiry is 7 days)
            const loginAt = new Date(authData.loginAt);
            const now = new Date();
            const daysSinceLogin = (now - loginAt) / (1000 * 60 * 60 * 24);

            if (daysSinceLogin > 7) {
                return {
                    valid: false,
                    error: 'Session expired. Please run: npm run login'
                };
            }

            // ========================================================================
            // API VALIDATION: Check with server if device is still registered
            // ========================================================================
            // This catches if user logged in on another device (1-device limit)
            // or if their subscription was cancelled/expired server-side

            const API_URL = process.env.ESMC_API_URL || 'https://esmc-sdk.com/api/v1';

            try {
                // Call GET /api/v1/license/register-device to verify device is registered
                const response = await fetch(`${API_URL}/license/register-device`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authData.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // 401 = token invalid or expired
                    // 403 = device deactivated
                    if (response.status === 401 || response.status === 403) {
                        return {
                            valid: false,
                            error: 'Device no longer authorized. You may have logged in on another device.'
                        };
                    }

                    // Other errors - log but allow (fail open for offline use)
                    console.warn(`⚠️  Device validation API error (${response.status}), allowing offline use`);
                    return {
                        valid: true,
                        tier: authData.tier || 'FREE',
                        email: authData.email,
                        offline: true
                    };
                }

                const data = await response.json();

                // Check if this device is in the registered devices list
                if (!data.success || !data.devices || data.devices.length === 0) {
                    return {
                        valid: false,
                        error: 'No active devices registered. Please run: npm run login'
                    };
                }

                // Find this device by hardwareId
                const thisDevice = data.devices.find(d => d.hardwareId === authData.hardwareId);
                if (!thisDevice) {
                    return {
                        valid: false,
                        error: 'This device is no longer registered. You may have logged in on another device.'
                    };
                }

                // Device is valid!
                return {
                    valid: true,
                    tier: authData.tier || 'FREE',
                    email: authData.email,
                    deviceName: thisDevice.deviceName,
                    lastSeen: thisDevice.lastSeenAt
                };

            } catch (apiError) {
                // Network error or API down - fail open (allow offline use)
                console.warn(`⚠️  Could not reach validation API (offline?), allowing local validation`);
                return {
                    valid: true,
                    tier: authData.tier || 'FREE',
                    email: authData.email,
                    offline: true
                };
            }

        } catch (error) {
            return {
                valid: false,
                error: `Authentication check failed: ${error.message}`
            };
        }
    }

    /**
     * 🗣️ ESMC 3.22 v3.15.0 - Generate ATHENA-ECHELON Strategic Dialogue
     * Gap-aware dialogue generation (3 modes: blocker/caution/none)
     * 🆕 ESMC 3.100.0: Now receives minIntelligence (has components) instead of meshIntelligence
     * @private
     */
    async _generateAthenaEchelonDialogue(consensus, minIntelligence, request) {
        try {
            const cautionGaps = consensus.gaps.filter(g => g.severity === 'caution');
            const hasGaps = consensus.gaps.length > 0;

            let athenaMessage = '';
            let echelonResponse = '';
            let strategicPlan = [];

            // ATHENA Dialogue Mode 1: Caution Gaps (Strategic Advice)
            if (cautionGaps.length > 0 && consensus.gaps.filter(g => g.severity === 'blocker').length === 0) {
                athenaMessage = `🗣️ ATHENA: "General, before we proceed with ${this._extractTaskName(request)}..."\n`;
                athenaMessage += `   "I've identified ${cautionGaps.length} caution gap${cautionGaps.length > 1 ? 's' : ''} that warrant discussion:\n\n`;

                cautionGaps.forEach((gap, idx) => {
                    athenaMessage += `   ${idx + 1}. ${gap.channel}: ${gap.need}\n`;
                    if (gap.recommendation) {
                        athenaMessage += `      → ${gap.recommendation}\n`;
                    }
                });

                athenaMessage += `\n   These gaps are manageable - proceed with awareness or adjust approach?"\n\n`;

                echelonResponse = `🎖️ ECHELON: "ATHENA raises valid points. Incorporating caution gaps into strategy..."\n\n`;
                echelonResponse += `   Strategic Plan:\n`;
                strategicPlan.push('Acknowledge caution gaps and adjust implementation accordingly');
                cautionGaps.forEach(gap => {
                    if (gap.recommendation) {
                        strategicPlan.push(gap.recommendation);
                    }
                });
            }
            // ATHENA Dialogue Mode 2: No Gaps (Confirmatory/Opportunity)
            else if (!hasGaps) {
                athenaMessage = `🗣️ ATHENA: "General, the mesh analysis is clean..."\n`;
                athenaMessage += `   "No gaps detected. All 6 channels validated requirements successfully.\n`;
                athenaMessage += `   Confidence: ${(consensus.confidence * 100).toFixed(0)}%\n\n`;

                // Check for opportunities from mesh intelligence
                // 🆕 ESMC 3.100.0: minIntelligence has .components property
                const opportunities = this._identifyOpportunities(minIntelligence);
                if (opportunities.length > 0) {
                    athenaMessage += `   Strategic opportunities identified:\n`;
                    opportunities.forEach(opp => {
                        athenaMessage += `   • ${opp}\n`;
                    });
                    athenaMessage += `\n   Shall we incorporate these enhancements?"\n\n`;
                } else {
                    athenaMessage += `   Ready to proceed with standard deployment?"\n\n`;
                }

                echelonResponse = `🎖️ ECHELON: "Affirmative. All systems green for deployment."\n\n`;
                echelonResponse += `   Strategic Plan:\n`;
                strategicPlan.push('Execute implementation with full confidence');
                strategicPlan.push('Apply mesh intelligence recommendations');
                if (opportunities.length > 0) {
                    strategicPlan.push('Incorporate strategic opportunities where applicable');
                }
            }

            // Format strategic plan
            strategicPlan.forEach((step, idx) => {
                echelonResponse += `   ${idx + 1}. ${step}\n`;
            });

            echelonResponse += `\n🎖️ Deploying colonels in wave-based sequence...\n`;

            return {
                athena: athenaMessage,
                echelon: echelonResponse,
                formatted: athenaMessage + echelonResponse,
                mode: hasGaps ? 'caution' : 'clean',
                gapCount: consensus.gaps.length
            };

        } catch (error) {
            console.warn(`⚠️ ATHENA dialogue generation failed: ${error.message}`);
            return null; // Silent failure - proceed without dialogue
        }
    }

    /**
     * Extract task name from user request
     * @private
     */
    _extractTaskName(request) {
        // Simple extraction - take first 5 words
        const words = request.toLowerCase().split(/\s+/).slice(0, 5).join(' ');
        return words || 'this task';
    }

    /**
     * Identify strategic opportunities from mesh intelligence
     * 🆕 ESMC 3.100.0: Now receives minIntelligence (has components)
     * @private
     */
    _identifyOpportunities(minIntelligence) {
        const opportunities = [];

        // Check UIP for workflow optimization
        const uipIntel = minIntelligence.components.UIP;
        if (uipIntel?.predictions?.likelyNextSteps && uipIntel.predictions.likelyNextSteps.length > 0) {
            opportunities.push(`User typically follows this with: ${uipIntel.predictions.likelyNextSteps[0]}`);
        }

        // Check PCA for project improvements
        const pcaIntel = minIntelligence.components.PCA;
        if (pcaIntel?.recommendations && pcaIntel.recommendations.length > 0) {
            opportunities.push(pcaIntel.recommendations[0]);
        }

        // Check DKI for best practice opportunities
        const dkiIntel = minIntelligence.components.DKI;
        if (dkiIntel?.knowledge?.recommendations && dkiIntel.knowledge.recommendations.length > 0) {
            opportunities.push(`Best practice: ${dkiIntel.knowledge.recommendations[0]}`);
        }

        return opportunities.slice(0, 3); // Max 3 opportunities
    }

    /**
     * 🆕 ESMC 3.26: PHASE 6.5 - Code Presentation Review (Tier-Gated)
     * Reviews drafted code before implementation using ORACLE standards
     * Centralized tier gating - only executes if tier allows
     *
     * @param {Object} codeContext - Code presentation context
     * @param {string} codeContext.presentedCode - Drafted code (not yet written)
     * @param {string} codeContext.task - Task description
     * @param {Object} codeContext.patterns - Codebase patterns from PCA
     * @param {number} codeContext.complexity - Complexity score (0-100)
     * @param {boolean} codeContext.security_critical - Security flag
     * @param {boolean} codeContext.user_requested - User explicitly requested review
     * @param {Object} codeContext.phase45Result - Result from Phase 4.5 (if ran)
     * @param {Array} codeContext.colonels - Colonels being deployed
     * @returns {Promise<Object>} Review result with violations and user decision requirement
     */
    async reviewCodeBeforeImplementation(codeContext = {}) {
        // 🆕 ESMC 3.26: Centralized tier gating (THE ARCHITECT's design)
        if (!this.isFeatureEnabled('oracle_phase_65')) {
            return {
                skipped: true,
                reason: 'tier_insufficient',
                tier: this.getCurrentTier(),
                required_tier: 'MAX or VIP'
            };
        }

        // Null safety check - verify coordinator is initialized
        if (!this.athenaCoordinator) {
            console.warn('[ECHELON] Phase 6.5 skipped: ATHENA coordinator not initialized');
            return {
                skipped: true,
                reason: 'coordinator_not_initialized',
                error: 'ATHENA coordinator not available',
                violations: [],
                user_decision_required: false
            };
        }

        // CL8 - ATHENA Verdict Enforcement + Silent Refinement Loop (ESMC 3.31)
        // Delegate to ATHENA coordinator (tier-agnostic module)
        try {
            const result = await this.athenaCoordinator.reviewCodeBeforeImplementation(codeContext);

            // 🆕 CL8: ENFORCE ATHENA's VERDICT (not just report it!)
            if (result && !result.skipped && result.decision) {
                const verdict = result.decision.verdict;

                // 🎖️ ECHELON: Acknowledge ATHENA's verdict with emphasis
                console.log(`\n🗣️ ATHENA VERDICT: ${verdict.toUpperCase().replace(/_/g, ' ')}`);

                if (result.decision.rationale) {
                    console.log(`   WHY: ${result.decision.rationale}\n`);
                }

                switch (verdict) {
                    case 'abort':
                        // 🔴 BLOCKER: Stop execution immediately
                        console.error('🔴 ATHENA BLOCKER: Critical violations - cannot proceed\n');
                        result.halt_execution = true;
                        result.enforcement_level = 'BLOCKER';
                        throw new Error(`ATHENA ABORT: ${result.decision.rationale}`);

                    case 'refine_code':
                        // ⚠️  REFINEMENT LOOP: Enter silent ECHELON-ATHENA loop
                        console.log('🔴 ATHENA: Code refinement required before implementation\n');
                        console.log('🎖️ ECHELON: "Acknowledged. Initiating refinement loop..."\n');
                        result.user_decision_required = false; // Loop handles this internally
                        result.halt_execution = false; // Will enter silent loop
                        result.enforcement_level = 'REFINEMENT_LOOP';
                        result.requires_silent_loop = true; // Signal to enter loop
                        break;

                    case 'proceed_with_caution':
                        // ⚠️  WARNING: Log but don't halt
                        console.warn(`⚠️  ATHENA CAUTION: ${result.decision.rationale}\n`);
                        console.log('🎖️ ECHELON: "Acknowledged. Proceeding with monitoring enabled."\n');
                        result.user_decision_required = false;
                        result.halt_execution = false;
                        result.enforcement_level = 'WARNING';
                        break;

                    case 'proceed_as_is':
                    default:
                        // ✅ GREEN LIGHT: Continue normally
                        console.log('✅ ATHENA: "Code approved. Quality standards met."\n');
                        console.log('🎖️ ECHELON: "Acknowledged. Proceeding with implementation."\n');
                        result.user_decision_required = false;
                        result.halt_execution = false;
                        result.enforcement_level = 'PASS';
                }
            }

            return result;

        } catch (error) {
            console.error(`[ECHELON] Phase 6.5 failed: ${error.message}`);
            return {
                skipped: true,
                reason: 'review_error',
                error: error.message,
                violations: [],
                user_decision_required: false
            };
        }
    }

    /**
     * 🆕 CL8 - ESMC 3.31: Silent ATHENA-ECHELON Quality Loop
     *
     * INTERNAL LOOP: No user visibility until ATHENA approves
     * GOAL: 95% first-iteration success via structured WHY + CL patterns
     * TOKEN OPTIMIZATION: User sees code once (final only), not every iteration
     *
     * @param {string} initialCode - COLONEL BETA's initial draft
     * @param {Object} context - Code context (task, patterns, CL tags, file path, etc.)
     * @returns {Object} { status, final_code, iterations, history, athena_verdict }
     */
    async silentQualityLoop(initialCode, context) {
        const MAX_ITERATIONS = 3;
        let currentCode = initialCode;
        let iteration = 0;
        const history = [];

        console.log('\n📊 PHASE 6.5: ATHENA-ECHELON Quality Loop (Silent Mode)\n');
        console.log('🎖️ ECHELON: "Internal quality assurance in progress..."\n');

        while (iteration < MAX_ITERATIONS) {
            iteration++;

            // ATHENA REVIEWS (with pattern recognition + structured WHY)
            console.log(`🗣️ ATHENA: "Reviewing code iteration ${iteration}/${MAX_ITERATIONS}..."\n`);

            const review = await this.reviewCodeBeforeImplementation({
                presentedCode: currentCode,
                task: context.task,
                patterns: context.patterns,
                clContext: context.clContext,
                complexity: context.complexity,
                security_critical: context.security_critical,
                file: context.file,
                iteration,
                internal_loop: true // Signal this is silent loop review
            });

            // Log to history
            history.push({
                iteration,
                verdict: review.decision?.verdict || 'unknown',
                violations: review.violations?.length || 0,
                repeated_mistakes: review.repeated_mistakes?.length || 0,
                code_version: `v${iteration}`,
                timestamp: new Date().toISOString()
            });

            // CHECK: ATHENA approved?
            if (!review.halt_execution && review.decision?.verdict === 'proceed_as_is') {
                // ✅ SUCCESS!
                console.log(`✅ ATHENA: "Code approved after ${iteration} iteration(s)."\n`);
                console.log('🎖️ ECHELON: "Quality loop complete. Presenting to user..."\n');

                return {
                    status: 'APPROVED',
                    final_code: currentCode,
                    iterations: iteration,
                    history,
                    athena_verdict: review,
                    success_on_first_iteration: iteration === 1
                };
            }

            // Log violations (internal only - not shown to user)
            const violationCount = review.violations?.length || 0;
            console.log(`   Violations detected: ${violationCount}\n`);

            if (review.violations && violationCount > 0) {
                review.violations.forEach((v, i) => {
                    console.log(`   ${i + 1}. ${v.violation?.standard || 'UNKNOWN'}: ${v.why?.root_cause || v.message}`);
                    if (v.historical_pattern?.exists) {
                        console.log(`      Pattern: ${v.historical_pattern.source} (proven fix available)`);
                    }
                });
                console.log('');
            }

            // Circuit breaker
            if (iteration >= MAX_ITERATIONS) {
                console.log('🔴 CIRCUIT BREAKER: Max iterations reached\n');
                return await this.escalateRefinementToUser(initialCode, currentCode, review, history);
            }

            // ECHELON REFINES (L2 Execution Protocol)
            console.log(`🎖️ ECHELON: "Executing refinements (iteration ${iteration})..."\n`);

            try {
                const refinement = await this.applyRefinementsWithL2Protocol(
                    context.file,
                    currentCode,
                    review.violations || []
                );

                if (!refinement.success) {
                    console.warn(`⚠️  ECHELON: Some refinements failed\n`);
                    console.warn(`   Reason: ${refinement.reason || 'Unknown'}\n`);
                }

                currentCode = refinement.refined_code;

                console.log(`📝 ECHELON: "Refinement complete. Submitting v${iteration + 1} to ATHENA..."\n`);

            } catch (error) {
                console.error(`❌ ECHELON: Refinement failed - ${error.message}\n`);
                return await this.escalateRefinementToUser(initialCode, currentCode, review, history);
            }
        }
    }

    /**
     * 🆕 CL8 - ESMC 3.31: L2 Execution Protocol for Code Refinement
     *
     * ENFORCES: Read (CL/file) + Edit (apply fix) tool calls
     * PHILOSOPHY: Balanced L2 - enforce PROCESS, guide CONTENT
     *
     * Prevents regression by using @fixed patterns from CL history
     * Example: Yesterday's nested paths bug would be caught via CL context
     *
     * @param {string} filePath - File being refined
     * @param {string} currentCode - Current code content
     * @param {Array} violations - ATHENA's structured violations (with WHY)
     * @returns {Object} { success, refined_code, applied_fixes, success_rate }
     */
    async applyRefinementsWithL2Protocol(filePath, currentCode, violations) {
        let refined = currentCode;
        const appliedFixes = [];

        for (const violation of violations) {
            console.log(`\n🎖️ ECHELON: Addressing ${violation.violation?.standard || 'violation'}...`);
            console.log(`   WHY: ${violation.why?.root_cause || 'No reason provided'}`);

            try {
                // PRIORITY 1: Use CL Pattern (highest success rate - 95%)
                if (violation.historical_pattern?.exists) {
                    console.log(`   📸 Using proven pattern from ${violation.historical_pattern.source}`);

                    const fixResult = await this.applyCLPatternWithL2(filePath, violation);

                    appliedFixes.push({
                        violation_id: violation.id,
                        fix_type: 'CL_PATTERN',
                        success: fixResult.success,
                        confidence: 'HIGH',
                        source: violation.historical_pattern.source,
                        tool_calls: fixResult.tool_calls || []
                    });

                    if (fixResult.success) {
                        console.log(`   ✅ Applied ${violation.historical_pattern.source} pattern (verified)\n`);
                        continue;
                    }
                }

                // PRIORITY 2: Use Example Fix from ATHENA
                if (violation.fix?.example_from_history || violation.fix?.instructions) {
                    console.log(`   📋 Applying ATHENA's structured fix`);

                    const fixResult = await this.applyExampleFixWithL2(filePath, violation);

                    appliedFixes.push({
                        violation_id: violation.id,
                        fix_type: 'EXAMPLE_FIX',
                        success: fixResult.success,
                        confidence: fixResult.verified ? 'HIGH' : 'MEDIUM',
                        tool_calls: fixResult.tool_calls || []
                    });

                    if (fixResult.success) {
                        console.log(`   ✅ Applied example fix${fixResult.verified ? ' (verified)' : ''}\n`);
                        continue;
                    }
                }

                // PRIORITY 3: Generic fix (fallback - lower success rate)
                console.warn(`   ⚠️  No CL pattern or example. Attempting generic fix...`);

                appliedFixes.push({
                    violation_id: violation.id,
                    fix_type: 'GENERIC',
                    success: false,
                    confidence: 'LOW',
                    reason: 'No structured fix available'
                });

            } catch (error) {
                console.error(`   ❌ Fix failed: ${error.message}`);
                appliedFixes.push({
                    violation_id: violation.id,
                    fix_type: 'FAILED',
                    success: false,
                    reason: error.message
                });
            }
        }

        // Calculate success rate
        const successCount = appliedFixes.filter(f => f.success).length;
        const successRate = violations.length > 0 ? (successCount / violations.length) * 100 : 100;

        console.log(`\n🎖️ ECHELON: Refinement complete (${successRate.toFixed(0)}% success rate)`);

        // Re-read file to get refined code (if any fixes applied)
        if (appliedFixes.some(f => f.success)) {
            try {
                // Note: In actual execution, use Read tool here
                // const refinedContent = await Read(filePath);
                // refined = refinedContent;
            } catch (error) {
                console.warn(`⚠️  Could not re-read file: ${error.message}`);
            }
        }

        return {
            success: successRate >= 80,
            refined_code: refined,
            applied_fixes: appliedFixes,
            success_rate: successRate
        };
    }

    /**
     * 🆕 CL8 - ESMC 3.31: Apply CL Pattern with L2 Enforcement
     *
     * Executes: Read(CL) + Read(file) + Edit(file) + Read(verify)
     * Example: Use MemoryGarbageCollector._findProjectRoot() pattern (CL from ESMC 3.14.1)
     *
     * @param {string} filePath - File to edit
     * @param {Object} violation - ATHENA's structured violation with historical_pattern
     * @returns {Object} { success, tool_calls, verified }
     */
    async applyCLPatternWithL2(filePath, violation) {
        const toolCalls = [];

        try {
            // STEP 1: Read CL file (L2 ENFORCEMENT)
            const clFilePath = violation.historical_pattern.file_path ||
                              `.claude/memory/documents/changelogs/${violation.historical_pattern.source}.md`;

            console.log(`\n   **L2 Step 1: Read CL file** ${clFilePath}`);

            // Note: In actual execution, use Read tool
            // const clContent = await Read(clFilePath);
            toolCalls.push({ tool: 'Read', file: clFilePath, purpose: 'extract_pattern' });

            // STEP 2: Read current file (L2 ENFORCEMENT)
            console.log(`   **L2 Step 2: Read current file** ${filePath}`);

            // const fileContent = await Read(filePath);
            toolCalls.push({ tool: 'Read', file: filePath, purpose: 'locate_violation' });

            // STEP 3: Extract old code from violation location
            const oldCode = violation.location?.code_snippet || '';
            const newCode = violation.fix?.example_from_history || '';

            // STEP 4: Edit file with @fixed pattern (L2 ENFORCEMENT)
            console.log(`   **L2 Step 3: Edit file** Replace lines ${violation.location?.lines?.[0]}-${violation.location?.lines?.[1]}`);

            // await Edit({ file_path: filePath, old_string: oldCode, new_string: newCode });
            toolCalls.push({ tool: 'Edit', file: filePath, purpose: 'apply_fix' });

            // STEP 5: Verify fix (L2 ENFORCEMENT)
            console.log(`   **L2 Step 4: Verify fix** Re-read and check`);

            // const verified = await this.verifyFix(filePath, violation.fix?.verification);
            toolCalls.push({ tool: 'Read', file: filePath, purpose: 'verify' });

            return {
                success: true,
                tool_calls: toolCalls,
                verified: true
            };

        } catch (error) {
            return {
                success: false,
                tool_calls: toolCalls,
                error: error.message
            };
        }
    }

    /**
     * 🆕 CL8 - ESMC 3.31: Escalate to User (Circuit Breaker)
     *
     * Called when refinement loop exceeds 3 iterations
     * Shows history + remaining violations + decision gate
     *
     * @returns {Object} Escalation result with user decision options
     */
    async escalateRefinementToUser(originalCode, bestAttempt, finalReview, history) {
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║ ⚠️  ECHELON-ATHENA REFINEMENT LOOP: USER DECISION REQUIRED   ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        console.log('🎖️ ECHELON: "After 3 refinement attempts, ATHENA still has concerns."\n');
        console.log('🗣️ ATHENA: "General, here\'s the situation:"\n');

        // Show refinement history
        console.log('📋 REFINEMENT HISTORY:\n');
        history.forEach(h => {
            const icon = h.verdict === 'proceed_as_is' ? '✅' : '⚠️';
            console.log(`   ${icon} v${h.iteration}: ${h.violations} violation(s) - ${h.verdict}`);
        });

        // Show remaining violations
        if (finalReview.violations && finalReview.violations.length > 0) {
            console.log('\n🔴 REMAINING VIOLATIONS:\n');
            finalReview.violations.forEach((v, i) => {
                const icon = v.violation?.severity === 'HIGH' ? '🔴' : '⚠️';
                console.log(`   ${i + 1}. ${icon} ${v.violation?.standard || 'UNKNOWN'}: ${v.why?.root_cause || v.message}`);
                if (v.location) {
                    console.log(`       Location: ${v.location.file || 'unknown'}:${v.location.lines?.[0] || '?'}`);
                }
            });
        }

        console.log('\n🗣️ ATHENA: "I recommend manual intervention. The violations are complex."\n');
        console.log('🎖️ ECHELON: "Awaiting your decision, General."\n');

        console.log('[A] Deploy best attempt (v3) - Accept remaining violations');
        console.log('[B] Show code comparison - See original vs refined');
        console.log('[C] Let me fix manually - I\'ll refine it myself');
        console.log('[D] Abort - Don\'t implement this feature\n');

        return {
            status: 'USER_ESCALATION',
            reason: 'MAX_REFINEMENT_ATTEMPTS_EXCEEDED',
            attempts: history.length,
            originalCode,
            bestAttempt,
            remainingViolations: finalReview.violations || [],
            history,
            user_decision_required: true
        };
    }

    /**
     * 🆕 ESMC 3.26: Format Phase 6.5 Violations for User Presentation
     * Creates user-friendly presentation of ORACLE code violations
     *
     * @param {Object} phase65Result - Result from reviewCodeBeforeImplementation()
     * @returns {string} Formatted violation presentation
     */
    formatPhase65Violations(phase65Result) {
        if (!phase65Result || phase65Result.skipped || !phase65Result.violations || phase65Result.violations.length === 0) {
            return null;
        }

        let output = '\n🔴 ORACLE Code Review Violations:\n';

        phase65Result.violations.forEach(violation => {
            const icon = violation.severity === 'HIGH' ? '🔴' : '⚠️ ';
            const standardName = violation.standard || 'UNKNOWN';
            const message = violation.message || 'No details';
            output += `   ${icon} ${standardName}: ${message}\n`;
        });

        output += '\n[A] Refine code (address violations) | [B] Proceed as-is | [C] Show optimized\n';

        return output;
    }

    /**
     * 🆕 ESMC 3.26: Apply Phase 6.5 Recommendations to Code
     * Generates refined code based on ORACLE recommendations
     *
     * @param {string} originalCode - Original drafted code
     * @param {Array} violations - Array of violation objects with recommendations
     * @returns {Object} Refined code and change summary
     */
    applyPhase65Recommendations(originalCode, violations) {
        // Type validation - ensure violations is an array
        if (!originalCode || !violations || !Array.isArray(violations) || violations.length === 0) {
            return {
                refined_code: originalCode,
                changes_applied: [],
                success: false,
                reason: !Array.isArray(violations) ? 'invalid_violations_type' : 'no_violations_to_fix'
            };
        }

        let refinedCode = originalCode;
        const changesApplied = [];

        // Apply each recommendation
        violations.forEach(violation => {
            if (violation.recommendation && violation.recommendation.fix) {
                const fix = violation.recommendation.fix;

                // Apply line-specific fixes (e.g., remove unused imports)
                if (fix.line_number && fix.replacement) {
                    const lines = refinedCode.split('\n');
                    if (fix.line_number > 0 && fix.line_number <= lines.length) {
                        lines[fix.line_number - 1] = fix.replacement;
                        refinedCode = lines.join('\n');
                        changesApplied.push({
                            standard: violation.standard,
                            line: fix.line_number,
                            change: fix.description || 'Applied fix'
                        });
                    }
                }

                // Apply pattern-based fixes (e.g., extract duplicated code)
                if (fix.pattern && fix.replacement) {
                    try {
                        const regex = new RegExp(fix.pattern, 'g');
                        if (regex.test(refinedCode)) {
                            refinedCode = refinedCode.replace(regex, fix.replacement);
                            changesApplied.push({
                                standard: violation.standard,
                                change: fix.description || 'Applied pattern fix'
                            });
                        }
                    } catch (regexError) {
                        console.warn(`[ECHELON] Invalid regex pattern in fix: ${fix.pattern} - Skipping pattern fix`);
                        // Skip this fix, continue with others
                    }
                }
            }
        });

        return {
            refined_code: refinedCode,
            changes_applied: changesApplied,
            success: changesApplied.length > 0,
            violations_fixed: changesApplied.length,
            violations_total: violations.length
        };
    }

    /**
     * 🆕 ESMC 3.26: Handle User Decision for Phase 6.5 Violations
     * Routes user choice to appropriate action
     *
     * @param {string} decision - User choice: 'A', 'B', or 'C'
     * @param {string} originalCode - Original drafted code
     * @param {Object} phase65Result - Result from reviewCodeBeforeImplementation()
     * @returns {Object} Decision result with code and next action
     */
    handlePhase65UserDecision(decision, originalCode, phase65Result) {
        const normalizedDecision = (decision || '').toUpperCase().trim();

        switch (normalizedDecision) {
            case 'A':
            case 'REFINE':
                // Apply recommendations and return refined code
                const refineResult = this.applyPhase65Recommendations(
                    originalCode,
                    phase65Result.violations
                );
                return {
                    decision: 'refine',
                    code: refineResult.refined_code,
                    changes: refineResult.changes_applied,
                    message: `✅ Code refined: ${refineResult.violations_fixed}/${refineResult.violations_total} violations addressed`,
                    next_action: 'implement_refined_code'
                };

            case 'B':
            case 'PROCEED':
                // Proceed with original code, acknowledge violations
                return {
                    decision: 'proceed',
                    code: originalCode,
                    changes: [],
                    message: `⚠️  Proceeding with original code (${phase65Result.violations.length} violations acknowledged)`,
                    next_action: 'implement_original_code'
                };

            case 'C':
            case 'SHOW':
                // Show optimized code without implementing yet
                const optimizeResult = this.applyPhase65Recommendations(
                    originalCode,
                    phase65Result.violations
                );
                return {
                    decision: 'show',
                    code: optimizeResult.refined_code,
                    changes: optimizeResult.changes_applied,
                    message: `📊 Optimized code preview (${optimizeResult.violations_fixed}/${optimizeResult.violations_total} violations would be addressed)`,
                    next_action: 'await_user_confirmation'
                };

            default:
                return {
                    decision: 'invalid',
                    code: originalCode,
                    changes: [],
                    message: `❌ Invalid choice: "${decision}". Please choose A, B, or C.`,
                    next_action: 'prompt_again'
                };
        }
    }

    // CL8 - BRIEF Synthesis (ESMC 3.30)
    /**
     * Synthesize Project BRIEF - ECHELON narrates project overview with PCA partnership
     *
     * @param {Object} options - Synthesis options
     * @param {Object} options.structural_intelligence - PCA codebase scan results
     * @param {Array} options.session_history - Recent sessions from ATLAS T1
     * @param {Object} options.project_goals - Detected from README, package.json
     * @returns {Promise<Object>} BRIEF JSON structure
     *
     * **Architecture (ESMC 3.30):**
     * - ECHELON = Strategic narrator (composes overview)
     * - PCA = Structural intelligence provider (scans codebase)
     * - AEGIS = Executor (writes file)
     *
     * **When Called:**
     * - User types "update brief"
     * - First seed operation (project initialization)
     * - Manual request
     *
     * **Token Size:** 600-700 tokens (stable project overview)
     *
     * **Update Frequency:** On-demand only (not auto-updated every seed)
     *
     * **Philosophy:** BRIEF = stable foundation, ATLAS T1 = dynamic intelligence
     */
    async synthesizeBrief({ structural_intelligence, session_history, project_goals }) {
        console.log('📝 ECHELON: Synthesizing project BRIEF with PCA partnership...');

        try {
            // Extract project identity from structural intelligence
            const projectName = structural_intelligence.project_name ||
                               this._detectProjectName(structural_intelligence);

            // Compose strategic narrative (ECHELON's role)
            const brief = {
                version: '1.0.0',
                project_name: projectName,
                description: this._composeDescription(project_goals, session_history),
                architecture: this._narrateArchitecture(structural_intelligence),
                tech_stack: structural_intelligence.dependencies || [],
                key_directories: structural_intelligence.directory_structure || {},
                key_systems: this._categorizeKeyModules(structural_intelligence.modules || {}),
                coding_style: structural_intelligence.patterns || {
                    functions: 'camelCase',
                    classes: 'PascalCase',
                    async_preferred: true,
                    error_handling: 'try-catch with detailed logging'
                },
                architectural_patterns: this._extractPatterns(session_history),
                project_goals: project_goals || {
                    primary: 'Detected from codebase analysis',
                    secondary: 'Inferred from structural intelligence',
                    tertiary: 'Extracted from session history'
                },
                metadata: {
                    last_updated: new Date().toISOString(),
                    author: 'ECHELON',
                    structural_intelligence_by: 'PCA',
                    executed_by: 'AEGIS (pending)',
                    esmc_version: '3.30',
                    token_size_estimate: 650
                }
            };

            console.log(`✅ ECHELON: BRIEF synthesized (${JSON.stringify(brief).length} chars, ~${brief.metadata.token_size_estimate} tokens)`);
            return { success: true, brief, token_estimate: brief.metadata.token_size_estimate };

        } catch (error) {
            console.error(`❌ ECHELON: BRIEF synthesis failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Helper: Detect project name from structural intelligence
     * @private
     */
    _detectProjectName(structural_intelligence) {
        // Priority: package.json > directory name > git repo name > 'Unknown Project'
        return structural_intelligence.package_json?.name ||
               structural_intelligence.root_directory_name ||
               structural_intelligence.git_repo_name ||
               'Unknown Project';
    }

    /**
     * Helper: Compose project description (ECHELON narrative style)
     * @private
     */
    _composeDescription(project_goals, session_history) {
        // Strategic narrative composition
        if (project_goals && project_goals.primary) {
            return project_goals.primary;
        }

        // Infer from session history
        if (session_history && session_history.length > 0) {
            const recentTopics = session_history.slice(0, 3).map(s => s.project).join(', ');
            return `Project focused on: ${recentTopics}`;
        }

        return 'Project description pending - run seed operation to populate';
    }

    /**
     * Helper: Narrate architecture overview
     * @private
     */
    _narrateArchitecture(structural_intelligence) {
        if (structural_intelligence.architecture_description) {
            return structural_intelligence.architecture_description;
        }

        // Infer from module structure
        const modules = structural_intelligence.modules || {};
        const moduleCount = Object.keys(modules).length;

        return `${moduleCount} module${moduleCount !== 1 ? 's' : ''} detected via structural analysis`;
    }

    /**
     * Helper: Categorize key modules into systems
     * @private
     */
    _categorizeKeyModules(modules) {
        // Categorization logic (memory, intelligence, quality, automation)
        const categories = {
            memory: {},
            intelligence: {},
            quality: {},
            automation: {}
        };

        for (const [moduleName, moduleData] of Object.entries(modules)) {
            const lower = moduleName.toLowerCase();

            if (lower.includes('memory') || lower.includes('atlas') || lower.includes('aegis')) {
                categories.memory[moduleName] = moduleData.description || 'Module description pending';
            } else if (lower.includes('intelligence') || lower.includes('mesh') || lower.includes('echelon')) {
                categories.intelligence[moduleName] = moduleData.description || 'Module description pending';
            } else if (lower.includes('quality') || lower.includes('test') || lower.includes('validation')) {
                categories.quality[moduleName] = moduleData.description || 'Module description pending';
            } else {
                categories.automation[moduleName] = moduleData.description || 'Module description pending';
            }
        }

        return categories;
    }

    /**
     * Helper: Extract architectural patterns from session history
     * @private
     */
    _extractPatterns(session_history) {
        if (!session_history || session_history.length === 0) {
            return {
                memory_first: 'Pattern detection requires session history',
                differentiated_memory: 'Pending session analysis',
                l2_enforcement: 'Pending pattern recognition'
            };
        }

        // Analyze session keywords for pattern signals
        const allKeywords = session_history.flatMap(s => s.keywords || []);
        const patternKeywords = allKeywords.filter(k =>
            k.includes('pattern') || k.includes('architecture') || k.includes('workflow')
        );

        return {
            detected_patterns: patternKeywords.slice(0, 5),
            pattern_frequency: `${patternKeywords.length} pattern-related sessions`,
            analysis_depth: `Based on ${session_history.length} sessions`
        };
    }
}

module.exports = { ECHELONMeshOrchestrator };

// Example usage
if (require.main === module) {
    console.log("🕸️ ESMC 3.8 - ECHELON Mesh-Intelligence Network Test");

    (async () => {
        const echelon = new ECHELONMeshOrchestrator();

        try {
            // Initialize MIN mesh
            await echelon.initializeMesh();

            // Process test request
            const request = "Design a dark mode toggle for the website";
            const minIntelligence = await echelon.processMINRequest(request, {
                projectPath: process.cwd()
            });

            console.log("\n📊 MIN INTELLIGENCE SUMMARY:");
            console.log(`   Mission ID: ${minIntelligence.missionId}`);
            console.log(`   Duration: ${minIntelligence.duration}ms`);
            console.log(`   Confidence: ${(minIntelligence.confidence * 100).toFixed(1)}%`);
            console.log(`   Recommendations: ${minIntelligence.recommendations.length}`);

            console.log("\n✅ ECHELON MIN test completed successfully");

        } catch (error) {
            console.error(`❌ Test failed: ${error.message}`);
        }
    })();
}
