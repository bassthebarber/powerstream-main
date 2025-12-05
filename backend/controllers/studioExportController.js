// backend/controllers/studioExportController.js
// Handles Studio export with PowerStream integration
import VODAsset from "../models/VODAsset.js";
import FeedPost from "../models/FeedPostModel.js";
import Station from "../models/Station.js";
import { v2 as cloudinary } from "cloudinary";

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
 * Export project/session to PowerStream
 * POST /api/studio/export
 * Body: {
 *   projectId, mixId, sessionId,
 *   format: 'mp3' | 'wav' | 'stems',
 *   destination: 'feed' | 'station',
 *   stationId: string (optional, required if destination is 'station'),
 *   title: string (optional),
 *   description: string (optional),
 *   mediaUrl: string (required - URL to exported media file)
 * }
 */
export async function exportProject(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const {
      projectId,
      mixId,
      sessionId,
      format = "mp3",
      destination,
      stationId,
      title,
      description,
      mediaUrl,
    } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({ ok: false, message: "mediaUrl is required" });
    }

    if (destination === "station" && !stationId) {
      return res.status(400).json({
        ok: false,
        message: "stationId is required when destination is 'station'",
      });
    }

    const results = {
      ok: true,
      mediaUrl,
      vodAsset: null,
      feedPost: null,
    };

    // Determine media type from URL or format
    const isVideo = mediaUrl.match(/\.(mp4|webm|mov|avi|m3u8)$/i) || format === "video";
    const isAudio = mediaUrl.match(/\.(mp3|wav|m4a|aac|ogg)$/i) || format === "mp3" || format === "wav";

    // If destination is 'station' or stationId is provided, create VOD asset
    if (destination === "station" || stationId) {
      // Verify station exists
      const station = await Station.findById(stationId);
      if (!station) {
        return res.status(404).json({ ok: false, message: "Station not found" });
      }

      // Create VOD asset
      // Generate unique sessionId if not provided
      const uniqueSessionId = sessionId || `export_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const vodAsset = await VODAsset.create({
        sessionId: uniqueSessionId,
        stationId,
        userId,
        title: title || `Exported ${format.toUpperCase()} - ${new Date().toLocaleDateString()}`,
        description: description || `Exported from Studio`,
        recordedAt: new Date(),
        videoUrl: mediaUrl,
        status: "ready",
        metadata: {
          projectId,
          mixId,
          sessionId: uniqueSessionId,
          format,
          source: "studio_export",
        },
      });

      results.vodAsset = {
        id: vodAsset._id.toString(),
        title: vodAsset.title,
        videoUrl: vodAsset.videoUrl,
      };
    }

    // If destination is 'feed', create PowerFeed post
    if (destination === "feed") {
      const user = req.user;
      const authorName = user?.name || user?.email || "Studio User";

      const feedPost = await FeedPost.create({
        authorName,
        content: description || title || `New ${format.toUpperCase()} from Studio`,
        mediaUrl,
        mediaType: isVideo ? "video" : isAudio ? "video" : "image", // FeedPost uses 'image' or 'video' (audio files can be treated as video for playback)
      });

      results.feedPost = {
        id: feedPost._id.toString(),
        content: feedPost.content,
        mediaUrl: feedPost.mediaUrl,
      };
    }

    // If no destination specified but mediaUrl provided, just return success
    // (media is saved but not published anywhere)

    res.json({
      ok: true,
      message: "Export completed successfully",
      ...results,
    });
  } catch (err) {
    console.error("Error exporting project:", err);
    res.status(500).json({ ok: false, message: "Failed to export project", error: err.message });
  }
}

export default {
  exportProject,
};

