// backend/routes/noLimitForeverRoutes.js
// No Limit Forever TV - Global Flagship Network API Routes

import express from "express";
import NoLimitForever from "../models/NoLimitForeverModel.js";
import { generateStreamKey } from "../utils/streamKeyGenerator.js";

const router = express.Router();

// =====================================================
// STATION MANAGEMENT
// =====================================================

/**
 * POST /api/nlf/create
 * Initialize the No Limit Forever TV station
 */
router.post("/create", async (req, res) => {
  try {
    // Check if station already exists
    let station = await NoLimitForever.findOne({ slug: "nlf-tv" });
    
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

    // Create station with default content
    station = await NoLimitForever.create({
      name: "No Limit Forever TV",
      slug: "nlf-tv",
      description: "Global flagship station for exclusive premieres & broadcasts",
      tagline: "The Official Global Broadcast Network of the No Limit Empire",
      streamKey,
      rtmpUrl: rtmpBase,
      hlsUrl: `${hlsBase}/${streamKey}/index.m3u8`,
      logoUrl: "/logos/nolimit-forever-logo.png",
      primaryColor: "#FFD700",
      secondaryColor: "#000000",
      // Default broadcasts
      broadcasts: [
        {
          title: "No Limit Forever: The Concert Experience",
          description: "Exclusive concert footage from the No Limit Forever World Tour",
          type: "concert",
          isPremiere: false,
          isExclusive: true,
          featured: true,
          artist: "No Limit Artists",
          tags: ["concert", "live", "exclusive"],
          thumbnailUrl: "/thumbnails/nlf-concert-placeholder.jpg",
        },
        {
          title: "Welcome to No Limit Forever TV",
          description: "Introduction to the official global broadcast network of the No Limit Empire",
          type: "special",
          isPremiere: true,
          isExclusive: true,
          featured: true,
          tags: ["welcome", "premiere", "exclusive"],
          thumbnailUrl: "/thumbnails/nlf-welcome-placeholder.jpg",
        },
        {
          title: "No Limit Documentary: The Rise",
          description: "An exclusive documentary chronicling the rise of the No Limit Empire",
          type: "documentary",
          isPremiere: false,
          isExclusive: true,
          featured: false,
          artist: "No Limit Records",
          tags: ["documentary", "exclusive", "history"],
          thumbnailUrl: "/thumbnails/nlf-documentary-placeholder.jpg",
        },
      ],
      // Default schedule
      schedule: [
        {
          title: "Morning Playlist",
          description: "Start your day with classic No Limit hits",
          startTime: new Date(new Date().setHours(6, 0, 0, 0)),
          type: "rerun",
        },
        {
          title: "Afternoon Premieres",
          description: "New exclusive content drops",
          startTime: new Date(new Date().setHours(12, 0, 0, 0)),
          type: "premiere",
        },
        {
          title: "Prime Time Live",
          description: "Live broadcasts and exclusive events",
          startTime: new Date(new Date().setHours(20, 0, 0, 0)),
          type: "live",
        },
      ],
      // Default events
      events: [
        {
          title: "No Limit Forever Launch Event",
          description: "Official launch of the No Limit Forever TV global network",
          eventDate: new Date(),
          type: "special",
          isVirtual: true,
          willStream: true,
        },
      ],
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
    console.error("[NLF] Error creating station:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/station
 * Get station info
 */
router.get("/station", async (req, res) => {
  try {
    let station = await NoLimitForever.findOne({ slug: "nlf-tv" }).lean();
    
    if (!station) {
      // Auto-create if doesn't exist
      const streamKey = generateStreamKey("nlf");
      const rtmpBase = process.env.RTMP_BASE_URL || "rtmp://localhost:1935/live";
      const hlsBase = process.env.HLS_BASE_URL || "http://localhost:8000/live";
      
      station = await NoLimitForever.create({
        name: "No Limit Forever TV",
        slug: "nlf-tv",
        description: "Global flagship station for exclusive premieres & broadcasts",
        tagline: "The Official Global Broadcast Network of the No Limit Empire",
        streamKey,
        rtmpUrl: rtmpBase,
        hlsUrl: `${hlsBase}/${streamKey}/index.m3u8`,
      });
      station = station.toObject();
    }

    // Remove stream key from public response
    const publicStation = { ...station };
    delete publicStation.streamKey;

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
    const station = await NoLimitForever.findOne({ slug: "nlf-tv" }).lean();
    
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
// VIDEOS / BROADCASTS
// =====================================================

/**
 * POST /api/nlf/upload
 * Upload exclusive video
 */
router.post("/upload", async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      videoUrl,
      hlsUrl,
      thumbnailUrl,
      duration,
      isPremiere,
      isExclusive,
      featured,
      artist,
      tags,
      airDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    const station = await NoLimitForever.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    const broadcast = {
      title,
      description,
      type: type || "premiere",
      videoUrl,
      hlsUrl,
      thumbnailUrl,
      duration: duration || 0,
      isPremiere: isPremiere !== false,
      isExclusive: isExclusive !== false,
      featured: !!featured,
      artist,
      tags: tags || [],
      airDate: airDate ? new Date(airDate) : new Date(),
    };

    station.broadcasts.push(broadcast);
    await station.save();

    const newBroadcast = station.broadcasts[station.broadcasts.length - 1];

    res.status(201).json({ success: true, broadcast: newBroadcast });
  } catch (err) {
    console.error("[NLF] Error uploading video:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/videos
 * List broadcasts/videos
 */
router.get("/videos", async (req, res) => {
  try {
    const { type, featured, exclusive, limit = 50, skip = 0 } = req.query;

    const station = await NoLimitForever.findOne({ slug: "nlf-tv" }).lean();
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    let videos = station.broadcasts || [];

    // Apply filters
    if (type) {
      videos = videos.filter(v => v.type === type);
    }
    if (featured === "true") {
      videos = videos.filter(v => v.featured);
    }
    if (exclusive === "true") {
      videos = videos.filter(v => v.isExclusive);
    }

    // Sort by createdAt descending
    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = videos.length;
    videos = videos.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.json({ 
      success: true, 
      videos, 
      total,
      categories: {
        premieres: station.broadcasts.filter(v => v.type === "premiere").length,
        concerts: station.broadcasts.filter(v => v.type === "concert").length,
        documentaries: station.broadcasts.filter(v => v.type === "documentary").length,
        interviews: station.broadcasts.filter(v => v.type === "interview").length,
        specials: station.broadcasts.filter(v => v.type === "special").length,
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
    const station = await NoLimitForever.findOne({ slug: "nlf-tv" }).lean();
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    const video = station.broadcasts.find(b => b._id.toString() === req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    // Increment view count
    await NoLimitForever.updateOne(
      { slug: "nlf-tv", "broadcasts._id": req.params.id },
      { $inc: { "broadcasts.$.viewCount": 1, totalViews: 1 } }
    );

    res.json({ success: true, video });
  } catch (err) {
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
      broadcastId,
      artist,
      recurring,
      recurrencePattern,
    } = req.body;

    if (!title || !startTime) {
      return res.status(400).json({ success: false, error: "Title and startTime are required" });
    }

    const station = await NoLimitForever.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    const scheduleItem = {
      title,
      description,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      type: type || "premiere",
      broadcastId: broadcastId || null,
      artist,
      recurring: !!recurring,
      recurrencePattern,
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

    const station = await NoLimitForever.findOne({ slug: "nlf-tv" }).lean();
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

    // Sort by start time
    schedule.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// EVENTS
// =====================================================

/**
 * POST /api/nlf/events
 * Add event
 */
router.post("/events", async (req, res) => {
  try {
    const {
      title,
      description,
      eventDate,
      venue,
      type,
      thumbnailUrl,
      ticketUrl,
      isVirtual,
      willStream,
      artists,
    } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({ success: false, error: "Title and eventDate are required" });
    }

    const station = await NoLimitForever.findOne({ slug: "nlf-tv" });
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    const event = {
      title,
      description,
      eventDate: new Date(eventDate),
      venue,
      type: type || "special",
      thumbnailUrl,
      ticketUrl,
      isVirtual: !!isVirtual,
      willStream: willStream !== false,
      artists: artists || [],
    };

    station.events.push(event);
    await station.save();

    const newEvent = station.events[station.events.length - 1];

    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    console.error("[NLF] Error adding event:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nlf/events
 * Get events
 */
router.get("/events", async (req, res) => {
  try {
    const { upcoming } = req.query;

    const station = await NoLimitForever.findOne({ slug: "nlf-tv" }).lean();
    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    let events = station.events || [];

    if (upcoming === "true") {
      events = events.filter(e => new Date(e.eventDate) >= new Date());
    }

    // Sort by event date
    events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// LIVE STATUS
// =====================================================

/**
 * PATCH /api/nlf/live
 * Set live status
 */
router.patch("/live", async (req, res) => {
  try {
    const { isLive, currentBroadcastId } = req.body;

    const station = await NoLimitForever.findOneAndUpdate(
      { slug: "nlf-tv" },
      { 
        $set: { 
          isLive: !!isLive,
          currentBroadcast: currentBroadcastId || null,
        } 
      },
      { new: true }
    );

    if (!station) {
      return res.status(404).json({ success: false, error: "Station not found" });
    }

    console.log(`[NLF] Station ${isLive ? "went LIVE" : "went OFFLINE"}`);

    res.json({ success: true, isLive: station.isLive });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/nlf/webhook/stream-start
 * Webhook for stream start
 */
router.post("/webhook/stream-start", async (req, res) => {
  try {
    const { streamKey } = req.body;

    const station = await NoLimitForever.findOne({ streamKey });
    if (!station) {
      return res.status(404).json({ success: false, error: "Invalid stream key" });
    }

    station.isLive = true;
    await station.save();

    console.log("[NLF] No Limit Forever TV went LIVE");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/nlf/webhook/stream-end
 * Webhook for stream end
 */
router.post("/webhook/stream-end", async (req, res) => {
  try {
    const { streamKey } = req.body;

    const station = await NoLimitForever.findOne({ streamKey });
    if (!station) {
      return res.status(404).json({ success: false, error: "Invalid stream key" });
    }

    station.isLive = false;
    station.currentBroadcast = null;
    await station.save();

    console.log("[NLF] No Limit Forever TV went OFFLINE");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;



