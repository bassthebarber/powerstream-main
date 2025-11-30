// backend/routes/royaltyRoutes.js
import express from 'express';
import { logRoyalty, getRoyalties, calculatePayout } from '../recordingStudio/controllers/royaltyController.js';

const router = express.Router();

router.post('/log', logRoyalty);
router.get('/', getRoyalties);
router.get('/payout/:trackId', calculatePayout);

export default router;
