// backend/routes/nlfRoutes.js
// No Limit Forever TV - Complete API Routes with Ratings, Views, and Payouts

import express from "express";
import mongoose from "mongoose";
import NLFTV from "../models/NLFTVModel.js";
import NLFVideo from "../models/NLFVideo.js";
import NLFRoyalty from "../models/NLFRoyalty.js";
import { generateStreamKey } from "../utils/streamKeyGenerator.js";

const router = express.Router();

// =====================================================
// STATION MANAGEMENT
// =====================================================

/**
 * POST /api/nlf/init
 * Initialize/Create the NLF TV station
 */
router.post("/init", async (req, res) => {
  try {
    const { title, description, ownerUserId } = req.body;
    
    // Check if station already exists
    let station = await NLFTV.findOne({ slug: "nlf-tv" });
    
    if (station) {
      return res.json({ 
        success: true, 
        message: "Station already exists",
        station,
        streamInfo: {
          rtmpUrl: station.rtmpUrl,
          streamKey: station.streamKey,
          hlsUrl: station.hlsUrl,
        }
      });
    }

    // Generate stream key
    const streamKey = generateStreamKey("nlf");
    const rtmpBase = process.env.RTMP_BASE_URL || "rtmp://localhost:1935/live";
    const hlsBase = process.env.HLS_BASE_URL || "http://localhost:8000/live";

    // Create station
    station = await NLFTV.create({
      title: title || "No Limit Forever TV",
      slug: "nlf-tv",
      description: description || "The Official Global Broadcast Network of the No Limit Empire",
      tagline: "Where Legends Live Forever",
      streamKey,
      rtmpUrl: rtmpBase,
      streamUrl: `${rtmpBase}/${streamKey}`,
      hlsUrl: `${hlsBase}/${streamKey}/index.m3u8`,
      logoUrl: "/logos/nolimit-forever-logo.png",
      ownerUserId: ownerUserId || null,
      payoutSettings: {
        platformCutPercentage: 15,
        creatorCutPercentage: 85,
        minimumPayout: 50,
        payoutFrequency: "monthly",
      },
    });

    console.log("[NLF] Station initialized:", station.title);

    res.status(201).json({ 
      success: true, 
      station,
      streamInfo: {
        rtmpUrl: station.rtmpUrl,
        streamKey: station.streamKey,
        hlsUrl: station.hlsUrl,
      }
    });
  } catch (err) {
    console.error("[NLF] Error initializing station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/station
 * Get station info (public)
 */
router.get("/station", async (req, res) => {
  try {
    let station = await NLFTV.findOne({ slug: "nlf-tv" })
      .populate("videos")
      .populate("featuredVideoId")
      .lean();
    
    if (!station) {
      // Auto-create if doesn't exist
      const streamKey = generateStreamKey("nlf");
      const rtmpBase = process.env.RTMP_BASE_URL || "rtmp://localhost:1935/live";
      const hlsBase = process.env.HLS_BASE_URL || "http://localhost:8000/live";
      
      const newStation = await NLFTV.create({
        title: "No Limit Forever TV",
        slug: "nlf-tv",
        description: "The Official Global Broadcast Network of the No Limit Empire",
        streamKey,
        rtmpUrl: rtmpBase,
        streamUrl: `${rtmpBase}/${streamKey}`,
        hlsUrl: `${hlsBase}/${streamKey}/index.m3u8`,
      });
      station = newStation.toObject();
    }

    // Remove sensitive data
    const publicStation = { ...station };
    delete publicStation.streamKey;
    delete publicStation.payoutSettings?.bankAccount;
    delete publicStation.payoutSettings?.routingNumber;

    res.json({ success: true, station: publicStation });
  } catch (err) {
    console.error("[NLF] Error fetching station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/stream-info
 * Get stream credentials (admin only)
 */
router.get("/stream-info", async (req, res) => {
  try {
    const station = await NLFTV.findOne({ slug: "nlf-tv" }).lean();
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    res.json({
      success: true,
      streamInfo: {
        rtmpUrl: station.rtmpUrl,
        streamKey: station.streamKey,
        hlsUrl: station.hlsUrl,
        obsInstructions: {
          server: station.rtmpUrl,
          streamKey: station.streamKey,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// VIDEO MANAGEMENT
// =====================================================

/**
 * POST /api/nlf/upload
 * Upload/register a video
 */
router.post("/upload", async (req, res) => {
  try {
    const {
      title,
      description,
      videoUrl,
      hlsUrl,
      thumbnailUrl,
      duration,
      type,
      genre,
      tags,
      artist,
      isPremiere,
      isExclusive,
      isFeatured,
      uploadedBy,
      revenuePerView,
    } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ 
        success: false, 
        error: "Title and videoUrl are required" 
      });
    }

    // Get station
    const station = await NLFTV.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    // Create video
    const video = await NLFVideo.create({
      stationId: station._id,
      title,
      description,
      videoUrl,
      hlsUrl,
      thumbnailUrl,
      duration: duration || 0,
      type: type || "premiere",
      genre,
      tags: tags || [],
      artist,
      isPremiere: isPremiere !== false,
      isExclusive: isExclusive !== false,
      isFeatured: !!isFeatured,
      uploadedBy,
      revenuePerView: revenuePerView || 0.001,
    });

    // Add to station's videos array
    station.videos.push(video._id);
    if (isFeatured) {
      station.featuredVideoId = video._id;
    }
    await station.save();

    console.log("[NLF] Video uploaded:", video.title);

    res.status(201).json({ success: true, video });
  } catch (err) {
    console.error("[NLF] Error uploading video:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/videos
 * List all videos
 */
router.get("/videos", async (req, res) => {
  try {
    const { 
      type, 
      featured, 
      sort = "newest",
      limit = 50, 
      skip = 0,
      search,
    } = req.query;

    const station = await NLFTV.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    // Build query
    const query = { stationId: station._id, isPublished: true };
    
    if (type) query.type = type;
    if (featured === "true") query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === "popular") sortOption = { views: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const videos = await NLFVideo.find(query)
      .sort(sortOption)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const total = await NLFVideo.countDocuments(query);

    // Get category stats
    const stats = await NLFVideo.aggregate([
      { $match: { stationId: station._id, isPublished: true } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const categories = {};
    stats.forEach(s => { categories[s._id] = s.count; });

    res.json({ 
      success: true, 
      videos, 
      total,
      categories,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + videos.length < total,
      }
    });
  } catch (err) {
    console.error("[NLF] Error fetching videos:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/videos/:id
 * Get single video
 */
router.get("/videos/:id", async (req, res) => {
  try {
    const video = await NLFVideo.findById(req.params.id).lean();
    
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    res.json({ success: true, video });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// RATINGS
// =====================================================

/**
 * POST /api/nlf/rate
 * Rate a video (1-5 stars)
 */
router.post("/rate", async (req, res) => {
  try {
    const { videoId, userId, rating } = req.body;

    if (!videoId || rating === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "videoId and rating are required" 
      });
    }

    const ratingValue = parseInt(rating);
    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ 
        success: false, 
        error: "Rating must be between 1 and 5" 
      });
    }

    const video = await NLFVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    // Check if user already rated
    const existingRatingIndex = video.ratings.findIndex(
      r => r.userId?.toString() === userId
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      video.ratings[existingRatingIndex].rating = ratingValue;
      video.ratings[existingRatingIndex].createdAt = new Date();
    } else {
      // Add new rating
      video.ratings.push({
        userId: userId || null,
        rating: ratingValue,
      });
    }

    // Recalculate average
    video.calculateRating();
    await video.save();

    console.log(`[NLF] Video ${video.title} rated ${ratingValue} stars`);

    res.json({ 
      success: true, 
      rating: ratingValue,
      averageRating: video.rating,
      ratingCount: video.ratingCount,
    });
  } catch (err) {
    console.error("[NLF] Error rating video:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/rating/:videoId
 * Get video rating info
 */
router.get("/rating/:videoId", async (req, res) => {
  try {
    const video = await NLFVideo.findById(req.params.videoId)
      .select("rating ratingCount ratings")
      .lean();
    
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    video.ratings.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.json({ 
      success: true, 
      rating: video.rating,
      ratingCount: video.ratingCount,
      distribution,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// VIEW TRACKING & PAYOUT TRIGGER
// =====================================================

/**
 * POST /api/nlf/view
 * Add view and trigger payout calculation
 */
router.post("/view", async (req, res) => {
  try {
    const { 
      videoId, 
      userId, 
      watchDuration = 0,
      ipAddress,
      userAgent,
      country,
      deviceType,
    } = req.body;

    if (!videoId) {
      return res.status(400).json({ success: false, error: "videoId is required" });
    }

    const video = await NLFVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    const station = await NLFTV.findById(video.stationId);
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    // Add view to video
    video.addView(watchDuration);
    await video.save();

    // Update station view count
    station.viewCount += 1;
    station.totalWatchTime += watchDuration;
    await station.save();

    // Calculate payout (only for qualified views > 30 seconds)
    const qualifiedView = watchDuration >= 30;
    let royaltyEntry = null;

    if (qualifiedView) {
      const amount = video.revenuePerView;
      const platformCutPercent = station.payoutSettings?.platformCutPercentage || 15;
      const creatorCutPercent = station.payoutSettings?.creatorCutPercentage || 85;
      
      const platformCut = amount * (platformCutPercent / 100);
      const creatorCut = amount * (creatorCutPercent / 100);

      // Create royalty entry
      royaltyEntry = await NLFRoyalty.create({
        videoId: video._id,
        stationId: station._id,
        userId: userId || null,
        creatorUserId: station.ownerUserId,
        amount,
        platformCut,
        creatorCut,
        type: "view",
        status: "pending",
        watchDuration,
        qualifiedView: true,
        ipAddress,
        userAgent,
        country,
        deviceType,
      });

      // Update station pending balance
      if (station.payoutSettings) {
        station.payoutSettings.pendingBalance = 
          (station.payoutSettings.pendingBalance || 0) + creatorCut;
        station.payoutSettings.totalEarnings = 
          (station.payoutSettings.totalEarnings || 0) + creatorCut;
        await station.save();
      }

      console.log(`[NLF] Qualified view: $${amount.toFixed(4)} (Platform: $${platformCut.toFixed(4)}, Creator: $${creatorCut.toFixed(4)})`);
    }

    res.json({ 
      success: true, 
      views: video.views,
      qualifiedView,
      royaltyEntry: royaltyEntry ? {
        amount: royaltyEntry.amount,
        creatorCut: royaltyEntry.creatorCut,
      } : null,
    });
  } catch (err) {
    console.error("[NLF] Error recording view:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// PAYOUT / ROYALTY LEDGER
// =====================================================

/**
 * GET /api/nlf/payouts
 * Get royalty ledger
 */
router.get("/payouts", async (req, res) => {
  try {
    const { 
      videoId,
      type,
      status,
      startDate,
      endDate,
      limit = 100,
      skip = 0,
    } = req.query;

    const station = await NLFTV.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    // Build query
    const query = { stationId: station._id };
    if (videoId) query.videoId = videoId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const entries = await NLFRoyalty.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("videoId", "title thumbnailUrl")
      .lean();

    const total = await NLFRoyalty.countDocuments(query);

    // Get summary
    const summary = await NLFRoyalty.getEarningsSummary(station._id);

    res.json({ 
      success: true, 
      entries,
      total,
      summary,
      payoutSettings: {
        pendingBalance: station.payoutSettings?.pendingBalance || 0,
        totalEarnings: station.payoutSettings?.totalEarnings || 0,
        totalPaidOut: station.payoutSettings?.totalPaidOut || 0,
        minimumPayout: station.payoutSettings?.minimumPayout || 50,
        payoutFrequency: station.payoutSettings?.payoutFrequency || "monthly",
      },
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + entries.length < total,
      }
    });
  } catch (err) {
    console.error("[NLF] Error fetching payouts:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/payouts/video/:videoId
 * Get earnings for specific video
 */
router.get("/payouts/video/:videoId", async (req, res) => {
  try {
    const earnings = await NLFRoyalty.getVideoEarnings(
      new mongoose.Types.ObjectId(req.params.videoId)
    );

    const video = await NLFVideo.findById(req.params.videoId)
      .select("title views totalRevenue")
      .lean();

    res.json({ 
      success: true, 
      video: video ? { title: video.title, views: video.views } : null,
      earnings,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/nlf/payouts/request
 * Request a payout
 */
router.post("/payouts/request", async (req, res) => {
  try {
    const station = await NLFTV.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    const pendingBalance = station.payoutSettings?.pendingBalance || 0;
    const minimumPayout = station.payoutSettings?.minimumPayout || 50;

    if (pendingBalance < minimumPayout) {
      return res.status(400).json({ 
        success: false, 
        error: `Minimum payout is $${minimumPayout}. Current balance: $${pendingBalance.toFixed(2)}` 
      });
    }

    // Create payout entry
    const payoutEntry = await NLFRoyalty.create({
      videoId: station.videos[0] || station._id, // Placeholder
      stationId: station._id,
      creatorUserId: station.ownerUserId,
      amount: pendingBalance,
      platformCut: 0,
      creatorCut: pendingBalance,
      type: "payout",
      status: "pending",
      payoutMethod: station.payoutSettings?.preferredMethod || "paypal",
    });

    // Reset pending balance
    station.payoutSettings.pendingBalance = 0;
    station.payoutSettings.lastPayoutDate = new Date();
    await station.save();

    console.log(`[NLF] Payout requested: $${pendingBalance.toFixed(2)}`);

    res.json({ 
      success: true, 
      message: `Payout of $${pendingBalance.toFixed(2)} requested`,
      payoutEntry,
    });
  } catch (err) {
    console.error("[NLF] Error requesting payout:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// SCHEDULE
// =====================================================

/**
 * POST /api/nlf/schedule
 * Add schedule item
 */
router.post("/schedule", async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      type,
      videoId,
      isLive,
      recurring,
    } = req.body;

    if (!title || !startTime) {
      return res.status(400).json({ 
        success: false, 
        error: "title and startTime are required" 
      });
    }

    const station = await NLFTV.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    const scheduleItem = {
      title,
      description,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      type: type || "premiere",
      videoId: videoId || null,
      isLive: !!isLive,
      recurring: !!recurring,
    };

    station.schedule.push(scheduleItem);
    await station.save();

    const newItem = station.schedule[station.schedule.length - 1];

    res.status(201).json({ success: true, scheduleItem: newItem });
  } catch (err) {
    console.error("[NLF] Error adding schedule:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/schedule
 * Get schedule
 */
router.get("/schedule", async (req, res) => {
  try {
    const { upcoming, date } = req.query;

    const station = await NLFTV.findOne({ slug: "nlf-tv" }).lean();
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    let schedule = station.schedule || [];

    if (upcoming === "true") {
      schedule = schedule.filter(s => new Date(s.startTime) >= new Date());
    }

    if (date) {
      const targetDate = new Date(date);
      schedule = schedule.filter(s => {
        const itemDate = new Date(s.startTime);
        return itemDate.toDateString() === targetDate.toDateString();
      });
    }

    schedule.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;



