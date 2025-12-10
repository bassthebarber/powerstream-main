// backend/routes/devRoutes.js
import express from "express";
import { bootstrapDev, inspectDev } from "../controllers/devController.js";

const router = Router();

// No auth; DEV ONLY. Remove in production.
router.post("/bootstrap", bootstrapDev);
router.get("/inspect", inspectDev);

export default router;
