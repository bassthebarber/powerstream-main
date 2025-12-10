import express from "express";
import ArtistIntake from "../models/ArtistIntake.js";
import Beat from "../models/Beat.js";
import Recording from "../models/Recording.js";
import MixJob from "../models/MixJob.js";

const router = express.Router();

router.get("/summary", async (_req, res, next) => {
  try {
    const [intakes, beats, recordings, mixes] = await Promise.all([
      ArtistIntake.countDocuments(),
      Beat.countDocuments(),
      Recording.countDocuments(),
      MixJob.countDocuments(),
    ]);

    res.json({
      ok: true,
      data: {
        intakes,
        beats,
        recordings,
        mixes,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
