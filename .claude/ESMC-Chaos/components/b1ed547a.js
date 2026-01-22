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
/** ESMC 3.38 AEGIS Write | 2025-10-30 | v3.38.0 | PROD | ALL_TIERS
 *  Purpose: Document writing system (modular extraction from monolith)
 *  Features: Document creation | BRIEF writing | AEGIS header formatting | Document indexing
 *  Parent: esmc-3.37-aegis-memory-system.js (hybrid facade)
 *  Token Savings: ~250 lines extracted (saves ~2,500 tokens when not needed)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * AEGIS Document Writing System - Extracted from DocumentWriter
 *
 * This module handles document creation operations:
 * - Writing documents with AEGIS formatting
 * - BRIEF file creation
 * - Document header formatting
 * - Document index updates
 *
 * Philosophy: "AEGIS is tactical executor, not strategic author"
 */
class DocumentWriting {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude', 'memory');
        this.documentsPath = path.join(this.memoryPath, 'documents');
        this.indexPath = path.join(this.memoryPath, '.document-index.json');

        // Ensure documents directory exists
        if (!fsSync.existsSync(this.documentsPath)) {
            fsSync.mkdirSync(this.documentsPath, { recursive: true });
        }
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
            return bestCandidate;
        }

        throw new Error('DocumentWriter: Could not locate project root with .claude/memory/sessions/. Pass explicit projectRoot option.');
    }

    /**
     * Format date as YYYY-MM-DD
     */
    _formatDate(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Generate slug from title (kebab-case, max 50 chars)
     */
    _generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }

    /**
     * Write document with proper AEGIS formatting
     *
     * @param {Object} options - Document options
     * @param {string} options.title - Document title
     * @param {string} options.content - Document markdown content
     * @param {string} options.category - Category (audit-report, implementation, architecture, etc.)
     * @param {Object} options.metadata - Additional metadata (author, version, status, etc.)
     * @returns {Promise<Object>} Result with filename and path
     */
    async writeDocument(options = {}) {
        const {
            title,
            content,
            category = 'general',
            metadata = {}
        } = options;

        if (!title || !content) {
            throw new Error('AEGIS DocumentWriter: title and content are required');
        }

        console.log(`\n📝 AEGIS Document Writer: Creating "${title}"...`);

        // Generate filename: YYYY-MM-DD-title-slug-category.md
        const datestamp = this._formatDate();
        const slug = this._generateSlug(title);
        const filename = `${datestamp}-${slug}-${category}.md`;

        // Determine subdirectory based on category
        const categoryDirs = {
            'audit-report': 'audit-reports',
            'implementation': 'architecture',
            'architecture': 'architecture',
            'test-report': 'audit-reports',
            'deployment': 'deployment',
            'memory-system': 'memory-system',
            'general': ''
        };

        const subdir = categoryDirs[category] || '';
        const docDir = subdir ? path.join(this.documentsPath, subdir) : this.documentsPath;

        // Ensure subdirectory exists
        if (!fsSync.existsSync(docDir)) {
            fsSync.mkdirSync(docDir, { recursive: true });
        }

        const filepath = path.join(docDir, filename);

        // Add AEGIS header to content
        const aegisContent = this._formatDocumentWithHeader(title, content, metadata);

        // Write document
        await fs.writeFile(filepath, aegisContent, 'utf8');

        // Update document index
        await this._updateDocumentIndex({
            filename,
            filepath,
            title,
            category,
            datestamp,
            metadata
        });

        console.log(`✅ AEGIS: Document written → ${filepath}`);
        console.log(`📇 AEGIS: Index updated`);

        return {
            success: true,
            filename,
            filepath,
            category,
            relativePath: path.relative(this.projectRoot, filepath)
        };
    }

    /**
     * Write Project BRIEF - AEGIS executes file write (authored by ECHELON)
     *
     * Architecture (ESMC 3.30):
     * - ECHELON = Strategic narrator (authored the BRIEF)
     * - PCA = Structural intelligence provider (provided codebase data)
     * - AEGIS = Executor (writes file) ← THIS METHOD
     *
     * @param {Object} options - Write options
     * @param {Object} options.brief - BRIEF JSON structure (from ECHELON.synthesizeBrief())
     * @param {Object} options.metadata - Additional metadata
     * @returns {Promise<Object>} Result with success status and filepath
     */
    async writeBrief({ brief, metadata = {} }) {
        if (!brief || !brief.project_name) {
            throw new Error('AEGIS BriefWriter: valid brief object with project_name is required');
        }

        console.log(`\n📝 AEGIS: Writing BRIEF for "${brief.project_name}"...`);

        try {
            // BRIEF file location (fixed path)
            const briefPath = path.join(this.memoryPath, '.project-brief.json');

            // Update metadata to reflect AEGIS execution
            brief.metadata = {
                ...brief.metadata,
                ...metadata,
                executed_by: 'AEGIS',
                execution_timestamp: new Date().toISOString()
            };

            // Write BRIEF file (pretty-printed JSON)
            await fs.writeFile(
                briefPath,
                JSON.stringify(brief, null, 2),
                'utf-8'
            );

            console.log(`✅ AEGIS: BRIEF written → ${briefPath}`);
            console.log(`📊 AEGIS: Token estimate: ~${brief.metadata.token_size_estimate} tokens`);
            console.log(`📝 AEGIS: Authored by: ${brief.metadata.author}`);

            return {
                success: true,
                filepath: briefPath,
                relativePath: path.relative(this.projectRoot, briefPath),
                token_estimate: brief.metadata.token_size_estimate,
                author: brief.metadata.author,
                project_name: brief.project_name
            };

        } catch (error) {
            console.error(`❌ AEGIS: BRIEF write failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Format document with AEGIS official header
     * @private
     */
    _formatDocumentWithHeader(title, content, metadata) {
        const datestamp = this._formatDate();
        const header = `<!--
═══════════════════════════════════════════════════════════════════════
AEGIS OFFICIAL DOCUMENTATION
═══════════════════════════════════════════════════════════════════════
Document: ${title}
Date: ${datestamp}
Author: AEGIS (Adaptive Empirical Guardian Intelligence System)
Version: ${metadata.version || 'N/A'}
Status: ${metadata.status || 'Complete'}
Category: ${metadata.category || 'General'}
═══════════════════════════════════════════════════════════════════════
-->

${content}

---

**Document Metadata:**
- Generated by: AEGIS Document Writer (ESMC 3.38)
- Date: ${datestamp}
- Location: \`.claude/memory/documents/\`
- Authority: AEGIS (Official Documentation System)
`;

        return header;
    }

    /**
     * Update document index (.document-index.json)
     * @private
     */
    async _updateDocumentIndex(docInfo) {
        let index = { documents: [], last_updated: null };

        // Load existing index
        if (fsSync.existsSync(this.indexPath)) {
            try {
                const indexContent = await fs.readFile(this.indexPath, 'utf8');
                index = JSON.parse(indexContent);
            } catch (error) {
                console.warn(`⚠️ AEGIS: Could not read index, creating new: ${error.message}`);
            }
        }

        // Add/update document entry
        const existingIndex = index.documents.findIndex(d => d.filename === docInfo.filename);

        const entry = {
            filename: docInfo.filename,
            title: docInfo.title,
            category: docInfo.category,
            datestamp: docInfo.datestamp,
            filepath: docInfo.filepath,
            metadata: docInfo.metadata,
            created: docInfo.datestamp,
            last_modified: this._formatDate()
        };

        if (existingIndex >= 0) {
            index.documents[existingIndex] = entry;
        } else {
            index.documents.push(entry);
        }

        index.last_updated = this._formatDate();

        // Write index
        await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2), 'utf8');
    }
}

// Export
module.exports = { DocumentWriting };
