import express from 'express';
import { sampleAudio } from '../services/sampleAIEngine.js';

const router = express.Router();

router.post('/sample', (req, res) => {
  const { trackPath } = req.body;
  const result = sampleAudio(trackPath);
  res.json(result);
});

export default router;
