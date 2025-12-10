// backend/diagnostics/fullSystemDiagnostic.js
// PowerStream Full-System Health Scan

import mongoose from "mongoose";

const BASE = process.env.DIAG_BASE_URL || "http://localhost:5001";

const checks = [
  // Core health
  { group: "core", name: "API Health",         method: "GET", url: "/api/health" },

  // Auth
  { group: "auth", name: "Login (401 expected)", method: "POST", url: "/api/auth/login", expectStatus: 401 },

  // Social stack
  { group: "social", name: "PowerFeed",       method: "GET", url: "/api/feed" },
  { group: "social", name: "PowerGram",       method: "GET", url: "/api/powergram" },
  { group: "social", name: "PowerReel",       method: "GET", url: "/api/powerreel" },
  { group: "social", name: "PowerLine",       method: "GET", url: "/api/powerline/threads", expectStatus: 401 },

  // TV networks
  { group: "tv", name: "TV Stations",         method: "GET", url: "/api/tv-stations" },
  { group: "tv", name: "No Limit Forever TV", method: "GET", url: "/api/nlf/films" },
  { group: "tv", name: "Movies / Netflix",    method: "GET", url: "/api/movies" },

  // Church / Schools
  { group: "church", name: "Church Stations", method: "GET", url: "/api/church/stations" },
  { group: "schools", name: "School Stations", method: "GET", url: "/api/schools/stations" },
  { group: "schools", name: "School Games",    method: "GET", url: "/api/schools/games" },

  // Studio
  { group: "studio", name: "Studio Library",  method: "GET", url: "/api/studio/library" },

  // Extras (optional / nice-to-have)
  { group: "extra", name: "Suggested Users",  method: "GET", url: "/api/users/suggested" }
];

function expectedStatusFor(check) {
  if (check.expectStatus) return check.expectStatus;
  return 200;
}

async function runHttpCheck(check) {
  const url = `${BASE}${check.url}`;
  const result = {
    ...check,
    url,
    ok: false,
    status: null,
    error: null,
    timeMs: null
  };

  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: check.method,
      headers: { "Content-Type": "application/json" },
      body: check.method === "POST" ? JSON.stringify({ dummy: true }) : undefined
    });

    const expected = expectedStatusFor(check);
    result.status = res.status;
    result.ok = res.status === expected;
  } catch (err) {
    result.error = err.message || String(err);
  } finally {
    result.timeMs = Date.now() - start;
  }

  return result;
}

async function scanTodoMarkers() {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  // Look for TODO / FIXME / NOT_WIRED across the repo using findstr (Windows) or grep
  const isWindows = process.platform === "win32";
  
  try {
    let stdout = "";
    
    if (isWindows) {
      // Windows: use findstr
      const patterns = ["TODO", "FIXME", "NOT_WIRED"];
      for (const pattern of patterns) {
        try {
          const result = await execAsync(
            `findstr /S /I /N "${pattern}" *.js *.jsx *.ts *.tsx 2>nul`,
            { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 }
          );
          stdout += result.stdout;
        } catch {
          // findstr returns error if no matches, ignore
        }
      }
    } else {
      // Unix: use grep
      try {
        const result = await execAsync(
          `grep -rn "TODO\\|FIXME\\|NOT_WIRED" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null || true`,
          { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 }
        );
        stdout = result.stdout;
      } catch {
        // grep may fail, ignore
      }
    }

    const lines = stdout
      .split("\n")
      .filter(Boolean)
      .filter(line => !line.includes("node_modules"))
      .filter(line => !line.includes(".git"))
      .map((line) => {
        const parts = line.split(":");
        const file = parts[0];
        const lineNo = parts[1];
        const text = parts.slice(2).join(":").trim();
        return { file, line: Number(lineNo) || 0, text: text.substring(0, 100) };
      });

    return { ok: true, error: null, items: lines };
  } catch (err) {
    return { ok: false, error: err.message, items: [] };
  }
}

function printTable(results) {
  console.log("\n📊 ENDPOINT STATUS TABLE");
  console.log("─".repeat(80));
  console.log(
    "Status".padEnd(8) +
    "Group".padEnd(12) +
    "Name".padEnd(25) +
    "Time".padEnd(10) +
    "Details"
  );
  console.log("─".repeat(80));

  for (const r of results) {
    const status = r.ok ? "✅ PASS" : "❌ FAIL";
    const time = r.timeMs ? `${r.timeMs}ms` : "N/A";
    const details = r.error || `HTTP ${r.status}`;
    console.log(
      status.padEnd(8) +
      r.group.padEnd(12) +
      r.name.padEnd(25) +
      time.padEnd(10) +
      details.substring(0, 25)
    );
  }
  console.log("─".repeat(80));
}

function printGroupSummary(groups) {
  console.log("\n📈 GROUP READINESS SUMMARY");
  console.log("─".repeat(50));
  
  for (const [group, data] of Object.entries(groups)) {
    const bar = "█".repeat(Math.floor(data.readinessPercent / 10)) + 
                "░".repeat(10 - Math.floor(data.readinessPercent / 10));
    console.log(
      `${group.padEnd(12)} ${bar} ${data.readinessPercent}% (${data.passed}/${data.total})`
    );
  }
  console.log("─".repeat(50));
}

async function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║        🔧 POWERSTREAM FULL SYSTEM DIAGNOSTIC 🔧                  ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log(`\n📡 Base URL: ${BASE}`);
  console.log(`🕐 Time: ${new Date().toISOString()}`);

  // 1) DB state (if mongoose already connected in this process)
  let mongoState = "unknown";
  try {
    if (mongoose.connection && mongoose.connection.readyState !== undefined) {
      const states = ["disconnected", "connected", "connecting", "disconnecting"];
      mongoState = states[mongoose.connection.readyState] || String(mongoose.connection.readyState);
    }
  } catch {
    mongoState = "unknown";
  }
  console.log(`🗄️  MongoDB State: ${mongoState}`);

  // 2) HTTP checks
  console.log("\n⏳ Running endpoint checks...");
  const results = [];
  for (const check of checks) {
    const res = await runHttpCheck(check);
    results.push(res);
    process.stdout.write(res.ok ? "." : "x");
  }
  console.log(" Done!\n");

  const passed = results.filter((r) => r.ok).length;
  const total = results.length;
  const readiness = total > 0 ? Math.round((passed / total) * 100) : 0;

  // 3) Group breakdown
  const groups = {};
  for (const r of results) {
    if (!groups[r.group]) groups[r.group] = { passed: 0, total: 0 };
    groups[r.group].total += 1;
    if (r.ok) groups[r.group].passed += 1;
  }

  // Calculate group readiness
  for (const key of Object.keys(groups)) {
    groups[key].readinessPercent = Math.round((groups[key].passed / groups[key].total) * 100);
  }

  // Print results
  printTable(results);
  printGroupSummary(groups);

  // 4) TODO / wiring scan
  console.log("\n🔍 Scanning for TODO/FIXME markers...");
  const todoScan = await scanTodoMarkers();
  
  if (todoScan.items.length > 0) {
    console.log(`\n⚠️  Found ${todoScan.items.length} TODO/FIXME markers:`);
    const sample = todoScan.items.slice(0, 15);
    for (const item of sample) {
      console.log(`   ${item.file}:${item.line}`);
    }
    if (todoScan.items.length > 15) {
      console.log(`   ... and ${todoScan.items.length - 15} more`);
    }
  } else {
    console.log("✅ No TODO/FIXME markers found (or scan unavailable)");
  }

  // Final score
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║                    📊 PRODUCTION READINESS SCORE                 ║");
  console.log("╠══════════════════════════════════════════════════════════════════╣");
  
  const scoreBar = "█".repeat(Math.floor(readiness / 5)) + 
                   "░".repeat(20 - Math.floor(readiness / 5));
  const scoreEmoji = readiness >= 90 ? "🚀" : readiness >= 70 ? "✅" : readiness >= 50 ? "⚠️" : "❌";
  
  console.log(`║                                                                    ║`);
  console.log(`║     ${scoreBar}  ${readiness}% ${scoreEmoji}`.padEnd(69) + "║");
  console.log(`║                                                                    ║`);
  console.log(`║     Passed: ${passed}/${total} endpoints                                       ║`.substring(0, 69) + "  ║");
  console.log(`║                                                                    ║`);
  
  if (readiness >= 90) {
    console.log("║     Status: PRODUCTION READY 🎉                                   ║");
  } else if (readiness >= 70) {
    console.log("║     Status: NEARLY READY - Minor fixes needed                     ║");
  } else if (readiness >= 50) {
    console.log("║     Status: IN PROGRESS - Several endpoints need attention        ║");
  } else {
    console.log("║     Status: NOT READY - Major wiring required                     ║");
  }
  
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log("\n=== END OF DIAGNOSTIC ===\n");

  // Return for programmatic use
  return {
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    mongoState,
    readinessPercent: readiness,
    summary: { passed, total },
    groups,
    httpResults: results,
    wiringScan: {
      ok: todoScan.ok,
      error: todoScan.error,
      totalItems: todoScan.items.length,
      sample: todoScan.items.slice(0, 30)
    }
  };
}

main().catch((err) => {
  console.error("❌ Diagnostic failed with error:", err);
  process.exit(1);
});

