// backend/uploads/images/resizeImage.js

import sharp from 'sharp';

export const resizeImage = async (filePath, width = 800, height = 800) => {
  const outputPath = filePath.replace(/(\.\w+)$/, '_resized$1');

  await sharp(filePath)
    .resize(width, height)
    .toFile(outputPath);

  return outputPath;
};

export default { resizeImage };
