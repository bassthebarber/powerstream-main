// backend/controllers/stationController.js
// Golden TV Subsystem - Station Controller
import Station from '../models/Station.js';
import Stream from '../models/Stream.js';
import VideoAsset from '../models/VideoAsset.js';

// Response helpers
const ok = (data, message) => ({ success: true, data, message });
const fail = (message, code) => ({ success: false, message, code });

/**
 * GET /api/stations/:slug/videos
 * VOD shelf for a specific station.
 */
export const getStationVideos = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { limit = 50, offset = 0, category } = req.query;

    const station = await Station.findOne({ slug, isActive: true });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    const filter = { station: station._id };
    if (category) {
      filter.category = category;
    }

    const videos = await VideoAsset.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    const total = await VideoAsset.countDocuments(filter);

    return res.json(ok({ videos, total, limit: Number(limit), offset: Number(offset) }));
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/stations/:slug/live
 * Return live stream info for station.
 */
export const getStationLive = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const station = await Station.findOne({ slug, isActive: true });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    const liveStream = await Stream.findOne({ station: station._id, isLive: true })
      .sort({ startedAt: -1 })
      .lean();

    return res.json(ok(liveStream || null));
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/stations/:slug
 * Get basic station info
 */
export const getStation = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const station = await Station.findOne({ slug, isActive: true });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    return res.json(ok(station));
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/stations/:slug/videos
 * Upload a video to a station
 */
export const uploadStationVideo = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, description, videoUrl, thumbnailUrl, category, isFeatured } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json(fail('Title and videoUrl are required', 'MISSING_FIELDS'));
    }

    const station = await Station.findOne({ slug, isActive: true });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    const video = await VideoAsset.create({
      uploader: req.user?.id,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      station: station._id,
      category: category || 'clip',
      isFeatured: isFeatured || false
    });

    return res.status(201).json(ok(video, 'Video uploaded'));
  } catch (err) {
    return next(err);
  }
};
