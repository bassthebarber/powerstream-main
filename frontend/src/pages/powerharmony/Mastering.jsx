// frontend/src/pages/powerharmony/Mastering.jsx
// PowerHarmony Mastering Suite - Final Polish
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyMastering } from "../../lib/studioApi.js";
import "../../styles/powerharmony-unified.css";

export default function PowerHarmonyMastering() {
  const navigate = useNavigate();
  const [loudness, setLoudness] = useState(-14);
  const [stereoWidth, setStereoWidth] = useState(50);
  const [warmth, setWarmth] = useState(30);
  const [brightness, setBrightness] = useState(40);
  const [loading, setLoading] = useState(false);
  const [masterResult, setMasterResult] = useState(null);
  const [preset, setPreset] = useState("streaming");

  const presets = [
    { id: "streaming", name: "Streaming", loudness: -14, stereoWidth: 50, warmth: 30, brightness: 40 },
    { id: "club", name: "Club/DJ", loudness: -8, stereoWidth: 70, warmth: 40, brightness: 50 },
    { id: "radio", name: "Radio", loudness: -12, stereoWidth: 40, warmth: 35, brightness: 45 },
    { id: "vinyl", name: "Vinyl", loudness: -18, stereoWidth: 30, warmth: 50, brightness: 30 },
  ];

  const applyPreset = (presetId) => {
    const p = presets.find(pr => pr.id === presetId);
    if (p) {
      setPreset(presetId);
      setLoudness(p.loudness);
      setStereoWidth(p.stereoWidth);
      setWarmth(p.warmth);
      setBrightness(p.brightness);
    }
  };

  const handleMaster = async () => {
    setLoading(true);
    try {
      const result = await applyMastering({ settings: { loudness, stereoWidth, warmth, brightness } });
      if (result.ok) {
        setMasterResult(result);
        alert("Mastering applied! Your track is now radio-ready.");
      } else {
        alert("Error: " + (result.message || "Mastering failed"));
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ph-room">
      {/* Header */}
      <div className="ph-room-header">
        <h1 className="ph-room-title">🎛️ Mastering Suite</h1>
        <p className="ph-room-subtitle">Final polish and loudness optimization</p>
        <span className="ph-room-badge">PowerHarmony Room</span>
      </div>

      <div className="ph-room-content">
        {/* Presets */}
        <div className="ph-card" style={{ marginBottom: 24 }}>
          <div className="ph-card-header">
            <span className="ph-card-title">Mastering Presets</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {presets.map((p) => (
              <button
                key={p.id}
                className={`ph-effect-chip ${preset === p.id ? "ph-effect-chip--active" : ""}`}
                onClick={() => applyPreset(p.id)}
                style={{ padding: "12px 20px" }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="ph-room-grid ph-room-grid--2">
          {/* Loudness & Width */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Loudness & Stereo</span>
            </div>

            <div className="ph-slider-group">
              <div className="ph-slider-item">
                <div className="ph-slider-header">
                  <span className="ph-slider-label">Target Loudness (LUFS)</span>
                  <span className="ph-slider-value">{loudness} dB</span>
                </div>
                <input
                  type="range"
                  className="ph-slider"
                  min="-20"
                  max="-6"
                  value={loudness}
                  onChange={(e) => setLoudness(parseInt(e.target.value))}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", marginTop: 4 }}>
                  <span>Dynamic</span>
                  <span>Loud</span>
                </div>
              </div>

              <div className="ph-slider-item">
                <div className="ph-slider-header">
                  <span className="ph-slider-label">Stereo Width</span>
                  <span className="ph-slider-value">{stereoWidth}%</span>
                </div>
                <input
                  type="range"
                  className="ph-slider"
                  min="0"
                  max="100"
                  value={stereoWidth}
                  onChange={(e) => setStereoWidth(parseInt(e.target.value))}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", marginTop: 4 }}>
                  <span>Mono</span>
                  <span>Wide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Character */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Character</span>
            </div>

            <div className="ph-slider-group">
              <div className="ph-slider-item">
                <div className="ph-slider-header">
                  <span className="ph-slider-label">Warmth</span>
                  <span className="ph-slider-value">{warmth}%</span>
                </div>
                <input
                  type="range"
                  className="ph-slider"
                  min="0"
                  max="100"
                  value={warmth}
                  onChange={(e) => setWarmth(parseInt(e.target.value))}
                />
              </div>

              <div className="ph-slider-item">
                <div className="ph-slider-header">
                  <span className="ph-slider-label">Brightness / Air</span>
                  <span className="ph-slider-value">{brightness}%</span>
                </div>
                <input
                  type="range"
                  className="ph-slider"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ph-card" style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button 
                className="ph-action-btn ph-action-btn--primary" 
                onClick={handleMaster}
                disabled={loading}
                style={{ minWidth: 160 }}
              >
                {loading ? "⏳ Processing..." : "🎛️ AI Master"}
              </button>
              <button 
                className="ph-action-btn" 
                onClick={() => navigate("/studio?tab=mix")}
              >
                Open Full Suite →
              </button>
              <button
                className="ph-action-btn"
                onClick={() => masterResult?.masterUrl && window.open(masterResult.masterUrl, "_blank")}
                disabled={!masterResult}
              >
                📥 Export Master
              </button>
              <button className="ph-action-btn" onClick={() => navigate("/studio")}>
                ← Back to Studio
              </button>
            </div>

            {masterResult && (
              <div style={{ 
                marginTop: 24, 
                padding: 16, 
                background: "rgba(0,200,100,0.1)", 
                border: "1px solid rgba(0,200,100,0.3)", 
                borderRadius: 10,
                textAlign: "center"
              }}>
                <p style={{ color: "#00c864", fontWeight: 600, marginBottom: 8 }}>✅ Mastering Complete</p>
                <p style={{ color: "#888", fontSize: 13 }}>Your track is now radio-ready!</p>
                {masterResult.masterUrl && (
                  <audio controls src={masterResult.masterUrl} style={{ width: "100%", marginTop: 12 }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ph-room-footer">
        PowerHarmony Mastering Suite • Southern Power Syndicate
      </div>
    </div>
  );
}
