// backend/server.js
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import "colors";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 5001);
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

// ------------------------------------
// Build Mongo URI (supports two styles)
// 1) Full MONGO_URI
// 2) Split creds: MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB, MONGO_APP, MONGO_AUTH_SOURCE
// ------------------------------------
const buildMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI; // use full URI if provided

  const u = process.env.MONGO_USER;
  const p = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST || "cluster0.ldmtan.mongodb.net";
  const db   = process.env.MONGO_DB   || "powerstream";
  const appn = process.env.MONGO_APP  || "Cluster0";
  const auth = (process.env.MONGO_AUTH_SOURCE || "").trim();

  if (!u || !p) return null; // not enough info to build one
  const encU = encodeURIComponent(u);
  const encP = encodeURIComponent(p);
  const base = `mongodb+srv://${encU}:${encP}@${host}/${db}?retryWrites=true&w=majority&appName=${encodeURIComponent(appn)}`;
  return auth ? `${base}&authSource=${encodeURIComponent(auth)}` : base;
};

// ----- CORS -----
const allowedFromEnv = [
  ...(process.env.CORS_ALLOWED_ORIGINS?.split(",") ?? []),
  ...(process.env.CORS_EXTRA_ORIGINS?.split(",") ?? []),
  ...(process.env.CORS_ORIGINS?.split(",") ?? []),
].map(s => s.trim()).filter(Boolean);

if (allowedFromEnv.length === 0) {
  allowedFromEnv.push("http://localhost:3000","http://localhost:5173","http://127.0.0.1:5173");
}

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedFromEnv.includes(origin)) return cb(null, true);
    console.warn("⛔ CORS blocked:", origin);
    return cb(new Error("CORS not allowed for this origin"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With","Accept","Origin"],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"))

// ----- Health -----
app.get(["/api/health", "/health"], (req, res) => {
  res.status(200).json({
    ok: true,
    service: "powerstream-api",
    host: req.hostname,
    port: PORT,
    env: NODE_ENV,
    ts: new Date().toISOString(),
  });
});

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

const connectDB = async () => {
  const uri = buildMongoUri();
  if (!uri) {
    console.warn("⚠️ No Mongo credentials/URI in env — server will start WITHOUT DB".yellow);
    return;
  }
  try {
    console.log("🟡 MongoDB: connecting…");
    await mongoose.connect(uri, { maxPoolSize: 10 });
    console.log("🟢 MongoDB: connected");
  } catch (e) {
    console.error("❌ MongoDB connection error:", e?.message || e);
    if (e?.reason?.codeName) console.error("   codeName:", e.reason.codeName);
    if (e?.code) console.error("   code:", e.code);
  }
};

const initRedisIfAvailable = async () => {
  if (process.env.USE_REDIS !== "true") {
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

const initMasterCircuitBoard = async () => {
  try {
    const mod = await import("./core/MasterCircuitBoard.js");
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
    console.warn("ℹ️  liveRoutes.js not found; skipping /api/live");
  }

  await mountOptional("/api/devices", "./routes/deviceRoutes.js");
  await mountOptional("/api/feed", "./routes/feedRoutes.js");
  await mountOptional("/api/gram", "./routes/gramRoutes.js");
  await mountOptional("/api/reels", "./routes/reelRoutes.js");
  await mountOptional("/api/audio", "./routes/audioRoutes.js");
  await mountOptional("/api/video", "./routes/videoRoutes.js");
  await mountOptional("/api/upload", "./routes/uploadRoutes.js");
  await mountOptional("/api/stream", "./routes/streamRoutes.js");
  await mountOptional("/api/auth", "./routes/authRoutes.js");
  await mountOptional("/api/users", "./routes/userRoutes.js");
  await mountOptional("/api/coins", "./routes/coinRoutes.js");
  await mountOptional("/api/payouts", "./routes/payoutRoutes.js");
  await mountOptional("/api/subscriptions", "./routes/subscriptionRoutes.js");
  await mountOptional("/api/withdrawals", "./routes/withdrawalRoutes.js");
  await mountOptional("/api/intents", "./routes/intentRoutes.js");
  await mountOptional("/api/admin", "./routes/adminRoutes.js");
  await mountOptional("/api/commands", "./routes/commandRoutes.js");
  await mountOptional("/api/autopilot", "./routes/autopilotRoutes.js");
  await mountOptional("/api/jobs", "./routes/jobRoutes.js");
  await mountOptional("/api/stations", "./routes/stationRoutes.js");
  await mountOptional("/api/copilot", "./routes/copilotRoutes.js");
};

// 404 + error handlers must be registered after routes
const registerErrors = () => {
  app.use((req, res, next) => {
    if (res.headersSent) return next();
    return res.status(404).json({ ok:false, error:"Not found", path:req.originalUrl });
  });
  app.use((err, req, res, _next) => {
    console.error("💥 Server error:", err?.stack || err?.message || err);
    res.status(err.status || 500).json({ ok:false, error: err.message || "Internal server error" });
  });
};

// ---- Boot ----
const startServer = async () => {
  await connectDB();
  await initRedisIfAvailable();

  const mcbRan = await initMasterCircuitBoard();
  if (!mcbRan) await mountRoutesCompat(); // fallback only if MCB missing

  registerErrors();

  const server = http.createServer(app);
  await attachStudioSocket(server);

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
};

process.on("unhandledRejection", (e) => console.error("❌ unhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("❌ uncaughtException:", e));

startServer();
