// backend/routes/chatRoutes.js
import express from "express";
import {
  listChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant,
} from "../controllers/ChatController.js";
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

export default router;
