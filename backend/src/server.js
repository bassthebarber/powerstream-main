// backend/src/server.js
// Main server entry point - Meta-style architecture
import http from "http";
import env, { validateEnv } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectMongo, disconnectMongo } from "./config/db.mongo.js";
import { initRedis, disconnectRedis } from "./config/redis.js";
import { initCloudinary } from "./config/cloudinary.js";
import { initQueues, shutdownQueues } from "./loaders/jobs.js";
import { initAllSockets, getIO } from "./loaders/socket.js";
import { createApp } from "./app.js";

/**
 * Bootstrap the server
 */
const bootstrap = async () => {
  logger.info("🚀 Starting PowerStream API...");
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   Host: ${env.HOST}:${env.PORT}`);
  
  // Validate environment
  validateEnv();
  
  // ============================================================
  // 1. INITIALIZE DATABASE CONNECTIONS
  // ============================================================
  
  // MongoDB
  const mongoConnected = await connectMongo();
  if (!mongoConnected) {
    logger.warn("⚠️ Starting without MongoDB - some features will be unavailable");
  }
  
  // Redis (optional)
  if (env.USE_REDIS) {
    await initRedis();
  }
  
  // ============================================================
  // 2. INITIALIZE SERVICES
  // ============================================================
  
  // Cloudinary
  initCloudinary();
  
  // BullMQ Queues (requires Redis)
  await initQueues();
  
  // ============================================================
  // 3. SEED INITIAL DATA (if connected to DB)
  // ============================================================
  
  if (mongoConnected) {
    try {
      const { seedAdminUser } = await import("../scripts/seedAdminUser.js");
      await seedAdminUser();
    } catch (err) {
      logger.warn("Admin seed skipped:", err.message);
    }
    
    try {
      const { ensureOwnerUser } = await import("../scripts/ensureOwnerUser.js");
      await ensureOwnerUser();
    } catch (err) {
      logger.warn("Owner seed skipped:", err.message);
    }
    
    // Auto-seed data if enabled
    if (env.AUTO_SEED_DATA) {
      try {
        const { seedSPSStations } = await import("../seeders/spsStationSeeder.js");
        const { seedTGTContestants } = await import("../seeders/tgtContestantSeeder.js");
        await seedSPSStations();
        await seedTGTContestants();
        logger.info("✅ Auto-seeded data");
      } catch (err) {
        logger.warn("Auto-seed skipped:", err.message);
      }
    }
  }
  
  // ============================================================
  // 4. CREATE EXPRESS APP
  // ============================================================
  
  const app = await createApp();
  
  // ============================================================
  // 5. CREATE HTTP SERVER & SOCKET.IO
  // ============================================================
  
  const server = http.createServer(app);
  
  // Initialize Socket.IO namespaces
  const io = await initAllSockets(server);
  app.set("io", io);
  
  // ============================================================
  // 6. START STREAMING SERVER (NodeMediaServer)
  // ============================================================
  
  try {
    const { startStreamingServer } = await import("../services/StreamingServer.js");
    await startStreamingServer({
      onPublish: (id, streamPath) => {
        logger.info(`Stream published: ${streamPath}`);
        io?.of("/stream")?.emit("stream:started", { streamPath });
      },
      onDonePublish: (id, streamPath) => {
        logger.info(`Stream ended: ${streamPath}`);
        io?.of("/stream")?.emit("stream:ended", { streamPath });
      },
    });
    logger.info("✅ Streaming server started");
  } catch (err) {
    logger.warn("⚠️ Streaming server not started:", err.message);
  }
  
  // ============================================================
  // 7. START LISTENING
  // ============================================================
  
  server.listen(env.PORT, env.HOST, () => {
    logger.info(`🟢 PowerStream API running at http://${env.HOST}:${env.PORT}`);
    logger.info(`   Health: http://${env.HOST}:${env.PORT}/health`);
    if (env.ENABLE_GRAPHQL) {
      logger.info(`   GraphQL: http://${env.HOST}:${env.PORT}/graphql`);
    }
  });
  
  // Handle server errors
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`❌ Port ${env.PORT} is already in use`);
    } else {
      logger.error("❌ Server error:", err);
    }
    process.exit(1);
  });
  
  // ============================================================
  // 8. GRACEFUL SHUTDOWN
  // ============================================================
  
  const shutdown = async (signal) => {
    logger.info(`\n${signal} received. Shutting down gracefully...`);
    
    // Close HTTP server
    server.close(() => {
      logger.info("HTTP server closed");
    });
    
    // Close Socket.IO
    const io = getIO();
    if (io) {
      io.close();
      logger.info("Socket.IO closed");
    }
    
    // Shutdown queues
    await shutdownQueues();
    
    // Disconnect Redis
    await disconnectRedis();
    
    // Disconnect MongoDB
    await disconnectMongo();
    
    logger.info("Graceful shutdown complete");
    process.exit(0);
  };
  
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  
  // Handle unhandled rejections
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection:", reason);
  });
  
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
  });
};

// Start the server
bootstrap().catch((err) => {
  logger.error("Fatal startup error:", err);
  process.exit(1);
});

