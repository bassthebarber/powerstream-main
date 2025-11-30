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
