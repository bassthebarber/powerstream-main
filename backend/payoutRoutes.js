import express from 'express';
import { createPayoutRequest, getAllPayoutRequests, approvePayout } from '../controllers/payoutController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// User requests payout
router.post('/', verifyToken, createPayoutRequest);

// Admin views all payout requests
router.get('/', verifyToken, isAdmin, getAllPayoutRequests);

// Admin approves payout
router.put('/:id/approve', verifyToken, isAdmin, approvePayout);

export default router;
