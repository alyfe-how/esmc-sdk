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
/** ESMC 3.13 CIE | 2025-10-18 | v3.13.0 | PROD | ALL_TIERS
 *  Purpose: Context Inference Engine - shared utility for all 4 MIN components (file disambiguation)
 *  Features: Word emphasis (CAPS/markdown/quotes) | Memory correlation | Conversation evolution | 3-signal scoring | Anti-pattern penalties
 *  Used by: PCA (spatial) | PIU (intent) | DKI (standards) | UIP (temporal)
 */

const fs = require('fs').promises;
const path = require('path');

class ContextInferenceEngine {
    constructor() {
        this.componentId = 'CIE';
        this.componentName = 'Context Inference Engine';
        this.version = '3.13.5'; // ECHO trigger implemented + PHASE 0 audit (ESMC 3.22)

        // Conversation tracking
        this.conversationHistory = []; // Message evolution tracking
        this.memoryRecent = null; // Cached .memory-recent.json
        this.contextCache = new Map(); // Performance optimization

        // Performance metrics
        this.metrics = {
            totalInferences: 0,
            cacheHits: 0,
            avgDuration: 0
        };

        // 🆕 ESMC 3.34 P0-3: Adaptive routing state
        this.contextThreshold = 0.80; // 80% context usage triggers emergency mode
        this.cachedContextUsage = null;
        this.lastContextCheck = 0;
        this.contextCheckInterval = 5000; // Check every 5 seconds max
    }

    /**
     * 🆕 ESMC 3.34 P0-3: Calculate current context window usage
     * Parses system token warnings to determine remaining budget
     * @returns {number} Context usage ratio (0.0 to 1.0)
     */
    calculateContextUsage() {
        try {
            // Check cache first (avoid repeated calculations)
            const now = Date.now();
            if (this.cachedContextUsage !== null && (now - this.lastContextCheck) < this.contextCheckInterval) {
                return this.cachedContextUsage;
            }

            // Parse from global context if available
            if (global.systemWarnings?.tokenUsage) {
                const { used, total } = global.systemWarnings.tokenUsage;
                this.cachedContextUsage = used / total;
                this.lastContextCheck = now;
                return this.cachedContextUsage;
            }

            // Fallback: estimate from conversation length (rough heuristic)
            if (this.conversationHistory.length > 0) {
                // Estimate: ~2000 tokens per message exchange
                const estimatedTokens = this.conversationHistory.length * 2000;
                const defaultBudget = 200000;
                this.cachedContextUsage = Math.min(estimatedTokens / defaultBudget, 0.99);
                this.lastContextCheck = now;
                return this.cachedContextUsage;
            }

            // Default: assume low usage if no data
            return 0.10;
        } catch (error) {
            console.warn(`   ⚠️ CIE: Context calculation failed: ${error.message}`);
            return 0.10; // Safe default
        }
    }

    /**
     * 🆕 ESMC 3.34 P0-3: Check if emergency mode should activate
     * Emergency mode skips BRIEF, Mesh Intelligence, and other heavy operations
     * @returns {boolean} True if context >= 80% threshold
     */
    shouldUseEmergencyMode() {
        const contextUsage = this.calculateContextUsage();
        const emergency = contextUsage >= this.contextThreshold;

        if (emergency) {
            console.log(`   ⚡ CIE: ADAPTIVE ROUTING - ${(contextUsage * 100).toFixed(1)}% context usage`);
            console.log(`   ⚡ CIE: Emergency mode activated (threshold: ${(this.contextThreshold * 100).toFixed(0)}%)`);
        }

        return emergency;
    }

    /**
     * 🆕 ESMC 3.34 P0-3: Get emergency mode configuration
     * Returns flags for which components to skip in emergency mode
     * @returns {Object} Emergency configuration flags
     */
    getEmergencyModeConfig() {
        if (!this.shouldUseEmergencyMode()) {
            return {
                emergency: false,
                skipBRIEF: false,
                skipMeshIntelligence: false,
                skipColonelDeployment: false,
                useDirectResponse: false,
                estimatedTokensSaved: 0
            };
        }

        // Calculate token savings
        const briefTokens = 650;
        const meshTokens = 950; // PIU + DKI + UIP + PCA lightweight queries
        const totalSaved = briefTokens + meshTokens;

        return {
            emergency: true,
            skipBRIEF: true,
            skipMeshIntelligence: true,
            skipColonelDeployment: false, // Keep colonels - they're the executors
            useDirectResponse: true, // Use lean, direct responses
            estimatedTokensSaved: totalSaved,
            contextUsage: this.calculateContextUsage(),
            reason: `Context at ${(this.calculateContextUsage() * 100).toFixed(1)}% - conserving ${totalSaved} tokens`
        };
    }

    /**
     * SIGNAL 1: WORD EMPHASIS EXTRACTION
     * Extract emphasized words from user's prompt
     *
     * @param {string} userPrompt - User's message
     * @returns {Object} Emphasis analysis
     */
    extractEmphasis(userPrompt) {
        const emphasis = {
            capitalized: [],      // CHAOS, PRODUCTION, LEGACY
            markdown: [],         // **important**, *emphasis*
            quoted: [],           // "exact phrase", 'specific term'
            repeated: [],         // words appearing 2+ times
            technical: []         // -CHAOS, _PATTERN, CamelCase
        };

        // 1. CAPITALIZED WORDS (2+ chars, all caps)
        const capsRegex = /\b[A-Z]{2,}\b/g;
        emphasis.capitalized = (userPrompt.match(capsRegex) || []);

        // 2. MARKDOWN EMPHASIS (**bold** or *italic*)
        const markdownRegex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
        let match;
        while ((match = markdownRegex.exec(userPrompt)) !== null) {
            emphasis.markdown.push(match[1] || match[2]);
        }

        // 3. QUOTED STRINGS ("double" or 'single')
        const quotedRegex = /["']([^"']+)["']/g;
        while ((match = quotedRegex.exec(userPrompt)) !== null) {
            emphasis.quoted.push(match[1]);
        }

        // 4. REPEATED WORDS (appears 2+ times, length > 3)
        const words = userPrompt.toLowerCase().split(/\s+/);
        const wordCount = {};
        words.forEach(word => {
            // Clean word (remove punctuation)
            const cleanWord = word.replace(/[.,!?;:()[\]{}]/g, '');
            if (cleanWord.length > 3) {
                wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
            }
        });
        emphasis.repeated = Object.keys(wordCount).filter(w => wordCount[w] >= 2);

        // 5. TECHNICAL PATTERNS
        // -SUFFIX (e.g., -CHAOS, -PRODUCTION)
        const suffixRegex = /-[A-Z][A-Za-z]+/g;
        const suffixes = (userPrompt.match(suffixRegex) || []);

        // _PREFIX (e.g., _PATTERN, _LEGACY)
        const prefixRegex = /_[A-Z][A-Za-z]+/g;
        const prefixes = (userPrompt.match(prefixRegex) || []);

        // CamelCase (e.g., CamelCase, PascalCase)
        const camelRegex = /\b[A-Z][a-z]+[A-Z][a-z]+\b/g;
        const camelCase = (userPrompt.match(camelRegex) || []);

        emphasis.technical = [...suffixes, ...prefixes, ...camelCase];

        return emphasis;
    }

    /**
     * SIGNAL 2: MEMORY CORRELATION
     * Score how well a candidate aligns with recent work
     *
     * @param {*} candidate - File path, intent, or suggestion to score
     * @param {string} candidateType - Type of candidate ('file', 'intent', 'suggestion')
     * @returns {Promise<Object>} Correlation score and reasons
     */
    async correlateWithMemory(candidate, candidateType = 'file') {
        // Load .memory-recent if not cached
        if (!this.memoryRecent) {
            this.memoryRecent = await this._loadMemoryRecent();
        }

        let correlationScore = 0;
        const reasons = [];

        // Extract all keywords and topics from top 5 recent sessions
        const recentKeywords = [];
        const recentTopics = [];

        for (const session of this.memoryRecent.recent_sessions.slice(0, 5)) {
            recentKeywords.push(...session.keywords);
            recentTopics.push(...session.key_topics);
        }

        // Get candidate text (normalize to lowercase)
        const candidateText = this._getCandidateText(candidate).toLowerCase();

        // Score based on keyword overlap
        for (const keyword of recentKeywords) {
            if (candidateText.includes(keyword.toLowerCase())) {
                correlationScore += 10;
                reasons.push(`Matches recent keyword: ${keyword}`);
            }
        }

        // Score based on topic overlap
        for (const topic of recentTopics) {
            const topicWords = topic.toLowerCase().split(/\s+/);
            for (const word of topicWords) {
                if (word.length > 4 && candidateText.includes(word)) {
                    correlationScore += 5;
                    reasons.push(`Matches recent topic: ${word}`);
                    break; // Only count once per topic
                }
            }
        }

        // Recency bonus (rank 1 = +20, rank 2 = +15, rank 3 = +12, etc.)
        for (let i = 0; i < this.memoryRecent.recent_sessions.length; i++) {
            const session = this.memoryRecent.recent_sessions[i];
            const sessionText = JSON.stringify(session).toLowerCase();

            if (sessionText.includes(candidateText) ||
                candidateText.includes(session.project.toLowerCase())) {
                const recencyBonus = Math.max(5, 20 - (i * 3)); // Decays with rank
                correlationScore += recencyBonus;
                reasons.push(`Mentioned in recent session rank ${i + 1} (+${recencyBonus})`);
            }
        }

        return {
            score: correlationScore,
            reasons: reasons
        };
    }

    /**
     * SIGNAL 3: CONVERSATION EVOLUTION
     * Track trajectory from conversation start to current message
     *
     * @param {string} currentPrompt - Current user message
     * @returns {Object} Evolution analysis
     */
    trackConversationEvolution(currentPrompt) {
        // Add current prompt to history
        this.conversationHistory.push({
            timestamp: Date.now(),
            prompt: currentPrompt,
            emphasis: this.extractEmphasis(currentPrompt)
        });

        // Analyze evolution
        const evolution = {
            trajectory: [],
            focusShift: null,
            persistentTopics: [],
            emergingTopics: []
        };

        if (this.conversationHistory.length < 2) {
            evolution.focusShift = 'INITIAL'; // First message
            return evolution;
        }

        // Track focus shifts (what changed between messages)
        const previousEmphasis = this.conversationHistory[this.conversationHistory.length - 2].emphasis;
        const currentEmphasis = this.conversationHistory[this.conversationHistory.length - 1].emphasis;

        // Collect all emphasized words from previous message
        const allPreviousWords = new Set([
            ...previousEmphasis.capitalized,
            ...previousEmphasis.markdown,
            ...previousEmphasis.quoted,
            ...previousEmphasis.technical
        ]);

        // Collect all emphasized words from current message
        const allCurrentWords = new Set([
            ...currentEmphasis.capitalized,
            ...currentEmphasis.markdown,
            ...currentEmphasis.quoted,
            ...currentEmphasis.technical
        ]);

        // Find emerging topics (new emphasized words)
        evolution.emergingTopics = Array.from(allCurrentWords).filter(w => !allPreviousWords.has(w));

        // Find persistent topics (carried over from previous)
        evolution.persistentTopics = Array.from(allCurrentWords).filter(w => allPreviousWords.has(w));

        // Detect focus shift
        if (evolution.emergingTopics.length > evolution.persistentTopics.length) {
            evolution.focusShift = 'NEW_TOPIC'; // User pivoted to new area
        } else if (evolution.persistentTopics.length > 0) {
            evolution.focusShift = 'REFINEMENT'; // User drilling deeper into same topic
        } else {
            evolution.focusShift = 'CONTINUATION'; // Similar focus
        }

        return evolution;
    }

    /**
     * SYNTHESIZE: Combine all 3 signals into unified context score
     *
     * @param {string} userPrompt - Current user message
     * @param {Array} candidates - Array of candidates to score
     * @param {string} candidateType - Type of candidates ('file', 'intent', 'suggestion')
     * @returns {Promise<Object>} Complete inference result
     */
    async inferContext(userPrompt, candidates, candidateType = 'file') {
        const startTime = Date.now();
        this.metrics.totalInferences++;

        // Signal 1: Word Emphasis
        const emphasis = this.extractEmphasis(userPrompt);

        // Signal 2: Track conversation evolution
        const evolution = this.trackConversationEvolution(userPrompt);

        // Signal 3: Score each candidate
        const scoredCandidates = [];

        for (const candidate of candidates) {
            let totalScore = 0;
            const scoringBreakdown = {
                emphasis: 0,
                memory: 0,
                evolution: 0,
                penalties: 0
            };

            const candidateText = this._getCandidateText(candidate).toLowerCase();

            // ═══════════════════════════════════════════════════════════════
            // EMPHASIS SCORING
            // ═══════════════════════════════════════════════════════════════

            // Capitalized words: +30 each (strong signal - user typed in CAPS)
            for (const word of emphasis.capitalized) {
                if (candidateText.includes(word.toLowerCase())) {
                    scoringBreakdown.emphasis += 30;
                }
            }

            // Markdown emphasis: +20 each (**bold** or *italic*)
            for (const word of emphasis.markdown) {
                if (candidateText.includes(word.toLowerCase())) {
                    scoringBreakdown.emphasis += 20;
                }
            }

            // Quoted strings: +25 each (exact intent - user quoted it)
            for (const phrase of emphasis.quoted) {
                if (candidateText.includes(phrase.toLowerCase())) {
                    scoringBreakdown.emphasis += 25;
                }
            }

            // Repeated words: +15 each (user keeps mentioning it)
            for (const word of emphasis.repeated) {
                if (candidateText.includes(word)) {
                    scoringBreakdown.emphasis += 15;
                }
            }

            // Technical patterns: +20 each (-CHAOS, _PATTERN, CamelCase)
            for (const pattern of emphasis.technical) {
                if (candidateText.includes(pattern.toLowerCase())) {
                    scoringBreakdown.emphasis += 20;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // MEMORY CORRELATION SCORING
            // ═══════════════════════════════════════════════════════════════

            const memoryCorrelation = await this.correlateWithMemory(candidate, candidateType);
            scoringBreakdown.memory = memoryCorrelation.score;

            // ═══════════════════════════════════════════════════════════════
            // EVOLUTION SCORING
            // ═══════════════════════════════════════════════════════════════

            // Persistent topics: +10 each (user still focused on this)
            for (const topic of evolution.persistentTopics) {
                if (candidateText.includes(topic.toLowerCase())) {
                    scoringBreakdown.evolution += 10;
                }
            }

            // Emerging topics: +15 each (new focus, high priority)
            for (const topic of evolution.emergingTopics) {
                if (candidateText.includes(topic.toLowerCase())) {
                    scoringBreakdown.evolution += 15;
                }
            }

            // ═══════════════════════════════════════════════════════════════
            // PENALTIES (ANTI-PATTERNS)
            // ═══════════════════════════════════════════════════════════════

            // Legacy/backup/archive folders: -30 (at start or middle of path)
            if (/(?:^|\/)(?:legacy|backup|archive|old)\//i.test(candidateText)) {
                scoringBreakdown.penalties -= 30;
            }

            // .backup extensions: -40
            if (/\.backup/i.test(candidateText)) {
                scoringBreakdown.penalties -= 40;
            }

            // OLD, DEPRECATED, ARCHIVE in filename: -25
            if (/\b(old|deprecated|archive|obsolete)\b/i.test(candidateText)) {
                scoringBreakdown.penalties -= 25;
            }

            // dist.backup-, *.backup-*, backup- prefixes: -35
            if (/backup-\d+/i.test(candidateText)) {
                scoringBreakdown.penalties -= 35;
            }

            // ═══════════════════════════════════════════════════════════════
            // TOTAL SCORE
            // ═══════════════════════════════════════════════════════════════

            totalScore = scoringBreakdown.emphasis +
                        scoringBreakdown.memory +
                        scoringBreakdown.evolution +
                        scoringBreakdown.penalties;

            scoredCandidates.push({
                candidate: candidate,
                contextScore: totalScore,
                breakdown: scoringBreakdown,
                confidence: Math.min(1.0, Math.max(0.0, totalScore / 100)), // Normalize to 0-1
                memoryReasons: memoryCorrelation.reasons
            });
        }

        // Sort by score (highest first)
        scoredCandidates.sort((a, b) => b.contextScore - a.contextScore);

        const duration = Date.now() - startTime;
        this._updateMetrics(duration);

        return {
            scoredCandidates: scoredCandidates,
            emphasis: emphasis,
            evolution: evolution,
            winner: scoredCandidates[0] || null,
            confidence: scoredCandidates[0]?.confidence || 0,
            duration: duration
        };
    }

    /**
     * Get text representation of candidate
     * @private
     */
    _getCandidateText(candidate) {
        if (typeof candidate === 'string') {
            return candidate;
        }
        if (candidate.path) {
            return candidate.path;
        }
        if (candidate.name) {
            return candidate.name;
        }
        if (candidate.file) {
            return candidate.file;
        }
        return JSON.stringify(candidate);
    }

    /**
     * Load .memory-recent.json
     * @private
     */
    async _loadMemoryRecent() {
        // Try multiple paths (core/ vs root)
        const possiblePaths = [
            path.join(__dirname, '../memory/.memory-recent.json'), // From core/
            path.join(__dirname, '../../memory/.memory-recent.json'), // From root
            path.join(process.cwd(), '.claude/memory/.memory-recent.json') // Absolute from cwd
        ];

        for (const memoryRecentPath of possiblePaths) {
            try {
                const content = await fs.readFile(memoryRecentPath, 'utf-8');
                return JSON.parse(content);
            } catch (error) {
                // Try next path
                continue;
            }
        }

        console.warn('⚠️  CIE: Could not load .memory-recent.json from any known path');
        return { recent_sessions: [] }; // Graceful degradation
    }

    /**
     * Update performance metrics
     * @private
     */
    _updateMetrics(duration) {
        const totalDuration = this.metrics.avgDuration * (this.metrics.totalInferences - 1) + duration;
        this.metrics.avgDuration = totalDuration / this.metrics.totalInferences;
    }

    /**
     * Reset conversation history (new session)
     */
    resetConversation() {
        this.conversationHistory = [];
        console.log('🧠 CIE: Conversation history reset');
    }

    /**
     * PHASE -1 STAGE 0: TEMPORAL QUERY FAST-PATH DETECTION
     * Detects temporal queries that should immediately trigger .memory-recent.json lookup
     * Executes BEFORE message classification for instant cold-start context
     *
     * @param {string} userPrompt - User's message
     * @returns {Object} Detection result { isTemporal: bool, pattern: string|null, confidence: 0-1 }
     */
    detectTemporalQuery(userPrompt) {
        const result = {
            isTemporal: false,
            pattern: null,
            confidence: 0.0
        };

        // TEMPORAL QUERY PATTERNS (cold start context retrieval)
        const temporalPatterns = [
            { regex: /\bwhere\s+(did\s+)?we\s+stop\b/i, name: 'where_stop', confidence: 0.95 },
            { regex: /\blast\s+(session|time|conversation|work)\b/i, name: 'last_session', confidence: 0.95 },
            { regex: /\bwhat\s+did\s+we\s+(do|work\s+on|discuss)\b/i, name: 'what_did_we', confidence: 0.90 },
            { regex: /\brecent\s+(work|activity|sessions?|conversations?)\b/i, name: 'recent_work', confidence: 0.90 },
            { regex: /\bprevious\s+(session|conversation|work)\b/i, name: 'previous_session', confidence: 0.90 },
            { regex: /\bcontinue\s+(from\s+)?(where|last|yesterday)\b/i, name: 'continue_from', confidence: 0.85 },
            { regex: /\bpick\s+up\s+where\b/i, name: 'pick_up_where', confidence: 0.95 },
            { regex: /\bresume\s+(our\s+)?(work|conversation|session)\b/i, name: 'resume_work', confidence: 0.85 },
            { regex: /\bwhat\s+were\s+we\s+(doing|working\s+on|discussing)\b/i, name: 'what_were_we', confidence: 0.90 },
            { regex: /\bshow\s+(me\s+)?(recent|past|previous)\s+(sessions?|work|conversations?)\b/i, name: 'show_recent', confidence: 0.85 }
        ];

        // Test each pattern
        for (const { regex, name, confidence } of temporalPatterns) {
            if (regex.test(userPrompt)) {
                result.isTemporal = true;
                result.pattern = name;
                result.confidence = confidence;
                return result; // Return immediately on first match
            }
        }

        return result;
    }

    /**
     * PHASE -1 COGNITIVE ROUTING: MESSAGE TYPE CLASSIFICATION
     * Determines if user message is conversational, task-oriented, or progress query
     *
     * @param {string} userPrompt - User's message
     * @returns {Object} Classification result with confidence and detected patterns
     */
    classifyMessageType(userPrompt) {
        const classification = {
            type: 'conversational', // Default assumption
            confidence: 0,
            patterns: {
                task_oriented: [],
                conversational: [],
                progress: []
            }
        };

        const lowerPrompt = userPrompt.toLowerCase();

        // PROGRESS KEYWORDS (Temporal + Status queries) - HIGHEST PRIORITY
        const progressKeywords = [
            'where did we stop', 'where did i stop', 'where were we',
            'last session', 'last time', 'last conversation', 'last work', 'last memory',
            'recent work', 'recent activity', 'recent sessions', 'recent conversations',
            'previous session', 'previous conversation', 'previous work',
            'what did we do', 'what did we work on', 'what did we discuss',
            'yesterday', 'latest', 'newest', 'progress',
            'continue from', 'pick up where', 'resume', 'show me recent',
            'most visited', 'most frequent', 'frequently worked on',
            'pull from', 'retrieve from', 'recall'
        ];

        // COMBINATION PATTERNS (requires 2+ keywords together)
        const combinationPatterns = [
            { words: ['what was', 'conversation'], boost: 25 },
            { words: ['what was', 'session'], boost: 25 },
            { words: ['what was', 'work'], boost: 25 },
            { words: ['what was', 'last'], boost: 25 },
            { words: ['where', 'stop'], boost: 25 },
            { words: ['where', 'left'], boost: 25 },
            { words: ['what', 'recent'], boost: 20 },
            { words: ['show', 'history'], boost: 20 }
        ];

        // TASK-ORIENTED KEYWORDS (Action verbs from Semantic Category Learner)
        const taskKeywords = [
            'audit', 'fix', 'check', 'test', 'implement', 'deploy', 'create',
            'build', 'update', 'refactor', 'optimize', 'debug', 'add', 'remove',
            'modify', 'change', 'improve', 'enhance', 'configure', 'setup',
            'install', 'run', 'execute', 'launch', 'delete', 'restore', 'backup',
            'migrate', 'merge', 'commit', 'review', 'analyze', 'validate'
        ];

        // CONVERSATIONAL KEYWORDS (Temporal + Question patterns)
        const conversationalKeywords = [
            'how do you', 'what do you think', 'can you explain', 'tell me about',
            'why does', 'when should', 'where is', 'who did', 'which one',
            'do you prefer', 'what if', 'is it possible', 'could we', 'would you',
            'show me', 'help me understand', 'i wonder', 'curious about'
        ];

        // Count progress patterns (HIGHEST PRIORITY)
        let progressScore = 0;
        for (const keyword of progressKeywords) {
            if (lowerPrompt.includes(keyword)) {
                progressScore += 20; // Higher weight than conversational/task
                classification.patterns.progress.push(keyword);
            }
        }

        // Check combination patterns (multiple keywords together = stronger signal)
        for (const pattern of combinationPatterns) {
            const allWordsPresent = pattern.words.every(word => lowerPrompt.includes(word));
            if (allWordsPresent) {
                progressScore += pattern.boost;
                classification.patterns.progress.push(`combination: ${pattern.words.join(' + ')}`);
            }
        }

        // Count task-oriented patterns
        let taskScore = 0;
        for (const keyword of taskKeywords) {
            if (lowerPrompt.includes(keyword)) {
                taskScore += 10;
                classification.patterns.task_oriented.push(keyword);
            }
        }

        // Count conversational patterns
        let conversationalScore = 0;
        for (const keyword of conversationalKeywords) {
            if (lowerPrompt.includes(keyword)) {
                conversationalScore += 10;
                classification.patterns.conversational.push(keyword);
            }
        }

        // Question marks often indicate conversational (but not if progress pattern exists)
        const questionMarks = (userPrompt.match(/\?/g) || []).length;
        if (questionMarks > 0 && progressScore === 0) {
            conversationalScore += questionMarks * 5;
            classification.patterns.conversational.push(`${questionMarks} question mark(s)`);
        }

        // Imperative sentences (start with verb) suggest task-oriented
        const firstWord = lowerPrompt.trim().split(/\s+/)[0];
        if (taskKeywords.includes(firstWord)) {
            taskScore += 15; // Bonus for imperative
            classification.patterns.task_oriented.push(`imperative: ${firstWord}`);
        }

        // Determine classification (PRECEDENCE: progress > task > conversational)
        if (progressScore > 0 && progressScore >= Math.max(taskScore, conversationalScore)) {
            classification.type = 'progress';
            classification.confidence = Math.min(95, progressScore);
        } else if (taskScore > conversationalScore) {
            classification.type = 'task_oriented';
            classification.confidence = Math.min(95, taskScore);
        } else if (conversationalScore > taskScore) {
            classification.type = 'conversational';
            classification.confidence = Math.min(95, conversationalScore);
        } else {
            // Ambiguous - default to conversational with low confidence
            classification.type = 'conversational';
            classification.confidence = 30;
        }

        return classification;
    }

    /**
     * PHASE -1.5 SECURITY VALIDATION: PROMPT GUARDIAN INTEGRATION
     * Validates user prompt against reverse engineering patterns
     * Injected BEFORE mode routing to act as security gatekeeper
     *
     * @param {string} userPrompt - User's message
     * @returns {Object} Security validation result {threat, intent, confidence, reasoning, shouldBlock}
     */
    validateSecurity(userPrompt) {
        const result = {
            threat: false,
            intent: 'legitimate',
            confidence: 0.0,
            reasoning: '',
            shouldBlock: false
        };

        // ============================================
        // 🆕 ESMC 4.1.1 (2025-11-20): 2-TIER ARCHITECTURE
        // TIER 1: Noun-based blocking (HIGHEST PRIORITY)
        // TIER 2: Verb-based filtering (SECONDARY)
        // Nouns are direct indicators - checked BEFORE all verb patterns
        // ============================================

        // ============================================
        // TIER 1: NOUN-BASED BLOCKING (HIGHEST PRIORITY)
        // Check FIRST - if ANY architecture noun detected with ESMC keyword, BLOCK
        // ============================================

        const architectureNounPatterns = [
            // ESMC keyword + architecture noun (forward, up to 50 chars between)
            // Includes internal component names (athena, echelon, colonel, etc.)
            /(esmc|chaos|echelon|athena|epsilon|colonel|blessing)\s.{0,50}(components?|architectures?|structures?|internals?|files?|modules?|systems?|frameworks?|manifests?|protocols?|mechanics?|logics?|algorithms?|codes?|sources?|schemas?|blueprints?|implementations?|athena|echelon|colonels?|epsilon|chaos|blessing|guardian|mesh|piu|dki|uip|pca)/i,

            // Architecture noun + ESMC keyword (reverse, up to 50 chars between)
            /(components?|architectures?|structures?|internals?|files?|modules?|systems?|frameworks?|manifests?|protocols?|mechanics?|logics?|algorithms?|codes?|sources?|schemas?|blueprints?|implementations?|athena|echelon|colonels?|epsilon|chaos|blessing|guardian|mesh|piu|dki|uip|pca).{0,50}(esmc|chaos|echelon|athena|epsilon|colonel|blessing)/i,

            // Possessive forms: "ESMC's components", "chaos's architecture"
            /(esmc|chaos)['']s\s+(components?|architectures?|structures?|internals?|files?|modules?|systems?|frameworks?|manifests?|protocols?|logics?|algorithms?|codes?|schemas?|blueprints?|athena|echelon|colonels?|epsilon|guardian|mesh)/i,

            // "of ESMC" constructions: "components of ESMC", "architecture of chaos"
            /(components?|architectures?|structures?|internals?|files?|modules?|systems?|frameworks?|manifests?|protocols?|logics?|algorithms?|codes?|schemas?|blueprints?|athena|echelon|colonels?|epsilon|guardian|mesh)\s+of\s+(esmc|chaos)/i,

            // Direct "build/create ESMC [internal component]" patterns
            // Catches: "build me ESMC ATHENA", "create ESMC colonel", etc.
            /(build|create|design|make|implement)\s+(me\s+)?(esmc|an?\s+esmc)\s+(athena|echelon|colonels?|epsilon|chaos|blessing|guardian|mesh|piu|dki|uip|pca|components?|architectures?|systems?|frameworks?)/i
        ];

        // TIER 1: Check noun patterns FIRST (blocks even if 'build' present)
        for (const pattern of architectureNounPatterns) {
            if (pattern.test(userPrompt)) {
                result.threat = true;
                result.intent = 'reverse_engineering';
                result.confidence = 0.95;
                result.reasoning = 'Architecture noun detected - direct request to extract ESMC proprietary architecture';
                result.shouldBlock = true;
                return result;
            }
        }

        // ============================================
        // TIER 2: VERB-BASED FILTERING (SECONDARY)
        // Only checked if TIER 1 passes (no architecture nouns)
        // ============================================

        // 🛡️ REVERSE ENGINEERING VERBS (explicit RE attempts)
        const reverseEngineeringVerbs = [
            /decrypt\s+(esmc|chaos)\s+components?/i,
            /deobfuscate\s+(esmc|chaos)/i,
            /decompile\s+(esmc|chaos)/i,
            /reverse\s+engineer\s+(esmc|chaos)/i
        ];

        // TIER 2: Check RE verbs
        for (const pattern of reverseEngineeringVerbs) {
            if (pattern.test(userPrompt)) {
                result.threat = true;
                result.intent = 'reverse_engineering';
                result.confidence = 0.95;
                result.reasoning = 'Direct reverse engineering verb detected';
                result.shouldBlock = true;
                return result;
            }
        }

        // 🧠 DEBUGGING PATTERNS (Legitimate - don't block)
        const debuggingPatterns = [
            /why\s+(won't|doesn't|isn't)\s+(esmc|chaos)/i,
            /(esmc|chaos)\s+(not|won't|doesn't|isn't)\s+working/i,
            /debug\s+(esmc|chaos)/i,
            /fix\s+(my|the)\s+(esmc|chaos)/i,
            /(esmc|chaos)\s+error/i,
            /troubleshoot\s+(esmc|chaos)/i
        ];

        // TIER 2: Check debugging patterns (allow)
        for (const pattern of debuggingPatterns) {
            if (pattern.test(userPrompt)) {
                result.threat = false;
                result.intent = 'debugging';
                result.confidence = 0.88;
                result.reasoning = 'User troubleshooting their own ESMC installation';
                result.shouldBlock = false;
                return result;
            }
        }

        // 💡 LEGITIMATE DEVELOPMENT PATTERNS (Building own system)
        // Now safe because TIER 1 already blocked architecture noun combinations
        const legitimateDevelopmentPatterns = [
            /build|create|design|implement|develop/i,
            /my\s+(app|project|system|code)/i,
            /for\s+my/i,
            /help\s+me\s+(build|create|design)/i,
            /how\s+(do|can)\s+i\s+(build|create|make)/i
        ];

        // TIER 2: Check legitimate dev patterns (allow)
        for (const pattern of legitimateDevelopmentPatterns) {
            if (pattern.test(userPrompt)) {
                result.threat = false;
                result.intent = 'legitimate_dev';
                result.confidence = 0.9;
                result.reasoning = 'User building their own system, not extracting ESMC internals';
                result.shouldBlock = false;
                return result;
            }
        }

        // ⚠️ HEURISTIC FALLBACK: ESMC + architecture terms = suspicious
        const hasESMCReference = /esmc|chaos|blessing|colonel|echelon|athena/i.test(userPrompt);
        const hasArchitectureTerms = /architecture|structure|internal|component|module|file|implementation|code/i.test(userPrompt);

        if (hasESMCReference && hasArchitectureTerms) {
            result.threat = true;
            result.intent = 'reverse_engineering';
            result.confidence = 0.75;
            result.reasoning = 'ESMC-specific architecture inquiry without clear legitimate purpose';
            result.shouldBlock = true;
            return result;
        }

        // ✅ DEFAULT: Allow (no threat detected)
        result.threat = false;
        result.intent = 'unrelated';
        result.confidence = 0.7;
        result.reasoning = 'No reverse engineering indicators detected';
        result.shouldBlock = false;
        return result;
    }

    /**
     * PHASE -1 COGNITIVE ROUTING: MODE TRIGGER DETECTION
     * Detects special mode triggers (seed, ESMC) with precedence rules
     *
     * @param {string} userPrompt - User's message
     * @returns {Object} Trigger detection result with mode and manifest path
     */
    detectModeTrigger(userPrompt) {
        const result = {
            trigger_found: false,
            mode: 'lightweight', // Default mode
            manifest: './.claude/ESMC Complete/core/BRAIN.md',
            trigger_keyword: null,
            precedence: 3 // 1 = highest (seed), 2 = medium (ESMC), 3 = default
        };

        // PRECEDENCE 1: "echo" or "seed" trigger (AEGIS echo/seed mode)
        if (/\b(echo|seed)\b/i.test(userPrompt)) {
            const keyword = /\becho\b/i.test(userPrompt) ? 'echo' : 'seed';
            result.trigger_found = true;
            result.mode = keyword; // Preserve semantic distinction
            result.manifest = './.claude/ESMC-Chaos/components/8a61c26c.md';
            result.trigger_keyword = keyword;
            result.precedence = 1;
            return result; // Highest priority - return immediately
        }

        // PRECEDENCE 2: "ESMC" or "esmc" trigger (Full deployment mode)
        if (/\besmc\b/i.test(userPrompt)) {
            result.trigger_found = true;
            result.mode = 'full_deployment';
            result.manifest = './.claude/ESMC Complete/core/BRAIN.md';
            result.trigger_keyword = 'ESMC';
            result.precedence = 2;
            return result;
        }

        // PRECEDENCE 3: Default (Lightweight mode - CORE manifest)
        // Already set in default values above
        return result;
    }

    /**
     * PROGRESS PRESENTATION: Format warm, user-friendly progress report
     * Generates chronological + frequency-based views of recent work
     *
     * @param {Object} memoryRecentData - Content from .memory-recent.json
     * @param {number} topN - Number of entries to show (default: 10)
     * @returns {string} Formatted progress report (markdown)
     */
    formatProgressPresentation(memoryRecentData, topN = 10) {
        if (!memoryRecentData || !memoryRecentData.recent_sessions || memoryRecentData.recent_sessions.length === 0) {
            return `📅 No recent conversations found. Let's start fresh!`;
        }

        const sessions = memoryRecentData.recent_sessions;

        // ═══════════════════════════════════════════════════════════════
        // PART 1: LATEST CONVERSATIONS (Chronological - by timestamp)
        // ═══════════════════════════════════════════════════════════════

        const chronological = [...sessions]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, topN);

        let output = `📅 **Latest Conversations** (by time):\n\n`;

        chronological.forEach((session, idx) => {
            const date = new Date(session.timestamp);
            const dateStr = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

            // Truncate project name if too long
            const projectName = session.project.length > 60
                ? session.project.substring(0, 57) + '...'
                : session.project;

            output += `${idx + 1}. **[${dateStr}]** ${projectName}\n`;
        });

        // ═══════════════════════════════════════════════════════════════
        // PART 2: MOST VISITED CONVERSATIONS (by retrieval_count)
        // ═══════════════════════════════════════════════════════════════

        // Filter sessions with retrieval_count > 0, then sort descending
        const frequentSessions = sessions
            .filter(s => s.retrieval_count && s.retrieval_count > 0)
            .sort((a, b) => b.retrieval_count - a.retrieval_count)
            .slice(0, 7); // Top 7 most visited

        if (frequentSessions.length > 0) {
            output += `\n⭐ **Most Visited Conversations** (by frequency):\n\n`;

            frequentSessions.forEach((session, idx) => {
                const date = new Date(session.timestamp);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const projectName = session.project.length > 50
                    ? session.project.substring(0, 47) + '...'
                    : session.project;

                const visits = session.retrieval_count || 0;
                const visitText = visits === 1 ? '1 visit' : `${visits} visits`;

                output += `${idx + 1}. **[${visitText}]** ${projectName} (${dateStr})\n`;
            });

            output += `\n💡 *Tip: Sessions you've revisited multiple times appear here - these might be your focus areas!*\n`;
        }

        return output;
    }

    /**
     * Get CIE status and metrics
     */
    getStatus() {
        return {
            componentId: this.componentId,
            componentName: this.componentName,
            version: this.version,
            metrics: {
                totalInferences: this.metrics.totalInferences,
                cacheHits: this.metrics.cacheHits,
                avgDuration: `${this.metrics.avgDuration.toFixed(2)}ms`,
                conversationLength: this.conversationHistory.length
            },
            memoryRecentLoaded: this.memoryRecent !== null,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { ContextInferenceEngine };

// Example usage / Testing
if (require.main === module) {
    console.log("🧠 ESMC 3.13 - Context Inference Engine Test\n");

    (async () => {
        const cie = new ContextInferenceEngine();

        // Test scenario: sync-production-to-sdk duplicate file selection
        const userPrompt = "Update the sync-production-to-sdk CHAOS script";

        const candidates = [
            { path: 'Legacy/sync-production-to-sdk.js' },
            { path: 'sync-production-to-sdk-CHAOS.js' }
        ];

        console.log(`User Prompt: "${userPrompt}"\n`);

        const result = await cie.inferContext(userPrompt, candidates, 'file');

        console.log('📊 CONTEXT INFERENCE RESULTS:\n');
        console.log(`Emphasis Detected:`);
        console.log(`  Capitalized: ${result.emphasis.capitalized.join(', ') || 'None'}`);
        console.log(`  Technical Patterns: ${result.emphasis.technical.join(', ') || 'None'}`);
        console.log(`  Repeated Words: ${result.emphasis.repeated.join(', ') || 'None'}\n`);

        console.log(`Evolution:`);
        console.log(`  Focus Shift: ${result.evolution.focusShift}`);
        console.log(`  Emerging Topics: ${result.evolution.emergingTopics.join(', ') || 'None'}\n`);

        console.log(`Scored Candidates:`);
        result.scoredCandidates.forEach((scored, idx) => {
            console.log(`\n  ${idx + 1}. ${scored.candidate.path}`);
            console.log(`     Total Score: ${scored.contextScore}`);
            console.log(`     Breakdown:`);
            console.log(`       - Emphasis: ${scored.breakdown.emphasis}`);
            console.log(`       - Memory: ${scored.breakdown.memory}`);
            console.log(`       - Evolution: ${scored.breakdown.evolution}`);
            console.log(`       - Penalties: ${scored.breakdown.penalties}`);
            console.log(`     Confidence: ${(scored.confidence * 100).toFixed(0)}%`);
            if (scored.memoryReasons.length > 0) {
                console.log(`     Memory Reasons: ${scored.memoryReasons.join('; ')}`);
            }
        });

        console.log(`\n✅ WINNER: ${result.winner.candidate.path}`);
        console.log(`   Score: ${result.winner.contextScore} | Confidence: ${(result.winner.confidence * 100).toFixed(0)}%`);
        console.log(`\n⏱️  Inference Duration: ${result.duration}ms`);

    })();
}
