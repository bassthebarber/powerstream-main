// frontend/src/api/powerlineApi.js
// PowerLine API Client - Axios Implementation

import axios from "axios";

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5001/api") + "/powerline",
});

// Attach JWT token from localStorage
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("ps_token") ||
    localStorage.getItem("powerstreamToken") ||
    localStorage.getItem("powerstream_token") ||
    localStorage.getItem("ps_jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const PowerLineAPI = {
  // Conversations
  getConversations(params) {
    return API.get("/conversations", { params });
  },
  createConversation(body) {
    return API.post("/conversations", body);
  },
  getConversation(id) {
    return API.get(`/conversations/${id}`);
  },
  updateConversation(id, body) {
    return API.patch(`/conversations/${id}`, body);
  },
  leaveConversation(id) {
    return API.delete(`/conversations/${id}`);
  },

  // Messages
  getMessages(conversationId, params) {
    return API.get(`/conversations/${conversationId}/messages`, { params });
  },
  sendMessage(conversationId, body) {
    return API.post(`/conversations/${conversationId}/messages`, body);
  },
  getMessage(id) {
    return API.get(`/messages/${id}`);
  },
  editMessage(id, body) {
    return API.patch(`/messages/${id}`, body);
  },
  deleteMessage(id) {
    return API.delete(`/messages/${id}`);
  },

  // Reactions
  addReaction(messageId, emoji) {
    return API.post(`/messages/${messageId}/reactions`, { emoji });
  },
  removeReaction(messageId) {
    return API.delete(`/messages/${messageId}/reactions`);
  },

  // Chats (Legacy endpoints)
  getChats(params) {
    return API.get("/chats", { params });
  },
  createChat(body) {
    return API.post("/chats", body);
  },
  getChat(id) {
    return API.get(`/chats/${id}`);
  },
  getChatMessages(chatId, params) {
    return API.get(`/chats/${chatId}/messages`, { params });
  },
  sendChatMessage(chatId, body) {
    return API.post(`/chats/${chatId}/messages`, body);
  },

  // Health
  health() {
    return API.get("/health");
  },
};

export default PowerLineAPI;
