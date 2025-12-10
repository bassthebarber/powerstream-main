// frontend/src/pages/powerharmony/Mix.jsx
// PowerHarmony Mix Room - Quick Mixing Interface
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyMix, getAIRecipe } from "../../lib/studioApi.js";
import "../../styles/powerharmony-unified.css";

export default function PowerHarmonyMix() {
  const navigate = useNavigate();
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(3);
  const [reverb, setReverb] = useState(25);
  const [compressor, setCompressor] = useState(-6);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mixResult, setMixResult] = useState(null);

  const handleAIRecipe = async () => {
    setLoading(true);
    try {
      const result = await getAIRecipe({});
      if (result.ok) {
        setAiSuggestion(result.notes || "AI suggests: Boost bass by +2dB, cut mids by -1dB, add 15% reverb for warmth.");
      } else {
        setAiSuggestion("Error getting AI suggestion");
      }
    } catch (err) {
      setAiSuggestion("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMix = async () => {
    setLoading(true);
    try {
      const result = await applyMix({ settings: { bass, mid, treble, reverb, compressor } });
      if (result.ok) {
        setMixResult(result);
        alert("Mix applied successfully!");
      } else {
        alert("Error: " + (result.message || "Mix failed"));
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
        <h1 className="ph-room-title">🎚️ Mix Room</h1>
        <p className="ph-room-subtitle">Balance and mix your tracks with AI assistance</p>
        <span className="ph-room-badge">PowerHarmony Room</span>
      </div>

      <div className="ph-room-content">
        <div className="ph-room-grid ph-room-grid--2">
          {/* EQ Controls */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">EQ Controls</span>
            </div>

            <div className="ph-slider-group">
              {[
                { label: "Bass", value: bass, setValue: setBass, min: -12, max: 12 },
                { label: "Mid", value: mid, setValue: setMid, min: -12, max: 12 },
                { label: "Treble", value: treble, setValue: setTreble, min: -12, max: 12 },
              ].map((ctrl) => (
                <div key={ctrl.label} className="ph-slider-item">
                  <div className="ph-slider-header">
                    <span className="ph-slider-label">{ctrl.label}</span>
                    <span className="ph-slider-value">{ctrl.value > 0 ? "+" : ""}{ctrl.value} dB</span>
                  </div>
                  <input
                    type="range"
                    className="ph-slider"
                    min={ctrl.min}
                    max={ctrl.max}
                    value={ctrl.value}
                    onChange={(e) => ctrl.setValue(parseInt(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dynamics */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Dynamics</span>
            </div>

            <div className="ph-slider-group">
              <div className="ph-slider-item">
                <div className="ph-slider-header">
                  <span className="ph-slider-label">Reverb</span>
                  <span className="ph-slider-value">{reverb}%</span>
                </div>
                <input
                  type="range"
                  className="ph-slider"
                  min="0"
                  max="100"
                  value={reverb}
                  onChange={(e) => setReverb(parseInt(e.target.value))}
                />
              </div>

              <div className="ph-slider-item">
                <div className="ph-slider-header">
                  <span className="ph-slider-label">Compressor</span>
                  <span className="ph-slider-value">{compressor} dB</span>
                </div>
                <input
                  type="range"
                  className="ph-slider"
                  min="-20"
                  max="0"
                  value={compressor}
                  onChange={(e) => setCompressor(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="ph-card" style={{ gridColumn: "1 / -1" }}>
            <div className="ph-card-header">
              <span className="ph-card-title">🤖 AI Mix Assistant</span>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <button className="ph-action-btn ph-action-btn--primary" onClick={handleAIRecipe} disabled={loading}>
                {loading ? "Processing..." : "Ask AI for Recipe"}
              </button>
              <button className="ph-action-btn" onClick={handleApplyMix} disabled={loading}>
                {loading ? "Applying..." : "Apply Mix"}
              </button>
              <button className="ph-action-btn" onClick={() => navigate("/studio?tab=mix")}>
                Open Full Mix Suite →
              </button>
            </div>

            {aiSuggestion && (
              <div style={{
                padding: 16,
                background: "rgba(255,184,77,0.1)",
                border: "1px solid rgba(255,184,77,0.3)",
                borderRadius: 10,
                color: "#ffb84d",
                fontSize: 14,
                lineHeight: 1.6
              }}>
                💡 {aiSuggestion}
              </div>
            )}

            {mixResult && (
              <div style={{ marginTop: 16 }}>
                <p style={{ color: "#00c864", marginBottom: 8 }}>✅ Mix applied successfully</p>
                {mixResult.previewUrl && (
                  <audio controls src={mixResult.previewUrl} style={{ width: "100%" }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ph-room-footer">
        PowerHarmony Mix Room • Southern Power Syndicate
      </div>
    </div>
  );
}
