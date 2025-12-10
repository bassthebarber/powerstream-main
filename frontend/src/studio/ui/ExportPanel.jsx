// frontend/src/studio/ui/ExportPanel.jsx
// Studio Export/Mixdown Panel with Royalty Registration

import React, { useState, useEffect } from "react";
import { masterExportEngine } from "../engine/MasterExportEngine";
import { waveformEngine } from "../engine/WaveformEngine";
import { RoyaltyService } from "../services/RoyaltyService";
import { useStudioAudio } from "../StudioAudioContext.jsx";
import "./ExportPanel.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function ExportPanel() {
  // Get shared audio context
  const { currentTrack } = useStudioAudio();
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [exportUrl, setExportUrl] = useState(null);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState("wav");
  
  // Clean/Explicit options
  const [isClean, setIsClean] = useState(false);
  const [isExplicit, setIsExplicit] = useState(true);

  // Royalty work state
  const [work, setWork] = useState(null);
  const [master, setMaster] = useState(null);
  const [showRoyaltyForm, setShowRoyaltyForm] = useState(false);
  const [royaltyMetadata, setRoyaltyMetadata] = useState({
    title: "",
    bpm: "",
    key: "",
    genre: "",
  });
  
  // Pre-fill metadata from current track
  useEffect(() => {
    if (currentTrack) {
      setRoyaltyMetadata({
        title: currentTrack.title || "",
        bpm: currentTrack.bpm || "",
        key: currentTrack.key || "",
        genre: currentTrack.genre || currentTrack.mood || "",
      });
    }
  }, [currentTrack]);
  
  const userId = localStorage.getItem("user_id") || null;

  const handleExport = async () => {
    try {
      setError(null);
      setExportUrl(null);
      setWork(null);
      setMaster(null);
      setIsExporting(true);
      setProgress(0);
      setProgressMessage("Starting export...");

      // Check if there's anything to export
      const duration = waveformEngine.getTotalDuration();
      if (duration <= 1 && !currentTrack?.audioUrl) {
        throw new Error("No audio to export. Record or generate some audio first.");
      }

      let audioUrl = "";
      
      // If we have tracks in waveform engine, mix them down
      if (waveformEngine.tracks.length > 0 && waveformEngine.tracks.some(t => t.clips.length > 0)) {
        // Subscribe to progress updates
        masterExportEngine.onProgress((p, msg) => {
          setProgress(p);
          setProgressMessage(msg);
        });

        // Export the mixdown
        const wavFile = await masterExportEngine.exportMixdown();

        setProgressMessage("Uploading to server...");

        // Upload to server
        const form = new FormData();
        form.append("file", wavFile, "mixdown.wav");

        const res = await fetch(`${API_BASE}/api/export/upload`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Upload failed");
        }

        audioUrl = data.url.startsWith("http")
          ? data.url
          : `${API_BASE}${data.url}`;
      } else if (currentTrack?.audioUrl) {
        // Use current track's audio URL directly
        audioUrl = currentTrack.audioUrl;
      } else {
        throw new Error("No audio source found.");
      }

      setExportUrl(audioUrl);
      setProgress(80);
      setProgressMessage("Registering master...");

      // Register master with backend
      const masterRes = await fetch(`${API_BASE}/api/studio/master`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerUserId: userId,
          beatId: currentTrack?.type === "beat" ? currentTrack.id : null,
          title: royaltyMetadata.title || currentTrack?.title || "Untitled Master",
          audioUrl,
          durationSeconds: duration || currentTrack?.durationSeconds || 0,
          format,
          isClean,
          isExplicit,
          versionLabel: isClean ? "Clean" : "Explicit",
          bpm: royaltyMetadata.bpm || currentTrack?.bpm || null,
          key: royaltyMetadata.key || currentTrack?.key || null,
          genre: royaltyMetadata.genre || currentTrack?.genre || currentTrack?.mood || null,
        }),
      });

      const masterData = await masterRes.json();
      if (!masterData.success) {
        throw new Error(masterData.error || "Master registration failed");
      }

      setMaster(masterData.master);
      setProgress(100);
      setProgressMessage("Export complete!");

      // Show royalty registration form
      setShowRoyaltyForm(true);

    } catch (err) {
      console.error("[ExportPanel] Error:", err);
      setError(err.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegisterRoyaltyWork = async () => {
    try {
      const title = royaltyMetadata.title || "Untitled Track";

      const payload = {
        title,
        ownerUserId: null, // TODO: fill from auth user
        bpm: royaltyMetadata.bpm ? parseInt(royaltyMetadata.bpm) : null,
        key: royaltyMetadata.key || null,
        genre: royaltyMetadata.genre || null,
        durationSeconds: waveformEngine.getTotalDuration(),
        masterUrl: exportUrl,
        proAffiliations: ["BMI", "ASCAP"], // Default PROs
        writers: [],
      };

      const royaltyResp = await RoyaltyService.createWorkFromExport(payload);

      if (royaltyResp.success) {
        setWork(royaltyResp.work);
        setShowRoyaltyForm(false);
      } else {
        throw new Error(royaltyResp.error || "Failed to register work");
      }
    } catch (err) {
      console.error("[ExportPanel] Royalty registration error:", err);
      setError(err.message);
    }
  };

  const handleDownloadLocal = async () => {
    try {
      setError(null);
      setIsExporting(true);
      setProgressMessage("Preparing download...");

      masterExportEngine.onProgress((p, msg) => {
        setProgress(p);
        setProgressMessage(msg);
      });

      const wavFile = await masterExportEngine.exportMixdown();
      masterExportEngine.downloadBlob(wavFile, `mixdown_${Date.now()}.wav`);

      setProgress(100);
      setProgressMessage("Download started!");

    } catch (err) {
      console.error("[ExportPanel] Download error:", err);
      setError(err.message || "Download failed");
    } finally {
      setIsExporting(false);
    }
  };

  const trackCount = waveformEngine.tracks.length;
  const clipCount = waveformEngine.tracks.reduce((sum, t) => sum + t.clips.length, 0);
  const duration = waveformEngine.getTotalDuration();

  return (
    <div className="export-panel">
      <div className="export-header">
        <span className="export-icon">💾</span>
        <h3>Export Mixdown</h3>
      </div>

      {/* Project Info */}
      <div className="export-info">
        <div className="info-row">
          <span>Tracks:</span>
          <span>{trackCount}</span>
        </div>
        <div className="info-row">
          <span>Clips:</span>
          <span>{clipCount}</span>
        </div>
        <div className="info-row">
          <span>Duration:</span>
          <span>{duration > 0 ? `${duration.toFixed(1)}s` : "—"}</span>
        </div>
      </div>

      {/* Current Track */}
      {currentTrack && (
        <div className="export-current-track">
          <span className="track-badge">{currentTrack.type || "track"}</span>
          <span className="track-title">{currentTrack.title}</span>
        </div>
      )}

      {/* Format Selection */}
      <div className="export-format">
        <label>
          <span>Format</span>
          <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={isExporting}>
            <option value="wav">WAV (Lossless)</option>
            <option value="mp3">MP3 (Compressed)</option>
            <option value="stems">Stems (Multi-track)</option>
          </select>
        </label>
      </div>
      
      {/* Clean/Explicit Options */}
      <div className="export-version-options">
        <label className="version-option">
          <input
            type="checkbox"
            checked={isClean}
            onChange={(e) => {
              setIsClean(e.target.checked);
              if (e.target.checked) setIsExplicit(false);
            }}
            disabled={isExporting}
          />
          <span className="option-label">
            🔇 Clean
            <small>Radio/TV safe</small>
          </span>
        </label>
        <label className="version-option">
          <input
            type="checkbox"
            checked={isExplicit}
            onChange={(e) => {
              setIsExplicit(e.target.checked);
              if (e.target.checked) setIsClean(false);
            }}
            disabled={isExporting}
          />
          <span className="option-label">
            🔞 Explicit
            <small>Original version</small>
          </span>
        </label>
      </div>

      {/* Export Buttons */}
      <div className="export-actions">
        <button
          className="export-btn primary"
          onClick={handleExport}
          disabled={isExporting || clipCount === 0}
        >
          {isExporting ? "⏳ Exporting..." : "☁️ Export & Upload"}
        </button>

        <button
          className="export-btn secondary"
          onClick={handleDownloadLocal}
          disabled={isExporting || clipCount === 0}
        >
          {isExporting ? "⏳ Processing..." : "💾 Download Local"}
        </button>
      </div>

      {/* Progress Bar */}
      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{progressMessage}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="export-error">
          ❌ {error}
        </div>
      )}

      {/* Success / Download Link */}
      {exportUrl && !isExporting && !showRoyaltyForm && !work && (
        <div className="export-result">
          <p>✅ Export Complete!</p>
          <a href={exportUrl} target="_blank" rel="noopener noreferrer" className="export-link">
            🔗 Download from Server
          </a>
        </div>
      )}

      {/* Royalty Registration Form */}
      {showRoyaltyForm && exportUrl && (
        <div className="royalty-form">
          <h4>📝 Register Royalty Work</h4>
          <div className="royalty-fields">
            <label>
              <span>Track Title</span>
              <input
                type="text"
                value={royaltyMetadata.title}
                onChange={(e) => setRoyaltyMetadata({ ...royaltyMetadata, title: e.target.value })}
                placeholder="Untitled Track"
              />
            </label>
            <label>
              <span>BPM</span>
              <input
                type="number"
                value={royaltyMetadata.bpm}
                onChange={(e) => setRoyaltyMetadata({ ...royaltyMetadata, bpm: e.target.value })}
                placeholder="120"
              />
            </label>
            <label>
              <span>Key</span>
              <input
                type="text"
                value={royaltyMetadata.key}
                onChange={(e) => setRoyaltyMetadata({ ...royaltyMetadata, key: e.target.value })}
                placeholder="C minor"
              />
            </label>
            <label>
              <span>Genre</span>
              <input
                type="text"
                value={royaltyMetadata.genre}
                onChange={(e) => setRoyaltyMetadata({ ...royaltyMetadata, genre: e.target.value })}
                placeholder="Hip-Hop"
              />
            </label>
          </div>
          <div className="royalty-actions">
            <button className="export-btn primary" onClick={handleRegisterRoyaltyWork}>
              ✅ Register Work
            </button>
            <button className="export-btn secondary" onClick={() => setShowRoyaltyForm(false)}>
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Royalty Work Summary */}
      {work && (
        <div className="royalty-work-summary">
          <h4>✅ Royalty Work Registered</h4>
          <div className="work-details">
            <p><strong>Title:</strong> {work.title}</p>
            <p><strong>Work ID:</strong> <code>{work._id}</code></p>
            <p><strong>Status:</strong> <span className="status-badge">{work.registrationStatus}</span></p>
            {work.masterUrl && (
              <a href={work.masterUrl} target="_blank" rel="noopener noreferrer" className="export-link">
                🔗 Download Master
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
