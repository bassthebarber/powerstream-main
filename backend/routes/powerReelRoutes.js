// backend/routes/powerReelRoutes.js
import { Router } from "express";
import {
  getReels,
  createReel,
  likeReel,
  commentOnReel,
  incrementView,
} from "../controllers/powerReelController.js";

const router = Router();

router.get("/", getReels);
router.post("/", createReel);
router.post("/:id/like", likeReel);
router.post("/:id/comment", commentOnReel);
router.post("/:id/view", incrementView);

export default router;




