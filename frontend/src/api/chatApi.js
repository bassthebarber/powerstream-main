// frontend/src/api/chatApi.js
// PowerLine V5 Chat/Messaging API client
import httpClient from "./httpClient.js";

/**
 * PowerLine V5 Chat API
 * All endpoints use /api/powerline/threads structure
 */
const chatApi = {
  // ============================================================
  // POWERLINE V5 ENDPOINTS (PRIMARY)
  // ============================================================

  /**
   * Get user's threads (conversations)
   * GET /api/powerline/threads
   */
  async getThreads(options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/powerline/threads?${params}`);
    return response.data;
  },

  /**
   * Get a single thread
   * GET /api/powerline/threads/:threadId
   */
  async getThread(threadId) {
    const response = await httpClient.get(`/powerline/threads/${threadId}`);
    return response.data;
  },

  /**
   * Get messages for a thread
   * GET /api/powerline/threads/:threadId/messages
   */
  async getMessages(threadId, options = {}) {
    const { limit = 50, before, after } = options;
    const params = new URLSearchParams({ limit });
    if (before) params.append("before", before);
    if (after) params.append("after", after);
    
    const response = await httpClient.get(`/powerline/threads/${threadId}/messages?${params}`);
    return response.data;
  },

  /**
   * Send a message to a thread
   * POST /api/powerline/threads/:threadId/messages
   */
  async sendMessage(threadId, data) {
    const response = await httpClient.post(`/powerline/threads/${threadId}/messages`, {
      text: data.text,
      type: data.type || "text",
      media: data.media || data.mediaUrl ? [{ url: data.mediaUrl, type: "image" }] : [],
      replyTo: data.replyTo,
    });
    return response.data;
  },

  /**
   * Create a new thread (1:1 or group)
   * POST /api/powerline/threads
   * - For 1:1: { participantId }
   * - For group: { participantIds: [...], title, isGroup: true }
   */
  async createThread(data) {
    const response = await httpClient.post("/powerline/threads", data);
    return response.data;
  },

  /**
   * Get or create direct message thread with a user
   * POST /api/powerline/threads
   */
  async getOrCreateDM(userId) {
    const response = await httpClient.post("/powerline/threads", { 
      participantId: userId,
      isGroup: false 
    });
    return response.data;
  },

  /**
   * Mark thread as read
   * POST /api/powerline/threads/:threadId/read
   */
  async markAsRead(threadId) {
    const response = await httpClient.post(`/powerline/threads/${threadId}/read`);
    return response.data;
  },

  /**
   * Get unread count
   * GET /api/powerline/unread
   */
  async getUnreadCount() {
    const response = await httpClient.get("/powerline/unread");
    return response.data;
  },

  /**
   * React to a message
   * POST /api/powerline/threads/:threadId/messages/:messageId/reactions
   */
  async addReaction(threadId, messageId, emoji) {
    const response = await httpClient.post(
      `/powerline/threads/${threadId}/messages/${messageId}/reactions`, 
      { emoji }
    );
    return response.data;
  },

  /**
   * Remove reaction from a message
   * DELETE /api/powerline/threads/:threadId/messages/:messageId/reactions
   */
  async removeReaction(threadId, messageId) {
    const response = await httpClient.delete(
      `/powerline/threads/${threadId}/messages/${messageId}/reactions`
    );
    return response.data;
  },

  /**
   * Seed demo thread (dev only)
   * POST /api/powerline/dev/seed
   */
  async seedDemoThread() {
    const response = await httpClient.post("/powerline/dev/seed");
    return response.data;
  },

  // ============================================================
  // ALIAS METHODS (for backwards compatibility)
  // ============================================================

  /** Alias for getThreads */
  async getConversations(options = {}) {
    return this.getThreads(options);
  },

  /** Alias for getThread */
  async getConversation(conversationId) {
    return this.getThread(conversationId);
  },

  /** Alias for getChats - legacy */
  async getChats(options = {}) {
    return this.getThreads(options);
  },

  /** Alias for getChatMessages - legacy */
  async getChatMessages(chatId, options = {}) {
    return this.getMessages(chatId, options);
  },

  /** Alias for sendChatMessage - legacy */
  async sendChatMessage(chatId, text) {
    return this.sendMessage(chatId, { text });
  },
};

export default chatApi;
