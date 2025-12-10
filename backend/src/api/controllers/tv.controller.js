// backend/src/api/controllers/tv.controller.js
// Canonical TV controller - handles stations, streams, shows
import tvService from "../../services/tv.service.js";
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

const tvController = {
  /**
   * GET /api/tv/stations
   * Get all stations (with optional filters)
   */
  async getStations(req, res, next) {
    try {
      const {
        category,
        network,
        region,
        isLive,
        page = 1,
        limit = 20,
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit) || 20, 50),
      };

      const filters = {};
      if (category) filters.category = category;
      if (network) filters.network = network;
      if (region) filters.region = region;
      if (isLive !== undefined) filters.isLive = isLive === "true";

      const stations = await tvService.getStations(filters, options);

      res.json({
        success: true,
        stations,
        ...options,
      });
    } catch (error) {
      logger.error("Error getting stations:", error);
      next(error);
    }
  },

  /**
   * GET /api/tv/stations/:slug
   * Get station by slug
   */
  async getStation(req, res, next) {
    try {
      const { slug } = req.params;
      const viewerId = req.user?.id;

      const station = await tvService.getStationBySlug(slug);

      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }

      // Log view event
      if (viewerId) {
        await eventsService.logView(viewerId, "station", station._id, {
          slug,
          isLive: station.isLive,
        }).catch(err => logger.warn("Failed to log station view:", err.message));
      }

      res.json({ success: true, station });
    } catch (error) {
      logger.error("Error getting station:", error);
      next(error);
    }
  },

  /**
   * POST /api/tv/stations
   * Create a new station
   */
  async createStation(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        name,
        description,
        category,
        logoUrl,
        network,
        region,
        isPublic,
      } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Station name is required" });
      }

      const station = await tvService.createStation(userId, {
        name,
        description,
        category,
        logoUrl,
        network,
        region,
        isPublic: isPublic !== false,
      });

      res.status(201).json({ success: true, station });
    } catch (error) {
      logger.error("Error creating station:", error);
      next(error);
    }
  },

  /**
   * PUT /api/tv/stations/:id
   * Update a station
   */
  async updateStation(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const station = await tvService.updateStation(id, userId, updates);

      if (!station) {
        return res.status(404).json({ message: "Station not found or unauthorized" });
      }

      res.json({ success: true, station });
    } catch (error) {
      logger.error("Error updating station:", error);
      next(error);
    }
  },

  /**
   * DELETE /api/tv/stations/:id
   * Delete a station
   */
  async deleteStation(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await tvService.deleteStation(id, userId);

      if (!result) {
        return res.status(404).json({ message: "Station not found or unauthorized" });
      }

      res.json({ success: true, message: "Station deleted" });
    } catch (error) {
      logger.error("Error deleting station:", error);
      next(error);
    }
  },

  /**
   * GET /api/tv/stations/:id/stream-key
   * Get station's stream key (owner only)
   */
  async getStreamKey(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const key = await tvService.getStreamKey(id, userId);

      if (!key) {
        return res.status(404).json({ message: "Station not found or unauthorized" });
      }

      res.json({ success: true, streamKey: key });
    } catch (error) {
      logger.error("Error getting stream key:", error);
      next(error);
    }
  },

  /**
   * POST /api/tv/stations/:id/stream-key/regenerate
   * Regenerate stream key
   */
  async regenerateStreamKey(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const key = await tvService.regenerateStreamKey(id, userId);

      if (!key) {
        return res.status(404).json({ message: "Station not found or unauthorized" });
      }

      res.json({ success: true, streamKey: key });
    } catch (error) {
      logger.error("Error regenerating stream key:", error);
      next(error);
    }
  },

  /**
   * GET /api/tv/live
   * Get all currently live stations
   */
  async getLiveStations(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);

      const stations = await tvService.getLiveStations({ page, limit });

      res.json({
        success: true,
        stations,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting live stations:", error);
      next(error);
    }
  },

  /**
   * GET /api/tv/guide
   * Get TV guide/schedule
   */
  async getTVGuide(req, res, next) {
    try {
      const { date, network, category } = req.query;

      const guide = await tvService.getTVGuide({
        date: date ? new Date(date) : new Date(),
        network,
        category,
      });

      res.json({
        success: true,
        guide,
      });
    } catch (error) {
      logger.error("Error getting TV guide:", error);
      next(error);
    }
  },

  /**
   * POST /api/tv/stations/:id/go-live
   * Start streaming (set station live)
   */
  async goLive(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { title, description } = req.body;

      const result = await tvService.startStream(id, userId, { title, description });

      if (!result) {
        return res.status(404).json({ message: "Station not found or unauthorized" });
      }

      res.json({ success: true, ...result });
    } catch (error) {
      logger.error("Error going live:", error);
      next(error);
    }
  },

  /**
   * POST /api/tv/stations/:id/end-stream
   * End streaming
   */
  async endStream(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await tvService.endStream(id, userId);

      if (!result) {
        return res.status(404).json({ message: "Station not found or unauthorized" });
      }

      res.json({ success: true, message: "Stream ended" });
    } catch (error) {
      logger.error("Error ending stream:", error);
      next(error);
    }
  },

  /**
   * GET /api/tv/my-stations
   * Get current user's stations
   */
  async getMyStations(req, res, next) {
    try {
      const userId = req.user.id;

      const stations = await tvService.getUserStations(userId);

      res.json({
        success: true,
        stations,
      });
    } catch (error) {
      logger.error("Error getting my stations:", error);
      next(error);
    }
  },
};

export default tvController;




