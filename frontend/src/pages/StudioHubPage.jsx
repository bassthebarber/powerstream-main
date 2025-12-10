// AI Recording Studio Control Room - Integrated into main PowerStream app
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { studioClient } from "../lib/studioClient.js";
import { listSessions, loadSession } from "../lib/studioApi.js";

const CONTROL_ROOM_TILES = [
  {
    id: "record-booth",
    to: "/studio/record",
    icon: "🎙️",
    title: "Record Booth",
    desc: "AI Coach + Producer Mode",
    badge: "AI Coach",
    primary: true,
  },
  {
    id: "mix-rack",
    to: "/studio/mix",
    icon: "🎚️",
    title: "Mix & Master",
    desc: "Open Mix Rack",
    badge: "AI",
  },
  {
    id: "beat-lab",
    to: "/studio/beat",
    icon: "🎹",
    title: "AI Beat Room",
    desc: "Generate beats with AI",
    badge: "AI Engine",
  },
  {
    id: "beat-player",
    to: "/studio/player",
    icon: "🔊",
    title: "Beat Player",
    desc: "Play & sequence beats",
  },
  {
    id: "upload",
    to: "/studio/uploads",
    icon: "⬆️",
    title: "Upload Tracks",
    desc: "Cloud Library",
  },
  {
    id: "library",
    to: "/studio/library",
    icon: "📚",
    title: "Your Library",
    desc: "Recordings, Beats, Mixes",
  },
  {
    id: "royalty",
    to: "/studio/royalty",
    icon: "💰",
    title: "Royalty Splits",
    desc: "Revenue Distribution",
  },
  {
    id: "visualizer",
    to: "/studio/visualizer",
    icon: "🌈",
    title: "Visualizer & Library",
    desc: "Audio Visualization",
  },
  {
    id: "export",
    to: "/studio/export",
    icon: "📧",
    title: "Export & Email",
    desc: "Share your work",
  },
  {
    id: "beat-store",
    to: "/studio/beats",
    icon: "🎵",
    title: "Beat Store",
    desc: "Browse & license beats",
  },
  {
    id: "settings",
    to: "/studio/settings",
    icon: "⚙️",
    title: "Settings",
    desc: "Studio preferences",
  },
];

export default function StudioHubPage() {
  const navigate = useNavigate();
  const [studioStatus, setStudioStatus] = useState("checking");
  const [recentProjects, setRecentProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await studioClient.getStudioHealth();
      if (cancelled) return;
      setStudioStatus(result.success ? "online" : "offline");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = async () => {
    try {
      setLoadingProjects(true);
      const result = await listSessions({ limit: 10 });
      if (result?.ok && Array.isArray(result.sessions)) {
        setRecentProjects(result.sessions);
      }
    } catch (err) {
      console.error("Error loading recent projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleOpenProject = async (session) => {
    try {
      const result = await loadSession(session.id);
      if (result?.ok && result.session) {
        // Navigate to appropriate studio page based on type
        const typeToRoute = {
          beat: "/studio/beat",
          mix: "/studio/mix",
          recording: "/studio/record",
          vocal: "/studio/record",
          full: "/studio",
        };
        const route = typeToRoute[session.type] || "/studio";
        navigate(route, { state: { session: result.session } });
      }
    } catch (err) {
      console.error("Error loading session:", err);
      alert("Failed to load project");
    }
  };

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
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "40px",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <h1 style={{ 
            fontSize: "48px", 
            fontWeight: 900,
            background: "linear-gradient(90deg, #f5b301, #ffda5c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px"
          }}>
            AI Recording Studio Control Room
          </h1>
          <p style={{ color: "#888", fontSize: "18px" }}>
            Southern Power Syndicate · No Limit East Houston
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{
            padding: "8px 16px",
            background: studioStatus === "online" ? "rgba(0,200,100,0.15)" : "rgba(255,68,85,0.15)",
            color: studioStatus === "online" ? "#00c864" : "#ff4455",
            border: `1px solid ${studioStatus === "online" ? "rgba(0,200,100,0.3)" : "rgba(255,68,85,0.3)"}`,
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600
          }}>
            {studioStatus === "online" ? "🟢 Studio Online" : "🔴 Studio Offline"}
          </span>
          <span style={{
            padding: "8px 16px",
            background: "rgba(245, 179, 1, 0.15)",
            color: "#f5b301",
            border: "1px solid rgba(245, 179, 1, 0.3)",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600
          }}>
            PowerPay Ready
          </span>
        </div>
      </div>

      {/* Recent Projects Section */}
      {recentProjects.length > 0 && (
        <div style={{ marginBottom: "40px", maxWidth: "1400px", margin: "0 auto 40px" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "20px",
            color: "#fff"
          }}>
            Recent Projects
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenProject(project)}
                style={{
                  background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(245, 179, 1, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <div style={{
                  fontSize: "32px",
                  marginBottom: "12px"
                }}>
                  {project.type === "beat" ? "🎹" : project.type === "mix" ? "🎚️" : project.type === "recording" ? "🎙️" : "🎵"}
                </div>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "4px",
                  color: "#fff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {project.projectName}
                </h3>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px"
                }}>
                  <span style={{
                    fontSize: "11px",
                    color: "#888",
                    textTransform: "capitalize"
                  }}>
                    {project.type}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    color: "#888"
                  }}>
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Room Tiles Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {CONTROL_ROOM_TILES.map((tile) => (
          <div
            key={tile.id}
            onClick={() => {
              navigate(tile.to);
            }}
            style={{
              background: tile.primary
                ? "linear-gradient(135deg, rgba(230,184,0,0.2) 0%, rgba(0,0,0,0.5) 100%)"
                : "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
              border: tile.primary
                ? "2px solid #f5b301"
                : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "32px",
              cursor: "pointer",
              transition: "all 0.3s",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(245, 179, 1, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {tile.badge && (
              <span style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                padding: "4px 12px",
                background: "#f5b301",
                color: "#000",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700
              }}>
                {tile.badge}
              </span>
            )}
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{tile.icon}</div>
            <h3 style={{ 
              fontSize: "24px", 
              fontWeight: 700, 
              marginBottom: "8px",
              color: "#fff"
            }}>
              {tile.title}
            </h3>
            <p style={{ color: "#888", fontSize: "14px" }}>{tile.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
