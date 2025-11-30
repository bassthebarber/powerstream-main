// ✅ /backend/copilot/overrideHandler.js

module.exports = {
  overrideSetting(key, value) {
    console.log(`[Override] Setting ${key} overridden to:`, value);
    // Add logic to override any system setting dynamically
    return { key, newValue: value, success: true };
  },
};
