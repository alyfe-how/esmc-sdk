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
/** ESMC 3.37 AEGIS ECHO | 2025-10-30 | v1.0.0 | PROD | MAX/VIP
 *  Purpose: ECHO checkpoint system - current conversation context capture
 *  Features: Auto-creation | Counter-based tracking | Parallel ATLAS integration | Post-compact recovery
 *  Philosophy: ECHO (current work) = Session (past work) - both weighted equally
 *  Token Budget: ~9,800 tokens (74.2% savings vs monolith)
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { findProjectRoot, formatDate, formatTime, extractTopicSlug } = require('./aegis-core');

// ═══════════════════════════════════════════════════════════════════════
// ECHO MANAGER - CURRENT CONVERSATION CONTEXT (v3.0)
// ═══════════════════════════════════════════════════════════════════════

/**
 * EchoManager - Current Conversation Memory Layer
 *
 * Architecture: ECHO is parallel to Sessions (context parity principle)
 * - Session files = PAST conversations (.claude/memory/sessions/)
 * - ECHO files = CURRENT conversation (.claude/memory/echo/)
 * - Retrieval weight: ECHO context = EQUALLY IMPORTANT as session context
 * - Integration: ECHO retrieved FIRST (PHASE 0.0), then sessions (TIER 1)
 *
 * v3.0 Features:
 * - Session-aligned filename format (YYYY-MM-DD-slug-HHMMSS-counter.json)
 * - Counter tracks compaction history (-0, -1, -2...)
 * - ATLAS T1 integration for automatic retrieval
 * - Multi-window safe with compact tracking
 * - Context parity with session files (ECHO weight = Session weight)
 */
class EchoManager {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || findProjectRoot();
        this.memoryPath = path.join(this.projectRoot, '.claude/memory');
        this.echoDir = path.join(this.memoryPath, 'echo');

        // Ensure echo directory exists
        if (!fsSync.existsSync(this.echoDir)) {
            fsSync.mkdirSync(this.echoDir, { recursive: true });
        }
    }

    /**
     * Create ECHO snapshot on first user message
     * @param {object} options - Creation options
     * @param {string} options.firstPrompt - User's first message
     * @param {object} options.context - Initial context (optional)
     * @returns {Promise<object>} Created ECHO metadata
     */
    async createEchoOnFirstMessage(options = {}) {
        try {
            const { firstPrompt, context = {} } = options;

            if (!firstPrompt) {
                throw new Error('firstPrompt is required');
            }

            const now = new Date();
            const topicSlug = extractTopicSlug(firstPrompt);
            const date = formatDate();
            const time = formatTime();

            // v3.0: Session-aligned format with counter
            const filename = `${date}-${topicSlug}-${time}-0.json`;
            const filepath = path.join(this.echoDir, filename);

            // Check if file already exists (idempotent - don't recreate)
            if (fsSync.existsSync(filepath)) {
                console.log(`   📸 [Skip] ECHO already exists: ${filename}`);
                const existing = JSON.parse(await fs.readFile(filepath, 'utf8'));
                return {
                    success: true,
                    filename,
                    echo_id: existing.echo_id,
                    created: false
                };
            }

            // Build initial snapshot
            const snapshot = {
                echo_id: `${date}-${topicSlug}-${time}`,
                echo_version: '3.0.0',
                created_at: now.toISOString(),
                last_updated: now.toISOString(),
                trigger: 'auto_first_message',
                first_prompt: firstPrompt,
                topic_slug: topicSlug,

                compact_counter: 0,
                compact_history: [
                    {
                        compact_num: 0,
                        timestamp: now.toISOString(),
                        trigger: 'auto_first_message',
                        tokens_before: 0,
                        tokens_after: context.estimated_tokens || 500
                    }
                ],

                context_metrics: {
                    estimated_tokens: context.estimated_tokens || 500,
                    message_count: context.message_count || 1,
                    conversation_duration_minutes: 0,
                    files_modified: 0
                },

                esmc_state: {
                    version: context.esmc_version || '3.37',
                    mode: context.mode || 'lightweight',
                    manifests_loaded: context.manifests_loaded || ['8e80df94.md', 'BRAIN.md']
                },

                conversation_state: {
                    current_task: context.current_task || 'Starting conversation',
                    todo_list: context.todo_list || [],
                    files_modified: context.files_modified || [],
                    key_decisions: context.key_decisions || []
                },

                recovery_metadata: {
                    last_memory_retrieval: context.last_memory_retrieval || null,
                    active_project: context.active_project || null,
                    conversation_context: context.conversation_context || `User started conversation: ${firstPrompt}`,
                    protocols_to_reload: context.protocols_to_reload || ['8e80df94.md', 'BRAIN.md']
                }
            };

            // Atomic write
            await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2), 'utf8');
            console.log(`   📸 ECHO created: ${filename}`);

            return {
                success: true,
                filename,
                echo_id: snapshot.echo_id,
                created: true
            };

        } catch (error) {
            console.error(`   ❌ ECHO creation failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Increment ECHO compact counter (on /compact or auto-compact detection)
     * @param {string} currentFilename - Current ECHO filename (optional - auto-detects today's file)
     * @returns {Promise<object>} Updated ECHO metadata
     */
    async incrementEchoCounter(currentFilename = null) {
        try {
            // Auto-detect today's ECHO if not provided
            if (!currentFilename) {
                const todayContext = await this.retrieveEchoContext();
                if (!todayContext) {
                    throw new Error('No ECHO file found for today');
                }
                currentFilename = todayContext.filename;
            }

            const currentPath = path.join(this.echoDir, currentFilename);

            // Read current ECHO
            const echoContent = await fs.readFile(currentPath, 'utf8');
            const echo = JSON.parse(echoContent);

            // Increment counter
            const newCounter = (echo.compact_counter || 0) + 1;
            echo.compact_counter = newCounter;
            echo.last_updated = new Date().toISOString();

            // Append to compact history
            echo.compact_history = echo.compact_history || [];
            echo.compact_history.push({
                compact_num: newCounter,
                timestamp: new Date().toISOString(),
                trigger: 'manual_compact', // Could be 'auto_compact_180K' if detected
                tokens_before: echo.context_metrics?.estimated_tokens || 180000,
                tokens_after: 60000 // Post-compact estimate
            });

            // Generate new filename (update counter: -0 → -1, -1 → -2, etc.)
            const newFilename = currentFilename.replace(/-(\d+)\.json$/, `-${newCounter}.json`);
            const newPath = path.join(this.echoDir, newFilename);

            // Write updated ECHO to new filename (atomic)
            await fs.writeFile(newPath, JSON.stringify(echo, null, 2), 'utf8');

            // Delete old file (crash-safe: new file written first)
            await fs.unlink(currentPath);

            console.log(`   📸 ECHO compacted: ${currentFilename} → ${newFilename}`);
            console.log(`      Compact #${newCounter}: ${echo.compact_history[newCounter]?.tokens_before || '?'}K → 60K tokens`);

            return {
                success: true,
                old_filename: currentFilename,
                new_filename: newFilename,
                compact_counter: newCounter,
                echo_id: echo.echo_id
            };

        } catch (error) {
            console.error(`   ❌ ECHO counter increment failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update ECHO snapshot with current conversation context
     * Used for manual "echo" trigger to refresh checkpoint data
     * @param {object} updates - Partial ECHO data to update
     * @returns {Promise<object>} Update result
     */
    async updateEchoSnapshot(updates = {}) {
        try {
            // Find today's ECHO file
            const todayContext = await this.retrieveEchoContext();
            if (!todayContext) {
                throw new Error('No ECHO file found for today');
            }

            const echoPath = path.join(this.echoDir, todayContext.filename);

            // Read current ECHO
            const echoContent = await fs.readFile(echoPath, 'utf8');
            const echo = JSON.parse(echoContent);

            // Update timestamp
            echo.last_updated = new Date().toISOString();

            // Merge updates (deep merge for nested objects)
            if (updates.context_metrics) {
                echo.context_metrics = {
                    ...echo.context_metrics,
                    ...updates.context_metrics
                };
            }

            if (updates.conversation_state) {
                echo.conversation_state = {
                    ...echo.conversation_state,
                    ...updates.conversation_state
                };
            }

            if (updates.esmc_state) {
                echo.esmc_state = {
                    ...echo.esmc_state,
                    ...updates.esmc_state
                };
            }

            if (updates.recovery_metadata) {
                echo.recovery_metadata = {
                    ...echo.recovery_metadata,
                    ...updates.recovery_metadata
                };
            }

            // Write updated ECHO (atomic operation)
            await fs.writeFile(echoPath, JSON.stringify(echo, null, 2), 'utf8');

            console.log(`   📸 ECHO updated: ${todayContext.filename}`);
            console.log(`      Tokens: ${echo.context_metrics?.estimated_tokens || '?'}K, Messages: ${echo.context_metrics?.message_count || '?'}`);

            return {
                success: true,
                filename: todayContext.filename,
                echo_id: echo.echo_id,
                updated_fields: Object.keys(updates)
            };

        } catch (error) {
            console.error(`   ❌ ECHO update failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🆕 ESMC 3.22 v3.0: Counter-based conditional reading
     * Check if ECHO should be read based on counter value
     * -0 = new conversation (skip read, no context yet)
     * >0 = post-compact (read file, context loss risk)
     * @returns {Promise<boolean>} True if ECHO should be read
     */
    async shouldReadEcho() {
        try {
            const today = formatDate();
            const files = await fs.readdir(this.echoDir);
            const todayEchos = files.filter(f => f.startsWith(today) && f.endsWith('.json'));

            if (todayEchos.length === 0) {
                // No ECHO from today - new conversation
                return false;
            }

            // Find highest counter
            const latestEcho = todayEchos.sort((a, b) => {
                const counterA = parseInt(a.match(/-(\d+)\.json$/)?.[1] || '0');
                const counterB = parseInt(b.match(/-(\d+)\.json$/)?.[1] || '0');
                return counterB - counterA;
            })[0];

            // Extract counter from filename
            const counter = parseInt(latestEcho.match(/-(\d+)\.json$/)?.[1] || '0');

            // Counter-based decision: only read if > 0 (post-compact state)
            // Counter = 0: new conversation, no context yet
            // Counter > 0: compacted conversation, context exists
            return counter > 0;

        } catch (error) {
            // On error, default to false (skip read)
            return false;
        }
    }

    /**
     * Retrieve ECHO context for current conversation (PHASE 0.0 - ATLAS integration)
     * @returns {Promise<object|null>} ECHO context or null if not found
     */
    async retrieveEchoContext() {
        try {
            const today = formatDate();

            // List all ECHO files
            const files = await fs.readdir(this.echoDir);

            // Filter by today's date (YYYY-MM-DD prefix)
            const todayEchos = files.filter(f => f.startsWith(today) && f.endsWith('.json'));

            if (todayEchos.length === 0) {
                // Silent return - no ECHO from today (normal case)
                return null;
            }

            // If multiple ECHOs (multi-window), select highest counter (most recent compact)
            const latestEcho = todayEchos.sort((a, b) => {
                const counterA = parseInt(a.match(/-(\d+)\.json$/)?.[1] || '0');
                const counterB = parseInt(b.match(/-(\d+)\.json$/)?.[1] || '0');
                return counterB - counterA; // Descending (highest first)
            })[0];

            // Load ECHO file
            const echoPath = path.join(this.echoDir, latestEcho);
            const echoContent = await fs.readFile(echoPath, 'utf8');
            const echo = JSON.parse(echoContent);

            // Return context object (optimized for ATLAS injection)
            return {
                filename: latestEcho,
                echo_id: echo.echo_id,
                context: echo, // Full snapshot
                current_task: echo.conversation_state?.current_task || null,
                todos: echo.conversation_state?.todo_list || [],
                compact_counter: echo.compact_counter || 0,
                files_modified: echo.conversation_state?.files_modified || [],
                key_decisions: echo.conversation_state?.key_decisions || [],
                esmc_state: echo.esmc_state || {},
                context_metrics: echo.context_metrics || {}
            };

        } catch (error) {
            // Silent failure - fall back to TIER 1 (defensive error handling)
            console.warn(`   ⚠️ ECHO retrieval failed (falling back to TIER 1): ${error.message}`);
            return null;
        }
    }

    /**
     * Update existing ECHO file (continuous updates during conversation)
     * @param {object} updates - Fields to update
     * @returns {Promise<object>} Update result
     */
    async updateEcho(updates = {}) {
        try {
            const todayContext = await this.retrieveEchoContext();
            if (!todayContext) {
                throw new Error('No ECHO file found for today');
            }

            const echoPath = path.join(this.echoDir, todayContext.filename);
            const echo = todayContext.context;

            // Update fields
            echo.last_updated = new Date().toISOString();

            if (updates.current_task) {
                echo.conversation_state.current_task = updates.current_task;
            }
            if (updates.todo_list) {
                echo.conversation_state.todo_list = updates.todo_list;
            }
            if (updates.files_modified) {
                echo.conversation_state.files_modified = updates.files_modified;
            }
            if (updates.key_decisions) {
                echo.conversation_state.key_decisions = updates.key_decisions;
            }
            if (updates.context_metrics) {
                echo.context_metrics = { ...echo.context_metrics, ...updates.context_metrics };
            }

            // Write updated ECHO
            await fs.writeFile(echoPath, JSON.stringify(echo, null, 2), 'utf8');

            return {
                success: true,
                filename: todayContext.filename,
                updated_at: echo.last_updated
            };

        } catch (error) {
            console.error(`   ❌ ECHO update failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🆕 ESMC 3.22: Auto-trigger ECHO checkpoint on token milestones
     * Proactively saves conversation state at 100K and 150K token thresholds
     *
     * @param {number} currentTokens - Current token usage
     * @param {object} updates - Optional context updates to save
     * @returns {Promise<object>} Checkpoint result
     */
    async checkTokenMilestoneAndSave(currentTokens, updates = {}) {
        try {
            // Token milestone thresholds
            const MILESTONES = {
                CHECKPOINT_100K: 100000,
                CHECKPOINT_150K: 150000,
                EMERGENCY_180K: 180000
            };

            // Check if we've crossed a milestone
            const todayContext = await this.retrieveEchoContext();
            if (!todayContext) {
                // No ECHO exists yet - can't save checkpoint
                return { success: false, reason: 'No ECHO file exists' };
            }

            const echo = todayContext.context;
            const lastTokenCheck = echo.context_metrics?.last_token_checkpoint || 0;

            let triggerReason = null;

            // Determine which milestone we crossed
            if (currentTokens >= MILESTONES.EMERGENCY_180K && lastTokenCheck < MILESTONES.EMERGENCY_180K) {
                triggerReason = 'auto_checkpoint_180K_emergency';
            } else if (currentTokens >= MILESTONES.CHECKPOINT_150K && lastTokenCheck < MILESTONES.CHECKPOINT_150K) {
                triggerReason = 'auto_checkpoint_150K';
            } else if (currentTokens >= MILESTONES.CHECKPOINT_100K && lastTokenCheck < MILESTONES.CHECKPOINT_100K) {
                triggerReason = 'auto_checkpoint_100K';
            }

            // No new milestone crossed
            if (!triggerReason) {
                return { success: false, reason: 'No milestone crossed' };
            }

            // Save checkpoint
            console.log(`\n📸 ECHO AUTO-CHECKPOINT TRIGGERED`);
            console.log(`   Reason: ${triggerReason}`);
            console.log(`   Tokens: ${currentTokens.toLocaleString()} / 200,000`);

            // Update context metrics with checkpoint info
            const checkpointUpdates = {
                ...updates,
                context_metrics: {
                    ...echo.context_metrics,
                    estimated_tokens: currentTokens,
                    last_token_checkpoint: currentTokens,
                    checkpoint_history: [
                        ...(echo.context_metrics?.checkpoint_history || []),
                        {
                            trigger: triggerReason,
                            tokens: currentTokens,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }
            };

            const result = await this.updateEcho(checkpointUpdates);

            if (result.success) {
                console.log(`   ✅ Checkpoint saved: ${result.filename}`);
                console.log(`   📊 Next milestone: ${this._getNextMilestone(currentTokens)}K tokens\n`);
            }

            return {
                ...result,
                trigger: triggerReason,
                tokens: currentTokens
            };

        } catch (error) {
            console.error(`   ❌ Auto-checkpoint failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get next token milestone for display
     * @private
     */
    _getNextMilestone(currentTokens) {
        if (currentTokens < 100000) return 100;
        if (currentTokens < 150000) return 150;
        if (currentTokens < 180000) return 180;
        return 200;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
    EchoManager
};
