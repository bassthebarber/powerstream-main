// backend/recordingStudio/controllers/royaltyController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix ES module dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fake royalty ledger storage
const DATA_FILE = path.join(__dirname, "../../exports/royalty-ledger.json");

// Ensure folder exists
const EXPORTS_DIR = path.join(__dirname, "../../exports");
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

// Load royalty data or create new
function loadLedger() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

// Save updated ledger
function saveLedger(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==============================
// Assign royalty split
// ==============================
export const assignRoyalty = async (req, res) => {
  try {
    const { trackId, participants, splitPercentages } = req.body;

    if (!trackId || !participants || !splitPercentages) {
      return res.status(400).json({ error: "Missing royalty assignment data" });
    }

    const ledger = loadLedger();

    ledger.push({
      id: Date.now(),
      trackId,
      participants,
      splitPercentages,
      timestamp: new Date().toISOString(),
    });

    saveLedger(ledger);

    res.json({
      message: "Royalty split saved",
      data: ledger[ledger.length - 1],
    });
  } catch (err) {
    console.error("assignRoyalty error:", err);
    res.status(500).json({ error: "Royalty assignment failed" });
  }
};

// ==============================
// Calculate payout
// ==============================
export const calculatePayout = async (req, res) => {
  try {
    const { trackId, totalEarnings } = req.body;

    if (!trackId || totalEarnings === undefined) {
      return res.status(400).json({ error: "Missing payout data" });
    }

    const ledger = loadLedger();
    const record = ledger.find((entry) => entry.trackId === trackId);

    if (!record) {
      return res.status(404).json({ error: "No royalty split found for track" });
    }

    const payout = record.participants.map((artist, i) => ({
      artist,
      percentage: record.splitPercentages[i],
      earnings: (record.splitPercentages[i] / 100) * totalEarnings,
    }));

    res.json({
      message: "Payout calculated",
      payout,
    });
  } catch (err) {
    console.error("calculatePayout error:", err);
    res.status(500).json({ error: "Payout calculation failed" });
  }
};

// ==============================
// Get royalty dashboard
// ==============================
export const getRoyaltyDashboard = async (req, res) => {
  try {
    const ledger = loadLedger();

    res.json({
      message: "Royalty dashboard loaded",
      ledger,
    });
  } catch (err) {
    console.error("getRoyaltyDashboard error:", err);
    res.status(500).json({ error: "Royalty dashboard failed" });
  }
};
