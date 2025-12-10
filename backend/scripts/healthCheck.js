#!/usr/bin/env node
// backend/scripts/healthCheck.js
// Comprehensive health check for all PowerStream services

import http from "http";
import https from "https";

const SERVICES = [
  { name: "Main Backend", url: "http://localhost:5001/api/health" },
  { name: "Auth Routes", url: "http://localhost:5001/api/auth/health" },
  { name: "Studio Backend", url: "http://localhost:5100/api/health" },
  { name: "Studio AI", url: "http://localhost:5100/api/studio/ai/health" },
  { name: "Mix Engine", url: "http://localhost:5100/api/mix/health" },
  { name: "Master Engine", url: "http://localhost:5100/api/studio/master/health" },
  { name: "Studio Core", url: "http://localhost:5100/api/studio/health" },
];

const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

async function checkService(service) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = service.url.startsWith("https") ? https : http;
    
    const timeout = setTimeout(() => {
      resolve({
        ...service,
        status: "timeout",
        time: Date.now() - startTime,
      });
    }, 5000);
    
    const req = protocol.get(service.url, (res) => {
      clearTimeout(timeout);
      let data = "";
      
      res.on("data", (chunk) => {
        data += chunk;
      });
      
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({
            ...service,
            status: res.statusCode === 200 ? "ok" : "error",
            statusCode: res.statusCode,
            data: json,
            time: Date.now() - startTime,
          });
        } catch {
          resolve({
            ...service,
            status: "error",
            statusCode: res.statusCode,
            time: Date.now() - startTime,
          });
        }
      });
    });
    
    req.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        ...service,
        status: "down",
        error: err.message,
        time: Date.now() - startTime,
      });
    });
  });
}

async function runHealthChecks() {
  console.log("\n" + COLORS.bold + "🏥 PowerStream Health Check" + COLORS.reset);
  console.log("=".repeat(50) + "\n");
  
  const results = await Promise.all(SERVICES.map(checkService));
  
  let passed = 0;
  let failed = 0;
  
  for (const result of results) {
    let icon, color;
    
    switch (result.status) {
      case "ok":
        icon = "✅";
        color = COLORS.green;
        passed++;
        break;
      case "down":
        icon = "❌";
        color = COLORS.red;
        failed++;
        break;
      case "timeout":
        icon = "⏰";
        color = COLORS.yellow;
        failed++;
        break;
      default:
        icon = "⚠️";
        color = COLORS.yellow;
        failed++;
    }
    
    const timeStr = `${result.time}ms`.padStart(6);
    console.log(
      `${icon} ${color}${result.name.padEnd(20)}${COLORS.reset} ` +
      `[${result.status.padEnd(7)}] ${timeStr}`
    );
    
    if (result.error) {
      console.log(`   ${COLORS.red}└─ ${result.error}${COLORS.reset}`);
    }
    
    if (result.data?.service) {
      console.log(`   └─ ${result.data.service} v${result.data.version || "1.0"}`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log(
    `${COLORS.bold}Summary:${COLORS.reset} ` +
    `${COLORS.green}${passed} passed${COLORS.reset}, ` +
    `${COLORS.red}${failed} failed${COLORS.reset}`
  );
  
  if (failed === 0) {
    console.log(`\n${COLORS.green}✅ All services are healthy!${COLORS.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${COLORS.red}❌ Some services are unhealthy.${COLORS.reset}`);
    console.log("Make sure all required services are running:\n");
    console.log("  1. Main Backend:   cd backend && node server.js");
    console.log("  2. Studio Backend: cd backend/recordingStudio && node RecordingStudioServer.js\n");
    process.exit(1);
  }
}

runHealthChecks().catch((err) => {
  console.error("Health check failed:", err);
  process.exit(1);
});
