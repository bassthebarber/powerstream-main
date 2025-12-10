// backend/routes/adminFinanceRoutes.js
import express from 'express';
import { getFinancialSummary } from '../controllers/financeController.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/summary', isAdmin, getFinancialSummary);

export default router;
