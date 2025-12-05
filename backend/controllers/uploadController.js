// backend/controllers/uploadController.js
// TODO: Config normalized to env.js for consistency.
import { v2 as cloudinary } from 'cloudinary';
import env from '../src/config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadAudio = async (req, res) => {
  try {
    const file = req.body.file;
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'video', // for audio and video
      folder: 'powerstream/audio',
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    const file = req.body.file;
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'video',
      folder: 'powerstream/video',
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};

export const uploadImage = async (req, res) => {
  try {
    const file = req.body.file;
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'image',
      folder: 'powerstream/images',
    });
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};
