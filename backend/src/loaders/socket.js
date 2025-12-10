// backend/src/loaders/socket.js
// Socket.IO initialization and namespace management
// CANONICAL SOCKET SETUP - all sockets flow through /src/sockets modules
import { Server } from "socket.io";
import env, { getAllowedOrigins } from "../config/env.js";
import { logger } from "../config/logger.js";

// Import socket handlers from /src/sockets
import attachChatSocket from "../sockets/chat.socket.js";
import attachStreamSocket from "../sockets/stream.socket.js";
import attachStationsSocket from "../sockets/stations.socket.js";
import attachPresenceSocket from "../sockets/presence.socket.js";
import attachStudioSocket from "../sockets/studio.socket.js";

let io = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer 
 * @returns {Server}
 */
export const initSocketIO = (httpServer) => {
  if (io) return io;
  
  const allowedOrigins = getAllowedOrigins();
  
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });
  
  // Connection logging for root namespace
  io.on("connection", (socket) => {
    logger.debug(`Socket connected (root): ${socket.id}`);
    
    socket.on("disconnect", (reason) => {
      logger.debug(`Socket disconnected (root): ${socket.id}, reason: ${reason}`);
    });
    
    socket.on("error", (err) => {
      logger.error(`Socket error: ${socket.id}`, err.message);
    });
  });
  
  logger.info("✅ Socket.IO server initialized");
  
  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => io;

/**
 * Initialize all socket namespaces using modular handlers
 * This is the CANONICAL way to set up sockets
 */
export const initAllSockets = async (httpServer) => {
  const ioInstance = initSocketIO(httpServer);
  
  try {
    // Attach all socket namespaces from /src/sockets
    attachChatSocket(ioInstance);
    attachStreamSocket(ioInstance);
    attachStationsSocket(ioInstance);
    attachPresenceSocket(ioInstance);
    attachStudioSocket(ioInstance);
    
    logger.info("✅ All socket namespaces initialized");
  } catch (err) {
    logger.error("Failed to initialize socket namespaces:", err.message);
  }
  
  return ioInstance;
};

// ============================================================
// DEPRECATED: Legacy inline socket initializers
// These are kept for backwards compatibility but should not be used
// Use initAllSockets() instead which uses the modular handlers
// ============================================================

/**
 * @deprecated Use attachChatSocket from ../sockets/chat.socket.js
 */
export const initChatSocket = async (io) => {
  logger.warn("initChatSocket is deprecated. Use attachChatSocket from /src/sockets/chat.socket.js");
  attachChatSocket(io);
};

/**
 * @deprecated Use attachStreamSocket from ../sockets/stream.socket.js
 */
export const initStreamSocket = async (io) => {
  logger.warn("initStreamSocket is deprecated. Use attachStreamSocket from /src/sockets/stream.socket.js");
  attachStreamSocket(io);
};

/**
 * @deprecated Use attachStudioSocket from ../sockets/studio.socket.js
 */
export const initStudioSocket = async (io) => {
  logger.warn("initStudioSocket is deprecated. Use attachStudioSocket from /src/sockets/studio.socket.js");
  attachStudioSocket(io);
};

export default {
  initSocketIO,
  getIO,
  initAllSockets,
  // Deprecated exports for backwards compatibility
  initChatSocket,
  initStreamSocket,
  initStudioSocket,
};
