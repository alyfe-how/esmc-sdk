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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.56 Auto-Seed CLI | 2025-11-02 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: Simplified seed workflow - tells Claude to execute 48c49efe.md seed protocol
 *  Usage: User types "seed" → 48c49efe.md routes → Claude builds session → calls seed-session.js
 *
 *  This CLI is NOT meant to be called by Claude - it's documentation for the user
 *  showing that "seed" command requires Claude to manually build the session file first.
 */

// 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution
const VERBOSE = process.env.ESMC_VERBOSE === 'true' || process.argv.includes('--verbose');
if (!VERBOSE) {
    process.exit(0); // Silent mode - exit immediately without output
}

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    🌱 ESMC Auto-Seed Information                          ║
╚════════════════════════════════════════════════════════════════════════════╝

When user types "seed", 48c49efe.md protocol requires:

STEP 1: Claude analyzes current conversation
   - Extracts summary, key learnings, code patterns, decisions

STEP 2: Claude writes session file
   - Path: .claude/memory/sessions/YYYY-MM-DD-{topic-slug}.json
   - Content: Complete sessionData JSON object

STEP 3: Claude calls seed-session.js
   - Command: node ".claude/ESMC Complete/core/seed-session.js"
   - This automatically finds the most recent session file and seeds it

═══════════════════════════════════════════════════════════════════════════

✅ This workflow is CORRECT and WORKING.

The "recurring error" occurs when Claude:
   ❌ Tries to call aegis-seed-cli.js directly (requires <file> parameter)
   ❌ Skips building the session file first
   ❌ Calls non-existent CLI paths

═══════════════════════════════════════════════════════════════════════════

📋 CORRECT REFERENCE.MD WORKFLOW (for Claude to execute):

1. Analyze conversation → Extract intelligence
2. Write session file  → Use Write tool
3. Call seed-session   → node ".claude/ESMC Complete/core/seed-session.js"

═══════════════════════════════════════════════════════════════════════════

Version: ESMC 3.56
Status: Auto-seed protocol documented
`);

process.exit(0);
