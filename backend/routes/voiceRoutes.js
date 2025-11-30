// backend/routes/voiceRoutes.js
import express from "express";
import { speakTextToFile } from "../voice/AIVoiceEngine.js";

const router = Router();

// Predefined speeches
const speeches = {
    people: `People of the world… welcome to PowerStream. I am the voice of a new digital era...`,  
    president: `Mr. President… I am PowerStream, the next generation of American innovation...`,  
    investors: `Distinguished investors… Welcome to PowerStream — the first all-in-one media ecosystem in history...`
};

router.get("/speak/:speechType", async (req, res) => {
    try {
        const { speechType } = req.params;
        const speechText = speeches[speechType];

        if (!speechText) {
            return res.status(404).json({ error: "Speech not found" });
        }

        const audioUrl = await speakTextToFile(speechText, `${speechType}.mp3`);
        res.json({ audioUrl });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

export default router;
