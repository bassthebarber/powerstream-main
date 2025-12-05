// backend/routes/gramRoutes.js
import { Router } from "express";
import {
  getGrams,
  createGram,
  likeGram,
  getGramComments,
  commentOnGram,
} from "../controllers/gramController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// Basic health check
router.get("/health", (req, res) => res.json({ ok: true, service: "gram" }));

// Simple proxy to the same logic as /api/powergram
router.get("/", getGrams);
router.post("/", createGram);

// Likes
router.post("/:id/like", authRequired, likeGram);

// Comments
router.get("/:id/comments", authRequired, getGramComments);
router.post("/:id/comments", authRequired, commentOnGram);

export default router;
