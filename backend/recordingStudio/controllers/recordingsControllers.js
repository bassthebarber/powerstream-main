// backend/recordingStudio/controllers/recordingsController.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder where recordings are stored
const RECORDINGS_DIR = path.join(__dirname, "../../recordings");

// Create folder if missing
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Metadata JSON file
const META_FILE = path.join(RECORDINGS_DIR, "recordings.json");

// Load saved recordings
function loadRecordings() {
  if (!fs.existsSync(META_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(META_FILE, "utf-8"));
  } catch {
    return [];
  }
}

// Save metadata
function saveRecordings(data) {
  fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2));
}

// =============================================================
// Upload NEW Recording (metadata only; file upload optional)
// =============================================================
export const saveRecording = async (req, res) => {
  try {
    const { title, artist, duration, fileUrl } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recordings = loadRecordings();

    const newRec = {
      id: Date.now(),
      title,
      artist,
      duration: duration || null,
      fileUrl: fileUrl || null,
      createdAt: new Date().toISOString(),
    };

    recordings.push(newRec);
    saveRecordings(recordings);

    res.json({
      message: "Recording saved successfully",
      recording: newRec,
    });
  } catch (error) {
    console.error("saveRecording error:", error);
    res.status(500).json({ error: "Failed to save recording" });
  }
};

// =============================================================
// List ALL Recordings
// =============================================================
export const getAllRecordings = async (req, res) => {
  try {
    const recordings = loadRecordings();
    res.json({ recordings });
  } catch (error) {
    console.error("getAllRecordings error:", error);
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
};

// =============================================================
// Delete Recording (metadata only)
// =============================================================
export const deleteRecording = async (req, res) => {
  try {
    const { id } = req.params;

    let recordings = loadRecordings();
    const before = recordings.length;

    recordings = recordings.filter((rec) => rec.id.toString() !== id);

    if (recordings.length === before) {
      return res.status(404).json({ error: "Recording not found" });
    }

    saveRecordings(recordings);

    res.json({ message: "Recording deleted" });
  } catch (error) {
    console.error("deleteRecording error:", error);
    res.status(500).json({ error: "Failed to delete recording" });
  }
};
