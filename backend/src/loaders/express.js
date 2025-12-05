// backend/src/loaders/express.js
// Express app configuration and middleware setup
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import env, { getAllowedOrigins } from "../config/env.js";
import { logger } from "../config/logger.js";
import { requestLoggerMiddleware } from "../api/middleware/requestLogger.middleware.js";
import { errorMiddleware, notFoundMiddleware } from "../api/middleware/error.middleware.js";
import { rateLimitMiddleware } from "../api/middleware/rateLimit.middleware.js";

/**
 * Configure Express app with all middlewares
 * @param {express.Application} app 
 */
export const configureExpress = (app) => {
  // Trust proxy (for rate limiting behind nginx)
  app.set("trust proxy", 1);
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
  }));
  
  // Compression
  app.use(compression());
  
  // CORS configuration
  const allowedOrigins = getAllowedOrigins();
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || env.isDev()) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked: ${origin}`);
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Authorization", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    optionsSuccessStatus: 204,
  };
  
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  
  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  
  // Request logging
  app.use(requestLoggerMiddleware);
  
  // Rate limiting (if enabled)
  if (env.ENABLE_RATE_LIMITING) {
    app.use(rateLimitMiddleware);
  }
  
  logger.info("✅ Express middleware configured");
};

/**
 * Configure error handling (must be called after routes)
 * @param {express.Application} app 
 */
export const configureErrorHandling = (app) => {
  // 404 handler
  app.use(notFoundMiddleware);
  
  // Global error handler
  app.use(errorMiddleware);
  
  logger.info("✅ Error handlers configured");
};

/**
 * Health check routes
 * @param {express.Application} app 
 */
export const configureHealthRoutes = (app) => {
  // Basic health check (no DB required)
  app.get(["/health", "/api/health"], (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "powerstream-api",
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });
  
  // Readiness probe (checks DB connection)
  app.get(["/ready", "/api/ready"], async (req, res) => {
    const { getMongoState } = await import("../config/db.mongo.js");
    const mongoState = getMongoState();
    
    const isReady = mongoState.isConnected;
    
    res.status(isReady ? 200 : 503).json({
      status: isReady ? "ready" : "not_ready",
      mongo: mongoState.state,
      timestamp: new Date().toISOString(),
    });
  });
  
  logger.info("✅ Health routes configured");
};

/**
 * Configure all routes
 * @param {express.Application} app 
 */
export const configureRoutes = async (app) => {
  const { registerRoutes } = await import("../api/routes/index.js");
  await registerRoutes(app);
};

export default { configureExpress, configureErrorHandling, configureHealthRoutes, configureRoutes };

