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
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
import authRoutes from "../routes/authRoutes.js"; // shared auth

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
app.use("/api/collabs", collabRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/mixing", mixingRoutes);
app.use("/api/royalties", royaltyRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/upload", uploadRoutes);
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
