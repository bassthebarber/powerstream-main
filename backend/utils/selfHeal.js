import fs from 'fs';

export function ensureFiles(files = []) {
  for (const {path, content} of files) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(require('path').dirname(path), { recursive: true });
      fs.writeFileSync(path, content, 'utf8');
      console.log(`🩹 Self-Heal: created ${path}`);
    }
  }
}
