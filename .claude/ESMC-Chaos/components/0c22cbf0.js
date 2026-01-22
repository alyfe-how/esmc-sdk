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
/** ESMC 3.70.0 DKI | 2025-11-07 | v3.70.0 | PROD | ALL_TIERS
 *  Purpose: Domain knowledge integration - industry language & compliance (HIPAA, PCI DSS, GDPR, SOC 2)
 *  Features: Industry standards | Compliance validation | Domain patterns | Best practices | ATLAS memory integration
 *  🆕 ESMC 3.70: bf98e40d.js integration (31 coding standards) + MySQL graceful degradation
 */

// 🆕 ESMC 4.1: mysql2 moved to dynamic require for SDK compatibility (graceful fallback)
const AtlasRetrievalSystem = require('./4bb69ab9.js'); // 3-tier memory retrieval
const { StandardsRegistry } = require('./bf98e40d.js'); // 🆕 ESMC 3.70: 31 engineering standards

class DKIDomainKnowledgeEngine {
    constructor(dbConfig = null) {
        this.dbConfig = dbConfig || {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'battlefield_intelligence'
        };

        this.connection = null;
        this.atlas = null; // ATLAS 3.13: Memory + Structural awareness
        this.echoContext = null; // 🆕 ESMC 3.22: ECHO working memory (current conversation)

        // Supported domains
        this.DOMAINS = {
            HEALTHCARE: 'HEALTHCARE',
            FINANCE: 'FINANCE',
            NONPROFIT: 'NONPROFIT',
            ECOMMERCE: 'ECOMMERCE',
            EDUCATION: 'EDUCATION',
            GOVERNMENT: 'GOVERNMENT',
            SAAS: 'SAAS',
            PERSONAL_DATA: 'PERSONAL_DATA'
        };

        // Compliance severity levels
        this.COMPLIANCE_SEVERITY = {
            CRITICAL: 'CRITICAL',  // Legal requirement, non-negotiable
            HIGH: 'HIGH',          // Industry standard, strongly recommended
            MEDIUM: 'MEDIUM',      // Best practice
            LOW: 'LOW'             // Optional enhancement
        };

        // In-memory cache for domain knowledge
        this.domainCache = {};

        // 🆕 ESMC 3.70: Standards Registry integration (graceful degradation)
        this.standardsRegistry = null;
        try {
            this.standardsRegistry = new StandardsRegistry();
            console.log('   ✅ DKI: Standards Registry loaded (70 standards available)');
        } catch (error) {
            console.warn('   ⚠️ DKI: Standards Registry unavailable:', error.message);
        }

        // 🆕 ESMC 3.70: Domain→Standards mapping matrix (31→70 standards expansion)
        this.domainStandardsMap = {
            HEALTHCARE: [
                // Security & Compliance (original)
                'VAULT', 'COMPLIANCE', 'CIPHER', 'FORTRESS', 'GUARDIAN', 'OBSERVABILITY',
                // Industry standards (ESMC 3.70)
                'HIPAA', 'NIST', 'ISO27701', 'CCPA', 'OWASP', 'THREAT_MODELING', 'SECURE_SDLC', 'SECRETS_MANAGEMENT',
                // Testing & Operations
                'SECURITY_TESTING', 'A11Y_TESTING', 'WCAG', 'CONTAINER_SECURITY', 'SRE', 'IAC'
            ],
            FINANCE: [
                // Security & Compliance (original)
                'CIPHER', 'FORTRESS', 'SENTINEL', 'COMPLIANCE', 'GUARDIAN', 'VAULT', 'CITADEL',
                // Industry standards (ESMC 3.70)
                'PCI_DSS', 'NIST', 'ISO27017', 'OWASP', 'CIS', 'THREAT_MODELING', 'SECURE_SDLC', 'SECRETS_MANAGEMENT',
                // Architecture & Testing
                'TWELVE_FACTOR', 'CLOUD_NATIVE', 'MICROSERVICES', 'SECURITY_TESTING', 'PERFORMANCE_TESTING',
                // Operations
                'SRE', 'IAC', 'CONTAINER_SECURITY', 'CHAOS_ENGINEERING'
            ],
            PERSONAL_DATA: [
                // Security & Compliance (original)
                'VAULT', 'GUARDIAN', 'CIPHER', 'FORTRESS', 'COMPLIANCE',
                // Industry standards (ESMC 3.70)
                'CCPA', 'ISO27701', 'NIST', 'OWASP', 'SECURE_SDLC', 'SECRETS_MANAGEMENT',
                // Testing
                'SECURITY_TESTING', 'A11Y_TESTING'
            ],
            GOVERNMENT: [
                // Security & Compliance (original)
                'COMPLIANCE', 'CITADEL', 'CIPHER', 'SENTINEL', 'FORTRESS',
                // Industry standards (ESMC 3.70)
                'FEDRAMP', 'NIST', 'ISO27017', 'ISO27701', 'CIS', 'THREAT_MODELING', 'SECURE_SDLC',
                // Architecture & Operations
                'CLOUD_NATIVE', 'TWELVE_FACTOR', 'IAC', 'GITOPS', 'CONTAINER_SECURITY', 'SRE'
            ],
            ECOMMERCE: [
                // Security & Compliance (original)
                'FORTRESS', 'CIPHER', 'SHIELD', 'GUARDIAN', 'PROTOCOL', 'SENTINEL',
                // Industry standards (ESMC 3.70)
                'PCI_DSS', 'OWASP', 'CCPA', 'THREAT_MODELING', 'SECRETS_MANAGEMENT',
                // Architecture
                'TWELVE_FACTOR', 'MICROSERVICES', 'OPENAPI', 'API_VERSIONING', 'EVENT_DRIVEN',
                // Testing & Operations
                'PERFORMANCE_TESTING', 'SECURITY_TESTING', 'A11Y_TESTING', 'WCAG', 'MOBILE_FIRST',
                'SRE', 'IAC', 'CONTAINER_SECURITY', 'CHAOS_ENGINEERING'
            ],
            EDUCATION: [
                // Security & Compliance (original)
                'VAULT', 'GUARDIAN', 'FORTRESS', 'COMPLIANCE', 'CIPHER',
                // Industry standards (ESMC 3.70)
                'CCPA', 'ISO27701', 'OWASP', 'SECURE_SDLC',
                // Accessibility & Testing
                'WCAG', 'A11Y_TESTING', 'MOBILE_FIRST', 'SECURITY_TESTING'
            ],
            SAAS: [
                // Architecture (original)
                'ATLAS', 'PROTOCOL', 'NEXUS', 'RESILIENCE', 'OBSERVABILITY', 'FORTRESS', 'SENTINEL', 'PIPELINE',
                // Industry standards - Architecture (ESMC 3.70)
                'TWELVE_FACTOR', 'CLOUD_NATIVE', 'MICROSERVICES', 'EVENT_DRIVEN', 'OPENAPI', 'GRAPHQL_BEST', 'API_VERSIONING', 'SERVERLESS',
                // Security
                'OWASP', 'NIST', 'ISO27017', 'THREAT_MODELING', 'SECURE_SDLC', 'SECRETS_MANAGEMENT',
                // Code Quality
                'SOLID', 'CLEAN_CODE', 'CODE_SMELLS', 'IMMUTABILITY', 'ERROR_HANDLING',
                // Testing
                'TDD', 'BDD', 'PERFORMANCE_TESTING', 'SECURITY_TESTING', 'A11Y_TESTING',
                // Operations
                'SRE', 'IAC', 'GITOPS', 'CONTAINER_SECURITY', 'CHAOS_ENGINEERING'
            ],
            NONPROFIT: [
                // Security & Compliance (original)
                'VAULT', 'CIPHER', 'GUARDIAN', 'FORTRESS', 'COMPLIANCE',
                // Industry standards (ESMC 3.70)
                'CCPA', 'OWASP', 'SECURE_SDLC',
                // Accessibility
                'WCAG', 'A11Y_TESTING', 'MOBILE_FIRST'
            ]
        };
    }

    /**
     * Initialize database connection and load domain knowledge
     * 🆕 ESMC 3.70: MySQL graceful degradation (pattern from ESMC 3.69.1 - epsilon-athena-coordinator)
     */
    async initialize() {
        // Initialize ATLAS first (no dependencies)
        try {
            this.atlas = new AtlasRetrievalSystem();
            await this.atlas.loadProjectIndex();
            console.log('   ✅ DKI: ATLAS initialized');
        } catch (atlasError) {
            console.warn('   ⚠️ DKI: ATLAS initialization failed (non-blocking):', atlasError.message);
        }

        // Try MySQL connection (graceful degradation if unavailable)
        try {
            // 🆕 ESMC 4.1: Dynamic require for SDK compatibility
            const mysql = require('mysql2/promise');
            this.connection = await mysql.createConnection(this.dbConfig);
            console.log('   ✅ DKI: MySQL connection established');

            // Preload all domain knowledge into memory cache
            await this._loadDomainKnowledgeCache();
        } catch (dbError) {
            console.log('   ⚠️ DKI: MySQL unavailable - using Standards Registry fallback');
            console.log('   📊 DKI: 70 engineering standards available via bf98e40d.js');
            // Graceful degradation: DKI continues with Standards Registry
        }

        return true; // Always return true (graceful degradation)
    }

    /**
     * Load all domain knowledge into memory cache for fast access
     */
    async _loadDomainKnowledgeCache() {
        try {
            const [rows] = await this.connection.execute(`
                SELECT domain_name, display_name, description, industry_standards,
                       compliance_requirements, terminology_mappings, best_practices, pattern_library
                FROM domain_knowledge
            `);

            for (const row of rows) {
                this.domainCache[row.domain_name] = {
                    displayName: row.display_name,
                    description: row.description,
                    industryStandards: JSON.parse(row.industry_standards || '[]'),
                    complianceRequirements: JSON.parse(row.compliance_requirements || '{}'),
                    terminologyMappings: JSON.parse(row.terminology_mappings || '{}'),
                    bestPractices: JSON.parse(row.best_practices || '{}'),
                    patternLibrary: JSON.parse(row.pattern_library || '{}')
                };
            }

            console.log(`✅ DKI Engine - Loaded ${Object.keys(this.domainCache).length} domain knowledge libraries`);

        } catch (error) {
            console.error('❌ DKI Engine - Failed to load domain knowledge:', error.message);
        }
    }

    /**
     * 🆕 ESMC 3.34 P0-1: Quick T1/T2 pre-check to avoid expensive T3 scan
     * Checks if ATLAS T1 (recent) + T2 (topic) contain sufficient domain patterns
     * @param {array} keywords - CIE-extracted keywords from user prompt
     * @returns {Promise<object>} { sufficient: bool, confidence: 0-1, patterns: [] }
     */
    async quickT1T2Scan(keywords) {
        if (!this.atlas) {
            return { sufficient: false, confidence: 0, patterns: [], reason: 'ATLAS not initialized' };
        }

        try {
            const patterns = [];
            let t1Relevance = 0;
            let t2Relevance = 0;

            // Check T1 (recent sessions) - reuse workingMemory.atlasT1Results if available
            if (global.workingMemory?.atlasT1Results) {
                const t1Data = global.workingMemory.atlasT1Results;
                for (const session of t1Data) {
                    // Match keywords against session keywords, key_topics, summary
                    const matchCount = keywords.filter(kw => {
                        const kwLower = kw.toLowerCase();
                        return session.keywords?.some(sk => sk.toLowerCase().includes(kwLower)) ||
                               session.key_topics?.some(kt => kt.toLowerCase().includes(kwLower)) ||
                               session.summary?.toLowerCase().includes(kwLower);
                    }).length;

                    if (matchCount > 0) {
                        t1Relevance += matchCount / keywords.length;
                        patterns.push({
                            source: 'T1_recent',
                            session_id: session.session_id,
                            relevance: matchCount / keywords.length,
                            matched_keywords: keywords.slice(0, matchCount)
                        });
                    }
                }
                t1Relevance = Math.min(t1Relevance, 1.0); // Cap at 1.0
            }

            // Check T2 (topic index) - lightweight query
            try {
                const fs = require('fs').promises;
                const path = require('path');
                const topicIndexPath = path.join(process.cwd(), '.claude/memory/.topic-index.json');
                const topicIndexContent = await fs.readFile(topicIndexPath, 'utf8');
                const topicIndex = JSON.parse(topicIndexContent);

                for (const topic of topicIndex.topics || []) {
                    const matchCount = keywords.filter(kw => {
                        const kwLower = kw.toLowerCase();
                        return topic.name.toLowerCase().includes(kwLower) ||
                               topic.aliases?.some(a => a.toLowerCase().includes(kwLower)) ||
                               topic.keywords?.some(tk => tk.toLowerCase().includes(kwLower));
                    }).length;

                    if (matchCount > 0) {
                        t2Relevance += matchCount / keywords.length;
                        patterns.push({
                            source: 'T2_topic',
                            topic_name: topic.name,
                            relevance: matchCount / keywords.length,
                            matched_keywords: keywords.slice(0, matchCount)
                        });
                    }
                }
                t2Relevance = Math.min(t2Relevance, 1.0); // Cap at 1.0
            } catch (t2Error) {
                // T2 not available - not a failure, just skip
                console.log('   📋 DKI: T2 topic index not available, using T1 only');
            }

            // Calculate joint confidence: T1 (60%) + T2 (40%)
            const jointConfidence = (t1Relevance * 0.6) + (t2Relevance * 0.4);

            // Decision threshold: 70% confidence = sufficient
            const sufficient = jointConfidence >= 0.70;

            return {
                sufficient,
                confidence: jointConfidence,
                patterns: patterns.slice(0, 5), // Top 5 patterns
                t1_relevance: t1Relevance,
                t2_relevance: t2Relevance,
                reason: sufficient ?
                    `T1/T2 confidence ${(jointConfidence * 100).toFixed(0)}% >= 70% threshold` :
                    `T1/T2 confidence ${(jointConfidence * 100).toFixed(0)}% < 70% threshold - escalating to T3`
            };
        } catch (error) {
            console.warn(`   ⚠️ DKI: quickT1T2Scan failed: ${error.message}`);
            return { sufficient: false, confidence: 0, patterns: [], reason: error.message };
        }
    }

    /**
     * Main entry point: Detect domain and apply domain knowledge
     *
     * @param {string} userCommand - Raw user command
     * @param {object} projectContext - Project metadata (domain, tech stack, etc.)
     * @param {number} missionId - ESMC mission ID
     * @returns {Promise<object>} Domain analysis result
     */
    async analyzeDomain(userCommand, projectContext = {}, missionId = null, keywords = []) {
        console.log(`\n🏢 DKI - DOMAIN KNOWLEDGE INTEGRATION ANALYSIS`);

        try {
            // 🆕 ESMC 3.34 P0-1: Quick T1/T2 pre-check before expensive T3 scan
            if (keywords && keywords.length > 0) {
                const preCheck = await this.quickT1T2Scan(keywords);
                console.log(`   🔍 DKI T1/T2 Pre-Check: ${preCheck.reason}`);

                if (preCheck.sufficient) {
                    // Sufficient patterns found in T1/T2 - skip T3 scan (150 token savings)
                    console.log(`   ✅ DKI: T1/T2 sufficient (confidence ${(preCheck.confidence * 100).toFixed(0)}%), skipping T3 scan (150 tokens saved)`);

                    // Synthesize result from T1/T2 patterns + universal standards
                    return this._synthesizeFromT1T2(preCheck, userCommand, projectContext);
                } else {
                    // Low confidence - continue to full T3 scan
                    console.log(`   ⚠️ DKI: Low T1/T2 confidence (${(preCheck.confidence * 100).toFixed(0)}%), escalating to full T3 scan`);
                }
            }

            // Step 1: Detect domain(s) from command + context
            const detectedDomains = await this._detectDomains(userCommand, projectContext);

            // Step 2: Load applicable standards for detected domains
            const applicableStandards = await this._getApplicableStandards(detectedDomains);

            // Step 3: Identify compliance requirements
            const complianceRequirements = await this._identifyComplianceRequirements(detectedDomains, userCommand);

            // Step 4: Map industry terminology
            const terminologyMappings = await this._mapTerminology(detectedDomains, userCommand);

            // Step 5: Suggest domain-specific patterns
            const suggestedPatterns = await this._suggestDomainPatterns(detectedDomains, userCommand);

            // Step 5.5: 🆕 ESMC 3.70: Get domain-relevant engineering standards
            const domainStandards = this._getDomainStandards(detectedDomains);

            // Step 6: Validate against best practices
            const bestPractices = await this._getBestPractices(detectedDomains);

            // Step 7: Generate compliance checklist
            const complianceChecklist = this._generateComplianceChecklist(complianceRequirements);

            const result = {
                detectedDomains,
                applicableStandards,
                complianceRequirements,
                terminologyMappings,
                suggestedPatterns,
                domainStandards, // 🆕 ESMC 3.70: Engineering standards from bf98e40d.js
                bestPractices,
                complianceChecklist,
                timestamp: new Date().toISOString(),
                esmcVersion: '3.70.0' // 🆕 Version tracking
            };

            // Step 8: Store in database if connection available
            if (this.connection && missionId) {
                await this._storeDomainAnalysis(result, missionId);
            }

            // Step 9: 🆕 Enrich with ECHO working memory context
            const enrichedResult = this._enrichWithEchoContext(result);

            // Step 10: Display domain analysis report
            this._displayDomainReport(enrichedResult);

            return enrichedResult;

        } catch (error) {
            console.error('❌ DKI - Domain analysis failed:', error.message);
            return {
                success: false,
                error: error.message,
                detectedDomains: []
            };
        }
    }

    /**
     * Detect applicable domains from command and project context
     */
    async _detectDomains(command, projectContext) {
        const detectedDomains = [];
        const commandLower = command.toLowerCase();

        // Domain detection patterns
        const domainPatterns = {
            [this.DOMAINS.HEALTHCARE]: {
                keywords: ['patient', 'medical', 'health', 'hipaa', 'phi', 'ehr', 'emr', 'clinic', 'hospital'],
                confidence: 0.95
            },
            [this.DOMAINS.FINANCE]: {
                keywords: ['payment', 'transaction', 'banking', 'financial', 'pci', 'credit card', 'trading', 'investment'],
                confidence: 0.95
            },
            [this.DOMAINS.NONPROFIT]: {
                keywords: ['donor', 'donation', 'fundraising', 'nonprofit', 'charity', 'beneficiary', 'giving', 'supporter'],
                confidence: 0.90
            },
            [this.DOMAINS.ECOMMERCE]: {
                keywords: ['ecommerce', 'e-commerce', 'store', 'product', 'cart', 'checkout', 'order', 'shipping'],
                confidence: 0.90
            },
            [this.DOMAINS.EDUCATION]: {
                keywords: ['student', 'education', 'course', 'learning', 'ferpa', 'school', 'university', 'lms'],
                confidence: 0.90
            },
            [this.DOMAINS.GOVERNMENT]: {
                keywords: ['government', 'public sector', 'citizen', 'compliance', 'fedramp', 'fisma'],
                confidence: 0.95
            },
            [this.DOMAINS.SAAS]: {
                keywords: ['saas', 'subscription', 'tenant', 'multi-tenant', 'api', 'cloud', 'service'],
                confidence: 0.85
            },
            [this.DOMAINS.PERSONAL_DATA]: {
                keywords: ['gdpr', 'ccpa', 'privacy', 'consent', 'personal data', 'user data', 'pii'],
                confidence: 0.95
            }
        };

        // Detect from command
        for (const [domain, { keywords, confidence }] of Object.entries(domainPatterns)) {
            for (const keyword of keywords) {
                if (commandLower.includes(keyword)) {
                    detectedDomains.push({ domain, confidence, source: 'command_keyword' });
                    break;  // One match per domain is enough
                }
            }
        }

        // Detect from project context
        if (projectContext.domain) {
            const contextDomain = projectContext.domain.toUpperCase();
            if (this.DOMAINS[contextDomain]) {
                detectedDomains.push({
                    domain: contextDomain,
                    confidence: 0.98,
                    source: 'project_context'
                });
            }
        }

        // Deduplicate (keep highest confidence)
        const uniqueDomains = {};
        for (const { domain, confidence, source } of detectedDomains) {
            if (!uniqueDomains[domain] || uniqueDomains[domain].confidence < confidence) {
                uniqueDomains[domain] = { domain, confidence, source };
            }
        }

        return Object.values(uniqueDomains);
    }

    /**
     * Get applicable industry standards for detected domains
     */
    async _getApplicableStandards(detectedDomains) {
        const standards = [];

        for (const { domain } of detectedDomains) {
            const domainKnowledge = this.domainCache[domain];
            if (domainKnowledge) {
                for (const standard of domainKnowledge.industryStandards) {
                    if (!standards.includes(standard)) {
                        standards.push(standard);
                    }
                }
            }
        }

        return standards;
    }

    /**
     * Identify compliance requirements for detected domains
     */
    async _identifyComplianceRequirements(detectedDomains, command) {
        const requirements = [];
        const commandLower = command.toLowerCase();

        for (const { domain, confidence } of detectedDomains) {
            const domainKnowledge = this.domainCache[domain];
            if (!domainKnowledge) continue;

            const compliance = domainKnowledge.complianceRequirements;

            for (const [standard, details] of Object.entries(compliance)) {
                // Check if command is relevant to this compliance requirement
                const isRelevant = this._isComplianceRelevant(standard, details, commandLower);

                if (isRelevant) {
                    requirements.push({
                        standard,
                        domain,
                        requirements: details.requirements || [],
                        technicalImplementation: details.technicalImplementation || [],
                        severity: details.severity || this.COMPLIANCE_SEVERITY.MEDIUM,
                        confidence: confidence * (isRelevant.confidence || 1.0)
                    });
                }
            }
        }

        // Sort by severity (CRITICAL first)
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return requirements.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }

    /**
     * Check if compliance requirement is relevant to the command
     */
    _isComplianceRelevant(standard, details, commandLower) {
        // Relevance patterns
        const relevancePatterns = {
            'GDPR': ['user', 'data', 'privacy', 'consent', 'profile', 'personal', 'delete', 'export'],
            'HIPAA': ['patient', 'health', 'medical', 'phi', 'record'],
            'PCI DSS': ['payment', 'credit card', 'transaction', 'checkout', 'billing'],
            'CCPA': ['california', 'privacy', 'user data', 'personal information'],
            'SOC 2': ['security', 'audit', 'monitoring', 'access control'],
            'FERPA': ['student', 'education', 'record', 'grade'],
            'COPPA': ['child', 'under 13', 'parental consent'],
            'FedRAMP': ['government', 'federal', 'cloud', 'compliance']
        };

        const keywords = relevancePatterns[standard] || [];
        for (const keyword of keywords) {
            if (commandLower.includes(keyword)) {
                return { relevant: true, confidence: 0.90 };
            }
        }

        return { relevant: false, confidence: 0.0 };
    }

    /**
     * Map industry-specific terminology
     */
    async _mapTerminology(detectedDomains, command) {
        const mappings = [];

        for (const { domain } of detectedDomains) {
            const domainKnowledge = this.domainCache[domain];
            if (!domainKnowledge) continue;

            const terminology = domainKnowledge.terminologyMappings;

            for (const [genericTerm, domainTerm] of Object.entries(terminology)) {
                if (command.toLowerCase().includes(genericTerm.toLowerCase())) {
                    mappings.push({
                        genericTerm,
                        domainTerm,
                        domain,
                        suggestion: `Consider using "${domainTerm}" instead of "${genericTerm}" for ${domain} context`
                    });
                }
            }
        }

        return mappings;
    }

    /**
     * 🆕 ESMC 3.70: Get domain-relevant standards from bf98e40d.js
     * @param {Array} detectedDomains - Array of detected domains
     * @returns {Array} Array of domain-specific standards
     */
    _getDomainStandards(detectedDomains) {
        if (!this.standardsRegistry) {
            return []; // Graceful degradation if Standards Registry unavailable
        }

        const domainStandards = [];
        const allStandards = this.standardsRegistry.getAllStandards();

        for (const { domain } of detectedDomains) {
            const relevantStandardIds = this.domainStandardsMap[domain] || [];

            for (const standardId of relevantStandardIds) {
                const standard = allStandards[standardId];
                if (standard) {
                    domainStandards.push({
                        standardId: standard.id,
                        name: standard.name,
                        category: standard.category,
                        description: standard.description,
                        checks: standard.checks,
                        domain: domain,
                        colonel: standard.colonel,
                        tier: standard.tier,
                        priority: standard.priority
                    });
                }
            }
        }

        return domainStandards;
    }

    /**
     * Suggest domain-specific implementation patterns
     * 🆕 ESMC 3.70: Enhanced with Standards Registry fallback
     */
    async _suggestDomainPatterns(detectedDomains, command) {
        const patterns = [];
        const commandLower = command.toLowerCase();

        // Try MySQL cache first
        for (const { domain } of detectedDomains) {
            const domainKnowledge = this.domainCache[domain];
            if (!domainKnowledge) continue;

            const patternLibrary = domainKnowledge.patternLibrary;

            for (const [patternName, patternDetails] of Object.entries(patternLibrary)) {
                // Check if pattern is relevant to command
                if (this._isPatternRelevant(patternDetails, commandLower)) {
                    patterns.push({
                        patternName,
                        domain,
                        description: patternDetails.description || '',
                        implementation: patternDetails.implementation || '',
                        benefits: patternDetails.benefits || [],
                        considerations: patternDetails.considerations || [],
                        source: 'mysql_cache'
                    });
                }
            }
        }

        // 🆕 ESMC 3.70: Fallback to Standards Registry if MySQL cache empty
        if (patterns.length === 0 && this.standardsRegistry) {
            const domainStandards = this._getDomainStandards(detectedDomains);

            // Convert standards to pattern format for consistency
            for (const standard of domainStandards) {
                patterns.push({
                    patternName: standard.name,
                    domain: standard.domain,
                    description: standard.description,
                    implementation: `${standard.checks.join(', ')}`,
                    benefits: [`Enforces ${standard.category} standard`, `Colonel ${standard.colonel} validation`],
                    considerations: [`Priority ${standard.priority}`, `Tier: ${standard.tier}`],
                    source: 'standards_registry',
                    standardId: standard.standardId
                });
            }
        }

        return patterns;
    }

    /**
     * Check if pattern is relevant to command
     */
    _isPatternRelevant(patternDetails, commandLower) {
        const keywords = patternDetails.keywords || [];
        for (const keyword of keywords) {
            if (commandLower.includes(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get best practices for detected domains
     */
    async _getBestPractices(detectedDomains) {
        const practices = [];

        for (const { domain } of detectedDomains) {
            const domainKnowledge = this.domainCache[domain];
            if (!domainKnowledge) continue;

            const bestPractices = domainKnowledge.bestPractices;

            for (const [category, practiceList] of Object.entries(bestPractices)) {
                practices.push({
                    domain,
                    category,
                    practices: practiceList
                });
            }
        }

        return practices;
    }

    /**
     * Generate compliance checklist
     */
    _generateComplianceChecklist(complianceRequirements) {
        const checklist = [];

        for (const requirement of complianceRequirements) {
            // Each requirement becomes checklist items
            for (const req of requirement.requirements) {
                checklist.push({
                    item: req,
                    standard: requirement.standard,
                    domain: requirement.domain,
                    severity: requirement.severity,
                    status: 'pending',
                    notes: ''
                });
            }

            // Technical implementation also becomes checklist items
            for (const impl of requirement.technicalImplementation) {
                checklist.push({
                    item: impl,
                    standard: requirement.standard,
                    domain: requirement.domain,
                    severity: requirement.severity,
                    status: 'pending',
                    notes: 'Technical implementation requirement'
                });
            }
        }

        return checklist;
    }

    /**
     * Store domain analysis in database
     */
    async _storeDomainAnalysis(result, missionId) {
        try {
            const query = `
                INSERT INTO domain_analysis (
                    mission_id, detected_domains, applicable_standards,
                    compliance_requirements, suggested_patterns, analyzed_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `;

            await this.connection.execute(query, [
                missionId,
                JSON.stringify(result.detectedDomains),
                JSON.stringify(result.applicableStandards),
                JSON.stringify(result.complianceRequirements),
                JSON.stringify(result.suggestedPatterns)
            ]);

            console.log('✅ DKI - Domain analysis stored in database');

        } catch (error) {
            console.error('❌ DKI - Failed to store domain analysis:', error.message);
        }
    }

    /**
     * Display domain analysis report
     */
    _displayDomainReport(result) {
        console.log(`\n${'='.repeat(80)}`);
        console.log('🏢 DKI - DOMAIN KNOWLEDGE INTEGRATION REPORT');
        console.log('='.repeat(80));

        // Detected Domains
        console.log(`\n🏢 DETECTED DOMAINS (${result.detectedDomains.length}):`);
        result.detectedDomains.forEach((d, index) => {
            const domainInfo = this.domainCache[d.domain];
            console.log(`   ${index + 1}. ${domainInfo?.displayName || d.domain}`);
            console.log(`      Confidence: ${(d.confidence * 100).toFixed(0)}% | Source: ${d.source}`);
            console.log(`      ${domainInfo?.description || ''}`);
        });

        // Applicable Standards
        if (result.applicableStandards.length > 0) {
            console.log(`\n📋 APPLICABLE INDUSTRY STANDARDS (${result.applicableStandards.length}):`);
            result.applicableStandards.forEach((standard, index) => {
                console.log(`   ${index + 1}. ${standard}`);
            });
        }

        // Compliance Requirements
        if (result.complianceRequirements.length > 0) {
            console.log(`\n⚖️ COMPLIANCE REQUIREMENTS (${result.complianceRequirements.length}):`);
            result.complianceRequirements.forEach((req, index) => {
                console.log(`   ${index + 1}. [${req.severity}] ${req.standard} (${req.domain})`);
                console.log(`      Confidence: ${(req.confidence * 100).toFixed(0)}%`);

                if (req.requirements.length > 0) {
                    console.log(`      Requirements:`);
                    req.requirements.forEach(r => console.log(`         - ${r}`));
                }

                if (req.technicalImplementation.length > 0) {
                    console.log(`      Technical Implementation:`);
                    req.technicalImplementation.forEach(t => console.log(`         - ${t}`));
                }
            });
        }

        // Terminology Mappings
        if (result.terminologyMappings.length > 0) {
            console.log(`\n📖 TERMINOLOGY MAPPINGS (${result.terminologyMappings.length}):`);
            result.terminologyMappings.forEach((mapping, index) => {
                console.log(`   ${index + 1}. "${mapping.genericTerm}" → "${mapping.domainTerm}" (${mapping.domain})`);
                console.log(`      ${mapping.suggestion}`);
            });
        }

        // Suggested Patterns
        if (result.suggestedPatterns.length > 0) {
            console.log(`\n🎯 SUGGESTED DOMAIN PATTERNS (${result.suggestedPatterns.length}):`);
            result.suggestedPatterns.forEach((pattern, index) => {
                console.log(`   ${index + 1}. ${pattern.patternName} (${pattern.domain})`);
                console.log(`      ${pattern.description}`);
                if (pattern.benefits.length > 0) {
                    console.log(`      Benefits: ${pattern.benefits.join(', ')}`);
                }
            });
        }

        // 🆕 ESMC 3.70: Domain Standards (from bf98e40d.js)
        if (result.domainStandards && result.domainStandards.length > 0) {
            console.log(`\n⚡ DOMAIN-SPECIFIC ENGINEERING STANDARDS (${result.domainStandards.length}):`);
            result.domainStandards.forEach((standard, index) => {
                console.log(`   ${index + 1}. ${standard.name} (${standard.domain})`);
                console.log(`      ${standard.description}`);
                console.log(`      Category: ${standard.category} | Colonel: ${standard.colonel} | Priority: ${standard.priority}`);
                console.log(`      Checks: ${standard.checks.join(', ')}`);
            });
        }

        // Best Practices
        if (result.bestPractices.length > 0) {
            console.log(`\n✨ BEST PRACTICES:`);
            result.bestPractices.forEach(bp => {
                console.log(`   ${bp.domain} - ${bp.category}:`);
                bp.practices.forEach(practice => {
                    console.log(`      - ${practice}`);
                });
            });
        }

        // Compliance Checklist Summary
        if (result.complianceChecklist.length > 0) {
            const criticalCount = result.complianceChecklist.filter(c => c.severity === this.COMPLIANCE_SEVERITY.CRITICAL).length;
            const highCount = result.complianceChecklist.filter(c => c.severity === this.COMPLIANCE_SEVERITY.HIGH).length;

            console.log(`\n✅ COMPLIANCE CHECKLIST GENERATED:`);
            console.log(`   Total Items: ${result.complianceChecklist.length}`);
            console.log(`   CRITICAL: ${criticalCount} | HIGH: ${highCount}`);
            console.log(`   Use COLONEL ZETA for compliance validation during Wave 4`);
        }

        console.log(`\n${'='.repeat(80)}\n`);
    }

    /**
     * Get domain knowledge for specific domain (utility method)
     */
    getDomainKnowledge(domain) {
        return this.domainCache[domain] || null;
    }

    /**
     * List all available domains
     */
    listAvailableDomains() {
        return Object.keys(this.domainCache).map(domain => ({
            domain,
            displayName: this.domainCache[domain].displayName,
            description: this.domainCache[domain].description
        }));
    }

    /**
     * 🆕 ESMC 3.22: Load ECHO working memory context
     * Retrieves current conversation checkpoint for context awareness
     * @private
     */
    async _loadEchoContext() {
        if (!this.atlas) {
            console.log('   ⚠️ DKI: ATLAS not initialized, skipping ECHO load');
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
                console.log(`   📸 DKI: ECHO context loaded - ${result.echo_context.current_task || 'N/A'}`);
            } else {
                console.log('   📸 DKI: No ECHO context available (new conversation)');
            }
        } catch (error) {
            console.warn(`   ⚠️ DKI: ECHO load failed (non-blocking): ${error.message}`);
        }
    }

    /**
     * 🆕 ESMC 3.22: Enrich domain analysis with ECHO working memory
     * Auto-injects current conversation context into all results
     * @param {object} result - Base domain analysis result
     * @returns {object} Enriched result with ECHO context
     * @private
     */
    _enrichWithEchoContext(result) {
        if (!this.echoContext) {
            // No ECHO context available - return original result
            return {
                ...result,
                echo_working_memory: null,
                echo_enrichment: {
                    available: false,
                    reason: 'No ECHO context (new conversation or counter=0)'
                }
            };
        }

        // Extract relevant ECHO intelligence for domain understanding
        const echoIntelligence = {
            current_conversation_task: this.echoContext.current_task || null,
            files_modified_today: this.echoContext.files_modified || [],
            key_decisions_made: this.echoContext.key_decisions || [],
            conversation_compact_count: this.echoContext.compact_counter || 0
        };

        // Calculate domain continuity score
        const continuityScore = this._calculateDomainContinuity(result, echoIntelligence);

        return {
            ...result,
            echo_working_memory: echoIntelligence,
            echo_enrichment: {
                available: true,
                domain_continuity_score: continuityScore,
                insight: this._generateDomainEchoInsight(result, echoIntelligence, continuityScore)
            }
        };
    }

    /**
     * Calculate domain continuity between current analysis and ECHO context
     * @private
     */
    _calculateDomainContinuity(domainResult, echoIntelligence) {
        let score = 0;
        let factors = 0;

        // Factor 1: Domain keyword overlap with current task
        if (echoIntelligence.current_conversation_task) {
            const taskLower = echoIntelligence.current_conversation_task.toLowerCase();
            const detectedDomainNames = domainResult.detectedDomains.map(d => d.domain.toLowerCase());

            let domainMentioned = false;
            for (const domain of detectedDomainNames) {
                if (taskLower.includes(domain.toLowerCase())) {
                    domainMentioned = true;
                    break;
                }
            }

            if (domainMentioned) {
                score += 0.5;
            }
            factors++;
        }

        // Factor 2: Compliance keyword continuity
        if (echoIntelligence.key_decisions_made && echoIntelligence.key_decisions_made.length > 0) {
            const decisionsText = echoIntelligence.key_decisions_made.join(' ').toLowerCase();
            const complianceKeywords = ['gdpr', 'hipaa', 'pci', 'compliance', 'security', 'privacy'];

            const hasComplianceDecisions = complianceKeywords.some(kw => decisionsText.includes(kw));
            if (hasComplianceDecisions && domainResult.complianceRequirements.length > 0) {
                score += 0.5;
            }
            factors++;
        }

        return factors > 0 ? Math.min(score, 1.0) : 0.5; // Default 0.5 if no factors
    }

    /**
     * Generate ECHO insight narrative for domain analysis
     * @private
     */
    _generateDomainEchoInsight(domainResult, echoIntelligence, continuityScore) {
        if (continuityScore >= 0.7) {
            return `HIGH domain continuity: Current work is aligned with detected domains (${domainResult.detectedDomains.map(d => d.domain).join(', ')}). Compliance requirements may already be in progress.`;
        } else if (continuityScore >= 0.4) {
            return `MEDIUM domain continuity: Some alignment with current work, but domain focus may be shifting.`;
        } else {
            return `LOW domain continuity: This appears to introduce new domain concerns not yet addressed in the current conversation.`;
        }
    }

    /**
     * Retrieve relevant memory using ATLAS 3-tier system
     * Used to inform domain analysis with past patterns
     */
    async retrieveRelevantMemory(query) {
        if (!this.atlas) return { found: false };

        try {
            // 🆕 ESMC 3.22: Use retrieveV3() for ECHO+HYDRA cascade
            const result = await this.atlas.retrieveV3(query, {
                retrieveEcho: true,
                useFootprint: true
            });
            return result;
        } catch (error) {
            console.warn(`⚠️ DKI memory retrieval failed: ${error.message}`);
            return { found: false };
        }
    }

    /**
     * 🆕 ESMC 3.34 P0-1: Synthesize domain analysis from T1/T2 patterns only
     * Lightweight synthesis when T1/T2 confidence >= 70%
     * @private
     */
    _synthesizeFromT1T2(preCheckResult, userCommand, projectContext) {
        // Extract universal domain standards (no T3 scan needed)
        const universalStandards = {
            'HEALTHCARE': ['HIPAA', 'HL7', 'FHIR'],
            'FINANCE': ['PCI DSS', 'SOX', 'FINRA'],
            'PERSONAL_DATA': ['GDPR', 'CCPA', 'Privacy Shield']
        };

        // Detect basic domains from patterns
        const detectedDomains = [];
        const domainKeywords = {
            'HEALTHCARE': ['patient', 'medical', 'health', 'hipaa'],
            'FINANCE': ['payment', 'transaction', 'banking', 'pci'],
            'PERSONAL_DATA': ['gdpr', 'privacy', 'user data', 'pii']
        };

        const commandLower = userCommand.toLowerCase();
        for (const [domain, keywords] of Object.entries(domainKeywords)) {
            if (keywords.some(kw => commandLower.includes(kw))) {
                detectedDomains.push({
                    domain,
                    confidence: 0.85,
                    source: 't1_t2_pattern_match'
                });
            }
        }

        return {
            detectedDomains,
            applicableStandards: detectedDomains.flatMap(d => universalStandards[d.domain] || []),
            complianceRequirements: [],
            terminologyMappings: [],
            suggestedPatterns: preCheckResult.patterns,
            bestPractices: [],
            complianceChecklist: [],
            timestamp: new Date().toISOString(),
            optimization: {
                mode: 'T1_T2_lightweight',
                t3_scan_skipped: true,
                token_savings: 150,
                confidence: preCheckResult.confidence
            }
        };
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('🏢 DKI Engine - Database connection closed');
        }
    }

    /**
     * 🆕 Find file using ATLAS structural awareness
     */
    async findFile(query) {
        if (!this.atlas) return { found: false, message: 'ATLAS not initialized' };
        return await this.atlas.findFile(query);
    }

    /**
     * 🆕 Get domain files using ATLAS
     */
    async getDomainFiles(domainName) {
        if (!this.atlas) return { found: false, message: 'ATLAS not initialized' };
        return await this.atlas.getDomainFiles(domainName);
    }
}

// Export
module.exports = DKIDomainKnowledgeEngine;

// Example usage (if run directly)
if (require.main === module) {
    (async () => {
        const dki = new DKIDomainKnowledgeEngine();
        await dki.initialize();

        // Test command
        const result = await dki.analyzeDomain(
            'Use ESMC implement GDPR-compliant user data export for donor management system',
            { domain: 'NONPROFIT' },
            1  // missionId
        );

        await dki.close();
    })();
}
