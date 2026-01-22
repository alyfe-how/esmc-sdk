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
/** ESMC 3.13 ATLAS INDEX VALIDATOR | 2025-10-15 | v3.13.0 | PROD | TIER 2
 *  Purpose: P2 project index validation with auto-creation for O(1) lookups
 *  Features: Index validation | Auto-creation | Performance ↑15-40ms | O(1) lookups | Filesystem optimization
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 🎖️ ESMC 3.13 P2 - Validate ATLAS 3.13 Project Index
 * Checks if `.project-index.json` exists, creates if missing
 *
 * @param {Object} options - Validation configuration
 * @returns {Promise<Object>} Validation result
 */
async function validateProjectIndex(options = {}) {
    const projectRoot = options.projectRoot || process.cwd();
    const memoryPath = path.join(projectRoot, '.claude', 'memory');
    const indexPath = path.join(memoryPath, '.project-index.json');

    try {
        // Check if index exists
        const exists = await fileExists(indexPath);

        if (exists) {
            // Validate structure
            const content = await fs.readFile(indexPath, 'utf8');
            const index = JSON.parse(content);

            if (index.version && index.domains && index.files) {
                return {
                    exists: true,
                    valid: true,
                    domains: Object.keys(index.domains || {}).length,
                    files: Object.keys(index.files || {}).length,
                    message: 'ATLAS index valid'
                };
            } else {
                // Invalid structure - rebuild
                console.warn(`   ⚠️ ATLAS index corrupted, rebuilding...`);
                return await buildProjectIndex(projectRoot, memoryPath);
            }
        } else {
            // Create index
            console.log(`   📝 ATLAS index missing, creating...`);
            return await buildProjectIndex(projectRoot, memoryPath);
        }

    } catch (error) {
        console.error(`   ❌ ATLAS index validation failed: ${error.message}`);
        return {
            exists: false,
            valid: false,
            error: error.message
        };
    }
}

/**
 * Build project index from scratch
 * @private
 */
async function buildProjectIndex(projectRoot, memoryPath) {
    const startTime = Date.now();

    try {
        // Scan project structure
        const domains = await discoverDomains(projectRoot);
        const files = await mapProjectFiles(projectRoot);

        const index = {
            version: "3.13.0",
            system: "ATLAS",
            created: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            project_root: projectRoot,

            domains: domains,
            files: files,

            metadata: {
                total_domains: Object.keys(domains).length,
                total_files: Object.keys(files).length,
                build_time_ms: Date.now() - startTime
            }
        };

        // Save index
        const indexPath = path.join(memoryPath, '.project-index.json');
        await fs.mkdir(memoryPath, { recursive: true });
        await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');

        console.log(`   ✅ ATLAS index created (${index.metadata.total_files} files, ${Date.now() - startTime}ms)`);

        return {
            exists: true,
            valid: true,
            domains: Object.keys(domains).length,
            files: Object.keys(files).length,
            created: true,
            buildTime: Date.now() - startTime
        };

    } catch (error) {
        console.error(`   ❌ ATLAS index build failed: ${error.message}`);
        return {
            exists: false,
            valid: false,
            error: error.message
        };
    }
}

/**
 * Discover domain structure
 * @private
 */
async function discoverDomains(projectRoot) {
    const domains = {};

    // Common domain patterns
    const domainPaths = [
        { name: 'esmc-core', path: '.claude/ESMC Complete' },
        { name: 'memory', path: '.claude/memory' },
        { name: 'src', path: 'src' },
        { name: 'tests', path: 'tests' },
        { name: 'config', path: 'config' }
    ];

    for (const domain of domainPaths) {
        const fullPath = path.join(projectRoot, domain.path);
        const exists = await directoryExists(fullPath);

        if (exists) {
            domains[domain.name] = {
                path: domain.path,
                fullPath: fullPath,
                discovered: new Date().toISOString()
            };
        }
    }

    return domains;
}

/**
 * Map project files for fast lookup
 * @private
 */
async function mapProjectFiles(projectRoot) {
    const files = {};
    const { glob } = require('glob');

    try {
        // Scan relevant project files (exclude node_modules, .git, etc.)
        const patterns = [
            '.claude/**/*.{js,json,md,sql}',
            'src/**/*.{js,ts,jsx,tsx,json,md}',
            'tests/**/*.{js,ts,jsx,tsx}',
            'config/**/*.{js,json,yaml,yml}',
            '*.{js,json,md}'
        ];

        const ignore = [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**',
            '**/coverage/**'
        ];

        for (const pattern of patterns) {
            const matches = await glob(pattern, {
                cwd: projectRoot,
                ignore,
                nodir: true,
                absolute: false
            });

            for (const relativePath of matches) {
                const absolutePath = path.join(projectRoot, relativePath);
                const fileKey = relativePath.replace(/\\/g, '/'); // Normalize to forward slashes

                try {
                    const stats = await fs.stat(absolutePath);
                    files[fileKey] = {
                        path: absolutePath,
                        relativePath: fileKey,
                        size: stats.size,
                        lastModified: stats.mtime.toISOString(),
                        indexed: new Date().toISOString()
                    };
                } catch (err) {
                    // Skip files that can't be stat'd
                    continue;
                }
            }
        }

        return files;

    } catch (error) {
        console.warn(`   ⚠️ File mapping error: ${error.message}`);
        return files; // Return partial results
    }
}

/**
 * Helper: Check if file exists
 * @private
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Helper: Check if directory exists
 * @private
 */
async function directoryExists(dirPath) {
    try {
        const stat = await fs.stat(dirPath);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

module.exports = {
    validateProjectIndex
};

// Auto-validate if run as main module (for testing)
if (require.main === module) {
    (async () => {
        console.log("🎖️ ESMC 3.13 - ATLAS Index Validator Test\n");
        const result = await validateProjectIndex();
        console.log("\n📊 Result:", JSON.stringify(result, null, 2));
    })();
}
