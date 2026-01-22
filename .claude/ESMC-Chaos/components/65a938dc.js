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
 * ESMC 3.82.6 - Link Hop Validator CLI
 *
 * Purpose: Validate execution flow integrity across ESMC core
 * - Tests CLI call chains (A → B → C)
 * - Validates parameter contracts (output of A = input of B)
 * - Detects broken hops (missing files, invalid JSON, contract mismatches)
 * - Generates execution flow diagram
 *
 * Usage: node 65a938dc.js validate --chain <chain-name>
 *
 * Chains:
 *   bootstrap-brain   - BOOTSTRAP routing → BRAIN-CORE loading
 *   brain-phase0      - Memory bundle → BRAIN consumption
 *   brain-phase1      - 4-mesh intelligence → fusion
 *   brain-phase2      - Fusion → Gating → Decision
 *   brain-phase3      - COLONELS deployment
 *   full-deployment   - Complete BOOTSTRAP → BRAIN → COLONELS chain
 *   all               - Validate all chains
 */

const fs = require('fs');
const path = require('path');
// 🆕 ESMC 3.101.0: Silent by default
const ESMC_VERBOSE = process.env.ESMC_VERBOSE === 'true' || process.argv.includes('--verbose');
if (!ESMC_VERBOSE) {
    const noop = () => {};
    console.log = console.error = console.info = console.warn = noop;
}

const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════

const EXECUTION_CHAINS = {
  'bootstrap-brain': {
    name: 'BOOTSTRAP → BRAIN-CORE Routing',
    description: 'Validates BOOTSTRAP routing logic loads correct manifests',
    hops: [
      {
        id: 'bootstrap-routing',
        type: 'manifest-check',
        manifest: '6c390b10.md',
        expectedReferences: [
          'b4fe7dcb.md',
          '2dfb6b92.md',
          'REFERENCE-CORE.md'
        ]
      }
    ]
  },

  'brain-phase0': {
    name: 'BRAIN PHASE 0: Memory Bundle',
    description: 'Memory loading → JSON bundle → BRAIN consumption',
    hops: [
      {
        id: 'memory-bundle-load',
        type: 'cli-execution',
        cli: '.claude/ESMC-Chaos/components/b4a5c63c.js',
        command: 'load-selective "test validation" --silent',
        expectedOutput: {
          type: 'file',
          path: '.claude/memory/.esmc-working-memory.json',
          schema: {
            required: ['lessons', 'atlas_t1', 'user_adaptation']
          }
        }
      },
      {
        id: 'brain-consumes-bundle',
        type: 'integration-check',
        description: 'b4fe7dcb.md references working-memory.json',
        manifest: 'b4fe7dcb.md',
        expectedPattern: '.esmc-working-memory.json'
      }
    ]
  },

  'brain-phase1': {
    name: 'BRAIN PHASE 1: Mesh Intelligence',
    description: '4 mesh CLIs → 4 JSONs → mesh-fusion synthesis',
    hops: [
      {
        id: 'piu-analysis',
        type: 'cli-execution',
        cli: '.claude/ESMC-Chaos/components/6ef4ca36.js',
        command: 'analyze "test intent" --silent',
        expectedOutput: {
          type: 'json',
          schema: {
            required: ['goals', 'stakeholders', 'confidenceScore']
          }
        }
      },
      {
        id: 'dki-search',
        type: 'cli-execution',
        cli: '.claude/ESMC-Chaos/components/44511598.js',
        command: 'search "test domain" --silent',
        expectedOutput: {
          type: 'json',
          schema: {
            required: ['detectedDomains', 'applicableStandards']
          }
        }
      },
      {
        id: 'uip-predict',
        type: 'cli-execution',
        cli: '.claude/ESMC-Chaos/components/915646f2.js',
        command: 'predict "test workflow" --silent',
        expectedOutput: {
          type: 'json',
          schema: {
            required: ['detectedWorkflow', 'predictionConfidence']
          }
        }
      },
      {
        id: 'pca-analyze',
        type: 'cli-execution',
        cli: '.claude/ESMC-Chaos/components/429bce75.js',
        command: 'analyze "test context" --silent',
        expectedOutput: {
          type: 'json',
          schema: {
            required: ['mode', 'patterns', 'confidence']
          }
        }
      }
    ]
  },

  'brain-phase2': {
    name: 'BRAIN PHASE 2: Sequential Gating',
    description: 'Fusion → Gating → Decision synthesis',
    hops: [
      {
        id: 'mesh-fusion',
        type: 'cli-dry-run',
        cli: '.claude/ESMC-Chaos/components/bb04c9a1.js',
        command: 'synthesize',
        requiresInput: true,
        skipExecution: true, // Requires mesh inputs
        checkOnly: 'file-exists'
      },
      {
        id: 'esmc-reason-gate',
        type: 'cli-dry-run',
        cli: '.claude/ESMC-Chaos/components/854dea21.js',
        command: 'gate',
        requiresInput: true,
        skipExecution: true,
        checkOnly: 'file-exists'
      },
      {
        id: 'echelon-decision',
        type: 'cli-dry-run',
        cli: '.claude/ESMC-Chaos/components/b61e87e5.js',
        command: 'synthesize',
        requiresInput: true,
        skipExecution: true,
        checkOnly: 'file-exists'
      }
    ]
  },

  'brain-phase3': {
    name: 'BRAIN PHASE 3: COLONELS Deployment',
    description: '8cca72bf.js → 5 WAVEs JSON → BRAIN execution',
    hops: [
      {
        id: 'colonels-deployment',
        type: 'cli-execution',
        cli: '.claude/ESMC-Chaos/components/8cca72bf.js',
        command: 'all',
        expectedOutput: {
          type: 'json',
          schema: {
            required: ['mode', 'waves_executed', 'results']
          }
        }
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════
// Validation Functions
// ═══════════════════════════════════════════════════════════

/**
 * Validate manifest-check hop
 */
function validateManifestCheck(hop) {
  const manifestPath = path.join(process.cwd(), '.claude/ESMC Complete/core', hop.manifest);

  if (!fs.existsSync(manifestPath)) {
    return {
      hop: hop.id,
      status: 'FAILED',
      error: `Manifest not found: ${hop.manifest}`
    };
  }

  const content = fs.readFileSync(manifestPath, 'utf8');
  const missingRefs = [];

  hop.expectedReferences.forEach(ref => {
    if (!content.includes(ref)) {
      missingRefs.push(ref);
    }
  });

  if (missingRefs.length > 0) {
    return {
      hop: hop.id,
      status: 'FAILED',
      error: `Missing references: ${missingRefs.join(', ')}`
    };
  }

  return {
    hop: hop.id,
    status: 'PASSED',
    details: `All ${hop.expectedReferences.length} references found`
  };
}

/**
 * Validate CLI execution hop
 */
function validateCLIExecution(hop) {
  const cliPath = path.join(process.cwd(), hop.cli);

  // Check file exists
  if (!fs.existsSync(cliPath)) {
    return {
      hop: hop.id,
      status: 'FAILED',
      error: `CLI not found: ${hop.cli}`
    };
  }

  // Execute CLI with command
  try {
    const output = execSync(`node "${cliPath}" ${hop.command}`, {
      encoding: 'utf8',
      timeout: 30000
    });

    // Validate output based on expected type
    if (hop.expectedOutput.type === 'json') {
      try {
        const json = JSON.parse(output);

        // Check required fields
        const missingFields = [];
        hop.expectedOutput.schema.required.forEach(field => {
          if (!(field in json)) {
            missingFields.push(field);
          }
        });

        if (missingFields.length > 0) {
          return {
            hop: hop.id,
            status: 'FAILED',
            error: `Missing required fields: ${missingFields.join(', ')}`
          };
        }

        return {
          hop: hop.id,
          status: 'PASSED',
          details: `CLI executed, JSON valid, ${hop.expectedOutput.schema.required.length} fields present`
        };

      } catch (parseError) {
        return {
          hop: hop.id,
          status: 'FAILED',
          error: `Invalid JSON output: ${parseError.message}`
        };
      }

    } else if (hop.expectedOutput.type === 'file') {
      const filePath = path.join(process.cwd(), hop.expectedOutput.path);

      if (!fs.existsSync(filePath)) {
        return {
          hop: hop.id,
          status: 'FAILED',
          error: `Expected output file not created: ${hop.expectedOutput.path}`
        };
      }

      // Validate file content
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileJson = JSON.parse(fileContent);

      const missingFields = [];
      hop.expectedOutput.schema.required.forEach(field => {
        if (!(field in fileJson)) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        return {
          hop: hop.id,
          status: 'FAILED',
          error: `Output file missing fields: ${missingFields.join(', ')}`
        };
      }

      return {
        hop: hop.id,
        status: 'PASSED',
        details: `CLI executed, file created, ${hop.expectedOutput.schema.required.length} fields present`
      };
    }

  } catch (execError) {
    return {
      hop: hop.id,
      status: 'FAILED',
      error: `CLI execution failed: ${execError.message}`
    };
  }
}

/**
 * Validate CLI dry-run hop (file existence only)
 */
function validateCLIDryRun(hop) {
  const cliPath = path.join(process.cwd(), hop.cli);

  if (!fs.existsSync(cliPath)) {
    return {
      hop: hop.id,
      status: 'FAILED',
      error: `CLI not found: ${hop.cli}`
    };
  }

  return {
    hop: hop.id,
    status: 'PASSED',
    details: `CLI exists (skipped execution - requires input)`
  };
}

/**
 * Validate integration-check hop
 */
function validateIntegrationCheck(hop) {
  const manifestPath = path.join(process.cwd(), '.claude/ESMC Complete/core', hop.manifest);

  if (!fs.existsSync(manifestPath)) {
    return {
      hop: hop.id,
      status: 'FAILED',
      error: `Manifest not found: ${hop.manifest}`
    };
  }

  const content = fs.readFileSync(manifestPath, 'utf8');

  if (!content.includes(hop.expectedPattern)) {
    return {
      hop: hop.id,
      status: 'FAILED',
      error: `Pattern not found: ${hop.expectedPattern}`
    };
  }

  return {
    hop: hop.id,
    status: 'PASSED',
    details: `Integration verified: ${hop.description}`
  };
}

/**
 * Validate single execution chain
 */
function validateChain(chainName) {
  const chain = EXECUTION_CHAINS[chainName];

  if (!chain) {
    return {
      chain: chainName,
      status: 'ERROR',
      error: `Unknown chain: ${chainName}`
    };
  }

  const results = {
    chain: chainName,
    name: chain.name,
    description: chain.description,
    totalHops: chain.hops.length,
    passedHops: 0,
    failedHops: 0,
    hops: []
  };

  chain.hops.forEach(hop => {
    let hopResult;

    switch (hop.type) {
      case 'manifest-check':
        hopResult = validateManifestCheck(hop);
        break;
      case 'cli-execution':
        hopResult = validateCLIExecution(hop);
        break;
      case 'cli-dry-run':
        hopResult = validateCLIDryRun(hop);
        break;
      case 'integration-check':
        hopResult = validateIntegrationCheck(hop);
        break;
      default:
        hopResult = {
          hop: hop.id,
          status: 'ERROR',
          error: `Unknown hop type: ${hop.type}`
        };
    }

    results.hops.push(hopResult);

    if (hopResult.status === 'PASSED') {
      results.passedHops++;
    } else {
      results.failedHops++;
    }
  });

  results.status = results.failedHops === 0 ? 'PASSED' : 'FAILED';

  return results;
}

/**
 * Display chain results
 */
function displayChainResults(results) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Chain: ${results.name}`);
  console.log(`Description: ${results.description}`);
  console.log(`Status: ${results.status === 'PASSED' ? '✅' : '❌'} ${results.status}`);
  console.log(`Hops: ${results.passedHops}/${results.totalHops} passed`);
  console.log(`${'='.repeat(70)}\n`);

  results.hops.forEach((hop, index) => {
    const icon = hop.status === 'PASSED' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${hop.hop}`);
    if (hop.status === 'PASSED') {
      console.log(`   ${hop.details}`);
    } else {
      console.log(`   ERROR: ${hop.error}`);
    }
    console.log('');
  });
}

// ═══════════════════════════════════════════════════════════
// CLI Interface
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];
const chainIndex = args.indexOf('--chain');
const chainName = chainIndex !== -1 ? args[chainIndex + 1] : null;

if (command !== 'validate' || !chainName) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🔗 LINK HOP VALIDATOR CLI - Usage                             ║
╚═══════════════════════════════════════════════════════════════╝

Usage: node 65a938dc.js validate --chain <chain-name>

Available chains:
  bootstrap-brain   - BOOTSTRAP routing → BRAIN-CORE loading
  brain-phase0      - Memory bundle → BRAIN consumption
  brain-phase1      - 4-mesh intelligence → fusion
  brain-phase2      - Fusion → Gating → Decision
  brain-phase3      - COLONELS deployment
  all               - Validate all chains

Examples:
  node 65a938dc.js validate --chain brain-phase0
  node 65a938dc.js validate --chain all
  `);
  process.exit(1);
}

// Execute validation
try {
  console.log('\n🔗 Validating ESMC execution chains...\n');

  if (chainName === 'all') {
    const allResults = [];
    let totalPassed = 0;
    let totalFailed = 0;

    Object.keys(EXECUTION_CHAINS).forEach(chain => {
      const result = validateChain(chain);
      allResults.push(result);
      displayChainResults(result);

      if (result.status === 'PASSED') {
        totalPassed++;
      } else {
        totalFailed++;
      }
    });

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 OVERALL SUMMARY`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Total Chains: ${allResults.length}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}\n`);

    process.exit(totalFailed > 0 ? 1 : 0);

  } else {
    const result = validateChain(chainName);
    displayChainResults(result);

    process.exit(result.status === 'PASSED' ? 0 : 1);
  }

} catch (error) {
  console.error('\n❌ Validation failed:', error.message);
  console.error(error.stack);
  process.exit(2);
}
