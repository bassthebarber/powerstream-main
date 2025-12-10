// backend/routes/chatRoomRoutes.js
import { Router } from "express";
const router = Router();
import chatRoomController from "../controllers/chatRoomController.js";

router.post('/create', chatRoomController.createRoom);
router.get('/user/:userId', chatRoomController.getUserRooms);

export default router;
