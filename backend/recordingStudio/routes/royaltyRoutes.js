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

// Get royalty statements
// GET /api/royalty/statements
router.get('/statements', async (req, res) => {
  try {
    const { userId, projectId, limit = 50 } = req.query;

    // Mock statements
    const statements = [
      {
        id: 'stmt_1',
        projectId: projectId || 'project_1',
        projectName: 'My Track',
        period: '2024-01',
        totalPlays: 1250,
        totalRevenue: 125.50,
        splits: [
          { name: 'Producer', percentage: 50, amount: 62.75 },
          { name: 'Artist', percentage: 30, amount: 37.65 },
          { name: 'Writer', percentage: 20, amount: 25.10 },
        ],
        createdAt: new Date('2024-01-31').toISOString(),
      },
    ];

    res.json({
      ok: true,
      statements: statements.slice(0, Number(limit)),
      total: statements.length,
    });
  } catch (error) {
    console.error('Error fetching statements:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
