// backend/src/services/recommendation.service.js
// Enhanced recommendation service with Interest Graph + Creator Score + ML integration
import eventsRepository from "../domain/repositories/events.repository.js";
import relationshipsRepository from "../domain/repositories/relationships.repository.js";
import { logger } from "../config/logger.js";
import env from "../config/env.js";
import { setCache, getCache } from "../config/redis.js";

// Late imports for advanced services (to avoid circular deps)
let interestGraphService, creatorScoreService;
const loadAdvancedServices = async () => {
  if (!interestGraphService) {
    try {
      interestGraphService = (await import("./interestGraph.service.js")).default;
    } catch (e) { /* not available yet */ }
  }
  if (!creatorScoreService) {
    try {
      creatorScoreService = (await import("./creatorScore.service.js")).default;
    } catch (e) { /* not available yet */ }
  }
};

const RECOMMENDATION_CACHE_TTL = 300; // 5 minutes

/**
 * Recommendation service
 * Combines rule-based ranking with optional ML service calls
 */
const recommendationService = {
  /**
   * Get recommended feed for a user
   * @param {string} userId 
   * @param {object} options - { limit, offset, freshnessBias, engagementBias }
   */
  async getRecommendedFeedForUser(userId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      freshnessBias = 0.3,
      engagementBias = 0.4,
      relationshipBias = 0.3,
      interestBias = 0.2,
    } = options;
    
    // Check cache first
    const cacheKey = `rec:feed:${userId}:${limit}:${offset}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for recommendations: ${userId}`);
      return cached;
    }
    
    // Load advanced services
    await loadAdvancedServices();
    
    try {
      // Try ML service first if available
      if (env.ML_SERVICE_URL) {
        try {
          // Get user interest data for ML
          let userFeatures = null;
          if (interestGraphService) {
            userFeatures = await interestGraphService.getContentRecommendationFactors(userId);
          }
          
          const mlResults = await this.callMLService(userId, { 
            limit, 
            offset,
            userFeatures,
          });
          
          if (mlResults && mlResults.length > 0) {
            await setCache(cacheKey, mlResults, RECOMMENDATION_CACHE_TTL);
            return mlResults;
          }
        } catch (err) {
          logger.warn("ML service unavailable, falling back to rules:", err.message);
        }
      }
      
      // Fallback to enhanced rule-based recommendations
      const results = await this.getRuleBasedRecommendations(userId, {
        limit,
        offset,
        freshnessBias,
        engagementBias,
        relationshipBias,
        interestBias,
      });
      
      await setCache(cacheKey, results, RECOMMENDATION_CACHE_TTL);
      return results;
    } catch (err) {
      logger.error("Recommendation error:", err.message);
      return [];
    }
  },
  
  /**
   * Enhanced rule-based recommendation algorithm
   * Combines engagement, freshness, relationships, interests, and creator scores
   */
  async getRuleBasedRecommendations(userId, options) {
    const { limit, offset, freshnessBias, engagementBias, relationshipBias, interestBias } = options;
    
    // Get user's following list
    const following = await relationshipsRepository.getFollowing(userId, { limit: 100 });
    const followingIds = following.map(f => f.targetId?._id || f.targetId);
    
    // Get trending content
    const trending = await eventsRepository.getTrending("post", 24, 50);
    
    // Get user interests (if service available)
    let userInterests = [];
    if (interestGraphService) {
      try {
        userInterests = await interestGraphService.getTopTopicsForUser(userId, 10);
      } catch (e) { /* ignore */ }
    }
    const interestTopics = userInterests.map(i => i.topic);
    
    // Get top creators (if service available)
    let topCreators = [];
    if (creatorScoreService) {
      try {
        topCreators = await creatorScoreService.getTopCreatorsByScore(20);
      } catch (e) { /* ignore */ }
    }
    const topCreatorIds = topCreators.map(c => c.userId?.toString()).filter(Boolean);
    
    // Combine and score content
    const contentIds = new Set();
    const scoredContent = [];
    
    // Add trending content with engagement score
    for (const item of trending) {
      const itemId = item._id.toString();
      if (!contentIds.has(itemId)) {
        contentIds.add(itemId);
        
        let score = item.score * engagementBias;
        
        // Boost for followed creators
        if (item.userId && followingIds.includes(item.userId.toString())) {
          score += 30 * relationshipBias;
        }
        
        // Boost for top creators
        if (item.userId && topCreatorIds.includes(item.userId.toString())) {
          score += 20 * engagementBias;
        }
        
        // Boost for matching interests
        if (item.hashtags && interestTopics.length > 0) {
          const matchingTopics = (item.hashtags || []).filter(h => 
            interestTopics.includes(h.toLowerCase())
          );
          score += matchingTopics.length * 15 * interestBias;
        }
        
        scoredContent.push({
          id: item._id,
          score,
          source: "trending",
        });
      }
    }
    
    // Sort by score and paginate
    scoredContent.sort((a, b) => b.score - a.score);
    
    return scoredContent.slice(offset, offset + limit).map(c => c.id);
  },
  
  /**
   * Call ML microservice for recommendations
   */
  async callMLService(userId, options) {
    try {
      const response = await fetch(`${env.ML_SERVICE_URL}/rank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          limit: options.limit,
          offset: options.offset,
        }),
        timeout: 5000,
      });
      
      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }
      
      const data = await response.json();
      return data.recommendations || [];
    } catch (err) {
      throw err;
    }
  },
  
  /**
   * Get similar content to a given item
   */
  async getSimilarContent(entityType, entityId, limit = 10) {
    // Get engagement data for the item
    const stats = await eventsRepository.getContentMetrics(entityType, entityId);
    
    // Get users who engaged with this content
    // TODO: Find other content these users engaged with
    
    // For now, return trending in the same category
    return eventsRepository.getTrending(entityType, 48, limit);
  },
  
  /**
   * Get "You might like" suggestions based on user activity
   */
  async getPersonalizedSuggestions(userId, limit = 10) {
    // Get user's recent activity
    const activity = await eventsRepository.getUserActivity(userId, 100);
    
    // Analyze patterns
    const entityCounts = {};
    const typeCounts = {};
    
    for (const event of activity) {
      entityCounts[event.entityType] = (entityCounts[event.entityType] || 0) + 1;
      typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
    }
    
    // Find most engaged entity type
    const topEntityType = Object.entries(entityCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "post";
    
    // Get trending in that category
    return eventsRepository.getTrending(topEntityType, 24, limit);
  },
  
  /**
   * Calculate engagement score for content
   */
  calculateEngagementScore(metrics) {
    const weights = {
      post_view: 1,
      like: 3,
      comment: 5,
      share: 10,
      save: 4,
    };
    
    let score = 0;
    for (const [type, weight] of Object.entries(weights)) {
      score += (metrics[type]?.count || 0) * weight;
    }
    
    return score;
  },
  
  /**
   * Calculate freshness score (decays over time)
   */
  calculateFreshnessScore(createdAt, halfLifeHours = 24) {
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return Math.pow(0.5, ageHours / halfLifeHours);
  },
};

export default recommendationService;

