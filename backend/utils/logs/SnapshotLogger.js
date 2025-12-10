// backend/utils/logs/SnapshotLogger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Always lowercase 'snapshots'
const snapshotDir = path.join(__dirname, 'snapshots');

if (!fs.existsSync(snapshotDir)) {
  fs.mkdirSync(snapshotDir, { recursive: true });
  console.log(`📂 Created snapshots folder: ${snapshotDir}`);
}

export function saveSnapshot(label, data = {}) {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name  = `${label}-${stamp}.json`;
    const file  = path.join(snapshotDir, name);
    fs.writeFileSync(file, JSON.stringify({ ...data, _ts: new Date().toISOString() }, null, 2));
    console.log(`📸 Snapshot saved: ${name}`);
  } catch (err) {
    console.error('❌ Snapshot error:', err);
  }
}
