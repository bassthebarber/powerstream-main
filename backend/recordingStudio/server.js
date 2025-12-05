// ============================================================
// ⚠️ DEPRECATED: This file is a minimal stub.
// For the FULL Recording Studio server with all routes, use:
//   node RecordingStudioServer.js
// Or:
//   nodemon RecordingStudioServer.js
// ============================================================

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.STUDIO_PORT || 5100;  // Default to 5100 to match frontend

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "PowerHarmony Recording Studio (MINIMAL)",
    time: new Date().toISOString(),
    warning: "This is the minimal server. Use RecordingStudioServer.js for full functionality.",
  });
});

// Basic studio routes only
import studioRoutes from "./routes/studioRoutes.js";
app.use("/api/studio", studioRoutes);

// Static folder
app.use("/renders", express.static(path.join(__dirname, "renders")));

// Start server with deprecation warning
app.listen(PORT, () => {
  console.log(`⚠️ DEPRECATED: This is the minimal server.js`);
  console.log(`   For full functionality, run: nodemon RecordingStudioServer.js`);
  console.log(`   PowerHarmony minimal backend running on port ${PORT}`);
});
