// frontend/src/components/tv/stations/NoLimitForeverTV/NLFUploadFilm.jsx
// No Limit Forever TV - Upload Film Panel with File Upload Support

import { useState, useRef } from "react";

// Force localhost in development to avoid CORS issues with production API
const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001");

const CATEGORY_OPTIONS = [
  { value: "movie", label: "🎬 Movie" },
  { value: "documentary", label: "📽️ Documentary" },
  { value: "series", label: "📺 Series" },
  { value: "special", label: "⭐ Special" },
  { value: "music_video", label: "🎵 Music Video" },
  { value: "concert", label: "🎤 Concert" },
  { value: "interview", label: "🎙️ Interview" },
];

export default function NLFUploadFilm({ onCreated, onCancel }) {
  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "movie",
    description: "",
    runtimeMinutes: "",
    year: "",
    director: "",
    cast: "",
    isFeatured: false,
  });

  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  
  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(""); // Clear URL if file selected
      setStatus(`📁 Video selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
    }
  };

  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      setPosterUrl(""); // Clear URL if file selected
    }
  };

  // Upload file to Cloudinary
  async function uploadToCloudinary(file, type = "video") {
    const formData = new FormData();
    formData.append(type, file);
    formData.append("station", "no-limit-forever-tv");
    formData.append("title", file.name);

    const endpoint = type === "video" ? "/api/upload" : "/api/upload/image";
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || `Failed to upload ${type}`);
    }

    return result.url || result.secure_url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.title) {
      setStatus("❌ Title is required");
      return;
    }

    if (!videoFile && !videoUrl) {
      setStatus("❌ Please select a video file or enter a video URL");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let finalVideoUrl = videoUrl;
      let finalPosterUrl = posterUrl;

      // Upload video file if selected
      if (videoFile) {
        setStatus("📤 Uploading video to cloud...");
        setUploadProgress(20);
        finalVideoUrl = await uploadToCloudinary(videoFile, "video");
        setUploadProgress(60);
        setStatus("✅ Video uploaded!");
      }

      // Upload poster file if selected
      if (posterFile) {
        setStatus("📤 Uploading poster image...");
        setUploadProgress(70);
        finalPosterUrl = await uploadToCloudinary(posterFile, "image");
        setUploadProgress(80);
      }

      // Save film metadata to database
      setStatus("💾 Saving to catalog...");
      setUploadProgress(90);

      const payload = {
        title: formData.title,
        category: formData.category,
        posterUrl: finalPosterUrl,
        filmUrl: finalVideoUrl,
        description: formData.description,
        runtimeMinutes: formData.runtimeMinutes ? parseInt(formData.runtimeMinutes) : 0,
        year: formData.year ? parseInt(formData.year) : new Date().getFullYear(),
        director: formData.director,
        cast: formData.cast ? formData.cast.split(",").map(s => s.trim()) : [],
        isFeatured: formData.isFeatured,
      };

      const res = await fetch(`${API_BASE}/api/nlf/films`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || "Failed to save film");

      setUploadProgress(100);
      setStatus("✅ Successfully added to No Limit Forever TV!");
      
      // Reset form
      setFormData({
        title: "",
        category: "movie",
        description: "",
        runtimeMinutes: "",
        year: "",
        director: "",
        cast: "",
        isFeatured: false,
      });
      setVideoFile(null);
      setPosterFile(null);
      setVideoUrl("");
      setPosterUrl("");

      setTimeout(() => {
        if (onCreated) onCreated();
      }, 2000);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="nlf-upload-panel">
      <div className="nlf-upload-header">
        <h2>🎬 Upload Content</h2>
        {onCancel && (
          <button className="nlf-close-btn" onClick={onCancel}>✕</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="nlf-upload-form">
        {/* Title */}
        <div className="form-row">
          <label>
            Title *
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter film title"
            />
          </label>
        </div>

        {/* Category & Year */}
        <div className="form-row two-col">
          <label>
            Category
            <select name="category" value={formData.category} onChange={handleChange}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
          <label>
            Year
            <input
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              placeholder={new Date().getFullYear().toString()}
            />
          </label>
        </div>

        {/* Video Upload Section */}
        <div className="form-section">
          <h3>📹 Video File</h3>
          <div className="file-upload-area">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="file-select-btn"
              onClick={() => videoInputRef.current?.click()}
            >
              {videoFile ? `📁 ${videoFile.name}` : "📂 Select Video File"}
            </button>
            <span className="or-divider">— OR —</span>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => { setVideoUrl(e.target.value); setVideoFile(null); }}
              placeholder="Paste video URL (YouTube, Vimeo, MP4...)"
              className="url-input"
            />
          </div>
        </div>

        {/* Poster Upload Section */}
        <div className="form-section">
          <h3>🖼️ Poster Image</h3>
          <div className="file-upload-area">
            <input
              ref={posterInputRef}
              type="file"
              accept="image/*"
              onChange={handlePosterSelect}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="file-select-btn secondary"
              onClick={() => posterInputRef.current?.click()}
            >
              {posterFile ? `🖼️ ${posterFile.name}` : "📂 Select Poster Image"}
            </button>
            <span className="or-divider">— OR —</span>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => { setPosterUrl(e.target.value); setPosterFile(null); }}
              placeholder="Paste image URL"
              className="url-input"
            />
          </div>
        </div>

        {/* Runtime & Director */}
        <div className="form-row two-col">
          <label>
            Runtime (min)
            <input
              name="runtimeMinutes"
              type="number"
              value={formData.runtimeMinutes}
              onChange={handleChange}
              placeholder="90"
            />
          </label>
          <label>
            Director
            <input
              name="director"
              value={formData.director}
              onChange={handleChange}
              placeholder="Director name"
            />
          </label>
        </div>

        {/* Cast */}
        <div className="form-row">
          <label>
            Cast
            <input
              name="cast"
              value={formData.cast}
              onChange={handleChange}
              placeholder="Actor 1, Actor 2, Actor 3"
            />
          </label>
        </div>

        {/* Description */}
        <div className="form-row">
          <label>
            Description
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief synopsis..."
            />
          </label>
        </div>

        {/* Featured Toggle */}
        <div className="form-row checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <span>⭐ Feature this content</span>
          </label>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className="nlf-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "⏳ Uploading..." : "🚀 Upload to No Limit Forever TV"}
        </button>
      </form>

      {/* Status Message */}
      {status && (
        <div className={`nlf-upload-status ${status.includes("✅") ? "success" : status.includes("❌") ? "error" : "info"}`}>
          {status}
        </div>
      )}
    </div>
  );
}
