// backend/diagnostics/PrimeDiagnostics.js
import fs from "fs";
import path from "path";

const modulesToCheck = [
  "InfinityCore",
  "Copilot",
  "OverrideSystem",
  "VoiceCommand",
  "StreamController",
  "FeedController",
  "CommandRoutes",
  "MongoDB",
];

const PrimeDiagnostics = {
  run: () => {
    console.log("🔍 Running Prime Diagnostics...");
    const results = modulesToCheck.map((module) => {
      try {
        const modulePath = path.resolve(`./backend/${module}`);
        if (fs.existsSync(modulePath)) {
          return { module, status: "✅ Found" };
        } else {
          return { module, status: "❌ Missing" };
        }
      } catch (err) {
        return { module, status: "❌ Error" };
      }
    });

    results.forEach((res) =>
      console.log(`[${res.status}] ${res.module}`)
    );
    console.log("✅ PrimeDiagnostics complete.");
  },
};

export default PrimeDiagnostics;
