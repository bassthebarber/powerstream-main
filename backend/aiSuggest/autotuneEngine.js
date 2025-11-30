// backend/aiSuggest/AutoTuneEngine.js
const applyAutoTune = (audioPath) => {
  return audioPath.replace("raw/", "autotuned/");
};

module.exports = applyAutoTune;
