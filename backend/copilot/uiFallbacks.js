// ✅ /backend/copilot/uiFallbacks.js

module.exports = {
  loadDefaultUI(component) {
    console.log(`[UIFallbacks] Loading fallback UI for ${component}`);
    return { component, fallbackApplied: true };
  },
};
