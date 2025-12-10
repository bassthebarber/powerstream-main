// backend/recordingStudio/controllers/tvExportController.js
// TV Export Controller
// Handles exporting studio assets to PowerStream TV

import TVExport from '../models/TVExport.js';
import LibraryItem from '../models/LibraryItem.js';
import Mixdown from '../models/Mixdown.js';
import Beat from '../models/Beat.js';
import tvExportClient from '../services/tvExportClient.js';

/**
 * Create a new TV export
 * POST /api/studio/tv/export
 */
export async function createExport(req, res) {
  try {
    const { 
      libraryItemId, 
      assetType, 
      targetStation, 
      targetShow,
      targetEpisode,
      targetPlaylist,
      priority,
      scheduledAt,
    } = req.body;
    
    const userId = req.user?._id || req.body.userId;
    
    // Validate required fields
    if (!libraryItemId) {
      return res.status(400).json({
        success: false,
        error: 'Missing libraryItemId',
        message: 'Please specify which asset to export.',
      });
    }
    
    if (!assetType) {
      return res.status(400).json({
        success: false,
        error: 'Missing assetType',
        message: 'Please specify the asset type (song, instrumental, stem, etc.).',
      });
    }
    
    if (!targetStation) {
      return res.status(400).json({
        success: false,
        error: 'Missing targetStation',
        message: 'Please specify the target station/channel.',
      });
    }
    
    // Fetch the library item
    const libraryItem = await LibraryItem.findById(libraryItemId);
    
    if (!libraryItem) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
        message: 'The specified library item was not found.',
      });
    }
    
    // Verify the asset has a URL
    const assetUrl = libraryItem.fileUrl || libraryItem.previewUrl;
    if (!assetUrl) {
      return res.status(400).json({
        success: false,
        error: 'No audio file',
        message: 'This asset does not have an audio file URL.',
      });
    }
    
    // Create the TV export document
    const tvExport = new TVExport({
      libraryItemId: libraryItem._id,
      assetType,
      assetName: libraryItem.title || 'Untitled',
      assetUrl,
      assetDuration: libraryItem.duration,
      assetBpm: libraryItem.bpm,
      assetKey: libraryItem.key,
      assetGenre: libraryItem.genre,
      artistName: libraryItem.artistName,
      producerName: libraryItem.producerName,
      targetStation,
      targetShow: targetShow || null,
      targetEpisode: targetEpisode || null,
      targetPlaylist: targetPlaylist || null,
      priority: priority || 'normal',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: 'queued',
      ownerUserId: userId,
      createdBy: userId,
    });
    
    await tvExport.save();
    
    // Attempt to send immediately
    const sendResult = await tvExportClient.sendToTV({
      exportDoc: tvExport,
      libraryItem,
    });
    
    if (sendResult.success) {
      await tvExport.markSent(sendResult.externalId, sendResult.response);
    } else if (!sendResult.queued) {
      // Only mark as error if it's not just "not configured"
      tvExport.statusMessage = sendResult.error;
      await tvExport.save();
    }
    
    // Reload to get latest status
    await tvExport.populate('libraryItemId');
    
    res.status(201).json({
      success: true,
      message: sendResult.success 
        ? 'Export sent to PowerStream TV!' 
        : sendResult.queued 
          ? 'Export queued (TV API not configured)' 
          : `Export created but send failed: ${sendResult.error}`,
      export: tvExport.toSafeJSON(),
      tvApiStatus: tvExportClient.getTVApiStatus(),
    });
    
  } catch (err) {
    console.error('❌ [TVExport] createExport error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * List TV exports
 * GET /api/studio/tv/exports
 */
export async function listExports(req, res) {
  try {
    const { 
      status, 
      station, 
      limit = 50, 
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;
    
    const userId = req.user?._id || req.query.userId;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (station) query.targetStation = station;
    if (userId) query.ownerUserId = userId;
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query
    const [exports, total] = await Promise.all([
      TVExport.find(query)
        .sort(sort)
        .limit(parseInt(limit, 10))
        .skip(parseInt(skip, 10))
        .populate('libraryItemId', 'title type fileUrl'),
      TVExport.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      exports: exports.map(e => e.toSafeJSON()),
      pagination: {
        total,
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10),
        hasMore: parseInt(skip, 10) + exports.length < total,
      },
    });
    
  } catch (err) {
    console.error('❌ [TVExport] listExports error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Get a single TV export
 * GET /api/studio/tv/exports/:id
 */
export async function getExport(req, res) {
  try {
    const { id } = req.params;
    
    const tvExport = await TVExport.findById(id).populate('libraryItemId');
    
    if (!tvExport) {
      return res.status(404).json({
        success: false,
        error: 'Export not found',
      });
    }
    
    res.json({
      success: true,
      export: tvExport.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [TVExport] getExport error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Retry a failed export
 * POST /api/studio/tv/exports/:id/retry
 */
export async function retryExport(req, res) {
  try {
    const { id } = req.params;
    
    const tvExport = await TVExport.findById(id).populate('libraryItemId');
    
    if (!tvExport) {
      return res.status(404).json({
        success: false,
        error: 'Export not found',
      });
    }
    
    if (!tvExport.canRetry()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot retry',
        message: tvExport.status === 'sent' 
          ? 'Export already sent' 
          : 'Maximum retries exceeded',
      });
    }
    
    // Attempt to resend
    const sendResult = await tvExportClient.sendToTV({
      exportDoc: tvExport,
      libraryItem: tvExport.libraryItemId,
    });
    
    if (sendResult.success) {
      await tvExport.markSent(sendResult.externalId, sendResult.response);
    } else {
      await tvExport.markError(sendResult.error);
    }
    
    res.json({
      success: sendResult.success,
      message: sendResult.success ? 'Export sent successfully!' : sendResult.error,
      export: tvExport.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [TVExport] retryExport error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Cancel a queued export
 * POST /api/studio/tv/exports/:id/cancel
 */
export async function cancelExport(req, res) {
  try {
    const { id } = req.params;
    
    const tvExport = await TVExport.findById(id);
    
    if (!tvExport) {
      return res.status(404).json({
        success: false,
        error: 'Export not found',
      });
    }
    
    if (tvExport.status !== 'queued') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel',
        message: `Export is ${tvExport.status}, can only cancel queued exports.`,
      });
    }
    
    tvExport.status = 'cancelled';
    tvExport.statusMessage = 'Cancelled by user';
    await tvExport.save();
    
    res.json({
      success: true,
      message: 'Export cancelled',
      export: tvExport.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [TVExport] cancelExport error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Get export statistics
 * GET /api/studio/tv/stats
 */
export async function getStats(req, res) {
  try {
    const stats = await TVExport.getStats();
    const tvApiStatus = tvExportClient.getTVApiStatus();
    
    res.json({
      success: true,
      stats,
      tvApiStatus,
    });
    
  } catch (err) {
    console.error('❌ [TVExport] getStats error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Get available stations
 * GET /api/studio/tv/stations
 */
export async function getStations(req, res) {
  try {
    const result = await tvExportClient.getTVStations();
    
    res.json({
      success: true,
      stations: result.stations,
      source: result.source,
    });
    
  } catch (err) {
    console.error('❌ [TVExport] getStations error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Health check
 */
export async function healthCheck(req, res) {
  const tvApiStatus = tvExportClient.getTVApiStatus();
  
  res.json({
    success: true,
    service: 'TV Export API',
    tvApiConfigured: tvApiStatus.configured,
    timestamp: new Date().toISOString(),
  });
}

export default {
  createExport,
  listExports,
  getExport,
  retryExport,
  cancelExport,
  getStats,
  getStations,
  healthCheck,
};






