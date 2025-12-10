// backend/routes/media/stationUpload.js

import { Router } from "express";
import multer from "multer";
import Station from "../../models/Stationmodel.js";
import Media from "../../models/ArtistMedia.js";

// Note: These imports may need adjustment based on actual file locations
// import { uploadToCloudinary } from "../../configs/cloudinary.js";
// import { validateUpload } from "../../uploads/validateUpload.js";
// import { cleanupTempFiles } from "../../uploads/cleanupTempFiles.js";
// import { onUploadSuccess } from "../../hooks/onUploadSuccess.js";

const router = Router();

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

    // TODO: Re-enable these when the modules are converted to ESM
    // validateUpload(file);
    // const uploaded = await uploadToCloudinary(file.path, 'stations');

    // Placeholder response
    const mediaRecord = new Media({
      station: stationId,
      user: userId,
      mediaUrl: `/uploads/${file.filename}`,
      type: file.mimetype,
    });

    await mediaRecord.save();

    // TODO: Re-enable hook
    // await onUploadSuccess({ userId, fileUrl: uploaded.secure_url, type: uploaded.resource_type });
    // cleanupTempFiles(file.path);

    res.status(200).json({ message: 'Upload successful', data: mediaRecord });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
