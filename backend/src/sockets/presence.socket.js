// backend/src/sockets/presence.socket.js
// User presence/online status socket handler
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { logger } from "../config/logger.js";

// Track online users
const onlineUsers = new Map(); // userId -> Set<socketId>
const userStatus = new Map(); // userId -> { status, lastSeen }

/**
 * Attach presence socket handlers to Socket.IO namespace
 * @param {Server} io - Socket.IO server instance
 */
export default function attachPresenceSocket(io) {
  const presenceNsp = io.of("/presence");

  // Authentication middleware
  presenceNsp.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication required for presence"));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      };

      next();
    } catch (err) {
      logger.warn("Presence socket auth failed:", err.message);
      next(new Error("Invalid token"));
    }
  });

  presenceNsp.on("connection", (socket) => {
    logger.debug(`Presence socket connected: ${socket.userId}`);

    // Track this socket connection
    if (!onlineUsers.has(socket.userId)) {
      onlineUsers.set(socket.userId, new Set());
    }
    onlineUsers.get(socket.userId).add(socket.id);

    // Update status to online
    userStatus.set(socket.userId, {
      status: "online",
      lastSeen: new Date(),
    });

    // Broadcast user online
    socket.broadcast.emit("user:online", {
      userId: socket.userId,
      user: socket.user,
    });

    // Subscribe to specific users' presence
    socket.on("subscribe", (userIds) => {
      if (!Array.isArray(userIds)) return;

      // Join rooms for each user we want to track
      userIds.forEach((userId) => {
        socket.join(`presence:${userId}`);
      });

      // Send current status of subscribed users
      const statuses = userIds.map((userId) => ({
        userId,
        status: onlineUsers.has(userId) ? "online" : "offline",
        lastSeen: userStatus.get(userId)?.lastSeen,
      }));

      socket.emit("presence:batch", statuses);
    });

    // Unsubscribe from users
    socket.on("unsubscribe", (userIds) => {
      if (!Array.isArray(userIds)) return;

      userIds.forEach((userId) => {
        socket.leave(`presence:${userId}`);
      });
    });

    // Update status (online, away, busy, invisible)
    socket.on("status:update", (status) => {
      const validStatuses = ["online", "away", "busy", "invisible"];
      if (!validStatuses.includes(status)) return;

      userStatus.set(socket.userId, {
        status,
        lastSeen: new Date(),
      });

      // Broadcast to users tracking this user
      presenceNsp.to(`presence:${socket.userId}`).emit("user:status", {
        userId: socket.userId,
        status,
      });
    });

    // Get online status for a user
    socket.on("presence:get", (userId) => {
      const isOnline = onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
      const status = userStatus.get(userId);

      socket.emit("presence:status", {
        userId,
        status: isOnline ? (status?.status || "online") : "offline",
        lastSeen: status?.lastSeen,
      });
    });

    // Heartbeat to keep connection alive
    socket.on("heartbeat", () => {
      userStatus.set(socket.userId, {
        status: userStatus.get(socket.userId)?.status || "online",
        lastSeen: new Date(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      // Remove this socket from tracking
      if (onlineUsers.has(socket.userId)) {
        onlineUsers.get(socket.userId).delete(socket.id);

        // If no more sockets for this user, they're offline
        if (onlineUsers.get(socket.userId).size === 0) {
          onlineUsers.delete(socket.userId);

          // Update last seen
          userStatus.set(socket.userId, {
            status: "offline",
            lastSeen: new Date(),
          });

          // Broadcast user offline
          socket.broadcast.emit("user:offline", {
            userId: socket.userId,
          });

          // Notify users tracking this user
          presenceNsp.to(`presence:${socket.userId}`).emit("user:status", {
            userId: socket.userId,
            status: "offline",
            lastSeen: new Date(),
          });
        }
      }

      logger.debug(`Presence socket disconnected: ${socket.userId}`);
    });
  });

  logger.info("✅ Presence socket namespace attached (/presence)");
  return presenceNsp;
}

/**
 * Check if a user is online
 */
export function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

/**
 * Get user's current status
 */
export function getUserStatus(userId) {
  if (!onlineUsers.has(userId) || onlineUsers.get(userId).size === 0) {
    return { status: "offline", lastSeen: userStatus.get(userId)?.lastSeen };
  }
  return userStatus.get(userId) || { status: "online", lastSeen: new Date() };
}

/**
 * Get all online users
 */
export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}



