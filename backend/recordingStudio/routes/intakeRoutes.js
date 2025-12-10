import express from 'express';
import {
  registerIntake,
  getAllIntakes,
  updateIntakeStatus
} from '../controllers/IntakeController.js';

const router = express.Router();

router.post('/register', registerIntake);
router.get('/', getAllIntakes);
router.patch('/:id', updateIntakeStatus);

export default router;
