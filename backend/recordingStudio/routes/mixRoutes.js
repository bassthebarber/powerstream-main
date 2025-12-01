// backend/recordingStudio/routes/mixRoutes.js
// Mix & Master API routes - Real FFmpeg processing

import express from "express";
import multer from "multer";
import { processMix, getMixStatus, listMixdowns, downloadMix } from "../controllers/mixController.js";

const router = express.Router();

// Multer config for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (_req, file, cb) => {
    const ok = /^audio\//.test(file.mimetype);
    if (!ok) return cb(new Error("Only audio files are allowed"));
    cb(null, true);
  },
});

// Health check
router.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "Mix API", 
    engine: "FFmpeg",
    timestamp: new Date().toISOString() 
  });
});

// Process mix - accepts file upload with processing chain settings
// POST /api/mix/process
router.post("/process", upload.single("file"), processMix);

// Get mix status (for async processing)
// GET /api/mix/status/:id
router.get("/status/:id", getMixStatus);

// List all mixdowns (for library)
// GET /api/mix/list
router.get("/list", listMixdowns);

// Alias for library compatibility
// GET /api/mixes
router.get("/", listMixdowns);

// Download processed mix file
// GET /api/mix/download/:filename
router.get("/download/:filename", downloadMix);

export default router;
