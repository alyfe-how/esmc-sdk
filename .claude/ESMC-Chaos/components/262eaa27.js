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
/** ESMC 3.39 AEGIS GC | 2025-10-30 | v3.39.0 | PROD | ALL_TIERS
 *  Purpose: Memory garbage collection system (modular extraction from monolith)
 *  Features: TTL-based archival | gzip compression | Cold storage | Orphan cleanup | Staleness detection
 *  Parent: 27c20532.js (hybrid facade)
 *  Token Savings: ~370 lines extracted (saves ~3,700 tokens when not needed)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * AEGIS Memory Garbage Collector - Extracted from monolith
 *
 * This module handles memory management operations:
 * - Archive old sessions to cold storage (TTL-based)
 * - gzip compression (70-90% savings)
 * - Retrieve archived sessions on demand
 * - Clean orphaned topic index references
 * - Check topic index staleness
 *
 * Philosophy: "Automatic memory maintenance, zero manual intervention"
 */
class MemoryGarbageCollector {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');
        this.coldStoragePath = path.join(this.memoryPath, 'cold-storage');
        this.ttlDays = options.ttlDays || 90;

        console.log(`🗑️ Memory GC initialized (TTL: ${this.ttlDays} days)`);
        console.log(`   📂 Memory path: ${this.memoryPath}`);
    }

    /**
     * Auto-detect project root by walking up from module location
     */
    _findProjectRoot() {
        let current = __dirname;
        let bestCandidate = null;
        let maxFiles = 0;

        // Walk UP the tree and collect ALL valid candidates
        while (current !== path.dirname(current)) {
            const memoryPath = path.join(current, '.claude', 'memory');
            const sessionsPath = path.join(memoryPath, 'sessions');

            // Verify .claude/memory/sessions/ exists AND contains session files
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(sessionsPath)) {
                try {
                    const stats = fsSync.statSync(sessionsPath);
                    if (stats.isDirectory()) {
                        const entries = fsSync.readdirSync(sessionsPath);
                        if (entries.length > 0) {
                            // Count total session files to find most populated root
                            let fileCount = 0;
                            for (const entry of entries) {
                                const entryPath = path.join(sessionsPath, entry);
                                const entryStat = fsSync.statSync(entryPath);
                                if (entryStat.isDirectory()) {
                                    fileCount += fsSync.readdirSync(entryPath).filter(f => f.endsWith('.json')).length;
                                } else if (entry.endsWith('.json')) {
                                    fileCount++;
                                }
                            }
                            // Prefer root with MORE files (real project vs test fixture)
                            if (fileCount > maxFiles) {
                                bestCandidate = current;
                                maxFiles = fileCount;
                            }
                        }
                    }
                } catch (error) {
                    // Invalid directory, continue searching
                }
            }
            current = path.dirname(current);
        }

        if (bestCandidate) {
            console.log(`   🎯 GC: Auto-detected project root: ${bestCandidate}`);
            return bestCandidate;
        }

        throw new Error('GC: Could not locate project root with .claude/memory/sessions/. Pass explicit projectRoot option.');
    }

    /**
     * Run garbage collection - archive sessions older than TTL
     * @param {Object} options - GC options
     * @param {boolean} options.dryRun - Preview mode (no actual changes)
     * @returns {Promise<Object>} GC statistics
     */
    async run(options = {}) {
        const dryRun = options.dryRun || false;
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - this.ttlDays * 24 * 60 * 60 * 1000);

        console.log(`🗑️ Running memory garbage collection...`);
        console.log(`   Cutoff date: ${cutoffDate.toISOString().split('T')[0]} (${this.ttlDays} days ago)`);
        console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

        const stats = {
            scanned: 0,
            archived: 0,
            compressed: 0,
            bytes_freed: 0,
            errors: 0
        };

        try {
            // Ensure cold storage exists
            if (!dryRun) {
                await fs.mkdir(this.coldStoragePath, { recursive: true });
            }

            // Scan all session directories
            const sessionsPath = path.join(this.memoryPath, 'sessions');
            const sessionDirs = await fs.readdir(sessionsPath);

            for (const dir of sessionDirs) {
                const dirPath = path.join(sessionsPath, dir);
                const dirStats = await fs.stat(dirPath);

                if (!dirStats.isDirectory()) continue;

                // Check all files in directory
                const files = await fs.readdir(dirPath);
                for (const file of files) {
                    if (!file.endsWith('.json')) continue;

                    const filePath = path.join(dirPath, file);
                    const fileStats = await fs.stat(filePath);
                    const fileAge = now - fileStats.mtime;
                    const fileAgeDays = Math.floor(fileAge / (1000 * 60 * 60 * 24));

                    stats.scanned++;

                    if (fileStats.mtime < cutoffDate) {
                        console.log(`   📦 Archiving: ${dir}/${file} (${fileAgeDays} days old)`);

                        if (!dryRun) {
                            try {
                                // Read file content
                                const content = await fs.readFile(filePath, 'utf8');

                                // Compress with gzip
                                const compressed = await gzip(content);

                                // Archive to cold storage with .gz extension
                                const archivePath = path.join(this.coldStoragePath, `${dir}_${file}.gz`);
                                await fs.writeFile(archivePath, compressed);

                                // Delete original
                                await fs.unlink(filePath);

                                const compressedSize = compressed.length;
                                const compressionRatio = ((1 - compressedSize / fileStats.size) * 100).toFixed(1);

                                stats.archived++;
                                stats.bytes_freed += fileStats.size;
                                stats.compressed++;

                                console.log(`      💾 Compressed: ${(fileStats.size / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% savings)`);
                            } catch (error) {
                                console.warn(`   ⚠️ Failed to archive ${file}: ${error.message}`);
                                stats.errors++;
                            }
                        } else {
                            stats.archived++;
                            stats.bytes_freed += fileStats.size;
                        }
                    }
                }
            }

            // Clean orphaned topic index references
            console.log(`\n🧹 Cleaning orphaned topic index references...`);
            const orphanStats = await this.cleanTopicIndexOrphans();
            stats.orphans_removed = orphanStats.orphansRemoved;

            // Check topic index staleness
            console.log(`\n🔍 Checking topic index staleness...`);
            const stalenessCheck = await this.checkTopicIndexStaleness();
            stats.index_staleness = stalenessCheck;

            if (stalenessCheck.isStale) {
                console.log(`   ⚠️ Topic index is STALE: ${stalenessCheck.reason} (severity: ${stalenessCheck.severity})`);
                if (stalenessCheck.severity === 'critical' || stalenessCheck.severity === 'high') {
                    console.log(`   💡 Recommendation: Run AEGIS rebuild to regenerate topic index`);
                }
            } else {
                console.log(`   ✅ Topic index is fresh (age: ${stalenessCheck.ageInDays} days, ${stalenessCheck.sessionCount} sessions)`);
            }

            console.log(`\n📊 Garbage Collection Complete:`);
            console.log(`   Scanned: ${stats.scanned} sessions`);
            console.log(`   Archived: ${stats.archived} sessions`);
            console.log(`   Space freed: ${Math.round(stats.bytes_freed / 1024)} KB`);
            console.log(`   Orphans removed: ${stats.orphans_removed}`);
            console.log(`   Errors: ${stats.errors}`);

            return { success: true, stats };

        } catch (error) {
            console.error(`   ❌ GC failed: ${error.message}`);
            return { success: false, error: error.message, stats };
        }
    }

    /**
     * Retrieve and decompress archived session from cold storage
     * @param {string} sessionId - Session identifier
     * @returns {Promise<object|null>} Decompressed session data or null if not found
     */
    async retrieveArchivedSession(sessionId) {
        try {
            // Look for compressed file in cold storage
            const files = await fs.readdir(this.coldStoragePath);
            const archiveFile = files.find(f => f.includes(sessionId) && f.endsWith('.gz'));

            if (!archiveFile) {
                return null;
            }

            const archivePath = path.join(this.coldStoragePath, archiveFile);
            const compressed = await fs.readFile(archivePath);

            // Decompress
            const decompressed = await gunzip(compressed);
            const session = JSON.parse(decompressed.toString('utf8'));

            console.log(`   📂 Retrieved archived session: ${sessionId} (decompressed ${(compressed.length / 1024).toFixed(1)}KB → ${(decompressed.length / 1024).toFixed(1)}KB)`);

            return session;
        } catch (error) {
            console.warn(`   ⚠️ Failed to retrieve archived session ${sessionId}: ${error.message}`);
            return null;
        }
    }

    /**
     * Check if topic index is stale and needs rebuilding
     * @returns {Promise<object>} Staleness assessment
     */
    async checkTopicIndexStaleness() {
        const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');

        try {
            // Check if index exists
            if (!fsSync.existsSync(topicIndexPath)) {
                return {
                    isStale: true,
                    reason: 'index_missing',
                    severity: 'critical'
                };
            }

            const content = await fs.readFile(topicIndexPath, 'utf8');
            const index = JSON.parse(content);

            // Check 1: Age of index (> 7 days = stale)
            const lastUpdated = new Date(index.last_updated);
            const now = new Date();
            const ageInDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);

            if (ageInDays > 7) {
                return {
                    isStale: true,
                    reason: 'index_outdated',
                    severity: 'medium',
                    ageInDays: ageInDays.toFixed(1)
                };
            }

            // Check 2: Count orphaned references
            let orphanCount = 0;
            for (const [topic, data] of Object.entries(index.topics || {})) {
                for (const session of data.sessions || []) {
                    const sessionPath = path.join(this.memoryPath, session.file);
                    if (!fsSync.existsSync(sessionPath)) {
                        orphanCount++;
                    }
                }
            }

            if (orphanCount > 5) {
                return {
                    isStale: true,
                    reason: 'excessive_orphans',
                    severity: 'medium',
                    orphanCount
                };
            }

            // Check 3: Compare session count vs index
            const sessionsPath = path.join(this.memoryPath, 'sessions');
            let actualSessionCount = 0;

            if (fsSync.existsSync(sessionsPath)) {
                const sessionDirs = await fs.readdir(sessionsPath);
                for (const dir of sessionDirs) {
                    const dirPath = path.join(sessionsPath, dir);
                    const dirStats = await fs.stat(dirPath);
                    if (dirStats.isDirectory()) {
                        const files = await fs.readdir(dirPath);
                        actualSessionCount += files.filter(f => f.endsWith('.json')).length;
                    }
                }
            }

            // Count indexed sessions
            let indexedSessionCount = 0;
            for (const [topic, data] of Object.entries(index.topics || {})) {
                indexedSessionCount += (data.sessions || []).length;
            }

            const discrepancy = Math.abs(actualSessionCount - indexedSessionCount);
            if (discrepancy > 10) {
                return {
                    isStale: true,
                    reason: 'session_count_mismatch',
                    severity: 'low',
                    actualSessions: actualSessionCount,
                    indexedSessions: indexedSessionCount,
                    discrepancy
                };
            }

            // Index is fresh
            return {
                isStale: false,
                ageInDays: ageInDays.toFixed(1),
                orphanCount,
                sessionCount: actualSessionCount
            };

        } catch (error) {
            return {
                isStale: true,
                reason: 'check_failed',
                severity: 'high',
                error: error.message
            };
        }
    }

    /**
     * Clean orphaned session references from topic index
     * @returns {Promise<object>} Cleanup statistics
     */
    async cleanTopicIndexOrphans() {
        const topicIndexPath = path.join(this.memoryPath, '.topic-index.json');
        let orphansRemoved = 0;

        try {
            const content = await fs.readFile(topicIndexPath, 'utf8');
            const index = JSON.parse(content);

            for (const [topic, data] of Object.entries(index.topics || {})) {
                const validSessions = [];

                for (const session of data.sessions || []) {
                    const sessionPath = path.join(this.memoryPath, session.file);

                    // Check if session file still exists
                    if (fsSync.existsSync(sessionPath)) {
                        validSessions.push(session);
                    } else {
                        orphansRemoved++;
                        console.log(`   🗑️ Removed orphaned ref: ${topic} → ${session.file}`);
                    }
                }

                index.topics[topic].sessions = validSessions;
            }

            // Save updated index
            await fs.writeFile(topicIndexPath, JSON.stringify(index, null, 2), 'utf8');
            console.log(`   ✅ Topic index cleaned (${orphansRemoved} orphans removed)`);

            return { success: true, orphansRemoved };

        } catch (error) {
            console.warn(`   ⚠️ Topic index cleanup failed: ${error.message}`);
            return { success: false, orphansRemoved: 0, error: error.message };
        }
    }

    /**
     * Get garbage collection statistics
     * @returns {Object} GC stats including active/archived sessions and storage
     */
    async getStats() {
        try {
            const stats = {
                active_sessions: 0,
                archived_sessions: 0,
                active_bytes: 0,
                archived_bytes: 0,
                compression_ratio: 'N/A',
                ttl_days: this.ttlDays,
                oldest_session: null,
                newest_archived: null
            };

            // Count active sessions
            const sessionsPath = path.join(this.memoryPath, 'sessions');
            if (await fs.access(sessionsPath).then(() => true).catch(() => false)) {
                const sessionDirs = await fs.readdir(sessionsPath);
                let oldestDate = null;

                for (const dir of sessionDirs) {
                    const dirPath = path.join(sessionsPath, dir);
                    const dirStats = await fs.stat(dirPath);

                    if (!dirStats.isDirectory()) continue;

                    const files = await fs.readdir(dirPath);
                    for (const file of files) {
                        if (!file.endsWith('.json')) continue;

                        const filePath = path.join(dirPath, file);
                        const fileStats = await fs.stat(filePath);

                        stats.active_sessions++;
                        stats.active_bytes += fileStats.size;

                        // Track oldest session
                        if (!oldestDate || fileStats.mtime < oldestDate) {
                            oldestDate = fileStats.mtime;
                            stats.oldest_session = `${dir}/${file}`;
                        }
                    }
                }
            }

            // Count archived sessions
            if (await fs.access(this.coldStoragePath).then(() => true).catch(() => false)) {
                const archivedFiles = await fs.readdir(this.coldStoragePath);
                let newestDate = null;

                for (const file of archivedFiles) {
                    if (!file.endsWith('.gz')) continue;

                    const filePath = path.join(this.coldStoragePath, file);
                    const fileStats = await fs.stat(filePath);

                    stats.archived_sessions++;
                    stats.archived_bytes += fileStats.size;

                    // Track newest archived
                    if (!newestDate || fileStats.mtime > newestDate) {
                        newestDate = fileStats.mtime;
                        stats.newest_archived = file.replace('.gz', '');
                    }
                }
            }

            // Calculate compression ratio if we have archived sessions
            if (stats.archived_bytes > 0 && stats.archived_sessions > 0) {
                // Estimate original size (compressed is ~30% of original typically)
                const estimatedOriginalBytes = stats.archived_bytes * 3.33;
                const ratio = ((1 - stats.archived_bytes / estimatedOriginalBytes) * 100).toFixed(1);
                stats.compression_ratio = `${ratio}%`;
            }

            return stats;

        } catch (error) {
            console.warn(`⚠️ Failed to get GC stats: ${error.message}`);
            return {
                active_sessions: 0,
                archived_sessions: 0,
                active_bytes: 0,
                archived_bytes: 0,
                compression_ratio: 'N/A',
                ttl_days: this.ttlDays
            };
        }
    }
}

// Export
module.exports = { MemoryGarbageCollector };
