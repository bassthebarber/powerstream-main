// backend/controllers/audioController.js

import Audio from "../models/Audio.js";

export const uploadAudio = async (req, res) => {
  try {
    const { title, artist, url } = req.body;
    const newAudio = new Audio({ title, artist, url });
    await newAudio.save();
    res.status(201).json({ message: 'Audio uploaded successfully', audio: newAudio });
  } catch (err) {
    res.status(500).json({ error: 'Audio upload failed' });
  }
};

export const getAllAudio = async (req, res) => {
  try {
    const audioFiles = await Audio.find().sort({ createdAt: -1 });
    res.json(audioFiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audio' });
  }
};
