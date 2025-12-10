// SouthernPowerController.js

// Broadcast system-wide message
export const broadcastSystemMessage = async (req, res) => {
  try {
    const { message } = req.body;
    console.log('📢 SYSTEM OVERRIDE MESSAGE:', message);
    // Optional: save to logs or notify stations
    res.json({ status: 'broadcasted', message });
  } catch (err) {
    res.status(500).json({ error: 'Broadcast failed' });
  }
};

// Restart subsystem (placeholder)
export const restartSubsystem = async (req, res) => {
  const { subsystem } = req.params;
  console.log(`🔁 Restarting subsystem: ${subsystem}`);
  // Optional: plug into a command trigger or service
  res.json({ status: 'restarting', subsystem });
};

// Shutdown override
export const shutdownPlatform = async (req, res) => {
  console.log('⚠️ EMERGENCY SHUTDOWN TRIGGERED');
  res.json({ status: 'platform shutdown initiated' });
};
