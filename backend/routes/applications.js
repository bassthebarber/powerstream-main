import express from "express";
import nodemailer from "nodemailer";
import Application from "../models/Application.js";
import Station from "../models/Stationmodel.js";
import { requireAdmin } from "../middleware/auth.js"; // Protect routes

const router = Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "SPSStreamNetwork@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD // App password
  }
});

// 📩 List applications (role aware)
router.get("/list", requireAdmin, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "assistant") {
      filter = { assignedTo: req.user._id }; // Only their own
    }
    const apps = await Application.find(filter).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    console.error("Error fetching apps:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ✅ Approve application
router.post("/approve/:id", requireAdmin, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );

    if (!app) return res.json({ success: false });

    // Send approval email
    await transporter.sendMail({
      from: "SPSStreamNetwork@gmail.com",
      to: app.email,
      subject: "✅ Southern Power Network License Approved",
      html: `
        <h2>Congratulations!</h2>
        <p>Your station <strong>${app.stationName}</strong> has been approved.</p>
        <p>Please submit your <strong>$1,000 license fee</strong> + first month’s payment to finalize your license.</p>
        <p>Once payment is confirmed, your streaming key will be issued.</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Approval error:", err);
    res.json({ success: false });
  }
});

// 🚫 Deny application
router.post("/deny/:id", requireAdmin, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Denied" },
      { new: true }
    );

    if (!app) return res.json({ success: false });

    // Send denial email
    await transporter.sendMail({
      from: "SPSStreamNetwork@gmail.com",
      to: app.email,
      subject: "🚫 Southern Power Network License Denied",
      html: `
        <h2>Application Status: Denied</h2>
        <p>Unfortunately, your application for ${app.stationName} was denied.</p>
        <p>If you wish to reapply, please contact us for further details.</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Denial error:", err);
    res.json({ success: false });
  }
});

// 📡 Issue Station
router.post("/issue", requireAdmin, async (req, res) => {
  try {
    const { stationName, ownerEmail, issuedBy } = req.body;

    const newStation = await Station.create({
      name: stationName,
      ownerEmail,
      issuedBy,
      revenueShare: { admin: 70, assistant: 30 }
    });

    res.json({ success: true, station: newStation });
  } catch (err) {
    console.error("Issue station error:", err);
    res.json({ success: false });
  }
});

export default router;
