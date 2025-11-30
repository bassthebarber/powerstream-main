// backend/routes/reelRoutes.js
import { Router } from 'express';
// import controllers if/when you have them, e.g.:
// import { listReels, createReel } from '../controllers/reelController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, service: 'reels' }));

// router.get('/', listReels);
// router.post('/', createReel);

export default router;
