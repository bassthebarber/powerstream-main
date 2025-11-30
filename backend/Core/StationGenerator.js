// backend/core/stationGenerator.js
import Station from '../models/Stationmodel.js';
import crypto from 'crypto';

// Generate a unique stream key
const generateStreamKey = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Create a new station
export const createStation = async ({ ownerId, name, description }) => {
  try {
    const streamKey = generateStreamKey();
    const newStation = new Station({
      ownerId,
      name,
      description,
      streamKey,
      isLive: false,
      createdAt: new Date(),
    });
    await newStation.save();

    return { success: true, station: newStation };
  } catch (err) {
    console.error("StationGenerator Error:", err);
    return { success: false, message: err.message };
  }
};

// Regenerate stream key for a station
export const regenerateStreamKey = async (stationId) => {
  try {
    const newKey = generateStreamKey();
    const station = await Station.findByIdAndUpdate(
      stationId,
      { streamKey: newKey },
      { new: true }
    );
    return { success: true, station };
  } catch (err) {
    console.error("RegenerateStreamKey Error:", err);
    return { success: false, message: err.message };
  }
};
