// backend/src/sockets/stream.socket.js
// Live streaming socket handler
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { logger } from "../config/logger.js";
import eventsService from "../services/events.service.js";

// Track viewers per stream
const streamViewers = new Map();

/**
 * Attach stream socket handlers to Socket.IO namespace
 * @param {Server} io - Socket.IO server instance
 */
export default function attachStreamSocket(io) {
  const streamNsp = io.of("/stream");

  // Optional authentication (viewers can be anonymous)
  streamNsp.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (token) {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        };
      } else {
        socket.userId = `anon_${socket.id}`;
        socket.user = { id: socket.userId, name: "Anonymous" };
      }

      next();
    } catch (err) {
      // Token invalid, treat as anonymous
      socket.userId = `anon_${socket.id}`;
      socket.user = { id: socket.userId, name: "Anonymous" };
      next();
    }
  });

  streamNsp.on("connection", (socket) => {
    logger.debug(`Stream socket connected: ${socket.userId}`);

    // Join a stream room
    socket.on("join:stream", (streamId) => {
      if (!streamId) return;

      const room = `stream:${streamId}`;
      socket.join(room);
      socket.currentStream = streamId;

      // Track viewer count
      if (!streamViewers.has(streamId)) {
        streamViewers.set(streamId, new Set());
      }
      streamViewers.get(streamId).add(socket.id);

      // Broadcast updated viewer count
      const viewerCount = streamViewers.get(streamId).size;
      streamNsp.to(room).emit("viewers:count", viewerCount);

      logger.debug(`User ${socket.userId} joined stream ${streamId} (viewers: ${viewerCount})`);

      // Log event
      if (!socket.userId.startsWith("anon_")) {
        eventsService.logEvent(socket.userId, "stream_join", "stream", streamId)
          .catch(err => logger.warn("Failed to log stream join:", err.message));
      }
    });

    // Leave a stream room
    socket.on("leave:stream", (streamId) => {
      if (!streamId) return;

      const room = `stream:${streamId}`;
      socket.leave(room);
      socket.currentStream = null;

      // Update viewer count
      if (streamViewers.has(streamId)) {
        streamViewers.get(streamId).delete(socket.id);
        const viewerCount = streamViewers.get(streamId).size;

        if (viewerCount === 0) {
          streamViewers.delete(streamId);
        } else {
          streamNsp.to(room).emit("viewers:count", viewerCount);
        }
      }

      logger.debug(`User ${socket.userId} left stream ${streamId}`);
    });

    // Send a live chat message
    socket.on("chat:send", (data) => {
      const { streamId, message } = data;
      if (!streamId || !message) return;

      streamNsp.to(`stream:${streamId}`).emit("chat:new", {
        message,
        user: socket.user,
        timestamp: Date.now(),
      });
    });

    // Send a reaction
    socket.on("reaction:send", (data) => {
      const { streamId, reaction } = data;
      if (!streamId || !reaction) return;

      streamNsp.to(`stream:${streamId}`).emit("reaction:new", {
        reaction,
        userId: socket.userId,
        timestamp: Date.now(),
      });
    });

    // Tip notification (coins already handled by coins service)
    socket.on("tip:notify", (data) => {
      const { streamId, amount, message } = data;
      if (!streamId) return;

      streamNsp.to(`stream:${streamId}`).emit("tip:received", {
        from: socket.user,
        amount,
        message,
        timestamp: Date.now(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      // Clean up viewer tracking
      if (socket.currentStream && streamViewers.has(socket.currentStream)) {
        const viewers = streamViewers.get(socket.currentStream);
        viewers.delete(socket.id);

        const viewerCount = viewers.size;
        if (viewerCount === 0) {
          streamViewers.delete(socket.currentStream);
        } else {
          streamNsp.to(`stream:${socket.currentStream}`).emit("viewers:count", viewerCount);
        }
      }

      logger.debug(`Stream socket disconnected: ${socket.userId}`);
    });
  });

  logger.info("✅ Stream socket namespace attached (/stream)");
  return streamNsp;
}

/**
 * Get viewer count for a stream
 */
export function getStreamViewerCount(streamId) {
  return streamViewers.has(streamId) ? streamViewers.get(streamId).size : 0;
}

