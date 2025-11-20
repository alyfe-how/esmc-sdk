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
/** ESMC 3.9 CODEBASE PATTERN SCANNER | 2025-10-13 | v3.9.0 | PROD | TIER 2
 *  Purpose: ATLAS pattern recognition scanning project files and backup folders
 *  Features: File scanning | Backup analysis | Pattern detection | Implementation discovery | ATLAS intelligence family
 *  ✅ Analyzes backup folders (YYYYMMDD HHMM Backup pattern)
 *  ✅ Detects pattern viability (stable vs. fixed)
 *  ✅ Extracts pattern metadata (age, status, location)
 *  ✅ Searches by keywords for relevant implementations
 */

const fs = require('fs').promises;
const path = require('path');

class CodebasePatternScanner {
    constructor(options = {}) {
        this.version = "3.9.0";
        this.projectRoot = options.projectRoot || process.cwd();
        this.scanDepth = options.scanDepth || 5; // Max directory depth
        this.excludePaths = options.excludePaths || [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.next',
            'out'
        ];

        console.log(`🔍 Codebase Pattern Scanner ${this.version} initialized`);
    }

    /**
     * Main entry point: Scan for patterns matching keywords
     * @param {Array} keywords - Keywords from KeywordExtractor
     * @param {Object} options - Scan options
     * @returns {Object} Found patterns (current + historical)
     */
    async scanForPatterns(keywords, options = {}) {
        console.log(`\n🔍 ATLAS Pattern: Scanning for existing patterns...`);
        console.log(`   Keywords: ${keywords.primaryKeywords?.map(k => k.keyword).join(', ') || 'None'}`);

        const startTime = Date.now();

        try {
            // Extract search terms from keywords
            const searchTerms = this._extractSearchTerms(keywords);
            console.log(`   Search terms: ${searchTerms.join(', ')}`);

            // Scan current project files
            const currentImplementations = await this._scanProjectFiles(searchTerms);

            // Scan backup folders
            const backupImplementations = await this._scanBackupFolders(searchTerms);

            const scanTime = Date.now() - startTime;

            const result = {
                currentImplementations,
                backupImplementations,
                totalFound: currentImplementations.length + backupImplementations.length,
                scanTime,
                searchTerms,
                timestamp: new Date().toISOString()
            };

            console.log(`✅ ATLAS Pattern: Scan complete in ${scanTime}ms`);
            console.log(`   Current implementations: ${currentImplementations.length}`);
            console.log(`   Backup implementations: ${backupImplementations.length}`);

            return result;

        } catch (error) {
            console.error(`❌ ATLAS Pattern: Pattern scan failed - ${error.message}`);
            return {
                currentImplementations: [],
                backupImplementations: [],
                totalFound: 0,
                scanTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    /**
     * Extract search terms from keyword extraction results
     * @private
     */
    _extractSearchTerms(keywords) {
        const terms = new Set();

        // Add primary keywords
        if (keywords.primaryKeywords) {
            keywords.primaryKeywords.forEach(k => {
                terms.add(k.keyword.toLowerCase());
            });
        }

        // Add entity keywords
        if (keywords.entityKeywords) {
            keywords.entityKeywords.forEach(e => {
                terms.add(e.entity.toLowerCase());
            });
        }

        // Add technology keywords
        if (keywords.technologyKeywords) {
            keywords.technologyKeywords.forEach(t => {
                terms.add(t.technology.toLowerCase());
            });
        }

        // Add domain keywords
        if (keywords.domainKeywords) {
            keywords.domainKeywords.forEach(d => {
                terms.add(d.domain.toLowerCase());
            });
        }

        return Array.from(terms);
    }

    /**
     * Scan current project files for pattern matches
     * @private
     */
    async _scanProjectFiles(searchTerms) {
        const implementations = [];

        try {
            const files = await this._getAllProjectFiles(this.projectRoot);

            for (const filePath of files) {
                const matches = await this._checkFileForPatterns(filePath, searchTerms);
                if (matches.length > 0) {
                    const stats = await fs.stat(filePath);
                    implementations.push({
                        type: 'current',
                        filePath: path.relative(this.projectRoot, filePath),
                        absolutePath: filePath,
                        matches,
                        lastModified: stats.mtime,
                        ageInDays: Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)),
                        size: stats.size
                    });
                }
            }

        } catch (error) {
            console.warn(`⚠️ Project file scan limited: ${error.message}`);
        }

        return implementations;
    }

    /**
     * Scan backup folders for pattern matches
     * @private
     */
    async _scanBackupFolders(searchTerms) {
        const backups = [];

        try {
            const entries = await fs.readdir(this.projectRoot, { withFileTypes: true });

            for (const entry of entries) {
                if (!entry.isDirectory()) continue;

                // Check if directory matches backup pattern: YYYYMMDD HHMM Backup ...
                const backupMatch = this._parseBackupFolderName(entry.name, searchTerms);
                if (backupMatch) {
                    const backupPath = path.join(this.projectRoot, entry.name);
                    const stats = await fs.stat(backupPath);

                    backups.push({
                        type: 'backup',
                        folderName: entry.name,
                        folderPath: backupPath,
                        ...backupMatch,
                        lastModified: stats.mtime,
                        ageInDays: backupMatch.ageInDays,
                        hasSubsequentFix: await this._hasSubsequentFix(entry.name, searchTerms, entries)
                    });
                }
            }

        } catch (error) {
            console.warn(`⚠️ Backup folder scan limited: ${error.message}`);
        }

        return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * Parse backup folder name and check for keyword matches
     * @private
     */
    _parseBackupFolderName(folderName, searchTerms) {
        // Pattern: YYYYMMDD HHMM Backup {Description}
        const match = folderName.match(/^(\d{4})(\d{2})(\d{2})\s+(\d{2})(\d{2})\s+(.+)$/);
        if (!match) return null;

        const [, year, month, day, hour, minute, description] = match;
        const timestamp = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
        );

        const descLower = description.toLowerCase();

        // Check if description contains any search terms
        const matchedTerms = searchTerms.filter(term => descLower.includes(term));
        if (matchedTerms.length === 0) return null;

        // Determine type (Backup, Fix, Platform, etc.)
        const type = this._inferBackupType(description);

        return {
            timestamp,
            description,
            matchedTerms,
            backupType: type,
            ageInDays: Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24))
        };
    }

    /**
     * Infer backup type from description
     * @private
     */
    _inferBackupType(description) {
        if (description.match(/^Fix\s+/i)) return 'FIX';
        if (description.match(/^Backup\s+FULL/i)) return 'FULL';
        if (description.match(/^Backup\s+/i)) return 'COMPONENT';
        if (description.match(/^platform-/i)) return 'PLATFORM';
        return 'UNKNOWN';
    }

    /**
     * Check if a subsequent "Fix" backup exists for the same pattern
     * @private
     */
    async _hasSubsequentFix(backupFolder, searchTerms, allEntries) {
        const backupDate = this._extractDateFromBackupName(backupFolder);
        if (!backupDate) return false;

        // Look for any backup AFTER this one that mentions "Fix" + same keywords
        for (const entry of allEntries) {
            if (!entry.isDirectory()) continue;

            const otherDate = this._extractDateFromBackupName(entry.name);
            if (!otherDate || otherDate <= backupDate) continue;

            // Check if it's a "Fix" for the same keywords
            if (entry.name.toLowerCase().includes('fix')) {
                const descLower = entry.name.toLowerCase();
                const hasMatchingTerms = searchTerms.some(term => descLower.includes(term));
                if (hasMatchingTerms) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Extract date from backup folder name
     * @private
     */
    _extractDateFromBackupName(folderName) {
        const match = folderName.match(/^(\d{4})(\d{2})(\d{2})\s+(\d{2})(\d{2})/);
        if (!match) return null;

        const [, year, month, day, hour, minute] = match;
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
        );
    }

    /**
     * Get all project files (respecting excludePaths and depth)
     * @private
     */
    async _getAllProjectFiles(dir, currentDepth = 0) {
        if (currentDepth > this.scanDepth) return [];

        const files = [];

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                // Skip excluded paths
                if (this.excludePaths.includes(entry.name)) continue;

                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    const subFiles = await this._getAllProjectFiles(fullPath, currentDepth + 1);
                    files.push(...subFiles);
                } else if (this._isCodeFile(entry.name)) {
                    files.push(fullPath);
                }
            }

        } catch (error) {
            // Skip directories we can't read
        }

        return files;
    }

    /**
     * Check if file is a code file we should scan
     * @private
     */
    _isCodeFile(filename) {
        const codeExtensions = [
            '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs',
            '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.rb', '.swift'
        ];

        return codeExtensions.some(ext => filename.endsWith(ext));
    }

    /**
     * Check file content for pattern matches
     * @private
     */
    async _checkFileForPatterns(filePath, searchTerms) {
        const matches = [];

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const contentLower = content.toLowerCase();

            for (const term of searchTerms) {
                // Count occurrences
                const regex = new RegExp(term, 'gi');
                const termMatches = content.match(regex);

                if (termMatches && termMatches.length > 0) {
                    matches.push({
                        term,
                        occurrences: termMatches.length,
                        relevance: this._calculateRelevance(term, termMatches.length, content.length)
                    });
                }
            }

        } catch (error) {
            // Skip files we can't read
        }

        return matches;
    }

    /**
     * Calculate pattern relevance score
     * @private
     */
    _calculateRelevance(term, occurrences, fileSize) {
        // Higher score for more occurrences, normalized by file size
        const density = occurrences / (fileSize / 1000); // Per KB
        return Math.min(1.0, density * 0.1);
    }

    /**
     * Get scanner status
     */
    getStatus() {
        return {
            version: this.version,
            projectRoot: this.projectRoot,
            scanDepth: this.scanDepth,
            excludePaths: this.excludePaths,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { CodebasePatternScanner };

// Example usage
if (require.main === module) {
    console.log("🔍 ESMC 3.9 - Codebase Pattern Scanner Test");

    (async () => {
        const scanner = new CodebasePatternScanner();

        // Test with sample keywords
        const testKeywords = {
            primaryKeywords: [
                { keyword: 'authentication', weight: 1.0 },
                { keyword: 'oauth2', weight: 0.9 }
            ],
            entityKeywords: [],
            technologyKeywords: [
                { technology: 'passport', category: 'authentication' }
            ],
            domainKeywords: []
        };

        const result = await scanner.scanForPatterns(testKeywords);

        console.log("\n📊 SCAN RESULTS:");
        console.log(`   Total patterns found: ${result.totalFound}`);
        console.log(`   Current implementations: ${result.currentImplementations.length}`);
        console.log(`   Backup implementations: ${result.backupImplementations.length}`);
        console.log(`   Scan time: ${result.scanTime}ms`);

        if (result.backupImplementations.length > 0) {
            console.log("\n📁 BACKUP IMPLEMENTATIONS:");
            result.backupImplementations.slice(0, 5).forEach((backup, i) => {
                console.log(`   ${i + 1}. ${backup.folderName}`);
                console.log(`      Age: ${backup.ageInDays} days | Type: ${backup.backupType}`);
                console.log(`      Has subsequent fix: ${backup.hasSubsequentFix ? '⚠️ Yes' : '✅ No'}`);
            });
        }

        console.log("\n✅ Pattern scanner test completed");

    })();
}
