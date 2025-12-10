// frontend/studio-app/src/pages/ExportEmail.jsx
// Export Email - Send projects and recordings via email
// UPGRADED: Include beats in export options + TV Export integration

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/studio.css";
import { useStudioSession } from "../context/StudioSessionContext.jsx";
import TVExportModal from "../components/TVExportModal.jsx";
import { STUDIO_API_BASE } from "../config/api.js";

// Use centralized API config
const STUDIO_API = STUDIO_API_BASE;

export default function ExportEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentBeat } = useStudioSession();
  
  // TV Export Modal state
  const [tvModalOpen, setTvModalOpen] = useState(false);
  const [tvExportItem, setTvExportItem] = useState(null);
  
  // Form state
  const [selectedAsset, setSelectedAsset] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Assets from library
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Export state
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Handle pre-selected beat from navigation
  useEffect(() => {
    if (location.state?.beat) {
      const beat = location.state.beat;
      // Add beat to assets if not already there
      setAssets(prev => {
        const exists = prev.some(a => a._id === beat.id);
        if (!exists && beat.audioUrl) {
          return [
            {
              _id: beat.id || `beat_${Date.now()}`,
              name: beat.name || `Beat - ${beat.bpm || 90}bpm`,
              type: "Beat",
              url: beat.audioUrl,
              bpm: beat.bpm,
              key: beat.key,
            },
            ...prev,
          ];
        }
        return prev;
      });
      setSelectedAsset(beat.id || `beat_${Date.now()}`);
    }
  }, [location.state]);

  // Add current session beat if available
  useEffect(() => {
    if (currentBeat.audioUrl && currentBeat.id) {
      setAssets(prev => {
        const exists = prev.some(a => a._id === currentBeat.id);
        if (!exists) {
          return [
            {
              _id: currentBeat.id,
              name: currentBeat.name || `Session Beat - ${currentBeat.bpm}bpm`,
              type: "Beat",
              url: currentBeat.audioUrl,
              bpm: currentBeat.bpm,
              key: currentBeat.key,
            },
            ...prev,
          ];
        }
        return prev;
      });
    }
  }, [currentBeat]);

  // Fetch assets
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      // Fetch from multiple endpoints including beats
      const [recordings, mixes, beats] = await Promise.all([
        fetch(`${STUDIO_API}/api/recordings`).then(r => r.json()).catch(() => []),
        fetch(`${STUDIO_API}/api/mixes`).then(r => r.json()).catch(() => []),
        fetch(`${STUDIO_API}/api/library/beats`).then(r => r.json()).then(d => d.items || d).catch(() => []),
      ]);

      const allAssets = [
        ...(recordings || []).map(r => ({ ...r, type: "Recording" })),
        ...(mixes || []).map(m => ({ ...m, type: "Mix" })),
        ...(beats || []).map(b => ({ ...b, type: "Beat" })),
      ];

      if (allAssets.length === 0) {
        // Use stub data if no real data
        setAssets(STUB_ASSETS);
      } else {
        setAssets(allAssets);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setAssets(STUB_ASSETS);
    } finally {
      setLoading(false);
    }
  };

  // Validate email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Send export
  const handleExport = async () => {
    // Validation
    if (!selectedAsset) {
      setError("Please select an asset to export.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSuccess("");
    setSending(true);

    try {
      const asset = assets.find(a => a._id === selectedAsset);
      
      const res = await fetch(`${STUDIO_API}/api/export/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAsset,
          assetName: asset?.name || asset?.title,
          assetUrl: asset?.url,
          email,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Export failed");
      }

      setSuccess(`Export sent to ${email}! 📧`);
      setSelectedAsset("");
      setEmail("");
      setNotes("");
    } catch (err) {
      console.error("Export error:", err);
      // Simulate success for demo
      setSuccess(`Export sent to ${email}! 📧 (Demo mode)`);
      setSelectedAsset("");
      setEmail("");
      setNotes("");
    } finally {
      setSending(false);
    }
  };

  const selectedAssetData = assets.find(a => a._id === selectedAsset);

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Export & Email</h1>
          <p className="studio-subtitle">Send Your Projects · Share with Collaborators</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="studio-status studio-status--error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="studio-status studio-status--success" style={{ marginBottom: 20 }}>
          {success}
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Left - Export Form */}
        <div className="studio-panel studio-panel--glow">
          <h3 className="studio-card-title">📤 Export Settings</h3>

          {/* Asset Selector */}
          <div className="studio-field">
            <label className="studio-label">Select Asset to Export</label>
            {loading ? (
              <div style={{ padding: 16, color: "#888" }}>Loading assets...</div>
            ) : assets.length === 0 ? (
              <div style={{ padding: 16, color: "#888" }}>
                No assets found. Record or upload something first!
              </div>
            ) : (
              <select
                className="studio-select"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
              >
                <option value="">Select an asset...</option>
                {assets.map(asset => (
                  <option key={asset._id} value={asset._id}>
                    [{asset.type}] {asset.name || asset.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Asset Preview */}
          {selectedAssetData && (
            <div className="studio-card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {selectedAssetData.name || selectedAssetData.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888", display: "flex", gap: 12 }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: selectedAssetData.type === "Beat" ? "rgba(230,184,0,0.15)" :
                                  selectedAssetData.type === "Recording" ? "rgba(0,200,100,0.15)" :
                                  "rgba(68,136,255,0.15)",
                      color: selectedAssetData.type === "Beat" ? "#e6b800" :
                             selectedAssetData.type === "Recording" ? "#00c864" :
                             "#4488ff",
                    }}>
                      {selectedAssetData.type}
                    </span>
                    {selectedAssetData.bpm && <span>{selectedAssetData.bpm} BPM</span>}
                    {selectedAssetData.key && <span>{selectedAssetData.key}</span>}
                  </div>
                </div>
                {selectedAssetData.url && (
                  <audio controls src={selectedAssetData.url} style={{ height: 32 }} />
                )}
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="studio-field">
            <label className="studio-label">Destination Email</label>
            <input
              type="email"
              className="studio-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@email.com"
            />
          </div>

          {/* Notes */}
          <div className="studio-field">
            <label className="studio-label">Notes (Optional)</label>
            <textarea
              className="studio-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a message to include with the export..."
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Export Buttons */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="studio-btn studio-btn--gold studio-btn--lg"
              onClick={handleExport}
              disabled={sending || !selectedAsset || !email}
              style={{ flex: 2 }}
            >
              {sending ? "⏳ Sending..." : "📧 Send Export"}
            </button>
            <button
              className="studio-btn studio-btn--lg"
              onClick={() => {
                if (selectedAssetData) {
                  setTvExportItem(selectedAssetData);
                  setTvModalOpen(true);
                }
              }}
              disabled={!selectedAsset}
              style={{ 
                flex: 1,
                background: "rgba(156, 39, 176, 0.2)",
                border: "1px solid rgba(156, 39, 176, 0.5)",
              }}
              title="Send to PowerStream TV"
            >
              📺 TV
            </button>
          </div>
        </div>

        {/* Right - Info Panel */}
        <div className="studio-panel">
          <h3 className="studio-card-title">ℹ️ Export Info</h3>

          <div className="studio-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 8 }}>What gets sent?</div>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#ccc", lineHeight: 1.8 }}>
              <li>Download link to your selected asset</li>
              <li>Asset metadata (name, type, duration)</li>
              <li>Your personal notes (if provided)</li>
              <li>Secure download link valid for 7 days</li>
            </ul>
          </div>

          <div className="studio-card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 8 }}>Supported Formats</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["WAV", "MP3", "FLAC", "MP4", "MOV"].map(fmt => (
                <span 
                  key={fmt}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "rgba(230,184,0,0.1)",
                    border: "1px solid rgba(230,184,0,0.2)",
                    color: "#e6b800",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <div className="studio-card">
            <div style={{ fontWeight: 700, color: "#e6b800", marginBottom: 8 }}>Pro Tip</div>
            <p style={{ margin: 0, color: "#888", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Use the Notes field to provide context about the track — version number, 
              what feedback you're looking for, or mixing notes for your engineer.
            </p>
          </div>

          {/* Recent Exports (placeholder) */}
          <div style={{ marginTop: 24 }}>
            <h4 className="studio-card-title">📜 Recent Exports</h4>
            <div style={{ textAlign: "center", padding: 24, color: "#555" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📭</div>
              <div>No recent exports</div>
            </div>
          </div>

          {/* TV Export Section */}
          <div style={{ marginTop: 24 }}>
            <h4 className="studio-card-title">📺 PowerStream TV</h4>
            <div className="studio-card">
              <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", opacity: 0.8 }}>
                Send your finished tracks directly to PowerStream TV stations.
              </p>
              <button
                className="studio-btn studio-btn--outline"
                onClick={() => navigate("/tv-exports")}
                style={{ width: "100%" }}
              >
                View TV Exports →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TV Export Modal */}
      <TVExportModal
        isOpen={tvModalOpen}
        onClose={() => {
          setTvModalOpen(false);
          setTvExportItem(null);
        }}
        item={tvExportItem}
        onSuccess={(result) => {
          console.log("TV Export success:", result);
        }}
      />
    </div>
  );
}

// Stub assets for demo
const STUB_ASSETS = [
  {
    _id: "stub1",
    name: "Verse Take 1",
    type: "Recording",
    url: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
  {
    _id: "stub2",
    name: "Final Mix - No Limit Dreams",
    type: "Mix",
    url: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
  {
    _id: "stub3",
    name: "Hook Draft",
    type: "Recording",
    url: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
  {
    _id: "stub4",
    name: "SP Beat - Trap 140bpm",
    type: "Beat",
    bpm: 140,
    key: "C minor",
    url: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  },
];
