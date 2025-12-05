// backend/src/app.js
// Express application setup (separate from server for testing)
import express from "express";
import { configureExpress, configureHealthRoutes, configureErrorHandling } from "./loaders/express.js";
import { logger } from "./config/logger.js";

/**
 * Create and configure Express application
 * @returns {express.Application}
 */
export const createApp = async () => {
  const app = express();
  
  // Configure middleware
  configureExpress(app);
  
  // Configure health routes (before API routes)
  configureHealthRoutes(app);
  
  // Mount API routes
  await mountRoutes(app);
  
  // Configure error handling (after routes)
  configureErrorHandling(app);
  
  return app;
};

/**
 * Mount all API routes
 * Uses dynamic imports to handle missing routes gracefully
 */
const mountRoutes = async (app) => {
  // Helper to safely mount routes
  const mount = async (path, modulePath) => {
    try {
      const module = await import(modulePath);
      const router = module.default ?? module.router ?? module;
      if (router && typeof router === "function") {
        app.use(path, router);
        logger.debug(`✅ Mounted ${path}`);
      }
    } catch (err) {
      if (err.code === "ERR_MODULE_NOT_FOUND") {
        logger.debug(`ℹ️ Route not found: ${modulePath}`);
      } else {
        logger.warn(`⚠️ Failed to mount ${path}: ${err.message}`);
      }
    }
  };
  
  // ============================================================
  // NEW ARCHITECTURE ROUTES (src/api/routes)
  // ============================================================
  await mount("/api/v2/auth", "./api/routes/auth.routes.js");
  await mount("/api/v2/users", "./api/routes/users.routes.js");
  await mount("/api/v2/feed", "./api/routes/feed.routes.js");
  await mount("/api/v2/health", "./api/routes/health.routes.js");
  
  // Brain Mode (Voice/Command AI)
  await mount("/api/brain", "./api/routes/brain.routes.js");
  
  // GraphQL endpoint (if enabled)
  await mount("/graphql", "./api/routes/graphql.routes.js");
  
  // ============================================================
  // LEGACY ROUTES (../routes - backwards compatible)
  // ============================================================
  await mount("/api/auth", "../routes/authRoutes.js");
  await mount("/api/users", "../routes/userRoutes.js");
  await mount("/api/feed", "../routes/feedRoutes.js");
  await mount("/api/live", "../routes/liveRoutes.js");
  await mount("/api/devices", "../routes/deviceRoutes.js");
  await mount("/api/gram", "../routes/gramRoutes.js");
  await mount("/api/reels", "../routes/reelRoutes.js");
  await mount("/api/audio", "../routes/audioRoutes.js");
  await mount("/api/video", "../routes/videoRoutes.js");
  await mount("/api/upload", "../routes/uploadRoutes.js");
  await mount("/api/stream", "../routes/streamRoutes.js");
  await mount("/api/coins", "../routes/coinRoutes.js");
  await mount("/api/payouts", "../routes/payoutRoutes.js");
  await mount("/api/subscriptions", "../routes/subscriptionRoutes.js");
  await mount("/api/withdrawals", "../routes/withdrawalRoutes.js");
  await mount("/api/intents", "../routes/intentRoutes.js");
  await mount("/api/admin", "../routes/adminRoutes.js");
  await mount("/api/commands", "../routes/commandRoutes.js");
  await mount("/api/autopilot", "../routes/autopilotRoutes.js");
  await mount("/api/jobs", "../routes/jobRoutes.js");
  await mount("/api/stations", "../routes/stationRoutes.js");
  await mount("/api/shows", "../routes/showRoutes.js");
  await mount("/api/studio", "../routes/studioExportRoutes.js");
  await mount("/api/studio/sessions", "../routes/studioSessionRoutes.js");
  await mount("/api/copilot", "../routes/copilotRoutes.js");
  await mount("/api/aicoach", "../routes/aiCoachRoutes.js");
  await mount("/api/aistudio", "../routes/aiStudioProRoutes.js");
  await mount("/api/powerfeed", "../routes/powerFeedRoutes.js");
  await mount("/api/powergram", "../routes/powerGramRoutes.js");
  await mount("/api/powerreel", "../routes/powerReelRoutes.js");
  await mount("/api/powerline", "../routes/powerLineRoutes.js");
  await mount("/api/tv-stations", "../routes/tvStationRoutes.js");
  await mount("/api/ps-tv", "../routes/powerStreamTVRoutes.js");
  await mount("/api/chat", "../routes/chatRoutes.js");
  await mount("/api/tgt", "../routes/tgtRoutes.js");
  await mount("/api/seed", "../routes/seedRoutes.js");
  await mount("/api/rtmp", "../routes/rtmpRoutes.js");
  await mount("/api/multistream", "../routes/multistreamProfileRoutes.js");
  await mount("/api/vod", "../routes/vodRoutes.js");
  await mount("/api/livepeer", "../routes/livepeerRoutes.js");
  await mount("/api/stories", "../routes/storyRoutes.js");
  
  logger.info("✅ All routes mounted");
};

export default createApp;

