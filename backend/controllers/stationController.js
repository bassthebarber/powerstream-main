import Station from "../models/Station.js";
import { generateStreamKey } from "../utils/streamKeyGenerator.js";
import mongoose from "mongoose";

export async function buildTVStation(req, res) {
  try {
    const { ownerId, stationName, layout = "powerfeed:auto" } = req.body || {};
    const owner = ownerId && mongoose.isValidObjectId(ownerId) ? ownerId : req.user?._id;
    if (!owner || !stationName) return res.status(400).json({ ok: false, error: "ownerId and stationName are required" });

    const exists = await Station.findOne({ owner, name: stationName });
    if (exists) return res.status(409).json({ ok: false, error: "Station name already exists for this owner" });

    const streamKey = generateStreamKey("station");
    const station = await Station.create({
      owner,
      name: stationName,
      layout,
      streamKey,
      isLive: false,
      playlist: [],
      status: "ready",
    });

    req.app.get("io")?.emit("station:created", { id: station._id, name: station.name });
    return res.json({ ok: true, station });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function listStations(req, res) {
  try {
    const q = {};
    if (!req.user?.isAdmin) q.owner = req.user._id;
    const stations = await Station.find(q).sort({ createdAt: -1 });
    return res.json({ ok: true, stations });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function startLive(req, res) {
  try {
    const { id } = req.params;
    const s = await Station.findById(id);
    if (!s) return res.status(404).json({ ok: false, error: "Station not found" });
    if (!req.user?.isAdmin && s.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ ok: false, error: "Forbidden" });

    s.isLive = true;
    s.status = "live";
    await s.save();
    req.app.get("io")?.emit("station:live", { id: s._id });
    return res.json({ ok: true, station: s });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function stopLive(req, res) {
  try {
    const { id } = req.params;
    const s = await Station.findById(id);
    if (!s) return res.status(404).json({ ok: false, error: "Station not found" });
    if (!req.user?.isAdmin && s.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ ok: false, error: "Forbidden" });

    s.isLive = false;
    s.status = "ready";
    await s.save();
    req.app.get("io")?.emit("station:offline", { id: s._id });
    return res.json({ ok: true, station: s });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
