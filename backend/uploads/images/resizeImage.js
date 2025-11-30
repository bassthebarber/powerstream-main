// backend/uploads/images/resizeImage.js

const sharp = require('sharp');
const path = require('path');

exports.resizeImage = async (filePath, width = 800, height = 800) => {
  const outputPath = filePath.replace(/(\.\w+)$/, '_resized$1');

  await sharp(filePath)
    .resize(width, height)
    .toFile(outputPath);

  return outputPath;
};
