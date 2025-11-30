import Audio from "../models/Audio.js";

exports.uploadAudio = async (req, res) => {
  try {
    const { title, artist, url } = req.body;
    const newAudio = new Audio({ title, artist, url });
    await newAudio.save();
    res.status(201).json({ message: 'Audio uploaded successfully', audio: newAudio });
  } catch (err) {
    res.status(500).json({ error: 'Audio upload failed' });
  }
};

exports.getAllAudio = async (req, res) => {
  try {
    const audioFiles = await Audio.find().sort({ createdAt: -1 });
    res.json(audioFiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audio' });
  }
};
