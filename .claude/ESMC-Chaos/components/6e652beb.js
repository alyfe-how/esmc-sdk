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
/** ESMC 3.94.0 ATHENA Memory Correction System | 2025-11-13 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: Trace wrong inferences, document corrections, quarantine invalid citations
 *  Philosophy: Complete the feedback loop - user corrections → memory updates → future prevention
 *  Trigger: User correction keywords ("it should have been", "that's wrong", "moving forward, remove")
 *
 *  Architecture:
 *  - STEP 1: Detect correction trigger (UIP integration)
 *  - STEP 2: Trace inference to source citation (grep memory)
 *  - STEP 3: Document correction (.esmc-citation-corrections.json)
 *  - STEP 4: Filter citations (ATLAS integration)
 *
 *  Usage:
 *    node 6e652beb.js trace --wrong "scribe-session-seed-cli.js" --correct "seed-session.js" --user-message "it should have called seed-session.js"
 *    node 6e652beb.js filter --session-id "2025-11-13-esmc-392"
 *    node 6e652beb.js list
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════
// PROJECT ROOT DETECTION
// ═══════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════
// ATHENA MEMORY CORRECTION CLASS
// ═══════════════════════════════════════════════════════════════════════

class ATHENAMemoryCorrection {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.correctionsFile = path.join(projectRoot, '.claude/memory/.esmc-citation-corrections.json');
        this.sessionsDir = path.join(projectRoot, '.claude/memory/sessions');
    }

    // ───────────────────────────────────────────────────────────────────
    // STEP 1: Detect Correction Trigger
    // ───────────────────────────────────────────────────────────────────

    async detectCorrectionTrigger(userMessage) {
        const triggers = [
            { pattern: "it should have been", confidence: 0.95 },
            { pattern: "it should have", confidence: 0.90 },
            { pattern: "that's wrong", confidence: 0.95 },
            { pattern: "that's incorrect", confidence: 0.95 },
            { pattern: "moving forward, remove", confidence: 0.98 },
            { pattern: "don't repeat", confidence: 0.90 },
            { pattern: "never do that again", confidence: 0.95 },
            { pattern: "shouldn't have", confidence: 0.85 }
        ];

        const message = userMessage.toLowerCase();

        for (const trigger of triggers) {
            if (message.includes(trigger.pattern)) {
                return {
                    triggered: true,
                    trigger: trigger.pattern,
                    confidence: trigger.confidence,
                    timestamp: new Date().toISOString()
                };
            }
        }

        return { triggered: false };
    }

    // ───────────────────────────────────────────────────────────────────
    // STEP 2: Trace Wrong Inference to Source Citation
    // ───────────────────────────────────────────────────────────────────

    async traceInference(wrongInference) {
        console.log(`🔍 Tracing wrong inference: ${wrongInference}`);

        // Escape special characters for grep
        const escapedPattern = wrongInference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        try {
            // Grep all session files for the pattern
            const grepCmd = `grep -r "${escapedPattern}" "${this.sessionsDir}" --include="*.json" -n`;
            const result = execSync(grepCmd, { encoding: 'utf8' }).trim();

            if (!result) {
                return {
                    found: false,
                    reason: "Pattern not found in any session (pure hallucination)"
                };
            }

            // Parse grep output
            const matches = result.split('\n').map(line => {
                const [filePath, lineNum, ...contentParts] = line.split(':');
                return {
                    file: filePath,
                    line: parseInt(lineNum),
                    content: contentParts.join(':').trim()
                };
            });

            // Get first match (most likely source)
            const firstMatch = matches[0];
            const sessionId = path.basename(firstMatch.file, '.json');

            // Classify failure mode
            const failureMode = this.classifyFailureMode(wrongInference);

            return {
                found: true,
                session_id: sessionId,
                file: firstMatch.file,
                line: firstMatch.line,
                content: firstMatch.content,
                failure_mode: failureMode,
                match_count: matches.length
            };

        } catch (error) {
            // Grep returns exit code 1 if no matches
            if (error.status === 1) {
                return {
                    found: false,
                    reason: "Pattern not found in any session (pure hallucination)"
                };
            }
            throw error;
        }
    }

    classifyFailureMode(wrongInference) {
        // Pattern-based classification
        if (wrongInference.includes('-cli.js') && wrongInference.includes('session')) {
            return "pattern_substitution";
        }
        if (wrongInference.includes('scribe') && wrongInference.includes('seed')) {
            return "system_boundary_violation";
        }
        if (wrongInference.match(/\d+\.\d+\.\d+/)) {
            return "version_inference";
        }
        return "unknown_inference";
    }

    // ───────────────────────────────────────────────────────────────────
    // STEP 2.5: Verify Source (ESMC 3.95.0)
    // ───────────────────────────────────────────────────────────────────

    /**
     * Verify if wrong inference corresponds to real file vs hallucination
     * @param {string} wrongInference - The wrong path/pattern
     * @returns {Promise<object>} Verification result
     */
    async verifySource(wrongInference) {
        // Check if pattern looks like a file path
        if (!wrongInference.includes('.js') && !wrongInference.includes('/')) {
            return {
                real: false,
                reason: "Not a file path (pattern or concept)",
                verified: false
            };
        }

        // Try to find file in codebase
        const possiblePaths = [
            path.join(this.projectRoot, '.claude/ESMC Complete/core/cli', wrongInference),
            path.join(this.projectRoot, '.claude/ESMC Complete/core', wrongInference),
            path.join(this.projectRoot, wrongInference)
        ];

        for (const filePath of possiblePaths) {
            try {
                await fs.access(filePath);
                return {
                    real: true,
                    reason: "File exists in codebase",
                    verified: true,
                    path: filePath
                };
            } catch {
                // File doesn't exist at this path, try next
            }
        }

        return {
            real: false,
            reason: "Pattern documented but file doesn't exist (hallucination or stale reference)",
            verified: false
        };
    }

    /**
     * Determine recommended action based on verification
     * @param {object} verification - Result from verifySource()
     * @param {object} trace - Result from traceInference()
     * @returns {object} Recommendation
     */
    determineRecommendation(verification, trace) {
        // No source citation found
        if (!trace.found) {
            return {
                action: 'QUARANTINE',
                reason: 'No source citation found (inference from context or hallucination)',
                explanation: 'Safe default - preserves any implicit historical context'
            };
        }

        // File doesn't exist - likely hallucination or stale reference
        if (!verification.real) {
            return {
                action: 'DELETE',
                reason: 'Citation documents non-existent file (hallucination or stale reference)',
                explanation: 'Removing false historical record improves memory accuracy'
            };
        }

        // File exists - citation is historically accurate
        if (verification.real && trace.found) {
            return {
                action: 'QUARANTINE',
                reason: 'Citation is historically accurate but caused inference error',
                explanation: 'Preserving history, preventing pattern misapplication'
            };
        }

        // Default: QUARANTINE (safe choice)
        return {
            action: 'QUARANTINE',
            reason: 'Default safe action',
            explanation: 'Reversible, preserves historical record'
        };
    }

    // ───────────────────────────────────────────────────────────────────
    // STEP 3: Document Correction
    // ───────────────────────────────────────────────────────────────────

    async documentCorrection(data) {
        const { wrongInference, correctAnswer, userMessage, trace } = data;

        console.log(`📝 Documenting correction: ${wrongInference} → ${correctAnswer}`);

        // Load existing corrections
        const corrections = await this.loadCorrections();

        // Generate correction ID
        const correctionId = `C${(corrections.corrections.length + 1).toString().padStart(3, '0')}`;

        // Create correction entry
        const correction = {
            correction_id: correctionId,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            wrong_inference: wrongInference,
            correct_answer: correctAnswer,
            user_message: userMessage,
            source_citation: trace.found ? {
                session_id: trace.session_id,
                file: trace.file,
                line: trace.line,
                content: trace.content,
                match_count: trace.match_count
            } : null,
            failure_mode: trace.failure_mode || "unknown",
            prevention_rule: this.generatePreventionRule(wrongInference, correctAnswer, trace),
            status: "active",
            applied_count: 0
        };

        // Add to corrections array
        corrections.corrections.push(correction);

        // Add to quarantine patterns
        corrections.quarantine_patterns.push({
            pattern: wrongInference,
            status: "INVALID",
            reason: correction.prevention_rule.rule,
            correction_id: correctionId,
            date_quarantined: correction.date
        });

        // Save corrections
        await this.saveCorrections(corrections);

        console.log(`✅ Correction ${correctionId} documented`);
        return correction;
    }

    generatePreventionRule(wrongInference, correctAnswer, trace) {
        // Generate context-aware prevention rule
        let rule = `Use ${correctAnswer} instead of ${wrongInference}`;
        let verification = "Check explicit instructions before pattern inference";

        if (trace.failure_mode === "pattern_substitution") {
            rule = `Don't substitute operation names in CLI patterns. ${correctAnswer} is explicit in documentation.`;
            verification = "Read code blocks in manifests as EXACT COMMANDS, not patterns to modify";
        } else if (trace.failure_mode === "system_boundary_violation") {
            rule = `Scribe (logging) ≠ SEED (memory). Different systems, different CLIs.`;
            verification = "Verify system boundaries before inferring CLI paths";
        }

        return {
            rule: rule,
            verification: verification,
            reference: trace.session_id ? `See correction in session ${trace.session_id}` : null
        };
    }

    // ───────────────────────────────────────────────────────────────────
    // STEP 4: Filter Citations (Called by ATLAS)
    // ───────────────────────────────────────────────────────────────────

    async filterSession(sessionData) {
        const corrections = await this.loadCorrections();

        // Check for quarantined patterns in session content
        const sessionStr = JSON.stringify(sessionData);

        for (const quarantine of corrections.quarantine_patterns) {
            if (sessionStr.includes(quarantine.pattern)) {
                sessionData._quarantined_citations = sessionData._quarantined_citations || [];
                sessionData._quarantined_citations.push({
                    pattern: quarantine.pattern,
                    status: quarantine.status,
                    reason: quarantine.reason,
                    correction_id: quarantine.correction_id
                });
            }
        }

        // Check if session is source of correction
        for (const correction of corrections.corrections) {
            if (correction.source_citation?.session_id === sessionData.session_id) {
                sessionData._citation_warning = {
                    correction_id: correction.correction_id,
                    wrong_inference: correction.wrong_inference,
                    correct_answer: correction.correct_answer,
                    prevention_rule: correction.prevention_rule
                };
            }
        }

        return sessionData;
    }

    // ───────────────────────────────────────────────────────────────────
    // DATA PERSISTENCE
    // ───────────────────────────────────────────────────────────────────

    async loadCorrections() {
        try {
            const data = await fs.readFile(this.correctionsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist - return empty structure
                return {
                    version: "1.0.0",
                    created_at: new Date().toISOString(),
                    corrections: [],
                    quarantine_patterns: []
                };
            }
            throw error;
        }
    }

    async saveCorrections(corrections) {
        corrections.last_updated = new Date().toISOString();
        await fs.writeFile(
            this.correctionsFile,
            JSON.stringify(corrections, null, 2),
            'utf8'
        );
    }

    // ───────────────────────────────────────────────────────────────────
    // EXECUTION METHODS (ESMC 3.95.0)
    // ───────────────────────────────────────────────────────────────────

    /**
     * Execute DELETE action - Remove citation from session (memory surgery)
     * @param {string} wrongInference - Pattern to delete
     * @param {object} trace - Trace result
     * @param {string} userMessage - User correction message
     * @returns {Promise<object>} Deletion result
     */
    async executeDelete(wrongInference, trace, userMessage) {
        console.log('\n🗑️  Executing DELETE...\n');

        if (!trace.found) {
            console.log('⚠️  No citation found in sessions - nothing to delete');
            return { action: 'DELETE_SKIPPED', reason: 'No source citation' };
        }

        try {
            // Load session file
            const sessionData = JSON.parse(await fs.readFile(trace.file, 'utf8'));

            // Find and remove the citation (simple string-based removal)
            let modified = false;
            const sessionStr = JSON.stringify(sessionData, null, 2);

            // Remove line containing the pattern
            const lines = sessionStr.split('\n');
            const filteredLines = lines.filter(line => {
                if (line.includes(wrongInference)) {
                    modified = true;
                    return false; // Remove this line
                }
                return true; // Keep this line
            });

            if (!modified) {
                console.log('⚠️  Pattern not found in session structure - citation may be embedded');
                return { action: 'DELETE_FAILED', reason: 'Pattern not found' };
            }

            // Reconstruct JSON (handle trailing commas)
            let newContent = filteredLines.join('\n');

            // Fix JSON: remove trailing commas before ] or }
            newContent = newContent.replace(/,(\s*[\]}])/g, '$1');

            // Validate JSON
            JSON.parse(newContent);

            // Write back to file
            await fs.writeFile(trace.file, newContent, 'utf8');

            console.log(`✅ Citation deleted from ${trace.session_id}`);
            console.log(`   File: ${trace.file}`);
            console.log(`   Pattern removed: ${wrongInference}\n`);

            return {
                action: 'DELETED',
                session_id: trace.session_id,
                file: trace.file,
                pattern: wrongInference
            };

        } catch (error) {
            console.error(`❌ Delete failed: ${error.message}`);
            return { action: 'DELETE_FAILED', error: error.message };
        }
    }

    /**
     * Execute QUARANTINE action - Mark pattern as invalid (preserve session)
     * @param {string} wrongInference - Pattern to quarantine
     * @param {string} correctAnswer - Correct pattern
     * @param {object} trace - Trace result
     * @param {string} userMessage - User correction message
     * @returns {Promise<object>} Quarantine result
     */
    async executeQuarantine(wrongInference, correctAnswer, trace, userMessage) {
        console.log('\n🔒 Executing QUARANTINE...\n');

        // Document correction (existing logic)
        const correction = await this.documentCorrection({
            wrongInference,
            correctAnswer,
            userMessage,
            trace
        });

        console.log(`✅ Pattern quarantined: ${wrongInference}`);
        console.log(`   Correction ID: ${correction.correction_id}`);
        console.log(`   Session preserved: ${trace.found ? trace.session_id : 'N/A'}`);
        console.log(`   Future citation: Filtered\n`);

        return correction;
    }

    // ───────────────────────────────────────────────────────────────────
    // CLI COMMANDS
    // ───────────────────────────────────────────────────────────────────

    async cmdTrace(args) {
        const wrongInference = args.wrong;
        const correctAnswer = args.correct;
        const userMessage = args['user-message'];

        if (!wrongInference || !correctAnswer || !userMessage) {
            console.error('❌ Error: Missing required arguments');
            console.log('Usage: 6e652beb.js trace --wrong "..." --correct "..." --user-message "..."');
            process.exit(1);
        }

        // Trace inference
        const trace = await this.traceInference(wrongInference);

        // Document correction
        const correction = await this.documentCorrection({
            wrongInference,
            correctAnswer,
            userMessage,
            trace
        });

        // Display result
        console.log('\n🎯 ATHENA Memory Correction Complete\n');
        console.log(`Correction ID: ${correction.correction_id}`);
        console.log(`Wrong: ${correction.wrong_inference}`);
        console.log(`Correct: ${correction.correct_answer}`);
        console.log(`Source: ${correction.source_citation?.session_id || 'Not found (hallucination)'}`);
        console.log(`Failure Mode: ${correction.failure_mode}`);
        console.log(`Prevention Rule: ${correction.prevention_rule.rule}`);
        console.log(`Verification: ${correction.prevention_rule.verification}\n`);

        return correction;
    }

    async cmdTraceInteractive(args) {
        const wrongInference = args.wrong;
        const correctAnswer = args.correct;
        const userMessage = args['user-message'];

        if (!wrongInference || !correctAnswer || !userMessage) {
            console.error('❌ Error: Missing required arguments');
            console.log('Usage: 6e652beb.js trace-interactive --wrong "..." --correct "..." --user-message "..."');
            process.exit(1);
        }

        console.log('\n🔍 ATHENA Forensic Analysis (ESMC 3.95.0 Interactive Correction)\n');

        // Step 1: Trace inference
        const trace = await this.traceInference(wrongInference);

        // Step 2: Verify if real vs hallucination
        const verification = await this.verifySource(wrongInference);

        // Step 3: Determine recommendation
        const recommendation = this.determineRecommendation(verification, trace);

        // Step 4: Display forensic report
        console.log('📝 Wrong inference:', wrongInference);
        console.log('✅ Correct answer:', correctAnswer);
        console.log('💬 User message:', userMessage);
        console.log('');
        console.log('📍 Source Citation:');
        if (trace.found) {
            console.log(`   Session: ${trace.session_id}`);
            console.log(`   File: ${path.basename(trace.file)}`);
            console.log(`   Line: ${trace.line}`);
            console.log(`   Content: ${trace.content.substring(0, 80)}...`);
            console.log(`   Failure Mode: ${trace.failure_mode}`);
        } else {
            console.log('   ❌ Not found in memory (hallucination or inference from context)');
        }
        console.log('');
        console.log('🔍 Verification:');
        console.log(`   Status: ${verification.real ? '✅ REAL (file exists)' : '❌ HALLUCINATED (file missing)'}`);
        console.log(`   Reason: ${verification.reason}`);
        if (verification.path) {
            console.log(`   Path: ${verification.path}`);
        }
        console.log('');
        console.log('💡 Recommendation:', recommendation.action);
        console.log(`   Why: ${recommendation.reason}`);
        console.log(`   Details: ${recommendation.explanation}`);
        console.log('');
        console.log('─────────────────────────────────────────────────');
        console.log('');
        console.log('To prevent this from repeating, choose an action:');
        console.log('');
        console.log('  A. Delete citation from session (memory surgery)');
        console.log('     → Removes citation from .json file');
        console.log('     → Filesystem UNTOUCHED (code preserved)');
        console.log('     → Pros: Smaller memory, citation can\'t be misused');
        console.log('     → Cons: Loses historical record');
        if (recommendation.action === 'DELETE') {
            console.log('     ↑ RECOMMENDED for hallucinations');
        }
        console.log('');
        console.log('  B. Quarantine citation (flag as invalid, preserve session)');
        console.log('     → Keeps citation in memory, filters during retrieval');
        console.log('     → Filesystem UNTOUCHED (code preserved)');
        console.log('     → Pros: Preserves history, reversible, transparent');
        console.log('     → Cons: Citation still in memory (flagged)');
        if (recommendation.action === 'QUARANTINE') {
            console.log('     ↑ RECOMMENDED for misapplied real patterns');
        }
        console.log('');
        console.log('  C. Ignore (no correction stored)');
        console.log('     → No action taken');
        console.log('     → Pros: User controls timing');
        console.log('     → Cons: Error could repeat');
        console.log('');

        // Step 5: Get user input (interactive mode)
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const choice = await new Promise(resolve => {
            readline.question('Your choice (A/B/C): ', answer => {
                readline.close();
                resolve(answer.toUpperCase().trim());
            });
        });

        // Step 6: Execute user choice
        let result;
        switch (choice) {
            case 'A':
                result = await this.executeDelete(wrongInference, trace, userMessage);
                break;
            case 'B':
                result = await this.executeQuarantine(wrongInference, correctAnswer, trace, userMessage);
                break;
            case 'C':
                console.log('\n✓ No correction stored. Pattern remains active.\n');
                result = { action: 'IGNORED', reason: 'User choice' };
                break;
            default:
                console.log(`\n⚠️  Invalid choice: "${choice}". Defaulting to QUARANTINE (safe option).\n`);
                result = await this.executeQuarantine(wrongInference, correctAnswer, trace, userMessage);
                break;
        }

        return result;
    }

    async cmdFilter(args) {
        const sessionId = args['session-id'];

        if (!sessionId) {
            console.error('❌ Error: Missing --session-id');
            process.exit(1);
        }

        // Load session
        const sessionFile = path.join(this.sessionsDir, `${sessionId}.json`);
        const sessionData = JSON.parse(await fs.readFile(sessionFile, 'utf8'));

        // Filter session
        const filtered = await this.filterSession(sessionData);

        // Display results
        console.log(`\n📋 Citation Filter Results: ${sessionId}\n`);

        if (filtered._quarantined_citations) {
            console.log('⚠️  Quarantined Citations:');
            filtered._quarantined_citations.forEach(q => {
                console.log(`   - ${q.pattern}: ${q.reason}`);
            });
        }

        if (filtered._citation_warning) {
            console.log('\n⚠️  Citation Warning:');
            console.log(`   Correction: ${filtered._citation_warning.correction_id}`);
            console.log(`   Wrong: ${filtered._citation_warning.wrong_inference}`);
            console.log(`   Correct: ${filtered._citation_warning.correct_answer}`);
        }

        if (!filtered._quarantined_citations && !filtered._citation_warning) {
            console.log('✅ No quarantined citations or warnings');
        }

        console.log();
        return filtered;
    }

    async cmdList() {
        const corrections = await this.loadCorrections();

        console.log(`\n📚 ATHENA Memory Corrections (${corrections.corrections.length} total)\n`);

        if (corrections.corrections.length === 0) {
            console.log('No corrections documented yet.\n');
            return;
        }

        corrections.corrections.forEach(c => {
            console.log(`${c.correction_id} [${c.date}] - ${c.status.toUpperCase()}`);
            console.log(`   Wrong: ${c.wrong_inference}`);
            console.log(`   Correct: ${c.correct_answer}`);
            console.log(`   Source: ${c.source_citation?.session_id || 'Hallucination'}`);
            console.log(`   Mode: ${c.failure_mode}`);
            console.log(`   Rule: ${c.prevention_rule.rule}\n`);
        });

        console.log(`🚫 Quarantine Patterns: ${corrections.quarantine_patterns.length}\n`);
        corrections.quarantine_patterns.forEach(p => {
            console.log(`   - ${p.pattern} (${p.status})`);
        });
        console.log();
    }
}

// ═══════════════════════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;

    // Silent mode: suppress all console output
    let originalConsoleLog, originalConsoleError, originalConsoleInfo, originalConsoleWarn;
    if (silent) {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        originalConsoleInfo = console.info;
        originalConsoleWarn = console.warn;

        console.log = () => {};
        console.error = () => {};
        console.info = () => {};
        console.warn = () => {};
    }

    if (args.length === 0) {
        // Restore console for help output
        if (silent) {
            console.log = originalConsoleLog;
        }
        console.log(`
🧠 ATHENA Memory Correction System - ESMC 3.95.0

Usage:
  trace              Trace wrong inference and document correction (auto-quarantine)
  trace-interactive  Trace + interactive choice (DELETE/QUARANTINE/IGNORE) 🆕
  filter             Filter session citations (check for quarantined patterns)
  list               List all corrections

Examples:
  node 6e652beb.js trace --wrong "scribe-session-seed-cli.js" --correct "seed-session.js" --user-message "it should have called seed-session.js"
  node 6e652beb.js trace-interactive --wrong "scribe-session-seed-cli.js" --correct "seed-session.js" --user-message "it should have called seed-session.js"
  node 6e652beb.js filter --session-id "2025-11-13-esmc-392"
  node 6e652beb.js list
`);
        process.exit(0);
    }

    const command = args[0];
    const parsedArgs = {};

    // Parse arguments
    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            const value = args[i + 1];
            parsedArgs[key] = value;
            i++; // Skip next arg (it's the value)
        }
    }

    const projectRoot = await findProjectRoot();
    const athena = new ATHENAMemoryCorrection(projectRoot);

    try {
        switch (command) {
            case 'trace':
                await athena.cmdTrace(parsedArgs);
                break;
            case 'trace-interactive':
                await athena.cmdTraceInteractive(parsedArgs);
                break;
            case 'filter':
                await athena.cmdFilter(parsedArgs);
                break;
            case 'list':
                await athena.cmdList();
                break;
            default:
                console.error(`❌ Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { ATHENAMemoryCorrection };
