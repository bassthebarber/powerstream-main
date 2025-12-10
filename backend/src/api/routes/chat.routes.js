// backend/src/api/routes/chat.routes.js
// Canonical chat routes (PowerLine messaging)
import { Router } from "express";
import chatController from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// All chat routes require authentication
router.use(requireAuth);

// Threads
router.get("/threads", chatController.getThreads);
router.post("/threads", chatController.createThread);
router.get("/threads/:threadId", chatController.getMessages);
router.delete("/threads/:threadId", chatController.deleteThread);

// Messages
router.post("/threads/:threadId/messages", chatController.sendMessage);
router.post("/threads/:threadId/read", chatController.markAsRead);

// Unread count
router.get("/unread", chatController.getUnreadCount);

export default router;




