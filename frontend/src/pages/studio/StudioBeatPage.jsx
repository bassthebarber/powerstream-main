// frontend/src/pages/studio/StudioBeatPage.jsx
// Beat Lab - AI Beat Generation Interface
import React, { useState, useEffect, useRef, useCallback } from "react";
import { generateBeat, renderLoop, saveBeat, evolveLoop, saveSession } from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

const GENRES = ["Trap", "Drill", "Reggae", "Dancehall", "Afrobeat", "House", "R&B", "Neo-Soul", "Gospel", "Country", "Lo-Fi", "Boom Bap"];

export default function StudioBeatPage() {
  const [prompt, setPrompt] = useState("futuristic afrobeats with electric guitar and");
  const [temperature, setTemperature] = useState(0.7);
  const [bpm, setBpm] = useState(96);
  const [bars, setBars] = useState(4);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [title, setTitle] = useState("");
  const [producer, setProducer] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [success, setSuccess] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [autosaveStatus, setAutosaveStatus] = useState("");
  const autosaveTimeoutRef = useRef(null);

  // Autosave function
  const performAutosave = useCallback(async (immediate = false) => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    const saveFn = async () => {
      try {
        const result = await saveSession({
          sessionId,
          projectName: title || `Beat Lab - ${new Date().toLocaleDateString()}`,
          type: "beat",
          data: { bpm, bars, prompt, temperature, selectedGenres, title, producer, currentBeat, audioUrl },
        });
        if (result?.ok && result.session) {
          if (!sessionId) setSessionId(result.session.id);
          setAutosaveStatus("Saved");
          setTimeout(() => setAutosaveStatus(""), 2000);
        }
      } catch (err) {
        console.error("Autosave failed:", err);
        setAutosaveStatus("Save failed");
        setTimeout(() => setAutosaveStatus(""), 2000);
      }
    };

    if (immediate) await saveFn();
    else autosaveTimeoutRef.current = setTimeout(saveFn, 2000);
  }, [bpm, bars, prompt, temperature, selectedGenres, title, producer, currentBeat, audioUrl, sessionId]);

  // Autosave interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (bpm || prompt || selectedGenres.length > 0 || currentBeat) {
        performAutosave(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [bpm, prompt, selectedGenres, currentBeat, performAutosave]);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleGenerate = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await generateBeat({
        prompt,
        temperature,
        bpm,
        style: selectedGenres[0]?.toLowerCase() || "trap",
      });
      if (result?.ok) {
        setCurrentBeat(result);
        setAudioUrl(result.audioUrl);
        setSuccess("Beat generated successfully!");
        setTimeout(() => performAutosave(true), 1000);
      } else {
        setError(result?.message || "Beat generation failed.");
      }
    } catch (err) {
      setError("Beat generation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEvolve = async () => {
    if (!currentBeat?.beatId) {
      setError("No beat to evolve. Generate one first.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await evolveLoop({ beatId: currentBeat.beatId, mutation: "default" });
      if (result?.ok) {
        setCurrentBeat(result);
        setAudioUrl(result.audioUrl);
        setSuccess("Loop evolved successfully!");
        setTimeout(() => performAutosave(true), 1000);
      } else {
        setError(result?.message || "Evolve failed.");
      }
    } catch (err) {
      setError("Evolve failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRender = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await renderLoop({ bpm, bars, genres: selectedGenres });
      if (result?.ok) {
        setCurrentBeat(result);
        setAudioUrl(result.audioUrl);
        setSuccess("Loop rendered successfully!");
        setTimeout(() => performAutosave(true), 1000);
      } else {
        setError(result?.message || "Render failed.");
      }
    } catch (err) {
      setError("Render failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentBeat?.beatId) {
      setError("No beat to save. Generate or render one first.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await saveBeat({
        beatId: currentBeat.beatId,
        title: title || "Untitled Beat",
        producer: producer || "Unknown",
      });
      if (result?.ok) {
        setSuccess("Beat saved to library!");
      } else {
        setError(result?.message || "Save failed.");
      }
    } catch (err) {
      setError("Save failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="studio-header-title">🎹 Beat Store</h1>
            <p className="studio-header-subtitle">AI-powered beat generation and browsing</p>
          </div>
          {autosaveStatus && (
            <div className={`studio-status ${autosaveStatus === "Saved" ? "studio-status--online" : "studio-status--offline"}`}>
              {autosaveStatus === "Saved" ? "✓ Saved" : "✗ Save failed"}
            </div>
          )}
        </div>
      </div>

      {/* Alert */}
      {(error || success) && (
        <div className={`studio-alert ${error ? "studio-alert--error" : "studio-alert--success"}`}>
          <span>{error ? "⚠️ " + error : "✅ " + success}</span>
          <button className="studio-alert-dismiss" onClick={() => { setError(""); setSuccess(""); }}>×</button>
        </div>
      )}

      {/* AI Beat God Mode */}
      <div className="studio-card studio-card--highlight" style={{ marginBottom: 24 }}>
        <div className="studio-card-header">
          <h2 className="studio-card-title">⚡ AI Beat God Mode</h2>
          <span className="studio-card-badge">AI Engine</span>
        </div>
        <p className="studio-card-desc">
          Type a vibe. We generate drums & melody with AI → play through the live bus. Use Evolve to mutate every loop.
        </p>

        {/* Prompt Input */}
        <div style={{ marginBottom: 20 }}>
          <label className="studio-label">Prompt</label>
          <input
            type="text"
            className="studio-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="futuristic afrobeats with electric guitar and..."
          />
        </div>

        {/* Temperature Slider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <label className="studio-label" style={{ margin: 0 }}>Creativity (Temperature)</label>
            <span style={{ color: "#ffb84d", fontWeight: 700 }}>{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            className="studio-slider"
            min="0"
            max="1"
            step="0.01"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666" }}>
            <span>Conservative</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="studio-btn studio-btn--primary" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Beat"}
          </button>
          <button className="studio-btn studio-btn--secondary" onClick={handleEvolve} disabled={loading || !currentBeat}>
            🔄 Evolve Loop
          </button>
          <button className="studio-btn studio-btn--outline" disabled={loading}>
            ⏹ Stop
          </button>
        </div>
      </div>

      {/* Render Loop Section */}
      <div className="studio-grid studio-grid--2" style={{ marginBottom: 24 }}>
        {/* Settings */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">🎛️ Loop Settings</h3>
          </div>

          <div className="studio-grid studio-grid--2" style={{ marginBottom: 20 }}>
            <div>
              <label className="studio-label">BPM</label>
              <input
                type="number"
                className="studio-input"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                min="60"
                max="200"
              />
            </div>
            <div>
              <label className="studio-label">Bars</label>
              <input
                type="number"
                className="studio-input"
                value={bars}
                onChange={(e) => setBars(parseInt(e.target.value))}
                min="1"
                max="16"
              />
            </div>
          </div>

          <div>
            <label className="studio-label">Style Tags</label>
            <div className="studio-chips">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  className={`studio-chip ${selectedGenres.includes(genre) ? "studio-chip--active" : ""}`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata & Save */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">📝 Metadata</h3>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="studio-label">Title</label>
            <input
              type="text"
              className="studio-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Beat title"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="studio-label">Producer</label>
            <input
              type="text"
              className="studio-input"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="Producer name"
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="studio-btn studio-btn--primary" onClick={handleRender} disabled={loading}>
              {loading ? "Rendering..." : "Render Loop"}
            </button>
            <button className="studio-btn studio-btn--secondary" onClick={handleSave} disabled={!currentBeat}>
              💾 Save
            </button>
          </div>
        </div>
      </div>

      {/* Player / Preview */}
      <div className="studio-card">
        <div className="studio-card-header">
          <h3 className="studio-card-title">🔊 Preview</h3>
          <span style={{ color: "#888", fontSize: 13 }}>
            {currentBeat ? `Beat ID: ${currentBeat.beatId || "Generated"}` : "No beat loaded"}
          </span>
        </div>

        {audioUrl ? (
          <div>
            <audio controls src={audioUrl} style={{ width: "100%", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="studio-btn studio-btn--secondary" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <button className="studio-btn studio-btn--outline">
                🔁 Loop
              </button>
              <button className="studio-btn studio-btn--outline">
                ⬇️ Download
              </button>
              <button className="studio-btn studio-btn--outline">
                📤 Send to Mix
              </button>
            </div>
          </div>
        ) : (
          <div className="studio-empty" style={{ padding: 32 }}>
            <div className="studio-empty-icon">🎵</div>
            <p className="studio-empty-title">No beat loaded</p>
            <p className="studio-empty-desc">Generate or render a beat to preview it here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        padding: "24px 0", 
        color: "#666", 
        fontSize: 12,
        marginTop: 24
      }}>
        Powered by PowerStream AI • Beat Lab tracks plays for royalty splits
      </div>
    </div>
  );
}
