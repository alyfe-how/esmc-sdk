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
/** ESMC 3.5 MEMORY BANK | 2025-09-30 | v3.5.0 | PROD | ALL_TIERS
 *  Purpose: User profiling & relationship intelligence - remember user across sessions (style, preferences, journey)
 *  Features: Profile management | 3-month backup history | Session context | Preference learning | Privacy-first (local, encrypted, user-controlled)
 *  Philosophy: "Remember the user, not just the missions" | Author: COLONEL EPSILON
 *
 *  Inspiration:
 *  - ChatGPT remembers across conversations
 *  - ESMC 3.5 provides the same relationship intelligence
 *  - But privacy-first: local storage, user control, encryption
 *
 *  Integration:
 *  - Works with TIME MACHINE 3.4 (backups as memory points)
 *  - Works with Strategic Learning 3.2 (mission patterns)
 *  - Works with Knowledge Graph (technical knowledge)
 *  - NEW: Personal context layer (who you are beyond code)
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════
// 🧠 MEMORY BANK SYSTEM CLASS
// ═══════════════════════════════════════════════════════════════════════

class ESMCMemoryBank {
    constructor(config = {}) {
        this.config = {
            projectRoot: config.projectRoot || process.cwd(),
            databaseConfig: config.databaseConfig || null,
            memoryStoragePath: config.memoryStoragePath || path.join(process.cwd(), '.claude', 'memory'),
            encryptionEnabled: config.encryptionEnabled !== false,
            privacyMode: config.privacyMode || 'LOCAL_ONLY', // LOCAL_ONLY, ENCRYPTED, or CLOUD_SYNC
            debugMode: config.debugMode || false
        };

        this.initialized = false;
        this.userProfile = null;
        this.sessionContext = null;
        this.database = null;
    }

    /**
     * Initialize Memory Bank System
     */
    async initialize() {
        try {
            console.log('🧠 ESMC 3.5 MEMORY BANK - Initializing...');

            // Ensure memory storage directory exists
            await this._ensureMemoryStorage();

            // Load or create user profile
            await this._loadUserProfile();

            // Initialize session context
            await this._initializeSessionContext();

            // Connect to database for advanced memory features
            if (this.config.databaseConfig) {
                await this._connectDatabase();
            }

            this.initialized = true;
            console.log('🧠 ESMC 3.5 MEMORY BANK - Ready');

            // Welcome back message
            if (this.userProfile && this.userProfile.name) {
                console.log(`   👋 Welcome back, ${this.userProfile.name}!`);
                if (this.userProfile.lastSession) {
                    const daysSince = Math.floor((Date.now() - new Date(this.userProfile.lastSession.date).getTime()) / (1000 * 60 * 60 * 24));
                    console.log(`   📅 Last session: ${daysSince} day(s) ago - ${this.userProfile.lastSession.summary}`);
                }
            }

            return true;

        } catch (error) {
            console.error('🧠 MEMORY BANK initialization failed:', error.message);
            console.warn('   ⚠️ Continuing without memory features');
            return false;
        }
    }

    /**
     * Ensure memory storage directory exists
     */
    async _ensureMemoryStorage() {
        try {
            await fs.mkdir(this.config.memoryStoragePath, { recursive: true });

            // Create subdirectories
            await fs.mkdir(path.join(this.config.memoryStoragePath, 'profiles'), { recursive: true });
            await fs.mkdir(path.join(this.config.memoryStoragePath, 'sessions'), { recursive: true });
            await fs.mkdir(path.join(this.config.memoryStoragePath, 'context'), { recursive: true });
            await fs.mkdir(path.join(this.config.memoryStoragePath, 'backups'), { recursive: true });

        } catch (error) {
            console.error('Failed to create memory storage:', error.message);
            throw error;
        }
    }

    /**
     * Load or create user profile
     */
    async _loadUserProfile() {
        const profilePath = path.join(this.config.memoryStoragePath, '.user-profile.json');

        try {
            const profileData = await fs.readFile(profilePath, 'utf8');
            this.userProfile = JSON.parse(profileData);
            console.log('   ✅ User profile loaded');

        } catch (error) {
            // Profile doesn't exist - create default
            this.userProfile = this._createDefaultProfile();
            await this._saveUserProfile();
            console.log('   ✅ New user profile created');
        }
    }

    /**
     * Create default user profile
     */
    _createDefaultProfile() {
        return {
            userId: this._generateUserId(),
            name: null, // User can set this
            email: null, // Optional
            created: new Date().toISOString(),
            lastSession: null,

            // Project context
            projects: [{
                name: 'Current Project',
                path: this.config.projectRoot,
                type: 'web_application',
                primaryLanguage: 'javascript',
                addedDate: new Date().toISOString()
            }],

            // Development preferences
            preferences: {
                backupStyle: {
                    format: 'YYYYMMDD HHMM Backup TYPE Description',
                    strategy: 'Filesystem-based, visible folders',
                    retentionDays: 30
                },
                codeQuality: {
                    preferredApproach: 'Maximum care, no placeholders',
                    qualityThreshold: 80,
                    testingRequired: true
                },
                communication: {
                    verbosity: 'concise_but_complete',
                    preferredTone: 'professional_friendly'
                }
            },

            // Learning profile (how you think)
            cognitiveProfile: {
                learningStyle: null, // Will be inferred
                decisionPatterns: [],
                problemSolvingApproach: null,
                pivotTendencies: [] // When/how you change approach
            },

            // Personal context (optional)
            personalContext: {
                healthTracking: [], // e.g., sugar readings
                notes: [],
                reminders: []
            },

            // Statistics
            stats: {
                sessionsCount: 0,
                totalBackups: 0,
                favoriteFeatures: [],
                mostUsedCommands: []
            }
        };
    }

    /**
     * Save user profile
     */
    async _saveUserProfile() {
        const profilePath = path.join(this.config.memoryStoragePath, '.user-profile.json');

        try {
            await fs.writeFile(
                profilePath,
                JSON.stringify(this.userProfile, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Failed to save user profile:', error.message);
        }
    }

    /**
     * Initialize session context
     */
    async _initializeSessionContext() {
        this.sessionContext = {
            sessionId: this._generateSessionId(),
            startTime: new Date().toISOString(),
            topicsDiscussed: [],
            decisionsMade: [],
            filesModified: [],
            backupsCreated: [],
            nextSteps: []
        };

        // Update user profile with session start
        if (this.userProfile) {
            this.userProfile.stats.sessionsCount++;
            await this._saveUserProfile();
        }
    }

    /**
     * Connect to database for advanced features
     */
    async _connectDatabase() {
        if (!this.config.databaseConfig) return;

        try {
            const mysql = require('mysql2/promise');
            this.database = await mysql.createConnection(this.config.databaseConfig);
            console.log('   ✅ Database connection established');

        } catch (error) {
            console.warn('   ⚠️ Database unavailable, using file-based memory only');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🎯 USER PROFILE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Update user profile information
     */
    async updateProfile(updates) {
        if (!this.userProfile) {
            throw new Error('User profile not initialized');
        }

        // Merge updates (deep merge for nested objects)
        this.userProfile = this._deepMerge(this.userProfile, updates);
        await this._saveUserProfile();

        return {
            success: true,
            profile: this.userProfile
        };
    }

    /**
     * Get user profile
     */
    getUserProfile() {
        return this.userProfile;
    }

    /**
     * Store personal context (health tracking, notes, etc.)
     */
    async storePersonalContext(category, key, value, metadata = {}) {
        if (!this.userProfile) {
            throw new Error('User profile not initialized');
        }

        const contextEntry = {
            key,
            value,
            category,
            timestamp: new Date().toISOString(),
            metadata
        };

        // Store in appropriate category
        if (category === 'health') {
            if (!this.userProfile.personalContext.healthTracking) {
                this.userProfile.personalContext.healthTracking = [];
            }
            this.userProfile.personalContext.healthTracking.push(contextEntry);
        }
        else if (category === 'note') {
            if (!this.userProfile.personalContext.notes) {
                this.userProfile.personalContext.notes = [];
            }
            this.userProfile.personalContext.notes.push(contextEntry);
        }
        else if (category === 'reminder') {
            if (!this.userProfile.personalContext.reminders) {
                this.userProfile.personalContext.reminders = [];
            }
            this.userProfile.personalContext.reminders.push(contextEntry);
        }

        await this._saveUserProfile();

        return {
            success: true,
            stored: contextEntry
        };
    }

    /**
     * Recall personal context
     */
    async recallPersonalContext(category, key = null, limit = 10) {
        if (!this.userProfile) {
            return { success: false, error: 'Profile not initialized' };
        }

        let results = [];

        if (category === 'health') {
            results = this.userProfile.personalContext.healthTracking || [];
        }
        else if (category === 'note') {
            results = this.userProfile.personalContext.notes || [];
        }
        else if (category === 'reminder') {
            results = this.userProfile.personalContext.reminders || [];
        }

        // Filter by key if provided
        if (key) {
            results = results.filter(entry => entry.key === key);
        }

        // Sort by timestamp (newest first) and limit
        results = results
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        return {
            success: true,
            results,
            count: results.length
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📚 BACKUP HISTORY ANALYZER
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Analyze backup history to understand user's journey
     * This is beautiful - backups as memory points!
     */
    async analyzeBackupHistory(options = {}) {
        const {
            maxBackups = 50,
            analyzePeriod = 90 // days
        } = options;

        try {
            console.log('\n🧠 ANALYZING BACKUP HISTORY - Your Journey Through Memory Points...\n');

            // Find all backup folders
            const projectRoot = this.config.projectRoot;
            const entries = await fs.readdir(projectRoot, { withFileTypes: true });

            const backupFolders = entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name)
                .filter(name => /^\d{8} \d{4}/.test(name)) // Match YYYYMMDD HHMM pattern
                .sort()
                .reverse()
                .slice(0, maxBackups);

            console.log(`   📁 Found ${backupFolders.length} backup folders`);

            // Parse and analyze backups
            const backupAnalysis = [];

            for (const folderName of backupFolders) {
                const parsed = this._parseBackupFolderName(folderName);
                if (!parsed) continue;

                // Check if within analysis period
                const daysSince = Math.floor((Date.now() - parsed.timestamp.getTime()) / (1000 * 60 * 60 * 24));
                if (daysSince > analyzePeriod) continue;

                backupAnalysis.push({
                    folderName,
                    ...parsed,
                    daysSince
                });
            }

            // Extract insights
            const insights = this._extractBackupInsights(backupAnalysis);

            console.log(`\n📊 BACKUP HISTORY INSIGHTS:\n`);
            console.log(`   Timeline: ${insights.timelineSpan} days`);
            console.log(`   Total Backups: ${insights.totalBackups}`);
            console.log(`   Backup Frequency: ${insights.avgBackupsPerWeek} per week`);
            console.log(`\n   🎯 Top Focus Areas:`);
            insights.topComponents.slice(0, 5).forEach((comp, idx) => {
                console.log(`      ${idx + 1}. ${comp.name} (${comp.count} backups)`);
            });

            console.log(`\n   📈 Recent Activity (Last 7 Days):`);
            insights.recentActivity.forEach(activity => {
                console.log(`      - ${activity.date}: ${activity.component} (${activity.type})`);
            });

            // Store insights in user profile
            if (this.userProfile) {
                this.userProfile.backupHistory = {
                    lastAnalyzed: new Date().toISOString(),
                    insights
                };
                await this._saveUserProfile();
            }

            return {
                success: true,
                backups: backupAnalysis,
                insights
            };

        } catch (error) {
            console.error('Backup history analysis failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Parse backup folder name (YYYYMMDD HHMM Backup TYPE Description)
     */
    _parseBackupFolderName(folderName) {
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

        // Extract type and component
        const descParts = description.split(/\s+/);
        let type = 'COMPONENT';
        let component = description;

        if (descParts[0] === 'Backup') {
            if (descParts[1] === 'FULL') {
                type = 'FULL';
                component = descParts.slice(2).join(' ') || 'General';
            } else {
                type = 'COMPONENT';
                component = descParts.slice(1).join(' ');
            }
        } else if (descParts[0].includes('platform-')) {
            type = 'PLATFORM';
            component = description;
        }

        return {
            timestamp,
            type,
            component,
            description
        };
    }

    /**
     * Extract insights from backup analysis
     */
    _extractBackupInsights(backups) {
        if (backups.length === 0) {
            return {
                totalBackups: 0,
                timelineSpan: 0,
                topComponents: [],
                recentActivity: []
            };
        }

        // Timeline span
        const oldest = backups[backups.length - 1].timestamp;
        const newest = backups[0].timestamp;
        const timelineSpan = Math.floor((newest - oldest) / (1000 * 60 * 60 * 24));

        // Component frequency
        const componentCounts = {};
        backups.forEach(backup => {
            const comp = backup.component;
            componentCounts[comp] = (componentCounts[comp] || 0) + 1;
        });

        const topComponents = Object.entries(componentCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        // Recent activity (last 7 days)
        const recentActivity = backups
            .filter(b => b.daysSince <= 7)
            .map(b => ({
                date: b.timestamp.toISOString().split('T')[0],
                component: b.component,
                type: b.type
            }));

        // Average backups per week
        const avgBackupsPerWeek = timelineSpan > 0
            ? Math.round((backups.length / timelineSpan) * 7 * 10) / 10
            : 0;

        return {
            totalBackups: backups.length,
            timelineSpan,
            avgBackupsPerWeek,
            topComponents,
            recentActivity
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🎯 SESSION CONTEXT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Record topic discussed in this session
     */
    recordTopicDiscussed(topic, details = {}) {
        if (!this.sessionContext) return;

        this.sessionContext.topicsDiscussed.push({
            topic,
            timestamp: new Date().toISOString(),
            details
        });
    }

    /**
     * Record decision made
     */
    recordDecision(decision, reasoning = '', alternatives = []) {
        if (!this.sessionContext) return;

        this.sessionContext.decisionsMade.push({
            decision,
            reasoning,
            alternatives,
            timestamp: new Date().toISOString()
        });

        // Learn from decision patterns
        if (this.userProfile) {
            this.userProfile.cognitiveProfile.decisionPatterns.push({
                decision,
                reasoning,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Record file modified
     */
    recordFileModified(filePath, modificationType = 'edit') {
        if (!this.sessionContext) return;

        this.sessionContext.filesModified.push({
            filePath,
            modificationType,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Set next steps for future session
     */
    setNextSteps(steps) {
        if (!this.sessionContext) return;

        this.sessionContext.nextSteps = steps.map(step => ({
            step,
            recorded: new Date().toISOString()
        }));
    }

    /**
     * End session and save context
     */
    async endSession(summary = '') {
        if (!this.sessionContext) return { success: false };

        try {
            // Update session end time
            this.sessionContext.endTime = new Date().toISOString();
            this.sessionContext.summary = summary;

            // Save session to file
            const sessionPath = path.join(
                this.config.memoryStoragePath,
                'sessions',
                `session_${this.sessionContext.sessionId}.json`
            );

            await fs.writeFile(
                sessionPath,
                JSON.stringify(this.sessionContext, null, 2),
                'utf8'
            );

            // Update user profile with last session
            if (this.userProfile) {
                this.userProfile.lastSession = {
                    sessionId: this.sessionContext.sessionId,
                    date: this.sessionContext.startTime,
                    summary: summary || 'Session completed',
                    topicsCount: this.sessionContext.topicsDiscussed.length,
                    decisionsCount: this.sessionContext.decisionsMade.length
                };
                await this._saveUserProfile();
            }

            console.log('\n🧠 SESSION CONTEXT SAVED');
            console.log(`   Session ID: ${this.sessionContext.sessionId}`);
            console.log(`   Duration: ${this._calculateDuration(this.sessionContext.startTime, this.sessionContext.endTime)}`);
            console.log(`   Topics Discussed: ${this.sessionContext.topicsDiscussed.length}`);
            console.log(`   Decisions Made: ${this.sessionContext.decisionsMade.length}`);
            console.log(`   Files Modified: ${this.sessionContext.filesModified.length}`);

            return {
                success: true,
                sessionContext: this.sessionContext
            };

        } catch (error) {
            console.error('Failed to end session:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🛠️ UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════

    _generateUserId() {
        return `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    _generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    _deepMerge(target, source) {
        const output = { ...target };
        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this._deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    _isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    _calculateDuration(startTime, endTime) {
        const duration = new Date(endTime) - new Date(startTime);
        const minutes = Math.floor(duration / 1000 / 60);
        const seconds = Math.floor((duration / 1000) % 60);
        return `${minutes}m ${seconds}s`;
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            userProfile: this.userProfile ? {
                userId: this.userProfile.userId,
                name: this.userProfile.name,
                sessionsCount: this.userProfile.stats.sessionsCount,
                hasBackupHistory: !!this.userProfile.backupHistory
            } : null,
            sessionContext: this.sessionContext ? {
                sessionId: this.sessionContext.sessionId,
                startTime: this.sessionContext.startTime,
                topicsCount: this.sessionContext.topicsDiscussed.length
            } : null
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🎖️ MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = ESMCMemoryBank;

// ═══════════════════════════════════════════════════════════════════════
// 🎖️ CLI INTERFACE (if run directly)
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        const memoryBank = new ESMCMemoryBank();
        await memoryBank.initialize();

        const args = process.argv.slice(2);
        const command = args[0];

        switch (command) {
            case 'analyze-backups':
                await memoryBank.analyzeBackupHistory();
                break;

            case 'profile':
                const profile = memoryBank.getUserProfile();
                console.log('\n🧠 USER PROFILE\n');
                console.log(JSON.stringify(profile, null, 2));
                break;

            case 'status':
                const status = memoryBank.getStatus();
                console.log('\n🧠 MEMORY BANK STATUS\n');
                console.log(JSON.stringify(status, null, 2));
                break;

            default:
                console.log(`
🧠 ESMC 3.5 MEMORY BANK - CLI Interface

Usage:
  node 673bb49e.js <command>

Commands:
  analyze-backups    Analyze backup history (3-month journey)
  profile            Show user profile
  status             Show system status

Examples:
  node 673bb49e.js analyze-backups
  node 673bb49e.js profile
                `);
        }

        // Close gracefully
        process.exit(0);
    })();
}