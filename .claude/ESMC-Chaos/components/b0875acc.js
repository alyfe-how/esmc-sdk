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
 * ESMC 3.101.0 (Silent-by-default) - Base: 3.82.4 REFERENCE Guide CLI
 * Documentation wrapper for 8a61c26c.md content (extracted during dissection)
 *
 * Usage: node b0875acc.js <topic>
 *
 * Topics:
 *   seed-example      - Full SEED execution walkthrough (lines 199-238 from 8a61c26c.md)
 *   echo-philosophy   - ECHO architecture and philosophy (lines 304-327 from 8a61c26c.md)
 *   token-savings     - Component router token savings table (lines 404-438 from 8a61c26c.md)
 *   atlas             - ATLAS 3-tier architecture reference (lines 442-507 from 8a61c26c.md)
 *   docs              - Complete documentation links (lines 510-545 from 8a61c26c.md)
 *   all               - All topics combined
 *
 * Architecture:
 *   - CLI wrapper loads specific documentation sections on-demand
 *   - Prevents loading full 8a61c26c.md (7,000 tokens) when only docs needed
 *   - Follows BRAIN/COLONELS dissection precedent (execution vs documentation split)
 */

// 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution
const VERBOSE = process.env.ESMC_VERBOSE === 'true' || process.argv.includes('--verbose');
if (!VERBOSE) {
    process.exit(0); // Silent mode - exit immediately without output
}

const topic = process.argv[2];

if (!topic) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  📚 REFERENCE Guide CLI - Documentation Wrapper               ║
╚═══════════════════════════════════════════════════════════════╝

Usage: node b0875acc.js <topic>

Available topics:
  seed-example      - Full SEED execution walkthrough
  echo-philosophy   - ECHO architecture and philosophy
  token-savings     - Component router token savings analysis
  atlas             - ATLAS 3-tier memory architecture
  docs              - Complete documentation index
  all               - Display all topics

Example:
  node b0875acc.js seed-example
  `);
  process.exit(1);
}

const topics = {
  'seed-example': `
#### **Example: Successful Seed Execution**

**User types:** seed

**Claude executes:**

\`\`\`
🗺️ BOOTSTRAP: 'seed' detected → Loading REFERENCE-CORE.md
🧠 AEGIS: 'seed' detected → Executing seed-session.js

🌱 EXECUTING AEGIS SMART SEED

Building comprehensive session data from current conversation...

● Write(.claude/memory/sessions/2025-10-26-esmc-351-aegis-component-router.json)
  [Creates complete sessionData JSON with 7 learnings, 5 patterns, 4 decisions]

● Bash(node ".claude/ESMC Complete/core/seed-session.js")

🧠 ESMC 3.82.4 - Smart Seed Session
   📁 Project root: C:\\10 ESMC SDK
   📄 Session file: 2025-10-26-esmc-351-aegis-component-router.json

🌱 Seeding session to AEGIS memory...

✅ Session seeded successfully!
   📊 Project: esmc-production
   💾 File: 2025-10-26-esmc-351-aegis-component-router.json
   📈 Changes: +7 learnings, +5 patterns
   ⚡ Memory-recent.json updated via updateRecentIndex()

🎖️ Session preserved in ATLAS/AEGIS

✅ Mission complete | 50.0% | ESMC 3.82.4
\`\`\`

**Result:** Session ranked #1 in .memory-recent.json, topic index synced, project map rebuilt.

**⚠️ NAMING CONVENTION (ESMC 3.25.1):**
- ✅ **DO**: Use semantic topic slugs: 2025-10-27-athena-oracle-integration.json
- ❌ **DON'T**: Include version numbers in filename: 2025-10-27-esmc-3-25-oracle.json
- **Rationale**: Version numbers create period conflicts (e.g., "esmc-3.25" contains
  periods which trigger sanitization, causing filename mismatch → duplication)
- **Where versions go**: Use project field ("ESMC 3.25 - Feature Name") and
  keywords array (["esmc-3.25", ...]) for version tracking
- **Benefit**: Same topic = same filename = AEGIS naturally appends instead of duplicating
  `,

  'echo-philosophy': `
**ECHO Philosophy: "Recent Work (Current) = Session Parity"**

**ECHO is the CURRENT conversation's memory layer, parallel to Sessions (PAST conversations).**

**Context Parity Principle:**
- **Session files:** Recent work from PAST conversations (.claude/memory/sessions/)
- **ECHO files:** Recent work from CURRENT conversation (.claude/memory/echo/)
- **Retrieval weight:** ECHO context = EQUALLY IMPORTANT as session context
- **Integration:** ECHO retrieved FIRST (PHASE 0.0), then sessions (TIER 1)

**Why ECHO v3.0:**
- ✅ Filename format matches session pattern (YYYY-MM-DD-slug-counter.json)
- ✅ Counter tracks conversation compaction history (-0, -1, -2...)
- ✅ ATLAS T1 integration for automatic retrieval (context-aware startup)
- ✅ AEGIS pattern module compatibility (recognizes ECHO like sessions)
- ✅ Multi-window safe with compact tracking

**📋 ECHO Architecture Details:** .claude/memory/documents/reference/ECHO-ARCHITECTURE.md
- Context extraction methods (conversation analysis heuristics)
- ECHO file structure (complete JSON schema)
- Retrieval protocol details (PHASE 0.0 integration)
- Recovery protocol (multi-window safety)
  `,

  'token-savings': `
## 🎯 TOKEN SAVINGS (Modular vs Monolith)

**Before (ESMC 3.39 - Monolith Era):**
- Load entire babd175c.js (37,916 tokens) for ANY operation
- 100% token cost for every AEGIS operation

**After (ESMC 3.82.4 - Component Router + Dissection):**
- Load ONLY the module needed via CLI wrappers (~500 tokens each)
- **Average savings: 98.7% across all operations**

| Operation | Before (Monolith) | After (CLI Wrapper) | Savings |
|-----------|------------------|---------------------|---------|
| **SEED** | 37,916 tokens | 500 tokens | **98.7%** |
| **ECHO** | 37,916 tokens | 500 tokens | **98.7%** |
| **CL** | 37,916 tokens | 500 tokens | **98.7%** |
| **Write** | 37,916 tokens | 500 tokens | **98.7%** |
| **GC** | 37,916 tokens | 500 tokens | **98.7%** |
| **Audit** | 37,916 tokens | 500 tokens | **98.7%** |

**8a61c26c.md Dissection (ESMC 3.82.4):**
- Before: 7,000 tokens (full 8a61c26c.md loaded for every seed operation)
- After: 450 tokens (REFERENCE-CORE.md execution only)
- Savings: **93.6%** on execution, **100%** on documentation (lazy-loaded via this CLI)

**Design Philosophy:** Each CLI wrapper executes and returns JSON. NO full module loading needed.
  `,

  'atlas': `
## 🗺️ ATLAS 3-TIER MEMORY RETRIEVAL (Quick Reference)

**Status:** PRODUCTION READY | **Performance:** 5-10x faster than baseline

### **Architecture Overview**

ATLAS (Advanced Tiered Lookup And Search) standardizes all memory retrieval across ESMC with a 3-tier fallback protocol:

\`\`\`
ATLAS 3-Tier System
  ├─ TIER 0: Lessons (.esmc-lessons.json) → Frustration prevention (2ms, 100% hit)
  ├─ TIER 1: Recent (.memory-recent.json) → Fast 15-entry cache (0.7s, 90% hit)
  ├─ TIER 2: Topic (.topic-index.json) → Topic clusters (1.3s, 65% hit)
  └─ TIER 3: Full Scan (sessions/*.json) → Exhaustive search (7.5s, 100% hit)
     └─ SCRIBE: Temporal (parallel) → Time-based enrichment (+1.2s)
\`\`\`

### **Performance Targets**

| Tier | Avg Time | File Size | Hit Rate | Use Case |
|------|----------|-----------|----------|----------|
| **T0** | 2-3ms | 1.8KB | 100% | Frustration prevention (always loaded) |
| **T1** | 0.5-1s | 3-4KB | 90% | Recent work (Ranks 1-15, 3+12 FIFO) |
| **T2** | 1-2s | 8KB | 60-65% | Topic clusters |
| **T3** | 5-10s | N×10KB | 100% | Exhaustive search |
| **SCRIBE** | +0-2s | Parallel | 92% | Temporal enrichment |

### **TIER 1: Recent Index (.memory-recent.json)**

**Purpose:** Lightning-fast 15-entry cache with 3+12 FIFO strategy

**Structure (ESMC 3.34 P0-2 expansion):**
- **Hot tier** (Ranks 1-3): Temporal recent (FIFO), 80% queries
- **Warm tier** (Ranks 4-15): Importance-based sorted, 20% queries

**Token Savings:** 280 tokens/session (40% reduction vs v1.0)

### **TIER 2: Topic Index (.topic-index.json)**

**Purpose:** Topic-based inverted index for semantic clustering

**Lookup Strategy:** O(1) topic lookup → O(log n) session retrieval

**Token Savings:** 87% reduction (5K vs 38K for full project load)

### **TIER 3: Full AEGIS Registry Scan**

**Purpose:** Exhaustive search when T1/T2 miss

**Execution:** Recursive scan of .claude/memory/sessions/ with relevance scoring

**Threshold:** >30% relevance required for match

### **SCRIBE: Temporal Enrichment (Parallel)**

**Purpose:** Time-based context enrichment (runs parallel to T1/T2/T3)

**Enrichment:** Recent/historical balance, recency weighting, temporal patterns

**📋 ATLAS Architecture Details:** .claude/memory/documents/reference/ATLAS-ARCHITECTURE.md
  `,

  'docs': `
## 📚 COMPLETE DOCUMENTATION

**All detailed documentation has been extracted to lazy-load files:**

**📋 ECHO Architecture:** .claude/memory/documents/reference/ECHO-ARCHITECTURE.md
- Context extraction methods (conversation analysis heuristics)
- ECHO file structure (complete JSON schema)
- Retrieval protocol details (PHASE 0.0 integration)
- Recovery protocol (multi-window safety)

**📋 ATLAS Architecture:** .claude/memory/documents/reference/ATLAS-ARCHITECTURE.md
- Component integration (PIU/DKI/UIP/PCA mesh)
- AEGIS write-side integration (session seeding)
- Usage examples (T1/T2/T3 searches)
- Performance metrics tracking (production data)
- Migration notes (legacy system deprecation)

**📋 MySQL Logging:** .claude/memory/documents/reference/MYSQL-LOGGING.md
- Tier-gated protocol (MAX/VIP exclusive)
- Battlefield intelligence database (30+ tables)
- Query examples (authentication, patterns, statistics)
- Setup instructions (database creation, configuration)

**📋 System Architecture:** .claude/memory/documents/reference/SYSTEM-ARCHITECTURE.md
- File structure (hierarchical memory organization)
- Command authority (GENERAL → ECHELON/ATHENA → Colonels → Agents)
- Infinity mode configuration (extended context)
- Token optimization (strategies and metrics)

**📋 ORACLE Protocol:** .claude/memory/documents/reference/ORACLE-PROTOCOL.md
- Phase 6.5 execution protocol (code review before implementation)
- Trigger logic (complexity gate, security-critical)
- Integration with COLONELS (DELTA deployment)
- User decision flow (A/B/C options)
- Performance metrics (20% trigger rate, 95% refinement approval)
  `
};

if (topic === 'all') {
  console.log('\n📚 REFERENCE Guide - Complete Documentation\n');
  console.log('═'.repeat(70));
  Object.entries(topics).forEach(([name, content]) => {
    console.log(`\n## ${name.toUpperCase()}\n`);
    console.log(content);
    console.log('\n' + '─'.repeat(70));
  });
  process.exit(0);
}

if (topics[topic]) {
  console.log(topics[topic]);
  process.exit(0);
} else {
  console.log(`\n❌ Unknown topic: "${topic}"\n`);
  console.log('Available topics: seed-example, echo-philosophy, token-savings, atlas, docs, all\n');
  process.exit(1);
}
