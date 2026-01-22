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
/**
 * ESMC 3.58 - CUP Signal Extractor
 * Continuous Passive Profiling - Message-Level Signal Extraction
 *
 * Extracts behavioral signals from user messages for profile enhancement:
 * - Vocabulary complexity (Flesch-Kincaid)
 * - Question patterns (interrogative/declarative/imperative)
 * - Discourse markers frequency
 * - Hedging language patterns
 * - Technical density
 * - Conversation flow behavior
 * - Education level proxies
 *
 * @version 3.58.0
 * @component CUP (Contextual User Profiling)
 * @date 2025-11-02
 */

const fs = require('fs');
const path = require('path');

class SignalExtractor {
  constructor() {
    this.bufferPath = path.join(__dirname, '../../memory/.user-profiling-buffer.json');

    // Discourse markers vocabulary
    this.discourseMarkers = [
      'however', 'therefore', 'actually', 'basically', 'essentially',
      'furthermore', 'moreover', 'nevertheless', 'consequently', 'thus',
      'hence', 'indeed', 'meanwhile', 'likewise', 'otherwise'
    ];

    // Hedging patterns
    this.hedgingPatterns = [
      'maybe', 'probably', 'possibly', 'perhaps', 'might', 'could',
      'i think', 'i believe', 'seems like', 'sort of', 'kind of',
      'somewhat', 'fairly', 'rather', 'pretty much', 'i guess'
    ];

    // Technical indicators (common tech terms)
    this.technicalTerms = [
      'algorithm', 'implementation', 'architecture', 'optimization',
      'deployment', 'integration', 'framework', 'protocol', 'module',
      'component', 'interface', 'api', 'database', 'token', 'buffer',
      'asynchronous', 'synchronous', 'regression', 'validation', 'profiling'
    ];
  }

  /**
   * Main extraction function - analyzes a single user message
   * @param {string} message - User message text
   * @returns {object} Extracted signals
   */
  extractSignals(message) {
    if (!message || typeof message !== 'string') {
      return null;
    }

    const signals = {
      vocabulary_complexity: this._calculateFleschKincaid(message),
      question_pattern: this._detectQuestionType(message),
      discourse_markers: this._countDiscourseMarkers(message),
      hedging_language: this._detectHedging(message),
      technical_density: this._calculateTechnicalDensity(message),
      conversation_flow: this._analyzeConversationFlow(message),
      education_proxy: this._estimateEducationLevel(message),
      metadata: {
        word_count: this._countWords(message),
        sentence_count: this._countSentences(message),
        character_count: message.length,
        timestamp: new Date().toISOString()
      }
    };

    return signals;
  }

  /**
   * Flesch-Kincaid Grade Level calculation
   * Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
   */
  _calculateFleschKincaid(text) {
    const words = this._countWords(text);
    const sentences = this._countSentences(text);
    const syllables = this._countSyllables(text);

    if (sentences === 0 || words === 0) return 0;

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    return Math.max(0, Math.round(gradeLevel * 10) / 10); // Round to 1 decimal
  }

  /**
   * Detect question type (interrogative/declarative/imperative)
   */
  _detectQuestionType(text) {
    const hasQuestionMark = text.includes('?');
    const startsWithQuestion = /^(what|why|how|when|where|who|which|can|could|would|should|is|are|do|does)/i.test(text.trim());
    const startsWithImperative = /^(use|create|implement|fix|update|add|remove|delete|run|execute|test|validate)/i.test(text.trim());

    if (hasQuestionMark || startsWithQuestion) {
      return 'interrogative';
    } else if (startsWithImperative) {
      return 'imperative';
    } else {
      return 'declarative';
    }
  }

  /**
   * Count discourse markers
   */
  _countDiscourseMarkers(text) {
    const lowerText = text.toLowerCase();
    const found = {};
    let totalCount = 0;

    this.discourseMarkers.forEach(marker => {
      const regex = new RegExp(`\\b${marker}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        found[marker] = matches.length;
        totalCount += matches.length;
      }
    });

    return { markers: found, total_count: totalCount };
  }

  /**
   * Detect hedging language patterns
   */
  _detectHedging(text) {
    const lowerText = text.toLowerCase();
    const found = {};
    let totalCount = 0;

    this.hedgingPatterns.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/\s+/g, '\\s+'), 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        found[pattern] = matches.length;
        totalCount += matches.length;
      }
    });

    return { patterns: found, total_count: totalCount };
  }

  /**
   * Calculate technical term density (terms per 100 words)
   */
  _calculateTechnicalDensity(text) {
    const lowerText = text.toLowerCase();
    const wordCount = this._countWords(text);
    let technicalCount = 0;
    const foundTerms = [];

    this.technicalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        technicalCount += matches.length;
        foundTerms.push({ term, count: matches.length });
      }
    });

    const density = wordCount > 0 ? (technicalCount / wordCount) * 100 : 0;

    return {
      density: Math.round(density * 10) / 10,
      technical_count: technicalCount,
      word_count: wordCount,
      terms_found: foundTerms
    };
  }

  /**
   * Analyze conversation flow (depth vs pivot)
   */
  _analyzeConversationFlow(text) {
    // Simple heuristics for now
    const hasContinuation = /\b(also|additionally|furthermore|moreover|and)\b/i.test(text);
    const hasPivot = /\b(but|however|although|instead|rather|wait|actually)\b/i.test(text);
    const hasMetaCognition = /\b(i think|i realize|i notice|looking at|considering)\b/i.test(text);

    return {
      has_continuation: hasContinuation,
      has_pivot: hasPivot,
      has_meta_cognition: hasMetaCognition,
      inferred_style: hasPivot ? 'pivot' : (hasContinuation ? 'depth_persistence' : 'neutral')
    };
  }

  /**
   * Estimate education level proxy
   */
  _estimateEducationLevel(text) {
    const words = this._countWords(text);
    const sentences = this._countSentences(text);
    const syllables = this._countSyllables(text);
    const complexWords = this._countComplexWords(text);

    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const avgSyllablesPerWord = words > 0 ? syllables / words : 0;
    const complexWordRatio = words > 0 ? (complexWords / words) * 100 : 0;

    let estimatedLevel = 'unknown';
    if (avgSyllablesPerWord < 1.3 && avgWordsPerSentence < 12) {
      estimatedLevel = 'basic';
    } else if (avgSyllablesPerWord < 1.6 && avgWordsPerSentence < 18) {
      estimatedLevel = 'intermediate';
    } else if (avgSyllablesPerWord < 2.0 && avgWordsPerSentence < 25) {
      estimatedLevel = 'advanced';
    } else {
      estimatedLevel = 'expert';
    }

    return {
      avg_words_per_sentence: Math.round(avgWordsPerSentence * 10) / 10,
      avg_syllables_per_word: Math.round(avgSyllablesPerWord * 100) / 100,
      complex_word_ratio: Math.round(complexWordRatio * 10) / 10,
      estimated_level: estimatedLevel
    };
  }

  /**
   * Utility: Count words
   */
  _countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Utility: Count sentences
   */
  _countSentences(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return Math.max(1, sentences.length);
  }

  /**
   * Utility: Count syllables (simple heuristic)
   */
  _countSyllables(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let syllableCount = 0;

    words.forEach(word => {
      // Simple syllable counting: count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g);
      syllableCount += vowelGroups ? vowelGroups.length : 1;

      // Adjust for silent 'e' at end
      if (word.endsWith('e') && word.length > 2) {
        syllableCount--;
      }

      // Minimum 1 syllable per word
      if (syllableCount < 1) syllableCount = 1;
    });

    return syllableCount;
  }

  /**
   * Utility: Count complex words (3+ syllables)
   */
  _countComplexWords(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let complexCount = 0;

    words.forEach(word => {
      const vowelGroups = word.match(/[aeiouy]+/g);
      let syllables = vowelGroups ? vowelGroups.length : 1;

      if (word.endsWith('e') && word.length > 2) syllables--;
      if (syllables < 1) syllables = 1;

      if (syllables >= 3) complexCount++;
    });

    return complexCount;
  }

  /**
   * Append signals to buffer
   */
  appendToBuffer(signals) {
    try {
      // Read current buffer
      let buffer = JSON.parse(fs.readFileSync(this.bufferPath, 'utf8'));

      // Increment message count
      buffer.message_count++;

      // Append vocabulary complexity
      buffer.signals.vocabulary_complexity.samples.push({
        grade_level: signals.vocabulary_complexity,
        timestamp: signals.metadata.timestamp
      });

      // Update question patterns
      const qType = signals.question_pattern;
      buffer.signals.question_patterns[`${qType}_count`]++;

      // Update discourse markers
      Object.entries(signals.discourse_markers.markers).forEach(([marker, count]) => {
        buffer.signals.discourse_markers.markers[marker] =
          (buffer.signals.discourse_markers.markers[marker] || 0) + count;
      });
      buffer.signals.discourse_markers.total_count += signals.discourse_markers.total_count;
      buffer.signals.discourse_markers.unique_markers = Object.keys(buffer.signals.discourse_markers.markers).length;

      // Update hedging language
      Object.entries(signals.hedging_language.patterns).forEach(([pattern, count]) => {
        buffer.signals.hedging_language.patterns[pattern] =
          (buffer.signals.hedging_language.patterns[pattern] || 0) + count;
      });

      // Update technical density
      buffer.signals.technical_density.samples.push({
        density: signals.technical_density.density,
        terms: signals.technical_density.terms_found,
        timestamp: signals.metadata.timestamp
      });

      // Update conversation flow
      buffer.signals.conversation_flow.total_exchanges++;
      if (signals.conversation_flow.has_continuation && !signals.conversation_flow.has_pivot) {
        buffer.signals.conversation_flow.depth_persistence_count++;
      } else if (signals.conversation_flow.has_pivot) {
        buffer.signals.conversation_flow.pivot_count++;
      }
      if (signals.conversation_flow.has_meta_cognition) {
        buffer.signals.conversation_flow.meta_cognition_count++;
      }

      // Update education proxy
      buffer.signals.education_level_proxy = signals.education_proxy;

      // Write back to buffer
      fs.writeFileSync(this.bufferPath, JSON.stringify(buffer, null, 2));

      return { success: true, message_count: buffer.message_count };
    } catch (error) {
      console.error('❌ Buffer append error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node 9a1b110a.js "<message>"');
    console.log('Example: node 9a1b110a.js "How does continuous profiling work?"');
    process.exit(1);
  }

  const message = args.join(' ');
  const extractor = new SignalExtractor();

  console.log('🔍 ESMC 3.58 - Signal Extractor');
  console.log(`📝 Analyzing message: "${message.substring(0, 50)}..."`);

  const signals = extractor.extractSignals(message);

  if (signals) {
    console.log('\n✅ Signals extracted:');
    console.log(`   Vocabulary: Grade ${signals.vocabulary_complexity} (Flesch-Kincaid)`);
    console.log(`   Question Type: ${signals.question_pattern}`);
    console.log(`   Discourse Markers: ${signals.discourse_markers.total_count} found`);
    console.log(`   Hedging Patterns: ${signals.hedging_language.total_count} found`);
    console.log(`   Technical Density: ${signals.technical_density.density}% (${signals.technical_density.technical_count} terms)`);
    console.log(`   Education Level: ${signals.education_proxy.estimated_level}`);
    console.log(`   Flow Style: ${signals.conversation_flow.inferred_style}`);

    // Append to buffer
    const result = extractor.appendToBuffer(signals);
    if (result.success) {
      console.log(`\n✅ Appended to buffer (total messages: ${result.message_count})`);
    }

    // Output JSON for programmatic use
    console.log('\n' + JSON.stringify(signals, null, 2));
  } else {
    console.error('❌ Failed to extract signals');
    process.exit(1);
  }
}

module.exports = SignalExtractor;
