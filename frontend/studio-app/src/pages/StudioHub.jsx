// frontend/studio-app/src/pages/StudioHub.jsx
// CONTROL ROOM ROOT for PowerHarmony Studio Dashboard
// This is the main dashboard with tiles for all studio modules
// IMPORTANT: Do not change visual design, colors, or layout - only navigation logic

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/studio.css";
import { STUDIO_HEALTH, ENV_INFO } from "../config/api.js";
import { generateQuickBeat, generateBeat } from "../lib/studioApi.js";

// Control Room Tiles Configuration - wired to exact routes per user request
const CONTROL_ROOM_TILES = [
  // Record Booth
  {
    id: "record-booth",
    to: "/recordboot",
    icon: "🎙️",
    title: "Record Booth",
    desc: "AI Coach + Producer Mode",
    actionText: "Open Record Booth",
    secondaryAction: { text: "View Takes", to: "/recordboot" },
    badge: "AI Coach",
    primary: true,
    gradient: "linear-gradient(135deg, rgba(230,184,0,0.2) 0%, rgba(0,0,0,0.5) 100%)",
  },
  // Mix & Master
  {
    id: "mix-rack",
    to: "/mix",
    icon: "🎚️",
    title: "Mix & Master",
    desc: "Open Mix Rack",
    actionText: "Open Mix Rack",
    secondaryAction: { text: "Compare Before / After", to: "/mix" },
    badge: "AI",
  },
  // AI Beat Lab
  {
    id: "beat-lab",
    to: "/beat-lab",
    icon: "🎹",
    title: "AI Beat Room",
    desc: "Generate beats with AI",
    actionText: "Generate Test Beat",
    secondaryAction: { text: "Generate New Beat", to: "/beat-lab" },
    badge: "AI Engine",
  },
  // Beat Player
  {
    id: "beat-player",
    to: "/player",
    icon: "🔊",
    title: "Beat Player",
    desc: "Play & sequence beats",
    actionText: "Open Beat Player",
  },
  // Upload Tracks
  {
    id: "upload",
    to: "/upload",
    icon: "⬆️",
    title: "Upload Tracks",
    desc: "Cloud Library",
    actionText: "Open Upload Panel",
  },
  // Library
  {
    id: "library",
    to: "/library",
    icon: "📚",
    title: "Your Library",
    desc: "Recordings, Beats, Mixes",
    actionText: "View Library",
  },
  // Royalty Splits
  {
    id: "royalty",
    to: "/royalty",
    icon: "💰",
    title: "Royalty Splits",
    desc: "Revenue Distribution",
    actionText: "Set Song Splits",
    secondaryAction: { text: "View Statements", to: "/royalty" },
  },
  // Visualizer
  {
    id: "visualizer",
    to: "/visualizer",
    icon: "🌈",
    title: "Visualizer & Library",
    desc: "Audio Visualization",
    actionText: "Open Visualizer",
  },
  // Export & Email
  {
    id: "export",
    to: "/export",
    icon: "📧",
    title: "Export & Email",
    desc: "Share your work",
    actionText: "Export Session",
  },
  // Beat Store
  {
    id: "beat-store",
    to: "/beats",
    icon: "🎵",
    title: "Beat Store",
    desc: "Browse & license beats",
    actionText: "Browse Beats",
  },
  // Settings
  {
    id: "settings",
    to: "/settings",
    icon: "⚙️",
    title: "Settings",
    desc: "Studio preferences",
    actionText: "Open Settings",
  },
  // Coach Admin
  {
    id: "coach-admin",
    to: "/coach-admin",
    icon: "🎤",
    title: "Coach Admin",
    desc: "Manage AI Personas",
    actionText: "Manage Coaches",
    badge: "Admin",
  },
  // AI Voice Studio
  {
    id: "voice-studio",
    to: "/voice-studio",
    icon: "🗣️",
    title: "AI Voice Studio",
    desc: "Create your AI voice",
    actionText: "Open Voice Studio",
    secondaryAction: { text: "Generate with My Voice", to: "/voice-studio" },
    badge: "AI Clone",
    primary: true,
    gradient: "linear-gradient(135deg, rgba(156,39,176,0.2) 0%, rgba(0,0,0,0.5) 100%)",
  },
  // TV Streaming Export
  {
    id: "tv-exports",
    to: "/tv-exports",
    icon: "📺",
    title: "TV Streaming",
    desc: "Send to PowerStream TV",
    actionText: "View TV Exports",
    secondaryAction: { text: "Export to Station", to: "/library" },
    badge: "Stream",
    gradient: "linear-gradient(135deg, rgba(0,150,200,0.2) 0%, rgba(0,0,0,0.5) 100%)",
  },
  // Producer Admin
  {
    id: "producer-admin",
    to: "/admin/producers",
    icon: "👥",
    title: "Producer Admin",
    desc: "Manage Producers & Stats",
    actionText: "Open Producer Dashboard",
    badge: "Admin",
    gradient: "linear-gradient(135deg, rgba(156,39,176,0.2) 0%, rgba(0,0,0,0.5) 100%)",
  },
];

export default function StudioHub() {
  const navigate = useNavigate();
  const [studioStatus, setStudioStatus] = useState("checking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBeat, setGeneratedBeat] = useState(null);
  const [genError, setGenError] = useState(null);

  // Check studio health on mount using VITE_STUDIO_API_BASE
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(STUDIO_HEALTH, { method: "GET" });
        if (res.ok) {
          setStudioStatus("online");
        } else {
          setStudioStatus("offline");
        }
      } catch {
        setStudioStatus("offline");
      }
    }
    checkHealth();
  }, []);

  // Handle AI Beat Generation from dashboard
  const handleGenerateTestBeat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGenError(null);
    setGeneratedBeat(null);

    try {
      console.log("🎹 [StudioHub] Generating test beat...");
      const result = await generateQuickBeat("trap");
      
      if (result.ok) {
        console.log("✅ [StudioHub] Beat generated:", result);
        setGeneratedBeat(result);
        
        // Navigate to beat lab with the generated beat
        setTimeout(() => {
          navigate("/beat-lab", { 
            state: { 
              beat: {
                id: result.beatId,
                name: result.name,
                bpm: result.bpm,
                key: result.key,
                mood: result.mood,
                style: result.style,
                audioUrl: result.audioUrl,
                pattern: result.pattern,
              }
            }
          });
        }, 500);
      } else {
        throw new Error(result.message || "Generation failed");
      }
    } catch (err) {
      console.error("❌ [StudioHub] Beat generation error:", err);
      setGenError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Generate New Beat (full options)
  const handleGenerateNewBeat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to beat lab for full generation options
    navigate("/beat-lab");
  };

  // Handle tile click - uses useNavigate for client-side routing
  const handleTileClick = (tile, e) => {
    // Prevent navigation if clicking the secondary action button
    if (e.target.classList.contains("secondary-action")) {
      return;
    }
    navigate(tile.to);
  };

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">AI Recording Studio Control Room</h1>
          <p className="studio-subtitle">Southern Power Syndicate · No Limit East Houston</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span 
            className="studio-badge" 
            style={{ 
              background: studioStatus === "online" 
                ? "rgba(0,200,100,0.15)" 
                : "rgba(255,68,85,0.15)",
              color: studioStatus === "online" ? "#00c864" : "#ff4455",
              border: `1px solid ${studioStatus === "online" ? "rgba(0,200,100,0.3)" : "rgba(255,68,85,0.3)"}`,
            }}
          >
            {studioStatus === "checking" ? "⏳ Checking..." : 
             studioStatus === "online" ? "🟢 Studio Online" : "🔴 Studio Offline"}
          </span>
          <div className="studio-badge">PowerPay Ready</div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div 
        className="studio-panel" 
        style={{ 
          marginBottom: 24,
          background: "linear-gradient(135deg, rgba(230,184,0,0.06) 0%, rgba(0,0,0,0.3) 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: "2.5rem" }}>🎤</div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 700 }}>
              Welcome to the Control Room
            </h2>
            <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
              Record • Mix • Master • Distribute — All AI-Powered
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link 
            to="/recordboot" 
            className="studio-btn studio-btn--gold"
            style={{ textDecoration: "none" }}
          >
            🎙️ Start Recording
          </Link>
          <Link 
            to="/beat-lab" 
            className="studio-btn"
            style={{ textDecoration: "none" }}
          >
            🎹 Generate Beat
          </Link>
        </div>
      </div>

      {/* Beat Generation Status Banner */}
      {(isGenerating || generatedBeat || genError) && (
        <div 
          className="studio-panel"
          style={{
            marginBottom: 24,
            background: genError 
              ? "linear-gradient(135deg, rgba(255,68,85,0.1) 0%, rgba(0,0,0,0.3) 100%)"
              : generatedBeat
              ? "linear-gradient(135deg, rgba(0,200,100,0.1) 0%, rgba(0,0,0,0.3) 100%)"
              : "linear-gradient(135deg, rgba(230,184,0,0.1) 0%, rgba(0,0,0,0.3) 100%)",
            borderColor: genError ? "rgba(255,68,85,0.3)" : generatedBeat ? "rgba(0,200,100,0.3)" : "rgba(230,184,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.8rem" }}>
              {isGenerating ? "⏳" : genError ? "❌" : "✅"}
            </span>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700 }}>
                {isGenerating ? "Generating Beat..." : genError ? "Generation Failed" : "Beat Ready!"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#888" }}>
                {isGenerating 
                  ? "AI is creating your beat, please wait..."
                  : genError 
                  ? genError
                  : `${generatedBeat?.name || 'New Beat'} - ${generatedBeat?.bpm}bpm`}
              </p>
            </div>
          </div>
          {generatedBeat && (
            <div style={{ display: "flex", gap: 10 }}>
              {generatedBeat.audioUrl && (
                <audio controls src={generatedBeat.audioUrl} style={{ height: 36 }} />
              )}
              <button 
                className="studio-btn studio-btn--sm studio-btn--gold"
                onClick={() => navigate("/beat-lab", { state: { beat: generatedBeat }})}
              >
                Open in Beat Lab
              </button>
              <button 
                className="studio-btn studio-btn--sm"
                onClick={() => setGeneratedBeat(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          {genError && (
            <button 
              className="studio-btn studio-btn--sm"
              onClick={() => setGenError(null)}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Control Room Tiles Grid */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: 20 
        }}
      >
        {CONTROL_ROOM_TILES.map(tile => (
          <div
            key={tile.id}
            className="studio-card"
            onClick={(e) => handleTileClick(tile, e)}
            style={{
              cursor: "pointer",
              background: tile.gradient || tile.primary 
                ? "linear-gradient(135deg, rgba(230,184,0,0.12) 0%, rgba(0,0,0,0.4) 100%)"
                : undefined,
              borderColor: tile.primary ? "rgba(230,184,0,0.3)" : undefined,
              padding: 24,
              position: "relative",
              overflow: "hidden",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Badge */}
            {tile.badge && (
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: tile.badge.includes("AI") 
                    ? "rgba(230,184,0,0.2)" 
                    : "rgba(68,136,255,0.2)",
                  color: tile.badge.includes("AI") ? "#e6b800" : "#4488ff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {tile.badge}
              </span>
            )}

            {/* Tile Header */}
            <div>
              <div style={{ fontSize: "2.2rem", marginBottom: 14 }}>{tile.icon}</div>
              <h3 style={{ 
                margin: "0 0 6px", 
                fontSize: "1.1rem", 
                fontWeight: 700, 
                color: "#f4f4f7" 
              }}>
                {tile.title}
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#888" }}>
                {tile.desc}
              </p>
            </div>

            {/* Action Buttons - Special handling for AI Beat Lab */}
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {tile.id === "beat-lab" ? (
                // AI Beat Lab - wire to actual generation
                <>
                  <button
                    className={`studio-btn studio-btn--sm studio-btn--gold ${isGenerating ? 'studio-btn--loading' : ''}`}
                    onClick={handleGenerateTestBeat}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "⏳ Generating..." : "✨ Generate Test Beat"}
                  </button>
                  <button
                    className="studio-btn studio-btn--sm secondary-action"
                    onClick={handleGenerateNewBeat}
                  >
                    🎹 Generate New Beat
                  </button>
                </>
              ) : (
                // Standard tiles - use Link navigation
                <>
                  <Link
                    to={tile.to}
                    className="studio-btn studio-btn--sm studio-btn--gold"
                    style={{ textDecoration: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tile.actionText}
                  </Link>
                  {tile.secondaryAction && (
                    <Link
                      to={tile.secondaryAction.to}
                      className="studio-btn studio-btn--sm secondary-action"
                      style={{ textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tile.secondaryAction.text}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div 
        style={{ 
          marginTop: 32, 
          padding: 20,
          background: "rgba(0,0,0,0.3)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ color: "#555", fontSize: "0.85rem" }}>
          <p style={{ margin: 0 }}>PowerHarmony AI Recording Studio · Black & Gold Edition</p>
          <p style={{ margin: "4px 0 0", opacity: 0.7 }}>
            © {new Date().getFullYear()} Southern Power Syndicate · No Limit East Houston
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ 
            padding: "4px 10px", 
            borderRadius: 999, 
            background: "rgba(230,184,0,0.1)",
            color: "#e6b800",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}>
            v{ENV_INFO.version}
          </span>
          <span style={{ 
            padding: "4px 10px", 
            borderRadius: 999, 
            background: "rgba(68,136,255,0.1)",
            color: "#4488ff",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}>
            {ENV_INFO.environment}
          </span>
        </div>
      </div>
    </div>
  );
}
