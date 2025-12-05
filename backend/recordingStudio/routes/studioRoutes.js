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

// Export project
// POST /api/studio/export
router.post("/export", async (req, res) => {
  try {
    const { projectId, mixId, sessionId, format, version, sendToPowerStream } = req.body;

    // Mock export response
    const exportId = `export_${Date.now()}`;
    const downloadUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/v${Date.now()}/export.${format || 'mp3'}`;

    res.json({
      ok: true,
      exportId,
      downloadUrl,
      format: format || "mp3",
      version: version || "master",
      sentToPowerStream: sendToPowerStream || false,
      message: "Export completed successfully",
    });
  } catch (error) {
    console.error("Error exporting:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
