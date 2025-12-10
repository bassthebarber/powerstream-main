// backend/src/domain/repositories/relationships.repository.js
// Social graph data access layer
import Relationship from "../models/Relationship.model.js";
import { toObjectId, isValidObjectId } from "../../utils/ids.js";

/**
 * Relationships repository - handles social graph data access
 */
const relationshipsRepository = {
  /**
   * Follow a user
   */
  async follow(userId, targetId) {
    return Relationship.followUser(toObjectId(userId), toObjectId(targetId));
  },
  
  /**
   * Unfollow a user
   */
  async unfollow(userId, targetId) {
    return Relationship.unfollowUser(toObjectId(userId), toObjectId(targetId));
  },
  
  /**
   * Block a user
   */
  async block(userId, targetId) {
    return Relationship.blockUser(toObjectId(userId), toObjectId(targetId));
  },
  
  /**
   * Unblock a user
   */
  async unblock(userId, targetId) {
    return Relationship.unblockUser(toObjectId(userId), toObjectId(targetId));
  },
  
  /**
   * Get followers
   */
  async getFollowers(userId, options = {}) {
    return Relationship.getFollowers(toObjectId(userId), options);
  },
  
  /**
   * Get following
   */
  async getFollowing(userId, options = {}) {
    return Relationship.getFollowing(toObjectId(userId), options);
  },
  
  /**
   * Get friends
   */
  async getFriends(userId, options = {}) {
    return Relationship.getFriends(toObjectId(userId), options);
  },
  
  /**
   * Get mutual friends
   */
  async getMutualFriends(userId, otherId) {
    return Relationship.getMutualFriends(toObjectId(userId), toObjectId(otherId));
  },
  
  /**
   * Check if following
   */
  async isFollowing(userId, targetId) {
    return Relationship.isFollowing(toObjectId(userId), toObjectId(targetId));
  },
  
  /**
   * Get relationship counts
   */
  async getCounts(userId) {
    return Relationship.getCounts(toObjectId(userId));
  },
  
  /**
   * Get suggestions
   */
  async getSuggestions(userId, limit = 20) {
    return Relationship.getSuggestions(toObjectId(userId), limit);
  },
  
  /**
   * Check if blocked
   */
  async isBlocked(userId, targetId) {
    const blocked = await Relationship.findOne({
      $or: [
        { userId: toObjectId(userId), targetId: toObjectId(targetId), type: "block", status: "active" },
        { userId: toObjectId(targetId), targetId: toObjectId(userId), type: "block", status: "active" },
      ],
    });
    return !!blocked;
  },
  
  /**
   * Get relationship status between two users
   */
  async getRelationship(userId, targetId) {
    const [isFollowing, isFollowedBy, isBlocked, mutualFriends] = await Promise.all([
      this.isFollowing(userId, targetId),
      this.isFollowing(targetId, userId),
      this.isBlocked(userId, targetId),
      this.getMutualFriends(userId, targetId),
    ]);
    
    return {
      isFollowing,
      isFollowedBy,
      isFriend: isFollowing && isFollowedBy,
      isBlocked,
      mutualFriendsCount: mutualFriends.length,
    };
  },
};

export default relationshipsRepository;



