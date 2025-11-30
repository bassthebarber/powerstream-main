import express from 'express';
import { logRoyalty, getRoyaltyReport } from '../controllers/TVRoyaltyController.js';

const router = express.Router();

// Log royalty for a stream
router.post('/log', logRoyalty);

// Get royalty reports by station or creator
router.get('/report/:type/:id', getRoyaltyReport);

export default router;
