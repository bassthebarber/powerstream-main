// backend/routes/audioRoutes.js
import { Router } from 'express';
// If you have controllers, import them here, e.g.:
// import { listAudio, uploadAudio } from '../controllers/audioController.js';

const router = Router();

// tiny health check so you can curl it
router.get('/health', (req, res) => res.json({ ok: true, service: 'audio' }));

// Example REST stubs (uncomment and wire when ready):
// router.get('/', listAudio);
// router.post('/upload', uploadAudio);

export default router;
