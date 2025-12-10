// backend/copilot/historyEngine.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_PATH = path.join(__dirname, "../../logs/override-log.txt");

const historyEngine = {
  listSnapshots() {
    if (!fs.existsSync(LOG_PATH)) return [];

    const logData = fs.readFileSync(LOG_PATH, "utf-8");
    return logData
      .split("\n")
      .filter((line) => line.includes("Snapshot:"))
      .map((line) => line.replace("Snapshot:", "").trim());
  },

  retrieveSnapshot(snapshotName) {
    const snapshotPath = path.join(__dirname, "../../.snapshots", snapshotName);

    if (!fs.existsSync(snapshotPath)) {
      console.log(`[HistoryEngine] Snapshot "${snapshotName}" not found.`);
      return null;
    }

    const files = fs.readdirSync(snapshotPath);
    const contents = files.map((file) => {
      const content = fs.readFileSync(path.join(snapshotPath, file), "utf-8");
      return { file, content };
    });

    return contents;
  },

  saveSnapshot(name) {
    const snapshotDir = path.join(__dirname, "../../.snapshots", name);
    if (!fs.existsSync(snapshotDir))
      fs.mkdirSync(snapshotDir, { recursive: true });

    const pagesDir = path.join(__dirname, "../../frontend/pages");
    const filesToSave = [
      "index.js",
      "southernpower.js",
      "nolimit/easthouston.js",
    ];

    filesToSave.forEach((filename) => {
      const filePath = path.join(pagesDir, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        fs.writeFileSync(
          path.join(snapshotDir, filename.replace("/", "_")),
          content
        );
      }
    });

    fs.appendFileSync(LOG_PATH, `Snapshot: ${name}\n`);
    console.log(`[HistoryEngine] Snapshot "${name}" saved.`);
  },
};

export default historyEngine;
