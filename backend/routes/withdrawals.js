import express from 'express';
import {
  createWithdrawal,
  getWithdrawals
} from '../controllers/withdrawalController.js';

const router = Router();

// POST - Create withdrawal
router.post('/', createWithdrawal);

// GET - All withdrawals (optional admin view)
router.get('/', getWithdrawals);

export default router;
