// backend/routes/vodRoutes.js
// Golden TV Subsystem - VOD Routes
// Provides /api/vod endpoint for video-on-demand library
import { Router } from 'express';
import { getVOD } from '../controllers/tvController.js';

const router = Router();

// GET /api/vod?limit=20&stationId=civic-connect
// stationId can be a slug or MongoDB ObjectId
router.get('/', getVOD);

export default router;
