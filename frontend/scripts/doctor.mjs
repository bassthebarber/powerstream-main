// scripts/doctor.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const ok   = (m) => console.log("✅", m);
const warn = (m) => console.log("⚠️", m);
const err  = (m) => console.error("❌", m);

(async () => {
  try {
    console.log("\n🩺 PowerStream Doctor — running checks...\n");

    // 1) Node version
    const nodeMajor = Number(process.versions.node.split(".")[0]);
    if (nodeMajor < 18) err(`Node ${process.versions.node} — upgrade to >= 18`);
    else ok(`Node ${process.versions.node}`);

    // 2) package.json present
    const pkgPath = join(root, "package.json");
    if (!existsSync(pkgPath)) throw new Error("package.json not found in this folder");
    ok("package.json found");

    // 3) Vite config
    const viteConfigs = ["vite.config.mjs", "vite.config.js", "vite.config.ts"];
    const foundViteCfg = viteConfigs.find((f) => existsSync(join(root, f)));
    if (foundViteCfg) ok(`Vite config: ${foundViteCfg}`);
    else warn("No vite.config.* found (Vite can still run with defaults)");

    // 4) Supabase client (optional)
    const sbClient = join(root, "src", "supabaseClient.js");
    existsSync(sbClient)
      ? ok("src/supabaseClient.js present")
      : warn("No src/supabaseClient.js (only a warning if you don't use Supabase)");

    // 5) .env.local checks (optional)
    const envPath = join(root, ".env.local");
    if (existsSync(envPath)) {
      const env = readFileSync(envPath, "utf8");
      const hasUrl = /VITE_SUPABASE_URL=/.test(env);
      const hasKey = /VITE_SUPABASE_ANON_KEY=/.test(env);
      if (hasUrl && hasKey) ok(".env.local has Supabase vars");
      else warn(".env.local present but missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    } else {
      warn("No .env.local file");
    }

    // 6) Entry files
    const idxHtml = existsSync(join(root, "index.html"));
    const mainJsx = existsSync(join(root, "src", "main.jsx"));
    const appJsx  = existsSync(join(root, "src", "App.jsx"));
    idxHtml ? ok("index.html present") : err("index.html missing");
    mainJsx ? ok("src/main.jsx present") : err("src/main.jsx missing");
    appJsx  ? ok("src/App.jsx present")  : err("src/App.jsx missing");

    console.log("\n✅ Doctor check completed.\n");
    process.exit(0);
  } catch (e) {
    err(e.message || String(e));
    process.exit(1);
  }
})();
