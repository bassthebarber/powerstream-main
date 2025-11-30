// backend/controllers/aiController.js
import { aiQueue, AI_QUEUE_NAME } from "../queues/aiQueue.js";

export const addAIJob = async (req, res) => {
  try {
    const { type, payload } = req.body || {};
    if (!type) return res.status(400).json({ success: false, error: "Missing 'type'" });

    const job = await aiQueue.add(AI_QUEUE_NAME, { type, payload });
    return res.json({ success: true, jobId: job.id });
  } catch (e) {
    console.error("[AI] addAIJob error:", e);
    return res.status(500).json({ success: false, error: "AI queue error" });
  }
};
