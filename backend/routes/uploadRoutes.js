// backend/routes/uploadRoutes.js
import { Router } from "express";
// import { handleUpload } from "../controllers/uploadController.js"; // <-- adjust if you have a controller

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ ok: true, service: "upload" });
});

// Example route — replace with real logic
// router.post("/", handleUpload);

export default router;
