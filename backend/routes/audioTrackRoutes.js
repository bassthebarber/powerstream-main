import { Router } from 'express';
import { requireAuth, authOptional } from '../middleware/authMiddleware.js';
import {
  publishFromRecording,
  listByStation,
  registerPlay,
  createDirectTrack,
  listAllTracks,
  getMyTracks,
  getTrackById,
  deleteTrack,
  getArtists
} from '../controllers/audioTrackController.js';

const router = Router();

// ==========================================
// PUBLIC MUSIC LIBRARY
// ==========================================

// List all published tracks (Music Library)
router.get('/music', listAllTracks);
router.get('/music/tracks', listAllTracks);

// Get all artists
router.get('/music/artists', getArtists);

// Get single track
router.get('/music/tracks/:id', getTrackById);

// Station audio library
router.get('/stations/:stationKey/audio', listByStation);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

// Studio → Station publish
router.post('/studio/publish-to-station', requireAuth, publishFromRecording);

// Direct upload track (Spotify-style)
router.post('/audio-tracks', requireAuth, createDirectTrack);

// User's own tracks
router.get('/my-tracks', requireAuth, getMyTracks);

// Delete track (owner only)
router.delete('/audio-tracks/:id', requireAuth, deleteTrack);

// ==========================================
// PLAY TRACKING (monetization)
// ==========================================

// Track plays for monetization
router.post('/audio/:id/play', registerPlay);

// Health check
router.get('/audio/health', (req, res) => {
  res.json({ success: true, service: 'audio-tracks-api', timestamp: new Date() });
});

export default router;
