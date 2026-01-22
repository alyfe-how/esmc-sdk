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
 * ESMC 3.97.0 - POST-ACTION Summary Generator
 *
 * Purpose: Delegate verbose summary generation to ChatGPT (API) with graceful Sonnet fallback
 * Token Optimization: 0 Claude tokens (API) or deferred read (fallback)
 *
 * Usage:
 *   node cace4726.js generate --operation "seed" --session-outline "{json}" [--silent]
 *
 * Architecture:
 *   1. Try ChatGPT API first (gpt-4o-mini) - 0 Claude tokens
 *   2. Fallback to Sonnet generation if API unavailable
 *   3. Write summary to .claude/memory/post-action-summaries/
 *   4. Return path only (Claude never reads content)
 */

const fs = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════

const API_MODEL = 'gpt-4o-mini';
const API_TIMEOUT = 10000; // 10 seconds

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

/**
 * Find project root (walk up until .claude/memory found)
 */
async function findProjectRoot() {
    let current = __dirname;
    while (current !== path.parse(current).root) {
        try {
            await fs.access(path.join(current, '.claude/memory'));
            return current;
        } catch {
            current = path.dirname(current);
        }
    }
    throw new Error('Could not find project root with .claude/memory directory');
}

/**
 * Load .env.local for API key
 */
async function loadEnv(projectRoot) {
    try {
        const envPath = path.join(projectRoot, '.env.local');
        const envContent = await fs.readFile(envPath, 'utf8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                const value = valueParts.join('=').trim();
                process.env[key.trim()] = value;
            }
        }
    } catch (error) {
        // .env.local not found - will trigger fallback
    }
}

/**
 * Generate summary via ChatGPT API
 */
async function generateViaAPI(operation, sessionOutline, silent) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        if (!silent) {
            console.log('   ⚠️ API: No OPENAI_API_KEY found → Fallback to Sonnet');
        }
        return null;
    }

    const prompt = `You are a technical documentation writer. Generate a verbose, detailed markdown summary of this development session.

Session Outline:
${JSON.stringify(sessionOutline, null, 2)}

Operation: ${operation}

Generate a comprehensive summary including:
1. **Session Overview** (what was accomplished)
2. **Key Changes** (detailed list of all changes made)
3. **Technical Details** (implementation specifics, patterns used)
4. **Context & Precedents** (references to past work, Rank citations)
5. **Learnings & Patterns** (what was learned, patterns documented)
6. **Tags & Metadata** (keywords, categories)

Use markdown formatting. Be verbose and detailed (400-600 tokens). Include specific technical details.`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: API_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            if (!silent) {
                console.log(`   ⚠️ API: Request failed (${response.status}) → Fallback to Sonnet`);
            }
            return null;
        }

        const data = await response.json();
        const summary = data.choices[0].message.content;

        if (!silent) {
            console.log('   ✅ API: Summary generated via ChatGPT (gpt-4o-mini)');
        }

        return summary;

    } catch (error) {
        if (!silent) {
            if (error.name === 'AbortError') {
                console.log('   ⚠️ API: Timeout → Fallback to Sonnet');
            } else {
                console.log(`   ⚠️ API: ${error.message} → Fallback to Sonnet`);
            }
        }
        return null;
    }
}

/**
 * Generate summary via Sonnet (graceful fallback)
 */
function generateViaSonnet(operation, sessionOutline) {
    // Sonnet generates inline (same token cost as current verbose dialogue)
    // But user can skip reading it (deferred cost)

    const outline = typeof sessionOutline === 'string'
        ? JSON.parse(sessionOutline)
        : sessionOutline;

    const summary = `# POST-ACTION Summary: ${operation}

## Session Overview

**Session ID:** ${outline.session_id || 'unknown'}
**Date:** ${outline.date || new Date().toISOString().split('T')[0]}
**Project:** ${outline.project || 'ESMC SDK'}

${outline.summary || 'Session summary not available.'}

## Key Changes

${(outline.key_changes || []).map(change => `- ${change}`).join('\n')}

## Technical Details

**Learnings Added:** ${outline.learnings || 0}
**Patterns Documented:** ${outline.patterns || 0}

${outline.technical_details || 'See session file for complete technical details.'}

## Context & Precedents

${outline.context_references || 'No precedent references available.'}

## Tags & Metadata

**Keywords:** ${(outline.keywords || []).join(', ')}
**Tags:** ${(outline.tags || []).join(', ')}

---

**Generated by:** ESMC 3.97.0 POST-ACTION Summary Generator (Sonnet fallback)
**Timestamp:** ${new Date().toISOString()}
`;

    return summary;
}

/**
 * Write summary to file
 */
async function writeSummary(projectRoot, operation, summary) {
    const summariesDir = path.join(projectRoot, '.claude/memory/post-action-summaries');

    // Ensure directory exists
    await fs.mkdir(summariesDir, { recursive: true });

    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-${operation.replace(/\s+/g, '-').toLowerCase()}.md`;
    const filePath = path.join(summariesDir, filename);

    // Write summary
    await fs.writeFile(filePath, summary, 'utf8');

    return filePath;
}

// ═══════════════════════════════════════════════════════════
// CLI Interface
// ═══════════════════════════════════════════════════════════

function showUsage() {
    console.log(`
ESMC 3.97.0 - POST-ACTION Summary Generator

Usage:
  node cace4726.js generate --operation "<name>" --session-outline "<json>" [--silent]

Options:
  --operation        Operation name (e.g., "seed", "auth-bug-fix")
  --session-outline  Session outline JSON (compact)
  --silent           Suppress progress output

Architecture:
  1. Try ChatGPT API (gpt-4o-mini) - 0 Claude tokens
  2. Fallback to Sonnet if API unavailable
  3. Write to .claude/memory/post-action-summaries/
  4. Return path only (Claude never reads content)

Examples:
  node cace4726.js generate --operation "seed" --session-outline '{"session_id":"2025-11-13-test"}' --silent
`);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help')) {
        showUsage();
        process.exit(0);
    }

    // Parse args
    const command = args[0];
    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;

    const operationIndex = args.indexOf('--operation');
    const outlineIndex = args.indexOf('--session-outline');

    if (command !== 'generate') {
        console.error('Error: Only "generate" command is supported');
        process.exit(1);
    }

    if (operationIndex === -1 || !args[operationIndex + 1]) {
        console.error('Error: --operation flag is required');
        process.exit(1);
    }

    if (outlineIndex === -1 || !args[outlineIndex + 1]) {
        console.error('Error: --session-outline flag is required');
        process.exit(1);
    }

    const operation = args[operationIndex + 1];
    const sessionOutline = args[outlineIndex + 1];

    try {
        // Find project root and load .env.local
        const projectRoot = await findProjectRoot();
        await loadEnv(projectRoot);

        if (!silent) {
            console.log('📝 POST-ACTION Summary Generator');
            console.log(`   Operation: ${operation}`);
        }

        // Try API first
        let summary = await generateViaAPI(operation, sessionOutline, silent);

        // Fallback to Sonnet if API failed
        if (!summary) {
            if (!silent) {
                console.log('   🔄 Fallback: Generating via Sonnet...');
            }
            summary = generateViaSonnet(operation, sessionOutline);
        }

        // Write summary to file
        const filePath = await writeSummary(projectRoot, operation, summary);

        // Output result
        if (silent) {
            // Silent mode: JSON only
            console.log(JSON.stringify({
                success: true,
                file_path: filePath,
                operation: operation
            }));
        } else {
            console.log(`   ✅ Summary written to: ${path.relative(projectRoot, filePath)}`);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
