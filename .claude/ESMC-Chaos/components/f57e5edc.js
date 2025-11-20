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
/** ESMC 3.100.0 ATHENA Library CLI | 2025-11-14 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: On-demand memory library scanning + lazy loading for ATHENA omniscient review
 *  Innovation: 92% token savings vs persistent catalog (50 vs 600 tokens for overview)
 *  Pattern: Hardcoded metadata + filesystem scan (zero staleness, zero maintenance)
 *  Architecture: Library awareness → On-demand zoom → Proactive intelligence
 *
 *  Commands:
 *    overview         Show top 3 priority files (~50 tokens)
 *    list [--all]     Show all library files (~100 tokens)
 *    get <type>       Load specific file content (lazy loading)
 *
 *  Token Economics:
 *    overview: 50 tokens (vs 600 persistent catalog = 92% savings)
 *    list --all: 100 tokens (vs 600 persistent catalog = 83% savings)
 *    get lessons: 0 (metadata) + 400 (file) = 400 tokens (no catalog overhead)
 */

const fs = require('fs');
const path = require('path');

// Hardcoded memory library metadata (zero maintenance, always current)
const MEMORY_LIBRARY = {
  '.memory-recent.json': {
    type: 'T1 Recent Memory',
    purpose: '10 recent + 5 important sessions (dual-index pattern)',
    when_to_use: 'EVERY query - Check FIRST for patterns/precedents (Ranks 1-10)',
    priority: 1,
    typical_size_tokens: 2800,
    content_type: 'session_summaries'
  },
  '.esmc-lessons.json': {
    type: 'Lessons Learned',
    purpose: 'Frustration prevention index - documented failures/corrections',
    when_to_use: 'When suggesting approaches (avoid L001/L002 violations)',
    priority: 2,
    typical_size_tokens: 400,
    content_type: 'lessons'
  },
  '.esmc-precedent-registry.json': {
    type: 'Solution Patterns',
    purpose: 'Successful implementation patterns that worked',
    when_to_use: 'When implementing features (reuse validated patterns)',
    priority: 3,
    typical_size_tokens: 500,
    content_type: 'precedents'
  },
  '.esmc-error-registry.json': {
    type: 'Error Signatures',
    purpose: 'Past debugging sessions and error patterns',
    when_to_use: 'When debugging similar errors (pattern matching)',
    priority: 4,
    typical_size_tokens: 400,
    content_type: 'error_patterns'
  },
  '.esmc-working-memory.json': {
    type: 'Enhanced Working Memory',
    purpose: 'T1 ATLAS results + lessons + user adaptations (60-min TTL cache)',
    when_to_use: 'After memory-bundle-cli execution (compressed bundle)',
    priority: 5,
    typical_size_tokens: 1200,
    content_type: 'working_memory'
  },
  '.project-brief.json': {
    type: 'Project Context',
    purpose: 'Project fingerprint (name, tech stack, architecture, goals)',
    when_to_use: 'Task-oriented queries (understand project context)',
    priority: 6,
    typical_size_tokens: 200,
    content_type: 'project_brief'
  },
  '.user-profile.json': {
    type: 'User Profile',
    purpose: 'User preferences, TBI adaptations, communication style',
    when_to_use: 'ALL interactions (adapt communication to user needs)',
    priority: 7,
    typical_size_tokens: 600,
    content_type: 'user_profile'
  },
  '.topic-index.json': {
    type: 'T2 Topic Index',
    purpose: 'Topics with session references (semantic clustering)',
    when_to_use: 'When T1 misses - broader topic-based search',
    priority: 8,
    typical_size_tokens: 5000,
    content_type: 'topic_index'
  },
  '.memory-registry.json': {
    type: 'T3 Full Registry',
    purpose: 'Complete session registry (all projects, all sessions)',
    when_to_use: 'Research queries ("across sessions", "compare", "history")',
    priority: 9,
    typical_size_tokens: 8000,
    content_type: 'registry'
  },
  '.document-index.json': {
    type: 'Document Library',
    purpose: 'Architecture docs, whitepapers, audit reports',
    when_to_use: 'Complex architecture questions or design decisions',
    priority: 10,
    typical_size_tokens: 2000,
    content_type: 'document_index'
  },
  '.cl-index.json': {
    type: 'Change Log Index',
    purpose: 'Architecture modification history (CL tracking)',
    when_to_use: 'When reviewing recent protocol changes',
    priority: 11,
    typical_size_tokens: 300,
    content_type: 'cl_index'
  },
  '.esmc-citation-corrections.json': {
    type: 'Citation Corrections',
    purpose: 'User corrections to citations/references',
    when_to_use: 'When citing precedents (accuracy check)',
    priority: 12,
    typical_size_tokens: 300,
    content_type: 'citation_corrections'
  }
};

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showUsage();
    process.exit(1);
  }

  const command = args[0];
  // 🆕 ESMC 3.101.0: Silent by default for clean SDK distribution (opt-in verbose)
  const verbose = process.env.ESMC_VERBOSE === 'true' || args.includes('--verbose') || args.includes('-v');
  const silent = !verbose;
  const showAll = args.includes('--all') || args.includes('-a');
  const filter = args.find(arg => arg.startsWith('--filter='))?.split('=')[1];
  const type = args[1]; // For 'get <type>'

  return { command, silent, showAll, filter, type };
}

function showUsage() {
  console.log(`
🛡️ ATHENA Library CLI - Memory Intelligence Overview & Lazy Loading

Usage:
  node f57e5edc.js <command> [options]

Commands:
  overview              Show top 3 priority files (~50 tokens)
  list [--all|-a]       Show all 12 library files (~100 tokens)
  get <type>            Load specific file content (lazy loading)
                        Types: recent, lessons, precedents, errors,
                               working, brief, profile, topics, registry,
                               documents, changelogs, citations

Options:
  --silent, -s          Suppress headers, JSON output only
  --filter=<id>         Filter content (e.g., --filter=L002 for lessons)

Examples:
  f57e5edc.js overview                    # Top 3 priorities (50 tokens)
  f57e5edc.js list --all                  # All 12 files (100 tokens)
  f57e5edc.js get lessons                 # Load lessons file (400 tokens)
  f57e5edc.js get lessons --filter=L002   # Just L002 lesson (50 tokens)

Token Economics:
  Overview:    50 tokens  (vs 600 persistent catalog = 92% savings)
  List --all:  100 tokens (vs 600 persistent catalog = 83% savings)
  Get single:  Variable   (no catalog overhead, pure content)

Version: ESMC 3.100.0 | Pattern: On-demand scan + hardcoded metadata
  `);
}

function findProjectRoot() {
  let currentPath = __dirname;

  // Walk up from CLI directory
  while (currentPath !== path.parse(currentPath).root) {
    const memoryPath = path.join(currentPath, '.claude', 'memory');
    if (fs.existsSync(memoryPath)) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }

  throw new Error('Project root not found (no .claude/memory/ directory)');
}

function scanMemoryDirectory() {
  const projectRoot = findProjectRoot();
  const memoryPath = path.join(projectRoot, '.claude', 'memory');

  // Scan directory for .json files
  const files = fs.readdirSync(memoryPath)
    .filter(file => file.endsWith('.json') && file.startsWith('.'))
    .filter(file => MEMORY_LIBRARY[file]); // Only known files

  return files.map(file => ({
    filename: file,
    path: path.join(memoryPath, file),
    exists: fs.existsSync(path.join(memoryPath, file)),
    metadata: MEMORY_LIBRARY[file]
  }));
}

function commandOverview(silent) {
  const files = scanMemoryDirectory();
  const topPriority = files
    .filter(f => f.exists)
    .sort((a, b) => a.metadata.priority - b.metadata.priority)
    .slice(0, 3);

  const result = {
    command: 'overview',
    count: topPriority.length,
    files: topPriority.map(f => ({
      type: f.metadata.type,
      purpose: f.metadata.purpose,
      when_to_use: f.metadata.when_to_use,
      priority: f.metadata.priority,
      size_estimate: `~${f.metadata.typical_size_tokens} tokens`
    }))
  };

  if (!silent) {
    console.log('\n🛡️ ATHENA Library Overview (Top 3 Priorities)\n');
    topPriority.forEach((f, i) => {
      console.log(`${i + 1}. ${f.metadata.type}`);
      console.log(`   Purpose: ${f.metadata.purpose}`);
      console.log(`   When: ${f.metadata.when_to_use}`);
      console.log(`   Size: ~${f.metadata.typical_size_tokens} tokens\n`);
    });
  }

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function commandList(showAll, silent) {
  const files = scanMemoryDirectory();
  const filtered = showAll ? files : files.filter(f => f.metadata.priority <= 7);
  const sorted = filtered.sort((a, b) => a.metadata.priority - b.metadata.priority);

  const result = {
    command: 'list',
    mode: showAll ? 'all' : 'default',
    count: sorted.length,
    files: sorted.map(f => ({
      filename: f.filename,
      type: f.metadata.type,
      purpose: f.metadata.purpose,
      priority: f.metadata.priority,
      exists: f.exists,
      size_estimate: `~${f.metadata.typical_size_tokens} tokens`
    }))
  };

  if (!silent) {
    console.log(`\n🛡️ ATHENA Library (${result.mode === 'all' ? 'All Files' : 'Default View'})\n`);
    sorted.forEach((f, i) => {
      const status = f.exists ? '✅' : '❌';
      console.log(`${i + 1}. ${status} ${f.metadata.type} (Priority ${f.metadata.priority})`);
      console.log(`   ${f.metadata.purpose}`);
      console.log(`   File: ${f.filename}\n`);
    });
  }

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function commandGet(type, filter, silent) {
  // Map type aliases to filenames
  const typeMap = {
    'recent': '.memory-recent.json',
    'lessons': '.esmc-lessons.json',
    'precedents': '.esmc-precedent-registry.json',
    'errors': '.esmc-error-registry.json',
    'working': '.esmc-working-memory.json',
    'brief': '.project-brief.json',
    'profile': '.user-profile.json',
    'topics': '.topic-index.json',
    'registry': '.memory-registry.json',
    'documents': '.document-index.json',
    'changelogs': '.cl-index.json',
    'citations': '.esmc-citation-corrections.json'
  };

  const filename = typeMap[type];
  if (!filename) {
    console.error(`❌ Unknown type: ${type}`);
    console.error(`Available types: ${Object.keys(typeMap).join(', ')}`);
    process.exit(1);
  }

  const projectRoot = findProjectRoot();
  const filePath = path.join(projectRoot, '.claude', 'memory', filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filename}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const metadata = MEMORY_LIBRARY[filename];

  let filteredContent = content;

  // Apply filter if specified (lessons-specific for now)
  if (filter && type === 'lessons') {
    if (Array.isArray(content)) {
      filteredContent = content.filter(lesson => lesson.id === filter);
    } else if (content.lessons) {
      filteredContent = content.lessons.filter(lesson => lesson.id === filter);
    }
  }

  const result = {
    command: 'get',
    type: type,
    filename: filename,
    metadata: metadata,
    filter_applied: filter || null,
    content: filteredContent
  };

  if (!silent) {
    console.log(`\n🛡️ ATHENA Library - ${metadata.type}\n`);
    console.log(`Purpose: ${metadata.purpose}`);
    console.log(`When to use: ${metadata.when_to_use}`);
    if (filter) {
      console.log(`Filter: ${filter}`);
    }
    console.log('\n--- Content ---\n');
  }

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function main() {
  try {
    const { command, silent, showAll, filter, type } = parseArgs();

    switch (command) {
      case 'overview':
        commandOverview(silent);
        break;

      case 'list':
        commandList(showAll, silent);
        break;

      case 'get':
        if (!type) {
          console.error('❌ Missing type argument. Usage: f57e5edc.js get <type>');
          process.exit(1);
        }
        commandGet(type, filter, silent);
        break;

      case 'help':
      case '--help':
      case '-h':
        showUsage();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        showUsage();
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

module.exports = { commandOverview, commandList, commandGet };
