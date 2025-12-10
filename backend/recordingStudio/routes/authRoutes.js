import express from "express";
import StudioUser from "../models/StudioUser.js";

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password required" });
    }

    const existing = await StudioUser.findOne({ email });
    if (existing) {
      return res.status(409).json({ ok: false, message: "User already exists" });
    }

    const user = await StudioUser.create({ email, password, name, role });
    res.status(201).json({
      ok: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await StudioUser.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    // No JWT for now, just return user info
    res.json({
      ok: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get all users (admin view)
router.get("/users", async (_req, res, next) => {
  try {
    const users = await StudioUser.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: users });
  } catch (err) {
    next(err);
  }
});

export default router;
