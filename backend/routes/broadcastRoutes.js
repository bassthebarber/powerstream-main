// backend/routes/broadcastRoutes.js
// Broadcast Empire Pack - Routes for broadcast schedule management
// Mount at: /api/broadcast
import { Router } from 'express';
import {
  getStationSchedule,
  createBroadcastEvent,
  updateBroadcastEvent,
  deleteBroadcastEvent,
  getLiveStatus,
  setLiveOverride
} from '../controllers/broadcastController.js';

const router = Router();

// ============================================================
// STATION SCHEDULE ENDPOINTS
// ============================================================

/**
 * GET /api/broadcast/station/:slug/schedule
 * Get the broadcast schedule for a station
 * Query params: limit (default 20)
 */
router.get('/station/:slug/schedule', getStationSchedule);

/**
 * POST /api/broadcast/station/:slug/schedule
 * Create a new broadcast event for a station
 * Body: { title, description, type, videoUrl, thumbnailUrl, startsAt, endsAt, isFeatured }
 */
router.post('/station/:slug/schedule', createBroadcastEvent);

// ============================================================
// EVENT MANAGEMENT ENDPOINTS
// ============================================================

/**
 * PATCH /api/broadcast/event/:id
 * Update a broadcast event
 * Body: { title?, description?, type?, videoUrl?, thumbnailUrl?, startsAt?, endsAt?, isFeatured?, status? }
 */
router.patch('/event/:id', updateBroadcastEvent);

/**
 * DELETE /api/broadcast/event/:id
 * Delete a broadcast event
 */
router.delete('/event/:id', deleteBroadcastEvent);

// ============================================================
// LIVE STATUS ENDPOINTS
// ============================================================

/**
 * GET /api/broadcast/station/:slug/live
 * Get the current live status for a station
 * Returns: { station, liveEvent, isLive }
 */
router.get('/station/:slug/live', getLiveStatus);

/**
 * POST /api/broadcast/station/:slug/live-override
 * Set or clear the live override for a station
 * Body: { eventId, active: true/false }
 */
router.post('/station/:slug/live-override', setLiveOverride);

export default router;



