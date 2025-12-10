// backend/routes/feedRoutes.js
import { Router } from "express";
import {
  getFeed,
  createPost,
  toggleLike,
  getComments,
  addComment,
} from "../controllers/feedController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", getFeed);
router.post("/", createPost);

// Likes
router.post("/:id/like", authRequired, toggleLike);

// Comments
router.get("/:id/comments", authRequired, getComments);
router.post("/:id/comments", authRequired, addComment);

export default router;
