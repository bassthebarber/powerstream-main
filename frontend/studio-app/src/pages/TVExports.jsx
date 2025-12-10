// frontend/studio-app/src/pages/TVExports.jsx
// TV Exports Status Page - View and manage TV streaming exports

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studio.css";
import { TV_EXPORT_API } from "../config/api.js";

export default function TVExports() {
  const navigate = useNavigate();
  
  const [exports, setExports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  
  // Available stations
  const [stations, setStations] = useState([]);
  
  // Refresh interval
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchExports();
    fetchStats();
    fetchStations();
  }, [statusFilter, stationFilter]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchExports();
        fetchStats();
      }, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, statusFilter, stationFilter]);

  async function fetchExports() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (stationFilter) params.append("station", stationFilter);
      params.append("limit", "50");
      
      const res = await fetch(`${TV_EXPORT_API}/exports?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setExports(data.exports || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${TV_EXPORT_API}/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }

  async function fetchStations() {
    try {
      const res = await fetch(`${TV_EXPORT_API}/stations`);
      const data = await res.json();
      if (data.success) {
        setStations(data.stations || []);
      }
    } catch (err) {
      console.error("Failed to fetch stations:", err);
    }
  }

  async function handleRetry(exportId) {
    try {
      const res = await fetch(`${TV_EXPORT_API}/exports/${exportId}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (data.success) {
        fetchExports();
        fetchStats();
      } else {
        alert(data.message || "Retry failed");
      }
    } catch (err) {
      alert("Retry failed: " + err.message);
    }
  }

  async function handleCancel(exportId) {
    if (!confirm("Are you sure you want to cancel this export?")) return;
    
    try {
      const res = await fetch(`${TV_EXPORT_API}/exports/${exportId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (data.success) {
        fetchExports();
        fetchStats();
      } else {
        alert(data.message || "Cancel failed");
      }
    } catch (err) {
      alert("Cancel failed: " + err.message);
    }
  }

  // Format date
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Get status badge style
  function getStatusStyle(status) {
    const styles = {
      queued: { bg: "rgba(33, 150, 243, 0.15)", color: "#2196F3" },
      processing: { bg: "rgba(255, 193, 7, 0.15)", color: "#FFC107" },
      sent: { bg: "rgba(76, 175, 80, 0.15)", color: "#4CAF50" },
      confirmed: { bg: "rgba(0, 200, 100, 0.15)", color: "#00c864" },
      error: { bg: "rgba(244, 67, 54, 0.15)", color: "#F44336" },
      cancelled: { bg: "rgba(158, 158, 158, 0.15)", color: "#9E9E9E" },
    };
    return styles[status] || styles.queued;
  }

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <button 
            className="studio-back-btn" 
            onClick={() => navigate("/studio")}
            style={{ marginBottom: "0.5rem" }}
          >
            ← Back to Control Room
          </button>
          <h1 className="studio-title">📺 TV Exports</h1>
          <p className="studio-subtitle">PowerStream TV · Export Status Dashboard</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button 
            className="studio-btn studio-btn--outline"
            onClick={() => { fetchExports(); fetchStats(); }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="studio-grid" style={{ 
          gridTemplateColumns: "repeat(4, 1fr)", 
          gap: "1rem", 
          marginBottom: "1.5rem" 
        }}>
          <div className="studio-card" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#e6b800" }}>
              {stats.total}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Total Exports</div>
          </div>
          <div className="studio-card" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2196F3" }}>
              {stats.queued}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Queued</div>
          </div>
          <div className="studio-card" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#4CAF50" }}>
              {stats.sent}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Sent</div>
          </div>
          <div className="studio-card" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#F44336" }}>
              {stats.errors}
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Errors</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="studio-panel" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", opacity: 0.7 }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="studio-select"
              style={{ minWidth: "150px" }}
            >
              <option value="">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="error">Error</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", opacity: 0.7 }}>
              Station
            </label>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="studio-select"
              style={{ minWidth: "200px" }}
            >
              <option value="">All Stations</option>
              {stations.map(station => (
                <option key={station.id || station.name} value={station.name}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              className="studio-btn studio-btn--gold"
              onClick={() => navigate("/library")}
            >
              + New Export
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="studio-status studio-status--error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Exports Table */}
      <div className="studio-panel">
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
            Loading exports...
          </div>
        ) : exports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📺</div>
            <div style={{ marginBottom: "1rem" }}>No TV exports found.</div>
            <button
              className="studio-btn studio-btn--gold"
              onClick={() => navigate("/library")}
            >
              Create First Export
            </button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Asset</th>
                <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Station</th>
                <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Type</th>
                <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Status</th>
                <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Date</th>
                <th style={{ textAlign: "right", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exports.map((exp) => {
                const statusStyle = getStatusStyle(exp.status);
                return (
                  <tr 
                    key={exp._id} 
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ fontWeight: 500 }}>{exp.assetName}</div>
                      {exp.artistName && (
                        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                          by {exp.artistName}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div>{exp.targetStation}</div>
                      {exp.targetShow && (
                        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                          {exp.targetShow}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(230, 184, 0, 0.1)",
                        fontSize: "0.75rem",
                        textTransform: "capitalize",
                      }}>
                        {exp.assetType}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}>
                        {exp.status}
                      </span>
                      {exp.statusMessage && exp.status === "error" && (
                        <div style={{ fontSize: "0.75rem", color: "#F44336", marginTop: "4px" }}>
                          {exp.statusMessage}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.85rem", opacity: 0.7 }}>
                      {formatDate(exp.createdAt)}
                      {exp.sentAt && (
                        <div style={{ fontSize: "0.75rem" }}>
                          Sent: {formatDate(exp.sentAt)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        {exp.status === "error" && (
                          <button
                            className="studio-btn studio-btn--sm"
                            onClick={() => handleRetry(exp._id)}
                            title="Retry"
                          >
                            🔄
                          </button>
                        )}
                        {exp.status === "queued" && (
                          <button
                            className="studio-btn studio-btn--sm"
                            onClick={() => handleCancel(exp._id)}
                            title="Cancel"
                            style={{ color: "#F44336" }}
                          >
                            ✕
                          </button>
                        )}
                        {exp.externalId && (
                          <span style={{ 
                            fontSize: "0.75rem", 
                            opacity: 0.5, 
                            padding: "0.25rem" 
                          }}>
                            ID: {exp.externalId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Panel */}
      <div className="studio-panel" style={{ marginTop: "1.5rem" }}>
        <h4 style={{ margin: "0 0 1rem" }}>📡 About TV Exports</h4>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "1rem",
          fontSize: "0.9rem",
        }}>
          <div>
            <strong style={{ color: "#2196F3" }}>Queued</strong>
            <p style={{ margin: "0.25rem 0 0", opacity: 0.7 }}>
              Waiting to be sent to the TV system.
            </p>
          </div>
          <div>
            <strong style={{ color: "#4CAF50" }}>Sent</strong>
            <p style={{ margin: "0.25rem 0 0", opacity: 0.7 }}>
              Successfully delivered to PowerStream TV.
            </p>
          </div>
          <div>
            <strong style={{ color: "#F44336" }}>Error</strong>
            <p style={{ margin: "0.25rem 0 0", opacity: 0.7 }}>
              Failed to send. Use the retry button to try again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}













