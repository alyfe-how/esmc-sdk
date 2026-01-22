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
/** ESMC 3.99.0 COLONELS Edit CLI | 2025-11-13 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: Bridge Claude Code Edit tool → AEGIS CL automation (Option A solution)
 *  Architecture: CLI wrapper executes Edit + shouldCreateCL + atomic CL generation
 *  Integration: Replaces direct Edit tool calls for files requiring CL tracking
 *
 *  EXECUTION PROTOCOL:
 *  node 4fb7f3ca.js edit <file_path> <old_string> <new_string> [--change="description"]
 *
 *  Returns: { success: bool, edited: bool, cl_created: bool, cl_file: string|null }
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════
// EXECUTION BLOCK: Main CLI Entry Point
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


    // Command validation
    if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
        showUsage();
        process.exit(args[0] === 'help' || args[0] === '--help' ? 0 : 1);
    }

    const command = args[0];

    try {
        switch (command) {
            case 'edit':
                await handleEdit(args.slice(1));
                break;
            default:
                console.error(`❌ Unknown command: ${command}`);
                showUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXECUTION BLOCK: Edit + CL Automation Handler
// ═══════════════════════════════════════════════════════════════════════

async function handleEdit(args) {
    // Parse arguments
    const filePath = args[0];
    const oldString = args[1];
    const newString = args[2];

    // Parse --change flag
    let changeDescription = 'Code update';
    const changeArg = args.find(arg => arg.startsWith('--change='));
    if (changeArg) {
        changeDescription = changeArg.split('=')[1];
    }

    // Validation
    if (!filePath || !oldString || !newString) {
        console.error('❌ Error: file_path, old_string, and new_string are required');
        console.log('\nUsage: node 4fb7f3ca.js edit <file_path> <old_string> <new_string> [--change="description"]');
        process.exit(1);
    }

    const resolvedPath = path.resolve(filePath);

    if (!fsSync.existsSync(resolvedPath)) {
        console.error(`❌ Error: File not found: ${resolvedPath}`);
        process.exit(1);
    }

    console.log(`\n🔧 COLONELS Edit CLI: ${path.basename(resolvedPath)}...`);

    // STEP 1: Read file content
    const originalContent = await fs.readFile(resolvedPath, 'utf8');
    console.log(`   📖 Read ${originalContent.length} bytes`);

    // STEP 2: Apply edit
    const newContent = originalContent.replace(oldString, newString);

    if (newContent === originalContent) {
        console.error(`   ❌ Error: old_string not found in file`);
        process.exit(1);
    }

    // STEP 3: CL Decision - Call shouldCreateCL heuristic from legacy system
    const { MemoryRegistry } = require('./e85aaeed.js');
    const registry = new MemoryRegistry();

    const clDecision = registry.shouldCreateCL({
        file_path: resolvedPath,
        old_string: oldString,
        new_string: newString,
        user_prompt: changeDescription,
        force_cl: false,
        no_cl: false
    });

    console.log(`   🔍 CL Decision: ${clDecision.trigger ? 'CREATE' : 'SKIP'} (${clDecision.reason})`);

    // STEP 4: Write edited content
    await fs.writeFile(resolvedPath, newContent, 'utf8');
    console.log(`   ✅ File edited successfully`);

    let clResult = null;

    // STEP 5: Create CL file if triggered
    if (clDecision.trigger) {
        const { CLAutomation } = require('./40ce9fbf.js');
        const clAutomation = new CLAutomation();

        const sourceFilename = path.basename(resolvedPath);

        clResult = await clAutomation.createCLFile({
            sourceFilename,
            change: changeDescription,
            impact: `${Math.abs(newString.length - oldString.length)} chars changed`,
            rationale: `Automated via 4fb7f3ca.js`,
            codeLocation: resolvedPath,
            component: 'ESMC'
        });

        console.log(`   ✅ CL created: ${clResult.filename}`);
        console.log(`   📁 Location: ${clResult.path}`);
        console.log(`   🏷️  Tag: ${clResult.inline_tag}`);
    }

    // STEP 6: Output result
    const result = {
        success: true,
        edited: true,
        cl_created: clDecision.trigger,
        cl_file: clResult ? clResult.filename : null,
        cl_tag: clResult ? clResult.inline_tag : null,
        cl_decision: clDecision
    };

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
}

// ═══════════════════════════════════════════════════════════════════════
// EXECUTION BLOCK: Usage Documentation
// ═══════════════════════════════════════════════════════════════════════

function showUsage() {
    console.log(`
🔧 COLONELS Edit CLI - Bridge Claude Code → AEGIS CL Automation

PURPOSE:
  Replaces direct Edit tool with integrated CL automation.
  Automatically creates changelogs when shouldCreateCL() triggers.

USAGE:
  node 4fb7f3ca.js edit <file_path> <old_string> <new_string> [options]

ARGUMENTS:
  file_path       Absolute path to file to edit
  old_string      Exact string to replace
  new_string      Replacement string

OPTIONS:
  --change="..."  Change description (used for CL creation)

EXECUTION FLOW:
  1. Read file content
  2. Apply edit (string replacement)
  3. Check shouldCreateCL() heuristic (12 conditions)
  4. Write edited content
  5. Create CL file if triggered
  6. Return result JSON

CL TRIGGER CONDITIONS (from shouldCreateCL):
  ALWAYS:
  - Architecture files (6c390b10.md, BRAIN.md, etc.)
  - Core system files (esmc-3*.js)
  - Protocol updates (ORACLE, ECHO, SEED keywords)
  - Security updates (auth, encrypt, validation keywords)

  NEVER:
  - Cosmetic changes (<50 chars)
  - Comment-only changes
  - Temporary debugging (console.log)

  CONDITIONAL:
  - Bug fixes >100 lines
  - Performance optimizations >500 chars

EXAMPLES:
  # Edit 6c390b10.md (architecture file - CL always created)
  node 4fb7f3ca.js edit "./6c390b10.md" "old text" "new text" --change="Fix routing"

  # Edit JavaScript file (CL created if conditions met)
  node 4fb7f3ca.js edit "./src/file.js" "foo" "bar" --change="Rename variable"

OUTPUT:
  JSON result with:
  - success: Operation success status
  - edited: File modification status
  - cl_created: Whether CL file was generated
  - cl_file: CL filename (or null)
  - cl_decision: Full heuristic decision object

TOKEN SAVINGS:
  Before: Edit tool + manual CL check + Write CL = ~200 tokens
  After: Single CLI call with automated CL = ~50 tokens
  Savings: 75% reduction + zero protocol violations

VERSION: ESMC 3.99.0 | Module: 4fb7f3ca.js
    `);
}

// ═══════════════════════════════════════════════════════════════════════
// EXECUTION BLOCK: CLI Bootstrap
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    main().catch(error => {
        console.error(`\n❌ Unhandled error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = { handleEdit };
