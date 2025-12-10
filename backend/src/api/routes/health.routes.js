// backend/src/api/routes/health.routes.js
// Health check and readiness endpoints
import { Router } from "express";
import mongoose from "mongoose";
import env from "../../config/env.js";
import { isRedisConnected } from "../../config/redis.js";
import { getMongoState } from "../../config/db.mongo.js";

const router = Router();

/**
 * Basic health check
 * Returns 200 if server is running
 */
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "powerstream-api",
    version: process.env.npm_package_version || "1.0.0",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Detailed health check
 * Checks all service dependencies
 */
router.get("/detailed", async (req, res) => {
  const mongoState = getMongoState();
  const redisConnected = isRedisConnected();
  
  const checks = {
    mongo: {
      status: mongoState.isConnected ? "healthy" : "unhealthy",
      state: mongoState.state,
    },
    redis: {
      status: redisConnected ? "healthy" : env.USE_REDIS ? "unhealthy" : "disabled",
    },
  };
  
  const allHealthy = checks.mongo.status === "healthy" && 
    (checks.redis.status === "healthy" || checks.redis.status === "disabled");
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness probe
 * Returns 200 only if all critical services are ready
 */
router.get("/ready", async (req, res) => {
  const mongoState = getMongoState();
  
  if (!mongoState.isConnected) {
    return res.status(503).json({
      status: "not_ready",
      reason: "MongoDB not connected",
    });
  }
  
  res.json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Liveness probe
 * Returns 200 if process is alive
 */
router.get("/live", (req, res) => {
  res.json({
    status: "alive",
    pid: process.pid,
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

export default router;




