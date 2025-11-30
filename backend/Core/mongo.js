// backend/core/mongo.js
import mongoose from "mongoose";

let ioRef = null;
export function bindIO(io) {
  ioRef = io;
}

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/powerstream";

const RETRY_BASE_MS = Number(process.env.MONGO_RETRY_BASE_MS || 1000);   // 1s
const RETRY_MAX_MS  = Number(process.env.MONGO_RETRY_MAX_MS  || 30000); // 30s
const CONNECT_TIMEOUT_MS = Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 120000); // 2m

let attempts = 0;
let connecting = null;

/** Human readable state */
export function mongoState() {
  switch (mongoose.connection.readyState) {
    case 0: return "disconnected";
    case 1: return "connected";
    case 2: return "connecting";
    case 3: return "disconnecting";
    default: return "unknown";
  }
}

function emit(status, extra = {}) {
  // console + socket broadcast
  const payload = { status, at: Date.now(), ...extra };
  const tag = `🧠 Mongo:${status}`;
  if (status === "connected") console.log(tag);
  else console.warn(tag, extra.error?.message || "");
  ioRef?.emit("db:status", payload);
}

/** Connect with exponential backoff and never give up */
export async function connectMongo() {
  if (connecting) return connecting;

  connecting = new Promise(async (resolve) => {
    const start = Date.now();
    while (true) {
      try {
        attempts++;
        emit("connecting", { attempts });
        await mongoose.connect(MONGO_URI); // Mongoose 7+: no deprecated flags needed
        attempts = 0;
        emit("connected");
        return resolve(true);
      } catch (err) {
        const elapsed = Date.now() - start;
        if (elapsed > CONNECT_TIMEOUT_MS) {
          emit("timeout", { error: err });
          // keep looping, but inform listeners we hit timeout window
        }
        const delay = Math.min(RETRY_BASE_MS * 2 ** Math.min(attempts, 8), RETRY_MAX_MS);
        emit("retrying", { inMs: delay, error: err });
        await new Promise((r) => setTimeout(r, delay));
        // loop continues
      }
    }
  });

  return connecting;
}

/** Await readiness before serving DB-dependent routes */
export async function awaitMongoReady(timeoutMs = 15000) {
  if (mongoose.connection.readyState === 1) return true;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (mongoose.connection.readyState === 1) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

/** Hook events for visibility and auto-recovery logs */
export function wireMongoEvents() {
  mongoose.connection.on("connected", () => emit("connected"));
  mongoose.connection.on("disconnected", () => emit("disconnected"));
  mongoose.connection.on("reconnected", () => emit("reconnected"));
  mongoose.connection.on("error", (err) => emit("error", { error: err }));
}
