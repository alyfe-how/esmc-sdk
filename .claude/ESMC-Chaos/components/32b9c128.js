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
 * ESMC 3.80.1 - Threshold-Based Execution Gating
 * Purpose: Separate threshold logic for execution vs non-execution tasks
 * Philosophy: Prevention via skill confidence - only implement when tech >= 85%
 *
 * User's Architectural Vision:
 *   "For execution stuffs (implement/fix/build):
 *      IF tech >= 85% AND logical >= 70% → IMPLEMENT
 *      IF tech >= 85% AND logical >= 50% → DEFER
 *      IF tech >= 85% AND logical < 50% → REJECT
 *      IF tech < 85% → REJECT (insufficient skill/knowledge)
 *
 *    For non-execution stuffs (explain/analyze/explore):
 *      Use base formula: (tech × 0.4) + (logical × 0.6) = confidence"
 *
 * Commands:
 *   gate <tech_score> <logical_score> <topic> [--silent]
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// EXECUTION DETECTION
// ============================================================================

/**
 * Detect if request is execution-oriented vs exploratory
 *
 * @param {string} topic - User request topic
 * @returns {Object} - {is_execution: boolean, workflow_type: string, confidence: number}
 */
function detectExecutionType(topic) {
    const topicLower = topic.toLowerCase();

    // Execution keywords (implementation actions)
    const executionPatterns = [
        { pattern: /\b(implement|build|create|add|develop|code|write)\b/i, type: 'implementation', weight: 0.9 },
        { pattern: /\b(fix|debug|resolve|patch|correct)\b/i, type: 'bug_fix', weight: 0.85 },
        { pattern: /\b(refactor|optimize|improve|enhance|upgrade)\b/i, type: 'refactoring', weight: 0.8 },
        { pattern: /\b(integrate|connect|link|setup|configure)\b/i, type: 'integration', weight: 0.75 },
        { pattern: /\b(deploy|install|migrate|update)\b/i, type: 'deployment', weight: 0.7 }
    ];

    // Non-execution keywords (exploratory/analytical actions)
    const nonExecutionPatterns = [
        { pattern: /\b(explain|describe|tell|show|teach)\b/i, type: 'explanation', weight: 0.9 },
        { pattern: /\b(analyze|examine|review|assess|evaluate)\b/i, type: 'analysis', weight: 0.85 },
        { pattern: /\b(find|search|locate|discover|identify)\b/i, type: 'exploration', weight: 0.8 },
        { pattern: /\b(understand|learn|study|research)\b/i, type: 'learning', weight: 0.75 },
        { pattern: /\b(list|display|print|output)\b/i, type: 'query', weight: 0.7 }
    ];

    let executionScore = 0;
    let nonExecutionScore = 0;
    let detectedType = 'unknown';

    // Check execution patterns
    for (const { pattern, type, weight } of executionPatterns) {
        if (pattern.test(topicLower)) {
            executionScore = Math.max(executionScore, weight);
            if (weight === executionScore) detectedType = type;
        }
    }

    // Check non-execution patterns
    for (const { pattern, type, weight } of nonExecutionPatterns) {
        if (pattern.test(topicLower)) {
            nonExecutionScore = Math.max(nonExecutionScore, weight);
            if (weight > executionScore && weight === nonExecutionScore) detectedType = type;
        }
    }

    // Determine classification
    const isExecution = executionScore > nonExecutionScore;
    const confidence = Math.max(executionScore, nonExecutionScore);

    return {
        is_execution: isExecution,
        workflow_type: detectedType,
        confidence: confidence,
        execution_score: executionScore,
        non_execution_score: nonExecutionScore
    };
}

// ============================================================================
// THRESHOLD GATING LOGIC
// ============================================================================

/**
 * Apply threshold-based gating rules
 *
 * @param {number} techScore - Technical feasibility (0-100 from Phase 2A)
 * @param {number} logicalScore - Logical appropriateness (0-100 from Phase 2B)
 * @param {string} topic - User request topic
 * @param {Object} options - CLI options
 * @returns {Object} - Gating decision with verdict, confidence, reasoning
 */
function applyThresholdGating(techScore, logicalScore, topic, options = {}) {
    const silent = options.silent !== false;  // Default true (silent) unless explicitly set to false

    // Step 1: Detect execution vs non-execution
    const executionType = detectExecutionType(topic);

    if (!silent) {
        console.log(`\n🎯 Execution Type Detection:`);
        console.log(`   Type: ${executionType.is_execution ? 'EXECUTION' : 'NON-EXECUTION'}`);
        console.log(`   Workflow: ${executionType.workflow_type}`);
        console.log(`   Confidence: ${(executionType.confidence * 100).toFixed(0)}%`);
    }

    // Step 2: Apply gating rules based on type
    let verdict, confidence, reasoning;

    if (executionType.is_execution) {
        // EXECUTION TASKS: Threshold-based rules
        if (techScore < 85) {
            // Insufficient technical skill/knowledge
            verdict = 'REJECT';
            confidence = techScore;
            reasoning = {
                rule: 'tech < 85%',
                technical_score: techScore,
                logical_score: logicalScore,
                explanation: `Insufficient technical skill/knowledge (${techScore.toFixed(1)}% < 85% threshold). Implementation risk too high - missing expertise/experience required for reliable execution.`,
                recommendation: 'Research topic, gather expertise, or defer to specialist with required skill set'
            };
        } else if (logicalScore >= 70) {
            // High technical skill + high logical need
            verdict = 'IMPLEMENT';
            confidence = (techScore * 0.4) + (logicalScore * 0.6); // Composite for reporting only
            reasoning = {
                rule: 'tech >= 85% AND logical >= 70%',
                technical_score: techScore,
                logical_score: logicalScore,
                explanation: `High technical confidence (${techScore.toFixed(1)}%) + strong logical need (${logicalScore.toFixed(1)}%). Capability and need aligned - implement with confidence.`,
                recommendation: 'Proceed with implementation - skill set adequate, context appropriate'
            };
        } else if (logicalScore >= 50) {
            // High technical skill + medium logical need
            verdict = 'DEFER';
            confidence = (techScore * 0.4) + (logicalScore * 0.6);
            reasoning = {
                rule: 'tech >= 85% AND logical >= 50%',
                technical_score: techScore,
                logical_score: logicalScore,
                explanation: `Technical capability exists (${techScore.toFixed(1)}%) but logical need unclear (${logicalScore.toFixed(1)}%). Can implement, but should we?`,
                recommendation: 'Clarify business value, stakeholder needs, or deployment context before proceeding'
            };
        } else {
            // High technical skill + low logical need
            verdict = 'REJECT';
            confidence = logicalScore;
            reasoning = {
                rule: 'tech >= 85% AND logical < 50%',
                technical_score: techScore,
                logical_score: logicalScore,
                explanation: `Technical capability exists (${techScore.toFixed(1)}%) but logical context invalid (${logicalScore.toFixed(1)}% < 50%). Wrong context - implementation inappropriate.`,
                recommendation: 'Review WHERE/WHY/WHEN validation failures - context mismatch detected'
            };
        }
    } else {
        // NON-EXECUTION TASKS: Base weighted formula
        confidence = (techScore * 0.4) + (logicalScore * 0.6);
        verdict = confidence >= 70 ? 'PROCEED' : confidence >= 50 ? 'DEFER' : 'REJECT';

        reasoning = {
            rule: '(tech × 0.4) + (logical × 0.6)',
            technical_score: techScore,
            logical_score: logicalScore,
            formula_breakdown: `(${techScore.toFixed(1)} × 0.4) + (${logicalScore.toFixed(1)} × 0.6) = ${confidence.toFixed(1)}%`,
            explanation: `Non-execution task (${executionType.workflow_type}) - using weighted formula. Composite confidence: ${confidence.toFixed(1)}%`,
            recommendation: verdict === 'PROCEED'
                ? 'Sufficient context to provide quality response'
                : verdict === 'DEFER'
                    ? 'Gather additional context for better response quality'
                    : 'Insufficient information - ask clarifying questions'
        };
    }

    return {
        verdict, // 'IMPLEMENT' | 'DEFER' | 'REJECT' | 'PROCEED'
        confidence: Math.round(confidence * 10) / 10,
        execution_type: executionType,
        reasoning,
        gating_type: executionType.is_execution ? 'threshold' : 'weighted',
        timestamp: new Date().toISOString()
    };
}

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
    console.log(`
ESMC 3.80.1 - Threshold-Based Execution Gating

Usage:
  node 32b9c128.js gate <tech_score> <logical_score> "<topic>" [--silent]

Arguments:
  <tech_score>      - Technical feasibility score (0-100 from Phase 2A)
  <logical_score>   - Logical appropriateness score (0-100 from Phase 2B)
  <topic>           - User request topic (for execution detection)

Options:
  --silent          - Suppress console output (JSON only)

Examples:
  node 32b9c128.js gate 90 75 "Implement user auth with JWT"
  node 32b9c128.js gate 60 85 "Fix login bug" --silent
  node 32b9c128.js gate 80 90 "Explain how auth works"
`);
    process.exit(0);
}

// Parse command
if (command === 'gate') {
    const techScore = parseFloat(args[1]);
    const logicalScore = parseFloat(args[2]);
    const topic = args[3];
    // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
    const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
    const options = {
        silent: !verbose  // Default silent unless verbose explicitly requested
    };

    // Validate arguments
    if (isNaN(techScore) || isNaN(logicalScore) || !topic) {
        console.error('❌ Missing required arguments: <tech_score> <logical_score> "<topic>"');
        console.error('💡 Usage: node 32b9c128.js gate <tech_score> <logical_score> "<topic>"');
        process.exit(1);
    }

    if (techScore < 0 || techScore > 100 || logicalScore < 0 || logicalScore > 100) {
        console.error('❌ Scores must be between 0-100');
        process.exit(1);
    }

    // Execute threshold gating
    const result = applyThresholdGating(techScore, logicalScore, topic, options);

    // Write result to file
    const outputPath = path.resolve(process.cwd(), '.esmc-threshold-gate-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    if (!options.silent) {
        console.log(`\n🎖️  Threshold Gate Result:`);
        console.log(`   Verdict: ${result.verdict}`);
        console.log(`   Confidence: ${result.confidence}%`);
        console.log(`   Gating Type: ${result.gating_type}`);
        console.log(`\n📋 Reasoning:`);
        console.log(`   Rule: ${result.reasoning.rule}`);
        console.log(`   ${result.reasoning.explanation}`);
        console.log(`\n💡 Recommendation:`);
        console.log(`   ${result.reasoning.recommendation}`);
    }

    // Output JSON for pipeline
    console.log(JSON.stringify(result, null, 2));

} else {
    console.error(`❌ Unknown command: ${command}`);
    console.error('💡 Use --help to see available commands');
    process.exit(1);
}
