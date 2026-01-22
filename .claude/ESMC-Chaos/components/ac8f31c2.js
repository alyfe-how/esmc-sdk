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
/** ESMC 4 - Differential Memory Loader CLI
 *  Purpose: Load only NEW sessions since last conversation (token optimization)
 *  Usage: node ac8f31c2.js [--silent]
 *
 *  Token Economics:
 *  - Traditional: Load all 15 recent sessions (~3k tokens)
 *  - Differential: Load only new sessions since last marker (~300-600 tokens for 1-2 sessions)
 *  - Savings: 80-90% on memory loading for returning conversations
 */

const fs = require('fs').promises;
const path = require('path');

async function findProjectRoot() {
    let current = __dirname;
    while (current !== path.parse(current).root) {
        const claudePath = path.join(current, '.claude');
        try {
            await fs.access(claudePath);
            return current;
        } catch {
            current = path.dirname(current);
        }
    }
    throw new Error('Could not find project root with .claude directory');
}

async function loadConversationMarker(memoryPath) {
    const markerPath = path.join(memoryPath, '.last-conversation-marker.json');
    try {
        const content = await fs.readFile(markerPath, 'utf8');
        return JSON.parse(content);
    } catch {
        // No marker exists, return null (first conversation)
        return null;
    }
}

async function saveConversationMarker(memoryPath) {
    const markerPath = path.join(memoryPath, '.last-conversation-marker.json');
    const marker = {
        timestamp: new Date().toISOString(),
        session_id: `session_${Date.now()}`,
        version: "1.0.0"
    };
    await fs.writeFile(markerPath, JSON.stringify(marker, null, 2));
    return marker;
}

async function loadDifferentialSessions(memoryPath, lastMarkerTimestamp) {
    const recentPath = path.join(memoryPath, '.memory-recent.json');

    try {
        const content = await fs.readFile(recentPath, 'utf8');
        const recentIndex = JSON.parse(content);

        // Get all sessions from both indices (recent + important)
        const allSessions = [
            ...(recentIndex.indices?.recent?.sessions || []),
            ...(recentIndex.indices?.important?.sessions || [])
        ];

        // Deduplicate by session_id
        const uniqueSessions = [];
        const seen = new Set();
        for (const session of allSessions) {
            if (!seen.has(session.session_id)) {
                seen.add(session.session_id);
                uniqueSessions.push(session);
            }
        }

        // 🆕 ESMC 4.0: Cascading ATLAS architecture
        // Return BOTH narrow (date-filtered) and wide (all recent) for 2-layer T1
        const wide = uniqueSessions.slice(0, 15); // All recent sessions (T1 Layer 2)

        if (!lastMarkerTimestamp) {
            // First conversation - narrow = top 3, wide = all 15
            const narrow = uniqueSessions.slice(0, 3);
            return {
                mode: 'first_conversation',
                narrow: narrow,
                wide: wide,
                count_narrow: narrow.length,
                count_wide: wide.length,
                savings_percent: 0
            };
        }

        // Filter: Only sessions AFTER last marker
        const newSessions = uniqueSessions.filter(session => {
            const sessionDate = new Date(session.date);
            const markerDate = new Date(lastMarkerTimestamp);
            return sessionDate > markerDate;
        });

        if (newSessions.length === 0) {
            // No new sessions - narrow = last 3, wide = all 15
            const narrow = uniqueSessions.slice(0, 3);
            return {
                mode: 'no_new_sessions',
                narrow: narrow,
                wide: wide,
                count_narrow: narrow.length,
                count_wide: wide.length,
                savings_percent: Math.round((1 - 3 / 15) * 100) // 80%
            };
        }

        // Return new sessions as narrow, all as wide
        return {
            mode: 'differential',
            narrow: newSessions,
            wide: wide,
            count_narrow: newSessions.length,
            count_wide: wide.length,
            savings_percent: Math.round((1 - newSessions.length / 15) * 100)
        };

    } catch (error) {
        throw new Error(`Failed to load differential sessions: ${error.message}`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const silent = args.includes('--silent');

    try {
        const projectRoot = await findProjectRoot();
        const memoryPath = path.join(projectRoot, '.claude', 'memory');

        if (!silent) console.log('🔄 Differential Memory Loader\n');

        // Load last conversation marker
        const marker = await loadConversationMarker(memoryPath);

        if (!silent) {
            if (marker) {
                console.log(`   Last conversation: ${marker.timestamp}`);
            } else {
                console.log('   First conversation detected (no marker)');
            }
        }

        // Load differential sessions
        const result = await loadDifferentialSessions(
            memoryPath,
            marker?.timestamp || null
        );

        if (!silent) {
            console.log(`   Mode: ${result.mode}`);
            console.log(`   Narrow (T1 Layer 1): ${result.count_narrow} sessions`);
            console.log(`   Wide (T1 Layer 2): ${result.count_wide} sessions`);
            if (result.savings_percent > 0) {
                console.log(`   Token savings: ${result.savings_percent}%`);
            }
            console.log('');
        }

        // Write differential bundle (🆕 ESMC 4.0: includes both narrow + wide)
        const bundlePath = path.join(memoryPath, '.esmc-differential-memory.json');
        const bundle = {
            version: "2.0.0", // Cascading ATLAS architecture
            mode: result.mode,
            loaded_at: new Date().toISOString(),
            last_marker: marker?.timestamp || null,
            cascading: {
                narrow: {
                    sessions: result.narrow,
                    count: result.count_narrow,
                    description: "T1 Layer 1: Date-filtered sessions (70% hit rate expected)"
                },
                wide: {
                    sessions: result.wide,
                    count: result.count_wide,
                    description: "T1 Layer 2: All recent sessions (20% hit rate on Layer 1 miss)"
                }
            },
            token_savings_percent: result.savings_percent
        };

        await fs.writeFile(bundlePath, JSON.stringify(bundle, null, 2));

        // Update conversation marker for next time
        const newMarker = await saveConversationMarker(memoryPath);

        if (!silent) {
            console.log('✅ Cascading differential bundle created');
            console.log(`   Output: .esmc-differential-memory.json`);
            console.log(`   Next marker: ${newMarker.timestamp}\n`);
        }

        // Output JSON for CLI consumption
        console.log(JSON.stringify({
            success: true,
            mode: result.mode,
            narrow_count: result.count_narrow,
            wide_count: result.count_wide,
            savings_percent: result.savings_percent,
            bundle_path: bundlePath
        }));

    } catch (error) {
        console.error(JSON.stringify({
            success: false,
            error: error.message
        }));
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    main,
    loadConversationMarker,
    saveConversationMarker,
    loadDifferentialSessions
};
