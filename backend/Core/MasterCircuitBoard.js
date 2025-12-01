// backend/core/MasterCircuitBoard.js
// Master router registrar with Windows-safe dynamic imports.

import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Convert a relative module path (from this file) to a file:// URL string
function toFileUrlFromHere(relativeModulePath) {
  const abs = path.resolve(__dirname, relativeModulePath);
  return pathToFileURL(abs).href; // ESM-friendly on Windows
}

// Safe mount helper: never crashes your server
export async function mount(app, mountPath, relativeModulePath) {
  try {
    const href = toFileUrlFromHere(relativeModulePath);
    const mod = await import(href);
    const router = mod.default ?? mod.router ?? mod;
    if (router && typeof router === "function") {
      app.use(mountPath, router);
      console.log(`🔗 mounted ${mountPath} -> ${relativeModulePath}`);
    } else {
      console.warn(`⚠️  ${relativeModulePath} loaded but no default/router export; skipped`);
    }
  } catch (err) {
    const msg = err?.message || String(err);
    if (err?.code === "ERR_MODULE_NOT_FOUND" || /Cannot find module/i.test(msg)) {
      console.warn(`⛔ skipped ${mountPath}: Module not found: ${relativeModulePath}`);
    } else {
      console.warn(`⚠️  failed to mount ${mountPath} from ${relativeModulePath}:`, msg);
    }
  }
}

/**
 * Register all services. Returns true if we executed (so server can skip compat mounts).
 */
export async function registerServices(app) {
  console.log("🛠️ Master Circuit Board: registering routes…");

  // --- Core ---
  await mount(app, "/api/feed",           "../routes/feedRoutes.js");
  await mount(app, "/api/audio",          "../routes/audioRoutes.js");
  await mount(app, "/api/video",          "../routes/videoRoutes.js");
  await mount(app, "/api/auth",           "../routes/authRoutes.js");
  await mount(app, "/api/users",          "../routes/userRoutes.js");

  // --- Money ---
  await mount(app, "/api/coins",          "../routes/coinRoutes.js");
  await mount(app, "/api/payouts",        "../routes/payoutRoutes.js");
  await mount(app, "/api/subscriptions",  "../routes/subscriptionRoutes.js");
  await mount(app, "/api/withdrawals",    "../routes/withdrawalRoutes.js");

  // --- Stations / Streams / Uploads ---
  await mount(app, "/api/stations",       "../routes/stationRoutes.js");
  await mount(app, "/api/stream",         "../routes/streamRoutes.js");
  await mount(app, "/api/upload",         "../routes/uploadRoutes.js");
  await mount(app, "/api/live",           "../routes/liveRoutes.js");

  // --- Social extras ---
  await mount(app, "/api/gram",           "../routes/gramRoutes.js");
  await mount(app, "/api/reels",          "../routes/reelRoutes.js");
  await mount(app, "/api/devices",        "../routes/deviceRoutes.js");

  // --- Control / AI / Jobs ---
  await mount(app, "/api/intents",        "../routes/intentRoutes.js");
  await mount(app, "/api/admin",          "../routes/adminRoutes.js");
  await mount(app, "/api/commands",       "../routes/commandRoutes.js");
  await mount(app, "/api/autopilot",      "../routes/autopilotRoutes.js"); // ✅ fixed quote
  await mount(app, "/api/jobs",           "../routes/jobRoutes.js");

  // ✅ fixed typo previously (copotilot → copilot)
  await mount(app, "/api/copilot",        "../routes/copilotRoutes.js");

  // --- AI Coach (Performance Feedback) ---
  await mount(app, "/api/aicoach",        "../routes/aiCoachRoutes.js");
  await mount(app, "/api/aistudio",   "../routes/aiStudioProRoutes.js");

  console.log("✅ Master Circuit Board: done.");
  return true;
}

export default registerServices;
