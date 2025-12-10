// backend/routes/stationRoutes.js
// Golden TV Subsystem - Station Routes
import { Router } from 'express';
import {
  getStation,
  getStationVideos,
  getStationLive,
  uploadStationVideo
} from '../controllers/stationController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/stations/:slug - Get basic station info
router.get('/:slug', getStation);

// GET /api/stations/:slug/videos - VOD shelf for station
router.get('/:slug/videos', getStationVideos);

// GET /api/stations/:slug/live - Current live stream for station
router.get('/:slug/live', getStationLive);

// POST /api/stations/:slug/videos - Upload video to station (auth required)
router.post('/:slug/videos', requireAuth, requireRole(['admin', 'stationOwner']), uploadStationVideo);

export default router;
