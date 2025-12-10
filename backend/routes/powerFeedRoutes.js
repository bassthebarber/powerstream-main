// backend/routes/powerFeedRoutes.js
import { Router } from "express";
import {
  getPosts,
  createPost,
  reactToPost,
  commentOnPost,
} from "../controllers/powerFeedController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// Public routes
router.get("/posts", getPosts);

// Protected routes (require auth)
router.post("/posts", authRequired, createPost);
router.post("/posts/:id/react", authRequired, reactToPost);
router.post("/posts/:id/comment", authRequired, commentOnPost);

export default router;





