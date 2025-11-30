// backend/ai/studio/StudioRouter.js
import express from "express";
import fs from "fs";
import path from "path";
import { handleMix, handleMaster } from "./StudioEngine.js";

const router = express.Router();
const uploadDir = path.resolve("backend/ai/studio/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Upload endpoint
router.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.track)
      return res.status(400).json({ error: "No track uploaded" });

    const track = req.files.track;
    const filename = Date.now() + "_" + track.name;
    const savePath = path.join(uploadDir, filename);
    await track.mv(savePath);

    res.json({ success: true, filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Mix route
router.post("/mix", async (req, res) => {
  const { track } = req.body;
  if (!track) return res.status(400).json({ error: "No track provided" });
  handleMix(track);
  res.json({ success: true });
});

// Master route
router.post("/master", async (req, res) => {
  const { track } = req.body;
  if (!track) return res.status(400).json({ error: "No track provided" });
  handleMaster(track);
  res.json({ success: true });
});

export default router;
