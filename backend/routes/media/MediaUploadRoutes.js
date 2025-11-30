import express from 'express';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    // File buffer available in req.file.buffer
    const file = req.file;
    // You could forward this to Cloudinary, S3, or local storage

    res.json({ message: 'Media file uploaded', filename: file.originalname });
  } catch (err) {
    res.status(500).json({ error: 'Media upload failed' });
  }
});

export default router;
