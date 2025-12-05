// backend/controllers/systemHealthController.js

import os from 'os';
import mongoose from 'mongoose';
import SystemStatus from "../models/SystemStatusModel.js";
import logUplink from "../logs/logUplink.js";

/**
 * @desc Get live system health info
 * @route GET /api/system/health
 */
export const getSystemHealth = async (req, res) => {
  try {
    const status = {
      app: 'PowerStream Backend',
      environment: process.env.NODE_ENV || 'development',
      uptime: os.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: process.memoryUsage().rss,
      },
      load: os.loadavg(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };

    logUplink('SystemHealth', 'debug', '✅ System health check');

    res.status(200).json(status);
  } catch (err) {
    logUplink('SystemHealth', 'error', '❌ Health check failed', { error: err.message });
    res.status(500).json({ error: 'System health check failed' });
  }
};

/**
 * @desc Save current snapshot to DB (optional logging endpoint)
 * @route POST /api/system/health/log
 */
export const logSystemSnapshot = async (req, res) => {
  try {
    const snapshot = new SystemStatus({
      uptime: os.uptime(),
      cpuLoad: os.loadavg(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: process.memoryUsage().rss,
      },
      platform: os.platform(),
      arch: os.arch(),
    });

    await snapshot.save();
    res.status(200).json({ success: true, snapshot });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log system status' });
  }
};
