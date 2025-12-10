// backend/routes/royaltyRegistrationRoutes.js
// Royalty Registration Routes - Copyright & Ownership Management

import express from "express";
import RoyaltyRegistration from "../models/RoyaltyRegistration.js";
import { generateCopyrightData, generateHashProof, verifyHashProof } from "../services/AICopyrightEngine.js";

const router = express.Router();

// =====================================================
// POST /api/royalty/register
// Auto-register a new work with AI copyright generation
// =====================================================
router.post("/", async (req, res) => {
  try {
    const { 
      workId,
      title, 
      type, 
      owners,
      description,
      duration,
      bpm,
      key,
      genre,
      masterFile,
      stemFiles,
      artworkUrl,
      registeredBy,
      stationId,
      projectId,
      licenseType,
      syncAvailable,
      syncPrice,
    } = req.body;

    // Validate required fields
    if (!title || !type || !owners || owners.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "title, type, and owners are required" 
      });
    }

    // Validate ownership splits
    const totalSplit = owners.reduce((sum, o) => sum + (o.split || 0), 0);
    if (Math.abs(totalSplit - 100) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        error: `Ownership splits must total 100% (currently ${totalSplit}%)` 
      });
    }

    console.log(`[RoyaltyRegistration] Registering: "${title}" (${type})`);
    console.log(`[RoyaltyRegistration] Owners: ${owners.map(o => `${o.name} (${o.split}%)`).join(", ")}`);

    // Generate AI copyright data
    const aiData = await generateCopyrightData(title, owners, { duration, genre, bpm, key });

    // Generate blockchain-ready hash proof
    const { hash, timestamp } = generateHashProof({ title, owners, type });

    // Create registration
    const registration = await RoyaltyRegistration.create({
      workId,
      title,
      description,
      type,
      owners,
      copyrightSummary: aiData.summary,
      copyrightLegalText: aiData.legal,
      aiKeywords: aiData.keywords,
      aiGenre: aiData.genre,
      aiMood: aiData.mood,
      duration,
      bpm,
      key,
      genre: genre || aiData.genre,
      masterFile,
      stemFiles,
      artworkUrl,
      registeredBy,
      hashedProof: hash,
      proofTimestamp: timestamp,
      status: "registered",
      stationId,
      projectId,
      licenseType: licenseType || "all_rights_reserved",
      syncAvailable: syncAvailable || false,
      syncPrice,
    });

    console.log(`[RoyaltyRegistration] ✅ Registered: ${registration._id}`);
    console.log(`[RoyaltyRegistration] Hash Proof: ${hash.slice(0, 16)}...`);

    res.json({ 
      success: true, 
      registration,
      aiData,
      hashProof: hash,
    });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/royalty/register/work/:id
// Get registrations for a specific work
// =====================================================
router.get("/work/:id", async (req, res) => {
  try {
    const items = await RoyaltyRegistration.find({ workId: req.params.id })
      .sort({ registeredAt: -1 })
      .lean();
    
    res.json({ success: true, items });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/royalty/register/owner/:userId
// Get registrations for a specific owner
// =====================================================
router.get("/owner/:userId", async (req, res) => {
  try {
    const items = await RoyaltyRegistration.findByOwner(req.params.userId);
    
    res.json({ success: true, items, total: items.length });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/royalty/register/:id
// Get a specific registration
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const registration = await RoyaltyRegistration.findById(req.params.id).lean();
    
    if (!registration) {
      return res.status(404).json({ success: false, error: "Registration not found" });
    }
    
    res.json({ success: true, registration });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/royalty/register/verify/:hash
// Verify a registration by hash proof
// =====================================================
router.get("/verify/:hash", async (req, res) => {
  try {
    const registration = await RoyaltyRegistration.findByHash(req.params.hash);
    
    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        verified: false,
        error: "No registration found with this hash" 
      });
    }
    
    res.json({ 
      success: true, 
      verified: true,
      registration: {
        title: registration.title,
        type: registration.type,
        owners: registration.owners,
        registeredAt: registration.registeredAt,
        status: registration.status,
      },
    });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// PATCH /api/royalty/register/:id
// Update a registration
// =====================================================
router.patch("/:id", async (req, res) => {
  try {
    const { 
      owners, 
      status, 
      licenseType, 
      syncAvailable, 
      syncPrice,
      distributedTo,
    } = req.body;

    const updates = {};
    
    if (owners) {
      // Validate splits
      const totalSplit = owners.reduce((sum, o) => sum + (o.split || 0), 0);
      if (Math.abs(totalSplit - 100) > 0.01) {
        return res.status(400).json({ 
          success: false, 
          error: `Ownership splits must total 100% (currently ${totalSplit}%)` 
        });
      }
      updates.owners = owners;
    }
    
    if (status) updates.status = status;
    if (licenseType) updates.licenseType = licenseType;
    if (syncAvailable !== undefined) updates.syncAvailable = syncAvailable;
    if (syncPrice !== undefined) updates.syncPrice = syncPrice;
    if (distributedTo) updates.distributedTo = distributedTo;

    const registration = await RoyaltyRegistration.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, error: "Registration not found" });
    }

    res.json({ success: true, registration });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// GET /api/royalty/register/search
// Search registrations
// =====================================================
router.get("/", async (req, res) => {
  try {
    const { 
      q, // search query
      type,
      status,
      limit = 50,
      skip = 0,
    } = req.query;

    const query = {};
    
    if (q) {
      query.$text = { $search: q };
    }
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }

    const items = await RoyaltyRegistration.find(query)
      .sort({ registeredAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const total = await RoyaltyRegistration.countDocuments(query);

    res.json({ 
      success: true, 
      items, 
      total,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + items.length < total,
      },
    });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// POST /api/royalty/register/:id/distribute
// Mark work as distributed to a platform
// =====================================================
router.post("/:id/distribute", async (req, res) => {
  try {
    const { platform, externalId } = req.body;

    if (!platform) {
      return res.status(400).json({ success: false, error: "platform is required" });
    }

    const registration = await RoyaltyRegistration.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          distributedTo: { 
            platform, 
            distributedAt: new Date(),
            externalId,
          } 
        } 
      },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, error: "Registration not found" });
    }

    console.log(`[RoyaltyRegistration] Distributed "${registration.title}" to ${platform}`);

    res.json({ success: true, registration });
  } catch (err) {
    console.error("[RoyaltyRegistration] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

