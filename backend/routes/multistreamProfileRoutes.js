// backend/routes/multistreamProfileRoutes.js
// Routes for managing multistream presets/profiles
import express from "express";
import { authRequired } from "../middleware/requireAuth.js";
import MultistreamProfile from "../models/MultistreamProfile.js";
import RTMPEndpoint from "../models/RTMPEndpoint.js";

const router = express.Router();

/**
 * GET /api/multistream/profiles
 * Get all profiles for the current user
 */
router.get("/profiles", authRequired, async (req, res) => {
  try {
    const { stationId } = req.query;
    const query = { userId: req.user.id };
    if (stationId) {
      query.$or = [
        { stationId: stationId },
        { stationId: null }, // Global profiles
      ];
    }

    const profiles = await MultistreamProfile.find(query).sort({ createdAt: -1 });

    // Populate endpoint details
    const profilesWithEndpoints = await Promise.all(
      profiles.map(async (profile) => {
        const endpoints = await RTMPEndpoint.find({
          _id: { $in: profile.endpointIds },
        });
        return {
          id: profile._id.toString(),
          name: profile.name,
          description: profile.description,
          stationId: profile.stationId,
          endpointIds: profile.endpointIds.map((id) => id.toString()),
          endpoints: endpoints.map((ep) => ({
            id: ep._id.toString(),
            platform: ep.platform,
            name: ep.name,
            isActive: ep.isActive,
          })),
          isDefault: profile.isDefault,
          isActive: profile.isActive,
          createdAt: profile.createdAt,
        };
      })
    );

    res.json({ ok: true, profiles: profilesWithEndpoints });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/multistream/profiles
 * Create a new profile
 */
router.post("/profiles", authRequired, async (req, res) => {
  try {
    const { name, description, stationId, endpointIds } = req.body;

    if (!name || !endpointIds || !Array.isArray(endpointIds) || endpointIds.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "name and endpointIds (array) are required",
      });
    }

    // Verify all endpoints belong to user
    const endpoints = await RTMPEndpoint.find({
      _id: { $in: endpointIds },
      userId: req.user.id,
    });

    if (endpoints.length !== endpointIds.length) {
      return res.status(400).json({
        ok: false,
        error: "Some endpoints not found or access denied",
      });
    }

    // If this is set as default, unset other defaults for this user/station
    if (req.body.isDefault) {
      await MultistreamProfile.updateMany(
        {
          userId: req.user.id,
          stationId: stationId || null,
          isDefault: true,
        },
        { isDefault: false }
      );
    }

    const profile = new MultistreamProfile({
      userId: req.user.id,
      name,
      description,
      stationId: stationId || null,
      endpointIds,
      isDefault: req.body.isDefault || false,
      isActive: true,
    });

    await profile.save();

    res.status(201).json({
      ok: true,
      profile: {
        id: profile._id.toString(),
        name: profile.name,
        description: profile.description,
        stationId: profile.stationId,
        endpointIds: profile.endpointIds.map((id) => id.toString()),
        isDefault: profile.isDefault,
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * PUT /api/multistream/profiles/:id
 * Update a profile
 */
router.put("/profiles/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, endpointIds, isDefault, isActive } = req.body;

    const profile = await MultistreamProfile.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({ ok: false, error: "Profile not found" });
    }

    if (name !== undefined) profile.name = name;
    if (description !== undefined) profile.description = description;
    if (isActive !== undefined) profile.isActive = isActive;

    if (endpointIds && Array.isArray(endpointIds)) {
      // Verify endpoints belong to user
      const endpoints = await RTMPEndpoint.find({
        _id: { $in: endpointIds },
        userId: req.user.id,
      });

      if (endpoints.length !== endpointIds.length) {
        return res.status(400).json({
          ok: false,
          error: "Some endpoints not found or access denied",
        });
      }

      profile.endpointIds = endpointIds;
    }

    if (isDefault === true) {
      // Unset other defaults
      await MultistreamProfile.updateMany(
        {
          userId: req.user.id,
          stationId: profile.stationId,
          _id: { $ne: id },
          isDefault: true,
        },
        { isDefault: false }
      );
      profile.isDefault = true;
    } else if (isDefault === false) {
      profile.isDefault = false;
    }

    await profile.save();

    res.json({
      ok: true,
      profile: {
        id: profile._id.toString(),
        name: profile.name,
        description: profile.description,
        stationId: profile.stationId,
        endpointIds: profile.endpointIds.map((id) => id.toString()),
        isDefault: profile.isDefault,
        isActive: profile.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * DELETE /api/multistream/profiles/:id
 * Delete a profile
 */
router.delete("/profiles/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await MultistreamProfile.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({ ok: false, error: "Profile not found" });
    }

    res.json({ ok: true, message: "Profile deleted" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;



