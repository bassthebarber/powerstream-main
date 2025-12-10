// backend/src/sockets/studio.socket.js
// Recording Studio collaboration socket handler
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { logger } from "../config/logger.js";

// Track active studio sessions
const studioSessions = new Map(); // sessionId -> { users: Set, state: {} }

/**
 * Attach studio socket handlers to Socket.IO namespace
 * @param {Server} io - Socket.IO server instance
 */
export default function attachStudioSocket(io) {
  const studioNsp = io.of("/studio");

  // Authentication middleware
  studioNsp.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication required for studio"));
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
      logger.warn("Studio socket auth failed:", err.message);
      next(new Error("Invalid token"));
    }
  });

  studioNsp.on("connection", (socket) => {
    logger.debug(`Studio socket connected: ${socket.userId}`);

    // Join a studio session
    socket.on("session:join", (sessionId) => {
      if (!sessionId) return;

      const room = `session:${sessionId}`;
      socket.join(room);
      socket.currentSession = sessionId;

      // Track session participants
      if (!studioSessions.has(sessionId)) {
        studioSessions.set(sessionId, {
          users: new Set(),
          state: {},
          createdAt: new Date(),
        });
      }
      studioSessions.get(sessionId).users.add(socket.userId);

      // Notify others in session
      socket.to(room).emit("user:joined", {
        userId: socket.userId,
        user: socket.user,
      });

      // Send current session state to new joiner
      socket.emit("session:state", {
        sessionId,
        users: Array.from(studioSessions.get(sessionId).users),
        state: studioSessions.get(sessionId).state,
      });

      logger.debug(`User ${socket.userId} joined studio session ${sessionId}`);
    });

    // Leave a studio session
    socket.on("session:leave", (sessionId) => {
      if (!sessionId) return;

      const room = `session:${sessionId}`;
      socket.leave(room);
      socket.currentSession = null;

      // Update session participants
      if (studioSessions.has(sessionId)) {
        studioSessions.get(sessionId).users.delete(socket.userId);

        // Clean up empty sessions
        if (studioSessions.get(sessionId).users.size === 0) {
          studioSessions.delete(sessionId);
        } else {
          // Notify remaining users
          studioNsp.to(room).emit("user:left", {
            userId: socket.userId,
          });
        }
      }
    });

    // Broadcast session state update
    socket.on("session:update", (data) => {
      const { sessionId, update } = data;
      if (!sessionId || !update) return;

      if (studioSessions.has(sessionId)) {
        // Merge update into session state
        Object.assign(studioSessions.get(sessionId).state, update);

        // Broadcast to others
        socket.to(`session:${sessionId}`).emit("session:changed", {
          userId: socket.userId,
          update,
        });
      }
    });

    // Track/mix update (specific to audio editing)
    socket.on("track:update", (data) => {
      const { sessionId, trackId, changes } = data;
      if (!sessionId || !trackId) return;

      socket.to(`session:${sessionId}`).emit("track:changed", {
        userId: socket.userId,
        trackId,
        changes,
      });
    });

    // Playback sync
    socket.on("playback:sync", (data) => {
      const { sessionId, action, position } = data;
      if (!sessionId || !action) return;

      socket.to(`session:${sessionId}`).emit("playback:update", {
        userId: socket.userId,
        action, // play, pause, seek
        position,
      });
    });

    // Cursor/selection sync (for collaborative editing)
    socket.on("cursor:move", (data) => {
      const { sessionId, position, trackId } = data;
      if (!sessionId) return;

      socket.to(`session:${sessionId}`).emit("cursor:update", {
        userId: socket.userId,
        position,
        trackId,
      });
    });

    // Chat within studio session
    socket.on("session:chat", (data) => {
      const { sessionId, message } = data;
      if (!sessionId || !message) return;

      studioNsp.to(`session:${sessionId}`).emit("session:message", {
        user: socket.user,
        message,
        timestamp: Date.now(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      // Clean up from current session
      if (socket.currentSession && studioSessions.has(socket.currentSession)) {
        studioSessions.get(socket.currentSession).users.delete(socket.userId);

        if (studioSessions.get(socket.currentSession).users.size === 0) {
          studioSessions.delete(socket.currentSession);
        } else {
          studioNsp.to(`session:${socket.currentSession}`).emit("user:left", {
            userId: socket.userId,
          });
        }
      }

      logger.debug(`Studio socket disconnected: ${socket.userId}`);
    });
  });

  logger.info("✅ Studio socket namespace attached (/studio)");
  return studioNsp;
}

/**
 * Get active session info
 */
export function getSessionInfo(sessionId) {
  if (!studioSessions.has(sessionId)) return null;
  const session = studioSessions.get(sessionId);
  return {
    users: Array.from(session.users),
    state: session.state,
    createdAt: session.createdAt,
  };
}




