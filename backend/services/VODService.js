// backend/services/VODService.js
// Video-On-Demand service for processing recorded streams
import VODAsset from "../models/VODAsset.js";
import MultistreamSession from "../models/MultistreamSession.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if available
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Create VOD asset from a completed recording
 * @param {Object} params - { sessionId, recordingPath, stationId, userId, title, description }
 * @returns {Promise<Object>} VOD asset
 */
export async function createVODAsset(params) {
  const { sessionId, recordingPath, stationId, userId, title, description } = params;

  try {
    // Check if recording file exists
    const stats = await fs.stat(recordingPath);
    if (stats.size === 0) {
      throw new Error("Recording file is empty");
    }

    // Upload to cloud storage if configured
    let videoUrl = recordingPath; // Default to local path
    let thumbnailUrl = null;

    if (cloudinary.config().cloud_name) {
      try {
        // Upload video to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(recordingPath, {
          resource_type: "video",
          folder: "powerstream/vod",
          public_id: `vod_${sessionId}`,
        });

        videoUrl = uploadResult.secure_url;

        // Generate thumbnail (first frame)
        const thumbnailResult = await cloudinary.url(`vod_${sessionId}`, {
          resource_type: "video",
          format: "jpg",
          transformation: [{ width: 1280, height: 720, crop: "fill" }],
        });
        thumbnailUrl = thumbnailResult;

        // Delete local file after successful upload
        await fs.unlink(recordingPath).catch(() => {});
      } catch (uploadError) {
        console.error("[VODService] Cloudinary upload failed, keeping local file:", uploadError);
        // Keep local file as fallback
      }
    }

    // Get session for metadata
    const session = await MultistreamSession.findOne({ sessionId });
    const duration = session?.duration || null;

    // Create VOD asset
    const vodAsset = new VODAsset({
      sessionId,
      stationId,
      userId,
      title: title || `Live Stream - ${new Date(session?.startedAt || Date.now()).toLocaleDateString()}`,
      description: description || "",
      recordedAt: session?.startedAt || new Date(),
      duration,
      videoUrl,
      thumbnailUrl,
      fileSize: stats.size,
      status: "ready",
    });

    await vodAsset.save();

    // Update session with VOD asset reference
    if (session) {
      session.vodAssetId = vodAsset._id;
      session.recordingReady = true;
      await session.save();
    }

    console.log(`[VODService] Created VOD asset ${vodAsset._id} for session ${sessionId}`);

    return {
      ok: true,
      vodAsset: {
        id: vodAsset._id.toString(),
        sessionId: vodAsset.sessionId,
        title: vodAsset.title,
        videoUrl: vodAsset.videoUrl,
        thumbnailUrl: vodAsset.thumbnailUrl,
        duration: vodAsset.duration,
        status: vodAsset.status,
      },
    };
  } catch (error) {
    console.error("[VODService] Error creating VOD asset:", error);
    return {
      ok: false,
      error: error.message,
    };
  }
}

/**
 * Process a completed recording (called after stream stops)
 * @param {string} sessionId - Session ID
 */
export async function processRecording(sessionId) {
  try {
    const session = await MultistreamSession.findOne({ sessionId });
    if (!session || !session.recordingPath) {
      return { ok: false, message: "No recording found for this session" };
    }

    // Check if VOD asset already exists
    if (session.vodAssetId) {
      return { ok: true, message: "VOD asset already exists", vodAssetId: session.vodAssetId };
    }

    // Create VOD asset
    const result = await createVODAsset({
      sessionId,
      recordingPath: session.recordingPath,
      stationId: session.stationId,
      userId: session.userId,
      title: session.title,
      description: session.description,
    });

    return result;
  } catch (error) {
    console.error("[VODService] Error processing recording:", error);
    return { ok: false, error: error.message };
  }
}

export default {
  createVODAsset,
  processRecording,
};



