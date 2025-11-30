import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret";

export async function register(req, res) {
  try {
    const { name, email, username, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: "email and password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ ok: false, error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, username, password: hash, isAdmin: false });

    return res.json({ ok: true, user: { id: user._id, email: user.email } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const token = jwt.sign({ _id: user._id.toString(), isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ ok: true, token, user: { id: user._id, email: user.email, isAdmin: !!user.isAdmin } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });
    return res.json({ ok: true, user });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
