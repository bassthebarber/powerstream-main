// backend/controllers/ReelsController.js

import Reel from '../models/Reelmodel.js'; // Make sure Reel.js is in backend/models
import path from 'path';
import fs from 'fs';

// 📌 Upload a new reel
export const uploadReel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const reel = new Reel({
      user: req.user.id,
      videoUrl: `/uploads/reels/${req.file.filename}`,
      caption: req.body.caption || '',
      likes: [],
      comments: []
    });

    await reel.save();
    res.status(201).json({ message: 'Reel uploaded successfully', reel });
  } catch (error) {
    console.error('Error uploading reel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Get all reels
export const getReels = async (req, res) => {
  try {
    const reels = await Reel.find().populate('user', 'username avatar').sort({ createdAt: -1 });
    res.status(200).json(reels);
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Like a reel
export const likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    if (!reel.likes.includes(req.user.id)) {
      reel.likes.push(req.user.id);
      await reel.save();
    }

    res.status(200).json({ message: 'Reel liked successfully' });
  } catch (error) {
    console.error('Error liking reel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Comment on a reel
export const commentOnReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    reel.comments.push({
      user: req.user.id,
      text: req.body.text
    });

    await reel.save();
    res.status(201).json({ message: 'Comment added successfully', reel });
  } catch (error) {
    console.error('Error commenting on reel:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
