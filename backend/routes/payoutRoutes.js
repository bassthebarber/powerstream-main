// backend/routes/payoutRoutes.js
import { Router } from 'express';

const router = Router();

/**
 * Health check for payouts API
 * GET /api/payouts/health
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, route: '/api/payouts' });
});

/**
 * Example: GET /api/payouts
 * (Replace with real controller logic)
 */
router.get('/', (req, res) => {
  res.json([
    { id: 1, user: 'demoUser', amount: 100, status: 'completed' },
    { id: 2, user: 'testUser', amount: 50, status: 'pending' }
  ]);
});

/**
 * Example: POST /api/payouts
 * (Replace with real payout creation logic)
 */
router.post('/', (req, res) => {
  const { user, amount } = req.body;
  res.json({ ok: true, created: { user, amount, status: 'pending' } });
});

export default router;
