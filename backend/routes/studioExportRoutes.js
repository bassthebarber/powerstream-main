// backend/routes/studioExportRoutes.js
// Studio Export API - Real export implementation
// Creates export records and returns Cloudinary URLs
import { Router } from "express";
import mongoose from "mongoose";
import MasterRender from "../models/MasterRender.js";
import RoyaltyWork from "../models/RoyaltyWork.js";

const router = Router();

// ==========================================
// EXPORT MODEL (inline for simplicity)
// ==========================================
const ExportSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioProject" },
  recordingId: { type: mongoose.Schema.Types.ObjectId, ref: "Recording" },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "StudioSession" },
  mixId: { type: mongoose.Schema.Types.ObjectId, ref: "Mixdown" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projectName: { type: String, default: "Untitled Export" },
  format: { type: String, enum: ["mp3", "wav", "flac", "stems"], default: "mp3" },
  version: { type: String, enum: ["master", "clean", "explicit", "tv", "performance"], default: "master" },
  audioUrl: { type: String, required: true },
  downloadUrl: { type: String },
  fileSize: { type: Number },
  durationSeconds: { type: Number },
  status: { type: String, enum: ["pending", "processing", "ready", "failed"], default: "ready" },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const Export = mongoose.models.Export || mongoose.model("Export", ExportSchema);

// ==========================================
// MAIN EXPORT ENDPOINT
// POST /api/studio/export
// ==========================================
/**
 * Create an export - Real implementation
 * Takes an existing audio URL and creates an export record
 * 
 * For now, this is a "pass-through" export that:
 * 1. Creates an Export document
 * 2. Returns the same audioUrl as the downloadUrl
 * 
 * Future: Add FFmpeg processing for format conversion, bouncing, etc.
 */
router.post("/export", async (req, res) => {
  try {
    const {
      projectId,
      recordingId,
      audioUrl,
      mixId,
      sessionId,
      format = "mp3",
      version = "master",
      projectName,
      userId,
    } = req.body;

    // Need at least an audioUrl or reference to find one
    if (!audioUrl && !recordingId && !mixId && !sessionId) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: "Missing audio source. Provide audioUrl, recordingId, mixId, or sessionId.",
      });
    }

    // If audioUrl is provided directly, use it
    let finalAudioUrl = audioUrl;
    let sourceDoc = null;
    
    // Try to resolve audioUrl from references if not provided directly
    if (!finalAudioUrl) {
      // Try Recording
      if (recordingId) {
        try {
          const Recording = mongoose.model("Recording");
          sourceDoc = await Recording.findById(recordingId).lean();
          if (sourceDoc?.audioUrl) finalAudioUrl = sourceDoc.audioUrl;
        } catch (e) {
          console.warn("[Export] Could not find Recording model:", e.message);
        }
      }
      
      // Try Mixdown
      if (!finalAudioUrl && mixId) {
        try {
          const Mixdown = mongoose.model("Mixdown");
          sourceDoc = await Mixdown.findById(mixId).lean();
          if (sourceDoc?.audioUrl) finalAudioUrl = sourceDoc.audioUrl;
        } catch (e) {
          console.warn("[Export] Could not find Mixdown model:", e.message);
        }
      }
      
      // Try StudioSession (get first take)
      if (!finalAudioUrl && sessionId) {
        try {
          const StudioSession = mongoose.model("StudioSession");
          sourceDoc = await StudioSession.findById(sessionId).lean();
          const takes = sourceDoc?.data?.get?.("takes") || sourceDoc?.data?.takes || [];
          if (takes.length > 0) {
            finalAudioUrl = takes[takes.length - 1].audioUrl;
          }
        } catch (e) {
          console.warn("[Export] Could not find StudioSession model:", e.message);
        }
      }
    }

    // Still no audio URL? Error out
    if (!finalAudioUrl) {
      return res.status(400).json({
        ok: false,
        success: false,
        error: "Could not resolve audio URL from provided references.",
      });
    }

    // Create the export record
    const exportDoc = await Export.create({
      projectId: projectId || null,
      recordingId: recordingId || null,
      sessionId: sessionId || null,
      mixId: mixId || null,
      userId: userId || req.user?.id || null,
      projectName: projectName || sourceDoc?.title || sourceDoc?.projectName || "Untitled Export",
      format,
      version,
      audioUrl: finalAudioUrl,
      downloadUrl: finalAudioUrl, // Same URL for now (no processing)
      durationSeconds: sourceDoc?.durationSeconds || sourceDoc?.duration || 0,
      status: "ready",
      metadata: new Map([
        ["exportedAt", new Date().toISOString()],
        ["sourceType", recordingId ? "recording" : mixId ? "mix" : sessionId ? "session" : "direct"],
      ]),
    });

    console.log(`[Export] Created export ${exportDoc._id}: ${projectName || "Untitled"}`);

    res.status(201).json({
      ok: true,
      success: true,
      exportId: exportDoc._id.toString(),
      downloadUrl: finalAudioUrl,
      audioUrl: finalAudioUrl,
      format,
      version,
      projectName: exportDoc.projectName,
      status: "ready",
      message: "Export created successfully",
    });
  } catch (err) {
    console.error("[Export] Error:", err);
    res.status(500).json({ ok: false, success: false, error: err.message });
  }
});

/**
 * GET /api/studio/export/:id
 * Get export details
 */
router.get("/export/:id", async (req, res) => {
  try {
    const exportDoc = await Export.findById(req.params.id).lean();
    if (!exportDoc) {
      return res.status(404).json({ ok: false, error: "Export not found" });
    }
    res.json({ ok: true, export: exportDoc });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/studio/exports
 * List exports (with optional filters)
 */
router.get("/exports", async (req, res) => {
  try {
    const { userId, format, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (userId) query.userId = userId;
    if (format) query.format = format;
    
    const exports = await Export.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    const total = await Export.countDocuments(query);
    
    res.json({ ok: true, exports, total });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/studio/export/email
 * Send export via email (placeholder)
 */
router.post("/export/email", async (req, res) => {
  try {
    const { assetId, assetName, assetUrl, email, notes } = req.body;
    
    if (!email || !assetUrl) {
      return res.status(400).json({ ok: false, error: "email and assetUrl are required" });
    }
    
    // TODO: Implement actual email sending with nodemailer
    console.log(`[Export] Email requested: ${assetName} to ${email}`);
    
    res.json({
      ok: true,
      message: `Export link would be sent to ${email}`,
      emailSent: false, // Set to true when email is actually sent
      downloadUrl: assetUrl,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * POST /api/studio/export/master
 * Register a finished master render
 */
router.post("/master", async (req, res) => {
  try {
    const {
      projectId,
      ownerUserId,
      beatId,
      title,
      audioUrl,
      durationSeconds,
      format,
      isClean,
      isExplicit,
      versionLabel,
      bpm,
      key,
      genre,
    } = req.body;
    
    if (!audioUrl) {
      return res.status(400).json({ success: false, error: "audioUrl is required" });
    }

    const master = await MasterRender.create({
      projectId: projectId || null,
      ownerUserId: ownerUserId || null,
      title: title || "Untitled Master",
      audioUrl,
      durationSeconds: durationSeconds || 0,
      format: format || "wav",
      isClean: !!isClean,
      isExplicit: isExplicit !== false, // default true
      quality: "master",
      bpm: bpm || null,
      key: key || null,
      genre: genre || null,
    });

    res.status(201).json({ success: true, master });
  } catch (err) {
    console.error("[StudioExport] Master export error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/studio/export/master-with-royalty
 * Register master AND create royalty work in one call
 */
router.post("/master-with-royalty", async (req, res) => {
  try {
    const {
      projectId,
      ownerUserId,
      beatId,
      title,
      audioUrl,
      durationSeconds,
      format,
      isClean,
      isExplicit,
      versionLabel,
      bpm,
      key,
      genre,
      proAffiliations,
      writers,
    } = req.body;
    
    if (!audioUrl) {
      return res.status(400).json({ success: false, error: "audioUrl is required" });
    }

    // 1. Create Master
    const master = await MasterRender.create({
      projectId: projectId || null,
      ownerUserId: ownerUserId || null,
      title: title || "Untitled Master",
      audioUrl,
      durationSeconds: durationSeconds || 0,
      format: format || "wav",
      isClean: !!isClean,
      isExplicit: isExplicit !== false,
      quality: "master",
      bpm: bpm || null,
      key: key || null,
      genre: genre || null,
    });

    // 2. Create Royalty Work
    let royaltyWork = null;
    try {
      royaltyWork = await RoyaltyWork.create({
        title: title || "Untitled Track",
        ownerUserId: ownerUserId || null,
        bpm: bpm || null,
        key: key || null,
        genre: genre || null,
        durationSeconds: durationSeconds || 0,
        masterUrl: audioUrl,
        proAffiliations: proAffiliations || ["BMI", "ASCAP"],
        writers: writers || [],
        registrationStatus: "unregistered",
      });
      
      // Link master to royalty work
      master.royaltyWorkId = royaltyWork._id;
      await master.save();
    } catch (royaltyErr) {
      console.warn("[StudioExport] Royalty creation failed:", royaltyErr.message);
    }

    res.status(201).json({ 
      success: true, 
      master,
      royaltyWork,
    });
  } catch (err) {
    console.error("[StudioExport] Master+Royalty export error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/studio/export/masters
 * List all masters (optionally by owner)
 */
router.get("/masters", async (req, res) => {
  try {
    const { ownerUserId, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (ownerUserId) query.ownerUserId = ownerUserId;
    
    const masters = await MasterRender.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("royaltyWorkId", "title registrationStatus totalStreams")
      .lean();
    
    const total = await MasterRender.countDocuments(query);
    
    res.json({ success: true, masters, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;



