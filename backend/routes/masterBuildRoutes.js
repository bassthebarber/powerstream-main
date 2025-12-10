// backend/routes/masterBuildRoutes.js
import express from "express";
import { runMasterBuild } from "../control-tower/OneCommandMasterBuild.js";

const router = Router();

// API endpoint to run master build
router.post("/master-build", async (req, res) => {
    try {
        const { speechType } = req.body; // "people", "president", "investors"
        await runMasterBuild(speechType);
        res.json({ status: "Build complete and speech played." });
    } catch (error) {
        console.error("Master build error:", error);
        res.status(500).json({ error: "Master build failed" });
    }
});

export default router;
