// backend/controllers/streamController.js
// Golden TV Subsystem - Stream Controller
import Stream from '../models/Stream.js';
import Station from '../models/Station.js';

// Response helpers
const ok = (data, message) => ({ success: true, data, message });
const fail = (message, code) => ({ success: false, message, code });

/**
 * POST /api/stream/start
 * Body: { stationSlug, streamKey, liveUrl }
 */
export const startStream = async (req, res, next) => {
  try {
    const { stationSlug, streamKey, liveUrl } = req.body;

    if (!stationSlug || !streamKey) {
      return res.status(400).json(fail('stationSlug and streamKey are required', 'MISSING_FIELDS'));
    }

    const station = await Station.findOne({ slug: stationSlug });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    // Mark any existing streams as not live
    await Stream.updateMany(
      { station: station._id, isLive: true },
      { isLive: false, endedAt: new Date() }
    );

    const stream = await Stream.create({
      station: station._id,
      streamKey,
      liveUrl,
      isLive: true,
      startedAt: new Date()
    });

    // Emit socket event for live stream start
    const io = req.app.get('io');
    if (io) {
      io.of('/stations').to(`station:${stationSlug}`).emit('stream:started', {
        stationSlug,
        stream
      });
    }

    return res.status(201).json(ok(stream, 'Stream started'));
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/stream/stop
 * Body: { stationSlug }
 */
export const stopStream = async (req, res, next) => {
  try {
    const { stationSlug } = req.body;

    if (!stationSlug) {
      return res.status(400).json(fail('stationSlug is required', 'MISSING_FIELDS'));
    }

    const station = await Station.findOne({ slug: stationSlug });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    const stream = await Stream.findOne({ station: station._id, isLive: true }).sort({
      startedAt: -1
    });

    if (!stream) {
      return res.json(ok(null, 'No active stream'));
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    await stream.save();

    // Emit socket event for live stream stop
    const io = req.app.get('io');
    if (io) {
      io.of('/stations').to(`station:${stationSlug}`).emit('stream:stopped', {
        stationSlug,
        stream
      });
    }

    return res.json(ok(stream, 'Stream stopped'));
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/stream/station/:slug/current
 */
export const getCurrentStreamForStation = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const station = await Station.findOne({ slug });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    const stream = await Stream.findOne({ station: station._id, isLive: true })
      .sort({ startedAt: -1 })
      .lean();

    return res.json(ok(stream || null));
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/stream/live
 * Get all currently live streams across all stations
 */
export const getAllLiveStreams = async (req, res, next) => {
  try {
    const streams = await Stream.find({ isLive: true })
      .populate('station', 'name slug logoUrl')
      .sort({ startedAt: -1 })
      .lean();

    return res.json(ok(streams));
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/stream/history/:slug
 * Get stream history for a station
 */
export const getStreamHistory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { limit = 20 } = req.query;

    const station = await Station.findOne({ slug });
    if (!station) {
      return res.status(404).json(fail('Station not found', 'STATION_NOT_FOUND'));
    }

    const streams = await Stream.find({ station: station._id })
      .sort({ startedAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.json(ok(streams));
  } catch (err) {
    return next(err);
  }
};
