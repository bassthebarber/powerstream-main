// backend/routes/churchRoutes.js
// PowerStream Church Network API Routes

import express from "express";
import ChurchStation from "../models/ChurchStation.js";
import ChurchService from "../models/ChurchService.js";
import { generateStreamKey } from "../utils/streamKeyGenerator.js";

const router = express.Router();

// =====================================================
// CHURCH STATIONS
// =====================================================

/**
 * POST /api/church/stations
 * Create a new church station
 */
router.post("/stations", async (req, res) => {
  try {
    const {
      name,
      slug,
      location,
      pastorName,
      contactEmail,
      contactPhone,
      logoUrl,
      bannerUrl,
      description,
      denomination,
      website,
      address,
      regularServices,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: "Name and slug are required" });
    }

    const existing = await ChurchStation.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, error: "Slug already exists" });
    }

    const streamKey = generateStreamKey("church");
    const rtmpBase = process.env.RTMP_BASE_URL || "rtmp://localhost:1935/live";
    const hlsBase = process.env.HLS_BASE_URL || "http://localhost:8000/live";

    const station = await ChurchStation.create({
      name,
      slug,
      location,
      pastorName,
      contactEmail,
      contactPhone,
      logoUrl,
      bannerUrl,
      description,
      denomination,
      website,
      address,
      regularServices: regularServices || [],
      streamKey,
      rtmpUrl: rtmpBase,
      hlsUrl: `${hlsBase}/${streamKey}/index.m3u8`,
    });

    res.status(201).json({ 
      success: true, 
      station,
      // Include stream info for admin
      streamInfo: {
        rtmpUrl: station.rtmpUrl,
        streamKey: station.streamKey,
        hlsUrl: station.hlsUrl,
      }
    });
  } catch (err) {
    console.error("[Church] Error creating station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/church/stations
 * List all active church stations
 */
router.get("/stations", async (req, res) => {
  try {
    const { limit = 50, skip = 0, live } = req.query;
    
    const query = { isActive: true };
    if (live === "true") query.isLive = true;
    
    const stations = await ChurchStation.find(query)
      .select("-streamKey") // Don't expose stream keys publicly
      .sort({ name: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    const total = await ChurchStation.countDocuments(query);
    
    res.json({ success: true, stations, total });
  } catch (err) {
    console.error("[Church] Error listing stations:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/church/stations/:slug
 * Get a single station by slug with recent services
 */
router.get("/stations/:slug", async (req, res) => {
  try {
    const station = await ChurchStation.findOne({ slug: req.params.slug })
      .select("-streamKey") // Don't expose stream key publicly
      .lean();
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    // Get recent services
    const services = await ChurchService.find({
      churchStationId: station._id,
    })
      .sort({ serviceDate: -1 })
      .limit(50)
      .lean();

    // Get currently live service if any
    const liveService = await ChurchService.findOne({
      churchStationId: station._id,
      isLive: true,
    }).lean();

    res.json({ 
      success: true, 
      station, 
      services,
      liveService,
    });
  } catch (err) {
    console.error("[Church] Error fetching station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/church/stations/:slug/stream-info
 * Get stream info (for admin/church staff only)
 */
router.get("/stations/:slug/stream-info", async (req, res) => {
  try {
    // TODO: Add auth middleware to protect this endpoint
    const station = await ChurchStation.findOne({ slug: req.params.slug }).lean();
    
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

/**
 * PATCH /api/church/stations/:slug
 * Update a church station
 */
router.patch("/stations/:slug", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.streamKey; // Don't allow changing stream key via this endpoint
    delete updates.slug;      // Don't allow changing slug
    
    const station = await ChurchStation.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: updates },
      { new: true }
    ).select("-streamKey");
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }
    
    res.json({ success: true, station });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/church/stations/:slug/regenerate-key
 * Regenerate stream key (admin only)
 */
router.post("/stations/:slug/regenerate-key", async (req, res) => {
  try {
    const station = await ChurchStation.findOne({ slug: req.params.slug });
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }
    
    const newKey = generateStreamKey("church");
    const hlsBase = process.env.HLS_BASE_URL || "http://localhost:8000/live";
    
    station.streamKey = newKey;
    station.hlsUrl = `${hlsBase}/${newKey}/index.m3u8`;
    await station.save();
    
    res.json({
      success: true,
      streamInfo: {
        rtmpUrl: station.rtmpUrl,
        streamKey: station.streamKey,
        hlsUrl: station.hlsUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/church/stations/:slug
 * Delete a church station (admin only)
 */
router.delete("/stations/:slug", async (req, res) => {
  try {
    const station = await ChurchStation.findOneAndDelete({ slug: req.params.slug });
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }
    
    // Also delete all services for this station
    await ChurchService.deleteMany({ churchStationId: station._id });
    
    res.json({ 
      success: true, 
      message: "Church station deleted",
      deletedStation: { _id: station._id, name: station.name, slug: station.slug }
    });
  } catch (err) {
    console.error("[Church] Error deleting station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// CHURCH SERVICES
// =====================================================

/**
 * POST /api/church/services
 * Create a new service entry
 */
router.post("/services", async (req, res) => {
  try {
    const {
      churchStationId,
      title,
      description,
      serviceDate,
      serviceType,
      isReplayAvailable,
      videoUrl,
      thumbnailUrl,
      scripture,
      sermonTitle,
      speaker,
    } = req.body;

    if (!churchStationId || !title || !serviceDate) {
      return res.status(400).json({ 
        success: false, 
        error: "churchStationId, title, and serviceDate are required" 
      });
    }

    const service = await ChurchService.create({
      churchStationId,
      title,
      description,
      serviceDate: new Date(serviceDate),
      serviceType: serviceType || "sunday",
      isReplayAvailable: !!isReplayAvailable,
      videoUrl,
      thumbnailUrl,
      scripture,
      sermonTitle,
      speaker,
    });

    res.status(201).json({ success: true, service });
  } catch (err) {
    console.error("[Church] Error creating service:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/church/services
 * List services (optionally by station)
 */
router.get("/services", async (req, res) => {
  try {
    const { churchStationId, upcoming, replays, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (churchStationId) query.churchStationId = churchStationId;
    if (upcoming === "true") {
      query.serviceDate = { $gte: new Date() };
      query.isReplayAvailable = false;
    }
    if (replays === "true") {
      query.isReplayAvailable = true;
    }
    
    const services = await ChurchService.find(query)
      .populate("churchStationId", "name slug logoUrl")
      .sort({ serviceDate: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/church/services/:id/live
 * Mark service as live / not live
 */
router.patch("/services/:id/live", async (req, res) => {
  try {
    const { isLive } = req.body;
    
    const updates = { isLive: !!isLive };
    
    if (isLive) {
      updates.liveStartedAt = new Date();
    } else {
      updates.liveEndedAt = new Date();
    }
    
    const service = await ChurchService.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }
    
    // Also update the station's isLive status
    await ChurchStation.findByIdAndUpdate(service.churchStationId, {
      $set: { isLive: !!isLive },
    });
    
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/church/services/:id
 * Update a service
 */
router.patch("/services/:id", async (req, res) => {
  try {
    const service = await ChurchService.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }
    
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/church/services/:id
 * Delete a service
 */
router.delete("/services/:id", async (req, res) => {
  try {
    await ChurchService.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// LIVE STATUS WEBHOOK (for NodeMediaServer integration)
// =====================================================

/**
 * POST /api/church/webhook/stream-start
 * Called when a stream starts (by NodeMediaServer)
 */
router.post("/webhook/stream-start", async (req, res) => {
  try {
    const { streamKey } = req.body;
    
    const station = await ChurchStation.findOne({ streamKey });
    if (!station) {
      return res.status(404).json({ success: false, error: "Invalid stream key" });
    }
    
    station.isLive = true;
    await station.save();
    
    console.log(`[Church] Station "${station.name}" went LIVE`);
    
    res.json({ success: true, stationId: station._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/church/webhook/stream-end
 * Called when a stream ends (by NodeMediaServer)
 */
router.post("/webhook/stream-end", async (req, res) => {
  try {
    const { streamKey } = req.body;
    
    const station = await ChurchStation.findOne({ streamKey });
    if (!station) {
      return res.status(404).json({ success: false, error: "Invalid stream key" });
    }
    
    station.isLive = false;
    await station.save();
    
    // End any live services
    await ChurchService.updateMany(
      { churchStationId: station._id, isLive: true },
      { $set: { isLive: false, liveEndedAt: new Date() } }
    );
    
    console.log(`[Church] Station "${station.name}" went OFFLINE`);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;


