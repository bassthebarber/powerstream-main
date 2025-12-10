// frontend/src/pages/powerharmony/Record.jsx
// PowerHarmony Record Room - Multi-track Recording
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startRecording, stopRecording, saveSession } from "../../lib/studioApi.js";
import "../../styles/powerharmony-unified.css";

export default function PowerHarmonyRecord() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [tracks, setTracks] = useState([
    { id: 1, name: "Track 1", armed: true, muted: false, solo: false },
    { id: 2, name: "Track 2", armed: false, muted: false, solo: false },
    { id: 3, name: "Track 3", armed: false, muted: false, solo: false },
  ]);

  // Recording timer
  React.useEffect(() => {
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
        const result = await startRecording({ room: "record" });
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

  const toggleTrackProp = (trackId, prop) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, [prop]: !t[prop] } : t
    ));
  };

  return (
    <div className="ph-room">
      {/* Header */}
      <div className="ph-room-header">
        <h1 className="ph-room-title">🎙️ Record Room</h1>
        <p className="ph-room-subtitle">Multi-track recording with live monitoring</p>
        <span className="ph-room-badge">PowerHarmony Room</span>
      </div>

      <div className="ph-room-content">
        <div className="ph-room-grid ph-room-grid--3">
          {/* Left: Track List */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Tracks</span>
              <button 
                className="ph-track-btn"
                onClick={() => setTracks([...tracks, { 
                  id: Date.now(), 
                  name: `Track ${tracks.length + 1}`, 
                  armed: false, 
                  muted: false, 
                  solo: false 
                }])}
              >
                + Add
              </button>
            </div>
            <div className="ph-track-list">
              {tracks.map((track) => (
                <div key={track.id} className="ph-track-item">
                  <span className="ph-track-name">{track.name}</span>
                  <div className="ph-track-controls">
                    <button 
                      className={`ph-track-btn ${track.armed ? "ph-track-btn--active" : ""}`}
                      onClick={() => toggleTrackProp(track.id, "armed")}
                      style={{ color: track.armed ? "#ff4444" : undefined }}
                    >
                      R
                    </button>
                    <button 
                      className={`ph-track-btn ${track.muted ? "ph-track-btn--active" : ""}`}
                      onClick={() => toggleTrackProp(track.id, "muted")}
                    >
                      M
                    </button>
                    <button 
                      className={`ph-track-btn ${track.solo ? "ph-track-btn--active" : ""}`}
                      onClick={() => toggleTrackProp(track.id, "solo")}
                    >
                      S
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Main Recording */}
          <div className="ph-card ph-card--highlight">
            <div className="ph-record-main">
              <div className={`ph-record-status ${isRecording ? "ph-record-status--recording" : "ph-record-status--ready"}`}>
                {isRecording ? "🔴 RECORDING" : "Ready"}
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
                {tracks.filter(t => t.armed).length} track(s) armed for recording
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
                <button className="ph-action-btn" onClick={() => navigate("/powerharmony/live")}>
                  🎤 Open Live Booth
                </button>
                <button
                  className="ph-action-btn"
                  onClick={async () => {
                    try {
                      const result = await saveSession({
                        projectName: "Record Session",
                        type: "recording",
                        data: { audioUrl: recordingUrl },
                      });
                      if (result.ok) alert("Session saved!");
                    } catch (err) {
                      alert("Error: " + (err.response?.data?.message || err.message));
                    }
                  }}
                  disabled={!recordingUrl}
                >
                  💾 Save Session
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
        PowerHarmony Record Room • Southern Power Syndicate
      </div>
    </div>
  );
}
