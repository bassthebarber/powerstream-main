// backend/middleware/contractLock.js

import Contract from '../models/Contract.js';

export const contractLock = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized access.' });
  }

  try {
    const activeContract = await Contract.findOne({
      artistId: userId,
      status: 'active'
    });

    if (!activeContract) {
      return res.status(403).json({
        error: 'No active contract found. Please sign a contract to proceed.'
      });
    }

    req.contract = activeContract;
    next();
  } catch (err) {
    console.error('contractLock error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
