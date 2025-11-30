import express from 'express';
import {
  createShow,
  getAllShows,
  getShowById,
  updateShow,
  deleteShow,
} from '../controllers/showController.js';

const router = Router();

// Create a new show
router.post('/', createShow);

// Get all shows
router.get('/', getAllShows);

// Get one show by ID
router.get('/:id', getShowById);

// Update show by ID
router.put('/:id', updateShow);

// Delete show by ID
router.delete('/:id', deleteShow);

export default router;
