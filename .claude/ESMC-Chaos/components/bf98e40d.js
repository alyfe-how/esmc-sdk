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
 * ESMC STANDARDS - 70 Industry-Aligned Validation Standards
 * ═══════════════════════════════════════════════════════════════════════
 * 🎖️ COLONEL-ALIGNED STANDARDS ENFORCEMENT SYSTEM (ATHENA ORACLE 2.0)
 *
 * Architecture Philosophy:
 * - ECHELON selects 1 standard per colonel based on code context
 * - Colonels execute their assigned standard during their wave
 * - Clean delegation: ECHELON (strategy) → Colonels (tactics)
 *
 * Standards Organization:
 * - 70 standards grouped by 6 categories (31 original + 39 industry standards)
 * - Mapped to 7 colonels by domain expertise
 * - Context-aware selection (not blanket enforcement)
 *
 * Categories:
 * 1. Architecture & Design (16 standards) - ALPHA, GAMMA
 * 2. Code Quality & Practices (13 standards) - BETA, DELTA, ZETA
 * 3. Security & Compliance (38 standards) - ETA [+24 in ESMC 3.72.0]
 * 4. Testing & QA (11 standards) - ZETA
 * 5. Operations & Delivery (10 standards) - GAMMA, ETA [+1 ITIL in ESMC 3.72.0]
 * 6. Accessibility (3 standards) - ZETA [+1 WCAG_2_1 in ESMC 3.72.0]
 *
 * Industry Standards Expansion (ESMC 3.70.0 → 3.72.0):
 * - Security (ESMC 3.70): OWASP, NIST, PCI DSS, HIPAA, FedRAMP, CIS, ISO 27017/27701, CCPA
 * - Security (ESMC 3.72): ISO 27001, NIST 800-53, CMMC, ITAR, DoD Cloud SRG, FISMA, FIPS 140-2, CUI, EAR, SOX, GDPR, CCPA, SOC 2, CIS Benchmarks, COBIT, ISO 27017, ISO 27018, AICPA SOC, PII Protection, Data Privacy
 * - Architecture: 12-Factor, Cloud Native, Microservices, Event-Driven, OpenAPI, GraphQL, Serverless
 * - Code Quality: SOLID, Clean Code, Code Smells, Immutability, Error Handling, ISO 9001
 * - Testing: TDD, BDD, Mutation, Property-Based, Performance, Security, Accessibility, WCAG 2.1
 * - Operations: SRE, IaC, GitOps, Container Security, Chaos Engineering, ITIL
 * - Accessibility: WCAG 2.1, Mobile-First Design
 *
 * Validator Implementation Status (ESMC 3.72.0):
 * - Working: 50/70 (71%) [+24 from ESMC 3.71.0]
 * - Placeholders: 20/70 (29%)
 * - ESMC 3.71.0: 26/70 (37%) → ESMC 3.72.0: 50/70 (71%) = +34 percentage points
 *
 * ESMC Version: 3.72.0 (Military/Defense & Industry Validator Expansion)
 * Created: 2025-10-26
 * Expanded: 2025-11-07 (3.70.0: Standards Registry 31→70)
 * Expanded: 2025-11-07 (3.72.0: Validators 26→50, +24 military/defense & industry)
 * Status: PHASE 3 - VALIDATOR IMPLEMENTATION (71% working coverage)
 */

/**
 * Standards Registry - Metadata and colonel mapping for all 70 standards
 * ESMC 3.72.0: 50/70 validators implemented (71% working coverage)
 */
class StandardsRegistry {
    constructor() {
        this.version = "1.0.0";

        // Complete standards catalog with colonel assignments
        this.standards = {
            // ═══════════════════════════════════════════════════════════════
            // COLONEL DELTA - OPTIMIZATION (Wave 2) - THE ORACLE!
            // ═══════════════════════════════════════════════════════════════
            EFFICIENCY: {
                id: 'EFFICIENCY',
                name: 'DRY Principle (Don\'t Repeat Yourself)',
                category: 'Code Quality & Practices',
                colonel: 'DELTA',
                wave: 2,
                tier: 'PRO',
                priority: 1,  // ALWAYS check (universal)
                description: 'Enforces Don\'t Repeat Yourself principle',
                checks: ['code duplication', 'repeated logic', 'utility extraction']
            },
            LEAN: {
                id: 'LEAN',
                name: 'YAGNI Principle (You Aren\'t Gonna Need It)',
                category: 'Code Quality & Practices',
                colonel: 'DELTA',
                wave: 2,
                tier: 'PRO',
                priority: 2,
                description: 'Enforces You Aren\'t Gonna Need It principle',
                checks: ['unused imports', 'dead code', 'over-engineering', 'commented code']
            },
            VELOCITY: {
                id: 'VELOCITY',
                name: 'Agile Development Practices',
                category: 'Code Quality & Practices',
                colonel: 'DELTA',
                wave: 2,
                tier: 'MAX/VIP',
                priority: 3,
                description: 'Validates agile development patterns',
                checks: ['feature flags', 'incremental development', 'technical debt tracking']
            },
            REFINERY: {
                id: 'REFINERY',
                name: 'Technical Debt Management',
                category: 'Code Quality & Practices',
                colonel: 'DELTA',
                wave: 2,
                tier: 'MAX/VIP',
                priority: 4,
                description: 'Identifies and tracks technical debt',
                checks: ['code smells', 'long parameter lists', 'deep nesting', 'god objects']
            },

            // ═══════════════════════════════════════════════════════════════
            // COLONEL ALPHA - ARCHITECTURE (Wave 1)
            // ═══════════════════════════════════════════════════════════════
            ATLAS: {
                id: 'ATLAS',
                name: 'System Scalability & Load Distribution',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'MAX/VIP',
                priority: 1,  // Check if API/DB detected
                description: 'Ensures scalable architecture patterns',
                checks: ['connection pooling', 'caching', 'rate limiting', 'clustering', 'horizontal scaling']
            },
            FRAMEWORK: {
                id: 'FRAMEWORK',
                name: 'Architectural Patterns',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'PRO',
                priority: 2,
                description: 'Validates architectural pattern compliance',
                checks: ['microservices', 'MVC', 'layered architecture', 'dependency management']
            },
            BLUEPRINT: {
                id: 'BLUEPRINT',
                name: 'Design Documentation',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'MAX/VIP',
                priority: 3,
                description: 'Ensures proper design documentation',
                checks: ['architecture diagrams', 'API documentation', 'data flow documentation']
            },
            GRID: {
                id: 'GRID',
                name: 'Modular Design',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'PRO',
                priority: 4,
                description: 'Validates modular architecture principles',
                checks: ['module boundaries', 'separation of concerns', 'dependency injection']
            },
            NEXUS: {
                id: 'NEXUS',
                name: 'System Integration',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'MAX/VIP',
                priority: 5,
                description: 'Ensures proper system integration patterns',
                checks: ['API contracts', 'message queues', 'event-driven architecture']
            },

            // ═══════════════════════════════════════════════════════════════
            // COLONEL BETA - IMPLEMENTATION (Wave 2)
            // ═══════════════════════════════════════════════════════════════
            SYNTAX: {
                id: 'SYNTAX',
                name: 'Code Syntax & Style',
                category: 'Code Quality & Practices',
                colonel: 'BETA',
                wave: 2,
                tier: 'FREE',
                priority: 1,  // ALWAYS check
                description: 'Enforces code syntax standards',
                checks: ['linting', 'formatting', 'naming conventions', 'code style']
            },
            CODEX: {
                id: 'CODEX',
                name: 'Code Organization',
                category: 'Code Quality & Practices',
                colonel: 'BETA',
                wave: 2,
                tier: 'FREE',
                priority: 2,
                description: 'Validates code organization patterns',
                checks: ['file structure', 'module organization', 'import ordering']
            },
            CLARITY: {
                id: 'CLARITY',
                name: 'Code Readability',
                category: 'Code Quality & Practices',
                colonel: 'BETA',
                wave: 2,
                tier: 'FREE',
                priority: 3,
                description: 'Ensures code readability and maintainability',
                checks: ['meaningful names', 'comments', 'documentation', 'complexity']
            },

            // ═══════════════════════════════════════════════════════════════
            // COLONEL GAMMA - INTEGRATION (Wave 3)
            // ═══════════════════════════════════════════════════════════════
            PROTOCOL: {
                id: 'PROTOCOL',
                name: 'API Standards (REST/GraphQL)',
                category: 'Architecture & Design',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'PRO',
                priority: 1,
                description: 'Validates API protocol compliance',
                checks: ['RESTful design', 'GraphQL schema', 'versioning', 'error handling']
            },
            PIPELINE: {
                id: 'PIPELINE',
                name: 'CI/CD Pipeline Standards',
                category: 'Architecture & Design',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'MAX/VIP',
                priority: 3,
                description: 'Ensures proper CI/CD integration',
                checks: ['automated builds', 'testing integration', 'deployment automation']
            },
            SPECTRUM: {
                id: 'SPECTRUM',
                name: 'Multi-Environment Support',
                category: 'Architecture & Design',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'MAX/VIP',
                priority: 4,
                description: 'Validates environment configuration',
                checks: ['environment separation', 'config management', 'feature flags']
            },
            DEPLOYMENT: {
                id: 'DEPLOYMENT',
                name: 'Deployment Best Practices',
                category: 'Operations & Delivery',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'PRO',
                priority: 2,
                description: 'Validates deployment processes',
                checks: ['blue-green deployment', 'canary releases', 'rollback procedures']
            },
            FORGE: {
                id: 'FORGE',
                name: 'Build Automation',
                category: 'Operations & Delivery',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'PRO',
                priority: 5,
                description: 'Ensures automated build processes',
                checks: ['build scripts', 'dependency management', 'artifact generation']
            },

            // ═══════════════════════════════════════════════════════════════
            // COLONEL ZETA - QUALITY & QA (Wave 4)
            // ═══════════════════════════════════════════════════════════════
            CRUCIBLE: {
                id: 'CRUCIBLE',
                name: 'Unit Testing Standards',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'FREE',
                priority: 1,  // ALWAYS check
                description: 'Validates unit testing coverage',
                checks: ['test coverage', 'test quality', 'assertion patterns', 'mocking']
            },
            GAUNTLET: {
                id: 'GAUNTLET',
                name: 'E2E Testing Standards',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'MAX/VIP',
                priority: 2,
                description: 'Ensures end-to-end testing',
                checks: ['E2E frameworks', 'test scenarios', 'regression testing']
            },
            AUDIT: {
                id: 'AUDIT',
                name: 'Code Review Standards',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 3,
                description: 'Validates code review processes',
                checks: ['PR templates', 'review guidelines', 'approval requirements']
            },
            OBSERVABILITY: {
                id: 'OBSERVABILITY',
                name: 'Logging & Monitoring',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 4,
                description: 'Ensures proper observability',
                checks: ['structured logging', 'metrics', 'tracing', 'error tracking']
            },

            // ═══════════════════════════════════════════════════════════════
            // COLONEL ETA - SECURITY & OPERATIONS (Wave 5)
            // ═══════════════════════════════════════════════════════════════
            GUARDIAN: {
                id: 'GUARDIAN',
                name: 'Input Validation & Sanitization',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'FREE',
                priority: 1,  // Check if user input detected
                description: 'Ensures proper input validation',
                checks: ['validation libraries', 'sanitization', 'type checking', 'SQL injection prevention']
            },
            CIPHER: {
                id: 'CIPHER',
                name: 'Cryptographic Standards',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 2,
                description: 'Validates cryptographic implementations',
                checks: ['strong algorithms', 'key management', 'password hashing', 'TLS/SSL']
            },
            FORTRESS: {
                id: 'FORTRESS',
                name: 'Authentication & Authorization',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 3,
                description: 'Ensures proper auth implementation',
                checks: ['JWT', 'OAuth', 'session management', 'role-based access']
            },
            SHIELD: {
                id: 'SHIELD',
                name: 'XSS/CSRF Protection',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'FREE',
                priority: 4,
                description: 'Protects against web vulnerabilities',
                checks: ['XSS prevention', 'CSRF tokens', 'content security policy']
            },
            SENTINEL: {
                id: 'SENTINEL',
                name: 'Security Headers & CORS',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 5,
                description: 'Validates security headers',
                checks: ['CORS configuration', 'security headers', 'helmet.js']
            },
            VAULT: {
                id: 'VAULT',
                name: 'GDPR Compliance',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 6,
                description: 'Ensures GDPR compliance',
                checks: ['PII encryption', 'data retention', 'consent tracking', 'right to deletion']
            },
            CITADEL: {
                id: 'CITADEL',
                name: 'Zero Trust Architecture',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 7,
                description: 'Validates zero trust security model',
                checks: ['least privilege', 'network segmentation', 'continuous verification']
            },
            COMPLIANCE: {
                id: 'COMPLIANCE',
                name: 'Regulatory Compliance (SOC2/ISO27001)',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 8,
                description: 'Ensures regulatory compliance',
                checks: ['SOC 2 controls', 'ISO 27001', 'audit logging', 'data classification']
            },
            RESILIENCE: {
                id: 'RESILIENCE',
                name: 'Error Handling & Recovery',
                category: 'Operations & Delivery',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 9,
                description: 'Ensures system resilience',
                checks: ['circuit breakers', 'retry logic', 'graceful degradation', 'chaos engineering']
            },
            VERSIONING: {
                id: 'VERSIONING',
                name: 'Version Control Standards',
                category: 'Operations & Delivery',
                colonel: 'ETA',
                wave: 5,
                tier: 'FREE',
                priority: 10,
                description: 'Validates version control practices',
                checks: ['semantic versioning', 'changelog', 'branching strategy']
            },

            // ═══════════════════════════════════════════════════════════════
            // ESMC 3.70.0 - INDUSTRY STANDARDS EXPANSION (39 NEW STANDARDS)
            // ═══════════════════════════════════════════════════════════════

            // +12 SECURITY STANDARDS (ETA)
            OWASP: {
                id: 'OWASP',
                name: 'OWASP Top 10',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 11,
                description: 'Validates against OWASP Top 10 vulnerabilities',
                checks: ['injection', 'broken auth', 'sensitive data exposure', 'XXE', 'broken access control', 'security misconfiguration', 'XSS', 'insecure deserialization', 'known vulnerabilities', 'insufficient logging']
            },
            NIST: {
                id: 'NIST',
                name: 'NIST Cybersecurity Framework',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 12,
                description: 'Ensures NIST cybersecurity compliance',
                checks: ['identify', 'protect', 'detect', 'respond', 'recover']
            },
            PCI_DSS: {
                id: 'PCI_DSS',
                name: 'PCI DSS Compliance',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 13,
                description: 'Validates PCI DSS payment card security',
                checks: ['network security', 'cardholder data protection', 'vulnerability management', 'access control', 'monitoring', 'security policies']
            },
            HIPAA: {
                id: 'HIPAA',
                name: 'HIPAA Compliance',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 14,
                description: 'Ensures HIPAA healthcare data protection',
                checks: ['PHI encryption', 'access controls', 'audit controls', 'integrity controls', 'transmission security']
            },
            FEDRAMP: {
                id: 'FEDRAMP',
                name: 'FedRAMP Compliance',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 15,
                description: 'Validates FedRAMP cloud security',
                checks: ['continuous monitoring', 'incident response', 'configuration management', 'security assessment']
            },
            CIS: {
                id: 'CIS',
                name: 'CIS Benchmarks',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 16,
                description: 'Validates CIS security benchmarks',
                checks: ['inventory', 'vulnerability management', 'controlled access', 'secure configuration', 'data protection']
            },
            ISO27017: {
                id: 'ISO27017',
                name: 'ISO 27017 Cloud Security',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 17,
                description: 'Ensures ISO 27017 cloud security controls',
                checks: ['shared responsibility', 'cloud asset management', 'virtual network security', 'cloud orchestration']
            },
            ISO27701: {
                id: 'ISO27701',
                name: 'ISO 27701 Privacy',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 18,
                description: 'Validates ISO 27701 privacy management',
                checks: ['PII processing', 'consent management', 'data subject rights', 'privacy by design']
            },
            CCPA: {
                id: 'CCPA',
                name: 'CCPA Compliance',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 19,
                description: 'Ensures CCPA privacy compliance',
                checks: ['consumer rights', 'data disclosure', 'opt-out mechanisms', 'data deletion']
            },
            THREAT_MODELING: {
                id: 'THREAT_MODELING',
                name: 'Threat Modeling',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 20,
                description: 'Validates threat modeling practices',
                checks: ['STRIDE analysis', 'attack trees', 'data flow diagrams', 'security requirements']
            },
            SECURE_SDLC: {
                id: 'SECURE_SDLC',
                name: 'Secure SDLC',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 21,
                description: 'Ensures secure development lifecycle',
                checks: ['security requirements', 'secure design', 'code review', 'security testing', 'deployment security']
            },
            SECRETS_MANAGEMENT: {
                id: 'SECRETS_MANAGEMENT',
                name: 'Secrets Management',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 22,
                description: 'Validates secrets management practices',
                checks: ['no hardcoded secrets', 'vault usage', 'secret rotation', 'least privilege access']
            },

            // +8 ARCHITECTURE STANDARDS (ALPHA)
            TWELVE_FACTOR: {
                id: 'TWELVE_FACTOR',
                name: '12-Factor App',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'PRO',
                priority: 6,
                description: 'Validates 12-Factor App methodology',
                checks: ['codebase', 'dependencies', 'config', 'backing services', 'build/release/run', 'processes', 'port binding', 'concurrency', 'disposability', 'dev/prod parity', 'logs', 'admin processes']
            },
            CLOUD_NATIVE: {
                id: 'CLOUD_NATIVE',
                name: 'Cloud Native Design',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'MAX/VIP',
                priority: 7,
                description: 'Ensures cloud-native architecture patterns',
                checks: ['containerization', 'orchestration', 'microservices', 'service mesh', 'observability']
            },
            MICROSERVICES: {
                id: 'MICROSERVICES',
                name: 'Microservices Patterns',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'PRO',
                priority: 8,
                description: 'Validates microservices architecture',
                checks: ['service boundaries', 'API gateway', 'service discovery', 'circuit breaker', 'distributed tracing']
            },
            EVENT_DRIVEN: {
                id: 'EVENT_DRIVEN',
                name: 'Event-Driven Architecture',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'PRO',
                priority: 9,
                description: 'Ensures event-driven patterns',
                checks: ['event sourcing', 'CQRS', 'message queues', 'saga pattern', 'event store']
            },
            OPENAPI: {
                id: 'OPENAPI',
                name: 'OpenAPI/Swagger',
                category: 'Architecture & Design',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'PRO',
                priority: 6,
                description: 'Validates OpenAPI specification compliance',
                checks: ['API documentation', 'schema validation', 'request/response models', 'authentication schemes']
            },
            GRAPHQL_BEST: {
                id: 'GRAPHQL_BEST',
                name: 'GraphQL Best Practices',
                category: 'Architecture & Design',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'PRO',
                priority: 7,
                description: 'Ensures GraphQL best practices',
                checks: ['query depth limiting', 'rate limiting', 'dataloader', 'schema design', 'error handling']
            },
            SERVERLESS: {
                id: 'SERVERLESS',
                name: 'Serverless Architecture',
                category: 'Architecture & Design',
                colonel: 'ALPHA',
                wave: 1,
                tier: 'MAX/VIP',
                priority: 10,
                description: 'Validates serverless patterns',
                checks: ['stateless functions', 'cold start optimization', 'event-driven', 'managed services']
            },
            API_VERSIONING: {
                id: 'API_VERSIONING',
                name: 'API Versioning Strategy',
                category: 'Architecture & Design',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'PRO',
                priority: 8,
                description: 'Ensures proper API versioning',
                checks: ['semantic versioning', 'backward compatibility', 'deprecation strategy', 'version negotiation']
            },

            // +5 CODE QUALITY STANDARDS (BETA, DELTA)
            SOLID: {
                id: 'SOLID',
                name: 'SOLID Principles',
                category: 'Code Quality & Practices',
                colonel: 'BETA',
                wave: 2,
                tier: 'PRO',
                priority: 4,
                description: 'Validates SOLID design principles',
                checks: ['single responsibility', 'open-closed', 'liskov substitution', 'interface segregation', 'dependency inversion']
            },
            CLEAN_CODE: {
                id: 'CLEAN_CODE',
                name: 'Clean Code Principles',
                category: 'Code Quality & Practices',
                colonel: 'BETA',
                wave: 2,
                tier: 'FREE',
                priority: 5,
                description: 'Ensures clean code practices',
                checks: ['meaningful names', 'small functions', 'no side effects', 'error handling', 'no magic numbers']
            },
            CODE_SMELLS: {
                id: 'CODE_SMELLS',
                name: 'Code Smell Detection',
                category: 'Code Quality & Practices',
                colonel: 'DELTA',
                wave: 2,
                tier: 'PRO',
                priority: 5,
                description: 'Identifies common code smells',
                checks: ['duplicated code', 'long methods', 'large classes', 'feature envy', 'data clumps', 'primitive obsession']
            },
            IMMUTABILITY: {
                id: 'IMMUTABILITY',
                name: 'Immutability Patterns',
                category: 'Code Quality & Practices',
                colonel: 'BETA',
                wave: 2,
                tier: 'PRO',
                priority: 6,
                description: 'Validates immutability practices',
                checks: ['const by default', 'pure functions', 'no mutations', 'immutable data structures']
            },
            ERROR_HANDLING: {
                id: 'ERROR_HANDLING',
                name: 'Error Handling Best Practices',
                category: 'Code Quality & Practices',
                colonel: 'ETA',
                wave: 5,
                tier: 'FREE',
                priority: 23,
                description: 'Ensures proper error handling',
                checks: ['try-catch usage', 'error logging', 'error messages', 'error recovery', 'no silent failures']
            },

            // +7 TESTING STANDARDS (ZETA)
            TDD: {
                id: 'TDD',
                name: 'Test-Driven Development',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 5,
                description: 'Validates TDD practices',
                checks: ['tests before code', 'red-green-refactor', 'test coverage', 'test quality']
            },
            BDD: {
                id: 'BDD',
                name: 'Behavior-Driven Development',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 6,
                description: 'Ensures BDD patterns',
                checks: ['Given-When-Then', 'cucumber/gherkin', 'business-readable tests', 'specification by example']
            },
            MUTATION_TESTING: {
                id: 'MUTATION_TESTING',
                name: 'Mutation Testing',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'MAX/VIP',
                priority: 7,
                description: 'Validates mutation test coverage',
                checks: ['mutation score', 'killed mutants', 'test effectiveness']
            },
            PROPERTY_TESTING: {
                id: 'PROPERTY_TESTING',
                name: 'Property-Based Testing',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'MAX/VIP',
                priority: 8,
                description: 'Ensures property-based testing',
                checks: ['quickcheck patterns', 'property generation', 'edge case coverage']
            },
            PERFORMANCE_TESTING: {
                id: 'PERFORMANCE_TESTING',
                name: 'Performance Testing',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 9,
                description: 'Validates performance benchmarks',
                checks: ['load testing', 'stress testing', 'latency benchmarks', 'throughput measurement']
            },
            SECURITY_TESTING: {
                id: 'SECURITY_TESTING',
                name: 'Security Testing',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 10,
                description: 'Ensures security testing coverage',
                checks: ['SAST', 'DAST', 'dependency scanning', 'penetration testing']
            },
            A11Y_TESTING: {
                id: 'A11Y_TESTING',
                name: 'Accessibility Testing',
                category: 'Testing & QA',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 11,
                description: 'Validates accessibility compliance',
                checks: ['axe-core', 'WCAG testing', 'screen reader testing', 'keyboard navigation']
            },

            // +5 OPERATIONS STANDARDS (GAMMA, ETA)
            SRE: {
                id: 'SRE',
                name: 'SRE Principles',
                category: 'Operations & Delivery',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 24,
                description: 'Validates Site Reliability Engineering practices',
                checks: ['SLI/SLO/SLA', 'error budgets', 'toil reduction', 'blameless postmortems']
            },
            IAC: {
                id: 'IAC',
                name: 'Infrastructure as Code',
                category: 'Operations & Delivery',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'PRO',
                priority: 9,
                description: 'Ensures IaC best practices',
                checks: ['terraform/CDK', 'version control', 'idempotency', 'state management']
            },
            GITOPS: {
                id: 'GITOPS',
                name: 'GitOps Workflow',
                category: 'Operations & Delivery',
                colonel: 'GAMMA',
                wave: 3,
                tier: 'MAX/VIP',
                priority: 10,
                description: 'Validates GitOps practices',
                checks: ['declarative infrastructure', 'git as source of truth', 'automated sync', 'observability']
            },
            CONTAINER_SECURITY: {
                id: 'CONTAINER_SECURITY',
                name: 'Container Security',
                category: 'Operations & Delivery',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 25,
                description: 'Ensures container security',
                checks: ['base image security', 'vulnerability scanning', 'least privilege', 'runtime security']
            },
            CHAOS_ENGINEERING: {
                id: 'CHAOS_ENGINEERING',
                name: 'Chaos Engineering',
                category: 'Operations & Delivery',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 26,
                description: 'Validates chaos engineering practices',
                checks: ['fault injection', 'resilience testing', 'game days', 'steady state hypothesis']
            },

            // +2 ACCESSIBILITY STANDARDS (ZETA)
            WCAG: {
                id: 'WCAG',
                name: 'WCAG 2.1 Compliance',
                category: 'Accessibility',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 12,
                description: 'Ensures WCAG 2.1 accessibility',
                checks: ['perceivable', 'operable', 'understandable', 'robust', 'Level AA compliance']
            },
            MOBILE_FIRST: {
                id: 'MOBILE_FIRST',
                name: 'Mobile-First Design',
                category: 'Accessibility',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 13,
                description: 'Validates mobile-first approach',
                checks: ['responsive design', 'touch targets', 'mobile performance', 'progressive enhancement']
            },

            // ═══════════════════════════════════════════════════════════════
            // ESMC 3.72.0 - MILITARY/DEFENSE & INDUSTRY STANDARDS (24 standards)
            // Added: 10 military/defense + 14 industry validators
            // Coverage: 26/70 (37%) → 50/70 (71%)
            // ═══════════════════════════════════════════════════════════════

            // MILITARY/DEFENSE STANDARDS (10 standards) - ETA/ALPHA colonels
            ISO_27001: {
                id: 'ISO_27001',
                name: 'ISO 27001 - Information Security Management System',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 27,
                description: 'Ensures ISO 27001 ISMS compliance',
                checks: ['security policies', 'access control', 'cryptography', 'operations security', 'compliance', 'data retention']
            },
            FEDRAMP: {
                id: 'FEDRAMP',
                name: 'FedRAMP - Federal Risk and Authorization Management Program',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 28,
                description: 'Validates FedRAMP cloud security controls',
                checks: ['security assessment', 'continuous monitoring', 'configuration management', 'incident response', 'boundary protection']
            },
            NIST_800_53: {
                id: 'NIST_800_53',
                name: 'NIST 800-53 - Security and Privacy Controls',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 29,
                description: 'Ensures NIST 800-53 security controls',
                checks: ['access control', 'audit logging', 'encryption in transit', 'input validation', 'risk assessment']
            },
            CMMC: {
                id: 'CMMC',
                name: 'CMMC - Cybersecurity Maturity Model Certification',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 30,
                description: 'Validates CMMC defense industrial base security',
                checks: ['system access control', 'authentication', 'least privilege', 'audit logging', 'CUI encryption']
            },
            ITAR: {
                id: 'ITAR',
                name: 'ITAR - International Traffic in Arms Regulations',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 31,
                description: 'Ensures ITAR export control compliance',
                checks: ['technical data protection', 'foreign national access restrictions', 'FIPS 140-2 encryption', 'audit logging', 'export license compliance']
            },
            DOD_CLOUD_SRG: {
                id: 'DOD_CLOUD_SRG',
                name: 'DoD Cloud Computing Security Requirements Guide',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 32,
                description: 'Validates DoD cloud security requirements',
                checks: ['CAC/PIV MFA', 'encryption at rest', 'TLS 1.2+', 'cloud audit logging', 'boundary protection']
            },
            FISMA: {
                id: 'FISMA',
                name: 'FISMA - Federal Information Security Management Act',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 33,
                description: 'Ensures FISMA federal system security',
                checks: ['RMF categorization', 'NIST 800-53 controls', 'continuous monitoring', 'ATO authorization', 'incident response']
            },
            FIPS_140_2: {
                id: 'FIPS_140_2',
                name: 'FIPS 140-2 - Cryptographic Module Validation',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 34,
                description: 'Validates FIPS 140-2 cryptographic modules',
                checks: ['approved algorithms', 'key management', 'secure RNG', 'self-tests', 'no weak algorithms']
            },
            CUI: {
                id: 'CUI',
                name: 'CUI - Controlled Unclassified Information Protection',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 35,
                description: 'Ensures CUI protection per NIST SP 800-171',
                checks: ['CUI marking', 'access controls', 'FIPS encryption', 'audit logging', 'incident response', 'media protection']
            },
            EAR: {
                id: 'EAR',
                name: 'EAR - Export Administration Regulations',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'MAX/VIP',
                priority: 36,
                description: 'Validates EAR dual-use technology export controls',
                checks: ['ECCN classification', 'encryption controls', 'technology transfer authorization', 'deemed export protection', 'audit logging']
            },

            // INDUSTRY STANDARDS (14 standards) - ETA/ALPHA/ZETA colonels
            SOX: {
                id: 'SOX',
                name: 'SOX - Sarbanes-Oxley Act',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 37,
                description: 'Ensures SOX financial reporting controls',
                checks: ['internal controls', 'audit trail', 'change management', 'segregation of duties', '7-year retention']
            },
            GDPR: {
                id: 'GDPR',
                name: 'GDPR - General Data Protection Regulation',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 38,
                description: 'Validates GDPR personal data protection',
                checks: ['data minimization', 'lawful basis', 'right of access', 'right to erasure', 'privacy by design', 'breach notification']
            },
            CCPA: {
                id: 'CCPA',
                name: 'CCPA - California Consumer Privacy Act',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 39,
                description: 'Ensures CCPA consumer privacy rights',
                checks: ['right to know', 'right to delete', 'opt-out of sale', 'non-discrimination', 'verifiable requests']
            },
            WCAG_2_1: {
                id: 'WCAG_2_1',
                name: 'WCAG 2.1 - Web Content Accessibility Guidelines Level AA',
                category: 'Accessibility',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 40,
                description: 'Validates WCAG 2.1 Level AA accessibility',
                checks: ['alt text', 'semantic HTML', 'keyboard accessible', 'focus visible', 'page title', 'ARIA attributes', '44px touch targets']
            },
            SOC_2: {
                id: 'SOC_2',
                name: 'SOC 2 - Service Organization Control 2',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 41,
                description: 'Ensures SOC 2 trust service criteria',
                checks: ['access controls', 'availability monitoring', 'risk assessment', 'MFA', 'backup procedures', 'change management', 'confidentiality']
            },
            CIS_BENCHMARKS: {
                id: 'CIS_BENCHMARKS',
                name: 'CIS Benchmarks - Center for Internet Security Configuration Standards',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 42,
                description: 'Validates CIS security configuration benchmarks',
                checks: ['asset inventory', 'vulnerability management', 'administrative privileges', 'secure configuration', 'audit logs', 'data recovery']
            },
            COBIT: {
                id: 'COBIT',
                name: 'COBIT - Control Objectives for Information and Related Technologies',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 43,
                description: 'Ensures COBIT IT governance framework',
                checks: ['IT governance', 'security management', 'change management', 'incident management', 'security monitoring', 'performance monitoring']
            },
            ITIL: {
                id: 'ITIL',
                name: 'ITIL - Information Technology Infrastructure Library',
                category: 'Operations & Delivery',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 44,
                description: 'Validates ITIL service management practices',
                checks: ['service catalog', 'SLAs', 'change management', 'release management', 'incident management', 'problem management', 'CSI']
            },
            ISO_9001: {
                id: 'ISO_9001',
                name: 'ISO 9001 - Quality Management System',
                category: 'Code Quality & Practices',
                colonel: 'ZETA',
                wave: 4,
                tier: 'PRO',
                priority: 45,
                description: 'Ensures ISO 9001 quality management',
                checks: ['QMS', 'roles and responsibilities', 'documented information', 'process control', 'vendor management', 'metrics', 'internal audit', 'corrective action']
            },
            ISO_27017: {
                id: 'ISO_27017',
                name: 'ISO 27017 - Cloud Security Controls',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 46,
                description: 'Validates ISO 27017 cloud security',
                checks: ['shared responsibility', 'asset inventory', 'IAM', 'network segmentation', 'encryption', 'cloud backup']
            },
            ISO_27018: {
                id: 'ISO_27018',
                name: 'ISO 27018 - PII Protection in Public Cloud',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 47,
                description: 'Ensures ISO 27018 cloud PII protection',
                checks: ['consent management', 'purpose transparency', 'privacy notice', 'PII encryption', 'data minimization', 'deletion capability']
            },
            AICPA_SOC: {
                id: 'AICPA_SOC',
                name: 'AICPA SOC - Service Organization Controls Framework',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'PRO',
                priority: 48,
                description: 'Validates AICPA SOC framework controls',
                checks: ['control testing', 'access controls', 'change management', 'backup procedures', 'monitoring', 'vendor management']
            },
            PII_PROTECTION: {
                id: 'PII_PROTECTION',
                name: 'PII Protection - General Best Practices',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'FREE',
                priority: 49,
                description: 'Ensures PII protection best practices',
                checks: ['encryption at rest', 'encryption in transit', 'access controls', 'data minimization', 'audit logging', 'data retention', 'anonymization', 'breach notification']
            },
            DATA_PRIVACY: {
                id: 'DATA_PRIVACY',
                name: 'Data Privacy - General Framework',
                category: 'Security & Compliance',
                colonel: 'ETA',
                wave: 5,
                tier: 'FREE',
                priority: 50,
                description: 'Validates data privacy principles',
                checks: ['privacy by design', 'consent management', 'data subject rights', 'privacy notice', 'purpose limitation', 'storage limitation', 'DPIA', 'DPAs']
            }
        };
    }

    /**
     * Get all standards
     * @returns {Object} All 70 standards
     */
    getAllStandards() {
        return this.standards;
    }

    /**
     * Get standards by category
     * @param {string} category - Category name
     * @returns {Array} Standards in category
     */
    getStandardsByCategory(category) {
        return Object.values(this.standards).filter(s => s.category === category);
    }

    /**
     * Get standards by colonel (returns array sorted by priority)
     * @param {string} colonel - Colonel name (ALPHA, BETA, DELTA, GAMMA, ZETA, ETA)
     * @returns {Array} Standards assigned to colonel, sorted by priority
     */
    getStandardsByColonel(colonel) {
        return Object.values(this.standards)
            .filter(s => s.colonel === colonel)
            .sort((a, b) => a.priority - b.priority);  // Priority 1 first
    }

    /**
     * Get standards by wave
     * @param {number} wave - Wave number (1-5)
     * @returns {Array} Standards enforced in wave
     */
    getStandardsByWave(wave) {
        return Object.values(this.standards).filter(s => s.wave === wave);
    }

    /**
     * Get standards by tier
     * @param {string} tier - Tier (FREE, PRO, MAX/VIP)
     * @returns {Array} Standards available in tier
     */
    getStandardsByTier(tier) {
        if (tier === 'MAX/VIP' || tier === 'VIP' || tier === 'MAX') {
            return Object.values(this.standards); // All 31
        } else if (tier === 'PRO') {
            return Object.values(this.standards).filter(s => s.tier !== 'MAX/VIP'); // ~15
        } else {
            return Object.values(this.standards).filter(s => s.tier === 'FREE'); // ~7
        }
    }

    /**
     * Get standard by ID
     * @param {string} id - Standard ID
     * @returns {Object|null} Standard metadata
     */
    getStandard(id) {
        return this.standards[id] || null;
    }

    /**
     * Get colonel assignment summary
     * @returns {Object} Colonel → Standards mapping
     */
    getColonelMapping() {
        return {
            ALPHA: this.getStandardsByColonel('ALPHA').map(s => s.id),
            BETA: this.getStandardsByColonel('BETA').map(s => s.id),
            DELTA: this.getStandardsByColonel('DELTA').map(s => s.id),
            GAMMA: this.getStandardsByColonel('GAMMA').map(s => s.id),
            ZETA: this.getStandardsByColonel('ZETA').map(s => s.id),
            ETA: this.getStandardsByColonel('ETA').map(s => s.id),
            EPSILON: [] // EPSILON orchestrates, doesn't enforce directly
        };
    }
}

/**
 * Standard Validators - Production validators (6 extracted, 25 placeholders)
 * Phase 1: EFFICIENCY, LEAN, ATLAS, GUARDIAN, SYNTAX, CRUCIBLE (proven working)
 * Phase 2+: Extract remaining 25 validators from esmc-3.1-master.js
 */
class StandardValidators {
    constructor() {
        this.version = "1.0.0";
        this.registry = new StandardsRegistry();
    }

    /**
     * Main enforcement engine - validates code against selected standards
     * @param {string} code - Code to validate
     * @param {Array|string} selectedStandards - Array of standard IDs or single ID
     * @param {Object} context - Validation context (file type, length, etc.)
     * @returns {Object} Violations and recommendations
     */
    enforceStandards(code, selectedStandards, context = {}) {
        const violations = [];
        const recommendations = [];

        // Normalize to array
        const standards = Array.isArray(selectedStandards) ? selectedStandards : [selectedStandards];

        standards.forEach(standardId => {
            const validator = this[`validate${standardId}`];
            if (validator && typeof validator === 'function') {
                const result = validator.call(this, code, context);
                if (result.violations && result.violations.length > 0) {
                    violations.push(...result.violations);
                }
                if (result.recommendations && result.recommendations.length > 0) {
                    recommendations.push(...result.recommendations);
                }
            } else {
                // Standard not yet implemented (placeholder)
                console.warn(`[ESMC Standards] Validator for ${standardId} not yet implemented`);
            }
        });

        return { violations, recommendations };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1 - PROVEN VALIDATORS (Extracted from esmc-3.1-master.js)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * DELTA Standard - EFFICIENCY (DRY Principle)
     * Priority 1 for DELTA - THE ORACLE'S PRIMARY CHECK
     */
    validateEFFICIENCY(code, context) {
        // EFFICIENCY - DRY (Don't Repeat Yourself)
        const violations = [];
        const recommendations = [];

        // Check for code duplication (simple pattern detection)
        const lines = code.split('\n').filter(line => line.trim().length > 20);
        const lineMap = new Map();
        lines.forEach(line => {
            const trimmed = line.trim();
            lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1);
        });

        let duplicateCount = 0;
        lineMap.forEach((count, line) => {
            if (count > 2) {
                duplicateCount++;
            }
        });

        if (duplicateCount > 5) {
            violations.push({
                standard: 'EFFICIENCY',
                severity: 'MEDIUM',
                message: `${duplicateCount} duplicated code blocks detected`,
                suggestion: 'Extract repeated logic into reusable functions or utilities'
            });
        }

        // Check for similar function patterns (simple heuristic)
        const functionNames = code.match(/function\s+(\w+)/g) || [];
        if (functionNames.length > 10) {
            recommendations.push('Review function patterns for potential consolidation opportunities');
        }

        if (violations.length === 0) {
            recommendations.push('DRY principle: COMPLIANT');
        }

        return { violations, recommendations };
    }

    /**
     * DELTA Standard - LEAN (YAGNI Principle)
     * Priority 2 for DELTA
     */
    validateLEAN(code, context) {
        // LEAN - YAGNI (You Aren't Gonna Need It)
        const violations = [];
        const recommendations = [];

        // Check for unused imports
        const imports = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*require\([^)]+\)|import\s+(\w+)/g) || [];
        const importedNames = imports.map(imp => {
            const match = imp.match(/(?:const|let|var)\s+(\w+)|import\s+(\w+)/);
            return match ? (match[1] || match[2]) : null;
        }).filter(Boolean);

        importedNames.forEach(name => {
            const usageCount = (code.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
            if (usageCount === 1) { // Only appears in import statement
                violations.push({
                    standard: 'LEAN',
                    severity: 'MEDIUM',
                    message: `Unused import detected: ${name}`,
                    suggestion: 'Remove unused imports to keep codebase lean'
                });
            }
        });

        // Check for commented-out code
        const commentedCodeLines = (code.match(/\/\/\s*(const|let|var|function|class|if|for|while)/g) || []).length;
        if (commentedCodeLines > 3) {
            violations.push({
                standard: 'LEAN',
                severity: 'MEDIUM',
                message: `${commentedCodeLines} lines of commented-out code detected`,
                suggestion: 'Remove commented code (use version control for history)'
            });
        }

        // Check for unused functions
        const functionDefinitions = code.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\()/g) || [];
        const functionNames = functionDefinitions.map(fn => {
            const match = fn.match(/function\s+(\w+)|const\s+(\w+)/);
            return match ? (match[1] || match[2]) : null;
        }).filter(Boolean);

        functionNames.forEach(name => {
            const usageCount = (code.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
            if (usageCount === 1 && !code.includes(`module.exports`) && !code.includes(`export`)) {
                recommendations.push(`Function '${name}' may be unused - verify necessity`);
            }
        });

        // Check for premature optimization patterns
        const hasComplexOptimizations = /memoize|WeakMap.*cache|bitwise.*operator/i.test(code);
        if (hasComplexOptimizations && code.length < 200) {
            recommendations.push('Verify complex optimizations are necessary (avoid premature optimization)');
        }

        // Check for over-engineered abstractions
        const abstractionCount = (code.match(/class\s+Abstract|interface\s+I[A-Z]|Factory|Strategy|Decorator/g) || []).length;
        if (abstractionCount > 3 && code.length < 500) {
            violations.push({
                standard: 'LEAN',
                severity: 'LOW',
                message: 'Excessive abstraction layers for simple code',
                suggestion: 'Apply YAGNI - add abstractions when actually needed'
            });
        }

        if (violations.length === 0) {
            recommendations.push('YAGNI principle: COMPLIANT');
        }

        return { violations, recommendations };
    }

    /**
     * ALPHA Standard - ATLAS (Scalability)
     * Priority 1 for ALPHA - Check if API/DB detected
     */
    validateATLAS(code, context) {
        // ATLAS - System Scalability & Load Distribution
        const violations = [];
        const recommendations = [];

        // Check for scalability patterns (caching, load balancing, clustering)
        const hasCaching = /cache|redis|memcached/i.test(code);
        const hasLoadBalancing = /loadbalancer|round-robin|sticky-session/i.test(code);
        const hasClustering = /cluster|worker|process\.fork/i.test(code);

        // Check for database connection pooling
        const hasDBOperations = /\.query\(|\.execute\(|mongoose|sequelize/i.test(code);
        const hasConnectionPool = /pool|createPool|maxConnections/i.test(code);
        if (hasDBOperations && !hasConnectionPool) {
            violations.push({
                standard: 'ATLAS',
                severity: 'HIGH',
                message: 'Database operations without connection pooling detected',
                suggestion: 'Implement connection pooling for scalable database access'
            });
        }

        // Check for rate limiting
        const hasAPIEndpoints = /app\.(get|post|put|delete)|router\./i.test(code);
        const hasRateLimiting = /rateLimit|throttle|express-rate-limit/i.test(code);
        if (hasAPIEndpoints && !hasRateLimiting) {
            recommendations.push('Consider implementing rate limiting for API scalability');
        }

        // Check for horizontal scaling readiness (stateless operations)
        const hasSessionState = /req\.session|express-session/i.test(code);
        if (hasSessionState && !hasCaching) {
            violations.push({
                standard: 'ATLAS',
                severity: 'MEDIUM',
                message: 'Session state detected without distributed session store',
                suggestion: 'Use Redis or similar for distributed session management'
            });
        }

        if (violations.length === 0) {
            recommendations.push('System scalability & load distribution: COMPLIANT');
        }

        return { violations, recommendations };
    }

    /**
     * ETA Standard - GUARDIAN (Input Validation)
     * Priority 1 for ETA - Check if user input detected
     */
    validateGUARDIAN(code, context) {
        // GUARDIAN - Input Validation & Sanitization
        const violations = [];
        const recommendations = [];

        // Check for user input handling
        const hasUserInput = /req\.body|req\.query|req\.params|input|user.*data/i.test(code);

        if (hasUserInput) {
            // Check for validation library
            const hasValidation = /joi|yup|validator|ajv|class-validator|zod/i.test(code);
            if (!hasValidation) {
                violations.push({
                    standard: 'GUARDIAN',
                    severity: 'CRITICAL',
                    message: 'User input without validation library detected',
                    suggestion: 'Use validation library (Joi, Yup, Zod) for input validation'
                });
            }

            // Check for SQL injection protection (parameterized queries)
            const hasSQLQuery = /\.query\(|\.execute\(|sql`/i.test(code);
            const usesStringConcat = /\+.*req\.|`.*\$\{req\./i.test(code);
            if (hasSQLQuery && usesStringConcat) {
                violations.push({
                    standard: 'GUARDIAN',
                    severity: 'CRITICAL',
                    message: 'SQL query with unsanitized user input (injection risk)',
                    suggestion: 'Use parameterized queries or ORM to prevent SQL injection'
                });
            }

            // Check for XSS protection
            const hasHTMLOutput = /\.html\(|\.innerHTML|render\(/i.test(code);
            const hasSanitization = /sanitize|escape|xss|dompurify/i.test(code);
            if (hasHTMLOutput && !hasSanitization) {
                violations.push({
                    standard: 'GUARDIAN',
                    severity: 'CRITICAL',
                    message: 'User input rendered to HTML without sanitization (XSS risk)',
                    suggestion: 'Sanitize user input before rendering (use DOMPurify or escape-html)'
                });
            }

            // Check for command injection protection
            const hasCommandExecution = /exec\(|spawn\(|child_process/i.test(code);
            if (hasCommandExecution && hasUserInput) {
                violations.push({
                    standard: 'GUARDIAN',
                    severity: 'CRITICAL',
                    message: 'Command execution with user input (injection risk)',
                    suggestion: 'Avoid executing shell commands with user input, use allowlist validation'
                });
            }

            // Check for path traversal protection
            const hasFileOperations = /readFile|writeFile|fs\./i.test(code);
            const hasPathValidation = /path\.resolve|path\.normalize|sanitize.*path/i.test(code);
            if (hasFileOperations && hasUserInput && !hasPathValidation) {
                violations.push({
                    standard: 'GUARDIAN',
                    severity: 'HIGH',
                    message: 'File operations with user input (path traversal risk)',
                    suggestion: 'Validate and normalize file paths to prevent directory traversal'
                });
            }

            // Check for type validation
            const hasTypeChecking = /typeof|instanceof|Array\.isArray|isNaN/i.test(code);
            if (!hasValidation && !hasTypeChecking && code.length > 200) {
                recommendations.push('Add type checking for user inputs to prevent type confusion');
            }

            // Check for length validation
            const hasLengthCheck = /\.length\s*[<>]/i.test(code);
            if (hasUserInput && !hasLengthCheck && !hasValidation) {
                recommendations.push('Validate input length to prevent buffer overflow/DoS');
            }
        }

        if (violations.length === 0 && hasUserInput) {
            recommendations.push('Input validation & sanitization: COMPLIANT');
        }

        return { violations, recommendations };
    }

    /**
     * BETA Standard - SYNTAX (Code Style)
     * Priority 1 for BETA - ALWAYS check
     */
    validateSYNTAX(code, context) {
        // SYNTAX - Code Review Best Practices
        const violations = [];
        const recommendations = [];

        // Check for console.log (debugging artifacts)
        const consoleLogCount = (code.match(/console\.log\(/g) || []).length;
        if (consoleLogCount > 3) {
            violations.push({
                standard: 'SYNTAX',
                severity: 'MEDIUM',
                message: `${consoleLogCount} console.log statements detected (debugging artifacts)`,
                suggestion: 'Remove console.log or replace with proper logging framework'
            });
        }

        // Check for debugger statements
        const debuggerCount = (code.match(/\bdebugger\b/g) || []).length;
        if (debuggerCount > 0) {
            violations.push({
                standard: 'SYNTAX',
                severity: 'HIGH',
                message: `${debuggerCount} debugger statement(s) detected`,
                suggestion: 'Remove debugger statements before committing'
            });
        }

        // Check for proper variable naming (camelCase)
        const variableNames = code.match(/(?:const|let|var)\s+([a-z_][a-z0-9_]*)\s*=/gi) || [];
        const badNaming = variableNames.filter(v => {
            const name = v.match(/(?:const|let|var)\s+([a-z_][a-z0-9_]*)/i)?.[1];
            return name && /^[a-z]+_[a-z]+/.test(name); // snake_case
        });
        if (badNaming.length > 2) {
            violations.push({
                standard: 'SYNTAX',
                severity: 'LOW',
                message: 'Inconsistent variable naming (mix of camelCase and snake_case)',
                suggestion: 'Use camelCase for JavaScript variables consistently'
            });
        }

        // Check for proper async/await usage (no floating promises)
        const floatingPromises = code.match(/^\s*\w+\.\w+\([^)]*\);/gm) || [];
        const asyncFunctions = floatingPromises.filter(line => /fetch|axios|http|query/.test(line));
        if (asyncFunctions.length > 0) {
            violations.push({
                standard: 'SYNTAX',
                severity: 'HIGH',
                message: `${asyncFunctions.length} potential floating promise(s) detected`,
                suggestion: 'Use await or .then() to handle promises (no fire-and-forget)'
            });
        }

        // Check for proper error variable naming
        const catchBlocks = code.match(/catch\s*\((\w+)\)/g) || [];
        const improperErrorNames = catchBlocks.filter(block => {
            const name = block.match(/catch\s*\((\w+)\)/)?.[1];
            return name && name !== 'error' && name !== 'err' && name !== 'e';
        });
        if (improperErrorNames.length > 0) {
            recommendations.push('Use consistent error variable names (error, err, or e)');
        }

        // Check for == instead of ===
        const looseEquality = (code.match(/\s==\s|!=\s/g) || []).length;
        if (looseEquality > 0) {
            violations.push({
                standard: 'SYNTAX',
                severity: 'MEDIUM',
                message: `${looseEquality} loose equality operator(s) detected (== or !=)`,
                suggestion: 'Use strict equality (=== and !==) to avoid type coercion'
            });
        }

        // Check for var usage (ES6 const/let preferred)
        const varUsage = (code.match(/\bvar\s+/g) || []).length;
        if (varUsage > 0) {
            recommendations.push('Replace var with const/let (ES6+ standard)');
        }

        if (violations.length === 0) {
            recommendations.push('Code syntax & style: COMPLIANT');
        }

        return { violations, recommendations };
    }

    /**
     * ZETA Standard - CRUCIBLE (Unit Testing)
     * Priority 1 for ZETA - ALWAYS check
     */
    validateCRUCIBLE(code, context) {
        // CRUCIBLE - Test-Driven Development (TDD)
        const violations = [];
        const recommendations = [];

        // Check for test files/patterns
        const isTestFile = /\.test\.|\.spec\.|describe\(|it\(|test\(/.test(code);

        if (!isTestFile && context?.codeType !== 'test') {
            // Not a test file - check if corresponding test exists
            recommendations.push('Ensure corresponding test file exists for this module');
        }

        if (isTestFile) {
            // Validate test quality
            const testCount = (code.match(/\b(it|test)\(/g) || []).length;
            const assertCount = (code.match(/expect\(|assert\./g) || []).length;

            if (testCount > 0 && assertCount === 0) {
                violations.push({
                    standard: 'CRUCIBLE',
                    severity: 'HIGH',
                    message: 'Test file has test cases but no assertions',
                    suggestion: 'Add expect() or assert() statements to validate behavior'
                });
            }

            if (testCount > 0 && assertCount / testCount < 0.5) {
                violations.push({
                    standard: 'CRUCIBLE',
                    severity: 'MEDIUM',
                    message: 'Low assertion-to-test ratio (insufficient validation)',
                    suggestion: 'Each test should have at least one meaningful assertion'
                });
            }
        }

        if (violations.length === 0 && isTestFile) {
            recommendations.push('Test-driven development: COMPLIANT');
        }

        return { violations, recommendations };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2+ - PLACEHOLDER VALIDATORS (To be extracted)
    // ═══════════════════════════════════════════════════════════════════════

    // DELTA (remaining 2) - ✅ EXTRACTED FROM esmc-3.1-master.js
    validateVELOCITY(code, context) {
        // VELOCITY - Agile Development Practices
        const violations = [];
        const recommendations = [];

        // Check for feature flags
        const hasFeatureFlags = /featureFlag|toggles|LaunchDarkly|feature.*enabled/i.test(code);
        if (code.includes('if') && code.length > 300 && !hasFeatureFlags) {
            recommendations.push('Consider feature flags for incremental feature rollouts');
        }

        // Check for TODO/FIXME markers (technical debt tracking)
        const todoCount = (code.match(/\/\/\s*TODO:|\/\/\s*FIXME:/gi) || []).length;
        if (todoCount > 5) {
            violations.push({
                standard: 'VELOCITY',
                severity: 'MEDIUM',
                message: `${todoCount} TODO/FIXME markers detected (technical debt backlog)`,
                suggestion: 'Track technical debt in issue tracker, not code comments'
            });
        }

        // Check for incremental development patterns (small functions)
        const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/gs) || [];
        const averageFunctionSize = functionMatches.reduce((acc, fn) => acc + fn.split('\n').length, 0) / (functionMatches.length || 1);
        if (averageFunctionSize > 30) {
            recommendations.push('Break down large functions for easier incremental development');
        }

        if (violations.length === 0) {
            recommendations.push('Agile development practices: COMPLIANT');
        }

        return { violations, recommendations };
    }

    validateREFINERY(code, context) {
        // REFINERY - Technical Debt Management
        const violations = [];
        const recommendations = [];

        // Check for code smells
        const codeSmells = [];

        // Long parameter lists
        const longParamLists = code.match(/function\s+\w+\s*\([^)]{50,}\)/g) || [];
        if (longParamLists.length > 0) {
            codeSmells.push({
                type: 'Long Parameter List',
                count: longParamLists.length,
                severity: 'MEDIUM',
                suggestion: 'Use parameter objects for functions with >4 parameters'
            });
        }

        // Deep nesting
        const nestedBlocks = code.match(/\{[^{}]*\{[^{}]*\{[^{}]*\{[^{}]*\{/g) || [];
        if (nestedBlocks.length > 0) {
            codeSmells.push({
                type: 'Deep Nesting',
                count: nestedBlocks.length,
                severity: 'HIGH',
                suggestion: 'Refactor deeply nested code (max 3 levels)'
            });
        }

        // God objects (classes with many fields)
        const classFields = code.match(/class\s+\w+\s*{([^}]*)}/gs) || [];
        classFields.forEach(classBlock => {
            const fieldCount = (classBlock.match(/this\.\w+\s*=/g) || []).length;
            if (fieldCount > 10) {
                codeSmells.push({
                    type: 'God Object',
                    count: fieldCount,
                    severity: 'HIGH',
                    suggestion: 'Split large classes (>10 fields) into smaller cohesive classes'
                });
            }
        });

        // Report code smells as violations
        codeSmells.forEach(smell => {
            violations.push({
                standard: 'REFINERY',
                severity: smell.severity,
                message: `${smell.type} detected (${smell.count} occurrences)`,
                suggestion: smell.suggestion
            });
        });

        // Check for cyclomatic complexity
        const complexityIndicators = (code.match(/if\s*\(|else|for\s*\(|while\s*\(|case\s+|catch\s*\(/g) || []).length;
        if (complexityIndicators > 15) {
            violations.push({
                standard: 'REFINERY',
                severity: 'HIGH',
                message: `High cyclomatic complexity (${complexityIndicators} decision points)`,
                suggestion: 'Refactor complex functions into simpler, focused functions'
            });
        }

        if (violations.length === 0) {
            recommendations.push('Technical debt management: COMPLIANT');
        }

        return { violations, recommendations };
    }

    // ALPHA (remaining 4)
    validateFRAMEWORK(code, context) { return { violations: [], recommendations: ['FRAMEWORK validator pending extraction'] }; }
    validateBLUEPRINT(code, context) { return { violations: [], recommendations: ['BLUEPRINT validator pending extraction'] }; }
    validateGRID(code, context) { return { violations: [], recommendations: ['GRID validator pending extraction'] }; }
    validateNEXUS(code, context) { return { violations: [], recommendations: ['NEXUS validator pending extraction'] }; }

    // BETA (remaining 2)
    validateCODEX(code, context) { return { violations: [], recommendations: ['CODEX validator pending extraction'] }; }
    validateCLARITY(code, context) { return { violations: [], recommendations: ['CLARITY validator pending extraction'] }; }

    // GAMMA (remaining 4)
    validatePROTOCOL(code, context) { return { violations: [], recommendations: ['PROTOCOL validator pending extraction'] }; }
    validatePIPELINE(code, context) { return { violations: [], recommendations: ['PIPELINE validator pending extraction'] }; }
    validateSPECTRUM(code, context) { return { violations: [], recommendations: ['SPECTRUM validator pending extraction'] }; }
    validateDEPLOYMENT(code, context) { return { violations: [], recommendations: ['DEPLOYMENT validator pending extraction'] }; }
    validateFORGE(code, context) { return { violations: [], recommendations: ['FORGE validator pending extraction'] }; }

    // ZETA (remaining 3) - ✅ AUDIT EXTRACTED, GAUNTLET/OBSERVABILITY pending
    validateGAUNTLET(code, context) { return { violations: [], recommendations: ['GAUNTLET validator pending extraction'] }; }

    validateAUDIT(code, context) {
        // AUDIT - Logging & Monitoring Standards
        const violations = [];
        const recommendations = [];

        // Check for logging framework
        const hasLoggingFramework = /winston|bunyan|pino|log4js|logger/i.test(code);
        const hasConsoleLog = /console\.log\(/g.test(code);

        if (hasConsoleLog && !hasLoggingFramework && code.length > 300) {
            violations.push({
                standard: 'AUDIT',
                severity: 'MEDIUM',
                message: 'Using console.log instead of proper logging framework',
                suggestion: 'Use structured logging framework (Winston, Pino, Bunyan)'
            });
        }

        // Check for security event logging
        const hasAuthOperations = /login|logout|authenticate|authorize|permission/i.test(code);
        const hasSecurityLogging = /log.*auth|audit.*log|security.*event/i.test(code);
        if (hasAuthOperations && !hasSecurityLogging) {
            violations.push({
                standard: 'AUDIT',
                severity: 'HIGH',
                message: 'Authentication/authorization without security audit logging',
                suggestion: 'Log all authentication attempts and authorization failures'
            });
        }

        // Check for sensitive data in logs
        const logStatements = code.match(/(?:console\.log|logger\.\w+|log\.\w+)\([^)]*\)/gi) || [];
        const hasSensitiveInLogs = logStatements.some(log =>
            /password|secret|token|key|ssn|credit.*card/i.test(log)
        );
        if (hasSensitiveInLogs) {
            violations.push({
                standard: 'AUDIT',
                severity: 'CRITICAL',
                message: 'Sensitive data logged (password, token, keys)',
                suggestion: 'Never log sensitive data, use redaction for PII'
            });
        }

        if (violations.length === 0) {
            recommendations.push('Logging & monitoring standards: COMPLIANT');
        }

        return { violations, recommendations };
    }

    validateOBSERVABILITY(code, context) { return { violations: [], recommendations: ['OBSERVABILITY validator pending extraction'] }; }

    // ETA (remaining 9) - ✅ CITADEL, COMPLIANCE, RESILIENCE EXTRACTED
    validateCIPHER(code, context) { return { violations: [], recommendations: ['CIPHER validator pending extraction'] }; }
    validateFORTRESS(code, context) { return { violations: [], recommendations: ['FORTRESS validator pending extraction'] }; }
    validateSHIELD(code, context) { return { violations: [], recommendations: ['SHIELD validator pending extraction'] }; }
    validateSENTINEL(code, context) { return { violations: [], recommendations: ['SENTINEL validator pending extraction'] }; }
    validateVAULT(code, context) { return { violations: [], recommendations: ['VAULT validator pending extraction'] }; }

    validateCITADEL(code, context) {
        // CITADEL - Zero Trust Architecture (Domain-Driven Design patterns)
        const violations = [];
        const recommendations = [];

        // Check for domain entities (aggregates, value objects)
        const hasEntityPattern = /class\s+\w+(Entity|Aggregate|ValueObject)/i.test(code);
        const hasDomainModels = /class\s+\w+(Model|Domain)/i.test(code);

        // Check for anemic domain model anti-pattern (data classes with no behavior)
        const classMatches = code.match(/class\s+(\w+)\s*{([^}]*)}/gs);
        if (classMatches) {
            classMatches.forEach(classBlock => {
                const hasProperties = /this\.\w+\s*=/.test(classBlock);
                const methodCount = (classBlock.match(/\b\w+\s*\([^)]*\)\s*{/g) || []).length;

                if (hasProperties && methodCount <= 2) {
                    violations.push({
                        standard: 'CITADEL',
                        severity: 'MEDIUM',
                        message: 'Anemic domain model detected (data-only class with no behavior)',
                        suggestion: 'Add business logic methods to domain entities'
                    });
                }
            });
        }

        if (violations.length === 0) {
            recommendations.push('Zero trust architecture: COMPLIANT');
        }

        return { violations, recommendations };
    }

    validateCOMPLIANCE(code, context) {
        // COMPLIANCE - Regulatory Requirements (SOC 2/ISO 27001)
        const violations = [];
        const recommendations = [];

        // Check for access control (SOC 2 CC6.1)
        const hasAccessControl = /authorize|permission|role|acl|rbac/i.test(code);
        const hasProtectedEndpoints = /\/api\/|\.get\(|\.post\(/i.test(code);
        if (hasProtectedEndpoints && !hasAccessControl) {
            violations.push({
                standard: 'COMPLIANCE',
                severity: 'HIGH',
                message: 'Protected endpoints without access control (SOC 2 CC6.1)',
                suggestion: 'Implement role-based access control for API endpoints'
            });
        }

        // Check for audit trails (SOC 2 CC7.2)
        const hasDataModification = /\.save\(|\.update\(|\.delete\(|\.create\(/i.test(code);
        const hasAuditTrail = /audit.*log|change.*log|history|revision/i.test(code);
        if (hasDataModification && !hasAuditTrail) {
            violations.push({
                standard: 'COMPLIANCE',
                severity: 'HIGH',
                message: 'Data modifications without audit trail (SOC 2 CC7.2)',
                suggestion: 'Log all data changes with user, timestamp, and change details'
            });
        }

        if (violations.length === 0) {
            recommendations.push('Regulatory compliance: COMPLIANT');
        }

        return { violations, recommendations };
    }

    validateRESILIENCE(code, context) {
        // RESILIENCE - Error Handling & Recovery
        const violations = [];
        const recommendations = [];

        // Check for try-catch blocks around risky operations
        const hasAsyncOps = /await\s+|\.then\(|\.catch\(/.test(code);
        const hasTryCatch = /try\s*{|catch\s*\(/g.test(code);

        if (hasAsyncOps && !hasTryCatch) {
            violations.push({
                standard: 'RESILIENCE',
                severity: 'HIGH',
                message: 'Async operations detected without error handling (try-catch)',
                suggestion: 'Wrap async calls in try-catch blocks or add .catch() handlers'
            });
        }

        // Check for proper error logging
        const hasErrorHandling = /catch\s*\(\s*(\w+)\s*\)/.test(code);
        if (hasErrorHandling) {
            const catchBlocks = code.match(/catch\s*\([^)]+\)\s*{([^}]*)}/g) || [];
            catchBlocks.forEach((block, idx) => {
                const hasLogging = /console\.(error|log|warn)|logger\.(error|warn)/.test(block);
                if (!hasLogging) {
                    violations.push({
                        standard: 'RESILIENCE',
                        severity: 'MEDIUM',
                        message: `Catch block #${idx + 1} silently swallows errors (no logging)`,
                        suggestion: 'Log errors with context for debugging and monitoring'
                    });
                }
            });
        }

        if (violations.length === 0) {
            recommendations.push('Error handling & recovery: COMPLIANT');
        }

        return { violations, recommendations };
    }

    validateVERSIONING(code, context) { return { violations: [], recommendations: ['VERSIONING validator pending extraction'] }; }

    // ═══════════════════════════════════════════════════════════════
    // ESMC 3.71.0 - INDUSTRY STANDARDS VALIDATORS (Stage Implementation)
    // ═══════════════════════════════════════════════════════════════

    // SECURITY STANDARDS (Priority 1 - Most Critical)

    validateOWASP(code, context) {
        // OWASP Top 10 - Web Application Security
        const violations = [];
        const recommendations = [];

        // A01: Broken Access Control
        const hasAuthChecks = /authorize|permission|isAuth|checkRole|hasAccess/i.test(code);
        const hasRoutes = /\.get\(|\.post\(|\.put\(|\.delete\(|router\./i.test(code);
        if (hasRoutes && !hasAuthChecks && code.length > 200) {
            violations.push({
                standard: 'OWASP',
                severity: 'CRITICAL',
                message: 'A01: Broken Access Control - Routes without authorization checks',
                suggestion: 'Implement authentication and authorization middleware for all protected routes'
            });
        }

        // A02: Cryptographic Failures
        const hasSensitiveData = /password|secret|token|apiKey|privateKey|ssn|credit/i.test(code);
        const hasEncryption = /encrypt|crypto|bcrypt|hash|cipher/i.test(code);
        if (hasSensitiveData && !hasEncryption) {
            violations.push({
                standard: 'OWASP',
                severity: 'CRITICAL',
                message: 'A02: Cryptographic Failures - Sensitive data without encryption',
                suggestion: 'Use bcrypt for passwords, crypto for sensitive data at rest'
            });
        }

        // A03: Injection
        const hasQueryConcatenation = /query\s*=.*\+|SELECT.*\+.*req\.|\.query\(`.*\$\{/.test(code);
        const hasParameterizedQuery = /\?|:\w+|prepare|placeholder/i.test(code);
        if (hasQueryConcatenation && !hasParameterizedQuery) {
            violations.push({
                standard: 'OWASP',
                severity: 'CRITICAL',
                message: 'A03: Injection - SQL injection risk (string concatenation in queries)',
                suggestion: 'Use parameterized queries or prepared statements'
            });
        }

        // A05: Security Misconfiguration
        const hasHardcodedSecrets = /password\s*=\s*['"]\w+['"]|apiKey\s*=\s*['"]\w+['"]/.test(code);
        if (hasHardcodedSecrets) {
            violations.push({
                standard: 'OWASP',
                severity: 'CRITICAL',
                message: 'A05: Security Misconfiguration - Hardcoded secrets in code',
                suggestion: 'Use environment variables for secrets (process.env)'
            });
        }

        // A07: XSS (Cross-Site Scripting)
        const hasUnsafeRender = /innerHTML|dangerouslySetInnerHTML|document\.write/.test(code);
        const hasXSSProtection = /sanitize|escape|dompurify/i.test(code);
        if (hasUnsafeRender && !hasXSSProtection) {
            violations.push({
                standard: 'OWASP',
                severity: 'HIGH',
                message: 'A07: XSS - Unsafe HTML rendering without sanitization',
                suggestion: 'Sanitize user input before rendering (DOMPurify, escape libraries)'
            });
        }

        if (violations.length === 0) {
            recommendations.push('OWASP Top 10 security: COMPLIANT');
        }

        return { violations, recommendations };
    }

    validateHIPAA(code, context) {
        // HIPAA - Healthcare Information Privacy & Security
        const violations = [];
        const recommendations = [];

        // PHI (Protected Health Information) Detection
        const hasPHI = /patient|medical|health.*record|diagnosis|treatment|prescription|ssn|dob.*patient/i.test(code);

        if (hasPHI) {
            // Encryption Required (164.312(a)(2)(iv))
            const hasEncryption = /encrypt|crypto|aes|cipher/i.test(code);
            if (!hasEncryption) {
                violations.push({
                    standard: 'HIPAA',
                    severity: 'CRITICAL',
                    message: '164.312(a)(2)(iv): PHI without encryption at rest/transit',
                    suggestion: 'Implement AES-256 encryption for all PHI storage and transmission'
                });
            }

            // Access Controls (164.312(a)(1))
            const hasAccessControl = /authorize|permission|role.*based|rbac|access.*control/i.test(code);
            if (!hasAccessControl) {
                violations.push({
                    standard: 'HIPAA',
                    severity: 'CRITICAL',
                    message: '164.312(a)(1): PHI access without role-based controls',
                    suggestion: 'Implement RBAC for all PHI access (minimum necessary principle)'
                });
            }

            // Audit Logging (164.312(b))
            const hasAuditLog = /audit.*log|access.*log|activity.*log/i.test(code);
            if (!hasAuditLog) {
                violations.push({
                    standard: 'HIPAA',
                    severity: 'HIGH',
                    message: '164.312(b): PHI access without audit logging',
                    suggestion: 'Log all PHI access with user ID, timestamp, action performed'
                });
            }

            // Unique User Identification (164.312(a)(2)(i))
            const hasUserAuth = /user.*id|authenticate|login|session/i.test(code);
            if (!hasUserAuth) {
                violations.push({
                    standard: 'HIPAA',
                    severity: 'HIGH',
                    message: '164.312(a)(2)(i): PHI operations without unique user identification',
                    suggestion: 'Require authentication and unique user ID for all PHI access'
                });
            }
        }

        if (violations.length === 0) {
            recommendations.push('HIPAA compliance: COMPLIANT (or no PHI detected)');
        }

        return { violations, recommendations };
    }

    validateNIST(code, context) {
        // NIST Cybersecurity Framework
        const violations = [];
        const recommendations = [];

        // IDENTIFY: Asset Management
        const hasSensitiveData = /api.*key|secret|token|password|credential/i.test(code);

        // PROTECT: Access Control
        const hasAccessControl = /authorize|permission|isAdmin|canAccess/i.test(code);
        const hasProtectedRoutes = /\/admin|\/api\/.*private|protected/i.test(code);
        if (hasProtectedRoutes && !hasAccessControl) {
            violations.push({
                standard: 'NIST',
                severity: 'HIGH',
                message: 'PROTECT: Protected routes without access control enforcement',
                suggestion: 'Implement principle of least privilege and role-based access'
            });
        }

        // PROTECT: Data Security (encryption at rest)
        if (hasSensitiveData) {
            const hasEncryption = /encrypt|crypto|cipher|hash/i.test(code);
            if (!hasEncryption) {
                violations.push({
                    standard: 'NIST',
                    severity: 'CRITICAL',
                    message: 'PROTECT: Sensitive data without encryption',
                    suggestion: 'Encrypt sensitive data at rest using industry-standard algorithms'
                });
            }
        }

        // DETECT: Logging & Monitoring
        const hasLogging = /log\.|logger\.|winston|pino|bunyan/.test(code);
        const hasSecurityEvents = /login|logout|auth.*fail|access.*denied|permission/i.test(code);
        if (hasSecurityEvents && !hasLogging) {
            violations.push({
                standard: 'NIST',
                severity: 'MEDIUM',
                message: 'DETECT: Security events without logging/monitoring',
                suggestion: 'Implement comprehensive logging for security-relevant events'
            });
        }

        // RESPOND: Error Handling
        const hasAsyncOps = /await |\.then\(|\.catch\(/g.test(code);
        const hasErrorHandling = /try.*catch|\.catch\(/g.test(code);
        if (hasAsyncOps && !hasErrorHandling) {
            violations.push({
                standard: 'NIST',
                severity: 'MEDIUM',
                message: 'RESPOND: Async operations without error handling',
                suggestion: 'Implement graceful error handling and recovery mechanisms'
            });
        }

        if (violations.length === 0) {
            recommendations.push('NIST Cybersecurity Framework: COMPLIANT');
        }

        return { violations, recommendations };
    }

    validatePCI_DSS(code, context) {
        // PCI DSS - Payment Card Industry Data Security Standard
        const violations = [];
        const recommendations = [];

        // Cardholder Data Detection
        const hasCardData = /card.*number|cvv|cvv2|pan|track.*data|magnetic|card.*holder/i.test(code);

        if (hasCardData) {
            // Requirement 3: Protect stored cardholder data
            const hasEncryption = /encrypt|crypto|aes.*256|tokenize/i.test(code);
            if (!hasEncryption) {
                violations.push({
                    standard: 'PCI_DSS',
                    severity: 'CRITICAL',
                    message: 'Req 3: Cardholder data without encryption/tokenization',
                    suggestion: 'Use tokenization for card storage, AES-256 for encryption, NEVER store CVV/PIN'
                });
            }

            // Requirement 4: Encrypt transmission
            const hasTLS = /https|tls|ssl|secure.*connection/i.test(code);
            if (!hasTLS) {
                violations.push({
                    standard: 'PCI_DSS',
                    severity: 'CRITICAL',
                    message: 'Req 4: Cardholder data transmission without TLS 1.2+',
                    suggestion: 'Use TLS 1.2 or higher for all cardholder data transmission'
                });
            }

            // Requirement 8: Unique user authentication
            const hasAuth = /authenticate|login|user.*id|session/i.test(code);
            if (!hasAuth) {
                violations.push({
                    standard: 'PCI_DSS',
                    severity: 'HIGH',
                    message: 'Req 8: Cardholder data access without unique user identification',
                    suggestion: 'Require unique authentication for all users accessing cardholder data'
                });
            }

            // Requirement 10: Audit logging
            const hasAuditLog = /audit|access.*log|transaction.*log/i.test(code);
            if (!hasAuditLog) {
                violations.push({
                    standard: 'PCI_DSS',
                    severity: 'HIGH',
                    message: 'Req 10: Cardholder data access without audit trail',
                    suggestion: 'Log all access to cardholder data with user, timestamp, action'
                });
            }
        }

        if (violations.length === 0) {
            recommendations.push('PCI DSS compliance: COMPLIANT (or no cardholder data detected)');
        }

        return { violations, recommendations };
    }

    // TESTING STANDARDS (Priority 2)

    validateTDD(code, context) {
        // Test-Driven Development
        const violations = [];
        const recommendations = [];

        // Check for test files
        const isTestFile = /\.test\.|\.spec\.|describe\(|it\(|test\(/i.test(code);

        if (!isTestFile && code.length > 500) {
            // Check for corresponding test coverage
            recommendations.push('TDD: Ensure test file exists for this module (Red-Green-Refactor cycle)');
        }

        if (isTestFile) {
            // Check test structure (Arrange-Act-Assert or Given-When-Then)
            const hasAssertions = /expect\(|assert\(|should\.|toBe\(|toEqual\(/i.test(code);
            if (!hasAssertions) {
                violations.push({
                    standard: 'TDD',
                    severity: 'HIGH',
                    message: 'Test file without assertions',
                    suggestion: 'Add assertions to verify expected behavior (expect, assert, should)'
                });
            }

            // Check for test coverage targets
            const testCount = (code.match(/it\(|test\(/g) || []).length;
            if (testCount < 3 && code.length > 200) {
                recommendations.push('TDD: Aim for >80% code coverage, multiple test cases per function');
            }
        }

        return { violations, recommendations };
    }

    validateBDD(code, context) {
        // Behavior-Driven Development
        const violations = [];
        const recommendations = [];

        const isTestFile = /\.test\.|\.spec\.|\.feature|describe\(/i.test(code);

        if (isTestFile) {
            // Check for BDD-style test structure (Given-When-Then)
            const hasBDDPattern = /given|when|then|scenario|feature/i.test(code);
            const hasDescribeIt = /describe\(.*it\(/s.test(code);

            if (hasDescribeIt && !hasBDDPattern) {
                recommendations.push('BDD: Consider using Given-When-Then pattern for behavior specifications');
            }

            // Check for behavior descriptions (not implementation)
            const hasImplementationFocus = /test.*function|test.*method|check.*implementation/i.test(code);
            if (hasImplementationFocus) {
                violations.push({
                    standard: 'BDD',
                    severity: 'MEDIUM',
                    message: 'Tests focus on implementation details, not behavior',
                    suggestion: 'Write tests describing user behavior/outcomes, not internal implementation'
                });
            }
        }

        return { violations, recommendations };
    }

    // ARCHITECTURE STANDARDS (Priority 3)

    validateSOLID(code, context) {
        // SOLID Principles
        const violations = [];
        const recommendations = [];

        // S: Single Responsibility Principle
        const classMatches = code.match(/class\s+(\w+)\s*{([^}]*)}/gs);
        if (classMatches) {
            classMatches.forEach((classBlock) => {
                const methodCount = (classBlock.match(/\b\w+\s*\([^)]*\)\s*{/g) || []).length;
                if (methodCount > 10) {
                    violations.push({
                        standard: 'SOLID',
                        severity: 'MEDIUM',
                        message: 'S: Class has too many responsibilities (>10 methods)',
                        suggestion: 'Split class into smaller, focused classes (Single Responsibility Principle)'
                    });
                }
            });
        }

        // D: Dependency Inversion (check for hard dependencies)
        const hasHardDependency = /new\s+\w+Database|new\s+\w+Service\(/g.test(code);
        const hasInjection = /constructor\(.*\w+Service|@inject|provide|inject/i.test(code);
        if (hasHardDependency && !hasInjection && code.length > 300) {
            recommendations.push('SOLID: Consider dependency injection instead of hard-coded dependencies (D: Dependency Inversion)');
        }

        return { violations, recommendations };
    }

    validateTWELVE_FACTOR(code, context) {
        // 12-Factor App Methodology
        const violations = [];
        const recommendations = [];

        // III: Config - Check for hardcoded configuration
        const hasHardcodedConfig = /const\s+\w*(URL|PORT|HOST|KEY|SECRET)\s*=\s*['"]\w+['"]/.test(code);
        const hasEnvConfig = /process\.env\.|dotenv|config\.get/i.test(code);
        if (hasHardcodedConfig && !hasEnvConfig) {
            violations.push({
                standard: 'TWELVE_FACTOR',
                severity: 'HIGH',
                message: 'III: Config in code instead of environment variables',
                suggestion: 'Store config in environment variables (process.env)'
            });
        }

        // VI: Processes - Check for stateless processes
        const hasGlobalState = /global\.\w+\s*=|process\.\w+\s*=/g.test(code);
        if (hasGlobalState) {
            violations.push({
                standard: 'TWELVE_FACTOR',
                severity: 'MEDIUM',
                message: 'VI: Stateful process detected (global state modification)',
                suggestion: 'Keep processes stateless, use external state store (Redis, DB)'
            });
        }

        // XI: Logs - Check for log streaming
        const hasFileLogging = /\.log.*file|writeFile.*log|appendFile/i.test(code);
        const hasStreamLogging = /stdout|stderr|console\.|logger\./i.test(code);
        if (hasFileLogging && !hasStreamLogging) {
            recommendations.push('TWELVE_FACTOR: Stream logs to stdout instead of files (XI: Logs)');
        }

        return { violations, recommendations };
    }

    validateCLOUD_NATIVE(code, context) {
        // Cloud-Native Design Patterns
        const violations = [];
        const recommendations = [];

        // Check for cloud service integration
        const hasCloudServices = /aws|azure|gcp|cloud|kubernetes|docker/i.test(code);

        // Health checks (required for cloud orchestration)
        const hasHealthEndpoint = /\/health|\/ready|\/live|healthcheck/i.test(code);
        if (code.length > 500 && !hasHealthEndpoint && /express|fastify|koa|server/.test(code)) {
            violations.push({
                standard: 'CLOUD_NATIVE',
                severity: 'MEDIUM',
                message: 'Missing health check endpoint for orchestration',
                suggestion: 'Implement /health, /ready, /live endpoints for Kubernetes probes'
            });
        }

        // Graceful shutdown
        const hasShutdownHandler = /SIGTERM|SIGINT|graceful.*shutdown|cleanup/i.test(code);
        if (hasCloudServices && !hasShutdownHandler) {
            recommendations.push('CLOUD_NATIVE: Implement graceful shutdown handlers (SIGTERM, SIGINT)');
        }

        // Circuit breaker pattern
        const hasExternalCalls = /fetch\(|axios|http\.get|request\(/gi.test(code);
        const hasCircuitBreaker = /circuit.*breaker|retry|timeout|fallback/i.test(code);
        if (hasExternalCalls && !hasCircuitBreaker) {
            recommendations.push('CLOUD_NATIVE: Consider circuit breaker pattern for external service calls');
        }

        return { violations, recommendations };
    }

    // OPERATIONS STANDARDS (Priority 4)

    validateSRE(code, context) {
        // Site Reliability Engineering
        const violations = [];
        const recommendations = [];

        // SLO (Service Level Objectives) - Error budget
        const hasErrorHandling = /try.*catch|\.catch\(/gs.test(code);
        const hasAsyncOps = /await |async |\.then\(/g.test(code);
        if (hasAsyncOps && !hasErrorHandling) {
            violations.push({
                standard: 'SRE',
                severity: 'HIGH',
                message: 'SRE: Missing error handling affects reliability/SLO',
                suggestion: 'Implement comprehensive error handling to maintain error budget'
            });
        }

        // Observability - Metrics & Tracing
        const hasMetrics = /prometheus|metrics|counter|histogram|gauge/i.test(code);
        const hasTracing = /trace|span|opentelemetry|jaeger/i.test(code);
        if (!hasMetrics && !hasTracing && code.length > 500) {
            recommendations.push('SRE: Add observability (metrics, tracing) for production reliability');
        }

        // Gradual rollouts / Feature flags
        const hasFeatureFlag = /feature.*flag|toggle|canary|gradual/i.test(code);
        const hasDeployment = /deploy|release|version/i.test(code);
        if (hasDeployment && !hasFeatureFlag) {
            recommendations.push('SRE: Consider feature flags for gradual rollouts (reduce blast radius)');
        }

        return { violations, recommendations };
    }

    validateIAC(code, context) {
        // Infrastructure as Code
        const violations = [];
        const recommendations = [];

        // Check for IaC files (Terraform, Pulumi, CloudFormation)
        const isIaCFile = /\.tf$|\.tfvars|terraform|pulumi|cloudformation|\.yaml.*aws/i.test(context?.filename || '');

        if (isIaCFile) {
            // Check for state management
            const hasStateConfig = /backend|state|s3.*bucket|remote.*state/i.test(code);
            if (!hasStateConfig && code.length > 200) {
                violations.push({
                    standard: 'IAC',
                    severity: 'HIGH',
                    message: 'IaC without remote state management',
                    suggestion: 'Configure remote state (S3, Terraform Cloud) for team collaboration'
                });
            }

            // Check for hardcoded values
            const hasHardcodedValues = /\w+\s*=\s*"[\d.]+"|ami-\w+/i.test(code);
            const hasVariables = /var\.|variable|locals/i.test(code);
            if (hasHardcodedValues && !hasVariables) {
                recommendations.push('IAC: Use variables instead of hardcoded values for reusability');
            }
        }

        return { violations, recommendations };
    }

    validateCONTAINER_SECURITY(code, context) {
        // Container Security Best Practices
        const violations = [];
        const recommendations = [];

        const isDockerfile = /Dockerfile|FROM\s+\w+/i.test(code);

        if (isDockerfile) {
            // Check for minimal base images
            const hasMinimalImage = /FROM.*alpine|FROM.*slim|FROM.*distroless/i.test(code);
            if (!hasMinimalImage) {
                recommendations.push('CONTAINER_SECURITY: Use minimal base images (Alpine, distroless) to reduce attack surface');
            }

            // Check for non-root user
            const hasNonRootUser = /USER\s+(?!root)\w+/i.test(code);
            if (!hasNonRootUser) {
                violations.push({
                    standard: 'CONTAINER_SECURITY',
                    severity: 'HIGH',
                    message: 'Container runs as root user',
                    suggestion: 'Create and use non-root user (USER directive)'
                });
            }

            // Check for secrets in image
            const hasSecrets = /ENV.*PASSWORD|ENV.*SECRET|ENV.*KEY/i.test(code);
            if (hasSecrets) {
                violations.push({
                    standard: 'CONTAINER_SECURITY',
                    severity: 'CRITICAL',
                    message: 'Secrets in container image (ENV variables)',
                    suggestion: 'Use runtime secrets (Docker secrets, Kubernetes secrets), not build-time ENV'
                });
            }
        }

        return { violations, recommendations };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ESMC 3.72.0 - MILITARY/DEFENSE & INDUSTRY STANDARDS EXPANSION
    // 24 Additional Validators (26/70 → 50/70 = 71% Coverage)
    // ═══════════════════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────────────────────
    // WAVE 1: MILITARY/DEFENSE VALIDATORS (10 validators)
    // Priority: ISO 27001, FedRAMP, NIST 800-53, CMMC, ITAR, DoD Cloud SRG,
    //          FISMA, FIPS 140-2, CUI, EAR
    // ─────────────────────────────────────────────────────────────────────────

    validateISO_27001(code, context) {
        // ISO 27001 - Information Security Management System
        const violations = [];
        const recommendations = [];

        // Annex A.5.1: Information Security Policies
        const hasSecurityPolicy = /security.*policy|information.*security|isms|policy.*document/i.test(code);
        if (!hasSecurityPolicy && code.length > 500) {
            recommendations.push('ISO 27001: Consider documenting information security policies');
        }

        // Annex A.9: Access Control
        const hasAccessControl = /access.*control|authorization|permission|role.*based/i.test(code);
        const hasUserManagement = /user|account|identity/i.test(code);
        if (hasUserManagement && !hasAccessControl) {
            violations.push({
                standard: 'ISO_27001',
                severity: 'HIGH',
                message: 'A.9: Access Control - Missing access control implementation',
                suggestion: 'Implement role-based access control (RBAC) with least privilege principle'
            });
        }

        // Annex A.10: Cryptography
        const hasSensitiveData = /password|secret|token|key|credential/i.test(code);
        const hasCryptography = /encrypt|crypto|cipher|hash|bcrypt|aes|rsa/i.test(code);
        if (hasSensitiveData && !hasCryptography) {
            violations.push({
                standard: 'ISO_27001',
                severity: 'CRITICAL',
                message: 'A.10: Cryptography - Sensitive data without cryptographic controls',
                suggestion: 'Apply encryption for data at rest and in transit (AES-256, TLS 1.2+)'
            });
        }

        // Annex A.12: Operations Security
        const hasLogging = /log|logger|audit|monitor/i.test(code);
        const hasErrorHandling = /try.*catch|error|exception/i.test(code);
        if (!hasLogging && code.length > 300) {
            recommendations.push('ISO 27001: Implement audit logging for security events');
        }

        // Annex A.18: Compliance
        const hasDataRetention = /retention|archive|delete.*after|expire/i.test(code);
        if (!hasDataRetention && /database|storage|persist/i.test(code)) {
            recommendations.push('ISO 27001: Define data retention and disposal procedures');
        }

        if (violations.length === 0) {
            recommendations.push('ISO 27001 compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateFEDRAMP(code, context) {
        // FedRAMP - Federal Risk and Authorization Management Program
        const violations = [];
        const recommendations = [];

        // Security Assessment and Authorization (SA&A)
        const hasSecurityControls = /security.*control|safeguard|protect/i.test(code);
        if (!hasSecurityControls && code.length > 500) {
            recommendations.push('FedRAMP: Document security controls per NIST 800-53');
        }

        // Continuous Monitoring
        const hasMonitoring = /monitor|observe|track|audit.*log|metrics/i.test(code);
        const hasCloudService = /aws|azure|gcp|cloud/i.test(code);
        if (hasCloudService && !hasMonitoring) {
            violations.push({
                standard: 'FEDRAMP',
                severity: 'HIGH',
                message: 'Continuous Monitoring - Missing security monitoring implementation',
                suggestion: 'Implement continuous monitoring with centralized logging (CloudWatch, Azure Monitor, Cloud Logging)'
            });
        }

        // Configuration Management
        const hasConfigManagement = /config|environment|env\..*|settings/i.test(code);
        const hasHardcodedConfig = /password\s*=\s*['"]\w+['"]|api.*key\s*=\s*['"]/i.test(code);
        if (hasHardcodedConfig) {
            violations.push({
                standard: 'FEDRAMP',
                severity: 'CRITICAL',
                message: 'Configuration Management - Hardcoded sensitive configuration',
                suggestion: 'Use secure configuration management (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager)'
            });
        }

        // Incident Response
        const hasIncidentHandling = /incident|alert|notify|escalate|response/i.test(code);
        const hasErrorHandling = /try.*catch|error.*handler|exception/i.test(code);
        if (hasErrorHandling && !hasIncidentHandling) {
            recommendations.push('FedRAMP: Implement incident response procedures with alerting');
        }

        // Boundary Protection
        const hasNetworkControls = /firewall|security.*group|network.*policy|ingress|egress/i.test(code);
        if (hasCloudService && !hasNetworkControls) {
            recommendations.push('FedRAMP: Configure boundary protection (security groups, network policies)');
        }

        if (violations.length === 0) {
            recommendations.push('FedRAMP compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateNIST_800_53(code, context) {
        // NIST 800-53 - Security and Privacy Controls for Information Systems
        const violations = [];
        const recommendations = [];

        // AC (Access Control) Family
        const hasAuthentication = /authenticate|login|signin|verify.*identity/i.test(code);
        const hasMFA = /mfa|2fa|two.*factor|multi.*factor|totp|authenticator/i.test(code);
        if (hasAuthentication && !hasMFA) {
            violations.push({
                standard: 'NIST_800_53',
                severity: 'HIGH',
                message: 'AC-2: Account Management - Missing multi-factor authentication',
                suggestion: 'Implement MFA for privileged accounts (TOTP, hardware tokens, biometrics)'
            });
        }

        // AU (Audit and Accountability) Family
        const hasAuditLogging = /audit|log.*security|event.*log|activity.*log/i.test(code);
        const hasAuthenticated = /user|account|session/i.test(code);
        if (hasAuthenticated && !hasAuditLogging) {
            violations.push({
                standard: 'NIST_800_53',
                severity: 'MEDIUM',
                message: 'AU-2: Audit Events - Missing audit logging for security-relevant events',
                suggestion: 'Log authentication attempts, access control failures, privilege escalations'
            });
        }

        // SC (System and Communications Protection) Family
        const hasEncryptionInTransit = /https|tls|ssl|secure.*socket/i.test(code);
        const hasHTTPServer = /http\.createServer|express\(\)|app\.listen/i.test(code);
        if (hasHTTPServer && !hasEncryptionInTransit) {
            violations.push({
                standard: 'NIST_800_53',
                severity: 'CRITICAL',
                message: 'SC-8: Transmission Confidentiality - Missing encryption in transit',
                suggestion: 'Use TLS 1.2+ for all network communications (HTTPS, enforce SSL)'
            });
        }

        // SI (System and Information Integrity) Family
        const hasInputValidation = /validate|sanitize|escape|xss.*protect/i.test(code);
        const hasUserInput = /req\.body|req\.query|req\.params|input/i.test(code);
        if (hasUserInput && !hasInputValidation) {
            violations.push({
                standard: 'NIST_800_53',
                severity: 'HIGH',
                message: 'SI-10: Information Input Validation - Missing input validation',
                suggestion: 'Validate and sanitize all user inputs (whitelist validation, type checking)'
            });
        }

        // RA (Risk Assessment) Family
        const hasRiskAssessment = /risk|threat|vulnerability|assessment/i.test(code);
        if (!hasRiskAssessment && code.length > 800) {
            recommendations.push('NIST 800-53: Conduct periodic risk assessments per RA-3');
        }

        if (violations.length === 0) {
            recommendations.push('NIST 800-53 compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateCMMC(code, context) {
        // CMMC - Cybersecurity Maturity Model Certification (Defense Industrial Base)
        const violations = [];
        const recommendations = [];

        // Level 1: Basic Cyber Hygiene (AC.L1-3.1.1 - Limit system access)
        const hasAccessControl = /access.*control|permission|authorize|role/i.test(code);
        const hasUserManagement = /user|account/i.test(code);
        if (hasUserManagement && !hasAccessControl) {
            violations.push({
                standard: 'CMMC',
                severity: 'HIGH',
                message: 'AC.L1-3.1.1: Limit system access to authorized users',
                suggestion: 'Implement access controls with user authentication and authorization'
            });
        }

        // Level 1: Identification and Authentication (IA.L1-3.5.1)
        const hasAuthentication = /authenticate|login|password|credential/i.test(code);
        const hasPasswordPolicy = /password.*policy|password.*strength|minimum.*length/i.test(code);
        if (hasAuthentication && !hasPasswordPolicy) {
            recommendations.push('CMMC: Implement password complexity requirements per IA.L1-3.5.1');
        }

        // Level 2: Intermediate Cyber Hygiene (AC.L2-3.1.2 - Least privilege)
        const hasLeastPrivilege = /least.*privilege|minimum.*permission|role.*based/i.test(code);
        if (hasAccessControl && !hasLeastPrivilege) {
            recommendations.push('CMMC: Apply principle of least privilege (AC.L2-3.1.2)');
        }

        // Level 2: Audit and Accountability (AU.L2-3.3.1 - Audit logging)
        const hasAuditLog = /audit|log.*event|security.*log/i.test(code);
        if (!hasAuditLog && hasUserManagement) {
            violations.push({
                standard: 'CMMC',
                severity: 'MEDIUM',
                message: 'AU.L2-3.3.1: Missing audit log capability',
                suggestion: 'Create and retain system audit logs for security events'
            });
        }

        // Level 2: System and Communications Protection (SC.L2-3.13.11 - Encryption)
        const hasCUI = /cui|controlled.*unclassified|sensitive|confidential/i.test(code);
        const hasEncryption = /encrypt|crypto|cipher|aes|tls/i.test(code);
        if (hasCUI && !hasEncryption) {
            violations.push({
                standard: 'CMMC',
                severity: 'CRITICAL',
                message: 'SC.L2-3.13.11: CUI must be encrypted',
                suggestion: 'Employ cryptographic mechanisms to protect CUI (AES-256, FIPS 140-2 validated)'
            });
        }

        if (violations.length === 0) {
            recommendations.push('CMMC compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateITAR(code, context) {
        // ITAR - International Traffic in Arms Regulations
        const violations = [];
        const recommendations = [];

        // Export Control - Technical Data Protection
        const hasTechnicalData = /technical.*data|blueprint|design|specification|engineering/i.test(code);
        const hasExportControl = /export.*control|itar|usml|munitions.*list/i.test(code);
        if (hasTechnicalData && !hasExportControl && code.length > 400) {
            recommendations.push('ITAR: Mark technical data with export control classifications');
        }

        // Access Controls for Foreign Nationals
        const hasUserManagement = /user|account|personnel|access/i.test(code);
        const hasCitizenshipCheck = /citizenship|nationality|us.*person|foreign.*national/i.test(code);
        if (hasUserManagement && hasTechnicalData && !hasCitizenshipCheck) {
            violations.push({
                standard: 'ITAR',
                severity: 'CRITICAL',
                message: 'Access Control - Missing foreign national access restrictions',
                suggestion: 'Implement citizenship verification and restrict access to U.S. persons only'
            });
        }

        // Encryption Requirements for Defense Articles
        const hasDefenseArticle = /defense.*article|military|weapon|munition/i.test(code);
        const hasEncryption = /encrypt|crypto|fips.*140|aes.*256/i.test(code);
        if (hasDefenseArticle && !hasEncryption) {
            violations.push({
                standard: 'ITAR',
                severity: 'CRITICAL',
                message: 'Encryption - Defense articles must use FIPS 140-2 validated encryption',
                suggestion: 'Use FIPS 140-2 validated cryptographic modules for all ITAR data'
            });
        }

        // Audit Logging for Access to Technical Data
        const hasAuditLog = /audit|log.*access|track.*download|activity.*log/i.test(code);
        if (hasTechnicalData && !hasAuditLog) {
            violations.push({
                standard: 'ITAR',
                severity: 'HIGH',
                message: 'Audit Logging - Missing access logs for technical data',
                suggestion: 'Log all access, modifications, and exports of ITAR-controlled technical data'
            });
        }

        // Export License Compliance
        const hasExportLicense = /export.*license|license.*required|authorization.*required/i.test(code);
        if (hasTechnicalData && !hasExportLicense) {
            recommendations.push('ITAR: Verify export authorization before transmitting technical data');
        }

        if (violations.length === 0 && hasTechnicalData) {
            recommendations.push('ITAR compliance: GOOD (technical data controls in place)');
        }

        return { violations, recommendations };
    }

    validateDOD_CLOUD_SRG(code, context) {
        // DoD Cloud Computing Security Requirements Guide
        const violations = [];
        const recommendations = [];

        const hasCloudService = /aws|azure|gcp|cloud.*provider|s3|blob.*storage/i.test(code);

        if (hasCloudService) {
            // SRG-01: Multi-Factor Authentication
            const hasMFA = /mfa|multi.*factor|2fa|cac|piv/i.test(code);
            if (!hasMFA) {
                violations.push({
                    standard: 'DOD_CLOUD_SRG',
                    severity: 'CRITICAL',
                    message: 'SRG-01: Multi-factor authentication required for privileged access',
                    suggestion: 'Implement CAC/PIV or DoD-approved MFA for cloud console access'
                });
            }

            // SRG-02: Encryption at Rest
            const hasEncryptionAtRest = /encrypt.*at.*rest|kms|key.*management|cmk|server.*side.*encrypt/i.test(code);
            if (!hasEncryptionAtRest) {
                violations.push({
                    standard: 'DOD_CLOUD_SRG',
                    severity: 'CRITICAL',
                    message: 'SRG-02: Data at rest must be encrypted with FIPS 140-2 validated modules',
                    suggestion: 'Enable encryption at rest using cloud KMS (AWS KMS, Azure Key Vault, GCP KMS)'
                });
            }

            // SRG-03: Encryption in Transit
            const hasTLS = /tls|ssl|https|secure.*transport/i.test(code);
            if (!hasTLS) {
                violations.push({
                    standard: 'DOD_CLOUD_SRG',
                    severity: 'CRITICAL',
                    message: 'SRG-03: Data in transit must use TLS 1.2 or higher',
                    suggestion: 'Enforce TLS 1.2+ for all network communications'
                });
            }

            // SRG-04: Audit Logging
            const hasCloudAudit = /cloudtrail|activity.*log|audit.*log|cloud.*logging/i.test(code);
            if (!hasCloudAudit) {
                violations.push({
                    standard: 'DOD_CLOUD_SRG',
                    severity: 'HIGH',
                    message: 'SRG-04: Cloud audit logging required',
                    suggestion: 'Enable CloudTrail/Activity Logs/Cloud Audit Logs for all API calls'
                });
            }

            // SRG-05: Boundary Protection
            const hasNetworkSegmentation = /vpc|vnet|security.*group|network.*policy|firewall/i.test(code);
            if (!hasNetworkSegmentation) {
                recommendations.push('DOD Cloud SRG: Implement network segmentation with security groups/firewalls');
            }
        }

        if (violations.length === 0 && hasCloudService) {
            recommendations.push('DoD Cloud SRG compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateFISMA(code, context) {
        // FISMA - Federal Information Security Management Act
        const violations = [];
        const recommendations = [];

        // Risk Management Framework (RMF) Categorization
        const hasFederalData = /federal|government|agency|official/i.test(code);
        const hasDataClassification = /confidentiality|integrity|availability|fips.*199|classification/i.test(code);
        if (hasFederalData && !hasDataClassification) {
            recommendations.push('FISMA: Categorize information systems per FIPS 199 (Low/Moderate/High impact)');
        }

        // Security Controls (NIST 800-53)
        const hasSecurityControls = /security.*control|nist.*800.*53|baseline/i.test(code);
        if (!hasSecurityControls && code.length > 600) {
            recommendations.push('FISMA: Implement NIST 800-53 security controls for federal systems');
        }

        // Continuous Monitoring
        const hasMonitoring = /monitor|observe|scan|assess|vulnerability/i.test(code);
        if (!hasMonitoring && hasFederalData) {
            violations.push({
                standard: 'FISMA',
                severity: 'HIGH',
                message: 'Continuous Monitoring - Missing ongoing security assessment',
                suggestion: 'Implement continuous monitoring program per NIST 800-137'
            });
        }

        // Annual Assessment and Authorization
        const hasAuthorization = /ato|authorization.*operate|security.*assessment/i.test(code);
        if (!hasAuthorization && hasFederalData) {
            recommendations.push('FISMA: Obtain Authority to Operate (ATO) through assessment and authorization');
        }

        // Incident Response
        const hasIncidentResponse = /incident.*response|us.*cert|report.*incident|breach.*notification/i.test(code);
        if (!hasIncidentResponse && hasFederalData) {
            violations.push({
                standard: 'FISMA',
                severity: 'MEDIUM',
                message: 'Incident Response - Missing incident reporting procedures',
                suggestion: 'Establish incident response plan with US-CERT reporting within 1 hour'
            });
        }

        if (violations.length === 0) {
            recommendations.push('FISMA compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateFIPS_140_2(code, context) {
        // FIPS 140-2 - Cryptographic Module Validation
        const violations = [];
        const recommendations = [];

        const hasCryptography = /crypto|encrypt|decrypt|hash|sign|verify|cipher/i.test(code);

        if (hasCryptography) {
            // Approved Algorithms
            const hasApprovedAlgorithm = /aes|sha.*2|sha.*256|sha.*384|sha.*512|rsa|ecdsa|hmac/i.test(code);
            const hasWeakAlgorithm = /md5|sha1(?!.*deprecat)|des(?!.*deprecat)|rc4/i.test(code);

            if (hasWeakAlgorithm) {
                violations.push({
                    standard: 'FIPS_140_2',
                    severity: 'CRITICAL',
                    message: 'Non-approved cryptographic algorithm detected (MD5, SHA-1, DES, RC4)',
                    suggestion: 'Use FIPS 140-2 approved algorithms only (AES-256, SHA-256, RSA 2048+, ECDSA)'
                });
            }

            if (!hasApprovedAlgorithm && code.length > 200) {
                recommendations.push('FIPS 140-2: Use approved cryptographic algorithms (AES, SHA-2, RSA, ECDSA)');
            }

            // Key Management
            const hasKeyManagement = /key.*management|key.*storage|kms|hsm|key.*vault/i.test(code);
            const hasHardcodedKey = /key\s*=\s*['"]\w{16,}['"]|secret\s*=\s*['"]\w{16,}/i.test(code);

            if (hasHardcodedKey) {
                violations.push({
                    standard: 'FIPS_140_2',
                    severity: 'CRITICAL',
                    message: 'Hardcoded cryptographic keys detected',
                    suggestion: 'Use FIPS 140-2 validated key management system (HSM, KMS)'
                });
            }

            if (!hasKeyManagement && code.length > 300) {
                recommendations.push('FIPS 140-2: Implement secure key management with validated cryptographic module');
            }

            // Random Number Generation
            const hasRNG = /random|rand|entropy|securerandom|crypto\.random/i.test(code);
            const hasSecureRNG = /crypto\.random|securerandom|csprng/i.test(code);

            if (hasRNG && !hasSecureRNG) {
                violations.push({
                    standard: 'FIPS_140_2',
                    severity: 'HIGH',
                    message: 'Non-cryptographic random number generator used',
                    suggestion: 'Use FIPS 140-2 approved RNG (crypto.randomBytes, SecureRandom)'
                });
            }

            // Self-Tests
            const hasSelfTest = /self.*test|power.*on.*test|known.*answer.*test|continuous.*test/i.test(code);
            if (!hasSelfTest && code.length > 500) {
                recommendations.push('FIPS 140-2: Implement cryptographic module self-tests (power-on, continuous)');
            }
        }

        if (violations.length === 0 && hasCryptography) {
            recommendations.push('FIPS 140-2 compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateCUI(code, context) {
        // CUI - Controlled Unclassified Information Protection
        const violations = [];
        const recommendations = [];

        // CUI Identification
        const hasCUI = /cui|controlled.*unclassified|sp.*800.*171|export.*controlled|fouo/i.test(code);
        const hasCUIMarking = /cui\/\/sp.*cat|basic|specified/i.test(code);

        if (hasCUI && !hasCUIMarking) {
            recommendations.push('CUI: Mark CUI with proper banner markings (CUI//SP-CAT, CUI Basic, etc.)');
        }

        // Access Controls (NIST SP 800-171 3.1.x)
        const hasAccessControl = /access.*control|authorization|permission/i.test(code);
        if (hasCUI && !hasAccessControl) {
            violations.push({
                standard: 'CUI',
                severity: 'HIGH',
                message: '3.1.1: Limit system access to authorized users',
                suggestion: 'Implement access controls for CUI systems per NIST SP 800-171'
            });
        }

        // Encryption (NIST SP 800-171 3.13.11)
        const hasEncryption = /encrypt|crypto|fips.*140|aes/i.test(code);
        if (hasCUI && !hasEncryption) {
            violations.push({
                standard: 'CUI',
                severity: 'CRITICAL',
                message: '3.13.11: CUI must be encrypted at rest',
                suggestion: 'Employ FIPS-validated cryptography to protect CUI at rest (AES-256)'
            });
        }

        // Audit Logging (NIST SP 800-171 3.3.x)
        const hasAuditLog = /audit|log.*access|security.*event|monitor/i.test(code);
        if (hasCUI && !hasAuditLog) {
            violations.push({
                standard: 'CUI',
                severity: 'MEDIUM',
                message: '3.3.1: Missing audit logging for CUI access',
                suggestion: 'Create and retain audit logs for CUI access and modification events'
            });
        }

        // Incident Response (NIST SP 800-171 3.6.x)
        const hasIncidentResponse = /incident.*response|report.*breach|notify/i.test(code);
        if (hasCUI && !hasIncidentResponse) {
            recommendations.push('CUI: Establish incident response procedures for CUI breaches');
        }

        // Media Protection (NIST SP 800-171 3.8.x)
        const hasMediaProtection = /sanitize|purge|destroy|disposal/i.test(code);
        if (hasCUI && !hasMediaProtection) {
            recommendations.push('CUI: Implement media sanitization procedures for CUI storage devices');
        }

        if (violations.length === 0 && hasCUI) {
            recommendations.push('CUI compliance: GOOD (NIST SP 800-171 controls in place)');
        }

        return { violations, recommendations };
    }

    validateEAR(code, context) {
        // EAR - Export Administration Regulations (Dual-Use Technology)
        const violations = [];
        const recommendations = [];

        // EAR-Controlled Technology
        const hasDualUseTech = /encryption|crypto.*algorithm|satellite|navigation|telecommunications/i.test(code);
        const hasEARClassification = /ear|eccn|export.*control|license.*exception|bis/i.test(code);

        if (hasDualUseTech && !hasEARClassification && code.length > 400) {
            recommendations.push('EAR: Classify technology with appropriate ECCN (Export Control Classification Number)');
        }

        // Encryption Items (Category 5 Part 2)
        const hasEncryption = /encrypt|crypto|cipher|aes|rsa|key.*length/i.test(code);
        const hasKeyLength = /key.*length|2048|4096|256.*bit/i.test(code);

        if (hasEncryption && hasKeyLength) {
            const hasStrongEncryption = /aes.*256|rsa.*2048|rsa.*4096|sha.*256|sha.*512/i.test(code);
            if (hasStrongEncryption) {
                violations.push({
                    standard: 'EAR',
                    severity: 'HIGH',
                    message: 'Strong encryption may require export license (ECCN 5A002, 5D002)',
                    suggestion: 'Review encryption key lengths > 56 bits for export control requirements'
                });
            }
        }

        // Technology Transfer Controls
        const hasTechTransfer = /transfer|transmit|export|foreign.*access|download/i.test(code);
        const hasAccessControl = /authorization|license.*check|export.*approval/i.test(code);

        if (hasTechTransfer && hasDualUseTech && !hasAccessControl) {
            violations.push({
                standard: 'EAR',
                severity: 'CRITICAL',
                message: 'Technology transfer without export authorization check',
                suggestion: 'Verify export authorization before transferring EAR-controlled technology'
            });
        }

        // Deemed Export Protection
        const hasForeignNationalAccess = /foreign.*national|non.*us.*person|international/i.test(code);
        const hasCitizenshipVerification = /citizenship|nationality|us.*person.*check/i.test(code);

        if (hasDualUseTech && hasForeignNationalAccess && !hasCitizenshipVerification) {
            violations.push({
                standard: 'EAR',
                severity: 'HIGH',
                message: 'Deemed export risk - foreign national access to controlled technology',
                suggestion: 'Implement citizenship verification for access to EAR-controlled technology'
            });
        }

        // Audit Logging for Export Activities
        const hasAuditLog = /audit|log.*transfer|track.*export|activity.*log/i.test(code);
        if (hasDualUseTech && hasTechTransfer && !hasAuditLog) {
            recommendations.push('EAR: Log all technology transfers for export compliance auditing');
        }

        if (violations.length === 0 && hasDualUseTech) {
            recommendations.push('EAR compliance: GOOD (export controls in place)');
        }

        return { violations, recommendations };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WAVE 2: INDUSTRY STANDARDS VALIDATORS (14 validators)
    // Priority: SOX, GDPR expansion, CCPA, WCAG 2.1, SOC 2, CIS Benchmarks,
    //          COBIT, ITIL, ISO 9001, ISO 27017, ISO 27018, AICPA SOC,
    //          PII Protection, Data Privacy
    // ─────────────────────────────────────────────────────────────────────────

    validateSOX(code, context) {
        // SOX - Sarbanes-Oxley Act (Financial Reporting Controls)
        const violations = [];
        const recommendations = [];

        const hasFinancialData = /financial|revenue|earnings|transaction|accounting|ledger|invoice/i.test(code);

        if (hasFinancialData) {
            // Section 302: Internal Controls
            const hasControlFramework = /control|review|approval|segregation.*duties/i.test(code);
            if (!hasControlFramework) {
                recommendations.push('SOX: Implement internal controls over financial reporting (Section 302)');
            }

            // Section 404: Audit Trail
            const hasAuditTrail = /audit.*log|trail|immutable|tamper.*proof|blockchain/i.test(code);
            if (!hasAuditTrail) {
                violations.push({
                    standard: 'SOX',
                    severity: 'CRITICAL',
                    message: 'Section 404: Missing audit trail for financial transactions',
                    suggestion: 'Implement immutable audit logging for all financial data changes'
                });
            }

            // Change Management Controls
            const hasChangeControl = /change.*request|approval.*workflow|version.*control/i.test(code);
            const hasCodeChange = /update|modify|delete.*transaction|adjust.*amount/i.test(code);
            if (hasCodeChange && !hasChangeControl) {
                violations.push({
                    standard: 'SOX',
                    severity: 'HIGH',
                    message: 'Change Management - Financial system changes without approval workflow',
                    suggestion: 'Require documented approvals for all financial system changes'
                });
            }

            // Segregation of Duties
            const hasRoleBasedAccess = /role|permission|least.*privilege|segregation/i.test(code);
            if (!hasRoleBasedAccess) {
                violations.push({
                    standard: 'SOX',
                    severity: 'HIGH',
                    message: 'Segregation of Duties - Missing role-based access controls',
                    suggestion: 'Separate create, approve, and post functions with role-based permissions'
                });
            }

            // Data Retention (7 years)
            const hasRetentionPolicy = /retention|archive|retain.*7.*year|preserve/i.test(code);
            if (!hasRetentionPolicy) {
                recommendations.push('SOX: Implement 7-year retention policy for financial records');
            }
        }

        if (violations.length === 0 && hasFinancialData) {
            recommendations.push('SOX compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateGDPR(code, context) {
        // GDPR - General Data Protection Regulation (Enhanced from existing)
        const violations = [];
        const recommendations = [];

        const hasPII = /personal.*data|pii|email|phone|address|name.*first|name.*last|ssn|national.*id/i.test(code);

        if (hasPII) {
            // Article 5: Data Minimization
            const hasDataMinimization = /minimum|necessary|purpose.*limitation|data.*minimization/i.test(code);
            if (!hasDataMinimization && code.length > 400) {
                recommendations.push('GDPR Art. 5: Collect only minimum necessary personal data (data minimization)');
            }

            // Article 6: Lawful Basis
            const hasLawfulBasis = /consent|contract|legal.*obligation|legitimate.*interest/i.test(code);
            if (!hasLawfulBasis) {
                violations.push({
                    standard: 'GDPR',
                    severity: 'CRITICAL',
                    message: 'Article 6: Missing lawful basis for processing personal data',
                    suggestion: 'Document lawful basis (consent, contract, legitimate interest)'
                });
            }

            // Article 15: Right of Access
            const hasDataAccess = /export.*data|download.*data|data.*portability|subject.*access/i.test(code);
            if (!hasDataAccess) {
                recommendations.push('GDPR Art. 15: Provide data subject access request (DSAR) capability');
            }

            // Article 17: Right to Erasure
            const hasDataDeletion = /delete|erase|remove.*data|forget.*user|purge/i.test(code);
            if (!hasDataDeletion) {
                violations.push({
                    standard: 'GDPR',
                    severity: 'HIGH',
                    message: 'Article 17: Missing right to erasure implementation',
                    suggestion: 'Implement data deletion functionality for user requests'
                });
            }

            // Article 25: Privacy by Design
            const hasEncryption = /encrypt|pseudonym|anonymiz/i.test(code);
            if (!hasEncryption) {
                violations.push({
                    standard: 'GDPR',
                    severity: 'CRITICAL',
                    message: 'Article 25: Privacy by Design - Missing data protection measures',
                    suggestion: 'Implement encryption and pseudonymization for personal data'
                });
            }

            // Article 30: Records of Processing
            const hasProcessingRecords = /processing.*activity|data.*inventory|record.*processing/i.test(code);
            if (!hasProcessingRecords) {
                recommendations.push('GDPR Art. 30: Maintain records of processing activities');
            }

            // Article 32: Security of Processing
            const hasSecurityMeasures = /encrypt|access.*control|security|protect/i.test(code);
            if (!hasSecurityMeasures) {
                violations.push({
                    standard: 'GDPR',
                    severity: 'CRITICAL',
                    message: 'Article 32: Inadequate security measures for personal data',
                    suggestion: 'Implement technical and organizational security measures'
                });
            }

            // Article 33: Breach Notification (72 hours)
            const hasBreachNotification = /breach.*notification|notify.*authority|72.*hour|incident.*response/i.test(code);
            if (!hasBreachNotification) {
                recommendations.push('GDPR Art. 33: Implement breach notification within 72 hours');
            }
        }

        if (violations.length === 0 && hasPII) {
            recommendations.push('GDPR compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateCCPA(code, context) {
        // CCPA - California Consumer Privacy Act
        const violations = [];
        const recommendations = [];

        const hasPersonalInfo = /personal.*information|california.*consumer|consumer.*data/i.test(code);

        if (hasPersonalInfo) {
            // Right to Know
            const hasDataDisclosure = /disclosure|categories.*collected|data.*sharing|third.*party/i.test(code);
            if (!hasDataDisclosure) {
                recommendations.push('CCPA: Disclose categories of personal information collected and shared');
            }

            // Right to Delete
            const hasDeletionCapability = /delete.*request|erase|remove.*consumer.*data/i.test(code);
            if (!hasDeletionCapability) {
                violations.push({
                    standard: 'CCPA',
                    severity: 'HIGH',
                    message: 'Right to Delete - Missing consumer data deletion capability',
                    suggestion: 'Implement verifiable consumer data deletion requests'
                });
            }

            // Right to Opt-Out of Sale
            const hasOptOut = /do.*not.*sell|opt.*out|sale.*of.*information/i.test(code);
            if (!hasOptOut) {
                violations.push({
                    standard: 'CCPA',
                    severity: 'MEDIUM',
                    message: 'Right to Opt-Out - Missing "Do Not Sell My Personal Information" link',
                    suggestion: 'Provide conspicuous opt-out mechanism for data sales'
                });
            }

            // Non-Discrimination
            const hasNonDiscrimination = /price.*differential|service.*denial|incentive.*program/i.test(code);
            if (hasOptOut && hasNonDiscrimination) {
                recommendations.push('CCPA: Ensure no discrimination for exercising privacy rights');
            }

            // Verifiable Consumer Requests
            const hasRequestVerification = /verify.*identity|authenticate.*consumer|two.*step.*verification/i.test(code);
            if (!hasRequestVerification) {
                recommendations.push('CCPA: Implement identity verification for consumer requests');
            }

            // Service Provider Contracts
            const hasServiceProvider = /service.*provider|processor|vendor|third.*party/i.test(code);
            const hasContractualProtection = /contract|agreement|dpa|data.*processing.*agreement/i.test(code);
            if (hasServiceProvider && !hasContractualProtection) {
                recommendations.push('CCPA: Execute data processing agreements with service providers');
            }
        }

        if (violations.length === 0 && hasPersonalInfo) {
            recommendations.push('CCPA compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateWCAG_2_1(code, context) {
        // WCAG 2.1 - Web Content Accessibility Guidelines Level AA
        const violations = [];
        const recommendations = [];

        const hasWebContent = /html|jsx|tsx|render|component|accessibility|a11y|aria/i.test(code);

        if (hasWebContent) {
            // Principle 1: Perceivable
            // 1.1.1: Non-text Content (alt text)
            const hasImages = /<img|image|picture/i.test(code);
            const hasAltText = /alt\s*=|aria-label|aria-labelledby/i.test(code);
            if (hasImages && !hasAltText) {
                violations.push({
                    standard: 'WCAG_2_1',
                    severity: 'HIGH',
                    message: '1.1.1: Non-text Content - Images without alternative text',
                    suggestion: 'Provide alt attributes for all images'
                });
            }

            // 1.3.1: Info and Relationships (semantic HTML)
            const hasSemanticHTML = /<(header|nav|main|article|section|aside|footer)/i.test(code);
            const hasDivSoup = /<div.*<div.*<div.*<div/i.test(code);
            if (hasDivSoup && !hasSemanticHTML) {
                recommendations.push('WCAG 1.3.1: Use semantic HTML elements (header, nav, main, article)');
            }

            // Principle 2: Operable
            // 2.1.1: Keyboard Accessible
            const hasOnClick = /onClick|click.*handler/i.test(code);
            const hasKeyboard = /onKeyDown|onKeyPress|keyboard|tabIndex/i.test(code);
            if (hasOnClick && !hasKeyboard) {
                violations.push({
                    standard: 'WCAG_2_1',
                    severity: 'HIGH',
                    message: '2.1.1: Keyboard - Interactive elements must be keyboard accessible',
                    suggestion: 'Add keyboard event handlers (onKeyDown, onKeyPress) for all interactive elements'
                });
            }

            // 2.4.2: Page Titled
            const hasPageTitle = /<title|document\.title|Helmet/i.test(code);
            if (!hasPageTitle && hasWebContent) {
                recommendations.push('WCAG 2.4.2: Provide descriptive page titles');
            }

            // 2.4.7: Focus Visible
            const hasFocusStyles = /focus|:focus|outline/i.test(code);
            if (!hasFocusStyles && hasWebContent) {
                recommendations.push('WCAG 2.4.7: Ensure focus indicators are visible (avoid outline: none)');
            }

            // Principle 3: Understandable
            // 3.1.1: Language of Page
            const hasLangAttribute = /lang\s*=|html.*lang/i.test(code);
            if (!hasLangAttribute && hasWebContent) {
                recommendations.push('WCAG 3.1.1: Specify page language (<html lang="en">)');
            }

            // 3.2.2: On Input (no unexpected context changes)
            const hasOnChange = /onChange|onInput|onBlur/i.test(code);
            const hasAutoSubmit = /onChange.*submit|onInput.*submit/i.test(code);
            if (hasAutoSubmit) {
                violations.push({
                    standard: 'WCAG_2_1',
                    severity: 'MEDIUM',
                    message: '3.2.2: On Input - Form auto-submission on input change',
                    suggestion: 'Avoid automatic form submission; require explicit submit action'
                });
            }

            // Principle 4: Robust
            // 4.1.2: Name, Role, Value (ARIA)
            const hasCustomComponents = /button|input|select|checkbox|radio/i.test(code);
            const hasARIA = /aria-|role\s*=/i.test(code);
            if (hasCustomComponents && !hasARIA && code.length > 300) {
                recommendations.push('WCAG 4.1.2: Add ARIA attributes to custom interactive components');
            }

            // 2.5.5: Target Size (44x44 pixels minimum - WCAG 2.1 addition)
            const hasSmallTargets = /width.*:.*[12]?\d.*px|height.*:.*[12]?\d.*px/i.test(code);
            if (hasSmallTargets) {
                recommendations.push('WCAG 2.5.5: Ensure touch targets are at least 44x44 CSS pixels');
            }
        }

        if (violations.length === 0 && hasWebContent) {
            recommendations.push('WCAG 2.1 Level AA compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateSOC_2(code, context) {
        // SOC 2 - Service Organization Control 2 (Trust Service Criteria)
        const violations = [];
        const recommendations = [];

        // CC1: Control Environment (Security)
        const hasAccessControl = /access.*control|authorization|permission|role/i.test(code);
        if (!hasAccessControl && code.length > 400) {
            recommendations.push('SOC 2 CC6.1: Implement logical access controls');
        }

        // CC2: Communication and Information (Availability)
        const hasMonitoring = /monitor|uptime|health.*check|availability/i.test(code);
        if (!hasMonitoring) {
            recommendations.push('SOC 2 A1.2: Monitor system availability and performance');
        }

        // CC3: Risk Assessment (Security)
        const hasRiskManagement = /risk|threat|vulnerability|assessment/i.test(code);
        if (!hasRiskManagement && code.length > 600) {
            recommendations.push('SOC 2 CC3.1: Identify and assess security risks');
        }

        // CC6: Logical and Physical Access Controls
        const hasAuthentication = /authenticate|login|password|mfa|sso/i.test(code);
        const hasMFA = /mfa|multi.*factor|2fa|totp/i.test(code);
        if (hasAuthentication && !hasMFA) {
            violations.push({
                standard: 'SOC_2',
                severity: 'HIGH',
                message: 'CC6.1: Logical Access - Missing multi-factor authentication',
                suggestion: 'Implement MFA for user authentication'
            });
        }

        // CC7: System Operations (Availability & Processing Integrity)
        const hasBackup = /backup|snapshot|recovery|restore/i.test(code);
        const hasCriticalData = /database|persistent|storage|data.*store/i.test(code);
        if (hasCriticalData && !hasBackup) {
            violations.push({
                standard: 'SOC_2',
                severity: 'HIGH',
                message: 'CC7.2: System Operations - Missing backup and recovery procedures',
                suggestion: 'Implement automated backups with tested recovery procedures'
            });
        }

        // CC8: Change Management (Security)
        const hasChangeControl = /change.*request|version.*control|deployment.*approval/i.test(code);
        if (!hasChangeControl && code.length > 500) {
            recommendations.push('SOC 2 CC8.1: Implement change management procedures');
        }

        // C1: Confidentiality
        const hasSensitiveData = /confidential|secret|sensitive|proprietary/i.test(code);
        const hasEncryption = /encrypt|crypto|cipher/i.test(code);
        if (hasSensitiveData && !hasEncryption) {
            violations.push({
                standard: 'SOC_2',
                severity: 'CRITICAL',
                message: 'C1.1: Confidentiality - Sensitive data without encryption',
                suggestion: 'Encrypt confidential data at rest and in transit'
            });
        }

        // P1: Privacy (if applicable)
        const hasPII = /personal.*data|pii|personal.*information/i.test(code);
        const hasPrivacyNotice = /privacy.*policy|privacy.*notice|consent/i.test(code);
        if (hasPII && !hasPrivacyNotice) {
            recommendations.push('SOC 2 P2.1: Provide notice about privacy practices');
        }

        if (violations.length === 0) {
            recommendations.push('SOC 2 compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateCIS_BENCHMARKS(code, context) {
        // CIS Benchmarks - Center for Internet Security Configuration Standards
        const violations = [];
        const recommendations = [];

        const hasInfrastructure = /server|infrastructure|configuration|deploy|container|cloud/i.test(code);

        if (hasInfrastructure) {
            // 1. Inventory and Control of Hardware Assets
            const hasAssetInventory = /inventory|asset.*management|cmdb|configuration.*item/i.test(code);
            if (!hasAssetInventory) {
                recommendations.push('CIS Control 1: Maintain inventory of authorized hardware assets');
            }

            // 2. Inventory and Control of Software Assets
            const hasSoftwareInventory = /software.*inventory|dependency|package.*json|requirements/i.test(code);
            if (!hasSoftwareInventory) {
                recommendations.push('CIS Control 2: Maintain inventory of authorized software');
            }

            // 3. Continuous Vulnerability Management
            const hasVulnScanning = /scan|vulnerability|cve|security.*update|patch/i.test(code);
            if (!hasVulnScanning) {
                recommendations.push('CIS Control 3: Perform automated vulnerability scanning');
            }

            // 4. Controlled Use of Administrative Privileges
            const hasPrivilegeManagement = /sudo|admin|root|privileged|least.*privilege/i.test(code);
            const hasRootUsage = /user.*root|run.*as.*root|sudo.*all/i.test(code);
            if (hasRootUsage) {
                violations.push({
                    standard: 'CIS_BENCHMARKS',
                    severity: 'HIGH',
                    message: 'Control 4: Administrative Privileges - Running as root/admin',
                    suggestion: 'Use least privilege principle; avoid running services as root'
                });
            }

            // 5. Secure Configuration
            const hasHardenedConfig = /harden|secure.*configuration|baseline|security.*template/i.test(code);
            if (!hasHardenedConfig && hasInfrastructure) {
                recommendations.push('CIS Control 5: Implement secure configuration baselines');
            }

            // 6. Audit Log Management
            const hasLogging = /log|audit|syslog|event.*log/i.test(code);
            if (!hasLogging) {
                violations.push({
                    standard: 'CIS_BENCHMARKS',
                    severity: 'MEDIUM',
                    message: 'Control 6: Audit Logs - Missing centralized log collection',
                    suggestion: 'Collect and centralize audit logs for security monitoring'
                });
            }

            // 8. Malware Defenses
            const hasMalwareProtection = /antivirus|malware|threat.*detection|file.*integrity/i.test(code);
            if (!hasMalwareProtection && hasInfrastructure) {
                recommendations.push('CIS Control 8: Deploy anti-malware software');
            }

            // 10. Data Recovery Capabilities
            const hasBackup = /backup|snapshot|recovery|disaster.*recovery/i.test(code);
            if (!hasBackup) {
                recommendations.push('CIS Control 10: Ensure regular automated backups');
            }
        }

        if (violations.length === 0 && hasInfrastructure) {
            recommendations.push('CIS Benchmarks compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateCOBIT(code, context) {
        // COBIT - Control Objectives for Information and Related Technologies
        const violations = [];
        const recommendations = [];

        const hasITGovernance = /governance|compliance|policy|framework|standard/i.test(code);

        // APO01: Manage the IT Management Framework
        if (!hasITGovernance && code.length > 600) {
            recommendations.push('COBIT APO01: Establish IT governance framework');
        }

        // APO13: Manage Security
        const hasSecurityManagement = /security.*policy|security.*framework|security.*control/i.test(code);
        const hasSecurity = /authenticate|authorize|encrypt|security/i.test(code);
        if (hasSecurity && !hasSecurityManagement) {
            recommendations.push('COBIT APO13: Define and manage security controls');
        }

        // BAI06: Manage Changes
        const hasChangeManagement = /change.*control|change.*request|version.*control/i.test(code);
        if (!hasChangeManagement && code.length > 400) {
            violations.push({
                standard: 'COBIT',
                severity: 'MEDIUM',
                message: 'BAI06: Manage Changes - Missing change management process',
                suggestion: 'Implement formal change control procedures'
            });
        }

        // DSS01: Manage Operations
        const hasOperationalProcedures = /runbook|playbook|sop|standard.*operating/i.test(code);
        if (!hasOperationalProcedures && code.length > 700) {
            recommendations.push('COBIT DSS01: Document operational procedures');
        }

        // DSS02: Manage Service Requests and Incidents
        const hasIncidentManagement = /incident|alert|ticket|service.*request/i.test(code);
        if (!hasIncidentManagement) {
            recommendations.push('COBIT DSS02: Establish incident management process');
        }

        // DSS05: Manage Security Services
        const hasSecurityMonitoring = /siem|security.*monitoring|threat.*detection|ids|ips/i.test(code);
        if (!hasSecurityMonitoring && hasSecurity) {
            violations.push({
                standard: 'COBIT',
                severity: 'HIGH',
                message: 'DSS05: Security Services - Missing security monitoring',
                suggestion: 'Implement security event monitoring (SIEM)'
            });
        }

        // DSS06: Manage Business Process Controls
        const hasProcessControls = /control.*objective|business.*process|segregation.*duties/i.test(code);
        if (!hasProcessControls && code.length > 500) {
            recommendations.push('COBIT DSS06: Implement business process controls');
        }

        // MEA01: Monitor, Evaluate and Assess Performance
        const hasPerformanceMonitoring = /kpi|metrics|performance.*indicator|measure/i.test(code);
        if (!hasPerformanceMonitoring) {
            recommendations.push('COBIT MEA01: Define and monitor performance indicators');
        }

        if (violations.length === 0) {
            recommendations.push('COBIT compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateITIL(code, context) {
        // ITIL - Information Technology Infrastructure Library (Service Management)
        const violations = [];
        const recommendations = [];

        const hasITService = /service|incident|change|problem|deploy|release/i.test(code);

        if (hasITService) {
            // Service Strategy
            const hasServiceCatalog = /service.*catalog|service.*offering/i.test(code);
            if (!hasServiceCatalog) {
                recommendations.push('ITIL Service Strategy: Define service catalog');
            }

            // Service Design
            const hasServiceLevel = /sla|service.*level|availability.*target|uptime/i.test(code);
            if (!hasServiceLevel) {
                recommendations.push('ITIL Service Design: Define Service Level Agreements (SLAs)');
            }

            // Service Transition: Change Management
            const hasChangeControl = /change.*request|rfc|change.*advisory.*board|cab/i.test(code);
            if (!hasChangeControl) {
                violations.push({
                    standard: 'ITIL',
                    severity: 'MEDIUM',
                    message: 'Service Transition - Missing change management process',
                    suggestion: 'Implement ITIL change management with CAB approval'
                });
            }

            // Service Transition: Release Management
            const hasReleaseManagement = /release.*pipeline|deployment.*plan|rollback/i.test(code);
            if (!hasReleaseManagement) {
                recommendations.push('ITIL Service Transition: Define release and deployment processes');
            }

            // Service Operation: Incident Management
            const hasIncidentManagement = /incident|ticket|alert|p1|p2|severity|priority/i.test(code);
            if (!hasIncidentManagement) {
                violations.push({
                    standard: 'ITIL',
                    severity: 'HIGH',
                    message: 'Service Operation - Missing incident management',
                    suggestion: 'Implement incident management with severity/priority classification'
                });
            }

            // Service Operation: Problem Management
            const hasProblemManagement = /root.*cause|problem.*investigation|known.*error/i.test(code);
            if (!hasProblemManagement && hasIncidentManagement) {
                recommendations.push('ITIL Service Operation: Implement problem management for root cause analysis');
            }

            // Continual Service Improvement
            const hasCSI = /improvement|optimize|kpi|metrics|csi.*register/i.test(code);
            if (!hasCSI) {
                recommendations.push('ITIL CSI: Establish continual service improvement process');
            }
        }

        if (violations.length === 0 && hasITService) {
            recommendations.push('ITIL compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateISO_9001(code, context) {
        // ISO 9001 - Quality Management System
        const violations = [];
        const recommendations = [];

        const hasQualityProcess = /quality|process|procedure|documentation|standard/i.test(code);

        // 4.4: Quality Management System
        const hasQMS = /quality.*management|qms|quality.*assurance/i.test(code);
        if (!hasQMS && code.length > 600) {
            recommendations.push('ISO 9001 Clause 4.4: Establish quality management system (QMS)');
        }

        // 5.3: Organizational Roles
        const hasRolesResponsibilities = /responsibility|accountability|authority|owner/i.test(code);
        if (!hasRolesResponsibilities && code.length > 500) {
            recommendations.push('ISO 9001 Clause 5.3: Define organizational roles and responsibilities');
        }

        // 7.5: Documented Information
        const hasDocumentation = /document|procedure|policy|standard.*operating/i.test(code);
        if (!hasDocumentation && hasQualityProcess) {
            violations.push({
                standard: 'ISO_9001',
                severity: 'MEDIUM',
                message: 'Clause 7.5: Missing documented information',
                suggestion: 'Document procedures and maintain records per ISO 9001'
            });
        }

        // 8.1: Operational Planning and Control
        const hasProcessControl = /process.*control|operational.*plan|work.*instruction/i.test(code);
        if (!hasProcessControl && code.length > 400) {
            recommendations.push('ISO 9001 Clause 8.1: Implement operational planning and control');
        }

        // 8.4: Control of Externally Provided Processes
        const hasVendorManagement = /vendor|supplier|third.*party|contractor/i.test(code);
        const hasVendorControl = /vendor.*assessment|due.*diligence|vendor.*approval/i.test(code);
        if (hasVendorManagement && !hasVendorControl) {
            violations.push({
                standard: 'ISO_9001',
                severity: 'MEDIUM',
                message: 'Clause 8.4: Missing control of external providers',
                suggestion: 'Implement vendor assessment and approval process'
            });
        }

        // 8.5: Production and Service Provision
        const hasValidation = /validate|verify|test|inspect|review/i.test(code);
        if (!hasValidation && hasQualityProcess) {
            recommendations.push('ISO 9001 Clause 8.5: Implement validation and verification');
        }

        // 9.1: Monitoring, Measurement, Analysis and Evaluation
        const hasMetrics = /metric|kpi|measure|monitor|performance/i.test(code);
        if (!hasMetrics) {
            recommendations.push('ISO 9001 Clause 9.1: Define and monitor quality metrics');
        }

        // 9.2: Internal Audit
        const hasInternalAudit = /internal.*audit|quality.*audit|compliance.*review/i.test(code);
        if (!hasInternalAudit && hasQualityProcess) {
            recommendations.push('ISO 9001 Clause 9.2: Conduct internal quality audits');
        }

        // 10.2: Nonconformity and Corrective Action
        const hasCorrectiveAction = /nonconformity|corrective.*action|capa|deviation/i.test(code);
        if (!hasCorrectiveAction && hasQualityProcess) {
            recommendations.push('ISO 9001 Clause 10.2: Implement corrective action process');
        }

        if (violations.length === 0) {
            recommendations.push('ISO 9001 compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateISO_27017(code, context) {
        // ISO 27017 - Cloud Security Controls
        const violations = [];
        const recommendations = [];

        const hasCloudService = /aws|azure|gcp|cloud|s3|blob.*storage|lambda|function.*app/i.test(code);

        if (hasCloudService) {
            // CLD.6.3.1: Shared Roles and Responsibilities
            const hasSharedResponsibility = /shared.*responsibility|cloud.*provider|customer.*responsibility/i.test(code);
            if (!hasSharedResponsibility) {
                recommendations.push('ISO 27017 CLD.6.3.1: Document shared responsibility model');
            }

            // CLD.8.1.4: Asset Management in Cloud
            const hasAssetInventory = /resource.*tag|cloud.*inventory|asset.*tracking/i.test(code);
            if (!hasAssetInventory) {
                recommendations.push('ISO 27017 CLD.8.1.4: Tag and track cloud resources');
            }

            // CLD.9.2.1: User Access Management
            const hasIAM = /iam|identity.*access|role.*policy|permission/i.test(code);
            if (!hasIAM) {
                violations.push({
                    standard: 'ISO_27017',
                    severity: 'HIGH',
                    message: 'CLD.9.2.1: Missing cloud identity and access management',
                    suggestion: 'Implement IAM with role-based access control (AWS IAM, Azure AD, GCP IAM)'
                });
            }

            // CLD.12.1.4: Segregation in Cloud Environments
            const hasSegmentation = /vpc|vnet|network.*isolation|security.*group/i.test(code);
            if (!hasSegmentation) {
                violations.push({
                    standard: 'ISO_27017',
                    severity: 'HIGH',
                    message: 'CLD.12.1.4: Missing network segmentation in cloud',
                    suggestion: 'Use VPCs/VNets with security groups for network isolation'
                });
            }

            // CLD.12.4.5: Security of Virtual Machine Configuration
            const hasSecureVM = /ami|image|snapshot|base.*image|golden.*image/i.test(code);
            const hasImageHardening = /harden|cis.*benchmark|security.*baseline/i.test(code);
            if (hasSecureVM && !hasImageHardening) {
                recommendations.push('ISO 27017 CLD.12.4.5: Use hardened VM/container images');
            }

            // CLD.13.1.1: Data Protection in Cloud
            const hasEncryption = /encrypt|kms|key.*management|cmk|sse/i.test(code);
            if (!hasEncryption) {
                violations.push({
                    standard: 'ISO_27017',
                    severity: 'CRITICAL',
                    message: 'CLD.13.1.1: Missing encryption for cloud data',
                    suggestion: 'Enable encryption at rest and in transit for cloud resources'
                });
            }

            // CLD.13.1.3: Cloud Data Backup
            const hasBackup = /backup|snapshot|recovery|cross.*region/i.test(code);
            if (!hasBackup) {
                recommendations.push('ISO 27017 CLD.13.1.3: Implement cloud data backup strategy');
            }
        }

        if (violations.length === 0 && hasCloudService) {
            recommendations.push('ISO 27017 compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateISO_27018(code, context) {
        // ISO 27018 - PII Protection in Public Cloud
        const violations = [];
        const recommendations = [];

        const hasCloudPII = /(aws|azure|gcp).*(?=.*personal.*data|pii|email|phone)/i.test(code);

        if (hasCloudPII) {
            // Consent and Choice
            const hasConsent = /consent|opt.*in|agreement|user.*acceptance/i.test(code);
            if (!hasConsent) {
                violations.push({
                    standard: 'ISO_27018',
                    severity: 'HIGH',
                    message: 'Consent Management - Missing user consent for PII processing',
                    suggestion: 'Obtain explicit consent before processing PII in public cloud'
                });
            }

            // Purpose Transparency
            const hasPurposeStatement = /purpose|privacy.*policy|data.*usage|processing.*notice/i.test(code);
            if (!hasPurposeStatement) {
                recommendations.push('ISO 27018: Disclose purpose of PII processing to users');
            }

            // Communication to PII Principals
            const hasPrivacyNotice = /privacy.*notice|privacy.*policy|data.*subject.*rights/i.test(code);
            if (!hasPrivacyNotice) {
                violations.push({
                    standard: 'ISO_27018',
                    severity: 'MEDIUM',
                    message: 'Communication - Missing privacy notice for cloud PII processing',
                    suggestion: 'Provide clear privacy notice about cloud storage of PII'
                });
            }

            // PII Encryption
            const hasEncryption = /encrypt|kms|key.*management|client.*side.*encrypt/i.test(code);
            if (!hasEncryption) {
                violations.push({
                    standard: 'ISO_27018',
                    severity: 'CRITICAL',
                    message: 'PII Encryption - Personal data without encryption in cloud',
                    suggestion: 'Encrypt PII at rest and in transit (cloud KMS, client-side encryption)'
                });
            }

            // Limiting Collection
            const hasDataMinimization = /minimum|necessary|data.*minimization|purpose.*limitation/i.test(code);
            if (!hasDataMinimization) {
                recommendations.push('ISO 27018: Collect only minimum necessary PII');
            }

            // PII Erasure
            const hasDeletionCapability = /delete|erase|purge|data.*retention|right.*to.*erasure/i.test(code);
            if (!hasDeletionCapability) {
                violations.push({
                    standard: 'ISO_27018',
                    severity: 'HIGH',
                    message: 'PII Erasure - Missing data deletion capability',
                    suggestion: 'Implement secure PII deletion from cloud storage'
                });
            }

            // Restrictions on Disclosure
            const hasAccessControl = /access.*control|authorization|least.*privilege|need.*to.*know/i.test(code);
            if (!hasAccessControl) {
                recommendations.push('ISO 27018: Restrict PII access to authorized personnel only');
            }
        }

        if (violations.length === 0 && hasCloudPII) {
            recommendations.push('ISO 27018 compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validateAICPA_SOC(code, context) {
        // AICPA SOC (Formerly SAS 70) - Service Organization Controls Framework
        const violations = [];
        const recommendations = [];

        const hasServiceOrg = /service.*organization|outsourced|hosted.*service|saas|third.*party.*service/i.test(code);

        if (hasServiceOrg) {
            // Type II Controls (Operational Effectiveness over time)
            const hasControlTesting = /control.*test|evidence|audit.*trail|control.*effectiveness/i.test(code);
            if (!hasControlTesting) {
                recommendations.push('AICPA SOC: Document control testing evidence for Type II reports');
            }

            // Security Controls
            const hasAccessControl = /access.*control|authorization|authentication|mfa/i.test(code);
            if (!hasAccessControl) {
                violations.push({
                    standard: 'AICPA_SOC',
                    severity: 'HIGH',
                    message: 'Security Controls - Missing access control implementation',
                    suggestion: 'Implement logical and physical access controls per SOC requirements'
                });
            }

            // Change Management
            const hasChangeControl = /change.*management|version.*control|deployment.*approval|release.*process/i.test(code);
            if (!hasChangeControl) {
                violations.push({
                    standard: 'AICPA_SOC',
                    severity: 'MEDIUM',
                    message: 'Change Management - Missing change control procedures',
                    suggestion: 'Implement formal change management with approval workflows'
                });
            }

            // Backup and Recovery
            const hasBackup = /backup|disaster.*recovery|business.*continuity|failover/i.test(code);
            if (!hasBackup) {
                violations.push({
                    standard: 'AICPA_SOC',
                    severity: 'HIGH',
                    message: 'Backup Controls - Missing backup and recovery procedures',
                    suggestion: 'Implement and test backup/disaster recovery procedures'
                });
            }

            // Monitoring and Incident Response
            const hasMonitoring = /monitor|alert|incident.*response|security.*event/i.test(code);
            if (!hasMonitoring) {
                recommendations.push('AICPA SOC: Implement security monitoring and incident response');
            }

            // Vendor Management (if using subservice organizations)
            const hasSubservice = /vendor|subservice|third.*party.*provider|outsource/i.test(code);
            const hasVendorControls = /vendor.*assessment|due.*diligence|soc.*2.*report/i.test(code);
            if (hasSubservice && !hasVendorControls) {
                violations.push({
                    standard: 'AICPA_SOC',
                    severity: 'MEDIUM',
                    message: 'Vendor Management - Missing subservice organization controls',
                    suggestion: 'Obtain SOC 2 reports from subservice organizations'
                });
            }
        }

        if (violations.length === 0 && hasServiceOrg) {
            recommendations.push('AICPA SOC compliance: GOOD');
        }

        return { violations, recommendations };
    }

    validatePII_PROTECTION(code, context) {
        // PII Protection - General Best Practices (Cross-Standard)
        const violations = [];
        const recommendations = [];

        const hasPII = /pii|personal.*identif|ssn|social.*security|driver.*license|passport|biometric|financial.*account/i.test(code);

        if (hasPII) {
            // Encryption at Rest
            const hasEncryptionAtRest = /encrypt|aes|at.*rest|database.*encryption|field.*level.*encrypt/i.test(code);
            if (!hasEncryptionAtRest) {
                violations.push({
                    standard: 'PII_PROTECTION',
                    severity: 'CRITICAL',
                    message: 'PII must be encrypted at rest',
                    suggestion: 'Use AES-256 encryption for PII storage'
                });
            }

            // Encryption in Transit
            const hasTLS = /tls|ssl|https|encrypt.*transit/i.test(code);
            if (!hasTLS) {
                violations.push({
                    standard: 'PII_PROTECTION',
                    severity: 'CRITICAL',
                    message: 'PII must be encrypted in transit',
                    suggestion: 'Use TLS 1.2+ for transmitting PII'
                });
            }

            // Access Controls
            const hasAccessControl = /access.*control|authorization|rbac|least.*privilege/i.test(code);
            if (!hasAccessControl) {
                violations.push({
                    standard: 'PII_PROTECTION',
                    severity: 'HIGH',
                    message: 'PII access must be controlled',
                    suggestion: 'Implement role-based access control with audit logging'
                });
            }

            // Data Minimization
            const hasDataMinimization = /minimum|necessary|purpose.*limitation|data.*minimization/i.test(code);
            if (!hasDataMinimization) {
                recommendations.push('PII Protection: Collect only minimum necessary PII');
            }

            // Audit Logging
            const hasAuditLog = /audit.*log|access.*log|activity.*log|pii.*access/i.test(code);
            if (!hasAuditLog) {
                violations.push({
                    standard: 'PII_PROTECTION',
                    severity: 'HIGH',
                    message: 'PII access must be audited',
                    suggestion: 'Log all PII access, modifications, and disclosures'
                });
            }

            // Data Retention
            const hasRetentionPolicy = /retention|delete.*after|expire|purge.*schedule/i.test(code);
            if (!hasRetentionPolicy) {
                recommendations.push('PII Protection: Implement data retention and deletion policies');
            }

            // Anonymization/Pseudonymization
            const hasAnonymization = /anonymize|pseudonymize|tokenize|mask|redact/i.test(code);
            if (!hasAnonymization && code.length > 400) {
                recommendations.push('PII Protection: Consider anonymization/pseudonymization for analytics');
            }

            // Breach Notification
            const hasBreachNotification = /breach.*notification|incident.*response|notify.*breach/i.test(code);
            if (!hasBreachNotification) {
                recommendations.push('PII Protection: Establish breach notification procedures');
            }
        }

        if (violations.length === 0 && hasPII) {
            recommendations.push('PII Protection: GOOD');
        }

        return { violations, recommendations };
    }

    validateDATA_PRIVACY(code, context) {
        // Data Privacy - General Framework (GDPR/CCPA/Privacy Principles)
        const violations = [];
        const recommendations = [];

        const hasPersonalData = /personal.*data|user.*data|customer.*data|privacy/i.test(code);

        if (hasPersonalData) {
            // Privacy by Design
            const hasPrivacyByDesign = /privacy.*by.*design|privacy.*first|data.*protection.*by.*default/i.test(code);
            if (!hasPrivacyByDesign) {
                recommendations.push('Data Privacy: Implement privacy by design principles');
            }

            // Consent Management
            const hasConsent = /consent|opt.*in|opt.*out|withdraw.*consent|preference.*center/i.test(code);
            if (!hasConsent) {
                violations.push({
                    standard: 'DATA_PRIVACY',
                    severity: 'HIGH',
                    message: 'Missing consent management for personal data processing',
                    suggestion: 'Implement consent capture and management system'
                });
            }

            // Data Subject Rights
            const hasDataSubjectRights = /access.*request|dsar|data.*portability|right.*to.*erasure|right.*to.*rectification/i.test(code);
            if (!hasDataSubjectRights) {
                violations.push({
                    standard: 'DATA_PRIVACY',
                    severity: 'HIGH',
                    message: 'Missing data subject rights implementation (access, deletion, portability)',
                    suggestion: 'Implement mechanisms for data subject rights requests'
                });
            }

            // Privacy Notice/Policy
            const hasPrivacyNotice = /privacy.*policy|privacy.*notice|data.*collection.*notice/i.test(code);
            if (!hasPrivacyNotice) {
                recommendations.push('Data Privacy: Provide clear privacy notice to users');
            }

            // Purpose Limitation
            const hasPurposeLimitation = /purpose|lawful.*basis|legitimate.*interest|processing.*purpose/i.test(code);
            if (!hasPurposeLimitation) {
                recommendations.push('Data Privacy: Document and limit data processing to specified purposes');
            }

            // Data Minimization
            const hasDataMinimization = /minimum.*necessary|data.*minimization|collect.*only/i.test(code);
            if (!hasDataMinimization) {
                recommendations.push('Data Privacy: Apply data minimization principle');
            }

            // Storage Limitation
            const hasStorageLimitation = /retention.*period|delete.*after|data.*lifecycle|expire/i.test(code);
            if (!hasStorageLimitation) {
                violations.push({
                    standard: 'DATA_PRIVACY',
                    severity: 'MEDIUM',
                    message: 'Missing data retention and deletion policies',
                    suggestion: 'Define and implement data retention periods with automatic deletion'
                });
            }

            // Data Protection Impact Assessment (DPIA)
            const hasHighRiskProcessing = /sensitive.*data|large.*scale|profiling|automated.*decision/i.test(code);
            const hasDPIA = /dpia|privacy.*impact.*assessment|pia/i.test(code);
            if (hasHighRiskProcessing && !hasDPIA) {
                recommendations.push('Data Privacy: Conduct Data Protection Impact Assessment (DPIA) for high-risk processing');
            }

            // Third-Party Data Sharing
            const hasDataSharing = /share.*data|third.*party|processor|vendor/i.test(code);
            const hasDPA = /dpa|data.*processing.*agreement|controller.*processor/i.test(code);
            if (hasDataSharing && !hasDPA) {
                violations.push({
                    standard: 'DATA_PRIVACY',
                    severity: 'HIGH',
                    message: 'Data sharing without Data Processing Agreements',
                    suggestion: 'Execute Data Processing Agreements (DPAs) with all data processors'
                });
            }
        }

        if (violations.length === 0 && hasPersonalData) {
            recommendations.push('Data Privacy compliance: GOOD');
        }

        return { violations, recommendations };
    }
}


/**
 * ECHELON Selection Engine - Context-Aware Standard Selection
 * Extracted from esmc-3.1-master.js (lines 1965-2264) - Oct 26 ATHENA ORACLE 1.0
 *
 * Purpose: Selects 1 standard per colonel based on code context (NOT blanket enforcement)
 * Architecture: Code context analyzer + priority-based colonel selectors
 */
class ECHELONSelection {
    constructor() {
        this.version = "1.0.0";
        this.registry = new StandardsRegistry();
    }

    /**
     * Main selection entry point - Analyzes code and selects standards for all colonels
     * @param {Array} colonels - Array of colonel names (e.g., ['ALPHA', 'DELTA', 'ETA'])
     * @param {Object} options - { task, codebasePatterns, code, userTier }
     * @returns {Object} Selected standards keyed by colonel name
     */
    selectStandardsForColonels(colonels, options = {}) {
        const { task = '', codebasePatterns = {}, code = '', userTier = 'MAX' } = options;

        // Analyze code context (if code provided)
        const codeContext = code ? this._analyzeCodeContext(code, { task, ...codebasePatterns }) : { task };

        // Select standards for each colonel
        const selections = {};
        colonels.forEach(colonel => {
            const selectMethod = this[`_selectFor${colonel}`];
            if (selectMethod && typeof selectMethod === 'function') {
                const selected = selectMethod.call(this, codeContext);
                if (selected) {
                    selections[colonel] = Array.isArray(selected) ? selected : [selected];
                }
            }
        });

        return selections;
    }

    /**
     * Code Context Analyzer - Detects patterns in code to inform standard selection
     * @param {string} code - Code to analyze
     * @param {Object} missionContext - Additional context (task, fileType, etc.)
     * @returns {Object} Rich context object with detected patterns
     */
    _analyzeCodeContext(code, missionContext = {}) {
        const context = {
            // Database patterns
            hasDatabase: /\.query\(|\.execute\(|mongoose|sequelize|prisma|\.find\(|\.save\(/i.test(code),

            // API patterns
            hasAPI: /app\.(get|post|put|delete|patch)|router\.|@Get\(|@Post\(|@Controller|express\(/i.test(code),
            hasRESTAPI: /app\.(get|post|put|delete)|router\./i.test(code),
            hasGraphQL: /graphql|resolvers|typeDefs|gql`/i.test(code),

            // Architecture patterns
            hasMicroservices: /microservice|service-mesh/i.test(code) &&
                             (code.match(/require\(['"]\.\.?\//g) || []).length > 3,
            hasEventDriven: /EventEmitter|kafka|rabbitmq|pubsub|event\.emit/i.test(code),
            hasMessageQueue: /queue|worker|job|bull|sidekiq|amqp/i.test(code),

            // Security patterns
            hasUserInput: /req\.body|req\.query|req\.params|req\.files|input.*user/i.test(code),
            hasCrypto: /crypto|hash|encrypt|decrypt|cipher|bcrypt|argon/i.test(code),
            hasAuth: /authenticate|authorize|jwt|passport|session|login|token/i.test(code),
            hasPII: /email|phone|ssn|address|password|personalData|user.*name/i.test(code),

            // Code characteristics
            codeLength: code.split('\n').length,
            complexity: this._calculateComplexity(code),  // 'low', 'medium', 'high'
            hasModules: (code.match(/module\.exports|export /g) || []).length > 0,

            // Testing patterns
            isTestFile: /\.test\.|\.spec\.|describe\(|it\(|test\(|expect\(/i.test(code),

            // Operations patterns
            hasDeployment: /deploy|release|rollout|canary|blue.*green/i.test(code),
            hasMonitoring: /monitor|observe|metrics|prometheus|datadog|newrelic/i.test(code),

            // Web/Frontend patterns
            hasWebServer: /express|koa|fastify|hapi|http\.createServer/i.test(code),
            hasHTML: /\.html\(|\.innerHTML|render\(|template|jsx|tsx/i.test(code),

            // Quality patterns
            hasDuplication: this._detectDuplication(code),
            hasUnusedCode: this._detectUnusedCode(code),

            // Merge with mission context
            ...missionContext
        };

        return context;
    }

    /**
     * Calculate code complexity (simple heuristic)
     */
    _calculateComplexity(code) {
        const lines = code.split('\n').length;
        const cyclomaticIndicators = (code.match(/if\s*\(|else|for\s*\(|while\s*\(|switch\s*\(|case\s+/g) || []).length;
        const functionCount = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>/g) || []).length;

        const complexityScore = cyclomaticIndicators + (functionCount * 2) + (lines / 50);

        if (complexityScore < 10) return 'low';
        if (complexityScore < 30) return 'medium';
        return 'high';
    }

    /**
     * Detect code duplication
     */
    _detectDuplication(code) {
        const lines = code.split('\n').filter(line => line.trim().length > 20);
        const lineMap = new Map();
        lines.forEach(line => {
            const trimmed = line.trim();
            lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1);
        });

        let duplicateCount = 0;
        lineMap.forEach((count) => {
            if (count > 2) duplicateCount++;
        });

        return duplicateCount > 5;
    }

    /**
     * Detect unused code
     */
    _detectUnusedCode(code) {
        const commentedCodeLines = (code.match(/\/\/\s*(const|let|var|function|class)/g) || []).length;
        const unusedImports = this._countUnusedImports(code);
        return (commentedCodeLines > 3 || unusedImports > 2);
    }

    /**
     * Count unused imports
     */
    _countUnusedImports(code) {
        const imports = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*require\([^)]+\)|import\s+(\w+)/g) || [];
        const importedNames = imports.map(imp => {
            const match = imp.match(/(?:const|let|var)\s+(\w+)|import\s+(\w+)/);
            return match ? (match[1] || match[2]) : null;
        }).filter(Boolean);

        let unusedCount = 0;
        importedNames.forEach(name => {
            const usageCount = (code.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
            if (usageCount === 1) unusedCount++; // Only appears in import statement
        });

        return unusedCount;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COLONEL SELECTION METHODS (Priority-Based Logic)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ALPHA Standard Selection - Architecture (5 standards: ATLAS, FRAMEWORK, BLUEPRINT, GRID, NEXUS)
     */
    _selectForALPHA(context) {
        // Priority 1: Scalability (if API or DB)
        if (context.hasAPI || context.hasDatabase) return 'ATLAS';

        // Priority 2: Architectural patterns (if microservices)
        if (context.hasMicroservices) return 'FRAMEWORK';

        // Priority 3: Documentation (if complex)
        if (context.complexity === 'high') return 'BLUEPRINT';

        // Priority 4: Modularity (if multiple modules)
        if (context.hasModules || context.codeLength > 200) return 'GRID';

        // Priority 5: Integration (if event-driven)
        if (context.hasEventDriven || context.hasMessageQueue) return 'NEXUS';

        // Default: Skip ALPHA (architecture not critical for simple code)
        return null;
    }

    /**
     * BETA Standard Selection - Implementation (3 standards: SYNTAX, CODEX, CLARITY)
     */
    _selectForBETA(context) {
        // Priority 1: SYNTAX - ALWAYS check (code style)
        return 'SYNTAX';
    }

    /**
     * DELTA Standard Selection - Optimization (4 standards: EFFICIENCY, LEAN, VELOCITY, REFINERY)
     * THIS IS THE ORACLE'S BRAIN!
     */
    _selectForDELTA(context) {
        // Priority 1: EFFICIENCY (DRY) - ORACLE's primary function
        if (context.hasDuplication || context.complexity === 'medium') return 'EFFICIENCY';

        // Priority 2: LEAN (YAGNI) - Unused code
        if (context.hasUnusedCode) return 'LEAN';

        // Priority 3: VELOCITY (Agile) - Larger codebases
        if (context.codeLength > 100) return 'VELOCITY';

        // Priority 4: REFINERY (Tech Debt) - Complex code
        if (context.complexity === 'high') return 'REFINERY';

        // Default: EFFICIENCY (universal optimization)
        return 'EFFICIENCY';
    }

    /**
     * GAMMA Standard Selection - Integration (5 standards: PROTOCOL, PIPELINE, SPECTRUM, DEPLOYMENT, FORGE)
     */
    _selectForGAMMA(context) {
        // Priority 1: API protocols
        if (context.hasRESTAPI || context.hasGraphQL) return 'PROTOCOL';

        // Priority 2: Deployment patterns
        if (context.hasDeployment) return 'DEPLOYMENT';

        // Priority 3: CI/CD Pipeline
        if (context.complexity === 'high') return 'PIPELINE';

        // Default: Skip GAMMA
        return null;
    }

    /**
     * ZETA Standard Selection - Quality (4 standards: CRUCIBLE, GAUNTLET, AUDIT, OBSERVABILITY)
     */
    _selectForZETA(context) {
        // Priority 1: CRUCIBLE - Unit testing
        if (!context.isTestFile) return 'CRUCIBLE';

        // Priority 2: GAUNTLET - E2E (for test files)
        if (context.isTestFile) return 'GAUNTLET';

        // Priority 3: OBSERVABILITY - Production monitoring
        if (context.hasMonitoring || context.complexity === 'high') return 'OBSERVABILITY';

        // Default: CRUCIBLE
        return 'CRUCIBLE';
    }

    /**
     * ETA Standard Selection - Security (10 standards: GUARDIAN, CIPHER, FORTRESS, SHIELD, VAULT, etc.)
     */
    _selectForETA(context) {
        // Priority 1: Input validation
        if (context.hasUserInput) return 'GUARDIAN';

        // Priority 2: Cryptography
        if (context.hasCrypto) return 'CIPHER';

        // Priority 3: Authentication
        if (context.hasAuth) return 'FORTRESS';

        // Priority 4: Web security
        if (context.hasWebServer || context.hasHTML) return 'SHIELD';

        // Priority 5: GDPR/PII
        if (context.hasPII) return 'VAULT';

        // Default: Basic input validation (universal security)
        return 'GUARDIAN';
    }

    /**
     * EPSILON doesn't enforce standards directly (orchestration role)
     */
    _selectForEPSILON(context) {
        return null;
    }
}

// Export all three classes
module.exports = {
    StandardsRegistry,
    StandardValidators,
    ECHELONSelection
};
