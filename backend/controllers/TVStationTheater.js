// backend/controllers/TVStationTheater.js

import Station from "../models/Stationmodel.js";
import Show from "../models/Show.js";
import MediaFile from "../models/MediaFilemodel.js";
import logUplink from "../logs/logUplink.js";

/**
 * @desc Get currently playing content for a station
 * @route GET /api/station/theater/now/:stationId
 */
export const getNowPlaying = async (req, res) => {
  try {
    const { stationId } = req.params;

    const now = new Date();
    const show = await Show.findOne({
      station: stationId,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate('media');

    if (!show) {
      return res.status(404).json({ error: 'No active show currently airing' });
    }

    logUplink('TVStationTheater', 'info', `Now playing on ${stationId}: ${show.title}`);
    res.status(200).json(show);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current show' });
  }
};

/**
 * @desc Get upcoming content for a station
 * @route GET /api/station/theater/upcoming/:stationId
 */
export const getUpcomingShows = async (req, res) => {
  try {
    const { stationId } = req.params;
    const now = new Date();

    const upcoming = await Show.find({
      station: stationId,
      startTime: { $gt: now },
    }).sort({ startTime: 1 });

    res.status(200).json(upcoming);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch upcoming shows' });
  }
};

/**
 * @desc Get full media catalog for a station (recorded library)
 * @route GET /api/station/theater/catalog/:stationId
 */
export const getMediaCatalog = async (req, res) => {
  try {
    const { stationId } = req.params;

    const media = await MediaFile.find({ station: stationId }).sort({ createdAt: -1 });

    res.status(200).json(media);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load media catalog' });
  }
};
