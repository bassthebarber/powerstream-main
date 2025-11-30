// backend/tvDistribution/controllers/TVRecommendationController.js

import TVRecommendationAI from '../services/TVRecommendationAI.js';

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const recommendations = await TVRecommendationAI(userId);
    res.json({ success: true, recommendations });
  } catch (err) {
    console.error('Recommendation Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations.' });
  }
};

export const getTrendingContent = async (_req, res) => {
  try {
    const trending = await TVRecommendationAI.getTrending();
    res.json({ success: true, trending });
  } catch (err) {
    console.error('Trending Fetch Error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch trending content.' });
  }
};

export const getSmartQueue = async (req, res) => {
  try {
    const region = req.query.region || 'US';
    const queue = await TVRecommendationAI.getSmartQueue(region);
    res.json({ success: true, queue });
  } catch (err) {
    console.error('Smart Queue Error:', err);
    res.status(500).json({ success: false, message: 'Smart Queue generation failed.' });
  }
};
