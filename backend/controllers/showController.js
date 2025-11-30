import Show from '../models/showModel.js';

// Create a new show
export const createShow = async (req, res) => {
  try {
    const { title, description, date, station } = req.body;
    const newShow = new Show({ title, description, date, station });
    await newShow.save();
    console.log("✅ Created new show:", title);
    res.status(201).json({ message: 'Show created', show: newShow });
  } catch (error) {
    console.error("❌ Error creating show:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find();
    res.status(200).json(shows);
  } catch (error) {
    console.error("❌ Error fetching shows:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one show by ID
export const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.status(200).json(show);
  } catch (error) {
    console.error("❌ Error fetching show:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update show by ID
export const updateShow = async (req, res) => {
  try {
    const updated = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Show not found' });
    res.status(200).json({ message: 'Show updated', show: updated });
  } catch (error) {
    console.error("❌ Error updating show:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete show by ID
export const deleteShow = async (req, res) => {
  try {
    const deleted = await Show.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Show not found' });
    res.status(200).json({ message: 'Show deleted' });
  } catch (error) {
    console.error("❌ Error deleting show:", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

