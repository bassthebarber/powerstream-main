// backend/recordingStudio/controllers/beatStoreController.js
import Beat from '../models/Beat.js';

/**
 * @desc Upload a new beat
 * @route POST /api/beats/upload
 */
export const uploadBeat = async (req, res) => {
  try {
    const { title, genre, price, bpm, producerId, fileUrl } = req.body;

    const newBeat = new Beat({
      title,
      genre,
      price,
      bpm,
      producerId,
      fileUrl
    });

    await newBeat.save();
    res.status(201).json({
      success: true,
      message: '✅ Beat uploaded successfully',
      beat: newBeat
    });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to upload beat' });
  }
};

/**
 * @desc Fetch all beats
 * @route GET /api/beats
 */
export const getAllBeats = async (req, res) => {
  try {
    const beats = await Beat.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: beats.length,
      beats
    });
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch beats' });
  }
};

/**
 * @desc Get a single beat by ID
 * @route GET /api/beats/:id
 */
export const getBeatById = async (req, res) => {
  try {
    const beat = await Beat.findById(req.params.id);
    if (!beat) {
      return res.status(404).json({ success: false, message: 'Beat not found' });
    }
    res.status(200).json({
      success: true,
      beat
    });
  } catch (err) {
    console.error('❌ Fetch by ID error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch beat by ID' });
  }
};

/**
 * @desc Purchase a beat
 * @route POST /api/beats/purchase
 */
export const purchaseBeat = async (req, res) => {
  try {
    const { userId, beatId, amount } = req.body;

    const beat = await Beat.findById(beatId);
    if (!beat) {
      return res.status(404).json({ success: false, message: 'Beat not found' });
    }

    // Simulated payment logic — replace with real banking integration later
    console.log(`💰 User ${userId} purchased beat "${beat.title}" for $${amount}`);

    beat.purchases = (beat.purchases || 0) + 1;
    await beat.save();

    res.status(200).json({
      success: true,
      message: `✅ Purchase complete: "${beat.title}"`,
      beat
    });
  } catch (err) {
    console.error('❌ Purchase error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to process purchase' });
  }
};
