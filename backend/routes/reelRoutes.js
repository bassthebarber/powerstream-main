// backend/routes/reelRoutes.js
import { Router } from "express";
import {
  getReels,
  createReel,
  likeReel,
  getReelComments,
  commentOnReel,
} from "../controllers/reelController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// Health check
router.get("/health", (req, res) => res.json({ ok: true, service: "reels" }));

// Basic reels API (reuses powerReelController under the hood)
router.get("/", getReels);
router.post("/", authRequired, createReel);

// Likes
router.post("/:id/like", authRequired, likeReel);

// Comments
router.get("/:id/comments", authRequired, getReelComments);
router.post("/:id/comments", authRequired, commentOnReel);

export default router;
