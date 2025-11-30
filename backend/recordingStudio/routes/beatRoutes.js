import express from 'express';
import {
  uploadBeat,
  getAllBeats,
  getBeatById,
  purchaseBeat
} from '../controllers/beatStoreController.js';

const router = express.Router();

router.get('/', getAllBeats);
router.get('/:id', getBeatById);
router.post('/upload', uploadBeat);
router.post('/purchase', purchaseBeat);

export default router;
