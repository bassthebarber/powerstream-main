// frontend/src/pages/studio/StudioAIBeatPage.jsx
// AI Beat Generator - Generate custom beats with AI

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import studioApi from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

const GENRES = [
  { id: "trap", name: "Trap", icon: "🔥", color: "#ff4444" },
  { id: "hiphop", name: "Hip-Hop", icon: "🎤", color: "#ffb84d" },
  { id: "rnb", name: "R&B", icon: "💜", color: "#9775fa" },
  { id: "drill", name: "Drill", icon: "⚡", color: "#4dabf7" },
  { id: "boom-bap", name: "Boom Bap", icon: "🥁", color: "#ff922b" },
  { id: "lofi", name: "Lo-Fi", icon: "🌙", color: "#69db7c" },
  { id: "afrobeat", name: "Afrobeat", icon: "🌍", color: "#fcc419" },
  { id: "reggaeton", name: "Reggaeton", icon: "🌴", color: "#20c997" },
];

const MOODS = [
  { id: "dark", name: "Dark", icon: "🌑" },
  { id: "hype", name: "Hype", icon: "🔥" },
  { id: "chill", name: "Chill", icon: "😌" },
  { id: "emotional", name: "Emotional", icon: "💔" },
  { id: "aggressive", name: "Aggressive", icon: "😤" },
  { id: "uplifting", name: "Uplifting", icon: "✨" },
];

const PRESETS = [
  { id: "houston", name: "Houston Bounce", genre: "hiphop", bpm: 135, mood: "hype" },
  { id: "atl-trap", name: "ATL Trap", genre: "trap", bpm: 145, mood: "dark" },
  { id: "ny-drill", name: "NY Drill", genre: "drill", bpm: 140, mood: "aggressive" },
  { id: "smooth-rnb", name: "Smooth R&B", genre: "rnb", bpm: 90, mood: "chill" },
  { id: "classic-boom", name: "Classic Boom Bap", genre: "boom-bap", bpm: 95, mood: "chill" },
];

export default function StudioAIBeatPage() {
  const navigate = useNavigate();
  
  const [selectedGenre, setSelectedGenre] = useState("trap");
  const [selectedMood, setSelectedMood] = useState("dark");
  const [bpm, setBpm] = useState(140);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedBeat, setGeneratedBeat] = useState(null);
  const [error, setError] = useState(null);
  const [recentBeats, setRecentBeats] = useState([]);

  const handlePresetSelect = (preset) => {
    setSelectedGenre(preset.genre);
    setSelectedMood(preset.mood);
    setBpm(preset.bpm);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setGeneratedBeat(null);

    try {
      const res = await studioApi.generateBeat({
        genre: selectedGenre,
        mood: selectedMood,
        tempo: bpm,
        prompt: prompt || undefined,
      });

      if (res?.ok) {
        setGeneratedBeat(res.beat);
        setRecentBeats((prev) => [res.beat, ...prev.slice(0, 4)]);
      } else {
        throw new Error(res?.message || "Failed to generate beat");
      }
    } catch (err) {
      setError(err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleUseBeat = () => {
    if (generatedBeat) {
      // Store in session storage and navigate to record page
      sessionStorage.setItem("selectedBeat", JSON.stringify(generatedBeat));
      navigate("/studio/record");
    }
  };

  const handleSaveBeat = async () => {
    if (!generatedBeat) return;
    
    try {
      await studioApi.saveBeat(generatedBeat);
      setGeneratedBeat((prev) => ({ ...prev, saved: true }));
    } catch (err) {
      setError("Failed to save beat");
    }
  };

  const selectedGenreData = GENRES.find((g) => g.id === selectedGenre);

  return (
    <div className="studio-page">
      <header className="studio-page-header">
        <button className="studio-back-btn" onClick={() => navigate("/studio")}>
          ← Back
        </button>
        <h1 className="studio-page-title">🤖 AI Beat Generator</h1>
        <p className="studio-page-subtitle">Generate custom beats with artificial intelligence</p>
      </header>

      {error && (
        <div className="studio-alert studio-alert--error">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Quick Presets */}
      <section className="presets-section">
        <h3 className="section-title">🎯 Quick Presets</h3>
        <div className="presets-row">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              className="preset-chip"
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </section>

      <div className="studio-grid studio-grid--2">
        {/* Left - Configuration */}
        <div className="studio-card">
          <h3 className="studio-card-title">🎛️ Configuration</h3>

          {/* Genre Selection */}
          <div className="config-section">
            <label className="config-label">Genre</label>
            <div className="genre-grid">
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  className={`genre-btn ${selectedGenre === genre.id ? "genre-btn--active" : ""}`}
                  style={{ "--genre-color": genre.color }}
                  onClick={() => setSelectedGenre(genre.id)}
                >
                  <span className="genre-icon">{genre.icon}</span>
                  <span className="genre-name">{genre.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div className="config-section">
            <label className="config-label">Mood</label>
            <div className="mood-grid">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  className={`mood-btn ${selectedMood === mood.id ? "mood-btn--active" : ""}`}
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <span>{mood.icon}</span>
                  <span>{mood.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BPM */}
          <div className="config-section">
            <label className="config-label">BPM: {bpm}</label>
            <div className="bpm-control">
              <button className="bpm-btn" onClick={() => setBpm(Math.max(60, bpm - 5))}>-</button>
              <input
                type="range"
                min="60"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="bpm-slider"
              />
              <button className="bpm-btn" onClick={() => setBpm(Math.min(200, bpm + 5))}>+</button>
            </div>
            <div className="bpm-presets">
              {[80, 100, 120, 140, 160].map((val) => (
                <button
                  key={val}
                  className={`bpm-preset ${bpm === val ? "bpm-preset--active" : ""}`}
                  onClick={() => setBpm(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="config-section">
            <label className="config-label">Custom Prompt (optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your beat... e.g., 'Heavy 808s with dark synths and fast hi-hats'"
              className="prompt-input"
            />
          </div>

          {/* Generate Button */}
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner" />
                Generating...
              </>
            ) : (
              <>
                🎵 Generate Beat
              </>
            )}
          </button>
        </div>

        {/* Right - Output */}
        <div className="studio-card output-card">
          <h3 className="studio-card-title">🎵 Generated Beat</h3>

          {!generatedBeat && !generating && (
            <div className="empty-output">
              <div className="empty-icon">🎹</div>
              <p>Configure your beat and click Generate</p>
              <p className="empty-hint">
                Selected: {selectedGenreData?.name} • {selectedMood} • {bpm} BPM
              </p>
            </div>
          )}

          {generating && (
            <div className="generating-state">
              <div className="ai-animation">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="ai-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <p>AI is crafting your beat...</p>
              <p className="generating-hint">This may take a few seconds</p>
            </div>
          )}

          {generatedBeat && (
            <div className="beat-result">
              <div className="beat-header">
                <div className="beat-info">
                  <span className="beat-title">{generatedBeat.title}</span>
                  <span className="beat-meta">
                    {selectedGenreData?.name} • {selectedMood} • {bpm} BPM
                  </span>
                </div>
                {generatedBeat.saved && (
                  <span className="saved-badge">✓ Saved</span>
                )}
              </div>

              <div className="beat-player">
                <audio src={generatedBeat.url} controls style={{ width: "100%" }} />
              </div>

              <div className="beat-stems">
                <h4>Stems</h4>
                <div className="stems-grid">
                  {generatedBeat.stems?.drums && (
                    <div className="stem">
                      <span>🥁 Drums</span>
                      <audio src={generatedBeat.stems.drums} controls />
                    </div>
                  )}
                  {generatedBeat.stems?.melody && (
                    <div className="stem">
                      <span>🎹 Melody</span>
                      <audio src={generatedBeat.stems.melody} controls />
                    </div>
                  )}
                  {generatedBeat.stems?.bass && (
                    <div className="stem">
                      <span>🎸 Bass</span>
                      <audio src={generatedBeat.stems.bass} controls />
                    </div>
                  )}
                </div>
              </div>

              <div className="beat-actions">
                <button className="studio-btn studio-btn--primary" onClick={handleUseBeat}>
                  🎙️ Use for Recording
                </button>
                <button
                  className="studio-btn studio-btn--secondary"
                  onClick={handleSaveBeat}
                  disabled={generatedBeat.saved}
                >
                  {generatedBeat.saved ? "✓ Saved" : "💾 Save to Library"}
                </button>
                <button className="studio-btn studio-btn--outline" onClick={handleGenerate}>
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Generations */}
      {recentBeats.length > 0 && (
        <section className="recent-section">
          <h3 className="section-title">🕒 Recent Generations</h3>
          <div className="recent-grid">
            {recentBeats.map((beat, i) => (
              <div key={i} className="recent-beat">
                <span className="recent-beat-title">{beat.title}</span>
                <audio src={beat.url} controls />
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .studio-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .studio-page-header {
          margin-bottom: 24px;
        }

        .studio-back-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .studio-page-title {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(90deg, #fff, #00c864);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .studio-page-subtitle {
          color: #888;
          margin: 4px 0 0;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .presets-section {
          margin-bottom: 24px;
        }

        .presets-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .preset-chip {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-chip:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #00c864;
        }

        .studio-grid--2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .studio-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .studio-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 20px;
        }

        .config-section {
          margin-bottom: 24px;
        }

        .config-label {
          display: block;
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 8px;
        }

        .genre-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .genre-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .genre-btn:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .genre-btn--active {
          border-color: var(--genre-color);
          background: rgba(255, 255, 255, 0.05);
        }

        .genre-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .genre-name {
          font-size: 0.75rem;
          color: #fff;
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .mood-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mood-btn:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .mood-btn--active {
          border-color: #00c864;
          background: rgba(0, 200, 100, 0.1);
        }

        .bpm-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bpm-btn {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
        }

        .bpm-slider {
          flex: 1;
          accent-color: #00c864;
        }

        .bpm-presets {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .bpm-preset {
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          color: #888;
          cursor: pointer;
        }

        .bpm-preset:hover, .bpm-preset--active {
          background: rgba(0, 200, 100, 0.1);
          border-color: #00c864;
          color: #00c864;
        }

        .prompt-input {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          resize: vertical;
        }

        .generate-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00c864, #00a854);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 200, 100, 0.3);
        }

        .generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .output-card {
          min-height: 400px;
        }

        .empty-output {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #666;
          text-align: center;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-hint {
          font-size: 0.85rem;
          color: #00c864;
        }

        .generating-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }

        .ai-animation {
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
        }

        .ai-bar {
          width: 8px;
          height: 40px;
          background: #00c864;
          border-radius: 4px;
          animation: aiPulse 0.6s ease-in-out infinite alternate;
        }

        @keyframes aiPulse {
          from { transform: scaleY(0.3); opacity: 0.5; }
          to { transform: scaleY(1); opacity: 1; }
        }

        .generating-hint {
          font-size: 0.85rem;
          color: #666;
        }

        .beat-result {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .beat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .beat-title {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .beat-meta {
          font-size: 0.85rem;
          color: #888;
        }

        .saved-badge {
          background: rgba(0, 200, 100, 0.2);
          color: #00c864;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .beat-player {
          margin-bottom: 16px;
        }

        .beat-stems h4 {
          font-size: 0.9rem;
          margin: 0 0 8px;
          color: #888;
        }

        .stems-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .stem {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .stem span {
          min-width: 80px;
          font-size: 0.85rem;
        }

        .stem audio {
          flex: 1;
          height: 32px;
        }

        .beat-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .recent-section {
          margin-top: 32px;
        }

        .recent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .recent-beat {
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .recent-beat-title {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .recent-beat audio {
          width: 100%;
          height: 32px;
        }

        .studio-alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .studio-alert--error {
          background: rgba(255, 68, 68, 0.15);
          color: #ff6666;
        }

        .studio-alert button {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .studio-grid--2 {
            grid-template-columns: 1fr;
          }

          .genre-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

