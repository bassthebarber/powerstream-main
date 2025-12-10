// frontend/src/pages/studio/StudioUploadsPage.jsx
// File Upload Interface with Drag & Drop - Saves to Music Library
import React, { useState, useRef } from "react";
import { uploadFile } from "../../lib/studioApi.js";
import api from "../../api/api.js";
import "../../styles/studio-unified.css";

const STATIONS = [
  { value: "no-limit-east-houston", label: "No Limit East Houston" },
  { value: "southern-power-network", label: "Southern Power Network" },
  { value: "powerstream-music", label: "PowerStream Music" },
  { value: "gospel-network", label: "Gospel Network" },
];

const GENRES = ["Rap", "Hip-Hop", "R&B", "Gospel", "Pop", "Rock", "Jazz", "Electronic", "Country"];

export default function StudioUploadsPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef(null);
  
  // Metadata form state
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [metadata, setMetadata] = useState({
    title: "",
    artistName: "",
    albumName: "",
    genre: "Rap",
    stationKey: "powerstream-music",
    isExplicit: false,
    releaseDate: new Date().toISOString().split("T")[0],
  });

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
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("audio/") || f.name.match(/\.(wav|mp3|flac|m4a|aiff|ogg)$/i)
    );
    
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const filesWithStatus = newFiles.map(f => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      status: "ready",
      progress: 0,
      metadata: {
        title: f.name.replace(/\.[^/.]+$/, ""), // Remove extension
        artistName: "",
        albumName: "",
        genre: "Rap",
        stationKey: "powerstream-music",
        isExplicit: false,
        releaseDate: new Date().toISOString().split("T")[0],
      },
    }));
    setFiles(prev => [...prev, ...filesWithStatus]);
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const updateFileMetadata = (id, field, value) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, metadata: { ...f.metadata, [field]: value } } : f
    ));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    // Check if user is logged in
    const token = localStorage.getItem("powerstreamToken");
    if (!token) {
      setError("⚠️ You must be logged in to upload and save tracks. Please log in first.");
      return;
    }
    
    // Check if all files have artist names
    const missingArtist = files.find(f => !f.metadata.artistName?.trim());
    if (missingArtist) {
      setError("Please enter artist name for all tracks");
      return;
    }
    
    setUploading(true);
    setError("");
    setSuccess("");
    
    let successCount = 0;
    
    try {
      for (const fileItem of files) {
        if (fileItem.status === "done") {
          successCount++;
          continue;
        }
        
        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: "processing" } : f
        ));
        
        try {
          const fileSizeMB = (fileItem.file.size / 1024 / 1024).toFixed(2);
          console.log(`[Upload] Starting upload for: ${fileItem.file.name} (${fileSizeMB}MB)`);
          
          // Step 1: Upload file to Cloudinary
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: 10, statusText: `Uploading ${fileSizeMB}MB...` } : f
          ));
          
          // Check file size - warn if over 50MB
          if (fileItem.file.size > 50 * 1024 * 1024) {
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, statusText: `Large file (${fileSizeMB}MB) - please wait...` } : f
            ));
          }
          
          const uploadResult = await uploadFile(fileItem.file);
          console.log("[Upload] Cloudinary response:", uploadResult);
          
          if (!uploadResult.ok && !uploadResult.url) {
            throw new Error(uploadResult.error || "File upload failed - no URL returned");
          }
          
          const audioUrl = uploadResult.url || uploadResult.mediaUrl || uploadResult.videoUrl;
          
          if (!audioUrl) {
            throw new Error("Upload succeeded but no audio URL was returned");
          }
          
          console.log("[Upload] Audio URL obtained:", audioUrl);
          
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: 70 } : f
          ));
          
          // Step 2: Create AudioTrack in database
          const trackData = {
            stationKey: fileItem.metadata.stationKey,
            title: fileItem.metadata.title || fileItem.file.name.replace(/\.[^/.]+$/, ""),
            artistName: fileItem.metadata.artistName,
            albumName: fileItem.metadata.albumName || undefined,
            genre: fileItem.metadata.genre,
            isExplicit: fileItem.metadata.isExplicit,
            releaseDate: fileItem.metadata.releaseDate,
            audioUrl: audioUrl,
            duration: uploadResult.duration || 0,
          };
          
          console.log("[Upload] Creating audio track with data:", trackData);
          const createRes = await api.post("/audio-tracks", trackData);
          console.log("[Upload] Create response:", createRes.data);
          
          if (createRes.data?.success) {
            console.log("[Upload] Track saved successfully:", createRes.data.data);
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id ? { 
                ...f, 
                status: "done", 
                progress: 100,
                savedTrack: createRes.data.data,
                uploadedUrl: audioUrl // Store the URL directly for preview
              } : f
            ));
            successCount++;
          } else {
            throw new Error(createRes.data?.message || "Failed to save track");
          }
          
        } catch (fileErr) {
          console.error("Upload error for file:", fileItem.file.name, fileErr);
          
          // Determine error type for better user feedback
          let errorMessage = fileErr.message || "Upload failed";
          if (errorMessage.includes("timeout")) {
            const sizeMB = (fileItem.file.size / 1024 / 1024).toFixed(1);
            errorMessage = `Upload timed out. File may be too large (${sizeMB}MB). Try compressing the audio or using a smaller file.`;
          } else if (errorMessage.includes("Network") || errorMessage.includes("connection")) {
            errorMessage = "Network error - please check your internet connection and try again.";
          } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
            errorMessage = "Session expired - please log in again.";
          }
          
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: "error", 
              error: errorMessage 
            } : f
          ));
        }
      }
      
      if (successCount === files.length) {
        setSuccess(`All ${successCount} track(s) uploaded and saved to your music library! 🎉`);
      } else if (successCount > 0) {
        setSuccess(`${successCount} of ${files.length} tracks uploaded. Check errors below.`);
      } else {
        setError("All uploads failed. Please check your connection and try again.");
      }
      
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div>
      {/* Header */}
      <div className="studio-header">
        <h1 className="studio-header-title">⬆️ Upload</h1>
        <p className="studio-header-subtitle">Upload audio files, stems, or projects to your library</p>
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

      {/* Dropzone */}
      <div 
        className={`studio-dropzone ${dragActive ? "studio-dropzone--active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{ marginBottom: 24 }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.wav,.mp3,.flac,.m4a,.aiff,.ogg"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <div className="studio-dropzone-icon">📁</div>
        <div className="studio-dropzone-title">
          {dragActive ? "Drop files here!" : "Click to select or drag and drop"}
        </div>
        <div className="studio-dropzone-hint">
          Supports: WAV, MP3, FLAC, M4A, AIFF, OGG
        </div>
      </div>

      {/* File List with Metadata */}
      {files.length > 0 && (
        <div className="studio-card">
          <div className="studio-card-header">
            <h3 className="studio-card-title">📋 Tracks to Upload</h3>
            <span style={{ color: "#888", fontSize: 13 }}>
              {files.length} track{files.length !== 1 ? "s" : ""} • 
              {formatSize(files.reduce((acc, f) => acc + f.file.size, 0))}
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            {files.map((fileItem, index) => (
              <div 
                key={fileItem.id} 
                style={{ 
                  background: fileItem.status === "done" ? "rgba(0,255,0,0.05)" : 
                              fileItem.status === "error" ? "rgba(255,0,0,0.05)" : 
                              "rgba(255,255,255,0.02)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
              >
                {/* File Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>
                      {fileItem.status === "done" ? "✅" : 
                       fileItem.status === "processing" ? "⏳" : 
                       fileItem.status === "error" ? "❌" : "🎵"}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{fileItem.file.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>{formatSize(fileItem.file.size)}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {fileItem.status === "done" && (
                      <span style={{ color: "#4caf50", fontSize: 13 }}>Saved to Library ✓</span>
                    )}
                    {fileItem.status === "error" && (
                      <span style={{ color: "#f44336", fontSize: 13 }}>{fileItem.error}</span>
                    )}
                    {fileItem.status !== "processing" && fileItem.status !== "done" && (
                      <button 
                        className="studio-btn studio-btn--outline"
                        style={{ padding: "4px 12px", fontSize: 11 }}
                        onClick={() => removeFile(fileItem.id)}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                {fileItem.status === "processing" && (
                  <div className="studio-progress" style={{ marginBottom: 12, height: 6 }}>
                    <div 
                      className="studio-progress-fill" 
                      style={{ width: `${fileItem.progress}%`, transition: "width 0.3s ease" }} 
                    />
                  </div>
                )}
                
                {/* Metadata Form - Only show if not done */}
                {fileItem.status !== "done" && fileItem.status !== "processing" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4 }}>
                        Track Title *
                      </label>
                      <input
                        type="text"
                        value={fileItem.metadata.title}
                        onChange={(e) => updateFileMetadata(fileItem.id, "title", e.target.value)}
                        placeholder="Track title"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 14
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4 }}>
                        Artist Name *
                      </label>
                      <input
                        type="text"
                        value={fileItem.metadata.artistName}
                        onChange={(e) => updateFileMetadata(fileItem.id, "artistName", e.target.value)}
                        placeholder="Artist name"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.05)",
                          border: fileItem.metadata.artistName ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,100,100,0.5)",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 14
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4 }}>
                        Album / Project
                      </label>
                      <input
                        type="text"
                        value={fileItem.metadata.albumName}
                        onChange={(e) => updateFileMetadata(fileItem.id, "albumName", e.target.value)}
                        placeholder="Album name (optional)"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 14
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4 }}>
                        Genre
                      </label>
                      <select
                        value={fileItem.metadata.genre}
                        onChange={(e) => updateFileMetadata(fileItem.id, "genre", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 14
                        }}
                      >
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4 }}>
                        Publish To
                      </label>
                      <select
                        value={fileItem.metadata.stationKey}
                        onChange={(e) => updateFileMetadata(fileItem.id, "stationKey", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 14
                        }}
                      >
                        {STATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={fileItem.metadata.isExplicit}
                          onChange={(e) => updateFileMetadata(fileItem.id, "isExplicit", e.target.checked)}
                          style={{ width: 18, height: 18 }}
                        />
                        <span style={{ fontSize: 13 }}>Explicit Content</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button 
              className="studio-btn studio-btn--primary"
              onClick={handleUpload}
              disabled={uploading || files.every(f => f.status === "done")}
              style={{ flex: 1, padding: "14px 24px", fontSize: 16 }}
            >
              {uploading ? "⏳ Uploading & Saving..." : `🚀 Upload ${files.filter(f => f.status !== "done").length} Track(s) to Library`}
            </button>
            <button 
              className="studio-btn studio-btn--outline"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </button>
          </div>
          
          {files.some(f => f.status === "done") && (
            <div style={{ marginTop: 16, padding: 20, background: "linear-gradient(135deg, rgba(0,200,0,0.1), rgba(255,184,77,0.1))", borderRadius: 12, border: "1px solid rgba(255,184,77,0.3)" }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <h3 style={{ margin: "0 0 8px", color: "#4caf50" }}>Upload Complete!</h3>
                <p style={{ margin: 0, color: "#888" }}>
                  Your tracks are saved and ready to stream
                </p>
              </div>
              
              {/* Big button to Music Library */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
                <a 
                  href="/music" 
                  style={{ 
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    background: "linear-gradient(135deg, #ffb84d, #ff8c00)",
                    color: "#000",
                    borderRadius: 24,
                    fontWeight: 700,
                    fontSize: 16,
                    textDecoration: "none",
                    boxShadow: "0 4px 15px rgba(255,184,77,0.4)"
                  }}
                >
                  🎵 Go to Music Library
                </a>
                <button
                  onClick={() => setFiles([])}
                  style={{
                    padding: "14px 24px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 24,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14
                  }}
                >
                  Upload More
                </button>
              </div>
              
              {/* Preview uploaded tracks */}
              <div style={{ marginTop: 16 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#888" }}>Preview Your Uploads:</h4>
                {files.filter(f => f.status === "done").map(f => {
                  // Get audio URL from savedTrack or from the upload result
                  const audioUrl = f.savedTrack?.audioUrl || f.uploadedUrl;
                  return (
                    <div key={f.id} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      padding: "12px 16px", 
                      background: "rgba(0,0,0,0.3)", 
                      borderRadius: 10,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: 24 }}>🎵</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>{f.metadata.title}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>{f.metadata.artistName} • {f.metadata.genre}</div>
                      </div>
                      {audioUrl && (
                        <audio 
                          controls 
                          src={audioUrl} 
                          style={{ height: 36, maxWidth: 220 }}
                        />
                      )}
                      <span style={{ color: "#4caf50", fontSize: 20 }}>✓</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="studio-grid studio-grid--3" style={{ marginTop: 24 }}>
        <div className="studio-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎵</div>
          <h4 style={{ marginBottom: 8 }}>Audio Files</h4>
          <p style={{ color: "#888", fontSize: 13 }}>
            Upload your masters, stems, and raw recordings
          </p>
        </div>
        <div className="studio-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔄</div>
          <h4 style={{ marginBottom: 8 }}>Auto Processing</h4>
          <p style={{ color: "#888", fontSize: 13 }}>
            Files are analyzed and organized automatically
          </p>
        </div>
        <div className="studio-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>☁️</div>
          <h4 style={{ marginBottom: 8 }}>Cloud Storage</h4>
          <p style={{ color: "#888", fontSize: 13 }}>
            Secure storage with instant access anywhere
          </p>
        </div>
      </div>
    </div>
  );
}
