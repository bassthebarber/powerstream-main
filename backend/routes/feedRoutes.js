// backend/routes/feedRoutes.js
import { Router } from 'express';
import { getFeed, createPost } from '../controllers/feedController.js';
// import any middlewares similarly: import auth from '../middleware/auth.js'

const router = Router();

router.get('/', getFeed);
router.post('/', createPost);

export default router;
