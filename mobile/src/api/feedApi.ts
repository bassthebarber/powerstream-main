/**
 * Feed API
 * Mirrors web client: /api/feed/*, /api/powerfeed/*
 */
import httpClient from './httpClient';

export interface Post {
  id: string;
  content: string;
  mediaUrls?: string[];
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface Story {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  expiresAt: string;
  viewed?: boolean;
}

export interface FeedResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Feed API endpoints
 */
export const feedApi = {
  /**
   * Get user's feed
   * GET /api/powerfeed
   */
  async getFeed(page = 1, limit = 20): Promise<FeedResponse> {
    const response = await httpClient.get('/powerfeed', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get recommended feed
   * GET /api/feed/recommended
   */
  async getRecommendedFeed(page = 1, limit = 20): Promise<FeedResponse> {
    const response = await httpClient.get('/feed/recommended', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Create a new post
   * POST /api/powerfeed
   */
  async createPost(content: string, mediaUrls?: string[]): Promise<Post> {
    const response = await httpClient.post('/powerfeed', {
      content,
      mediaUrls,
    });
    return response.data.post;
  },

  /**
   * Get single post
   * GET /api/powerfeed/:id
   */
  async getPost(postId: string): Promise<Post> {
    const response = await httpClient.get(`/powerfeed/${postId}`);
    return response.data.post;
  },

  /**
   * Like a post
   * POST /api/powerfeed/:id/like
   */
  async likePost(postId: string): Promise<{ likes: number }> {
    const response = await httpClient.post(`/powerfeed/${postId}/like`);
    return response.data;
  },

  /**
   * Unlike a post
   * DELETE /api/powerfeed/:id/like
   */
  async unlikePost(postId: string): Promise<{ likes: number }> {
    const response = await httpClient.delete(`/powerfeed/${postId}/like`);
    return response.data;
  },

  /**
   * Get post comments
   * GET /api/powerfeed/:id/comments
   */
  async getComments(postId: string, page = 1): Promise<{ comments: Comment[]; hasMore: boolean }> {
    const response = await httpClient.get(`/powerfeed/${postId}/comments`, {
      params: { page },
    });
    return response.data;
  },

  /**
   * Add comment to post
   * POST /api/powerfeed/:id/comments
   */
  async addComment(postId: string, content: string): Promise<Comment> {
    const response = await httpClient.post(`/powerfeed/${postId}/comments`, {
      content,
    });
    return response.data.comment;
  },

  /**
   * Save post
   * POST /api/powerfeed/:id/save
   */
  async savePost(postId: string): Promise<void> {
    await httpClient.post(`/powerfeed/${postId}/save`);
  },

  /**
   * Unsave post
   * DELETE /api/powerfeed/:id/save
   */
  async unsavePost(postId: string): Promise<void> {
    await httpClient.delete(`/powerfeed/${postId}/save`);
  },

  /**
   * Share post
   * POST /api/powerfeed/:id/share
   */
  async sharePost(postId: string): Promise<{ shareUrl: string }> {
    const response = await httpClient.post(`/powerfeed/${postId}/share`);
    return response.data;
  },

  /**
   * Get stories
   * GET /api/stories
   */
  async getStories(): Promise<Story[]> {
    const response = await httpClient.get('/stories');
    return response.data.stories;
  },

  /**
   * Create story
   * POST /api/stories
   */
  async createStory(mediaUrl: string, mediaType: 'image' | 'video'): Promise<Story> {
    const response = await httpClient.post('/stories', {
      mediaUrl,
      mediaType,
    });
    return response.data.story;
  },

  /**
   * Mark story as viewed
   * POST /api/stories/:id/view
   */
  async viewStory(storyId: string): Promise<void> {
    await httpClient.post(`/stories/${storyId}/view`);
  },
};

export default feedApi;



