// backend/routes/schoolRoutes.js
// PowerStream School Network API Routes

import express from "express";
import SchoolStation from "../models/SchoolStation.js";
import SchoolGame from "../models/SchoolGame.js";
import SchoolEvent from "../models/SchoolEvent.js";
import { generateStreamKey } from "../utils/streamKeyGenerator.js";

const router = express.Router();

// =====================================================
// SCHOOL STATIONS
// =====================================================

/**
 * POST /api/schools/stations
 * Create a new school station
 */
router.post("/stations", async (req, res) => {
  try {
    const {
      name,
      slug,
      district,
      mascot,
      colors,
      location,
      contactEmail,
      contactPhone,
      logoUrl,
      bannerUrl,
      description,
      website,
      athleticsUrl,
      sports,
      classification,
      conference,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: "Name and slug are required" });
    }

    const existing = await SchoolStation.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, error: "Slug already exists" });
    }

    const streamKey = generateStreamKey("school");
    const rtmpBase = process.env.RTMP_BASE_URL || "rtmp://localhost:1935/live";
    const hlsBase = process.env.HLS_BASE_URL || "http://localhost:8000/live";

    const station = await SchoolStation.create({
      name,
      slug,
      district,
      mascot,
      colors,
      location,
      contactEmail,
      contactPhone,
      logoUrl,
      bannerUrl,
      description,
      website,
      athleticsUrl,
      sports: sports || [],
      classification,
      conference,
      streamKey,
      rtmpUrl: rtmpBase,
      hlsUrl: `${hlsBase}/${streamKey}/index.m3u8`,
    });

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
    console.error("[School] Error creating station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/schools/stations
 * List all active school stations
 */
router.get("/stations", async (req, res) => {
  try {
    const { district, live, limit = 100, skip = 0 } = req.query;
    
    const query = { isActive: true };
    if (district) query.district = district;
    if (live === "true") query.isLive = true;
    
    const stations = await SchoolStation.find(query)
      .select("-streamKey") // Don't expose stream keys publicly
      .sort({ name: 1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    const total = await SchoolStation.countDocuments(query);
    
    res.json({ success: true, stations, total });
  } catch (err) {
    console.error("[School] Error listing stations:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/schools/stations/:slug
 * Get a single station by slug with games and events
 */
router.get("/stations/:slug", async (req, res) => {
  try {
    const station = await SchoolStation.findOne({ slug: req.params.slug })
      .select("-streamKey")
      .lean();
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    // Get recent games
    const games = await SchoolGame.find({
      schoolStationId: station._id,
    })
      .sort({ gameDate: -1 })
      .limit(100)
      .lean();

    // Get recent events
    const events = await SchoolEvent.find({
      schoolStationId: station._id,
    })
      .sort({ eventDate: -1 })
      .limit(100)
      .lean();

    // Get currently live game/event
    const liveGame = await SchoolGame.findOne({
      schoolStationId: station._id,
      isLive: true,
    }).lean();

    const liveEvent = await SchoolEvent.findOne({
      schoolStationId: station._id,
      isLive: true,
    }).lean();

    res.json({ 
      success: true, 
      station, 
      games, 
      events,
      liveGame,
      liveEvent,
    });
  } catch (err) {
    console.error("[School] Error fetching station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/schools/stations/:slug/stream-info
 * Get stream info (for admin/school staff only)
 */
router.get("/stations/:slug/stream-info", async (req, res) => {
  try {
    const station = await SchoolStation.findOne({ slug: req.params.slug }).lean();
    
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
 * PATCH /api/schools/stations/:slug
 * Update a school station
 */
router.patch("/stations/:slug", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.streamKey;
    delete updates.slug;
    
    const station = await SchoolStation.findOneAndUpdate(
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
 * POST /api/schools/stations/:slug/regenerate-key
 * Regenerate stream key
 */
router.post("/stations/:slug/regenerate-key", async (req, res) => {
  try {
    const station = await SchoolStation.findOne({ slug: req.params.slug });
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }
    
    const newKey = generateStreamKey("school");
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
 * DELETE /api/schools/stations/:slug
 * Delete a school station (admin only)
 */
router.delete("/stations/:slug", async (req, res) => {
  try {
    const station = await SchoolStation.findOneAndDelete({ slug: req.params.slug });
    
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }
    
    // Also delete all games and events for this station
    await SchoolGame.deleteMany({ schoolStationId: station._id });
    await SchoolEvent.deleteMany({ schoolStationId: station._id });
    
    res.json({ 
      success: true, 
      message: "School station deleted",
      deletedStation: { _id: station._id, name: station.name, slug: station.slug }
    });
  } catch (err) {
    console.error("[School] Error deleting station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// SCHOOL GAMES
// =====================================================

/**
 * POST /api/schools/games
 * Create a new game entry
 */
router.post("/games", async (req, res) => {
  try {
    const {
      schoolStationId,
      sport,
      level,
      opponent,
      opponentMascot,
      homeOrAway,
      venue,
      gameDate,
      gameTime,
      seasonLabel,
      seasonType,
      videoUrl,
      highlightUrl,
      thumbnailUrl,
      notes,
    } = req.body;

    if (!schoolStationId || !sport || !opponent || !gameDate) {
      return res.status(400).json({ 
        success: false, 
        error: "schoolStationId, sport, opponent, and gameDate are required" 
      });
    }

    const game = await SchoolGame.create({
      schoolStationId,
      sport,
      level: level || "varsity",
      opponent,
      opponentMascot,
      homeOrAway: homeOrAway || "home",
      venue,
      gameDate: new Date(gameDate),
      gameTime,
      seasonLabel,
      seasonType: seasonType || "regular",
      videoUrl,
      highlightUrl,
      thumbnailUrl,
      notes,
    });

    res.status(201).json({ success: true, game });
  } catch (err) {
    console.error("[School] Error creating game:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/schools/games
 * List games (optionally by station, sport, etc.)
 */
router.get("/games", async (req, res) => {
  try {
    const { schoolStationId, sport, upcoming, replays, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (schoolStationId) query.schoolStationId = schoolStationId;
    if (sport) query.sport = sport;
    if (upcoming === "true") {
      query.gameDate = { $gte: new Date() };
      query.result = "pending";
    }
    if (replays === "true") {
      query.isReplayAvailable = true;
    }
    
    const games = await SchoolGame.find(query)
      .populate("schoolStationId", "name slug logoUrl mascot")
      .sort({ gameDate: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/schools/games/:id/score
 * Update game score and result
 */
router.patch("/games/:id/score", async (req, res) => {
  try {
    const { finalScoreHome, finalScoreAway, result, quarterScores } = req.body;
    
    const updates = {};
    if (finalScoreHome !== undefined) updates.finalScoreHome = finalScoreHome;
    if (finalScoreAway !== undefined) updates.finalScoreAway = finalScoreAway;
    if (result) updates.result = result;
    if (quarterScores) updates.quarterScores = quarterScores;
    
    const game = await SchoolGame.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }
    
    res.json({ success: true, game });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/schools/games/:id/live
 * Mark game as live / offline
 */
router.patch("/games/:id/live", async (req, res) => {
  try {
    const { isLive } = req.body;
    
    const updates = { isLive: !!isLive };
    if (isLive) {
      updates.liveStartedAt = new Date();
    } else {
      updates.liveEndedAt = new Date();
    }
    
    const game = await SchoolGame.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }
    
    // Update station live status
    await SchoolStation.findByIdAndUpdate(game.schoolStationId, {
      $set: { isLive: !!isLive },
    });
    
    res.json({ success: true, game });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/schools/games/:id
 * Update a game
 */
router.patch("/games/:id", async (req, res) => {
  try {
    const game = await SchoolGame.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }
    
    res.json({ success: true, game });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/schools/games/:id
 * Delete a game
 */
router.delete("/games/:id", async (req, res) => {
  try {
    const game = await SchoolGame.findByIdAndDelete(req.params.id);
    
    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }
    
    res.json({ success: true, message: "Game deleted", deletedGame: { _id: game._id, opponent: game.opponent } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// SCHOOL EVENTS
// =====================================================

/**
 * POST /api/schools/events
 * Create a new event entry
 */
router.post("/events", async (req, res) => {
  try {
    const {
      schoolStationId,
      title,
      type,
      eventDate,
      eventTime,
      venue,
      description,
      videoUrl,
      thumbnailUrl,
      programUrl,
    } = req.body;

    if (!schoolStationId || !title || !eventDate) {
      return res.status(400).json({ 
        success: false, 
        error: "schoolStationId, title, and eventDate are required" 
      });
    }

    const event = await SchoolEvent.create({
      schoolStationId,
      title,
      type: type || "other",
      eventDate: new Date(eventDate),
      eventTime,
      venue,
      description,
      videoUrl,
      thumbnailUrl,
      programUrl,
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error("[School] Error creating event:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/schools/events
 * List events
 */
router.get("/events", async (req, res) => {
  try {
    const { schoolStationId, type, upcoming, replays, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (schoolStationId) query.schoolStationId = schoolStationId;
    if (type) query.type = type;
    if (upcoming === "true") {
      query.eventDate = { $gte: new Date() };
    }
    if (replays === "true") {
      query.isReplayAvailable = true;
    }
    
    const events = await SchoolEvent.find(query)
      .populate("schoolStationId", "name slug logoUrl")
      .sort({ eventDate: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();
    
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/schools/events/:id/live
 * Mark event as live / offline
 */
router.patch("/events/:id/live", async (req, res) => {
  try {
    const { isLive } = req.body;
    
    const updates = { isLive: !!isLive };
    if (isLive) {
      updates.liveStartedAt = new Date();
    } else {
      updates.liveEndedAt = new Date();
    }
    
    const event = await SchoolEvent.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    
    // Update station live status
    await SchoolStation.findByIdAndUpdate(event.schoolStationId, {
      $set: { isLive: !!isLive },
    });
    
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/schools/events/:id
 * Update an event
 */
router.patch("/events/:id", async (req, res) => {
  try {
    const event = await SchoolEvent.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/schools/events/:id
 * Delete an event
 */
router.delete("/events/:id", async (req, res) => {
  try {
    await SchoolEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// WEBHOOKS FOR LIVE STATUS
// =====================================================

/**
 * POST /api/schools/webhook/stream-start
 * Called when a stream starts
 */
router.post("/webhook/stream-start", async (req, res) => {
  try {
    const { streamKey } = req.body;
    
    const station = await SchoolStation.findOne({ streamKey });
    if (!station) {
      return res.status(404).json({ success: false, error: "Invalid stream key" });
    }
    
    station.isLive = true;
    await station.save();
    
    console.log(`[School] Station "${station.name}" went LIVE`);
    
    res.json({ success: true, stationId: station._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/schools/webhook/stream-end
 * Called when a stream ends
 */
router.post("/webhook/stream-end", async (req, res) => {
  try {
    const { streamKey } = req.body;
    
    const station = await SchoolStation.findOne({ streamKey });
    if (!station) {
      return res.status(404).json({ success: false, error: "Invalid stream key" });
    }
    
    station.isLive = false;
    await station.save();
    
    // End any live games/events
    await SchoolGame.updateMany(
      { schoolStationId: station._id, isLive: true },
      { $set: { isLive: false, liveEndedAt: new Date() } }
    );
    
    await SchoolEvent.updateMany(
      { schoolStationId: station._id, isLive: true },
      { $set: { isLive: false, liveEndedAt: new Date() } }
    );
    
    console.log(`[School] Station "${station.name}" went OFFLINE`);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;


