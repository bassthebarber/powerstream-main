// frontend/src/studio/ui/AICoachPanel.jsx
// AI Coach / Producer Mode Panel for real-time feedback

import React, { useState, useEffect } from "react";
import { useStudioAudio } from "../StudioAudioContext.jsx";
import "./AICoachPanel.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function AICoachPanel({ 
  selectedTake,
  onFeedbackReceived,
}) {
  // Get shared audio context
  const { currentTrack, isPlaying, playAudio, stopAudio } = useStudioAudio();
  
  // Use prop or shared context for the active track
  const activeTrack = selectedTake || currentTrack;
  
  const [mode, setMode] = useState("coach"); // "coach" or "producer"
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [tips, setTips] = useState([]);
  const [sessionNotes, setSessionNotes] = useState("");
  
  // Tips for different modes
  const coachTips = [
    "🎤 Warm up your voice before recording",
    "🎧 Use headphones to avoid bleed",
    "📏 Stay 4-6 inches from the mic",
    "💪 Project from your diaphragm",
    "🔊 Check your levels before starting",
  ];
  
  const producerTips = [
    "🎚️ Keep peaks below -6dB",
    "🎼 Record to a click track for tight timing",
    "📝 Take notes on each take",
    "🔄 Don't be afraid to punch in fixes",
    "🎯 Focus on emotion over perfection",
  ];

  // Show tips based on mode
  useEffect(() => {
    setTips(mode === "coach" ? coachTips : producerTips);
  }, [mode]);

  // Watch for track changes (from prop or shared context)
  useEffect(() => {
    if (activeTrack) {
      setFeedback(null); // Clear old feedback
    }
  }, [activeTrack]);

  // Analyze the active track
  const handleAnalyze = async () => {
    if (!activeTrack?.audioUrl) return;
    
    setIsAnalyzing(true);
    setFeedback(null);
    
    try {
      // Simulate AI analysis (replace with real AI endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI feedback
      const mockFeedback = {
        overall: 85,
        metrics: {
          pitch: { score: 88, note: "Solid pitch control, minor drift in verse 2" },
          timing: { score: 82, note: "Good timing, tighten up the bridge section" },
          dynamics: { score: 90, note: "Great dynamic range and expression" },
          energy: { score: 80, note: "Strong energy, could push harder on chorus" },
        },
        suggestions: [
          "Try adding a bit more breath support on the high notes",
          "The second verse could use more intensity",
          "Consider double-tracking the chorus for thickness",
        ],
        highlights: [
          "Excellent hook delivery",
          "Great tone in the lower register",
        ],
      };
      
      setFeedback(mockFeedback);
      
      if (onFeedbackReceived) {
        onFeedbackReceived(mockFeedback);
      }
    } catch (err) {
      console.error("[AICoach] Analysis error:", err);
      setFeedback({ error: "Failed to analyze recording" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Play the active track using shared context
  const handlePlayTake = () => {
    if (!activeTrack?.audioUrl) return;
    
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(activeTrack.audioUrl, {
        id: activeTrack.id || activeTrack._id,
        title: activeTrack.title,
        type: activeTrack.type || "recording",
      });
    }
  };

  return (
    <div className="ai-coach-panel">
      <div className="coach-header">
        <span className="coach-icon">🤖</span>
        <h3>AI {mode === "coach" ? "Coach" : "Producer"}</h3>
        <div className="mode-toggle">
          <button
            className={mode === "coach" ? "active" : ""}
            onClick={() => setMode("coach")}
          >
            Coach
          </button>
          <button
            className={mode === "producer" ? "active" : ""}
            onClick={() => setMode("producer")}
          >
            Producer
          </button>
        </div>
      </div>

      {/* Active Track Info */}
      {activeTrack ? (
        <div className="selected-take">
          <div className="take-badge">
            {activeTrack.type === "recording" ? "🎤" : activeTrack.type === "beat" ? "🥁" : "💿"} 
            {activeTrack.type || "track"}
          </div>
          <span className="take-title">{activeTrack.title || activeTrack.id}</span>
          {activeTrack.takeNumber && (
            <span className="take-number">Take #{activeTrack.takeNumber}</span>
          )}
          <div className="take-actions">
            <button onClick={handlePlayTake} className="play-btn">
              {isPlaying ? "⏹ Stop" : "▶ Play"}
            </button>
            <button 
              onClick={handleAnalyze} 
              className="analyze-btn"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "🔄 Analyzing..." : "🎯 Analyze"}
            </button>
          </div>
        </div>
      ) : (
        <div className="no-take">
          <p>Select a recording to get AI feedback</p>
          <span className="hint">Record a new take or pick one from Library</span>
        </div>
      )}

      {/* Feedback Results */}
      {feedback && !feedback.error && (
        <div className="feedback-results">
          <div className="overall-score">
            <div className="score-circle" data-score={feedback.overall}>
              <span className="score-value">{feedback.overall}</span>
              <span className="score-label">Overall</span>
            </div>
          </div>
          
          <div className="metrics-grid">
            {Object.entries(feedback.metrics).map(([key, val]) => (
              <div key={key} className="metric-item">
                <div className="metric-header">
                  <span className="metric-name">{key}</span>
                  <span className="metric-score">{val.score}</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{ width: `${val.score}%` }}
                  />
                </div>
                <p className="metric-note">{val.note}</p>
              </div>
            ))}
          </div>

          {feedback.suggestions?.length > 0 && (
            <div className="suggestions">
              <h4>💡 Suggestions</h4>
              <ul>
                {feedback.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.highlights?.length > 0 && (
            <div className="highlights">
              <h4>⭐ Highlights</h4>
              <ul>
                {feedback.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {feedback?.error && (
        <div className="feedback-error">
          ⚠️ {feedback.error}
        </div>
      )}

      {/* Quick Tips */}
      <div className="tips-section">
        <h4>💬 Quick Tips</h4>
        <div className="tips-scroll">
          {tips.map((tip, i) => (
            <div key={i} className="tip-card">
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Session Notes */}
      <div className="session-notes">
        <h4>📝 Session Notes</h4>
        <textarea
          placeholder="Add notes about this session..."
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
        />
      </div>
    </div>
  );
}

