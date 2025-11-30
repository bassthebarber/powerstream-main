// /backend/recordingStudio/routes/winnerRoutes.js
import express from 'express';
import { awardLPAccess } from '../controllers/contestWinnerController.js';

const router = express.Router();

router.post('/award-lp', awardLPAccess); // Expects { userId, artistName }

export default router;
