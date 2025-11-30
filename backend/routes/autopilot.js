// backend/routes/autopilot.js
import express from "express";
import { runAutopilotCommand } from "../controllers/autopilotController.js";

const router = express.Router();

// 🔥 AutoPilot Command Receiver
// Trigger from frontend: POST /api/autopilot/run
router.post("/run", async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ 
        success: false, 
        message: "No command provided." 
      });
    }

    console.log("🤖 AutoPilot received command:", command);

    const result = await runAutopilotCommand(command);

    return res.json({
      success: true,
      message: "Autopilot executed.",
      result
    });

  } catch (error) {
    console.error("❌ Autopilot error:", error);
    return res.status(500).json({
      success: false,
      message: "Autopilot failed.",
      error: error.message
    });
  }
});

export default router;
