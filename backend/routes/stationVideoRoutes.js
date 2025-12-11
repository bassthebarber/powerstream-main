// backend/routes/stationVideoRoutes.js
// Universal Station Video Catalog Routes

import { Router } from "express";
import Video from "../models/Video.js";
import Station from "../models/Station.js";

const router = Router();

/**
 * GET /api/tv/:stationId/videos
 * Fetch all videos for a specific station
 */
router.get("/:stationId/videos", async (req, res) => {
  try {
    const { stationId } = req.params;
    
    // Try to find videos by stationId (could be ObjectId or slug)
    let videos = await Video.find({ stationId })
      .sort({ createdAt: -1 })
      .lean();
    
    // If no videos found by stationId, try finding by station slug
    if (!videos.length) {
      const station = await Station.findOne({ 
        $or: [
          { slug: stationId },
          { _id: stationId }
        ]
      }).lean();
      
      if (station) {
        // Check if station has embedded videos array
        if (station.videos && station.videos.length > 0) {
          videos = station.videos.map(v => ({
            ...v,
            stationId: station._id,
            stationName: station.name,
            stationSlug: station.slug,
          }));
        } else {
          // Try finding videos by station's ObjectId
          videos = await Video.find({ stationId: station._id })
            .sort({ createdAt: -1 })
            .lean();
        }
      }
    }
    
    res.json({ 
      success: true, 
      videos,
      count: videos.length,
    });
  } catch (err) {
    console.error("[StationVideoRoutes] Error fetching videos:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tv/:stationId/catalog
 * Get full catalog info including station details and videos
 */
router.get("/:stationId/catalog", async (req, res) => {
  try {
    const { stationId } = req.params;
    
    // Find station by slug or ID
    const station = await Station.findOne({
      $or: [
        { slug: stationId },
        { _id: stationId }
      ]
    }).lean();
    
    if (!station) {
      return res.status(404).json({ 
        success: false, 
        error: "Station not found" 
      });
    }
    
    // Get videos from station's embedded array or Video collection
    let videos = station.videos || [];
    
    if (!videos.length) {
      videos = await Video.find({ stationId: station._id })
        .sort({ createdAt: -1 })
        .lean();
    }
    
    res.json({
      success: true,
      station: {
        _id: station._id,
        name: station.name,
        slug: station.slug,
        description: station.description,
        logo: station.logo,
        banner: station.banner,
        category: station.category,
      },
      videos,
      count: videos.length,
    });
  } catch (err) {
    console.error("[StationVideoRoutes] Error fetching catalog:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;


