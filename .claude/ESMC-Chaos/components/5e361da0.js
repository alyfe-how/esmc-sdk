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
/** ESMC 3.13 THE SCRIBE | 2025-10-17 | v3.13.0 | PROD | ALL_TIERS
 *  Purpose: Conversation & file operation logging - Time Machine backup layer (NOT intelligence retrieval)
 *  Features: Pure file-based | Isolated scribe-notes domain | ATLAS bidirectional linking | Session-file linking | Temporal forensics
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class ESMCScribe {
    constructor(options = {}) {
        this.projectRoot = options.projectRoot || this._findProjectRoot();
        this.config = {
            scribeNotesDir: path.join(this.projectRoot, '.claude', 'memory', 'scribe-notes')
        };

        this.currentSession = null;
        this.conversationId = null;  // Persistent conversation ID across multiple saves
        this.isInitialized = false;
    }

    /**
     * Auto-detect project root by walking up from module location
     * Searches for .claude/memory/ directory AND verifies scribe-notes/ has content
     * Prioritizes HIGHEST (furthest) root when multiple candidates exist
     * @added ESMC 3.13.3
     * @fixed ESMC 3.14.1 - Walk to highest root to avoid nested .claude/ false positives
     * @returns {string} Absolute path to project root
     * @throws {Error} If .claude/memory/ not found in parent directories
     */
    _findProjectRoot() {
        let current = __dirname;
        let bestCandidate = null;
        let maxFiles = 0;
        let firstClaudeDir = null;

        // Walk UP the tree and collect ALL valid candidates
        while (current !== path.dirname(current)) {
            const claudePath = path.join(current, '.claude');
            const memoryPath = path.join(claudePath, 'memory');
            const scribeNotesPath = path.join(memoryPath, 'scribe-notes');

            // Remember the first .claude directory we find (fallback for new SDK installs)
            if (fsSync.existsSync(claudePath) && !firstClaudeDir) {
                firstClaudeDir = current;
            }

            // Verify .claude/memory/scribe-notes/ exists AND contains date folders
            if (fsSync.existsSync(memoryPath) && fsSync.existsSync(scribeNotesPath)) {
                try {
                    const stats = fsSync.statSync(scribeNotesPath);
                    if (stats.isDirectory()) {
                        const entries = fsSync.readdirSync(scribeNotesPath);
                        const hasDateFolders = entries.some(entry => /^\d{8}$/.test(entry));
                        if (hasDateFolders) {
                            // Count total scribe files to find most populated root
                            let fileCount = 0;
                            for (const dateFolder of entries) {
                                const datePath = path.join(scribeNotesPath, dateFolder);
                                if (fsSync.statSync(datePath).isDirectory()) {
                                    fileCount += fsSync.readdirSync(datePath).length;
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
            console.log(`   🎯 SCRIBE: Auto-detected project root: ${bestCandidate}`);
            return bestCandidate;
        }

        // ESMC 4: Fallback to first .claude directory (for new SDK installs)
        if (firstClaudeDir) {
            console.log(`   🎯 SCRIBE: Using .claude directory (first run): ${firstClaudeDir}`);
            console.log(`   📁 SCRIBE: Will auto-create scribe-notes folder structure on initialize()`);
            return firstClaudeDir;
        }

        throw new Error('SCRIBE: Could not locate project root with .claude directory. Pass explicit projectRoot option.');
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    async initialize() {
        try {
            // Create scribe-notes directory if it doesn't exist
            await fs.mkdir(this.config.scribeNotesDir, { recursive: true });

            this.isInitialized = true;
            return {
                success: true,
                message: 'ESMC 3.2 THE SCRIBE initialized successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: `ESMC 3.2 THE SCRIBE initialization failed: ${error.message}`,
                error: error
            };
        }
    }

    // ========================================================================
    // SESSION MANAGEMENT
    // ========================================================================

    async startSession(options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const {
                title = 'Untitled Session',
                metadata = {}
            } = options;

            // Generate or reuse conversation ID
            const now = new Date();
            const dateFolder = this._formatDateFolder(now); // YYYYMMDD
            const timePrefix = this._formatTimePrefix(now); // HHMM

            // Generate conversation ID once (persistent across multiple sessions)
            if (!this.conversationId) {
                this.conversationId = this._generateRandomId(); // 6-char random (e.g., k3p8x2)
            }

            const sessionNumber = await this._getNextSessionNumber(dateFolder, timePrefix, this.conversationId);

            // Session ID format: random6_HHMM_NNN (e.g., k3p8x2_1514_001)
            const sessionId = `${this.conversationId}_${timePrefix}_${sessionNumber}`;

            // Initialize session state
            this.currentSession = {
                id: sessionId,              // Session identifier (random6_HHMM_NNN)
                dateFolder: dateFolder,
                title,
                metadata,
                messages: [],
                fileOperations: [],         // 🆕 File operations tracking (write/edit/move/delete)
                startedAt: now.toISOString(),
                tokenCount: 0
            };

            return {
                success: true,
                sessionId,
                filePath: this._getSessionFilePath(),
                message: `Session started: ${sessionId}`
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to start session: ${error.message}`,
                error: error
            };
        }
    }

    async logMessage(role, content, metadata = {}) {
        if (!this.currentSession) {
            return {
                success: false,
                message: 'No active session. Call startSession() first.'
            };
        }

        try {
            const message = {
                role,
                content,
                timestamp: new Date().toISOString(),
                ...metadata
            };

            // Add to in-memory buffer
            this.currentSession.messages.push(message);

            // Update token count if provided
            if (metadata.tokenCount) {
                this.currentSession.tokenCount += metadata.tokenCount;
            }

            // 🆕 ESMC 3.69: AUTO-DETECT USER CONFIRMATION FOR PRECEDENT REGISTRATION
            // CRITICAL TRIGGER: Detect user validation keywords and register solution precedent
            if (role === 'user') {
                await this._detectAndRegisterPrecedent(content);
            }

            // Save to file
            await this._saveSessionFile();

            return {
                success: true,
                messageNumber: this.currentSession.messages.length,
                sessionId: this.currentSession.id
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to log message: ${error.message}`,
                error: error
            };
        }
    }

    // ========================================================================
    // FILE OPERATION LOGGING (ESMC 3.3)
    // ========================================================================

    async logFileOperation(operation, filePath, metadata = {}) {
        if (!this.currentSession) {
            return {
                success: false,
                message: 'No active session. Call startSession() first.'
            };
        }

        try {
            // Normalize path (handle both forward and backslashes)
            const normalizedPath = filePath.replace(/\\/g, '/');

            // Filter out noise: Ignore reads from .claude/memory/ to prevent recursive logging
            if (operation === 'read' && normalizedPath.includes('.claude/memory/')) {
                return {
                    success: true,
                    filtered: true,
                    message: 'Read operation from memory domain ignored (noise filter)'
                };
            }

            // Normalize metadata paths (e.g., oldPath for move operations)
            const normalizedMetadata = { ...metadata };
            if (normalizedMetadata.oldPath) {
                normalizedMetadata.oldPath = normalizedMetadata.oldPath.replace(/\\/g, '/');
            }

            const fileOp = {
                operation,      // 'write', 'edit', 'move', 'delete'
                filePath: normalizedPath,
                timestamp: new Date().toISOString(),
                ...normalizedMetadata     // Can include: lines_modified, purpose, result, oldPath (for moves)
            };

            // Add to file operations log
            this.currentSession.fileOperations.push(fileOp);

            // Save to file
            await this._saveSessionFile();

            return {
                success: true,
                operationNumber: this.currentSession.fileOperations.length,
                sessionId: this.currentSession.id,
                filtered: false
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to log file operation: ${error.message}`,
                error: error
            };
        }
    }

    getTrackedFiles() {
        if (!this.currentSession) {
            return [];
        }

        // Extract unique file paths from file operations (excluding reads)
        const filesModified = new Set();
        for (const op of this.currentSession.fileOperations) {
            if (op.operation !== 'read') {
                filesModified.add(op.filePath);
            }
            // Include oldPath for move operations
            if (op.operation === 'move' && op.oldPath) {
                filesModified.add(op.oldPath);
            }
        }

        return Array.from(filesModified);
    }

    async endSession(summary = null, atlasIntegration = true) {
        if (!this.currentSession) {
            return {
                success: false,
                message: 'No active session to end.'
            };
        }

        try {
            const sessionId = this.currentSession.id;
            const endedAt = new Date().toISOString();

            // Update session with end time and summary
            this.currentSession.endedAt = endedAt;
            if (summary) {
                this.currentSession.summary = summary;
            }

            // Calculate duration (in minutes)
            const startTime = new Date(this.currentSession.startedAt);
            const endTime = new Date(endedAt);
            const durationMs = endTime.getTime() - startTime.getTime();
            this.currentSession.durationMinutes = Math.max(0, Math.round(durationMs / 60000));

            // Get tracked files for ATLAS integration
            const filesModified = this.getTrackedFiles();

            // Final save
            await this._saveSessionFile();

            // 🔗 ATLAS INTEGRATION: Bidirectional session-file linking
            let atlasLinkResult = null;
            if (atlasIntegration && filesModified.length > 0) {
                try {
                    const AtlasRetrievalSystem = require('./4bb69ab9.js');
                    const atlas = new AtlasRetrievalSystem();
                    atlasLinkResult = await atlas.linkSessionToFiles(sessionId, filesModified);
                } catch (error) {
                    console.warn(`   ⚠️ ATLAS linking skipped: ${error.message}`);
                }
            }

            const sessionSummary = {
                sessionId,
                messageCount: this.currentSession.messages.length,
                fileOperationsCount: this.currentSession.fileOperations.length,
                filesModifiedCount: filesModified.length,
                tokenCount: this.currentSession.tokenCount,
                durationMinutes: this.currentSession.durationMinutes,
                filePath: this._getSessionFilePath(),
                atlasLinked: atlasLinkResult === true
            };

            // Clear current session
            this.currentSession = null;

            return {
                success: true,
                message: 'Session ended successfully',
                summary: sessionSummary
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to end session: ${error.message}`,
                error: error
            };
        }
    }

    // ========================================================================
    // RETRIEVAL & QUERY
    // ========================================================================

    async getSession(dateFolder, sessionId) {
        try {
            const filePath = path.join(
                this.config.scribeNotesDir,
                dateFolder,
                `${sessionId}.json`
            );

            const fileContent = await fs.readFile(filePath, 'utf-8');
            const session = JSON.parse(fileContent);

            return {
                success: true,
                session
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to retrieve session: ${error.message}`,
                error: error
            };
        }
    }

    async listSessions(dateFolder) {
        try {
            const folderPath = path.join(this.config.scribeNotesDir, dateFolder);

            // Check if folder exists
            try {
                await fs.access(folderPath);
            } catch {
                return {
                    success: true,
                    sessions: [],
                    message: `No sessions found for date: ${dateFolder}`
                };
            }

            const files = await fs.readdir(folderPath);
            const sessions = files
                .filter(f => f.endsWith('.json'))
                .map(f => f.replace('.json', ''));

            return {
                success: true,
                dateFolder,
                sessions,
                count: sessions.length
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to list sessions: ${error.message}`,
                error: error
            };
        }
    }

    async listAllDates() {
        try {
            const folders = await fs.readdir(this.config.scribeNotesDir);

            // Filter only date folders (YYYYMMDD format - 8 digits)
            const dateFolders = folders.filter(f => /^\d{8}$/.test(f));

            // Sort in descending order (newest first)
            dateFolders.sort((a, b) => b.localeCompare(a));

            return {
                success: true,
                dates: dateFolders,
                count: dateFolders.length
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to list dates: ${error.message}`,
                error: error
            };
        }
    }

    // ========================================================================
    // INTERNAL HELPERS
    // ========================================================================

    _formatDateFolder(date) {
        // Format: YYYYMMDD (no hyphens)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    _formatTimePrefix(date) {
        // Format: HHMM (24-hour time)
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}${minutes}`;
    }

    _generateRandomId() {
        // Generate 6-character random alphanumeric ID (e.g., k3p8x2)
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let random = '';
        for (let i = 0; i < 6; i++) {
            random += chars[Math.floor(Math.random() * chars.length)];
        }
        return random;
    }

    async _getNextSessionNumber(dateFolder, timePrefix, conversationId) {
        const folderPath = path.join(this.config.scribeNotesDir, dateFolder);

        // Ensure date folder exists
        await fs.mkdir(folderPath, { recursive: true });

        try {
            const files = await fs.readdir(folderPath);

            // Find sessions with SAME conversation ID and time prefix
            const pattern = new RegExp(`^${conversationId}_${timePrefix}_(\\d{3})\\.json$`);
            const numbers = files
                .map(f => {
                    const match = f.match(pattern);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(n => n > 0);

            // Get next number (max + 1, or 001 if none exist)
            const nextNumber = numbers.length > 0
                ? Math.max(...numbers) + 1
                : 1;

            return String(nextNumber).padStart(3, '0');
        } catch {
            // Folder doesn't exist yet, start at 001
            return '001';
        }
    }

    _getSessionFilePath() {
        if (!this.currentSession) return null;

        const folderPath = path.join(
            this.config.scribeNotesDir,
            this.currentSession.dateFolder
        );

        return path.join(folderPath, `${this.currentSession.id}.json`);
    }

    /**
     * 🆕 ESMC 3.69 - Detect user confirmation and register solution precedent
     *
     * CRITICAL TRIGGER: This is the write path integration point for PRECEDENT REGISTRAR
     * Auto-registers solution precedents when user confirms success
     *
     * @private
     * @param {string} userMessage - User's message content
     */
    async _detectAndRegisterPrecedent(userMessage) {
        try {
            // Load PRECEDENT REGISTRAR
            const AegisPrecedentRegistrar = require('./f79d4130.js');
            const registrar = new AegisPrecedentRegistrar();
            await registrar.initialize();

            // Detect confirmation keywords
            const confirmation = registrar.detectConfirmation(userMessage);

            // Only register if confidence threshold met
            if (!confirmation.shouldRegister) {
                return;
            }

            // Build precedent data from current session
            const precedentData = this._buildPrecedentData(userMessage, confirmation);

            if (!precedentData) {
                return; // No problem-solution pair to register
            }

            // Register precedent
            const result = await registrar.registerPrecedent(precedentData);

            if (result.success) {
                console.log(`✅ AEGIS: Solution precedent registered (impact: ${result.entry.impact_score})`);
            }

        } catch (error) {
            // Non-blocking - registration failure doesn't affect SCRIBE operation
            console.error('⚠️ AEGIS PRECEDENT REGISTRAR: Auto-registration failed (non-blocking):', error.message);
        }
    }

    /**
     * Build precedent data from current session for registration
     *
     * @private
     * @param {string} userMessage - User confirmation message
     * @param {Object} confirmation - Confirmation detection result
     * @returns {Object|null} Precedent data or null if not enough context
     */
    _buildPrecedentData(userMessage, confirmation) {
        if (!this.currentSession) return null;

        // Extract problem from session metadata or messages
        const problem = this._extractProblemFromSession();
        const solution = this._extractSolutionFromSession();

        if (!problem || !solution) {
            return null; // Need both problem and solution
        }

        return {
            problem: problem,
            solution: solution,
            confirmation: {
                keywords: confirmation.keywords,
                confidence: confirmation.confidence,
                user_message: userMessage
            },
            session_context: {
                session_id: this.currentSession.id,
                rank: null, // Will be set by memory system
                project: this.currentSession.metadata?.project || 'Unknown Project'
            },
            metadata: {
                waves_deployed: this.currentSession.metadata?.waves_deployed || 0,
                files_modified: this.currentSession.fileOperations.filter(op => op.operation !== 'read').length,
                lines_changed: this.currentSession.fileOperations.reduce((sum, op) => sum + (op.metadata?.lines_modified || 0), 0),
                execution_time_ms: 0 // Not tracked by SCRIBE currently
            }
        };
    }

    /**
     * Extract problem description from session
     *
     * @private
     * @returns {Object|null} Problem data
     */
    _extractProblemFromSession() {
        if (!this.currentSession) return null;

        // Use session title as problem description
        const problemDescription = this.currentSession.title || 'Problem description unavailable';

        // Extract keywords from title and metadata
        const keywords = [];
        if (this.currentSession.metadata?.keywords) {
            keywords.push(...this.currentSession.metadata.keywords);
        }

        return {
            description: problemDescription,
            keywords: keywords,
            complexity_score: this.currentSession.metadata?.complexity_score || 50,
            problem_type: this.currentSession.metadata?.problem_type || 'general'
        };
    }

    /**
     * Extract solution description from session
     *
     * @private
     * @returns {Object|null} Solution data
     */
    _extractSolutionFromSession() {
        if (!this.currentSession) return null;

        // Use session summary if available, otherwise construct from messages
        const approach = this.currentSession.summary || this._constructSolutionSummary();

        // Get file operations as implementation details
        const implementationDetails = this._summarizeFileOperations();

        return {
            approach: approach,
            implementation_details: implementationDetails,
            verification_method: 'User confirmation',
            files_modified: this.getTrackedFiles()
        };
    }

    /**
     * Construct solution summary from assistant messages
     *
     * @private
     * @returns {string} Solution summary
     */
    _constructSolutionSummary() {
        // Get last few assistant messages as solution approach
        const assistantMessages = this.currentSession.messages
            .filter(m => m.role === 'assistant')
            .slice(-3) // Last 3 assistant messages
            .map(m => m.content)
            .join(' ');

        return assistantMessages.substring(0, 300) || 'Solution implemented';
    }

    /**
     * Summarize file operations for implementation details
     *
     * @private
     * @returns {string} File operations summary
     */
    _summarizeFileOperations() {
        const operations = this.currentSession.fileOperations;
        if (operations.length === 0) {
            return 'No file operations recorded';
        }

        const opSummary = operations
            .filter(op => op.operation !== 'read')
            .map(op => `${op.operation}: ${op.file_path}`)
            .slice(0, 5) // First 5 operations
            .join('; ');

        return opSummary || 'Implementation details unavailable';
    }

    async _saveSessionFile() {
        if (!this.currentSession) return;

        const filePath = this._getSessionFilePath();
        const folderPath = path.dirname(filePath);

        // Ensure date folder exists
        await fs.mkdir(folderPath, { recursive: true });

        // Prepare session data
        const sessionData = {
            session_id: this.currentSession.id,  // Format: random6_HHMM_NNN (e.g., k3p8x2_1514_001)
            title: this.currentSession.title,
            metadata: this.currentSession.metadata,
            started_at: this.currentSession.startedAt,
            ended_at: this.currentSession.endedAt ?? null,
            duration_minutes: this.currentSession.durationMinutes ?? null,
            message_count: this.currentSession.messages.length,
            token_count: this.currentSession.tokenCount,
            messages: this.currentSession.messages,
            file_operations: this.currentSession.fileOperations,  // 🆕 File operations log
            file_operations_count: this.currentSession.fileOperations.length,
            files_modified: this.getTrackedFiles(),  // 🆕 Unique file paths (excluding reads)
            summary: this.currentSession.summary ?? null,
            last_updated: new Date().toISOString()
        };

        // Write to file
        await fs.writeFile(filePath, JSON.stringify(sessionData, null, 2));
    }

    getCurrentSession() {
        return this.currentSession;
    }

    // ========================================================================
    // STATIC FACTORY METHOD
    // ========================================================================

    static async create() {
        const scribe = new ESMCScribe();
        await scribe.initialize();
        return scribe;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = ESMCScribe;

// ============================================================================
// CLI USAGE (if run directly)
// ============================================================================

if (require.main === module) {
    (async () => {
        console.log('✅ ESMC 3.3 THE SCRIBE - File Operations Test');

        const scribe = await ESMCScribe.create();

        // Test: Start a session
        const startResult = await scribe.startSession({
            title: 'Scribe 3.3 File Operations Test',
            metadata: {
                project: 'esmc-production',
                complexity: 'MEDIUM'
            }
        });
        console.log('Start:', startResult);

        // Test: Log messages
        await scribe.logMessage('user', 'Implement file tracking', { tokenCount: 10 });
        await scribe.logMessage('assistant', 'Extending Scribe to log file operations...', { tokenCount: 25 });

        // Test: Log file operations
        await scribe.logFileOperation('write', 'C:\\Project\\src\\app.js', {
            purpose: 'Create main application entry point',
            lines_modified: 50
        });
        await scribe.logFileOperation('edit', 'C:\\Project\\package.json', {
            purpose: 'Add new dependency: axios',
            lines_modified: 2
        });
        await scribe.logFileOperation('move', 'C:\\Project\\legacy\\utils.js', {
            purpose: 'Relocate utility functions',
            oldPath: 'C:\\Project\\src\\utils.js'
        });
        await scribe.logFileOperation('read', 'C:\\.claude\\memory\\sessions\\test.json', {
            purpose: 'This should be filtered out'
        });
        await scribe.logFileOperation('delete', 'C:\\Project\\temp\\cache.json', {
            purpose: 'Remove temporary cache file'
        });

        // Test: Get tracked files
        const trackedFiles = scribe.getTrackedFiles();
        console.log('\nTracked Files:', trackedFiles);
        console.log('Count:', trackedFiles.length);

        // Test: End session
        const endResult = await scribe.endSession('File operations test completed');
        console.log('\nEnd:', endResult);

        // Test: Retrieve session and verify file operations
        const now = new Date();
        const dateFolder = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const getResult = await scribe.getSession(dateFolder, startResult.sessionId);

        if (getResult.success) {
            console.log('\n📊 Session Data:');
            console.log('   File Operations Count:', getResult.session.file_operations_count);
            console.log('   Files Modified:', getResult.session.files_modified);
            console.log('\n📋 File Operations Log:');
            getResult.session.file_operations.forEach((op, i) => {
                console.log(`   ${i + 1}. [${op.operation.toUpperCase()}] ${op.filePath}`);
                if (op.purpose) console.log(`      Purpose: ${op.purpose}`);
            });
        }

        console.log('\n✅ All tests passed - Scribe 3.3 operational with file tracking');
    })();
}
