// backend/src/services/tv.service.js
// Distributed TV Broadcast Engine Service
import mongoose from "mongoose";
import { logger } from "../config/logger.js";
import eventsService from "./events.service.js";
import { ENTITY_TYPES } from "../domain/models/Event.model.js";

// Import existing models (from legacy location)
let Station, StreamSession, Show;

const loadModels = async () => {
  if (!Station) {
    try {
      Station = (await import("../../models/Station.js")).default;
    } catch {
      Station = (await import("../../models/StationModel.js")).default;
    }
  }
  if (!StreamSession) {
    try {
      StreamSession = (await import("../../models/StreamModel.js")).default;
    } catch {
      StreamSession = (await import("../../models/LiveSession.js")).default;
    }
  }
  if (!Show) {
    try {
      Show = (await import("../../models/Show.js")).default;
    } catch {
      Show = null; // Show model may not exist yet
    }
  }
};

/**
 * TV Service
 * Manages distributed TV stations, live streams, and show schedules
 */
const tvService = {
  /**
   * Create a new station
   */
  async createStation(userId, payload) {
    await loadModels();
    
    const { name, slug, description, category, logoUrl, bannerUrl } = payload;
    
    // Check if slug is available
    const existing = await Station.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      throw new Error("Station slug already taken");
    }
    
    const station = await Station.create({
      name,
      slug: slug.toLowerCase(),
      description,
      category,
      logoUrl,
      bannerUrl,
      owner: userId,
      isActive: true,
      createdAt: new Date(),
    });
    
    logger.info(`Station created: ${name} by user ${userId}`);
    
    return station;
  },
  
  /**
   * Update station
   */
  async updateStation(stationId, userId, updates) {
    await loadModels();
    
    const station = await Station.findById(stationId);
    if (!station) {
      throw new Error("Station not found");
    }
    
    // Check ownership
    if (station.owner.toString() !== userId.toString()) {
      throw new Error("Not authorized to update this station");
    }
    
    const allowedUpdates = ["name", "description", "category", "logoUrl", "bannerUrl", "isActive"];
    const filteredUpdates = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }
    
    Object.assign(station, filteredUpdates);
    await station.save();
    
    return station;
  },
  
  /**
   * Get station by ID
   */
  async getStationById(stationId) {
    await loadModels();
    return Station.findById(stationId).populate("owner", "name avatarUrl").lean();
  },
  
  /**
   * Get station by slug
   */
  async getStationBySlug(slug) {
    await loadModels();
    return Station.findOne({ slug: slug.toLowerCase() }).populate("owner", "name avatarUrl").lean();
  },
  
  /**
   * Get all stations with filters
   */
  async getStations(filters = {}) {
    await loadModels();
    
    const query = { isActive: true };
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.ownerId) {
      query.owner = filters.ownerId;
    }
    
    const stations = await Station.find(query)
      .populate("owner", "name avatarUrl")
      .sort({ createdAt: -1 })
      .lean();
    
    return stations;
  },
  
  /**
   * Get featured stations
   */
  async getFeaturedStations(limit = 10) {
    await loadModels();
    
    return Station.find({ isActive: true, isFeatured: true })
      .populate("owner", "name avatarUrl")
      .limit(limit)
      .lean();
  },
  
  /**
   * Get station guide (all stations with their current/upcoming shows)
   */
  async getStationGuide(filters = {}) {
    await loadModels();
    
    const stations = await this.getStations(filters);
    
    const now = new Date();
    
    // Enhance each station with current/upcoming show info
    const enhancedStations = await Promise.all(
      stations.map(async (station) => {
        const currentShow = await this.getLiveOrCurrentShow(station._id, now);
        const upcomingShows = Show ? await Show.find({
          stationId: station._id,
          startTime: { $gt: now },
        })
          .sort({ startTime: 1 })
          .limit(3)
          .lean() : [];
        
        return {
          ...station,
          currentShow,
          upcomingShows,
        };
      })
    );
    
    return enhancedStations;
  },
  
  /**
   * Create a show schedule
   */
  async createShowSchedule(stationId, payload) {
    await loadModels();
    
    if (!Show) {
      // Create Show model if it doesn't exist
      const ShowSchema = new mongoose.Schema({
        stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
        title: { type: String, required: true },
        description: String,
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        mediaAssetId: { type: mongoose.Schema.Types.ObjectId },
        isLive: { type: Boolean, default: false },
        thumbnailUrl: String,
        category: String,
      }, { timestamps: true });
      
      Show = mongoose.model("Show", ShowSchema);
    }
    
    const show = await Show.create({
      stationId,
      ...payload,
    });
    
    return show;
  },
  
  /**
   * Get current or live show for a station
   */
  async getLiveOrCurrentShow(stationId, now = new Date()) {
    await loadModels();
    
    // Check for live stream first
    if (StreamSession) {
      const liveStream = await StreamSession.findOne({
        stationId,
        status: "live",
      }).lean();
      
      if (liveStream) {
        return {
          ...liveStream,
          type: "live",
        };
      }
    }
    
    // Check for scheduled show
    if (Show) {
      const currentShow = await Show.findOne({
        stationId,
        startTime: { $lte: now },
        endTime: { $gte: now },
      }).lean();
      
      if (currentShow) {
        return {
          ...currentShow,
          type: "scheduled",
        };
      }
    }
    
    return null;
  },
  
  /**
   * Get live streams
   */
  async getLiveStreams() {
    await loadModels();
    
    if (!StreamSession) return [];
    
    return StreamSession.find({ status: "live" })
      .populate("stationId", "name slug logoUrl")
      .populate("userId", "name avatarUrl")
      .lean();
  },
  
  /**
   * Start a live stream
   */
  async startLiveStream(userId, stationId, streamData) {
    await loadModels();
    
    // Verify station ownership
    const station = await Station.findById(stationId);
    if (!station) {
      throw new Error("Station not found");
    }
    
    if (station.owner.toString() !== userId.toString()) {
      throw new Error("Not authorized to stream on this station");
    }
    
    // Check if already live
    const existingStream = await StreamSession.findOne({
      stationId,
      status: "live",
    });
    
    if (existingStream) {
      throw new Error("Station already has an active stream");
    }
    
    // Create stream session
    const stream = await StreamSession.create({
      stationId,
      userId,
      title: streamData.title || "Live Stream",
      description: streamData.description,
      status: "live",
      startedAt: new Date(),
      viewerCount: 0,
    });
    
    logger.info(`Live stream started on station ${station.name} by user ${userId}`);
    
    return stream;
  },
  
  /**
   * End a live stream
   */
  async endLiveStream(streamId, userId) {
    await loadModels();
    
    const stream = await StreamSession.findById(streamId);
    if (!stream) {
      throw new Error("Stream not found");
    }
    
    if (stream.userId.toString() !== userId.toString()) {
      throw new Error("Not authorized to end this stream");
    }
    
    stream.status = "ended";
    stream.endedAt = new Date();
    await stream.save();
    
    logger.info(`Live stream ended: ${streamId}`);
    
    return stream;
  },
  
  /**
   * Join a live stream (increment viewer count)
   */
  async joinLiveStream(streamId, userId) {
    await loadModels();
    
    const stream = await StreamSession.findByIdAndUpdate(
      streamId,
      { $inc: { viewerCount: 1 } },
      { new: true }
    );
    
    if (stream) {
      await eventsService.logEvent(userId, "stream_join", ENTITY_TYPES.STREAM, streamId);
    }
    
    return stream;
  },
  
  /**
   * Leave a live stream (decrement viewer count)
   */
  async leaveLiveStream(streamId, userId) {
    await loadModels();
    
    const stream = await StreamSession.findByIdAndUpdate(
      streamId,
      { $inc: { viewerCount: -1 } },
      { new: true }
    );
    
    if (stream) {
      await eventsService.logEvent(userId, "stream_leave", ENTITY_TYPES.STREAM, streamId);
    }
    
    return stream;
  },
  
  /**
   * Get station categories
   */
  async getCategories() {
    await loadModels();
    
    const categories = await Station.distinct("category", { isActive: true });
    return categories.filter(Boolean);
  },
  
  /**
   * Get stations by owner
   */
  async getStationsByOwner(userId) {
    await loadModels();
    
    return Station.find({ owner: userId }).lean();
  },
  
  /**
   * Delete a station
   */
  async deleteStation(stationId, userId) {
    await loadModels();
    
    const station = await Station.findById(stationId);
    if (!station) {
      throw new Error("Station not found");
    }
    
    if (station.owner.toString() !== userId.toString()) {
      throw new Error("Not authorized to delete this station");
    }
    
    // Soft delete
    station.isActive = false;
    station.deletedAt = new Date();
    await station.save();
    
    logger.info(`Station deleted: ${station.name} by user ${userId}`);
    
    return true;
  },

  // ============================================================
  // Controller-compatible method aliases
  // ============================================================

  /**
   * Get live stations (alias for getLiveStreams with station data)
   */
  async getLiveStations(options = {}) {
    await loadModels();
    
    const liveStreams = await this.getLiveStreams();
    
    // Return stations that are currently live
    const liveStationIds = liveStreams.map(s => s.stationId?._id || s.stationId);
    
    if (liveStationIds.length === 0) {
      return [];
    }
    
    return Station.find({
      _id: { $in: liveStationIds },
      isActive: true,
    })
      .populate("owner", "name avatarUrl")
      .lean();
  },

  /**
   * Get TV guide (wrapper for getStationGuide)
   */
  async getTVGuide(options = {}) {
    const { date, network, category } = options;
    const filters = {};
    
    if (network) filters.network = network;
    if (category) filters.category = category;
    
    return this.getStationGuide(filters);
  },

  /**
   * Get stream key for a station
   */
  async getStreamKey(stationId, userId) {
    await loadModels();
    
    const station = await Station.findById(stationId);
    if (!station) return null;
    
    if (station.owner.toString() !== userId.toString()) {
      return null;
    }
    
    // Return existing stream key or generate one
    if (!station.streamKey) {
      station.streamKey = `sk_${stationId}_${Date.now().toString(36)}`;
      await station.save();
    }
    
    return station.streamKey;
  },

  /**
   * Regenerate stream key for a station
   */
  async regenerateStreamKey(stationId, userId) {
    await loadModels();
    
    const station = await Station.findById(stationId);
    if (!station) return null;
    
    if (station.owner.toString() !== userId.toString()) {
      return null;
    }
    
    station.streamKey = `sk_${stationId}_${Date.now().toString(36)}`;
    await station.save();
    
    return station.streamKey;
  },

  /**
   * Start a stream on a station (wrapper for startLiveStream)
   */
  async startStream(stationId, userId, data = {}) {
    return this.startLiveStream(userId, stationId, data);
  },

  /**
   * End a stream on a station
   */
  async endStream(stationId, userId) {
    await loadModels();
    
    // Find active stream for this station
    const stream = await StreamSession.findOne({
      stationId,
      status: "live",
    });
    
    if (!stream) {
      return null;
    }
    
    return this.endLiveStream(stream._id, userId);
  },

  /**
   * Get user's stations (wrapper for getStationsByOwner)
   */
  async getUserStations(userId) {
    return this.getStationsByOwner(userId);
  },
};

export default tvService;

