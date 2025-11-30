import express from 'express';
import {
  createPayroll,
  getPayrollLogs,
  getPayrollByEmployee
} from '../controllers/PayrollController.js';

const router = express.Router();

router.post('/', createPayroll);
router.get('/', getPayrollLogs);
router.get('/employee/:id', getPayrollByEmployee);

export default router;
