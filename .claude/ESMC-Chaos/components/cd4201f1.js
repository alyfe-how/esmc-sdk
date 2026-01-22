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
 * ESMC 3.82.5 - Manifest Validator CLI
 *
 * Purpose: Validate all CLI calls, file references, and parameter contracts across manifests
 * Usage: node cd4201f1.js audit --scope all
 *
 * Validation Checks:
 * 1. File Existence: Verify all `node "..."` paths exist
 * 2. Deprecated References: Flag references to deprecated files (COLONELS-CORE.md, etc.)
 * 3. Path Accuracy: Check CLI paths match actual file locations
 * 4. Cross-References: Validate manifest counter names match actual files
 *
 * Output: .esmc-manifest-validation-report.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════

const MANIFEST_FILES = [
  '6c390b10.md',
  'b4fe7dcb.md',
  '2dfb6b92.md',
  '8a61c26c.md',
  'COLONELS-CORE.md', // Deprecated
  'REFERENCE-CORE.md', // Deprecated (reverted to 8a61c26c.md)
  'BRAIN.md'           // Deprecated
];

const DEPRECATED_FILES = [
  'COLONELS-CORE.md',
  'REFERENCE-CORE.md',
  'BRAIN.md'
];

const MANIFEST_COUNTERS = {
  'Counter_A': '6c390b10.md',
  'Counter_B': 'b4fe7dcb.md',
  'Counter_C': '2dfb6b92.md',
  'Counter_D': '8a61c26c.md',
  'Counter_X': 'b4a5c63c.js'
};

// ═══════════════════════════════════════════════════════════
// Core Validation Logic
// ═══════════════════════════════════════════════════════════

/**
 * Find all CLI calls in manifests
 */
function findCLICalls(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return { error: `Manifest not found: ${manifestPath}`, calls: [] };
  }

  const content = fs.readFileSync(manifestPath, 'utf8');
  const lines = content.split('\n');

  const calls = [];
  const regex = /node\s+"([^"]+)"/g;

  lines.forEach((line, index) => {
    let match;
    while ((match = regex.exec(line)) !== null) {
      calls.push({
        line: index + 1,
        path: match[1],
        fullLine: line.trim()
      });
    }
  });

  return { calls, lineCount: lines.length };
}

/**
 * Validate file existence
 */
function validateFileExists(cliPath) {
  // Manifest paths are relative to project root (where user runs commands)
  // Example: ".claude/ESMC-Chaos/components/6ef4ca36.js"
  const workingDir = process.cwd();
  const fullPath = path.join(workingDir, cliPath);

  return {
    exists: fs.existsSync(fullPath),
    resolvedPath: fullPath
  };
}

/**
 * Find deprecated file references
 */
function findDeprecatedReferences(manifestPath, deprecatedFiles) {
  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  const content = fs.readFileSync(manifestPath, 'utf8');
  const lines = content.split('\n');

  const references = [];

  deprecatedFiles.forEach(deprecatedFile => {
    lines.forEach((line, index) => {
      if (line.includes(deprecatedFile)) {
        references.push({
          line: index + 1,
          deprecatedFile,
          context: line.trim()
        });
      }
    });
  });

  return references;
}

/**
 * Validate counter names match actual files
 */
function validateCounterNames(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  const content = fs.readFileSync(manifestPath, 'utf8');
  const mismatches = [];

  Object.entries(MANIFEST_COUNTERS).forEach(([counter, expectedFile]) => {
    const counterRegex = new RegExp(`${counter}[^\\w]`, 'g');

    if (counterRegex.test(content)) {
      // Check if the expected file is mentioned nearby
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(counter)) {
          // Check if deprecated file is mentioned instead
          const hasDeprecated = DEPRECATED_FILES.some(dep =>
            line.includes(dep) && !line.includes(expectedFile)
          );

          if (hasDeprecated) {
            mismatches.push({
              line: index + 1,
              counter,
              expectedFile,
              actualLine: line.trim()
            });
          }
        }
      });
    }
  });

  return mismatches;
}

/**
 * Main audit function
 */
function auditManifests(scope = 'all') {
  const coreDir = path.resolve(__dirname, '..');

  const report = {
    timestamp: new Date().toISOString(),
    version: '3.82.5',
    scope,
    summary: {
      manifestsScanned: 0,
      cliCallsFound: 0,
      brokenCalls: 0,
      deprecatedReferences: 0,
      counterMismatches: 0
    },
    manifests: {},
    brokenReferences: [],
    deprecatedUsage: [],
    counterIssues: [],
    recommendations: []
  };

  // Scan each manifest
  MANIFEST_FILES.forEach(manifestFile => {
    const manifestPath = path.join(coreDir, manifestFile);

    if (!fs.existsSync(manifestPath)) {
      report.manifests[manifestFile] = { error: 'File not found', skipped: true };
      return;
    }

    report.summary.manifestsScanned++;

    // Find CLI calls
    const { calls, lineCount } = findCLICalls(manifestPath);
    report.summary.cliCallsFound += calls.length;

    // Validate each CLI call
    const validatedCalls = calls.map(call => {
      const validation = validateFileExists(call.path);

      if (!validation.exists) {
        report.summary.brokenCalls++;
        report.brokenReferences.push({
          manifest: manifestFile,
          line: call.line,
          path: call.path,
          severity: 'HIGH',
          issue: 'CLI file does not exist',
          recommendation: `Verify path or create missing file: ${call.path}`
        });
      }

      return {
        ...call,
        ...validation
      };
    });

    // Find deprecated references
    const deprecatedRefs = findDeprecatedReferences(manifestPath, DEPRECATED_FILES);
    report.summary.deprecatedReferences += deprecatedRefs.length;

    deprecatedRefs.forEach(ref => {
      report.deprecatedUsage.push({
        manifest: manifestFile,
        line: ref.line,
        deprecatedFile: ref.deprecatedFile,
        severity: ref.deprecatedFile === 'COLONELS-CORE.md' ? 'MEDIUM' : 'LOW',
        context: ref.context,
        recommendation: `Update reference from ${ref.deprecatedFile} to active manifest`
      });
    });

    // Validate counter names
    const counterIssues = validateCounterNames(manifestPath);
    report.summary.counterMismatches += counterIssues.length;

    counterIssues.forEach(issue => {
      report.counterIssues.push({
        manifest: manifestFile,
        line: issue.line,
        counter: issue.counter,
        expectedFile: issue.expectedFile,
        severity: 'MEDIUM',
        context: issue.actualLine,
        recommendation: `Update ${issue.counter} reference to ${issue.expectedFile}`
      });
    });

    report.manifests[manifestFile] = {
      lineCount,
      cliCalls: calls.length,
      brokenCalls: validatedCalls.filter(c => !c.exists).length,
      deprecatedReferences: deprecatedRefs.length,
      counterIssues: counterIssues.length,
      calls: validatedCalls
    };
  });

  // Generate recommendations
  if (report.summary.deprecatedReferences > 0) {
    report.recommendations.push({
      priority: 'HIGH',
      category: 'systematic_cleanup',
      action: 'Execute systematic grep-and-replace for all deprecated references',
      impact: `${report.summary.deprecatedReferences} references to update`
    });
  }

  if (report.summary.brokenCalls > 0) {
    report.recommendations.push({
      priority: 'CRITICAL',
      category: 'broken_paths',
      action: 'Fix broken CLI paths immediately',
      impact: `${report.summary.brokenCalls} broken CLI calls found`
    });
  }

  if (report.summary.counterMismatches > 0) {
    report.recommendations.push({
      priority: 'MEDIUM',
      category: 'counter_accuracy',
      action: 'Update counter documentation to reference active manifests',
      impact: `${report.summary.counterMismatches} counter mismatches found`
    });
  }

  return report;
}

/**
 * Save report to file
 */
function saveReport(report) {
  const rootDir = path.resolve(__dirname, '../..');
  const reportPath = path.join(rootDir, '.esmc-manifest-validation-report.json');

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  return reportPath;
}

/**
 * Display summary
 */
function displaySummary(report) {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  📊 ESMC MANIFEST VALIDATION REPORT                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`🗓️  Timestamp: ${report.timestamp}`);
  console.log(`📁 Manifests Scanned: ${report.summary.manifestsScanned}`);
  console.log(`🔧 CLI Calls Found: ${report.summary.cliCallsFound}`);
  console.log(`❌ Broken Calls: ${report.summary.brokenCalls}`);
  console.log(`⚠️  Deprecated References: ${report.summary.deprecatedReferences}`);
  console.log(`📋 Counter Mismatches: ${report.summary.counterMismatches}`);

  console.log('\n─────────────────────────────────────────────────────────────\n');

  if (report.brokenReferences.length > 0) {
    console.log('❌ BROKEN REFERENCES:\n');
    report.brokenReferences.forEach((ref, i) => {
      console.log(`${i + 1}. ${ref.manifest}:${ref.line}`);
      console.log(`   Path: ${ref.path}`);
      console.log(`   Issue: ${ref.issue}`);
      console.log(`   Severity: ${ref.severity}\n`);
    });
  }

  if (report.deprecatedUsage.length > 5) {
    console.log(`⚠️  DEPRECATED REFERENCES: ${report.deprecatedUsage.length} found\n`);
    console.log('   Top 5:\n');
    report.deprecatedUsage.slice(0, 5).forEach((ref, i) => {
      console.log(`${i + 1}. ${ref.manifest}:${ref.line} → ${ref.deprecatedFile}`);
    });
    console.log(`\n   ... and ${report.deprecatedUsage.length - 5} more\n`);
  } else if (report.deprecatedUsage.length > 0) {
    console.log('⚠️  DEPRECATED REFERENCES:\n');
    report.deprecatedUsage.forEach((ref, i) => {
      console.log(`${i + 1}. ${ref.manifest}:${ref.line} → ${ref.deprecatedFile}`);
    });
    console.log('');
  }

  if (report.counterIssues.length > 0) {
    console.log('📋 COUNTER MISMATCHES:\n');
    report.counterIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue.manifest}:${issue.line}`);
      console.log(`   Counter: ${issue.counter} → Expected: ${issue.expectedFile}`);
      console.log(`   Severity: ${issue.severity}\n`);
    });
  }

  console.log('─────────────────────────────────────────────────────────────\n');

  if (report.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:\n');
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority}] ${rec.action}`);
      console.log(`   Impact: ${rec.impact}\n`);
    });
  }

  console.log('─────────────────────────────────────────────────────────────\n');
  console.log('✅ Report saved to: .claude/.esmc-manifest-validation-report.json\n');
}

// ═══════════════════════════════════════════════════════════
// CLI Interface
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);

// 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
const silent = !verbose;
const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

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

const command = cleanArgs[0];
const scopeIndex = args.indexOf('--scope');
const scope = scopeIndex !== -1 ? args[scopeIndex + 1] : 'all';

if (command !== 'audit') {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  📚 MANIFEST VALIDATOR CLI - Usage                             ║
╚═══════════════════════════════════════════════════════════════╝

Usage: node cd4201f1.js audit [OPTIONS]

Options:
  --scope <all|core|deprecated>  Validation scope (default: all)

Examples:
  node cd4201f1.js audit
  node cd4201f1.js audit --scope core
  `);
  process.exit(1);
}

// Execute audit
try {
  console.log('\n🔍 Scanning manifests...\n');

  const report = auditManifests(scope);
  const reportPath = saveReport(report);

  displaySummary(report);

  // Exit with error code if issues found
  const hasIssues =
    report.summary.brokenCalls > 0 ||
    report.summary.deprecatedReferences > 0 ||
    report.summary.counterMismatches > 0;

  process.exit(hasIssues ? 1 : 0);

} catch (error) {
  console.error('\n❌ Validation failed:', error.message);
  console.error(error.stack);
  process.exit(2);
}
