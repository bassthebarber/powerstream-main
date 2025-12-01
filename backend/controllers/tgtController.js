// backend/controllers/tgtController.js
import TgtContestant from "../models/TgtContestant.js";

export async function getContestants(req, res) {
  try {
    const { stationSlug = "texas-got-talent" } = req.query;
    const contestants = await TgtContestant.find({ stationSlug, isActive: true })
      .sort({ totalVotes: -1, createdAt: -1 })
      .lean();

    res.json({ ok: true, contestants });
  } catch (err) {
    console.error("Error fetching contestants:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch contestants" });
  }
}

export async function createContestant(req, res) {
  try {
    const { stationSlug, name, photoUrl, videoId, filmId, bio } = req.body;

    if (!name) {
      return res.status(400).json({ ok: false, message: "name required" });
    }

    const contestant = await TgtContestant.create({
      stationSlug: stationSlug || "texas-got-talent",
      name,
      photoUrl,
      videoId,
      filmId,
      bio,
    });

    res.status(201).json({ ok: true, contestant });
  } catch (err) {
    console.error("Error creating contestant:", err);
    res.status(500).json({ ok: false, message: "Failed to create contestant" });
  }
}

export async function voteForContestant(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Optional: track who voted for rate limiting

    const contestant = await TgtContestant.findById(id);
    if (!contestant) {
      return res.status(404).json({ ok: false, message: "Contestant not found" });
    }

    contestant.totalVotes += 1;
    await contestant.save();

    // Emit real-time update if socket available
    const io = req.app.get("io");
    if (io) {
      try {
        io.of("/tgt").emit("new_tgt_vote", {
          contestantId: contestant._id.toString(),
          totalVotes: contestant.totalVotes,
        });
      } catch (err) {
        console.warn("Failed to emit TGT vote update:", err);
      }
    }

    res.json({ ok: true, contestant, totalVotes: contestant.totalVotes });
  } catch (err) {
    console.error("Error voting:", err);
    res.status(500).json({ ok: false, message: "Failed to vote" });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const { stationSlug = "texas-got-talent", limit = 10 } = req.query;
    const contestants = await TgtContestant.find({ stationSlug, isActive: true })
      .sort({ totalVotes: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ ok: true, leaderboard: contestants });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch leaderboard" });
  }
}

