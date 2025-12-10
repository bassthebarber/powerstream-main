// frontend/src/studio/components/StudioExportPanel.jsx
// Studio Export Panel - Master export and stem export

import { useState, useEffect } from "react";
import "./StudioExportPanel.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function StudioExportPanel({ 
  vocal, 
  beat, 
  fx,
  projectName = "track",
  onExportComplete,
}) {
  const [status, setStatus] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState("standard");
  const [stemTypes, setStemTypes] = useState([]);
  const [selectedStems, setSelectedStems] = useState(["vocals", "instrumental", "bass", "highs"]);
  const [lastExport, setLastExport] = useState(null);
  const [exports, setExports] = useState({ masters: [], stemFolders: [] });

  // Load presets and stem types on mount
  useEffect(() => {
    fetchPresets();
    fetchStemTypes();
    fetchExports();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/export/presets`);
      const data = await res.json();
      if (data.success) {
        setPresets(data.presets);
      }
    } catch (err) {
      console.error("Failed to load presets:", err);
    }
  };

  const fetchStemTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/export/stem-types`);
      const data = await res.json();
      if (data.success) {
        setStemTypes(data.types);
      }
    } catch (err) {
      console.error("Failed to load stem types:", err);
    }
  };

  const fetchExports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/export/list`);
      const data = await res.json();
      if (data.success) {
        setExports(data);
      }
    } catch (err) {
      console.error("Failed to load exports:", err);
    }
  };

  const exportMaster = async () => {
    if (isExporting) return;

    const hasInputs = vocal?.filePath || beat?.filePath || fx?.filePath;
    if (!hasInputs) {
      setStatus("⚠️ No tracks to export. Record or load audio first.");
      return;
    }

    setIsExporting(true);
    setStatus("🎧 Exporting master track...");
    setProgress(10);

    try {
      const res = await fetch(`${API_BASE}/api/export/master`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vocalPath: vocal?.filePath,
          beatPath: beat?.filePath,
          fxPath: fx?.filePath,
          exportName: projectName || `track_${Date.now()}`,
          masteringPreset: selectedPreset,
        }),
      });

      setProgress(70);
      const data = await res.json();

      if (data.success) {
        setProgress(100);
        setStatus("✅ Master Export Complete!");
        setLastExport({
          type: "master",
          wavUrl: data.wavUrl,
          mp3Url: data.mp3Url,
          wavSize: data.wavSize,
          mp3Size: data.mp3Size,
          preset: data.preset,
        });
        
        if (onExportComplete) {
          onExportComplete(data);
        }
        
        fetchExports();
      } else {
        setStatus(`❌ Export failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Export error:", err);
      setStatus(`❌ Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const exportStems = async () => {
    if (isExporting) return;

    const inputFile = vocal?.filePath || beat?.filePath;
    if (!inputFile) {
      setStatus("⚠️ No audio file to extract stems from.");
      return;
    }

    setIsExporting(true);
    setStatus("🎚️ Exporting stems...");
    setProgress(10);

    try {
      const res = await fetch(`${API_BASE}/api/export/stems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputFile,
          exportName: `stems_${projectName || Date.now()}`,
          stems: selectedStems,
        }),
      });

      setProgress(70);
      const data = await res.json();

      if (data.success) {
        setProgress(100);
        setStatus("✅ Stems Exported!");
        setLastExport({
          type: "stems",
          downloads: data.downloads,
          metadata: data.metadata,
        });
        
        if (onExportComplete) {
          onExportComplete(data);
        }
        
        fetchExports();
      } else {
        setStatus(`❌ Stem export failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Stem export error:", err);
      setStatus(`❌ Stem export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const toggleStem = (stemId) => {
    setSelectedStems(prev => 
      prev.includes(stemId) 
        ? prev.filter(s => s !== stemId)
        : [...prev, stemId]
    );
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h2>🎧 Master Export & Stems</h2>
        <p className="export-subtitle">Export your track for distribution</p>
      </div>

      {/* Track Status */}
      <div className="track-status">
        <div className={`track-indicator ${vocal?.filePath ? "ready" : "empty"}`}>
          🎤 Vocals {vocal?.filePath ? "✓" : "—"}
        </div>
        <div className={`track-indicator ${beat?.filePath ? "ready" : "empty"}`}>
          🥁 Beat {beat?.filePath ? "✓" : "—"}
        </div>
        <div className={`track-indicator ${fx?.filePath ? "ready" : "empty"}`}>
          ✨ FX {fx?.filePath ? "✓" : "—"}
        </div>
      </div>

      {/* Master Export Section */}
      <div className="export-section">
        <h3>🎵 Master Export</h3>
        
        <div className="preset-selector">
          <label>Mastering Preset:</label>
          <select 
            value={selectedPreset} 
            onChange={(e) => setSelectedPreset(e.target.value)}
            disabled={isExporting}
          >
            {presets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name} - {preset.description}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="export-btn master"
          onClick={exportMaster}
          disabled={isExporting || (!vocal?.filePath && !beat?.filePath && !fx?.filePath)}
        >
          {isExporting ? "⏳ Exporting..." : "🎧 Export Master Track"}
        </button>
        
        <p className="export-info">
          Exports WAV (48kHz) + MP3 (320kbps) with AI mastering
        </p>
      </div>

      {/* Stem Export Section */}
      <div className="export-section">
        <h3>🎚️ Stem Export</h3>
        
        <div className="stem-selector">
          <label>Select stems to export:</label>
          <div className="stem-options">
            {stemTypes.map(stem => (
              <label key={stem.id} className="stem-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStems.includes(stem.id)}
                  onChange={() => toggleStem(stem.id)}
                  disabled={isExporting}
                />
                <span className="stem-name">{stem.name}</span>
                <span className="stem-desc">{stem.description}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          className="export-btn stems"
          onClick={exportStems}
          disabled={isExporting || (!vocal?.filePath && !beat?.filePath) || selectedStems.length === 0}
        >
          {isExporting ? "⏳ Exporting..." : "🎚️ Export Stems"}
        </button>
        
        <p className="export-info">
          Extracts frequency-based stems from your mix
        </p>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {/* Status Message */}
      {status && (
        <div className={`status-message ${status.includes("✅") ? "success" : status.includes("❌") ? "error" : "info"}`}>
          {status}
        </div>
      )}

      {/* Last Export Downloads */}
      {lastExport && (
        <div className="last-export">
          <h4>📥 Download Export</h4>
          {lastExport.type === "master" && (
            <div className="download-links">
              {lastExport.wavUrl && (
                <a 
                  href={`${API_BASE}${lastExport.wavUrl}`} 
                  className="download-btn wav"
                  download
                >
                  📁 WAV ({formatSize(lastExport.wavSize)})
                </a>
              )}
              {lastExport.mp3Url && (
                <a 
                  href={`${API_BASE}${lastExport.mp3Url}`} 
                  className="download-btn mp3"
                  download
                >
                  🎵 MP3 ({formatSize(lastExport.mp3Size)})
                </a>
              )}
            </div>
          )}
          {lastExport.type === "stems" && lastExport.downloads && (
            <div className="download-links stems">
              {Object.entries(lastExport.downloads).map(([stem, url]) => (
                <a 
                  key={stem}
                  href={`${API_BASE}${url}`} 
                  className="download-btn stem"
                  download
                >
                  🎚️ {stem}.wav
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export History */}
      {(exports.masters.length > 0 || exports.stemFolders.length > 0) && (
        <div className="export-history">
          <h4>📂 Export History</h4>
          
          {exports.masters.length > 0 && (
            <div className="history-section">
              <h5>Masters</h5>
              <div className="history-list">
                {exports.masters.slice(0, 5).map((file, idx) => (
                  <a 
                    key={idx}
                    href={`${API_BASE}${file.url}`}
                    className="history-item"
                    download
                  >
                    <span className="file-name">{file.filename}</span>
                    <span className="file-size">{formatSize(file.size)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {exports.stemFolders.length > 0 && (
            <div className="history-section">
              <h5>Stem Packs</h5>
              <div className="history-list">
                {exports.stemFolders.slice(0, 3).map((folder, idx) => (
                  <div key={idx} className="stem-folder">
                    <span className="folder-name">📁 {folder.folder}</span>
                    <span className="stem-count">{folder.files.length} stems</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


