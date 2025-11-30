// backend/server.js  (STUDIO API + frontend)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";

import { addAIJob } from "./controllers/aiController.js";
import { getRedis } from "./utils/redis.js";
import { initStudioSocket } from "./sockets/studioSocket.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// health
app.get("/", (_req, res) => res.send("Studio API ✅"));

// API routes
app.post("/api/ai/task", addAIJob);

// Serve frontend static files (Vite build)
const frontendDist = path.join(process.cwd(), "../studio-app/dist");
app.use(express.static(frontendDist));

// SPA fallback: for all unknown routes, serve index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// create HTTP + Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });
initStudioSocket(io);

// boot
const PORT = process.env.STUDIO_PORT || 5100;
server.listen(PORT, async () => {
  console.log(`Studio API + Frontend listening on :${PORT}`);
  try { await getRedis(); } catch (e) { console.error("Redis connect failed:", e); }
});

// hardening
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
