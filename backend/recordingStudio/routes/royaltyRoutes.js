// royaltyRoutes.js
// Royalty management routes - plays, payouts, and splits

import express from 'express';
import {
  logPlay,
  calculateRoyalties,
  getRoyaltyReport,
  getSplits,
  createSplit,
  getSplitById,
} from '../controllers/royaltyController.js';

const router = express.Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Royalty API' });
});

// === ROYALTY SPLITS ===

// Get all splits
router.get('/splits', getSplits);

// Create a new split
router.post('/splits', createSplit);

// Get single split by ID
router.get('/splits/:id', getSplitById);

// === PLAY TRACKING ===

// Log when a track is played
router.post('/log-play', logPlay);

// Calculate royalty payouts (internal trigger)
router.post('/calculate', calculateRoyalties);

// Fetch royalty report per user or global
router.get('/report/:userId', getRoyaltyReport);

export default router;
