// frontend/src/api/powerlineClient.js
// PowerLine V5 API Client - Fixed Connection

import axios from "axios";

// HARDCODED for reliable connection
const API_BASE = "http://localhost:5001/api/powerline";

console.log("[PowerlineClient] API Base:", API_BASE);

function getToken() {
  return (
    localStorage.getItem("powerstreamToken") ||
    localStorage.getItem("powerstream_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

client.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Remove any surrounding quotes from token
      config.headers.Authorization = `Bearer ${token.replace(/^"(.+)"$/, "$1")}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for debugging
client.interceptors.response.use(
  (response) => {
    console.log("[PowerlineClient] Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("[PowerlineClient] Error:", error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export async function fetchThreads() {
  console.log("[PowerlineClient] Fetching threads...");
  const { data } = await client.get("/threads");
  console.log("[PowerlineClient] Threads response:", data);
  
  // Handle various response shapes
  if (data?.success && Array.isArray(data.data)) {
    return data.data;
  }
  return data.threads || data.items || data.data || data || [];
}

export async function fetchMessages(threadId) {
  console.log("[PowerlineClient] Fetching messages for:", threadId);
  const { data } = await client.get(`/threads/${threadId}/messages`);
  
  // Handle various response shapes
  if (data?.success && Array.isArray(data.data)) {
    return data.data;
  }
  return data.messages || data.items || data.data || data || [];
}

export async function sendMessage(threadId, text) {
  console.log("[PowerlineClient] Sending message to:", threadId);
  const { data } = await client.post(`/threads/${threadId}/messages`, { text });
  return data;
}

export async function startThread(participantIds, title = null) {
  console.log("[PowerlineClient] Starting thread with:", participantIds);
  const { data } = await client.post("/threads", { participantIds, title });
  return data;
}

export async function healthCheck() {
  console.log("[PowerlineClient] Health check...");
  const { data } = await client.get("/health");
  return data;
}

export default { fetchThreads, fetchMessages, sendMessage, startThread, healthCheck };
