// frontend/src/pages/Studio.jsx
// AI Recording Studio - Main Hub with Unified Navigation
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSessions, loadSession, checkAllStudioHealth } from "../lib/studioApi.js";
import StudioExportPage from "./studio/StudioExportPage.jsx";
import StudioMixPage from "./studio/StudioMixPage.jsx";
import StudioBeatPage from "./studio/StudioBeatPage.jsx";
import StudioPlayerPage from "./studio/StudioPlayerPage.jsx";
import StudioUploadsPage from "./studio/StudioUploadsPage.jsx";
import StudioRoyaltyPage from "./studio/StudioRoyaltyPage.jsx";
import StudioVisualizerPage from "./studio/StudioVisualizerPage.jsx";
import StudioLibraryPage from "./studio/StudioLibraryPage.jsx";
import StudioSettingsPage from "./studio/StudioSettingsPage.jsx";
import StudioRecordPage from "./studio/StudioRecordPage.jsx";
import StudioStatusBanner from "../components/studio/StudioStatusBanner.jsx";
import "../styles/studio-unified.css";

const TABS = [
  { id: "studio", label: "Studio", icon: "🎛️" },
  { id: "record", label: "Record", icon: "🎙️" },
  { id: "mix", label: "Mix", icon: "🎚️" },
  { id: "beat-store", label: "Beat Store", icon: "🎹" },
  { id: "player", label: "Player", icon: "🔊" },
  { id: "upload", label: "Upload", icon: "⬆️" },
  { id: "export-email", label: "Export & Email", icon: "📧" },
  { id: "royalty", label: "Royalty", icon: "💰" },
  { id: "visualizer", label: "Visualizer", icon: "🌈" },
  { id: "library", label: "Library", icon: "📚" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Studio() {
  const [activeTab, setActiveTab] = useState("studio");
  const [studioStatus, setStudioStatus] = useState("checking");
  const [recentProjects, setRecentProjects] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    checkStudioHealth();
    loadRecentProjects();
  }, []);

  const checkStudioHealth = async () => {
    // Check both main API and Recording Studio server
    try {
      const result = await checkAllStudioHealth();
      if (result.fullyOperational) {
        setStudioStatus("online");
      } else if (result.mainApi.ok) {
        setStudioStatus("partial"); // Main API works, Recording Studio offline
      } else {
        setStudioStatus("offline");
      }
    } catch {
      // Even if API check fails, studio can work locally (browser-based recording)
      setStudioStatus("local");
    }
  };

  const loadRecentProjects = async () => {
    // Skip if not logged in (no token)
    const token = localStorage.getItem("powerstreamToken");
    if (!token) {
      setRecentProjects([]);
      return;
    }
    
    try {
      const result = await listSessions({ limit: 6 });
      if (result?.ok && Array.isArray(result.sessions)) {
        setRecentProjects(result.sessions);
      } else {
        // Gracefully handle errors - don't show error to user
        setRecentProjects([]);
      }
    } catch (err) {
      // Silent failure - sessions are optional
      console.debug("[Studio] Could not load recent projects:", err?.message);
      setRecentProjects([]);
    }
  };

  const handleOpenProject = async (session) => {
    try {
      const result = await loadSession(session.id);
      if (result?.ok && result.session) {
        const typeToTab = {
          beat: "beat-store",
          mix: "mix",
          recording: "record",
          vocal: "record",
        };
        setActiveTab(typeToTab[session.type] || "studio");
      }
    } catch (err) {
      console.error("Error loading session:", err);
    }
  };

  return (
    <div className="studio-page">
      {/* Navigation Pills */}
      <nav className="studio-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`studio-pill ${activeTab === tab.id ? "studio-pill--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="studio-pill-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Status Banner - Shows if Recording Studio is offline */}
      <StudioStatusBanner compact />

      {/* Content */}
      <div className="studio-content">
        {activeTab === "studio" && (
          <StudioOverview 
            studioStatus={studioStatus} 
            recentProjects={recentProjects}
            onOpenProject={handleOpenProject}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "record" && <StudioRecordPage />}
        {activeTab === "mix" && <StudioMixPage />}
        {activeTab === "beat-store" && <StudioBeatPage />}
        {activeTab === "player" && <StudioPlayerPage />}
        {activeTab === "upload" && <StudioUploadsPage />}
        {activeTab === "export-email" && <StudioExportPage />}
        {activeTab === "royalty" && <StudioRoyaltyPage />}
        {activeTab === "visualizer" && <StudioVisualizerPage />}
        {activeTab === "library" && <StudioLibraryPage />}
        {activeTab === "settings" && <StudioSettingsPage />}
      </div>
    </div>
  );
}

function StudioOverview({ studioStatus, recentProjects, onOpenProject, onNavigate }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">AI Recording Studio</h1>
        <p className="studio-header-subtitle">
          Professional music production powered by AI
        </p>
        <p className="studio-header-location">
          LIVE FROM BARRETT STATION · HOUSTON, TEXAS
        </p>
      </div>

      {/* Session Status */}
      <div className="studio-card studio-card--highlight" style={{ marginBottom: 24 }}>
        <div className="studio-card-header">
          <h2 className="studio-card-title">SESSION STATUS</h2>
        </div>
        
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div className={`studio-status ${studioStatus === "online" ? "studio-status--online" : "studio-status--offline"}`}>
            <span className="studio-status-dot"></span>
            <span>Studio {studioStatus === "online" ? "Online" : "Offline"}</span>
          </div>
          <div className="studio-status studio-status--ready">
            <span>Latency = low</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div className="studio-card" style={{ padding: 16 }}>
            <div className="studio-card-header" style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>AI Beat Engine</span>
              <span className="studio-card-badge studio-card-badge--green">Ready</span>
            </div>
            <div className="studio-status studio-status--online" style={{ marginBottom: 8 }}>
              <span className="studio-status-dot"></span>
              <span>Ready for prompts</span>
            </div>
            <p className="studio-card-desc" style={{ margin: 0 }}>
              Type a vibe, tempo, or artist reference and PowerHarmony builds the bed.
            </p>
          </div>

          <div className="studio-card" style={{ padding: 16 }}>
            <div className="studio-card-header" style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>Mic Booth</span>
              <span className="studio-card-badge studio-card-badge--green">Armed</span>
            </div>
            <div className="studio-status studio-status--online" style={{ marginBottom: 8 }}>
              <span className="studio-status-dot"></span>
              <span>Booth armed</span>
            </div>
            <p className="studio-card-desc" style={{ margin: 0 }}>
              Levels calibrated – you're one click away from recording.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="studio-section">
        <div className="studio-section-header">
          <h2 className="studio-section-title">
            <span className="studio-section-title-icon">🎙️</span>
            Record (Mic Booth)
          </h2>
          <p className="studio-section-desc">
            Capture raw vocals and hooks directly into the studio. Auto-arm tracks, loop sections, and punch-in fixes without losing the vibe.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <button className="studio-btn studio-btn--primary" onClick={() => onNavigate("record")}>
            Open Record Booth
          </button>
          <button className="studio-btn studio-btn--secondary">
            Load Last Session
          </button>
          <button className="studio-btn studio-btn--outline">
            Live take · Punch-in
          </button>
        </div>

        <div className="studio-chips">
          <span className="studio-chip studio-chip--active">Noise-gate & compressor</span>
          <span className="studio-chip studio-chip--active">Latency-safe monitoring</span>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="studio-grid studio-grid--3" style={{ marginBottom: 32 }}>
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">🎚️ Mix & Master</h3>
            <span className="studio-card-badge">AI</span>
          </div>
          <p className="studio-card-desc">
            Balance EQ, gain & reverb automatically. Get radio-ready masters in minutes.
          </p>
          <button className="studio-btn studio-btn--secondary" onClick={() => onNavigate("mix")}>
            Open Mix Rack
          </button>
        </div>

        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">🎹 Beat Store</h3>
            <span className="studio-card-badge">AI Engine</span>
          </div>
          <p className="studio-card-desc">
            Generate beats with AI prompts. Browse, license, and download instrumentals.
          </p>
          <button className="studio-btn studio-btn--secondary" onClick={() => onNavigate("beat-store")}>
            Enter Beat Lab
          </button>
        </div>

        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">📧 Export & Email</h3>
            <span className="studio-card-badge studio-card-badge--orange">Ready</span>
          </div>
          <p className="studio-card-desc">
            Bounce clean, explicit, TV and performance versions. Email to artists, DJs and PS TV.
          </p>
          <button className="studio-btn studio-btn--secondary" onClick={() => onNavigate("export-email")}>
            Export Session
          </button>
        </div>

        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">💰 Royalty Splits</h3>
          </div>
          <p className="studio-card-desc">
            Lock in percentages and let PowerPay route coins on every spin, stream and sale.
          </p>
          <button className="studio-btn studio-btn--secondary" onClick={() => onNavigate("royalty")}>
            Set Song Splits
          </button>
        </div>

        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">🌈 Visualizer</h3>
          </div>
          <p className="studio-card-desc">
            Render visuals and keep every version organized for shows and uploads.
          </p>
          <button className="studio-btn studio-btn--secondary" onClick={() => onNavigate("visualizer")}>
            Open Visualizer
          </button>
        </div>

        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">📚 Library</h3>
          </div>
          <p className="studio-card-desc">
            Your recordings, beats, mixes, and exports all in one place.
          </p>
          <button className="studio-btn studio-btn--secondary" onClick={() => onNavigate("library")}>
            Browse Library
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="studio-section">
          <div className="studio-section-header">
            <h2 className="studio-section-title">Recent Projects</h2>
          </div>
          <div className="studio-grid studio-grid--auto">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="studio-card"
                style={{ cursor: "pointer" }}
                onClick={() => onOpenProject(project)}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>
                  {project.type === "beat" ? "🎹" : project.type === "mix" ? "🎚️" : "🎙️"}
                </div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {project.projectName}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
                  <span style={{ textTransform: "capitalize" }}>{project.type}</span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        padding: "32px 0", 
        color: "#666", 
        fontSize: 13,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        marginTop: 32
      }}>
        Powered by PowerStream • Southern Power Syndicate • No Limit East Houston
      </div>
    </>
  );
}
