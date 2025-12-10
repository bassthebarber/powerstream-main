// backend/recordingStudio/routes/collabroutes.js
// Collaboration routes for studio sessions

import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import CollabSession from "../models/CollabSession.js";

const router = express.Router();

// All collab routes require auth
router.use(requireAuth);

// Health check
router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "Collab Sessions" });
});

// List collab sessions for current user
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await CollabSession.find({
      $or: [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ ok: true, sessions });
  } catch (error) {
    console.error("[Collab] List sessions error:", error);
    res.status(500).json({ ok: false, message: "Failed to list sessions" });
  }
});

// Get session by ID
router.get("/sessions/:id", async (req, res) => {
  try {
    const session = await CollabSession.findById(req.params.id).lean();
    if (!session) {
      return res.status(404).json({ ok: false, message: "Session not found" });
    }
    res.json({ ok: true, session });
  } catch (error) {
    console.error("[Collab] Get session error:", error);
    res.status(500).json({ ok: false, message: "Failed to get session" });
  }
});

// Create a new collab session
router.post("/sessions", async (req, res) => {
  try {
    const { name, collaborators = [], projectType = "beat" } = req.body;
    
    const session = await CollabSession.create({
      name: name || `Session ${Date.now()}`,
      createdBy: req.user.id,
      collaborators,
      projectType,
      status: "active",
    });
    
    res.status(201).json({ ok: true, session });
  } catch (error) {
    console.error("[Collab] Create session error:", error);
    res.status(500).json({ ok: false, message: "Failed to create session" });
  }
});

// Join a collab session
router.post("/sessions/:id/join", async (req, res) => {
  try {
    const session = await CollabSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ ok: false, message: "Session not found" });
    }
    
    // Add user to collaborators if not already in
    if (!session.collaborators.includes(req.user.id)) {
      session.collaborators.push(req.user.id);
      await session.save();
    }
    
    res.json({ ok: true, session });
  } catch (error) {
    console.error("[Collab] Join session error:", error);
    res.status(500).json({ ok: false, message: "Failed to join session" });
  }
});

// Leave a collab session
router.post("/sessions/:id/leave", async (req, res) => {
  try {
    const session = await CollabSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ ok: false, message: "Session not found" });
    }
    
    session.collaborators = session.collaborators.filter(
      (id) => id.toString() !== req.user.id
    );
    await session.save();
    
    res.json({ ok: true, message: "Left session" });
  } catch (error) {
    console.error("[Collab] Leave session error:", error);
    res.status(500).json({ ok: false, message: "Failed to leave session" });
  }
});

export default router;
