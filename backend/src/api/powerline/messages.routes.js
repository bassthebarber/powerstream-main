// backend/src/api/powerline/messages.routes.js
// Messages Routes - PowerLine V5

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as messagesController from "./messages.controller.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Conversation messages
// GET /api/powerline/conversations/:conversationId/messages
router.get("/conversations/:conversationId/messages", messagesController.list);

// POST /api/powerline/conversations/:conversationId/messages
router.post("/conversations/:conversationId/messages", messagesController.send);

// Individual message operations
// GET /api/powerline/messages/:id
router.get("/messages/:id", messagesController.getById);

// PATCH /api/powerline/messages/:id
router.patch("/messages/:id", messagesController.update);

// DELETE /api/powerline/messages/:id
router.delete("/messages/:id", messagesController.remove);

// Reactions
// POST /api/powerline/messages/:id/reactions
router.post("/messages/:id/reactions", messagesController.addReaction);

// DELETE /api/powerline/messages/:id/reactions
router.delete("/messages/:id/reactions", messagesController.removeReaction);

export default router;



