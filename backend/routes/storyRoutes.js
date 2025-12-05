import { Router } from "express";
import { authRequired } from "../middleware/requireAuth.js";
import { createStory, listStories } from "../controllers/storyController.js";

const router = Router();

// List all stories from last 24 hours
router.get("/", authRequired, listStories);

// Create a new story
router.post("/", authRequired, createStory);

export default router;



