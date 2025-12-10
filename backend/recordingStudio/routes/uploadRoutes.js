// backend/recordingStudio/routes/uploadRoutes.js
// Studio Upload Routes - Handle audio file uploads
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/requireAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directories exist
const LOCAL_UPLOAD_DIR = path.join(__dirname, "../uploads");
fs.ensureDirSync(LOCAL_UPLOAD_DIR);

// Configure Cloudinary if available
const CLOUDINARY_CONFIGURED = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer configuration - memory storage for cloud upload
const memoryStorage = multer.memoryStorage();

// Multer configuration - disk storage for local fallback
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, LOCAL_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: CLOUDINARY_CONFIGURED ? memoryStorage : diskStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^(audio|video)\//.test(file.mimetype);
    if (!allowed) {
      return cb(new Error("Only audio/video files are allowed"));
    }
    cb(null, true);
  },
});

// Helper: Upload buffer to Cloudinary
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "powerstream/studio",
        resource_type: "video", // Works for audio too
        ...options,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * Health check
 * GET /api/studio/upload/health
 */
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Studio Upload",
    cloudinaryConfigured: CLOUDINARY_CONFIGURED,
    localFallback: !CLOUDINARY_CONFIGURED,
    maxFileSize: "100MB",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Upload audio/video file
 * POST /api/studio/upload
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No file provided",
      });
    }

    let fileUrl;
    let cloudinaryId = null;
    let metadata = {};

    if (CLOUDINARY_CONFIGURED && req.file.buffer) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, {
        public_id: `upload_${Date.now()}`,
        context: { originalname: req.file.originalname },
      });
      
      fileUrl = result.secure_url;
      cloudinaryId = result.public_id;
      metadata = {
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      };
    } else {
      // Local storage fallback
      fileUrl = `/api/studio/upload/files/${req.file.filename}`;
      metadata = {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
    }

    res.json({
      ok: true,
      message: "File uploaded successfully",
      file: {
        url: fileUrl,
        cloudinaryId,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        ...metadata,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Upload multiple files
 * POST /api/studio/upload/multiple
 */
router.post("/multiple", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "No files provided",
      });
    }

    const results = [];

    for (const file of req.files) {
      let fileUrl;
      let cloudinaryId = null;

      if (CLOUDINARY_CONFIGURED && file.buffer) {
        const result = await uploadToCloudinary(file.buffer, {
          public_id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        });
        fileUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } else {
        fileUrl = `/api/studio/upload/files/${file.filename}`;
      }

      results.push({
        url: fileUrl,
        cloudinaryId,
        originalName: file.originalname,
        size: file.size,
      });
    }

    res.json({
      ok: true,
      message: `${results.length} files uploaded`,
      files: results,
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Serve local files (fallback)
 * GET /api/studio/upload/files/:filename
 */
router.get("/files/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(LOCAL_UPLOAD_DIR, filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ ok: false, error: "File not found" });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Delete uploaded file
 * DELETE /api/studio/upload/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (CLOUDINARY_CONFIGURED && id.startsWith("powerstream/")) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(id, { resource_type: "video" });
    } else {
      // Delete local file
      const filePath = path.join(LOCAL_UPLOAD_DIR, id);
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    }

    res.json({ ok: true, message: "File deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
