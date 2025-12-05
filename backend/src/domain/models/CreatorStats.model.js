// backend/src/domain/models/CreatorStats.model.js
// Creator Score System - Tracks creator performance and calculates reputation score
import mongoose from "mongoose";

/**
 * Creator Stats Model
 * Aggregates creator performance metrics for ranking and recommendations
 */
const CreatorStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    
    // Content metrics
    postCount: { type: Number, default: 0, min: 0 },
    reelCount: { type: Number, default: 0, min: 0 },
    storyCount: { type: Number, default: 0, min: 0 },
    trackCount: { type: Number, default: 0, min: 0 },
    beatCount: { type: Number, default: 0, min: 0 },
    streamCount: { type: Number, default: 0, min: 0 },
    
    // Engagement metrics
    totalViews: { type: Number, default: 0, min: 0 },
    totalWatchTime: { type: Number, default: 0, min: 0 }, // in seconds
    totalLikes: { type: Number, default: 0, min: 0 },
    totalComments: { type: Number, default: 0, min: 0 },
    totalShares: { type: Number, default: 0, min: 0 },
    totalSaves: { type: Number, default: 0, min: 0 },
    
    // Audience metrics
    followerCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    averageViewsPerPost: { type: Number, default: 0, min: 0 },
    engagementRate: { type: Number, default: 0, min: 0, max: 100 },
    
    // Monetization metrics
    totalTipsReceived: { type: Number, default: 0, min: 0 },
    totalTipsAmount: { type: Number, default: 0, min: 0 }, // in PowerCoins
    subscriberCount: { type: Number, default: 0, min: 0 },
    
    // Quality signals
    reportsCount: { type: Number, default: 0, min: 0 },
    warningsCount: { type: Number, default: 0, min: 0 },
    contentRemovalCount: { type: Number, default: 0, min: 0 },
    
    // Retention metrics
    averageWatchPercentage: { type: Number, default: 0, min: 0, max: 100 },
    repeatViewerRate: { type: Number, default: 0, min: 0, max: 100 },
    
    // Consistency metrics
    daysActive: { type: Number, default: 0, min: 0 },
    lastActiveAt: Date,
    averagePostsPerWeek: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 }, // consecutive days posting
    currentStreak: { type: Number, default: 0, min: 0 },
    
    // Computed score (0-100)
    creatorScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    
    // Score breakdown
    scoreBreakdown: {
      engagement: { type: Number, default: 0 },
      consistency: { type: Number, default: 0 },
      retention: { type: Number, default: 0 },
      growth: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
    },
    
    // Tier based on score
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond"],
      default: "bronze",
    },
    
    // Last score calculation
    lastScoreUpdate: Date,
    
    // Historical snapshots (last 30 days)
    dailySnapshots: [
      {
        date: Date,
        views: Number,
        likes: Number,
        followers: Number,
        score: Number,
      },
    ],
  },
  {
    timestamps: true,
    collection: "creator_stats",
  }
);

// Indexes
CreatorStatsSchema.index({ creatorScore: -1 });
CreatorStatsSchema.index({ tier: 1, creatorScore: -1 });
CreatorStatsSchema.index({ totalViews: -1 });
CreatorStatsSchema.index({ followerCount: -1 });

// Static methods
CreatorStatsSchema.statics = {
  /**
   * Get or create stats for user
   */
  async getOrCreate(userId) {
    let stats = await this.findOne({ userId });
    if (!stats) {
      stats = await this.create({ userId });
    }
    return stats;
  },
  
  /**
   * Increment a stat
   */
  async incrementStat(userId, statName, amount = 1) {
    const validStats = [
      "postCount", "reelCount", "storyCount", "trackCount", "beatCount", "streamCount",
      "totalViews", "totalWatchTime", "totalLikes", "totalComments", "totalShares", "totalSaves",
      "followerCount", "totalTipsReceived", "totalTipsAmount", "subscriberCount",
      "reportsCount", "warningsCount", "contentRemovalCount",
    ];
    
    if (!validStats.includes(statName)) return null;
    
    return this.findOneAndUpdate(
      { userId },
      {
        $inc: { [statName]: amount },
        $set: { lastActiveAt: new Date() },
      },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Compute creator score
   */
  async computeScore(userId) {
    const stats = await this.getOrCreate(userId);
    
    // Engagement score (0-25)
    const totalContent = stats.postCount + stats.reelCount + stats.storyCount + stats.trackCount;
    const engagementPerContent = totalContent > 0
      ? (stats.totalLikes + stats.totalComments * 2 + stats.totalShares * 3) / totalContent
      : 0;
    const engagementScore = Math.min(25, engagementPerContent * 2);
    
    // Consistency score (0-25)
    const consistencyScore = Math.min(25, (
      (stats.averagePostsPerWeek * 3) +
      (stats.currentStreak * 0.5) +
      (stats.daysActive * 0.1)
    ));
    
    // Retention score (0-20)
    const retentionScore = Math.min(20, (
      (stats.averageWatchPercentage * 0.15) +
      (stats.repeatViewerRate * 0.05)
    ));
    
    // Growth score (0-20)
    const growthScore = Math.min(20, (
      Math.log10(stats.followerCount + 1) * 5 +
      Math.log10(stats.totalViews + 1) * 2
    ));
    
    // Quality score (0-10) - penalized by reports
    const reportPenalty = Math.min(10, stats.reportsCount * 2 + stats.contentRemovalCount * 5);
    const qualityScore = Math.max(0, 10 - reportPenalty);
    
    // Total score
    const totalScore = Math.round(
      engagementScore + consistencyScore + retentionScore + growthScore + qualityScore
    );
    
    // Determine tier
    let tier = "bronze";
    if (totalScore >= 90) tier = "diamond";
    else if (totalScore >= 75) tier = "platinum";
    else if (totalScore >= 55) tier = "gold";
    else if (totalScore >= 35) tier = "silver";
    
    // Update stats
    stats.creatorScore = totalScore;
    stats.tier = tier;
    stats.scoreBreakdown = {
      engagement: engagementScore,
      consistency: consistencyScore,
      retention: retentionScore,
      growth: growthScore,
      quality: qualityScore,
    };
    stats.lastScoreUpdate = new Date();
    
    // Add daily snapshot
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingSnapshot = stats.dailySnapshots.find(
      s => new Date(s.date).getTime() === today.getTime()
    );
    
    if (!existingSnapshot) {
      stats.dailySnapshots.push({
        date: today,
        views: stats.totalViews,
        likes: stats.totalLikes,
        followers: stats.followerCount,
        score: totalScore,
      });
      
      // Keep only last 30 days
      if (stats.dailySnapshots.length > 30) {
        stats.dailySnapshots.shift();
      }
    }
    
    await stats.save();
    return stats;
  },
  
  /**
   * Get top creators by score
   */
  async getTopCreators(limit = 50, tier = null) {
    const query = tier ? { tier } : {};
    
    return this.find(query)
      .populate("userId", "name avatarUrl")
      .sort({ creatorScore: -1 })
      .limit(limit)
      .lean();
  },
  
  /**
   * Update engagement rate
   */
  async updateEngagementRate(userId) {
    const stats = await this.getOrCreate(userId);
    
    const totalContent = stats.postCount + stats.reelCount + stats.storyCount;
    if (totalContent === 0 || stats.followerCount === 0) {
      stats.engagementRate = 0;
    } else {
      const totalEngagements = stats.totalLikes + stats.totalComments + stats.totalShares;
      stats.engagementRate = Math.min(100, (totalEngagements / totalContent / stats.followerCount) * 100);
    }
    
    await stats.save();
    return stats;
  },
};

export default mongoose.model("CreatorStats", CreatorStatsSchema);

