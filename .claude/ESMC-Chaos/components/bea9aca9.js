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
/** ESMC 3.39 AEGIS Audit | 2025-10-30 | v3.39.0 | PROD | ALL_TIERS
 *  Purpose: Execution audit logging system (modular extraction from monolith)
 *  Features: ECHELON execution capture | ATLAS evidence | Mesh intelligence logs | Performance metrics
 *  Parent: 27c20532.js (hybrid facade)
 *  Token Savings: ~114 lines extracted (saves ~1,140 tokens when not needed)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * AEGIS Audit Logger - Extracted from monolith
 *
 * This module handles execution audit logging:
 * - Capture ECHELON execution evidence
 * - Log ATLAS retrieval metrics
 * - Record mesh intelligence consensus
 * - Track colonel deployment waves
 * - Performance metrics capture
 *
 * Philosophy: "On-demand execution logging for forensic analysis"
 */
class AuditLogger {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.logsPath = path.join(this.projectRoot, '.claude', 'memory', 'documents', 'logs');
        this.version = '3.39.0';

        console.log(`📊 Audit Logger ${this.version} initialized`);
    }

    /**
     * Auto-detect project root by walking up from module location
     * @private
     */
    _findProjectRoot() {
        let current = __dirname;
        while (current !== path.dirname(current)) {
            const claudePath = path.join(current, '.claude');
            if (fsSync.existsSync(claudePath)) {
                return current;
            }
            current = path.dirname(current);
        }
        return process.cwd();
    }

    /**
     * Capture execution log during audit-triggered sessions
     * @param {object} context - Execution context from ECHELON
     * @returns {Promise<object>} Write result
     */
    async captureExecutionLog(context) {
        try {
            // Ensure logs directory exists
            await fs.mkdir(this.logsPath, { recursive: true });

            // Generate audit ID from user prompt
            const auditSlug = context.userPrompt
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .slice(0, 8)
                .join('-');

            const date = new Date().toISOString().split('T')[0];
            const filename = `${date}-${auditSlug}.json`;
            const filepath = path.join(this.logsPath, filename);

            // Build audit log structure
            const auditLog = {
                audit_id: `${date}-${auditSlug}`,
                date: new Date().toISOString(),
                trigger: 'user_keyword_audit',
                esmc_version: '3.39',
                mode: context.mode || 'full_deployment',
                user_prompt: context.userPrompt,

                execution_evidence: {
                    bootstrap_routing: {
                        phase: context.bootstrap?.phase || '-1',
                        mode_detected: context.bootstrap?.mode_detected || context.mode
                    },
                    atlas_retrieval: {
                        t1_hits: context.atlas?.t1_hits || 0,
                        t2_hits: context.atlas?.t2_hits || 0,
                        hydra_used: context.atlas?.hydra_used || false,
                        t3_hits: context.atlas?.t3_hits || 0,
                        total_sessions_queried: context.atlas?.total_sessions || 0
                    },
                    mesh_intelligence: {
                        piu: context.mesh?.piu || { analysis: 'not captured' },
                        dki: context.mesh?.dki || { standards: 'not captured' },
                        uip: context.mesh?.uip || { patterns: 'not captured' },
                        pca: context.mesh?.pca || { context: 'not captured' }
                    },
                    echelon_athena_dialogue: {
                        consensus_confidence: context.consensus?.confidence || 0,
                        gaps_detected: context.consensus?.gaps || 0,
                        athena_triggered: context.athena?.triggered || false,
                        athena_question: context.athena?.question || null,
                        echelon_response: context.athena?.echelon_response || null
                    },
                    colonel_deployment: context.colonels || {
                        wave_1: [],
                        wave_2: [],
                        wave_3: [],
                        wave_4: [],
                        wave_5: []
                    }
                },

                performance_metrics: {
                    total_time: context.performance?.total_time || 'not captured',
                    token_usage: context.performance?.token_usage || 0,
                    atlas_cascade_time: context.performance?.atlas_time || 'not captured'
                }
            };

            // Write audit log
            await fs.writeFile(filepath, JSON.stringify(auditLog, null, 2), 'utf-8');

            console.log(`📊 Audit log written: ${filename}`);

            return {
                success: true,
                filename: filename,
                filepath: filepath,
                audit_id: auditLog.audit_id
            };

        } catch (error) {
            console.error(`❌ Audit log write failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export
module.exports = { AuditLogger };
