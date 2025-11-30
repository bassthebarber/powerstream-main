// backend/uploads/cleanupTempFiles.js

const fs = require('fs');

exports.cleanupTempFiles = (filePath) => {
  try {
    fs.unlinkSync(filePath);
    console.log('Temporary file deleted:', filePath);
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
};
