// backend/core/mountSafe.js
import fs from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

export async function mount(app, basePath, relativeModulePath, key = basePath) {
  try {
    // idempotent guard (prevents duplicate mounts)
    const flag = `mounted:${key}`;
    if (app.locals[flag]) return false;

    // resolve module path relative to THIS file
    const here = path.dirname(fileURLToPath(import.meta.url));
    const abs = path.join(here, relativeModulePath);
    await fs.access(abs).catch(() => { throw new Error(`Module not found: ${relativeModulePath}`); });

    // dynamic import
    const mod = await import(pathToFileURL(abs).href);
    const router = mod.default || mod.router || mod.routes;
    if (!router || typeof router !== 'function') {
      throw new Error(`No default router export in ${relativeModulePath}`);
    }

    app.use(basePath, router);
    app.locals[flag] = true;
    console.log(`🔗 mounted ${basePath} -> ${relativeModulePath}`);
    return true;
  } catch (err) {
    console.warn(`⛔ skipped ${basePath}: ${err.message}`);
    return false;
  }
}
