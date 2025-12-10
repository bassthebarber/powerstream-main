// backend/sockets/stationsSocket.js
// TV Stations socket namespace for real-time station updates

import { Server } from "socket.io";

/**
 * Setup stations socket namespace
 * @param {http.Server} server - HTTP server instance
 */
export function setupStationsSocket(server) {
  // Get or create Socket.IO instance (should already exist from studioSocket)
  let io = server.io;
  if (!io) {
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || 
                          process.env.CORS_ORIGINS?.split(",") || 
                          ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
    
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    server.io = io;
    console.log("✅ Created Socket.IO instance for Stations");
  }

  const stationsNamespace = io.of("/stations");

  stationsNamespace.on("connection", (socket) => {
    console.log("📺 Stations user connected:", socket.id);

    // Join a station room
    socket.on("stations:join", (data) => {
      const { stationSlug, userId } = data;
      if (stationSlug) {
        socket.join(`station:${stationSlug}`);
        socket.to(`station:${stationSlug}`).emit("stations:user-joined", { userId, socketId: socket.id });
        console.log(`✅ User ${userId} joined station ${stationSlug}`);
      }
    });

    // Leave a station room
    socket.on("stations:leave", (data) => {
      const { stationSlug, userId } = data;
      if (stationSlug) {
        socket.leave(`station:${stationSlug}`);
        socket.to(`station:${stationSlug}`).emit("stations:user-left", { userId, socketId: socket.id });
        console.log(`❌ User ${userId} left station ${stationSlug}`);
      }
    });

    // Station live stream status
    socket.on("stations:stream-status", (data) => {
      const { stationSlug, status, streamUrl } = data;
      if (stationSlug) {
        stationsNamespace.to(`station:${stationSlug}`).emit("stations:stream-update", {
          stationSlug,
          status,
          streamUrl,
        });
      }
    });

    // Station program schedule update
    socket.on("stations:schedule-update", (data) => {
      const { stationSlug, schedule } = data;
      if (stationSlug) {
        stationsNamespace.to(`station:${stationSlug}`).emit("stations:schedule-change", {
          stationSlug,
          schedule,
        });
      }
    });

    // Viewer count update
    socket.on("stations:viewer-count", (data) => {
      const { stationSlug, count } = data;
      if (stationSlug) {
        stationsNamespace.to(`station:${stationSlug}`).emit("stations:viewers-update", {
          stationSlug,
          count,
        });
      }
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log("❌ Stations user disconnected:", socket.id);
    });
  });

  console.log("✅ Stations socket namespace initialized at /stations");
  return stationsNamespace;
}

export default setupStationsSocket;











