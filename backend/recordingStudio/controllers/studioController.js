// backend/recordingStudio/studioController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateBeat } from "./ai/studio/beatEngine.js";
import { mixAudio } from "./ai/studio/mixEngine.js";
import { renderFinalTrack } from "./ai/studio/renderEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save uploaded vocal files
export const uploadVocal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "uploads", req.file.filename);

    return res.json({
      success: true,
      message: "Vocal uploaded",
      file: req.file.filename,
      path: filePath
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

// Generate beat
export const createBeat = async (req, res) => {
  try {
    const { bpm, style, mood } = req.body;

    const beat = await generateBeat({ bpm, style, mood });

    return res.json({
      success: true,
      beat
    });
  } catch (err) {
    console.error("Beat engine error:", err);
    return res.status(500).json({ error: "Beat engine failed" });
  }
};

// Mix beat + vocals
export const mixTrack = async (req, res) => {
  try {
    const { vocalFile, beatFile } = req.body;

    const mixed = await mixAudio(vocalFile, beatFile);

    return res.json({
      success: true,
      mixFile: mixed
    });
  } catch (err) {
    console.error("Mix error:", err);
    return res.status(500).json({ error: "Mix engine failed" });
  }
};

// Render mastered track
export const renderTrack = async (req, res) => {
  try {
    const { mixFile } = req.body;

    const final = await renderFinalTrack(mixFile);

    return res.json({
      success: true,
      master: final
    });
  } catch (err) {
    console.error("Render error:", err);
    return res.status(500).json({ error: "Rendering failed" });
  }
};
