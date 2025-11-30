// backend/routes/videoRoutes.js
import { Router } from 'express';
// If you already have controller logic, import it here, e.g.:
// import { listVideos, uploadVideo } from '../controllers/videoController.js';

const router = Router();

// Health check for this route
router.get('/health', (req, res) => res.json({ ok: true, service: 'video' }));

// Example endpoints (replace with real ones)
// router.get('/', listVideos);
// router.post('/upload', uploadVideo);

export default router;
