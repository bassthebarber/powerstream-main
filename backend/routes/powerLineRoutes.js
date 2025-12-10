// backend/routes/powerLineRoutes.js
import { Router } from "express";
import {
  listChats,
  getChat,
  createChat,
} from "../controllers/ChatController.js";
import {
  listMessages,
  sendMessage,
} from "../controllers/chatmessageController.js";
import { authRequired } from "../middleware/requireAuth.js";

const router = Router();

// All PowerLine routes require auth
router.use(authRequired);

// Conversations
router.get("/conversations", listChats);
router.get("/conversations/:id", getChat);
router.post("/conversations", createChat);

// Messages
router.get("/messages/:conversationId", listMessages);
router.post("/messages/:conversationId", sendMessage);

export default router;





