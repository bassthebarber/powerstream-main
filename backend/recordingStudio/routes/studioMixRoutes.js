// backend/recordingStudio/routes/studioMixRoutes.js
// Mix & Master API Routes - Real FFmpeg-based audio processing
import express from "express";
import multer from "multer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import ffmpegStatic from "ffmpeg-static";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { requireAuth } from "../middleware/requireAuth.js";
import Mixdown from "../models/Mixdown.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Check FFmpeg availability
let FFMPEG_AVAILABLE = !!ffmpegStatic;
try {
  // Verify the ffmpeg binary exists
  if (ffmpegStatic && typeof ffmpegStatic === "string") {
    await fs.access(ffmpegStatic);
  }
} catch {
  FFMPEG_AVAILABLE = false;
}

// Health check
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Mix Engine",
    ffmpegAvailable: FFMPEG_AVAILABLE,
    cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
    timestamp: new Date().toISOString(),
  });
});

// All routes require authentication
router.use(requireAuth);

// Directories
const TEMP_DIR = process.env.MIX_TEMP_DIR || path.join(__dirname, "../temp");
const OUTPUT_DIR = process.env.MIX_OUTPUT_DIR || path.join(__dirname, "../output/mixes");

// Ensure directories exist
await fs.ensureDir(TEMP_DIR);
await fs.ensureDir(OUTPUT_DIR);

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
  fileFilter: (_req, file, cb) => {
    const ok = /^(audio|video)\//.test(file.mimetype);
    if (!ok) return cb(new Error("Only audio files allowed"));
    cb(null, true);
  },
});

// Helper: Upload buffer to Cloudinary
function uploadToCloudinary(filePath, folder = "powerstream/mixes") {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder,
    }, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

// Helper: Run FFmpeg command
function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegStatic, args);
    let stderr = "";
    
    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        reject(new Error(`FFmpeg failed: ${stderr.slice(-500)}`));
      }
    });
    
    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

// Helper: Build EQ filter string
function buildEQFilter(settings) {
  const filters = [];
  
  // Bass (60Hz), Mid (1kHz), Treble (8kHz), Presence (4kHz)
  if (settings.bass !== 0) {
    const gain = settings.bass || 0;
    filters.push(`equalizer=f=60:t=h:w=200:g=${gain}`);
  }
  if (settings.mid !== 0) {
    const gain = settings.mid || 0;
    filters.push(`equalizer=f=1000:t=h:w=500:g=${gain}`);
  }
  if (settings.treble !== 0) {
    const gain = settings.treble || 0;
    filters.push(`equalizer=f=8000:t=h:w=2000:g=${gain}`);
  }
  if (settings.presence !== 0) {
    const gain = settings.presence || 0;
    filters.push(`equalizer=f=4000:t=h:w=1000:g=${gain}`);
  }
  
  return filters;
}

// Helper: Build compressor filter
function buildCompressorFilter(settings) {
  // settings.comp: -6 to 6 maps to different ratios
  const threshold = -20 + (settings.comp || 0); // -26 to -14
  const ratio = 4;
  const attack = 5;
  const release = 100;
  
  return `acompressor=threshold=${threshold}dB:ratio=${ratio}:attack=${attack}:release=${release}`;
}

// Helper: Build limiter filter
function buildLimiterFilter(settings) {
  const limit = -1 + (settings.limiter || 0); // Output ceiling
  return `alimiter=limit=${limit}dB:level=false`;
}

/**
 * Health check
 * GET /api/mix/health
 */
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Mix Engine",
    ffmpegAvailable: !!ffmpegStatic,
    cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
  });
});

/**
 * Apply mix settings (EQ, compression, etc.)
 * POST /api/mix/apply
 * 
 * Accepts either:
 * - audioUrl: URL to existing audio file
 * - file: Uploaded audio file
 * 
 * Settings:
 * - bass: -12 to +12 dB
 * - mid: -12 to +12 dB
 * - treble: -12 to +12 dB
 * - presence: -12 to +12 dB
 * - comp: -6 to +6 (compression amount)
 * - limiter: -6 to 0 (ceiling)
 * - volume: -12 to +12 dB
 */
router.post("/apply", upload.single("file"), async (req, res) => {
  const requestId = `mix_${Date.now()}`;
  console.log(`🎚️ [MixEngine] Starting mix: ${requestId}`);
  
  try {
    const userId = req.user?.id || req.user?._id;
    const { audioUrl, settings = {}, projectName } = req.body;
    
    // Parse settings if string
    const mixSettings = typeof settings === "string" ? JSON.parse(settings) : settings;
    
    let inputPath = null;
    let tempInputFile = null;
    
    // Get input audio
    if (req.file) {
      // Uploaded file
      tempInputFile = path.join(TEMP_DIR, `input_${requestId}.${req.file.originalname?.split(".").pop() || "mp3"}`);
      await fs.writeFile(tempInputFile, req.file.buffer);
      inputPath = tempInputFile;
    } else if (audioUrl) {
      // Download from URL
      const response = await fetch(audioUrl);
      if (!response.ok) {
        return res.status(400).json({ ok: false, error: "Failed to fetch audio URL" });
      }
      tempInputFile = path.join(TEMP_DIR, `input_${requestId}.mp3`);
      await fs.writeFile(tempInputFile, Buffer.from(await response.arrayBuffer()));
      inputPath = tempInputFile;
    } else {
      return res.status(400).json({ ok: false, error: "No audio provided (file or audioUrl)" });
    }
    
    // Build FFmpeg filter chain
    const filters = [];
    
    // EQ filters
    const eqFilters = buildEQFilter(mixSettings);
    filters.push(...eqFilters);
    
    // Volume adjustment
    if (mixSettings.volume) {
      filters.push(`volume=${mixSettings.volume}dB`);
    }
    
    // Compression
    if (mixSettings.comp !== undefined) {
      filters.push(buildCompressorFilter(mixSettings));
    }
    
    // Limiter
    if (mixSettings.limiter !== undefined) {
      filters.push(buildLimiterFilter(mixSettings));
    }
    
    // Output normalization
    filters.push("loudnorm=I=-14:LRA=11:TP=-1.5");
    
    const filterChain = filters.length > 0 ? filters.join(",") : "anull";
    const outputPath = path.join(TEMP_DIR, `output_${requestId}.mp3`);
    
    // Run FFmpeg
    console.log(`🎚️ [MixEngine] Applying filters: ${filterChain}`);
    
    const ffmpegArgs = [
      "-i", inputPath,
      "-af", filterChain,
      "-ar", "44100",
      "-b:a", "320k",
      "-y",
      outputPath,
    ];
    
    await runFFmpeg(ffmpegArgs);
    
    // Upload to Cloudinary or save locally
    let mixUrl;
    let cloudinaryId = null;
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult = await uploadToCloudinary(outputPath);
        mixUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
        // Clean up local files
        await fs.remove(outputPath);
      } catch (cloudErr) {
        console.warn("☁️ [MixEngine] Cloudinary upload failed:", cloudErr.message);
        const filename = `mix_${requestId}.mp3`;
        const finalPath = path.join(OUTPUT_DIR, filename);
        await fs.move(outputPath, finalPath);
        mixUrl = `/api/mix/download/${filename}`;
      }
    } else {
      const filename = `mix_${requestId}.mp3`;
      const finalPath = path.join(OUTPUT_DIR, filename);
      await fs.move(outputPath, finalPath);
      mixUrl = `/api/mix/download/${filename}`;
    }
    
    // Clean up temp input
    if (tempInputFile) {
      await fs.remove(tempInputFile).catch(() => {});
    }
    
    // Save mix to database
    const mixdown = new Mixdown({
      title: projectName || `Mix ${new Date().toLocaleString()}`,
      userId,
      settings: mixSettings,
      inputUrl: audioUrl || "uploaded",
      outputUrl: mixUrl,
      cloudinaryId,
      status: "complete",
    });
    
    await mixdown.save().catch(err => {
      console.warn("💾 [MixEngine] DB save failed:", err.message);
    });
    
    console.log(`✅ [MixEngine] Mix complete: ${requestId}`);
    
    res.json({
      ok: true,
      mixId: mixdown._id?.toString() || requestId,
      previewUrl: mixUrl,
      downloadUrl: mixUrl,
      settings: mixSettings,
      notes: "Mix applied with EQ, compression, and loudness normalization.",
    });
    
  } catch (error) {
    console.error("❌ [MixEngine] Error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Mix two audio files together (e.g., vocals + beat)
 * POST /api/mix/combine
 */
router.post("/combine", upload.fields([
  { name: "vocal", maxCount: 1 },
  { name: "beat", maxCount: 1 },
]), async (req, res) => {
  const requestId = `combine_${Date.now()}`;
  console.log(`🎚️ [MixEngine] Starting combine: ${requestId}`);
  
  try {
    const userId = req.user?.id || req.user?._id;
    const { vocalUrl, beatUrl, vocalLevel = -3, beatLevel = -6, projectName } = req.body;
    
    let vocalPath, beatPath;
    const tempFiles = [];
    
    // Get vocal file
    if (req.files?.vocal?.[0]) {
      vocalPath = path.join(TEMP_DIR, `vocal_${requestId}.mp3`);
      await fs.writeFile(vocalPath, req.files.vocal[0].buffer);
      tempFiles.push(vocalPath);
    } else if (vocalUrl) {
      const response = await fetch(vocalUrl);
      vocalPath = path.join(TEMP_DIR, `vocal_${requestId}.mp3`);
      await fs.writeFile(vocalPath, Buffer.from(await response.arrayBuffer()));
      tempFiles.push(vocalPath);
    }
    
    // Get beat file
    if (req.files?.beat?.[0]) {
      beatPath = path.join(TEMP_DIR, `beat_${requestId}.mp3`);
      await fs.writeFile(beatPath, req.files.beat[0].buffer);
      tempFiles.push(beatPath);
    } else if (beatUrl) {
      const response = await fetch(beatUrl);
      beatPath = path.join(TEMP_DIR, `beat_${requestId}.mp3`);
      await fs.writeFile(beatPath, Buffer.from(await response.arrayBuffer()));
      tempFiles.push(beatPath);
    }
    
    if (!vocalPath || !beatPath) {
      return res.status(400).json({ ok: false, error: "Both vocal and beat are required" });
    }
    
    // Combine with FFmpeg
    const outputPath = path.join(TEMP_DIR, `output_${requestId}.mp3`);
    
    const ffmpegArgs = [
      "-i", vocalPath,
      "-i", beatPath,
      "-filter_complex",
      `[0:a]volume=${vocalLevel}dB[v];[1:a]volume=${beatLevel}dB[b];[v][b]amix=inputs=2:duration=longest,loudnorm=I=-14:LRA=11:TP=-1.5[out]`,
      "-map", "[out]",
      "-ar", "44100",
      "-b:a", "320k",
      "-y",
      outputPath,
    ];
    
    await runFFmpeg(ffmpegArgs);
    
    // Upload result
    let mixUrl;
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult = await uploadToCloudinary(outputPath);
        mixUrl = uploadResult.secure_url;
        await fs.remove(outputPath);
      } catch (err) {
        const filename = `combine_${requestId}.mp3`;
        const finalPath = path.join(OUTPUT_DIR, filename);
        await fs.move(outputPath, finalPath);
        mixUrl = `/api/mix/download/${filename}`;
      }
    } else {
      const filename = `combine_${requestId}.mp3`;
      const finalPath = path.join(OUTPUT_DIR, filename);
      await fs.move(outputPath, finalPath);
      mixUrl = `/api/mix/download/${filename}`;
    }
    
    // Cleanup temp files
    for (const f of tempFiles) {
      await fs.remove(f).catch(() => {});
    }
    
    console.log(`✅ [MixEngine] Combine complete: ${requestId}`);
    
    res.json({
      ok: true,
      mixId: requestId,
      previewUrl: mixUrl,
      downloadUrl: mixUrl,
      settings: { vocalLevel, beatLevel },
      notes: "Vocals and beat combined with loudness normalization.",
    });
    
  } catch (error) {
    console.error("❌ [MixEngine] Combine error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Get AI recipe for mix settings
 * POST /api/mix/ai-recipe
 */
router.post("/ai-recipe", async (req, res) => {
  try {
    const { genre, mood, referenceTrack, prompt } = req.body;
    
    // Predefined recipes based on genre/mood
    const recipes = {
      trap: {
        bass: 4, mid: -2, treble: 2, presence: 3,
        comp: 3, limiter: -1, volume: 0,
        notes: "Punchy bass, scooped mids, crisp highs for modern trap sound.",
      },
      rnb: {
        bass: 2, mid: 1, treble: 0, presence: 2,
        comp: 2, limiter: -2, volume: 0,
        notes: "Warm and smooth with gentle compression for R&B feel.",
      },
      drill: {
        bass: 5, mid: -3, treble: 3, presence: 2,
        comp: 4, limiter: -1, volume: 1,
        notes: "Heavy bass, aggressive compression, in-your-face presence.",
      },
      lofi: {
        bass: 1, mid: -1, treble: -2, presence: 0,
        comp: 1, limiter: -3, volume: -2,
        notes: "Lo-fi warmth with rolled-off highs and gentle dynamics.",
      },
      radio: {
        bass: 2, mid: 0, treble: 2, presence: 3,
        comp: 5, limiter: 0, volume: 2,
        notes: "Radio-ready loudness with competitive punch.",
      },
      default: {
        bass: 0, mid: 0, treble: 0, presence: 0,
        comp: 2, limiter: -1, volume: 0,
        notes: "Balanced mix starting point.",
      },
    };
    
    const recipe = recipes[genre?.toLowerCase()] || recipes[mood?.toLowerCase()] || recipes.default;
    
    res.json({
      ok: true,
      mixId: `recipe_${Date.now()}`,
      settings: {
        bass: recipe.bass,
        mid: recipe.mid,
        treble: recipe.treble,
        presence: recipe.presence,
        comp: recipe.comp,
        limiter: recipe.limiter,
        volume: recipe.volume,
      },
      notes: prompt || recipe.notes,
      genre,
      mood,
    });
  } catch (error) {
    console.error("[MixEngine] AI recipe error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Download a mix file
 * GET /api/mix/download/:filename
 */
router.get("/download/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(OUTPUT_DIR, filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ ok: false, error: "File not found" });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * List user's mixes
 * GET /api/mix/list
 */
router.get("/list", async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { limit = 20 } = req.query;
    
    const mixes = await Mixdown.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json({
      ok: true,
      mixes: mixes.map(m => ({
        id: m._id,
        title: m.title,
        outputUrl: m.outputUrl,
        settings: m.settings,
        status: m.status,
        createdAt: m.createdAt,
      })),
      total: mixes.length,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
