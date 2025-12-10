// frontend/studio-app/src/components/StudioProControls.jsx

import React, { useState } from "react";
import "./StudioProControls.css";
import { API_BASE } from "../config/api.js";

const GENRES = [
  { value: "RNB", label: "R&B" },
  { value: "SOUTHERN_SOUL", label: "Southern Soul" },
  { value: "RAP", label: "Rap" },
  { value: "POP", label: "Pop" },
  { value: "HIPHOP", label: "Hip-Hop" },
  { value: "GOSPEL", label: "Gospel" },
];

const COACH_MODES = [
  { value: "STANDARD", label: "Standard" },
  { value: "RNB_COACH", label: "R&B Coach" },
  { value: "SOUTHERN_SOUL_COACH", label: "Southern Soul Coach" },
  { value: "DRAE_MODE", label: "Drae Mode (Aggressive)" },
  { value: "PRODUCER", label: "Producer Mode" },
  { value: "MENTOR", label: "Mentor Mode" },
];

export default function StudioProControls({ sessionId, lastTranscript, lastScores }) {
  const [genre, setGenre] = useState("RNB");
  const [coachMode, setCoachMode] = useState("STANDARD");

  const [vocalResult, setVocalResult] = useState(null);
  const [mixResult, setMixResult] = useState(null);
  const [beatPlan, setBeatPlan] = useState(null);
  const [tunerResult, setTunerResult] = useState(null);

  const [challenge, setChallenge] = useState(null);
  const [challengeEval, setChallengeEval] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Use centralized API config
  const apiBase = API_BASE;

  async function callEndpoint(path, body) {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${apiBase}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If you use JWT auth, add:
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let message = `Request failed: ${res.status}`;
        try {
          const err = await res.json();
          if (err.message) message = err.message;
        } catch (_) {}
        throw new Error(message);
      }

      const data = await res.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error("[StudioProControls] error:", err);
      setErrorMsg(err.message);
      setLoading(false);
      return null;
    }
  }

  async function handleVocalAnalyze() {
    const result = await callEndpoint("/api/aistudio/analyze/vocals", {
      transcript: lastTranscript,
      performanceNotes: `Session ID: ${sessionId || "N/A"}`,
      genre,
      coachMode,
    });
    if (result) setVocalResult(result);
  }

  async function handleAutoMix() {
    const stemsDescription = window.prompt(
      "Describe your stems (vocals, drums, bass, keys, adlibs, etc.):",
      "Lead vocal, doubles, adlibs, stereo pad, 808, clap, hi-hat, kick"
    );
    if (!stemsDescription) return;

    const result = await callEndpoint("/api/aistudio/mix/auto", {
      stemsDescription,
      genre,
      coachMode,
    });
    if (result) setMixResult(result);
  }

  async function handleBeatPlan() {
    const mood = window.prompt("Mood for the beat:", "Pain but motivational");
    const tempoStr = window.prompt("Tempo (BPM):", "84");
    const tempoBpm = tempoStr ? Number(tempoStr) : undefined;
    const referenceArtists = window.prompt(
      "Reference vibe (optional):",
      "Boosie, Webbie, Southern Soul"
    );

    const result = await callEndpoint("/api/aistudio/beat/plan", {
      mood,
      tempoBpm,
      genre,
      coachMode,
      referenceArtists,
    });
    if (result) setBeatPlan(result);
  }

  async function handleTuner() {
    const summary =
      lastScores && lastScores.overallScore
        ? `OverallScore: ${lastScores.overallScore}, details: ${JSON.stringify(lastScores)}`
        : `Transcript: ${lastTranscript || "N/A"}`;

    const result = await callEndpoint("/api/aistudio/vocal/tuner", {
      vocalAnalysisSummary: summary,
      genre,
      coachMode,
    });
    if (result) setTunerResult(result);
  }

  async function handleChallengeStart() {
    const targetStr = window.prompt("Target score (0-100):", "85");
    const targetScore = targetStr ? Number(targetStr) : 85;

    const result = await callEndpoint("/api/aistudio/challenge/start", {
      artistName: "", // backend will fall back to req.user name
      genre,
      targetScore,
    });
    if (result) {
      setChallenge(result);
      setChallengeEval(null);
    }
  }

  async function handleChallengeEvaluate() {
    if (!challenge) {
      window.alert("Start a challenge first.");
      return;
    }

    const result = await callEndpoint("/api/aistudio/challenge/evaluate", {
      challenge,
      latestScores: lastScores || {},
      genre,
    });
    if (result) setChallengeEval(result);
  }

  return (
    <div className="studio-pro-panel">
      <div className="studio-pro-header">
        <h3>Studio Pro Controls</h3>
        <p className="studio-pro-subtitle">
          Advanced AI tools — No Limit East Houston artists get full access.
        </p>
      </div>

      <div className="studio-pro-row">
        <div className="studio-pro-field">
          <label>Genre focus</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-pro-field">
          <label>Coach mode</label>
          <select value={coachMode} onChange={(e) => setCoachMode(e.target.value)}>
            {COACH_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && <div className="studio-pro-error">⚠ {errorMsg}</div>}
      {loading && <div className="studio-pro-loading">Thinking…</div>}

      <div className="studio-pro-actions">
        <button onClick={handleVocalAnalyze}>🎤 Vocal Analyzer</button>
        <button onClick={handleAutoMix} className="studio-pro-btn--premium">
          🎛️ Auto Mix (No Limit)
        </button>
        <button onClick={handleBeatPlan} className="studio-pro-btn--premium">
          🥁 Beat Plan (No Limit)
        </button>
        <button onClick={handleTuner} className="studio-pro-btn--premium">
          🎵 Vocal Tuner (No Limit)
        </button>
        <button onClick={handleChallengeStart} className="studio-pro-btn--premium">
          🏆 Start Challenge
        </button>
        <button onClick={handleChallengeEvaluate}>📊 Evaluate Challenge</button>
      </div>

      <div className="studio-pro-results">
        {vocalResult && (
          <div className="studio-pro-card">
            <h4>🎤 Vocal Analysis</h4>
            <div className="studio-pro-score-badge">
              Score: <strong>{vocalResult.overallScore}</strong>
            </div>
            <p>
              <strong>Pitch Accuracy:</strong>{" "}
              {vocalResult.pitchAccuracy != null
                ? `${(vocalResult.pitchAccuracy * 100).toFixed(1)}%`
                : "N/A"}
            </p>
            <p>
              <strong>Timing:</strong> {vocalResult.timingFeel}
            </p>
            <p>
              <strong>Genre Notes:</strong> {vocalResult.genreSpecificNotes}
            </p>
            {Array.isArray(vocalResult.noteIssues) && vocalResult.noteIssues.length > 0 && (
              <div className="studio-pro-issues">
                <strong>Issues:</strong>
                <ul>
                  {vocalResult.noteIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(vocalResult.actionSteps) && vocalResult.actionSteps.length > 0 && (
              <div className="studio-pro-steps">
                <strong>Action Steps:</strong>
                <ul>
                  {vocalResult.actionSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
            {vocalResult.oneLineSummary && (
              <p className="studio-pro-summary">
                <em>"{vocalResult.oneLineSummary}"</em>
              </p>
            )}
          </div>
        )}

        {mixResult && (
          <div className="studio-pro-card">
            <h4>🎛️ Auto Mix Strategy</h4>
            <p className="studio-pro-strategy">{mixResult.mixStrategy}</p>
            {Array.isArray(mixResult.busRecommendations) && mixResult.busRecommendations.length > 0 && (
              <div className="studio-pro-section">
                <strong>Bus Recommendations:</strong>
                <ul>
                  {mixResult.busRecommendations.map((bus, idx) => (
                    <li key={idx}>
                      <strong>{bus.name}:</strong> {bus.processingChain?.join(" → ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(mixResult.perStem) && mixResult.perStem.length > 0 && (
              <details className="studio-pro-details">
                <summary>Per Stem Details ({mixResult.perStem.length} stems)</summary>
                <ul>
                  {mixResult.perStem.map((stem, idx) => (
                    <li key={idx}>
                      <strong>{stem.stemName}</strong>
                      <br />
                      Level: {stem.levelAdvice} | Pan: {stem.panningAdvice}
                      {stem.eqAdvice && <div>EQ: {stem.eqAdvice.join(", ")}</div>}
                      {stem.fxAdvice && <div>FX: {stem.fxAdvice.join(", ")}</div>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {beatPlan && (
          <div className="studio-pro-card">
            <h4>🥁 Beat Plan</h4>
            <div className="studio-pro-beat-info">
              <span>
                <strong>BPM:</strong> {beatPlan.bpm}
              </span>
              <span>
                <strong>Key:</strong> {beatPlan.keySuggestion}
              </span>
              <span>
                <strong>Swing:</strong> {beatPlan.swingFeel}
              </span>
            </div>
            {beatPlan.drumPattern && (
              <div className="studio-pro-section">
                <strong>Drum Pattern:</strong>
                <ul>
                  <li>Kick: {beatPlan.drumPattern.kick}</li>
                  <li>Snare: {beatPlan.drumPattern.snare}</li>
                  <li>Hi-hat: {beatPlan.drumPattern.hihat}</li>
                  <li>Percussion: {beatPlan.drumPattern.percussion}</li>
                </ul>
              </div>
            )}
            {beatPlan.bassPattern && (
              <p>
                <strong>Bass:</strong> {beatPlan.bassPattern}
              </p>
            )}
            {Array.isArray(beatPlan.chordIdeas) && beatPlan.chordIdeas.length > 0 && (
              <p>
                <strong>Chords:</strong> {beatPlan.chordIdeas.join(" | ")}
              </p>
            )}
            {Array.isArray(beatPlan.sections) && beatPlan.sections.length > 0 && (
              <details className="studio-pro-details">
                <summary>Sections ({beatPlan.sections.length})</summary>
                <ul>
                  {beatPlan.sections.map((sec, idx) => (
                    <li key={idx}>
                      <strong>{sec.name}</strong> – {sec.bars} bars ({sec.energy})
                      {sec.notes && <div className="studio-pro-notes">{sec.notes.join(", ")}</div>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {tunerResult && (
          <div className="studio-pro-card">
            <h4>🎵 Vocal Tuner Settings</h4>
            <div className="studio-pro-tuner-grid">
              <div>
                <strong>Key:</strong> {tunerResult.suggestedKey}
              </div>
              <div>
                <strong>Scale:</strong> {tunerResult.suggestedScale}
              </div>
              <div>
                <strong>Autotune:</strong> {tunerResult.autotuneAmount}
              </div>
              <div>
                <strong>Retune Speed:</strong> {tunerResult.retuneSpeed}
              </div>
              <div>
                <strong>Humanize:</strong> {tunerResult.humanizeAmount}
              </div>
            </div>
            {Array.isArray(tunerResult.focusPhrases) && tunerResult.focusPhrases.length > 0 && (
              <p>
                <strong>Focus on:</strong> {tunerResult.focusPhrases.join(", ")}
              </p>
            )}
            {Array.isArray(tunerResult.processingNotes) && tunerResult.processingNotes.length > 0 && (
              <div className="studio-pro-section">
                <strong>Processing Notes:</strong>
                <ul>
                  {tunerResult.processingNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {challenge && (
          <div className="studio-pro-card studio-pro-card--challenge">
            <h4>🏆 Active Challenge</h4>
            <div className="studio-pro-challenge-title">{challenge.title}</div>
            <p>{challenge.description}</p>
            <div className="studio-pro-target">
              Target Score: <strong>{challenge.targetScore}</strong>
            </div>
            {Array.isArray(challenge.rules) && challenge.rules.length > 0 && (
              <div className="studio-pro-rules">
                <strong>Rules:</strong>
                <ul>
                  {challenge.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
            {challenge.motivation && (
              <p className="studio-pro-motivation">"{challenge.motivation}"</p>
            )}
          </div>
        )}

        {challengeEval && (
          <div
            className={`studio-pro-card studio-pro-card--eval ${
              challengeEval.passed ? "studio-pro-card--passed" : "studio-pro-card--failed"
            }`}
          >
            <h4>{challengeEval.passed ? "✅ Challenge Passed!" : "❌ Challenge Not Passed"}</h4>
            <p className="studio-pro-eval-message">{challengeEval.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}





