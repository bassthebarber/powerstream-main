// backend/src/services/interestGraph.service.js
// Real-Time Interest Graph (RIIG) Service
import InterestProfile from "../domain/models/InterestProfile.model.js";
import { EVENT_TYPES, ENTITY_TYPES } from "../domain/models/Event.model.js";
import { logger } from "../config/logger.js";

/**
 * Interest weights by event type
 */
const INTEREST_WEIGHTS = {
  [EVENT_TYPES.POST_VIEW]: 1,
  [EVENT_TYPES.VIDEO_VIEW]: 1.5,
  [EVENT_TYPES.REEL_VIEW]: 1.5,
  [EVENT_TYPES.STORY_VIEW]: 0.5,
  [EVENT_TYPES.LIKE]: 3,
  [EVENT_TYPES.COMMENT]: 5,
  [EVENT_TYPES.SHARE]: 7,
  [EVENT_TYPES.SAVE]: 4,
  [EVENT_TYPES.FOLLOW]: 10,
  [EVENT_TYPES.STREAM_JOIN]: 2,
  [EVENT_TYPES.COIN_TIP]: 8,
};

/**
 * Content type weights for preference tracking
 */
const CONTENT_TYPE_MAP = {
  [ENTITY_TYPES.POST]: "posts",
  [ENTITY_TYPES.REEL]: "reels",
  [ENTITY_TYPES.STORY]: "stories",
  [ENTITY_TYPES.STREAM]: "streams",
  [ENTITY_TYPES.TRACK]: "music",
  [ENTITY_TYPES.STATION]: "tv",
};

/**
 * Interest Graph Service
 * Manages user interest profiles and provides personalization data
 */
const interestGraphService = {
  /**
   * Update interests based on an event
   */
  async updateInterestsFromEvent(event) {
    try {
      const { userId, type, entityType, metadata } = event;
      
      if (!userId) return null;
      
      // Get weight for this event type
      const weight = INTEREST_WEIGHTS[type] || 1;
      
      // Extract topics from metadata
      const topics = this.extractTopicsFromMetadata(metadata);
      
      // Update topic scores
      for (const topic of topics) {
        await InterestProfile.updateTopicScore(userId, topic, weight);
      }
      
      // Update content type preference
      const contentType = CONTENT_TYPE_MAP[entityType];
      if (contentType) {
        await InterestProfile.updateContentPreference(userId, contentType, weight);
      }
      
      // Record activity hour
      const hour = new Date().getHours();
      await InterestProfile.recordActivityHour(userId, hour);
      
      return true;
    } catch (err) {
      logger.error("Interest graph update failed:", err.message);
      return false;
    }
  },
  
  /**
   * Extract topics from event metadata
   */
  extractTopicsFromMetadata(metadata) {
    const topics = [];
    
    if (!metadata) return topics;
    
    // Extract hashtags
    if (metadata.hashtags && Array.isArray(metadata.hashtags)) {
      topics.push(...metadata.hashtags.map(h => h.toLowerCase().replace("#", "")));
    }
    
    // Extract category
    if (metadata.category) {
      topics.push(metadata.category.toLowerCase());
    }
    
    // Extract genre
    if (metadata.genre) {
      topics.push(metadata.genre.toLowerCase());
    }
    
    // Extract keywords from title
    if (metadata.title) {
      const keywords = this.extractKeywords(metadata.title);
      topics.push(...keywords);
    }
    
    return [...new Set(topics)]; // Deduplicate
  },
  
  /**
   * Extract keywords from text (simple implementation)
   */
  extractKeywords(text) {
    if (!text) return [];
    
    // Stop words to filter out
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
      "being", "have", "has", "had", "do", "does", "did", "will", "would",
      "could", "should", "may", "might", "must", "can", "this", "that",
      "these", "those", "i", "you", "he", "she", "it", "we", "they",
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Take top 5 keywords
  },
  
  /**
   * Get user interest profile
   */
  async getUserInterestProfile(userId) {
    return InterestProfile.getOrCreate(userId);
  },
  
  /**
   * Get top topics for a user
   */
  async getTopTopicsForUser(userId, limit = 10) {
    return InterestProfile.getTopTopics(userId, limit);
  },
  
  /**
   * Get users with similar interests
   */
  async getSimilarUsers(userId, limit = 20) {
    try {
      const userTopics = await this.getTopTopicsForUser(userId, 5);
      if (userTopics.length === 0) return [];
      
      const topTopicNames = userTopics.map(t => t.topic);
      
      // Find users with similar top topics
      const similarProfiles = await InterestProfile.aggregate([
        { $match: { userId: { $ne: userId } } },
        { $addFields: { topicsArray: { $objectToArray: "$topics" } } },
        { $unwind: "$topicsArray" },
        { $match: { "topicsArray.k": { $in: topTopicNames } } },
        {
          $group: {
            _id: "$userId",
            matchScore: { $sum: "$topicsArray.v.score" },
            matchingTopics: { $push: "$topicsArray.k" },
          },
        },
        { $sort: { matchScore: -1 } },
        { $limit: limit },
      ]);
      
      return similarProfiles;
    } catch (err) {
      logger.error("Get similar users failed:", err.message);
      return [];
    }
  },
  
  /**
   * Get content recommendations based on interests
   */
  async getContentRecommendationFactors(userId) {
    const profile = await InterestProfile.getOrCreate(userId);
    
    const topTopics = await this.getTopTopicsForUser(userId, 10);
    
    return {
      topics: topTopics.map(t => ({ name: t.topic, weight: t.score / 100 })),
      contentPreferences: profile.contentPreferences,
      engagementStyle: profile.engagementStyle,
      peakHours: profile.peakHours,
      preferredDuration: profile.preferredDuration,
    };
  },
  
  /**
   * Check if user is interested in a topic
   */
  async isUserInterestedIn(userId, topic) {
    const profile = await InterestProfile.findOne({ userId });
    if (!profile) return false;
    
    const topicData = profile.topics.get(topic.toLowerCase());
    return topicData && topicData.score > 20;
  },
  
  /**
   * Decay old interest scores (run periodically)
   */
  async decayAllInterests() {
    try {
      const profiles = await InterestProfile.find({});
      let updated = 0;
      
      for (const profile of profiles) {
        let needsUpdate = false;
        const now = Date.now();
        
        profile.topics.forEach((value, key) => {
          const hoursSinceUpdate = (now - new Date(value.lastUpdated).getTime()) / (1000 * 60 * 60);
          if (hoursSinceUpdate > 24) {
            const decayFactor = Math.exp(-hoursSinceUpdate / 168);
            value.score = Math.max(0, value.score * decayFactor);
            needsUpdate = true;
          }
        });
        
        if (needsUpdate) {
          await profile.save();
          updated++;
        }
      }
      
      logger.info(`Interest decay completed: ${updated} profiles updated`);
      return updated;
    } catch (err) {
      logger.error("Interest decay failed:", err.message);
      return 0;
    }
  },
  
  /**
   * Update engagement style for user
   */
  async updateEngagementStyle(userId) {
    return InterestProfile.updateEngagementStyle(userId);
  },
};

export default interestGraphService;

