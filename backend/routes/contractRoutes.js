// backend/routes/contractRoutes.js
import express from 'express';
import { verifyContract, triggerRoyaltyPayout } from '../recordingStudio/controllers/contractController.js';

const router = express.Router();

// Verify a smart contract (valid signature, structure, etc)
router.post('/verify', verifyContract);

// Trigger royalty payout based on contract terms
router.post('/payout', triggerRoyaltyPayout);

export default router;
