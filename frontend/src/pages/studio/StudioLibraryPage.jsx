// frontend/src/pages/studio/StudioLibraryPage.jsx
// Library - Project Management Interface
import React, { useState, useEffect } from "react";
import { getLibrary } from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

const FILTERS = [
  { id: "all", label: "All", icon: "📁" },
  { id: "beats", label: "Beats", icon: "🎹" },
  { id: "recordings", label: "Recordings", icon: "🎙️" },
  { id: "songs", label: "Songs", icon: "🎵" },
  { id: "masters", label: "Masters", icon: "💿" },
];

export default function StudioLibraryPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLibrary();
  }, [filter]);

  const fetchLibrary = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getLibrary({
        type: filter === "all" ? undefined : filter === "masters" ? "mixdown" : filter,
        limit: 50,
      });
      if (result.ok) {
        setProjects(result.items || []);
      } else {
        setError(result.message || "Failed to load library");
      }
    } catch (err) {
      setError("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    !searchTerm || 
    (p.name || p.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    const icons = {
      beat: "🎹",
      recording: "🎙️",
      vocal: "🎤",
      song: "🎵",
      mix: "🎚️",
      mixdown: "💿",
      master: "💿",
    };
    return icons[type] || "📁";
  };

  const getTypeColor = (type) => {
    const colors = {
      beat: "rgba(255,184,77,0.2)",
      recording: "rgba(255,77,148,0.2)",
      vocal: "rgba(148,77,255,0.2)",
      song: "rgba(77,148,255,0.2)",
      mix: "rgba(77,255,148,0.2)",
      mixdown: "rgba(255,255,77,0.2)",
      master: "rgba(255,255,77,0.2)",
    };
    return colors[type] || "rgba(255,255,255,0.1)";
  };

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">📚 Library</h1>
        <p className="studio-header-subtitle">
          All your projects, beats, and recordings in one place
        </p>
      </div>

      {/* Toolbar */}
      <div className="studio-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              className="studio-input"
              placeholder="🔍 Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`studio-chip ${filter === f.id ? "studio-chip--active" : ""}`}
              >
                <span style={{ marginRight: 4 }}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 4 }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "8px 12px",
                background: viewMode === "grid" ? "rgba(255,184,77,0.2)" : "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: viewMode === "grid" ? "#ffb84d" : "#888"
              }}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "8px 12px",
                background: viewMode === "list" ? "rgba(255,184,77,0.2)" : "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                color: viewMode === "list" ? "#ffb84d" : "#888"
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="studio-loading">
          <div className="studio-spinner"></div>
          <span>Loading library...</span>
        </div>
      ) : error ? (
        <div className="studio-card">
          <div className="studio-alert studio-alert--error">
            <span>⚠️ {error}</span>
            <button className="studio-btn studio-btn--outline" onClick={fetchLibrary}>Retry</button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="studio-card">
          <div className="studio-empty">
            <div className="studio-empty-icon">📁</div>
            <p className="studio-empty-title">
              {searchTerm ? "No matching projects" : "No projects yet"}
            </p>
            <p className="studio-empty-desc">
              {searchTerm 
                ? "Try a different search term" 
                : "Create beats, record tracks, or upload files to see them here."}
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16
        }}>
          {filteredProjects.map((project) => (
            <div 
              key={project._id || project.id} 
              className="studio-card"
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
            >
              {/* Thumbnail */}
              <div style={{
                height: 120,
                background: getTypeColor(project.type),
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                fontSize: 48
              }}>
                {getTypeIcon(project.type)}
              </div>

              {/* Info */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
                  {project.name || project.title || "Untitled"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
                  <span style={{ textTransform: "capitalize" }}>{project.type}</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>

              {/* Audio Preview */}
              {project.url && (
                <audio 
                  controls 
                  src={project.url} 
                  style={{ width: "100%", height: 32, marginBottom: 12 }} 
                />
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="studio-btn studio-btn--secondary" style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}>
                  Open
                </button>
                <button className="studio-btn studio-btn--outline" style={{ padding: "8px 12px", fontSize: 12 }}>
                  ⋯
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="studio-card">
          <div className="studio-file-list">
            {filteredProjects.map((project) => (
              <div key={project._id || project.id} className="studio-file-item">
                <div className="studio-file-info">
                  <span style={{
                    width: 44,
                    height: 44,
                    background: getTypeColor(project.type),
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20
                  }}>
                    {getTypeIcon(project.type)}
                  </span>
                  <div>
                    <div className="studio-file-name">
                      {project.name || project.title || "Untitled"}
                    </div>
                    <div className="studio-file-size" style={{ textTransform: "capitalize" }}>
                      {project.type} • {formatDate(project.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {project.url && (
                    <button className="studio-btn studio-btn--outline" style={{ padding: "6px 12px", fontSize: 12 }}>
                      ▶ Play
                    </button>
                  )}
                  <button className="studio-btn studio-btn--secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                    Open in Studio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: "24px 0", 
          color: "#666", 
          fontSize: 13 
        }}>
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      )}
    </div>
  );
}
