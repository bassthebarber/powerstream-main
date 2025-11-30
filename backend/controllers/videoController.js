import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Video from '../models/videoModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload a new video
export const uploadVideo = async (req, res) => {
  try {
    const { title, description, artist } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const newVideo = new Video({
      title,
      description,
      artist,
      filePath: videoFile.path,
    });

    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ message: 'Server error during video upload' });
  }
};

// Stream video by ID
export const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const videoPath = path.resolve(video.filePath);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });

      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    console.error('Video stream error:', err);
    res.status(500).json({ message: 'Server error during video stream' });
  }
};

// Get all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
};
