// routes/mixingRoutes.js
import express from 'express';
import { mixTrack, masterTrack, enhanceVocals } from '../controllers/mixingController.js';

const router = express.Router();

// 🎚️ Mix raw vocals with beat
router.post('/mix', mixTrack);

// 🎧 Master a final mix to industry loudness levels
router.post('/master', masterTrack);

// 🔊 Enhance vocal clarity and balance
router.post('/enhance', enhanceVocals);

export default router;
