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
/** ESMC 3.92 Scribe Auto-Init CLI | 2025-11-13 | v1.0.0 | PROD
 *  Purpose: Auto-initialize Scribe session on first prompt (silent background logging)
 *  Architecture: CLI wrapper for b8c4eb7e.js (PHASE 0 integration)
 *  Pattern: L005 CLI-wrapper pattern (3-layer: entry → core → silent errors)
 *  Token Cost: ~50 tokens (vs ~200 for inline code = 75% reduction)
 *
 *  Usage: node 44cc93fb.js "<user_prompt>" "<mode>"
 *  Example: node 44cc93fb.js "Use ESMC fix auth bug" "full"
 *
 *  Exit Codes:
 *    0 = Success (session initialized, first message logged)
 *    1 = Failure (non-blocking - BOOTSTRAP continues)
 */

const path = require('path');
// 🆕 ESMC 3.101.0: Silent by default
const ESMC_VERBOSE = process.env.ESMC_VERBOSE === 'true' || process.argv.includes('--verbose');
if (!ESMC_VERBOSE) {
    const noop = () => {};
    console.log = console.error = console.info = console.warn = noop;
}

const fs = require('fs');

// ============================================================================
// ARGUMENT PARSING
// ============================================================================

function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        return {
            userPrompt: 'Session started (no prompt provided)',
            mode: 'lightweight'
        };
    }

    return {
        userPrompt: args[0] || 'Session started',
        mode: args[1] || 'lightweight' // lightweight | full
    };
}

// ============================================================================
// SESSION INITIALIZATION
// ============================================================================

async function initializeScribeSession() {
    try {
        const { userPrompt, mode } = parseArgs();

        // Load Scribe module
        // Path resolved from CLI location (not cwd) to work from any directory
        const scribePath = path.resolve(__dirname, '.', 'b8c4eb7e.js');

        if (!fs.existsSync(scribePath)) {
            throw new Error(`Scribe module not found at: ${scribePath}`);
        }

        const ESMCScribe = require(scribePath);
        const scribe = new ESMCScribe();

        // Initialize Scribe
        await scribe.initialize();

        // Generate session title
        const now = new Date();
        const dateFolder = formatDateFolder(now);
        const timePrefix = formatTimePrefix(now);
        const sessionTitle = `ESMC Session ${dateFolder} ${timePrefix}`;

        // Start session
        const sessionResult = await scribe.startSession({
            title: sessionTitle,
            metadata: {
                mode: mode,
                esmc_version: '3.92',
                first_prompt: userPrompt.substring(0, 200), // Truncate long prompts
                auto_init: true,
                init_source: 'BOOTSTRAP PHASE 0'
            }
        });

        if (!sessionResult.success) {
            throw new Error(`Session start failed: ${sessionResult.message || 'Unknown error'}`);
        }

        // Log first user message
        const messageResult = await scribe.logMessage('user', userPrompt, {
            tokenCount: estimateTokens(userPrompt),
            timestamp: now.toISOString()
        });

        if (!messageResult.success) {
            throw new Error(`Message logging failed: ${messageResult.message || 'Unknown error'}`);
        }

        // Success response
        const response = {
            success: true,
            session_id: sessionResult.sessionId,
            file_path: sessionResult.filePath,
            mode: mode,
            message: 'Scribe session initialized successfully'
        };

        // Silent mode - only output JSON (no console.log for cleaner BOOTSTRAP output)
        process.stdout.write(JSON.stringify(response, null, 2));
        process.exit(0);

    } catch (error) {
        // Non-blocking failure - output error JSON but don't crash BOOTSTRAP
        const errorResponse = {
            success: false,
            error: error.message,
            message: 'Scribe auto-init failed (non-blocking)',
            note: 'BOOTSTRAP routing continues - Time Machine layer offline'
        };

        process.stderr.write(JSON.stringify(errorResponse, null, 2));
        process.exit(1); // Non-zero exit but BOOTSTRAP ignores
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDateFolder(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`; // YYYYMMDD
}

function formatTimePrefix(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}${minutes}`; // HHMM
}

function estimateTokens(text) {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
}

// ============================================================================
// ENTRY POINT
// ============================================================================

if (require.main === module) {
    initializeScribeSession().catch(error => {
        const fatalResponse = {
            success: false,
            error: error.message,
            message: 'Fatal Scribe error',
            stack: error.stack
        };
        process.stderr.write(JSON.stringify(fatalResponse, null, 2));
        process.exit(1);
    });
}

module.exports = { initializeScribeSession };
