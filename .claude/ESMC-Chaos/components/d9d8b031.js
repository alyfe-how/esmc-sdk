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
/**
 * ESMC 3.71.0 - PROJECT MODUS OPERANDI (PMO) GENERATOR
 * ═══════════════════════════════════════════════════════════════════════
 * 🎖️ ECHELON CHERRY-PICKING + RULE-OF-THUMB CONCISION SYSTEM
 *
 * Purpose:
 * - Generates project-level standards constitution (.esmc-project-modus-operandi.json)
 * - ECHELON cherry-picks 5 standards (1 per category from 70 total)
 * - Claude concises each standard into actionable "rule of thumb" (20-50 lines)
 * - Saves PMO file as project's permanent standards constitution
 *
 * Architecture:
 * - Analyzes project codebase via ATLAS context
 * - Domain-aware selection (HEALTHCARE→HIPAA, FINANCE→PCI_DSS, etc.)
 * - Context-aware selection (hasAPI→REST, hasDatabase→ACID, etc.)
 * - Category-based distribution (Architecture, Code Quality, Security, Testing, Operations)
 *
 * ESMC Version: 3.71.0 (PMO Architecture)
 * Created: 2025-11-07
 * Author: ECHELON
 * Status: PRODUCTION READY
 */

const fs = require('fs');
const path = require('path');

/**
 * PMO Generator - Project Modus Operandi Architecture
 */
class PMOGenerator {
    constructor() {
        this.version = "1.0.0";
        this.esmcVersion = "3.71.0";

        // Standards Registry Integration
        const StandardsRegistry = require('./bf98e40d.js').StandardsRegistry;
        this.standardsRegistry = new StandardsRegistry();

        // ATLAS Integration for codebase analysis
        this.atlasPath = path.join(__dirname, '../../../.claude/memory/.atlas-index.json');

        // 5 Category Framework
        this.categories = {
            architecture: {
                name: 'Architecture & Design',
                description: 'Structural patterns, scalability, system design',
                standards_count: 16
            },
            code_quality: {
                name: 'Code Quality & Practices',
                description: 'Code cleanliness, maintainability, best practices',
                standards_count: 12
            },
            security: {
                name: 'Security & Compliance',
                description: 'Security controls, compliance requirements, data protection',
                standards_count: 20
            },
            testing: {
                name: 'Testing & QA',
                description: 'Test coverage, quality assurance, validation',
                standards_count: 11
            },
            operations: {
                name: 'Operations & Delivery',
                description: 'Deployment, monitoring, DevOps practices',
                standards_count: 9
            }
        };
    }

    /**
     * Generate PMO - Main entry point
     * @param {string} projectRoot - Project root directory
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated PMO object
     */
    async generatePMO(projectRoot = process.cwd(), options = {}) {
        console.log('🎖️ ECHELON: Initializing Project Modus Operandi generation...');
        console.log(`   Project Root: ${projectRoot}`);

        try {
            // STEP 1: Analyze project context
            console.log('\n🔍 STEP 1: Analyzing project codebase context...');
            const projectContext = await this.analyzeProject(projectRoot);
            console.log(`   ✅ Project analyzed:`);
            console.log(`      - Domain: ${projectContext.domain || 'GENERAL'}`);
            console.log(`      - Has API: ${projectContext.hasAPI}`);
            console.log(`      - Has Database: ${projectContext.hasDatabase}`);
            console.log(`      - Has Authentication: ${projectContext.hasAuth}`);
            console.log(`      - Files analyzed: ${projectContext.filesAnalyzed || 0}`);

            // STEP 2: ECHELON cherry-picks 5 standards (1 per category)
            console.log('\n🍒 STEP 2: ECHELON cherry-picking 5 essential standards...');
            const selectedStandards = this.cherryPickStandards(projectContext);
            console.log(`   ✅ Standards selected:`);
            selectedStandards.forEach((std, idx) => {
                console.log(`      ${idx+1}. [${std.category}] ${std.name} (${std.id})`);
            });

            // STEP 3: Concise each standard into "rule of thumb"
            console.log('\n📝 STEP 3: Concising standards into actionable rules of thumb...');
            const ruleMO = await this.conciseStandards(selectedStandards);
            console.log(`   ✅ All 5 standards concised (20-50 lines each)`);

            // STEP 4: Generate PMO file structure
            console.log('\n💾 STEP 4: Generating PMO file structure...');
            const pmo = {
                version: this.version,
                esmc_version: this.esmcVersion,
                project_id: this.generateProjectID(projectRoot),
                project_domain: projectContext.domain || 'GENERAL',
                project_root: projectRoot,
                generated_at: new Date().toISOString(),
                locked: true, // Prevents accidental modification

                standards_selected: {
                    architecture: this.formatStandard(ruleMO.architecture, 'architecture'),
                    code_quality: this.formatStandard(ruleMO.code_quality, 'code_quality'),
                    security: this.formatStandard(ruleMO.security, 'security'),
                    testing: this.formatStandard(ruleMO.testing, 'testing'),
                    operations: this.formatStandard(ruleMO.operations, 'operations')
                },

                audit_threshold: 0.6, // 3/5 categories must pass (60%)

                metadata: {
                    project_context: projectContext,
                    selection_rationale: this.generateRationale(selectedStandards, projectContext),
                    generated_by: 'ECHELON',
                    token_cost_estimate: 500 // Estimated tokens per session (vs 20,501 full registry)
                }
            };

            // STEP 5: Write PMO file to project root
            const pmoPath = path.join(projectRoot, '.esmc-project-modus-operandi.json');
            fs.writeFileSync(pmoPath, JSON.stringify(pmo, null, 2), 'utf8');

            console.log(`\n✅ PMO FILE GENERATED: ${pmoPath}`);
            console.log(`   📊 File size: ${(JSON.stringify(pmo).length / 1024).toFixed(2)} KB`);
            console.log(`   🎯 Token estimate: ~500 tokens (97.6% savings vs full registry)`);
            console.log(`   🔒 Locked: true (explicit regeneration required to modify)`);

            return pmo;

        } catch (error) {
            console.error('❌ PMO Generation Failed:', error.message);
            throw error;
        }
    }

    /**
     * Analyze Project - Detect patterns, domain, architecture
     * @param {string} projectRoot - Project root directory
     * @returns {Promise<Object>} Project analysis context
     */
    async analyzeProject(projectRoot) {
        try {
            // Try to load ATLAS index for comprehensive analysis
            if (fs.existsSync(this.atlasPath)) {
                const atlas = JSON.parse(fs.readFileSync(this.atlasPath, 'utf8'));
                return this.analyzeFromATLAS(atlas, projectRoot);
            }

            // Fallback: Basic filesystem analysis
            return this.analyzeFromFilesystem(projectRoot);

        } catch (error) {
            console.warn(`   ⚠️ ATLAS unavailable, using basic analysis: ${error.message}`);
            return this.analyzeFromFilesystem(projectRoot);
        }
    }

    /**
     * Analyze from ATLAS index (comprehensive)
     */
    analyzeFromATLAS(atlas, projectRoot) {
        const files = atlas.files || [];

        return {
            hasAPI: files.some(f => /route|controller|endpoint|api/i.test(f.path)),
            hasDatabase: files.some(f => /model|schema|migration|db|database/i.test(f.path)),
            hasAuth: files.some(f => /auth|login|session|jwt|token/i.test(f.path)),
            hasTests: files.some(f => /test|spec|\.test\.|\.spec\./i.test(f.path)),
            hasFrontend: files.some(f => /component|view|page|\.tsx|\.jsx/i.test(f.path)),
            hasBackend: files.some(f => /server|api|service|backend/i.test(f.path)),
            hasDocker: files.some(f => /dockerfile|docker-compose/i.test(f.path.toLowerCase())),
            hasCI: files.some(f => /\.github|\.gitlab|jenkins|ci\.yml/i.test(f.path.toLowerCase())),
            filesAnalyzed: files.length,
            domain: this.detectDomain(files),
            architecture: this.detectArchitecture(files)
        };
    }

    /**
     * Analyze from filesystem (fallback)
     */
    analyzeFromFilesystem(projectRoot) {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        let hasAPI = false;
        let hasDatabase = false;
        let hasAuth = false;
        let domain = 'GENERAL';

        // Read package.json if available
        if (fs.existsSync(packageJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            hasAPI = deps && (deps.express || deps.fastify || deps.koa || deps['@nestjs/core']);
            hasDatabase = deps && (deps.mysql2 || deps.pg || deps.mongodb || deps.prisma || deps.sequelize);
            hasAuth = deps && (deps.passport || deps['express-session'] || deps.jsonwebtoken || deps['@auth0/auth0-react']);

            // Domain detection from dependencies
            if (deps && deps['@google-cloud/healthcare']) domain = 'HEALTHCARE';
            else if (deps && (deps.stripe || deps['square-connect'])) domain = 'FINANCE';
        }

        return {
            hasAPI,
            hasDatabase,
            hasAuth,
            hasTests: fs.existsSync(path.join(projectRoot, 'test')) || fs.existsSync(path.join(projectRoot, '__tests__')),
            hasFrontend: fs.existsSync(path.join(projectRoot, 'src', 'components')),
            hasBackend: fs.existsSync(path.join(projectRoot, 'src', 'server')) || fs.existsSync(path.join(projectRoot, 'server')),
            hasDocker: fs.existsSync(path.join(projectRoot, 'Dockerfile')),
            hasCI: fs.existsSync(path.join(projectRoot, '.github', 'workflows')),
            filesAnalyzed: 0,
            domain,
            architecture: 'MONOLITH'
        };
    }

    /**
     * Detect Domain - HEALTHCARE, FINANCE, SAAS, etc.
     */
    detectDomain(files) {
        const pathsStr = files.map(f => f.path.toLowerCase()).join(' ');

        if (/health|patient|medical|hipaa|phi/i.test(pathsStr)) return 'HEALTHCARE';
        if (/payment|transaction|bank|finance|pci/i.test(pathsStr)) return 'FINANCE';
        if (/tenant|subscription|saas|billing/i.test(pathsStr)) return 'SAAS';
        if (/ecommerce|cart|checkout|product|inventory/i.test(pathsStr)) return 'ECOMMERCE';
        if (/iot|device|sensor|telemetry/i.test(pathsStr)) return 'IOT';

        return 'GENERAL';
    }

    /**
     * Detect Architecture - Monolith, Microservices, Serverless, etc.
     */
    detectArchitecture(files) {
        const pathsStr = files.map(f => f.path.toLowerCase()).join(' ');

        if (/lambda|function|serverless\.yml/i.test(pathsStr)) return 'SERVERLESS';
        if (/service\/.*\/service|microservice/i.test(pathsStr)) return 'MICROSERVICES';
        if (/docker-compose.*service/i.test(pathsStr)) return 'CONTAINERIZED';

        return 'MONOLITH';
    }

    /**
     * Cherry-Pick Standards - ECHELON selection (1 per category)
     */
    cherryPickStandards(projectContext) {
        const selected = [];
        const allStandards = this.standardsRegistry.standards;

        // CATEGORY 1: Architecture & Design
        const archStandards = Object.values(allStandards).filter(s =>
            s.category === 'Architecture & Design'
        );
        selected.push(this.selectArchitectureStandard(archStandards, projectContext));

        // CATEGORY 2: Code Quality & Practices
        const qualityStandards = Object.values(allStandards).filter(s =>
            s.category === 'Code Quality & Practices'
        );
        selected.push(this.selectCodeQualityStandard(qualityStandards, projectContext));

        // CATEGORY 3: Security & Compliance
        const securityStandards = Object.values(allStandards).filter(s =>
            s.category === 'Security & Compliance'
        );
        selected.push(this.selectSecurityStandard(securityStandards, projectContext));

        // CATEGORY 4: Testing & QA
        const testingStandards = Object.values(allStandards).filter(s =>
            s.category === 'Testing & QA'
        );
        selected.push(this.selectTestingStandard(testingStandards, projectContext));

        // CATEGORY 5: Operations & Delivery
        const operationsStandards = Object.values(allStandards).filter(s =>
            s.category === 'Operations & Delivery'
        );
        selected.push(this.selectOperationsStandard(operationsStandards, projectContext));

        return selected.filter(s => s !== null);
    }

    /**
     * Select Architecture Standard (Category 1)
     */
    selectArchitectureStandard(standards, context) {
        // Priority 1: API-focused projects → REST/GRAPHQL/MICROSERVICES
        if (context.hasAPI) {
            const apiStandard = standards.find(s => s.id === 'REST_API' || s.id === 'GRAPHQL' || s.id === 'CLOUD_NATIVE');
            if (apiStandard) return apiStandard;
        }

        // Priority 2: Database-heavy projects → ACID/SCALABILITY
        if (context.hasDatabase) {
            const dbStandard = standards.find(s => s.id === 'ATLAS' || s.id === 'ACID');
            if (dbStandard) return dbStandard;
        }

        // Priority 3: Default to SOLID or TWELVE_FACTOR
        return standards.find(s => s.id === 'TWELVE_FACTOR') || standards.find(s => s.id === 'SOLID') || standards[0];
    }

    /**
     * Select Code Quality Standard (Category 2)
     */
    selectCodeQualityStandard(standards, context) {
        // Priority 1: Always enforce DRY (universal)
        const dry = standards.find(s => s.id === 'EFFICIENCY');
        if (dry) return dry;

        // Priority 2: SOLID for OOP projects
        const solid = standards.find(s => s.id === 'SOLID');
        if (solid) return solid;

        // Priority 3: LEAN for minimalist projects
        return standards.find(s => s.id === 'LEAN') || standards[0];
    }

    /**
     * Select Security Standard (Category 3)
     */
    selectSecurityStandard(standards, context) {
        // Priority 1: Domain-specific compliance
        if (context.domain === 'HEALTHCARE') {
            const hipaa = standards.find(s => s.id === 'HIPAA');
            if (hipaa) return hipaa;
        }
        if (context.domain === 'FINANCE') {
            const pci = standards.find(s => s.id === 'PCI_DSS');
            if (pci) return pci;
        }

        // Priority 2: Web apps → OWASP
        if (context.hasAPI || context.hasFrontend) {
            const owasp = standards.find(s => s.id === 'OWASP');
            if (owasp) return owasp;
        }

        // Priority 3: Input validation (universal)
        return standards.find(s => s.id === 'GUARDIAN') || standards.find(s => s.id === 'NIST') || standards[0];
    }

    /**
     * Select Testing Standard (Category 4)
     */
    selectTestingStandard(standards, context) {
        // Priority 1: TDD for test-heavy projects
        if (context.hasTests) {
            const tdd = standards.find(s => s.id === 'TDD');
            if (tdd) return tdd;
        }

        // Priority 2: Unit testing (universal)
        return standards.find(s => s.id === 'CRUCIBLE') || standards.find(s => s.id === 'BDD') || standards[0];
    }

    /**
     * Select Operations Standard (Category 5)
     */
    selectOperationsStandard(standards, context) {
        // Priority 1: Containerized → Container Security
        if (context.hasDocker) {
            const containerSec = standards.find(s => s.id === 'CONTAINER_SECURITY');
            if (containerSec) return containerSec;
        }

        // Priority 2: CI/CD → IaC
        if (context.hasCI) {
            const iac = standards.find(s => s.id === 'IAC');
            if (iac) return iac;
        }

        // Priority 3: SRE (reliability)
        return standards.find(s => s.id === 'SRE') || standards.find(s => s.id === 'RESILIENCE') || standards[0];
    }

    /**
     * Concise Standards - Generate "rule of thumb" for each
     */
    async conciseStandards(selectedStandards) {
        const rules = {};

        for (const std of selectedStandards) {
            const category = this.getCategoryKey(std.category);
            rules[category] = this.generateRuleOfThumb(std);
        }

        return rules;
    }

    /**
     * Generate Rule of Thumb - Concise actionable guidance (20-50 lines)
     */
    generateRuleOfThumb(standard) {
        // Extract key checks from standard definition
        const checks = standard.checks || [];

        return {
            id: standard.id,
            name: standard.name,
            category: standard.category,
            rule_of_thumb: this.conciseDescription(standard),
            key_checks: checks.slice(0, 5), // Top 5 most important checks
            enforcement_level: this.determineEnforcementLevel(standard),
            examples: this.generateExamples(standard)
        };
    }

    /**
     * Concise Description - Actionable 2-3 sentence summary
     */
    conciseDescription(standard) {
        const descriptions = {
            // Security
            OWASP: "Prevent OWASP Top 10 vulnerabilities: parameterized queries for SQL injection, input validation for XSS, proper authentication/authorization for broken access control. Sanitize all user inputs, use secure session management, implement rate limiting.",
            HIPAA: "Protect PHI (Protected Health Information): encrypt data at rest and in transit, implement access controls with audit logging, ensure business associate agreements. PHI includes: patient names, medical records, SSN, payment info.",
            PCI_DSS: "Secure payment card data: never store CVV/PIN, encrypt cardholder data, implement strong access controls, maintain secure networks. Use tokenization for card storage, TLS 1.2+ for transmission.",
            NIST: "Follow NIST Cybersecurity Framework: identify assets, protect systems, detect threats, respond to incidents, recover operations. Implement defense-in-depth, least privilege, and continuous monitoring.",
            GUARDIAN: "Validate all user inputs: check type, length, format, range. Sanitize before database queries, HTML rendering, shell commands. Use allowlists over blocklists.",

            // Code Quality
            EFFICIENCY: "Don't Repeat Yourself (DRY): extract repeated logic into functions/utilities, use loops over copy-paste, centralize configuration. Aim for <3% code duplication.",
            SOLID: "SOLID principles: Single Responsibility (one reason to change), Open/Closed (extend not modify), Liskov Substitution (subtypes must be substitutable), Interface Segregation (small specific interfaces), Dependency Inversion (depend on abstractions).",
            LEAN: "You Aren't Gonna Need It (YAGNI): remove unused imports/variables, delete dead code, avoid premature optimization, implement features when needed not 'just in case'.",
            CLEAN_CODE: "Write clean code: meaningful names, small functions (<20 lines), single level of abstraction, consistent formatting, comments explain 'why' not 'what'.",

            // Architecture
            TWELVE_FACTOR: "12-Factor App: one codebase, explicit dependencies, config in env vars, backing services as attached resources, build/release/run separation, stateless processes, port binding, concurrency via processes, disposability, dev/prod parity, logs as streams, admin tasks as one-off processes.",
            CLOUD_NATIVE: "Cloud-native design: microservices architecture, containerization, dynamic orchestration (K8s), API-first communication, observability (logging/metrics/tracing), resilience patterns (circuit breakers, retries).",
            MICROSERVICES: "Microservices: bounded contexts, independent deployment, database per service, async communication (events/messages), API gateway, service discovery, distributed tracing.",
            REST_API: "REST API best practices: nouns for resources, HTTP methods (GET/POST/PUT/DELETE), proper status codes (200/201/400/404/500), pagination for lists, versioning (/v1/), HATEOAS optional.",
            ATLAS: "Scalability patterns: database connection pooling, caching (Redis), async processing (queues), horizontal scaling, load balancing, rate limiting, CDN for static assets.",

            // Testing
            TDD: "Test-Driven Development: write failing test first (red), implement minimal code to pass (green), refactor for quality (refactor). Maintain >80% coverage, test quality > test quantity.",
            BDD: "Behavior-Driven Development: write tests in Given/When/Then format, focus on user behavior not implementation, use natural language specifications (Cucumber/Gherkin).",
            CRUCIBLE: "Unit testing: test individual functions/methods in isolation, use mocks for dependencies, aim for >80% coverage, fast execution (<1s per test), one assertion per test.",
            MUTATION_TESTING: "Mutation testing: verify tests catch bugs by introducing code mutations, aim for >80% mutation score, identifies weak tests that pass but don't catch bugs.",

            // Operations
            SRE: "Site Reliability Engineering: define SLOs (service level objectives), measure SLIs (indicators), maintain error budgets, automate toil, blameless postmortems, gradual rollouts.",
            IAC: "Infrastructure as Code: version control infrastructure (Terraform/Pulumi), declarative configuration, immutable infrastructure, automated provisioning, environment parity.",
            GITOPS: "GitOps: Git as single source of truth, automated deployment via Git commits, pull-based deployment (ArgoCD/Flux), declarative infrastructure, rollback via Git revert.",
            CONTAINER_SECURITY: "Container security: scan images for vulnerabilities, use minimal base images (Alpine), non-root users, read-only filesystems, secrets in env vars not images, signed images.",
            RESILIENCE: "Resilience patterns: try-catch with specific errors, graceful degradation, timeout handling, retry with exponential backoff, circuit breakers, fallback responses, health checks."
        };

        return descriptions[standard.id] || standard.description || `Apply ${standard.name} best practices.`;
    }

    /**
     * Determine Enforcement Level
     */
    determineEnforcementLevel(standard) {
        // CRITICAL: Security, data protection
        if (standard.category === 'Security & Compliance') return 'CRITICAL';

        // HIGH: Code quality, testing
        if (standard.category === 'Code Quality & Practices' || standard.category === 'Testing & QA') return 'HIGH';

        // MEDIUM: Architecture, operations
        return 'MEDIUM';
    }

    /**
     * Generate Examples
     */
    generateExamples(standard) {
        // Minimal examples - full context in rule_of_thumb
        return [
            `Example: See ${standard.id} implementation in industry docs`,
            `Pattern: ${standard.checks?.[0] || 'Apply best practices'}`
        ];
    }

    /**
     * Format Standard for PMO file
     */
    formatStandard(rule, category) {
        if (!rule) return null;

        return {
            id: rule.id,
            name: rule.name,
            category: rule.category,
            rule_of_thumb: rule.rule_of_thumb,
            key_checks: rule.key_checks,
            enforcement_level: rule.enforcement_level,
            examples: rule.examples
        };
    }

    /**
     * Get Category Key (architecture, code_quality, security, testing, operations)
     */
    getCategoryKey(categoryName) {
        const map = {
            'Architecture & Design': 'architecture',
            'Code Quality & Practices': 'code_quality',
            'Security & Compliance': 'security',
            'Testing & QA': 'testing',
            'Operations & Delivery': 'operations',
            'Accessibility': 'operations' // Accessibility falls under operations
        };
        return map[categoryName] || 'architecture';
    }

    /**
     * Generate Project ID (unique identifier)
     */
    generateProjectID(projectRoot) {
        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(projectRoot).digest('hex');
        return `esmc_${hash.substring(0, 8)}`;
    }

    /**
     * Generate Rationale - Why these 5 standards were chosen
     */
    generateRationale(selectedStandards, projectContext) {
        return {
            domain: `Domain: ${projectContext.domain} - Standards aligned to industry requirements`,
            architecture: `Architecture: ${projectContext.architecture} - Standards support technical stack`,
            selection_logic: 'ECHELON cherry-picked 1 standard per category based on project context (API presence, domain compliance, testing maturity)',
            standards_avoided: `${70 - selectedStandards.length} standards filtered out to eliminate choice paralysis and over-engineering`
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = { PMOGenerator };

// CLI Execution Support
if (require.main === module) {
    const generator = new PMOGenerator();
    const projectRoot = process.argv[2] || process.cwd();

    generator.generatePMO(projectRoot)
        .then(pmo => {
            console.log('\n✅ PMO Generation Complete');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ PMO Generation Failed:', error);
            process.exit(1);
        });
}
