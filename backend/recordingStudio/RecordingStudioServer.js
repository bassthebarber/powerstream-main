// backend/recordingStudio/RecordingStudioServer.js
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import morgan from "morgan";
import { Server } from "socket.io";

// --- dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- ENV
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const STUDIO_MONGO_URI = process.env.STUDIO_MONGO_URI || process.env.MONGO_URI;
const PORT = Number(process.env.STUDIO_PORT) || 5100;

if (!STUDIO_MONGO_URI) {
  console.error("❌ STUDIO_MONGO_URI / MONGO_URI missing in .env.local");
}

// --- Mongo connection
mongoose.set("strictQuery", true);

async function connectMongo() {
  if (!STUDIO_MONGO_URI) {
    console.warn("⚠️ No Mongo URI configured, starting WITHOUT DB");
    return;
  }
  try {
    await mongoose.connect(STUDIO_MONGO_URI, { maxPoolSize: 10 });
    console.log("🧠 Recording Studio Mongo connected");
  } catch (err) {
    console.error("❌ Mongo connection failed:", err.message);
  }
}

// --- Routes
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
import recordingsRoutes from "./routes/recordingsRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// --- App
const app = express();

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // mobile / curl
      if (allowedOrigins.length && allowedOrigins.includes(origin))
        return cb(null, true);
      if (!allowedOrigins.length && origin.includes("localhost"))
        return cb(null, true);
      console.warn("❌ CORS blocked:", origin);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(morgan("dev"));

// Static directory for raw audio (optional)
const recordingsDir = path.join(__dirname, "output", "recordings");
app.use("/api/recordings/files", express.static(recordingsDir));

// --- Health
app.get("/studio-health", (_req, res) => {
  res.send("🎙️ Recording Studio Backend Live");
});

app.get(["/health", "/api/health"], (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "recording-studio",
    port: PORT,
    time: new Date().toISOString(),
  });
});

// --- Main Studio routes
app.use("/api/studio", studioRoutes);         // dashboard summary
app.use("/api/intake", intakeRoutes);         // artist intake forms
app.use("/api/payroll", payrollRoutes);       // payroll / pay runs
app.use("/api/employees", employeeRoutes);    // engineers, staff
app.use("/api/beats", beatRoutes);            // beat library
app.use("/api/collabs", collabRoutes);        // collab sessions
app.use("/api/samples", sampleRoutes);        // sample library
app.use("/api/mixing", mixingRoutes);         // mix jobs
app.use("/api/royalties", royaltyRoutes);     // royalty splits
app.use("/api/winners", winnerRoutes);        // contest winners
app.use("/api/upload", uploadRoutes);         // stub upload API
app.use("/api/recordings", recordingsRoutes); // recordings metadata
app.use("/api/devices", deviceRoutes);        // linked studio devices
app.use("/api/auth", authRoutes);             // studio auth (simple)

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found", path: req.path });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("💥 Studio error:", err);
  res
    .status(err.status || 500)
    .json({ ok: false, message: err.message || "Internal Server Error" });
});

// HTTP + Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const activeRooms = {};

io.on("connection", (socket) => {
  console.log("🎛️ Studio socket connected:", socket.id);

  socket.on("join_room", (roomId, userName) => {
    socket.join(roomId);
    if (!activeRooms[roomId]) activeRooms[roomId] = [];
    activeRooms[roomId].push({ id: socket.id, name: userName || "Guest" });
    io.to(roomId).emit("room_update", activeRooms[roomId]);
  });

  socket.on("chat_message", (roomId, payload) => {
    io.to(roomId).emit("chat_message", {
      ...payload,
      at: new Date().toISOString(),
    });
  });

  socket.on("meter_update", (roomId, level) => {
    io.to(roomId).emit("meter_update", { user: socket.id, level });
  });

  socket.on("disconnect", () => {
    for (const roomId in activeRooms) {
      activeRooms[roomId] = activeRooms[roomId].filter(
        (u) => u.id !== socket.id
      );
      io.to(roomId).emit("room_update", activeRooms[roomId]);
    }
    console.log("🔌 Studio socket disconnected:", socket.id);
  });
});

// Boot
(async () => {
  await connectMongo();
  server.listen(PORT, () => {
    console.log(`🎚️ Recording Studio running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}/studio-health`);
  });
})();
