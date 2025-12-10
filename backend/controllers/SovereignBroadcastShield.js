// backend/controllers/SovereignBroadcastShield.js

import SovereignStation from "../models/SovereignStationRegistry.js";

export const verifySovereignStation = async (req, res) => {
  try {
    const { stationName, key } = req.body;
    const match = await SovereignStation.findOne({ stationName, key });

    if (!match || !match.isActive) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or inactive sovereign station key.' });
    }

    return res.status(200).json({ message: 'Sovereign station verified.', station: match });
  } catch (err) {
    return res.status(500).json({ message: 'Error verifying sovereign station.', error: err.message });
  }
};
