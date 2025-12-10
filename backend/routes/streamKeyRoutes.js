// backend/routes/streamKeyRoutes.js
// Stream Key Routes - Manage unified stream keys

import { Router } from "express";
import StreamKey from "../models/StreamKey.js";
import { getSouthernPowerRelayConfig, updatePlatformConfig } from "../services/MultiPlatformRelay.js";

const router = Router();

// =====================================================
// GET /api/stream-keys/southern-power
// Get the Southern Power unified stream key
// =====================================================
router.get("/southern-power", async (req, res) => {
  try {
    const record = await StreamKey.findOne({
      label: "Southern Power Unified Stream Key",
      isActive: true,
    }).lean();

    if (!record) {
      return res.status(404).json({ 
        success: false, 
        error: "Southern Power stream key not found" 
      });
    }

    // Get platform statuses (enabled/disabled only, not keys)
    const platformStatus = {};
    for (const [name, config] of Object.entries(record.platforms || {})) {
      platformStatus[name] = {
        enabled: config.enabled,
        configured: !!(config.rtmpUrl || process.env[`${name.toUpperCase()}_RTMP_URL`]),
      };
    }

    res.json({
      success: true,
      channelName: record.channelName,
      streamKey: record.key,
      rtmpEndpoint: record.rtmpEndpoint || process.env.SPS_SOUTHERN_POWER_RTMP || "rtmp://localhost:1935/southernpower",
      isLive: record.isLive,
      lastStreamStart: record.lastStreamStart,
      totalStreamMinutes: record.totalStreamMinutes,
      platforms: platformStatus,
    });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/stream-keys/:id
// Get a specific stream key by ID
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const record = await StreamKey.findById(req.params.id).lean();

    if (!record) {
      return res.status(404).json({ success: false, error: "Stream key not found" });
    }

    res.json({ success: true, streamKey: record });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/stream-keys
// List all stream keys
// =====================================================
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    const query = {};
    
    if (active !== undefined) {
      query.isActive = active === "true";
    }

    const keys = await StreamKey.find(query)
      .select("-platforms.facebook.streamKey -platforms.youtube.streamKey -platforms.instagram.streamKey -platforms.tiktok.streamKey -platforms.twitch.streamKey")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, keys, total: keys.length });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/stream-keys
// Create a new stream key
// =====================================================
router.post("/", async (req, res) => {
  try {
    const { label, key, channelName, allowedUsers, stationId } = req.body;

    if (!label || !key) {
      return res.status(400).json({ 
        success: false, 
        error: "label and key are required" 
      });
    }

    // Check for duplicate key
    const existing = await StreamKey.findOne({ key });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: "Stream key already exists" 
      });
    }

    const streamKey = await StreamKey.create({
      label,
      key,
      channelName: channelName || "Stream",
      allowedUsers: allowedUsers || [],
      stationId,
      rtmpEndpoint: process.env.SPS_SOUTHERN_POWER_RTMP || "rtmp://localhost:1935/live",
    });

    res.json({ success: true, streamKey });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// PATCH /api/stream-keys/:id
// Update a stream key
// =====================================================
router.patch("/:id", async (req, res) => {
  try {
    const { label, channelName, isActive, allowedUsers } = req.body;

    const updates = {};
    if (label !== undefined) updates.label = label;
    if (channelName !== undefined) updates.channelName = channelName;
    if (isActive !== undefined) updates.isActive = isActive;
    if (allowedUsers !== undefined) updates.allowedUsers = allowedUsers;

    const streamKey = await StreamKey.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!streamKey) {
      return res.status(404).json({ success: false, error: "Stream key not found" });
    }

    res.json({ success: true, streamKey });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// PATCH /api/stream-keys/:id/platform/:platform
// Update platform configuration
// =====================================================
router.patch("/:id/platform/:platform", async (req, res) => {
  try {
    const { id, platform } = req.params;
    const { enabled, rtmpUrl, streamKey: platformStreamKey } = req.body;

    const record = await StreamKey.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, error: "Stream key not found" });
    }

    if (!record.platforms[platform]) {
      return res.status(400).json({ success: false, error: `Unknown platform: ${platform}` });
    }

    if (enabled !== undefined) record.platforms[platform].enabled = enabled;
    if (rtmpUrl !== undefined) record.platforms[platform].rtmpUrl = rtmpUrl;
    if (platformStreamKey !== undefined) record.platforms[platform].streamKey = platformStreamKey;

    await record.save();

    res.json({ 
      success: true, 
      platform,
      config: {
        enabled: record.platforms[platform].enabled,
        hasRtmpUrl: !!record.platforms[platform].rtmpUrl,
        hasStreamKey: !!record.platforms[platform].streamKey,
      },
    });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/stream-keys/:id/add-user
// Add a user to allowed users
// =====================================================
router.post("/:id/add-user", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }

    const streamKey = await StreamKey.findById(req.params.id);
    if (!streamKey) {
      return res.status(404).json({ success: false, error: "Stream key not found" });
    }

    if (!streamKey.allowedUsers.includes(userId)) {
      streamKey.allowedUsers.push(userId);
      await streamKey.save();
    }

    res.json({ 
      success: true, 
      allowedUsers: streamKey.allowedUsers,
    });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// DELETE /api/stream-keys/:id/remove-user/:userId
// Remove a user from allowed users
// =====================================================
router.delete("/:id/remove-user/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params;

    const streamKey = await StreamKey.findById(id);
    if (!streamKey) {
      return res.status(404).json({ success: false, error: "Stream key not found" });
    }

    streamKey.allowedUsers = streamKey.allowedUsers.filter(
      u => u.toString() !== userId
    );
    await streamKey.save();

    res.json({ 
      success: true, 
      allowedUsers: streamKey.allowedUsers,
    });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/stream-keys/verify/:key
// Verify a stream key is valid
// =====================================================
router.get("/verify/:key", async (req, res) => {
  try {
    const record = await StreamKey.findOne({ 
      key: req.params.key, 
      isActive: true 
    }).lean();

    if (!record) {
      return res.json({ 
        success: true, 
        valid: false, 
        error: "Invalid or inactive stream key" 
      });
    }

    res.json({
      success: true,
      valid: true,
      channelName: record.channelName,
      label: record.label,
    });
  } catch (err) {
    console.error("[StreamKeyRoutes] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;


