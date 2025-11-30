// ✅ /backend/copilot/patchEngine.js

module.exports = {
  applyPatch(type, data) {
    console.log(`[PatchEngine] Applying patch type: ${type}`);
    return { type, patched: true, data };
  },
};
