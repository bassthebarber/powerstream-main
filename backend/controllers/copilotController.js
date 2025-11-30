// backend/controllers/copilotController.js
import { ensureTVPage } from "../services/tvBuilder.js";

export async function handleCopilotCommand(req, res) {
  try {
    const command = (req.body?.command || "").toLowerCase();
    const context = req.body?.context || {};

    switch (command) {
      case "build powerfeed":
        return res.status(202).json({ ok: true, accepted: true, step: "powerfeed" });

      case "build powergram":
        return res.status(202).json({ ok: true, accepted: true, step: "powergram" });

      case "build powerreel":
        return res.status(202).json({ ok: true, accepted: true, step: "powerreel" });

      case "build tv": {
        const r = await ensureTVPage(context);
        return res.status(202).json({ ok: true, accepted: true, step: "tv", a: r });
      }

      default:
        return res.json({ ok: false, accepted: false, message: `Unknown command: ${command}` });
    }
  } catch (err) {
    console.error("Copilot error:", err);
    return res.status(500).json({ ok: false, error: "copilot_failed", detail: err?.message });
  }
}
