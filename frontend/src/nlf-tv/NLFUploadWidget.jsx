// frontend/src/nlf-tv/NLFUploadWidget.jsx
// No Limit Forever TV - Upload Widget

import React, { useState, useRef } from "react";
import styles from "./styles/NLF.module.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function NLFUploadWidget({ onUploadComplete }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "premiere",
    artist: "",
    tags: "",
    isPremiere: true,
    isExclusive: true,
    featured: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type.startsWith("video/")) {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }));
      }
    } else {
      setMessage({ type: "error", text: "Please select a video file" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      // For now, just register the video metadata
      // In production, you'd upload to Cloudinary first
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        // videoUrl would come from Cloudinary upload
      };

      const res = await fetch(`${API_BASE}/api/nlf/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Video uploaded successfully!" });
        setFormData({
          title: "",
          description: "",
          type: "premiere",
          artist: "",
          tags: "",
          isPremiere: true,
          isExclusive: true,
          featured: false,
        });
        setSelectedFile(null);
        if (onUploadComplete) {
          onUploadComplete(data.broadcast);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch (err) {
      console.error("[NLF] Upload error:", err);
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={`${styles.uploadWidget} ${dragActive ? styles.dragActive : ""}`}>
      <div
        className={styles.uploadZone}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
        
        <div className={styles.uploadIcon}>🎬</div>
        
        {selectedFile ? (
          <>
            <p className={styles.uploadText}>Selected: {selectedFile.name}</p>
            <p className={styles.uploadSubtext}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <p className={styles.uploadText}>
              Drag & drop your video here
            </p>
            <p className={styles.uploadSubtext}>
              or click to browse • MP4, MOV, WebM supported
            </p>
          </>
        )}
      </div>

      <form className={styles.uploadForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter video title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter video description"
            rows={4}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="type">Content Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="premiere">Premiere</option>
              <option value="concert">Concert</option>
              <option value="documentary">Documentary</option>
              <option value="interview">Interview</option>
              <option value="special">Special</option>
              <option value="live">Live</option>
              <option value="rerun">Rerun</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="artist">Artist / Creator</label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleInputChange}
              placeholder="Artist name"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="e.g., rap, hip-hop, exclusive"
          />
        </div>

        <div className={styles.formRow}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="isPremiere"
              checked={formData.isPremiere}
              onChange={handleInputChange}
            />
            <span>Premiere</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="isExclusive"
              checked={formData.isExclusive}
              onChange={handleInputChange}
            />
            <span>Exclusive</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
            />
            <span>Featured</span>
          </label>
        </div>

        {message && (
          <div style={{
            padding: "1rem",
            borderRadius: "8px",
            background: message.type === "error" ? "rgba(255, 68, 68, 0.2)" : "rgba(0, 255, 136, 0.2)",
            color: message.type === "error" ? "#ff4444" : "#00ff88",
          }}>
            {message.text}
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{
              height: "8px",
              background: "#1a1a1a",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #FFD700, #B8860B)",
                transition: "width 0.3s",
              }} />
            </div>
            <p style={{ textAlign: "center", marginTop: "0.5rem", color: "#888" }}>
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        <button
          type="submit"
          className={styles.uploadBtn}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload to NLF TV"}
        </button>
      </form>
    </div>
  );
}



