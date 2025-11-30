export const createCollabSession = async (req, res) => {
  try {
    const { title, members } = req.body;
    console.log(`🎤 Creating collab session: ${title} with members`, members);
    res.status(201).json({ success: true, message: 'Collab session created' });
  } catch (err) {
    console.error('❌ Error creating session:', err.message);
    res.status(500).json({ success: false, error: 'Creation failed' });
  }
};

export const getAllCollabSessions = async (req, res) => {
  try {
    // Simulated return
    res.status(200).json({
      success: true,
      sessions: [
        { id: 1, title: 'No Limit East', members: ['Marcus', 'Gangsta'] },
        { id: 2, title: 'Houston Unity', members: ['Travis', 'Megan'] }
      ]
    });
  } catch (err) {
    console.error('❌ Error fetching sessions:', err.message);
    res.status(500).json({ success: false, error: 'Fetch failed' });
  }
};

export const getCollabById = async (req, res) => {
  try {
    const { id } = req.params;
    res.status(200).json({
      success: true,
      session: { id, title: `Mock Session ${id}`, members: ['User1', 'User2'] }
    });
  } catch (err) {
    console.error('❌ Error fetching session by ID:', err.message);
    res.status(500).json({ success: false, error: 'Session not found' });
  }
};
