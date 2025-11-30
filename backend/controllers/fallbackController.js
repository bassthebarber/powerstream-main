// ✅ /backend/controllers/fallbackController.js

const loadFallback = (req, res) => {
  const { component } = req.params;
  console.log(`[FallbackController] Triggered fallback for ${component}`);
  res.json({ component, fallbackApplied: true });
};

const rebuildSystem = (req, res) => {
  console.log("[FallbackController] Rebuilding full fallback system...");
  res.json({ rebuilt: true, timestamp: Date.now() });
};

export { loadFallback,
  rebuildSystem,
 };
