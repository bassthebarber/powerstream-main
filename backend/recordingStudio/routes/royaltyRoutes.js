import express from "express";
import Royalty from "../models/Royalty.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const r = await Royalty.create(req.body);
    res.status(201).json({ ok: true, data: r });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const list = await Royalty.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
