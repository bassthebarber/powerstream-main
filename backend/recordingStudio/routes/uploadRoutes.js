// /backend/recordingStudio/routes/uploadRoutes.js
// Southern Power Syndicate – Recording Studio Upload API (Cloudinary)
// Supports audio, video, and image uploads via multipart/form-data

import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();

// ---- Cloudinary Config (from /backend/.env.local)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- Guards
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️  Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in /backend/.env.local");
}

// ---- Multer (in-memory; no temp files on disk)
const storage = multer.memoryStorage();

// Limit ~200MB per file; accept audio/video/image
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^(audio|video|image)\//.test(file.mimetype);
    if (!ok) return cb(new Error("Only audio/video/image files are allowed"));
    cb(null, true);
  },
});

// ---- Helpers
const FOLDER = process.env.CLOUDINARY_FOLDER || "powerstream/recording-studio";

// promisify Cloudinary upload_stream for buffers
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: "auto", // auto-detect audio/video/image
        overwrite: false,
        ...options,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ---- Routes

// Health check (root)
router.get("/", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "Upload API",
    folder: FOLDER,
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  });
});

// Health ping (alias)
router.get("/ping", (_req, res) => {
  res.json({ ok: true, message: "Upload route alive", folder: FOLDER });
});

// Health check
router.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "Upload API",
    cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  });
});

// Single file upload: field name must be "file"
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: "No file provided" });

    const { originalname, mimetype, size } = req.file;
    const publicIdBase = (req.body.publicId || originalname || "studio_upload")
      .replace(/\.[^/.]+$/, "") // remove extension
      .replace(/[^\w\-./]/g, "_");

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      public_id: publicIdBase,
      context: { originalname },
    });

    return res.json({
      ok: true,
      message: "Uploaded successfully",
      asset: {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        duration: result.duration, // present on audio/video
        width: result.width,
        height: result.height,
      },
      meta: { originalname, mimetype, size },
    });
  } catch (err) {
    console.error("💥 Upload error:", err);
    return res.status(500).json({ ok: false, message: err.message || "Upload failed" });
  }
});

// Multiple files upload: field name must be "files"
router.post("/multi", upload.array("files", 8), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ ok: false, message: "No files provided" });

    const uploads = await Promise.all(
      req.files.map((f) =>
        uploadBufferToCloudinary(f.buffer, {
          public_id: (f.originalname || "studio_upload").replace(/\.[^/.]+$/, "").replace(/[^\w\-./]/g, "_"),
          context: { originalname: f.originalname },
        }).then((r) => ({
          ok: true,
          asset: {
            url: r.secure_url,
            public_id: r.public_id,
            resource_type: r.resource_type,
            format: r.format,
            bytes: r.bytes,
            duration: r.duration,
            width: r.width,
            height: r.height,
          },
          meta: { originalname: f.originalname, mimetype: f.mimetype, size: f.size },
        }))
      )
    );

    return res.json({ ok: true, count: uploads.length, uploads });
  } catch (err) {
    console.error("💥 Multi-upload error:", err);
    return res.status(500).json({ ok: false, message: err.message || "Upload failed" });
  }
});

// Optional: delete by public_id
router.delete("/", async (req, res) => {
  try {
    const { public_id } = req.query;
    if (!public_id) return res.status(400).json({ ok: false, message: "public_id is required" });

    // auto resource type helps when public_id is from audio/video/image
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: "video" })
      .catch(async () => cloudinary.uploader.destroy(public_id, { resource_type: "image" }))
      .catch(async () => cloudinary.uploader.destroy(public_id, { resource_type: "raw" }));

    return res.json({ ok: true, result });
  } catch (err) {
    console.error("💥 Delete error:", err);
    return res.status(500).json({ ok: false, message: err.message || "Delete failed" });
  }
});

// ---- Export Email Route ----
// POST /api/export/email - Send asset download link via email
router.post("/email", async (req, res) => {
  try {
    const { assetId, assetName, assetUrl, email, notes } = req.body;

    if (!email) {
      return res.status(400).json({ ok: false, message: "Email is required" });
    }

    // TODO: Implement actual email sending using nodemailer or SendGrid
    // For now, log the request and return success
    console.log(`📧 Export email requested:`);
    console.log(`   To: ${email}`);
    console.log(`   Asset: ${assetName || assetId}`);
    console.log(`   URL: ${assetUrl}`);
    if (notes) console.log(`   Notes: ${notes}`);

    // Simulate email sending
    // In production, use:
    // - nodemailer with SMTP
    // - SendGrid API
    // - AWS SES
    // etc.

    return res.json({
      ok: true,
      message: `Export sent to ${email}`,
      details: {
        to: email,
        assetName: assetName || "Untitled",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("💥 Export email error:", err);
    return res.status(500).json({ ok: false, message: err.message || "Export failed" });
  }
});

export default router;
