// backend/routes/historyRoutes.js
// Watch History API Routes

import express from "express";
import WatchHistory from "../models/WatchHistory.js";

const router = express.Router();

// SAVE PROGRESS
router.post("/save", async (req, res) => {
  const { userId, filmId, progress, duration, completed } = req.body;
  
  if (!userId || !filmId) {
    return res.status(400).json({ success: false, error: "userId and filmId are required" });
  }
  
  try {
    const history = await WatchHistory.findOneAndUpdate(
      { userId, filmId },
      { 
        progress: progress || 0, 
        duration: duration || 0,
        completed: completed || false, 
        lastWatched: new Date() 
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, history });
  } catch (err) {
    console.error("[History] Save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET USER WATCH HISTORY
router.get("/user/:id", async (req, res) => {
  try {
    const list = await WatchHistory.find({ userId: req.params.id })
      .sort({ lastWatched: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, history: list });
  } catch (err) {
    console.error("[History] Get error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET PROGRESS FOR SPECIFIC FILM
router.get("/progress/:userId/:filmId", async (req, res) => {
  try {
    const { userId, filmId } = req.params;
    const entry = await WatchHistory.findOne({ userId, filmId }).lean();
    
    if (!entry) {
      return res.json({ success: true, progress: 0, completed: false });
    }
    
    res.json({ 
      success: true, 
      progress: entry.progress,
      completed: entry.completed,
      lastWatched: entry.lastWatched 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET CONTINUE WATCHING (incomplete films)
router.get("/continue/:userId", async (req, res) => {
  try {
    const list = await WatchHistory.find({ 
      userId: req.params.userId,
      completed: false,
      progress: { $gt: 0 }
    })
      .sort({ lastWatched: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, history: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE HISTORY ENTRY
router.delete("/:userId/:filmId", async (req, res) => {
  try {
    const { userId, filmId } = req.params;
    await WatchHistory.findOneAndDelete({ userId, filmId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CLEAR ALL USER HISTORY
router.delete("/clear/:userId", async (req, res) => {
  try {
    await WatchHistory.deleteMany({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;



