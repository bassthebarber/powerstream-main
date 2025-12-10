// backend/src/api/routes/feed.routes.js
// Canonical feed routes (PowerFeed, PowerGram, PowerReel)
import { Router } from "express";
import feedController from "../controllers/feed.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public-ish routes (optional auth for personalization)
router.get("/", optionalAuth, feedController.getFeed);
router.get("/explore", optionalAuth, feedController.getExplore);
router.get("/trending", feedController.getTrending);
router.get("/search", optionalAuth, feedController.searchPosts);
router.get("/hashtag/:tag", optionalAuth, feedController.getPostsByHashtag);
router.get("/user/:userId", optionalAuth, feedController.getUserPosts);

// Single post
router.get("/:id", optionalAuth, feedController.getPost);

// Protected routes
router.post("/", requireAuth, feedController.createPost);
router.put("/:id", requireAuth, feedController.updatePost);
router.delete("/:id", requireAuth, feedController.deletePost);
router.post("/:id/like", requireAuth, feedController.toggleLike);
router.post("/:id/share", requireAuth, feedController.sharePost);

export default router;




