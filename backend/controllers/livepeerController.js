// backend/controllers/livepeerController.js
import Station from "../models/Station.js";

const LIVEPEER_API = "https://livepeer.studio/api";
const requiredEnv = ["LIVEPEER_API_KEY"];
for (const k of requiredEnv) {
  if (!process.env[k]) {
    console.warn(`⚠️ Missing ${k} in .env — /api/livepeer endpoints will fail until you set it`);
  }
}

// Create a Livepeer stream for this station, save ingest + playback to DB
export async function attachLivepeer(req, res) {
  try {
    const { stationId } = req.params;
    if (!stationId) return res.status(400).json({ ok: false, error: "stationId is required" });

    const station = await Station.findById(stationId);
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });

    // 1) Create a new Livepeer stream
    const createRes = await fetch(`${LIVEPEER_API}/stream`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LIVEPEER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `station-${station._id}`,
        profiles: [
          { name: "720p",   bitrate: 2000000, fps: 30, width: 1280, height: 720 },
          { name: "480p",   bitrate: 1000000, fps: 30, width: 854,  height: 480 },
          { name: "360p",   bitrate: 600000,  fps: 30, width: 640,  height: 360 }
        ],
        record: false
      }),
    });

    if (!createRes.ok) {
      const txt = await createRes.text();
      return res.status(500).json({ ok: false, error: `Livepeer create failed: ${txt}` });
    }
    const stream = await createRes.json();
    // stream: { id, streamKey, playbackId, ingest: { rtmp: { url } }, ... } (fields may vary)

    // Normalize useful fields
    const playbackUrl = `https://livepeercdn.com/hls/${stream.playbackId}/index.m3u8`;
    const rtmpUrl = stream?.ingest?.rtmp?.url || stream?.ingest?.rtmp || "rtmp://rtmp.livepeer.com/live";

    station.ingest = {
      provider: "livepeer",
      streamId: stream.id,
      streamKey: stream.streamKey,
      rtmpUrl,
    };
    station.playbackUrl = playbackUrl;
    station.isLive = false;

    await station.save();

    // Optional: notify sockets
    req.app.get("io")?.emit("station:livepeer:attached", {
      id: station._id,
      playbackUrl,
    });

    return res.json({ ok: true, station });
  } catch (err) {
    console.error("attachLivepeer error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
