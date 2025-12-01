// backend/recordingStudio/services/tvExportClient.js
// TV Export Client - Sends exports to PowerStream TV backend
// Handles API communication with the TV/Streaming system

import axios from 'axios';

// Configuration from environment
const TV_API_BASE = process.env.TV_API_BASE || process.env.POWERSTREAM_TV_API_BASE;
const TV_API_KEY = process.env.TV_API_KEY || process.env.POWERSTREAM_TV_API_KEY;
const TV_API_TIMEOUT = parseInt(process.env.TV_API_TIMEOUT || '30000', 10);

/**
 * Check if TV API is configured
 */
export function isTVApiConfigured() {
  return Boolean(TV_API_BASE && TV_API_KEY);
}

/**
 * Get TV API configuration status
 */
export function getTVApiStatus() {
  return {
    configured: isTVApiConfigured(),
    baseUrl: TV_API_BASE ? `${TV_API_BASE.substring(0, 30)}...` : null,
    hasKey: Boolean(TV_API_KEY),
  };
}

/**
 * Create axios instance for TV API
 */
function createTVClient() {
  if (!isTVApiConfigured()) {
    return null;
  }
  
  return axios.create({
    baseURL: TV_API_BASE,
    timeout: TV_API_TIMEOUT,
    headers: {
      'Authorization': `Bearer ${TV_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Source': 'PowerStream-Studio',
      'X-API-Version': '1.0',
    },
  });
}

/**
 * Send an export to the TV system
 * @param {Object} options
 * @param {Object} options.exportDoc - The TVExport document
 * @param {Object} options.libraryItem - The source LibraryItem
 * @returns {Promise<{success: boolean, externalId?: string, error?: string, response?: any}>}
 */
export async function sendToTV({ exportDoc, libraryItem }) {
  console.log(`📺 [TVExport] Sending "${exportDoc.assetName}" to ${exportDoc.targetStation}`);
  
  // Check if API is configured
  if (!isTVApiConfigured()) {
    console.log('⚠️ [TVExport] TV API not configured - export will remain queued');
    return {
      success: false,
      error: 'TV API not configured',
      queued: true,
    };
  }
  
  const client = createTVClient();
  
  try {
    // Build payload for TV API
    const payload = {
      // Source identification
      sourceSystem: 'PowerStream-Studio',
      sourceId: exportDoc._id.toString(),
      
      // Asset information
      asset: {
        type: exportDoc.assetType,
        name: exportDoc.assetName,
        url: exportDoc.assetUrl,
        duration: exportDoc.assetDuration,
        bpm: exportDoc.assetBpm,
        key: exportDoc.assetKey,
        genre: exportDoc.assetGenre,
      },
      
      // Metadata
      metadata: {
        artistName: exportDoc.artistName,
        producerName: exportDoc.producerName,
        libraryItemId: exportDoc.libraryItemId?.toString(),
      },
      
      // Destination
      destination: {
        station: exportDoc.targetStation,
        show: exportDoc.targetShow,
        episode: exportDoc.targetEpisode,
        playlist: exportDoc.targetPlaylist,
      },
      
      // Scheduling
      scheduling: {
        priority: exportDoc.priority,
        scheduledAt: exportDoc.scheduledAt,
      },
      
      // Timestamps
      createdAt: exportDoc.createdAt,
    };
    
    // Send to TV API
    const response = await client.post('/api/ingest/studio-export', payload);
    
    if (response.data?.success) {
      console.log(`✅ [TVExport] Successfully sent to TV: ${response.data.externalId}`);
      return {
        success: true,
        externalId: response.data.externalId || response.data.id,
        externalUrl: response.data.url,
        response: response.data,
      };
    } else {
      console.error('❌ [TVExport] TV API returned failure:', response.data);
      return {
        success: false,
        error: response.data?.error || 'TV API returned failure',
        response: response.data,
      };
    }
    
  } catch (err) {
    console.error('❌ [TVExport] API call failed:', err.message);
    
    // Handle specific error types
    if (err.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'TV API connection refused - service may be down',
        retryable: true,
      };
    }
    
    if (err.code === 'ETIMEDOUT') {
      return {
        success: false,
        error: 'TV API request timed out',
        retryable: true,
      };
    }
    
    if (err.response) {
      return {
        success: false,
        error: `TV API error: ${err.response.status} - ${err.response.data?.message || err.message}`,
        response: err.response.data,
        retryable: err.response.status >= 500,
      };
    }
    
    return {
      success: false,
      error: err.message,
      retryable: true,
    };
  }
}

/**
 * Check status of an export on the TV system
 * @param {string} externalId - The ID on the TV system
 * @returns {Promise<{success: boolean, status?: string, error?: string}>}
 */
export async function checkTVExportStatus(externalId) {
  if (!isTVApiConfigured()) {
    return { success: false, error: 'TV API not configured' };
  }
  
  const client = createTVClient();
  
  try {
    const response = await client.get(`/api/ingest/status/${externalId}`);
    
    return {
      success: true,
      status: response.data.status,
      data: response.data,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get available stations from TV system
 * @returns {Promise<{success: boolean, stations?: Array, error?: string}>}
 */
export async function getTVStations() {
  // If TV API is not configured, return default stations
  const defaultStations = [
    { id: 'southern-power', name: 'Southern Power Network', active: true },
    { id: 'no-limit-east', name: 'No Limit East Houston', active: true },
    { id: 'texas-got-talent', name: 'Texas Got Talent', active: true },
    { id: 'civic-connect', name: 'Civic Connect', active: true },
    { id: 'gospel-hour', name: 'Gospel Hour', active: true },
    { id: 'late-night-vibes', name: 'Late Night Vibes', active: true },
    { id: 'morning-motivation', name: 'Morning Motivation', active: true },
    { id: 'hip-hop-hq', name: 'Hip Hop Headquarters', active: true },
    { id: 'rnb-soul', name: 'R&B Soul Station', active: true },
  ];
  
  if (!isTVApiConfigured()) {
    return { 
      success: true, 
      stations: defaultStations,
      source: 'default',
    };
  }
  
  const client = createTVClient();
  
  try {
    const response = await client.get('/api/stations');
    
    return {
      success: true,
      stations: response.data.stations || defaultStations,
      source: 'api',
    };
  } catch (err) {
    console.warn('⚠️ [TVExport] Failed to fetch stations from API, using defaults');
    return {
      success: true,
      stations: defaultStations,
      source: 'default',
      warning: err.message,
    };
  }
}

/**
 * Cancel a pending export on the TV system
 * @param {string} externalId - The ID on the TV system
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function cancelTVExport(externalId) {
  if (!isTVApiConfigured()) {
    return { success: false, error: 'TV API not configured' };
  }
  
  const client = createTVClient();
  
  try {
    await client.delete(`/api/ingest/${externalId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Process queued exports (for background job)
 * @param {number} batchSize - Number of exports to process
 * @returns {Promise<{processed: number, sent: number, failed: number}>}
 */
export async function processQueuedExports(batchSize = 10) {
  const TVExport = (await import('../models/TVExport.js')).default;
  const LibraryItem = (await import('../models/LibraryItem.js')).default;
  
  const queuedExports = await TVExport.getQueuedExports(batchSize);
  
  let sent = 0;
  let failed = 0;
  
  for (const exportDoc of queuedExports) {
    const libraryItem = await LibraryItem.findById(exportDoc.libraryItemId);
    
    const result = await sendToTV({ exportDoc, libraryItem });
    
    if (result.success) {
      await exportDoc.markSent(result.externalId, result.response);
      sent++;
    } else if (!result.queued) {
      await exportDoc.markError(result.error);
      failed++;
    }
  }
  
  return {
    processed: queuedExports.length,
    sent,
    failed,
  };
}

export default {
  isTVApiConfigured,
  getTVApiStatus,
  sendToTV,
  checkTVExportStatus,
  getTVStations,
  cancelTVExport,
  processQueuedExports,
};


