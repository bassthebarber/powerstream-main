// watchdog.js
import http from "http";

setInterval(() => {
  http
    .get("http://localhost:5001/api/status", (res) => {
      if (res.statusCode !== 200) {
        console.log("⚠️ Backend down, attempting auto-restart...");
        import("./utils/systemOverride.js").then((mod) => mod.restartBackend());
      } else {
        console.log("✅ Backend healthy");
      }
    })
    .on("error", () => {
      console.log("❌ Connection error, initiating override...");
      import("./utils/systemOverride.js").then((mod) => mod.restartBackend());
    });
}, 60000); // every 60 seconds
