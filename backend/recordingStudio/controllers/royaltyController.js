// backend/recordingStudio/controllers/royaltyController.js
// Royalty and Split Management

// In-memory storage for splits (TODO: Replace with MongoDB model)
let splitStorage = [
  {
    _id: "seed1",
    trackName: "No Limit Dreams",
    mainArtist: "Scarface 2.0",
    contributors: [
      { name: "Scarface 2.0", role: "Artist", percentage: 50 },
      { name: "Studio AI", role: "Producer", percentage: 30 },
      { name: "No Limit East Houston", role: "Label", percentage: 20 },
    ],
    createdAt: new Date().toISOString(),
  },
];

// === SPLITS ===

export const getSplits = async (req, res) => {
  try {
    res.json({ ok: true, splits: splitStorage });
  } catch (err) {
    console.error("❌ Get splits error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to fetch splits" });
  }
};

export const createSplit = async (req, res) => {
  try {
    const { trackName, mainArtist, contributors } = req.body;

    if (!trackName || !mainArtist) {
      return res.status(400).json({ ok: false, message: "trackName and mainArtist are required" });
    }

    // Validate total = 100%
    const total = (contributors || []).reduce((sum, c) => sum + (c.percentage || 0), 0);
    if (total !== 100) {
      return res.status(400).json({ ok: false, message: "Contributor percentages must total 100%" });
    }

    const newSplit = {
      _id: `split_${Date.now()}`,
      trackName,
      mainArtist,
      contributors: contributors || [],
      createdAt: new Date().toISOString(),
    };

    splitStorage.push(newSplit);
    console.log(`💰 New split created: ${trackName} by ${mainArtist}`);

    res.status(201).json({ ok: true, split: newSplit });
  } catch (err) {
    console.error("❌ Create split error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to create split" });
  }
};

export const getSplitById = async (req, res) => {
  try {
    const { id } = req.params;
    const split = splitStorage.find(s => s._id === id);
    
    if (!split) {
      return res.status(404).json({ ok: false, message: "Split not found" });
    }

    res.json({ ok: true, split });
  } catch (err) {
    console.error("❌ Get split error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to fetch split" });
  }
};

// === PLAY TRACKING ===

export const logPlay = async (req, res) => {
  try {
    const { trackId, userId, duration } = req.body;
    console.log(`🎧 Logging play: ${trackId} by ${userId} for ${duration}s`);
    res.status(200).json({ success: true, message: 'Play logged successfully' });
  } catch (err) {
    console.error('❌ Error logging play:', err.message);
    res.status(500).json({ success: false, error: 'Log error' });
  }
};

export const getRoyalties = async (req, res) => {
  try {
    const dummyRoyalties = [
      { trackId: 'abc123', earnings: 18.25 },
      { trackId: 'def456', earnings: 7.99 }
    ];
    res.status(200).json({ success: true, royalties: dummyRoyalties });
  } catch (err) {
    console.error('❌ Error fetching royalties:', err.message);
    res.status(500).json({ success: false, error: 'Fetch error' });
  }
};

export const calculateRoyalties = async (req, res) => {
  try {
    const { trackId, streamCount } = req.body;
    const rate = 0.015;
    const total = streamCount * rate;
    res.status(200).json({
      success: true,
      trackId,
      streamCount,
      earnings: total.toFixed(2)
    });
  } catch (err) {
    console.error('❌ Calculation error:', err.message);
    res.status(500).json({ success: false, error: 'Calculation failed' });
  }
};

export const getRoyaltyReport = async (req, res) => {
  try {
    const report = {
      totalArtists: 5,
      totalTracks: 14,
      totalEarnings: 1342.50,
      topEarningTracks: [
        { trackId: 'abc123', earnings: 400.00 },
        { trackId: 'def456', earnings: 350.25 },
        { trackId: 'ghi789', earnings: 592.25 }
      ]
    };
    res.status(200).json({ success: true, report });
  } catch (err) {
    console.error('❌ Report error:', err.message);
    res.status(500).json({ success: false, error: 'Report generation failed' });
  }
};
