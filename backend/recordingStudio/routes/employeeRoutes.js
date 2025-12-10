import express from 'express';
import {
  hireEmployee,
  fireEmployee,
  getEmployees
} from '../controllers/EmployeeController.js';

const router = express.Router();

router.post('/', hireEmployee);
router.delete('/:id', fireEmployee);
router.get('/', getEmployees);

export default router;
