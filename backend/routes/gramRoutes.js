// backend/routes/gramRoutes.js
import { Router } from 'express';
// import controllers as needed, e.g.:
// import { listGrams, createGram } from '../controllers/gramController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, service: 'gram' }));

// router.get('/', listGrams);
// router.post('/', createGram);

export default router;
