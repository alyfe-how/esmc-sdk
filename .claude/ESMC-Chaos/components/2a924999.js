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
/** ESMC 4 - Rebuild Recent Index CLI
 *  Purpose: Rebuild .memory-recent.json from all existing session files
 *  Usage: node 2a924999.js
 */

const fs = require('fs').promises;
const path = require('path');

async function findProjectRoot() {
    let current = __dirname;
    while (current !== path.parse(current).root) {
        const memoryPath = path.join(current, '.claude/memory');
        try {
            await fs.access(memoryPath);
            return current;
        } catch {
            current = path.dirname(current);
        }
    }
    throw new Error('Could not find project root with .claude/memory directory');
}

async function main() {
    console.log('🔄 Rebuilding .memory-recent.json from all sessions...\n');

    try {
        const projectRoot = await findProjectRoot();
        const memoryPath = path.join(projectRoot, '.claude/memory');
        const sessionsPath = path.join(memoryPath, 'sessions');
        const recentIndexPath = path.join(memoryPath, '.memory-recent.json');
        const registryPath = path.join(memoryPath, '.memory-registry.json');

        // Read all session files
        const files = await fs.readdir(sessionsPath);
        const sessionFiles = files.filter(f => f.match(/^\d{4}-\d{2}-\d{2}-.+\.json$/));

        console.log(`   📁 Found ${sessionFiles.length} session files`);

        // Load all sessions with metadata
        const sessions = [];
        for (const filename of sessionFiles) {
            try {
                const filePath = path.join(sessionsPath, filename);
                const content = await fs.readFile(filePath, 'utf8');
                const sessionData = JSON.parse(content);
                const stats = await fs.stat(filePath);

                sessions.push({
                    session_id: sessionData.session_id || filename.replace('.json', ''),
                    date: sessionData.date || filename.split('-').slice(0, 3).join('-'),
                    project: sessionData.project || 'Unknown',
                    summary: sessionData.summary || '',
                    keywords: sessionData.keywords || [],
                    learnings_count: (sessionData.learnings || []).length,
                    patterns_count: (sessionData.patterns || []).length,
                    importance_score: sessionData.importance_score || 50,
                    mtime: stats.mtime
                });
            } catch (error) {
                console.warn(`   ⚠️ Skipped ${filename}: ${error.message}`);
            }
        }

        console.log(`   ✅ Loaded ${sessions.length} sessions\n`);

        // Sort by modification time (most recent first)
        const recentSorted = [...sessions].sort((a, b) => b.mtime - a.mtime);

        // Sort by importance score (highest first)
        const importanceSorted = [...sessions].sort((a, b) => b.importance_score - a.importance_score);

        // Build dual-index structure (15 recent + 15 important)
        const recentIndex = {
            version: "4.0.0",
            description: "Dual-index T1 cache: 15 recent (temporal FIFO) + 15 important (importance-ranked) = 30 entries max, ~18-22 unique sessions with deduplication. Pattern recognition optimized for multi-session problem-solving arcs + high-value learning preservation.",
            indices: {
                recent: {
                    max_entries: 15,
                    rotation_policy: "FIFO (pure temporal)",
                    sessions: recentSorted.slice(0, 15).map((s, i) => ({
                        rank: i + 1,
                        session_id: s.session_id,
                        date: s.date,
                        project: s.project,
                        summary: s.summary,
                        keywords: s.keywords,
                        learnings_count: s.learnings_count,
                        patterns_count: s.patterns_count,
                        importance_score: s.importance_score
                    }))
                },
                important: {
                    max_entries: 15,
                    rotation_policy: "Importance-ranked (score descending)",
                    sessions: importanceSorted.slice(0, 15).map((s, i) => ({
                        rank: i + 1,
                        session_id: s.session_id,
                        date: s.date,
                        project: s.project,
                        summary: s.summary,
                        keywords: s.keywords,
                        learnings_count: s.learnings_count,
                        patterns_count: s.patterns_count,
                        importance_score: s.importance_score
                    }))
                }
            },
            maintenance_protocol: {
                cache_type: "T1 dual-index (temporal + importance)",
                max_total_entries: 30,
                rotation_policy: "FIFO temporal for recent, importance-ranked for important",
                cleanup_interval: "Per seed operation",
                max_age_days: null,
                backup_strategy: "None (lightweight cache, not primary storage)"
            },
            last_updated: new Date().toISOString()
        };

        // Write recent index
        await fs.writeFile(recentIndexPath, JSON.stringify(recentIndex, null, 2));
        console.log('   ✅ Rebuilt .memory-recent.json');
        console.log(`      Recent: ${recentIndex.indices.recent.sessions.length} sessions`);
        console.log(`      Important: ${recentIndex.indices.important.sessions.length} sessions\n`);

        // Rebuild memory registry
        const registry = {
            version: "1.0.0",
            projects: {
                default: {
                    name: "13 Websites",
                    root: projectRoot,
                    sessions: {}
                }
            },
            global_topics: {},
            last_updated: new Date().toISOString()
        };

        // Add all sessions to registry
        for (const session of sessions) {
            registry.projects.default.sessions[session.session_id] = {
                date: session.date,
                project: session.project,
                summary: session.summary,
                keywords: session.keywords,
                learnings_count: session.learnings_count,
                patterns_count: session.patterns_count,
                importance_score: session.importance_score
            };
        }

        await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
        console.log('   ✅ Rebuilt .memory-registry.json');
        console.log(`      Indexed: ${Object.keys(registry.projects.default.sessions).length} sessions\n`);

        console.log('✅ Index rebuild complete!');

    } catch (error) {
        console.error('❌ Rebuild failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
