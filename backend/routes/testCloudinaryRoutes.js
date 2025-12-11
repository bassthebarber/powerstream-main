// backend/routes/testCloudinaryRoutes.js
// Cloudinary Signature Test Route
import express from "express";
import crypto from "crypto";

const router = express.Router();

router.get("/signature-test", async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if all vars are set
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        ok: false,
        error: "Missing Cloudinary env vars",
        cloud_name: cloudName ? "SET" : "MISSING",
        api_key: apiKey ? "SET" : "MISSING",
        api_secret: apiSecret ? "SET" : "MISSING",
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `timestamp=${timestamp}`;

    const signature = crypto
      .createHash("sha1")
      .update(stringToSign + apiSecret)
      .digest("hex");

    return res.json({
      ok: true,
      cloud_name: cloudName,
      api_key: apiKey,
      timestamp,
      stringToSign,
      generatedSignature: signature,
      message: "Cloudinary signature generated successfully!",
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    ok: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "MISSING",
    api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
  });
});

export default router;


