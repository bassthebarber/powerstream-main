// backend/aiSuggest/autotuneEngine.js

const applyAutoTune = (audioPath) => {
  return audioPath.replace("raw/", "autotuned/");
};

export default applyAutoTune;
