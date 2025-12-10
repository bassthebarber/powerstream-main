// backend/aiSuggest/captionWriter.js

const generateCaption = (lyrics) => {
  if (lyrics.includes("hustle")) return "Grind hard, shine harder.";
  if (lyrics.includes("struggle")) return "Out the mud and into greatness.";
  return "Real music. Real story.";
};

export default generateCaption;
