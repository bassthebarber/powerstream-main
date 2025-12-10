// backend/routes/uploadRoutes.js
// Clean Cloudinary Upload Engine - No blocking operations
import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import Station from "../models/Station.js";

const router = express.Router();

// ============================================
// MULTER - Memory Storage (no disk writes)
// ============================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

// ============================================
// CLOUDINARY CONFIG
// ============================================
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure once at startup
if (CLOUD_NAME && API_KEY && API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
  console.log("✅ Cloudinary configured");
}

function isCloudinaryReady() {
  return !!(CLOUD_NAME && API_KEY && API_SECRET);
}

// ============================================
// HEALTH CHECK
// ============================================
router.get("/health", (req, res) => {
  res.json({
    ok: true,
    cloudinary: isCloudinaryReady(),
    maxFileSize: "500MB",
  });
});

// ============================================
// STREAM UPLOAD HELPER
// No manual signatures - let SDK handle it
// ============================================
function streamUploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    // Pipe buffer to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// ============================================
// MAIN UPLOAD - POST /api/upload
// Handles both images and videos (auto-detect)
// Accepts field names: "file", "video", "image", "media"
// ============================================
router.post("/", upload.single("file"), async (req, res) => {
  console.log("📤 [Upload] POST /api/upload");

  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded. Use field name 'file'" 
      });
    }

    // Validate Cloudinary
    if (!isCloudinaryReady()) {
      return res.status(500).json({ 
        success: false,
        error: "Cloudinary not configured" 
      });
    }

    const stationSlug = req.body.station || "general";
    const title = req.body.title || req.file.originalname || "Untitled";
    const description = req.body.description || "";
    const mimeType = req.file.mimetype || "";

    // Auto-detect resource type
    let resourceType = "auto";
    if (mimeType.startsWith("video/")) {
      resourceType = "video";
    } else if (mimeType.startsWith("image/")) {
      resourceType = "image";
    } else if (mimeType.startsWith("audio/")) {
      resourceType = "video"; // Cloudinary handles audio as video
    }

    console.log(`📤 [Upload] File: ${title} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`📤 [Upload] Type: ${mimeType} -> ${resourceType}`);
    console.log(`📤 [Upload] Station: ${stationSlug}`);

    // Determine folder based on type
    let folder = `powerstream/uploads`;
    if (mimeType.startsWith("video/")) {
      folder = `powerstream/videos`;
    } else if (mimeType.startsWith("image/")) {
      folder = `powerstream/images`;
    } else if (mimeType.startsWith("audio/")) {
      folder = `powerstream/audio`;
    }

    // Upload to Cloudinary - SDK handles auth automatically
    const result = await streamUploadToCloudinary(req.file.buffer, {
      resource_type: resourceType,
      folder,
      timeout: 300000, // 5 minute timeout for large files
      chunk_size: 6000000, // 6MB chunks for more reliable uploads
    });

    console.log("✅ [Upload] Cloudinary success:", result.public_id);

    // Generate thumbnail URL (for videos/images)
    let thumbnail = null;
    if (resourceType === "video") {
      thumbnail = result.secure_url.replace(/\.[^.]+$/, ".jpg");
    } else if (resourceType === "image") {
      thumbnail = result.secure_url;
    }

    // Save to station's videos array if applicable (non-blocking)
    let savedToStation = false;
    if (stationSlug !== "general" && resourceType === "video") {
      try {
        const station = await Station.findOne({ slug: stationSlug });
        if (station) {
          station.videos.push({
            title,
            description,
            url: result.secure_url,
            thumbnail,
            uploadedAt: new Date(),
          });
          await station.save();
          savedToStation = true;
          console.log(`✅ [Upload] Saved to station: ${stationSlug}`);
        }
      } catch (dbErr) {
        console.warn("⚠️ [Upload] DB save failed:", dbErr.message);
      }
    }

    // Success response - comprehensive format for all clients
    return res.json({
      success: true,
      ok: true,
      url: result.secure_url,
      videoUrl: result.secure_url,
      imageUrl: result.secure_url,
      mediaUrl: result.secure_url,
      thumbnail,
      thumbnailUrl: thumbnail,
      duration: result.duration || 0,
      width: result.width || 0,
      height: result.height || 0,
      publicId: result.public_id,
      resourceType,
      savedToStation,
      data: {
        url: result.secure_url,
        thumbnail,
        duration: result.duration || 0,
      },
    });

  } catch (err) {
    console.error("💥 [Upload] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Upload failed",
    });
  }
});

// ============================================
// FILM UPLOAD - POST /api/upload/film
// ============================================
router.post("/film", upload.single("video"), async (req, res) => {
  console.log("🎬 [Upload] POST /api/upload/film");

  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded" 
      });
    }

    if (!isCloudinaryReady()) {
      return res.status(500).json({ 
        success: false,
        error: "Cloudinary not configured" 
      });
    }

    const category = req.body.category || "general";
    const title = req.body.title || req.file.originalname || "Untitled";

    console.log(`🎬 [Upload Film] ${title} → ${category}`);

    const result = await streamUploadToCloudinary(req.file.buffer, {
      resource_type: "video",
      folder: `powerstream/films/${category}`,
      timeout: 120000,
    });

    const thumbnail = result.secure_url.replace(/\.[^.]+$/, ".jpg");

    return res.json({
      success: true,
      ok: true,
      videoUrl: result.secure_url,
      thumbnail,
      duration: result.duration || 0,
      publicId: result.public_id,
    });

  } catch (err) {
    console.error("💥 [Upload Film] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Upload failed",
    });
  }
});

// ============================================
// IMAGE UPLOAD - POST /api/upload/image
// ============================================
router.post("/image", upload.single("image"), async (req, res) => {
  console.log("🖼️ [Upload] POST /api/upload/image");

  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded" 
      });
    }

    if (!isCloudinaryReady()) {
      return res.status(500).json({ 
        success: false,
        error: "Cloudinary not configured" 
      });
    }

    const folder = req.body.folder || "powerstream/images";

    const result = await streamUploadToCloudinary(req.file.buffer, {
      resource_type: "image",
      folder,
      timeout: 60000,
    });

    return res.json({
      success: true,
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
    });

  } catch (err) {
    console.error("💥 [Upload Image] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Upload failed",
    });
  }
});

export default router;
