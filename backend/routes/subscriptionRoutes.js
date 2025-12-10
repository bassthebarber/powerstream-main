// backend/routes/subscriptionRoutes.js
import { Router } from 'express';

const router = Router();

/**
 * Health check for subscriptions API
 * GET /api/subscriptions/health
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, route: '/api/subscriptions' });
});

/**
 * Example: GET /api/subscriptions
 * Replace this with real subscription logic later.
 */
router.get('/', (req, res) => {
  res.json([
    { id: 1, user: 'demoUser', plan: 'gold', status: 'active' },
    { id: 2, user: 'testUser', plan: 'silver', status: 'expired' }
  ]);
});

/**
 * Example: POST /api/subscriptions
 * Replace this with real subscription creation logic.
 */
router.post('/', (req, res) => {
  const { user, plan } = req.body;
  res.json({ ok: true, created: { user, plan, status: 'active' } });
});

export default router;
