// backend/controllers/aiStudioProController.js

import {
  analyzeVocals,
  autoMixBeat,
  generateBeatPlan,
  autoVocalTuner,
  createChallenge,
  evaluateChallengeTake,
  quickFeedback,
  genres,
  coachModeKeys,
  genreProfilesData,
  coachModesData,
} from "../services/aiStudioProService.js";

// ============================================
// VOCAL ANALYZER
// ============================================
export const analyzeVocalsController = async (req, res) => {
  try {
    const { transcript, performanceNotes, genre, coachMode } = req.body;

    const result = await analyzeVocals({
      transcript,
      performanceNotes,
      genre: genre || "RNB",
      coachMode: coachMode || "STANDARD",
    });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in analyzeVocalsController:", err);
    res.status(500).json({ message: "Failed to analyze vocals.", error: err.message });
  }
};

// ============================================
// AUTO MIX BEAT
// ============================================
export const autoMixBeatController = async (req, res) => {
  try {
    const { stemsDescription, genre, coachMode } = req.body;

    const result = await autoMixBeat({
      stemsDescription,
      genre: genre || "RAP",
      coachMode: coachMode || "PRODUCER",
    });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in autoMixBeatController:", err);
    res.status(500).json({ message: "Failed to generate mix advice.", error: err.message });
  }
};

// ============================================
// BEAT PLAN GENERATOR
// ============================================
export const generateBeatPlanController = async (req, res) => {
  try {
    const { mood, tempoBpm, genre, coachMode, referenceArtists } = req.body;

    const result = await generateBeatPlan({
      mood,
      tempoBpm,
      genre: genre || "RAP",
      coachMode: coachMode || "PRODUCER",
      referenceArtists,
    });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in generateBeatPlanController:", err);
    res.status(500).json({ message: "Failed to generate beat plan.", error: err.message });
  }
};

// ============================================
// AUTO VOCAL TUNER
// ============================================
export const autoVocalTunerController = async (req, res) => {
  try {
    const { vocalAnalysisSummary, genre, coachMode } = req.body;

    const result = await autoVocalTuner({
      vocalAnalysisSummary,
      genre: genre || "RNB",
      coachMode: coachMode || "RNB_COACH",
    });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in autoVocalTunerController:", err);
    res.status(500).json({ message: "Failed to generate tuner settings.", error: err.message });
  }
};

// ============================================
// CHALLENGE MODE
// ============================================
export const createChallengeController = async (req, res) => {
  try {
    const { artistName, genre, targetScore } = req.body;

    const result = await createChallenge({
      artistName,
      genre: genre || "RAP",
      targetScore: targetScore || 85,
    });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in createChallengeController:", err);
    res.status(500).json({ message: "Failed to create challenge.", error: err.message });
  }
};

// ============================================
// CHALLENGE EVALUATION
// ============================================
export const evaluateChallengeController = async (req, res) => {
  try {
    const { challenge, latestScores, genre } = req.body;

    if (!challenge || !latestScores) {
      return res.status(400).json({ message: "challenge and latestScores are required." });
    }

    const result = await evaluateChallengeTake({
      challenge,
      latestScores,
      genre: genre || "RAP",
    });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in evaluateChallengeController:", err);
    res.status(500).json({ message: "Failed to evaluate challenge.", error: err.message });
  }
};

// ============================================
// QUICK FEEDBACK
// ============================================
export const quickFeedbackController = async (req, res) => {
  try {
    const { transcript, genre, coachMode } = req.body;

    const result = await quickFeedback({
      transcript,
      genre: genre || "RAP",
      coachMode: coachMode || "STANDARD",
    });

    if (result.error) {
      return res.status(500).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error("Error in quickFeedbackController:", err);
    res.status(500).json({ message: "Failed to generate quick feedback.", error: err.message });
  }
};

// ============================================
// OPTIONS (for frontend dropdowns)
// ============================================
export const getOptionsController = async (req, res) => {
  try {
    res.json({
      genres,
      coachModes: coachModeKeys,
      genreProfiles: genreProfilesData,
      coachModeDetails: coachModesData,
    });
  } catch (err) {
    console.error("Error in getOptionsController:", err);
    res.status(500).json({ message: "Failed to fetch options.", error: err.message });
  }
};





