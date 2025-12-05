// backend/src/services/creatorScore.service.js
// Creator Score System Service
import CreatorStats from "../domain/models/CreatorStats.model.js";
import { EVENT_TYPES, ENTITY_TYPES } from "../domain/models/Event.model.js";
import { logger } from "../config/logger.js";

/**
 * Event to stat mapping
 */
const EVENT_STAT_MAP = {
  [EVENT_TYPES.POST_VIEW]: { stat: "totalViews", amount: 1 },
  [EVENT_TYPES.VIDEO_VIEW]: { stat: "totalViews", amount: 1 },
  [EVENT_TYPES.REEL_VIEW]: { stat: "totalViews", amount: 1 },
  [EVENT_TYPES.LIKE]: { stat: "totalLikes", amount: 1 },
  [EVENT_TYPES.COMMENT]: { stat: "totalComments", amount: 1 },
  [EVENT_TYPES.SHARE]: { stat: "totalShares", amount: 1 },
  [EVENT_TYPES.SAVE]: { stat: "totalSaves", amount: 1 },
  [EVENT_TYPES.FOLLOW]: { stat: "followerCount", amount: 1 },
  [EVENT_TYPES.UNFOLLOW]: { stat: "followerCount", amount: -1 },
  [EVENT_TYPES.COIN_TIP]: { stat: "totalTipsReceived", amount: 1 },
  [EVENT_TYPES.REPORT]: { stat: "reportsCount", amount: 1 },
};

/**
 * Content type to count field mapping
 */
const CONTENT_TYPE_COUNT_MAP = {
  [ENTITY_TYPES.POST]: "postCount",
  [ENTITY_TYPES.REEL]: "reelCount",
  [ENTITY_TYPES.STORY]: "storyCount",
  [ENTITY_TYPES.TRACK]: "trackCount",
  [ENTITY_TYPES.BEAT]: "beatCount",
  [ENTITY_TYPES.STREAM]: "streamCount",
};

/**
 * Creator Score Service
 * Manages creator statistics and reputation scoring
 */
const creatorScoreService = {
  /**
   * Update creator stats based on an event
   */
  async updateCreatorStatsFromEvent(event) {
    try {
      const { type, targetUserId, entityType, metadata } = event;
      
      // Events that affect the content creator (targetUserId)
      if (targetUserId) {
        const mapping = EVENT_STAT_MAP[type];
        if (mapping) {
          await CreatorStats.incrementStat(targetUserId, mapping.stat, mapping.amount);
          
          // Update tip amount if it's a tip event
          if (type === EVENT_TYPES.COIN_TIP && metadata?.amount) {
            await CreatorStats.incrementStat(targetUserId, "totalTipsAmount", metadata.amount);
          }
        }
      }
      
      return true;
    } catch (err) {
      logger.error("Creator stats update failed:", err.message);
      return false;
    }
  },
  
  /**
   * Increment content count for a creator
   */
  async incrementContentCount(userId, entityType) {
    const field = CONTENT_TYPE_COUNT_MAP[entityType];
    if (field) {
      await CreatorStats.incrementStat(userId, field, 1);
    }
    return true;
  },
  
  /**
   * Compute creator score for a user
   */
  async computeCreatorScore(userId) {
    return CreatorStats.computeScore(userId);
  },
  
  /**
   * Get creator stats
   */
  async getCreatorStats(userId) {
    return CreatorStats.getOrCreate(userId);
  },
  
  /**
   * Get top creators by score
   */
  async getTopCreatorsByScore(limit = 50, tier = null) {
    return CreatorStats.getTopCreators(limit, tier);
  },
  
  /**
   * Get creator tier
   */
  async getCreatorTier(userId) {
    const stats = await CreatorStats.getOrCreate(userId);
    return {
      tier: stats.tier,
      score: stats.creatorScore,
      nextTierAt: this.getNextTierThreshold(stats.tier),
      progress: this.getTierProgress(stats),
    };
  },
  
  /**
   * Get threshold for next tier
   */
  getNextTierThreshold(currentTier) {
    const thresholds = {
      bronze: 35,
      silver: 55,
      gold: 75,
      platinum: 90,
      diamond: 100,
    };
    return thresholds[currentTier] || 100;
  },
  
  /**
   * Get progress to next tier
   */
  getTierProgress(stats) {
    const tierMinimums = {
      bronze: 0,
      silver: 35,
      gold: 55,
      platinum: 75,
      diamond: 90,
    };
    
    const current = tierMinimums[stats.tier] || 0;
    const next = this.getNextTierThreshold(stats.tier);
    const range = next - current;
    
    if (range === 0) return 100;
    
    return Math.min(100, Math.round(((stats.creatorScore - current) / range) * 100));
  },
  
  /**
   * Update watch time for a creator's content
   */
  async addWatchTime(creatorId, seconds) {
    return CreatorStats.incrementStat(creatorId, "totalWatchTime", seconds);
  },
  
  /**
   * Update streak for a creator
   */
  async updateStreak(userId) {
    const stats = await CreatorStats.getOrCreate(userId);
    
    const now = new Date();
    const lastActive = stats.lastActiveAt;
    
    if (!lastActive) {
      stats.currentStreak = 1;
      stats.daysActive = 1;
    } else {
      const daysSinceActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
      
      if (daysSinceActive === 0) {
        // Same day, no change
      } else if (daysSinceActive === 1) {
        // Consecutive day
        stats.currentStreak += 1;
        stats.daysActive += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        // Streak broken
        stats.currentStreak = 1;
        stats.daysActive += 1;
      }
    }
    
    stats.lastActiveAt = now;
    await stats.save();
    
    return stats;
  },
  
  /**
   * Recalculate all creator scores (batch job)
   */
  async recalculateAllScores() {
    try {
      const stats = await CreatorStats.find({});
      let updated = 0;
      
      for (const stat of stats) {
        await CreatorStats.computeScore(stat.userId);
        updated++;
      }
      
      logger.info(`Creator score recalculation completed: ${updated} creators updated`);
      return updated;
    } catch (err) {
      logger.error("Creator score recalculation failed:", err.message);
      return 0;
    }
  },
  
  /**
   * Get leaderboard
   */
  async getLeaderboard(options = {}) {
    const { limit = 100, tier = null, category = null } = options;
    
    const query = {};
    if (tier) query.tier = tier;
    
    const creators = await CreatorStats.find(query)
      .populate("userId", "name avatarUrl")
      .sort({ creatorScore: -1 })
      .limit(limit)
      .lean();
    
    return creators.map((c, index) => ({
      rank: index + 1,
      userId: c.userId?._id || c.userId,
      name: c.userId?.name || "Unknown",
      avatarUrl: c.userId?.avatarUrl,
      score: c.creatorScore,
      tier: c.tier,
      stats: {
        followers: c.followerCount,
        views: c.totalViews,
        engagement: c.engagementRate,
      },
    }));
  },
  
  /**
   * Get creator analytics
   */
  async getCreatorAnalytics(userId, days = 30) {
    const stats = await CreatorStats.getOrCreate(userId);
    
    // Get daily snapshots for the period
    const snapshots = stats.dailySnapshots.slice(-days);
    
    // Calculate growth
    const firstSnapshot = snapshots[0];
    const lastSnapshot = snapshots[snapshots.length - 1];
    
    const growth = firstSnapshot && lastSnapshot ? {
      views: lastSnapshot.views - firstSnapshot.views,
      likes: lastSnapshot.likes - firstSnapshot.likes,
      followers: lastSnapshot.followers - firstSnapshot.followers,
      scoreChange: lastSnapshot.score - firstSnapshot.score,
    } : null;
    
    return {
      current: {
        score: stats.creatorScore,
        tier: stats.tier,
        breakdown: stats.scoreBreakdown,
      },
      totals: {
        views: stats.totalViews,
        likes: stats.totalLikes,
        comments: stats.totalComments,
        shares: stats.totalShares,
        followers: stats.followerCount,
        tips: stats.totalTipsAmount,
      },
      growth,
      history: snapshots,
      streak: {
        current: stats.currentStreak,
        longest: stats.longestStreak,
      },
    };
  },
};

export default creatorScoreService;

