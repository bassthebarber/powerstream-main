// frontend/src/studio/ui/RoyaltyPanel.jsx
// Royalty Splits Management Panel for Studio

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RoyaltyService } from "../services/RoyaltyService";
import "./RoyaltyPanel.css";

const ROLES = [
  { value: "producer", label: "Producer" },
  { value: "artist", label: "Artist" },
  { value: "composer", label: "Composer/Writer" },
  { value: "lyricist", label: "Lyricist" },
  { value: "engineer", label: "Engineer" },
];

// Platform default split
const SPS_PUBLISHER = {
  id: "sps_publisher",
  role: "publisher",
  name: "Southern Power Syndicate",
  share: 30,
  ipiNumber: "",
  isFixed: true, // Cannot be removed
};

const DEFAULT_SPLIT = {
  id: Date.now(),
  role: "artist",
  name: "",
  share: 0,
  ipiNumber: "",
};

export default function RoyaltyPanel({ 
  masterData = {},
  currentUserId,
  onSaveSuccess,
}) {
  // Splits state - starts with SPS publisher + empty artist slot
  const [splits, setSplits] = useState([
    { ...DEFAULT_SPLIT, id: Date.now(), share: 70 },
  ]);
  
  // Master metadata
  const [masterTitle, setMasterTitle] = useState(masterData.title || "Untitled Track");
  const [bpm, setBpm] = useState(masterData.bpm || "");
  const [key, setKey] = useState(masterData.key || "");
  const [genre, setGenre] = useState(masterData.genre || "");
  const [durationSeconds, setDurationSeconds] = useState(masterData.durationSeconds || 0);
  const [masterUrl, setMasterUrl] = useState(masterData.audioUrl || "");
  
  // Export options
  const [formats, setFormats] = useState({
    mp3: true,
    wav: true,
    stems: false,
  });
  const [isClean, setIsClean] = useState(true);
  const [isExplicit, setIsExplicit] = useState(false);
  
  // PRO affiliations
  const [proAffiliations, setProAffiliations] = useState(["BMI"]);
  
  // State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSavedWork, setLastSavedWork] = useState(null);
  
  // Update when masterData changes
  useEffect(() => {
    if (masterData.title) setMasterTitle(masterData.title);
    if (masterData.bpm) setBpm(masterData.bpm);
    if (masterData.key) setKey(masterData.key);
    if (masterData.genre) setGenre(masterData.genre);
    if (masterData.durationSeconds) setDurationSeconds(masterData.durationSeconds);
    if (masterData.audioUrl) setMasterUrl(masterData.audioUrl);
  }, [masterData]);
  
  // Calculate total shares
  const totalShares = useMemo(() => {
    const writerShares = splits.reduce((sum, s) => sum + (parseFloat(s.share) || 0), 0);
    return writerShares + SPS_PUBLISHER.share;
  }, [splits]);
  
  const isValidTotal = totalShares === 100;
  
  // Add new split row
  const addSplit = () => {
    setSplits([
      ...splits,
      {
        id: Date.now(),
        role: "artist",
        name: "",
        share: 0,
        ipiNumber: "",
      },
    ]);
  };
  
  // Remove split row
  const removeSplit = (id) => {
    setSplits(splits.filter((s) => s.id !== id));
  };
  
  // Update split field
  const updateSplit = (id, field, value) => {
    setSplits(
      splits.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };
  
  // Toggle PRO
  const togglePRO = (pro) => {
    if (proAffiliations.includes(pro)) {
      setProAffiliations(proAffiliations.filter((p) => p !== pro));
    } else {
      setProAffiliations([...proAffiliations, pro]);
    }
  };
  
  // Save royalty setup
  const handleSave = async () => {
    // Validation
    if (!masterTitle.trim()) {
      setError("Please enter a track title");
      return;
    }
    
    if (!isValidTotal) {
      setError(`Total shares must equal 100%. Currently: ${totalShares}%`);
      return;
    }
    
    const emptyNames = splits.filter((s) => !s.name.trim());
    if (emptyNames.length > 0) {
      setError("All writers must have a name");
      return;
    }
    
    setError("");
    setSaving(true);
    
    try {
      // Build writers array including SPS
      const writers = [
        // SPS Publisher
        {
          name: SPS_PUBLISHER.name,
          role: SPS_PUBLISHER.role,
          share: SPS_PUBLISHER.share,
          ipiNumber: "",
        },
        // User-defined splits
        ...splits.map((s) => ({
          name: s.name,
          role: s.role,
          share: parseFloat(s.share) || 0,
          ipiNumber: s.ipiNumber || "",
        })),
      ];
      
      const payload = {
        title: masterTitle,
        ownerUserId: currentUserId || null,
        bpm: parseInt(bpm) || null,
        key: key || null,
        genre: genre || null,
        durationSeconds: parseFloat(durationSeconds) || null,
        masterUrl: masterUrl || null,
        proAffiliations,
        writers,
        isClean,
        isExplicit,
        formats: Object.keys(formats).filter((k) => formats[k]),
      };
      
      const resp = await RoyaltyService.createWorkFromExport(payload);
      
      if (resp.success) {
        setSuccess("Royalty work registered successfully!");
        setLastSavedWork(resp.work);
        
        if (onSaveSuccess) {
          onSaveSuccess(resp.work);
        }
        
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(resp.error || "Failed to save royalty setup");
      }
    } catch (err) {
      console.error("[RoyaltyPanel] Save error:", err);
      setError("Failed to save royalty setup");
    } finally {
      setSaving(false);
    }
  };
  
  // Auto-distribute shares
  const autoDistribute = () => {
    const remainingShare = 100 - SPS_PUBLISHER.share;
    const perWriter = Math.floor(remainingShare / splits.length);
    const remainder = remainingShare - perWriter * splits.length;
    
    setSplits(
      splits.map((s, i) => ({
        ...s,
        share: perWriter + (i === 0 ? remainder : 0),
      }))
    );
  };

  return (
    <div className="royalty-panel">
      <div className="royalty-header">
        <span className="royalty-icon">💰</span>
        <h3>Royalty Splits</h3>
      </div>
      
      {/* Track Info */}
      <div className="track-info-section">
        <div className="form-row">
          <label>Track Title</label>
          <input
            type="text"
            value={masterTitle}
            onChange={(e) => setMasterTitle(e.target.value)}
            placeholder="Enter track title"
          />
        </div>
        
        <div className="form-row-grid">
          <div className="form-row">
            <label>BPM</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="120"
            />
          </div>
          <div className="form-row">
            <label>Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="C Major"
            />
          </div>
          <div className="form-row">
            <label>Genre</label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Hip Hop"
            />
          </div>
        </div>
      </div>
      
      {/* PRO Affiliations */}
      <div className="pro-section">
        <label>PRO Affiliations</label>
        <div className="pro-buttons">
          {["BMI", "ASCAP", "SESAC", "PRS", "GEMA"].map((pro) => (
            <button
              key={pro}
              className={`pro-btn ${proAffiliations.includes(pro) ? "active" : ""}`}
              onClick={() => togglePRO(pro)}
            >
              {pro}
            </button>
          ))}
        </div>
      </div>
      
      {/* Splits Table */}
      <div className="splits-section">
        <div className="splits-header">
          <h4>Revenue Splits</h4>
          <div className="splits-actions">
            <button className="auto-btn" onClick={autoDistribute}>
              Auto-Distribute
            </button>
            <button className="add-btn" onClick={addSplit}>
              + Add Writer
            </button>
          </div>
        </div>
        
        {/* SPS Fixed Row */}
        <div className="split-row fixed">
          <div className="split-role">
            <span className="role-badge publisher">Publisher</span>
          </div>
          <div className="split-name">
            <span className="fixed-name">{SPS_PUBLISHER.name}</span>
          </div>
          <div className="split-share">
            <span className="share-value">{SPS_PUBLISHER.share}%</span>
          </div>
          <div className="split-actions">
            <span className="locked-icon">🔒</span>
          </div>
        </div>
        
        {/* Writer Rows */}
        {splits.map((split, index) => (
          <div key={split.id} className="split-row">
            <div className="split-role">
              <select
                value={split.role}
                onChange={(e) => updateSplit(split.id, "role", e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="split-name">
              <input
                type="text"
                value={split.name}
                onChange={(e) => updateSplit(split.id, "name", e.target.value)}
                placeholder="Name"
              />
            </div>
            <div className="split-share">
              <input
                type="number"
                min="0"
                max="100"
                value={split.share}
                onChange={(e) => updateSplit(split.id, "share", e.target.value)}
              />
              <span>%</span>
            </div>
            <div className="split-ipi">
              <input
                type="text"
                value={split.ipiNumber}
                onChange={(e) => updateSplit(split.id, "ipiNumber", e.target.value)}
                placeholder="IPI #"
              />
            </div>
            <div className="split-actions">
              {splits.length > 1 && (
                <button
                  className="remove-btn"
                  onClick={() => removeSplit(split.id)}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        
        {/* Total */}
        <div className={`splits-total ${isValidTotal ? "valid" : "invalid"}`}>
          <span>Total:</span>
          <span className="total-value">{totalShares}%</span>
          {!isValidTotal && (
            <span className="total-warning">
              {totalShares < 100 ? `Missing ${100 - totalShares}%` : `Over by ${totalShares - 100}%`}
            </span>
          )}
        </div>
      </div>
      
      {/* Format Options */}
      <div className="format-section">
        <h4>Export Formats</h4>
        <div className="format-options">
          <label className={formats.mp3 ? "active" : ""}>
            <input
              type="checkbox"
              checked={formats.mp3}
              onChange={(e) => setFormats({ ...formats, mp3: e.target.checked })}
            />
            MP3
          </label>
          <label className={formats.wav ? "active" : ""}>
            <input
              type="checkbox"
              checked={formats.wav}
              onChange={(e) => setFormats({ ...formats, wav: e.target.checked })}
            />
            WAV
          </label>
          <label className={formats.stems ? "active" : ""}>
            <input
              type="checkbox"
              checked={formats.stems}
              onChange={(e) => setFormats({ ...formats, stems: e.target.checked })}
            />
            Stems
          </label>
        </div>
        
        <div className="content-flags">
          <label className={isClean ? "active" : ""}>
            <input
              type="checkbox"
              checked={isClean}
              onChange={(e) => setIsClean(e.target.checked)}
            />
            Clean Version
          </label>
          <label className={isExplicit ? "active" : ""}>
            <input
              type="checkbox"
              checked={isExplicit}
              onChange={(e) => setIsExplicit(e.target.checked)}
            />
            Explicit Content
          </label>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="save-section">
        {error && <div className="error-message">⚠️ {error}</div>}
        {success && <div className="success-message">✅ {success}</div>}
        
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !isValidTotal}
        >
          {saving ? "Saving..." : "💾 Save Royalty Setup for This Master"}
        </button>
        
        {lastSavedWork && (
          <div className="saved-work-info">
            <span>Work ID: {lastSavedWork._id}</span>
            <span>Status: {lastSavedWork.registrationStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}


