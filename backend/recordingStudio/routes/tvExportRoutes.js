// backend/recordingStudio/routes/tvExportRoutes.js
// TV Export Routes
// Prefix: /api/studio/tv

import express from 'express';
import tvExportController from '../controllers/tvExportController.js';

const router = express.Router();

// ===========================================
// HEALTH & STATUS
// ===========================================

/**
 * Health check
 * GET /api/studio/tv/health
 */
router.get('/health', tvExportController.healthCheck);

/**
 * Get export statistics
 * GET /api/studio/tv/stats
 */
router.get('/stats', tvExportController.getStats);

/**
 * Get available stations
 * GET /api/studio/tv/stations
 */
router.get('/stations', tvExportController.getStations);

// ===========================================
// EXPORT OPERATIONS
// ===========================================

/**
 * Create a new TV export
 * POST /api/studio/tv/export
 * Body: {
 *   libraryItemId: string,
 *   assetType: 'song' | 'instrumental' | 'stem' | 'show-intro' | 'bumper' | 'jingle',
 *   targetStation: string,
 *   targetShow?: string,
 *   targetEpisode?: string,
 *   targetPlaylist?: string,
 *   priority?: 'low' | 'normal' | 'high' | 'urgent',
 *   scheduledAt?: string (ISO date)
 * }
 */
router.post('/export', tvExportController.createExport);

/**
 * List TV exports
 * GET /api/studio/tv/exports
 * Query params: status, station, limit, skip, sortBy, sortOrder
 */
router.get('/exports', tvExportController.listExports);

/**
 * Get a single export
 * GET /api/studio/tv/exports/:id
 */
router.get('/exports/:id', tvExportController.getExport);

/**
 * Retry a failed export
 * POST /api/studio/tv/exports/:id/retry
 */
router.post('/exports/:id/retry', tvExportController.retryExport);

/**
 * Cancel a queued export
 * POST /api/studio/tv/exports/:id/cancel
 */
router.post('/exports/:id/cancel', tvExportController.cancelExport);

export default router;







