import RoyaltyWork from "../models/RoyaltyWork.js";
import RoyaltyPlay from "../models/RoyaltyPlay.js";

export const createWorkFromExport = async (req, res) => {
  try {
    const {
      title,
      ownerUserId,
      bpm,
      key,
      genre,
      durationSeconds,
      masterUrl,
      proAffiliations,
      writers,
    } = req.body;

    const work = await RoyaltyWork.create({
      title,
      ownerUserId,
      bpm,
      key,
      genre,
      durationSeconds,
      masterUrl,
      proAffiliations: proAffiliations || [],
      writers: writers || [],
      registrationStatus: "unregistered",
    });

    res.json({ success: true, work });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const logPlay = async (req, res) => {
  try {
    const { workId, userId, source, stationId, filmId, durationSeconds, fullPlay, territory } =
      req.body;

    const play = await RoyaltyPlay.create({
      workId,
      userId,
      source,
      stationId,
      filmId,
      durationSeconds,
      fullPlay,
      territory,
    });

    const inc = { totalStreams: 1 };
    if (durationSeconds) inc.totalWatchTimeSeconds = durationSeconds;

    await RoyaltyWork.findByIdAndUpdate(workId, { $inc: inc });

    res.json({ success: true, play });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getWorkSummary = async (req, res) => {
  try {
    const work = await RoyaltyWork.findById(req.params.id).lean();
    if (!work) return res.status(404).json({ success: false, error: "Not found" });

    const plays = await RoyaltyPlay.find({ workId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, work, plays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listWorks = async (req, res) => {
  try {
    const works = await RoyaltyWork.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, works });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
