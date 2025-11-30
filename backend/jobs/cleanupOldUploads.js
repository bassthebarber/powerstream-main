import UploadLog from '../models/uploadLog.js';
import cloudinary from '../utils/cloudinary.js';

export const cleanupOldUploads = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const oldUploads = await UploadLog.find({ uploaded_at: { $lt: cutoff } });

  for (const file of oldUploads) {
    await cloudinary.uploader.destroy(file.public_id, { resource_type: file.type });
    await file.deleteOne();
  }

  console.log(`${oldUploads.length} old uploads deleted`);
};
