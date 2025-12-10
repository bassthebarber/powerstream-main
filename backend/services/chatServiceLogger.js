// backend/services/chatServiceLogger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceLogPath = path.join(__dirname, "../utils/logs/chat-service.log");

function ensureParent() {
  const dir = path.dirname(serviceLogPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureParent();

/**
 * Service-scoped logger for internal steps & failures
 * @param {string} stage - e.g. "db_write_start", "emit_complete"
 * @param {object} meta - details (roomId, userId, sizes, etc.)
 */
export function logServiceEvent(stage, meta = {}) {
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      stage,
      ...meta,
    }) + "\n";
    fs.appendFile(serviceLogPath, line, (err) => {
      if (err) console.error("❌ chatServiceLogger append failed:", err);
    });
  } catch (err) {
    console.error("❌ chatServiceLogger error:", err);
  }
}
