// backend/middleware/uploadReel.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/reels directory exists
const reelsDir = path.join(process.cwd(), 'uploads', 'reels');
if (!fs.existsSync(reelsDir)) {
  fs.mkdirSync(reelsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reelsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for videos only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|mov|avi|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

// Multer instance
const uploadReel = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

export default uploadReel;
