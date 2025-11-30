// backend/core/stationPermissions.js
import Station from '../models/Stationmodel.js';
import User from '../models/Usermodel.js';

// Check if user is station owner
export const isStationOwner = async (userId, stationId) => {
  const station = await Station.findById(stationId);
  return station?.ownerId?.toString() === userId.toString();
};

// Check if user has permission to stream
export const canStream = async (userId, stationId) => {
  const station = await Station.findById(stationId);
  if (!station) return false;

  // Owners can always stream
  if (station.ownerId.toString() === userId.toString()) return true;

  // Check if user is in authorized broadcasters list
  return station.authorizedUsers?.some(
    (id) => id.toString() === userId.toString()
  ) || false;
};

// Grant a user streaming permission
export const grantStreamPermission = async (stationId, userId) => {
  try {
    const station = await Station.findById(stationId);
    if (!station) return { success: false, message: "Station not found" };

    if (!station.authorizedUsers.includes(userId)) {
      station.authorizedUsers.push(userId);
    }
    await station.save();

    return { success: true, station };
  } catch (err) {
    console.error("GrantPermission Error:", err);
    return { success: false, message: err.message };
  }
};

// Revoke streaming permission
export const revokeStreamPermission = async (stationId, userId) => {
  try {
    const station = await Station.findById(stationId);
    if (!station) return { success: false, message: "Station not found" };

    station.authorizedUsers = station.authorizedUsers.filter(
      (id) => id.toString() !== userId.toString()
    );
    await station.save();

    return { success: true, station };
  } catch (err) {
    console.error("RevokePermission Error:", err);
    return { success: false, message: err.message };
  }
};
