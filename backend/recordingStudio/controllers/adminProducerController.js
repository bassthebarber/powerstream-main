// backend/recordingStudio/controllers/adminProducerController.js
// Admin Producer Controller
// Handles CRUD operations and stats for producers

import Producer from '../models/Producer.js';
import Beat from '../models/Beat.js';
import Recording from '../models/Recording.js';
import TVExport from '../models/TVExport.js';
import LibraryItem from '../models/LibraryItem.js';

/**
 * List all producers with aggregated stats
 * GET /api/studio/admin/producers
 */
export async function listProducers(req, res) {
  try {
    const { status, search, limit = 50, skip = 0 } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { handle: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Fetch producers
    const producers = await Producer.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit, 10))
      .skip(parseInt(skip, 10));
    
    // Get stats for each producer
    const producersWithStats = await Promise.all(
      producers.map(async (producer) => {
        const [beatsCount, exportsCount] = await Promise.all([
          Beat.countDocuments({ 
            $or: [
              { producerId: producer._id, producerModel: 'Producer' },
              { producerName: producer.name },
            ]
          }),
          TVExport.countDocuments({
            $or: [
              { producerId: producer._id },
              { producerName: producer.name },
            ]
          }),
        ]);
        
        // Get last activity date
        const [lastBeat, lastExport] = await Promise.all([
          Beat.findOne({ 
            $or: [
              { producerId: producer._id, producerModel: 'Producer' },
              { producerName: producer.name },
            ]
          }).sort({ createdAt: -1 }),
          TVExport.findOne({
            $or: [
              { producerId: producer._id },
              { producerName: producer.name },
            ]
          }).sort({ createdAt: -1 }),
        ]);
        
        const lastActivityDate = [
          lastBeat?.createdAt,
          lastExport?.createdAt,
        ].filter(Boolean).sort((a, b) => b - a)[0] || producer.updatedAt;
        
        return {
          ...producer.toSafeJSON(),
          stats: {
            beatsCount,
            exportsCount,
            lastActivityDate,
          },
        };
      })
    );
    
    const total = await Producer.countDocuments(query);
    
    res.json({
      success: true,
      producers: producersWithStats,
      pagination: {
        total,
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10),
        hasMore: parseInt(skip, 10) + producers.length < total,
      },
    });
    
  } catch (err) {
    console.error('❌ [AdminProducer] listProducers error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Create a new producer
 * POST /api/studio/admin/producers
 */
export async function createProducer(req, res) {
  try {
    const { name, handle, email, status, bio, links, userId } = req.body;
    
    // Validate required fields
    if (!name || !handle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name and handle are required.',
      });
    }
    
    // Check if handle already exists
    const existing = await Producer.findByHandle(handle);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Handle exists',
        message: `Producer with handle "${handle}" already exists.`,
      });
    }
    
    // Create producer
    const producer = new Producer({
      name,
      handle: handle.toLowerCase(),
      email,
      status: status || 'active',
      bio,
      links: links || {},
      userId,
    });
    
    await producer.save();
    
    console.log(`✅ [AdminProducer] Created producer: ${name} (@${handle})`);
    
    res.status(201).json({
      success: true,
      message: 'Producer created successfully',
      producer: producer.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [AdminProducer] createProducer error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate handle',
        message: 'A producer with this handle already exists.',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Update a producer
 * PUT /api/studio/admin/producers/:id
 */
export async function updateProducer(req, res) {
  try {
    const { id } = req.params;
    const { name, handle, email, status, bio, links, userId } = req.body;
    
    const producer = await Producer.findById(id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Producer not found.',
      });
    }
    
    // Update fields
    if (name !== undefined) producer.name = name;
    if (handle !== undefined) {
      // Check if new handle conflicts
      const existing = await Producer.findByHandle(handle);
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          error: 'Handle exists',
          message: `Producer with handle "${handle}" already exists.`,
        });
      }
      producer.handle = handle.toLowerCase();
    }
    if (email !== undefined) producer.email = email;
    if (status !== undefined) producer.status = status;
    if (bio !== undefined) producer.bio = bio;
    if (links !== undefined) producer.links = { ...producer.links, ...links };
    if (userId !== undefined) producer.userId = userId;
    
    await producer.save();
    
    console.log(`✅ [AdminProducer] Updated producer: ${producer.name}`);
    
    res.json({
      success: true,
      message: 'Producer updated successfully',
      producer: producer.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [AdminProducer] updateProducer error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate handle',
        message: 'A producer with this handle already exists.',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Delete (soft delete) a producer
 * DELETE /api/studio/admin/producers/:id
 */
export async function deleteProducer(req, res) {
  try {
    const { id } = req.params;
    
    const producer = await Producer.findById(id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Producer not found.',
      });
    }
    
    // Soft delete - set status to inactive
    producer.status = 'inactive';
    await producer.save();
    
    console.log(`✅ [AdminProducer] Deactivated producer: ${producer.name}`);
    
    res.json({
      success: true,
      message: 'Producer deactivated successfully',
      producer: producer.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [AdminProducer] deleteProducer error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Get detailed stats for a producer
 * GET /api/studio/admin/producers/:id/stats
 */
export async function getProducerStats(req, res) {
  try {
    const { id } = req.params;
    
    const producer = await Producer.findById(id);
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Producer not found.',
      });
    }
    
    // Count beats created
    const beatsCreated = await Beat.countDocuments({
      $or: [
        { producerId: producer._id, producerModel: 'Producer' },
        { producerName: producer.name },
      ]
    });
    
    // Count tracks recorded using their beats
    // Find all beats by this producer, then count recordings that use those beats
    const producerBeats = await Beat.find({
      $or: [
        { producerId: producer._id, producerModel: 'Producer' },
        { producerName: producer.name },
      ]
    }).select('_id');
    
    const beatIds = producerBeats.map(b => b._id);
    const tracksRecordedUsingTheirBeats = await Recording.countDocuments({
      beatId: { $in: beatIds },
    });
    
    // Count TV exports
    const tvExports = await TVExport.countDocuments({
      $or: [
        { producerId: producer._id },
        { producerName: producer.name },
      ]
    });
    
    // Get last activity date from all related content
    const [lastBeat, lastRecording, lastExport] = await Promise.all([
      Beat.findOne({
        $or: [
          { producerId: producer._id, producerModel: 'Producer' },
          { producerName: producer.name },
        ]
      }).sort({ createdAt: -1 }),
      Recording.findOne({
        beatId: { $in: beatIds },
      }).sort({ createdAt: -1 }),
      TVExport.findOne({
        $or: [
          { producerId: producer._id },
          { producerName: producer.name },
        ]
      }).sort({ createdAt: -1 }),
    ]);
    
    const activityDates = [
      lastBeat?.createdAt,
      lastRecording?.createdAt,
      lastExport?.createdAt,
      producer.updatedAt,
    ].filter(Boolean);
    
    const lastActivityDate = activityDates.length > 0
      ? activityDates.sort((a, b) => b - a)[0]
      : producer.createdAt;
    
    // Get recent beats
    const recentBeats = await Beat.find({
      $or: [
        { producerId: producer._id, producerModel: 'Producer' },
        { producerName: producer.name },
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title bpm key genre createdAt fileUrl');
    
    // Get recent recordings using their beats
    const recentRecordings = await Recording.find({
      beatId: { $in: beatIds },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title artistName createdAt audioUrl');
    
    // Get recent TV exports
    const recentExports = await TVExport.find({
      $or: [
        { producerId: producer._id },
        { producerName: producer.name },
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('assetName targetStation status createdAt');
    
    res.json({
      success: true,
      producer: producer.toSafeJSON(),
      stats: {
        beatsCreated,
        tracksRecordedUsingTheirBeats,
        tvExports,
        lastActivityDate,
      },
      recent: {
        beats: recentBeats,
        recordings: recentRecordings,
        exports: recentExports,
      },
    });
    
  } catch (err) {
    console.error('❌ [AdminProducer] getProducerStats error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

export default {
  listProducers,
  createProducer,
  updateProducer,
  deleteProducer,
  getProducerStats,
};






