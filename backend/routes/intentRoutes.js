// backend/routes/intentRoutes.js
import { Router } from 'express';

const router = Router();

/**
 * Health check for intents API
 * GET /api/intents/health
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, route: '/api/intents' });
});

/**
 * Example: GET /api/intents
 * Replace with real intent logic (AI / NLP / Copilot).
 */
router.get('/', (req, res) => {
  res.json([
    { id: 1, intent: 'play_music', status: 'ok' },
    { id: 2, intent: 'open_feed', status: 'ok' }
  ]);
});

/**
 * Example: POST /api/intents
 */
router.post('/', (req, res) => {
  const { intent, payload } = req.body;
  res.json({ ok: true, received: { intent, payload } });
});

export default router;
