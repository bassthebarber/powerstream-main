// backend/src/config/logger.js
// Centralized logger using Winston
import winston from "winston";
import env from "./env.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}] ${message}`;
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }
  
  return log;
});

// JSON format for production
const jsonFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...(stack && { stack }),
    ...meta,
  });
});

// Determine log level based on environment
const getLogLevel = () => {
  if (env.isTest()) return "error";
  if (env.isProd()) return "info";
  return "debug";
};

// Create transports
const transports = [
  // Console output
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      logFormat
    ),
  }),
];

// Add file transports in production
if (env.isProd()) {
  const logsDir = path.resolve(__dirname, "../../logs");
  
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: combine(
        timestamp(),
        errors({ stack: true }),
        jsonFormat
      ),
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: combine(
        timestamp(),
        errors({ stack: true }),
        jsonFormat
      ),
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: getLogLevel(),
  format: combine(
    timestamp(),
    errors({ stack: true })
  ),
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper methods for structured logging
export const logRequest = (req, statusCode, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    duration: `${duration}ms`,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get("user-agent"),
  };
  
  if (statusCode >= 500) {
    logger.error("Request failed", logData);
  } else if (statusCode >= 400) {
    logger.warn("Request error", logData);
  } else {
    logger.http("Request completed", logData);
  }
};

export const logEvent = (eventType, data) => {
  logger.info(`Event: ${eventType}`, { eventType, ...data });
};

export const logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

export default logger;




