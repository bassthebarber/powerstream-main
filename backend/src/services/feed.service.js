// backend/src/services/feed.service.js
// Feed service - business logic for posts and feeds
import feedRepository from "../domain/repositories/feed.repository.js";
import eventsService from "./events.service.js";
import recommendationService from "./recommendation.service.js";
import { logger } from "../config/logger.js";
import { EVENT_TYPES, ENTITY_TYPES } from "../domain/models/Event.model.js";

/**
 * Feed service
 * Handles business logic for posts, feeds, and content
 */
const feedService = {
  /**
   * Create a new post
   */
  async createPost(userId, data) {
    try {
      const postData = {
        owner: userId,
        channel: data.channel || "feed",
        type: data.type || "text",
        text: data.text || "",
        caption: data.caption || "",
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        thumbnailUrl: data.thumbnailUrl,
        hashtags: this.extractHashtags(data.text || data.caption || ""),
        mentions: data.mentions || [],
        visibility: data.visibility || "public",
      };

      const post = await feedRepository.createPost(postData);

      // Log event for analytics/recommendations
      await eventsService.logEvent(
        userId,
        EVENT_TYPES.POST_VIEW, // Using POST_VIEW as there's no POST_CREATE
        ENTITY_TYPES.POST,
        post._id,
        { action: "create", channel: post.channel }
      );

      logger.info(`Post created: ${post._id} by user ${userId}`);
      return post;
    } catch (error) {
      logger.error("Error creating post:", error);
      throw error;
    }
  },

  /**
   * Get user's personalized feed
   */
  async getFeed(userId, options = {}) {
    try {
      // Try to get recommended feed first
      if (options.useRecommendations !== false) {
        try {
          const recommendedIds = await recommendationService.getRecommendedFeedForUser(userId, {
            limit: options.limit,
            offset: options.skip,
          });
          
          if (recommendedIds && recommendedIds.length > 0) {
            // Fetch the actual posts
            // For now, fall through to regular feed
          }
        } catch (err) {
          logger.warn("Recommendation service unavailable, using default feed");
        }
      }

      // Default: chronological feed from followed users
      return feedRepository.getUserFeed(userId, options);
    } catch (error) {
      logger.error("Error getting feed:", error);
      throw error;
    }
  },

  /**
   * Get user's own posts
   */
  async getUserPosts(userId, options = {}) {
    return feedRepository.getUserPosts(userId, options);
  },

  /**
   * Get explore/trending feed
   */
  async getExploreFeed(options = {}) {
    return feedRepository.getExploreFeed(options);
  },

  /**
   * Get post by ID
   */
  async getPostById(postId, viewerId = null) {
    try {
      const post = await feedRepository.getPostById(postId);
      
      if (!post) {
        return null;
      }

      // Log view event
      if (viewerId) {
        await feedRepository.incrementViews(postId);
        await eventsService.logView(viewerId, ENTITY_TYPES.POST, postId, {
          ownerId: post.owner._id || post.owner,
        });
      }

      return post;
    } catch (error) {
      logger.error("Error getting post:", error);
      throw error;
    }
  },

  /**
   * Update a post
   */
  async updatePost(postId, userId, updates) {
    try {
      // Only allow certain fields to be updated
      const allowedUpdates = {
        text: updates.text,
        caption: updates.caption,
        visibility: updates.visibility,
        isPinned: updates.isPinned,
      };

      // Re-extract hashtags if text changed
      if (updates.text || updates.caption) {
        allowedUpdates.hashtags = this.extractHashtags(
          updates.text || updates.caption || ""
        );
      }

      return feedRepository.updatePost(postId, userId, allowedUpdates);
    } catch (error) {
      logger.error("Error updating post:", error);
      throw error;
    }
  },

  /**
   * Delete a post
   */
  async deletePost(postId, userId) {
    try {
      const result = await feedRepository.deletePost(postId, userId);
      if (result) {
        logger.info(`Post deleted: ${postId} by user ${userId}`);
      }
      return result;
    } catch (error) {
      logger.error("Error deleting post:", error);
      throw error;
    }
  },

  /**
   * Like a post
   */
  async likePost(postId, userId) {
    try {
      const post = await feedRepository.getPostById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      await feedRepository.incrementLikes(postId);

      // Log event
      await eventsService.logLike(userId, ENTITY_TYPES.POST, postId, post.owner._id || post.owner);

      return { success: true, postId };
    } catch (error) {
      logger.error("Error liking post:", error);
      throw error;
    }
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId, userId) {
    try {
      await feedRepository.decrementLikes(postId);
      return { success: true, postId };
    } catch (error) {
      logger.error("Error unliking post:", error);
      throw error;
    }
  },

  /**
   * Share a post
   */
  async sharePost(postId, userId) {
    try {
      await feedRepository.incrementShares(postId);

      // Log event
      await eventsService.logShare(userId, ENTITY_TYPES.POST, postId);

      return { success: true, postId };
    } catch (error) {
      logger.error("Error sharing post:", error);
      throw error;
    }
  },

  /**
   * Get posts by hashtag
   */
  async getPostsByHashtag(hashtag, options = {}) {
    return feedRepository.getPostsByHashtag(hashtag, options);
  },

  /**
   * Search posts
   */
  async searchPosts(query, options = {}) {
    return feedRepository.searchPosts(query, options);
  },

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(hoursAgo = 24, limit = 10) {
    return feedRepository.getTrendingHashtags(hoursAgo, limit);
  },

  /**
   * Get posts by channel (feed, gram, reel)
   */
  async getPostsByChannel(channel, options = {}) {
    return feedRepository.getPostsByChannel(channel, options);
  },

  /**
   * Extract hashtags from text
   */
  extractHashtags(text) {
    if (!text) return [];
    const matches = text.match(/#[\w]+/g);
    if (!matches) return [];
    return [...new Set(matches.map(tag => tag.toLowerCase().replace("#", "")))];
  },

  /**
   * Extract mentions from text
   */
  extractMentions(text) {
    if (!text) return [];
    const matches = text.match(/@[\w]+/g);
    if (!matches) return [];
    return [...new Set(matches.map(mention => mention.toLowerCase().replace("@", "")))];
  },
};

export default feedService;

