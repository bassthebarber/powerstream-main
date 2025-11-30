// royaltyRoutes.js

import express from 'express';
import {
  logPlay,
  calculateRoyalties,
  getRoyaltyReport
} from '../controllers/royaltyController.js';

const router = express.Router();

// Log when a track is played
router.post('/log-play', logPlay);

// Calculate royalty payouts (internal trigger)
router.post('/calculate', calculateRoyalties);

// Fetch royalty report per user or global
router.get('/report/:userId', getRoyaltyReport);

export default router;
