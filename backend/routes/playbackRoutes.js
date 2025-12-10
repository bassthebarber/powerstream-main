// backend/routes/playbackRoutes.js
// Studio Playback Routes

import { Router } from "express";
import {
  playRecording,
  deleteRecording,
  listRecordings,
  getRecording,
  updateRecording,
} from "../controllers/PlaybackController.js";

const router = Router();

// Playback
router.get("/play/:id", playRecording);

// CRUD
router.get("/recordings", listRecordings);
router.get("/recording/:id", getRecording);
router.patch("/recording/:id", updateRecording);
router.delete("/delete/:id", deleteRecording);

export default router;

