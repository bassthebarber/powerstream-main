// frontend/src/api/chatApi.js
// Chat/Messaging API client
import httpClient from "./httpClient.js";

/**
 * Chat API
 */
const chatApi = {
  /**
   * Get user's conversations/threads
   */
  async getConversations(options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/powerline/conversations?${params}`);
    return response.data;
  },

  /**
   * Get a single conversation
   */
  async getConversation(conversationId) {
    const response = await httpClient.get(`/powerline/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId, options = {}) {
    const { limit = 50, before, after } = options;
    const params = new URLSearchParams({ limit });
    if (before) params.append("before", before);
    if (after) params.append("after", after);
    
    const response = await httpClient.get(`/powerline/conversations/${conversationId}/messages?${params}`);
    return response.data;
  },

  /**
   * Send a message
   */
  async sendMessage(conversationId, data) {
    const response = await httpClient.post(`/powerline/conversations/${conversationId}/messages`, {
      text: data.text,
      type: data.type || "text",
      mediaUrl: data.mediaUrl,
      replyTo: data.replyTo,
    });
    return response.data;
  },

  /**
   * Create or get direct conversation with a user
   */
  async getOrCreateDM(userId) {
    const response = await httpClient.post("/powerline/conversations/dm", { userId });
    return response.data;
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId) {
    const response = await httpClient.post(`/powerline/conversations/${conversationId}/read`);
    return response.data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount() {
    const response = await httpClient.get("/powerline/unread");
    return response.data;
  },

  /**
   * Delete a message
   */
  async deleteMessage(conversationId, messageId) {
    const response = await httpClient.delete(`/powerline/conversations/${conversationId}/messages/${messageId}`);
    return response.data;
  },

  /**
   * Edit a message
   */
  async editMessage(conversationId, messageId, text) {
    const response = await httpClient.put(`/powerline/conversations/${conversationId}/messages/${messageId}`, { text });
    return response.data;
  },

  /**
   * React to a message
   */
  async addReaction(conversationId, messageId, emoji) {
    const response = await httpClient.post(`/powerline/conversations/${conversationId}/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  /**
   * Remove reaction from a message
   */
  async removeReaction(conversationId, messageId) {
    const response = await httpClient.delete(`/powerline/conversations/${conversationId}/messages/${messageId}/reactions`);
    return response.data;
  },

  /**
   * Search messages
   */
  async searchMessages(query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ q: query, limit, skip });
    
    const response = await httpClient.get(`/powerline/search?${params}`);
    return response.data;
  },

  /**
   * Mute a conversation
   */
  async muteConversation(conversationId, duration) {
    const response = await httpClient.post(`/powerline/conversations/${conversationId}/mute`, { duration });
    return response.data;
  },

  /**
   * Unmute a conversation
   */
  async unmuteConversation(conversationId) {
    const response = await httpClient.delete(`/powerline/conversations/${conversationId}/mute`);
    return response.data;
  },

  /**
   * Leave a group conversation
   */
  async leaveConversation(conversationId) {
    const response = await httpClient.post(`/powerline/conversations/${conversationId}/leave`);
    return response.data;
  },

  // ============================================================
  // LEGACY ENDPOINTS (for backwards compatibility)
  // ============================================================

  /**
   * Get chats (legacy)
   */
  async getChats(options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/chat?${params}`);
    return response.data;
  },

  /**
   * Get chat messages (legacy)
   */
  async getChatMessages(chatId, options = {}) {
    const { limit = 50 } = options;
    const params = new URLSearchParams({ limit });
    
    const response = await httpClient.get(`/chat/${chatId}/messages?${params}`);
    return response.data;
  },

  /**
   * Send chat message (legacy)
   */
  async sendChatMessage(chatId, text) {
    const response = await httpClient.post(`/chat/${chatId}/messages`, { text });
    return response.data;
  },
};

export default chatApi;

