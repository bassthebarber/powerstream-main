// backend/controllers/tvController.js
// Golden TV Subsystem - TV Controller
import Station from '../models/Station.js';
import Stream from '../models/Stream.js';
import VideoAsset from '../models/VideoAsset.js';
import TVShow from '../models/TVShow.js';

// Response helpers
const ok = (data, message) => ({ success: true, data, message });
const fail = (message, code) => ({ success: false, message, code });

/**
 * GET /api/tv/stations
 * List all active stations (for TV Guide / Navigation).
 */
export const listStations = async (req, res, next) => {
  try {
    // List all public stations (isPublic defaults to true in domain model)
    const stations = await Station.find({ isPublic: { $ne: false } }).sort({ name: 1 });
    return res.json(ok(stations));
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tv/stations/:slug
 * Get full station info + live status + featured videos.
 */
export const getStationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    // Use same filter as listStations (isPublic defaults to true in domain model)
    const station = await Station.findOne({ slug, isPublic: { $ne: false } });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    const liveStream = await Stream.findOne({ station: station._id, isLive: true })
      .sort({ startedAt: -1 })
      .lean();

    const featuredVideos = await VideoAsset.find({ station: station._id })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(20)
      .lean();

    const now = new Date();
    const guide = await TVShow.find({
      station: station._id,
      endsAt: { $gte: now }
    })
      .sort({ startsAt: 1 })
      .limit(20)
      .lean();

    return res.json(
      ok({
        station,
        liveStream,
        featuredVideos,
        guide
      })
    );
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/tv/guide
 * Global TV Guide across stations.
 */
export const getGlobalGuide = async (req, res, next) => {
  try {
    const now = new Date();
    const shows = await TVShow.find({ endsAt: { $gte: now } })
      .populate('station', 'name slug logoUrl')
      .sort({ startsAt: 1 })
      .limit(100)
      .lean();

    return res.json(ok(shows));
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/vod
 * Compatibility endpoint for VOD library:
 *   /api/vod?limit=20&stationId=civic-connect
 * stationId may be a slug ("civic-connect") or a Mongo ObjectId.
 */
export const getVOD = async (req, res, next) => {
  try {
    let { stationId, limit = 20 } = req.query;
    limit = Number(limit) || 20;

    let stationFilter = {};

    if (stationId) {
      // Try slug first
      let station = await Station.findOne({ slug: stationId });
      if (!station) {
        // Try as ObjectId
        try {
          station = await Station.findById(stationId);
        } catch {
          // ignore invalid ObjectId
        }
      }

      if (station) {
        stationFilter.station = station._id;
      } else {
        // If stationId is invalid, return empty list gracefully
        return res.json(ok([]));
      }
    }

    const videos = await VideoAsset.find(stationFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json(ok(videos));
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/tv/stations (Admin only)
 * Create a new station
 */
export const createStation = async (req, res, next) => {
  try {
    const { name, slug, logoUrl, theme, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json(fail('Name and slug are required', 'MISSING_FIELDS'));
    }

    const existing = await Station.findOne({ slug });
    if (existing) {
      return res.status(409).json(fail('Station with this slug already exists', 'DUPLICATE_SLUG'));
    }

    const station = await Station.create({
      name,
      slug,
      logoUrl,
      theme,
      description,
      owner: req.user?.id,
      isActive: true
    });

    return res.status(201).json(ok(station, 'Station created'));
  } catch (err) {
    return next(err);
  }
};

/**
 * PUT /api/tv/stations/:slug (Admin only)
 * Update a station
 */
export const updateStation = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updates = req.body;

    const station = await Station.findOneAndUpdate(
      { slug },
      { $set: updates },
      { new: true }
    );

    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    return res.json(ok(station, 'Station updated'));
  } catch (err) {
    return next(err);
  }
};
