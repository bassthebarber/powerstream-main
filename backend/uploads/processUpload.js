// backend/uploads/processUpload.js
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function processUpload(file) {
  const tempPath = file.path;
  const targetPath = path.join(__dirname, '../temp', file.originalname);

  fs.renameSync(tempPath, targetPath);
  return targetPath;
}

export default { processUpload };
