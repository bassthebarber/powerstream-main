// backend/diagnostics/quickDiag.js
// Quick PowerStream Diagnostic - No dependencies

const BASE = "http://localhost:5001";

const checks = [
  { name: "API Health", url: "/api/health" },
  { name: "PowerFeed", url: "/api/feed" },
  { name: "PowerGram", url: "/api/powergram" },
  { name: "PowerReel", url: "/api/powerreel" },
  { name: "TV Stations", url: "/api/tv-stations" },
  { name: "NLF Films", url: "/api/nlf/films" },
  { name: "Movies", url: "/api/movies" },
  { name: "Church", url: "/api/church/stations" },
  { name: "Schools", url: "/api/schools/stations" },
  { name: "Studio", url: "/api/studio/library" },
];

async function run() {
  console.log("\n=== POWERSTREAM QUICK DIAGNOSTIC ===\n");
  
  let pass = 0, fail = 0;
  
  for (const check of checks) {
    try {
      const res = await fetch(`${BASE}${check.url}`, { 
        method: "GET",
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        console.log(`✅ ${check.name}`);
        pass++;
      } else {
        console.log(`⚠️ ${check.name} (${res.status})`);
        fail++;
      }
    } catch (e) {
      console.log(`❌ ${check.name} - ${e.message}`);
      fail++;
    }
  }
  
  const pct = Math.round((pass / (pass + fail)) * 100);
  console.log(`\n=== SCORE: ${pct}% (${pass}/${pass + fail}) ===\n`);
  
  process.exit(0);
}

run();

