// frontend/studio-app/src/pages/AdminProducers.jsx
// Admin Producer Dashboard - Manage producers, beats, sessions, exports

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/studio.css";
import { ADMIN_PRODUCERS_API } from "../config/api.js";

export default function AdminProducers() {
  const navigate = useNavigate();
  
  // State
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProducer, setEditingProducer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    email: "",
    status: "active",
    bio: "",
    links: {
      soundcloud: "",
      instagram: "",
      twitter: "",
      youtube: "",
      website: "",
      spotify: "",
    },
  });
  
  // Detail panel
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [producerStats, setProducerStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Fetch producers on mount and when filters change
  useEffect(() => {
    fetchProducers();
  }, [statusFilter, searchQuery]);

  // Fetch producers
  async function fetchProducers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      
      const res = await fetch(`${ADMIN_PRODUCERS_API}?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setProducers(data.producers || []);
      } else {
        setError(data.message || "Failed to fetch producers");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch producer stats
  async function fetchProducerStats(producerId) {
    setLoadingStats(true);
    try {
      const res = await fetch(`${ADMIN_PRODUCERS_API}/${producerId}/stats`);
      const data = await res.json();
      
      if (data.success) {
        setProducerStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }

  // Handle producer selection
  function handleSelectProducer(producer) {
    setSelectedProducer(producer);
    fetchProducerStats(producer._id);
  }

  // Handle form submit
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = editingProducer
        ? `${ADMIN_PRODUCERS_API}/${editingProducer._id}`
        : ADMIN_PRODUCERS_API;
      
      const method = editingProducer ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowForm(false);
        setEditingProducer(null);
        resetForm();
        fetchProducers();
        if (selectedProducer?._id === editingProducer?._id) {
          handleSelectProducer(data.producer);
        }
      } else {
        setError(data.message || "Failed to save producer");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // Handle delete
  async function handleDelete(producerId) {
    if (!confirm("Are you sure you want to deactivate this producer?")) return;
    
    try {
      const res = await fetch(`${ADMIN_PRODUCERS_API}/${producerId}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchProducers();
        if (selectedProducer?._id === producerId) {
          setSelectedProducer(null);
          setProducerStats(null);
        }
      } else {
        setError(data.message || "Failed to delete producer");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // Reset form
  function resetForm() {
    setFormData({
      name: "",
      handle: "",
      email: "",
      status: "active",
      bio: "",
      links: {
        soundcloud: "",
        instagram: "",
        twitter: "",
        youtube: "",
        website: "",
        spotify: "",
      },
    });
  }

  // Open edit form
  function handleEdit(producer) {
    setEditingProducer(producer);
    setFormData({
      name: producer.name,
      handle: producer.handle,
      email: producer.email || "",
      status: producer.status,
      bio: producer.bio || "",
      links: producer.links || {
        soundcloud: "",
        instagram: "",
        twitter: "",
        youtube: "",
        website: "",
        spotify: "",
      },
    });
    setShowForm(true);
  }

  // Format date
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          <h1 className="studio-title">👥 Producer Admin</h1>
          <p className="studio-subtitle">Manage Producers · Beats · Sessions · Exports</p>
        </div>
        <button
          className="studio-btn studio-btn--gold"
          onClick={() => {
            resetForm();
            setEditingProducer(null);
            setShowForm(true);
          }}
        >
          + New Producer
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="studio-status studio-status--error" style={{ marginBottom: "1rem" }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: "1rem", background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            ×
          </button>
        </div>
      )}

      <div className="studio-grid" style={{ gridTemplateColumns: showForm || selectedProducer ? "1fr 1fr" : "1fr", gap: "1.5rem" }}>
        
        {/* Producer List */}
        <div className="studio-panel">
          <h3 className="studio-card-title">Producer List</h3>
          
          {/* Filters */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search producers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="studio-input"
              style={{ flex: 1, minWidth: "200px" }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="studio-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
              Loading producers...
            </div>
          ) : producers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>👥</div>
              <div>No producers found.</div>
              <button
                className="studio-btn studio-btn--gold"
                onClick={() => setShowForm(true)}
                style={{ marginTop: "1rem" }}
              >
                Create First Producer
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Name</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Handle</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Status</th>
                  <th style={{ textAlign: "center", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Beats</th>
                  <th style={{ textAlign: "center", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Exports</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontSize: "0.8rem", opacity: 0.7 }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {producers.map((producer) => {
                  const isSelected = selectedProducer?._id === producer._id;
                  return (
                    <tr
                      key={producer._id}
                      onClick={() => handleSelectProducer(producer)}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        cursor: "pointer",
                        background: isSelected ? "rgba(230, 184, 0, 0.1)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "0.75rem", fontWeight: 500 }}>{producer.name}</td>
                      <td style={{ padding: "0.75rem", opacity: 0.7 }}>@{producer.handle}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: producer.status === "active" 
                            ? "rgba(76, 175, 80, 0.15)" 
                            : "rgba(158, 158, 158, 0.15)",
                          color: producer.status === "active" ? "#4CAF50" : "#9E9E9E",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}>
                          {producer.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {producer.stats?.beatsCount || 0}
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                        {producer.stats?.exportsCount || 0}
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.85rem", opacity: 0.7 }}>
                        {formatDate(producer.stats?.lastActivityDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="studio-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 className="studio-card-title">
                {editingProducer ? "Edit Producer" : "New Producer"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProducer(null);
                  resetForm();
                }}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1.5rem" }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="studio-field" style={{ marginBottom: "1rem" }}>
                <label className="studio-label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="studio-input"
                  required
                />
              </div>

              <div className="studio-field" style={{ marginBottom: "1rem" }}>
                <label className="studio-label">Handle *</label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value.toLowerCase() })}
                  className="studio-input"
                  required
                  placeholder="no-limit-east"
                />
                <small style={{ opacity: 0.6 }}>Lowercase, no spaces (e.g., "no-limit-east")</small>
              </div>

              <div className="studio-field" style={{ marginBottom: "1rem" }}>
                <label className="studio-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="studio-input"
                />
              </div>

              <div className="studio-field" style={{ marginBottom: "1rem" }}>
                <label className="studio-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="studio-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="studio-field" style={{ marginBottom: "1rem" }}>
                <label className="studio-label">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="studio-textarea"
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <div className="studio-field" style={{ marginBottom: "1rem" }}>
                <label className="studio-label">Social Links</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <input
                    type="url"
                    placeholder="SoundCloud URL"
                    value={formData.links.soundcloud}
                    onChange={(e) => setFormData({
                      ...formData,
                      links: { ...formData.links, soundcloud: e.target.value }
                    })}
                    className="studio-input"
                  />
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    value={formData.links.instagram}
                    onChange={(e) => setFormData({
                      ...formData,
                      links: { ...formData.links, instagram: e.target.value }
                    })}
                    className="studio-input"
                  />
                  <input
                    type="url"
                    placeholder="Twitter URL"
                    value={formData.links.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      links: { ...formData.links, twitter: e.target.value }
                    })}
                    className="studio-input"
                  />
                  <input
                    type="url"
                    placeholder="YouTube URL"
                    value={formData.links.youtube}
                    onChange={(e) => setFormData({
                      ...formData,
                      links: { ...formData.links, youtube: e.target.value }
                    })}
                    className="studio-input"
                  />
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={formData.links.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      links: { ...formData.links, website: e.target.value }
                    })}
                    className="studio-input"
                  />
                  <input
                    type="url"
                    placeholder="Spotify URL"
                    value={formData.links.spotify}
                    onChange={(e) => setFormData({
                      ...formData,
                      links: { ...formData.links, spotify: e.target.value }
                    })}
                    className="studio-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  className="studio-btn studio-btn--gold"
                  style={{ flex: 1 }}
                >
                  {editingProducer ? "Update" : "Create"} Producer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProducer(null);
                    resetForm();
                  }}
                  className="studio-btn studio-btn--outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Producer Detail Panel */}
        {selectedProducer && !showForm && (
          <div className="studio-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 className="studio-card-title">{selectedProducer.name}</h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleEdit(selectedProducer)}
                  className="studio-btn studio-btn--sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedProducer._id)}
                  className="studio-btn studio-btn--sm"
                  style={{ color: "#F44336" }}
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Producer Info */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Handle:</strong> @{selectedProducer.handle}
              </div>
              {selectedProducer.email && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Email:</strong> {selectedProducer.email}
                </div>
              )}
              {selectedProducer.bio && (
                <div style={{ marginBottom: "0.5rem", opacity: 0.8 }}>
                  {selectedProducer.bio}
                </div>
              )}
              {selectedProducer.links && Object.values(selectedProducer.links).some(v => v) && (
                <div style={{ marginTop: "0.5rem" }}>
                  <strong>Links:</strong>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    {selectedProducer.links.soundcloud && (
                      <a href={selectedProducer.links.soundcloud} target="_blank" rel="noopener noreferrer" style={{ color: "#e6b800" }}>
                        SoundCloud
                      </a>
                    )}
                    {selectedProducer.links.instagram && (
                      <a href={selectedProducer.links.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "#e6b800" }}>
                        Instagram
                      </a>
                    )}
                    {selectedProducer.links.twitter && (
                      <a href={selectedProducer.links.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "#e6b800" }}>
                        Twitter
                      </a>
                    )}
                    {selectedProducer.links.youtube && (
                      <a href={selectedProducer.links.youtube} target="_blank" rel="noopener noreferrer" style={{ color: "#e6b800" }}>
                        YouTube
                      </a>
                    )}
                    {selectedProducer.links.website && (
                      <a href={selectedProducer.links.website} target="_blank" rel="noopener noreferrer" style={{ color: "#e6b800" }}>
                        Website
                      </a>
                    )}
                    {selectedProducer.links.spotify && (
                      <a href={selectedProducer.links.spotify} target="_blank" rel="noopener noreferrer" style={{ color: "#e6b800" }}>
                        Spotify
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            {loadingStats ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                Loading stats...
              </div>
            ) : producerStats ? (
              <>
                <div className="studio-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div className="studio-card" style={{ textAlign: "center", padding: "1rem" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#e6b800" }}>
                      {producerStats.stats?.beatsCreated || 0}
                    </div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Beats Created</div>
                  </div>
                  <div className="studio-card" style={{ textAlign: "center", padding: "1rem" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#e6b800" }}>
                      {producerStats.stats?.tracksRecordedUsingTheirBeats || 0}
                    </div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Tracks Recorded</div>
                  </div>
                  <div className="studio-card" style={{ textAlign: "center", padding: "1rem" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#e6b800" }}>
                      {producerStats.stats?.tvExports || 0}
                    </div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>TV Exports</div>
                  </div>
                </div>

                {/* Recent Beats */}
                {producerStats.recent?.beats && producerStats.recent.beats.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4 style={{ marginBottom: "0.75rem" }}>Recent Beats</h4>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {producerStats.recent.beats.map((beat) => (
                        <div key={beat._id} style={{ 
                          padding: "0.5rem", 
                          background: "rgba(255,255,255,0.05)", 
                          borderRadius: "4px",
                          marginBottom: "0.25rem"
                        }}>
                          <div style={{ fontWeight: 500 }}>{beat.title}</div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                            {beat.bpm && `${beat.bpm} BPM`} {beat.key && `• ${beat.key}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Recordings */}
                {producerStats.recent?.recordings && producerStats.recent.recordings.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4 style={{ marginBottom: "0.75rem" }}>Recent Recordings</h4>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {producerStats.recent.recordings.map((rec) => (
                        <div key={rec._id} style={{ 
                          padding: "0.5rem", 
                          background: "rgba(255,255,255,0.05)", 
                          borderRadius: "4px",
                          marginBottom: "0.25rem"
                        }}>
                          <div style={{ fontWeight: 500 }}>{rec.title}</div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                            {rec.artistName && `by ${rec.artistName}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Exports */}
                {producerStats.recent?.exports && producerStats.recent.exports.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: "0.75rem" }}>Recent TV Exports</h4>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {producerStats.recent.exports.map((exp) => (
                        <div key={exp._id} style={{ 
                          padding: "0.5rem", 
                          background: "rgba(255,255,255,0.05)", 
                          borderRadius: "4px",
                          marginBottom: "0.25rem"
                        }}>
                          <div style={{ fontWeight: 500 }}>{exp.assetName}</div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                            {exp.targetStation} • {exp.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}













