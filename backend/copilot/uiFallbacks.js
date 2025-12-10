// backend/copilot/uiFallbacks.js

const uiFallbacks = {
  loadDefaultUI(component) {
    console.log(`[UIFallbacks] Loading fallback UI for ${component}`);
    return { component, fallbackApplied: true };
  },
};

export default uiFallbacks;
