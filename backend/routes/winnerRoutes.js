// backend/routes/winnerRoutes.js
import express from 'express';
import { registerWinner, getWinners } from '../controllers/studioController.js';

const router = express.Router();

router.post('/register', registerWinner);
router.get('/all', getWinners);

export default router;
