// frontend/src/pages/powerharmony/Vocal.jsx
// PowerHarmony Vocal Booth - Professional Vocal Recording
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startRecording, stopRecording, saveSession } from "../../lib/studioApi.js";
import "../../styles/powerharmony-unified.css";

export default function PowerHarmonyVocal() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeEffects, setActiveEffects] = useState(["reverb"]);

  // Simulate mic level
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setMicLevel(40 + Math.random() * 40);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setMicLevel(0);
    }
  }, [isRecording]);

  // Recording timer
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRecord = async () => {
    if (isRecording) {
      setLoading(true);
      try {
        const result = await stopRecording(sessionId);
        if (result.ok) {
          setRecordingUrl(result.audioUrl);
          setIsRecording(false);
          setSessionId(null);
        }
      } catch (err) {
        alert("Error: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setRecordingTime(0);
      try {
        const result = await startRecording({ room: "vocal" });
        if (result.ok) {
          setSessionId(result.sessionId);
          setIsRecording(true);
        }
      } catch (err) {
        alert("Error: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleEffect = (effect) => {
    setActiveEffects(prev => 
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  return (
    <div className="ph-room">
      {/* Header */}
      <div className="ph-room-header">
        <h1 className="ph-room-title">🎤 Vocal Booth</h1>
        <p className="ph-room-subtitle">Professional vocal recording with AI assistance</p>
        <span className="ph-room-badge">PowerHarmony Room</span>
      </div>

      <div className="ph-room-content">
        <div className="ph-room-grid ph-room-grid--3">
          {/* Left: Mic Level & Effects */}
          <div>
            {/* Mic Level */}
            <div className="ph-card ph-card--highlight" style={{ marginBottom: 20 }}>
              <div className="ph-card-header">
                <span className="ph-card-title">Input Level</span>
              </div>
              
              <div className="ph-meter-container">
                {[...Array(12)].map((_, i) => {
                  const threshold = (i / 12) * 100;
                  const isActive = micLevel > threshold;
                  return (
                    <div key={i} className="ph-meter-bar" style={{ height: `${(i + 1) * 10}px` }}>
                      <div 
                        className={`ph-meter-bar-fill ${i < 8 ? "ph-meter-bar-fill--low" : i < 10 ? "ph-meter-bar-fill--mid" : "ph-meter-bar-fill--high"}`}
                        style={{ height: isActive ? "100%" : "0%" }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="ph-meter-value">{Math.round(micLevel)} dB</div>
            </div>

            {/* Effects */}
            <div className="ph-card">
              <div className="ph-card-header">
                <span className="ph-card-title">Effects Chain</span>
              </div>
              <div className="ph-effects">
                {["reverb", "compressor", "eq", "de-esser", "autotune"].map((effect) => (
                  <button
                    key={effect}
                    className={`ph-effect-chip ${activeEffects.includes(effect) ? "ph-effect-chip--active" : ""}`}
                    onClick={() => toggleEffect(effect)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Recording Controls */}
          <div className="ph-card ph-card--highlight">
            <div className="ph-record-main">
              <div className={`ph-record-status ${isRecording ? "ph-record-status--recording" : "ph-record-status--ready"}`}>
                {isRecording ? "🔴 RECORDING" : "Ready to Record"}
              </div>

              <div className="ph-record-time">
                {formatTime(recordingTime)}
              </div>

              <button
                className={`ph-record-btn ${isRecording ? "ph-record-btn--stop" : "ph-record-btn--start"}`}
                onClick={handleRecord}
                disabled={loading}
              >
                {loading ? "..." : isRecording ? "⏹" : "⏺"}
              </button>

              <p style={{ color: "#888", marginTop: 24, fontSize: 13 }}>
                {isRecording ? "Click to stop recording" : "Click to start recording"}
              </p>
            </div>
          </div>

          {/* Right: Actions & Preview */}
          <div>
            <div className="ph-card" style={{ marginBottom: 20 }}>
              <div className="ph-card-header">
                <span className="ph-card-title">Actions</span>
              </div>
              <div className="ph-actions">
                <button
                  className="ph-action-btn"
                  onClick={async () => {
                    if (!recordingUrl) return alert("No recording to save");
                    try {
                      const result = await saveSession({
                        projectName: "Vocal Recording",
                        type: "vocal",
                        data: { audioUrl: recordingUrl },
                      });
                      if (result.ok) alert("Recording saved to library!");
                    } catch (err) {
                      alert("Error: " + (err.response?.data?.message || err.message));
                    }
                  }}
                  disabled={!recordingUrl}
                >
                  💾 Save to Library
                </button>
                <button
                  className="ph-action-btn"
                  onClick={() => recordingUrl && navigate(`/studio?tab=mix&audio=${encodeURIComponent(recordingUrl)}`)}
                  disabled={!recordingUrl}
                >
                  🎚️ Send to Mix
                </button>
                <button
                  className="ph-action-btn"
                  onClick={() => recordingUrl && window.open(recordingUrl, "_blank")}
                  disabled={!recordingUrl}
                >
                  📤 Export
                </button>
                <button className="ph-action-btn ph-action-btn--primary" onClick={() => navigate("/studio")}>
                  ← Back to Studio
                </button>
              </div>
            </div>

            {/* Audio Preview */}
            {recordingUrl && (
              <div className="ph-card">
                <div className="ph-card-header">
                  <span className="ph-card-title">Preview</span>
                </div>
                <audio controls src={recordingUrl} style={{ width: "100%" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ph-room-footer">
        PowerHarmony Vocal Booth • Southern Power Syndicate
      </div>
    </div>
  );
}
