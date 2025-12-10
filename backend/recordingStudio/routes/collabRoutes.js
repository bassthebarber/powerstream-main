// backend/recordingStudio/routes/collabRoutes.js
import express from "express";
import CollabSession from "../models/CollabSession.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const session = await CollabSession.create(req.body);
    res.status(201).json({ ok: true, data: session });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const sessions = await CollabSession.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: sessions });
  } catch (err) {
    next(err);
  }
});

export default router;
