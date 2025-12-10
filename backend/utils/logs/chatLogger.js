// backend/utils/logs/chatLogger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure a stable logs directory next to this file
const logsDir = path.join(__dirname);
const chatLogPath = path.join(logsDir, "chat.log");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(logsDir);

/**
 * Write a JSON line to chat.log
 * @param {string} event - short event name e.g. "message_sent"
 * @param {object} meta - any serializable metadata
 */
export function logChatEvent(event, meta = {}) {
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      event,
      ...meta,
    }) + "\n";
    fs.appendFile(chatLogPath, line, (err) => {
      if (err) console.error("❌ chatLogger append failed:", err);
    });
  } catch (err) {
    console.error("❌ chatLogger error:", err);
  }
}
