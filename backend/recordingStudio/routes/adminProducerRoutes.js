// backend/recordingStudio/routes/adminProducerRoutes.js
// Admin Producer Routes
// Prefix: /api/studio/admin/producers
// All routes protected with admin middleware

import express from 'express';
import adminProducerController from '../controllers/adminProducerController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(verifyToken);
router.use(isAdmin);

// ===========================================
// PRODUCER CRUD
// ===========================================

/**
 * List all producers with stats
 * GET /api/studio/admin/producers
 */
router.get('/', adminProducerController.listProducers);

/**
 * Create a new producer
 * POST /api/studio/admin/producers
 * Body: { name, handle, email?, status?, bio?, links?, userId? }
 */
router.post('/', adminProducerController.createProducer);

/**
 * Update a producer
 * PUT /api/studio/admin/producers/:id
 * Body: { name?, handle?, email?, status?, bio?, links?, userId? }
 */
router.put('/:id', adminProducerController.updateProducer);

/**
 * Delete (soft delete) a producer
 * DELETE /api/studio/admin/producers/:id
 */
router.delete('/:id', adminProducerController.deleteProducer);

// ===========================================
// STATS
// ===========================================

/**
 * Get detailed stats for a producer
 * GET /api/studio/admin/producers/:id/stats
 */
router.get('/:id/stats', adminProducerController.getProducerStats);

export default router;


