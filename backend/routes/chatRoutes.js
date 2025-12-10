// backend/routes/chatRoutes.js
import { Router } from "express";
import {
  listChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant,
} from "../controllers/ChatController.js";
import {
  listMessages,
  sendMessage,
  addReaction,
  removeReaction,
} from "../controllers/chatmessageController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// router.use(protect);

router.get("/", listChats);                       // ?user=<userId>
router.get("/:id", getChat);
router.post("/", createChat);
router.patch("/:id", updateChat);
router.delete("/:id", deleteChat);
router.post("/:id/participants", addParticipant);
router.delete("/:id/participants/:userId", removeParticipant);

// Messages REST API
// GET /api/chat/:chatId/messages
router.get("/:chatId/messages", listMessages);
// POST /api/chat/:chatId/messages
router.post("/:chatId/messages", sendMessage);

// Reactions API
// POST /api/chat/:chatId/messages/:messageId/reactions
router.post("/:chatId/messages/:messageId/reactions", addReaction);
// DELETE /api/chat/:chatId/messages/:messageId/reactions
router.delete("/:chatId/messages/:messageId/reactions", removeReaction);

export default router;
