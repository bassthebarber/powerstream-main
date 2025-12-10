// frontend/src/pages/PowerGram.jsx
// PowerGram Pro - Instagram-Class Photo Experience with Stories
// Chief Engineer Edition - Elegant & Immersive
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import GramModal from "../components/GramModal.jsx";
import "../styles/powergram.css";
import "../styles/powergram-pro.css";

export default function PowerGram() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [grams, setGrams] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGram, setSelectedGram] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ 
    file: null,
    preview: null,
    caption: "", 
    hashtags: "",
    location: "",
    postType: "grid", // grid, story, both
  });
  const [activeStory, setActiveStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // User info
  const displayName = user?.name || user?.displayName || user?.email?.split("@")[0] || "Guest";
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  // Check for mode from navigation state
  useEffect(() => {
    if (location.state?.mode === "story") {
      setShowUpload(true);
      setUploadData(prev => ({ ...prev, postType: "story" }));
    } else if (location.state?.mode === "create") {
      setShowUpload(true);
    }
    if (location.state?.prefillMedia) {
      setUploadData(prev => ({ ...prev, preview: location.state.prefillMedia }));
    }
    if (location.state?.prefillCaption) {
      setUploadData(prev => ({ ...prev, caption: location.state.prefillCaption }));
    }
  }, [location.state]);

  const fetchGrams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/powergram?limit=30");
      if (res.data?.ok) {
        setGrams(res.data.grams || []);
      } else if (res.data?.grams) {
        setGrams(res.data.grams);
      } else if (Array.isArray(res.data)) {
        setGrams(res.data);
      }
    } catch (err) {
      console.error("Error fetching grams:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStories = useCallback(async () => {
    try {
      const res = await api.get("/stories?limit=20");
      if (res.data?.ok && res.data.stories) {
        setStories(res.data.stories);
      } else if (res.data?.stories) {
        setStories(res.data.stories);
      }
    } catch (err) {
      console.log("Stories not available");
    }
  }, []);

  useEffect(() => {
    fetchGrams();
    fetchStories();
  }, [fetchGrams, fetchStories]);

  // Story auto-progress
  useEffect(() => {
    if (!activeStory) return;
    
    const interval = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          // Move to next story or close
          const currentIdx = stories.findIndex(s => s._id === activeStory._id);
          if (currentIdx < stories.length - 1) {
            setActiveStory(stories[currentIdx + 1]);
            return 0;
          } else {
            setActiveStory(null);
            return 0;
          }
        }
        return prev + 2; // 5 seconds per story (100/20 = 5s at 100ms interval)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, stories]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    
    if (!isVideo && !isImage) {
      alert("Please select an image or video file");
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadData(prev => ({
      ...prev,
      file,
      preview,
      mediaType: isVideo ? "video" : "image",
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file && !uploadData.preview) return;

    try {
      setUploading(true);
      
      let mediaUrl = uploadData.preview;
      
      // Upload file if we have one
      if (uploadData.file) {
        const formData = new FormData();
        formData.append("file", uploadData.file);
        
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        if (uploadRes.data?.url) {
          mediaUrl = uploadRes.data.url;
        }
      }

      // Create gram post
      if (uploadData.postType === "grid" || uploadData.postType === "both") {
        await api.post("/powergram", {
          imageUrl: mediaUrl,
          mediaUrl: mediaUrl,
          caption: uploadData.caption.trim(),
          hashtags: uploadData.hashtags.trim(),
          location: uploadData.location.trim(),
          mediaType: uploadData.mediaType || "image",
        });
      }

      // Create story
      if (uploadData.postType === "story" || uploadData.postType === "both") {
        await api.post("/stories", {
          mediaUrl: mediaUrl,
          mediaType: uploadData.mediaType || "image",
        }).catch(() => {
          console.log("Story API not available");
        });
      }

      // Reset and refresh
      setUploadData({ file: null, preview: null, caption: "", hashtags: "", location: "", postType: "grid" });
      setShowUpload(false);
      fetchGrams();
      fetchStories();
    } catch (err) {
      console.error("Error uploading gram:", err);
      alert("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (gramId) => {
    try {
      await api.post(`/powergram/${gramId}/like`);
      fetchGrams();
    } catch (err) {
      console.error("Error liking gram:", err);
    }
  };

  // Mock stories for demo
  const mockStories = [
    { _id: "s1", user: { name: "Southern Power", avatarUrl: null }, hasNew: true },
    { _id: "s2", user: { name: "No Limit", avatarUrl: null }, hasNew: true },
    { _id: "s3", user: { name: "Studio Pro", avatarUrl: null }, hasNew: false },
    { _id: "s4", user: { name: "Texas Talent", avatarUrl: null }, hasNew: true },
  ];

  const displayStories = stories.length > 0 ? stories : mockStories;

  return (
    <div className="pg-page">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <header className="pg-header">
        <div className="pg-header-left">
          <h1 className="pg-title">PowerGram</h1>
        </div>
        <div className="pg-header-right">
          <button 
            className="pg-upload-btn"
            onClick={() => setShowUpload(true)}
          >
            <span>+</span>
            <span className="pg-upload-btn-text">New Post</span>
          </button>
        </div>
      </header>

      {/* Stories Bar */}
      <section className="pg-stories-bar">
        <div className="pg-stories-scroll">
          {/* Your Story */}
          <div 
            className="pg-story-bubble pg-story-bubble--own"
            onClick={() => {
              setUploadData(prev => ({ ...prev, postType: "story" }));
              setShowUpload(true);
            }}
          >
            <div className="pg-story-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} />
              ) : (
                <span>{initials}</span>
              )}
              <div className="pg-story-add">+</div>
            </div>
            <span className="pg-story-name">Your Story</span>
          </div>

          {/* Other Stories */}
          {displayStories.map((story) => {
            const storyUser = story.user || {};
            const name = storyUser.name || story.username || "User";
            const avatar = storyUser.avatarUrl || story.avatarUrl;
            const storyInitials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const hasNew = story.hasNew !== false && !story.viewed;

            return (
              <div 
                key={story._id}
                className={`pg-story-bubble ${hasNew ? "pg-story-bubble--active" : "pg-story-bubble--viewed"}`}
                onClick={() => {
                  setActiveStory(story);
                  setStoryProgress(0);
                }}
              >
                <div className="pg-story-avatar">
                  {avatar ? (
                    <img src={avatar} alt={name} />
                  ) : (
                    <span>{storyInitials}</span>
                  )}
                </div>
                <span className="pg-story-name">
                  {name.length > 10 ? name.slice(0, 9) + "…" : name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upload Modal */}
      {showUpload && (
        <div className="pg-upload-overlay" onClick={() => setShowUpload(false)}>
          <div className="pg-upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pg-upload-modal-header">
              <h3>Create New Post</h3>
              <button onClick={() => setShowUpload(false)}>×</button>
            </div>

            <form onSubmit={handleUpload} className="pg-upload-form">
              {/* Media Upload Area */}
              {!uploadData.preview ? (
                <div 
                  className="pg-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="pg-upload-dropzone-icon">📷</span>
                  <p>Click to upload photo or video</p>
                  <span className="pg-upload-dropzone-hint">Share moments with your audience</span>
                </div>
              ) : (
                <div className="pg-upload-preview">
                  {uploadData.mediaType === "video" ? (
                    <video src={uploadData.preview} controls />
                  ) : (
                    <img src={uploadData.preview} alt="Preview" />
                  )}
                  <button 
                    type="button" 
                    className="pg-upload-preview-remove"
                    onClick={() => setUploadData(prev => ({ ...prev, file: null, preview: null }))}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Caption */}
              <div className="pg-upload-field">
                <textarea
                  value={uploadData.caption}
                  onChange={(e) => setUploadData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write a caption..."
                  rows={3}
                />
              </div>

              {/* Hashtags */}
              <div className="pg-upload-field">
                <input
                  type="text"
                  value={uploadData.hashtags}
                  onChange={(e) => setUploadData(prev => ({ ...prev, hashtags: e.target.value }))}
                  placeholder="#hashtags (optional)"
                />
              </div>

              {/* Location */}
              <div className="pg-upload-field">
                <input
                  type="text"
                  value={uploadData.location}
                  onChange={(e) => setUploadData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="📍 Add location (optional)"
                />
              </div>

              {/* Post Type */}
              <div className="pg-upload-type">
                <label className={`pg-upload-type-option ${uploadData.postType === "grid" ? "pg-upload-type-option--active" : ""}`}>
                  <input
                    type="radio"
                    name="postType"
                    value="grid"
                    checked={uploadData.postType === "grid"}
                    onChange={(e) => setUploadData(prev => ({ ...prev, postType: e.target.value }))}
                  />
                  <span>📱 Grid Post</span>
                </label>
                <label className={`pg-upload-type-option ${uploadData.postType === "story" ? "pg-upload-type-option--active" : ""}`}>
                  <input
                    type="radio"
                    name="postType"
                    value="story"
                    checked={uploadData.postType === "story"}
                    onChange={(e) => setUploadData(prev => ({ ...prev, postType: e.target.value }))}
                  />
                  <span>⭕ Story Only</span>
                </label>
                <label className={`pg-upload-type-option ${uploadData.postType === "both" ? "pg-upload-type-option--active" : ""}`}>
                  <input
                    type="radio"
                    name="postType"
                    value="both"
                    checked={uploadData.postType === "both"}
                    onChange={(e) => setUploadData(prev => ({ ...prev, postType: e.target.value }))}
                  />
                  <span>✨ Both</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pg-upload-actions">
                <button 
                  type="button" 
                  className="pg-upload-cancel"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="pg-upload-submit"
                  disabled={uploading || !uploadData.preview}
                >
                  {uploading ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Viewer */}
      {activeStory && (
        <div className="pg-story-viewer" onClick={() => setActiveStory(null)}>
          <div className="pg-story-viewer-content" onClick={(e) => e.stopPropagation()}>
            {/* Progress Bar */}
            <div className="pg-story-progress">
              <div className="pg-story-progress-fill" style={{ width: `${storyProgress}%` }} />
            </div>

            {/* Story Header */}
            <div className="pg-story-viewer-header">
              <div className="pg-story-viewer-user">
                {activeStory.user?.avatarUrl ? (
                  <img src={activeStory.user.avatarUrl} alt="" />
                ) : (
                  <span>{(activeStory.user?.name || "U")[0]}</span>
                )}
                <span>{activeStory.user?.name || "User"}</span>
              </div>
              <button onClick={() => setActiveStory(null)}>×</button>
            </div>

            {/* Story Media */}
            <div className="pg-story-viewer-media">
              {activeStory.mediaUrl ? (
                activeStory.mediaType === "video" ? (
                  <video src={activeStory.mediaUrl} autoPlay muted loop />
                ) : (
                  <img src={activeStory.mediaUrl} alt="" />
                )
              ) : (
                <div className="pg-story-placeholder">
                  <span>📸</span>
                  <p>Story Preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <main className="pg-grid-container">
        {loading ? (
          <div className="pg-loading">
            <div className="pg-loading-spinner"></div>
            <span>Loading photos...</span>
          </div>
        ) : grams.length === 0 ? (
          <div className="pg-empty">
            <div className="pg-empty-icon">📸</div>
            <h3>No photos yet</h3>
            <p>Be the first to share a moment</p>
            <button 
              className="pg-empty-btn"
              onClick={() => setShowUpload(true)}
            >
              Share Photo
            </button>
          </div>
        ) : (
          <div className="pg-grid">
            {grams.map((gram) => (
              <GramTile
                key={gram._id || gram.id}
                gram={gram}
                onClick={() => setSelectedGram(gram)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedGram && (
        <GramModal
          gram={selectedGram}
          onClose={() => setSelectedGram(null)}
          onUpdate={fetchGrams}
          onLike={() => handleLike(selectedGram._id)}
        />
      )}

      <style>{`
        .pg-page {
          min-height: 100vh;
          background: #000;
        }

        .pg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky;
          top: 56px;
          background: #000;
          z-index: 50;
        }

        .pg-title {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(90deg, var(--gold), #ffda5c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pg-upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--gold);
          border: none;
          border-radius: 999px;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pg-upload-btn:hover {
          transform: scale(1.05);
        }

        /* Stories Bar */
        .pg-stories-bar {
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: #000;
        }

        .pg-stories-scroll {
          display: flex;
          gap: 16px;
          padding: 0 20px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .pg-stories-scroll::-webkit-scrollbar {
          display: none;
        }

        .pg-story-bubble {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .pg-story-avatar {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, var(--gold), #ff8c00, #ffda5c);
          position: relative;
        }

        .pg-story-bubble--viewed .pg-story-avatar {
          background: #333;
        }

        .pg-story-bubble--own .pg-story-avatar {
          background: #1a1a1f;
          border: 2px dashed rgba(255,255,255,0.3);
        }

        .pg-story-avatar img,
        .pg-story-avatar > span {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          background: #1a1a1f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--gold);
          border: 3px solid #000;
        }

        .pg-story-add {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 22px;
          height: 22px;
          background: var(--gold);
          border: 2px solid #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #000;
        }

        .pg-story-name {
          font-size: 11px;
          color: var(--muted);
          max-width: 68px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Upload Modal */
        .pg-upload-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .pg-upload-modal {
          width: 100%;
          max-width: 500px;
          background: #1a1a1f;
          border-radius: 16px;
          overflow: hidden;
          max-height: 90vh;
          overflow-y: auto;
        }

        .pg-upload-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .pg-upload-modal-header h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .pg-upload-modal-header button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
        }

        .pg-upload-form {
          padding: 20px;
        }

        .pg-upload-dropzone {
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }

        .pg-upload-dropzone:hover {
          border-color: var(--gold);
          background: rgba(230,184,0,0.05);
        }

        .pg-upload-dropzone-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }

        .pg-upload-dropzone p {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .pg-upload-dropzone-hint {
          font-size: 13px;
          color: var(--muted);
        }

        .pg-upload-preview {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          background: #0f0f10;
        }

        .pg-upload-preview img,
        .pg-upload-preview video {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
        }

        .pg-upload-preview-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          border: none;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
        }

        .pg-upload-field {
          margin-bottom: 12px;
        }

        .pg-upload-field textarea,
        .pg-upload-field input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          resize: none;
        }

        .pg-upload-type {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .pg-upload-type-option {
          flex: 1;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .pg-upload-type-option input {
          display: none;
        }

        .pg-upload-type-option--active {
          background: rgba(230,184,0,0.15);
          border-color: var(--gold);
          color: var(--gold);
        }

        .pg-upload-actions {
          display: flex;
          gap: 12px;
        }

        .pg-upload-cancel {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .pg-upload-submit {
          flex: 2;
          padding: 12px;
          background: var(--gold);
          border: none;
          border-radius: 999px;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .pg-upload-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Story Viewer */
        .pg-story-viewer {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pg-story-viewer-content {
          width: 100%;
          max-width: 420px;
          height: 100%;
          max-height: 90vh;
          background: #1a1a1f;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .pg-story-progress {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          height: 3px;
          background: rgba(255,255,255,0.3);
          border-radius: 999px;
          z-index: 10;
        }

        .pg-story-progress-fill {
          height: 100%;
          background: #fff;
          border-radius: 999px;
          transition: width 0.1s linear;
        }

        .pg-story-viewer-header {
          position: absolute;
          top: 20px;
          left: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }

        .pg-story-viewer-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pg-story-viewer-user img,
        .pg-story-viewer-user span:first-child {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #000;
        }

        .pg-story-viewer-user span:last-child {
          font-size: 14px;
          font-weight: 600;
        }

        .pg-story-viewer-header button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
        }

        .pg-story-viewer-media {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pg-story-viewer-media img,
        .pg-story-viewer-media video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pg-story-placeholder {
          text-align: center;
          color: var(--muted);
        }

        .pg-story-placeholder span {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }

        /* Grid */
        .pg-grid-container {
          padding: 20px;
        }

        .pg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        @media (max-width: 600px) {
          .pg-grid {
            gap: 2px;
          }
        }

        .pg-loading,
        .pg-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        .pg-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .pg-empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .pg-empty h3 {
          font-size: 18px;
          margin-bottom: 8px;
          color: #fff;
        }

        .pg-empty-btn {
          margin-top: 16px;
          padding: 12px 24px;
          background: var(--gold);
          border: none;
          border-radius: 999px;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function GramTile({ gram, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="pg-tile" onClick={onClick}>
      {/* Image */}
      <div className="pg-tile-image-wrapper">
        {!loaded && !error && (
          <div className="pg-tile-placeholder">
            <div className="pg-loading-spinner pg-loading-spinner--small"></div>
          </div>
        )}
        {error ? (
          <div className="pg-tile-error">
            <span>📸</span>
          </div>
        ) : (
          <img
            src={gram.imageUrl || gram.mediaUrl}
            alt={gram.caption || "Photo"}
            className={`pg-tile-image ${loaded ? "pg-tile-image--loaded" : ""}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>

      {/* Hover Overlay */}
      <div className="pg-tile-overlay">
        <div className="pg-tile-stats">
          <span className="pg-tile-stat">
            <span>❤️</span>
            <span>{gram.likes?.length || 0}</span>
          </span>
          <span className="pg-tile-stat">
            <span>💬</span>
            <span>{gram.comments?.length || 0}</span>
          </span>
        </div>
      </div>

      {/* Video indicator */}
      {gram.mediaType === "video" && (
        <div className="pg-tile-video-badge">▶</div>
      )}

      <style>{`
        .pg-tile {
          position: relative;
          aspect-ratio: 1;
          cursor: pointer;
          overflow: hidden;
          background: #1a1a1f;
        }

        .pg-tile-image-wrapper {
          width: 100%;
          height: 100%;
        }

        .pg-tile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .pg-tile-image--loaded {
          opacity: 1;
        }

        .pg-tile-placeholder,
        .pg-tile-error {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1f;
        }

        .pg-tile-error span {
          font-size: 24px;
          opacity: 0.3;
        }

        .pg-tile-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .pg-tile:hover .pg-tile-overlay {
          opacity: 1;
        }

        .pg-tile-stats {
          display: flex;
          gap: 16px;
        }

        .pg-tile-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .pg-tile-video-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 16px;
        }

        .pg-loading-spinner--small {
          width: 20px;
          height: 20px;
          border-width: 2px;
        }
      `}</style>
    </div>
  );
}
