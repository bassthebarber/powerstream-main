// backend/src/domain/models/InterestProfile.model.js
// Real-Time Interest Graph (RIIG) - User interest tracking for recommendations
import mongoose from "mongoose";

/**
 * Interest topic schema - tracks score and decay for each topic
 */
const TopicScoreSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0, min: 0, max: 100 },
    interactions: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Interest Profile Model
 * Tracks user interests across all content types for personalized recommendations
 */
const InterestProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    
    // Topic-based interests (music genres, content categories, etc.)
    topics: {
      type: Map,
      of: TopicScoreSchema,
      default: new Map(),
    },
    
    // Content type preferences (weighted by engagement)
    contentPreferences: {
      posts: { type: Number, default: 0 },
      reels: { type: Number, default: 0 },
      stories: { type: Number, default: 0 },
      streams: { type: Number, default: 0 },
      music: { type: Number, default: 0 },
      tv: { type: Number, default: 0 },
    },
    
    // Engagement patterns
    engagementStyle: {
      type: String,
      enum: ["passive_consumer", "active_engager", "creator", "social_butterfly", "lurker"],
      default: "passive_consumer",
    },
    
    // Peak activity hours (0-23)
    peakHours: [{ type: Number, min: 0, max: 23 }],
    
    // Preferred content length (for videos/reels)
    preferredDuration: {
      short: { type: Number, default: 0 }, // <30 sec
      medium: { type: Number, default: 0 }, // 30s-3min
      long: { type: Number, default: 0 }, // 3min+
    },
    
    // Creators the user engages with most
    topCreators: [
      {
        creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        engagementScore: { type: Number, default: 0 },
        lastEngaged: Date,
      },
    ],
    
    // Total interactions for normalization
    totalInteractions: { type: Number, default: 0 },
    
    // Last recalculation timestamp
    lastRecalculated: Date,
  },
  {
    timestamps: true,
    collection: "interest_profiles",
  }
);

// Indexes
InterestProfileSchema.index({ "topics.score": -1 });
InterestProfileSchema.index({ updatedAt: -1 });

// Static methods
InterestProfileSchema.statics = {
  /**
   * Get or create interest profile for user
   */
  async getOrCreate(userId) {
    let profile = await this.findOne({ userId });
    if (!profile) {
      profile = await this.create({ userId });
    }
    return profile;
  },
  
  /**
   * Update topic score based on interaction
   */
  async updateTopicScore(userId, topic, interactionWeight = 1) {
    const profile = await this.getOrCreate(userId);
    
    const normalizedTopic = topic.toLowerCase().trim();
    const currentTopic = profile.topics.get(normalizedTopic) || {
      score: 0,
      interactions: 0,
      lastUpdated: new Date(),
    };
    
    // Apply decay based on time since last update
    const hoursSinceUpdate = (Date.now() - new Date(currentTopic.lastUpdated).getTime()) / (1000 * 60 * 60);
    const decayFactor = Math.exp(-hoursSinceUpdate / 168); // 1-week half-life
    
    // Calculate new score with decay and new interaction
    const decayedScore = currentTopic.score * decayFactor;
    const newScore = Math.min(100, decayedScore + interactionWeight * 5);
    
    profile.topics.set(normalizedTopic, {
      score: newScore,
      interactions: currentTopic.interactions + 1,
      lastUpdated: new Date(),
    });
    
    profile.totalInteractions += 1;
    
    await profile.save();
    return profile;
  },
  
  /**
   * Get top topics for a user
   */
  async getTopTopics(userId, limit = 10) {
    const profile = await this.findOne({ userId });
    if (!profile) return [];
    
    const topics = [];
    profile.topics.forEach((value, key) => {
      topics.push({ topic: key, ...value });
    });
    
    // Sort by score descending
    topics.sort((a, b) => b.score - a.score);
    
    return topics.slice(0, limit);
  },
  
  /**
   * Update content preference based on interaction type
   */
  async updateContentPreference(userId, contentType, weight = 1) {
    const validTypes = ["posts", "reels", "stories", "streams", "music", "tv"];
    if (!validTypes.includes(contentType)) return null;
    
    const update = {
      $inc: {
        [`contentPreferences.${contentType}`]: weight,
        totalInteractions: 1,
      },
    };
    
    return this.findOneAndUpdate({ userId }, update, { upsert: true, new: true });
  },
  
  /**
   * Update peak hours based on activity
   */
  async recordActivityHour(userId, hour) {
    const profile = await this.getOrCreate(userId);
    
    if (!profile.peakHours.includes(hour)) {
      profile.peakHours.push(hour);
      // Keep only top 5 most frequent hours
      if (profile.peakHours.length > 5) {
        profile.peakHours.shift();
      }
      await profile.save();
    }
    
    return profile;
  },
  
  /**
   * Update engagement style based on activity patterns
   */
  async updateEngagementStyle(userId) {
    const profile = await this.getOrCreate(userId);
    
    // Get user's event history for classification
    const Event = mongoose.model("Event");
    const recentEvents = await Event.aggregate([
      { $match: { userId: profile.userId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    
    const eventCounts = recentEvents.reduce((acc, e) => {
      acc[e._id] = e.count;
      return acc;
    }, {});
    
    const views = (eventCounts.post_view || 0) + (eventCounts.video_view || 0) + (eventCounts.reel_view || 0);
    const engagements = (eventCounts.like || 0) + (eventCounts.comment || 0) + (eventCounts.share || 0);
    const creates = (eventCounts.track_upload || 0) + (eventCounts.beat_generate || 0);
    const social = (eventCounts.follow || 0) + (eventCounts.message_sent || 0);
    
    // Classify engagement style
    let style = "lurker";
    
    if (creates > 5) {
      style = "creator";
    } else if (social > engagements && social > 10) {
      style = "social_butterfly";
    } else if (engagements > views * 0.1 && engagements > 20) {
      style = "active_engager";
    } else if (views > 50) {
      style = "passive_consumer";
    }
    
    profile.engagementStyle = style;
    await profile.save();
    
    return profile;
  },
};

export default mongoose.model("InterestProfile", InterestProfileSchema);

