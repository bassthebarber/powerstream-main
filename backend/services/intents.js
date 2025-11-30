// backend/services/intents.js
// Mapped AI actions PowerStream can perform on command.

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { saveSnapshot } from "../utils/logs/snapshotLogger.js";

// Optional services (only if they exist in your repo)
let MasterCircuitBoard, StreamStatusModel, StationModel;
try { MasterCircuitBoard = (await import("../control-tower/MasterCircuitBoard.js")).default; } catch {}
try { StreamStatusModel = (await import("../models/StreamStatusModel.js")).then(m => m.default).catch(()=>null); } catch {}
try { StationModel = (await import("../models/StationModel.js")).then(m => m.default).catch(()=>null); } catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helpers
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function nowISO() { return new Date().toISOString(); }

// ---------- INTENT HANDLERS ----------

/** System health check */
async function handleHealth() {
  const mongo = mongoose?.connection?.readyState === 1 ? "up" : "down";
  const health = {
    service: "PowerStream Prime",
    time: nowISO(),
    mongo,
  };
  // Update board if available
  MasterCircuitBoard?.registerServiceStatus?.("mongo", mongo);
  return health;
}

/** Force save a snapshot message */
async function handleSnapshot({ entities }) {
  const label = entities?.label || "manual_snapshot";
  const data = {
    at: nowISO(),
    note: entities?.note || "Snapshot from AI command",
  };
  saveSnapshot?.(label, data);
  return { saved: true, label, data };
}

/** Open/Close voting (TGT, Civic, etc.) */
async function handleVoting({ entities }) {
  const action = entities?.action || "open";
  // Broadcast to sockets if board is present
  try {
    MasterCircuitBoard?.emit?.("voting_status", { action, at: nowISO() });
  } catch {}
  return { ok: true, action };
}

/** Start/Stop a stream and update StreamStatusModel (if present) */
async function handleStream({ entities }) {
  const action = entities?.action || "start";
  const station = entities?.station || "main";
  const status = action === "start" ? "live" : "offline";

  if (StreamStatusModel) {
    const doc = await StreamStatusModel.findOneAndUpdate(
      { station },
      { status, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    MasterCircuitBoard?.emit?.("stream_status", { station, status, id: doc?._id });
  } else {
    MasterCircuitBoard?.emit?.("stream_status", { station, status });
  }
  return { station, status };
}

/** Create a station quickly (if StationModel exists) */
async function handleCreateStation({ entities }) {
  if (!StationModel) throw new Error("StationModel not found");
  const name = entities?.name || "New Station";
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const station = await StationModel.create({
    name,
    slug,
    isLive: false,
    createdAt: new Date(),
  });
  MasterCircuitBoard?.emit?.("station_created", { id: station._id, name, slug });
  return { id: station._id, name, slug };
}

/** Seed demo data (safe, idempotent) */
async function handleSeed({ entities }) {
  const what = entities?.what || "stations";
  if (what === "stations" && StationModel) {
    const seeds = [
      { name: "PowerStream Live", slug: "powerstream-live" },
      { name: "Texas Got Talent", slug: "texas-got-talent" },
      { name: "Civic Connect", slug: "civic-connect" },
    ];
    for (const s of seeds) {
      await StationModel.findOneAndUpdate(
        { slug: s.slug },
        { ...s, isLive: false, updatedAt: new Date() },
        { upsert: true }
      );
    }
    return { ok: true, seeded: seeds.length, type: "stations" };
  }
  return { ok: false, note: "No matching seed type or model missing" };
}

/** Broadcast a chat/system message */
async function handleBroadcast({ entities }) {
  const message = entities?.message || "System message";
  MasterCircuitBoard?.emit?.("system_broadcast", { message, at: nowISO() });
  return { sent: true, message };
}

/** Create missing log folders/files */
async function handlePrepareLogs() {
  const logDir = process.env.LOG_DIR || "./backend/logs";
  const snapshotDir = process.env.SNAPSHOT_DIR || "./backend/logs/snapshots";
  ensureDir(logDir);
  ensureDir(snapshotDir);
  const chatFile = process.env.CHAT_LOG_FILE || path.join(logDir, "chat.log");
  const overrideFile = process.env.OVERRIDE_LOG_FILE || path.join(logDir, "override-log.txt");
  if (!fs.existsSync(chatFile)) fs.writeFileSync(chatFile, "", "utf8");
  if (!fs.existsSync(overrideFile)) fs.writeFileSync(overrideFile, "", "utf8");
  return { ok: true, logDir, snapshotDir, chatFile, overrideFile };
}

/** AI status pulse */
async function handleAIStatus() {
  MasterCircuitBoard?.markReady?.();
  MasterCircuitBoard?.emit?.("ai_status", { ready: true, at: nowISO() });
  return { ready: true, time: nowISO() };
}

// ---------- ENTITY EXTRACTORS ----------

const extractVote = (text) => {
  const action = /close|stop/.test(text) ? "close" : "open";
  return { action };
};

const extractStream = (text) => {
  const action = /stop|end|kill|shutdown/.test(text) ? "stop" : "start";
  const m = text.match(/station\s+([a-z0-9\-_\s]+)/i);
  const station = m ? m[1].trim() : undefined;
  return { action, station };
};

const extractCreateStation = (text) => {
  const m = text.match(/station\s+named?\s+“?("?)([^"]+)\1”?|station\s+(.+)$/i);
  const name = m ? (m[2] || m[3])?.trim() : undefined;
  return { name };
};

const extractSeed = (text) => {
  if (/station/.test(text)) return { what: "stations" };
  return { what: "unknown" };
};

const extractBroadcast = (text) => {
  const m = text.match(/say\s+(.+)$|broadcast\s+(.+)$/i);
  const message = (m && (m[1] || m[2])) ? (m[1] || m[2]).trim() : undefined;
  return { message };
};

const extractSnapshot = (text) => {
  const m = text.match(/snapshot(?:\s+as\s+|\s+named\s+)?([a-z0-9\-_]+)/i);
  const noteMatch = text.match(/note\s*:\s*(.+)$/i);
  return { label: m?.[1], note: noteMatch?.[1] };
};

// ---------- INTENTS REGISTRY ----------

const intents = {
  list: [
    {
      name: "health.check",
      keywords: ["health", "status", "ping", "heartbeat"],
      example: "check system health",
      handler: handleHealth,
    },
    {
      name: "logs.prepare",
      keywords: ["prepare logs", "init logs", "make logs", "ensure logs", "create logs"],
      example: "prepare logs and snapshots",
      handler: handlePrepareLogs,
    },
    {
      name: "snapshot.save",
      keywords: ["snapshot", "save snapshot"],
      patterns: [/snapshot\s*(?:as|named)?\s*[a-z0-9\-_]+/i],
      example: "save snapshot as launch_ready",
      extract: extractSnapshot,
      handler: handleSnapshot,
    },
    {
      name: "voting.toggle",
      keywords: ["open voting", "start voting", "close voting", "stop voting"],
      example: "open voting for texas got talent",
      extract: extractVote,
      handler: handleVoting,
    },
    {
      name: "stream.toggle",
      keywords: ["start stream", "go live", "stop stream", "end stream", "kill stream"],
      example: "start stream for station powerstream-live",
      extract: extractStream,
      handler: handleStream,
    },
    {
      name: "station.create",
      keywords: ["create station", "new station"],
      patterns: [/create station/i, /new station/i],
      example: "create station named Texas Got Talent",
      extract: extractCreateStation,
      handler: handleCreateStation,
    },
    {
      name: "seed.demo",
      keywords: ["seed", "demo data", "populate stations"],
      example: "seed stations",
      extract: extractSeed,
      handler: handleSeed,
    },
    {
      name: "broadcast.system",
      keywords: ["broadcast", "announce", "say"],
      example: "broadcast PowerStream going live in 5",
      extract: extractBroadcast,
      handler: handleBroadcast,
    },
    {
      name: "ai.status",
      keywords: ["ai ready", "ai status", "mark ready", "prime the ai"],
      example: "mark ai ready",
      handler: handleAIStatus,
    },
  ],
};

export default intents;
