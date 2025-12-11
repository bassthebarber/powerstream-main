// backend/recordingStudio/routes/voiceRoutes.js
// AI Voice Clone Routes
// Prefix: /api/studio/voice

import express from 'express';
import voiceController from '../controllers/voiceController.js';

const router = express.Router();

// ===========================================
// VOICE PROFILE ROUTES
// ===========================================

/**
 * Health check
 * GET /api/studio/voice/health
 */
router.get('/health', voiceController.healthCheck);

/**
 * Create a new voice profile
 * POST /api/studio/voice/create-profile
 * Body: { displayName, sampleIds: string[], consent: boolean }
 */
router.post('/create-profile', voiceController.createProfile);

/**
 * Get current user's voice profile
 * GET /api/studio/voice/my-profile
 */
router.get('/my-profile', voiceController.getMyProfile);

/**
 * Get voice profile by artist ID
 * GET /api/studio/voice/profile/:artistId
 */
router.get('/profile/:artistId', voiceController.getProfile);

/**
 * Update voice profile settings
 * PATCH /api/studio/voice/settings
 * Body: { voiceSettings: { stability, clarity, style, speakerBoost }, displayName }
 */
router.patch('/settings', voiceController.updateSettings);

/**
 * Delete voice profile
 * DELETE /api/studio/voice/profile
 */
router.delete('/profile', voiceController.deleteProfile);

// ===========================================
// SYNTHESIS ROUTES
// ===========================================

/**
 * Synthesize audio using artist's voice
 * POST /api/studio/voice/synthesize
 * Body: {
 *   mode: 'lyrics' | 'reference',
 *   lyrics?: string,
 *   referenceAudioId?: string,
 *   tempo?: number,
 *   key?: string
 * }
 */
router.post('/synthesize', voiceController.synthesize);

// ===========================================
// UTILITY ROUTES
// ===========================================

/**
 * Get available training samples for the current user
 * GET /api/studio/voice/training-samples
 */
router.get('/training-samples', voiceController.getTrainingSamples);

export default router;






