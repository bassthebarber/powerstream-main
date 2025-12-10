// frontend/studio-app/src/pages/VoiceStudio.jsx
// AI Voice Clone Studio Page
// Allows artists to create and manage their personal voice profiles
// SECURITY: Only for the artist's own voice - no impersonation allowed

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/studio.css";
import { VOICE_API } from "../config/api.js";

export default function VoiceStudio() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Profile state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Training state
  const [trainingSamples, setTrainingSamples] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  
  // Synthesis state
  const [synthMode, setSynthMode] = useState("lyrics");
  const [lyrics, setLyrics] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthResult, setSynthResult] = useState(null);
  
  // Toast notification
  const [toast, setToast] = useState(null);
  
  // Mock user ID (in production, get from auth context)
  const userId = localStorage.getItem("studioUserId") || "demo-artist-id";

  // Fetch profile and training samples on mount
  useEffect(() => {
    fetchProfile();
    fetchTrainingSamples();
  }, []);

  // Show toast
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch voice profile
  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch(`${VOICE_API}/my-profile?userId=${userId}`);
      const data = await res.json();
      
      if (data.success && data.hasProfile) {
        setProfile(data.profile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Could not load voice profile");
    } finally {
      setLoading(false);
    }
  }

  // Fetch available training samples
  async function fetchTrainingSamples() {
    try {
      const res = await fetch(`${VOICE_API}/training-samples?userId=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        setTrainingSamples(data.samples || []);
      }
    } catch (err) {
      console.error("Failed to fetch training samples:", err);
    }
  }

  // Create voice profile
  async function handleCreateProfile() {
    if (selectedSamples.length < 3) {
      showToast("Please select at least 3 voice samples", "error");
      return;
    }
    
    if (!displayName.trim()) {
      showToast("Please enter a display name for your voice", "error");
      return;
    }
    
    if (!consent) {
      showToast("You must consent to voice cloning", "error");
      return;
    }
    
    setIsTraining(true);
    setError(null);
    
    try {
      const res = await fetch(`${VOICE_API}/create-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: userId,
          displayName: displayName.trim(),
          sampleIds: selectedSamples,
          consent: true,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setProfile(data.profile);
        showToast("Voice profile created! Training has started.", "success");
        setSelectedSamples([]);
        setDisplayName("");
        setConsent(false);
      } else {
        showToast(data.message || "Failed to create profile", "error");
      }
    } catch (err) {
      console.error("Create profile error:", err);
      showToast("Failed to create voice profile", "error");
    } finally {
      setIsTraining(false);
    }
  }

  // Synthesize audio
  async function handleSynthesize() {
    if (!profile || !profile.isReady) {
      showToast("Voice profile not ready", "error");
      return;
    }
    
    if (synthMode === "lyrics" && lyrics.trim().length < 5) {
      showToast("Please enter at least 5 characters of lyrics", "error");
      return;
    }
    
    if (synthMode === "reference" && !referenceId) {
      showToast("Please select a reference track", "error");
      return;
    }
    
    setIsSynthesizing(true);
    setSynthResult(null);
    
    try {
      const res = await fetch(`${VOICE_API}/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: userId,
          mode: synthMode,
          lyrics: synthMode === "lyrics" ? lyrics : undefined,
          referenceAudioId: synthMode === "reference" ? referenceId : undefined,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSynthResult(data.synthesis);
        showToast("Audio synthesized successfully!", "success");
        // Refresh profile to update remaining syntheses
        fetchProfile();
      } else {
        showToast(data.message || "Synthesis failed", "error");
      }
    } catch (err) {
      console.error("Synthesis error:", err);
      showToast("Failed to synthesize audio", "error");
    } finally {
      setIsSynthesizing(false);
    }
  }

  // Delete profile
  async function handleDeleteProfile() {
    if (!window.confirm("Are you sure you want to delete your voice profile? This cannot be undone.")) {
      return;
    }
    
    try {
      const res = await fetch(`${VOICE_API}/profile`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: userId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setProfile(null);
        showToast("Voice profile deleted", "success");
      } else {
        showToast(data.message || "Failed to delete profile", "error");
      }
    } catch (err) {
      console.error("Delete profile error:", err);
      showToast("Failed to delete profile", "error");
    }
  }

  // Toggle sample selection
  function toggleSample(sampleId) {
    setSelectedSamples(prev => {
      if (prev.includes(sampleId)) {
        return prev.filter(id => id !== sampleId);
      }
      if (prev.length >= 10) {
        showToast("Maximum 10 samples allowed", "warning");
        return prev;
      }
      return [...prev, sampleId];
    });
  }

  // Format duration
  function formatDuration(seconds) {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Get status badge color
  function getStatusColor(status) {
    switch (status) {
      case "ready": return "#4CAF50";
      case "training": return "#FFC107";
      case "pending": return "#2196F3";
      case "failed": return "#F44336";
      default: return "#9E9E9E";
    }
  }

  if (loading) {
    return (
      <div className="studio-page">
        <div className="studio-loading">
          <div className="loading-spinner"></div>
          <p>Loading Voice Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`studio-toast studio-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="studio-header">
        <button className="studio-back-btn" onClick={() => navigate("/studio")}>
          ← Back to Control Room
        </button>
        <h1>🎤 AI Voice Studio</h1>
        <p className="studio-subtitle">Create and use your personal AI voice</p>
      </header>

      {/* Important Notice */}
      <div className="studio-notice" style={{ 
        background: "rgba(230, 184, 0, 0.1)", 
        border: "1px solid var(--gold)",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1.5rem"
      }}>
        <strong>🔒 Your Voice, Your Control</strong>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", opacity: 0.9 }}>
          This feature creates an AI model of <em>your own voice</em> using recordings you provide.
          Voice profiles are private and can only be used by you. No impersonation of others is allowed.
        </p>
      </div>

      <div className="studio-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        
        {/* ===== MY VOICE PROFILE CARD ===== */}
        <div className="studio-card">
          <div className="card-header">
            <span className="card-icon">🎙️</span>
            <h2>My Voice Profile</h2>
            {profile && (
              <span className="card-badge" style={{ 
                background: getStatusColor(profile.status),
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.75rem"
              }}>
                {profile.status.toUpperCase()}
              </span>
            )}
          </div>

          {profile ? (
            // Profile exists
            <div className="card-content">
              <div className="profile-info">
                <div className="info-row">
                  <label>Voice Name:</label>
                  <span>{profile.displayName}</span>
                </div>
                <div className="info-row">
                  <label>Status:</label>
                  <span style={{ color: getStatusColor(profile.status) }}>
                    {profile.status === "ready" ? "✓ Ready to use" : 
                     profile.status === "training" ? "⏳ Training..." : 
                     profile.status === "pending" ? "📤 Uploading samples..." :
                     profile.status === "failed" ? "❌ Training failed" : profile.status}
                  </span>
                </div>
                {profile.trainingProgress !== undefined && profile.status === "training" && (
                  <div className="info-row">
                    <label>Progress:</label>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${profile.trainingProgress}%` }}
                      ></div>
                    </div>
                    <span>{profile.trainingProgress}%</span>
                  </div>
                )}
                <div className="info-row">
                  <label>Training Samples:</label>
                  <span>{profile.trainingSamplesCount || 0} clips</span>
                </div>
                <div className="info-row">
                  <label>Daily Syntheses:</label>
                  <span>{profile.remainingSyntheses || 0} remaining</span>
                </div>
              </div>

              <div className="card-actions" style={{ marginTop: "1rem" }}>
                <button 
                  className="btn-danger" 
                  onClick={handleDeleteProfile}
                  style={{ fontSize: "0.85rem" }}
                >
                  🗑️ Delete Profile
                </button>
              </div>
            </div>
          ) : (
            // No profile - show creation form
            <div className="card-content">
              <p style={{ marginBottom: "1rem", opacity: 0.8 }}>
                Create your AI voice profile by providing vocal samples.
              </p>

              <div className="form-group">
                <label>Voice Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., My Studio Voice"
                  maxLength={100}
                  className="studio-input"
                />
                <small style={{ opacity: 0.6 }}>This is your personal voice name (no celebrity names allowed)</small>
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Select Training Samples (3-10 clips)</label>
                <div className="sample-list" style={{ 
                  maxHeight: "200px", 
                  overflowY: "auto",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  padding: "0.5rem"
                }}>
                  {trainingSamples.length === 0 ? (
                    <p style={{ textAlign: "center", opacity: 0.6, padding: "1rem" }}>
                      No vocal recordings found. Upload some vocals first in the Library.
                    </p>
                  ) : (
                    trainingSamples.map(sample => (
                      <div 
                        key={sample._id}
                        className={`sample-item ${selectedSamples.includes(sample._id) ? "selected" : ""}`}
                        onClick={() => toggleSample(sample._id)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          marginBottom: "0.25rem",
                          cursor: "pointer",
                          background: selectedSamples.includes(sample._id) 
                            ? "rgba(230, 184, 0, 0.3)" 
                            : "rgba(255,255,255,0.05)",
                          border: selectedSamples.includes(sample._id)
                            ? "1px solid var(--gold)"
                            : "1px solid transparent"
                        }}
                      >
                        <span>{sample.title}</span>
                        <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>
                          {formatDuration(sample.duration)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <small style={{ opacity: 0.6 }}>
                  Selected: {selectedSamples.length}/10 
                  {selectedSamples.length < 3 && " (need at least 3)"}
                </small>
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span>
                    I consent to creating an AI voice model from my own recordings.
                    I understand this is for my personal use only.
                  </span>
                </label>
              </div>

              <button
                className="studio-gold-btn"
                onClick={handleCreateProfile}
                disabled={isTraining || selectedSamples.length < 3 || !displayName.trim() || !consent}
                style={{ width: "100%", marginTop: "1rem" }}
              >
                {isTraining ? "⏳ Creating Profile..." : "🎤 Create Voice Profile"}
              </button>
            </div>
          )}
        </div>

        {/* ===== GENERATE PERFORMANCE CARD ===== */}
        <div className="studio-card">
          <div className="card-header">
            <span className="card-icon">🎵</span>
            <h2>Generate Performance</h2>
            {profile?.isReady && (
              <span className="card-badge" style={{ 
                background: "#4CAF50",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.75rem"
              }}>
                READY
              </span>
            )}
          </div>

          <div className="card-content">
            {!profile ? (
              <div style={{ textAlign: "center", padding: "2rem", opacity: 0.7 }}>
                <p>Create a voice profile first to generate performances.</p>
              </div>
            ) : !profile.isReady ? (
              <div style={{ textAlign: "center", padding: "2rem", opacity: 0.7 }}>
                <p>Voice profile is {profile.status}. Please wait for training to complete.</p>
                {profile.status === "training" && (
                  <div className="loading-spinner" style={{ margin: "1rem auto" }}></div>
                )}
              </div>
            ) : (
              <>
                {/* Mode Toggle */}
                <div className="mode-toggle" style={{ 
                  display: "flex", 
                  gap: "0.5rem", 
                  marginBottom: "1rem" 
                }}>
                  <button
                    className={`mode-btn ${synthMode === "lyrics" ? "active" : ""}`}
                    onClick={() => setSynthMode("lyrics")}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: synthMode === "lyrics" ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.2)",
                      background: synthMode === "lyrics" ? "rgba(230, 184, 0, 0.2)" : "transparent",
                      cursor: "pointer"
                    }}
                  >
                    📝 From Lyrics
                  </button>
                  <button
                    className={`mode-btn ${synthMode === "reference" ? "active" : ""}`}
                    onClick={() => setSynthMode("reference")}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: synthMode === "reference" ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.2)",
                      background: synthMode === "reference" ? "rgba(230, 184, 0, 0.2)" : "transparent",
                      cursor: "pointer"
                    }}
                  >
                    🎧 From Reference
                  </button>
                </div>

                {/* Lyrics Input */}
                {synthMode === "lyrics" && (
                  <div className="form-group">
                    <label>Lyrics / Text to Sing</label>
                    <textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="Enter your lyrics here..."
                      rows={6}
                      className="studio-textarea"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        resize: "vertical"
                      }}
                    />
                  </div>
                )}

                {/* Reference Selection */}
                {synthMode === "reference" && (
                  <div className="form-group">
                    <label>Reference Audio</label>
                    <select
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      className="studio-select"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff"
                      }}
                    >
                      <option value="">Select a reference track...</option>
                      {trainingSamples.map(sample => (
                        <option key={sample._id} value={sample._id}>
                          {sample.title} ({formatDuration(sample.duration)})
                        </option>
                      ))}
                    </select>
                    <small style={{ opacity: 0.6 }}>
                      The AI will mimic the style of the selected reference.
                    </small>
                  </div>
                )}

                {/* Synthesize Button */}
                <button
                  className="studio-gold-btn"
                  onClick={handleSynthesize}
                  disabled={isSynthesizing || !profile.canSynthesize}
                  style={{ width: "100%", marginTop: "1rem" }}
                >
                  {isSynthesizing ? "⏳ Rendering..." : "🎤 Render with My Voice"}
                </button>

                {!profile.canSynthesize && (
                  <p style={{ color: "#F44336", fontSize: "0.85rem", marginTop: "0.5rem", textAlign: "center" }}>
                    Daily synthesis limit reached. Try again tomorrow.
                  </p>
                )}

                {/* Synthesis Result */}
                {synthResult && (
                  <div className="synth-result" style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "rgba(76, 175, 80, 0.1)",
                    border: "1px solid rgba(76, 175, 80, 0.3)",
                    borderRadius: "8px"
                  }}>
                    <h4 style={{ margin: "0 0 0.5rem", color: "#4CAF50" }}>✓ Audio Generated!</h4>
                    {synthResult.isStub && (
                      <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        (Demo mode - connect a voice provider for real synthesis)
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <button
                        className="btn-secondary"
                        onClick={() => navigate(`/library?highlight=${synthResult.libraryItemId}`)}
                      >
                        📚 Open in Library
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Integration Tips */}
      <div className="studio-card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <span className="card-icon">💡</span>
          <h2>Integration Tips</h2>
        </div>
        <div className="card-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div className="tip-box" style={{ 
            padding: "1rem", 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "8px" 
          }}>
            <h4>🎙️ From Record Booth</h4>
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              After recording a take, use "Re-sing with AI Voice" to generate a polished version.
            </p>
          </div>
          <div className="tip-box" style={{ 
            padding: "1rem", 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "8px" 
          }}>
            <h4>📚 From Library</h4>
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Select any vocal recording and use "Add to Voice Training" to improve your model.
            </p>
          </div>
          <div className="tip-box" style={{ 
            padding: "1rem", 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "8px" 
          }}>
            <h4>🔒 Privacy</h4>
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Your voice model is private and tied to your account. Only you can use it.
            </p>
          </div>
        </div>
      </div>

      {/* Inline Styles for Progress Bar */}
      <style>{`
        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
          margin: 0 0.5rem;
        }
        .progress-fill {
          height: 100%;
          background: var(--gold);
          transition: width 0.3s ease;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .info-row label {
          font-weight: 500;
          opacity: 0.7;
          min-width: 120px;
        }
        .studio-toast {
          position: fixed;
          top: 80px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          z-index: 9999;
          animation: slideIn 0.3s ease;
        }
        .studio-toast-success {
          background: rgba(76, 175, 80, 0.9);
          color: #fff;
        }
        .studio-toast-error {
          background: rgba(244, 67, 54, 0.9);
          color: #fff;
        }
        .studio-toast-info {
          background: rgba(33, 150, 243, 0.9);
          color: #fff;
        }
        .studio-toast-warning {
          background: rgba(255, 152, 0, 0.9);
          color: #fff;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(230, 184, 0, 0.2);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .btn-danger {
          background: rgba(244, 67, 54, 0.2);
          border: 1px solid rgba(244, 67, 54, 0.5);
          color: #F44336;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-danger:hover {
          background: rgba(244, 67, 54, 0.3);
        }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}

