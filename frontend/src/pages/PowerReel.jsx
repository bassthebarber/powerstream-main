// frontend/src/pages/PowerReel.jsx
// PowerReel Pro - Beyond TikTok Vertical Video Experience
// Chief Engineer Edition - Cinematic & Immersive
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";
import "../styles/powerreel.css";
import "../styles/powerreel-pro.css";

export default function PowerReel() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [activeReelComments, setActiveReelComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    preview: null,
    caption: "",
    hashtags: "",
    trackName: "",
  });
  
  const containerRef = useRef(null);
  const reelRefs = useRef([]);

  // Check for mode from navigation state
  useEffect(() => {
    if (location.state?.mode === "create") {
      setShowUpload(true);
    }
    if (location.state?.prefillMedia) {
      setUploadData(prev => ({ ...prev, preview: location.state.prefillMedia }));
    }
  }, [location.state]);

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/powerreel?limit=20");
      if (res.data?.ok) {
        setReels(res.data.reels || []);
      } else if (res.data?.reels) {
        setReels(res.data.reels);
      } else if (Array.isArray(res.data)) {
        setReels(res.data);
      }
    } catch (err) {
      console.error("Error loading reels:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Intersection Observer for detecting which reel is in view
  useEffect(() => {
    if (!reels.length) return;

    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.reelIdx);
          setActiveIndex(idx);
        }
      });
    }, options);

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reels]);

  // Track view when reel becomes active
  useEffect(() => {
    if (reels[activeIndex]) {
      const reelId = reels[activeIndex]._id || reels[activeIndex].id;
      if (reelId) {
        api.post(`/powerreel/${reelId}/view`).catch(() => {});
      }
    }
  }, [activeIndex, reels]);

  const handleLike = async (reelId) => {
    if (!user?.id) return;
    try {
      await api.post(`/powerreel/${reelId}/like`);
      // Optimistic update
      setReels(prev => prev.map(r => {
        if ((r._id || r.id) === reelId) {
          const userId = String(user.id);
          const alreadyLiked = r.likes?.some(id => String(id) === userId);
          return {
            ...r,
            likes: alreadyLiked 
              ? r.likes.filter(id => String(id) !== userId)
              : [...(r.likes || []), userId]
          };
        }
        return r;
      }));
    } catch (err) {
      console.error("Error liking reel:", err);
    }
  };

  const handleComment = async (reelId) => {
    // Fetch comments for this reel
    try {
      const res = await api.get(`/powerreel/${reelId}/comments`);
      setActiveReelComments(res.data?.comments || []);
    } catch (err) {
      console.log("Comments API not available");
      setActiveReelComments([]);
    }
    setShowComments(true);
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !reels[activeIndex]) return;
    const reelId = reels[activeIndex]._id || reels[activeIndex].id;
    
    try {
      await api.post(`/powerreel/${reelId}/comment`, { text: commentText });
      setCommentText("");
      // Refresh comments
      handleComment(reelId);
      // Update comment count
      setReels(prev => prev.map(r => {
        if ((r._id || r.id) === reelId) {
          return { ...r, comments: [...(r.comments || []), { text: commentText }] };
        }
        return r;
      }));
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleShare = (reel) => {
    if (navigator.share) {
      navigator.share({
        title: reel.caption || "Check out this PowerReel!",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    const preview = URL.createObjectURL(file);
    setUploadData(prev => ({ ...prev, file, preview }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file && !uploadData.preview) return;

    try {
      setUploading(true);
      
      let videoUrl = uploadData.preview;
      
      // Upload file if we have one
      if (uploadData.file) {
        const formData = new FormData();
        formData.append("file", uploadData.file);
        
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        if (uploadRes.data?.url) {
          videoUrl = uploadRes.data.url;
        }
      }

      // Create reel
      await api.post("/powerreel", {
        videoUrl,
        caption: uploadData.caption.trim(),
        hashtags: uploadData.hashtags.trim(),
        trackName: uploadData.trackName.trim(),
      });

      // Reset and refresh
      setUploadData({ file: null, preview: null, caption: "", hashtags: "", trackName: "" });
      setShowUpload(false);
      fetchReels();
    } catch (err) {
      console.error("Error uploading reel:", err);
      alert("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleGoLive = () => {
    navigate("/powerharmony/live");
  };

  if (loading) {
    return (
      <div className="pr-page pr-page--loading">
        <div className="pr-loading">
          <div className="pr-loading-spinner"></div>
          <span>Loading Reels...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-page">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="video/*"
        onChange={handleFileSelect}
      />

      {/* Header Controls */}
      <div className="pr-header-controls">
        <button className="pr-header-btn" onClick={() => setShowUpload(true)}>
          <span>+</span>
          <span>Create</span>
        </button>
        <button className="pr-header-btn pr-header-btn--live" onClick={handleGoLive}>
          <span>🔴</span>
          <span>Go Live</span>
        </button>
      </div>

      {/* Reel Container */}
      <div className="pr-container" ref={containerRef}>
        {reels.length === 0 ? (
          <div className="pr-empty">
            <div className="pr-empty-icon">🎬</div>
            <h3>No Reels Yet</h3>
            <p>Be the first to share a PowerReel!</p>
            <button className="pr-empty-btn" onClick={() => setShowUpload(true)}>
              Create Reel
            </button>
          </div>
        ) : (
          reels.map((reel, idx) => (
            <ReelCard
              key={reel._id || reel.id || idx}
              ref={(el) => (reelRefs.current[idx] = el)}
              reel={reel}
              index={idx}
              isActive={idx === activeIndex}
              userId={user?.id ? String(user.id) : null}
              onLike={() => handleLike(reel._id || reel.id)}
              onComment={() => handleComment(reel._id || reel.id)}
              onShare={() => handleShare(reel)}
              onNavigate={(path) => navigate(path)}
            />
          ))
        )}
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="pr-comments-overlay" onClick={() => setShowComments(false)}>
          <div className="pr-comments-panel" onClick={(e) => e.stopPropagation()}>
            <div className="pr-comments-header">
              <h3>Comments ({activeReelComments.length})</h3>
              <button onClick={() => setShowComments(false)}>×</button>
            </div>
            <div className="pr-comments-list">
              {activeReelComments.length === 0 ? (
                <div className="pr-comments-empty">
                  <span>💬</span>
                  <p>No comments yet</p>
                </div>
              ) : (
                activeReelComments.map((comment, idx) => (
                  <div key={idx} className="pr-comment">
                    <div className="pr-comment-avatar">
                      {comment.user?.avatarUrl ? (
                        <img src={comment.user.avatarUrl} alt="" />
                      ) : (
                        <span>{(comment.user?.name || "U")[0]}</span>
                      )}
                    </div>
                    <div className="pr-comment-content">
                      <span className="pr-comment-name">{comment.user?.name || "User"}</span>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pr-comments-input">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                onKeyPress={(e) => e.key === "Enter" && handlePostComment()}
              />
              <button onClick={handlePostComment} disabled={!commentText.trim()}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="pr-upload-overlay" onClick={() => setShowUpload(false)}>
          <div className="pr-upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pr-upload-header">
              <h3>Create Reel</h3>
              <button onClick={() => setShowUpload(false)}>×</button>
            </div>

            <form onSubmit={handleUpload} className="pr-upload-form">
              {/* Video Upload Area */}
              {!uploadData.preview ? (
                <div 
                  className="pr-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="pr-upload-dropzone-icon">🎬</span>
                  <p>Click to upload video</p>
                  <span className="pr-upload-dropzone-hint">Share short-form content with your audience</span>
                </div>
              ) : (
                <div className="pr-upload-preview">
                  <video src={uploadData.preview} controls />
                  <button 
                    type="button" 
                    className="pr-upload-preview-remove"
                    onClick={() => setUploadData(prev => ({ ...prev, file: null, preview: null }))}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Caption */}
              <div className="pr-upload-field">
                <textarea
                  value={uploadData.caption}
                  onChange={(e) => setUploadData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Add a caption..."
                  rows={2}
                />
              </div>

              {/* Hashtags */}
              <div className="pr-upload-field">
                <input
                  type="text"
                  value={uploadData.hashtags}
                  onChange={(e) => setUploadData(prev => ({ ...prev, hashtags: e.target.value }))}
                  placeholder="#hashtags"
                />
              </div>

              {/* Track/Music */}
              <div className="pr-upload-field">
                <input
                  type="text"
                  value={uploadData.trackName}
                  onChange={(e) => setUploadData(prev => ({ ...prev, trackName: e.target.value }))}
                  placeholder="🎵 Add music (optional)"
                />
                {/* TODO: Connect to BeatStore/Studio for track selection */}
              </div>

              {/* Actions */}
              <div className="pr-upload-actions">
                <button 
                  type="button" 
                  className="pr-upload-cancel"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="pr-upload-submit"
                  disabled={uploading || !uploadData.preview}
                >
                  {uploading ? "Uploading..." : "Post Reel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .pr-page {
          position: fixed;
          inset: 0;
          top: 56px;
          background: #000;
          overflow: hidden;
        }

        .pr-page--loading {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pr-loading {
          text-align: center;
          color: var(--muted);
        }

        .pr-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .pr-header-controls {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 8px;
          z-index: 100;
        }

        .pr-header-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .pr-header-btn--live {
          background: rgba(255,0,0,0.2);
          border-color: rgba(255,0,0,0.5);
        }

        .pr-container {
          height: 100%;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
        }

        .pr-container::-webkit-scrollbar {
          display: none;
        }

        .pr-empty {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          text-align: center;
          padding: 40px;
        }

        .pr-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .pr-empty h3 {
          font-size: 20px;
          color: #fff;
          margin-bottom: 8px;
        }

        .pr-empty-btn {
          margin-top: 20px;
          padding: 12px 24px;
          background: var(--gold);
          border: none;
          border-radius: 999px;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Comments Panel */
        .pr-comments-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 200;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .pr-comments-panel {
          width: 100%;
          max-width: 500px;
          max-height: 70vh;
          background: #1a1a1f;
          border-radius: 16px 16px 0 0;
          display: flex;
          flex-direction: column;
        }

        .pr-comments-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .pr-comments-header h3 {
          font-size: 16px;
        }

        .pr-comments-header button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
        }

        .pr-comments-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .pr-comments-empty {
          text-align: center;
          padding: 40px;
          color: var(--muted);
        }

        .pr-comments-empty span {
          font-size: 40px;
          display: block;
          margin-bottom: 12px;
        }

        .pr-comment {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .pr-comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #000;
          font-size: 14px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .pr-comment-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pr-comment-content {
          flex: 1;
        }

        .pr-comment-name {
          font-size: 13px;
          font-weight: 600;
          margin-right: 8px;
        }

        .pr-comment-content p {
          font-size: 14px;
          color: #ddd;
          margin: 4px 0 0 0;
        }

        .pr-comments-input {
          display: flex;
          gap: 10px;
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .pr-comments-input input {
          flex: 1;
          padding: 10px 16px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: #fff;
          font-size: 14px;
        }

        .pr-comments-input button {
          padding: 10px 20px;
          background: var(--gold);
          border: none;
          border-radius: 999px;
          color: #000;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .pr-comments-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Upload Modal */
        .pr-upload-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .pr-upload-modal {
          width: 100%;
          max-width: 480px;
          background: #1a1a1f;
          border-radius: 16px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .pr-upload-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .pr-upload-header h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .pr-upload-header button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
        }

        .pr-upload-form {
          padding: 20px;
        }

        .pr-upload-dropzone {
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }

        .pr-upload-dropzone:hover {
          border-color: var(--gold);
          background: rgba(230,184,0,0.05);
        }

        .pr-upload-dropzone-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }

        .pr-upload-dropzone p {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .pr-upload-dropzone-hint {
          font-size: 13px;
          color: var(--muted);
        }

        .pr-upload-preview {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          background: #0f0f10;
        }

        .pr-upload-preview video {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
        }

        .pr-upload-preview-remove {
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

        .pr-upload-field {
          margin-bottom: 12px;
        }

        .pr-upload-field textarea,
        .pr-upload-field input {
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

        .pr-upload-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .pr-upload-cancel {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .pr-upload-submit {
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

        .pr-upload-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

const ReelCard = React.forwardRef(({ reel, index, isActive, userId, onLike, onComment, onShare, onNavigate }, ref) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get author info
  const author = reel.user && typeof reel.user === "object"
    ? {
        id: reel.user._id || reel.user.id,
        name: reel.user.name || reel.user.displayName || reel.user.email?.split("@")[0] || "User",
        avatarUrl: reel.user.avatarUrl || reel.user.avatar,
        username: reel.user.username || reel.username || "user",
      }
    : {
        id: reel.userId || reel.authorId,
        name: reel.authorName || reel.username || "User",
        avatarUrl: reel.avatarUrl || reel.authorAvatarUrl,
        username: reel.username || "user",
      };

  const initials = author.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
  const isLiked = userId && (reel.likes?.includes(userId) || reel.likes?.some(id => String(id) === userId));

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [isActive]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setMuted(video.muted);
    }
  };

  const videoSrc = reel.videoUrl || reel.hlsUrl || reel.mediaUrl;

  // Extract hashtags from caption
  const hashtags = reel.caption?.match(/#\w+/g) || [];
  const captionWithoutTags = reel.caption?.replace(/#\w+/g, "").trim();

  return (
    <div 
      className="pr-reel" 
      ref={ref} 
      data-reel-idx={index}
      onClick={togglePlay}
    >
      {/* Video */}
      <div className="pr-video-container">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="pr-video"
            loop
            muted={muted}
            playsInline
            poster={reel.thumbnailUrl}
          />
        ) : (
          <div className="pr-no-video">
            <span>🎬</span>
            <span>Video unavailable</span>
          </div>
        )}

        {/* Play/Pause indicator */}
        {!playing && isActive && (
          <div className="pr-play-indicator">
            <span>▶</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="pr-progress-bar">
          <div className="pr-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Right sidebar actions */}
      <div className="pr-sidebar">
        {/* Author avatar */}
        <div 
          className="pr-sidebar-avatar"
          onClick={(e) => { 
            e.stopPropagation(); 
            if (author.id) onNavigate(`/profile/${author.id}`);
          }}
          style={{ cursor: author.id ? "pointer" : "default" }}
        >
          {author.avatarUrl ? (
            <img src={author.avatarUrl} alt={author.name} />
          ) : (
            <span>{initials}</span>
          )}
          <div className="pr-follow-badge">+</div>
        </div>

        {/* Like */}
        <button 
          className={`pr-sidebar-btn ${isLiked ? "pr-sidebar-btn--active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onLike(); }}
        >
          <span className="pr-sidebar-icon">{isLiked ? "❤️" : "🤍"}</span>
          <span className="pr-sidebar-count">{reel.likes?.length || 0}</span>
        </button>

        {/* Comments */}
        <button 
          className="pr-sidebar-btn"
          onClick={(e) => { e.stopPropagation(); onComment(); }}
        >
          <span className="pr-sidebar-icon">💬</span>
          <span className="pr-sidebar-count">{reel.comments?.length || 0}</span>
        </button>

        {/* Share */}
        <button 
          className="pr-sidebar-btn"
          onClick={(e) => { e.stopPropagation(); onShare(); }}
        >
          <span className="pr-sidebar-icon">↗️</span>
          <span className="pr-sidebar-count">Share</span>
        </button>

        {/* Save */}
        <button className="pr-sidebar-btn">
          <span className="pr-sidebar-icon">🔖</span>
        </button>

        {/* Sound toggle */}
        <button 
          className="pr-sidebar-btn pr-sound-btn"
          onClick={toggleMute}
        >
          <span className="pr-sidebar-icon">{muted ? "🔇" : "🔊"}</span>
        </button>
      </div>

      {/* Bottom overlay - user info and caption */}
      <div className="pr-bottom-overlay">
        {/* User info */}
        <div 
          className="pr-user-info"
          onClick={(e) => { 
            e.stopPropagation(); 
            if (author.id) onNavigate(`/profile/${author.id}`);
          }}
          style={{ cursor: author.id ? "pointer" : "default" }}
        >
          <span className="pr-username">@{author.username}</span>
          {reel.isVerified && <span className="pr-verified">✓</span>}
        </div>

        {/* Caption */}
        {captionWithoutTags && (
          <p className="pr-caption">{captionWithoutTags}</p>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="pr-hashtags">
            {hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="pr-hashtag">{tag}</span>
            ))}
          </div>
        )}

        {/* Sound/Music info */}
        {reel.trackName && (
          <div className="pr-music-info">
            <span className="pr-music-icon">🎵</span>
            <span className="pr-music-name">{reel.trackName}</span>
          </div>
        )}

        {/* Views count */}
        {reel.views !== undefined && (
          <div className="pr-views">
            <span>👁️</span>
            <span>{reel.views?.toLocaleString() || 0} views</span>
          </div>
        )}
      </div>

      <style>{`
        .pr-reel {
          height: 100%;
          min-height: calc(100vh - 56px);
          scroll-snap-align: start;
          position: relative;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pr-video-container {
          width: 100%;
          height: 100%;
          max-width: 480px;
          position: relative;
        }

        .pr-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pr-no-video {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          gap: 12px;
        }

        .pr-no-video span:first-child {
          font-size: 48px;
        }

        .pr-play-indicator {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.3);
        }

        .pr-play-indicator span {
          width: 64px;
          height: 64px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          backdrop-filter: blur(10px);
        }

        .pr-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.3);
        }

        .pr-progress-fill {
          height: 100%;
          background: #fff;
          transition: width 0.1s linear;
        }

        .pr-sidebar {
          position: absolute;
          right: 12px;
          bottom: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .pr-sidebar-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #fff;
          overflow: hidden;
          position: relative;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #000;
        }

        .pr-sidebar-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pr-follow-badge {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: #ff4757;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
        }

        .pr-sidebar-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0;
        }

        .pr-sidebar-icon {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }

        .pr-sidebar-count {
          font-size: 12px;
          font-weight: 600;
        }

        .pr-sidebar-btn--active .pr-sidebar-icon {
          transform: scale(1.1);
        }

        .pr-bottom-overlay {
          position: absolute;
          bottom: 20px;
          left: 12px;
          right: 80px;
          color: #fff;
        }

        .pr-user-info {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .pr-username {
          font-size: 16px;
          font-weight: 700;
        }

        .pr-verified {
          color: #1da1f2;
          font-size: 14px;
        }

        .pr-caption {
          font-size: 14px;
          line-height: 1.4;
          margin: 0 0 8px 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        .pr-hashtags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .pr-hashtag {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }

        .pr-music-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .pr-music-icon {
          animation: bounce 0.6s infinite alternate;
        }

        @keyframes bounce {
          to { transform: translateY(-2px); }
        }

        .pr-views {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.8);
        }
      `}</style>
    </div>
  );
});

ReelCard.displayName = "ReelCard";
