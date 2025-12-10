// frontend/studio-app/src/pages/MixMasterPage.jsx
// Mix & Master - Full DAW-Style UI with AI Mastering Engine
// Features: EQ, Compression, Stereo Width, Loudness Targeting, Waveform Visualization

import React, { useState, useRef, useEffect } from "react";
import "../styles/studio.css";
import { STUDIO_API_BASE } from "../config/api.js";

// Use centralized API config
const STUDIO_API = STUDIO_API_BASE;

const GENRES = [
  { value: "trap", label: "Trap" },
  { value: "hiphop", label: "Hip-Hop" },
  { value: "rnb", label: "R&B" },
  { value: "gospel", label: "Gospel" },
  { value: "southern_soul", label: "Southern Soul" },
  { value: "pop", label: "Pop" },
  { value: "drill", label: "Drill" },
];

const PRESETS = [
  { value: "streaming", label: "Streaming Ready (-14 LUFS)", description: "Optimized for Spotify, Apple Music" },
  { value: "loud", label: "Loud Master (-9 LUFS)", description: "Maximum loudness for club/radio" },
  { value: "hiphop", label: "Hip-Hop Master (-11 LUFS)", description: "Punchy bass, clear highs" },
  { value: "trap", label: "Trap Master (-10 LUFS)", description: "Heavy 808s, modern punch" },
  { value: "dynamic", label: "Dynamic Master (-16 LUFS)", description: "Preserves dynamics for acoustic" },
];

// Default processing chain
const DEFAULT_CHAIN = {
  eq: { 
    lowCut: 80, // Hz
    highBoost: 3, // dB at 12kHz
  },
  compressor: { 
    ratio: 4, // 4:1
    knee: "soft",
  },
  stereoWidth: 120, // 120% = +20% width
  loudnessTarget: -9, // LUFS
  truePeakLimit: -1.0, // dBTP
};

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`studio-toast studio-toast--${type}`}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        padding: "16px 24px",
        borderRadius: 12,
        background: type === "success" 
          ? "linear-gradient(135deg, rgba(0,200,100,0.95), rgba(0,150,80,0.95))"
          : type === "error"
          ? "linear-gradient(135deg, rgba(255,68,85,0.95), rgba(200,50,60,0.95))"
          : "linear-gradient(135deg, rgba(230,184,0,0.95), rgba(200,160,0,0.95))",
        color: "#fff",
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "1.5rem" }}>
        {type === "success" ? "✅" : type === "error" ? "❌" : "⏳"}
      </span>
      <span>{message}</span>
      <button 
        onClick={onClose}
        style={{ 
          background: "none", 
          border: "none", 
          color: "#fff", 
          cursor: "pointer",
          marginLeft: 8,
          opacity: 0.7,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// Waveform visualization component
function Waveform({ data, label, color = "#e6b800" }) {
  if (!data || data.length === 0) return null;

  const width = 400;
  const height = 80;
  const barWidth = width / data.length;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>{label}</div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8 }}>
        {data.map((value, i) => {
          const barHeight = value * height * 0.8;
          const y = (height - barHeight) / 2;
          return (
            <rect
              key={i}
              x={i * barWidth}
              y={y}
              width={Math.max(1, barWidth - 1)}
              height={barHeight}
              fill={color}
              opacity={0.8}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function MixMasterPage() {
  const [file, setFile] = useState(null);
  const [trackName, setTrackName] = useState("");
  const [genre, setGenre] = useState("hiphop");
  const [preset, setPreset] = useState("loud");
  const [status, setStatus] = useState("idle"); // idle | uploading | processing | done | error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  
  // Processing chain values
  const [chain, setChain] = useState(DEFAULT_CHAIN);
  
  const fileInputRef = useRef(null);
  const audioBeforeRef = useRef(null);
  const audioAfterRef = useRef(null);

  // Update chain based on preset
  useEffect(() => {
    const presetDefaults = {
      streaming: { loudnessTarget: -14, stereoWidth: 110 },
      loud: { loudnessTarget: -9, stereoWidth: 120 },
      hiphop: { loudnessTarget: -11, stereoWidth: 115 },
      trap: { loudnessTarget: -10, stereoWidth: 125 },
      dynamic: { loudnessTarget: -16, stereoWidth: 100 },
    };
    const defaults = presetDefaults[preset] || presetDefaults.streaming;
    setChain(prev => ({
      ...prev,
      loudnessTarget: defaults.loudnessTarget,
      stereoWidth: defaults.stereoWidth,
    }));
  }, [preset]);

  const updateChain = (module, param, value) => {
    if (module) {
      setChain(prev => ({
        ...prev,
        [module]: { ...prev[module], [param]: value }
      }));
    } else {
      setChain(prev => ({ ...prev, [param]: value }));
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!trackName) {
        setTrackName(selected.name.replace(/\.[^/.]+$/, ""));
      }
      setResult(null);
      setErrorMsg("");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMsg("Please select a file first.");
      showToast("Please select a file first.", "error");
      return;
    }

    setStatus("uploading");
    setProgress(10);
    setErrorMsg("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("trackName", trackName || "Untitled");
      formData.append("genre", genre);
      formData.append("preset", preset);
      formData.append("loudnessTarget", chain.loudnessTarget);
      formData.append("truePeakLimit", chain.truePeakLimit);
      formData.append("lowCut", chain.eq.lowCut);
      formData.append("highBoost", chain.eq.highBoost);
      formData.append("compressionRatio", chain.compressor.ratio);
      formData.append("compressionKnee", chain.compressor.knee);
      formData.append("stereoWidth", chain.stereoWidth);
      formData.append("generateWaveform", "true");
      formData.append("compareBeforeAfter", "true");

      setStatus("processing");
      setProgress(30);
      showToast("AI Mastering in progress...", "info");

      // Simulate progress while waiting
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      // Use new AI Master endpoint
      const res = await fetch(`${STUDIO_API}/api/studio/ai/master`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(95);

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Mastering failed");
      }

      setProgress(100);
      setResult(data);
      setStatus("done");
      showToast("🎉 Mastering Complete!", "success");

    } catch (err) {
      console.error("Master error:", err);
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
      showToast(err.message || "Mastering failed", "error");
    }
  };

  const handleComparePlay = (which) => {
    if (which === "before" && audioBeforeRef.current) {
      audioAfterRef.current?.pause();
      if (audioBeforeRef.current.paused) {
        audioBeforeRef.current.play();
      } else {
        audioBeforeRef.current.pause();
      }
    } else if (which === "after" && audioAfterRef.current) {
      audioBeforeRef.current?.pause();
      if (audioAfterRef.current.paused) {
        audioAfterRef.current.play();
      } else {
        audioAfterRef.current.pause();
      }
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "idle": return "Ready to Master";
      case "uploading": return "Uploading...";
      case "processing": return "AI Mastering...";
      case "done": return "✅ Mastering Complete";
      case "error": return "⚠️ Error";
      default: return "";
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case "processing": return "studio-status--processing";
      case "done": return "studio-status--success";
      case "error": return "studio-status--error";
      default: return "studio-status--idle";
    }
  };

  return (
    <div className="studio-page">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Hidden audio elements for comparison */}
      {file && <audio ref={audioBeforeRef} src={URL.createObjectURL(file)} />}
      {result?.downloadUrl && <audio ref={audioAfterRef} src={result.downloadUrl} />}

      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Mix / Master</h1>
          <p className="studio-subtitle">AI-Powered Professional Mastering · EQ · Compression · Stereo Width · Loudness</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="studio-badge" style={{ 
            background: status === "done" ? "rgba(0,200,100,0.2)" : "rgba(230,184,0,0.2)",
            color: status === "done" ? "#00c864" : "#e6b800",
          }}>
            {status === "done" ? "✅ Master Ready" : "AI Master Engine"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {(status === "uploading" || status === "processing") && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.85rem", color: "#888" }}>{getStatusText()}</span>
            <span style={{ fontSize: "0.85rem", color: "#e6b800" }}>{progress}%</span>
          </div>
          <div className="studio-meter">
            <div 
              className="studio-meter-fill studio-meter-fill--animated" 
              style={{ width: `${progress}%`, transition: "width 0.3s ease" }}
            />
          </div>
        </div>
      )}

      {/* Status Bar (when idle or done) */}
      {status !== "uploading" && status !== "processing" && (
        <div className={`studio-status ${getStatusClass()}`} style={{ marginBottom: 20 }}>
          {getStatusText()}
        </div>
      )}

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

      {/* Main Layout */}
      <div className="studio-grid studio-grid--2">
        {/* Left Column - Upload & Preset */}
        <div className="studio-panel studio-panel--glow">
          <h3 className="studio-card-title">📁 Upload Track</h3>
          
          <div 
            className={`studio-dropzone ${file ? "studio-dropzone--active" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderColor: file ? "#e6b800" : undefined,
              background: file ? "rgba(230,184,0,0.05)" : undefined,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <div className="studio-dropzone-icon">{file ? "✅" : "🎵"}</div>
            <div className="studio-dropzone-text">
              {file ? file.name : "Click to select WAV / MP3 / FLAC"}
            </div>
            <div className="studio-dropzone-hint">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Drag & drop or click to browse"}
            </div>
          </div>

          <div className="studio-field" style={{ marginTop: 20 }}>
            <label className="studio-label">Track Name</label>
            <input
              type="text"
              className="studio-input"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter track name..."
            />
          </div>

          <div className="studio-grid studio-grid--2" style={{ gap: 12, marginTop: 16 }}>
            <div className="studio-field">
              <label className="studio-label">Genre</label>
              <select
                className="studio-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                {GENRES.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div className="studio-field">
              <label className="studio-label">Preset</label>
              <select
                className="studio-select"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                {PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Description */}
          <div className="studio-card" style={{ marginTop: 16, padding: 12 }}>
            <div style={{ fontSize: "0.8rem", color: "#e6b800", marginBottom: 4 }}>
              {PRESETS.find(p => p.value === preset)?.label}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>
              {PRESETS.find(p => p.value === preset)?.description}
            </div>
          </div>

          <button
            className="studio-btn studio-btn--gold studio-btn--lg"
            onClick={handleSubmit}
            disabled={!file || status === "uploading" || status === "processing"}
            style={{ width: "100%", marginTop: 20 }}
          >
            {status === "processing" ? "⏳ Mastering..." : "🎛️ Master Track"}
          </button>
        </div>

        {/* Right Column - Processing Chain */}
        <div className="studio-panel">
          <h3 className="studio-card-title">🎚️ Processing Chain</h3>

          {/* EQ Card */}
          <div className="studio-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: "#e6b800" }}>
              EQ Curve
            </div>
            <div className="studio-field">
              <label className="studio-label">Low Cut ({chain.eq.lowCut} Hz)</label>
              <input
                type="range"
                className="studio-slider"
                min="20"
                max="200"
                value={chain.eq.lowCut}
                onChange={(e) => updateChain("eq", "lowCut", Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#666" }}>
                <span>20 Hz</span>
                <span>200 Hz</span>
              </div>
            </div>
            <div className="studio-field" style={{ marginTop: 12 }}>
              <label className="studio-label">High Boost at 12kHz (+{chain.eq.highBoost} dB)</label>
              <input
                type="range"
                className="studio-slider"
                min="0"
                max="6"
                step="0.5"
                value={chain.eq.highBoost}
                onChange={(e) => updateChain("eq", "highBoost", Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#666" }}>
                <span>0 dB</span>
                <span>+6 dB</span>
              </div>
            </div>
          </div>

          {/* Compressor Card */}
          <div className="studio-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: "#e6b800" }}>
              Compressor
            </div>
            <div className="studio-grid studio-grid--2" style={{ gap: 12 }}>
              <div className="studio-field">
                <label className="studio-label">Ratio ({chain.compressor.ratio}:1)</label>
                <input
                  type="range"
                  className="studio-slider"
                  min="1"
                  max="10"
                  value={chain.compressor.ratio}
                  onChange={(e) => updateChain("compressor", "ratio", Number(e.target.value))}
                />
              </div>
              <div className="studio-field">
                <label className="studio-label">Knee</label>
                <select
                  className="studio-select"
                  value={chain.compressor.knee}
                  onChange={(e) => updateChain("compressor", "knee", e.target.value)}
                >
                  <option value="soft">Soft</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stereo Width Card */}
          <div className="studio-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: "#e6b800" }}>
              Stereo Width
            </div>
            <div className="studio-field">
              <label className="studio-label">Width ({chain.stereoWidth}%)</label>
              <input
                type="range"
                className="studio-slider"
                min="50"
                max="150"
                value={chain.stereoWidth}
                onChange={(e) => updateChain(null, "stereoWidth", Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#666" }}>
                <span>Narrow</span>
                <span>100%</span>
                <span>Wide</span>
              </div>
            </div>
          </div>

          {/* Limiter Card */}
          <div className="studio-card">
            <div style={{ fontWeight: 700, marginBottom: 12, color: "#e6b800" }}>
              Loudness & Limiter
            </div>
            <div className="studio-field">
              <label className="studio-label">Target Loudness ({chain.loudnessTarget} LUFS)</label>
              <input
                type="range"
                className="studio-slider"
                min="-18"
                max="-6"
                value={chain.loudnessTarget}
                onChange={(e) => updateChain(null, "loudnessTarget", Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#666" }}>
                <span>-18 (Dynamic)</span>
                <span>-14 (Streaming)</span>
                <span>-6 (Loud)</span>
              </div>
            </div>
            <div className="studio-field" style={{ marginTop: 12 }}>
              <label className="studio-label">True Peak Limit ({chain.truePeakLimit} dBTP)</label>
              <input
                type="range"
                className="studio-slider"
                min="-3"
                max="0"
                step="0.1"
                value={chain.truePeakLimit}
                onChange={(e) => updateChain(null, "truePeakLimit", Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="studio-panel studio-panel--glow" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="studio-card-title" style={{ margin: 0 }}>📊 Mastering Results</h3>
            <button 
              className="studio-btn studio-btn--sm"
              onClick={() => setShowCompare(!showCompare)}
            >
              {showCompare ? "Hide Comparison" : "🔄 Compare Before/After"}
            </button>
          </div>
          
          {/* Comparison Waveforms */}
          {showCompare && (
            <div className="studio-grid studio-grid--2" style={{ marginBottom: 20 }}>
              <div className="studio-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: "#888" }}>BEFORE</span>
                  <button 
                    className="studio-btn studio-btn--sm"
                    onClick={() => handleComparePlay("before")}
                  >
                    ▶️ Play Original
                  </button>
                </div>
                <Waveform data={result.input?.waveform} label="Original Audio" color="#666" />
                <div style={{ fontSize: "0.8rem", color: "#888" }}>
                  {result.input?.loudness?.toFixed(1)} LUFS / {result.input?.truePeak?.toFixed(1)} dBTP
                </div>
              </div>
              
              <div className="studio-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: "#e6b800" }}>AFTER</span>
                  <button 
                    className="studio-btn studio-btn--sm studio-btn--gold"
                    onClick={() => handleComparePlay("after")}
                  >
                    ▶️ Play Mastered
                  </button>
                </div>
                <Waveform data={result.output?.waveform} label="Mastered Audio" color="#e6b800" />
                <div style={{ fontSize: "0.8rem", color: "#e6b800" }}>
                  {result.output?.loudness?.toFixed(1)} LUFS / {result.output?.truePeak?.toFixed(1)} dBTP
                </div>
              </div>
            </div>
          )}

          {/* Meters */}
          <div className="studio-grid studio-grid--3" style={{ marginBottom: 20 }}>
            <div className="studio-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>LOUDNESS</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#e6b800" }}>
                {result.output?.loudness?.toFixed(1) || -14}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#888" }}>LUFS</div>
              <div className="studio-meter" style={{ marginTop: 12 }}>
                <div 
                  className="studio-meter-fill studio-meter-fill--animated" 
                  style={{ width: `${result.loudnessPercent || 50}%` }}
                />
              </div>
            </div>
            
            <div className="studio-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>TRUE PEAK</div>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: 900, 
                color: result.output?.truePeak > -1 ? "#ff4455" : "#00c864" 
              }}>
                {result.output?.truePeak?.toFixed(1) || -1.0}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#888" }}>dBTP</div>
            </div>
            
            <div className="studio-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>STEREO WIDTH</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#4488ff" }}>
                {result.settings?.stereoWidth || 100}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "#888" }}>
                {result.settings?.stereoWidth > 100 ? `+${result.settings.stereoWidth - 100}%` : "Standard"}
              </div>
            </div>
          </div>

          {/* Processing Notes */}
          {result.notes && (
            <div className="studio-card" style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: "#e6b800" }}>🎛️ AI Processing Notes</div>
              <p style={{ color: "#ccc", lineHeight: 1.6, margin: 0, fontSize: "0.9rem" }}>{result.notes}</p>
            </div>
          )}

          {/* Download & Actions */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {result.downloadUrl && (
              <a
                href={result.downloadUrl}
                download={`${trackName || 'master'}_mastered.${result.format || 'mp3'}`}
                className="studio-btn studio-btn--gold studio-btn--lg"
              >
                ⬇️ Download Mastered Track
              </a>
            )}
            <button 
              className="studio-btn studio-btn--lg"
              onClick={() => {
                setFile(null);
                setResult(null);
                setStatus("idle");
                setTrackName("");
              }}
            >
              🔄 Master Another Track
            </button>
          </div>

          {/* Metadata */}
          <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.8rem", color: "#666" }}>
            <span>Duration: {result.duration}s</span>
            <span>Size: {(result.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            <span>Format: {result.format?.toUpperCase()}</span>
            <span>Processing: {result.processingTime}</span>
          </div>
        </div>
      )}

      {/* Inject toast animation */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
