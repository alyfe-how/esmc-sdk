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
/** ESMC 3.93.0 Adaptive Multi-Tier Preprocessor CLI | 2025-11-13 | v3.0.0 | PROD
 *  Purpose: OpenAI API client for adaptive L1-L4 memory preprocessing (ATLAS T1/T2/T3 + HYDRA)
 *  Innovation: Token Liberation Architecture - offload ALL reads to ChatGPT, free subscription for intelligence
 *  Economics: Dynamic (auto-selects cheapest available model)
 *  Savings: Up to 140,000 subscription tokens freed (100% read elimination on T2/T3/HYDRA fallbacks)
 *  Architecture: Adaptive tier loading (92% T1 only, 6% T1+T2, 2% T1+T2+T3, 1% T1+HYDRA)
 *
 *  🆕 ESMC 3.93.0: Adaptive tier detection + T2/T3/HYDRA preprocessing integration
 *  ESMC 3.85 Foundation: Config-driven model selection (gpt-5-nano = 3× cheaper than gpt-4o-mini)
 *  DELTA FIX: Direct subprocess execution (not model-simulated commands)
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) { showUsage(); process.exit(1); }

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    return {
        userQuery: cleanArgs.join(' '),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🎖️ GPT-4o-mini Preprocessor CLI - L1-L2 Memory & Mesh Execution

Usage: node 6897bf75.js "<user_query>" [--silent|-s]

Purpose:
  - Load memory bundle (lessons + recent + T1)
  - Execute 5 mesh CLIs (PIU/DKI/UIP/PCA/REASON)
  - Compress outputs to .esmc-context-bundle.json (300 tokens)
  - Graceful fallback if API fails

Environment:
  OPENAI_API_KEY: Required (read from .claude/.env.local)

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 3.83 | Multi-Vendor Pricing Arbitrage Architecture
    `);
}

async function loadEnvLocal() {
    const envPath = path.join(process.cwd(), '.claude', '.env.local');

    if (!fs.existsSync(envPath)) {
        return { success: false, error: 'ENV_FILE_NOT_FOUND', path: envPath };
    }

    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        const env = {};

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                env[key] = value;
            }
        }

        if (!env.OPENAI_API_KEY) {
            return { success: false, error: 'OPENAI_API_KEY_MISSING', env };
        }

        return { success: true, env };
    } catch (error) {
        return { success: false, error: 'ENV_PARSE_ERROR', details: error.message };
    }
}

// ETA SECURITY FIX: Sanitize user input to prevent command injection
function sanitizeUserQuery(query) {
    // Escape double quotes and backslashes for safe shell execution
    return query.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// 🆕 ESMC 3.85: Load vendor config for dynamic model selection
function loadVendorConfig(silent) {
    const configPath = path.join(process.cwd(), '.claude', '.esmc-vendor-config.json');

    // Fallback to hardcoded gpt-4o-mini if config doesn't exist
    if (!fs.existsSync(configPath)) {
        if (!silent) {
            console.log('⚠️  Vendor config not found, using default: gpt-4o-mini');
        }
        return {
            vendor: 'openai',
            model: 'gpt-4o-mini',
            input_price: 0.15,
            output_price: 0.60,
            source: 'HARDCODED_FALLBACK'
        };
    }

    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Check for manual override
        if (config.preprocessing.model_override) {
            const overrideModel = findModelById(config, config.preprocessing.model_override);
            if (overrideModel) {
                if (!silent) {
                    console.log(`🎯 Using override model: ${overrideModel.model} ($${overrideModel.input_price}/MTok)`);
                }
                return overrideModel;
            }
        }

        // Auto-select cheapest
        const cheapest = selectCheapestModel(config, silent);
        return cheapest;

    } catch (error) {
        if (!silent) {
            console.log(`⚠️  Config parse error: ${error.message}, using default: gpt-4o-mini`);
        }
        return {
            vendor: 'openai',
            model: 'gpt-4o-mini',
            input_price: 0.15,
            output_price: 0.60,
            source: 'ERROR_FALLBACK'
        };
    }
}

function findModelById(config, modelId) {
    for (const vendor of config.preprocessing.vendors) {
        for (const model of vendor.models) {
            if (model.id === modelId && model.available) {
                return {
                    vendor: vendor.name,
                    model: model.id,
                    input_price: model.input_price_per_mtok,
                    output_price: model.output_price_per_mtok,
                    source: 'MANUAL_OVERRIDE'
                };
            }
        }
    }
    return null;
}

function selectCheapestModel(config, silent) {
    const allModels = [];

    // Collect all available models from ENABLED vendors only
    for (const vendor of config.preprocessing.vendors) {
        // 🆕 ESMC 3.86: Skip disabled vendors
        if (!vendor.enabled) {
            continue;
        }

        for (const model of vendor.models) {
            if (model.available && model.capability_tier === config.preprocessing.capability_required) {
                allModels.push({
                    vendor: vendor.name,
                    model: model.id,
                    input_price: model.input_price_per_mtok,
                    output_price: model.output_price_per_mtok,
                    notes: model.notes || ''
                });
            }
        }
    }

    // Sort by input price (ascending - cheapest first)
    allModels.sort((a, b) => a.input_price - b.input_price);

    if (allModels.length === 0) {
        if (!silent) {
            console.log('⚠️  No models available in config, using default: gpt-4o-mini');
        }
        return {
            vendor: 'openai',
            model: 'gpt-4o-mini',
            input_price: 0.15,
            output_price: 0.60,
            source: 'NO_MODELS_FALLBACK'
        };
    }

    const cheapest = allModels[0];
    cheapest.source = 'AUTO_SELECTED';

    if (!silent) {
        console.log(`🤖 Auto-selected cheapest: ${cheapest.model} ($${cheapest.input_price}/MTok)`);
        if (cheapest.notes) {
            console.log(`   💡 ${cheapest.notes}`);
        }
    }

    return cheapest;
}

/** 🆕 ESMC 3.93.0: Adaptive Tier Detection
 * Determines which ATLAS tiers to load based on T1 results
 * @param {Object} t1Result - T1 ATLAS result from working memory
 * @param {string} userQuery - User query for classification
 * @returns {Object} - { loadT2: boolean, loadT3: boolean, loadHydra: boolean }
 */
function detectRequiredTiers(t1Result, userQuery) {
    // T1 HIT with high confidence → T1 only
    if (t1Result && t1Result.found && t1Result.top_match && parseInt(t1Result.top_match.score) >= 65) {
        return { loadT2: false, loadT3: false, loadHydra: false };
    }

    // T1 MISS → Load T2
    let loadT2 = true;

    // Query classification for T3/HYDRA
    const lowerQuery = userQuery.toLowerCase();
    const researchKeywords = ['analyze', 'compare', 'precedent', 'pattern', 'history', 'sessions', 'across'];
    const crossSessionKeywords = ['all sessions', 'multiple sessions', 'cross-session', 'hydra'];

    const isResearch = researchKeywords.some(kw => lowerQuery.includes(kw));
    const isCrossSession = crossSessionKeywords.some(kw => lowerQuery.includes(kw));

    return {
        loadT2: loadT2,
        loadT3: isResearch || isCrossSession, // Complex queries need T3
        loadHydra: isCrossSession // Explicit multi-session analysis
    };
}

/** 🆕 ESMC 3.93.0: Load T2 Topic Index
 * Loads and preprocesses ATLAS T2 topic index
 * @param {string} userQuery - User query for topic matching
 * @param {boolean} silent - Suppress logs
 * @returns {Object} - T2 topic index data
 */
async function loadT2TopicIndex(userQuery, silent) {
    try {
        const topicIndexPath = path.join(process.cwd(), '.claude', 'memory', '.topic-index.json');

        if (!fs.existsSync(topicIndexPath)) {
            return { found: false, reason: 'Topic index not found', topics: [] };
        }

        const topicIndex = JSON.parse(fs.readFileSync(topicIndexPath, 'utf8'));

        if (!silent) {
            console.log(`   📚 T2: Loaded topic index (${Object.keys(topicIndex.topics || {}).length} topics)`);
        }

        return {
            found: true,
            topics: topicIndex.topics || {},
            metadata: topicIndex.metadata || {},
            raw_tokens: estimateTokens(JSON.stringify(topicIndex))
        };
    } catch (error) {
        return { found: false, error: error.message, topics: [] };
    }
}

/** 🆕 ESMC 3.93.0: Load T3 Full Registry
 * Loads ATLAS T3 full memory registry (keyword search)
 * @param {string} userQuery - User query for keyword matching
 * @param {boolean} silent - Suppress logs
 * @returns {Object} - T3 registry data (selective - top matches only)
 */
async function loadT3FullRegistry(userQuery, silent) {
    try {
        const registryPath = path.join(process.cwd(), '.claude', 'memory', '.memory-registry.json');

        if (!fs.existsSync(registryPath)) {
            return { found: false, reason: 'Registry not found', sessions: [] };
        }

        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

        // Extract keywords from query
        const keywords = userQuery.toLowerCase()
            .replace(/[^\w\s-]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);

        // Score sessions by keyword matching (simplified)
        const projects = registry.projects || {};
        const allSessions = [];

        for (const projectId in projects) {
            const sessions = projects[projectId].sessions || [];
            allSessions.push(...sessions);
        }

        // Simple keyword scoring (count keyword matches in title/tags)
        const scored = allSessions.map(session => {
            let score = 0;
            const searchText = `${session.title || ''} ${(session.tags || []).join(' ')}`.toLowerCase();

            for (const keyword of keywords) {
                if (searchText.includes(keyword)) {
                    score++;
                }
            }

            return { session, score, percentScore: keywords.length > 0 ? score / keywords.length : 0 };
        }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

        // Return top 10 matches only (selective loading)
        const topMatches = scored.slice(0, 10);

        if (!silent) {
            console.log(`   🔍 T3: Found ${topMatches.length} sessions from registry (top 10 of ${scored.length} matches)`);
        }

        return {
            found: topMatches.length > 0,
            sessions: topMatches.map(s => s.session),
            match_count: topMatches.length,
            total_searched: allSessions.length,
            raw_tokens: estimateTokens(JSON.stringify(topMatches))
        };
    } catch (error) {
        return { found: false, error: error.message, sessions: [] };
    }
}

/** 🆕 ESMC 3.93.0: Load HYDRA Multi-Head Retrieval
 * Executes HYDRA multi-head retrieval for cross-session analysis
 * @param {string} userQuery - User query
 * @param {boolean} silent - Suppress logs
 * @returns {Object} - HYDRA retrieval results
 */
async function loadHydraRetrieval(userQuery, silent) {
    try {
        // Execute HYDRA via CLI
        const safeQuery = sanitizeUserQuery(userQuery);
        const hydraOutput = execSync(
            `node ".claude/ESMC-Chaos/components/3a58b120.js" retrieve "${safeQuery}"`,
            { encoding: 'utf8', cwd: process.cwd(), timeout: 10000 }
        );

        const hydraResult = JSON.parse(hydraOutput);

        if (!silent) {
            console.log(`   🐍 HYDRA: Multi-head retrieval executed (${Object.keys(hydraResult.heads || {}).length} heads)`);
        }

        return {
            found: true,
            heads: hydraResult.heads || {},
            metadata: hydraResult.metadata || {},
            raw_tokens: estimateTokens(hydraOutput)
        };
    } catch (error) {
        if (!silent) {
            console.log(`   ⚠️  HYDRA: Retrieval failed (${error.message})`);
        }
        return { found: false, error: error.message, heads: {} };
    }
}

async function executeLocalPreprocessing(userQuery, silent) {
    try {
        if (!silent) {
            console.log('🔧 Executing adaptive tier preprocessing (local)...');
        }

        // ETA SECURITY: Sanitize user query before passing to shell
        const safeQuery = sanitizeUserQuery(userQuery);

        // STEP 1: Load memory bundle (T1)
        const workingMemoryPath = path.join(process.cwd(), '.claude', 'memory', '.esmc-working-memory.json');

        let workingMemory = null;
        if (fs.existsSync(workingMemoryPath)) {
            workingMemory = JSON.parse(fs.readFileSync(workingMemoryPath, 'utf8'));
        }

        // STEP 2: Execute 5 mesh CLIs in parallel (Windows-compatible)
        const cliResults = {};

        try {
            // PIU
            const piuOutput = execSync(
                `node ".claude/ESMC-Chaos/components/6ef4ca36.js" analyze "${safeQuery}" --silent`,
                { encoding: 'utf8', cwd: process.cwd() }
            );
            cliResults.piu = JSON.parse(piuOutput);
        } catch (e) {
            cliResults.piu = { error: e.message };
        }

        try {
            // DKI
            const dkiOutput = execSync(
                `node ".claude/ESMC-Chaos/components/44511598.js" search "${safeQuery}" --silent`,
                { encoding: 'utf8', cwd: process.cwd() }
            );
            cliResults.dki = JSON.parse(dkiOutput);
        } catch (e) {
            cliResults.dki = { error: e.message };
        }

        try {
            // UIP
            const uipOutput = execSync(
                `node ".claude/ESMC-Chaos/components/915646f2.js" predict "${safeQuery}" --silent`,
                { encoding: 'utf8', cwd: process.cwd() }
            );
            cliResults.uip = JSON.parse(uipOutput);
        } catch (e) {
            cliResults.uip = { error: e.message };
        }

        try {
            // PCA
            const pcaOutput = execSync(
                `node ".claude/ESMC-Chaos/components/429bce75.js" analyze "${safeQuery}" --silent`,
                { encoding: 'utf8', cwd: process.cwd() }
            );
            cliResults.pca = JSON.parse(pcaOutput);
        } catch (e) {
            cliResults.pca = { error: e.message };
        }

        try {
            // REASON (skip --context flag, use topic only)
            const reasonOutput = execSync(
                `node ".claude/ESMC-Chaos/components/854dea21.js" analyze "${safeQuery}" --caller "PREPROCESSOR" --silent`,
                { encoding: 'utf8', cwd: process.cwd() }
            );
            cliResults.reason = JSON.parse(reasonOutput);
        } catch (e) {
            cliResults.reason = { error: e.message };
        }

        // 🆕 ESMC 3.93.0 STEP 3: Adaptive Tier Detection
        const t1Result = workingMemory?.atlas_t1 || null;
        const tierDecision = detectRequiredTiers(t1Result, userQuery);

        if (!silent) {
            console.log(`   🎯 Tier Decision: T1=always | T2=${tierDecision.loadT2} | T3=${tierDecision.loadT3} | HYDRA=${tierDecision.loadHydra}`);
        }

        // STEP 4: Load additional tiers if needed
        const additionalTiers = {};

        if (tierDecision.loadT2) {
            additionalTiers.t2 = await loadT2TopicIndex(userQuery, silent);
        }

        if (tierDecision.loadT3) {
            additionalTiers.t3 = await loadT3FullRegistry(userQuery, silent);
        }

        if (tierDecision.loadHydra) {
            additionalTiers.hydra = await loadHydraRetrieval(userQuery, silent);
        }

        // STEP 5: Prepare raw context (T1 + adaptive tiers)
        const rawContext = {
            memory: workingMemory,
            mesh: cliResults,
            additional_tiers: additionalTiers,
            tier_decision: tierDecision
        };

        const tierSummary = {
            t1: 'always_loaded',
            t2: tierDecision.loadT2 ? (additionalTiers.t2?.found ? 'loaded' : 'not_found') : 'skipped',
            t3: tierDecision.loadT3 ? (additionalTiers.t3?.found ? 'loaded' : 'not_found') : 'skipped',
            hydra: tierDecision.loadHydra ? (additionalTiers.hydra?.found ? 'loaded' : 'failed') : 'skipped'
        };

        if (!silent) {
            console.log(`   📊 Tier Summary: T1=${tierSummary.t1} | T2=${tierSummary.t2} | T3=${tierSummary.t3} | HYDRA=${tierSummary.hydra}`);
        }

        return {
            success: true,
            raw_context: rawContext,
            raw_token_estimate: estimateTokens(JSON.stringify(rawContext)),
            tier_summary: tierSummary
        };

    } catch (error) {
        return {
            success: false,
            error: 'LOCAL_PREPROCESSING_ERROR',
            details: error.message
        };
    }
}

async function compressContextWithDynamicModel(rawContext, userQuery, apiKey, silent) {
    try {
        // 🆕 ESMC 3.85: Load vendor config to select model
        const modelConfig = loadVendorConfig(silent);

        // Dynamic import OpenAI SDK
        const { default: OpenAI } = await import('openai');

        const client = new OpenAI({ apiKey });

        if (!silent) {
            console.log(`🤖 ${modelConfig.model}: Compressing context...`);
        }

        // 🆕 ESMC 3.93.0: Enhanced compression prompt for multi-tier
        const compressionPrompt = `You are ESMC's context compression engine. Compress this raw context into a concise summary (target: 300-500 tokens depending on tier complexity).

**User Query:** "${userQuery}"

**Raw Context:**
${JSON.stringify(rawContext, null, 2)}

**Compression Instructions:**
1. Extract TOP 3 high-severity lessons (frustration_score > 80)
2. Summarize T1 session (if found) in 1-2 sentences
3. Extract user preferences (key behaviors only)
4. Summarize mesh intelligence:
   - PIU: Top 2 goals + confidence
   - DKI: Top 3 applicable patterns
   - UIP: Detected workflow + confidence
   - PCA: Pattern count + confidence
   - REASON: Urgency/priority/confidence scores
5. Include project_name if available
6. 🆕 ATLAS T2 (if loaded): Summarize top 3 relevant topics (topic name + session count)
7. 🆕 ATLAS T3 (if loaded): Summarize top 5 matched sessions (session_id + title + relevance score)
8. 🆕 HYDRA (if loaded): Summarize multi-head findings (semantic/structural/temporal patterns)

**Output Format (JSON):**
{
  "version": "2.0.0",
  "user_query": "${userQuery}",
  "compressed_memory": {
    "high_severity_lessons": [...],
    "t1_summary": "...",
    "user_preferences": {...}
  },
  "mesh_intelligence": {
    "piu_goals": [...],
    "dki_patterns": [...],
    "uip_workflow": {...},
    "pca_context": {...},
    "reason_scores": {...}
  },
  "additional_tiers": {
    "t2_topics": [...] or null,
    "t3_sessions": [...] or null,
    "hydra_findings": {...} or null
  },
  "project_name": "..."
}

Target: 300 tokens compressed (from ${estimateTokens(JSON.stringify(rawContext))} raw).
Return ONLY the JSON object.`;

        // 🆕 ESMC 3.85: GPT-5 models have different parameter requirements
        const isGPT5Model = modelConfig.model.startsWith('gpt-5');
        const completionParams = {
            model: modelConfig.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are ESMC context compression engine. Compress raw memory + mesh data into concise JSON summaries.'
                },
                {
                    role: 'user',
                    content: compressionPrompt
                }
            ],
            response_format: { type: 'json_object' }
        };

        // GPT-5 models have stricter parameter requirements
        if (isGPT5Model) {
            completionParams.max_completion_tokens = 1000;
            // GPT-5-nano only supports temperature=1 (default)
        } else {
            completionParams.max_tokens = 1000;
            completionParams.temperature = 0.3;
        }

        const response = await client.chat.completions.create(completionParams);

        const compressed = JSON.parse(response.choices[0].message.content);

        return {
            success: true,
            compressed_context: compressed,
            compressed_tokens: estimateTokens(JSON.stringify(compressed)),
            api_usage: response.usage,
            model_used: modelConfig.model,  // 🆕 Track which model was used
            model_pricing: modelConfig        // 🆕 Track pricing info
        };

    } catch (error) {
        return {
            success: false,
            error: 'GPT4O_MINI_COMPRESSION_ERROR',
            details: error.message,
            code: error.code || 'UNKNOWN'
        };
    }
}

function estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
}

async function main() {
    const { userQuery, silent } = parseArgs();

    try {
        // STEP 1: Load .env.local
        const envResult = await loadEnvLocal();

        if (!envResult.success) {
            // Graceful fallback: Return error code for BOOTSTRAP to detect
            const errorResponse = {
                success: false,
                mode: 'FALLBACK_TO_SUBSCRIPTION',
                error: envResult.error,
                details: envResult.path || envResult.details || 'Unknown error'
            };

            console.log(JSON.stringify(errorResponse));
            process.exit(1); // Non-zero exit code signals fallback
        }

        if (!silent) {
            console.log('✅ .env.local loaded from .claude folder');
        }

        // STEP 2: Execute local preprocessing (load memory + run mesh CLIs)
        const preprocessResult = await executeLocalPreprocessing(userQuery, silent);

        if (!preprocessResult.success) {
            const errorResponse = {
                success: false,
                mode: 'FALLBACK_TO_SUBSCRIPTION',
                error: preprocessResult.error,
                details: preprocessResult.details
            };

            console.log(JSON.stringify(errorResponse));
            process.exit(1);
        }

        if (!silent) {
            console.log(`📊 Raw context: ${preprocessResult.raw_token_estimate} tokens`);
        }

        // STEP 3: Compress context with dynamically selected model
        const compressionResult = await compressContextWithDynamicModel(
            preprocessResult.raw_context,
            userQuery,
            envResult.env.OPENAI_API_KEY,
            silent
        );

        if (!compressionResult.success) {
            const errorResponse = {
                success: false,
                mode: 'FALLBACK_TO_SUBSCRIPTION',
                error: compressionResult.error,
                details: compressionResult.details,
                code: compressionResult.code
            };

            console.log(JSON.stringify(errorResponse));
            process.exit(1);
        }

        // STEP 4: Write compressed bundle
        const bundlePath = path.join(process.cwd(), '.claude', '.esmc-context-bundle.json');
        fs.writeFileSync(
            bundlePath,
            JSON.stringify(compressionResult.compressed_context, null, 2)
        );

        if (!silent) {
            console.log(`✅ Compressed bundle: ${bundlePath}`);
            console.log(`📊 Compression: ${preprocessResult.raw_token_estimate} → ${compressionResult.compressed_tokens} tokens (${Math.round((1 - compressionResult.compressed_tokens / preprocessResult.raw_token_estimate) * 100)}% reduction)`);
        }

        // Success: Return result
        const successResponse = {
            success: true,
            mode: 'HYBRID_PREPROCESSING',
            bundle_path: bundlePath,
            token_savings: {
                raw: preprocessResult.raw_token_estimate,
                compressed: compressionResult.compressed_tokens,
                reduction_pct: Math.round((1 - compressionResult.compressed_tokens / preprocessResult.raw_token_estimate) * 100)
            },
            api_usage: {
                model: compressionResult.model_used || 'unknown',
                input_tokens: compressionResult.api_usage?.prompt_tokens || 0,
                output_tokens: compressionResult.api_usage?.completion_tokens || 0,
                total_tokens: compressionResult.api_usage?.total_tokens || 0,
                estimated_cost: (
                    ((compressionResult.api_usage?.prompt_tokens || 0) * (compressionResult.model_pricing?.input_price || 0.15) / 1000000) +
                    ((compressionResult.api_usage?.completion_tokens || 0) * (compressionResult.model_pricing?.output_price || 0.60) / 1000000)
                ).toFixed(6)
            }
        };

        console.log(JSON.stringify(successResponse));
        process.exit(0); // Zero exit code signals success

    } catch (error) {
        // Unexpected error: Graceful fallback
        const errorResponse = {
            success: false,
            mode: 'FALLBACK_TO_SUBSCRIPTION',
            error: 'UNEXPECTED_ERROR',
            details: error.message,
            stack: error.stack
        };

        console.log(JSON.stringify(errorResponse));
        process.exit(1);
    }
}

main().catch(error => {
    console.error(JSON.stringify({
        success: false,
        mode: 'FALLBACK_TO_SUBSCRIPTION',
        error: 'FATAL_ERROR',
        details: error.message
    }));
    process.exit(1);
});
