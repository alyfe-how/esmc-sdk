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
 * ESMC 3.80.1 - Mesh Result Caching
 * Purpose: Cache Phase 1 mesh intelligence results for same-issue revisits
 * Philosophy: "Same issue, same context → reuse findings" - 77% latency savings
 *
 * Performance Impact:
 *   Phase 1 (PIU/DKI/UIP/PCA/REASON): ~500ms (from Rank 4 benchmark)
 *   Cache hit: ~10ms (file read)
 *   Savings: 490ms (98% faster!)
 *
 * Invalidation Rules:
 *   1. Request hash mismatch (different keywords/intent)
 *   2. TTL expired (1 hour, like PMO)
 *   3. User explicitly says "specifications changed"
 *
 * Commands:
 *   check "<topic>" [--silent]          - Check if cached result exists
 *   load "<topic>" [--silent]           - Load cached mesh results
 *   save "<topic>" <results_json> [--silent]  - Save mesh results to cache
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// HASH GENERATION
// ============================================================================

/**
 * Generate cache key hash from topic
 * Uses SHA-256 to create stable hash for topic + keywords
 *
 * @param {string} topic - User request topic
 * @returns {string} - 16-char hex hash
 */
function generateCacheHash(topic) {
    // Normalize topic: lowercase, trim, collapse whitespace
    const normalized = topic.toLowerCase().trim().replace(/\s+/g, ' ');

    // Extract keywords (words > 3 chars, not common words)
    const commonWords = ['the', 'and', 'with', 'for', 'from', 'that', 'this', 'have', 'need', 'want'];
    const keywords = normalized
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .sort() // Sort for stability
        .join('_');

    // Generate SHA-256 hash
    const hash = crypto.createHash('sha256').update(keywords).digest('hex');
    return hash.substring(0, 16); // First 16 chars
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

/**
 * Check if cached mesh results exist for topic
 *
 * @param {string} topic - User request topic
 * @param {Object} options - CLI options
 * @returns {Object} - {cached: boolean, hash: string, file_path: string, age_ms: number}
 */
function checkCache(topic, options = {}) {
    const silent = options.silent || false;
    const hash = generateCacheHash(topic);
    const cacheDir = path.resolve(process.cwd(), '.esmc-cache');
    const cacheFile = path.join(cacheDir, `phase1-mesh-${hash}.json`);

    if (!fs.existsSync(cacheFile)) {
        if (!silent) console.log(`❌ No cache found for hash: ${hash}`);
        return {
            cached: false,
            hash,
            file_path: cacheFile,
            age_ms: null,
            reason: 'cache_miss'
        };
    }

    // Check TTL (1 hour = 3600000ms)
    const stats = fs.statSync(cacheFile);
    const ageMs = Date.now() - stats.mtimeMs;
    const ttlMs = 3600000; // 1 hour

    if (ageMs > ttlMs) {
        if (!silent) console.log(`⏰ Cache expired (age: ${(ageMs / 1000 / 60).toFixed(1)} min > 60 min TTL)`);
        // Delete expired cache
        fs.unlinkSync(cacheFile);
        return {
            cached: false,
            hash,
            file_path: cacheFile,
            age_ms: ageMs,
            reason: 'ttl_expired'
        };
    }

    if (!silent) console.log(`✅ Cache hit! (age: ${(ageMs / 1000 / 60).toFixed(1)} min, hash: ${hash})`);
    return {
        cached: true,
        hash,
        file_path: cacheFile,
        age_ms: ageMs,
        age_minutes: Math.round(ageMs / 1000 / 60),
        ttl_remaining_minutes: Math.round((ttlMs - ageMs) / 1000 / 60)
    };
}

/**
 * Load cached mesh results
 *
 * @param {string} topic - User request topic
 * @param {Object} options - CLI options
 * @returns {Object} - Cached mesh results or null
 */
function loadCache(topic, options = {}) {
    const silent = options.silent || false;
    const cacheStatus = checkCache(topic, { silent: true });

    if (!cacheStatus.cached) {
        if (!silent) console.log(`❌ Cannot load cache: ${cacheStatus.reason}`);
        return null;
    }

    try {
        const cachedData = JSON.parse(fs.readFileSync(cacheStatus.file_path, 'utf-8'));

        if (!silent) {
            console.log(`📦 Loaded cached mesh results:`);
            console.log(`   PIU: ${cachedData.piu ? '✅' : '❌'}`);
            console.log(`   DKI: ${cachedData.dki ? '✅' : '❌'}`);
            console.log(`   UIP: ${cachedData.uip ? '✅' : '❌'}`);
            console.log(`   PCA: ${cachedData.pca ? '✅' : '❌'}`);
            console.log(`   REASON: ${cachedData.reason ? '✅' : '❌'}`);
            console.log(`   Age: ${cacheStatus.age_minutes} min (${cacheStatus.ttl_remaining_minutes} min remaining)`);
        }

        return {
            ...cachedData,
            cache_metadata: cacheStatus
        };
    } catch (error) {
        if (!silent) console.error(`❌ Failed to load cache: ${error.message}`);
        return null;
    }
}

/**
 * Save mesh results to cache
 *
 * @param {string} topic - User request topic
 * @param {Object} meshResults - Phase 1 mesh intelligence results
 * @param {Object} options - CLI options
 * @returns {Object} - Cache save status
 */
function saveCache(topic, meshResults, options = {}) {
    const silent = options.silent || false;
    const hash = generateCacheHash(topic);
    const cacheDir = path.resolve(process.cwd(), '.esmc-cache');
    const cacheFile = path.join(cacheDir, `phase1-mesh-${hash}.json`);

    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    try {
        const cacheData = {
            topic,
            hash,
            cached_at: new Date().toISOString(),
            ttl_seconds: 3600,
            piu: meshResults.piu || null,
            dki: meshResults.dki || null,
            uip: meshResults.uip || null,
            pca: meshResults.pca || null,
            reason: meshResults.reason || null
        };

        fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));

        if (!silent) {
            console.log(`💾 Saved mesh results to cache:`);
            console.log(`   Hash: ${hash}`);
            console.log(`   File: ${cacheFile}`);
            console.log(`   TTL: 1 hour`);
        }

        return {
            saved: true,
            hash,
            file_path: cacheFile,
            cached_at: cacheData.cached_at
        };
    } catch (error) {
        if (!silent) console.error(`❌ Failed to save cache: ${error.message}`);
        return {
            saved: false,
            hash,
            file_path: cacheFile,
            error: error.message
        };
    }
}

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
    console.log(`
ESMC 3.80.1 - Mesh Result Caching

Usage:
  node ab915dc8.js check "<topic>" [--silent]
  node ab915dc8.js load "<topic>" [--silent]
  node ab915dc8.js save "<topic>" '<results_json>' [--silent]

Commands:
  check    - Check if cached mesh results exist (validates TTL)
  load     - Load cached mesh results (returns full Phase 1 output)
  save     - Save mesh results to cache (TTL: 1 hour)

Options:
  --silent - Suppress console output (JSON only)

Examples:
  node ab915dc8.js check "Implement user authentication"
  node ab915dc8.js load "Fix login bug" --silent
  node ab915dc8.js save "Add dark mode" '{"piu":{...},"dki":{...},...}'
`);
    process.exit(0);
}

// 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
const silent = !verbose;

if (command === 'check') {
    const topic = args[1];
    if (!topic) {
        console.error('❌ Missing required argument: "<topic>"');
        process.exit(1);
    }

    const result = checkCache(topic, { silent });
    console.log(JSON.stringify(result, null, 2));

} else if (command === 'load') {
    const topic = args[1];
    if (!topic) {
        console.error('❌ Missing required argument: "<topic>"');
        process.exit(1);
    }

    const result = loadCache(topic, { silent });
    if (result) {
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log(JSON.stringify({ cached: false, error: 'No valid cache found' }, null, 2));
        process.exit(1);
    }

} else if (command === 'save') {
    const topic = args[1];
    const resultsJson = args[2];

    if (!topic || !resultsJson) {
        console.error('❌ Missing required arguments: "<topic>" \'<results_json>\'');
        process.exit(1);
    }

    try {
        const meshResults = JSON.parse(resultsJson);
        const result = saveCache(topic, meshResults, { silent });
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(`❌ Invalid JSON: ${error.message}`);
        process.exit(1);
    }

} else {
    console.error(`❌ Unknown command: ${command}`);
    console.error('💡 Use --help to see available commands');
    process.exit(1);
}
