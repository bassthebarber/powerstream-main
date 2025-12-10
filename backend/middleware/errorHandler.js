/**
 * PowerStream Global Error Handler Middleware
 * Catches all errors passed via next(err) and sends consistent JSON responses.
 */

/**
 * Custom API Error class for throwing errors with status codes
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguishes operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error factory functions
 */
export const Errors = {
  badRequest: (message = "Bad request", details = null) => 
    new ApiError(message, 400, details),
  
  unauthorized: (message = "Unauthorized") => 
    new ApiError(message, 401),
  
  forbidden: (message = "Forbidden") => 
    new ApiError(message, 403),
  
  notFound: (message = "Resource not found") => 
    new ApiError(message, 404),
  
  conflict: (message = "Conflict") => 
    new ApiError(message, 409),
  
  validation: (message = "Validation error", details = null) => 
    new ApiError(message, 422, details),
  
  tooMany: (message = "Too many requests") => 
    new ApiError(message, 429),
  
  internal: (message = "Internal server error") => 
    new ApiError(message, 500),
};

/**
 * 404 Not Found Handler
 * Place this AFTER all routes but BEFORE errorHandler
 */
export const notFoundHandler = (req, res, next) => {
  // Skip if response already sent
  if (res.headersSent) {
    return next();
  }
  
  res.status(404).json({
    ok: false,
    error: "Not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
  });
};

/**
 * Global Error Handler
 * Place this LAST in middleware chain
 */
const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  
  // Handle specific error types
  if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 422;
  } else if (err.name === "CastError") {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
  } else if (err.type === "entity.parse.failed") {
    // JSON parse error
    statusCode = 400;
  }

  // Log error (with stack trace for 500 errors)
  const isServerError = statusCode >= 500;
  const logLevel = isServerError ? "error" : "warn";
  const logPrefix = isServerError ? "💥" : "⚠️";
  
  console[logLevel](
    `${logPrefix} [${req.method}] ${req.originalUrl} - ${statusCode}:`,
    err.message
  );
  
  if (isServerError && process.env.NODE_ENV !== "production") {
    console.error("Stack:", err.stack);
  }

  // Build response
  const response = {
    ok: false,
    error: err.message || "Internal server error",
  };

  // Add details if present (validation errors, etc.)
  if (err.details) {
    response.details = err.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development" && isServerError) {
    response.stack = err.stack;
  }

  // Add path for debugging
  response.path = req.originalUrl;

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper - eliminates try/catch in route handlers
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default errorHandler;



