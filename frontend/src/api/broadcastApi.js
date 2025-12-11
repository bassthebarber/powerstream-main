// frontend/src/api/broadcastApi.js
// Broadcast Empire Pack - Frontend API helpers for broadcast schedule management
import api from '../lib/api.js';

/**
 * Fetch the broadcast schedule for a station
 * GET /api/broadcast/station/:slug/schedule
 */
export async function fetchStationSchedule(slug) {
  const res = await api.get(`/broadcast/station/${encodeURIComponent(slug)}/schedule`);
  return res.data;
}

/**
 * Create a new broadcast event for a station
 * POST /api/broadcast/station/:slug/schedule
 */
export async function createBroadcastEvent(slug, payload) {
  const res = await api.post(`/broadcast/station/${encodeURIComponent(slug)}/schedule`, payload);
  return res.data;
}

/**
 * Update a broadcast event
 * PATCH /api/broadcast/event/:id
 */
export async function updateBroadcastEvent(id, payload) {
  const res = await api.patch(`/broadcast/event/${encodeURIComponent(id)}`, payload);
  return res.data;
}

/**
 * Delete a broadcast event
 * DELETE /api/broadcast/event/:id
 */
export async function deleteBroadcastEvent(id) {
  const res = await api.delete(`/broadcast/event/${encodeURIComponent(id)}`);
  return res.data;
}

/**
 * Fetch the live status for a station
 * GET /api/broadcast/station/:slug/live
 */
export async function fetchLiveStatus(slug) {
  const res = await api.get(`/broadcast/station/${encodeURIComponent(slug)}/live`);
  return res.data;
}

/**
 * Set or clear the live override for a station
 * POST /api/broadcast/station/:slug/live-override
 */
export async function setLiveOverride(slug, eventId, active) {
  const res = await api.post(`/broadcast/station/${encodeURIComponent(slug)}/live-override`, {
    eventId,
    active
  });
  return res.data;
}

export default {
  fetchStationSchedule,
  createBroadcastEvent,
  updateBroadcastEvent,
  deleteBroadcastEvent,
  fetchLiveStatus,
  setLiveOverride
};


