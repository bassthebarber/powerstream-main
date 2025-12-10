// frontend/src/pages/studio/StudioMasterPage.jsx
// Mastering Suite - Professional audio mastering with AI assistance

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import studioApi from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

const MASTER_PRESETS = {
  streaming: {
    name: "Streaming",
    icon: "📱",
    description: "Optimized for Spotify, Apple Music, YouTube",
    settings: { loudness: -14, ceiling: -1, stereoWidth: 100, warmth: 20 },
  },
  club: {
    name: "Club",
    icon: "🎉",
    description: "Heavy bass, loud for club systems",
    settings: { loudness: -8, ceiling: -0.3, stereoWidth: 120, warmth: 40 },
  },
  broadcast: {
    name: "Broadcast",
    icon: "📺",
    description: "TV and radio standards compliant",
    settings: { loudness: -24, ceiling: -3, stereoWidth: 90, warmth: 15 },
  },
  vinyl: {
    name: "Vinyl",
    icon: "💿",
    description: "Warm, analog-style mastering",
    settings: { loudness: -12, ceiling: -1.5, stereoWidth: 95, warmth: 60 },
  },
  podcast: {
    name: "Podcast",
    icon: "🎙️",
    description: "Clear voice, consistent levels",
    settings: { loudness: -16, ceiling: -2, stereoWidth: 80, warmth: 10 },
  },
};

export default function StudioMasterPage() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState("streaming");
  const [customSettings, setCustomSettings] = useState(MASTER_PRESETS.streaming.settings);
  const [isCustom, setIsCustom] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [masteredUrl, setMasteredUrl] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [libraryItems, setLibraryItems] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const res = await studioApi.getLibraryItems("mix", 20);
      if (res?.ok) {
        setLibraryItems(res.items || []);
      }
    } catch (err) {
      console.error("Failed to load library:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setMasteredUrl(null);
    }
  };

  const handleLibrarySelect = (item) => {
    setAudioUrl(item.url);
    setSelectedFile({ name: item.name });
    setMasteredUrl(null);
    setShowLibrary(false);
  };

  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey);
    setCustomSettings(MASTER_PRESETS[presetKey].settings);
    setIsCustom(false);
  };

  const handleSettingChange = (key, value) => {
    setCustomSettings((prev) => ({ ...prev, [key]: value }));
    setIsCustom(true);
  };

  const handleMaster = async () => {
    if (!audioUrl) {
      setError("Please select an audio file to master");
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await studioApi.applyMaster(audioUrl, selectedPreset, customSettings);
      if (res?.ok) {
        setMasteredUrl(res.url);
        setSuccess("Mastering complete! Your track is ready for download.");
      } else {
        throw new Error(res?.message || "Mastering failed");
      }
    } catch (err) {
      setError(err.message || "Failed to master track");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (masteredUrl) {
      const link = document.createElement("a");
      link.href = masteredUrl;
      link.download = `${selectedFile?.name?.replace(/\.[^/.]+$/, "") || "master"}_mastered.wav`;
      link.click();
    }
  };

  const preset = MASTER_PRESETS[selectedPreset];

  return (
    <div className="studio-page">
      <header className="studio-page-header">
        <button className="studio-back-btn" onClick={() => navigate("/studio")}>
          ← Back
        </button>
        <h1 className="studio-page-title">💿 Mastering Suite</h1>
        <p className="studio-page-subtitle">Professional AI-powered audio mastering</p>
      </header>

      {error && (
        <div className="studio-alert studio-alert--error">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="studio-alert studio-alert--success">
          ✅ {success}
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="studio-grid studio-grid--2">
        {/* Left Panel - Source Selection */}
        <div className="studio-card">
          <h3 className="studio-card-title">📁 Source Audio</h3>
          
          <div className="source-options">
            <label className="upload-zone">
              <input type="file" accept="audio/*" onChange={handleFileSelect} hidden />
              <span className="upload-icon">⬆️</span>
              <span className="upload-text">
                {selectedFile ? selectedFile.name : "Drop audio file or click to upload"}
              </span>
            </label>
            
            <button className="studio-btn studio-btn--outline" onClick={() => setShowLibrary(!showLibrary)}>
              📚 Select from Library
            </button>
          </div>

          {showLibrary && libraryItems.length > 0 && (
            <div className="library-picker">
              {libraryItems.map((item) => (
                <button
                  key={item.id}
                  className="library-item"
                  onClick={() => handleLibrarySelect(item)}
                >
                  <span className="library-item-icon">🎵</span>
                  <span className="library-item-name">{item.name}</span>
                </button>
              ))}
            </div>
          )}

          {audioUrl && (
            <div className="audio-preview">
              <audio ref={audioRef} src={audioUrl} controls style={{ width: "100%" }} />
            </div>
          )}
        </div>

        {/* Right Panel - Preset Selection */}
        <div className="studio-card">
          <h3 className="studio-card-title">🎛️ Mastering Preset</h3>
          
          <div className="preset-grid">
            {Object.entries(MASTER_PRESETS).map(([key, p]) => (
              <button
                key={key}
                className={`preset-card ${selectedPreset === key ? "preset-card--active" : ""}`}
                onClick={() => handlePresetSelect(key)}
              >
                <span className="preset-icon">{p.icon}</span>
                <span className="preset-name">{p.name}</span>
                <span className="preset-desc">{p.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="studio-card">
        <h3 className="studio-card-title">
          ⚙️ Settings
          {isCustom && <span className="custom-badge">Custom</span>}
        </h3>
        
        <div className="settings-grid">
          <div className="setting-item">
            <label className="setting-label">Target Loudness (LUFS)</label>
            <input
              type="range"
              className="studio-slider"
              min="-24"
              max="-6"
              value={customSettings.loudness}
              onChange={(e) => handleSettingChange("loudness", Number(e.target.value))}
            />
            <span className="setting-value">{customSettings.loudness} LUFS</span>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">True Peak Ceiling</label>
            <input
              type="range"
              className="studio-slider"
              min="-6"
              max="0"
              step="0.1"
              value={customSettings.ceiling}
              onChange={(e) => handleSettingChange("ceiling", Number(e.target.value))}
            />
            <span className="setting-value">{customSettings.ceiling} dB</span>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">Stereo Width</label>
            <input
              type="range"
              className="studio-slider"
              min="50"
              max="150"
              value={customSettings.stereoWidth}
              onChange={(e) => handleSettingChange("stereoWidth", Number(e.target.value))}
            />
            <span className="setting-value">{customSettings.stereoWidth}%</span>
          </div>
          
          <div className="setting-item">
            <label className="setting-label">Warmth / Saturation</label>
            <input
              type="range"
              className="studio-slider"
              min="0"
              max="100"
              value={customSettings.warmth}
              onChange={(e) => handleSettingChange("warmth", Number(e.target.value))}
            />
            <span className="setting-value">{customSettings.warmth}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-row">
        <button
          className="studio-btn studio-btn--primary studio-btn--large"
          onClick={handleMaster}
          disabled={!audioUrl || processing}
        >
          {processing ? "⏳ Mastering..." : "💿 Master Track"}
        </button>

        {masteredUrl && (
          <button className="studio-btn studio-btn--success studio-btn--large" onClick={handleDownload}>
            ⬇️ Download Master
          </button>
        )}
      </div>

      {/* Mastered Result */}
      {masteredUrl && (
        <div className="studio-card studio-card--highlight">
          <h3 className="studio-card-title">🎉 Mastered Track</h3>
          <audio src={masteredUrl} controls style={{ width: "100%" }} />
        </div>
      )}

      <style>{`
        .studio-page {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .studio-page-header {
          margin-bottom: 24px;
        }

        .studio-back-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .studio-back-btn:hover {
          color: #fff;
        }

        .studio-page-title {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(90deg, #fff, #f783ac);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .studio-page-subtitle {
          color: #888;
          margin: 4px 0 0;
        }

        .studio-grid--2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .studio-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .studio-card--highlight {
          border-color: rgba(247, 131, 172, 0.3);
          background: rgba(247, 131, 172, 0.05);
        }

        .studio-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .custom-badge {
          background: rgba(255, 184, 77, 0.2);
          color: #ffb84d;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .source-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .upload-zone {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-zone:hover {
          border-color: rgba(255, 184, 77, 0.3);
          background: rgba(255, 255, 255, 0.02);
        }

        .upload-icon {
          display: block;
          font-size: 32px;
          margin-bottom: 8px;
        }

        .upload-text {
          color: #888;
        }

        .library-picker {
          max-height: 200px;
          overflow-y: auto;
          margin-top: 12px;
        }

        .library-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          margin-bottom: 4px;
        }

        .library-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .audio-preview {
          margin-top: 16px;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }

        .preset-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-card:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .preset-card--active {
          border-color: #f783ac;
          background: rgba(247, 131, 172, 0.1);
        }

        .preset-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .preset-name {
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }

        .preset-desc {
          font-size: 0.7rem;
          color: #888;
          line-height: 1.3;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-label {
          font-size: 0.85rem;
          color: #888;
        }

        .studio-slider {
          width: 100%;
          accent-color: #f783ac;
        }

        .setting-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f783ac;
        }

        .action-row {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin: 24px 0;
        }

        .studio-btn--large {
          padding: 16px 32px;
          font-size: 1.1rem;
        }

        .studio-btn--success {
          background: linear-gradient(135deg, #00c864, #00a854);
        }

        .studio-alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .studio-alert--error {
          background: rgba(255, 68, 68, 0.15);
          color: #ff6666;
        }

        .studio-alert--success {
          background: rgba(0, 200, 100, 0.15);
          color: #00c864;
        }

        .studio-alert button {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .studio-grid--2 {
            grid-template-columns: 1fr;
          }

          .preset-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

