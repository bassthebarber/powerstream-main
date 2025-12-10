// backend/src/api/routes/media.routes.js
// Canonical media routes (uploads, processing)
import { Router } from "express";
import mediaController from "../controllers/media.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// All media routes require authentication
router.use(requireAuth);

// Upload
router.post("/upload", mediaController.upload);
router.post("/upload-url", mediaController.getUploadUrl);

// Media management
router.get("/my", mediaController.getMyMedia);
router.get("/:id", mediaController.getMedia);
router.delete("/:id", mediaController.delete);

// Processing
router.post("/process", mediaController.processMedia);
router.get("/process/:jobId", mediaController.getProcessingStatus);

export default router;



