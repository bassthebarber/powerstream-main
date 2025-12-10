// frontend/src/api/feedApi.js
// Feed/Posts API client
import httpClient from "./httpClient.js";

/**
 * Feed API
 */
const feedApi = {
  /**
   * Get user's feed
   */
  async getFeed(options = {}) {
    const { limit = 20, skip = 0, channel } = options;
    const params = new URLSearchParams({ limit, skip });
    if (channel) params.append("channel", channel);
    
    const response = await httpClient.get(`/powerfeed?${params}`);
    return response.data;
  },

  /**
   * Get explore/trending feed
   */
  async getExploreFeed(options = {}) {
    const { limit = 20, skip = 0, channel } = options;
    const params = new URLSearchParams({ limit, skip });
    if (channel) params.append("channel", channel);
    
    const response = await httpClient.get(`/powerfeed/explore?${params}`);
    return response.data;
  },

  /**
   * Get a single post
   */
  async getPost(postId) {
    const response = await httpClient.get(`/powerfeed/${postId}`);
    return response.data;
  },

  /**
   * Create a new post
   */
  async createPost(data) {
    const response = await httpClient.post("/powerfeed", {
      text: data.text,
      caption: data.caption,
      channel: data.channel || "feed",
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      visibility: data.visibility || "public",
    });
    return response.data;
  },

  /**
   * Update a post
   */
  async updatePost(postId, data) {
    const response = await httpClient.put(`/powerfeed/${postId}`, data);
    return response.data;
  },

  /**
   * Delete a post
   */
  async deletePost(postId) {
    const response = await httpClient.delete(`/powerfeed/${postId}`);
    return response.data;
  },

  /**
   * Like a post
   */
  async likePost(postId) {
    const response = await httpClient.post(`/powerfeed/${postId}/like`);
    return response.data;
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId) {
    const response = await httpClient.delete(`/powerfeed/${postId}/like`);
    return response.data;
  },

  /**
   * Share a post
   */
  async sharePost(postId) {
    const response = await httpClient.post(`/powerfeed/${postId}/share`);
    return response.data;
  },

  /**
   * Get comments for a post
   */
  async getComments(postId, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/powerfeed/${postId}/comments?${params}`);
    return response.data;
  },

  /**
   * Add a comment to a post
   */
  async addComment(postId, text) {
    const response = await httpClient.post(`/powerfeed/${postId}/comments`, { text });
    return response.data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(postId, commentId) {
    const response = await httpClient.delete(`/powerfeed/${postId}/comments/${commentId}`);
    return response.data;
  },

  /**
   * Get posts by hashtag
   */
  async getPostsByHashtag(hashtag, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/powerfeed/hashtag/${encodeURIComponent(hashtag)}?${params}`);
    return response.data;
  },

  /**
   * Search posts
   */
  async searchPosts(query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ q: query, limit, skip });
    
    const response = await httpClient.get(`/powerfeed/search?${params}`);
    return response.data;
  },

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags() {
    const response = await httpClient.get("/powerfeed/trending/hashtags");
    return response.data;
  },

  /**
   * Get user's posts
   */
  async getUserPosts(userId, options = {}) {
    const { limit = 20, skip = 0, channel } = options;
    const params = new URLSearchParams({ limit, skip });
    if (channel) params.append("channel", channel);
    
    const response = await httpClient.get(`/users/${userId}/posts?${params}`);
    return response.data;
  },

  // ============================================================
  // POWERGRAM (Image grid)
  // ============================================================

  /**
   * Get PowerGram posts (images)
   */
  async getGrams(options = {}) {
    const { limit = 30, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/powergram?${params}`);
    return response.data;
  },

  /**
   * Create a gram (image post)
   */
  async createGram(data) {
    const response = await httpClient.post("/powergram", {
      caption: data.caption,
      mediaUrl: data.mediaUrl,
      location: data.location,
    });
    return response.data;
  },

  // ============================================================
  // POWERREEL (Videos)
  // ============================================================

  /**
   * Get PowerReel videos
   */
  async getReels(options = {}) {
    const { limit = 10, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/powerreel?${params}`);
    return response.data;
  },

  /**
   * Create a reel (video)
   */
  async createReel(data) {
    const response = await httpClient.post("/powerreel", {
      caption: data.caption,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      hashtags: data.hashtags,
    });
    return response.data;
  },

  /**
   * Record a reel view
   */
  async recordReelView(reelId) {
    const response = await httpClient.post(`/powerreel/${reelId}/view`);
    return response.data;
  },

  // ============================================================
  // STORIES
  // ============================================================

  /**
   * Get stories
   */
  async getStories() {
    const response = await httpClient.get("/stories");
    return response.data;
  },

  /**
   * Create a story
   */
  async createStory(data) {
    const response = await httpClient.post("/stories", {
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      text: data.text,
    });
    return response.data;
  },

  /**
   * View a story
   */
  async viewStory(storyId) {
    const response = await httpClient.post(`/stories/${storyId}/view`);
    return response.data;
  },
};

export default feedApi;




