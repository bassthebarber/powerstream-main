// frontend/src/lib/socket.js
// Uses centralized config from apiConfig.js
import { io } from "socket.io-client";
import { getToken } from "../utils/auth.js";
import { SOCKET_URL } from "../config/apiConfig.js";

/**
 * Get Socket base URL from centralized config
 */
const getSocketBaseUrl = () => SOCKET_URL;

let socketInstance = null;

/**
 * Get or create Socket.io client instance
 * Connects to /chat namespace with JWT authentication
 */
export function getChatSocket() {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  const token = getToken();
  if (!token) {
    console.warn("No auth token available for socket connection");
    return null;
  }

  const baseURL = getSocketBaseUrl();
  
  socketInstance = io(`${baseURL}/chat`, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socketInstance.on("connect", () => {
    console.log("✅ Chat socket connected");
  });

  socketInstance.on("disconnect", () => {
    console.log("❌ Chat socket disconnected");
  });

  socketInstance.on("connect_error", (error) => {
    console.error("Chat socket connection error:", error);
  });

  return socketInstance;
}

/**
 * Disconnect socket
 */
export function disconnectChatSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export default getChatSocket;


