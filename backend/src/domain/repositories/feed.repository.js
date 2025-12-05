// backend/src/domain/repositories/feed.repository.js
// Feed repository - data access layer for posts/feed
import Post, { POST_CHANNELS, POST_VISIBILITY } from "../models/Post.model.js";
import Relationship from "../models/Relationship.model.js";
import { logger } from "../../config/logger.js";

/**
 * Feed repository
 * Handles all data access for feed/posts
 */
const feedRepository = {
  /**
   * Create a new post
   */
  async createPost(data) {
    const post = new Post(data);
    await post.save();
    return post.populate("owner", "name username avatarUrl isVerified");
  },

  /**
   * Get post by ID
   */
  async getPostById(postId) {
    return Post.findById(postId)
      .populate("owner", "name username avatarUrl isVerified");
  },

  /**
   * Get user's feed (posts from followed users + own posts)
   */
  async getUserFeed(userId, options = {}) {
    const { 
      limit = 20, 
      skip = 0, 
      channel = POST_CHANNELS.FEED,
      includeOwn = true,
    } = options;

    // Get users this user follows
    const following = await Relationship.find({
      followerId: userId,
      type: "follow",
    }).select("followingId");

    const followingIds = following.map(f => f.followingId);
    
    // Include own posts if requested
    const ownerIds = includeOwn ? [...followingIds, userId] : followingIds;

    const query = {
      owner: { $in: ownerIds },
      isDeleted: false,
      isPublished: true,
      visibility: POST_VISIBILITY.PUBLIC,
    };

    if (channel) {
      query.channel = channel;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl isVerified");

    const total = await Post.countDocuments(query);

    return { posts, total, hasMore: skip + posts.length < total };
  },

  /**
   * Get user's own posts
   */
  async getUserPosts(userId, options = {}) {
    const { limit = 20, skip = 0, channel } = options;

    const query = {
      owner: userId,
      isDeleted: false,
    };

    if (channel) {
      query.channel = channel;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl isVerified");

    const total = await Post.countDocuments(query);

    return { posts, total, hasMore: skip + posts.length < total };
  },

  /**
   * Get explore/trending posts
   */
  async getExploreFeed(options = {}) {
    const { 
      limit = 20, 
      skip = 0, 
      channel,
      hoursAgo = 24,
    } = options;

    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const query = {
      createdAt: { $gte: since },
      isDeleted: false,
      isPublished: true,
      visibility: POST_VISIBILITY.PUBLIC,
    };

    if (channel) {
      query.channel = channel;
    }

    // Sort by engagement (likes + comments)
    const posts = await Post.find(query)
      .sort({ likesCount: -1, commentsCount: -1, viewsCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl isVerified");

    return posts;
  },

  /**
   * Update post
   */
  async updatePost(postId, userId, updates) {
    const post = await Post.findOneAndUpdate(
      { _id: postId, owner: userId },
      { $set: updates },
      { new: true }
    ).populate("owner", "name username avatarUrl isVerified");

    return post;
  },

  /**
   * Delete post (soft delete)
   */
  async deletePost(postId, userId) {
    return Post.findOneAndUpdate(
      { _id: postId, owner: userId },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  /**
   * Increment like count
   */
  async incrementLikes(postId) {
    return Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
  },

  /**
   * Decrement like count
   */
  async decrementLikes(postId) {
    return Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );
  },

  /**
   * Increment comment count
   */
  async incrementComments(postId) {
    return Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true }
    );
  },

  /**
   * Increment view count
   */
  async incrementViews(postId) {
    return Post.findByIdAndUpdate(
      postId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
  },

  /**
   * Increment share count
   */
  async incrementShares(postId) {
    return Post.findByIdAndUpdate(
      postId,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );
  },

  /**
   * Get posts by hashtag
   */
  async getPostsByHashtag(hashtag, options = {}) {
    const { limit = 20, skip = 0 } = options;

    const query = {
      hashtags: hashtag.toLowerCase().replace("#", ""),
      isDeleted: false,
      isPublished: true,
      visibility: POST_VISIBILITY.PUBLIC,
    };

    return Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl isVerified");
  },

  /**
   * Search posts
   */
  async searchPosts(query, options = {}) {
    const { limit = 20, skip = 0, channel } = options;

    const searchQuery = {
      $or: [
        { text: { $regex: query, $options: "i" } },
        { caption: { $regex: query, $options: "i" } },
        { hashtags: { $regex: query, $options: "i" } },
      ],
      isDeleted: false,
      isPublished: true,
      visibility: POST_VISIBILITY.PUBLIC,
    };

    if (channel) {
      searchQuery.channel = channel;
    }

    return Post.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl isVerified");
  },

  /**
   * Get posts by channel (feed, gram, reel)
   */
  async getPostsByChannel(channel, options = {}) {
    const { limit = 20, skip = 0 } = options;

    return Post.find({
      channel,
      isDeleted: false,
      isPublished: true,
      visibility: POST_VISIBILITY.PUBLIC,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl isVerified");
  },

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(hoursAgo = 24, limit = 10) {
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const result = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          isDeleted: false,
          isPublished: true,
        },
      },
      { $unwind: "$hashtags" },
      {
        $group: {
          _id: "$hashtags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map(r => ({ hashtag: r._id, count: r.count }));
  },
};

export default feedRepository;

