// frontend/studio-app/src/pages/CoachAdmin.jsx

import React, { useEffect, useState } from "react";
import "./CoachAdmin.css";

const API_BASE = import.meta.env.VITE_STUDIO_API_BASE_URL || "";

const COACH_KEYS = ["standard", "dre", "master_p", "kanye", "timbaland", "motivational"];

const CoachAdmin = () => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit form state
  const [editingKey, setEditingKey] = useState(null);
  const [formData, setFormData] = useState({
    key: "",
    displayName: "",
    description: "",
    stylePrompt: "",
    active: true,
  });

  // Fetch all personas
  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/aicoach/personas`);
      if (!res.ok) throw new Error("Failed to fetch personas");
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Seed default personas
  const seedPersonas = async () => {
    try {
      setError("");
      setSuccessMsg("");
      const res = await fetch(`${API_BASE}/api/aicoach/personas/seed`, {
        method: "POST",
      });
      const data = await res.json();
      setSuccessMsg(data.message);
      fetchPersonas();
    } catch (err) {
      setError(err.message);
    }
  };

  // Save persona
  const savePersona = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccessMsg("");
      const res = await fetch(`${API_BASE}/api/aicoach/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save");
      }
      setSuccessMsg("Persona saved successfully!");
      setEditingKey(null);
      setFormData({ key: "", displayName: "", description: "", stylePrompt: "", active: true });
      fetchPersonas();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete persona
  const deletePersona = async (key) => {
    if (key === "standard") {
      setError("Cannot delete the standard persona");
      return;
    }
    if (!confirm(`Delete persona "${key}"?`)) return;

    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/aicoach/personas/${key}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete");
      }
      setSuccessMsg("Persona deleted successfully!");
      fetchPersonas();
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit persona
  const startEdit = (persona) => {
    setEditingKey(persona.key);
    setFormData({
      key: persona.key,
      displayName: persona.displayName,
      description: persona.description || "",
      stylePrompt: persona.stylePrompt,
      active: persona.active,
    });
    setError("");
    setSuccessMsg("");
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingKey(null);
    setFormData({ key: "", displayName: "", description: "", stylePrompt: "", active: true });
  };

  // Add new persona
  const startNewPersona = () => {
    setEditingKey("__new__");
    setFormData({ key: "", displayName: "", description: "", stylePrompt: "", active: true });
    setError("");
    setSuccessMsg("");
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  return (
    <div className="coach-admin-screen">
      <div className="coach-admin-header">
        <div className="coach-admin-title-block">
          <h1 className="coach-admin-title">AI Coach Personas</h1>
          <p className="coach-admin-subtitle">
            Manage how each coach mode talks, gives feedback, and motivates artists.
          </p>
        </div>
        <div className="coach-admin-actions">
          <button className="coach-admin-btn" onClick={seedPersonas}>
            🌱 Seed Defaults
          </button>
          <button className="coach-admin-btn coach-admin-btn--gold" onClick={startNewPersona}>
            + Add Persona
          </button>
        </div>
      </div>

      {error && <div className="coach-admin-error">{error}</div>}
      {successMsg && <div className="coach-admin-success">{successMsg}</div>}

      {/* Edit Form */}
      {editingKey && (
        <div className="coach-admin-form-card">
          <h2 className="coach-admin-form-title">
            {editingKey === "__new__" ? "Create New Persona" : `Edit: ${formData.displayName}`}
          </h2>
          <form onSubmit={savePersona}>
            <div className="coach-admin-form-row">
              <div className="coach-admin-field">
                <label>Key (unique identifier)</label>
                <select
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  disabled={editingKey !== "__new__"}
                  required
                >
                  <option value="">Select a key...</option>
                  {COACH_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="coach-admin-field">
                <label>Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Precision Mode (Dre)"
                  required
                />
              </div>
            </div>

            <div className="coach-admin-field">
              <label>Description (short summary)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Meticulous attention to detail..."
              />
            </div>

            <div className="coach-admin-field">
              <label>Style Prompt (how this coach talks)</label>
              <textarea
                value={formData.stylePrompt}
                onChange={(e) => setFormData({ ...formData, stylePrompt: e.target.value })}
                placeholder="Describe the persona's voice, style, catchphrases, attitude..."
                rows={6}
                required
              />
              <small>
                This is the instruction given to the AI. Describe the persona's voice, tone,
                catchphrases, and coaching style in detail.
              </small>
            </div>

            <div className="coach-admin-field coach-admin-field--checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                Active (available for artists to use)
              </label>
            </div>

            <div className="coach-admin-form-actions">
              <button type="submit" className="coach-admin-btn coach-admin-btn--gold">
                💾 Save Persona
              </button>
              <button type="button" className="coach-admin-btn" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Personas List */}
      <div className="coach-admin-list">
        <h2 className="coach-admin-section-title">Current Personas</h2>
        {loading ? (
          <div className="coach-admin-loading">Loading personas...</div>
        ) : personas.length === 0 ? (
          <div className="coach-admin-empty">
            No personas found. Click "Seed Defaults" to create the standard set.
          </div>
        ) : (
          <div className="coach-admin-grid">
            {personas.map((p) => (
              <div
                key={p.key}
                className={`coach-admin-persona-card ${!p.active ? "coach-admin-persona-card--inactive" : ""}`}
              >
                <div className="coach-admin-persona-header">
                  <h3 className="coach-admin-persona-name">{p.displayName}</h3>
                  <span className={`coach-admin-persona-status ${p.active ? "active" : "inactive"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="coach-admin-persona-key">Key: {p.key}</div>
                {p.description && (
                  <p className="coach-admin-persona-desc">{p.description}</p>
                )}
                <div className="coach-admin-persona-prompt">
                  <strong>Style Prompt:</strong>
                  <p>{p.stylePrompt}</p>
                </div>
                <div className="coach-admin-persona-actions">
                  <button
                    className="coach-admin-btn coach-admin-btn--small"
                    onClick={() => startEdit(p)}
                  >
                    ✏️ Edit
                  </button>
                  {p.key !== "standard" && (
                    <button
                      className="coach-admin-btn coach-admin-btn--small coach-admin-btn--danger"
                      onClick={() => deletePersona(p.key)}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachAdmin;






