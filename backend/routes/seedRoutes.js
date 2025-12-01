// backend/routes/seedRoutes.js
import { Router } from "express";
import { seedSPSStations } from "../seeders/spsStationSeeder.js";
import { seedTGTContestants } from "../seeders/tgtContestantSeeder.js";
import { seedFilms } from "../seeders/filmSeeder.js";
import { seedWorldwideStations } from "../seeders/worldwideStationSeeder.js";

const router = Router();

// Seed SPS stations
router.post("/sps-stations", async (req, res) => {
  try {
    const result = await seedSPSStations();
    res.json(result);
  } catch (err) {
    console.error("Error seeding stations:", err);
    res.status(500).json({ ok: false, message: "Failed to seed stations" });
  }
});

// Seed TGT contestants
router.post("/tgt-contestants", async (req, res) => {
  try {
    const result = await seedTGTContestants();
    res.json(result);
  } catch (err) {
    console.error("Error seeding contestants:", err);
    res.status(500).json({ ok: false, message: "Failed to seed contestants" });
  }
});

// Seed films
router.post("/films", async (req, res) => {
  try {
    const result = await seedFilms();
    res.json(result);
  } catch (err) {
    console.error("Error seeding films:", err);
    res.status(500).json({ ok: false, message: "Failed to seed films" });
  }
});

// Seed worldwide stations
router.post("/worldwide-stations", async (req, res) => {
  try {
    const result = await seedWorldwideStations();
    res.json(result);
  } catch (err) {
    console.error("Error seeding worldwide stations:", err);
    res.status(500).json({ ok: false, message: "Failed to seed worldwide stations" });
  }
});

// Seed everything
router.post("/all", async (req, res) => {
  try {
    const results = {
      sps: await seedSPSStations(),
      tgt: await seedTGTContestants(),
      films: await seedFilms(),
      worldwide: await seedWorldwideStations(),
    };
    res.json({ ok: true, message: "All data seeded", results });
  } catch (err) {
    console.error("Error seeding all:", err);
    res.status(500).json({ ok: false, message: "Failed to seed all data" });
  }
});

export default router;

