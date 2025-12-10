// frontend/src/pages/powerharmony/Live.jsx
// PowerHarmony Live Record Booth - Real-time Performance Recording
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startRecording, stopRecording, saveSession } from "../../lib/studioApi.js";
import "../../styles/powerharmony-unified.css";

export default function PowerHarmonyLive() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [beatLoaded, setBeatLoaded] = useState(false);

  // Simulate mic level
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setMicLevel(30 + Math.random() * 50);
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
        const result = await startRecording({ room: "live" });
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

  const handleSave = async () => {
    if (!recordingUrl) {
      alert("No recording to save");
      return;
    }
    try {
      const result = await saveSession({
        projectName: "Live Recording",
        type: "recording",
        data: { audioUrl: recordingUrl },
      });
      if (result.ok) alert("Recording saved to library!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="ph-room">
      {/* Header */}
      <div className="ph-room-header">
        <h1 className="ph-room-title">🎤 Live Record Booth</h1>
        <p className="ph-room-subtitle">Record your performance with AI assistance</p>
        <span className="ph-room-badge">PowerHarmony Room</span>
      </div>

      <div className="ph-room-content">
        <div className="ph-room-grid ph-room-grid--3">
          {/* Left: Mic Level & Beat Engine */}
          <div>
            {/* Mic Level */}
            <div className="ph-card ph-card--highlight" style={{ marginBottom: 20 }}>
              <div className="ph-card-header">
                <span className="ph-card-title">Microphone Level</span>
              </div>
              
              <div className="ph-meter-container">
                {[...Array(16)].map((_, i) => {
                  const threshold = (i / 16) * 100;
                  const isActive = micLevel > threshold;
                  return (
                    <div key={i} className="ph-meter-bar" style={{ height: `${(i + 1) * 8}px` }}>
                      <div 
                        className={`ph-meter-bar-fill ${i < 10 ? "ph-meter-bar-fill--low" : i < 13 ? "ph-meter-bar-fill--mid" : "ph-meter-bar-fill--high"}`}
                        style={{ height: isActive ? "100%" : "0%" }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="ph-meter-value">{Math.round(micLevel)}%</div>
            </div>

            {/* Beat Engine */}
            <div className="ph-card">
              <div className="ph-card-header">
                <span className="ph-card-title">Beat Engine</span>
              </div>
              <div className="ph-actions">
                <button className="ph-action-btn" onClick={() => setBeatLoaded(true)}>
                  📂 Load Beat
                </button>
                <button className="ph-action-btn" onClick={() => navigate("/studio?tab=beat-store")}>
                  🎹 Generate Beat
                </button>
              </div>
              <div style={{ 
                marginTop: 12, 
                padding: 12, 
                background: beatLoaded ? "rgba(0,200,100,0.1)" : "rgba(255,255,255,0.05)", 
                borderRadius: 8,
                textAlign: "center",
                fontSize: 13,
                color: beatLoaded ? "#00c864" : "#888"
              }}>
                {beatLoaded ? "✓ Beat loaded and ready" : "No beat loaded"}
              </div>
            </div>
          </div>

          {/* Center: Main Recording */}
          <div className="ph-card ph-card--highlight">
            <div className="ph-record-main">
              <div className={`ph-record-status ${isRecording ? "ph-record-status--recording" : "ph-record-status--ready"}`}>
                {isRecording ? "🔴 LIVE RECORDING" : "Ready to Record"}
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
                {isRecording ? "Recording in progress..." : "Press to start live recording"}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div>
            <div className="ph-card" style={{ marginBottom: 20 }}>
              <div className="ph-card-header">
                <span className="ph-card-title">Actions</span>
              </div>
              <div className="ph-actions">
                <button className="ph-action-btn" onClick={handleSave} disabled={!recordingUrl}>
                  💾 Save
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

            {/* Session Info */}
            <div className="ph-card">
              <div className="ph-card-header">
                <span className="ph-card-title">Session Info</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888" }}>Sample Rate</span>
                  <span>48 kHz</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888" }}>Bit Depth</span>
                  <span>24-bit</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#888" }}>Latency</span>
                  <span style={{ color: "#00c864" }}>~5ms</span>
                </div>
              </div>
            </div>

            {/* Audio Preview */}
            {recordingUrl && (
              <div className="ph-card" style={{ marginTop: 20 }}>
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
        PowerHarmony Live Booth • Southern Power Syndicate
      </div>
    </div>
  );
}
