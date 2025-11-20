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
/**
 * ESMC 3.92.0 - PMO GENESIS TRIGGER SYSTEM
 * ═══════════════════════════════════════════════════════════════════════
 * 🎖️ MULTI-SIGNAL INTENT DETECTION + KEYWORD ANALYSIS + CIE INTEGRATION
 *
 * Purpose:
 * - Detects when PMO should be generated (first prompt genesis trigger)
 * - Multi-stage pipeline: PMO existence check → Intent classification → Keyword analysis → CIE boost
 * - Prevents false positives ("build ESMC" ≠ project genesis)
 * - Supports existing projects (PMO can be generated mid-project)
 *
 * Architecture:
 * Stage 1: PMO Existence Pre-Check (file system check, 0 tokens)
 * Stage 2: Mesh Intelligence Extraction (use PHASE 1 results, 0 additional tokens)
 * Stage 3: Intent Classification (UIP primary signal, rule-based)
 * Stage 4: Keyword Pattern Analysis (regex matching + context boosters)
 * Stage 5: CIE Integration (MAX/VIP only, ambiguous cases, ~200 tokens)
 * Stage 6: Final Decision + Execution (trigger PMO or skip)
 *
 * ESMC Version: 3.92.0 (Multi-Signal PMO Genesis)
 * Created: 2025-11-13
 * Author: ECHELON + ATHENA Strategic Partnership
 * Status: PRODUCTION READY
 */

const fs = require('fs');
const path = require('path');
// 🆕 ESMC 3.101.0: Silent by default
const ESMC_VERBOSE = process.env.ESMC_VERBOSE === 'true' || process.argv.includes('--verbose');
if (!ESMC_VERBOSE) {
    const noop = () => {};
    console.log = console.error = console.info = console.warn = noop;
}

const { spawn } = require('child_process');

/**
 * PMO Genesis Trigger System - Multi-Signal Intelligence
 */
class PMOGenesisTrigger {
    constructor() {
        this.version = "1.0.0";
        this.esmcVersion = "3.92.0";

        // Thresholds
        this.KEYWORD_CONFIDENCE_THRESHOLD = 3.0;  // Minimum score to trigger
        this.AUDIT_THRESHOLD = 0.6;                // 3/5 categories (used later by ATHENA)
    }

    /**
     * Main Entry Point - Analyze Request for PMO Genesis Trigger
     * @param {Object} options - { userPrompt, meshIntelligence, tier, mode }
     * @returns {Promise<Object>} Decision object with action and reason
     */
    async analyzeRequest(options) {
        const { userPrompt, meshIntelligence, tier, mode } = options;

        try {
            // ─── STAGE 1: PMO EXISTENCE PRE-CHECK ───
            const pmoExists = await this.checkPMOExists();
            if (pmoExists.exists) {
                return {
                    action: 'SKIP_GENESIS',
                    reason: 'PMO already exists (project constitution established)',
                    stage: 'STAGE1_EXISTENCE_CHECK',
                    pmo_path: pmoExists.path,
                    generated_at: pmoExists.generated_at
                };
            }

            // ─── STAGE 2: MESH INTELLIGENCE EXTRACTION ───
            const meshContext = this.extractMeshContext(userPrompt, meshIntelligence);

            // ─── STAGE 3: INTENT CLASSIFICATION (UIP PRIMARY SIGNAL) ───
            const intentClass = this.classifyIntent(meshContext);

            if (intentClass.trigger_pmo === false) {
                // Intent already ruled out PMO
                return {
                    action: 'SKIP_GENESIS',
                    reason: intentClass.reason,
                    stage: 'STAGE3_INTENT_CLASSIFICATION',
                    intent_class: intentClass.class
                };
            }

            // ─── STAGE 4: KEYWORD PATTERN ANALYSIS ───
            const keywordAnalysis = this.analyzeKeywords(meshContext);

            if (keywordAnalysis.decision === 'TRIGGER_GENESIS') {
                // Keywords confirmed PMO trigger
                return {
                    action: 'TRIGGER_GENESIS',
                    confidence: keywordAnalysis.confidence,
                    reason: keywordAnalysis.reason,
                    stage: 'STAGE4_KEYWORD_ANALYSIS',
                    keyword_details: keywordAnalysis
                };
            }

            // ─── STAGE 5: CIE INTEGRATION (MAX/VIP ONLY - AMBIGUOUS CASES) ───
            if ((tier === 'MAX' || tier === 'VIP') &&
                keywordAnalysis.confidence >= 0.4 &&
                keywordAnalysis.confidence < 0.6) {

                const cieResult = await this.executeCIE(meshContext, keywordAnalysis);

                if (cieResult.inferred_genesis) {
                    return {
                        action: 'TRIGGER_GENESIS',
                        confidence: 0.7,
                        reason: 'CIE detected project genesis intent (MAX/VIP tier intelligence)',
                        stage: 'STAGE5_CIE_BOOST',
                        cie_details: cieResult
                    };
                }
            }

            // Default: Skip genesis
            return {
                action: 'SKIP_GENESIS',
                reason: keywordAnalysis.reason || 'Insufficient signals for project genesis',
                stage: 'STAGE4_KEYWORD_ANALYSIS',
                confidence: keywordAnalysis.confidence
            };

        } catch (error) {
            console.error('❌ PMO Genesis Trigger Error:', error.message);
            return {
                action: 'SKIP_GENESIS',
                reason: `Error during analysis: ${error.message}`,
                stage: 'ERROR',
                error: error.message
            };
        }
    }

    /**
     * STAGE 1: Check if PMO Already Exists
     * @param {string} projectRoot - Optional project root path (defaults to cwd)
     * @returns {Promise<Object>} { exists, path, generated_at }
     *
     * SECURITY: Validates projectRoot to prevent path traversal attacks
     */
    async checkPMOExists(projectRoot = null) {
        // Use current working directory if not specified
        const validatedRoot = projectRoot ? this.validateProjectRoot(projectRoot) : process.cwd();
        const pmoPath = path.join(validatedRoot, '.claude', 'memory', '.esmc-project-modus-operandi.json');

        if (fs.existsSync(pmoPath)) {
            try {
                const pmoContent = fs.readFileSync(pmoPath, 'utf8');
                const pmo = JSON.parse(pmoContent);
                return {
                    exists: true,
                    path: pmoPath,
                    generated_at: pmo.generated_at || 'unknown',
                    locked: pmo.locked || false
                };
            } catch (error) {
                // PMO file exists but corrupted
                return { exists: true, path: pmoPath, corrupted: true };
            }
        }

        return { exists: false, path: pmoPath };
    }

    /**
     * Validate Project Root Path (Path Traversal Prevention)
     * @param {string} projectRoot - Project root path to validate
     * @returns {string} Validated absolute path
     * @throws {Error} If path contains traversal attempts or is outside allowed directories
     *
     * SECURITY: Prevents path traversal attacks like ../../etc/
     */
    validateProjectRoot(projectRoot) {
        // Convert to absolute path
        const absolutePath = path.resolve(projectRoot);
        const cwd = process.cwd();

        // Check for path traversal patterns
        if (projectRoot.includes('..') || projectRoot.includes('./')) {
            throw new Error('Path traversal detected: relative paths not allowed');
        }

        // Ensure path is within current working directory tree or is the cwd itself
        // This prevents reading PMO files from arbitrary system locations
        if (!absolutePath.startsWith(cwd) && absolutePath !== cwd) {
            throw new Error(`Path traversal detected: ${absolutePath} is outside working directory ${cwd}`);
        }

        // Ensure directory exists
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Invalid project root: ${absolutePath} does not exist`);
        }

        // Ensure it's a directory
        const stats = fs.statSync(absolutePath);
        if (!stats.isDirectory()) {
            throw new Error(`Invalid project root: ${absolutePath} is not a directory`);
        }

        return absolutePath;
    }

    /**
     * STAGE 2: Extract Mesh Intelligence Context
     * @param {string} userPrompt - User's request
     * @param {Object} meshIntelligence - PHASE 1 results (PIU/DKI/UIP/PCA/REASON)
     * @returns {Object} Mesh context object
     */
    extractMeshContext(userPrompt, meshIntelligence) {
        return {
            // User prompt
            user_prompt: userPrompt.toLowerCase(),

            // UIP (Workflow Detection)
            uip_workflow: meshIntelligence.uip?.detectedWorkflow?.workflow || 'unknown',
            uip_confidence: meshIntelligence.uip?.detectedWorkflow?.confidence || 0,

            // PIU (Intent Understanding)
            piu_confidence: meshIntelligence.piu?.confidenceScore || 0,
            piu_category: meshIntelligence.piu?.goals?.[0]?.category || 'unknown',
            piu_goals: meshIntelligence.piu?.goals || [],
            piu_stakeholders: meshIntelligence.piu?.stakeholders || {},

            // DKI (Domain Knowledge)
            dki_domains: meshIntelligence.dki?.detectedDomains || [],
            dki_patterns: meshIntelligence.dki?.suggestedPatterns || [],

            // PCA (Project Context)
            pca_patterns: meshIntelligence.pca?.patterns || [],
            pca_confidence: meshIntelligence.pca?.confidence || 0,

            // REASON (5W1H)
            reason_where: meshIntelligence.reason?.inquiry?.where?.environment || null,
            reason_why: meshIntelligence.reason?.inquiry?.why?.primary_goal || null,
            reason_urgency: meshIntelligence.reason?.scores?.urgency || 0,
            reason_priority: meshIntelligence.reason?.scores?.priority || 0
        };
    }

    /**
     * STAGE 3: Intent Classification (UIP Primary Signal)
     * @param {Object} ctx - Mesh context
     * @returns {Object} { class, trigger_pmo, reason }
     */
    classifyIntent(ctx) {
        // Class 1: QUERY/EXPLANATION (NEVER trigger PMO)
        if (ctx.uip_workflow === 'query' ||
            ctx.uip_workflow === 'explanation' ||
            ctx.piu_category === 'query') {
            return {
                class: 'QUERY',
                trigger_pmo: false,
                reason: 'Question/explanation request (not project genesis)'
            };
        }

        // Class 2: MAINTENANCE (NEVER trigger PMO - working on existing code)
        if (ctx.uip_workflow === 'bug_fix' ||
            ctx.uip_workflow === 'refactoring' ||
            ctx.uip_workflow === 'code_review') {
            return {
                class: 'MAINTENANCE',
                trigger_pmo: false,
                reason: 'Maintenance task (bug fix/refactoring, not new project)'
            };
        }

        // Class 3: INCREMENTAL FEATURE (MAYBE trigger PMO - need keyword check)
        if (ctx.uip_workflow === 'feature_implementation' && ctx.piu_confidence < 0.7) {
            return {
                class: 'INCREMENTAL_FEATURE',
                trigger_pmo: 'KEYWORD_CHECK',
                reason: 'Feature implementation (ambiguous - requires keyword analysis)'
            };
        }

        // Class 4: PROJECT GENESIS (LIKELY trigger PMO - need keyword confirmation)
        if (ctx.uip_workflow === 'feature_implementation' && ctx.piu_confidence >= 0.7) {
            return {
                class: 'PROJECT_GENESIS',
                trigger_pmo: 'KEYWORD_CHECK',
                reason: 'High-confidence new project signal (requires keyword confirmation)'
            };
        }

        // Class 5: TESTING/DOCS (NEVER trigger PMO)
        if (ctx.uip_workflow === 'testing' || ctx.uip_workflow === 'documentation') {
            return {
                class: 'NON_PRODUCTIVE',
                trigger_pmo: false,
                reason: 'Testing/documentation (no standards needed)'
            };
        }

        // Default: Unknown (require keyword check)
        return {
            class: 'UNKNOWN',
            trigger_pmo: 'KEYWORD_CHECK',
            reason: 'Uncertain intent - keyword analysis required'
        };
    }

    /**
     * STAGE 4: Keyword Pattern Analysis
     * @param {Object} ctx - Mesh context
     * @returns {Object} { confidence, decision, reason, patterns }
     */
    analyzeKeywords(ctx) {
        const prompt = ctx.user_prompt;
        const results = {
            creation_verbs: [],
            project_nouns: [],
            intent_modifiers: [],
            exclusion_patterns: [],
            confidence: 0,
            decision: 'SKIP_GENESIS',
            reason: ''
        };

        // ─── CREATION VERBS (Imperative/Collaborative) ───
        const creationPatterns = [
            { pattern: /\b(let's build|let's create|let's make)\b/i, weight: 2.0 },
            { pattern: /\b(build me|create me|make me|develop me)\b/i, weight: 2.0 },
            { pattern: /\b(I want to build|I want to create|I want to make)\b/i, weight: 1.8 },
            { pattern: /\b(help me build|help me create|help me make)\b/i, weight: 1.5 },
            { pattern: /\bimplement (a|an|the)\b/i, weight: 1.2 },
            { pattern: /\b(build|create|make)\b/i, weight: 0.5 }
        ];

        // ─── PROJECT NOUNS (Product/Artifact Types) ───
        const projectNounPatterns = [
            { pattern: /\b(website|web app|web application)\b/i, weight: 2.0 },
            { pattern: /\b(SaaS|SaaS app|SaaS platform)\b/i, weight: 2.0 },
            { pattern: /\b(mobile app|iOS app|Android app)\b/i, weight: 2.0 },
            { pattern: /\b(API|REST API|GraphQL API)\b/i, weight: 1.8 },
            { pattern: /\b(platform|system|service)\b/i, weight: 1.5 },
            { pattern: /\b(dashboard|portal|admin panel)\b/i, weight: 1.5 },
            { pattern: /\b(e-commerce|marketplace|storefront)\b/i, weight: 2.0 },
            { pattern: /\b(authentication system|payment gateway|CMS)\b/i, weight: 1.8 },
            { pattern: /\bapp\b/i, weight: 0.8 }
        ];

        // ─── EXCLUSION PATTERNS (False Positive Indicators) ───
        const exclusionPatterns = [
            { pattern: /\b(build|create|make) (the |this )?(ESMC|SDK|framework|library|package)\b/i, weight: -3.0, reason: 'Working on existing project (ESMC itself)' },
            { pattern: /\b(build|compile|run|test|deploy) (the |this )?(project|code|app)\b/i, weight: -2.0, reason: 'Build/compile command (not project genesis)' },
            { pattern: /\b(add|update|modify|change|improve|enhance|refactor)\b/i, weight: -1.5, reason: 'Modification (not new project)' },
            { pattern: /\b(fix|debug|troubleshoot|resolve)\b/i, weight: -2.0, reason: 'Maintenance (not project genesis)' },
            { pattern: /\bin (the |this )?(existing|current|my) (project|codebase|app)\b/i, weight: -1.8, reason: 'Existing project context' },
            { pattern: /\b(the |this )?(\w+\.(js|ts|py|java|rb|go)) (file|module|component)\b/i, weight: -1.5, reason: 'Specific file reference (existing code)' }
        ];

        // ─── EXECUTE PATTERN MATCHING ───
        let totalWeight = 0;

        creationPatterns.forEach(p => {
            if (p.pattern.test(prompt)) {
                results.creation_verbs.push({ pattern: p.pattern.source, weight: p.weight });
                totalWeight += p.weight;
            }
        });

        projectNounPatterns.forEach(p => {
            if (p.pattern.test(prompt)) {
                results.project_nouns.push({ pattern: p.pattern.source, weight: p.weight });
                totalWeight += p.weight;
            }
        });

        exclusionPatterns.forEach(p => {
            if (p.pattern.test(prompt)) {
                results.exclusion_patterns.push({ pattern: p.pattern.source, weight: p.weight, reason: p.reason });
                totalWeight += p.weight;
            }
        });

        // ─── CONTEXT BOOSTERS (From Mesh Intelligence) ───

        // DKI detected NEW domain (not in PCA precedents)
        if (ctx.dki_domains.length > 0 && ctx.pca_patterns.length === 0) {
            totalWeight += 1.0;
            results.intent_modifiers.push({ signal: 'DKI_NEW_DOMAIN', weight: 1.0, reason: 'New domain detected (no precedents)' });
        }

        // REASON WHERE = production/cloud (deploying new service)
        if (ctx.reason_where && ['production', 'cloud', 'vercel', 'aws', 'azure'].includes(ctx.reason_where.toLowerCase())) {
            totalWeight += 0.8;
            results.intent_modifiers.push({ signal: 'REASON_WHERE_PRODUCTION', weight: 0.8, reason: 'Production deployment context' });
        }

        // PIU high confidence (>= 0.7) + stakeholders present
        if (ctx.piu_confidence >= 0.7 && ctx.piu_stakeholders?.primary_users?.length > 0) {
            totalWeight += 0.7;
            results.intent_modifiers.push({ signal: 'PIU_HIGH_CONFIDENCE_STAKEHOLDERS', weight: 0.7, reason: 'Multi-stakeholder project detected' });
        }

        // ─── CALCULATE FINAL CONFIDENCE ───
        const hasCreationVerb = results.creation_verbs.length > 0;
        const hasProjectNoun = results.project_nouns.length > 0;
        const hasStrongExclusion = results.exclusion_patterns.some(e => e.weight <= -2.0);

        if (hasStrongExclusion) {
            // Strong exclusion = never trigger
            results.confidence = 0;
            results.decision = 'SKIP_GENESIS';
            results.reason = results.exclusion_patterns.find(e => e.weight <= -2.0).reason;
        } else if (hasCreationVerb && hasProjectNoun && totalWeight >= this.KEYWORD_CONFIDENCE_THRESHOLD) {
            // Strong signal: Creation verb + Project noun + positive total weight
            results.confidence = Math.min(totalWeight / 5.0, 1.0);
            results.decision = 'TRIGGER_GENESIS';
            results.reason = `Creation intent detected (${(results.confidence * 100).toFixed(0)}% confidence)`;
        } else if (totalWeight >= 4.0) {
            // Very strong context signals (even without perfect keyword match)
            results.confidence = Math.min(totalWeight / 6.0, 1.0);
            results.decision = 'TRIGGER_GENESIS';
            results.reason = `Strong contextual signals (${(results.confidence * 100).toFixed(0)}% confidence)`;
        } else {
            // Weak or ambiguous signal
            results.confidence = Math.max(totalWeight / 5.0, 0);
            results.decision = 'SKIP_GENESIS';
            results.reason = `Insufficient signals (${(results.confidence * 100).toFixed(0)}% confidence, threshold: ${(this.KEYWORD_CONFIDENCE_THRESHOLD / 5.0 * 100).toFixed(0)}%)`;
        }

        results.total_weight = totalWeight;
        return results;
    }

    /**
     * STAGE 5: CIE Integration (MAX/VIP Only)
     * @param {Object} meshContext - Mesh intelligence context
     * @param {Object} keywordAnalysis - Keyword analysis results
     * @returns {Promise<Object>} CIE result with inferred_genesis flag
     *
     * SECURITY: Uses spawn() with args array to prevent command injection
     */
    async executeCIE(meshContext, keywordAnalysis) {
        return new Promise((resolve, reject) => {
            try {
                // Secure subprocess execution - args array prevents command injection
                const ciePath = path.join(__dirname, '5391f22b.js');
                const child = spawn('node', [ciePath, 'analyze', meshContext.user_prompt], {
                    timeout: 10000,
                    encoding: 'utf8'
                });

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => {
                    stdout += data;
                });

                child.stderr.on('data', (data) => {
                    stderr += data;
                });

                child.on('error', (error) => {
                    console.error('⚠️ CIE Spawn Error:', error.message);
                    resolve({ inferred_genesis: false, error: error.message });
                });

                child.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const cieResult = JSON.parse(stdout);

                            // Check if CIE detected project genesis intent
                            const genesisNeeds = ['project_genesis', 'establish_standards', 'new_project_setup', 'architecture_definition'];
                            const inferredGenesis = cieResult.inferred_needs?.some(need =>
                                genesisNeeds.includes(need.toLowerCase())
                            );

                            resolve({
                                inferred_genesis: inferredGenesis,
                                inferred_needs: cieResult.inferred_needs || [],
                                detected_gaps: cieResult.detected_gaps || [],
                                confidence: cieResult.confidence || 0
                            });
                        } catch (parseError) {
                            console.error('⚠️ CIE JSON Parse Error:', parseError.message);
                            resolve({ inferred_genesis: false, error: parseError.message });
                        }
                    } else {
                        console.error('⚠️ CIE Execution Failed:', stderr || `Exit code ${code}`);
                        resolve({ inferred_genesis: false, error: stderr || `CIE exited with code ${code}` });
                    }
                });

            } catch (error) {
                console.error('⚠️ CIE Execution Failed:', error.message);
                resolve({ inferred_genesis: false, error: error.message });
            }
        });
    }

    /**
     * Display Decision Summary (Full Deployment Mode)
     * @param {Object} decision - Decision object from analyzeRequest
     * @param {string} mode - 'full_deployment' or 'lightweight'
     */
    displayDecisionSummary(decision, mode) {
        if (mode !== 'full_deployment') return; // Silent in lightweight mode

        console.log('\n🔍 PMO GENESIS DECISION SUMMARY');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`   Stage: ${decision.stage}`);
        console.log(`   Action: ${decision.action}`);
        console.log(`   Reason: ${decision.reason}`);

        if (decision.confidence !== undefined) {
            console.log(`   Confidence: ${(decision.confidence * 100).toFixed(0)}%`);
        }

        if (decision.keyword_details) {
            const kd = decision.keyword_details;
            console.log(`\n   Keyword Analysis:`);
            console.log(`   - Creation verbs: ${kd.creation_verbs.length}`);
            console.log(`   - Project nouns: ${kd.project_nouns.length}`);
            console.log(`   - Exclusions: ${kd.exclusion_patterns.length}`);
            console.log(`   - Total weight: ${kd.total_weight?.toFixed(2) || 0}`);
        }

        console.log('═══════════════════════════════════════════════════════════════\n');
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = { PMOGenesisTrigger };

// CLI Execution Support
if (require.main === module) {
    const trigger = new PMOGenesisTrigger();

    // Parse command-line arguments
    const args = process.argv.slice(2);
    const userPrompt = args[0] || '';
    const meshIntelligenceJSON = args[1] || '{}';
    const tier = args[2] || 'FREE';
    const mode = args[3] || 'full_deployment';

    try {
        const meshIntelligence = JSON.parse(meshIntelligenceJSON);

        trigger.analyzeRequest({
            userPrompt,
            meshIntelligence,
            tier,
            mode
        }).then(decision => {
            trigger.displayDecisionSummary(decision, mode);
            console.log(JSON.stringify(decision, null, 2));
            process.exit(decision.action === 'TRIGGER_GENESIS' ? 0 : 1);
        }).catch(error => {
            console.error('❌ PMO Genesis Trigger Error:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('❌ Invalid arguments:', error.message);
        console.log('\nUsage: node cf7cb579.js "<user_prompt>" \'<mesh_intelligence_json>\' <tier> <mode>');
        process.exit(1);
    }
}
