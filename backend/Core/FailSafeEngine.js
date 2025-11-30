// /backend/core/FailSafeEngine.js

export const FailSafeEngine = {
  wrapAsync(fn, label = "UNNAMED_TASK") {
    return async function (req, res, next) {
      try {
        await fn(req, res, next);
      } catch (err) {
        console.error(`❌ [${label}] CRASH PREVENTED`, err.message);
        res.status(500).json({ error: `FailSafe caught: ${label}` });
        // Optional: Send real-time alert to your admin dashboard here
      }
    };
  },

  wrapStartupTask(task, label = "BOOT_TASK") {
    try {
      task();
    } catch (err) {
      console.error(`❌ [${label}] Startup task failed:`, err.message);
      // Optional: write to a crash log file, or restart system
    }
  },

  monitorProcess() {
    process.on("uncaughtException", (err) => {
      console.error("🔥 Uncaught Exception:", err);
    });

    process.on("unhandledRejection", (err) => {
      console.error("🔥 Unhandled Rejection:", err);
    });

    console.log("🛡️ Global crash monitoring activated.");
  },
};
