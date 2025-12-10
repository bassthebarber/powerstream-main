// backend/copilot/overrideHandler.js

const overrideHandler = {
  overrideSetting(key, value) {
    console.log(`[Override] Setting ${key} overridden to:`, value);
    // Add logic to override any system setting dynamically
    return { key, newValue: value, success: true };
  },
};

export default overrideHandler;
