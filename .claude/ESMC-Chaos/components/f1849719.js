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

/**
 * ESMC 3.110.0 - Context Integrity Tap-Check System + Counter_Z Routing Validation
 *
 * Purpose: Validate manifest context integrity at decay bands + Track routing validation
 * Token Cost: ~120 tokens per tap-check (vs 4,772 for full re-read)
 * ROI: 95% token savings over 40-turn conversations
 *
 * Usage:
 *   node f1849719.js check A 45 25
 *   → Check manifest A (BOOTSTRAP), SUB_TOTAL=45%, current_turn=25
 *
 * Architecture:
 *   - Run tap-check ONLY at decay bands (20-30%, 40-50%, 60-70%, 80-90%)
 *   - 4-question test (parallel/concurrent)
 *   - 1-wrong = REFRESH (early detection)
 *   - 4-correct = PASS (skip re-read)
 *   - Stable zones = free skip (no tap-check)
 *
 * 🆕 ESMC 3.110.0: CASE 0 returns JSON (not exit) - Protocol execution fix
 *   - CASE 0 returns BOOTSTRAP_LOADED action (allows Claude to process protocol)
 *   - Fixes: BOOTSTRAP loaded BUT routing never executed (exit was premature termination)
 *   - Architecture: Load BOOTSTRAP → Return control → Claude follows PHASE 3-4
 *   - Critical: Claude must read BOOTSTRAP instructions AND execute them
 *
 * 🆕 ESMC 3.109.0: Turn 0/1 reset (new conversation detection)
 *   - Turn ≤ 1 = new conversation = blank context = stale counters
 *   - Automatic reset eliminates stale session heuristics
 *   - Turn number is absolute truth (can't lie like timestamps)
 *   - Simplifies architecture: 1 check vs 3-layer defense
 *
 * 🆕 ESMC 3.106.0: Counter_Z routing validation tracking
 *   - Counter_Z = 0: context-integrity NOT executed (routing bypass)
 *   - Counter_Z = 1: CASE 0 auto-load completed (routing validated)
 *   - Replaces CIFS entry gate architecture (-450 tokens)
 *   - Virtual counter (zero token cost, execution evidence only)
 *
 * 🆕 ESMC 3.99.2: Added file_path to ALL responses for manual refresh fallback
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════
// 🛡️ FORTRESS MODE: LICENSE PRE-FLIGHT CHECKPOINT (ESMC 3.100.0)
// ═══════════════════════════════════════════════════════════════════════
// CRITICAL: This runs BEFORE any counter checks or manifest operations
// Purpose: Block ALL ESMC operations if user is not authenticated
// Injected by: sync-production-to-sdk-SUPERCHAOSv2.js (SDK-only)

function validateLicensePreFlight() {
  const licenseFilePath = path.join(process.cwd(), '.claude', '.esmc-license.json');

  // LAYER 1: Check file exists
  if (!fs.existsSync(licenseFilePath)) {
    return {
      valid: false,
      action: 'LICENSE_INVALID',
      reason: 'No license file found',
      instructions: [
        '❌ You must be logged in to use ESMC.',
        '',
        'Run this command in your terminal:',
        '  npm run login',
        '',
        'If you don\'t have an account, visit:',
        '  https://esmc-sdk.com'
      ]
    };
  }

  // LAYER 2: Verify file is valid JSON with required fields
  let licenseData;
  try {
    const licenseContent = fs.readFileSync(licenseFilePath, 'utf-8');
    licenseData = JSON.parse(licenseContent);
  } catch (error) {
    return {
      valid: false,
      action: 'LICENSE_ERROR',
      reason: 'License file corrupted',
      instructions: [
        '❌ Your license file is corrupted.',
        '',
        'Please re-authenticate:',
        '  npm run login'
      ]
    };
  }

  // LAYER 3: Check required fields
  // Note: subscriptionEndDate can be null for FREE tier (valid state)
  const requiredFields = ['email', 'tier', 'blessing']; // Core fields that must exist
  const missingFields = requiredFields.filter(field => !licenseData[field]);

  // Check subscriptionEndDate exists as a field (even if null)
  if (!('subscriptionEndDate' in licenseData)) {
    missingFields.push('subscriptionEndDate');
  }

  if (missingFields.length > 0) {
    return {
      valid: false,
      action: 'LICENSE_ERROR',
      reason: `License missing required fields: ${missingFields.join(', ')}`,
      instructions: [
        '❌ Your license file is incomplete.',
        '',
        'Please re-authenticate:',
        '  npm run login'
      ]
    };
  }

  // LAYER 4: Check subscription expiry (skip for FREE tier with null)
  const now = new Date(); // 🔧 FIXED: Declare now outside if block for Layer 6 usage

  if (licenseData.subscriptionEndDate !== null) {
    const expiryDate = new Date(licenseData.subscriptionEndDate);

    if (now > expiryDate) {
      return {
        valid: false,
        action: 'LICENSE_INVALID',
        reason: 'Subscription expired',
      instructions: [
        `❌ Your subscription expired on ${expiryDate.toLocaleDateString()}.`,
        '',
        'Please renew your subscription at:',
        '  https://esmc-sdk.com',
        '',
        'Or re-login if you recently renewed:',
        '  npm run login'
      ]
      };
    }
  }

  // LAYER 5: Verify Guardian Blessing Token (basic validation)
  if (!licenseData.blessing || !licenseData.blessing.signature) {
    return {
      valid: false,
      action: 'LICENSE_ERROR',
      reason: 'Guardian Blessing Token invalid',
      instructions: [
        '❌ Security validation failed.',
        '',
        'Please re-authenticate:',
        '  npm run login'
      ]
    };
  }

  // LAYER 6: Grace period check (7 days offline allowed)
  const lastValidated = new Date(licenseData.lastValidated || licenseData.issuedAt);
  const daysSinceValidation = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceValidation > 7) {
    return {
      valid: false,
      action: 'LICENSE_INVALID',
      reason: 'License needs revalidation (offline for more than 7 days)',
      instructions: [
        `⚠️  Your license needs revalidation (offline for ${Math.floor(daysSinceValidation)} days).`,
        '',
        'Please connect to the internet and run:',
        '  npm run login',
        '',
        'This will refresh your license without losing data.'
      ]
    };
  }

  // ✅ ALL LAYERS PASSED
  return {
    valid: true,
    tier: licenseData.tier,
    email: licenseData.email,
    graceDaysRemaining: Math.max(0, 7 - Math.floor(daysSinceValidation))
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 🛡️ FORTRESS MODE: RUNTIME INTEGRITY VERIFICATION
// ═══════════════════════════════════════════════════════════════════════
// Verify file integrity using .manifest.json and .package-signature
// Detects tampering of ESMC manifests and CLIs

function verifyRuntimeIntegrity() {
  const manifestPath = path.join(process.cwd(), '.claude', 'ESMC-Chaos', 'components', '.manifest.json');
  const signaturePath = path.join(process.cwd(), '.package-signature');

  // Check if integrity files exist
  if (!fs.existsSync(manifestPath) || !fs.existsSync(signaturePath)) {
    // Graceful degradation: If integrity files missing, allow execution with warning
    if (process.env.ESMC_VERBOSE === 'true') {
      console.warn('⚠️  Integrity verification files not found (degraded mode)');
    }
    return { valid: true, degraded: true };
  }

  try {
    // Load manifest and signature
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const signature = JSON.parse(fs.readFileSync(signaturePath, 'utf-8'));

    // 🛡️ FORTRESS: Verify ALL critical files (entry point + routing + execution + manifests)
    const criticalFiles = [
      // Layer 1: Entry Point & Routing
      'cda0ca75.md',                    // Entry point - controls everything
      'f1849719.js',     // First execution - license + integrity
      '8e80df94.md',                 // Routing logic - manifest loading

      // Layer 2: Authentication & Authorization
      '670a08df.js',             // Tier validation
      '3811a2ec.js',      // License validation

      // Layer 3: Core Manifests (prevent malicious code injection)
      '0cd9e0a2.md',                // Main execution protocol
      'a1fa5b4e.md',             // ATHENA dialogue (MAX/VIP)
      '48c49efe.md'                  // AEGIS seed/echo operations
    ];

    const tamperedFiles = [];

    for (const file of criticalFiles) {
      // Special case: cda0ca75.md is in SDK root (not obfuscated)
      let manifestEntry;
      if (file === 'cda0ca75.md') {
        manifestEntry = 'cda0ca75.md';
      } else {
        // Find file in manifest (may have obfuscated path in components/)
        manifestEntry = Object.keys(manifest).find(key => key.includes(file));
      }

      if (manifestEntry && manifest[manifestEntry]) {
        const expectedHash = manifest[manifestEntry];
        const filePath = path.join(process.cwd(), manifestEntry);

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath);
          const actualHash = crypto.createHash('sha256').update(content).digest('hex');

          if (actualHash !== expectedHash) {
            tamperedFiles.push(file);
          }
        }
      }
    }

    if (tamperedFiles.length > 0) {
      return {
        valid: false,
        tamperedFiles: tamperedFiles,
        instructions: [
          '🚨 SECURITY ALERT: File tampering detected!',
          '',
          `Modified files: ${tamperedFiles.join(', ')}`,
          '',
          'Your ESMC installation has been tampered with.',
          'This may be due to:',
          '  - Unauthorized modifications',
          '  - Corrupted download',
          '  - Security breach',
          '',
          'Please re-download ESMC or contact support:',
          '  security@esmc-sdk.com'
        ]
      };
    }

    return { valid: true, verified: true };

  } catch (error) {
    // Graceful degradation on verification errors
    if (process.env.ESMC_VERBOSE === 'true') {
      console.warn(`⚠️  Integrity verification error: ${error.message}`);
    }
    return { valid: true, degraded: true, error: error.message };
  }
}


const MANIFESTS = {
  X: {
    name: 'Memory-Bundle',
    path: '.claude/ESMC-Chaos/components/bb2e3af1.js',
    type: 'CLI',
    lines: null,
    tokens: 2400
  },
  A: {
    name: 'BOOTSTRAP',
    path: '.claude/ESMC-Chaos/components/8e80df94.md',
    type: 'MANIFEST',
    lines: 464,
    tokens: 4772
  },
  B: {
    name: 'BRAIN-CORE',
    path: '.claude/ESMC-Chaos/components/0cd9e0a2.md',
    type: 'MANIFEST',
    lines: 694,
    tokens: 1735
  },
  C: {
    name: 'COLONELS-TALK',
    path: '.claude/ESMC-Chaos/components/a1fa5b4e.md',
    type: 'MANIFEST',
    lines: 363,
    tokens: 900
  },
  D: {
    name: 'REFERENCE',
    path: '.claude/ESMC-Chaos/components/48c49efe.md',
    type: 'MANIFEST',
    lines: 406,
    tokens: 7000
  },
  Z: {
    name: 'Routing-Validation',
    path: null,  // Virtual counter (not a manifest file)
    type: 'VALIDATION',
    lines: null,
    tokens: 0  // Zero token cost (execution evidence, not content)
  }
};

const POSITION_WEIGHTS = {
  front: 1.0,    // Lines 1-20%
  midLow: 1.5,   // Lines 20-40%
  mid: 2.0,      // Lines 40-60% (highest decay risk)
  midHigh: 1.5,  // Lines 60-80%
  high: 1.0      // Lines 80-100%
};

const DECAY_BANDS = [
  { min: 20, max: 30, label: '20-30%' },
  { min: 40, max: 50, label: '40-50%' },
  { min: 60, max: 70, label: '60-70%' },
  { min: 80, max: 90, label: '80-90%' }
];

const COUNTER_FILE = path.join(process.cwd(), '.claude', '.esmc-manifest-counters.json');

// ═══════════════════════════════════════════════════════════
// Core Functions
// ═══════════════════════════════════════════════════════════

/**
 * Load counter state from disk
 * 🆕 ESMC 3.100.0: Added manifest content cache for true 1-time read optimization
 */
function loadCounters() {
  if (!fs.existsSync(COUNTER_FILE)) {
    return {
      session_start: new Date().toISOString(),
      counters: { X: 0, A: 0, B: 0, C: 0, D: 0, Z: 0 },
      scores: {
        X_COR: 0, X_WRO: 0,
        A_COR: 0, A_WRO: 0,
        B_COR: 0, B_WRO: 0,
        D_COR: 0, D_WRO: 0
      },
      cache: {},  // Manifest content cache (populated on first read)
      last_updated: new Date().toISOString()
    };
  }

  const data = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));

  // Ensure cache object exists (backward compatibility)
  if (!data.cache) {
    data.cache = {};
  }

  // 🆕 ESMC 3.106.0: Ensure Counter_Z exists (backward compatibility)
  if (data.counters.Z === undefined) {
    data.counters.Z = 0;
  }

  return data;
}

/**
 * Save counter state to disk
 */
function saveCounters(data) {
  data.last_updated = new Date().toISOString();
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2));
}

/**
 * Build manifest cache from file content
 * 🆕 ESMC 3.100.0: Cache builder for 1-time read optimization
 * @param {string} manifest - Manifest key (A, B, D)
 * @param {string} content - Full file content
 * @returns {object} Cache object with lines and safe line indices
 */
function buildManifestCache(manifest, content) {
  const lines = content.split('\n');
  const totalLines = lines.length;

  // Pre-filter safe lines (no filepath/special characters) per band
  const safeLinesPerBand = {
    front: [],
    midLow: [],
    mid: [],
    midHigh: [],
    high: []
  };

  const bands = {
    front: [1, Math.floor(totalLines * 0.2)],
    midLow: [Math.floor(totalLines * 0.2) + 1, Math.floor(totalLines * 0.4)],
    mid: [Math.floor(totalLines * 0.4) + 1, Math.floor(totalLines * 0.6)],
    midHigh: [Math.floor(totalLines * 0.6) + 1, Math.floor(totalLines * 0.8)],
    high: [Math.floor(totalLines * 0.8) + 1, totalLines]
  };

  // Scan each band and collect safe line numbers
  Object.keys(bands).forEach(bandName => {
    const [start, end] = bands[bandName];

    for (let lineNum = start; lineNum <= end; lineNum++) {
      const lineContent = lines[lineNum - 1] || '';

      // Filter out filepath-heavy content (Windows CMD compatibility)
      const hasFilepath = lineContent.includes('<!--') ||
                          lineContent.includes('-->') ||
                          lineContent.includes('\\') ||
                          lineContent.includes('://') ||
                          lineContent.includes('C:') ||
                          lineContent.includes('.md') ||
                          lineContent.includes('.js');

      if (!hasFilepath && lineContent.trim().length > 0) {
        safeLinesPerBand[bandName].push(lineNum);
      }
    }
  });

  return {
    lineCount: totalLines,
    lines: lines,  // Full content cached
    safeLinesPerBand: safeLinesPerBand,
    cached_at: new Date().toISOString()
  };
}

/**
 * Check if SUB_TOTAL is in decay band
 */
function isInDecayBand(subTotal) {
  return DECAY_BANDS.some(band => subTotal >= band.min && subTotal <= band.max);
}

/**
 * Get current decay band label
 */
function getDecayBandLabel(subTotal) {
  const band = DECAY_BANDS.find(b => subTotal >= b.min && subTotal <= b.max);
  return band ? band.label : 'STABLE';
}

/**
 * Select random line from band
 * @param {string|number} manifestOrLines - Manifest key (for legacy) or actual line count
 * @param {string} band - Band name (front, midLow, mid, midHigh, high)
 * @returns {number} Random line number within the band
 */
function selectRandomLine(manifestOrLines, band) {
  // 🆕 ESMC 3.99.2: Support both hardcoded (legacy) and actual line count (dynamic)
  const totalLines = typeof manifestOrLines === 'number'
    ? manifestOrLines
    : MANIFESTS[manifestOrLines].lines;

  const bands = {
    front: [1, Math.floor(totalLines * 0.2)],
    midLow: [Math.floor(totalLines * 0.2) + 1, Math.floor(totalLines * 0.4)],
    mid: [Math.floor(totalLines * 0.4) + 1, Math.floor(totalLines * 0.6)],
    midHigh: [Math.floor(totalLines * 0.6) + 1, Math.floor(totalLines * 0.8)],
    high: [Math.floor(totalLines * 0.8) + 1, totalLines]
  };

  const [start, end] = bands[band];
  return Math.floor(Math.random() * (end - start + 1)) + start;
}

/**
 * Generate tap-check test protocol (4 questions, randomized bands)
 * ESMC 3.99.1: Windows CMD JSON escaping fix - regenerate filepath-type questions
 * ESMC 3.99.2: Use ACTUAL file line count instead of hardcoded MANIFESTS.lines
 * 🆕 ESMC 3.100.0: Use cached manifest content (true 1-time read optimization)
 */
function generateTapCheck(manifest) {
  // Use 4 questions (not 5) for speed - General's optimization
  const testBands = ['front', 'midLow', 'mid', 'high'];
  const questions = [];

  // 🆕 ESMC 3.100.0: Load cache (if available)
  const data = loadCounters();
  const cache = data.cache[manifest];

  // If cache exists, use it (zero file I/O!)
  if (cache && cache.safeLinesPerBand) {
    testBands.forEach(band => {
      const safeLinesInBand = cache.safeLinesPerBand[band];

      // Select random line from pre-filtered safe lines
      if (safeLinesInBand && safeLinesInBand.length > 0) {
        const randomIndex = Math.floor(Math.random() * safeLinesInBand.length);
        const line = safeLinesInBand[randomIndex];

        questions.push({
          band,
          line,
          weight: POSITION_WEIGHTS[band],
          question: `Quote ${MANIFESTS[manifest].name} line ${line} from memory (no re-reading)`
        });
      }
    });

    return {
      manifest,
      manifest_name: MANIFESTS[manifest].name,
      questions,
      instructions: 'Context integrity tap-check - Answer all 4 questions concurrently',
      threshold: '1-wrong = REFRESH, 4-correct = PASS',
      token_cost: '~120 tokens (vs ' + MANIFESTS[manifest].tokens + ' for full re-read)',
      cache_hit: true  // Indicates cache was used
    };
  }

  // FALLBACK: Cache miss - read from disk (legacy behavior)
  const manifestPath = path.join(process.cwd(), MANIFESTS[manifest].path);
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const lines = manifestContent.split('\n');

  // 🆕 ESMC 3.99.2: Use ACTUAL line count from file, not hardcoded value
  const actualLineCount = lines.length;

  testBands.forEach(band => {
    let line = selectRandomLine(actualLineCount, band);
    let attempts = 0;
    const maxAttempts = 10;

    // ESMC 3.99.1: Regenerate if line contains filepath-type content
    while (attempts < maxAttempts) {
      const lineContent = lines[line - 1] || '';

      // Check if line contains Windows CMD problematic characters
      const hasFilepath = lineContent.includes('<!--') ||
                          lineContent.includes('-->') ||
                          lineContent.includes('\\') ||
                          lineContent.includes('://') ||
                          lineContent.includes('C:') ||
                          lineContent.includes('.md') ||
                          lineContent.includes('.js');

      if (!hasFilepath) {
        // Safe line found - use it
        break;
      }

      // Regenerate line (avoid filepath-heavy content)
      line = selectRandomLine(actualLineCount, band);
      attempts++;
    }

    questions.push({
      band,
      line,
      weight: POSITION_WEIGHTS[band],
      question: `Quote ${MANIFESTS[manifest].name} line ${line} from memory (no re-reading)`
    });
  });

  return {
    manifest,
    manifest_name: MANIFESTS[manifest].name,
    questions,
    instructions: 'Context integrity tap-check - Answer all 4 questions concurrently',
    threshold: '1-wrong = REFRESH, 4-correct = PASS',
    token_cost: '~120 tokens (vs ' + MANIFESTS[manifest].tokens + ' for full re-read)',
    cache_hit: false  // Indicates fallback to file read
  };
}

/**
 * Evaluate tap-check results (with fuzzy matching)
 */
function evaluateTapCheck(manifest, results) {
  let correctCount = 0;
  let wrongCount = 0;
  let degradationScore = 0;

  const evaluation = [];

  results.forEach((result, idx) => {
    const { line, expectedContent, actualQuote, weight } = result;

    // Fuzzy matching (85% similarity threshold)
    const similarity = levenshteinSimilarity(expectedContent, actualQuote);

    if (similarity >= 0.85) {
      correctCount++;
      evaluation.push({
        question: idx + 1,
        line,
        result: 'CORRECT',
        similarity: Math.round(similarity * 100) + '%',
        weight
      });
    } else {
      wrongCount++;
      degradationScore += weight;
      evaluation.push({
        question: idx + 1,
        line,
        result: 'WRONG',
        similarity: Math.round(similarity * 100) + '%',
        weight,
        degradation_added: weight
      });
    }

    // Early exit: 1-wrong threshold (General's optimization)
    if (wrongCount >= 1) {
      return {
        action: 'REFRESH',
        reason: 'Context integrity compromised (1-wrong threshold)',
        correctCount,
        wrongCount,
        degradationScore,
        evaluation
      };
    }

    // Early exit: 4-correct threshold
    if (correctCount >= 4) {
      return {
        action: 'SKIP',
        reason: 'Context integrity verified (4-correct threshold)',
        correctCount,
        wrongCount,
        degradationScore: 0,
        evaluation
      };
    }
  });

  // Fallback (shouldn't reach here with 4 questions)
  return {
    action: wrongCount >= 1 ? 'REFRESH' : 'SKIP',
    reason: wrongCount >= 1 ? 'Integrity test failed' : 'Integrity test passed',
    correctCount,
    wrongCount,
    degradationScore,
    evaluation
  };
}

/**
 * Levenshtein distance similarity (0.0 - 1.0)
 */
function levenshteinSimilarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * Check if session is stale (> 1 hour old)
 */
function isStaleSession(sessionStart) {
  const ageMs = Date.now() - new Date(sessionStart).getTime();
  const oneHour = 60 * 60 * 1000;
  return ageMs > oneHour;
}

/**
 * Main decision logic: Should we refresh this manifest?
 */
function shouldRefreshManifest(manifest, currentTurn, subTotal) {
  // 🆕 ESMC 3.109.0: Turn 0/1 reset (new conversation detection)
  // New conversation = blank context window = stale counters by definition
  // This eliminates stale session heuristics + tap-check complexity
  if (currentTurn <= 1 && fs.existsSync(COUNTER_FILE)) {
    console.log('🔄 Turn 0/1 detected - Resetting counters (new conversation)');
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({
      session_start: new Date().toISOString(),
      counters: { X: 0, A: 0, B: 0, C: 0, D: 0, Z: 0 },
      scores: { X_COR: 0, X_WRO: 0, A_COR: 0, A_WRO: 0, B_COR: 0, B_WRO: 0, D_COR: 0, D_WRO: 0 },
      cache: {},
      last_updated: new Date().toISOString()
    }, null, 2));
  }

  const data = loadCounters();
  const counter = data.counters[manifest];
  const manifestInfo = MANIFESTS[manifest];

  // 🆕 ESMC 3.107.0: Set Counter_Z = 1 on EVERY context-integrity check
  // This validates routing for EACH manifest load attempt
  // Manifests (BOOTSTRAP, BRAIN-CORE, REFERENCE) will check Counter_Z and reset to 0 after validation
  // If manifest loads without Counter_Z = 1, protocol bypass detected
  if (data.counters.Z !== 1) {
    data.counters.Z = 1;
    saveCounters(data);
  }

  // ═══════════════════════════════════════════════════════════
  // CASE 0: BOOTSTRAP AUTO-LOAD (ESMC 3.87.0)
  // ═══════════════════════════════════════════════════════════
  //
  // CRITICAL: 8e80df94.md must be loaded before ANY workflow
  // If counter A = 0, auto-load 8e80df94.md immediately
  //
  // Why: BOOTSTRAP contains routing logic for all manifests
  //      Without BOOTSTRAP, all subsequent routing is invalid
  //      This makes cda0ca75.md enforcement automatic and foolproof
  //
  // Architecture: "Don't enforce with errors. Enforce with execution."
  //               - The Architect (ESMC 3.87.0 design principle)
  //
  // 🆕 ESMC 3.92.0 NOTE: License validation injected by sync script for SDK distribution only
  //     Production environment (this file) runs WITHOUT license checks
  //
  if (data.counters.A === 0) {
    console.log('🗺️ BOOTSTRAP auto-load detected (counter A = 0)');

    // Read 8e80df94.md and output with line numbers
    const bootstrapPath = path.join(process.cwd(), MANIFESTS.A.path);

    try {
      const bootstrapContent = fs.readFileSync(bootstrapPath, 'utf8');
      const lines = bootstrapContent.split('\n');

      // Output in cat -n format for Claude to process
      lines.forEach((line, idx) => {
        console.log(`${idx + 1}→${line}`);
      });

      // 🆕 ESMC 3.100.0: Build and cache manifest content (1-time read optimization)
      data.cache.A = buildManifestCache('A', bootstrapContent);

      // Update counter A
      data.counters.A = MANIFESTS.A.tokens;

      // 🆕 ESMC 3.106.0: Set Counter_Z (routing validation complete)
      data.counters.Z = 1;
      saveCounters(data);

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`⚡ BOOTSTRAP PROTOCOL LOADED - EXECUTE IMMEDIATELY ⚡`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      console.log(`✅ Counter_Z = 1 (routing validated - context-integrity executed)`);
      console.log(`📋 BOOTSTRAP content output above (${MANIFESTS.A.tokens} tokens, ${data.cache.A.lineCount} lines)\n`);
      console.log(`🔴 CRITICAL: Execute Counter_Z gate check (BOOTSTRAP lines 7-48) BEFORE proceeding`);
      console.log(`🔴 DO NOT skip to user request - Follow BOOTSTRAP PHASE 0-4 protocol in sequence`);
      console.log(`🔴 BOOTSTRAP is NOT reference material - It is EXECUTABLE ROUTING PROTOCOL\n`);

      // 🆕 ESMC 3.110.0: CASE 0 returns JSON (not exit) - Allows Claude to process BOOTSTRAP protocol
      // Architecture: Load BOOTSTRAP → Return control to Claude → Claude follows PHASE 3-4
      // This fixes: BOOTSTRAP loaded BUT routing never executed (exit was premature termination)
      return {
        action: 'BOOTSTRAP_LOADED',
        reason: 'BOOTSTRAP auto-loaded successfully - Proceed to PHASE 3 (keyword detection)',
        manifest: 'BOOTSTRAP',
        counter: MANIFESTS.A.tokens,
        lines_loaded: data.cache.A.lineCount,
        safe_lines_indexed: Object.keys(data.cache.A.safeLinesPerBand).reduce((sum, band) => sum + data.cache.A.safeLinesPerBand[band].length, 0),
        routing_validated: true,
        counter_Z: 1,
        next_phase: 'PHASE 3: Keyword Detection (Check user prompt for: seed, ESMC, or lightweight)'
      };

    } catch (error) {
      console.error(`❌ ERROR: Failed to auto-load 8e80df94.md: ${error.message}`);
      console.error(`📁 Expected path: ${bootstrapPath}`);

      return {
        action: 'ERROR',
        reason: 'BOOTSTRAP auto-load failed - file not found',
        manifest: 'BOOTSTRAP',
        error: error.message,
        expected_path: bootstrapPath
      };
    }
  }

  // CASE 1: CLI counter (X, C) - Skip integrity check
  if (manifestInfo.type === 'CLI') {
    return {
      action: 'SKIP',
      reason: 'CLI counter - no context integrity check needed',
      manifest: manifestInfo.name,
      counter,
      subTotal,
      band: getDecayBandLabel(subTotal)
    };
  }

  // CASE 2: Never read yet (counter = 0) OR stale session
  if (counter === 0 || isStaleSession(data.session_start)) {
    // Reset all counters if stale session detected
    if (isStaleSession(data.session_start)) {
      data.counters = { X: 0, A: 0, B: 0, C: 0, D: 0, Z: 0 };
      data.cache = {};  // 🆕 ESMC 3.100.0: Clear cache on stale session
      data.session_start = new Date().toISOString();
      saveCounters(data);
    }

    return {
      action: 'READ',
      reason: counter === 0
        ? 'Manifest not yet loaded (counter = 0)'
        : 'New session detected (stale counters reset)',
      manifest: manifestInfo.name,
      counter: 0,
      subTotal,
      band: getDecayBandLabel(subTotal),
      file_path: manifestInfo.path,
      expected_tokens: manifestInfo.tokens,
      // 🆕 ESMC 3.100.0: Instruct caller to build cache after read
      should_cache: true
    };
  }

  // CASE 3: Stable zone (not in decay band) - validate via tap-check
  if (!isInDecayBand(subTotal) && counter > 0) {
    const tapCheck = generateTapCheck(manifest);

    return {
      action: 'TAP_CHECK_REQUIRED',
      reason: 'Stable zone + counter > 0 - validate context integrity before skip',
      manifest: manifestInfo.name,
      counter,
      subTotal,
      band: 'STABLE',
      tap_check: tapCheck,
      // 🆕 ESMC 3.99.2: Add file_path for manual refresh fallback
      file_path: manifestInfo.path
    };
  }

  // CASE 4: Decay band + counter > 0 → Run tap-check
  if (isInDecayBand(subTotal) && counter > 0) {
    const tapCheck = generateTapCheck(manifest);

    return {
      action: 'TAP_CHECK_REQUIRED',
      reason: 'Decay band detected - integrity validation needed',
      manifest: manifestInfo.name,
      counter,
      subTotal,
      band: getDecayBandLabel(subTotal),
      tap_check: tapCheck,
      // 🆕 ESMC 3.99.2: Add file_path for manual refresh fallback
      file_path: manifestInfo.path
    };
  }

  // FALLBACK: Skip
  return {
    action: 'SKIP',
    reason: 'Default case - skip',
    manifest: manifestInfo.name,
    counter,
    subTotal,
    band: getDecayBandLabel(subTotal),
    // 🆕 ESMC 3.99.2: Add file_path for consistency
    file_path: manifestInfo.path
  };
}

/**
 * Process tap-check evaluation results and update counters
 */
function processEvaluation(manifest, evaluationResults) {
  const data = loadCounters();
  const manifestInfo = MANIFESTS[manifest];

  const scoreSuffix = `${manifest}_COR`;
  const wrongSuffix = `${manifest}_WRO`;

  if (evaluationResults.action === 'SKIP') {
    // Passed: Reset scores only, keep counter
    data.scores[scoreSuffix] = 0;
    data.scores[wrongSuffix] = 0;

    saveCounters(data);

    return {
      action: 'SKIP',
      reason: 'Tap-check passed - manifest integrity verified',
      manifest: manifestInfo.name,
      counter: data.counters[manifest],
      evaluation: evaluationResults,
      // 🆕 ESMC 3.99.2: Add file_path for consistency
      file_path: manifestInfo.path
    };
  }

  if (evaluationResults.action === 'REFRESH') {
    // Failed: Reset everything (scores + counter)
    data.scores[scoreSuffix] = 0;
    data.scores[wrongSuffix] = 0;
    data.counters[manifest] = 0;

    saveCounters(data);

    return {
      action: 'REFRESH',
      reason: 'Tap-check failed - context integrity compromised',
      manifest: manifestInfo.name,
      file_path: manifestInfo.path,
      expected_tokens: manifestInfo.tokens,
      must_read: true,
      evaluation: evaluationResults
    };
  }
}

/**
 * Update counter after successful manifest read
 */
function updateCounterAfterRead(manifest, silent = false) {
  const data = loadCounters();
  const manifestInfo = MANIFESTS[manifest];

  data.counters[manifest] = manifestInfo.tokens;
  saveCounters(data);

  return {
    action: 'COUNTER_UPDATED',
    manifest: manifestInfo.name,
    counter: manifestInfo.tokens,
    message: `Counter ${manifest} updated to ${manifestInfo.tokens} tokens`,
    silent
  };
}

// ═══════════════════════════════════════════════════════════
// CLI Interface
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];

if (command === 'check') {

  // 🛡️ FORTRESS MODE LAYER 1: Execute license pre-flight check FIRST
  const licenseCheck = validateLicensePreFlight();

  if (!licenseCheck.valid) {
    // License validation failed - return error and HALT
    console.log(JSON.stringify({
      action: licenseCheck.action,
      reason: licenseCheck.reason,
      instructions: licenseCheck.instructions
    }, null, 2));
    process.exit(1);
  }

  // ✅ License valid - log tier and continue
  if (process.env.ESMC_VERBOSE === 'true') {
    console.log(`✅ License validated (Tier: ${licenseCheck.tier}, Grace: ${licenseCheck.graceDaysRemaining} days)`);
  }

  // 🛡️ FORTRESS MODE LAYER 2: Verify runtime integrity
  const integrityCheck = verifyRuntimeIntegrity();

  if (!integrityCheck.valid) {
    // File tampering detected - return error and HALT
    console.log(JSON.stringify({
      action: 'INTEGRITY_VIOLATION',
      reason: 'File tampering detected',
      tamperedFiles: integrityCheck.tamperedFiles,
      instructions: integrityCheck.instructions
    }, null, 2));
    process.exit(1);
  }

  // ✅ Integrity verified (or degraded mode)
  if (process.env.ESMC_VERBOSE === 'true' && integrityCheck.verified) {
    console.log('✅ Runtime integrity verified (no tampering detected)');
  }


  // Usage: node f1849719.js check A 45 25
  const manifest = args[1];       // 'A', 'B', 'D', 'X'
  const subTotal = parseFloat(args[2]);  // e.g., 45 (45%)
  const currentTurn = parseInt(args[3]); // e.g., 25

  const decision = shouldRefreshManifest(manifest, currentTurn, subTotal);

  // 🆕 ESMC 3.96.0: Set global ESMC_SILENT flag for all downstream CLIs
  // This enables unified silent mode across all operations
  if (decision.action === 'READ' || decision.action === 'SKIP') {
    process.env.ESMC_SILENT = 'true';
  }

  // 🆕 ESMC 3.110.0: Output JSON for BOOTSTRAP_LOADED action (CASE 0 returns instead of exits)
  console.log(JSON.stringify(decision, null, 2));

} else if (command === 'evaluate') {
  // Usage: node f1849719.js evaluate A --answers '["ans1", "ans2", "ans3", "ans4"]' --lines '[69,214,354,589]'
  const manifest = args[1];
  const manifestInfo = MANIFESTS[manifest];

  if (!manifestInfo) {
    console.log(JSON.stringify({
      error: `Invalid manifest: ${manifest}`,
      valid_manifests: Object.keys(MANIFESTS)
    }, null, 2));
    process.exit(1);
  }

  // Check if --answers flag provided
  const answersIndex = args.indexOf('--answers');
  if (answersIndex === -1 || !args[answersIndex + 1]) {
    console.log(JSON.stringify({
      error: 'Missing --answers flag',
      usage: 'node f1849719.js evaluate <manifest> --answers \'["answer1", "answer2", "answer3", "answer4"]\' --lines \'[line1,line2,line3,line4]\''
    }, null, 2));
    process.exit(1);
  }

  // Check if --lines flag provided
  const linesIndex = args.indexOf('--lines');
  if (linesIndex === -1 || !args[linesIndex + 1]) {
    console.log(JSON.stringify({
      error: 'Missing --lines flag',
      usage: 'node f1849719.js evaluate <manifest> --answers \'["answer1", "answer2", "answer3", "answer4"]\' --lines \'[line1,line2,line3,line4]\''
    }, null, 2));
    process.exit(1);
  }

  // Parse answers and line numbers from command line
  const userAnswers = JSON.parse(args[answersIndex + 1]);
  const questionLines = JSON.parse(args[linesIndex + 1]);

  if (userAnswers.length !== questionLines.length) {
    console.log(JSON.stringify({
      error: 'Mismatch: answers and lines arrays must have same length',
      answers_count: userAnswers.length,
      lines_count: questionLines.length
    }, null, 2));
    process.exit(1);
  }

  // Load the manifest file to get actual line content
  const manifestPath = path.join(process.cwd(), manifestInfo.path);

  if (!fs.existsSync(manifestPath)) {
    console.log(JSON.stringify({
      error: 'Manifest file not found',
      path: manifestPath,
      manifest: manifestInfo.name
    }, null, 2));
    process.exit(1);
  }

  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const lines = manifestContent.split('\n');

  // Build results array by fetching actual line content
  const results = questionLines.map((lineNum, idx) => {
    const actualLine = lines[lineNum - 1] || ''; // -1 because array is 0-indexed
    const userAnswer = userAnswers[idx] || '';

    return {
      line: lineNum,
      expectedContent: actualLine,
      actualQuote: userAnswer,
      weight: POSITION_WEIGHTS.mid // Default weight for evaluation
    };
  });

  // Evaluate the answers
  const evaluationResults = evaluateTapCheck(manifest, results);

  // Process the evaluation (update counters, etc.)
  const outcome = processEvaluation(manifest, evaluationResults);
  console.log(JSON.stringify(outcome, null, 2));

} else if (command === 'update') {
  // Usage: node f1849719.js update A [--silent]
  const manifest = args[1];
  // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
  const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
  const silent = !verbose;
  const result = updateCounterAfterRead(manifest, silent);

  if (silent) {
    // Silent mode: only output success indicator (exit code 0)
    process.exit(0);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }

} else if (command === 'status') {
  // Usage: node f1849719.js status
  const data = loadCounters();
  console.log(JSON.stringify(data, null, 2));

} else if (command === 'gate-reset') {
  // 🆕 ESMC 3.107.0: Gate reset command - Reset Counter_Z after manifest validates routing
  // Usage: node f1849719.js gate-reset [--silent]
  // Called by manifests (BOOTSTRAP, BRAIN-CORE, REFERENCE) after confirming Counter_Z = 1
  const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
  const silent = !verbose && args.includes('--silent');
  const data = loadCounters();

  if (data.counters.Z === 1) {
    data.counters.Z = 0;
    saveCounters(data);

    if (!silent) {
      console.log(JSON.stringify({
        action: 'GATE_RESET',
        message: 'Counter_Z reset to 0 (routing gate passed, protocol validated)',
        previous_value: 1,
        current_value: 0
      }, null, 2));
    }
    process.exit(0);
  } else {
    console.log(JSON.stringify({
      error: 'GATE_RESET_FAILED',
      reason: 'Counter_Z is already 0 (cannot reset - already reset or bypass detected)',
      current_value: data.counters.Z,
      expected_value: 1
    }, null, 2));
    process.exit(1);
  }

} else if (command === 'reset') {
  // Usage: node f1849719.js reset
  const data = {
    session_start: new Date().toISOString(),
    counters: { X: 0, A: 0, B: 0, C: 0, D: 0, Z: 0 },  // 🆕 ESMC 3.107.0: Include Counter_Z in reset
    scores: {
      X_COR: 0, X_WRO: 0,
      A_COR: 0, A_WRO: 0,
      B_COR: 0, B_WRO: 0,
      D_COR: 0, D_WRO: 0
    },
    cache: {},  // 🆕 ESMC 3.100.0: Clear cache on reset
    last_updated: new Date().toISOString()
  };
  saveCounters(data);
  console.log(JSON.stringify({ action: 'RESET', message: 'All counters and cache reset to 0' }, null, 2));

} else {
  console.log(JSON.stringify({
    error: 'Invalid command',
    usage: [
      'node f1849719.js check <manifest> <subTotal> <turn>',
      'node f1849719.js evaluate <manifest> <results.json>',
      'node f1849719.js update <manifest>',
      'node f1849719.js gate-reset [--silent]',
      'node f1849719.js status',
      'node f1849719.js reset'
    ],
    examples: [
      'check A 45 25  → Check BOOTSTRAP at 45% SUB_TOTAL, turn 25',
      'evaluate A tap-results.json  → Evaluate tap-check results',
      'update A  → Update counter after reading BOOTSTRAP',
      'gate-reset --silent  → Reset Counter_Z after manifest validates routing',
      'status  → Show all counters',
      'reset  → Reset all counters to 0'
    ]
  }, null, 2));
}
