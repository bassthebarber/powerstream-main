// backend/tools/restoreRoutes.cjs

// SOUTHERN POWER SYNDICATE – ROUTE AUTO-REPAIR

// Run with:  node tools/restoreRoutes.cjs

const fs = require("fs");
const path = require("path");

const rootDir = __dirname.endsWith("tools")
  ? path.join(__dirname, "..")
  : __dirname;

const serverPath = path.join(rootDir, "server.js");
const routesDir = path.join(rootDir, "routes");

console.log("🛠  SPS Route Repair starting...");
console.log("📁 Backend root:", rootDir);

// ---------- helpers ----------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
    console.log("✅ Created file:", path.relative(rootDir, filePath));
  } else {
    console.log("✅ Exists:", path.relative(rootDir, filePath));
  }
}

// ---------- 1. Ensure routes directory ----------
ensureDir(routesDir);

// ---------- 2. Ensure TV routes file ----------
const tvRoutesPath = path.join(routesDir, "tvRoutes.js");
const tvRoutesContent = `
import express from "express";

const router = express.Router();

// Static list of flagship stations for now.
// You can later replace this with a Mongo StationModel.
const STATIONS = [
  {
    slug: "southern-power",
    name: "Southern Power Network",
    logo: "/logos/southernpower-logo.png",
    description: "Flagship Southern Power TV Network",
    isLive: false,
    streamUrl: "",
  },
  {
    slug: "NoLimitEastHouston",
    name: "No Limit East Houston TV",
    logo: "/logos/nolimit-easthouston-logo.png",
    description: "Exclusive No Limit East Houston content",
    isLive: false,
    streamUrl: "",
  },
  {
    slug: "civic-connect",
    name: "Civic Connect TV",
    logo: "/logos/civicconnect-logo.png",
    description: "Community, city news, and civic shows",
    isLive: false,
    streamUrl: "",
  },
  {
    slug: "texas-got-talent",
    name: "Texas Got Talent TV",
    logo: "/logos/texasgottalent-logo.png",
    description: "Live talent showcases from around Texas",
    isLive: false,
    streamUrl: "",
  },
];

// GET /api/tv-stations           → all stations
// GET /api/tv/stations           → all stations
// GET /api/tv/stations/:slug     → single station

router.get("/", (req, res) => {
  res.json({ ok: true, stations: STATIONS });
});

router.get("/stations", (req, res) => {
  res.json({ ok: true, stations: STATIONS });
});

router.get("/stations/:slug", (req, res) => {
  const { slug } = req.params;
  const station = STATIONS.find((s) => s.slug === slug);
  if (!station) {
    return res.status(404).json({ ok: false, message: "Station not found" });
  }
  res.json({ ok: true, station });
});

export default router;
`;

ensureFile(tvRoutesPath, tvRoutesContent);

// ---------- 3. Ensure PowerLine routes ----------
const powerlineRoutesPath = path.join(routesDir, "powerlineRoutes.js");
const powerlineRoutesContent = `
import express from "express";
import { v4 as uuid } from "uuid";

const router = express.Router();

// In-memory store for now. Later you can swap to Mongo.
const THREADS = [];
const MESSAGES = {};

// List threads for the current user (no auth yet, just all)
router.get("/threads", (req, res) => {
  res.json({ ok: true, threads: THREADS });
});

// Create a new thread
router.post("/threads", (req, res) => {
  const { title, participants } = req.body || {};
  const thread = {
    id: uuid(),
    title: title || "New Conversation",
    participants: participants || [],
    createdAt: new Date().toISOString(),
    lastMessageAt: null,
  };

  THREADS.push(thread);
  MESSAGES[thread.id] = [];
  res.status(201).json({ ok: true, thread });
});

// Get messages for a thread
router.get("/threads/:threadId/messages", (req, res) => {
  const { threadId } = req.params;
  const items = MESSAGES[threadId] || [];
  res.json({ ok: true, messages: items });
});

// Send a message
router.post("/threads/:threadId/messages", (req, res) => {
  const { threadId } = req.params;
  const { senderId, text } = req.body || {};

  if (!MESSAGES[threadId]) {
    MESSAGES[threadId] = [];
  }

  const msg = {
    id: uuid(),
    threadId,
    senderId: senderId || "anonymous",
    text: text || "",
    createdAt: new Date().toISOString(),
  };

  MESSAGES[threadId].push(msg);

  const thread = THREADS.find((t) => t.id === threadId);
  if (thread) {
    thread.lastMessageAt = msg.createdAt;
  }

  res.status(201).json({ ok: true, message: msg });
});

export default router;
`;

ensureFile(powerlineRoutesPath, powerlineRoutesContent);

// ---------- 4. Ensure upload routes ----------
const uploadRoutesPath = path.join(routesDir, "uploadRoutes.js");
const uploadRoutesContent = `
import express from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinaryModule from "cloudinary";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Cloudinary config (if env present)
const cloudinary = cloudinaryModule.v2;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// --- Multer config (temp local storage)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, uuid() + ext);
  },
});
const upload = multer({ storage });

// POST /api/upload
// Used by PowerGram / PowerReels to upload media
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No file uploaded" });
    }

    const localPath = req.file.path;

    // If Cloudinary configured, upload there
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const folder =
        process.env.CLOUDINARY_FOLDER || "powerstream/uploads";

      const result = await cloudinary.uploader.upload(localPath, {
        folder,
        resource_type: "auto",
      });

      // Clean up local file
      fs.unlink(localPath, () => {});

      return res.status(201).json({
        ok: true,
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // Fallback: serve from local uploads (dev only)
    const fileUrl = "/uploads/" + path.basename(localPath);
    return res.status(201).json({ ok: true, url: fileUrl });
  } catch (err) {
    console.error("💥 Upload error:", err);
    return res.status(500).json({
      ok: false,
      message: err.message || "Upload failed",
    });
  }
});

export default router;
`;

ensureFile(uploadRoutesPath, uploadRoutesContent);

// ---------- 5. Patch server.js ----------
if (!fs.existsSync(serverPath)) {
  console.error("❌ server.js not found at", serverPath);
  process.exit(1);
}

let serverCode = fs.readFileSync(serverPath, "utf8");

// Ensure imports
const importLines = [];

if (!serverCode.includes('import tvRoutes from "./routes/tvRoutes.js"')) {
  importLines.push('import tvRoutes from "./routes/tvRoutes.js";');
}
if (!serverCode.includes('import powerlineRoutes from "./routes/powerlineRoutes.js"')) {
  importLines.push('import powerlineRoutes from "./routes/powerlineRoutes.js";');
}
if (!serverCode.includes('import uploadRoutes from "./routes/uploadRoutes.js"')) {
  importLines.push('import uploadRoutes from "./routes/uploadRoutes.js";');
}

if (importLines.length > 0) {
  console.log("🧩 Injecting imports into server.js");
  serverCode = importLines.join("\n") + "\n" + serverCode;
}

// Ensure app.use mounts
let mountsBlock = "";
if (!serverCode.includes('app.use("/api/tv"')) {
  mountsBlock += 'app.use("/api/tv", tvRoutes);\n';
}
if (!serverCode.includes('app.use("/api/tv-stations"')) {
  mountsBlock += 'app.use("/api/tv-stations", tvRoutes);\n';
}
if (!serverCode.includes('app.use("/api/powerline"')) {
  mountsBlock += 'app.use("/api/powerline", powerlineRoutes);\n';
}
if (!serverCode.includes('app.use("/api/upload"')) {
  mountsBlock += 'app.use("/api/upload", uploadRoutes);\n';
}

if (mountsBlock) {
  const marker = "app.use((req, res) =>";
  const idx = serverCode.indexOf(marker);
  const insertPos = idx === -1 ? serverCode.length : idx;

  const patched =
    serverCode.slice(0, insertPos) +
    "\n// --- Auto-mounted by restoreRoutes.cjs ---\n" +
    mountsBlock +
    "\n" +
    serverCode.slice(insertPos);

  serverCode = patched;
  console.log("🧩 Injected app.use() mounts into server.js");
}

fs.writeFileSync(serverPath, serverCode, "utf8");
console.log("✅ server.js patched");

console.log("\n🎉 Route repair complete.");
console.log("   - /api/tv-stations           (list stations)");
console.log("   - /api/tv/stations           (list stations)");
console.log("   - /api/tv/stations/:slug     (single station)");
console.log("   - /api/powerline/threads     (list/create threads)");
console.log("   - /api/upload                (media upload for PowerGram/Reels)\n");

