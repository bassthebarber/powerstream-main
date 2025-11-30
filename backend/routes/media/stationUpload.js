// backend/routes/media/stationUpload.js

import { Router } from "express";
const multer = require('multer');
const router = Router();

const { uploadToCloudinary } = require('../../configs/cloudinary');
const { validateUpload } = require('../../uploads/validateUpload');
const { cleanupTempFiles } = require('../../uploads/cleanupTempFiles');
const { onUploadSuccess } = require('../../hooks/onUploadSuccess');

import Station from "../../models/Stationmodel.js";
import Media from "../../models/ArtistMedia.js"; // or your media model

// Multer setup (disk storage for temp file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'temp/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

/**
 * @route POST /api/media/station-upload/:stationId
 * @desc Upload media file to a specific station
 */
router.post('/:stationId', upload.single('file'), async (req, res) => {
  const stationId = req.params.stationId;
  const userId = req.body.userId;
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file (size/type)
    validateUpload(file);

    // Upload to Cloudinary
    const uploaded = await uploadToCloudinary(file.path, 'stations');

    // Save to DB (optional)
    const mediaRecord = new Media({
      station: stationId,
      user: userId,
      mediaUrl: uploaded.secure_url,
      type: uploaded.resource_type,
    });

    await mediaRecord.save();

    // Trigger upload hook
    await onUploadSuccess({
      userId,
      fileUrl: uploaded.secure_url,
      type: uploaded.resource_type,
    });

    // Cleanup
    cleanupTempFiles(file.path);

    res.status(200).json({ message: 'Upload successful', data: mediaRecord });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
