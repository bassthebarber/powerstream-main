// backend/routes/tvStationRoutes.js
import { Router } from "express";
import {
  getStations,
  getStationBySlug,
  getSouthernPowerStations,
  getWorldwideStations,
} from "../controllers/tvStationController.js";
import Station from "../models/Station.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// Public routes
router.get("/", getStations);
router.get("/southern-power", getSouthernPowerStations);
router.get("/world", getWorldwideStations);

// Get videos for a station (playlist)
router.get("/:slug/videos", async (req, res) => {
  try {
    const { slug } = req.params;
    const station = await Station.findOne({ slug }).populate("videos").lean();
    
    if (!station) {
      return res.status(404).json({ ok: false, message: "Station not found", slug });
    }
    
    return res.json({ ok: true, videos: station.videos || [] });
  } catch (err) {
    console.error("❌ Error loading station videos:", err);
    return res.status(500).json({ ok: false, message: "Failed to load videos" });
  }
});

// Add video to station playlist (requires auth)
router.post("/:slug/videos", authRequired, async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, videoUrl, thumbnailUrl, durationSeconds, isFeatured } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ ok: false, message: "videoUrl is required" });
    }
    
    const station = await Station.findOne({ slug });
    if (!station) {
      return res.status(404).json({ ok: false, message: "Station not found", slug });
    }
    
    // Create embedded video object
    const video = {
      _id: new (await import("mongoose")).default.Types.ObjectId(),
      title: title || "Untitled Video",
      description: description || "",
      videoUrl,
      thumbnailUrl: thumbnailUrl || "",
      durationSeconds: durationSeconds || 0,
      isFeatured: isFeatured || false,
      uploadedBy: req.user?.id || req.user?._id,
      uploadedAt: new Date()
    };
    
    // Add to station's videos array
    if (!station.videos) station.videos = [];
    station.videos.push(video);
    await station.save();
    
    console.log(`✅ Video added to station ${slug}:`, video.title);
    
    return res.status(201).json({ 
      ok: true, 
      message: "Video added to station", 
      video,
      totalVideos: station.videos.length
    });
  } catch (err) {
    console.error("❌ Error adding video to station:", err);
    return res.status(500).json({ ok: false, message: "Failed to add video" });
  }
});

// Update station live status
router.patch("/:slug/status", authRequired, async (req, res) => {
  try {
    const { slug } = req.params;
    const { isLive, streamUrl } = req.body;
    
    const station = await Station.findOne({ slug });
    if (!station) {
      return res.status(404).json({ ok: false, message: "Station not found", slug });
    }
    
    if (typeof isLive === "boolean") {
      station.isLive = isLive;
    }
    if (streamUrl) {
      station.streamUrl = streamUrl;
    }
    
    await station.save();
    
    console.log(`📺 Station ${slug} status updated: isLive=${station.isLive}`);
    
    return res.json({ 
      ok: true, 
      message: "Station status updated",
      station: {
        slug: station.slug,
        name: station.name,
        isLive: station.isLive,
        streamUrl: station.streamUrl
      }
    });
  } catch (err) {
    console.error("❌ Error updating station status:", err);
    return res.status(500).json({ ok: false, message: "Failed to update status" });
  }
});

// Delete video from station playlist (requires auth)
router.delete("/:slug/videos/:videoId", authRequired, async (req, res) => {
  try {
    const { slug, videoId } = req.params;
    
    const station = await Station.findOne({ slug });
    if (!station) {
      return res.status(404).json({ ok: false, message: "Station not found", slug });
    }
    
    // Find and remove the video
    const videoIndex = station.videos?.findIndex(v => v._id.toString() === videoId);
    
    if (videoIndex === -1 || videoIndex === undefined) {
      return res.status(404).json({ ok: false, message: "Video not found in station" });
    }
    
    const deletedVideo = station.videos[videoIndex];
    station.videos.splice(videoIndex, 1);
    await station.save();
    
    console.log(`🗑️ Video deleted from station ${slug}:`, deletedVideo.title);
    
    return res.json({ 
      ok: true, 
      message: "Video deleted from station",
      deletedVideo: { _id: deletedVideo._id, title: deletedVideo.title },
      remainingVideos: station.videos.length
    });
  } catch (err) {
    console.error("❌ Error deleting video from station:", err);
    return res.status(500).json({ ok: false, message: "Failed to delete video" });
  }
});

// Get single station by slug (must be LAST due to :slug param)
router.get("/:slug", getStationBySlug);

export default router;





