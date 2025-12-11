// frontend/src/powerstream-tv/pages/VideoPlayer.jsx
// PowerStream TV Video Player with HLS support and watch progress

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/VideoPlayer.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Get user ID from localStorage or auth context
  const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || "anonymous";

  // Load film data
  useEffect(() => {
    async function loadFilm() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/powerstream/films/${id}`);
        const data = await res.json();
        
        if (data.ok || data.success) {
          setFilm(data.film);
        } else {
          setError(data.error || "Film not found");
        }
      } catch (err) {
        console.error("[VideoPlayer] Error:", err);
        setError("Failed to load film");
      } finally {
        setLoading(false);
      }
    }
    
    loadFilm();
  }, [id]);

  // Initialize video player
  useEffect(() => {
    if (!film || !videoRef.current) return;
    
    const video = videoRef.current;
    const videoUrl = film.filmUrl || film.videoUrl || film.url;
    
    if (!videoUrl) {
      setError("No video URL available");
      return;
    }

    // Check if HLS stream
    const isHLS = videoUrl.includes(".m3u8");
    
    if (isHLS && window.Hls && window.Hls.isSupported()) {
      // Use HLS.js for HLS streams
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        loadSavedProgress();
      });
      
      hls.on(window.Hls.Events.ERROR, (event, data) => {
        console.error("[HLS] Error:", data);
        if (data.fatal) {
          setError("Streaming error");
        }
      });
      
      hlsRef.current = hls;
    } else {
      // Direct video for MP4 or native HLS (Safari)
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", loadSavedProgress);
    }

    // Increment view count
    fetch(`${API_BASE}/api/powerstream/films/${id}/view`, { method: "POST" });

    return () => {
      // Cleanup
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save final progress on unmount
      saveProgress();
    };
  }, [film]);

  // Load saved progress
  const loadSavedProgress = async () => {
    if (!videoRef.current || userId === "anonymous") return;
    
    try {
      const res = await fetch(`${API_BASE}/api/history/progress/${userId}/${id}`);
      const data = await res.json();
      
      if (data.success && data.progress > 0) {
        videoRef.current.currentTime = data.progress;
      }
    } catch (err) {
      console.warn("[VideoPlayer] Could not load progress:", err);
    }
  };

  // Save progress (debounced)
  const saveProgress = useCallback(() => {
    if (!videoRef.current || userId === "anonymous") return;
    
    const video = videoRef.current;
    const progress = video.currentTime;
    const duration = video.duration || 0;
    const completed = duration > 0 && progress >= duration - 10;
    
    fetch(`${API_BASE}/api/history/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        filmId: id,
        progress,
        duration,
        completed,
      }),
    }).catch(err => console.warn("[VideoPlayer] Save progress error:", err));
  }, [id, userId]);

  // Handle time update (debounced save)
  const handleTimeUpdate = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Save every 10 seconds
    saveTimeoutRef.current = setTimeout(saveProgress, 10000);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => {
    setIsPlaying(false);
    saveProgress(); // Save on pause
  };
  const handleEnded = () => {
    setIsPlaying(false);
    saveProgress();
  };

  if (loading) {
    return (
      <div className="video-player-page">
        <div className="video-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="video-player-page">
        <div className="video-error">
          <h2>⚠️ {error || "Film not found"}</h2>
          <button onClick={() => navigate("/powerstream")}>← Back to TV</button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-page">
      <button className="back-button" onClick={() => navigate("/powerstream")}>
        ← Back
      </button>
      
      <div className="video-container">
        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          poster={film.posterUrl || film.thumbnailUrl || film.thumbnail}
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        />
      </div>
      
      <div className="video-info">
        <h1>{film.title}</h1>
        <div className="video-meta">
          {film.genre && <span className="genre-tag">{film.genre}</span>}
          {film.category && <span className="category-tag">{film.category}</span>}
          {film.views > 0 && <span className="views">{film.views.toLocaleString()} views</span>}
        </div>
        {film.description && <p className="description">{film.description}</p>}
      </div>
    </div>
  );
}


