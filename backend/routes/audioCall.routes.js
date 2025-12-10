import { Router } from "express";
const router = Router();
import audioCallController from "../controllers/audioCall.controller.js";

// Start an audio call
router.post('/start', audioCallController.startAudioCall);

// End an audio call
router.post('/end/:callId', audioCallController.endAudioCall);

// Get user audio calls
router.get('/user/:userId', audioCallController.getUserAudioCalls);

export default router;
