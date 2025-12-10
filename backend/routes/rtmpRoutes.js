// backend/routes/rtmpRoutes.js
// Routes for managing RTMP endpoints
import express from "express";
import { authRequired } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import RTMPEndpoint from "../models/RTMPEndpoint.js";

const router = express.Router();

/**
 * GET /api/rtmp/endpoints
 * Get all RTMP endpoints for the current user
 */
router.get("/endpoints", authRequired, requireRole("admin", "stationOwner"), async (req, res) => {
  try {
    const { stationId, profileName } = req.query;
    const query = { userId: req.user.id };
    
    if (stationId) {
      query.$or = [
        { stationId: stationId },
        { stationId: null }, // Global endpoints
      ];
    }
    if (profileName) {
      query.profileName = profileName;
    }

    const endpoints = await RTMPEndpoint.find(query).sort({ createdAt: -1 });

    res.json({
      ok: true,
      endpoints: endpoints.map((ep) => ({
        id: ep._id.toString(),
        platform: ep.platform,
        name: ep.name,
        rtmpUrl: ep.rtmpUrl,
        streamKey: ep.streamKey ? "***" + ep.streamKey.slice(-4) : "", // Mask stream key
        bridgeProxyUrl: ep.bridgeProxyUrl,
        isActive: ep.isActive,
        lastStatus: ep.lastStatus,
        lastError: ep.lastError,
        lastConnectedAt: ep.lastConnectedAt,
        needsBridgeProxy: ep.needsBridgeProxy(),
        createdAt: ep.createdAt,
        updatedAt: ep.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching RTMP endpoints:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/rtmp/endpoints
 * Create a new RTMP endpoint
 */
router.post("/endpoints", authRequired, requireRole("admin", "stationOwner"), async (req, res) => {
  try {
    const { platform, name, rtmpUrl, streamKey, bridgeProxyUrl, metadata, stationId, profileName } = req.body;

    if (!platform || !name || !rtmpUrl || !streamKey) {
      return res.status(400).json({
        ok: false,
        error: "platform, name, rtmpUrl, and streamKey are required",
      });
    }

    // Validate platform
    const validPlatforms = [
      "facebook",
      "youtube",
      "twitch",
      "kick",
      "linkedin",
      "instagram",
      "tiktok",
      "custom",
    ];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        ok: false,
        error: `Invalid platform. Must be one of: ${validPlatforms.join(", ")}`,
      });
    }

    // Auto-detect if bridge-proxy is needed
    const needsBridge = platform === "instagram" || platform === "tiktok";

    const endpoint = new RTMPEndpoint({
      userId: req.user.id,
      platform,
      name,
      rtmpUrl: rtmpUrl.trim(),
      streamKey: streamKey.trim(),
      bridgeProxyUrl: bridgeProxyUrl?.trim() || null,
      stationId: stationId || null,
      profileName: profileName || null,
      isActive: true,
      lastStatus: "unknown",
      metadata: metadata || {},
    });

    await endpoint.save();

    res.status(201).json({
      ok: true,
      endpoint: {
        id: endpoint._id.toString(),
        platform: endpoint.platform,
        name: endpoint.name,
        rtmpUrl: endpoint.rtmpUrl,
        streamKey: "***" + endpoint.streamKey.slice(-4), // Mask stream key
        bridgeProxyUrl: endpoint.bridgeProxyUrl,
        isActive: endpoint.isActive,
        needsBridgeProxy: endpoint.needsBridgeProxy(),
      },
    });
  } catch (error) {
    console.error("Error creating RTMP endpoint:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * PUT /api/rtmp/endpoints/:id
 * Update an RTMP endpoint
 */
router.put("/endpoints/:id", authRequired, requireRole("admin", "stationOwner"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rtmpUrl, streamKey, bridgeProxyUrl, isActive, metadata } = req.body;

    const endpoint = await RTMPEndpoint.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!endpoint) {
      return res.status(404).json({ ok: false, error: "Endpoint not found" });
    }

    if (name !== undefined) endpoint.name = name;
    if (rtmpUrl !== undefined) endpoint.rtmpUrl = rtmpUrl.trim();
    if (streamKey !== undefined) endpoint.streamKey = streamKey.trim();
    if (bridgeProxyUrl !== undefined) endpoint.bridgeProxyUrl = bridgeProxyUrl?.trim() || null;
    if (isActive !== undefined) endpoint.isActive = isActive;
    if (metadata !== undefined) endpoint.metadata = metadata;

    await endpoint.save();

    res.json({
      ok: true,
      endpoint: {
        id: endpoint._id.toString(),
        platform: endpoint.platform,
        name: endpoint.name,
        rtmpUrl: endpoint.rtmpUrl,
        streamKey: "***" + endpoint.streamKey.slice(-4), // Mask stream key
        bridgeProxyUrl: endpoint.bridgeProxyUrl,
        isActive: endpoint.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating RTMP endpoint:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * DELETE /api/rtmp/endpoints/:id
 * Delete an RTMP endpoint
 */
router.delete("/endpoints/:id", authRequired, requireRole("admin", "stationOwner"), async (req, res) => {
  try {
    const { id } = req.params;

    const endpoint = await RTMPEndpoint.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!endpoint) {
      return res.status(404).json({ ok: false, error: "Endpoint not found" });
    }

    res.json({ ok: true, message: "Endpoint deleted" });
  } catch (error) {
    console.error("Error deleting RTMP endpoint:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/rtmp/endpoints/:id/status
 * Get real-time status of an RTMP endpoint
 */
router.get("/endpoints/:id/status", authRequired, requireRole("admin", "stationOwner"), async (req, res) => {
  try {
    const { id } = req.params;

    const endpoint = await RTMPEndpoint.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!endpoint) {
      return res.status(404).json({ ok: false, error: "Endpoint not found" });
    }

    res.json({
      ok: true,
      status: {
        endpointId: endpoint._id.toString(),
        platform: endpoint.platform,
        name: endpoint.name,
        lastStatus: endpoint.lastStatus,
        lastError: endpoint.lastError,
        lastConnectedAt: endpoint.lastConnectedAt,
        isActive: endpoint.isActive,
      },
    });
  } catch (error) {
    console.error("Error getting endpoint status:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/rtmp/status
 * Get status of all active multistream sessions
 */
router.get("/status", authRequired, requireRole("admin", "stationOwner"), async (req, res) => {
  try {
    const { getAllActiveMultistreams } = await import("../services/MultistreamService.js");
    const sessions = getAllActiveMultistreams();

    res.json({
      ok: true,
      sessions,
      totalActive: sessions.filter((s) => s.isActive).length,
    });
  } catch (error) {
    console.error("Error getting multistream status:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;

