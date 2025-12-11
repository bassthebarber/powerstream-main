// frontend/src/studio/components/RoyaltyRegistrationPanel.jsx
// Copyright & Ownership Registration Panel

import { useEffect, useState } from "react";
import "./RoyaltyRegistrationPanel.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function RoyaltyRegistrationPanel({ 
  workId,
  projectTitle,
  projectDuration,
  projectGenre,
  onRegistrationComplete,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Registration form state
  const [formData, setFormData] = useState({
    title: projectTitle || "",
    type: "song",
    owners: [
      { name: "", role: "artist", split: 100, wallet: "SPS_MASTER" }
    ],
  });

  useEffect(() => {
    if (workId) {
      loadRegistrations();
    } else {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    if (projectTitle) {
      setFormData(prev => ({ ...prev, title: projectTitle }));
    }
  }, [projectTitle]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/royalty/register/work/${workId}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const addOwner = () => {
    setFormData(prev => ({
      ...prev,
      owners: [
        ...prev.owners,
        { name: "", role: "writer", split: 0, wallet: "SPS_MASTER" }
      ]
    }));
  };

  const removeOwner = (index) => {
    if (formData.owners.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.filter((_, i) => i !== index)
    }));
  };

  const updateOwner = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.map((owner, i) => 
        i === index ? { ...owner, [field]: field === "split" ? parseFloat(value) || 0 : value } : owner
      )
    }));
  };

  const getTotalSplit = () => {
    return formData.owners.reduce((sum, o) => sum + (o.split || 0), 0);
  };

  const handleRegister = async () => {
    // Validate
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (formData.owners.some(o => !o.name.trim())) {
      setError("All owners must have a name");
      return;
    }

    const totalSplit = getTotalSplit();
    if (Math.abs(totalSplit - 100) > 0.01) {
      setError(`Ownership splits must total 100% (currently ${totalSplit}%)`);
      return;
    }

    setRegistering(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/royalty/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId,
          title: formData.title,
          type: formData.type,
          owners: formData.owners,
          duration: projectDuration,
          genre: projectGenre,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("✅ Copyright registered successfully!");
        setShowRegister(false);
        setItems(prev => [data.registration, ...prev]);
        
        if (onRegistrationComplete) {
          onRegistrationComplete(data.registration);
        }

        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Failed to register: " + err.message);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roleOptions = [
    { value: "artist", label: "Artist" },
    { value: "producer", label: "Producer" },
    { value: "writer", label: "Writer" },
    { value: "composer", label: "Composer" },
    { value: "engineer", label: "Engineer" },
    { value: "label", label: "Label" },
    { value: "publisher", label: "Publisher" },
    { value: "manager", label: "Manager" },
    { value: "performer", label: "Performer" },
  ];

  const typeOptions = [
    { value: "song", label: "Song" },
    { value: "beat", label: "Beat" },
    { value: "stem", label: "Stem" },
    { value: "mix", label: "Mix" },
    { value: "recording", label: "Recording" },
    { value: "video", label: "Video" },
    { value: "album", label: "Album" },
    { value: "ep", label: "EP" },
    { value: "single", label: "Single" },
  ];

  return (
    <div className="royalty-reg-panel">
      <div className="reg-header">
        <h3>📜 Copyright & Registration Ledger</h3>
        <button 
          className="register-new-btn"
          onClick={() => setShowRegister(!showRegister)}
        >
          {showRegister ? "Cancel" : "➕ Register New Work"}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="reg-success">{success}</div>
      )}

      {/* Error message */}
      {error && (
        <div className="reg-error">
          ⚠️ {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Registration Form */}
      {showRegister && (
        <div className="reg-form">
          <h4>Register Copyright</h4>

          <div className="form-group">
            <label>Work Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter title..."
            />
          </div>

          <div className="form-group">
            <label>Work Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ownership Structure</label>
            <div className="owners-list">
              {formData.owners.map((owner, index) => (
                <div key={index} className="owner-row">
                  <input
                    type="text"
                    placeholder="Name"
                    value={owner.name}
                    onChange={(e) => updateOwner(index, "name", e.target.value)}
                    className="owner-name"
                  />
                  <select
                    value={owner.role}
                    onChange={(e) => updateOwner(index, "role", e.target.value)}
                    className="owner-role"
                  >
                    {roleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="owner-split">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={owner.split}
                      onChange={(e) => updateOwner(index, "split", e.target.value)}
                    />
                    <span>%</span>
                  </div>
                  {formData.owners.length > 1 && (
                    <button 
                      className="remove-owner-btn"
                      onClick={() => removeOwner(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="split-summary">
              <span className={getTotalSplit() === 100 ? "valid" : "invalid"}>
                Total: {getTotalSplit()}%
              </span>
              <button className="add-owner-btn" onClick={addOwner}>
                + Add Owner
              </button>
            </div>
          </div>

          <button 
            className="submit-reg-btn"
            onClick={handleRegister}
            disabled={registering || getTotalSplit() !== 100}
          >
            {registering ? "⏳ Registering..." : "📝 Register Copyright"}
          </button>
        </div>
      )}

      {/* Registrations List */}
      <div className="reg-list">
        {loading ? (
          <div className="reg-loading">Loading registrations...</div>
        ) : items.length === 0 ? (
          <div className="reg-empty">
            <span className="empty-icon">📋</span>
            <p>No registrations yet</p>
            <p className="empty-hint">Register your work to protect your copyright</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="reg-item">
              <div className="reg-item-header">
                <div className="reg-title">
                  <span className="type-badge">{item.type}</span>
                  <strong>{item.title}</strong>
                </div>
                <span className={`status-badge ${item.status}`}>
                  {item.status}
                </span>
              </div>

              <div className="reg-item-summary">
                {item.copyrightSummary}
              </div>

              <div className="reg-item-owners">
                <span className="owners-label">Ownership:</span>
                {item.owners?.map((owner, i) => (
                  <span key={i} className="owner-tag">
                    {owner.name} ({owner.role}, {owner.split}%)
                  </span>
                ))}
              </div>

              {item.aiKeywords && item.aiKeywords.length > 0 && (
                <div className="reg-item-keywords">
                  {item.aiKeywords.map((kw, i) => (
                    <span key={i} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              )}

              <div className="reg-item-footer">
                <span className="reg-date">
                  Registered: {formatDate(item.registeredAt)}
                </span>
                <span className="hash-proof" title={item.hashedProof}>
                  🔐 {item.hashedProof?.slice(0, 12)}...
                </span>
              </div>

              {item.copyrightLegalText && (
                <details className="legal-details">
                  <summary>View Legal Text</summary>
                  <pre className="legal-text">{item.copyrightLegalText}</pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

