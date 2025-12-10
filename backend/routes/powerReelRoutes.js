// backend/routes/powerReelRoutes.js
import { Router } from "express";
import {
  getReels,
  createReel,
  likeReel,
  getReelComments,
  commentOnReel,
  incrementView,
} from "../controllers/powerReelController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// Public routes
router.get("/", getReels);
router.get("/:id/comments", getReelComments);
router.post("/:id/view", incrementView);

// Protected routes (require auth)
router.post("/", authRequired, createReel);
router.post("/:id/like", authRequired, likeReel);
router.post("/:id/comment", authRequired, commentOnReel);

export default router;





