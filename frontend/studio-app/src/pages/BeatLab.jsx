// frontend/studio-app/src/pages/BeatLab.jsx
// Beat Lab - AI Beat Design Workbench with Pattern Grid
// UPGRADED: Full AI generation, playback, navigation integration

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/studio.css";
import { useStudioSession } from "../context/StudioSessionContext.jsx";
import { generateBeat, saveBeat } from "../lib/studioApi.js";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALES = ["minor", "major"];
const STYLES = [
  { value: "trap", label: "Trap" },
  { value: "drill", label: "Drill" },
  { value: "rnb", label: "R&B" },
  { value: "hiphop", label: "Hip-Hop" },
  { value: "southern", label: "Southern" },
  { value: "gospel", label: "Gospel" },
  { value: "lofi", label: "Lo-Fi" },
  { value: "afrobeat", label: "Afrobeat" },
];

const MOODS = [
  { value: "dark", label: "Dark" },
  { value: "uplifting", label: "Uplifting" },
  { value: "aggressive", label: "Aggressive" },
  { value: "chill", label: "Chill" },
  { value: "melancholic", label: "Melancholic" },
  { value: "triumphant", label: "Triumphant" },
  { value: "eerie", label: "Eerie" },
  { value: "soulful", label: "Soulful" },
];

const REFERENCE_ARTISTS = [
  { value: "", label: "None" },
  { value: "travis scott", label: "Travis Scott" },
  { value: "metro boomin", label: "Metro Boomin" },
  { value: "future", label: "Future" },
  { value: "drake", label: "Drake" },
  { value: "j cole", label: "J. Cole" },
  { value: "kendrick lamar", label: "Kendrick Lamar" },
  { value: "kanye", label: "Kanye West" },
  { value: "scarface", label: "Scarface" },
  { value: "ugk", label: "UGK" },
  { value: "three 6 mafia", label: "Three 6 Mafia" },
];

const BARS_OPTIONS = [
  { value: 8, label: "8 bars" },
  { value: 16, label: "16 bars" },
  { value: 32, label: "32 bars" },
];

const TRACKS = ["kick", "snare", "hat", "perc", "808"];
const STEPS = 16;

// Create empty pattern grid
const createEmptyPattern = () => {
  const pattern = {};
  TRACKS.forEach(track => {
    pattern[track] = new Array(STEPS).fill(false);
  });
  return pattern;
};

export default function BeatLab() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentBeat,
    pattern: sessionPattern,
    loadBeat,
    updateBeat,
    updatePattern,
    toggleStep: sessionToggleStep,
    addToRecent,
    setGenerationStatus,
    setError,
    isGenerating,
    statusMessage,
  } = useStudioSession();

  // Beat Designer Controls
  const [bpm, setBpm] = useState(currentBeat.bpm || 140);
  const [key, setKey] = useState("C");
  const [scale, setScale] = useState("minor");
  const [style, setStyle] = useState(currentBeat.style || "trap");
  const [mood, setMood] = useState(currentBeat.mood || "dark");
  const [bars, setBars] = useState(16);
  const [prompt, setPrompt] = useState("");
  const [referenceArtist, setReferenceArtist] = useState("");
  const [aiMelody, setAiMelody] = useState(true);
  const [emphasis808, setEmphasis808] = useState(true);

  // Local pattern state (synced with session)
  const [pattern, setPattern] = useState(sessionPattern || createEmptyPattern);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  // Status
  const [status, setStatus] = useState(currentBeat.status || "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [beatName, setBeatName] = useState(currentBeat.name || "");

  // Audio
  const [audioUrl, setAudioUrl] = useState(currentBeat.audioUrl || null);
  const audioRef = useRef(null);
  const playIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Load beat from navigation state if present
  useEffect(() => {
    if (location.state?.beat) {
      const beat = location.state.beat;
      setBpm(beat.bpm || 90);
      setMood(beat.mood || "trap");
      if (beat.key) {
        const [k, s] = beat.key.split(" ");
        setKey(k || "C");
        setScale(s || "minor");
      }
      if (beat.pattern) {
        setPattern(beat.pattern);
      }
      if (beat.audioUrl) {
        setAudioUrl(beat.audioUrl);
        setStatus("ready");
      }
      setBeatName(beat.name || "");
    }
  }, [location.state]);

  // Sync local pattern changes to session
  useEffect(() => {
    updatePattern(pattern);
  }, [pattern, updatePattern]);

  // Toggle a step in the pattern
  const toggleStep = (track, step) => {
    setPattern(prev => ({
      ...prev,
      [track]: prev[track].map((val, i) => i === step ? !val : val)
    }));
  };

  // Generate AI Beat using full AI Beat Engine
  const handleGenerateBeat = async () => {
    setStatus("generating");
    setGenerationStatus("generating", "AI is creating your beat...");
    setErrorMsg("");
    setSuggestionText("");

    try {
      console.log(`🎹 [BeatLab] Generating: ${style} ${mood} @ ${bpm}bpm, ${bars} bars`);
      
      const result = await generateBeat({
        vibe: prompt,
        prompt: prompt || "",
        bpm,
        key: `${key} ${scale}`,
        style,
        mood,
        referenceArtist,
        bars,
        aiMelody,
        emphasis808,
      });

      if (!result.ok) {
        throw new Error(result.message || "Beat generation failed");
      }

      console.log("✅ [BeatLab] Generated beat:", result);

      // Update state with generated beat
      const newBeat = {
        id: result.beatId || result._id || `beat_${Date.now()}`,
        name: result.name || `SP Beat – ${style} ${bpm}bpm`,
        bpm: result.bpm || bpm,
        key: result.key || `${key} ${scale}`,
        style: result.style || style,
        mood: result.mood || mood,
        audioUrl: result.audioUrl || result.previewUrl,
        pattern: result.pattern || pattern,
        durationSeconds: result.durationSeconds,
        source: result.source,
        createdAt: new Date().toISOString(),
        status: "ready",
        metadata: result.metadata,
      };

      // Apply generated pattern if available
      if (result.pattern) {
        setPattern(result.pattern);
      }

      setAudioUrl(newBeat.audioUrl);
      setBeatName(newBeat.name);
      
      if (result.suggestionText) {
        setSuggestionText(result.suggestionText);
      }

      // Update BPM and key if detected from audio
      if (result.bpm && result.bpm !== bpm) {
        setBpm(result.bpm);
      }
      if (result.key && result.key !== `${key} ${scale}`) {
        const [detectedKey, detectedScale] = result.key.split(" ");
        if (detectedKey) setKey(detectedKey);
        if (detectedScale) setScale(detectedScale);
      }

      // Update session
      loadBeat(newBeat);
      addToRecent(newBeat);
      setGenerationStatus("ready", "Beat ready!");
      setStatus("ready");

    } catch (err) {
      console.error("❌ [BeatLab] Generate error:", err);
      setErrorMsg(err.message || "Generation failed. Try again.");
      setError(err.message);
      setStatus("error");
    }
  };

  // Simple metronome playback for pattern preview
  const playPattern = useCallback(() => {
    if (isPlaying) {
      clearInterval(playIntervalRef.current);
      setIsPlaying(false);
      setCurrentStep(-1);
      return;
    }

    setIsPlaying(true);
    let step = 0;
    const interval = (60 / bpm / 4) * 1000; // 16th notes

    // Create audio context for playback
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    playIntervalRef.current = setInterval(() => {
      setCurrentStep(step);

      // Play sounds for active steps
      TRACKS.forEach(track => {
        if (pattern[track]?.[step]) {
          const ctx = audioContextRef.current;
          if (ctx.state === "suspended") ctx.resume();
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          // Different frequencies for different drums
          const freqs = { kick: 55, snare: 200, hat: 800, perc: 400, "808": 40 };
          osc.frequency.value = freqs[track] || 200;
          osc.type = track === "kick" || track === "808" ? "sine" : "triangle";
          
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.1);
        }
      });

      step = (step + 1) % STEPS;
    }, interval);
  }, [isPlaying, bpm, pattern]);

  // Stop pattern playback on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  // Play/pause audio file
  const toggleAudioPlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  };

  // Save beat to library
  const handleSaveBeat = async () => {
    setStatus("saving");
    try {
      const result = await saveBeat({
        name: beatName || `SP Beat – ${mood} ${bpm}bpm`,
        bpm,
        key: `${key} ${scale}`,
        style: mood,
        mood,
        pattern,
        audioUrl,
      });

      // Update session with saved beat ID
      updateBeat({ 
        id: result.beatId || result._id,
        name: result.name,
      });

      setStatus("saved");
      setTimeout(() => setStatus("ready"), 2000);
    } catch (err) {
      console.error("Save error:", err);
      setErrorMsg("Failed to save beat");
      setStatus("error");
    }
  };

  // Clear pattern
  const clearPattern = () => {
    setPattern(createEmptyPattern());
    setSuggestionText("");
  };

  // Navigation handlers
  const openInBeatPlayer = () => {
    navigate("/player", {
      state: {
        beat: {
          id: currentBeat.id,
          name: beatName,
          bpm,
          key: `${key} ${scale}`,
          mood,
          audioUrl,
          pattern,
        },
      },
    });
  };

  const sendToMixRoom = () => {
    navigate("/mix", {
      state: {
        beat: {
          name: beatName,
          bpm,
          audioUrl,
        },
      },
    });
  };

  const sendToRecordBooth = () => {
    navigate("/recordboot", {
      state: {
        backingTrack: {
          name: beatName,
          bpm,
          audioUrl,
        },
      },
    });
  };

  return (
    <div className="studio-page">
      {/* Hidden audio element for beat playback */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onEnded={() => {}} />
      )}

      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">AI Beat Room</h1>
          <p className="studio-subtitle">AI Beat Design Workbench · Pattern Generator</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Status Badge */}
          <span 
            className="studio-badge" 
            style={{
              background: status === "ready" ? "rgba(0,200,100,0.15)" :
                         status === "generating" ? "rgba(230,184,0,0.15)" :
                         status === "error" ? "rgba(255,68,85,0.15)" :
                         "rgba(255,255,255,0.1)",
              color: status === "ready" ? "#00c864" :
                     status === "generating" ? "#e6b800" :
                     status === "error" ? "#ff4455" :
                     "#888",
              border: `1px solid ${
                status === "ready" ? "rgba(0,200,100,0.3)" :
                status === "generating" ? "rgba(230,184,0,0.3)" :
                status === "error" ? "rgba(255,68,85,0.3)" :
                "rgba(255,255,255,0.1)"
              }`,
            }}
          >
            {status === "generating" ? "⏳ Generating..." :
             status === "ready" ? "✅ Beat Ready" :
             status === "saved" ? "💾 Saved!" :
             status === "error" ? "❌ Error" :
             "🎹 AI Pattern Engine"}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="studio-status studio-status--error" style={{ marginBottom: 20 }}>
          {errorMsg}
          <button 
            onClick={() => setErrorMsg("")}
            style={{ marginLeft: 12, background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Beat Ready Panel - Shows when beat is generated */}
      {status === "ready" && audioUrl && (
        <div 
          className="studio-panel studio-panel--glow" 
          style={{ 
            marginBottom: 24,
            background: "linear-gradient(135deg, rgba(0,200,100,0.08) 0%, rgba(0,0,0,0.3) 100%)",
            borderColor: "rgba(0,200,100,0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: "2.5rem" }}>🎵</div>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700, color: "#00c864" }}>
                  Beat Generated!
                </h3>
                <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
                  {beatName || `${mood} ${bpm}bpm`}
                </p>
              </div>
            </div>
            
            {/* Playback Controls */}
            <div style={{ display: "flex", gap: 10 }}>
              <button 
                className="studio-btn studio-btn--gold"
                onClick={toggleAudioPlayback}
              >
                {audioRef.current?.paused !== false ? "▶️ Play Beat" : "⏸ Pause"}
              </button>
              <button 
                className="studio-btn"
                onClick={openInBeatPlayer}
              >
                🎹 Open in Beat Player
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button className="studio-btn studio-btn--sm" onClick={sendToRecordBooth}>
              🎙️ Send to Record Booth
            </button>
            <button className="studio-btn studio-btn--sm" onClick={sendToMixRoom}>
              🎚️ Send to Mix Room
            </button>
            <button className="studio-btn studio-btn--sm" onClick={() => navigate("/library")}>
              📚 View in Library
            </button>
            <button 
              className="studio-btn studio-btn--sm studio-btn--outline"
              onClick={handleSaveBeat}
              disabled={status === "saving"}
            >
              {status === "saving" ? "💾 Saving..." : "💾 Save to Library"}
            </button>
          </div>
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Left - Beat Designer Controls */}
        <div className="studio-panel studio-panel--glow">
          <h3 className="studio-card-title">🎛️ Beat Designer</h3>

          {/* Beat Name */}
          <div className="studio-field">
            <label className="studio-label">Beat Name (optional)</label>
            <input
              type="text"
              className="studio-input"
              placeholder={`SP Beat – ${mood} ${bpm}bpm`}
              value={beatName}
              onChange={(e) => setBeatName(e.target.value)}
            />
          </div>

          {/* AI Prompt */}
          <div className="studio-field">
            <label className="studio-label">AI Prompt (describe the vibe)</label>
            <input
              type="text"
              className="studio-input"
              placeholder="e.g., dark trap vibes like Travis Scott, heavy 808s"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* BPM Slider */}
          <div className="studio-field">
            <label className="studio-label">BPM: {bpm}</label>
            <input
              type="range"
              className="studio-slider"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#666" }}>
              <span>60</span>
              <span>180</span>
            </div>
          </div>

          {/* Key & Scale */}
          <div className="studio-grid studio-grid--2" style={{ gap: 12, marginTop: 16 }}>
            <div className="studio-field">
              <label className="studio-label">Key</label>
              <select
                className="studio-select"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              >
                {KEYS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="studio-field">
              <label className="studio-label">Scale</label>
              <select
                className="studio-select"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              >
                {SCALES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Style & Mood */}
          <div className="studio-grid studio-grid--2" style={{ gap: 12, marginTop: 16 }}>
            <div className="studio-field">
              <label className="studio-label">Style</label>
              <select
                className="studio-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {STYLES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="studio-field">
              <label className="studio-label">Mood</label>
              <select
                className="studio-select"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                {MOODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference Artist & Bars */}
          <div className="studio-grid studio-grid--2" style={{ gap: 12, marginTop: 16 }}>
            <div className="studio-field">
              <label className="studio-label">Reference Artist</label>
              <select
                className="studio-select"
                value={referenceArtist}
                onChange={(e) => setReferenceArtist(e.target.value)}
              >
                {REFERENCE_ARTISTS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className="studio-field">
              <label className="studio-label">Length</label>
              <select
                className="studio-select"
                value={bars}
                onChange={(e) => setBars(Number(e.target.value))}
              >
                {BARS_OPTIONS.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="studio-grid studio-grid--2" style={{ gap: 12, marginTop: 16 }}>
            <label className="studio-card" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={aiMelody}
                onChange={(e) => setAiMelody(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#e6b800" }}
              />
              <span style={{ fontWeight: 600 }}>AI Melody</span>
            </label>
            <label className="studio-card" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={emphasis808}
                onChange={(e) => setEmphasis808(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#e6b800" }}
              />
              <span style={{ fontWeight: 600 }}>808 Emphasis</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            className="studio-btn studio-btn--gold studio-btn--lg"
            onClick={handleGenerateBeat}
            disabled={status === "generating"}
            style={{ width: "100%", marginTop: 20 }}
          >
            {status === "generating" ? (
              <>⏳ Generating Beat...</>
            ) : (
              <>✨ Generate AI Beat</>
            )}
          </button>

          {/* Producer Notes */}
          {suggestionText && (
            <div className="studio-card" style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 8 }}>🎤 Producer Notes</div>
              <p style={{ color: "#ccc", lineHeight: 1.6, margin: 0, fontSize: "0.9rem" }}>
                {suggestionText}
              </p>
            </div>
          )}
        </div>

        {/* Right - Pattern Grid */}
        <div className="studio-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="studio-card-title" style={{ margin: 0 }}>🥁 Pattern Grid</h3>
            <button className="studio-btn studio-btn--sm" onClick={clearPattern}>
              Clear
            </button>
          </div>

          {/* Step Numbers */}
          <div style={{ display: "grid", gridTemplateColumns: "60px repeat(16, 1fr)", gap: 4, marginBottom: 8 }}>
            <div></div>
            {Array.from({ length: STEPS }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  textAlign: "center", 
                  fontSize: "0.7rem", 
                  color: currentStep === i ? "#e6b800" : i % 4 === 0 ? "#888" : "#555",
                  fontWeight: currentStep === i ? 700 : 400,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Pattern Rows */}
          {TRACKS.map(track => (
            <div 
              key={track} 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "60px repeat(16, 1fr)", 
                gap: 4, 
                marginBottom: 6 
              }}
            >
              <div style={{ 
                fontSize: "0.8rem", 
                fontWeight: 700, 
                color: track === "808" ? "#8855ff" : "#888", 
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center"
              }}>
                {track}
              </div>
              {(pattern[track] || new Array(STEPS).fill(false)).map((active, step) => (
                <div
                  key={step}
                  className={`studio-step ${active ? "studio-step--active" : ""} ${currentStep === step ? "studio-step--playing" : ""}`}
                  onClick={() => toggleStep(track, step)}
                  style={{
                    height: 28,
                    borderRadius: 4,
                    cursor: "pointer",
                    background: active 
                      ? track === "808" 
                        ? "linear-gradient(135deg, #8855ff, #6633cc)"
                        : "linear-gradient(135deg, #e6b800, #c9a000)" 
                      : step % 4 === 0 
                        ? "rgba(255,255,255,0.08)" 
                        : "rgba(255,255,255,0.04)",
                    border: currentStep === step 
                      ? "2px solid #e6b800"
                      : "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.1s ease",
                  }}
                />
              ))}
            </div>
          ))}

          {/* Playback Controls */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              className={`studio-btn ${isPlaying ? "studio-btn--gold" : ""}`}
              onClick={playPattern}
              style={{ flex: 1 }}
            >
              {isPlaying ? "⏹ Stop" : "▶️ Play Pattern"}
            </button>
            <button
              className="studio-btn studio-btn--outline"
              onClick={handleSaveBeat}
              disabled={status === "saving"}
              style={{ flex: 1 }}
            >
              {status === "saving" ? "Saving..." : status === "saved" ? "✅ Saved!" : "💾 Save Draft"}
            </button>
          </div>

          {/* BPM Display */}
          <div className="studio-card" style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#e6b800" }}>{bpm}</div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>BPM</div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button 
              className="studio-btn studio-btn--sm"
              onClick={openInBeatPlayer}
              style={{ flex: 1 }}
            >
              🎹 Beat Player
            </button>
            <button 
              className="studio-btn studio-btn--sm"
              onClick={() => navigate("/beats")}
              style={{ flex: 1 }}
            >
              🛒 Beat Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
