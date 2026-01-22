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
/** ESMC 3.37 AEGIS CORE | 2025-10-30 | v1.0.0 | PROD | MAX/VIP
 *  Purpose: Shared utilities for AEGIS modular architecture
 *  Features: Project root detection | Sanitization | Common constants
 *  Philosophy: DRY principle - eliminate 250 lines of duplication across 6 classes
 */

const fsSync = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════
// AEGIS VERSION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const AEGIS_VERSION = "3.37.0";
const AEGIS_SYSTEM_NAME = "AEGIS";
const AEGIS_TIER = "MAX/VIP";

// ═══════════════════════════════════════════════════════════════════════
// PROJECT ROOT DETECTION (UNIFIED)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Auto-detect project root by walking up from module location
 * Strategy: Finds HIGHEST .claude/memory with most session files
 *
 * @param {string} [startDir=__dirname] - Starting directory for search
 * @param {object} [options={}] - Detection options
 * @param {boolean} [options.validateRegistry=false] - Require valid .memory-registry.json
 * @returns {string} Absolute path to project root
 * @throws {Error} If .claude/memory/ not found in parent directories
 *
 * @architecture ESMC 3.37 - Unified from 6 duplicate implementations
 * @precedent Based on ESMC 3.30.1 stress test findings (nested .claude prevention)
 */
function findProjectRoot(startDir = __dirname, options = {}) {
    const { validateRegistry = false } = options;

    let current = startDir;
    let bestCandidate = null;
    let maxFiles = 0;

    // Walk UP the tree and collect ALL valid candidates
    while (current !== path.dirname(current)) {
        const memoryPath = path.join(current, '.claude', 'memory');
        const sessionsPath = path.join(memoryPath, 'sessions');
        const registryPath = path.join(memoryPath, '.memory-registry.json');

        // Verify .claude/memory exists
        if (fsSync.existsSync(memoryPath)) {
            try {
                // If registry validation required (for MemoryRegistry class)
                if (validateRegistry) {
                    if (fsSync.existsSync(registryPath)) {
                        const registryContent = fsSync.readFileSync(registryPath, 'utf8');
                        const registry = JSON.parse(registryContent);

                        // Validate it's a real registry with projects (not empty test fixture)
                        if (registry.projects && Object.keys(registry.projects).length > 0) {
                            console.log(`   🎯 AEGIS Core: Auto-detected project root (registry validated): ${current}`);
                            return current;
                        }
                    }
                } else {
                    // Session-based validation (for Echo, Document, GC, Audit classes)
                    if (fsSync.existsSync(sessionsPath)) {
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
                    }
                }
            } catch (error) {
                // Invalid directory or registry, continue searching
            }
        }

        current = path.dirname(current);
    }

    // For session-based validation, return best candidate
    if (bestCandidate) {
        console.log(`   🎯 AEGIS Core: Auto-detected project root (${maxFiles} sessions): ${bestCandidate}`);
        return bestCandidate;
    }

    // Fallback error
    const errorMsg = validateRegistry
        ? 'AEGIS Core: Could not locate project root with valid .claude/memory/.memory-registry.json. Pass explicit projectRoot option.'
        : 'AEGIS Core: Could not locate project root with .claude/memory/sessions/. Pass explicit projectRoot option.';

    throw new Error(errorMsg);
}

// ═══════════════════════════════════════════════════════════════════════
// FILENAME SANITIZATION & VALIDATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Validate session filename format (SECURITY: Prevent injection attacks)
 *
 * @param {string} filename - Session filename to validate
 * @returns {boolean} True if valid format
 *
 * @security ESMC 3.9.3 - Injection prevention protocol
 * @format YYYY-MM-DD-{title}.json (lowercase, hyphens, no periods except .json)
 */
function validateSessionFilename(filename) {
    // Must match YYYY-MM-DD-{slug}.json format
    const pattern = /^20\d{2}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*\.json$/;

    if (!pattern.test(filename)) {
        console.error(`   ❌ AEGIS: Invalid filename format: ${filename}`);
        return false;
    }

    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        console.error(`   ❌ AEGIS: Path traversal detected: ${filename}`);
        return false;
    }

    // Security: Must be lowercase (case-sensitivity issues on different OS)
    if (filename !== filename.toLowerCase()) {
        console.error(`   ❌ AEGIS: Uppercase characters detected: ${filename}`);
        return false;
    }

    return true;
}

/**
 * Extract topic slug from user prompt (first 10 words, sanitized)
 *
 * @param {string} text - Raw text to extract slug from
 * @param {number} [maxWords=10] - Maximum words to include
 * @returns {string} Sanitized slug (lowercase, hyphens, alphanumeric)
 *
 * @note ESMC 3.25.1 - Periods removed to prevent filename conflicts (e.g., "3.25" → "325")
 */
function extractTopicSlug(text, maxWords = 10) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove all non-alphanumeric except spaces
        .split(/\s+/)                 // Split on whitespace
        .filter(w => w.length > 0)    // Remove empty strings
        .slice(0, maxWords)           // Take first N words
        .join('-');                   // Join with hyphens
}

/**
 * Format current date as YYYY-MM-DD
 *
 * @returns {string} Date string in YYYY-MM-DD format
 */
function formatDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format current time as HHMMSS
 *
 * @returns {string} Time string in HHMMSS format
 */
function formatTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
    // Version & Constants
    AEGIS_VERSION,
    AEGIS_SYSTEM_NAME,
    AEGIS_TIER,

    // Project Root Detection
    findProjectRoot,

    // Filename Utilities
    validateSessionFilename,
    extractTopicSlug,
    formatDate,
    formatTime
};
