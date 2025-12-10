// backend/uploads/cleanupTempFiles.js
import fs from "fs";

export function cleanupTempFiles(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log('Temporary file deleted:', filePath);
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
}

export default { cleanupTempFiles };
