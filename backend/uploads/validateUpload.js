// backend/uploads/validateUpload.js

exports.validateUpload = (file) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'video/mp4', 'image/jpeg', 'image/png'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  return true;
};
