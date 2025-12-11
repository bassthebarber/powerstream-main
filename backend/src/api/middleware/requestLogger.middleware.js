// backend/src/api/middleware/requestLogger.middleware.js
// Request logging with timing
import { logger, logRequest } from "../../config/logger.js";
import env from "../../config/env.js";

/**
 * Request logging middleware
 * Logs method, URL, status, and response time
 */
export const requestLoggerMiddleware = (req, res, next) => {
  // Skip logging for health endpoints
  if (req.path === "/health" || req.path === "/api/health" || req.path === "/favicon.ico") {
    return next();
  }
  
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end to capture timing
  res.end = function (...args) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log the request
    logRequest(req, statusCode, duration);
    
    // Call original end
    originalEnd.apply(res, args);
  };
  
  next();
};

/**
 * Development-only detailed request logger
 */
export const devRequestLogger = (req, res, next) => {
  if (!env.isDev()) {
    return next();
  }
  
  const startTime = Date.now();
  
  // Log request
  logger.debug(`→ ${req.method} ${req.originalUrl}`, {
    body: req.body && Object.keys(req.body).length > 0 ? "[body present]" : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    user: req.user?.id,
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - startTime;
    logger.debug(`← ${res.statusCode} ${req.method} ${req.originalUrl} (${duration}ms)`);
    originalSend.apply(res, arguments);
  };
  
  next();
};

export default requestLoggerMiddleware;



