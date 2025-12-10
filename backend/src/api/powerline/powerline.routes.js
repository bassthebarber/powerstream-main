// backend/src/api/powerline/powerline.routes.js
// PowerLine V5 REST API (Messenger-style)
// Base path: /api/powerline

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as powerlineController from "./powerline.controller.js";

const router = Router();

// All PowerLine endpoints require auth
router.use(requireAuth);

// List chats (conversations) for current user
// GET /api/powerline/chats?limit=20&page=1
router.get("/chats", powerlineController.listUserChats);

// Create a new chat (1:1 or group)
// POST /api/powerline/chats
router.post("/chats", powerlineController.createChat);

// Get a single chat by ID
// GET /api/powerline/chats/:chatId
router.get("/chats/:chatId", powerlineController.getChatById);

// List messages in a chat
// GET /api/powerline/chats/:chatId/messages?limit=50&before=&after=
router.get("/chats/:chatId/messages", powerlineController.listMessages);

// Send a new message
// POST /api/powerline/chats/:chatId/messages
router.post("/chats/:chatId/messages", powerlineController.sendMessage);

// Health check (no auth)
router.get("/health", (req, res) => {
  res.json({ success: true, message: "PowerLine API running", version: "5.1" });
});

export default router;
