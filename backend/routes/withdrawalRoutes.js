// backend/routes/withdrawalRoutes.js
import { Router } from 'express';

const router = Router();

/**
 * Health check for withdrawals API
 * GET /api/withdrawals/health
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, route: '/api/withdrawals' });
});

/**
 * Example: GET /api/withdrawals
 * Replace with real withdrawal lookup.
 */
router.get('/', (req, res) => {
  res.json([
    { id: 1, user: 'demoUser', amount: 50, status: 'pending' },
    { id: 2, user: 'testUser', amount: 100, status: 'processed' }
  ]);
});

/**
 * Example: POST /api/withdrawals
 * Replace with real withdrawal creation.
 */
router.post('/', (req, res) => {
  const { user, amount } = req.body;
  res.json({ ok: true, created: { user, amount, status: 'pending' } });
});

export default router;
