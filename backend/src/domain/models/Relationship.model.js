// backend/src/domain/models/Relationship.model.js
// Social graph model for follows, friends, blocks
import mongoose from "mongoose";

export const RELATIONSHIP_TYPES = {
  FOLLOW: "follow",
  FRIEND: "friend", // Mutual follow
  BLOCK: "block",
  MUTE: "mute",
  CLOSE_FRIEND: "close_friend",
};

export const RELATIONSHIP_STATUS = {
  ACTIVE: "active",
  PENDING: "pending", // For friend requests
  DECLINED: "declined",
  REMOVED: "removed",
};

const RelationshipSchema = new mongoose.Schema(
  {
    // The user who initiated the relationship
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // The target user
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // Type of relationship
    type: {
      type: String,
      required: true,
      enum: Object.values(RELATIONSHIP_TYPES),
      index: true,
    },
    
    // Status
    status: {
      type: String,
      enum: Object.values(RELATIONSHIP_STATUS),
      default: RELATIONSHIP_STATUS.ACTIVE,
    },
    
    // Relationship strength (for recommendations)
    // Higher = stronger connection
    strength: {
      type: Number,
      default: 1,
      min: 0,
      max: 100,
    },
    
    // Notification preferences
    notifications: {
      type: Boolean,
      default: true,
    },
    
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "relationships",
  }
);

// Compound indexes
RelationshipSchema.index({ userId: 1, targetId: 1, type: 1 }, { unique: true });
RelationshipSchema.index({ targetId: 1, type: 1, status: 1 });
RelationshipSchema.index({ userId: 1, type: 1, status: 1 });
RelationshipSchema.index({ type: 1, status: 1 });

// Static methods for social graph operations
RelationshipSchema.statics = {
  /**
   * Follow a user
   */
  async followUser(userId, targetId) {
    if (userId.toString() === targetId.toString()) {
      throw new Error("Cannot follow yourself");
    }
    
    // Check if blocked
    const blocked = await this.findOne({
      $or: [
        { userId, targetId, type: RELATIONSHIP_TYPES.BLOCK, status: RELATIONSHIP_STATUS.ACTIVE },
        { userId: targetId, targetId: userId, type: RELATIONSHIP_TYPES.BLOCK, status: RELATIONSHIP_STATUS.ACTIVE },
      ],
    });
    
    if (blocked) {
      throw new Error("Cannot follow blocked user");
    }
    
    // Upsert follow relationship
    const follow = await this.findOneAndUpdate(
      { userId, targetId, type: RELATIONSHIP_TYPES.FOLLOW },
      { status: RELATIONSHIP_STATUS.ACTIVE },
      { upsert: true, new: true }
    );
    
    // Check if mutual follow (friendship)
    const mutualFollow = await this.findOne({
      userId: targetId,
      targetId: userId,
      type: RELATIONSHIP_TYPES.FOLLOW,
      status: RELATIONSHIP_STATUS.ACTIVE,
    });
    
    // If mutual, update both to friend type
    if (mutualFollow) {
      await this.updateMany(
        {
          $or: [
            { userId, targetId, type: RELATIONSHIP_TYPES.FOLLOW },
            { userId: targetId, targetId: userId, type: RELATIONSHIP_TYPES.FOLLOW },
          ],
        },
        { type: RELATIONSHIP_TYPES.FRIEND }
      );
    }
    
    return follow;
  },
  
  /**
   * Unfollow a user
   */
  async unfollowUser(userId, targetId) {
    // Remove follow relationship
    const result = await this.findOneAndUpdate(
      { userId, targetId, type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] } },
      { status: RELATIONSHIP_STATUS.REMOVED },
      { new: true }
    );
    
    // If they were friends, downgrade the other side to follow
    if (result?.type === RELATIONSHIP_TYPES.FRIEND) {
      await this.findOneAndUpdate(
        { userId: targetId, targetId: userId, type: RELATIONSHIP_TYPES.FRIEND },
        { type: RELATIONSHIP_TYPES.FOLLOW }
      );
    }
    
    return result;
  },
  
  /**
   * Block a user
   */
  async blockUser(userId, targetId) {
    // Remove any existing follow relationships
    await this.updateMany(
      {
        $or: [
          { userId, targetId },
          { userId: targetId, targetId: userId },
        ],
        type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
      },
      { status: RELATIONSHIP_STATUS.REMOVED }
    );
    
    // Create block relationship
    return this.findOneAndUpdate(
      { userId, targetId, type: RELATIONSHIP_TYPES.BLOCK },
      { status: RELATIONSHIP_STATUS.ACTIVE },
      { upsert: true, new: true }
    );
  },
  
  /**
   * Unblock a user
   */
  async unblockUser(userId, targetId) {
    return this.findOneAndUpdate(
      { userId, targetId, type: RELATIONSHIP_TYPES.BLOCK },
      { status: RELATIONSHIP_STATUS.REMOVED },
      { new: true }
    );
  },
  
  /**
   * Get followers of a user
   */
  async getFollowers(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    return this.find({
      targetId: userId,
      type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
      status: RELATIONSHIP_STATUS.ACTIVE,
    })
      .populate("userId", "name avatarUrl")
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
  },
  
  /**
   * Get users that a user is following
   */
  async getFollowing(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    return this.find({
      userId,
      type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
      status: RELATIONSHIP_STATUS.ACTIVE,
    })
      .populate("targetId", "name avatarUrl")
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
  },
  
  /**
   * Get friends (mutual follows)
   */
  async getFriends(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    return this.find({
      userId,
      type: RELATIONSHIP_TYPES.FRIEND,
      status: RELATIONSHIP_STATUS.ACTIVE,
    })
      .populate("targetId", "name avatarUrl")
      .skip(offset)
      .limit(limit)
      .sort({ strength: -1, createdAt: -1 })
      .lean();
  },
  
  /**
   * Get mutual friends between two users
   */
  async getMutualFriends(userId, otherId) {
    // Get both users' friends
    const [userFriends, otherFriends] = await Promise.all([
      this.find({
        userId,
        type: RELATIONSHIP_TYPES.FRIEND,
        status: RELATIONSHIP_STATUS.ACTIVE,
      }).distinct("targetId"),
      this.find({
        userId: otherId,
        type: RELATIONSHIP_TYPES.FRIEND,
        status: RELATIONSHIP_STATUS.ACTIVE,
      }).distinct("targetId"),
    ]);
    
    // Find intersection
    const mutualIds = userFriends.filter(id => 
      otherFriends.some(otherId => otherId.toString() === id.toString())
    );
    
    // Populate mutual friends
    const User = mongoose.model("User");
    return User.find({ _id: { $in: mutualIds } })
      .select("name avatarUrl")
      .lean();
  },
  
  /**
   * Check if user follows target
   */
  async isFollowing(userId, targetId) {
    const rel = await this.findOne({
      userId,
      targetId,
      type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
      status: RELATIONSHIP_STATUS.ACTIVE,
    });
    return !!rel;
  },
  
  /**
   * Get follower/following counts
   */
  async getCounts(userId) {
    const [followers, following, friends] = await Promise.all([
      this.countDocuments({
        targetId: userId,
        type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
        status: RELATIONSHIP_STATUS.ACTIVE,
      }),
      this.countDocuments({
        userId,
        type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
        status: RELATIONSHIP_STATUS.ACTIVE,
      }),
      this.countDocuments({
        userId,
        type: RELATIONSHIP_TYPES.FRIEND,
        status: RELATIONSHIP_STATUS.ACTIVE,
      }),
    ]);
    
    return { followers, following, friends };
  },
  
  /**
   * Get suggested users to follow (friends of friends not already following)
   */
  async getSuggestions(userId, limit = 20) {
    // Get user's current following
    const following = await this.find({
      userId,
      type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
      status: RELATIONSHIP_STATUS.ACTIVE,
    }).distinct("targetId");
    
    // Get blocked users
    const blocked = await this.find({
      $or: [
        { userId, type: RELATIONSHIP_TYPES.BLOCK, status: RELATIONSHIP_STATUS.ACTIVE },
        { targetId: userId, type: RELATIONSHIP_TYPES.BLOCK, status: RELATIONSHIP_STATUS.ACTIVE },
      ],
    }).distinct("targetId");
    
    const excludeIds = [...following, ...blocked, userId];
    
    // Get friends of friends
    const friendsOfFriends = await this.aggregate([
      {
        $match: {
          userId: { $in: following },
          type: { $in: [RELATIONSHIP_TYPES.FOLLOW, RELATIONSHIP_TYPES.FRIEND] },
          status: RELATIONSHIP_STATUS.ACTIVE,
          targetId: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: "$targetId",
          mutualCount: { $sum: 1 },
        },
      },
      { $sort: { mutualCount: -1 } },
      { $limit: limit },
    ]);
    
    // Populate user data
    const User = mongoose.model("User");
    const userIds = friendsOfFriends.map(f => f._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select("name avatarUrl")
      .lean();
    
    // Merge with mutual counts
    return friendsOfFriends.map(f => ({
      ...users.find(u => u._id.toString() === f._id.toString()),
      mutualFriends: f.mutualCount,
    }));
  },
};

export default mongoose.model("Relationship", RelationshipSchema);

