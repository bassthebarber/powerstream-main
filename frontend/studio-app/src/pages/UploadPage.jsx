// frontend/studio-app/src/pages/UploadPage.jsx
// Upload Tracks - Pro Upload Room with Drag & Drop

import React, { useState, useRef, useCallback } from "react";
import "../styles/studio.css";
import { STUDIO_API_BASE } from "../config/api.js";

// Use centralized API config
const STUDIO_API = STUDIO_API_BASE;

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      status: "queued", // queued | uploading | done | error
      progress: 0,
      url: null,
      error: null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Drag handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, []);

  // Upload single file
  const uploadFile = async (fileItem) => {
    const formData = new FormData();
    formData.append("file", fileItem.file);
    formData.append("name", fileItem.name);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: "uploading", progress: 0 } : f
      ));

      const res = await fetch(`${STUDIO_API}/api/upload/file`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // Update status to done
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: "done", progress: 100, url: data.asset?.url || data.url } 
          : f
      ));

      return true;
    } catch (err) {
      console.error("Upload error:", err);
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: "error", error: err.message } 
          : f
      ));
      return false;
    }
  };

  // Upload all queued files
  const uploadAll = async () => {
    const queuedFiles = files.filter(f => f.status === "queued");
    if (queuedFiles.length === 0) return;

    setIsUploading(true);
    let completed = 0;

    for (const fileItem of queuedFiles) {
      await uploadFile(fileItem);
      completed++;
      setOverallProgress(Math.round((completed / queuedFiles.length) * 100));
    }

    setIsUploading(false);
    setOverallProgress(0);
  };

  // Remove file from list
  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Clear all files
  const clearAll = () => {
    setFiles([]);
    setOverallProgress(0);
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "queued": return { icon: "⏳", color: "#888", label: "Queued" };
      case "uploading": return { icon: "⬆️", color: "#e6b800", label: "Uploading..." };
      case "done": return { icon: "✅", color: "#00c864", label: "Done" };
      case "error": return { icon: "❌", color: "#ff4455", label: "Error" };
      default: return { icon: "?", color: "#888", label: "Unknown" };
    }
  };

  const queuedCount = files.filter(f => f.status === "queued").length;
  const doneCount = files.filter(f => f.status === "done").length;

  return (
    <div className="studio-page">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Upload Tracks</h1>
          <p className="studio-subtitle">Pro Upload Room · Drag & Drop Your Files</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {files.length > 0 && (
            <span className="studio-badge" style={{ 
              background: "rgba(0,200,100,0.15)", 
              color: "#00c864",
              border: "1px solid rgba(0,200,100,0.3)"
            }}>
              {doneCount}/{files.length} Uploaded
            </span>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`studio-dropzone ${isDragging ? "studio-dropzone--active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          marginBottom: 24,
          borderColor: isDragging ? "var(--studio-gold)" : undefined,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: "none" }}
        />
        <div className="studio-dropzone-icon">
          {isDragging ? "📥" : "🎵"}
        </div>
        <div className="studio-dropzone-text">
          {isDragging ? "Drop files here..." : "Drag & drop files here, or click to browse"}
        </div>
        <div className="studio-dropzone-hint">
          Supports WAV, MP3, FLAC, MP4, MOV (up to 200MB)
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="studio-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="studio-card-title" style={{ margin: 0 }}>📁 Upload Queue</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="studio-btn studio-btn--sm"
                onClick={clearAll}
                disabled={isUploading}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Files */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {files.map(fileItem => {
              const statusInfo = getStatusInfo(fileItem.status);
              return (
                <div 
                  key={fileItem.id} 
                  className="studio-card"
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 16,
                    alignItems: "center"
                  }}
                >
                  {/* File info */}
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{fileItem.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
                      {formatSize(fileItem.size)}
                    </div>
                    {fileItem.status === "uploading" && (
                      <div className="studio-meter" style={{ marginTop: 8, height: 6 }}>
                        <div 
                          className="studio-meter-fill studio-meter-fill--animated"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    )}
                    {fileItem.error && (
                      <div style={{ fontSize: "0.8rem", color: "#ff4455", marginTop: 4 }}>
                        {fileItem.error}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div style={{ 
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: `${statusInfo.color}20`,
                    color: statusInfo.color,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <span>{statusInfo.icon}</span>
                    <span>{statusInfo.label}</span>
                  </div>

                  {/* Download link if done */}
                  {fileItem.status === "done" && fileItem.url && (
                    <a
                      href={fileItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="studio-btn studio-btn--sm studio-btn--outline"
                      style={{ textDecoration: "none" }}
                    >
                      🔗 View
                    </a>
                  )}

                  {/* Remove button */}
                  <button
                    className="studio-btn studio-btn--sm"
                    onClick={() => removeFile(fileItem.id)}
                    disabled={fileItem.status === "uploading"}
                    style={{ 
                      padding: "8px 12px",
                      background: "rgba(255,68,85,0.1)",
                      color: "#ff4455",
                      border: "none"
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Overall Progress */}
          {isUploading && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "#888" }}>Overall Progress</span>
                <span style={{ fontSize: "0.85rem", color: "#e6b800", fontWeight: 600 }}>
                  {overallProgress}%
                </span>
              </div>
              <div className="studio-meter">
                <div 
                  className="studio-meter-fill studio-meter-fill--animated"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            className="studio-btn studio-btn--gold studio-btn--lg"
            onClick={uploadAll}
            disabled={isUploading || queuedCount === 0}
            style={{ width: "100%" }}
          >
            {isUploading 
              ? `⏳ Uploading... ${overallProgress}%` 
              : `⬆️ Upload All (${queuedCount} files)`
            }
          </button>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="studio-panel" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📂</div>
          <div style={{ color: "#888", marginBottom: 8 }}>No files selected</div>
          <div style={{ color: "#555", fontSize: "0.9rem" }}>
            Drag & drop files above or click to browse
          </div>
        </div>
      )}
    </div>
  );
}
