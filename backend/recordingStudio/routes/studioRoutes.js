// backend/recordingStudio/routes/studioRoutes.js
// Main studio routes - upload, beat generation, mixing, rendering

import express from "express";
import { upload } from "../utils/uploader.js";
import * as studioController from "../studioController.js";

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ ok: true, service: "Recording Studio API", timestamp: new Date().toISOString() });
});

// Studio status
router.get("/status", studioController.getStudioStatus);

// File upload
router.post("/upload", upload.single("file"), studioController.handleUpload);

// Vocal upload (alias)
router.post("/vocal", upload.single("file"), studioController.uploadVocal);

// Beat generation
router.post("/beat", studioController.createBeat);

// Mix track
router.post("/mix", studioController.mixTrack);

// Render/Master track
router.post("/render", studioController.renderTrack);

export default router;
