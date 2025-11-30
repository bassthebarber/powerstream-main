// backend/controllers/UserPresenceController.js
import UserPresence from "../models/UserPresenceModel.js";

export async function getPresence(req, res, next) {
  try {
    const { userId } = req.params;
    const doc = await UserPresence.findOne({ user: userId }).lean();
    if (!doc) return res.status(404).json({ message: "Presence not found" });
    res.json(doc);
  } catch (err) { next(err); }
}

export async function setPresence(req, res, next) {
  try {
    const { userId } = req.params;
    const { status, inRoom, device, ip } = req.body;
    const doc = await UserPresence.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          status,
          inRoom: inRoom || null,
          device: device || null,
          ip: ip || req.ip,
          lastSeenAt: new Date()
        }
      },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (err) { next(err); }
}

export async function touchPresence(req, res, next) {
  try {
    const { userId } = req.params;
    const doc = await UserPresence.findOneAndUpdate(
      { user: userId },
      { $set: { lastSeenAt: new Date(), status: "online" } },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (err) { next(err); }
}

export async function listOnline(req, res, next) {
  try {
    const items = await UserPresence
      .find({ status: { $in: ["online", "busy", "away"] } })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(items);
  } catch (err) { next(err); }
}
