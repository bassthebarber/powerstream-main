// backend/uploads/video/validateVideo.js

exports.validateVideo = (file) => {
  const allowedTypes = ['video/mp4'];
  const maxSize = 200 * 1024 * 1024; // 200MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid video type');
  }

  if (file.size > maxSize) {
    throw new Error('Video file too large');
  }

  return true;
};
