// backend/controllers/tvStationController.js
import Station from "../models/Station.js";
import Film from "../models/Film.js";

export async function getStations(req, res) {
  try {
    const { network, region, country } = req.query;
    const filter = { isPublic: true };

    if (network) filter.network = network;
    if (region) filter.region = region;
    if (country) filter.country = country;

    const stations = await Station.find(filter)
      .sort({ name: 1 })
      .lean();

    res.json({ ok: true, stations });
  } catch (err) {
    console.error("Error fetching stations:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch stations" });
  }
}

export async function getStationBySlug(req, res) {
  try {
    const { slug } = req.params;
    const station = await Station.findOne({ slug, isPublic: true }).lean();

    if (!station) {
      return res.status(404).json({ ok: false, message: "Station not found" });
    }

    // Fetch recorded content for this station
    const recordedContent = await Film.find({
      stationSlug: slug,
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      ok: true,
      station: {
        ...station,
        recordedContent,
      },
    });
  } catch (err) {
    console.error("Error fetching station:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch station" });
  }
}

export async function getSouthernPowerStations(req, res) {
  try {
    const stations = await Station.find({
      network: "Southern Power Syndicate",
      isPublic: true,
    })
      .sort({ name: 1 })
      .lean();

    res.json({ ok: true, stations });
  } catch (err) {
    console.error("Error fetching Southern Power stations:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch stations" });
  }
}

export async function getWorldwideStations(req, res) {
  try {
    const stations = await Station.find({
      $or: [
        { region: "International" },
        { region: { $ne: "US" } },
        { country: { $exists: true, $ne: "US" } },
      ],
      isPublic: true,
    })
      .sort({ region: 1, name: 1 })
      .lean();

    res.json({ ok: true, stations });
  } catch (err) {
    console.error("Error fetching worldwide stations:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch stations" });
  }
}
