// backend/server.js
// PowerStream API Server - Main Entry Point
// NOTE: This is the LEGACY server entry point. For new architecture, use /src/server.js

import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import "colors";

// Centralized configuration - SINGLE SOURCE OF TRUTH
import env, { buildMongoUri, getAllowedOrigins, validateEnv } from "./src/config/env.js";

// Custom middleware
import logger from "./middleware/logger.js";
import errorHandler, { notFoundHandler } from "./middleware/errorHandler.js";

// PowerLine V5 routes (from routes folder)
import powerlineRoutes from "./routes/powerlineRoutes.js";

// TV Station routes (legacy compatibility)
import tvStationRoutes from "./routes/tvStationRoutes.js";

// Upload routes - uses central Cloudinary config
import uploadRoutes from "./routes/uploadRoutes.js";
import testCloudinaryRoutes from "./routes/testCloudinaryRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";

// PowerStream Films API
import powerstreamRoutes from "./routes/powerstreamRoutes.js";

// Broadcast Empire Pack - Schedule management
import broadcastRoutes from "./routes/broadcastRoutes.js";

// AI Beat Generator
import beatRoutes from "./routes/beatRoutes.js";

// Studio Export
import exportRoutes from "./routes/exportRoutes.js";

// Royalty Ledger
import royaltyRoutes from "./routes/royaltyRoutes.js";

// Studio Library
import studioLibraryRoutes from "./routes/studioLibraryRoutes.js";

// Trending Topics
import trendingRoutes from "./routes/trendingRoutes.js";

// Audio Tracks - Station audio publishing & streaming
import audioTrackRoutes from "./routes/audioTrackRoutes.js";

// Cloudinary is configured automatically via import in uploadRoutes.js

// Validate environment on startup
validateEnv();

const HOST = env.HOST;
const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

const app = express();

// ----- CORS -----
const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || env.isDev()) return cb(null, true);
    console.warn("⛔ CORS blocked:", origin);
    return cb(new Error("CORS not allowed for this origin"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(logger); // Custom request logger with timing

// ----- Health -----
// Lightweight inline health endpoint (no DB required)
app.get(["/api/health", "/health"], (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "powerstream-api",
    host: req.hostname,
    port: PORT,
    env: NODE_ENV,
    time: new Date().toISOString(),
  });
});

// Studio Health endpoint (for frontend to check main API studio features)
app.get("/api/studio/health", (req, res) => {
  res.status(200).json({
    ok: true,
    status: "online",
    service: "powerstream-studio",
    port: PORT,
    env: NODE_ENV,
    features: [
      "library",
      "sessions",
      "upload",
      "export",
    ],
    timestamp: new Date().toISOString(),
    message: "Studio API (Main Server) is running. For advanced features, Recording Studio server (5100) may be required.",
  });
});

// ----- PowerLine V5 Routes (Golden Implementation) -----
app.use("/api/powerline", powerlineRoutes);

// ----- TV Station Routes (Legacy Compatibility) -----
app.use("/api/tv-stations", tvStationRoutes);

// ----- Upload Routes -----
app.use("/api/upload", uploadRoutes);
console.log("✅ Mounted /api/upload -> backend/routes/uploadRoutes.js");

app.use("/api/test-cloudinary", testCloudinaryRoutes);
console.log("✅ Mounted /api/test-cloudinary -> backend/routes/testCloudinaryRoutes.js");

app.use("/api/movies", movieRoutes);
console.log("✅ Mounted /api/movies -> backend/routes/movieRoutes.js");

app.use("/api/powerstream", powerstreamRoutes);
console.log("✅ Mounted /api/powerstream -> backend/routes/powerstreamRoutes.js");

// ----- Broadcast Empire Pack -----
app.use("/api/broadcast", broadcastRoutes);

// ----- AI Beat Generator -----
app.use("/api/beat", beatRoutes);
console.log("✅ Mounted /api/beat -> backend/routes/beatRoutes.js");

// ----- Trending Topics -----
app.use("/api/trending", trendingRoutes);
console.log("✅ Mounted /api/trending -> backend/routes/trendingRoutes.js");

// ----- Audio Tracks (Station Audio Publishing) -----
app.use("/api", audioTrackRoutes);
console.log("✅ Mounted /api/audio, /api/stations/:key/audio, /api/studio/publish-to-station");

// ----- Studio Export -----
app.use("/api/export", exportRoutes);
console.log("✅ Mounted /api/export -> backend/routes/exportRoutes.js");

// ----- Royalty Ledger -----
app.use("/api/royalty", royaltyRoutes);
console.log("✅ Mounted /api/royalty -> backend/routes/royaltyRoutes.js");

// ----- Royalty Registration (Copyright & Ownership Ledger) -----
import royaltyRegistrationRoutes from "./routes/royaltyRegistrationRoutes.js";
app.use("/api/royalty/register", royaltyRegistrationRoutes);
console.log("✅ Mounted /api/royalty/register -> backend/routes/royaltyRegistrationRoutes.js");

// ----- Stream Keys (Southern Power Unified) -----
import streamKeyRoutes from "./routes/streamKeyRoutes.js";
app.use("/api/stream-keys", streamKeyRoutes);
console.log("✅ Mounted /api/stream-keys -> backend/routes/streamKeyRoutes.js");

// ----- No Limit Forever TV (Films, Documentaries, Series) -----
import noLimitForeverFilmRoutes from "./routes/noLimitForeverFilmRoutes.js";
app.use("/api/nlf", noLimitForeverFilmRoutes);
console.log("✅ Mounted /api/nlf -> backend/routes/noLimitForeverFilmRoutes.js");

// ----- Studio Library -----
app.use("/api/studio", studioLibraryRoutes);
console.log("✅ Mounted /api/studio -> backend/routes/studioLibraryRoutes.js");

// ----- Studio Playback (play/stop/delete recordings) -----
import playbackRoutes from "./routes/playbackRoutes.js";
app.use("/api/studio", playbackRoutes);
console.log("✅ Mounted /api/studio/play -> backend/routes/playbackRoutes.js");

// ----- Studio Labels & Engineer/Producer Management -----
import studioLabelRoutes from "./routes/studioLabelRoutes.js";
app.use("/api/studio", studioLabelRoutes);
console.log("✅ Mounted /api/studio/labels -> backend/routes/studioLabelRoutes.js");

// Export routes already mounted above with MixdownEngine + StemExporter

// ----- Watch History -----
import historyRoutes from "./routes/historyRoutes.js";
app.use("/api/history", historyRoutes);
console.log("✅ Mounted /api/history -> backend/routes/historyRoutes.js");

// ----- Church Network -----
import churchRoutes from "./routes/churchRoutes.js";
app.use("/api/church", churchRoutes);
app.use("/api/churches", churchRoutes); // Alias for compatibility
console.log("✅ Mounted /api/church & /api/churches -> backend/routes/churchRoutes.js");

// ----- School Network -----
import schoolRoutes from "./routes/schoolRoutes.js";
app.use("/api/schools", schoolRoutes);
console.log("✅ Mounted /api/schools -> backend/routes/schoolRoutes.js");

// ----- No Limit Forever TV -----
import nlfRoutes from "./routes/nlfRoutes.js";
app.use("/api/nlf", nlfRoutes);
console.log("✅ Mounted /api/nlf -> backend/routes/nlfRoutes.js (with ratings, views, payouts)");

// ----- Universal TV Engagement (Ratings, Views, Payouts) -----
import tvEngagementRoutes from "./routes/tvEngagementRoutes.js";
app.use("/api/tv/engagement", tvEngagementRoutes);
console.log("✅ Mounted /api/tv/engagement -> backend/routes/tvEngagementRoutes.js");

// ----- Engineer Access Code System (No Limit East Houston) -----
import engineerAccessRoutes from "./routes/engineerAccessRoutes.js";
app.use("/api/engineer", engineerAccessRoutes);
console.log("✅ Mounted /api/engineer -> backend/routes/engineerAccessRoutes.js");

// ----- Helpers -----
const mountOptional = async (mountPath, modulePath) => {
  try {
    const mod = await import(modulePath);
    const router = mod.default ?? mod.router ?? mod;
    if (router) {
      app.use(mountPath, router);
      console.log(`✅ Mounted ${mountPath} from ${modulePath}`);
    } else {
      console.warn(`⚠️ ${modulePath} loaded but no default/router export; skipped`);
    }
  } catch (err) {
    if (err?.code === "ERR_MODULE_NOT_FOUND") {
      console.warn(`ℹ️ ${modulePath} not found; skipping ${mountPath}`);
    } else {
      console.warn(`⚠️ Failed to mount ${mountPath} from ${modulePath}:`, err.message || err);
    }
  }
};

// Retry configuration
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000; // 5 seconds
let retryCount = 0;

const connectDB = async () => {
  const uri = buildMongoUri();
  if (!uri) {
    console.warn("⚠️ No Mongo credentials/URI in env — server will start WITHOUT DB".yellow);
    return;
  }
  try {
    console.log("🟡 MongoDB: connecting…");
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("🟢 MongoDB: connected");
    retryCount = 0; // Reset on success
  } catch (e) {
    retryCount++;
    console.error(`❌ MongoDB connection error (attempt ${retryCount}/${MAX_RETRIES}):`, e?.message || e);
    if (e?.reason?.codeName) console.error("   codeName:", e.reason.codeName);
    if (e?.code) console.error("   code:", e.code);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(); // Recursive retry
    } else {
      console.error("❌ Max retries reached. Server will run without DB.");
    }
  }
};

// Handle disconnection - auto reconnect
mongoose.connection.on("disconnected", () => {
  console.log("🔄 MongoDB disconnected. Attempting reconnection...");
  retryCount = 0;
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("reconnected", () => {
  console.log("🟢 MongoDB reconnected");
});

const initRedisIfAvailable = async () => {
  if (!env.USE_REDIS) {
    console.log("ℹ️ Redis disabled via USE_REDIS!=true");
    return;
  }
  try {
    const mod = await import("./config/redis.js");
    if (mod.initRedis) {
      await mod.initRedis();
      console.log("🟢 Redis: connected (initRedis)");
    } else if (mod.default && mod.default.connect) {
      if (!mod.default.isOpen) await mod.default.connect();
      console.log("🟢 Redis: connected (default client)");
    } else {
      console.log("ℹ️ Redis module found but no init/connect exported; skipping connect.");
    }
  } catch (err) {
    console.warn("⚠️ Redis not initialized:", err?.message);
  }
};

const attachStudioSocket = async (server) => {
  try {
    const mod = await import("./sockets/studioSocket.js");
    const setupStudioSocket = mod.setupStudioSocket || mod.default;
    if (setupStudioSocket) setupStudioSocket(server);
  } catch (e) {
    console.warn("⚠️ Studio socket init skipped:", e?.message);
  }
};

const attachTGTSocket = async (server) => {
  try {
    let io = app.get("io");
    if (!io) {
      const { Server } = await import("socket.io");
      io = new Server(server, {
        cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
      });
      app.set("io", io);
      console.log("✅ Created Socket.IO instance for TGT");
    }
    const tgtMod = await import("./sockets/tgtSocket.js");
    if (tgtMod.initTGTSocket) {
      tgtMod.initTGTSocket(io);
      console.log("✅ TGT Socket namespace initialized");
    }
  } catch (e) {
    console.warn("⚠️ TGT socket init skipped:", e?.message);
  }
};

const attachPowerlineSocket = async (server) => {
  try {
    let io = app.get("io");
    if (!io) {
      const { Server } = await import("socket.io");
      io = new Server(server, {
        cors: {
          origin: allowedOrigins,
          methods: ["GET", "POST"],
          credentials: true,
        },
      });
      app.set("io", io);
      console.log("✅ Created Socket.IO instance for PowerLine");
    }

    // Try to load PowerLine socket from sockets folder first, fallback to src/api
    let powerlineSocketMod;
    try {
      powerlineSocketMod = await import("./sockets/powerlineSocket.js");
    } catch {
      try {
        powerlineSocketMod = await import("./src/api/powerline/powerline.socket.js");
      } catch {
        console.warn("⚠️ PowerLine socket module not found");
        return;
      }
    }

    const initPowerlineSocket = powerlineSocketMod.default || powerlineSocketMod.initPowerlineSocket;
    if (initPowerlineSocket) {
      initPowerlineSocket(io);
      console.log("✅ PowerLine Socket namespace initialized");
    }
  } catch (e) {
    console.warn("⚠️ PowerLine socket init skipped:", e?.message);
  }
};

const attachChatSocket = async (server) => {
  try {
    let io = app.get("io");
    if (!io) {
      const { Server } = await import("socket.io");
      io = new Server(server, {
        cors: {
          origin: allowedOrigins,
          methods: ["GET", "POST"],
          credentials: true,
        },
      });
      app.set("io", io);
      console.log("✅ Created Socket.IO instance for Chat");
    }

    const chatSocketMod = await import("./sockets/chatSocket.js");
    if (chatSocketMod.default) {
      chatSocketMod.default(io);
    } else if (chatSocketMod.initChatSocket) {
      chatSocketMod.initChatSocket(io);
    }
  } catch (e) {
    console.warn("⚠️ Chat socket init skipped:", e?.message);
  }
};

const initMasterCircuitBoard = async () => {
  try {
    const mod = await import("./Core/MasterCircuitBoard.js");
    const registerServices = mod.registerServices || mod.default;
    if (registerServices) {
      await registerServices(app);
      console.log("🧠 MasterCircuitBoard: registered.");
      return true;
    }
    console.warn("ℹ️ MasterCircuitBoard found, but no registerServices export.");
    return false;
  } catch (err) {
    console.warn("⚠️ MasterCircuitBoard not found, continuing…", err?.message);
    return false;
  }
};

const mountRoutesCompat = async () => {
  try {
    const lr = await import("./routes/liveRoutes.js");
    const liveRoutes = lr.default ?? lr.router ?? lr;
    if (liveRoutes) app.use("/api/live", liveRoutes);
    console.log("✅ Mounted /api/live from ./routes/liveRoutes.js");
  } catch {
    console.warn("ℹ️ liveRoutes.js not found; skipping /api/live");
  }

  await mountOptional("/api/devices", "./routes/deviceRoutes.js");
  await mountOptional("/api/feed", "./routes/feedRoutes.js");
  await mountOptional("/api/gram", "./routes/gramRoutes.js");
  await mountOptional("/api/reels", "./routes/reelRoutes.js");
  await mountOptional("/api/audio", "./routes/audioRoutes.js");
  await mountOptional("/api/video", "./routes/videoRoutes.js");
  // Note: /api/upload is mounted statically above
  await mountOptional("/api/stream", "./routes/streamRoutes.js");
  await mountOptional("/api/auth", "./routes/authRoutes.js");
  await mountOptional("/api/users", "./routes/userRoutes.js");
  await mountOptional("/api/coins", "./routes/coinRoutes.js");
  await mountOptional("/api/payouts", "./routes/payoutRoutes.js");
  await mountOptional("/api/subscriptions", "./routes/subscriptionRoutes.js");
  await mountOptional("/api/payments", "./routes/paymentsDevRoutes.js");
  await mountOptional("/api/withdrawals", "./routes/withdrawalRoutes.js");
  await mountOptional("/api/intents", "./routes/intentRoutes.js");
  await mountOptional("/api/admin", "./routes/adminRoutes.js");
  await mountOptional("/api/commands", "./routes/commandRoutes.js");
  await mountOptional("/api/autopilot", "./routes/autopilotRoutes.js");
  await mountOptional("/api/jobs", "./routes/jobRoutes.js");
  // Note: /api/stations removed - use /api/tv/stations instead (via tvRoutes.js)
  await mountOptional("/api/shows", "./routes/showRoutes.js");
  await mountOptional("/api/studio", "./routes/studioExportRoutes.js");
  await mountOptional("/api/studio/sessions", "./routes/studioSessionRoutes.js");
  // Note: /api/engineer is mounted statically above
  await mountOptional("/api/copilot", "./routes/copilotRoutes.js");
  await mountOptional("/api/aicoach", "./routes/aiCoachRoutes.js");
  await mountOptional("/api/aistudio", "./routes/aiStudioProRoutes.js");

  // PowerStream Master App Routes
  await mountOptional("/api/powerfeed", "./routes/powerFeedRoutes.js");
  await mountOptional("/api/powergram", "./routes/powerGramRoutes.js");
  await mountOptional("/api/powerreel", "./routes/powerReelRoutes.js");
  // Note: PowerLine V5 is mounted statically at top of file

  // Golden TV Subsystem Routes
  await mountOptional("/api/tv", "./routes/tvRoutes.js");
  await mountOptional("/api/broadcast", "./routes/broadcastRoutes.js");
  await mountOptional("/api/vod", "./routes/vodRoutes.js");

  // Legacy TV routes (kept for backwards compatibility)
  // Note: /api/tv-stations is mounted statically above
  await mountOptional("/api/ps-tv", "./routes/powerStreamTVRoutes.js");
  await mountOptional("/api/powerstream", "./routes/powerstreamRoutes.js");
  await mountOptional("/api/chat", "./routes/chatRoutes.js");
  await mountOptional("/api/tgt", "./routes/tgtRoutes.js");
  await mountOptional("/api/seed", "./routes/seedRoutes.js");
  await mountOptional("/api/rtmp", "./routes/rtmpRoutes.js");
  await mountOptional("/api/multistream", "./routes/multistreamRoutes.js");
  await mountOptional("/api/livepeer", "./routes/livepeerRoutes.js");
  await mountOptional("/api/stories", "./routes/storyRoutes.js");

  // Overlord Spec - Monetization routes (unified)
  await mountOptional("/api/monetization", "./routes/monetization/index.js");

  // Overlord Spec - AI routes (unified)
  await mountOptional("/api/ai", "./routes/ai/index.js");

  // Overlord Spec - Brain routes (direct access)
  await mountOptional("/api/brain", "./routes/ai/brainRoutes.js");

  // Overlord Spec - Admin finance routes
  await mountOptional("/api/admin/finance", "./routes/monetization/adminFinanceRoutes.js");

  // ========================================================
  // AUTO-SEED DISABLED - TV stations should never be wiped
  // To manually seed, use POST /api/tv/seed
  // ========================================================
  // if (env.AUTO_SEED_DATA) {
  //   try {
  //     const { seedSPSStations } = await import("./seeders/spsStationSeeder.js");
  //     const { seedTGTContestants } = await import("./seeders/tgtContestantSeeder.js");
  //     const { seedFilms } = await import("./seeders/filmSeeder.js");
  //     const { seedWorldwideStations } = await import("./seeders/worldwideStationSeeder.js");
  //     const { seedTVStations } = await import("./seeders/tvStationSeeder.js");
  //
  //     await seedSPSStations();
  //     await seedTGTContestants();
  //     await seedFilms();
  //     await seedWorldwideStations();
  //     await seedTVStations();
  //
  //     console.log("✅ Auto-seeded all data");
  //   } catch (err) {
  //     console.warn("⚠️ Auto-seed failed:", err.message);
  //   }
  // }
};

// 404 + error handlers must be registered after routes
const registerErrors = () => {
  // 404 handler - catches unmatched routes
  app.use(notFoundHandler);

  // Global error handler - catches all errors passed via next(err)
  app.use(errorHandler);
};

// ---- Boot ----
const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Verify connection is ready before proceeding
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ MongoDB not connected, continuing without DB features");
    } else {
      // Step 3: Seed users AFTER connection is confirmed ready
      try {
        const { seedAdminUser } = await import("./scripts/seedAdminUser.js");
        await seedAdminUser();
      } catch (err) {
        console.warn("⚠️ Admin user seed failed (non-fatal):", err.message);
      }

      try {
        const { ensureOwnerUser } = await import("./scripts/ensureOwnerUser.js");
        await ensureOwnerUser();
      } catch (err) {
        console.warn("⚠️ Owner user seed failed (non-fatal):", err.message);
      }

      // Ensure Southern Power unified stream key exists
      try {
        const { ensureSouthernPowerStreamKey } = await import("./bootstrap/southernPowerStreamKey.js");
        await ensureSouthernPowerStreamKey();
      } catch (err) {
        console.warn("⚠️ Southern Power stream key bootstrap failed (non-fatal):", err.message);
      }
    }

    // Step 4: Initialize Redis (optional)
    await initRedisIfAvailable();

    // Step 5: Mount routes
    const mcbRan = await initMasterCircuitBoard();
    if (!mcbRan) await mountRoutesCompat(); // fallback only if MCB missing

    // Step 6: Register error handlers
    registerErrors();

    // Step 6.5: Start NodeMediaServer (Streaming Server)
    try {
      const { startStreamingServer } = await import("./services/StreamingServer.js");
      const { onPublish, onDonePublish } = await import("./services/StreamingServerEvents.js").catch(() => ({
        onPublish: null,
        onDonePublish: null,
      }));
      await startStreamingServer({
        onPublish:
          onPublish ||
          ((id, streamPath) => {
            console.log(`[Server] Stream published: ${streamPath}`);
          }),
        onDonePublish:
          onDonePublish ||
          ((id, streamPath) => {
            console.log(`[Server] Stream ended: ${streamPath}`);
          }),
      });
      console.log("✅ NodeMediaServer started");
    } catch (err) {
      console.warn("⚠️ NodeMediaServer failed to start (non-fatal):", err.message);
    }

    // Step 7: Create HTTP server
    const server = http.createServer(app);
    await attachStudioSocket(server);
    await attachTGTSocket(server);
    await attachChatSocket(server);
    await attachPowerlineSocket(server);

    // Step 8: Start listening
    server.listen(PORT, HOST, () => {
      console.log(`🚀 PowerStream API listening at http://${HOST}:${PORT}`);
    });

    server.on("error", (err) => {
      if (err?.code === "EADDRINUSE") {
        console.error(`❌ EADDRINUSE: port ${PORT} is already in use on ${HOST}.
Close the other process using that port, or change PORT in backend/.env.`);
      } else {
        console.error("❌ Server error:", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (e) => console.error("❌ unhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("❌ uncaughtException:", e));

startServer();
