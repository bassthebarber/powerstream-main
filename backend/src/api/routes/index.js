// backend/src/api/routes/index.js
// Central route registration for all API endpoints
// NEW ARCHITECTURE ROUTES take priority over legacy routes
import { Router } from "express";
import { logger } from "../../config/logger.js";

// ============================================================
// NEW CANONICAL ROUTES (take priority)
// ============================================================
import healthRoutes from "./health.routes.js";
import brainRoutes from "./brain.routes.js";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import feedRoutes from "./feed.routes.js";
import chatRoutes from "./chat.routes.js";
import tvRoutes from "./tv.routes.js";
import coinsRoutes from "./coins.routes.js";
import eventsRoutes from "./events.routes.js";
import mediaRoutes from "./media.routes.js";

const router = Router();

/**
 * Register all API routes
 * New architecture routes are registered first and take priority
 */
export const registerRoutes = async (app) => {
  try {
    // ============================================================
    // NEW ARCHITECTURE ROUTES (/src/api/routes)
    // These are the canonical routes - traffic should flow through here
    // ============================================================
    
    // Health & monitoring
    app.use("/", healthRoutes);
    
    // Core API routes (NEW ARCHITECTURE)
    app.use("/api/auth", authRoutes);
    app.use("/api/users", usersRoutes);
    app.use("/api/feed", feedRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/tv", tvRoutes);
    app.use("/api/coins", coinsRoutes);
    app.use("/api/events", eventsRoutes);
    app.use("/api/media", mediaRoutes);
    
    // Brain Mode (Voice/Command AI)
    app.use("/api/brain", brainRoutes);
    
    logger.info("✅ New architecture routes registered");
    
    // ============================================================
    // LEGACY ROUTES (../../../routes)
    // These are DEPRECATED but kept for backwards compatibility
    // They will be gradually removed as features are migrated
    // ============================================================
    
    const legacyRoutes = [
      // PowerStream specific routes (still needed)
      { path: "/api/powerfeed", module: "powerFeedRoutes" },
      { path: "/api/powergram", module: "powerGramRoutes" },
      { path: "/api/gram", module: "gramRoutes" },
      { path: "/api/powerreel", module: "powerReelRoutes" },
      { path: "/api/reels", module: "reelRoutes" },
      { path: "/api/powerline", module: "powerLineRoutes" },
      { path: "/api/posts", module: "postRoutes" },
      { path: "/api/comments", module: "commentRoutes" },
      { path: "/api/stories", module: "storyRoutes" },
      { path: "/api/uploads", module: "uploadRoutes" },
      { path: "/api/tv-stations", module: "tvStationRoutes" },
      { path: "/api/stations", module: "stationRoutes" },
      { path: "/api/streams", module: "streamRoutes" },
      { path: "/api/shows", module: "showRoutes" },
      { path: "/api/vod", module: "vodRoutes" },
      { path: "/api/hls", module: "hlsRoutes" },
      { path: "/api/rtmp", module: "rtmpRoutes" },
      { path: "/api/live", module: "liveRoutes" },
      { path: "/api/payments", module: "paymentRoutes" },
      { path: "/api/subscriptions", module: "subscriptionRoutes" },
      { path: "/api/royalty", module: "royaltyRoutes" },
      { path: "/api/withdrawals", module: "withdrawalRoutes" },
      { path: "/api/payouts", module: "payoutRoutes" },
      { path: "/api/studio", module: "studioRoutes" },
      { path: "/api/studio/sessions", module: "studioSessionRoutes" },
      { path: "/api/studio/exports", module: "studioExportRoutes" },
      { path: "/api/beats", module: "beatStoreRoutes" },
      { path: "/api/audio", module: "audioRoutes" },
      { path: "/api/video", module: "videoRoutes" },
      { path: "/api/social", module: "socialRoutes" },
      { path: "/api/search", module: "searchRoutes" },
      { path: "/api/suggest", module: "suggestRoutes" },
      { path: "/api/presence", module: "presenceRoutes" },
      { path: "/api/ai", module: "aiRoutes" },
      { path: "/api/ai/coach", module: "aiCoachRoutes" },
      { path: "/api/ai/studio", module: "aiStudioProRoutes" },
      { path: "/api/copilot", module: "copilotRoutes" },
      { path: "/api/intents", module: "intentRoutes" },
      { path: "/api/commands", module: "commandRoutes" },
      { path: "/api/voice", module: "voiceRoutes" },
      { path: "/api/admin", module: "adminRoutes" },
      { path: "/api/jobs", module: "jobRoutes" },
      { path: "/api/system", module: "systemRoutes" },
      { path: "/api/dev", module: "devRoutes" },
      { path: "/api/multistream", module: "multistreamProfileRoutes" },
      { path: "/api/tgt", module: "tgtRoutes" },
      { path: "/api/devices", module: "deviceRoutes" },
      { path: "/api/livepeer", module: "livepeerRoutes" },
      { path: "/api/ps-tv", module: "powerStreamTVRoutes" },
      { path: "/api/seed", module: "seedRoutes" },
    ];
    
    let loadedCount = 0;
    
    for (const route of legacyRoutes) {
      try {
        const module = await import(`../../../routes/${route.module}.js`);
        const routeHandler = module.default || module.router || module;
        if (routeHandler && typeof routeHandler === "function") {
          app.use(route.path, routeHandler);
          loadedCount++;
        }
      } catch (err) {
        // Route file doesn't exist - skip silently
        if (err.code !== "ERR_MODULE_NOT_FOUND") {
          logger.warn(`⚠️  Failed to load legacy route ${route.module}: ${err.message}`);
        }
      }
    }
    
    logger.info(`✅ Legacy routes loaded: ${loadedCount} routes (deprecated, use new architecture)`);
    
  } catch (err) {
    logger.error("❌ Failed to register routes:", err);
    throw err;
  }
};

export default router;
