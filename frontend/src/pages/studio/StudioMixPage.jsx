// frontend/src/pages/studio/StudioMixPage.jsx
// Mix & Master Suite - Professional Mixing Console
import React, { useState } from "react";
import { applyMix, getAIRecipe } from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

const CHANNELS = [
  { id: "kick", name: "Kick", level: 0 },
  { id: "snare", name: "Snare", level: -2 },
  { id: "hats", name: "Hi-Hats", level: -4 },
  { id: "bass", name: "Bass", level: 2 },
  { id: "melody", name: "Melody", level: -1 },
  { id: "vocals", name: "Vocals", level: 3 },
];

export default function StudioMixPage() {
  const [channels, setChannels] = useState(CHANNELS);
  const [masterLevel, setMasterLevel] = useState(0);
  const [bass, setBass] = useState(4);
  const [mid, setMid] = useState(1);
  const [treble, setTreble] = useState(3);
  const [presence, setPresence] = useState(2);
  const [comp, setComp] = useState(-3);
  const [limiter, setLimiter] = useState(-1);
  const [aiRecipe, setAiRecipe] = useState("Master brighter, +1 dB loudness, tame 300Hz mud");
  const [aiLoading, setAiLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mixResult, setMixResult] = useState(null);
  const [trackId, setTrackId] = useState(null);

  const handleChannelLevel = (channelId, newLevel) => {
    setChannels(channels.map(ch => 
      ch.id === channelId ? { ...ch, level: newLevel } : ch
    ));
  };

  const handleAIRecipe = async () => {
    setError("");
    setSuccess("");
    setAiLoading(true);
    try {
      const result = await getAIRecipe({ trackId, prompt: aiRecipe });
      if (result?.ok) {
        setMixResult(result);
        setAiRecipe(result.notes || aiRecipe);
        if (result.settings) {
          setBass(result.settings.bass || bass);
          setMid(result.settings.mid || mid);
          setTreble(result.settings.treble || treble);
          setPresence(result.settings.presence || presence);
          setComp(result.settings.comp || comp);
          setLimiter(result.settings.limiter || limiter);
        }
        setSuccess("AI recipe generated successfully!");
      } else {
        setError(result?.message || "AI recipe failed");
      }
    } catch (err) {
      setError("AI recipe failed: " + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyMix = async () => {
    setError("");
    setSuccess("");
    setApplyLoading(true);
    try {
      const result = await applyMix({ trackId, bass, mid, treble, presence, comp, limiter });
      if (result?.ok) {
        setMixResult(result);
        setSuccess("Mix applied successfully!");
      } else {
        setError(result?.message || "Mix apply failed");
      }
    } catch (err) {
      setError("Mix apply failed: " + (err.response?.data?.message || err.message));
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">🎚️ Mix & Master Suite</h1>
        <p className="studio-header-subtitle">Professional mixing console with AI assistance</p>
      </div>

      {/* Alert */}
      {(error || success) && (
        <div className={`studio-alert ${error ? "studio-alert--error" : "studio-alert--success"}`}>
          <span>{error ? "⚠️ " + error : "✅ " + success}</span>
          <button className="studio-alert-dismiss" onClick={() => { setError(""); setSuccess(""); }}>×</button>
        </div>
      )}

      {/* Mixer Console */}
      <div className="studio-card" style={{ marginBottom: 24 }}>
        <div className="studio-card-header">
          <h3 className="studio-card-title">Channel Mixer</h3>
          <span className="studio-card-badge">6 Channels</span>
        </div>
        
        <div className="studio-mixer">
          {channels.map((channel) => (
            <div key={channel.id} className="studio-mixer-channel">
              <div className="studio-fader-label">{channel.name}</div>
              
              {/* Level Meter */}
              <div style={{ 
                width: 8, 
                height: 150, 
                background: "rgba(255,255,255,0.1)", 
                borderRadius: 4,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column-reverse"
              }}>
                <div style={{
                  width: "100%",
                  height: `${Math.max(0, (channel.level + 12) / 24 * 100)}%`,
                  background: "linear-gradient(to top, #00c864, #ffb84d, #ff4444)",
                  borderRadius: 4,
                  transition: "height 0.1s ease"
                }} />
              </div>
              
              {/* Fader */}
              <input
                type="range"
                className="studio-fader"
                min="-12"
                max="12"
                value={channel.level}
                onChange={(e) => handleChannelLevel(channel.id, parseInt(e.target.value))}
              />
              
              <div className="studio-fader-value">
                {channel.level > 0 ? "+" : ""}{channel.level} dB
              </div>
            </div>
          ))}

          {/* Master Channel */}
          <div className="studio-mixer-channel" style={{ borderLeft: "2px solid rgba(255,184,77,0.3)", paddingLeft: 24 }}>
            <div className="studio-fader-label" style={{ color: "#ffb84d" }}>MASTER</div>
            
            <div style={{ 
              width: 12, 
              height: 150, 
              background: "rgba(255,184,77,0.2)", 
              borderRadius: 4,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column-reverse"
            }}>
              <div style={{
                width: "100%",
                height: `${Math.max(0, (masterLevel + 12) / 24 * 100)}%`,
                background: "linear-gradient(to top, #00c864, #ffb84d)",
                borderRadius: 4,
                transition: "height 0.1s ease"
              }} />
            </div>
            
            <input
              type="range"
              className="studio-fader"
              min="-12"
              max="12"
              value={masterLevel}
              onChange={(e) => setMasterLevel(parseInt(e.target.value))}
              style={{ background: "linear-gradient(to top, rgba(255,184,77,0.3), rgba(255,184,77,0.1))" }}
            />
            
            <div className="studio-fader-value" style={{ background: "rgba(255,184,77,0.2)", color: "#ffb84d" }}>
              {masterLevel > 0 ? "+" : ""}{masterLevel} dB
            </div>
          </div>
        </div>
      </div>

      {/* EQ & Dynamics */}
      <div className="studio-grid studio-grid--2" style={{ marginBottom: 24 }}>
        {/* EQ Controls */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">🎛️ EQ Controls</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { label: "Bass", value: bass, setValue: setBass },
              { label: "Mid", value: mid, setValue: setMid },
              { label: "Treble", value: treble, setValue: setTreble },
              { label: "Presence / Air", value: presence, setValue: setPresence },
            ].map((ctrl) => (
              <div key={ctrl.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label className="studio-label" style={{ margin: 0 }}>{ctrl.label}</label>
                  <span style={{ color: "#ffb84d", fontWeight: 700 }}>
                    {ctrl.value > 0 ? "+" : ""}{ctrl.value} dB
                  </span>
                </div>
                <input
                  type="range"
                  className="studio-slider"
                  min="-12"
                  max="12"
                  value={ctrl.value}
                  onChange={(e) => ctrl.setValue(parseInt(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dynamics */}
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">📊 Dynamics</h3>
          </div>
          
          <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
            <div className="studio-fader-container">
              <div className="studio-fader-label">Compressor</div>
              <input
                type="range"
                className="studio-fader"
                min="-12"
                max="0"
                value={comp}
                onChange={(e) => setComp(parseInt(e.target.value))}
              />
              <div className="studio-fader-value">{comp} dB</div>
            </div>

            <div className="studio-fader-container">
              <div className="studio-fader-label">Limiter</div>
              <input
                type="range"
                className="studio-fader"
                min="-12"
                max="0"
                value={limiter}
                onChange={(e) => setLimiter(parseInt(e.target.value))}
              />
              <div className="studio-fader-value">{limiter} dB</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recipe */}
      <div className="studio-card" style={{ marginBottom: 24 }}>
        <div className="studio-card-header">
          <h3 className="studio-card-title">🤖 AI Mix Assistant</h3>
          <span className="studio-card-badge">AI</span>
        </div>
        <p className="studio-card-desc">
          Describe the sound you want and let AI suggest the perfect mix settings.
        </p>
        
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <input
            type="text"
            className="studio-input"
            value={aiRecipe}
            onChange={(e) => setAiRecipe(e.target.value)}
            placeholder="Master brighter, +1 dB loudness, tame 300Hz mud"
          />
          <button 
            className="studio-btn studio-btn--primary"
            onClick={handleAIRecipe}
            disabled={aiLoading}
            style={{ whiteSpace: "nowrap" }}
          >
            {aiLoading ? "Processing..." : "Ask AI for Recipe"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button 
            className="studio-btn studio-btn--secondary"
            onClick={handleApplyMix}
            disabled={applyLoading}
          >
            {applyLoading ? "Applying..." : "Apply Mix"}
          </button>
          <button className="studio-btn studio-btn--outline" disabled={!mixResult}>
            Download Master
          </button>
          <button className="studio-btn studio-btn--outline">
            A/B Compare
          </button>
        </div>

        {/* Mix Result */}
        {mixResult && (
          <div style={{ 
            marginTop: 16, 
            padding: 16, 
            background: "rgba(255,184,77,0.1)", 
            borderRadius: 10,
            border: "1px solid rgba(255,184,77,0.3)"
          }}>
            <p style={{ color: "#ffb84d", fontWeight: 600, marginBottom: 8 }}>✅ Mix Applied</p>
            <p style={{ fontSize: 13, color: "#888" }}>{mixResult.notes || "Mix settings applied successfully"}</p>
            {mixResult.previewUrl && (
              <audio controls src={mixResult.previewUrl} style={{ width: "100%", marginTop: 12 }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
