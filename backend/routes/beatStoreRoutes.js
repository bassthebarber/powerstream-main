// routes/beatStoreRoutes.js

import express from 'express';
import {
  uploadBeat,
  getAllBeats,
  purchaseBeat
} from '../recordingStudio/controllers/beatStoreController.js';

const router = express.Router();

router.post('/upload', uploadBeat);
router.get('/', getAllBeats);
router.post('/purchase', purchaseBeat);

export default router;
