// backend/routes/streamRoutes.js
// Golden TV Subsystem - Stream Routes
import { Router } from 'express';
import {
  startStream,
  stopStream,
  getCurrentStreamForStation,
  getAllLiveStreams,
  getStreamHistory
} from '../controllers/streamController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Only station owners / admins can start/stop streams
router.post('/start', requireAuth, requireRole(['admin', 'stationOwner']), startStream);
router.post('/stop', requireAuth, requireRole(['admin', 'stationOwner']), stopStream);

// Public: current stream info for a station
router.get('/station/:slug/current', getCurrentStreamForStation);

// Public: all currently live streams
router.get('/live', getAllLiveStreams);

// Public: stream history for a station
router.get('/history/:slug', getStreamHistory);

export default router;
