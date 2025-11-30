// backend/aiSuggest/GenreClassifier.js
const classifyGenre = (lyrics) => {
  const tags = [];
  if (lyrics.includes("trap") || lyrics.includes("street")) tags.push("Trap");
  if (lyrics.includes("club") || lyrics.includes("dance")) tags.push("Dance");
  if (lyrics.includes("love") || lyrics.includes("pain")) tags.push("R&B");
  return tags.length ? tags : ["Hip-Hop"];
};

module.exports = classifyGenre;
