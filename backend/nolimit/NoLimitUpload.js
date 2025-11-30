import express from 'express';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Upload exclusive No Limit content (videos, tracks)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    // Stub: replace with actual storage logic (Cloudinary, S3, etc.)
    console.log('🎤 No Limit Upload:', file.originalname);

    res.status(200).json({
      message: 'Upload successful for No Limit',
      filename: file.originalname,
    });
  } catch (err) {
    res.status(500).json({ error: 'No Limit upload failed' });
  }
});

export default router;
