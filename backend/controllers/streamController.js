// backend/controllers/StreamController.js
import Stream from "../models/StreamModel.js";
import Station from "../models/StationModel.js";

export async function listStreams(req, res, next) {
  try {
    const { station, isLive } = req.query;
    const q = {};
    if (station) q.station = station;
    if (typeof isLive !== "undefined") q.isLive = isLive === "true";
    const items = await Stream.find(q).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) { next(err); }
}

export async function getStream(req, res, next) {
  try {
    const item = await Stream.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Stream not found" });
    res.json(item);
  } catch (err) { next(err); }
}

export async function createStream(req, res, next) {
  try {
    const { station, title, ingestUrl, playbackUrl, streamKey } = req.body;
    if (station) {
      const s = await Station.findById(station).lean();
      if (!s) return res.status(400).json({ message: "Invalid station" });
    }
    const created = await Stream.create({
      station, title, ingestUrl, playbackUrl, streamKey, isLive: false
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
}

export async function updateStream(req, res, next) {
  try {
    const updated = await Stream.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Stream not found" });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteStream(req, res, next) {
  try {
    const deleted = await Stream.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Stream not found" });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function startStream(req, res, next) {
  try {
    const updated = await Stream.findByIdAndUpdate(
      req.params.id,
      { $set: { isLive: true, startedAt: new Date(), endedAt: null } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Stream not found" });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function endStream(req, res, next) {
  try {
    const updated = await Stream.findByIdAndUpdate(
      req.params.id,
      { $set: { isLive: false, endedAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Stream not found" });
    res.json(updated);
  } catch (err) { next(err); }
}
