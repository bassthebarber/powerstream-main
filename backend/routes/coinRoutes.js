// backend/routes/coinRoutes.js
import { Router } from 'express';
import { buyCoins, tipCreator } from '../controllers/coinController.js';
import { authRequired } from '../middleware/requireAuth.js';

const router = Router();

/**
 * Health check for coins API
 * GET /api/coins/health
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, route: '/api/coins' });
});

/**
 * Buy coins (mocked payment)
 * POST /api/coins/buy
 */
router.post('/buy', authRequired, buyCoins);

/**
 * Tip a creator on a feed post
 * POST /api/coins/tip
 */
router.post('/tip', authRequired, tipCreator);

/**
 * Example: GET /api/coins/balance
 * (Replace with real controller logic later)
 */
router.get('/balance', (req, res) => {
  res.json({ balance: 0, currency: 'PSC' }); // PSC = PowerStream Coins
});

/**
 * Example: POST /api/coins/send
 * (Replace with real send logic later)
 */
router.post('/send', (req, res) => {
  const { toUser, amount } = req.body;
  res.json({ ok: true, sent: { toUser, amount } });
});

export default router;
