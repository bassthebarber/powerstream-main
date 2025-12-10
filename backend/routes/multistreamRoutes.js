// backend/routes/multistreamRoutes.js
// Combined multistream routes (profiles + sessions)
import { Router } from "express";

// Import sub-routers
import multistreamProfileRoutes from "./multistreamProfileRoutes.js";
import multistreamSessionRoutes from "./multistreamSessionRoutes.js";

const router = Router();

// Mount profile routes (GET/POST/PUT/DELETE /profiles/*)
router.use("/", multistreamProfileRoutes);

// Mount session routes (GET /sessions/*, GET /status)
router.use("/", multistreamSessionRoutes);

export default router;



