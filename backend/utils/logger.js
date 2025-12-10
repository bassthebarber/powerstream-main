// backend/utils/logger.js
// Centralized logging utility per Overlord Spec
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// Current log level from environment
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

// Log directory
const logsDir = path.join(__dirname, "../logs");

// Ensure logs directory exists
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  console.error("Failed to create logs directory:", err);
}

// Format timestamp
function getTimestamp() {
  return new Date().toISOString();
}

// Format log message
function formatMessage(level, message, meta = null) {
  const timestamp = getTimestamp();
  let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (meta) {
    if (meta instanceof Error) {
      formatted += `\n  Stack: ${meta.stack}`;
    } else if (typeof meta === "object") {
      try {
        formatted += `\n  Data: ${JSON.stringify(meta)}`;
      } catch {
        formatted += `\n  Data: [Circular]`;
      }
    }
  }
  
  return formatted;
}

// Write to file
function writeToFile(filename, message) {
  try {
    const filepath = path.join(logsDir, filename);
    fs.appendFileSync(filepath, message + "\n");
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

// Color codes for terminal
const colors = {
  reset: "\x1b[0m",
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m",  // green
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
  fatal: "\x1b[35m", // magenta
};

// Log function factory
function createLogFunction(level) {
  return (message, meta = null) => {
    if (LOG_LEVELS[level] < currentLevel) {
      return;
    }
    
    const formatted = formatMessage(level, message, meta);
    
    // Console output with color
    const color = colors[level] || colors.reset;
    console.log(`${color}${formatted}${colors.reset}`);
    
    // File output for warn+ levels
    if (LOG_LEVELS[level] >= LOG_LEVELS.warn) {
      writeToFile("errors.log", formatted);
    }
    
    // All logs to general file in development
    if (process.env.NODE_ENV !== "production") {
      writeToFile("development.log", formatted);
    }
  };
}

// Logger object
export const logger = {
  debug: createLogFunction("debug"),
  info: createLogFunction("info"),
  warn: createLogFunction("warn"),
  error: createLogFunction("error"),
  fatal: createLogFunction("fatal"),
  
  // Log startup message
  startup: (message) => {
    const formatted = formatMessage("info", `🚀 ${message}`);
    console.log(`${colors.info}${formatted}${colors.reset}`);
    writeToFile("startup.log", formatted);
  },
  
  // Log HTTP request (for middleware)
  request: (req, res, duration) => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    const level = res.statusCode >= 400 ? "warn" : "info";
    logger[level](message);
  },
};

export default logger;


