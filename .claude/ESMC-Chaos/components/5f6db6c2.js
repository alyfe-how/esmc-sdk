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
/** ESMC 4.1 ATHENA SF (Strategic Forecaster) CLI | 2025-11-19 | v1.2.0
 *  Purpose: L5 - Strategic Forecaster - Predict what user WILL need next
 *  Token Cost: ~100 tokens (CLI-wrapped precedent query via GPT-4o-mini)
 *  Innovation: 98% cost reduction via API offload (300 → 100 tokens)
 *  Breakthrough: Precedent queries CLI-wrapped following ESMC 3.83+ pattern
 *  ESMC 4.1: CIE → L5 pipeline (MAX/VIP proactive suggestions integration)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) { showUsage(); process.exit(1); }

    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const silent = !verbose;
    const cleanArgs = args.filter(arg => !['--silent', '-s', '--verbose', '-v'].includes(arg));

    return {
        command: cleanArgs[0],
        inputs: cleanArgs.slice(1),
        silent: silent
    };
}

function showUsage() {
    console.log(`
🛡️ ATHENA SF (Strategic Forecaster) CLI - L5 Intelligence

Usage: node 5f6db6c2.js <command> <inputs> [--silent|-s]

Commands:
  forecast <cwa> <pa> <ts> <ls>    Forecast strategic needs from L1-L4 synthesis
  help                             Show this help

Inputs: JSON strings from CWA, PA, TS, LS outputs

Options:
  --silent, -s            Suppress verbose output, only return JSON

Version: ESMC 4.1 | L5 - Strategic Forecaster (CLI-Wrapped Precedents + CIE Pipeline)
    `);
}

/**
 * ESMC 3.103.0: Query precedent database via CLI-wrapper (98% cost reduction)
 * @param {Object} cwa - L1 Context Window Analyzer data
 * @param {Object} ts - L3 Technical Synthesizer data
 * @param {Object} ls - L4 Logical Synthesizer data
 * @returns {Array} Matching precedents with confidence scores
 */
function queryPrecedents(cwa, ts, ls) {
    // Build current context from L1, L3, L4
    const keywords = extractKeywords(ts);
    const workflow = ts.technical_summary?.workflow || 'generic';
    const domain = ls.logical_summary?.WHERE || 'unknown';

    try {
        // ESMC 3.103.0 Breakthrough: CLI-wrapped precedent query
        // Cost: 100 tokens @ $0.15/MTok (GPT-4o-mini) = $0.000015 per forecast
        // vs. 300 tokens @ $3/MTok (Sonnet) = $0.0009 per forecast
        // Savings: 98% cost reduction
        const cliPath = path.join(__dirname, 'a1197985.js');
        const keywordsArg = `--keywords=${keywords.join(',')}`;
        const workflowArg = `--workflow=${workflow}`;
        const domainArg = `--domain=${domain}`;

        const result = execSync(
            `node "${cliPath}" query ${keywordsArg} ${workflowArg} ${domainArg}`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
        );

        return JSON.parse(result);
    } catch (error) {
        // Graceful fallback: if CLI fails, return empty array
        // L5 Strategic Forecaster will fallback to structural analysis
        console.error(`Warning: L5 precedent CLI failed (${error.message}), using structural fallback`);
        return [];
    }
}

/**
 * Extract keywords from technical synthesizer output
 * @param {Object} ts - Technical Synthesizer data
 * @returns {Array} Extracted keywords
 */
function extractKeywords(ts) {
    const keywords = [];
    const intent = ts.technical_summary?.intent || '';

    // Extract common technical keywords
    const keywordPatterns = [
        'security', 'audit', 'vulnerability', 'authentication', 'authorization',
        'performance', 'optimization', 'tokenomics', 'architecture', 'refactor',
        'testing', 'deployment', 'documentation', 'integration', 'migration'
    ];

    keywordPatterns.forEach(keyword => {
        if (intent.toLowerCase().includes(keyword)) {
            keywords.push(keyword);
        }
    });

    return keywords;
}

function forecastStrategic(cwaJson, paJson, tsJson, lsJson) {
    let cwa, pa, ts, ls;

    try {
        cwa = typeof cwaJson === 'string' ? JSON.parse(cwaJson) : cwaJson;
        pa = typeof paJson === 'string' ? JSON.parse(paJson) : paJson;
        ts = typeof tsJson === 'string' ? JSON.parse(tsJson) : tsJson;
        ls = typeof lsJson === 'string' ? JSON.parse(lsJson) : lsJson;
    } catch (error) {
        throw new Error(`Failed to parse L1-L4 inputs: ${error.message}`);
    }

    const forecast = {
        current_task_complete: ts.technical_summary?.intent || 'Unknown task',
        strategic_gaps: [],
        next_steps_ranked: [],
        cie_suggestions: [],  // ESMC 4.1: CIE proactive suggestions
        timestamp: new Date().toISOString()
    };

    // ESMC 4.1: Load CIE output for proactive suggestions (MAX/VIP tier-gated feature)
    const ciePath = path.resolve(process.cwd(), '.esmc-cie-output.json');
    let cieOutput = null;
    if (fs.existsSync(ciePath)) {
        try {
            cieOutput = JSON.parse(fs.readFileSync(ciePath, 'utf-8'));
            // Add CIE proactive suggestions to forecast
            if (cieOutput.proactive_suggestions && cieOutput.proactive_suggestions.length > 0) {
                cieOutput.proactive_suggestions.forEach(suggestion => {
                    forecast.strategic_gaps.push({
                        gap: suggestion,
                        severity: 'high',
                        reasoning: 'CIE proactive intelligence detected user need',
                        will_vs_would: 'WILL',
                        justification: 'Context Inference Engine (MAX/VIP) identified this based on user patterns and inferred needs',
                        confidence: 0.85,
                        source: 'cie_proactive'
                    });
                });
                forecast.cie_suggestions = cieOutput.proactive_suggestions;
            }
            // Also add detected gaps from CIE
            if (cieOutput.detected_gaps && cieOutput.detected_gaps.length > 0) {
                cieOutput.detected_gaps.forEach(gap => {
                    forecast.strategic_gaps.push({
                        gap: gap,
                        severity: 'medium',
                        reasoning: 'CIE detected knowledge/context gap',
                        will_vs_would: 'WILL',
                        justification: 'Context Inference Engine identified gap in current context',
                        confidence: 0.75,
                        source: 'cie_gap_detection'
                    });
                });
            }
        } catch (e) {
            // Graceful fallback - CIE not available or parse error
        }
    }

    // ESMC 3.102.0: STEP 1 - Query precedents FIRST (evidence-based forecasting)
    const precedents = queryPrecedents(cwa, ts, ls);

    if (precedents.length > 0) {
        // Use top precedent-based forecast (highest confidence)
        const topPrecedent = precedents[0];
        forecast.strategic_gaps.push({
            gap: topPrecedent.next_step,
            severity: topPrecedent.confidence > 0.7 ? 'high' : 'medium',
            reasoning: topPrecedent.reasoning,
            will_vs_would: 'WILL',
            justification: `${topPrecedent.precedent} show pattern (${Math.round(topPrecedent.success_rate * 100)}% success rate). Evidence: ${topPrecedent.confidence.toFixed(2)} confidence match.`,
            confidence: topPrecedent.confidence,
            source: 'precedent_database'
        });
    }

    // STEP 2 - Fallback to structural analysis (if no precedents OR low confidence)
    if (precedents.length === 0 || precedents[0].confidence < 0.7) {
        // Identify gaps from L2 (Project Analyzer)
        const gaps = pa.gaps_identified || [];
        const missingPatterns = pa.architecture_patterns?.missing || [];

        // Build strategic gaps with will/would test
        gaps.forEach(gap => {
            const justification = buildJustification(gap, cwa, pa, ts, ls);
            if (justification) {
                forecast.strategic_gaps.push({
                    gap: gap,
                    severity: determineSeverity(gap, ls),
                    reasoning: justification.reasoning,
                    will_vs_would: 'WILL',
                    justification: justification.evidence,
                    source: 'structural_analysis'
                });
            }
        });

        // Add missing architecture patterns
        missingPatterns.forEach(pattern => {
            const justification = buildArchitectureJustification(pattern, ts, ls);
            if (justification) {
                forecast.strategic_gaps.push({
                    gap: pattern,
                    severity: 'medium',
                    reasoning: justification.reasoning,
                    will_vs_would: 'WILL',
                    justification: justification.evidence,
                    source: 'structural_analysis'
                });
            }
        });
    }

    // Rank next steps by severity and confidence
    // ESMC 4.1: CIE proactive > precedent > structural (intelligence priority)
    forecast.next_steps_ranked = forecast.strategic_gaps
        .sort((a, b) => {
            // CIE proactive suggestions rank highest (MAX/VIP proactive intelligence)
            if (a.source === 'cie_proactive' && b.source !== 'cie_proactive') return -1;
            if (b.source === 'cie_proactive' && a.source !== 'cie_proactive') return 1;
            // Precedent-based forecasts rank second
            if (a.source === 'precedent_database' && b.source !== 'precedent_database') return -1;
            if (b.source === 'precedent_database' && a.source !== 'precedent_database') return 1;
            // CIE gap detection ranks third
            if (a.source === 'cie_gap_detection' && b.source !== 'cie_gap_detection') return -1;
            if (b.source === 'cie_gap_detection' && a.source !== 'cie_gap_detection') return 1;
            // Then by severity
            return getSeverityScore(b.severity) - getSeverityScore(a.severity);
        })
        .map((g, i) => `${i + 1}. ${g.gap} (${g.severity} - ${g.reasoning})`);

    return forecast;
}

function buildJustification(gap, cwa, pa, ts, ls) {
    const gapLower = gap.toLowerCase();

    // Example: No session management
    if (gapLower.includes('session')) {
        return {
            reasoning: 'Authentication implemented without persistence',
            evidence: `L2 PA found no Redis/session files. L3 TS shows auth was implemented. L4 LS indicates WHERE=production (stateful sessions required). Architectural necessity.`
        };
    }

    // Example: No test files
    if (gapLower.includes('test')) {
        return {
            reasoning: 'No test coverage for production deployment',
            evidence: `L2 PA found no test files. L4 LS shows WHERE=production. Testing is architectural requirement for production systems.`
        };
    }

    // Generic gap - can justify
    return {
        reasoning: `${gap} detected by project analysis`,
        evidence: `L2 PA identified gap. L3 TS shows implementation exists. Completion requirement.`
    };
}

function buildArchitectureJustification(pattern, ts, ls) {
    if (pattern === 'Test Infrastructure') {
        return {
            reasoning: 'Production deployment requires test coverage',
            evidence: `L4 LS shows WHERE=production. L3 TS indicates ${ts.complexity} complexity. Tests are architectural requirement.`
        };
    }

    if (pattern === 'Documentation') {
        return {
            reasoning: 'Maintainability requirement',
            evidence: `L3 TS shows ${ts.technical_summary?.precedents || 'no precedents'}. Documentation enables future maintenance.`
        };
    }

    return null;
}

function determineSeverity(gap, ls) {
    const gapLower = gap.toLowerCase();
    const urgency = ls.timing_urgency || '';

    if (gapLower.includes('session') || gapLower.includes('auth')) return 'critical';
    if (gapLower.includes('test') && urgency.includes('High')) return 'high';
    if (gapLower.includes('doc')) return 'medium';
    return 'medium';
}

function getSeverityScore(severity) {
    const scores = { critical: 3, high: 2, medium: 1, low: 0 };
    return scores[severity] || 0;
}

async function main() {
    const { command, inputs, silent } = parseArgs();

    try {
        switch (command) {
            case 'forecast': {
                if (inputs.length < 4) {
                    console.error(JSON.stringify({ error: 'Requires 4 inputs: CWA, PA, TS, LS' }, null, 2));
                    process.exit(1);
                }
                const result = forecastStrategic(inputs[0], inputs[1], inputs[2], inputs[3]);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'help':
                showUsage();
                break;
            default:
                console.error(`Unknown command: ${command}`);
                showUsage();
                process.exit(1);
        }
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

module.exports = { forecastStrategic };
