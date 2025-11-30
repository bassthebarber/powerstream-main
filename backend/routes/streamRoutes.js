// backend/routes/streamRoutes.js (ESM-safe)
import { Router } from 'express';

const router = Router();

/**
 * Health check for this router
 * GET /api/stream/health
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, route: '/api/stream' });
});

/**
 * (Optional) Example endpoints — keep or remove as you wire Livepeer
 * GET /api/stream/status
 */
router.get('/status', (req, res) => {
  res.json({ live: false, message: 'Stream service online (placeholder)' });
});

/**
 * POST /api/stream/webhook
 * (If you later add Livepeer webhooks, mount them here)
 */
router.post('/webhook', (req, res) => {
  // handle webhook payload here later
  res.status(204).end();
});

export default router;
