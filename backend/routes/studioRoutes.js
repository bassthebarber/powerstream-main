// Backend/routes/studioRoutes.js
import express from 'express';
import {
  activateAIStudio,
  runMixingSequence,
} from '../recordingStudio/controllers/studioController.js';

const router = express.Router();

router.post('/activate', activateAIStudio);
router.post('/sequence', runMixingSequence);

// Export route is handled by studioExportRoutes.js
// router.post('/export', ...) moved to studioExportRoutes.js

export default router;