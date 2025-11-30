// /backend/recordingStudio/controllers/sampleController.js

import { sampleAudio } from '../services/sampleAIEngine.js';
import path from 'path';
import fs from 'fs';

export const handleSampleRequest = async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'Audio file path is missing or invalid' });
    }

    const result = sampleAudio(filePath);

    res.status(200).json({
      message: 'Sample analysis complete',
      data: result
    });
  } catch (err) {
    console.error('SampleController error:', err.message);
    res.status(500).json({ error: 'Failed to process sample audio' });
  }
};
