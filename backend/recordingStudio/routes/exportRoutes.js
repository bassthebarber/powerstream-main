// backend/recordingStudio/routes/exportRoutes.js
// Export Routes - Audio export and format conversion
// Prefix: /api/export

import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/requireAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Output directories
const OUTPUT_DIR = path.join(__dirname, '../output');
const EXPORT_DIR = path.join(OUTPUT_DIR, 'exports');

// Ensure directories exist
await fs.ensureDir(EXPORT_DIR);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Export API',
    formats: ['wav', 'mp3', 'flac', 'aac', 'ogg'],
    timestamp: new Date().toISOString(),
  });
});

// All other routes require auth
router.use(requireAuth);

/**
 * Request export of a track
 * POST /api/export
 * Body: { trackId, format, quality }
 */
router.post('/', async (req, res) => {
  try {
    const { trackId, format = 'wav', quality = 'high' } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!trackId) {
      return res.status(400).json({ ok: false, error: 'trackId is required' });
    }

    // Create export job
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    res.json({
      ok: true,
      exportId,
      trackId,
      format,
      quality,
      status: 'queued',
      message: 'Export job queued',
      estimatedTime: '10-30 seconds',
    });
  } catch (error) {
    console.error('[Export] Error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Get export status
 * GET /api/export/:exportId
 */
router.get('/:exportId', async (req, res) => {
  try {
    const { exportId } = req.params;

    // Mock status - in production this would check job queue
    res.json({
      ok: true,
      exportId,
      status: 'complete',
      downloadUrl: `/api/export/download/${exportId}`,
      format: 'wav',
      fileSize: 15000000,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * List user's exports
 * GET /api/export/list
 */
router.get('/user/list', async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { limit = 20 } = req.query;

    // Mock exports list
    res.json({
      ok: true,
      exports: [],
      total: 0,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Download exported file
 * GET /api/export/download/:filename
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(EXPORT_DIR, filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ ok: false, error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;

