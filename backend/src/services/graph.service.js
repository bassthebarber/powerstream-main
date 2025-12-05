// backend/src/services/graph.service.js
// Social graph service layer
import relationshipsRepository from "../domain/repositories/relationships.repository.js";
import eventsRepository from "../domain/repositories/events.repository.js";
import { logger } from "../config/logger.js";
import { ApiError, BadRequestError, NotFoundError } from "../utils/errors.js";

/**
 * Social graph service
 */
const graphService = {
  /**
   * Follow a user
   */
  async followUser(userId, targetId) {
    if (userId === targetId) {
      throw new BadRequestError("Cannot follow yourself");
    }
    
    // Check if already following
    const isFollowing = await relationshipsRepository.isFollowing(userId, targetId);
    if (isFollowing) {
      return { alreadyFollowing: true };
    }
    
    // Check if blocked
    const isBlocked = await relationshipsRepository.isBlocked(userId, targetId);
    if (isBlocked) {
      throw new ApiError(403, "Cannot follow this user");
    }
    
    // Create follow relationship
    const relationship = await relationshipsRepository.follow(userId, targetId);
    
    // Log event
    await eventsRepository.logFollow(userId, targetId);
    
    logger.info(`User ${userId} followed ${targetId}`);
    
    return { success: true, relationship };
  },
  
  /**
   * Unfollow a user
   */
  async unfollowUser(userId, targetId) {
    if (userId === targetId) {
      throw new BadRequestError("Cannot unfollow yourself");
    }
    
    const result = await relationshipsRepository.unfollow(userId, targetId);
    
    logger.info(`User ${userId} unfollowed ${targetId}`);
    
    return { success: true, result };
  },
  
  /**
   * Block a user
   */
  async blockUser(userId, targetId) {
    if (userId === targetId) {
      throw new BadRequestError("Cannot block yourself");
    }
    
    await relationshipsRepository.block(userId, targetId);
    
    logger.info(`User ${userId} blocked ${targetId}`);
    
    return { success: true };
  },
  
  /**
   * Unblock a user
   */
  async unblockUser(userId, targetId) {
    await relationshipsRepository.unblock(userId, targetId);
    
    logger.info(`User ${userId} unblocked ${targetId}`);
    
    return { success: true };
  },
  
  /**
   * Get followers with pagination
   */
  async getFollowers(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const followers = await relationshipsRepository.getFollowers(userId, { limit, offset });
    
    // Map to user objects
    return followers.map(f => ({
      id: f.userId?._id || f.userId,
      name: f.userId?.name,
      avatarUrl: f.userId?.avatarUrl,
      followedAt: f.createdAt,
    }));
  },
  
  /**
   * Get following with pagination
   */
  async getFollowing(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const following = await relationshipsRepository.getFollowing(userId, { limit, offset });
    
    return following.map(f => ({
      id: f.targetId?._id || f.targetId,
      name: f.targetId?.name,
      avatarUrl: f.targetId?.avatarUrl,
      followedAt: f.createdAt,
    }));
  },
  
  /**
   * Get mutual friends between two users
   */
  async getMutualFriends(userId, otherId) {
    const mutuals = await relationshipsRepository.getMutualFriends(userId, otherId);
    
    return mutuals.map(u => ({
      id: u._id,
      name: u.name,
      avatarUrl: u.avatarUrl,
    }));
  },
  
  /**
   * Get relationship status between two users
   */
  async getRelationshipStatus(userId, targetId) {
    return relationshipsRepository.getRelationship(userId, targetId);
  },
  
  /**
   * Get social stats for a user
   */
  async getSocialStats(userId) {
    const counts = await relationshipsRepository.getCounts(userId);
    
    return {
      followers: counts.followers,
      following: counts.following,
      friends: counts.friends,
    };
  },
  
  /**
   * Get follow suggestions for a user
   */
  async getFollowSuggestions(userId, limit = 20) {
    const suggestions = await relationshipsRepository.getSuggestions(userId, limit);
    
    return suggestions.map(s => ({
      id: s._id,
      name: s.name,
      avatarUrl: s.avatarUrl,
      mutualFriends: s.mutualFriends,
      reason: s.mutualFriends > 0 
        ? `${s.mutualFriends} mutual friend${s.mutualFriends > 1 ? "s" : ""}`
        : "Suggested for you",
    }));
  },
};

export default graphService;

