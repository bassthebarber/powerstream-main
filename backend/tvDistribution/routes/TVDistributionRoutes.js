// backend/tvDistribution/routes/TVDistributionRoutes.js

import express from 'express';
import TVController from '../controllers/TVController.js';

const router = express.Router();

// General TV distribution endpoints
router.post('/sync', TVController.syncTVContent);
router.get('/catalog', TVController.getAllTVContent);
router.post('/schedule', TVController.scheduleShow);

export default router;
