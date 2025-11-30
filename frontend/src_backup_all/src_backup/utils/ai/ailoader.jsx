// frontend/src/utils/ai/ai-loader.js
// Loads AI memory layers, models, or configs on init

const loadAIModel = async () => {
  try {
    const res = await fetch("/api/ai/load-model");
    const model = await res.json();
    console.log("AI Model Loaded:", model.name);
    return model;
  } catch (err) {
    console.error("AI Model Load Error:", err);
    return null;
  }
};

export default loadAIModel;


