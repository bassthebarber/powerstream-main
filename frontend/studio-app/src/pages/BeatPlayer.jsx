// frontend/studio-app/src/pages/BeatPlayer.jsx
// Beat Player - Pads & Sequencer with BPM Control
// UPGRADED: Load beats from session/library, save patterns, full navigation

import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/studio.css";
import { useStudioSession } from "../context/StudioSessionContext.jsx";
import { saveBeat, getLibraryBeats } from "../lib/studioApi.js";

// Pad configuration with colors
const PADS = [
  { name: "Kick", key: "kick", color: "#e6b800", icon: "🔈", freq: 55 },
  { name: "Snare", key: "snare", color: "#ff5500", icon: "🥁", freq: 200 },
  { name: "Hat", key: "hat", color: "#00bbff", icon: "🎩", freq: 800 },
  { name: "808", key: "808", color: "#8855ff", icon: "🎵", freq: 40 },
  { name: "Clap", key: "clap", color: "#ff3399", icon: "👏", freq: 300 },
  { name: "Perc", key: "perc", color: "#00cc88", icon: "🪘", freq: 400 },
];

const STEPS = 16;

// Create empty grid
const createEmptyGrid = () => {
  const grid = {};
  PADS.forEach(pad => {
    grid[pad.key] = new Array(STEPS).fill(false);
  });
  return grid;
};

export default function BeatPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentBeat,
    pattern: sessionPattern,
    loadBeat,
    updateBeat,
    updatePattern,
    addToRecent,
  } = useStudioSession();

  // State
  const [bpm, setBpm] = useState(currentBeat.bpm || 90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [volume, setVolume] = useState(0.7);
  const [beatName, setBeatName] = useState(currentBeat.name || "");
  const [audioUrl, setAudioUrl] = useState(currentBeat.audioUrl || null);

  // Grid state
  const [grid, setGrid] = useState(() => sessionPattern || createEmptyGrid());

  // Status
  const [status, setStatus] = useState("idle");
  const [recentBeats, setRecentBeats] = useState([]);

  // Audio
  const audioContextRef = useRef(null);
  const mainAudioRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);

  // Load beat from navigation state or session
  useEffect(() => {
    if (location.state?.beat) {
      const beat = location.state.beat;
      setBpm(beat.bpm || 90);
      setBeatName(beat.name || "");
      setAudioUrl(beat.audioUrl || null);
      
      if (beat.pattern) {
        // Convert pattern format if needed
        const newGrid = { ...createEmptyGrid() };
        Object.keys(beat.pattern).forEach(key => {
          if (newGrid[key]) {
            newGrid[key] = beat.pattern[key];
          }
        });
        setGrid(newGrid);
      }
      
      loadBeat(beat);
    }
  }, [location.state, loadBeat]);

  // Load recent beats from library
  useEffect(() => {
    async function loadRecent() {
      try {
        const beats = await getLibraryBeats({ limit: 5 });
        setRecentBeats(beats);
      } catch (err) {
        console.error("Failed to load recent beats:", err);
      }
    }
    loadRecent();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Get or create audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Play a single pad sound
  const playPad = useCallback((padKey) => {
    const ctx = getAudioContext();
    const pad = PADS.find(p => p.key === padKey);
    if (!pad) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = pad.freq;
    osc.type = padKey === "kick" || padKey === "808" ? "sine" : "triangle";
    
    gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }, [getAudioContext, volume]);

  // Toggle a cell in the grid
  const toggleCell = (padKey, step) => {
    setGrid(prev => ({
      ...prev,
      [padKey]: prev[padKey].map((val, i) => i === step ? !val : val),
    }));
  };

  // Start playback
  const start = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    stepRef.current = 0;

    const interval = (60 / bpm / 4) * 1000; // 16th notes

    timerRef.current = setInterval(() => {
      const step = stepRef.current % STEPS;
      setCurrentStep(step);

      // Play active pads for this step
      PADS.forEach(pad => {
        if (grid[pad.key]?.[step]) {
          playPad(pad.key);
        }
      });

      stepRef.current = step + 1;
    }, interval);

    // Also play main audio if available
    if (mainAudioRef.current && audioUrl) {
      mainAudioRef.current.currentTime = 0;
      mainAudioRef.current.play().catch(console.error);
    }
  }, [isPlaying, bpm, grid, playPad, audioUrl]);

  // Stop playback
  const stop = useCallback(() => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    timerRef.current = null;
    setCurrentStep(-1);
    stepRef.current = 0;

    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
    }
  }, []);

  // Clear the grid
  const clearGrid = () => {
    setGrid(createEmptyGrid());
  };

  // Generate random pattern
  const generateRandom = () => {
    const newGrid = {};
    PADS.forEach(pad => {
      newGrid[pad.key] = Array.from({ length: STEPS }, (_, step) => {
        if (pad.key === "kick") return step % 4 === 0 || Math.random() < 0.15;
        if (pad.key === "snare") return step % 4 === 2 || Math.random() < 0.1;
        if (pad.key === "hat") return Math.random() < 0.6;
        if (pad.key === "808") return step % 8 === 0 || Math.random() < 0.1;
        return Math.random() < 0.2;
      });
    });
    setGrid(newGrid);
  };

  // Save pattern to library
  const handleSave = async () => {
    setStatus("saving");
    try {
      const result = await saveBeat({
        name: beatName || `SP Pattern – ${bpm}bpm`,
        bpm,
        key: currentBeat.key || "C minor",
        style: currentBeat.style || "trap",
        mood: currentBeat.mood || "dark",
        pattern: grid,
        audioUrl,
      });

      updateBeat({
        id: result.beatId || result._id,
        name: result.name,
        pattern: grid,
      });

      addToRecent({
        id: result.beatId || result._id,
        name: result.name,
        bpm,
        pattern: grid,
      });

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Save error:", err);
      setStatus("error");
    }
  };

  // Load a beat from recent list
  const loadRecentBeat = (beat) => {
    setBpm(beat.bpm || 90);
    setBeatName(beat.name || beat.title || "");
    setAudioUrl(beat.url || beat.audioUrl || null);
    
    if (beat.pattern) {
      const newGrid = { ...createEmptyGrid() };
      Object.keys(beat.pattern).forEach(key => {
        if (newGrid[key]) {
          newGrid[key] = beat.pattern[key];
        }
      });
      setGrid(newGrid);
    }

    loadBeat(beat);
  };

  // Navigation
  const sendToMixRoom = () => {
    navigate("/mix", {
      state: {
        beat: { name: beatName, bpm, audioUrl, pattern: grid },
      },
    });
  };

  const sendToRecordBooth = () => {
    navigate("/recordboot", {
      state: {
        backingTrack: { 
          name: beatName, 
          title: beatName,
          bpm, 
          audioUrl,
          key: currentBeat.key,
          genre: currentBeat.genre || currentBeat.style,
          mood: currentBeat.mood,
        },
      },
    });
  };

  // Use This Beat - Full workflow to Record Booth
  const useThisBeat = () => {
    // Save current pattern to session
    updatePattern(grid);
    updateBeat({
      ...currentBeat,
      name: beatName,
      bpm,
      audioUrl,
      pattern: grid,
    });

    // Navigate to Record Booth with beat preloaded
    navigate("/recordboot", {
      state: {
        backingTrack: {
          id: currentBeat.id,
          name: beatName || currentBeat.name || "Untitled Beat",
          title: beatName || currentBeat.name || "Untitled Beat",
          bpm,
          key: currentBeat.key || "C minor",
          audioUrl,
          genre: currentBeat.genre || currentBeat.style || "trap",
          mood: currentBeat.mood || "dark",
          pattern: grid,
          duration: currentBeat.duration,
        },
        fromBeatPlayer: true,
      },
    });
  };

  const openBeatLab = () => {
    navigate("/beat-lab", {
      state: {
        beat: { name: beatName, bpm, pattern: grid, audioUrl },
      },
    });
  };

  return (
    <div className="studio-page">
      {/* Hidden audio for main beat */}
      {audioUrl && (
        <audio ref={mainAudioRef} src={audioUrl} loop />
      )}

      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Beat Player</h1>
          <p className="studio-subtitle">Pads & Sequencer · Step Sequencer</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span 
            className="studio-badge"
            style={{
              background: isPlaying ? "rgba(0,200,100,0.15)" : "rgba(255,255,255,0.1)",
              color: isPlaying ? "#00c864" : "#888",
              border: `1px solid ${isPlaying ? "rgba(0,200,100,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {isPlaying ? "▶️ Playing" : "⏸️ Stopped"}
          </span>
          {status === "saved" && (
            <span className="studio-badge" style={{ background: "rgba(0,200,100,0.15)", color: "#00c864" }}>
              ✅ Saved!
            </span>
          )}
        </div>
      </div>

      {/* Beat Name Input */}
      {(audioUrl || Object.values(grid).some(row => row.some(v => v))) && (
        <div className="studio-panel" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div className="studio-field" style={{ margin: 0, flex: 1, minWidth: 200 }}>
              <label className="studio-label">Beat Name</label>
              <input
                type="text"
                className="studio-input"
                placeholder="Name your pattern..."
                value={beatName}
                onChange={(e) => setBeatName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="studio-btn studio-btn--gold" onClick={useThisBeat}>
                🎙️ Use This Beat
              </button>
              <button className="studio-btn" onClick={handleSave} disabled={status === "saving"}>
                {status === "saving" ? "💾 Saving..." : "💾 Save"}
              </button>
              <button className="studio-btn" onClick={sendToMixRoom}>
                🎚️ Mix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Panel */}
      <div className="studio-panel" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* Play/Stop */}
          {!isPlaying ? (
            <button className="studio-btn studio-btn--gold" onClick={start}>
              ▶️ Play
            </button>
          ) : (
            <button 
              className="studio-btn" 
              onClick={stop}
              style={{ background: "rgba(255,68,85,0.2)", color: "#ff4455" }}
            >
              ⏹️ Stop
            </button>
          )}

          {/* BPM */}
          <div className="studio-field" style={{ margin: 0, minWidth: 140 }}>
            <label className="studio-label" style={{ marginBottom: 4 }}>BPM: {bpm}</label>
            <input
              type="range"
              className="studio-slider"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>

          {/* Volume */}
          <div className="studio-field" style={{ margin: 0, minWidth: 140 }}>
            <label className="studio-label" style={{ marginBottom: 4 }}>Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              className="studio-slider"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Actions */}
          <button className="studio-btn studio-btn--sm" onClick={generateRandom}>
            🎲 Random
          </button>
          <button className="studio-btn studio-btn--sm" onClick={clearGrid}>
            🗑️ Clear
          </button>
          <button className="studio-btn studio-btn--sm" onClick={openBeatLab}>
            🎹 Beat Lab
          </button>
        </div>
      </div>

      <div className="studio-grid studio-grid--2">
        {/* Left - Step Sequencer Grid */}
        <div className="studio-panel studio-panel--glow">
          <h3 className="studio-card-title">🎹 Step Sequencer</h3>

          {/* Step Numbers */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "70px repeat(16, 1fr)", 
            gap: 3, 
            marginBottom: 8 
          }}>
            <div></div>
            {Array.from({ length: STEPS }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  textAlign: "center", 
                  fontSize: "0.65rem", 
                  color: currentStep === i ? "#e6b800" : i % 4 === 0 ? "#888" : "#444",
                  fontWeight: currentStep === i ? 700 : 400,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Pad Rows */}
          {PADS.map((pad) => (
            <div 
              key={pad.key}
              style={{ 
                display: "grid", 
                gridTemplateColumns: "70px repeat(16, 1fr)", 
                gap: 3, 
                marginBottom: 4 
              }}
            >
              {/* Pad Label */}
              <div 
                style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: 700, 
                  color: pad.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>{pad.icon}</span>
                <span>{pad.name}</span>
              </div>

              {/* Steps */}
              {(grid[pad.key] || new Array(STEPS).fill(false)).map((active, step) => (
                <div
                  key={step}
                  onClick={() => toggleCell(pad.key, step)}
                  style={{
                    height: 28,
                    borderRadius: 3,
                    cursor: "pointer",
                    background: active 
                      ? pad.color 
                      : step % 4 === 0 
                        ? "rgba(255,255,255,0.08)" 
                        : "rgba(255,255,255,0.04)",
                    border: currentStep === step 
                      ? `2px solid ${pad.color}` 
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: active ? `0 0 8px ${pad.color}40` : "none",
                    transition: "all 0.08s ease",
                  }}
                />
              ))}
            </div>
          ))}

          {/* Playback Indicator */}
          {isPlaying && (
            <div 
              className="studio-card" 
              style={{ 
                marginTop: 16, 
                textAlign: "center",
                background: "rgba(230,184,0,0.1)",
                borderColor: "rgba(230,184,0,0.3)",
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 20,
                      borderRadius: 3,
                      background: "#e6b800",
                      animation: `beatPulse 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#e6b800", marginTop: 8 }}>
                Step {currentStep + 1} of {STEPS}
              </div>
            </div>
          )}
        </div>

        {/* Right - Pads & Info */}
        <div className="studio-panel">
          <h3 className="studio-card-title">🥁 Drum Pads</h3>
          <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 16 }}>
            Click pads to trigger sounds
          </p>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: 12 
          }}>
            {PADS.map((pad) => (
              <button
                key={pad.key}
                onClick={() => playPad(pad.key)}
                className="studio-card"
                style={{
                  padding: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  border: `2px solid ${pad.color}40`,
                  background: `linear-gradient(135deg, ${pad.color}15, transparent)`,
                  transition: "all 0.15s ease",
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.95)";
                  e.currentTarget.style.boxShadow = `0 0 20px ${pad.color}50`;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>
                  {pad.icon}
                </div>
                <div style={{ fontWeight: 700, color: pad.color, fontSize: "0.85rem" }}>
                  {pad.name}
                </div>
              </button>
            ))}
          </div>

          {/* BPM Display */}
          <div className="studio-card" style={{ marginTop: 20, textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#e6b800" }}>
              {bpm}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#888" }}>BPM</div>
          </div>

          {/* Recent Beats */}
          {recentBeats.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "#888", fontWeight: 700 }}>
                📚 Recent Beats
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentBeats.slice(0, 3).map((beat, i) => (
                  <button
                    key={beat._id || i}
                    className="studio-card"
                    onClick={() => loadRecentBeat(beat)}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#f4f4f7", fontSize: "0.9rem" }}>
                        {beat.name || beat.title || "Untitled"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#666" }}>
                        {beat.bpm || 90} BPM
                      </div>
                    </div>
                    <span style={{ color: "#e6b800" }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes beatPulse {
          from { transform: scaleY(0.3); opacity: 0.5; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
