// backend/controllers/devController.js
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";       // you already created this
import Station from "../models/Station.js"; // you have this
import { generateStreamKey } from "../utils/streamKeyGenerator.js"; // you have this

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret";

export async function bootstrapDev(req, res) {
  try {
    // 1) Create or find an admin
    let admin = await User.findOne({ email: "admin@powerstream.dev" });
    if (!admin) {
      admin = await User.create({
        name: "Admin",
        username: "admin",
        email: "admin@powerstream.dev",
        password: "dev-admin", // dev only; you can hash later
        isAdmin: true,
      });
    }

    // 2) Issue a token
    const token = jwt.sign(
      { _id: admin._id.toString(), isAdmin: true },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 3) Create a demo station if none
    let station = await Station.findOne({ owner: admin._id, name: "Global Prime" });
    if (!station) {
      station = await Station.create({
        owner: admin._id,
        name: "Global Prime",
        layout: "powerfeed:auto",
        streamKey: generateStreamKey("station"),
        isLive: false,
        playlist: [],
        status: "ready",
      });
    }

    return res.json({
      ok: true,
      admin: { id: admin._id, email: admin.email },
      token,
      station: { id: station._id, name: station.name, streamKey: station.streamKey },
      hints: [
        "Use this token as Bearer to call protected endpoints.",
        "POST /api/stations/build to create more stations.",
      ],
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function inspectDev(_req, res) {
  try {
    const users = await User.countDocuments();
    const stations = await Station.countDocuments();
    return res.json({ ok: true, users, stations, mongo: mongoose.connection?.readyState });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
