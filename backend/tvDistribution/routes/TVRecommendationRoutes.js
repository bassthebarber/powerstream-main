// backend/tvDistribution/routes/TVRecommendationRoutes.js

import express from 'express';
import TVRecommendationController from '../controllers/TVRecommendationController.js';

const router = express.Router();

// Get recommendations for a user (or global)
router.get('/recommendations/:userId?', TVRecommendationController.getRecommendations);

// Get trending TV content globally or by genre
router.get('/trending', TVRecommendationController.getTrendingContent);

// Get SmartQueue for auto-scheduled continuous play
router.get('/smartqueue/:region?', TVRecommendationController.getSmartQueue);

export default router;
