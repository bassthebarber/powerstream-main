// backend/uploads/processUpload.js

const path = require('path');
const fs = require('fs');

exports.processUpload = (file) => {
  const tempPath = file.path;
  const targetPath = path.join(__dirname, '../temp', file.originalname);

  fs.renameSync(tempPath, targetPath);
  return targetPath;
};
