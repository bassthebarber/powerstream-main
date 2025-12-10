// backend/routes/studioLabelRoutes.js
// Studio Label & Engineer/Producer Management API
// No Limit East Houston Edition

import { Router } from "express";
import StudioLabel from "../models/StudioLabel.js";
import User from "../models/User.js";
import { authRequired, authOptional } from "../middleware/requireAuth.js";

const router = Router();

// ============ GET LABELS ============

// GET /api/studio/labels - List all labels (public info only)
router.get("/labels", async (req, res) => {
  try {
    const labels = await StudioLabel.find({ isActive: true })
      .select("name slug ownerNames branding stats")
      .lean();
    res.json({ ok: true, labels });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/studio/labels/:slug - Get label details
router.get("/labels/:slug", authOptional, async (req, res) => {
  try {
    const label = await StudioLabel.findOne({ slug: req.params.slug, isActive: true })
      .populate("owners", "name email avatarUrl")
      .populate("engineers.userId", "name email avatarUrl")
      .populate("producers.userId", "name email avatarUrl")
      .lean();
    
    if (!label) {
      return res.status(404).json({ ok: false, error: "Label not found" });
    }
    
    // Check if current user has access
    const userId = req.user?.id;
    let permissions = null;
    if (userId) {
      const labelDoc = await StudioLabel.findById(label._id);
      permissions = labelDoc.getUserPermissions(userId);
    }
    
    res.json({ ok: true, label, permissions });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ CREATE / MANAGE LABELS ============

// POST /api/studio/labels - Create a new label (protected)
router.post("/labels", authRequired, async (req, res) => {
  try {
    const { name, slug, ownerNames, branding } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ ok: false, error: "Name and slug required" });
    }
    
    // Check if slug already exists
    const existing = await StudioLabel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ ok: false, error: "Label slug already exists" });
    }
    
    const label = new StudioLabel({
      name,
      slug,
      owners: [req.user.id],
      ownerNames: ownerNames || [req.user.name || "Owner"],
      branding,
    });
    
    await label.save();
    res.json({ ok: true, label });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ ENGINEER MANAGEMENT ============

// POST /api/studio/labels/:slug/engineers - Add an engineer
router.post("/labels/:slug/engineers", authRequired, async (req, res) => {
  try {
    const label = await StudioLabel.findOne({ slug: req.params.slug });
    if (!label) {
      return res.status(404).json({ ok: false, error: "Label not found" });
    }
    
    // Check if user is owner
    if (!label.isOwner(req.user.id)) {
      return res.status(403).json({ ok: false, error: "Only owners can add engineers" });
    }
    
    const { userId, name, permissions } = req.body;
    
    // Check if already added
    if (label.engineers.some(e => e.userId?.toString() === userId)) {
      return res.status(400).json({ ok: false, error: "Engineer already added" });
    }
    
    label.engineers.push({
      userId,
      name,
      permissions: permissions || {},
      addedBy: req.user.id,
    });
    
    label.stats.totalEngineers = label.engineers.length;
    await label.save();
    
    res.json({ ok: true, message: "Engineer added", engineers: label.engineers });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/studio/labels/:slug/engineers/:engineerId - Remove an engineer
router.delete("/labels/:slug/engineers/:engineerId", authRequired, async (req, res) => {
  try {
    const label = await StudioLabel.findOne({ slug: req.params.slug });
    if (!label) {
      return res.status(404).json({ ok: false, error: "Label not found" });
    }
    
    if (!label.isOwner(req.user.id)) {
      return res.status(403).json({ ok: false, error: "Only owners can remove engineers" });
    }
    
    label.engineers = label.engineers.filter(e => e._id.toString() !== req.params.engineerId);
    label.stats.totalEngineers = label.engineers.length;
    await label.save();
    
    res.json({ ok: true, message: "Engineer removed" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ PRODUCER MANAGEMENT ============

// POST /api/studio/labels/:slug/producers - Add a producer
router.post("/labels/:slug/producers", authRequired, async (req, res) => {
  try {
    const label = await StudioLabel.findOne({ slug: req.params.slug });
    if (!label) {
      return res.status(404).json({ ok: false, error: "Label not found" });
    }
    
    if (!label.isOwner(req.user.id)) {
      return res.status(403).json({ ok: false, error: "Only owners can add producers" });
    }
    
    const { userId, name, permissions } = req.body;
    
    if (label.producers.some(p => p.userId?.toString() === userId)) {
      return res.status(400).json({ ok: false, error: "Producer already added" });
    }
    
    label.producers.push({
      userId,
      name,
      permissions: permissions || {},
      addedBy: req.user.id,
    });
    
    label.stats.totalProducers = label.producers.length;
    await label.save();
    
    res.json({ ok: true, message: "Producer added", producers: label.producers });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/studio/labels/:slug/producers/:producerId - Remove a producer
router.delete("/labels/:slug/producers/:producerId", authRequired, async (req, res) => {
  try {
    const label = await StudioLabel.findOne({ slug: req.params.slug });
    if (!label) {
      return res.status(404).json({ ok: false, error: "Label not found" });
    }
    
    if (!label.isOwner(req.user.id)) {
      return res.status(403).json({ ok: false, error: "Only owners can remove producers" });
    }
    
    label.producers = label.producers.filter(p => p._id.toString() !== req.params.producerId);
    label.stats.totalProducers = label.producers.length;
    await label.save();
    
    res.json({ ok: true, message: "Producer removed" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ PERMISSION CHECK ============

// GET /api/studio/labels/:slug/permissions - Check current user's permissions
router.get("/labels/:slug/permissions", authRequired, async (req, res) => {
  try {
    const label = await StudioLabel.findOne({ slug: req.params.slug });
    if (!label) {
      return res.status(404).json({ ok: false, error: "Label not found" });
    }
    
    const permissions = label.getUserPermissions(req.user.id);
    res.json({ ok: true, permissions, labelName: label.name });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============ SEED NO LIMIT EAST HOUSTON ============

// This will create the default No Limit East Houston label
router.post("/labels/seed-nolimit", async (req, res) => {
  try {
    const existing = await StudioLabel.findOne({ slug: "no-limit-east-houston" });
    if (existing) {
      return res.json({ ok: true, message: "Label already exists", label: existing });
    }
    
    const label = new StudioLabel({
      name: "No Limit East Houston",
      slug: "no-limit-east-houston",
      ownerNames: ["Marcus", "Gangsta"],
      branding: {
        logoUrl: "/logos/nolimit-forever-logo.png",
        primaryColor: "#ffb84d",
        secondaryColor: "#8b4513",
      },
      settings: {
        defaultRoyaltySplit: 50,
        allowExternalEngineers: false,
        allowExternalProducers: false,
        requireApproval: true,
        aiToolsEnabled: true,
      },
    });
    
    await label.save();
    res.json({ ok: true, message: "No Limit East Houston created", label });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

