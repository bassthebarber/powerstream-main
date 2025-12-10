import express from "express";
import fetch from "node-fetch"; // Node18+ could use global fetch
import Station from "../models/Station.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/ping", (_req, res) => {
  res.json({ ok: true, service: "livepeer", keyPresent: !!process.env.LIVEPEER_API_KEY, ts: new Date().toISOString() });
});

// Attach Livepeer stream to a station
router.post("/attach/:stationId?", authRequired, async (req, res) => {
  try {
    const stationId = req.params.stationId || req.body.stationId;
    if (!stationId) return res.status(400).json({ ok: false, error: "stationId is required" });

    const station = await Station.findById(stationId);
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    if (String(station.owner) !== String(req.user.id) && !req.user.isAdmin) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }

    const apiKey = process.env.LIVEPEER_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: "LIVEPEER_API_KEY missing" });

    // Create LP stream
    const resp = await fetch("https://livepeer.studio/api/stream", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `ps-${station.name}-${station._id}`,
        profiles: [
          { name: "720p", bitrate: 2000000, fps: 30, width: 1280, height: 720 },
          { name: "480p", bitrate: 800000, fps: 30, width: 854, height: 480 },
          { name: "360p", bitrate: 400000, fps: 30, width: 640, height: 360 },
        ],
        record: false,
      }),
    });

    const lp = await resp.json();
    if (!resp.ok) return res.status(502).json({ ok: false, error: `livepeer create failed: ${JSON.stringify(lp)}` });

    const ingestRtmp = `rtmp://rtmp.livepeer.com/live`;
    const playbackUrl = `https://livepeercdn.com/hls/${lp.playbackId}/index.m3u8`;

    station.ingest = { rtmpUrl: ingestRtmp, streamKey: lp.streamKey, playbackId: lp.playbackId };
    station.playbackUrl = playbackUrl;
    await station.save();

    res.json({ ok: true, station });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
