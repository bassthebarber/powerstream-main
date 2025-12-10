// backend/recordingStudio/controllers/tvExportController.js
// TV Export Controller - Export studio content to TV stations

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory export queue (in production, use Redis/database)
const exportQueue = new Map();

// Available TV stations (stub data)
const AVAILABLE_STATIONS = [
  { id: "sps", name: "Southern Power Sports", genre: "sports", status: "online" },
  { id: "nlf", name: "No Limit Forever", genre: "entertainment", status: "online" },
  { id: "tgt", name: "The Greatest TV", genre: "competition", status: "online" },
  { id: "gospel", name: "Gospel Network", genre: "gospel", status: "online" },
  { id: "hiphop", name: "Hip-Hop Channel", genre: "music", status: "online" },
];

const tvExportController = {
  /**
   * Health check
   */
  healthCheck: (req, res) => {
    res.json({
      ok: true,
      service: "TV Export Engine",
      version: "1.0.0",
      queueSize: exportQueue.size,
      stationsAvailable: AVAILABLE_STATIONS.filter(s => s.status === "online").length,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Get export statistics
   */
  getStats: (req, res) => {
    const exports = Array.from(exportQueue.values());
    const stats = {
      total: exports.length,
      pending: exports.filter(e => e.status === "pending").length,
      processing: exports.filter(e => e.status === "processing").length,
      completed: exports.filter(e => e.status === "completed").length,
      failed: exports.filter(e => e.status === "failed").length,
    };

    res.json({ ok: true, stats });
  },

  /**
   * Get available stations
   */
  getStations: (req, res) => {
    res.json({
      ok: true,
      stations: AVAILABLE_STATIONS,
    });
  },

  /**
   * Create a new TV export
   */
  createExport: async (req, res) => {
    try {
      const {
        libraryItemId,
        assetType = "song",
        targetStation,
        targetShow,
        targetEpisode,
        targetPlaylist,
        priority = "normal",
        scheduledAt,
      } = req.body;

      const userId = req.user?.id || req.user?._id || "dev-user";

      if (!libraryItemId) {
        return res.status(400).json({
          ok: false,
          error: "libraryItemId is required",
        });
      }

      if (!targetStation) {
        return res.status(400).json({
          ok: false,
          error: "targetStation is required",
        });
      }

      const station = AVAILABLE_STATIONS.find(s => s.id === targetStation);
      if (!station) {
        return res.status(400).json({
          ok: false,
          error: `Invalid station: ${targetStation}`,
          availableStations: AVAILABLE_STATIONS.map(s => s.id),
        });
      }

      const exportId = `export_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      const exportJob = {
        id: exportId,
        userId,
        libraryItemId,
        assetType,
        targetStation,
        targetShow,
        targetEpisode,
        targetPlaylist,
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: "pending",
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      exportQueue.set(exportId, exportJob);

      // Simulate processing
      setTimeout(() => {
        const job = exportQueue.get(exportId);
        if (job) {
          job.status = "processing";
          job.progress = 50;
          job.updatedAt = new Date().toISOString();
        }
      }, 1000);

      setTimeout(() => {
        const job = exportQueue.get(exportId);
        if (job) {
          job.status = "completed";
          job.progress = 100;
          job.completedAt = new Date().toISOString();
          job.updatedAt = new Date().toISOString();
          job.deliveryUrl = `https://${station.id}.powerstream.tv/assets/${exportId}`;
        }
      }, 3000);

      res.status(201).json({
        ok: true,
        message: "Export job created",
        export: {
          id: exportJob.id,
          status: exportJob.status,
          targetStation: station.name,
          assetType,
          priority,
        },
      });
    } catch (error) {
      console.error("TV export creation error:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  /**
   * List exports
   */
  listExports: async (req, res) => {
    try {
      const { status, station, limit = 50, skip = 0, sortBy = "createdAt", sortOrder = "desc" } = req.query;
      const userId = req.user?.id || req.user?._id || "dev-user";

      let exports = Array.from(exportQueue.values())
        .filter(e => e.userId === userId);

      if (status) {
        exports = exports.filter(e => e.status === status);
      }
      if (station) {
        exports = exports.filter(e => e.targetStation === station);
      }

      // Sort
      exports.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return sortOrder === "desc" ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
      });

      // Paginate
      const total = exports.length;
      exports = exports.slice(Number(skip), Number(skip) + Number(limit));

      res.json({
        ok: true,
        exports,
        pagination: {
          total,
          limit: Number(limit),
          skip: Number(skip),
        },
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  /**
   * Get a single export
   */
  getExport: async (req, res) => {
    try {
      const { id } = req.params;
      const exportJob = exportQueue.get(id);

      if (!exportJob) {
        return res.status(404).json({ ok: false, error: "Export not found" });
      }

      res.json({ ok: true, export: exportJob });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  /**
   * Retry a failed export
   */
  retryExport: async (req, res) => {
    try {
      const { id } = req.params;
      const exportJob = exportQueue.get(id);

      if (!exportJob) {
        return res.status(404).json({ ok: false, error: "Export not found" });
      }

      if (exportJob.status !== "failed") {
        return res.status(400).json({ ok: false, error: "Can only retry failed exports" });
      }

      exportJob.status = "pending";
      exportJob.progress = 0;
      exportJob.retryCount = (exportJob.retryCount || 0) + 1;
      exportJob.updatedAt = new Date().toISOString();

      // Simulate processing
      setTimeout(() => {
        exportJob.status = "completed";
        exportJob.progress = 100;
        exportJob.completedAt = new Date().toISOString();
      }, 2000);

      res.json({
        ok: true,
        message: "Export retry initiated",
        export: {
          id: exportJob.id,
          status: exportJob.status,
          retryCount: exportJob.retryCount,
        },
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },

  /**
   * Cancel a queued export
   */
  cancelExport: async (req, res) => {
    try {
      const { id } = req.params;
      const exportJob = exportQueue.get(id);

      if (!exportJob) {
        return res.status(404).json({ ok: false, error: "Export not found" });
      }

      if (exportJob.status !== "pending") {
        return res.status(400).json({ ok: false, error: "Can only cancel pending exports" });
      }

      exportJob.status = "cancelled";
      exportJob.cancelledAt = new Date().toISOString();
      exportJob.updatedAt = new Date().toISOString();

      res.json({
        ok: true,
        message: "Export cancelled",
        export: {
          id: exportJob.id,
          status: exportJob.status,
        },
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  },
};

export default tvExportController;

