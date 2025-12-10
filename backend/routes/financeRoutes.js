// backend/routes/financeRoutes.js
import express from 'express';
import { getFinanceSummary, getAllTransactions, getUserTransactions } from '../controllers/financeController.js';

const router = express.Router();

router.get('/summary', getFinanceSummary);
router.get('/transactions', getAllTransactions);
router.get('/transactions/:userId', getUserTransactions);

export default router;
