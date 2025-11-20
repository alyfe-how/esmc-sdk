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
/** ESMC 3.41 WARMTH OPTIMIZER | 2025-10-31 | v1.0.0 | PROD | ALL_TIERS
 *  Purpose: 3-phase code optimization - removes noise, compresses technical content, preserves warmth
 *  Features: ASCII art removal | JSDoc compression | Console.log standardization | Philosophy preservation | ATHENA dialogue protection
 */

const fs = require('fs').promises;
const path = require('path');

class WarmthPreservingOptimizer {
    constructor() {
        this.version = "1.0.0";
        this.stats = {
            filesProcessed: 0,
            tokensSaved: 0,
            warmthPreserved: 0,
            phase1Removals: 0,
            phase2Compressions: 0,
            phase3Audits: 0
        };

        // Warmth preservation patterns
        this.warmthPatterns = [
            /philosophy/i,
            /athena/i,
            /metaphor/i,
            /wisdom/i,
            /strategic/i,
            /warmth/i,
            /heart/i,
            /soul/i
        ];
    }

    /**
     * Phase 1: Safe Removal - Remove decorative noise
     */
    phase1SafeRemoval(content) {
        let modified = content;
        let removals = 0;

        // Remove ASCII art decorations (═══╔╗║╚╝─)
        const asciiArtPatterns = [
            /^\/\/ ═+.*$/gm,
            /^\/\/ ╔═+╗.*$/gm,
            /^\/\/ ║.*║.*$/gm,
            /^\/\/ ╚═+╝.*$/gm,
            /^\/\/ ─+.*$/gm,
            /^\/\/ \*\*\*+.*$/gm,
            /^\/\/ ━+.*$/gm
        ];

        asciiArtPatterns.forEach(pattern => {
            const matches = modified.match(pattern);
            if (matches) {
                removals += matches.length;
                modified = modified.replace(pattern, '');
            }
        });

        // Remove empty JSDoc @param/@returns blocks (keep 1-line versions)
        modified = modified.replace(/\/\*\*\n( \* @param \{[^}]+\} \w+ - [^\n]+\n)+( \* @returns \{[^}]+\} [^\n]+\n)? \*\/\n/g, (match) => {
            // Keep if it's complex (>3 params or has important info)
            const paramCount = (match.match(/@param/g) || []).length;
            if (paramCount <= 3) {
                removals++;
                return '';
            }
            return match;
        });

        // Compress verbose console.log patterns
        modified = modified.replace(/console\.log\(`\s*([^`]{100,})\s*`\)/g, (match, msg) => {
            removals++;
            const compressed = msg.substring(0, 60) + '...';
            return `console.log(\`${compressed}\`)`;
        });

        this.stats.phase1Removals += removals;
        return modified;
    }

    /**
     * Phase 2: Compression - Shorten technical content (keep meaning)
     */
    phase2Compression(content) {
        let modified = content;
        let compressions = 0;

        // Compress feature descriptions (50% reduction target)
        modified = modified.replace(/\/\/ Feature: ([^\n]{80,})/g, (match, desc) => {
            compressions++;
            const words = desc.split(' ');
            const compressed = words.slice(0, Math.ceil(words.length * 0.5)).join(' ');
            return `// Feature: ${compressed}`;
        });

        // Shorten error messages (keep clarity)
        modified = modified.replace(/throw new Error\(`([^`]{60,})`\)/g, (match, msg) => {
            compressions++;
            const shortened = msg.split('.')[0]; // Keep first sentence
            return `throw new Error(\`${shortened}\`)`;
        });

        // Abbreviate implementation notes
        modified = modified.replace(/\/\/ Implementation note: ([^\n]{80,})/gi, (match, note) => {
            compressions++;
            const abbreviated = note.substring(0, 50) + '...';
            return `// Note: ${abbreviated}`;
        });

        this.stats.phase2Compressions += compressions;
        return modified;
    }

    /**
     * Phase 3: Warmth Audit - Verify philosophy/ATHENA/metaphors intact
     */
    phase3WarmthAudit(originalContent, modifiedContent) {
        let warmthScore = 100;
        const findings = [];

        // Check for warmth pattern preservation
        this.warmthPatterns.forEach(pattern => {
            const originalMatches = (originalContent.match(pattern) || []).length;
            const modifiedMatches = (modifiedContent.match(pattern) || []).length;

            if (modifiedMatches < originalMatches) {
                warmthScore -= 10;
                findings.push(`⚠️  WARMTH LOSS: '${pattern}' reduced from ${originalMatches} to ${modifiedMatches}`);
            }
        });

        // Check for ATHENA dialogue preservation
        const athenaDialoguePattern = /ATHENA:|🗣️.*ATHENA/gi;
        const originalAthena = (originalContent.match(athenaDialoguePattern) || []).length;
        const modifiedAthena = (modifiedContent.match(athenaDialoguePattern) || []).length;

        if (modifiedAthena < originalAthena) {
            warmthScore -= 30;
            findings.push(`🔴 CRITICAL: ATHENA dialogue reduced from ${originalAthena} to ${modifiedAthena}`);
        }

        // Check for philosophy statements
        const philosophyPattern = /\/\/ Philosophy:|\/\*\* Philosophy:/gi;
        const originalPhil = (originalContent.match(philosophyPattern) || []).length;
        const modifiedPhil = (modifiedContent.match(philosophyPattern) || []).length;

        if (modifiedPhil < originalPhil) {
            warmthScore -= 20;
            findings.push(`🔴 CRITICAL: Philosophy statements reduced from ${originalPhil} to ${modifiedPhil}`);
        }

        this.stats.warmthPreserved += warmthScore;
        return { warmthScore, findings };
    }

    /**
     * Optimize a single file
     */
    async optimizeFile(filePath) {
        try {
            const originalContent = await fs.readFile(filePath, 'utf8');
            const originalTokens = this.estimateTokens(originalContent);

            // Execute 3 phases
            let optimized = this.phase1SafeRemoval(originalContent);
            optimized = this.phase2Compression(optimized);

            // Audit warmth preservation
            const audit = this.phase3WarmthAudit(originalContent, optimized);

            // Only apply if warmth score >= 90%
            if (audit.warmthScore >= 90) {
                await fs.writeFile(filePath, optimized, 'utf8');

                const optimizedTokens = this.estimateTokens(optimized);
                const saved = originalTokens - optimizedTokens;

                this.stats.filesProcessed++;
                this.stats.tokensSaved += saved;
                this.stats.phase3Audits++;

                return {
                    success: true,
                    file: path.basename(filePath),
                    originalTokens,
                    optimizedTokens,
                    saved,
                    warmthScore: audit.warmthScore,
                    findings: audit.findings
                };
            } else {
                return {
                    success: false,
                    file: path.basename(filePath),
                    reason: `Warmth score ${audit.warmthScore}% < 90% threshold`,
                    findings: audit.findings
                };
            }
        } catch (error) {
            return {
                success: false,
                file: path.basename(filePath),
                error: error.message
            };
        }
    }

    /**
     * Estimate token count (rough approximation)
     */
    estimateTokens(content) {
        // Rough estimate: 1 token ≈ 4 characters
        return Math.ceil(content.length / 4);
    }

    /**
     * Process all core files
     */
    async optimizeAllCoreFiles() {
        const coreDir = path.join(__dirname);
        const files = await fs.readdir(coreDir);
        const jsFiles = files.filter(f => f.endsWith('.js') && f !== '9db3dcd7.js');

        console.log(`\n🎖️ ESMC 3.41 - Warmth-Preserving Optimization`);
        console.log(`   Processing ${jsFiles.length} JavaScript files...\n`);

        const results = [];
        for (const file of jsFiles) {
            const filePath = path.join(coreDir, file);
            const result = await this.optimizeFile(filePath);
            results.push(result);

            if (result.success) {
                console.log(`✅ ${result.file}: ${result.saved} tokens saved (warmth: ${result.warmthScore}%)`);
            } else {
                console.log(`⚠️  ${result.file}: ${result.reason || result.error}`);
            }

            if (result.findings && result.findings.length > 0) {
                result.findings.forEach(f => console.log(`   ${f}`));
            }
        }

        // Summary report
        console.log(`\n📊 OPTIMIZATION SUMMARY`);
        console.log(`   Files processed: ${this.stats.filesProcessed}/${jsFiles.length}`);
        console.log(`   Total tokens saved: ${this.stats.tokensSaved}`);
        console.log(`   Avg warmth score: ${(this.stats.warmthPreserved / this.stats.phase3Audits).toFixed(1)}%`);
        console.log(`   Phase 1 removals: ${this.stats.phase1Removals}`);
        console.log(`   Phase 2 compressions: ${this.stats.phase2Compressions}`);
        console.log(`   Phase 3 audits: ${this.stats.phase3Audits}`);

        return results;
    }
}

// Execute if run directly
if (require.main === module) {
    const optimizer = new WarmthPreservingOptimizer();
    optimizer.optimizeAllCoreFiles()
        .then(results => {
            const successCount = results.filter(r => r.success).length;
            console.log(`\n✅ Optimization complete: ${successCount}/${results.length} files optimized`);
            process.exit(0);
        })
        .catch(error => {
            console.error(`\n❌ Optimization failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = { WarmthPreservingOptimizer };
