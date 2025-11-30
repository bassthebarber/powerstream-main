// backend/voice/mediaVoiceActions.js
import Media from '../models/Media.js';
import path from 'path';
import fs from 'fs';

// Add media by voice
export const uploadMediaByVoice = async ({ userId, filePath, type }) => {
  try {
    const media = new Media({
      userId,
      filePath,
      type, // "audio" | "video"
      createdAt: new Date()
    });
    await media.save();
    return { success: true, media };
  } catch (err) {
    console.error("UploadMediaByVoice Error:", err);
    return { success: false, message: err.message };
  }
};

// Play media by voice
export const playMediaByVoice = async (mediaId) => {
  try {
    const media = await Media.findById(mediaId);
    if (!media) return { success: false, message: "Media not found" };
    return { success: true, url: media.filePath };
  } catch (err) {
    console.error("PlayMediaByVoice Error:", err);
    return { success: false, message: err.message };
  }
};

// Delete media by voice
export const deleteMediaByVoice = async (mediaId) => {
  try {
    const media = await Media.findById(mediaId);
    if (!media) return { success: false, message: "Media not found" };

    const absPath = path.resolve(media.filePath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
    }

    await media.deleteOne();
    return { success: true, message: "Media deleted" };
  } catch (err) {
    console.error("DeleteMediaByVoice Error:", err);
    return { success: false, message: err.message };
  }
};
