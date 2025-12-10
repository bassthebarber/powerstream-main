import axios from "axios";
import { getToken } from "../utils/auth.js";
import { API_BASE_URL } from "../config/apiConfig.js";

/**
 * API Base URL - uses centralized config from apiConfig.js
 */
const API_URL = API_BASE_URL;

// Single log for API configuration (dev only)
if (import.meta.env.DEV) {
  console.log(`🔧 [API] ${API_URL}`);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Automatically attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('powerstreamToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear it
      const { clearToken } = await import("../utils/auth.js");
      clearToken();
      // Optionally redirect to login (but don't do it here to avoid circular dependencies)
    }
    return Promise.reject(error);
  }
);

// Simple health check for main API
export async function healthCheck() {
  const res = await api.get("/health");
  return res.data;
}

export async function fetchFeed() {
  const res = await api.get("/feed");
  return res.data;
}

export async function createFeedPost(payload) {
  const res = await api.post("/feed", payload);
  return res.data;
}

// Optional: if you later add a dedicated upload endpoint for feed media,
// you can mirror the avatar upload pattern here. For now, posts accept
// a direct mediaUrl (image or video) in the payload.

// Feed likes & comments
export async function likeFeedPost(postId) {
  const res = await api.post(`/feed/${encodeURIComponent(postId)}/like`);
  return res.data;
}

export async function fetchFeedComments(postId) {
  const res = await api.get(`/feed/${encodeURIComponent(postId)}/comments`);
  return res.data;
}

export async function createFeedComment(postId, payload) {
  const res = await api.post(`/feed/${encodeURIComponent(postId)}/comments`, payload);
  return res.data;
}

// PowerGram helpers (currently use existing /api/powergram routes)
export async function fetchGrams(limit = 30) {
  const res = await api.get(`/powergram?limit=${limit}`);
  return res.data;
}

export async function uploadGram(payload) {
  const res = await api.post("/powergram", payload);
  return res.data;
}

// Gram likes & comments
export async function likeGramPost(gramId) {
  const res = await api.post(`/gram/${encodeURIComponent(gramId)}/like`);
  return res.data;
}

export async function fetchGramComments(gramId) {
  const res = await api.get(`/gram/${encodeURIComponent(gramId)}/comments`);
  return res.data;
}

export async function createGramComment(gramId, payload) {
  const res = await api.post(`/gram/${encodeURIComponent(gramId)}/comments`, payload);
  return res.data;
}

// PowerReel helpers (simple wrappers around /api/powerreel or /api/reels)
export async function fetchReels(limit = 20) {
  // Use existing /powerreel endpoint which is already wired
  const res = await api.get(`/powerreel?limit=${limit}`);
  return res.data;
}

export async function createReel(payload) {
  // Use /api/reels endpoint
  const res = await api.post("/reels", payload);
  return res.data;
}

// Reel likes & comments
export async function likeReelPost(reelId) {
  const res = await api.post(`/reels/${encodeURIComponent(reelId)}/like`);
  return res.data;
}

export async function fetchReelComments(reelId) {
  const res = await api.get(`/reels/${encodeURIComponent(reelId)}/comments`);
  return res.data;
}

export async function createReelComment(reelId, payload) {
  const res = await api.post(`/reels/${encodeURIComponent(reelId)}/comments`, payload);
  return res.data;
}

// ============================================================
// PowerLine V5 REST helpers
// ============================================================

/**
 * Fetch threads (conversations) for current user
 * GET /api/powerline/threads
 */
export async function fetchThreads(options = {}) {
  const { limit = 20, skip = 0 } = options;
  const params = new URLSearchParams({ limit, skip });
  const res = await api.get(`/powerline/threads?${params}`);
  return res.data;
}

/**
 * Fetch messages for a thread
 * GET /api/powerline/threads/:threadId/messages
 */
export async function fetchMessages(threadId, options = {}) {
  const { limit = 50, before, after } = options;
  const params = new URLSearchParams({ limit });
  if (before) params.append("before", before);
  if (after) params.append("after", after);
  const res = await api.get(`/powerline/threads/${encodeURIComponent(threadId)}/messages?${params}`);
  return res.data;
}

/**
 * Send a message to a thread
 * POST /api/powerline/threads/:threadId/messages
 */
export async function sendMessage(threadId, text, options = {}) {
  const res = await api.post(`/powerline/threads/${encodeURIComponent(threadId)}/messages`, {
    text,
    type: options.type || "text",
    media: options.media || [],
  });
  return res.data;
}

/**
 * Create a new thread
 * POST /api/powerline/threads
 */
export async function createThread(data) {
  const res = await api.post("/powerline/threads", data);
  return res.data;
}

/**
 * Mark thread as read
 * POST /api/powerline/threads/:threadId/read
 */
export async function markThreadRead(threadId) {
  const res = await api.post(`/powerline/threads/${encodeURIComponent(threadId)}/read`);
  return res.data;
}

/**
 * Get unread count
 * GET /api/powerline/unread
 */
export async function getUnreadCount() {
  const res = await api.get("/powerline/unread");
  return res.data;
}

/**
 * Add reaction to message
 * POST /api/powerline/threads/:threadId/messages/:messageId/reactions
 */
export async function addMessageReaction(threadId, messageId, emoji) {
  const res = await api.post(
    `/powerline/threads/${encodeURIComponent(threadId)}/messages/${encodeURIComponent(messageId)}/reactions`,
    { emoji }
  );
  return res.data;
}

/**
 * Seed demo thread (dev only)
 * POST /api/powerline/dev/seed
 */
export async function seedDemoThread() {
  const res = await api.post("/powerline/dev/seed");
  return res.data;
}

// Legacy aliases for backwards compatibility
export const fetchChats = fetchThreads;
export const fetchChatMessages = fetchMessages;
export const sendChatMessage = sendMessage;

// Stories (PowerFeed)
export async function fetchStories() {
  const res = await api.get("/stories");
  return res.data;
}

export async function createStory(payload) {
  const res = await api.post("/stories", payload);
  return res.data;
}

// Profile helpers
export async function fetchCurrentUserProfile() {
  const res = await api.get("/users/me");
  return res.data;
}

export async function uploadAvatar(formData) {
  const res = await api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function fetchSuggestedUsers(limit = 10) {
  try {
    const res = await api.get(`/users/suggested?limit=${limit}`);
    return res.data;
  } catch (err) {
    // Silently fail if endpoint doesn't exist or user not logged in
    console.warn("Suggested users not available");
    return { ok: false, users: [] };
  }
}

// TV Guide / Shows helpers
export async function fetchShows(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.stationId) queryParams.append("stationId", params.stationId);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.limit) queryParams.append("limit", params.limit);

  const res = await api.get(`/shows?${queryParams.toString()}`);
  return res.data;
}

export async function fetchShowById(showId) {
  const res = await api.get(`/shows/${encodeURIComponent(showId)}`);
  return res.data;
}

// Coin purchase and tipping
export async function buyCoins(payload) {
  const res = await api.post("/coins/buy", { amount: payload.amount });
  return res.data;
}

export async function tipCreator(payload) {
  const res = await api.post("/coins/tip", { postId: payload.postId, amount: payload.amount });
  return res.data;
}

export default api;

