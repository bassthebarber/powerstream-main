// backend/routes/tvEngagementRoutes.js
// Universal TV Engagement Routes - Ratings, Views, Payouts for ALL stations

import express from "express";
import mongoose from "mongoose";
import TVRating from "../models/TVRating.js";
import TVRoyalty from "../models/TVRoyalty.js";
import tvPayoutEngine from "../services/tvPayoutEngine.js";

// Import all station models
import Station from "../models/Station.js";

const router = express.Router();

// === HELPER: Find station by ID across all models ===
async function findStationById(stationId) {
  // Try each model until we find it
  const models = [
    { model: Station, type: "Station" },
  ];
  
  // Try dynamic imports for optional models
  try {
    const NLFTV = (await import("../models/NLFTVModel.js")).default;
    models.push({ model: NLFTV, type: "NLFTV" });
  } catch (e) { /* Model doesn't exist */ }
  
  try {
    const ChurchStation = (await import("../models/ChurchStation.js")).default;
    models.push({ model: ChurchStation, type: "ChurchStation" });
  } catch (e) { /* Model doesn't exist */ }
  
  try {
    const SchoolStation = (await import("../models/SchoolStation.js")).default;
    models.push({ model: SchoolStation, type: "SchoolStation" });
  } catch (e) { /* Model doesn't exist */ }
  
  for (const { model, type } of models) {
    try {
      const station = await model.findById(stationId);
      if (station) {
        return { station, type };
      }
    } catch (e) {
      continue;
    }
  }
  
  return { station: null, type: null };
}

// === HELPER: Find video by ID across all models ===
async function findVideoById(videoId) {
  const models = [];
  
  // Try dynamic imports
  try {
    const Video = (await import("../models/Video.js")).default;
    models.push({ model: Video, type: "Video" });
  } catch (e) { /* Model doesn't exist */ }
  
  try {
    const NLFVideo = (await import("../models/NLFVideo.js")).default;
    models.push({ model: NLFVideo, type: "NLFVideo" });
  } catch (e) { /* Model doesn't exist */ }
  
  try {
    const Film = (await import("../models/Film.js")).default;
    models.push({ model: Film, type: "Film" });
  } catch (e) { /* Model doesn't exist */ }
  
  for (const { model, type } of models) {
    try {
      const video = await model.findById(videoId);
      if (video) {
        return { video, type };
      }
    } catch (e) {
      continue;
    }
  }
  
  return { video: null, type: null };
}

// =====================================================
// POST /api/tv/engagement/view
// Track a video view and trigger payout
// =====================================================
router.post("/view", async (req, res) => {
  try {
    const { 
      stationId, 
      videoId, 
      viewerUserId,
      watchDuration = 0,
    } = req.body;
    
    if (!stationId || !videoId) {
      return res.status(400).json({ 
        success: false, 
        error: "stationId and videoId are required" 
      });
    }
    
    // Find station
    const { station, type: stationType } = await findStationById(stationId);
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }
    
    // Find video
    const { video, type: videoType } = await findVideoById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }
    
    // Extract metadata from request
    const metadata = {
      ipAddress: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      country: req.headers["cf-ipcountry"] || null,
      deviceType: detectDeviceType(req.headers["user-agent"]),
    };
    
    // Create royalty entry
    const { royalty, video: updatedVideo } = await tvPayoutEngine.createRoyalty({
      station,
      video,
      viewerUserId: viewerUserId || null,
      watchDuration: parseInt(watchDuration) || 0,
      metadata,
    });
    
    res.json({ 
      success: true, 
      views: updatedVideo.views,
      totalEarnings: updatedVideo.totalEarnings,
      qualifiedView: royalty.qualifiedView,
      royalty: {
        payoutMode: royalty.payoutMode,
        perViewAmount: royalty.perViewAmount,
        platformCut: royalty.platformCut,
        artistCut: royalty.artistCut,
      },
    });
  } catch (err) {
    console.error("[TVEngagement] Error tracking view:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/tv/engagement/rate
// Rate a video (1-5 stars)
// =====================================================
router.post("/rate", async (req, res) => {
  try {
    const { 
      stationId, 
      videoId, 
      stars,
      userId,
      comment,
    } = req.body;
    
    if (!stationId || !videoId || stars === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "stationId, videoId, and stars are required" 
      });
    }
    
    const starsValue = parseInt(stars);
    if (starsValue < 1 || starsValue > 5) {
      return res.status(400).json({ 
        success: false, 
        error: "Stars must be between 1 and 5" 
      });
    }
    
    // Find video to update
    const { video, type: videoType } = await findVideoById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }
    
    // Find station type
    const { station, type: stationType } = await findStationById(stationId);
    
    // Check for existing rating from same user
    let existingRating = null;
    if (userId) {
      existingRating = await TVRating.findOne({ 
        userId: new mongoose.Types.ObjectId(userId), 
        videoId: new mongoose.Types.ObjectId(videoId) 
      });
    }
    
    if (existingRating) {
      // Update existing rating
      existingRating.stars = starsValue;
      existingRating.comment = comment || existingRating.comment;
      await existingRating.save();
    } else {
      // Create new rating
      await TVRating.create({
        userId: userId || null,
        stationId: new mongoose.Types.ObjectId(stationId),
        stationType: stationType || "Station",
        videoId: new mongoose.Types.ObjectId(videoId),
        videoType: videoType || "Video",
        stars: starsValue,
        comment,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        deviceType: detectDeviceType(req.headers["user-agent"]),
      });
    }
    
    // Recalculate average rating
    const ratingStats = await TVRating.calculateVideoRating(videoId);
    
    // Update video with new rating
    video.rating = ratingStats.rating;
    video.ratingCount = ratingStats.ratingCount;
    await video.save();
    
    res.json({ 
      success: true, 
      rating: ratingStats.rating,
      ratingCount: ratingStats.ratingCount,
      userRating: starsValue,
      distribution: ratingStats.distribution,
    });
  } catch (err) {
    console.error("[TVEngagement] Error rating video:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/tv/engagement/video/:id
// Get video engagement stats
// =====================================================
router.get("/video/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    
    // Find video
    const { video, type: videoType } = await findVideoById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }
    
    // Get rating stats
    const ratingStats = await TVRating.calculateVideoRating(videoId);
    
    // Get payout stats
    const payoutStats = await tvPayoutEngine.getVideoPayoutSummary(videoId);
    
    res.json({ 
      success: true, 
      engagement: {
        views: video.views || 0,
        rating: ratingStats.rating,
        ratingCount: ratingStats.ratingCount,
        ratingDistribution: ratingStats.distribution,
        totalEarnings: video.totalEarnings || payoutStats.totalRevenue || 0,
        artistEarnings: payoutStats.artistEarnings || 0,
        qualifiedViews: payoutStats.qualifiedViews || 0,
      },
    });
  } catch (err) {
    console.error("[TVEngagement] Error getting video engagement:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/tv/engagement/station/:id
// Get station engagement stats
// =====================================================
router.get("/station/:id", async (req, res) => {
  try {
    const stationId = req.params.id;
    const { startDate, endDate } = req.query;
    
    // Find station
    const { station, type: stationType } = await findStationById(stationId);
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }
    
    // Get rating stats
    const ratingStats = await TVRating.calculateStationRating(stationId);
    
    // Get payout stats
    const payoutStats = await tvPayoutEngine.getStationPayoutSummary(
      stationId, 
      startDate ? new Date(startDate) : null, 
      endDate ? new Date(endDate) : null
    );
    
    res.json({ 
      success: true, 
      engagement: {
        views: payoutStats.totalViews || 0,
        rating: ratingStats.rating,
        ratingCount: ratingStats.ratingCount,
        totalRevenue: payoutStats.totalRevenue || 0,
        platformCut: payoutStats.totalPlatformCut || 0,
        stationOwnerCut: payoutStats.totalStationOwnerCut || 0,
        artistCut: payoutStats.totalArtistCut || 0,
        managerCut: payoutStats.totalManagerCut || 0,
        qualifiedViews: payoutStats.qualifiedViews || 0,
      },
      payoutSettings: station.payoutSettings || tvPayoutEngine.DEFAULT_PAYOUT_SETTINGS,
    });
  } catch (err) {
    console.error("[TVEngagement] Error getting station engagement:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/tv/engagement/user/:id
// Get user earnings (artist or manager)
// =====================================================
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const role = req.query.role || "artist"; // "artist" or "manager"
    
    const earnings = await tvPayoutEngine.getUserPayoutSummary(userId, role);
    
    res.json({ 
      success: true, 
      role,
      earnings,
    });
  } catch (err) {
    console.error("[TVEngagement] Error getting user earnings:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/tv/engagement/ledger
// Get royalty ledger (for admin/dashboard)
// =====================================================
router.get("/ledger", async (req, res) => {
  try {
    const { 
      stationId,
      videoId,
      userId,
      payoutMode,
      status,
      limit = 100,
      skip = 0,
    } = req.query;
    
    const query = {};
    if (stationId) query.stationId = new mongoose.Types.ObjectId(stationId);
    if (videoId) query.videoId = new mongoose.Types.ObjectId(videoId);
    if (userId) {
      query.$or = [
        { viewerUserId: new mongoose.Types.ObjectId(userId) },
        { artistUserId: new mongoose.Types.ObjectId(userId) },
        { managerUserId: new mongoose.Types.ObjectId(userId) },
      ];
    }
    if (payoutMode) query.payoutMode = payoutMode;
    if (status) query.status = status;
    
    const entries = await TVRoyalty.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    const total = await TVRoyalty.countDocuments(query);
    
    // Get summary
    const summary = await TVRoyalty.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$perViewAmount" },
          totalPlatformCut: { $sum: "$platformCut" },
          totalArtistCut: { $sum: "$artistCut" },
          totalManagerCut: { $sum: "$managerCut" },
          totalEntries: { $sum: 1 },
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      entries,
      total,
      summary: summary[0] || { totalRevenue: 0, totalPlatformCut: 0, totalArtistCut: 0, totalManagerCut: 0, totalEntries: 0 },
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + entries.length < total,
      },
    });
  } catch (err) {
    console.error("[TVEngagement] Error getting ledger:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === HELPER FUNCTION ===
function detectDeviceType(userAgent) {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
    if (/ipad|tablet/.test(ua)) return "tablet";
    return "mobile";
  }
  if (/smart-tv|smarttv|googletv|appletv|roku|webos/.test(ua)) return "tv";
  return "desktop";
}

export default router;



