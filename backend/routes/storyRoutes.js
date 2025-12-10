import { Router } from "express";
import { authRequired, authOptional } from "../middleware/requireAuth.js";
import { createStory, listStories } from "../controllers/storyController.js";

const router = Router();

// List all stories from last 24 hours (public, but can attach user if logged in)
router.get("/", authOptional, listStories);

// Create a new story (requires auth)
router.post("/", authRequired, createStory);

export default router;




