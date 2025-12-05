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
const STUDIO_MONGO_URI = process.env.STUDIO_MONGO_URI || process.env.MONGO_URI;

if (!STUDIO_MONGO_URI) {
  console.error("❌ STUDIO_MONGO_URI missing from environment!");
  process.exit(1);
}

async function connectMongo() {
  try {
    await mongoose.connect(STUDIO_MONGO_URI, {
      maxPoolSize: 10,
    });
    console.log("🧠 MongoDB connected for Recording Studio");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

// --- Import Routes
import studioRoutes from "./routes/studioRoutes.js";
import intakeRoutes from "./routes/intakeRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import beatRoutes from "./routes/beatRoutes.js";
import collabRoutes from "./routes/collabRoutes.js";
import sampleRoutes from "./routes/sampleRoutes.js";
import mixingRoutes from "./routes/mixingRoutes.js";
import royaltyRoutes from "./routes/royaltyRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import recordingsRoutes from "./routes/recordings.js";
import authRoutes from "./routes/authRoutes.js"; // studio auth
import deviceRoutes from "./routes/deviceRoutes.js";

// --- Create App
const app = express();

// --- CORS Config
// NOTE: Allow all common development ports for frontend apps
const allowed = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map(s => s.trim())
  : [
      "http://localhost:5173",   // Main frontend (Vite default)
      "http://localhost:5174",   // Studio app (Vite alternate)
      "http://localhost:5175",   // Additional frontend ports
      "http://localhost:3000",   // Alternative dev port
      "http://localhost:3001",   // Alternative dev port
      "https://southernpowertvmusic.com",
      "https://powerstream.app",
      "https://studio.powerstream.app",
    ];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return cb(null, true);
      
      // Check allowed list
      if (allowed.includes(origin)) return cb(null, true);
      
      // In development, allow all localhost origins
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return cb(null, true);
      }
      
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

// Session & Project Management
try {
  const sessionRoutes = (await import("./routes/studioSessionRoutes.js")).default;
  app.use("/api/studio/session", sessionRoutes);
} catch (err) {
  console.warn("⚠️ studioSessionRoutes not found:", err.message);
}

// Recording Routes
try {
  const recordRoutes = (await import("./routes/studioRecordRoutes.js")).default;
  app.use("/api/studio/record", recordRoutes);
} catch (err) {
  console.warn("⚠️ studioRecordRoutes not found:", err.message);
}

// Lyrics Routes
try {
  const lyricsRoutes = (await import("./routes/studioLyricsRoutes.js")).default;
  app.use("/api/studio/lyrics", lyricsRoutes);
} catch (err) {
  console.warn("⚠️ studioLyricsRoutes not found:", err.message);
}

// Mastering Routes (legacy)
try {
  const masterRoutes = (await import("./routes/studioMasterRoutes.js")).default;
  app.use("/api/studio/master", masterRoutes);
} catch (err) {
  console.warn("⚠️ studioMasterRoutes not found:", err.message);
}

// Mix Routes (unified)
try {
  const mixRoutes = (await import("./routes/studioMixRoutes.js")).default;
  app.use("/api/mix", mixRoutes);
} catch (err) {
  console.warn("⚠️ studioMixRoutes not found:", err.message);
}

// === STUDIO WIRING ADDITIONS (Frontend expects these) ===

// Library Routes (recordings, beats, mixes in one place)
try {
  const libraryRoutes = (await import("./routes/libraryRoutes.js")).default;
  app.use("/api/library", libraryRoutes);
  console.log("✅ /api/library mounted");
} catch (err) {
  console.warn("⚠️ libraryRoutes not found:", err.message);
}

// Beat Store Routes (/api/studio/beats - for Beat Store pages)
try {
  const beatStoreRoutes = (await import("./routes/beatStoreRoutes.js")).default;
  app.use("/api/studio/beats", beatStoreRoutes);
  console.log("✅ /api/studio/beats mounted (Beat Store)");
} catch (err) {
  console.warn("⚠️ beatStoreRoutes not found:", err.message);
}

// AI Beat Generation Routes (/api/studio/ai - for beat generation)
try {
  const aiBeatRoutes = (await import("./routes/aiBeatRoutes.js")).default;
  app.use("/api/studio/ai", aiBeatRoutes);
  console.log("✅ /api/studio/ai mounted (AI Beat Engine)");
} catch (err) {
  console.warn("⚠️ aiBeatRoutes not found:", err.message);
}

// AI Master Routes (/api/studio/ai/master - for mastering)
try {
  const aiMasterRoutes = (await import("./routes/aiMasterRoutes.js")).default;
  app.use("/api/studio/ai/master", aiMasterRoutes);
  console.log("✅ /api/studio/ai/master mounted (AI Mastering)");
} catch (err) {
  console.warn("⚠️ aiMasterRoutes not found:", err.message);
}

// Beat Lab Routes (/api/beatlab - pattern-based beat generation)
try {
  const beatLabRoutes = (await import("./routes/beatLabRoutes.js")).default;
  app.use("/api/beatlab", beatLabRoutes);
  console.log("✅ /api/beatlab mounted");
} catch (err) {
  console.warn("⚠️ beatLabRoutes not found:", err.message);
}

// Export Routes (/api/export - for email exports)
// Reuses upload routes for file export functionality
try {
  const exportRoutes = (await import("./routes/uploadRoutes.js")).default;
  app.use("/api/export", exportRoutes);
  console.log("✅ /api/export mounted");
} catch (err) {
  console.warn("⚠️ exportRoutes not found:", err.message);
}

// Royalty Routes (frontend expects /api/royalty, not /api/royalties)
app.use("/api/royalty", royaltyRoutes);

// TV Export Routes
try {
  const tvExportRoutes = (await import("./routes/tvExportRoutes.js")).default;
  app.use("/api/studio/tv", tvExportRoutes);
  console.log("✅ /api/studio/tv mounted");
} catch (err) {
  console.warn("⚠️ tvExportRoutes not found:", err.message);
}

// Voice Routes
try {
  const voiceRoutes = (await import("./routes/voiceRoutes.js")).default;
  app.use("/api/studio/voice", voiceRoutes);
  console.log("✅ /api/studio/voice mounted");
} catch (err) {
  console.warn("⚠️ voiceRoutes not found:", err.message);
}

// Admin Producers Routes
try {
  const adminProducerRoutes = (await import("./routes/adminProducerRoutes.js")).default;
  app.use("/api/studio/admin/producers", adminProducerRoutes);
  console.log("✅ /api/studio/admin/producers mounted");
} catch (err) {
  console.warn("⚠️ adminProducerRoutes not found:", err.message);
}

// === END STUDIO WIRING ADDITIONS ===

// === LIVE ROOM & ENGINEER CONTRACT MODE (New Feature) ===

// Live Room Routes (real-time recording sessions)
try {
  const liveRoomRoutes = (await import("./routes/liveRoomRoutes.js")).default;
  app.use("/api/studio/live-room", liveRoomRoutes);
  console.log("✅ /api/studio/live-room mounted (Live Room)");
} catch (err) {
  console.warn("⚠️ liveRoomRoutes not found:", err.message);
}

// Studio Job Routes (paid tasks: mix, master, beat production)
try {
  const studioJobRoutes = (await import("./routes/studioJobRoutes.js")).default;
  app.use("/api/studio/jobs", studioJobRoutes);
  console.log("✅ /api/studio/jobs mounted (Studio Jobs)");
} catch (err) {
  console.warn("⚠️ studioJobRoutes not found:", err.message);
}

// Studio Contract Routes (legal agreements, signatures)
try {
  const studioContractRoutes = (await import("./routes/studioContractRoutes.js")).default;
  app.use("/api/studio/contracts", studioContractRoutes);
  console.log("✅ /api/studio/contracts mounted (Studio Contracts)");
} catch (err) {
  console.warn("⚠️ studioContractRoutes not found:", err.message);
}

// === END LIVE ROOM & ENGINEER CONTRACT MODE ===

app.use("/api/intake", intakeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/beats", beatRoutes);
app.use("/api/collabs", collabRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/mixing", mixingRoutes);
app.use("/api/royalties", royaltyRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/recordings", recordingsRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/auth", authRoutes);

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
