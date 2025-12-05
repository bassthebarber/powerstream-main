// backend/src/domain/repositories/tv.repository.js
// TV repository - data access layer for stations and streaming
import Station, { STATION_STATUS, STATION_CATEGORIES } from "../models/Station.model.js";
import StreamSession, { SESSION_STATUS } from "../models/StreamSession.model.js";
import mongoose from "mongoose";
import { logger } from "../../config/logger.js";

/**
 * TV repository
 * Handles all data access for TV stations and streaming
 */
const tvRepository = {
  // ============================================================
  // STATION OPERATIONS
  // ============================================================

  /**
   * Create a new station
   */
  async createStation(data) {
    const station = new Station(data);
    await station.save();
    return station.populate("owner", "name username avatarUrl");
  },

  /**
   * Get station by ID
   */
  async getStationById(stationId) {
    return Station.findById(stationId)
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Get station by slug
   */
  async getStationBySlug(slug) {
    return Station.findOne({ slug: slug.toLowerCase() })
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Get all stations
   */
  async getAllStations(options = {}) {
    const { 
      limit = 50, 
      skip = 0, 
      category, 
      network, 
      region,
      isLive,
      isPublic = true,
    } = options;

    const query = { isPublic };

    if (category) query.category = category;
    if (network) query.network = network;
    if (region) query.region = region;
    if (typeof isLive === "boolean") query.isLive = isLive;

    const stations = await Station.find(query)
      .sort({ viewerCount: -1, followersCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl");

    const total = await Station.countDocuments(query);

    return { stations, total, hasMore: skip + stations.length < total };
  },

  /**
   * Get live stations
   */
  async getLiveStations(options = {}) {
    const { limit = 20, category, network } = options;

    const query = { isLive: true, isPublic: true };
    if (category) query.category = category;
    if (network) query.network = network;

    return Station.find(query)
      .sort({ viewerCount: -1 })
      .limit(limit)
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Get featured stations
   */
  async getFeaturedStations(limit = 10) {
    return Station.find({ isFeatured: true, isPublic: true })
      .sort({ viewerCount: -1 })
      .limit(limit)
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Get stations by category
   */
  async getStationsByCategory(category, options = {}) {
    const { limit = 20, skip = 0 } = options;

    return Station.find({ category, isPublic: true })
      .sort({ viewerCount: -1, followersCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Get stations by network
   */
  async getStationsByNetwork(network, options = {}) {
    const { limit = 20, skip = 0 } = options;

    return Station.find({ network, isPublic: true })
      .sort({ viewerCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Get user's stations
   */
  async getUserStations(userId, options = {}) {
    const { limit = 20, skip = 0 } = options;

    return Station.find({ owner: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Update station
   */
  async updateStation(stationId, userId, updates) {
    return Station.findOneAndUpdate(
      { _id: stationId, owner: userId },
      { $set: updates },
      { new: true }
    ).populate("owner", "name username avatarUrl");
  },

  /**
   * Delete station
   */
  async deleteStation(stationId, userId) {
    return Station.findOneAndDelete({ _id: stationId, owner: userId });
  },

  /**
   * Set station live status
   */
  async setStationLive(stationId, isLive, streamUrl = null) {
    const updates = { 
      isLive, 
      status: isLive ? STATION_STATUS.LIVE : STATION_STATUS.READY,
    };

    if (streamUrl) updates.liveStreamUrl = streamUrl;
    if (!isLive) updates.viewerCount = 0;

    return Station.findByIdAndUpdate(stationId, { $set: updates }, { new: true });
  },

  /**
   * Update viewer count
   */
  async updateViewerCount(stationId, count) {
    const station = await Station.findById(stationId);
    if (!station) return null;

    station.viewerCount = count;
    station.totalViews += 1;
    if (count > station.peakViewers) {
      station.peakViewers = count;
    }

    await station.save();
    return station;
  },

  /**
   * Increment followers count
   */
  async incrementFollowers(stationId) {
    return Station.findByIdAndUpdate(
      stationId,
      { $inc: { followersCount: 1 } },
      { new: true }
    );
  },

  /**
   * Decrement followers count
   */
  async decrementFollowers(stationId) {
    return Station.findByIdAndUpdate(
      stationId,
      { $inc: { followersCount: -1 } },
      { new: true }
    );
  },

  /**
   * Search stations
   */
  async searchStations(query, options = {}) {
    const { limit = 20, skip = 0 } = options;

    return Station.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
      isPublic: true,
    })
      .sort({ viewerCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl");
  },

  // ============================================================
  // STREAM SESSION OPERATIONS
  // ============================================================

  /**
   * Create stream session
   */
  async createStreamSession(data) {
    const session = new StreamSession(data);
    await session.save();
    return session;
  },

  /**
   * Get stream session by ID
   */
  async getStreamSessionById(sessionId) {
    return StreamSession.findById(sessionId)
      .populate("userId", "name username avatarUrl")
      .populate("stationId", "name slug logoUrl");
  },

  /**
   * Get stream session by stream key
   */
  async getStreamSessionByKey(streamKey) {
    return StreamSession.findOne({
      streamKey,
      status: { $in: [SESSION_STATUS.PENDING, SESSION_STATUS.LIVE] },
    });
  },

  /**
   * Get active stream sessions
   */
  async getActiveSessions(options = {}) {
    const { limit = 50, stationId, category } = options;

    const query = { status: SESSION_STATUS.LIVE };
    if (stationId) query.stationId = stationId;
    if (category) query.category = category;

    return StreamSession.find(query)
      .sort({ viewerCount: -1 })
      .limit(limit)
      .populate("userId", "name username avatarUrl")
      .populate("stationId", "name slug logoUrl");
  },

  /**
   * Get user's stream sessions
   */
  async getUserStreamSessions(userId, options = {}) {
    const { limit = 20, status } = options;

    const query = { userId };
    if (status) query.status = status;

    return StreamSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  /**
   * Start stream session
   */
  async startStreamSession(sessionId) {
    return StreamSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          status: SESSION_STATUS.LIVE,
          startedAt: new Date(),
        },
      },
      { new: true }
    );
  },

  /**
   * End stream session
   */
  async endStreamSession(sessionId) {
    const session = await StreamSession.findById(sessionId);
    if (!session) return null;

    session.status = SESSION_STATUS.ENDED;
    session.endedAt = new Date();
    session.duration = Math.floor((session.endedAt - session.startedAt) / 1000);

    if (session.viewerCount > session.peakViewers) {
      session.peakViewers = session.viewerCount;
    }

    await session.save();
    return session;
  },

  /**
   * Update stream session viewers
   */
  async updateSessionViewers(sessionId, count) {
    const session = await StreamSession.findById(sessionId);
    if (!session) return null;

    session.viewerCount = count;
    session.totalViews += 1;
    if (count > session.peakViewers) {
      session.peakViewers = count;
    }

    await session.save();
    return session;
  },

  /**
   * Get TV guide (schedule)
   */
  async getTVGuide(options = {}) {
    const { date, network, limit = 100 } = options;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const query = {
      isPublic: true,
      "schedule.0": { $exists: true },
    };

    if (network) query.network = network;

    const stations = await Station.find(query)
      .select("name slug logoUrl schedule network")
      .limit(limit);

    // Format schedule data
    const guide = stations.map(station => ({
      station: {
        id: station._id,
        name: station.name,
        slug: station.slug,
        logoUrl: station.logoUrl,
        network: station.network,
      },
      schedule: station.schedule || [],
    }));

    return guide;
  },

  /**
   * Get station analytics
   */
  async getStationAnalytics(stationId, startDate, endDate) {
    const sessions = await StreamSession.aggregate([
      {
        $match: {
          stationId: new mongoose.Types.ObjectId(stationId),
          createdAt: { $gte: startDate, $lte: endDate },
          status: SESSION_STATUS.ENDED,
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
          totalViews: { $sum: "$totalViews" },
          avgViewers: { $avg: "$peakViewers" },
          maxViewers: { $max: "$peakViewers" },
          totalTips: { $sum: "$tipsAmount" },
        },
      },
    ]);

    return sessions[0] || {
      totalSessions: 0,
      totalDuration: 0,
      totalViews: 0,
      avgViewers: 0,
      maxViewers: 0,
      totalTips: 0,
    };
  },
};

export default tvRepository;

