import express from 'express';
import { uploadAudio, getAllAudio } from '../controllers/audioController.js';
import upload from '../utils/cloudinary.js';

const router = Router();

router.post('/upload', upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]), uploadAudio);

router.get('/', getAllAudio);

export default router;
