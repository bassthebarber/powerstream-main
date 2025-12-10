// frontend/src/lib/socket.js
// PowerLine V5 Socket.IO Client
import { io } from "socket.io-client";
import { getToken } from "../utils/auth.js";
import { SOCKET_URL } from "../config/apiConfig.js";

/**
 * Get Socket base URL from centralized config
 */
const getSocketBaseUrl = () => SOCKET_URL;

let socketInstance = null;
let lastToken = null;

/**
 * Get or create Socket.io client instance
 * Connects to /chat namespace with JWT authentication
 * Automatically reconnects when token changes
 */
export function getChatSocket() {
  const token = getToken();
  
  // No token - can't connect
  if (!token) {
    console.warn("[Socket] No auth token available for socket connection");
    return null;
  }
  
  // If token changed, disconnect old socket
  if (socketInstance && lastToken && lastToken !== token) {
    console.log("[Socket] Token changed, reconnecting...");
    disconnectChatSocket();
  }
  
  // Return existing connected socket
  if (socketInstance?.connected) {
    return socketInstance;
  }
  
  // If we have a socket but it's disconnected, try to reconnect
  if (socketInstance && !socketInstance.connected) {
    socketInstance.auth = { token };
    socketInstance.connect();
    lastToken = token;
    return socketInstance;
  }

  // Create new socket connection
  const baseURL = getSocketBaseUrl();
  
  console.log("[Socket] Creating new chat socket connection to:", baseURL);
  
  socketInstance = io(`${baseURL}/chat`, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    timeout: 20000,
  });

  lastToken = token;

  socketInstance.on("connect", () => {
    console.log("✅ [Socket] Chat socket connected, id:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("❌ [Socket] Chat socket disconnected:", reason);
    
    // If server disconnected us, try to reconnect
    if (reason === "io server disconnect") {
      const currentToken = getToken();
      if (currentToken) {
        socketInstance.auth = { token: currentToken };
        socketInstance.connect();
      }
    }
  });

  socketInstance.on("connect_error", (error) => {
    console.error("[Socket] Chat socket connection error:", error.message);
    
    // If auth error, clear socket so next call creates fresh one
    if (error.message?.includes("auth") || error.message?.includes("token")) {
      console.warn("[Socket] Auth error, clearing socket instance");
      socketInstance = null;
      lastToken = null;
    }
  });

  socketInstance.on("reconnect", (attemptNumber) => {
    console.log("[Socket] Reconnected after", attemptNumber, "attempts");
  });

  socketInstance.on("reconnect_attempt", (attemptNumber) => {
    console.log("[Socket] Reconnection attempt", attemptNumber);
    // Update token on reconnect attempts
    const currentToken = getToken();
    if (currentToken) {
      socketInstance.auth = { token: currentToken };
    }
  });

  return socketInstance;
}

/**
 * Initialize socket with current token
 * Call this after login to establish connection
 */
export function initChatSocket() {
  return getChatSocket();
}

/**
 * Disconnect and cleanup socket
 * Call this on logout
 */
export function disconnectChatSocket() {
  if (socketInstance) {
    console.log("[Socket] Disconnecting chat socket...");
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
    lastToken = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected() {
  return socketInstance?.connected ?? false;
}

/**
 * Get socket instance without auto-connect
 */
export function getSocketInstance() {
  return socketInstance;
}

export default getChatSocket;
