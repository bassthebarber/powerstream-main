// backend/controllers/contractController.js
import Contract from '../models/Contract.js';

// POST /api/contracts/verify
export const verifyContract = async (req, res) => {
  try {
    const { artistAddress, platformAddress, splits, signature } = req.body;

    // Basic validation (replace with actual crypto verification later)
    if (!artistAddress || !platformAddress || !splits || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if contract already exists
    const existing = await Contract.findOne({ artistAddress, platformAddress });
    if (existing) {
      return res.status(200).json({ message: 'Contract already verified', contract: existing });
    }

    const newContract = await Contract.create({
      artistAddress,
      platformAddress,
      splits,
      signature,
    });

    res.status(201).json({ message: 'Contract verified', contract: newContract });
  } catch (err) {
    res.status(500).json({ error: 'Server error during contract verification' });
  }
};

// POST /api/contracts/payout
export const handlePayout = async (req, res) => {
  try {
    const { artistAddress, amount } = req.body;
    const contract = await Contract.findOne({ artistAddress });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const artistShare = (contract.splits.artist / 100) * amount;
    const platformShare = (contract.splits.platform / 100) * amount;

    // Placeholder: Log payout
    console.log(`Paying artist ${artistAddress} $${artistShare}, platform gets $${platformShare}`);

    res.status(200).json({ message: 'Payout processed', artist: artistShare, platform: platformShare });
  } catch (err) {
    res.status(500).json({ error: 'Server error during payout' });
  }
};
