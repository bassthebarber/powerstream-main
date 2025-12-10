// frontend/src/pages/powerharmony/Write.jsx
// PowerHarmony Writing Room - AI Lyric Writer
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateLyrics, saveSession } from "../../lib/studioApi.js";
import "../../styles/powerharmony-unified.css";

export default function PowerHarmonyWrite() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("emotional");
  const [genre, setGenre] = useState("hip-hop");

  const [errorMessage, setErrorMessage] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await generateLyrics({ prompt, mood, genre });
      if (result.ok) {
        setLyrics(result.lyrics);
      } else if (result.code === "SERVICE_NOT_CONFIGURED") {
        // Graceful fallback when AI is not configured
        setErrorMessage("AI Lyrics is not configured yet. You can write lyrics manually in the output box.");
        setLyrics(""); // Allow manual editing
      } else {
        setErrorMessage(result.message || "Generation failed. Try again.");
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === "SERVICE_NOT_CONFIGURED") {
        setErrorMessage("AI Lyrics is not configured. You can write lyrics manually below.");
      } else {
        setErrorMessage(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lyrics.trim()) {
      alert("No lyrics to save");
      return;
    }
    try {
      const result = await saveSession({
        projectName: "Lyrics: " + prompt.substring(0, 30),
        type: "writing",
        data: { lyrics, prompt, mood, genre },
      });
      if (result.ok) {
        alert("Lyrics saved to library!");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="ph-room">
      {/* Header */}
      <div className="ph-room-header">
        <h1 className="ph-room-title">✍️ Writing Room</h1>
        <p className="ph-room-subtitle">Generate lyrics with AI assistance</p>
        <span className="ph-room-badge">PowerHarmony Room</span>
      </div>

      <div className="ph-room-content">
        <div className="ph-room-grid ph-room-grid--2">
          {/* Left: Input */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Your Prompt</span>
            </div>

            {/* Mood & Genre */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>
                  Mood
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14
                  }}
                >
                  <option value="emotional">Emotional</option>
                  <option value="uplifting">Uplifting</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="romantic">Romantic</option>
                  <option value="party">Party</option>
                  <option value="introspective">Introspective</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14
                  }}
                >
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="r&b">R&B</option>
                  <option value="pop">Pop</option>
                  <option value="country">Country</option>
                  <option value="rock">Rock</option>
                  <option value="gospel">Gospel</option>
                </select>
              </div>
            </div>

            {/* Prompt Input */}
            <textarea
              className="ph-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the mood, theme, or story you want your lyrics to tell...

Examples:
• A song about overcoming struggles and finding success
• A love song about missing someone far away
• A hype track about dominating the game"
              rows={12}
            />

            <button
              className="ph-action-btn ph-action-btn--primary"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              style={{ width: "100%", marginTop: 16, padding: "14px 24px" }}
            >
              {loading ? "✨ Generating..." : "✨ Generate Lyrics"}
            </button>

            {/* Error/Info Banner */}
            {errorMessage && (
              <div style={{
                marginTop: 12,
                padding: "12px 16px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: 8,
                color: "#fbbf24",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <span>ℹ️</span>
                <span>{errorMessage}</span>
                <button 
                  onClick={() => setErrorMessage(null)}
                  style={{ 
                    marginLeft: "auto", 
                    background: "transparent", 
                    border: "none", 
                    color: "inherit", 
                    cursor: "pointer",
                    fontSize: 16
                  }}
                >×</button>
              </div>
            )}
          </div>

          {/* Right: Output */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">AI-Generated Lyrics</span>
              {lyrics && (
                <span style={{ fontSize: 12, color: "#888" }}>
                  {lyrics.split("\n").length} lines
                </span>
              )}
            </div>

            <div className="ph-output" style={{ minHeight: 300 }}>
              {lyrics ? (
                <pre style={{ 
                  fontFamily: "inherit", 
                  whiteSpace: "pre-wrap", 
                  margin: 0,
                  lineHeight: 1.8 
                }}>
                  {lyrics}
                </pre>
              ) : (
                <p className="ph-output-placeholder">
                  Enter a prompt and click "Generate Lyrics" to create AI-powered lyrics.
                </p>
              )}
            </div>

            {lyrics && (
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <button className="ph-action-btn" onClick={handleSave}>
                  💾 Save to Library
                </button>
                <button className="ph-action-btn" onClick={() => {
                  navigator.clipboard.writeText(lyrics);
                  alert("Lyrics copied to clipboard!");
                }}>
                  📋 Copy
                </button>
                <button className="ph-action-btn" onClick={() => navigate("/powerharmony/vocal")}>
                  🎤 Record Vocal
                </button>
                <button className="ph-action-btn" onClick={() => setLyrics("")}>
                  🗑️ Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="ph-card" style={{ marginTop: 24 }}>
          <div className="ph-card-header">
            <span className="ph-card-title">💡 Writing Tips</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: "🎯", title: "Be Specific", desc: "Include details about the story, emotions, and imagery you want" },
              { icon: "🎵", title: "Set the Vibe", desc: "Mention tempo, energy level, or reference songs you like" },
              { icon: "👤", title: "Character Voice", desc: "Describe who's speaking - their perspective and personality" },
            ].map((tip, idx) => (
              <div key={idx} style={{ 
                padding: 16, 
                background: "rgba(255,255,255,0.03)", 
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{tip.title}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ph-room-footer">
        PowerHarmony Writing Room • Southern Power Syndicate
      </div>
    </div>
  );
}
