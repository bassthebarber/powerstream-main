// backend/routes/chatMessageRoutes.js
import express from "express";
import {
  listMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/ChatMessageController.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// router.use(protect);

router.get("/", listMessages);
router.post("/", sendMessage);
router.delete("/:messageId", deleteMessage);

export default router;
