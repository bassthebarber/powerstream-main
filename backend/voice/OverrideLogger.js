// overrideLogger.js
import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../logs/overrides');

export function logOverrideAction(label, actionData) {
  const fileName = `${label}-${Date.now()}.json`;
  const filePath = path.join(logDir, fileName);
  fs.writeFile(filePath, JSON.stringify(actionData, null, 2), (err) => {
    if (err) {
      console.error("❌ Failed to log override action:", err);
    } else {
      console.log(`📄 Override log saved: ${fileName}`);
    }
  });
}
