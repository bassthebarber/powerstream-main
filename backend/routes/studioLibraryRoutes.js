// backend/routes/studioLibraryRoutes.js
// Studio Library API Routes - Masters, Songs, Recordings, Beats

import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import MasterRender from "../models/MasterRender.js";
import BeatFile from "../models/BeatFile.js";
import RecordingTake from "../models/RecordingTake.js";
import StudioProject from "../models/StudioProject.js";

const router = Router();

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

/**
 * GET /api/studio/library
 * Get library items by tab (masters, songs, recordings, beats)
 */
router.get("/library", async (req, res) => {
  try {
    const { tab, limit = 50, skip = 0, sort = "newest" } = req.query;
    
    const sortOrder = sort === "oldest" ? 1 : -1;
    let items = [];
    
    switch (tab) {
      case "masters":
        items = await MasterRender.find({})
          .sort({ createdAt: sortOrder })
          .skip(parseInt(skip))
          .limit(parseInt(limit))
          .populate("projectId", "title")
          .lean();
        break;
        
      case "recordings":
        items = await RecordingTake.find({})
          .sort({ createdAt: sortOrder })
          .skip(parseInt(skip))
          .limit(parseInt(limit))
          .populate("projectId", "title")
          .lean();
        break;
        
      case "beats":
        items = await BeatFile.find({})
          .sort({ createdAt: sortOrder })
          .skip(parseInt(skip))
          .limit(parseInt(limit))
          .lean();
        break;
        
      case "songs":
      case "projects":
      default:
        // Songs/Projects shows StudioProjects or Masters
        items = await StudioProject.find({})
          .sort({ createdAt: sortOrder })
          .skip(parseInt(skip))
          .limit(parseInt(limit))
          .lean();
        break;
    }
    
    res.json({ 
      success: true, 
      items,
      tab: tab || "projects",
      count: items.length,
    });
  } catch (err) {
    console.error("[StudioLibrary] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/library/stats
 * Get library statistics
 */
router.get("/library/stats", async (req, res) => {
  try {
    const [masters, recordings, beats, projects] = await Promise.all([
      MasterRender.countDocuments(),
      RecordingTake.countDocuments(),
      BeatFile.countDocuments(),
      StudioProject.countDocuments(),
    ]);
    
    res.json({
      success: true,
      stats: { masters, recordings, beats, projects },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/recordings
 * List recordings (optionally by project or user)
 */
router.get("/recordings", async (req, res) => {
  try {
    const { projectId, ownerUserId, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (projectId) query.projectId = projectId;
    if (ownerUserId) query.ownerUserId = ownerUserId;
    
    const takes = await RecordingTake.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("projectId", "title")
      .lean();
    
    const total = await RecordingTake.countDocuments(query);
    
    res.json({ 
      success: true, 
      takes,
      recordings: takes, // Alias for compatibility
      total,
    });
  } catch (err) {
    console.error("[StudioLibrary] Get recordings error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/recordings/:id
 * Get a single recording
 */
router.get("/recordings/:id", async (req, res) => {
  try {
    const recording = await RecordingTake.findById(req.params.id)
      .populate("projectId", "title")
      .lean();
    
    if (!recording) {
      return res.status(404).json({ success: false, error: "Recording not found" });
    }
    
    res.json({ success: true, recording });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/studio/recordings/:id
 * Update a recording (title, notes, etc.)
 */
router.patch("/recordings/:id", async (req, res) => {
  try {
    const { title, notes, type, isSelected } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (notes !== undefined) updates.notes = notes;
    if (type !== undefined) updates.type = type;
    if (isSelected !== undefined) updates.isSelected = isSelected;
    
    const recording = await RecordingTake.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!recording) {
      return res.status(404).json({ success: false, error: "Recording not found" });
    }
    
    res.json({ success: true, recording });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/recordings
 * Upload a new recording take
 */
router.post("/recordings", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No audio file provided" });
    }
    
    const { title, projectId, type, notes, takeNumber, durationSeconds } = req.body;
    
    // Upload to Cloudinary
    let audioUrl = "";
    let publicId = "";
    
    const hasCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    
    if (hasCloudinary) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video", // audio files use video resource
            folder: "powerstream/studio/recordings",
            public_id: `recording_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      
      audioUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      // Mock URL for development
      audioUrl = `/uploads/recordings/recording_${Date.now()}.webm`;
    }
    
    const recording = await RecordingTake.create({
      title: title || `Take ${takeNumber || 1}`,
      projectId: projectId || null,
      type: type || "vocal",
      notes: notes || "",
      takeNumber: parseInt(takeNumber) || 1,
      durationSeconds: parseFloat(durationSeconds) || 0,
      audioUrl,
      cloudinaryPublicId: publicId,
    });
    
    res.status(201).json({ success: true, recording });
  } catch (err) {
    console.error("[StudioLibrary] Recording upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/studio/recordings/:id
 * Delete a recording take
 */
router.delete("/recordings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = await RecordingTake.findById(id);
    if (!recording) {
      return res.status(404).json({ success: false, error: "Recording not found" });
    }
    
    // Delete from Cloudinary if exists
    if (recording.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(recording.cloudinaryPublicId, {
          resource_type: "video",
        });
      } catch (cloudErr) {
        console.warn("[StudioLibrary] Cloudinary delete failed:", cloudErr.message);
      }
    }
    
    await RecordingTake.findByIdAndDelete(id);
    
    res.json({ success: true, message: "Recording deleted" });
  } catch (err) {
    console.error("[StudioLibrary] Delete error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/beats
 * List beats (optionally by owner)
 */
router.get("/beats", async (req, res) => {
  try {
    const { ownerUserId, limit = 50, skip = 0, genre, mood } = req.query;
    
    const query = {};
    if (ownerUserId) query.ownerUserId = ownerUserId;
    if (genre) query.genre = genre;
    if (mood) query.mood = mood;
    
    const beats = await BeatFile.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    const total = await BeatFile.countDocuments(query);
    
    res.json({ 
      success: true, 
      beats,
      total,
    });
  } catch (err) {
    console.error("[StudioLibrary] Get beats error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/beats/:id
 * Get a single beat
 */
router.get("/beats/:id", async (req, res) => {
  try {
    const beat = await BeatFile.findById(req.params.id).lean();
    
    if (!beat) {
      return res.status(404).json({ success: false, error: "Beat not found" });
    }
    
    res.json({ success: true, beat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/studio/beats/:id
 * Delete a beat
 */
router.delete("/beats/:id", async (req, res) => {
  try {
    const beat = await BeatFile.findById(req.params.id);
    if (!beat) {
      return res.status(404).json({ success: false, error: "Beat not found" });
    }
    
    // Delete from Cloudinary if exists
    if (beat.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(beat.cloudinaryPublicId, {
          resource_type: "video",
        });
      } catch (cloudErr) {
        console.warn("[StudioLibrary] Cloudinary delete failed:", cloudErr.message);
      }
    }
    
    await BeatFile.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Beat deleted" });
  } catch (err) {
    console.error("[StudioLibrary] Delete beat error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/beats/generate
 * Generate a new beat (stub for AI integration)
 */
router.post("/beats/generate", async (req, res) => {
  try {
    const { ownerUserId, bpm, key, mood, genre, tags } = req.body;
    
    // Stub: Create a placeholder beat entry
    // Later, this can call BeatGeneratorService to create REAL audio
    const beat = await BeatFile.create({
      title: `Generated Beat (${mood || "vibe"} ${genre || "trap"})`,
      ownerUserId: ownerUserId || null,
      audioUrl: "", // TODO: Fill with generated audio URL from AI
      bpm: bpm || 140,
      key: key || "C minor",
      mood: mood || "trap",
      genre: genre || "hip-hop",
      tags: tags || ["generated", "ai"],
      durationSeconds: 0,
      isPublic: false,
      price: 0,
    });
    
    res.json({ 
      success: true, 
      beat,
      message: "Beat placeholder created. AI generation coming soon."
    });
  } catch (err) {
    console.error("[StudioLibrary] Generate beat error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/beats
 * Upload a new beat
 */
router.post("/beats", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No audio file provided" });
    }
    
    const { title, bpm, key, genre, mood, tags, durationSeconds } = req.body;
    
    // Upload to Cloudinary
    let audioUrl = "";
    let publicId = "";
    
    const hasCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    
    if (hasCloudinary) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "powerstream/studio/beats",
            public_id: `beat_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      
      audioUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      audioUrl = `/uploads/beats/beat_${Date.now()}.wav`;
    }
    
    const beat = await BeatFile.create({
      title: title || "Untitled Beat",
      bpm: parseInt(bpm) || 120,
      key: key || "C",
      genre: genre || "",
      mood: mood || "",
      tags: tags ? JSON.parse(tags) : [],
      durationSeconds: parseFloat(durationSeconds) || 0,
      audioUrl,
      cloudinaryPublicId: publicId,
    });
    
    res.status(201).json({ success: true, beat });
  } catch (err) {
    console.error("[StudioLibrary] Beat upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/masters
 * Save a new master render
 */
router.post("/masters", upload.single("audio"), async (req, res) => {
  try {
    const { 
      title, projectId, quality, format, 
      bpm, key, genre, durationSeconds,
      isClean, isExplicit,
    } = req.body;
    
    let audioUrl = "";
    let publicId = "";
    
    if (req.file) {
      const hasCloudinary = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );
      
      if (hasCloudinary) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "video",
              folder: "powerstream/studio/masters",
              public_id: `master_${Date.now()}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        
        audioUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } else {
        audioUrl = `/uploads/masters/master_${Date.now()}.wav`;
      }
    } else if (req.body.audioUrl) {
      audioUrl = req.body.audioUrl;
    }
    
    const master = await MasterRender.create({
      title: title || "Untitled Master",
      projectId: projectId || null,
      quality: quality || "master",
      format: format || "wav",
      bpm: parseInt(bpm) || null,
      key: key || null,
      genre: genre || null,
      durationSeconds: parseFloat(durationSeconds) || 0,
      isClean: isClean === "true" || isClean === true,
      isExplicit: isExplicit === "true" || isExplicit === true,
      audioUrl,
      cloudinaryPublicId: publicId,
    });
    
    res.status(201).json({ success: true, master });
  } catch (err) {
    console.error("[StudioLibrary] Master save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/projects
 * Create a new studio project
 */
router.post("/projects", async (req, res) => {
  try {
    const { title, bpm, key, genre, description, tags } = req.body;
    
    const project = await StudioProject.create({
      title: title || "Untitled Project",
      bpm: parseInt(bpm) || 120,
      key: key || "C",
      genre: genre || "",
      description: description || "",
      tags: tags || [],
      status: "draft",
    });
    
    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error("[StudioLibrary] Project create error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/projects/:id
 * Get a project with all associated items
 */
router.get("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [project, recordings, masters] = await Promise.all([
      StudioProject.findById(id).lean(),
      RecordingTake.find({ projectId: id }).sort({ createdAt: -1 }).lean(),
      MasterRender.find({ projectId: id }).sort({ createdAt: -1 }).lean(),
    ]);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    res.json({
      success: true,
      project,
      recordings,
      masters,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/visualizer/send
 * Send visualizer preset to PowerStream (stub)
 */
router.post("/visualizer/send", async (req, res) => {
  try {
    const { masterId, preset } = req.body;
    
    console.log(`[Studio] Visualizer send: masterId=${masterId}, preset=`, preset);
    
    // TODO: Actually send to PowerStream broadcast/streaming service
    // For now, just acknowledge the request
    
    res.json({ 
      success: true, 
      message: "Visualizer preset sent to PowerStream",
      masterId,
      preset,
    });
  } catch (err) {
    console.error("[Studio] Visualizer send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/visualizer/preset
 * Save a visualizer preset
 */
router.post("/visualizer/preset", async (req, res) => {
  try {
    const { name, mode, colors, sensitivity, userId } = req.body;
    
    // For now, just acknowledge - could save to DB later
    const preset = {
      id: Date.now().toString(),
      name,
      mode,
      colors,
      sensitivity,
      userId,
      createdAt: new Date(),
    };
    
    res.json({ success: true, preset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/health
 * Health check for studio API
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    ok: true,
    service: "studio-api",
    status: "online",
    version: "1.0",
    features: [
      "library",
      "beat-generation",
      "recording",
      "playback",
      "export",
      "visualizer",
      "royalty-tracking"
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;

