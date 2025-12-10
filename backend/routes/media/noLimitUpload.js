import express from 'express';
import multer from 'multer';
const router = Router();

// Separate storage for audio & video
const audioStorage = multer({ dest: 'uploads/noLimit/audio/' });
const videoStorage = multer({ dest: 'uploads/noLimit/video/' });

// Audio Upload Route
router.post("/upload/noLimit/audio", audioStorage.single("audio"), (req, res) => {
  console.log(`🎵 Audio Uploaded to No Limit East Houston: ${req.file.originalname}`);
  res.json({
    status: "success",
    type: "audio",
    message: "Audio uploaded successfully",
    file: req.file
  });
});

// Video Upload Route
router.post("/upload/noLimit/video", videoStorage.single("video"), (req, res) => {
  console.log(`🎥 Video Uploaded to No Limit East Houston: ${req.file.originalname}`);
  res.json({
    status: "success",
    type: "video",
    message: "Video uploaded successfully",
    file: req.file
  });
});

export default router;
