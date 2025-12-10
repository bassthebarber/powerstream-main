// AutoDistribute.js
import axios from 'axios';

export const autoDistribute = async ({ platform, videoURL, metadata }) => {
  try {
    const endpointMap = {
      roku: '/api/distribute/roku',
      firetv: '/api/distribute/firetv',
      appletv: '/api/distribute/appletv'
    };

    const endpoint = endpointMap[platform];
    if (!endpoint) throw new Error('Unsupported platform');

    const res = await axios.post(endpoint, { videoURL, metadata });
    return res.data;
  } catch (error) {
    console.error(`AutoDistribute failed:`, error);
    return { status: 'error', message: error.message };
  }
};

// TVAutoRouter.js
import express from 'express';
const router = express.Router();

router.post('/roku', (req, res) => {
  console.log('📺 Distributing to Roku:', req.body);
  res.json({ status: 'success', platform: 'roku' });
});

router.post('/firetv', (req, res) => {
  console.log('🔥 Distributing to Fire TV:', req.body);
  res.json({ status: 'success', platform: 'firetv' });
});

router.post('/appletv', (req, res) => {
  console.log('🍎 Distributing to Apple TV:', req.body);
  res.json({ status: 'success', platform: 'appletv' });
});

export default router;
