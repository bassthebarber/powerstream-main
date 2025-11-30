// backend/utils/moderationFilter.js

const badWords = ['nigger', 'bitch', 'fuck', 'shit', 'kill', 'suicide']; // Add more or load from DB

/**
 * Checks if a message contains banned words
 */
exports.containsInappropriateLanguage = (text) => {
  const lower = text.toLowerCase();
  return badWords.some((word) => lower.includes(word));
};

/**
 * Cleans the message by replacing banned words with asterisks
 */
exports.censorMessage = (text) => {
  let cleaned = text;
  badWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '****');
  });
  return cleaned;
};
