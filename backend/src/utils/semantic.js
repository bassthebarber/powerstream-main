// backend/src/utils/semantic.js
// Semantic analysis utilities for content understanding
// Stub implementation - can be upgraded with embeddings later

import { logger } from "../config/logger.js";

/**
 * Common stop words to filter out
 */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "can", "this", "that",
  "these", "those", "i", "you", "he", "she", "it", "we", "they", "my",
  "your", "his", "her", "its", "our", "their", "what", "which", "who",
  "when", "where", "why", "how", "all", "each", "every", "both", "few",
  "more", "most", "other", "some", "such", "no", "not", "only", "same",
  "so", "than", "too", "very", "just", "also", "now", "here", "there",
]);

/**
 * Topic categories for content classification
 */
const TOPIC_CATEGORIES = {
  music: ["song", "music", "beat", "track", "album", "artist", "singer", "rap", "hiphop", "rnb", "jazz", "rock", "pop", "producer", "studio", "recording", "lyrics"],
  entertainment: ["movie", "film", "show", "tv", "series", "episode", "actor", "actress", "celebrity", "drama", "comedy", "thriller"],
  sports: ["game", "player", "team", "score", "win", "championship", "football", "basketball", "soccer", "baseball", "tennis", "golf"],
  tech: ["app", "software", "code", "developer", "programming", "tech", "computer", "phone", "digital", "ai", "startup"],
  lifestyle: ["food", "travel", "fashion", "style", "beauty", "fitness", "health", "wellness", "home", "decor"],
  news: ["breaking", "news", "report", "update", "happening", "today", "world", "local", "politics"],
  gaming: ["game", "gaming", "player", "stream", "esports", "console", "pc", "xbox", "playstation", "nintendo"],
  art: ["art", "design", "creative", "artist", "painting", "drawing", "photography", "visual"],
};

/**
 * Semantic utilities
 */
const semanticUtils = {
  /**
   * Extract keywords from text
   */
  extractKeywords(text, limit = 10) {
    if (!text || typeof text !== "string") return [];
    
    // Normalize and tokenize
    const words = text
      .toLowerCase()
      .replace(/[^\w\s#@]/g, " ") // Keep hashtags and mentions
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));
    
    // Count word frequency
    const wordCounts = {};
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    // Sort by frequency and return top keywords
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  },
  
  /**
   * Extract hashtags from text
   */
  extractHashtags(text) {
    if (!text || typeof text !== "string") return [];
    
    const hashtagPattern = /#(\w+)/g;
    const matches = text.match(hashtagPattern) || [];
    
    return matches.map(tag => tag.slice(1).toLowerCase());
  },
  
  /**
   * Extract mentions from text
   */
  extractMentions(text) {
    if (!text || typeof text !== "string") return [];
    
    const mentionPattern = /@(\w+)/g;
    const matches = text.match(mentionPattern) || [];
    
    return matches.map(mention => mention.slice(1).toLowerCase());
  },
  
  /**
   * Classify text into topics
   */
  classifyTopics(text) {
    if (!text || typeof text !== "string") return [];
    
    const words = text.toLowerCase().split(/\s+/);
    const topicScores = {};
    
    for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
      topicScores[topic] = 0;
      for (const word of words) {
        if (keywords.includes(word)) {
          topicScores[topic]++;
        }
      }
    }
    
    // Return topics with at least one match, sorted by score
    return Object.entries(topicScores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);
  },
  
  /**
   * Extract topics from content metadata
   */
  extractTopicsFromContent(content) {
    const topics = [];
    
    // From title
    if (content.title) {
      topics.push(...this.extractKeywords(content.title, 5));
      topics.push(...this.classifyTopics(content.title));
    }
    
    // From description/caption
    if (content.description || content.caption) {
      const text = content.description || content.caption;
      topics.push(...this.extractKeywords(text, 5));
      topics.push(...this.classifyTopics(text));
    }
    
    // From hashtags
    if (content.hashtags) {
      if (Array.isArray(content.hashtags)) {
        topics.push(...content.hashtags.map(h => h.toLowerCase().replace("#", "")));
      } else if (typeof content.hashtags === "string") {
        topics.push(...this.extractHashtags(content.hashtags));
      }
    }
    
    // From body text
    if (content.body || content.text || content.content) {
      const text = content.body || content.text || content.content;
      topics.push(...this.extractKeywords(text, 5));
    }
    
    // From category/genre
    if (content.category) topics.push(content.category.toLowerCase());
    if (content.genre) topics.push(content.genre.toLowerCase());
    
    // Deduplicate and return
    return [...new Set(topics)];
  },
  
  /**
   * Calculate text similarity (simple word overlap)
   * Returns score between 0 and 1
   */
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(this.extractKeywords(text1, 20));
    const words2 = new Set(this.extractKeywords(text2, 20));
    
    if (words1.size === 0 || words2.size === 0) return 0;
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  },
  
  /**
   * Get content fingerprint (for deduplication)
   */
  getContentFingerprint(text) {
    if (!text || typeof text !== "string") return "";
    
    const keywords = this.extractKeywords(text, 10);
    return keywords.sort().join("|");
  },
  
  /**
   * Check if content is potentially duplicate
   */
  isPotentialDuplicate(text1, text2, threshold = 0.6) {
    return this.calculateSimilarity(text1, text2) >= threshold;
  },
  
  /**
   * Extract named entities (simple implementation)
   */
  extractEntities(text) {
    if (!text || typeof text !== "string") return { mentions: [], hashtags: [], links: [] };
    
    return {
      mentions: this.extractMentions(text),
      hashtags: this.extractHashtags(text),
      links: text.match(/https?:\/\/[^\s]+/g) || [],
    };
  },
  
  /**
   * Get content summary metrics
   */
  getContentMetrics(text) {
    if (!text || typeof text !== "string") {
      return { wordCount: 0, charCount: 0, sentenceCount: 0 };
    }
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      wordCount: words.length,
      charCount: text.length,
      sentenceCount: sentences.length,
      avgWordLength: words.length > 0 
        ? words.reduce((sum, w) => sum + w.length, 0) / words.length 
        : 0,
    };
  },
};

export default semanticUtils;

