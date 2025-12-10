// backend/controllers/PlaybackController.js
// Studio Playback Controller - Play, Stop, Delete recordings

import fs from "fs";
import path from "path";
import Recording from "../models/Recording.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/studio/play/:id
// Stream audio file for playback
export const playRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await Recording.findById(id);
    
    if (!rec) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Try multiple possible paths for the recording file
    const possiblePaths = [
      path.join(__dirname, "../uploads/recordings/", rec.filename),
      path.join(__dirname, "../recordingStudio/uploads/", rec.filename),
      path.join(__dirname, "../../uploads/recordings/", rec.filename),
      rec.fileUrl?.startsWith("/") ? path.join(__dirname, "..", rec.fileUrl) : null,
    ].filter(Boolean);

    let filePath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      console.error(`[PlaybackController] File not found for recording ${id}:`, rec.filename);
      return res.status(404).json({ 
        message: "File missing on server",
        filename: rec.filename,
        triedPaths: possiblePaths,
      });
    }

    // Get file stats for content-length header
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();
    
    // Determine content type
    const contentTypes = {
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".webm": "audio/webm",
      ".ogg": "audio/ogg",
      ".m4a": "audio/mp4",
      ".flac": "audio/flac",
    };
    const contentType = contentTypes[ext] || "audio/mpeg";

    // Handle range requests for seeking
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(filePath).pipe(res);
    }

    // Update play count
    await Recording.findByIdAndUpdate(id, { $inc: { playCount: 1 } });
    
  } catch (err) {
    console.error("[PlaybackController] Error playing recording:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/studio/delete/:id
// Delete recording from DB and filesystem
export const deleteRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await Recording.findById(id);
    
    if (!rec) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Try multiple possible paths for the recording file
    const possiblePaths = [
      path.join(__dirname, "../uploads/recordings/", rec.filename),
      path.join(__dirname, "../recordingStudio/uploads/", rec.filename),
      path.join(__dirname, "../../uploads/recordings/", rec.filename),
      rec.fileUrl?.startsWith("/") ? path.join(__dirname, "..", rec.fileUrl) : null,
    ].filter(Boolean);

    // Delete file from all possible locations
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
          console.log(`[PlaybackController] Deleted file: ${p}`);
        } catch (unlinkErr) {
          console.warn(`[PlaybackController] Could not delete file: ${p}`, unlinkErr.message);
        }
      }
    }

    // Delete from database
    await Recording.findByIdAndDelete(id);
    
    console.log(`[PlaybackController] Recording deleted: ${id} (${rec.title || rec.filename})`);
    
    res.json({ 
      success: true,
      message: "Recording deleted successfully",
      deletedId: id,
    });
  } catch (err) {
    console.error("[PlaybackController] Error deleting recording:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/studio/recordings
// List all recordings
export const listRecordings = async (req, res) => {
  try {
    const { sessionId, userId, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (sessionId) query.sessionId = sessionId;
    if (userId) query.userId = userId;
    
    const recordings = await Recording.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    const total = await Recording.countDocuments(query);
    
    res.json({
      success: true,
      recordings,
      total,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + recordings.length < total,
      },
    });
  } catch (err) {
    console.error("[PlaybackController] Error listing recordings:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/studio/recording/:id
// Get single recording details
export const getRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await Recording.findById(id).lean();
    
    if (!rec) {
      return res.status(404).json({ message: "Recording not found" });
    }
    
    res.json({ success: true, recording: rec });
  } catch (err) {
    console.error("[PlaybackController] Error getting recording:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/studio/recording/:id
// Update recording metadata
export const updateRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    
    const rec = await Recording.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    
    if (!rec) {
      return res.status(404).json({ message: "Recording not found" });
    }
    
    res.json({ success: true, recording: rec });
  } catch (err) {
    console.error("[PlaybackController] Error updating recording:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  playRecording,
  deleteRecording,
  listRecordings,
  getRecording,
  updateRecording,
};

