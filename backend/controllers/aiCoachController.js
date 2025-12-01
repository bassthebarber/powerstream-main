// backend/controllers/aiCoachController.js

import { 
  analyzePerformance, 
  listSessions, 
  getRecentTakesForTrack,
  getSessionById 
} from "../services/aiCoachService.js";
import CoachPersona from "../models/CoachPersona.js";

export const analyzePerformanceController = async (req, res) => {
  try {
    const { artistName, trackTitle, coachMode, lyrics, transcript, audioUrl } = req.body;

    if (!artistName || !trackTitle) {
      return res.status(400).json({ message: "artistName and trackTitle are required." });
    }

    const session = await analyzePerformance({
      artistName,
      trackTitle,
      coachMode: coachMode || "standard",
      lyrics: lyrics || "",
      transcript: transcript || "",
      audioUrl: audioUrl || "",
    });

    res.status(201).json(session);
  } catch (err) {
    console.error("Error in analyzePerformanceController:", err);
    res.status(500).json({ message: "Failed to analyze performance.", error: err.message });
  }
};

export const listSessionsController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "50", 10);
    const skip = parseInt(req.query.skip || "0", 10);
    const sessions = await listSessions({ limit, skip });
    res.json(sessions);
  } catch (err) {
    console.error("Error in listSessionsController:", err);
    res.status(500).json({ message: "Failed to fetch sessions.", error: err.message });
  }
};

export const getSessionController = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await getSessionById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    res.json(session);
  } catch (err) {
    console.error("Error in getSessionController:", err);
    res.status(500).json({ message: "Failed to fetch session.", error: err.message });
  }
};

export const getRecentTakesController = async (req, res) => {
  try {
    const { trackTitle, artistName } = req.query;
    const limit = parseInt(req.query.limit || "3", 10);

    if (!trackTitle || !artistName) {
      return res.status(400).json({ message: "trackTitle and artistName are required." });
    }

    const takes = await getRecentTakesForTrack({ trackTitle, artistName, limit });
    
    // Sort by overall score to find the best take
    const sortedByScore = [...takes].sort((a, b) => 
      (b.scores?.overall || 0) - (a.scores?.overall || 0)
    );
    
    const bestTakeId = sortedByScore[0]?._id?.toString() || null;

    res.json({
      takes,
      bestTakeId,
      totalTakes: takes.length,
    });
  } catch (err) {
    console.error("Error in getRecentTakesController:", err);
    res.status(500).json({ message: "Failed to fetch recent takes.", error: err.message });
  }
};

export const listPersonasController = async (req, res) => {
  try {
    const personas = await CoachPersona.find({}).sort({ key: 1 }).lean();
    res.json(personas);
  } catch (err) {
    console.error("Error in listPersonasController:", err);
    res.status(500).json({ message: "Failed to fetch coach personas.", error: err.message });
  }
};

export const getPersonaController = async (req, res) => {
  try {
    const { key } = req.params;
    const persona = await CoachPersona.findOne({ key }).lean();
    if (!persona) {
      return res.status(404).json({ message: "Persona not found." });
    }
    res.json(persona);
  } catch (err) {
    console.error("Error in getPersonaController:", err);
    res.status(500).json({ message: "Failed to fetch persona.", error: err.message });
  }
};

export const upsertPersonaController = async (req, res) => {
  try {
    const { key, displayName, description, stylePrompt, active } = req.body;

    if (!key || !displayName || !stylePrompt) {
      return res
        .status(400)
        .json({ message: "key, displayName, and stylePrompt are required." });
    }

    const persona = await CoachPersona.findOneAndUpdate(
      { key },
      {
        key,
        displayName,
        description: description || "",
        stylePrompt,
        active: active !== undefined ? active : true,
      },
      { upsert: true, new: true }
    );

    res.json(persona);
  } catch (err) {
    console.error("Error in upsertPersonaController:", err);
    res.status(500).json({ message: "Failed to save coach persona.", error: err.message });
  }
};

export const deletePersonaController = async (req, res) => {
  try {
    const { key } = req.params;
    
    // Don't allow deleting the standard persona
    if (key === "standard") {
      return res.status(400).json({ message: "Cannot delete the standard persona." });
    }

    const result = await CoachPersona.findOneAndDelete({ key });
    if (!result) {
      return res.status(404).json({ message: "Persona not found." });
    }
    res.json({ message: "Persona deleted successfully.", deleted: result });
  } catch (err) {
    console.error("Error in deletePersonaController:", err);
    res.status(500).json({ message: "Failed to delete persona.", error: err.message });
  }
};

// Seed default personas if none exist
export const seedPersonasController = async (req, res) => {
  try {
    const existing = await CoachPersona.countDocuments();
    if (existing > 0) {
      return res.json({ message: "Personas already exist.", count: existing });
    }

    const defaultPersonas = [
      {
        key: "standard",
        displayName: "Standard Coach",
        description: "Balanced, professional feedback with clear direction.",
        stylePrompt: "Be honest, direct, and motivating. Push the artist to improve, do not sugarcoat. Use short, clear sentences. Give specific, actionable feedback.",
        active: true,
      },
      {
        key: "dre",
        displayName: "Precision Mode (Dre)",
        description: "Meticulous attention to detail, focused on perfection.",
        stylePrompt: "You are Dr. Dre in the studio. You demand perfection. Every syllable matters. You're known for making artists do 50+ takes until it's flawless. Be direct, no-nonsense, and push for technical excellence. Point out the smallest imperfections. Use short, commanding sentences. 'Do it again. That breath was off. The pocket isn't right.'",
        active: true,
      },
      {
        key: "master_p",
        displayName: "No Limit Hustle Mode",
        description: "High energy, hustle-focused, entrepreneurial spirit.",
        stylePrompt: "You are Master P, the No Limit soldier. You push artists with that New Orleans hustle energy. Talk about grinding, staying hungry, and outworking everyone. Mix motivation with real talk. Use phrases like 'Make em say uhh!', 'bout it bout it', reference the hustle and the grind. Be encouraging but keep it real about what needs work. That No Limit tank mentality - never give up!",
        active: true,
      },
      {
        key: "kanye",
        displayName: "Creative Genius Mode",
        description: "Bold, visionary feedback focused on artistic innovation.",
        stylePrompt: "You are Kanye West. You think in terms of art, culture, and legacy. Push artists to think bigger - this isn't just a song, it's a statement. Be bold and confident in your feedback. Reference art, fashion, architecture. Challenge them to be iconic, not just good. 'This could be a moment. But you're playing it safe. Where's the vision? Where's the thing that makes people stop?' Be provocative and inspiring.",
        active: true,
      },
      {
        key: "timbaland",
        displayName: "Rhythm & Flow Mode",
        description: "Groove-focused, rhythm-centric production perspective.",
        stylePrompt: "You are Timbaland. Everything is about the pocket, the groove, the bounce. You hear music in terms of rhythm and feel. Give feedback focused on timing, flow, how words ride the beat. Use onomatopoeia and beatbox references. 'That line needs to hit on the AND not the ONE. Feel that bounce - bum-bum-BAP. You're rushing the hook, let it breathe.' Focus on musicality and groove.",
        active: true,
      },
      {
        key: "motivational",
        displayName: "Motivational Mode",
        description: "Positive, encouraging feedback to build confidence.",
        stylePrompt: "Be extremely encouraging and positive while still being helpful. Focus on what the artist did RIGHT first, then gently suggest improvements. Use affirmations and build confidence. 'You've got real talent here! I love how you...' Always end on a high note. This artist needs to feel believed in. Your job is to make them excited to try again, not defeated.",
        active: true,
      },
      {
        key: "scarface20",
        displayName: "Scarface 2.0 — The Digital Don",
        description: "South Houston street gospel storytelling, pain rap with vivid scenes, loyalty, redemption, faith.",
        stylePrompt: "You are Scarface 2.0, The Digital Don from No Limit East Houston. You are the first AI artist signed to the label. Your style is South Houston street gospel meets pain rap. You don't glorify the pain — you document it. Every verse should feel like a short movie. Focus on: delivery (make me FEEL it), emotion (authentic, not performative), storytelling clarity (who, where, what, why), and authenticity (real talk, no cap). Use phrases like: 'That's real talk right there.', 'Nah, run it back — make me feel it.', 'You telling a story or just saying words?', 'South Houston don't do halfway. Give me all of it.' Be direct, wise, no sugar-coating. Push artists to tell their truth with conviction. Reference loyalty, betrayal, faith, family, consequences. The streets have lessons — make sure they come through in every bar.",
        active: true,
      },
    ];

    await CoachPersona.insertMany(defaultPersonas);
    res.status(201).json({ message: "Default personas seeded.", count: defaultPersonas.length });
  } catch (err) {
    console.error("Error in seedPersonasController:", err);
    res.status(500).json({ message: "Failed to seed personas.", error: err.message });
  }
};
