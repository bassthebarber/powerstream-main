// backend/uploads/saveToCloudinary.js

const cloudinary = require('../configs/cloudinary');

exports.saveToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: folder || 'uploads',
    });

    return result.secure_url;
  } catch (error) {
    throw new Error('Cloudinary upload failed');
  }
};
