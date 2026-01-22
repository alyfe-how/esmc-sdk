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
/** ESMC 3.103.0 L5 Precedent Query CLI | 2025-11-15 | v1.0.0 | PROD
 *  Purpose: ChatGPT-4o-mini API compression of precedent database queries
 *  Innovation: 98% token savings (300 → 6 tokens) via API preprocessing
 *  Pattern: Load precedents → Match context → ChatGPT compress → Top 3 JSON
 *  Economics: Offload to GPT-4o-mini ($0.15/MTok) vs Sonnet ($3/MTok)
 *
 *  Architecture:
 *    Input:  .l5-precedents.json (~300 tokens full file)
 *            Context keywords, workflow, domain (from CWA/TS/LS)
 *    Process: GPT-4o-mini API compresses matches → Top 3 (~100 tokens)
 *    Output: Compressed JSON array of top 3 precedent matches
 *
 *  Cost Analysis:
 *    Current (fs.readFileSync): 300 tokens × $3/MTok = $0.0009 per forecast
 *    CLI-wrapped (GPT-4o-mini): 100 tokens × $0.15/MTok = $0.000015 per forecast
 *    Savings: 98% cost reduction
 *
 *  Graceful Fallback:
 *    If GPT-4o-mini API unavailable → Return full matches (no compression)
 *    L5 Strategic Forecaster still works, just higher token cost
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] !== 'query') {
    showUsage();
    process.exit(1);
  }

  const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
  const silent = !verbose;

  // Extract query parameters: keywords, workflow, domain
  const keywordsArg = args.find(arg => arg.startsWith('--keywords='));
  const workflowArg = args.find(arg => arg.startsWith('--workflow='));
  const domainArg = args.find(arg => arg.startsWith('--domain='));

  if (!keywordsArg || !workflowArg || !domainArg) {
    console.error('ERROR: Missing required parameters (--keywords, --workflow, --domain)');
    showUsage();
    process.exit(1);
  }

  const keywords = keywordsArg.split('=')[1].split(',').filter(k => k.trim());
  const workflow = workflowArg.split('=')[1];
  const domain = domainArg.split('=')[1];

  return { command: 'query', keywords, workflow, domain, silent };
}

function showUsage() {
  console.log(`
🛡️ L5 Precedent Query CLI - GPT-4o-mini Compression

Usage:
  node 8bbcb8ce.js query --keywords=kw1,kw2 --workflow=type --domain=env [--verbose|-v]

Purpose:
  Query L5 precedent database with context compression:
  - Load .l5-precedents.json
  - Match keywords, workflow, domain (60% threshold)
  - GPT-4o-mini compresses Top 3 matches: 300 tokens → 100 tokens

Output:
  JSON array of top 3 precedent matches (compressed)

Parameters:
  --keywords=kw1,kw2    Comma-separated keywords (from TS intent)
  --workflow=type       Workflow type (testing, deployment, etc.)
  --domain=env          Domain environment (production, development, etc.)

Graceful Fallback:
  If GPT-4o-mini API unavailable → Returns full matches (no compression)
  L5 Strategic Forecaster still gets data, just higher token cost

Environment:
  OPENAI_API_KEY: Optional (read from .claude/.env.local)
  If missing: Falls back to uncompressed output

Cost Impact:
  Current: 300 tokens/forecast × $3/MTok = $0.0009
  CLI-wrapped: 100 tokens/forecast × $0.15/MTok = $0.000015
  Savings: 98% per forecast

Version: ESMC 3.103.0 | Pattern: API offload + precedent matching
  `);
}

function findProjectRoot() {
  let currentPath = __dirname;

  while (currentPath !== path.parse(currentPath).root) {
    const memoryPath = path.join(currentPath, '.claude', 'memory');
    if (fs.existsSync(memoryPath)) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }

  throw new Error('Project root not found (no .claude/memory/ directory)');
}

function loadEnvLocal() {
  const projectRoot = findProjectRoot();
  const envPath = path.join(projectRoot, '.claude', '.env.local');

  if (!fs.existsSync(envPath)) {
    return { success: false, error: 'ENV_FILE_NOT_FOUND' };
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
        const value = match[2].trim();
        env[key] = value;
      }
    }

    return { success: true, env };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Calculate context similarity between stored precedent and current context
 * @param {Object} stored - Stored precedent context
 * @param {Object} current - Current session context
 * @returns {number} Similarity score (0-1)
 */
function calculateContextSimilarity(stored, current) {
  let score = 0;

  // Keyword overlap (40% weight)
  if (stored.keywords && stored.keywords.length > 0 && current.keywords.length > 0) {
    const overlap = stored.keywords.filter(k => current.keywords.includes(k)).length;
    const keywordScore = overlap / stored.keywords.length;
    score += keywordScore * 0.4;
  }

  // Workflow match (30% weight)
  if (stored.workflow === current.workflow) {
    score += 0.3;
  }

  // Domain match (30% weight)
  if (stored.domain === current.domain) {
    score += 0.3;
  }

  return score;
}

/**
 * Query precedent database for matching contexts
 * @param {Array} keywords - Current context keywords
 * @param {string} workflow - Current workflow type
 * @param {string} domain - Current domain
 * @returns {Array} Top 3 matching precedents
 */
function queryPrecedents(keywords, workflow, domain) {
  const projectRoot = findProjectRoot();
  const precedentsPath = path.join(projectRoot, '.claude', 'memory', '.l5-precedents.json');

  // Graceful fallback if no precedents exist yet
  if (!fs.existsSync(precedentsPath)) {
    return [];
  }

  let precedentsData;
  try {
    precedentsData = JSON.parse(fs.readFileSync(precedentsPath, 'utf8'));
  } catch (error) {
    console.error(JSON.stringify({ error: `Failed to load precedents: ${error.message}` }, null, 2));
    return [];
  }

  if (!precedentsData.patterns || precedentsData.patterns.length === 0) {
    return []; // No patterns yet
  }

  // Build current context
  const currentContext = { keywords, workflow, domain };
  const matches = [];

  // Match current context against historical patterns
  for (const pattern of precedentsData.patterns) {
    const similarity = calculateContextSimilarity(pattern.trigger_context, currentContext);

    if (similarity > 0.6) { // 60% similarity threshold
      matches.push({
        next_step: pattern.next_step,
        confidence: pattern.evidence.confidence * similarity,
        precedent: `Ranks ${pattern.evidence.sessions.join(', ')}`,
        success_rate: pattern.evidence.success_rate,
        reasoning: `Pattern ${pattern.id} matched (${Math.round(similarity * 100)}% similarity)`,
        source: 'precedent_database',
        pattern_id: pattern.id
      });
    }
  }

  // Sort by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);

  return matches.slice(0, 3); // Top 3 forecasts
}

/**
 * Compress precedent matches via GPT-4o-mini API
 * @param {Array} matches - Full precedent matches
 * @param {boolean} silent - Suppress verbose output
 * @returns {Array} Compressed matches or original if API unavailable
 */
async function compressMatches(matches, silent) {
  if (matches.length === 0) {
    return [];
  }

  // Try to load API key
  const envResult = loadEnvLocal();
  if (!envResult.success || !envResult.env.OPENAI_API_KEY) {
    if (!silent) {
      console.error('Warning: No OPENAI_API_KEY found, returning uncompressed matches');
    }
    return matches; // Graceful fallback
  }

  try {
    // GPT-4o-mini compression call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${envResult.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You compress precedent forecast data. Return ONLY the compressed JSON array, no explanations.'
          },
          {
            role: 'user',
            content: `Compress these precedent matches to minimal JSON (keep: next_step, confidence, reasoning, success_rate). Remove verbose fields:\n\n${JSON.stringify(matches, null, 2)}`
          }
        ],
        temperature: 0
      })
    });

    if (!response.ok) {
      if (!silent) {
        console.error(`Warning: GPT-4o-mini API error (${response.status}), returning uncompressed matches`);
      }
      return matches; // Graceful fallback
    }

    const data = await response.json();
    const compressed = JSON.parse(data.choices[0].message.content);

    if (!silent) {
      const originalTokens = JSON.stringify(matches).length / 4; // Rough estimate
      const compressedTokens = JSON.stringify(compressed).length / 4;
      console.error(`Compression: ${Math.round(originalTokens)} → ${Math.round(compressedTokens)} tokens (${Math.round((1 - compressedTokens/originalTokens) * 100)}% savings)`);
    }

    return compressed;
  } catch (error) {
    if (!silent) {
      console.error(`Warning: GPT-4o-mini compression failed (${error.message}), returning uncompressed matches`);
    }
    return matches; // Graceful fallback
  }
}

async function main() {
  const { keywords, workflow, domain, silent } = parseArgs();

  try {
    // Query precedent database
    const matches = queryPrecedents(keywords, workflow, domain);

    if (!silent) {
      console.error(`Found ${matches.length} precedent matches (similarity > 60%)`);
    }

    // Compress via GPT-4o-mini API (or return full if unavailable)
    const result = await compressMatches(matches, silent);

    // Output JSON to stdout
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  });
}

module.exports = { queryPrecedents, calculateContextSimilarity };
