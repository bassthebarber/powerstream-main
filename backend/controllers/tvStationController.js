import Station from '../models/stationModel.js';

export const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
};

export const getStationBySlug = async (req, res) => {
  try {
    const station = await Station.findOne({ slug: req.params.slug });
    if (!station) return res.status(404).json({ error: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching station' });
  }
};
