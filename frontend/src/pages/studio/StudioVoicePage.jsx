// frontend/src/pages/studio/StudioVoicePage.jsx
// Voice Clone - AI voice synthesis and cloning

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studioApi from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

export default function StudioVoicePage() {
  const navigate = useNavigate();
  
  const [voiceProfile, setVoiceProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [synthesizing, setSynthesizing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await studioApi.getMyVoiceProfile();
      if (res?.ok) setVoiceProfile(res.profile);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setError("Please enter text to synthesize");
      return;
    }

    setSynthesizing(true);
    setError(null);

    try {
      const res = await studioApi.synthesizeVoice({ text });
      if (res?.ok) {
        setResult(res);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSynthesizing(false);
    }
  };

  return (
    <div className="studio-page">
      <header className="studio-page-header">
        <button className="studio-back-btn" onClick={() => navigate("/studio")}>← Back</button>
        <h1 className="studio-page-title">🗣️ Voice Clone</h1>
        <p className="studio-page-subtitle">AI voice synthesis and cloning</p>
      </header>

      {error && (
        <div className="studio-alert studio-alert--error">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="studio-card">
        <h3 className="studio-card-title">🎙️ Voice Profile</h3>
        {loading ? (
          <p>Loading profile...</p>
        ) : voiceProfile ? (
          <div className="profile-info">
            <span className="profile-status">✓ Voice profile active</span>
          </div>
        ) : (
          <div className="profile-setup">
            <p>No voice profile yet. Upload voice samples to create your AI voice clone.</p>
            <button className="studio-btn studio-btn--primary">🎙️ Create Voice Profile</button>
          </div>
        )}
      </div>

      <div className="studio-card" style={{ marginTop: 24 }}>
        <h3 className="studio-card-title">🔊 Text to Speech</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to synthesize..."
          className="voice-input"
        />
        <button
          className="studio-btn studio-btn--primary"
          onClick={handleSynthesize}
          disabled={synthesizing || !text.trim()}
          style={{ marginTop: 16 }}
        >
          {synthesizing ? "Synthesizing..." : "🔊 Synthesize Voice"}
        </button>
        
        {result && (
          <div className="result-audio" style={{ marginTop: 16 }}>
            <audio src={result.url} controls style={{ width: "100%" }} />
          </div>
        )}
      </div>

      <style>{`
        .studio-page { padding: 24px; max-width: 800px; margin: 0 auto; }
        .studio-page-header { margin-bottom: 24px; }
        .studio-back-btn { background: none; border: none; color: #888; cursor: pointer; margin-bottom: 8px; }
        .studio-page-title { font-size: 2rem; font-weight: 900; margin: 0; background: linear-gradient(90deg, #fff, #be4bdb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .studio-page-subtitle { color: #888; margin: 4px 0 0; }
        .studio-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; }
        .studio-card-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 16px; }
        .voice-input { width: 100%; min-height: 120px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; resize: vertical; }
        .profile-status { color: #00c864; font-weight: 600; }
        .profile-setup { text-align: center; padding: 20px; }
        .studio-alert { display: flex; justify-content: space-between; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; }
        .studio-alert--error { background: rgba(255,68,68,0.15); color: #ff6666; }
        .studio-alert button { background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; }
      `}</style>
    </div>
  );
}

