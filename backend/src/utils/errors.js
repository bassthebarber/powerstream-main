// backend/src/utils/errors.js
// Custom error classes and error utilities

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.isOperational = true;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message = "Bad Request", errors = null) {
    super(400, message, errors);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(409, message);
  }
}

/**
 * 422 Unprocessable Entity
 */
export class ValidationError extends ApiError {
  constructor(message = "Validation Error", errors = null) {
    super(422, message, errors);
  }
}

/**
 * 429 Too Many Requests
 */
export class RateLimitError extends ApiError {
  constructor(message = "Too many requests, please try again later") {
    super(429, message);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(500, message);
    this.isOperational = false;
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable") {
    super(503, message);
  }
}

/**
 * Wrap async function to catch errors
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Assert condition or throw error
 */
export const assert = (condition, ErrorClass, ...args) => {
  if (!condition) {
    throw new ErrorClass(...args);
  }
};

/**
 * Assert resource exists or throw 404
 */
export const assertExists = (resource, resourceName = "Resource") => {
  if (!resource) {
    throw new NotFoundError(resourceName);
  }
  return resource;
};

/**
 * Assert user is owner of resource
 */
export const assertOwner = (resource, userId, resourceName = "Resource") => {
  const ownerId = resource.userId || resource.user || resource.owner;
  if (ownerId?.toString() !== userId?.toString()) {
    throw new ForbiddenError(`Not authorized to modify this ${resourceName}`);
  }
};

export default {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError,
  catchAsync,
  assert,
  assertExists,
  assertOwner,
};




