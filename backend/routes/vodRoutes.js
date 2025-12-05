// backend/routes/vodRoutes.js
// Routes for Video-On-Demand (recorded streams)
import express from "express";
import { authRequired } from "../middleware/requireAuth.js";
import VODAsset from "../models/VODAsset.js";

const router = express.Router();

/**
 * GET /api/vod
 * Get VOD assets (optionally filtered by stationId)
 */
router.get("/", authRequired, async (req, res) => {
  try {
    const { stationId, limit = 50, skip = 0 } = req.query;
    const query = { userId: req.user.id };

    if (stationId) {
      query.stationId = stationId;
    }

    const assets = await VODAsset.find(query)
      .sort({ recordedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate("stationId", "name slug");

    const total = await VODAsset.countDocuments(query);

    res.json({
      ok: true,
      assets: assets.map((asset) => ({
        id: asset._id.toString(),
        sessionId: asset.sessionId,
        stationId: asset.stationId?._id?.toString(),
        stationName: asset.stationId?.name,
        title: asset.title,
        description: asset.description,
        recordedAt: asset.recordedAt,
        duration: asset.duration,
        videoUrl: asset.videoUrl,
        thumbnailUrl: asset.thumbnailUrl,
        status: asset.status,
        createdAt: asset.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error("Error fetching VOD assets:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/vod/:id
 * Get a single VOD asset
 */
router.get("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await VODAsset.findOne({
      _id: id,
      userId: req.user.id,
    }).populate("stationId", "name slug");

    if (!asset) {
      return res.status(404).json({ ok: false, error: "VOD asset not found" });
    }

    res.json({
      ok: true,
      asset: {
        id: asset._id.toString(),
        sessionId: asset.sessionId,
        stationId: asset.stationId?._id?.toString(),
        stationName: asset.stationId?.name,
        title: asset.title,
        description: asset.description,
        recordedAt: asset.recordedAt,
        duration: asset.duration,
        videoUrl: asset.videoUrl,
        thumbnailUrl: asset.thumbnailUrl,
        status: asset.status,
        fileSize: asset.fileSize,
        metadata: asset.metadata,
        createdAt: asset.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching VOD asset:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * DELETE /api/vod/:id
 * Delete a VOD asset
 */
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await VODAsset.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!asset) {
      return res.status(404).json({ ok: false, error: "VOD asset not found" });
    }

    // TODO: Delete video file from storage

    res.json({ ok: true, message: "VOD asset deleted" });
  } catch (error) {
    console.error("Error deleting VOD asset:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;



