import express from 'express';
import { createShow, getShowsByStation, getShowById } from '../controllers/showController.js';
const router = Router();

router.post('/', createShow);
router.get('/station/:stationId', getShowsByStation);
router.get('/:id', getShowById);

export default router;
