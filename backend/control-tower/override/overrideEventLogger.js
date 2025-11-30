// backend/control-tower/override/overrideEventLogger.js

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/override-events.log');

const logOverrideEvent = (event) => {
  const logLine = `[${new Date().toISOString()}] ${event}\n`;
  fs.appendFileSync(logFile, logLine);
};

module.exports = { logOverrideEvent };
