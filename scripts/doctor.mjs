// scripts/doctor.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function ok(msg){ console.log("✅", msg); }
function warn(msg){ console.log("⚠️", msg); }
function err(msg){ console.error("❌", msg); }

try {
  // Node version
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 18) err(`Node ${process.versions.node} — upgrade to >=18`);
  else ok(`Node ${process.versions.node}`);

  // package.json exists?
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error("package.json not found in current folder");
  }
  ok("package.json present");

  // vite config
  const viteCfg = ["vite.config.js","vite.config.mjs","vite.config.ts"].find(f=>existsSync(join(root,f)));
  viteCfg ? ok(`Vite config: ${viteCfg}`) : warn("No vite.config.* found (will still run if using defaults)");

  // supabase client
  const sbClient = join(root, "src", "supabaseClient.js");
  existsSync(sbClient) ? ok("src/supabaseClient.js present") : warn("Missing src/supabaseClient.js (only a warning if you don't use it)");

  // env
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    const env = readFileSync(envPath, "utf8");
    const hasUrl  = /VITE_SUPABASE_URL=/.test(env);
    const hasKey  = /VITE_SUPABASE_ANON_KEY=/.test(env);
    if (hasUrl && hasKey) ok(".env.local has Supabase keys");
    else warn(".env.local present but missing one or both Supabase keys");
  } else {
    warn("No .env.local file found");
  }

  ok("Doctor check completed");
  process.exit(0);
} catch (e) {
  err(e.message || String(e));
  process.exit(1);
}
