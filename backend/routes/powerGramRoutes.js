// backend/routes/powerGramRoutes.js
import { Router } from "express";
import {
  getGrams,
  createGram,
  likeGram,
  getGramComments,
  commentOnGram,
} from "../controllers/powerGramController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// Public routes
router.get("/", getGrams);
router.get("/:id/comments", getGramComments);

// Protected routes (require auth)
router.post("/", authRequired, createGram);
router.post("/:id/like", authRequired, likeGram);
router.post("/:id/comment", authRequired, commentOnGram);

export default router;
