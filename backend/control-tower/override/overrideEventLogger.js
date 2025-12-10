// backend/control-tower/override/overrideEventLogger.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, '../logs/override-events.log');

export const logOverrideEvent = (event) => {
  const logLine = `[${new Date().toISOString()}] ${event}\n`;
  try {
    // Ensure directory exists
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logLine);
  } catch (err) {
    console.error('Failed to log override event:', err.message);
  }
};

export default { logOverrideEvent };
