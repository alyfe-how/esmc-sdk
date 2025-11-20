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
/** ESMC 3.101.0 (Silent-by-default) - Base: 3.70 Standards Expansion CLI | 2025-11-07 | v1.0.0 | PROD
 *  Purpose: CLI wrapper for 5f65d4ef.js (70 standards - 31→70 expansion)
 *  Savings: ~25K tokens → 500 tokens = 98% reduction
 */

const path = require('path');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        showUsage();
        process.exit(1);
    }

    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    // Checks for --verbose flag or ESMC_VERBOSE=true, otherwise defaults to silent
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    return {
        command: cleanArgs[0],
        options: cleanArgs.slice(1),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🎖️ ESMC Standards Expansion CLI - 70 Industry Standards (31→70)

Usage: node 558325c4.js <command> [options]

Commands:
  list [category]          List all standards (optional filter by category)
  colonel <name>           Get standards assigned to colonel
  tier <tier>              Get standards available in tier (FREE/PRO/MAX)
  standard <id>            Get standard details by ID
  count                    Get standards count summary
  expansion                Show ESMC 3.70 expansion summary (39 new standards)
  help                     Show this help

Categories:
  - Architecture & Design (16 standards)
  - Code Quality & Practices (12 standards)
  - Security & Compliance (20 standards)
  - Testing & QA (11 standards)
  - Operations & Delivery (9 standards)
  - Accessibility (2 standards)

Version: ESMC 3.70 | Module: 5f65d4ef.js (70 standards)
    `);
}

async function main() {
    const { command, options, silent } = parseArgs();

    // Silent mode: suppress all console output from engine
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
    try {
        if (command === 'help' || command === '--help') { if (silent) {
                // Restore console for help output
                console.log = originalConsoleLog;
            }
            showUsage(); return; }
        const { StandardsRegistry, StandardValidators, ECHELONSelection } = require('./5f65d4ef.js');
        const registry = new StandardsRegistry();

        switch (command) {
            case 'list':
                const category = options.join(' ') || null;
                const standards = category
                    ? registry.getStandardsByCategory(category)
                    : Object.values(registry.getAllStandards());
                // Restore console for final JSON output
        if (silent) {
            console.log = originalConsoleLog;
        }

        console.log(JSON.stringify({
                    command: 'list',
                    category: category || 'all',
                    count: standards.length,
                    standards: standards
                }, null, 2));
                break;

            case 'colonel':
                const colonelName = options[0]?.toUpperCase();
                if (!colonelName) {
                    console.error('❌ Error: Colonel name required (ALPHA, BETA, GAMMA, DELTA, ZETA, ETA, EPSILON)');
                    process.exit(1);
                }
                const colonelStandards = registry.getStandardsByColonel(colonelName);
                console.log(JSON.stringify({
                    command: 'colonel',
                    colonel: colonelName,
                    count: colonelStandards.length,
                    standards: colonelStandards
                }, null, 2));
                break;

            case 'tier':
                const tier = options[0]?.toUpperCase() || 'MAX';
                const tierStandards = registry.getStandardsByTier(tier);
                console.log(JSON.stringify({
                    command: 'tier',
                    tier: tier,
                    count: tierStandards.length,
                    standards: tierStandards
                }, null, 2));
                break;

            case 'standard':
                const standardId = options[0]?.toUpperCase();
                if (!standardId) {
                    console.error('❌ Error: Standard ID required');
                    process.exit(1);
                }
                const standard = registry.getStandard(standardId);
                if (!standard) {
                    console.error(`❌ Error: Standard '${standardId}' not found`);
                    process.exit(1);
                }
                console.log(JSON.stringify({
                    command: 'standard',
                    standard: standard
                }, null, 2));
                break;

            case 'count':
                const allStandards = registry.getAllStandards();
                const categoryCounts = {
                    'Architecture & Design': registry.getStandardsByCategory('Architecture & Design').length,
                    'Code Quality & Practices': registry.getStandardsByCategory('Code Quality & Practices').length,
                    'Security & Compliance': registry.getStandardsByCategory('Security & Compliance').length,
                    'Testing & QA': registry.getStandardsByCategory('Testing & QA').length,
                    'Operations & Delivery': registry.getStandardsByCategory('Operations & Delivery').length,
                    'Accessibility': registry.getStandardsByCategory('Accessibility').length
                };
                console.log(JSON.stringify({
                    command: 'count',
                    total: Object.keys(allStandards).length,
                    byCategory: categoryCounts,
                    byColonel: {
                        ALPHA: registry.getStandardsByColonel('ALPHA').length,
                        BETA: registry.getStandardsByColonel('BETA').length,
                        GAMMA: registry.getStandardsByColonel('GAMMA').length,
                        DELTA: registry.getStandardsByColonel('DELTA').length,
                        ZETA: registry.getStandardsByColonel('ZETA').length,
                        ETA: registry.getStandardsByColonel('ETA').length
                    },
                    byTier: {
                        FREE: registry.getStandardsByTier('FREE').length,
                        PRO: registry.getStandardsByTier('PRO').length,
                        'MAX/VIP': registry.getStandardsByTier('MAX/VIP').length
                    }
                }, null, 2));
                break;

            case 'expansion':
                const expansionSummary = {
                    command: 'expansion',
                    version: '3.70.0',
                    date: '2025-11-07',
                    previous_count: 31,
                    new_count: 70,
                    added: 39,
                    breakdown: {
                        'Security Standards': 12,
                        'Architecture Standards': 8,
                        'Code Quality Standards': 5,
                        'Testing Standards': 7,
                        'Operations Standards': 5,
                        'Accessibility Standards': 2
                    },
                    industry_standards: [
                        'OWASP Top 10', 'NIST Cybersecurity', 'PCI DSS', 'HIPAA', 'FedRAMP', 'CIS Benchmarks',
                        'ISO 27017', 'ISO 27701', 'CCPA', 'Threat Modeling', 'Secure SDLC', 'Secrets Management',
                        '12-Factor App', 'Cloud Native', 'Microservices', 'Event-Driven', 'OpenAPI', 'GraphQL',
                        'Serverless', 'API Versioning', 'SOLID Principles', 'Clean Code', 'Code Smells',
                        'Immutability', 'Error Handling', 'TDD', 'BDD', 'Mutation Testing', 'Property Testing',
                        'Performance Testing', 'Security Testing', 'Accessibility Testing', 'SRE Principles',
                        'Infrastructure as Code', 'GitOps', 'Container Security', 'Chaos Engineering',
                        'WCAG 2.1', 'Mobile-First Design'
                    ]
                };
                console.log(JSON.stringify(expansionSummary, null, 2));
                break;

            default:
                console.error(`❌ Unknown command: ${command}`);
                showUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (process.env.DEBUG) console.error(error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => { console.error(`❌ Fatal: ${error.message}`); process.exit(1); });
}

module.exports = { main };
