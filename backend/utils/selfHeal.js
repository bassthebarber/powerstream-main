import fs from "fs";
import path from "path";

export function ensureFiles(files = []) {
  for (const {path: filePath, content} of files) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`🩹 Self-Heal: created ${filePath}`);
    }
  }
}

export default { ensureFiles };
