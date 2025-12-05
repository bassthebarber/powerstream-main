// backend/src/sockets/stations.socket.js
// TV Stations socket handler (station status, schedule updates)
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { logger } from "../config/logger.js";

// Track users watching each station
const stationViewers = new Map();

/**
 * Attach stations socket handlers to Socket.IO namespace
 * @param {Server} io - Socket.IO server instance
 */
export default function attachStationsSocket(io) {
  const stationsNsp = io.of("/stations");

  // Optional authentication (viewers can be anonymous)
  stationsNsp.use(async (socket, next) => {
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
        socket.user = { id: socket.userId, name: "Viewer" };
      }

      next();
    } catch (err) {
      socket.userId = `anon_${socket.id}`;
      socket.user = { id: socket.userId, name: "Viewer" };
      next();
    }
  });

  stationsNsp.on("connection", (socket) => {
    logger.debug(`Stations socket connected: ${socket.userId}`);

    // Watch a station (for status updates)
    socket.on("watch:station", (stationId) => {
      if (!stationId) return;

      const room = `station:${stationId}`;
      socket.join(room);
      socket.currentStation = stationId;

      // Track viewers
      if (!stationViewers.has(stationId)) {
        stationViewers.set(stationId, new Set());
      }
      stationViewers.get(stationId).add(socket.id);

      // Send viewer count
      const viewerCount = stationViewers.get(stationId).size;
      stationsNsp.to(room).emit("station:viewers", { stationId, count: viewerCount });

      logger.debug(`User ${socket.userId} watching station ${stationId}`);
    });

    // Stop watching a station
    socket.on("unwatch:station", (stationId) => {
      if (!stationId) return;

      const room = `station:${stationId}`;
      socket.leave(room);
      socket.currentStation = null;

      // Update viewer count
      if (stationViewers.has(stationId)) {
        stationViewers.get(stationId).delete(socket.id);
        const viewerCount = stationViewers.get(stationId).size;

        if (viewerCount === 0) {
          stationViewers.delete(stationId);
        } else {
          stationsNsp.to(room).emit("station:viewers", { stationId, count: viewerCount });
        }
      }
    });

    // Request station status
    socket.on("station:status", async (stationId) => {
      // This would typically fetch from DB
      socket.emit("station:status", {
        stationId,
        isLive: false, // Would check actual status
        viewerCount: stationViewers.has(stationId) ? stationViewers.get(stationId).size : 0,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.currentStation && stationViewers.has(socket.currentStation)) {
        stationViewers.get(socket.currentStation).delete(socket.id);

        const viewerCount = stationViewers.get(socket.currentStation).size;
        if (viewerCount === 0) {
          stationViewers.delete(socket.currentStation);
        } else {
          stationsNsp.to(`station:${socket.currentStation}`).emit("station:viewers", {
            stationId: socket.currentStation,
            count: viewerCount,
          });
        }
      }

      logger.debug(`Stations socket disconnected: ${socket.userId}`);
    });
  });

  logger.info("✅ Stations socket namespace attached (/stations)");
  return stationsNsp;
}

/**
 * Broadcast station status change
 */
export function broadcastStationStatus(io, stationId, status) {
  io.of("/stations").to(`station:${stationId}`).emit("station:update", {
    stationId,
    ...status,
  });
}

/**
 * Get viewer count for a station
 */
export function getStationViewerCount(stationId) {
  return stationViewers.has(stationId) ? stationViewers.get(stationId).size : 0;
}

