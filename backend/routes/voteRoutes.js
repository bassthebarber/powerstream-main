import express from "express";
import Vote from "../models/Vote.js";

const router = Router();

// Increment vote for video
router.post("/:videoId", async (req, res) => {
  const { videoId } = req.params;

  const vote = await Vote.findOneAndUpdate(
    { video: videoId },
    { $inc: { totalVotes: 1 } },
    { new: true, upsert: true }
  );

  res.json(vote);
});

export default router;
