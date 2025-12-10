// backend/recordingStudio/controllers/adminProducerController.js
// Admin Producer Controller - CRUD operations for producer management

// ============================================
// LIST PRODUCERS
// ============================================
export const listProducers = async (req, res) => {
  try {
    // Import models dynamically to avoid circular dependencies
    const { default: Beat } = await import('../models/Beat.js');
    
    // Mock producer data with stats
    const producers = [
      {
        _id: 'producer1',
        name: 'Studio AI',
        handle: 'studio-ai',
        status: 'active',
        beatCount: 42,
        totalPlays: 15000,
        revenue: 2500,
      },
      {
        _id: 'producer2',
        name: 'PowerHarmony',
        handle: 'powerharmony',
        status: 'active',
        beatCount: 28,
        totalPlays: 8500,
        revenue: 1200,
      },
    ];

    res.json({ ok: true, producers, total: producers.length });
  } catch (error) {
    console.error('[AdminProducer] List error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ============================================
// CREATE PRODUCER
// ============================================
export const createProducer = async (req, res) => {
  try {
    const { name, handle, email, status, bio, links, userId } = req.body;

    if (!name || !handle) {
      return res.status(400).json({ ok: false, message: 'Name and handle are required' });
    }

    // Mock create - in production this would save to DB
    const producer = {
      _id: `producer_${Date.now()}`,
      name,
      handle,
      email,
      status: status || 'active',
      bio,
      links,
      userId,
      createdAt: new Date(),
    };

    res.status(201).json({ ok: true, producer });
  } catch (error) {
    console.error('[AdminProducer] Create error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ============================================
// UPDATE PRODUCER
// ============================================
export const updateProducer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Mock update - in production this would update DB
    const producer = {
      _id: id,
      ...updates,
      updatedAt: new Date(),
    };

    res.json({ ok: true, producer });
  } catch (error) {
    console.error('[AdminProducer] Update error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ============================================
// DELETE PRODUCER (SOFT DELETE)
// ============================================
export const deleteProducer = async (req, res) => {
  try {
    const { id } = req.params;

    // Mock delete - in production this would soft delete in DB
    res.json({ ok: true, message: 'Producer deleted', id });
  } catch (error) {
    console.error('[AdminProducer] Delete error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ============================================
// GET PRODUCER STATS
// ============================================
export const getProducerStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Mock stats - in production this would aggregate from DB
    const stats = {
      producerId: id,
      totalBeats: 42,
      totalPlays: 15000,
      totalDownloads: 350,
      totalRevenue: 2500,
      avgRating: 4.7,
      topGenres: ['trap', 'drill', 'rnb'],
      monthlyStats: [
        { month: 'Nov 2024', plays: 2500, revenue: 400 },
        { month: 'Dec 2024', plays: 3200, revenue: 550 },
      ],
    };

    res.json({ ok: true, stats });
  } catch (error) {
    console.error('[AdminProducer] Stats error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

export default {
  listProducers,
  createProducer,
  updateProducer,
  deleteProducer,
  getProducerStats,
};

