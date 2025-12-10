// backend/uploads/saveToCloudinary.js
import { v2 as cloudinary } from "cloudinary";

export async function saveToCloudinary(filePath, folder) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: folder || 'uploads',
    });

    return result.secure_url;
  } catch (error) {
    throw new Error('Cloudinary upload failed');
  }
}

export default { saveToCloudinary };
