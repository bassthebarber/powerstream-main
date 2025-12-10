import express from "express";
import multer from "multer";
import { saveTake } from "../controllers/recordingsController.js";
import Recording from "../models/Recording.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 }});

// Health check
router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "Recordings API" });
});

// List all recordings
router.get("/", async (req, res) => {
  try {
    const { limit = 50, skip = 0, source } = req.query;
    
    const query = {};
    if (source) query.source = source;

    const recordings = await Recording.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Recording.countDocuments(query);

    res.json({
      ok: true,
      items: recordings.map(r => ({
        _id: r._id,
        title: r.title,
        artistName: r.artistName,
        type: 'recording',
        source: r.source,
        url: r.audioUrl,
        duration: r.durationSeconds,
        createdAt: r.createdAt,
      })),
      total,
    });
  } catch (err) {
    console.error("Recordings list error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Get single recording
router.get("/:id", async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({ ok: false, message: "Recording not found" });
    }
    res.json({ ok: true, recording });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Save new recording/take
router.post("/", upload.single("audio"), saveTake);

export default router;
