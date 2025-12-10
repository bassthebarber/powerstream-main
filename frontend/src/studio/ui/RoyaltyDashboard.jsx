// frontend/src/studio/ui/RoyaltyDashboard.jsx
// Royalty Works Dashboard for PowerStream Studio

import React, { useEffect, useState } from "react";
import { RoyaltyService } from "../services/RoyaltyService";
import "./RoyaltyDashboard.css";

export default function RoyaltyDashboard() {
  const [works, setWorks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [workDetails, setWorkDetails] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [worksResp, analyticsResp] = await Promise.all([
        RoyaltyService.listWorks(),
        RoyaltyService.getAnalytics(),
      ]);

      if (worksResp.success) {
        setWorks(worksResp.works);
      }

      if (analyticsResp.success) {
        setAnalytics(analyticsResp.analytics);
      }
    } catch (err) {
      console.error("[RoyaltyDashboard] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewWork = async (workId) => {
    try {
      const resp = await RoyaltyService.getWork(workId);
      if (resp.success) {
        setSelectedWork(workId);
        setWorkDetails(resp);
      }
    } catch (err) {
      console.error("[RoyaltyDashboard] Error loading work:", err);
    }
  };

  const handleCloseDetails = () => {
    setSelectedWork(null);
    setWorkDetails(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="royalty-dashboard loading">
        <p>Loading royalty data...</p>
      </div>
    );
  }

  return (
    <div className="royalty-dashboard">
      <div className="dashboard-header">
        <span className="dashboard-icon">📊</span>
        <h3>Royalty Dashboard</h3>
        <button className="refresh-btn" onClick={loadData}>🔄</button>
      </div>

      {error && <div className="dashboard-error">❌ {error}</div>}

      {/* Analytics Summary */}
      {analytics && (
        <div className="analytics-summary">
          <div className="stat-card">
            <span className="stat-value">{analytics.totalWorks}</span>
            <span className="stat-label">Works</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{analytics.totalStreams.toLocaleString()}</span>
            <span className="stat-label">Streams</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{analytics.totalWatchTimeFormatted}</span>
            <span className="stat-label">Watch Time</span>
          </div>
        </div>
      )}

      {/* Works Table */}
      <div className="works-table-container">
        <table className="works-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Streams</th>
              <th>Watch Time</th>
              <th>PROs</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {works.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  No royalty works registered yet. Export a track to get started!
                </td>
              </tr>
            ) : (
              works.map((w) => (
                <tr key={w._id} className={selectedWork === w._id ? "selected" : ""}>
                  <td className="title-cell">
                    <span className="work-title">{w.title}</span>
                    {w.genre && <span className="work-genre">{w.genre}</span>}
                  </td>
                  <td className="number-cell">{(w.totalStreams || 0).toLocaleString()}</td>
                  <td className="number-cell">{formatDuration(w.totalWatchTimeSeconds || 0)}</td>
                  <td className="pro-cell">
                    {(w.proAffiliations || []).map((pro, i) => (
                      <span key={i} className="pro-tag">{pro}</span>
                    ))}
                  </td>
                  <td>
                    <span className={`status-badge ${w.registrationStatus}`}>
                      {w.registrationStatus}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(w.createdAt)}</td>
                  <td>
                    <button className="view-btn" onClick={() => handleViewWork(w._id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Work Details Modal */}
      {workDetails && (
        <div className="work-details-modal">
          <div className="modal-backdrop" onClick={handleCloseDetails} />
          <div className="modal-content">
            <div className="modal-header">
              <h4>{workDetails.work.title}</h4>
              <button className="close-btn" onClick={handleCloseDetails}>✕</button>
            </div>

            <div className="modal-body">
              {/* Work Info */}
              <div className="detail-section">
                <h5>Track Info</h5>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">BPM</span>
                    <span className="value">{workDetails.work.bpm || "—"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Key</span>
                    <span className="value">{workDetails.work.key || "—"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Genre</span>
                    <span className="value">{workDetails.work.genre || "—"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration</span>
                    <span className="value">
                      {workDetails.work.durationSeconds
                        ? formatDuration(workDetails.work.durationSeconds)
                        : "—"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ISRC</span>
                    <span className="value">{workDetails.work.isrc || "Not assigned"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status</span>
                    <span className={`status-badge ${workDetails.work.registrationStatus}`}>
                      {workDetails.work.registrationStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {workDetails.stats && (
                <div className="detail-section">
                  <h5>Performance</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Total Plays</span>
                      <span className="value">{workDetails.stats.totalPlays}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Full Plays</span>
                      <span className="value">{workDetails.stats.fullPlays}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Unique Listeners</span>
                      <span className="value">{workDetails.stats.uniqueUsers}</span>
                    </div>
                  </div>

                  {/* Source Breakdown */}
                  {Object.keys(workDetails.stats.sourceBreakdown || {}).length > 0 && (
                    <div className="source-breakdown">
                      <span className="label">Play Sources:</span>
                      <div className="source-tags">
                        {Object.entries(workDetails.stats.sourceBreakdown).map(([source, count]) => (
                          <span key={source} className="source-tag">
                            {source}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Plays */}
              {workDetails.plays && workDetails.plays.length > 0 && (
                <div className="detail-section">
                  <h5>Recent Plays</h5>
                  <div className="plays-list">
                    {workDetails.plays.slice(0, 10).map((play) => (
                      <div key={play._id} className="play-item">
                        <span className="play-source">{play.source}</span>
                        <span className="play-duration">{play.durationSeconds}s</span>
                        <span className="play-date">{formatDate(play.createdAt)}</span>
                        {play.fullPlay && <span className="full-play-badge">Full</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Master URL */}
              {workDetails.work.masterUrl && (
                <a
                  href={workDetails.work.masterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-master-btn"
                >
                  🔗 Download Master
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



