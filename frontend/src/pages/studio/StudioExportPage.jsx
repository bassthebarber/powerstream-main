// frontend/src/pages/studio/StudioExportPage.jsx
// Export & Email - Professional Export Interface
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { exportProject, sendExportEmail } from "../../lib/studioApi.js";
import api from "../../lib/api.js";
import "../../styles/studio-unified.css";

const EXPORT_FORMATS = [
  { id: "mp3", label: "MP3", desc: "Compressed, smaller file size", icon: "🎵", recommended: true },
  { id: "wav", label: "WAV", desc: "Lossless, studio quality", icon: "📀" },
  { id: "stems", label: "Stems", desc: "Separate tracks for mixing", icon: "🎚️" },
  { id: "flac", label: "FLAC", desc: "Lossless compression", icon: "💿" },
];

const VERSIONS = [
  { id: "clean", label: "Clean", desc: "Radio-safe version" },
  { id: "explicit", label: "Explicit", desc: "Original uncensored" },
  { id: "tv", label: "TV Version", desc: "Broadcast-ready mix" },
  { id: "performance", label: "Performance", desc: "Live/club optimized" },
];

export default function StudioExportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    projectName: "",
    format: "mp3",
    version: "clean",
    emailRecipients: "",
    destination: "",
    stationId: "",
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get("/tv-stations");
      if (res.data?.stations) {
        setStations(res.data.stations);
      }
    } catch (err) {
      console.error("Error fetching stations:", err);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const exportResult = await exportProject({
        projectName: form.projectName,
        version: form.version,
        format: form.format,
        userId: user?.id,
      });

      if (!exportResult.success) {
        throw new Error(exportResult.error || "Export failed");
      }

      const mediaUrl = exportResult.data?.audioUrl || exportResult.downloadUrl;
      let statusMessage = "Project exported successfully!";

      // Publish to PowerStream if destination selected
      if (form.destination && mediaUrl) {
        try {
          const publishResult = await api.post("/studio/export", {
            projectId: exportResult.projectId,
            format: form.version,
            destination: form.destination,
            stationId: form.destination === "station" ? form.stationId : undefined,
            title: form.projectName,
            mediaUrl,
          });

          if (publishResult.data?.ok) {
            statusMessage = form.destination === "station" 
              ? "Exported and added to TV station!" 
              : "Exported and posted to PowerFeed!";
          }
        } catch {
          statusMessage = "Exported, but failed to publish.";
        }
      }

      // Send emails if provided
      if (form.emailRecipients && mediaUrl) {
        const emails = form.emailRecipients.split(",").map(e => e.trim());
        for (const email of emails) {
          try {
            await sendExportEmail({
              assetId: exportResult.exportId,
              assetName: form.projectName,
              assetUrl: mediaUrl,
              email,
            });
          } catch {
            console.error(`Failed to email ${email}`);
          }
        }
        statusMessage += " Emails sent!";
      }

      setSuccess(statusMessage);
    } catch (err) {
      setError(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">📧 Export & Email</h1>
        <p className="studio-header-subtitle">Export your project and share with the world</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="studio-alert studio-alert--error">
          <span>⚠️ {error}</span>
          <button className="studio-alert-dismiss" onClick={() => setError("")}>×</button>
        </div>
      )}
      {success && (
        <div className="studio-alert studio-alert--success">
          <span>✅ {success}</span>
          <button className="studio-alert-dismiss" onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      <form onSubmit={handleExport}>
        <div className="studio-grid studio-grid--2" style={{ marginBottom: 24 }}>
          {/* Export Format */}
          <div className="studio-card">
            <div className="studio-card-header">
              <h3 className="studio-card-title">Export Format</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {EXPORT_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleChange("format", fmt.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                    background: form.format === fmt.id 
                      ? "rgba(255,184,77,0.15)" 
                      : "rgba(255,255,255,0.03)",
                    border: form.format === fmt.id 
                      ? "1px solid rgba(255,184,77,0.5)" 
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{fmt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 700, 
                      color: form.format === fmt.id ? "#ffb84d" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      {fmt.label}
                      {fmt.recommended && (
                        <span className="studio-card-badge" style={{ fontSize: 9 }}>Recommended</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>{fmt.desc}</div>
                  </div>
                  {form.format === fmt.id && (
                    <span style={{ color: "#ffb84d", fontSize: 18 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Version */}
          <div className="studio-card">
            <div className="studio-card-header">
              <h3 className="studio-card-title">Version</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {VERSIONS.map((ver) => (
                <button
                  key={ver.id}
                  type="button"
                  onClick={() => handleChange("version", ver.id)}
                  className={`studio-chip ${form.version === ver.id ? "studio-chip--active" : ""}`}
                  style={{ 
                    padding: "12px 16px", 
                    justifyContent: "space-between",
                    display: "flex"
                  }}
                >
                  <span>{ver.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{ver.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="studio-card" style={{ marginBottom: 24 }}>
          <div className="studio-card-header">
            <h3 className="studio-card-title">Project Details</h3>
          </div>

          <div className="studio-grid studio-grid--2">
            <div>
              <label className="studio-label">Project Name</label>
              <input
                type="text"
                className="studio-input"
                value={form.projectName}
                onChange={(e) => handleChange("projectName", e.target.value)}
                placeholder="My Track"
                required
              />
            </div>

            <div>
              <label className="studio-label">Publish To</label>
              <select
                className="studio-select"
                value={form.destination}
                onChange={(e) => handleChange("destination", e.target.value)}
              >
                <option value="">Export only (don't publish)</option>
                <option value="feed">PowerFeed</option>
                <option value="station">TV Station</option>
              </select>
            </div>
          </div>

          {form.destination === "station" && (
            <div style={{ marginTop: 16 }}>
              <label className="studio-label">Select Station</label>
              <select
                className="studio-select"
                value={form.stationId}
                onChange={(e) => handleChange("stationId", e.target.value)}
                required
              >
                <option value="">Select a station...</option>
                {stations.map((station) => (
                  <option key={station._id || station.id} value={station._id || station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Email Section */}
        <div className="studio-card" style={{ marginBottom: 24 }}>
          <div className="studio-card-header">
            <h3 className="studio-card-title">📬 Send via Email</h3>
          </div>
          <p className="studio-card-desc">
            Send the exported file directly to artists, DJs, or collaborators.
          </p>
          
          <label className="studio-label">Email Recipients (comma-separated)</label>
          <input
            type="text"
            className="studio-input"
            value={form.emailRecipients}
            onChange={(e) => handleChange("emailRecipients", e.target.value)}
            placeholder="artist@example.com, dj@example.com"
          />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 16 }}>
          <button
            type="submit"
            className="studio-btn studio-btn--primary studio-btn--large"
            disabled={loading || !form.projectName}
            style={{ flex: 1 }}
          >
            {loading ? "Exporting..." : "Export & Send"}
          </button>
          <button
            type="button"
            className="studio-btn studio-btn--outline studio-btn--large"
            disabled={loading}
          >
            Preview
          </button>
        </div>
      </form>
    </div>
  );
}
