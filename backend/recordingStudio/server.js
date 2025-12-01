// backend/recordingStudio/RecordingStudioServer.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.STUDIO_PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "PowerHarmony Recording Studio",
    time: new Date().toISOString(),
  });
});

// === STUDIO ROUTES HOOK ===
// If you already have routes/studioRoutes.js wired, keep this:
import studioRoutes from "./routes/studioRoutes.js";
app.use("/api/studio", studioRoutes);

// Static folder for rendered files (optional)
app.use("/renders", express.static(path.join(__dirname, "renders")));

// Start server
app.listen(PORT, () => {
  console.log(`PowerHarmony backend running on port ${PORT}`);
});
