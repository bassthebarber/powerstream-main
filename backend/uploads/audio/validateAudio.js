// backend/uploads/audio/validateAudio.js

export const validateAudio = (file) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav'];
  const maxSize = 20 * 1024 * 1024; // 20MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid audio type');
  }

  if (file.size > maxSize) {
    throw new Error('Audio file too large');
  }

  return true;
};

export default { validateAudio };
