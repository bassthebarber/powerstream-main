// backend/routes/postRoutes.js

import express from 'express';
import { createPost, getAllPosts } from '../controllers/postController.js';

const router = Router();

router.post('/', createPost);
router.get('/', getAllPosts);

export default router;
