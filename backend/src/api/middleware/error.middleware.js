// backend/src/api/middleware/error.middleware.js
// Global error handling middleware
import env from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/errors.js";

/**
 * Not found (404) handler
 */
export const notFoundMiddleware = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handler
 */
export const errorMiddleware = (err, req, res, next) => {
  // Default to 500 if no status
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;
  
  // Handle specific error types
  if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.name === "CastError") {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    message = err.message;
  }
  
  // Log error
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, {
      method: req.method,
      url: req.originalUrl,
      stack: err.stack,
      user: req.user?.id,
    });
  } else {
    logger.warn(`[${statusCode}] ${message}`, {
      method: req.method,
      url: req.originalUrl,
      user: req.user?.id,
    });
  }
  
  // Build response
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.isDev() && statusCode >= 500 && { stack: err.stack }),
  };
  
  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Wrap controller methods with error handling
 */
export const wrapController = (controller) => {
  const wrapped = {};
  
  for (const [key, method] of Object.entries(controller)) {
    if (typeof method === "function") {
      wrapped[key] = asyncHandler(method);
    } else {
      wrapped[key] = method;
    }
  }
  
  return wrapped;
};

export default {
  notFoundMiddleware,
  errorMiddleware,
  asyncHandler,
  wrapController,
};




