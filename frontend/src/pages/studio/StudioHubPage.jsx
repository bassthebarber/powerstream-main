// frontend/src/pages/studio/StudioHubPage.jsx
// Studio Hub - Main landing page for all studio features
// No Limit East Houston - PowerStream Recording Studio

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studioApi from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

export default function StudioHubPage() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [healthRes, statsRes, sessionsRes] = await Promise.allSettled([
        studioApi.checkStudioHealth(),
        studioApi.getLibraryStats(),
        studioApi.listSessions(null, 5),
      ]);

      if (healthRes.status === "fulfilled") setHealth(healthRes.value);
      if (statsRes.status === "fulfilled" && statsRes.value?.ok) setStats(statsRes.value.stats);
      if (sessionsRes.status === "fulfilled" && sessionsRes.value?.ok) setRecentSessions(sessionsRes.value.sessions || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const studioModules = [
    {
      id: "record",
      title: "Record Booth",
      icon: "🎙️",
      description: "Professional vocal recording with real-time effects",
      path: "/studio/record",
      color: "#ff4444",
      badge: "Pro",
    },
    {
      id: "beats",
      title: "Beat Store",
      icon: "🎹",
      description: "Browse, preview, and use beats for your sessions",
      path: "/studio/beats",
      color: "#ffb84d",
      badge: stats?.beats ? `${stats.beats} beats` : null,
    },
    {
      id: "ai-beat",
      title: "AI Beat Generator",
      icon: "🤖",
      description: "Generate custom beats with AI in any style",
      path: "/studio/ai-beat",
      color: "#00c864",
      badge: "AI",
    },
    {
      id: "library",
      title: "Library",
      icon: "📚",
      description: "Your recordings, mixes, and masters",
      path: "/studio/library",
      color: "#4dabf7",
      badge: stats?.total ? `${stats.total} items` : null,
    },
    {
      id: "mix",
      title: "Mix Console",
      icon: "🎚️",
      description: "Professional mixing with EQ, compression, effects",
      path: "/studio/mix",
      color: "#9775fa",
    },
    {
      id: "master",
      title: "Mastering Suite",
      icon: "💿",
      description: "Master your tracks for streaming platforms",
      path: "/studio/master",
      color: "#f783ac",
      badge: "Pro",
    },
    {
      id: "live-room",
      title: "Live Room",
      icon: "🔴",
      description: "Real-time collab recording sessions",
      path: "/studio/live-room",
      color: "#ff6b6b",
      badge: "Live",
    },
    {
      id: "export",
      title: "Export Center",
      icon: "💾",
      description: "Export stems, masters, and distribute",
      path: "/studio/export",
      color: "#69db7c",
    },
    {
      id: "royalty",
      title: "Royalty Splits",
      icon: "💰",
      description: "Manage ownership and revenue sharing",
      path: "/studio/royalty",
      color: "#ffd43b",
    },
    {
      id: "tv-export",
      title: "TV Distribution",
      icon: "📺",
      description: "Export content to TV stations",
      path: "/studio/tv-export",
      color: "#339af0",
    },
    {
      id: "voice",
      title: "Voice Clone",
      icon: "🗣️",
      description: "AI voice synthesis and cloning",
      path: "/studio/voice",
      color: "#be4bdb",
      badge: "AI",
    },
    {
      id: "settings",
      title: "Settings",
      icon: "⚙️",
      description: "Studio preferences and configuration",
      path: "/studio/settings",
      color: "#868e96",
    },
  ];

  return (
    <div className="studio-hub-page">
      {/* Header */}
      <header className="studio-hub-header">
        <div className="studio-hub-branding">
          <div className="studio-hub-logo">🎵</div>
          <div>
            <h1 className="studio-hub-title">Recording Studio</h1>
            <p className="studio-hub-subtitle">No Limit East Houston • PowerStream Audio Engine</p>
          </div>
        </div>
        
        <div className="studio-hub-status">
          {health?.ok ? (
            <span className="status-badge status-badge--online">
              <span className="status-dot" />
              Studio Online
            </span>
          ) : loading ? (
            <span className="status-badge status-badge--loading">
              <span className="status-dot status-dot--loading" />
              Connecting...
            </span>
          ) : (
            <span className="status-badge status-badge--offline">
              <span className="status-dot status-dot--offline" />
              Limited Mode
            </span>
          )}
        </div>
      </header>

      {/* Quick Actions */}
      <section className="studio-hub-quick">
        <Link to="/studio/record" className="studio-quick-btn studio-quick-btn--primary">
          <span className="quick-icon">⏺️</span>
          <span>Start Recording</span>
        </Link>
        <Link to="/studio/ai-beat" className="studio-quick-btn">
          <span className="quick-icon">🤖</span>
          <span>Generate Beat</span>
        </Link>
        <Link to="/studio/live-room" className="studio-quick-btn">
          <span className="quick-icon">🔴</span>
          <span>Live Session</span>
        </Link>
        <Link to="/studio/library" className="studio-quick-btn">
          <span className="quick-icon">📚</span>
          <span>My Library</span>
        </Link>
      </section>

      {/* Stats Row */}
      {stats && (
        <section className="studio-hub-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.recordings || 0}</span>
            <span className="stat-label">Recordings</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.beats || 0}</span>
            <span className="stat-label">Beats</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.mixes || 0}</span>
            <span className="stat-label">Mixes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total || 0}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </section>
      )}

      {/* Module Grid */}
      <section className="studio-hub-modules">
        <h2 className="section-title">Studio Modules</h2>
        <div className="module-grid">
          {studioModules.map((module) => (
            <Link
              key={module.id}
              to={module.path}
              className="module-card"
              style={{ "--module-color": module.color }}
            >
              <div className="module-icon">{module.icon}</div>
              <div className="module-info">
                <h3 className="module-title">{module.title}</h3>
                <p className="module-desc">{module.description}</p>
              </div>
              {module.badge && (
                <span className="module-badge">{module.badge}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <section className="studio-hub-recent">
          <h2 className="section-title">Recent Sessions</h2>
          <div className="session-list">
            {recentSessions.map((session) => (
              <Link
                key={session.id}
                to={`/studio/session/${session.id}`}
                className="session-card"
              >
                <div className="session-icon">
                  {session.type === "recording" ? "🎙️" : session.type === "beat" ? "🎹" : "📁"}
                </div>
                <div className="session-info">
                  <span className="session-name">{session.projectName}</span>
                  <span className="session-date">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="session-type">{session.type}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="studio-hub-footer">
        <div className="footer-info">
          <span>🎚️ 44.1kHz / 24-bit</span>
          <span>•</span>
          <span>📡 Cloud Connected</span>
          <span>•</span>
          <span>Powered by PowerStream Audio Engine</span>
        </div>
      </footer>

      <style>{`
        .studio-hub-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%);
          padding: 24px;
        }

        .studio-hub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .studio-hub-branding {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .studio-hub-logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #ffb84d, #ff8c00);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          box-shadow: 0 8px 32px rgba(255, 184, 77, 0.3);
        }

        .studio-hub-title {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(90deg, #fff, #ffb84d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .studio-hub-subtitle {
          color: #888;
          margin: 4px 0 0;
          font-size: 0.9rem;
        }

        .studio-hub-status {
          display: flex;
          align-items: center;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-badge--online {
          background: rgba(0, 200, 100, 0.15);
          color: #00c864;
        }

        .status-badge--offline {
          background: rgba(255, 100, 100, 0.15);
          color: #ff6464;
        }

        .status-badge--loading {
          background: rgba(255, 184, 77, 0.15);
          color: #ffb84d;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00c864;
          animation: pulse 2s infinite;
        }

        .status-dot--offline {
          background: #ff6464;
          animation: none;
        }

        .status-dot--loading {
          background: #ffb84d;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }

        .studio-hub-quick {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .studio-quick-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }

        .studio-quick-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .studio-quick-btn--primary {
          background: linear-gradient(135deg, #ff4444, #cc0000);
          border: none;
        }

        .studio-quick-btn--primary:hover {
          box-shadow: 0 8px 24px rgba(255, 68, 68, 0.4);
        }

        .quick-icon {
          font-size: 1.2rem;
        }

        .studio-hub-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 900;
          color: #ffb84d;
        }

        .stat-label {
          display: block;
          color: #888;
          font-size: 0.85rem;
          margin-top: 4px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 16px;
        }

        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .module-card {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .module-card:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
          border-color: var(--module-color, rgba(255, 184, 77, 0.3));
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }

        .module-icon {
          width: 48px;
          height: 48px;
          background: var(--module-color, #ffb84d);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .module-info {
          flex: 1;
          min-width: 0;
        }

        .module-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 4px;
        }

        .module-desc {
          font-size: 0.85rem;
          color: #888;
          margin: 0;
          line-height: 1.4;
        }

        .module-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: rgba(255, 184, 77, 0.2);
          color: #ffb84d;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .studio-hub-recent {
          margin-bottom: 32px;
        }

        .session-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .session-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .session-card:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .session-icon {
          font-size: 1.5rem;
        }

        .session-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .session-name {
          color: #fff;
          font-weight: 600;
        }

        .session-date {
          color: #666;
          font-size: 0.8rem;
        }

        .session-type {
          color: #888;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .studio-hub-footer {
          text-align: center;
          padding: 24px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .footer-info {
          display: flex;
          justify-content: center;
          gap: 12px;
          color: #666;
          font-size: 0.85rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .studio-hub-page {
            padding: 16px;
          }

          .studio-hub-title {
            font-size: 1.5rem;
          }

          .module-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

