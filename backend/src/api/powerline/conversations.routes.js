// backend/src/api/powerline/conversations.routes.js
// Conversations Routes - PowerLine V5

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as conversationsController from "./conversations.controller.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/powerline/conversations - List user's conversations
router.get("/", conversationsController.list);

// POST /api/powerline/conversations - Create new conversation
router.post("/", conversationsController.create);

// GET /api/powerline/conversations/:id - Get conversation by ID
router.get("/:id", conversationsController.getById);

// PATCH /api/powerline/conversations/:id - Update conversation
router.patch("/:id", conversationsController.update);

// DELETE /api/powerline/conversations/:id - Leave conversation
router.delete("/:id", conversationsController.remove);

export default router;


