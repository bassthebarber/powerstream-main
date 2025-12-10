/**
 * PowerStream Request Logger Middleware
 * Logs method, URL, status code, and response time for all requests.
 */

/**
 * Colorize status code for console output
 */
const colorStatus = (status) => {
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // Green
  return status;
};

/**
 * Colorize method for console output
 */
const colorMethod = (method) => {
  const colors = {
    GET: "\x1b[32m",    // Green
    POST: "\x1b[34m",   // Blue
    PUT: "\x1b[33m",    // Yellow
    PATCH: "\x1b[35m",  // Magenta
    DELETE: "\x1b[31m", // Red
    OPTIONS: "\x1b[36m" // Cyan
  };
  const color = colors[method] || "\x1b[0m";
  return `${color}${method}\x1b[0m`;
};

/**
 * Format duration in human readable format
 */
const formatDuration = (ms) => {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Logger middleware
 * Attaches timing info and logs request details on response finish
 */
const logger = (req, res, next) => {
  // Skip health check endpoints to reduce noise
  if (req.path === "/health" || req.path === "/api/health") {
    return next();
  }

  const startTime = process.hrtime.bigint();
  const startDate = new Date();

  // Capture original end function
  const originalEnd = res.end;

  res.end = function (...args) {
    // Calculate duration
    const endTime = process.hrtime.bigint();
    const durationNs = endTime - startTime;
    const durationMs = Number(durationNs) / 1e6;

    // Build log message
    const timestamp = startDate.toISOString();
    const method = colorMethod(req.method.padEnd(7));
    const url = req.originalUrl || req.url;
    const status = colorStatus(res.statusCode);
    const duration = formatDuration(durationMs);
    const ip = req.ip || req.connection?.remoteAddress || "-";

    // Log format: [timestamp] METHOD /path STATUS duration - IP
    console.log(`[${timestamp}] ${method} ${url} ${status} ${duration} - ${ip}`);

    // Call original end
    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Simple logger (no colors, for production/file logging)
 */
export const simpleLogger = (req, res, next) => {
  if (req.path === "/health" || req.path === "/api/health") {
    return next();
  }

  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get("user-agent"),
    };
    console.log(JSON.stringify(log));
  });

  next();
};

export default logger;



