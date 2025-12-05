import axios from "axios";
import { getToken } from "../utils/auth.js";
import { API_BASE_URL } from "../config/apiConfig.js";

/**
 * API Base URL - uses centralized config from apiConfig.js
 */
const API_URL = API_BASE_URL;

// Log in development to verify which URL is being used
if (import.meta.env.DEV) {
  console.log("🔧 [API Client] Development mode detected");
  console.log("🔧 [API Client] baseURL:", API_URL);
  console.log("🔧 [API Client] VITE_API_URL env:", import.meta.env.VITE_API_URL || "(not set)");
  console.log("🔧 [API Client] MODE:", import.meta.env.MODE);
}

// Also log in production for debugging (can be removed later)
if (import.meta.env.PROD) {
  console.log("🔧 [API Client] Production mode - baseURL:", API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Automatically attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Chat / PowerLine REST helpers
export async function fetchChats(userId, limit = 50) {
  const res = await api.get(`/chat?user=${encodeURIComponent(userId)}&limit=${limit}`);
  return res.data;
}

export async function fetchChatMessages(chatId, limit = 50) {
  const res = await api.get(`/chat/${encodeURIComponent(chatId)}/messages?limit=${limit}`);
  return res.data;
}

export async function sendChatMessage(chatId, payload) {
  const res = await api.post(`/chat/${encodeURIComponent(chatId)}/messages`, payload);
  return res.data;
}

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

