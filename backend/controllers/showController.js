// backend/controllers/showController.js
import Show from "../models/Show.js";
import Station from "../models/Station.js";

/**
 * Get all shows, optionally filtered by stationId
 * GET /api/shows?stationId=...&startDate=...&endDate=...
 */
export async function getAllShows(req, res, next) {
  try {
    const { stationId, startDate, endDate, limit = 100 } = req.query;

    const query = {};

    // Filter by station if provided
    if (stationId) {
      query.stationId = stationId;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    } else {
      // Default: show upcoming shows (startTime >= now)
      query.startTime = { $gte: new Date() };
    }

    const shows = await Show.find(query)
      .populate("stationId", "name slug logoUrl")
      .sort({ startTime: 1 })
      .limit(Number(limit))
      .lean();

    res.json({ ok: true, shows });
  } catch (err) {
    console.error("Error fetching shows:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch shows" });
  }
}

/**
 * Get show by ID
 * GET /api/shows/:id
 */
export async function getShowById(req, res, next) {
  try {
    const { id } = req.params;
    const show = await Show.findById(id)
      .populate("stationId", "name slug logoUrl description category network region country ingest playbackId liveStreamUrl playbackUrl")
      .lean();

    if (!show) {
      return res.status(404).json({ ok: false, message: "Show not found" });
    }

    res.json({ ok: true, show });
  } catch (err) {
    console.error("Error fetching show:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch show" });
  }
}

/**
 * Create a new show
 * POST /api/shows
 */
export async function createShow(req, res, next) {
  try {
    const { title, description, startTime, endTime, stationId, thumbnailUrl, category } = req.body;

    if (!title || !startTime || !endTime || !stationId) {
      return res.status(400).json({
        ok: false,
        message: "title, startTime, endTime, and stationId are required",
      });
    }

    // Verify station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ ok: false, message: "Station not found" });
    }

    const show = await Show.create({
      title,
      description: description || "",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      stationId,
      thumbnailUrl,
      category,
    });

    const populated = await Show.findById(show._id)
      .populate("stationId", "name slug logoUrl")
      .lean();

    res.status(201).json({ ok: true, show: populated });
  } catch (err) {
    console.error("Error creating show:", err);
    res.status(500).json({ ok: false, message: "Failed to create show" });
  }
}

/**
 * Update show by ID
 * PUT /api/shows/:id
 */
export async function updateShow(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert date strings to Date objects if present
    if (updates.startTime) updates.startTime = new Date(updates.startTime);
    if (updates.endTime) updates.endTime = new Date(updates.endTime);

    const show = await Show.findByIdAndUpdate(id, updates, { new: true })
      .populate("stationId", "name slug logoUrl")
      .lean();

    if (!show) {
      return res.status(404).json({ ok: false, message: "Show not found" });
    }

    res.json({ ok: true, show });
  } catch (err) {
    console.error("Error updating show:", err);
    res.status(500).json({ ok: false, message: "Failed to update show" });
  }
}

/**
 * Delete show by ID
 * DELETE /api/shows/:id
 */
export async function deleteShow(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Show.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Show not found" });
    }

    res.json({ ok: true, message: "Show deleted" });
  } catch (err) {
    console.error("Error deleting show:", err);
    res.status(500).json({ ok: false, message: "Failed to delete show" });
  }
}
