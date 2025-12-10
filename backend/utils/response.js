// backend/utils/response.js
// Standardized response utilities per Overlord Spec

/**
 * Create a success response object (for use with res.json())
 * @param {any} data - Response data
 * @param {string} [message] - Optional message
 * @returns {object} Response object
 */
export function ok(data, message = null) {
  const response = { success: true, data };
  if (message) response.message = message;
  return response;
}

/**
 * Create an error response object (for use with res.json())
 * @param {string} message - Error message
 * @param {string} [code] - Error code
 * @returns {object} Response object
 */
export function fail(message, code = null) {
  const response = { success: false, message };
  if (code) response.code = code;
  return response;
}

/**
 * Send a success response
 * @param {Response} res - Express response object
 * @param {any} data - Response data
 * @param {string} [message] - Optional message
 * @param {number} [statusCode=200] - HTTP status code
 */
export function sendSuccess(res, data, message = null, statusCode = 200) {
  const response = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=400] - HTTP status code
 * @param {string} [code] - Error code
 * @param {any} [details] - Additional error details
 */
export function sendError(res, message, statusCode = 400, code = null, details = null) {
  const response = {
    success: false,
    message,
  };
  if (code) {
    response.code = code;
  }
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
}

/**
 * Send a 404 Not Found response
 * @param {Response} res - Express response object
 * @param {string} [message="Resource not found"] - Error message
 */
export function sendNotFound(res, message = "Resource not found") {
  return sendError(res, message, 404, "NOT_FOUND");
}

/**
 * Send a 401 Unauthorized response
 * @param {Response} res - Express response object
 * @param {string} [message="Unauthorized"] - Error message
 */
export function sendUnauthorized(res, message = "Unauthorized") {
  return sendError(res, message, 401, "UNAUTHORIZED");
}

/**
 * Send a 403 Forbidden response
 * @param {Response} res - Express response object
 * @param {string} [message="Forbidden"] - Error message
 */
export function sendForbidden(res, message = "Forbidden") {
  return sendError(res, message, 403, "FORBIDDEN");
}

/**
 * Send a 500 Internal Server Error response
 * @param {Response} res - Express response object
 * @param {string} [message="Internal server error"] - Error message
 * @param {any} [details] - Error details (only in development)
 */
export function sendServerError(res, message = "Internal server error", details = null) {
  const isDev = process.env.NODE_ENV !== "production";
  return sendError(res, message, 500, "SERVER_ERROR", isDev ? details : null);
}

/**
 * Send a created response (201)
 * @param {Response} res - Express response object
 * @param {any} data - Created resource data
 * @param {string} [message] - Optional message
 */
export function sendCreated(res, data, message = null) {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send a no content response (204)
 * @param {Response} res - Express response object
 */
export function sendNoContent(res) {
  return res.status(204).send();
}

export default {
  ok,
  fail,
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendServerError,
  sendCreated,
  sendNoContent,
};

