// frontend/src/pages/powerharmony/Master.jsx
// PowerHarmony Master Control Room - Hub for all rooms
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studioClient from "../../lib/studioClient.js";
import { getLastSession } from "../../lib/studioApi.js";
import "../../styles/powerharmony-unified.css";

const ROOMS = [
  { id: "vocal", path: "/powerharmony/vocal", icon: "🎤", name: "Vocal Booth", desc: "Professional vocal recording" },
  { id: "live", path: "/powerharmony/live", icon: "🎙️", name: "Live Booth", desc: "Real-time performance recording" },
  { id: "mix", path: "/powerharmony/mix", icon: "🎚️", name: "Mix Room", desc: "Balance and mix tracks" },
  { id: "mastering", path: "/powerharmony/mastering", icon: "🎛️", name: "Mastering", desc: "Final polish and loudness" },
  { id: "write", path: "/powerharmony/write", icon: "✍️", name: "Writing Room", desc: "AI lyric generator" },
  { id: "record", path: "/powerharmony/record", icon: "⏺️", name: "Record Room", desc: "Multi-track recording" },
];

const FEATURES = [
  { icon: "🎤", text: "AI Record Booth (mic ready, latency-tuned)" },
  { icon: "💰", text: "Royalty splits & export paperwork handled for you" },
  { icon: "🎵", text: "Instant beat generation & stem splitting" },
  { icon: "📊", text: "Visualizer & library wired into PowerStream" },
  { icon: "🎚️", text: "Song-ready mastering chain on every render" },
];

export default function PowerHarmonyMaster() {
  const navigate = useNavigate();
  const [studioStatus, setStudioStatus] = useState("checking");
  const [beatEngineStatus, setBeatEngineStatus] = useState("ready");
  const [micBoothStatus, setMicBoothStatus] = useState("armed");
  const [loadingSession, setLoadingSession] = useState(false);
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      await studioClient.get("/health");
      setStudioStatus("online");
    } catch {
      setStudioStatus("offline");
    }
  };

  const handleLoadLastSession = async () => {
    setLoadingSession(true);
    try {
      const result = await getLastSession();
      if (result.ok && result.session) {
        setLastSession(result.session);
        alert(`Session "${result.session.projectName || 'Untitled'}" loaded! Navigating to studio...`);
        // Navigate to appropriate room based on session type
        const sessionType = result.session.type || "record";
        if (sessionType === "writing") {
          navigate("/powerharmony/write", { state: { session: result.session } });
        } else if (sessionType === "mix") {
          navigate("/powerharmony/mix", { state: { session: result.session } });
        } else {
          navigate("/studio", { state: { session: result.session } });
        }
      } else if (result.code === "NO_SESSIONS") {
        alert("No previous sessions found. Start a new project!");
      } else {
        alert(result.message || "Could not load session");
      }
    } catch (err) {
      console.error("Error loading session:", err);
      alert("Failed to load session. Try starting a new project.");
    } finally {
      setLoadingSession(false);
    }
  };

  return (
    <div className="ph-room">
      {/* Header */}
      <div className="ph-room-header">
        <h1 className="ph-room-title">🎛️ Master Control Room</h1>
        <p className="ph-room-subtitle">AI Recording Studio Hub</p>
        <div style={{ marginTop: 12 }}>
          <span className={`studio-status ${studioStatus === "online" ? "studio-status--online" : studioStatus === "checking" ? "studio-status--warning" : "studio-status--offline"}`}>
            <span className="studio-status-dot"></span>
            Studio {studioStatus === "online" ? "Online" : studioStatus === "checking" ? "Checking..." : "Offline"}
          </span>
        </div>
      </div>

      <div className="ph-room-content">
        {/* Features List */}
        <div className="ph-card" style={{ marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {FEATURES.map((feature, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{feature.icon}</span>
                <span style={{ color: "#ccc", fontSize: 14 }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ph-card ph-card--highlight" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="ph-action-btn ph-action-btn--primary" onClick={() => navigate("/powerharmony/live")}>
              🎙️ Open Record Booth
            </button>
            <button className="ph-action-btn" onClick={() => navigate("/studio")}>
              🎛️ Full Studio Suite
            </button>
            <button 
              className="ph-action-btn" 
              onClick={handleLoadLastSession}
              disabled={loadingSession}
            >
              {loadingSession ? "⏳ Loading..." : "📂 Load Last Session"}
            </button>
          </div>
          <p style={{ textAlign: "center", color: "#666", fontSize: 12, marginTop: 16 }}>
            LIVE FROM BARRETT STATION · HOUSTON, TEXAS
          </p>
        </div>

        {/* Status Panels */}
        <div className="ph-room-grid ph-room-grid--2" style={{ marginBottom: 24 }}>
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">AI Beat Engine</span>
              <span className={`studio-status ${beatEngineStatus === "ready" ? "studio-status--online" : "studio-status--offline"}`}>
                {beatEngineStatus === "ready" ? "Ready" : "Offline"}
              </span>
            </div>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
              Type a vibe, tempo, or artist reference and PowerHarmony builds the bed.
            </p>
            <button className="ph-action-btn" onClick={() => navigate("/studio?tab=beat-store")}>
              Generate Beat →
            </button>
          </div>

          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Mic Booth</span>
              <span className={`studio-status ${micBoothStatus === "armed" ? "studio-status--online" : "studio-status--offline"}`}>
                {micBoothStatus === "armed" ? "Armed" : "Not Ready"}
              </span>
            </div>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
              Levels calibrated – you're one click away from recording.
            </p>
            <button className="ph-action-btn" onClick={() => navigate("/powerharmony/vocal")}>
              Open Booth →
            </button>
          </div>
        </div>

        {/* Room Grid */}
        <div className="ph-card">
          <div className="ph-card-header">
            <span className="ph-card-title">PowerHarmony Rooms</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {ROOMS.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(room.path)}
                style={{
                  padding: 20,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,184,77,0.4)";
                  e.currentTarget.style.background = "rgba(255,184,77,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{room.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 4, color: "#fff" }}>{room.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{room.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Record Section */}
        <div className="ph-card" style={{ marginTop: 24 }}>
          <div className="ph-card-header">
            <span className="ph-card-title">🎙️ Record (Mic Booth)</span>
          </div>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
            Capture raw vocals and hooks directly into the studio. Auto-arm tracks, loop sections, and punch-in fixes without losing the vibe.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="ph-effect-chip ph-effect-chip--active">Noise-gate & compressor</span>
            <span className="ph-effect-chip ph-effect-chip--active">Latency-safe monitoring</span>
            <button className="ph-action-btn" onClick={() => navigate("/powerharmony/live")}>
              Live take · Punch-in →
            </button>
          </div>
        </div>
      </div>

      <div className="ph-room-footer">
        PowerHarmony Control Room • Southern Power Syndicate • No Limit East Houston
      </div>
    </div>
  );
}
