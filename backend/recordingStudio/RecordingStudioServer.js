// 🎚️ Southern Power Syndicate: Recording Studio Backend (Black & Gold Edition)

import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import mongoose from "mongoose";
import morgan from "morgan";
import { Server } from "socket.io";

// --- Resolve dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load environment
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

// Optional debug
try {
  const envContent = await fs.readFile(envPath, "utf8");
  console.log("✅ .env.local loaded:", envPath);
  console.log("🔒 Masked ENV Preview:\n", envContent.replace(/(PASSWORD|SECRET|KEY|TOKEN|URI)=.*/gi, "$1=***"));
} catch (err) {
  console.warn("⚠️ Could not read .env.local at", envPath, "-", err.message);
}

// --- MongoDB Connection Logic
mongoose.set("strictQuery", true);

// Build Mongo URI with proper URL encoding for credentials
const buildMongoUri = () => {
  // Priority: MONGO_URI > STUDIO_MONGO_URI > build from split creds
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.STUDIO_MONGO_URI) return process.env.STUDIO_MONGO_URI;

  const username = process.env.MONGO_USER;
  const password = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST || "cluster0.ldmtan.mongodb.net";
  const db = process.env.STUDIO_MONGO_DB || process.env.MONGO_DB || "powerstream";
  const appName = process.env.MONGO_APP || "Cluster0";
  const authSource = (process.env.MONGO_AUTH_SOURCE || "").trim();

  if (!username || !password) return null;

  // URL-encode username and password to handle special characters
  const encUser = encodeURIComponent(username);
  const encPass = encodeURIComponent(password);

  const base = `mongodb+srv://${encUser}:${encPass}@${host}/${db}?retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;
  return authSource ? `${base}&authSource=${encodeURIComponent(authSource)}` : base;
};

const STUDIO_MONGO_URI = buildMongoUri();

if (!STUDIO_MONGO_URI) {
  console.error("❌ No MongoDB URI available! Set STUDIO_MONGO_URI, MONGO_URI, or MONGO_USER/MONGO_PASS in .env.local");
  process.exit(1);
}

// Debug: show masked URI structure to help diagnose auth issues
const maskUri = (uri) => {
  try {
    const url = new URL(uri);
    if (url.password) url.password = "****";
    return url.toString();
  } catch {
    return uri.replace(/:([^:@]+)@/, ":****@");
  }
};
console.log("🔗 Using MongoDB URI:", maskUri(STUDIO_MONGO_URI));

// Retry configuration
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000; // 5 seconds
let retryCount = 0;

async function connectMongo() {
  try {
    console.log("🟡 MongoDB: connecting to Recording Studio database…");
    await mongoose.connect(STUDIO_MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("🧠 MongoDB connected for Recording Studio");
    retryCount = 0; // Reset on successful connection
  } catch (err) {
    retryCount++;
    console.error(`❌ MongoDB Connection Error (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);
    if (err?.reason?.codeName) console.error("   codeName:", err.reason.codeName);
    if (err?.code) console.error("   code:", err.code);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectMongo(); // Recursive retry
    } else {
      console.error("❌ Max retries reached. Exiting...");
      process.exit(1);
    }
  }
}

// Handle disconnection - auto reconnect
mongoose.connection.on("disconnected", () => {
  console.log("🔄 MongoDB disconnected. Attempting reconnection...");
  retryCount = 0; // Reset for reconnection attempts
  connectMongo();
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("reconnected", () => {
  console.log("🟢 MongoDB reconnected (Recording Studio)");
});

// --- Import Routes
import studioRoutes from "./routes/studioRoutes.js";
import intakeRoutes from "./routes/intakeRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import beatRoutes from "./routes/beatRoutes.js";
import collabRoutes from "./routes/collabRoutes.js";
import sampleRoutes from "./routes/sampleRoutes.js";
import mixingRoutes from "./routes/mixingRoutes.js";
import mixRoutes from "./routes/mixRoutes.js"; // Real FFmpeg Mix & Master routes
import royaltyRoutes from "./routes/royaltyRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import recordingsRoutes from "./routes/recordings.js";
import authRoutes from "./routes/authRoutes.js"; // studio auth
import deviceRoutes from "./routes/deviceRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js"; // Library routes for unified access
import beatLabRoutes from "./routes/beatLabRoutes.js"; // Beat Lab with AI generation
import aiBeatRoutes from "./routes/aiBeatRoutes.js"; // AI Beat Engine routes
import aiMasterRoutes from "./routes/aiMasterRoutes.js"; // AI Master Engine routes
import beatStoreRoutes from "./routes/beatStoreRoutes.js"; // Beat Store routes
import voiceRoutes from "./routes/voiceRoutes.js"; // AI Voice Clone routes
import tvExportRoutes from "./routes/tvExportRoutes.js"; // TV Streaming Export routes
import adminProducerRoutes from "./routes/adminProducerRoutes.js"; // Admin Producer Dashboard routes

// --- Create App
const app = express();

// --- CORS Config
const allowed = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map(s => s.trim())
  : ["http://localhost:5173", "http://localhost:3000", "https://southernpowertvmusic.com"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      console.warn("❌ CORS blocked:", origin);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(morgan("dev"));

// --- Healthcheck
app.get("/studio-health", (_req, res) => res.send("🎙️ Recording Studio Backend Live"));
app.get("/studio-env-check", (_req, res) =>
  res.json({
    ok: true,
    STUDIO_PORT: process.env.STUDIO_PORT || 5100,
    NODE_ENV: process.env.NODE_ENV || "development",
    mongo: Boolean(STUDIO_MONGO_URI),
  })
);

// --- API Routes
app.use("/api/studio", studioRoutes);
app.use("/api/intake", intakeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/beats", beatRoutes);
app.use("/api/beat-drafts", beatRoutes); // Alias for library
app.use("/api/collabs", collabRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/mixing", mixingRoutes);
app.use("/api/mix", mixRoutes); // New Mix & Master API
app.use("/api/mixes", mixRoutes); // Alias for library
app.use("/api/royalty", royaltyRoutes); // New path
app.use("/api/royalties", royaltyRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/recordings", recordingsRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/export", uploadRoutes); // Reuse upload for exports
app.use("/api/library", libraryRoutes); // Unified library access
app.use("/api/beatlab", beatLabRoutes); // AI Beat Generation
app.use("/api/aistudio/beat", beatLabRoutes); // Alias for frontend compatibility
app.use("/api/studio/ai", aiBeatRoutes); // AI Beat Engine (new)
app.use("/api/ai/beat", aiBeatRoutes); // Alias for AI beat generation
app.use("/api/studio/ai/master", aiMasterRoutes); // AI Master Engine
app.use("/api/master", aiMasterRoutes); // Alias for mastering
app.use("/api/studio/beats", beatStoreRoutes); // Beat Store
app.use("/api/beatstore", beatStoreRoutes); // Alias for Beat Store
app.use("/api/studio/voice", voiceRoutes); // AI Voice Clone
app.use("/api/voice", voiceRoutes); // Alias for Voice Clone
app.use("/api/studio/tv", tvExportRoutes); // TV Streaming Export
app.use("/api/tv", tvExportRoutes); // Alias for TV Export
app.use("/api/studio/admin/producers", adminProducerRoutes); // Admin Producer Dashboard
app.use("/api/admin/producers", adminProducerRoutes); // Alias for Admin Producers

// --- 404 Handler
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found", path: req.path });
});

// --- Error Handler
app.use((err, _req, res, _next) => {
  console.error("💥 Error:", err);
  res.status(err.status || 500).json({ ok: false, message: err.message || "Internal Server Error" });
});

// --- Create Server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// --- Studio Collaboration Realtime Logic
const activeRooms = {};

io.on("connection", (socket) => {
  console.log("🎧 Engineer connected:", socket.id);

  socket.on("join_room", (roomId, userName) => {
    socket.join(roomId);
    if (!activeRooms[roomId]) activeRooms[roomId] = [];
    activeRooms[roomId].push({ id: socket.id, name: userName });
    io.to(roomId).emit("room_update", activeRooms[roomId]);
    console.log(`👥 ${userName} joined room ${roomId}`);
  });

  socket.on("chat_message", (roomId, messageData) => {
    io.to(roomId).emit("chat_message", messageData);
  });

  socket.on("ai_query", (roomId, queryData) => {
    const aiResponse = {
      from: "AI",
      text: `💡 AI Suggestion: "${queryData.text}"`,
    };
    io.to(roomId).emit("ai_response", aiResponse);
  });

  socket.on("meter_update", (roomId, level) => {
    io.to(roomId).emit("meter_update", { user: socket.id, level });
  });

  socket.on("disconnect", () => {
    for (const roomId in activeRooms) {
      activeRooms[roomId] = activeRooms[roomId].filter(u => u.id !== socket.id);
      io.to(roomId).emit("room_update", activeRooms[roomId]);
    }
    console.log("🔌 Engineer disconnected:", socket.id);
  });
});

// --- Boot Server
const PORT = Number(process.env.STUDIO_PORT) || 5100;
(async () => {
  try {
    await connectMongo();
    server.listen(PORT, () => {
      console.log(`🎛️ Recording Studio running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}/studio-health`);
    });
  } catch (err) {
    console.error("❌ Failed to start Recording Studio server:", err);
    process.exit(1);
  }
})();
