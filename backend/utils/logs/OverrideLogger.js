// backend/ControlTower/Logs/LogManager.js

const fs = require('fs');
const path = require('path');

const logFiles = [
  'override.log',
  'error.log',
  'system.log',
  'ai_tasks.log',
  'command_history.log',
  'audit_trail.log',
  'stream_activity.log'
];

function clearLogs() {
  logFiles.forEach(file => {
    const logPath = path.join(__dirname, file);
    fs.writeFileSync(logPath, '');
    console.log(`[LogManager] Cleared: ${file}`);
  });
}

function getLogFileContents(fileName) {
  const logPath = path.join(__dirname, fileName);
  if (fs.existsSync(logPath)) {
    return fs.readFileSync(logPath, 'utf-8');
  } else {
    return '[LogManager] File not found';
  }
}

module.exports = { clearLogs, getLogFileContents };
