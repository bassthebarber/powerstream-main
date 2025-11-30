import { Router } from "express";
const router = Router();
import videoCallController from "../controllers/videoCall.controller.js";

// Start a video call
router.post('/start', videoCallController.startVideoCall);

// End a video call
router.post('/end/:callId', videoCallController.endVideoCall);

// Get user video calls
router.get('/user/:userId', videoCallController.getUserVideoCalls);

export default router;
