import express from 'express';
import {
  createCollabSession,
  getAllCollabSessions,
  getCollabById
} from '../controllers/collabSessionController.js';

const router = express.Router();

router.post('/', createCollabSession);
router.get('/', getAllCollabSessions);
router.get('/:id', getCollabById);

export default router;
