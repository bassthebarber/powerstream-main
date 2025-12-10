// frontend/src/components/tv/player/StationVideoPlayer.jsx
// Full-featured video player with Netflix-style features

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FilmCard from "../layout/FilmCard.jsx";
import "./StationVideoPlayer.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function StationVideoPlayer() {
  const { stationId, videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // State
  const [video, setVideo] = useState(null);
  const [station, setStation] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewLogged, setViewLogged] = useState(false);

  // Resume playback key
  const resumeKey = `powerstream_resume_${stationId}_${videoId}`;

  // Fetch video data
  useEffect(() => {
    if (!stationId || !videoId) {
      setError("Missing station or video ID");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        // Fetch video and related videos
        const [videoRes, relatedRes] = await Promise.all([
          fetch(`${API_BASE}/api/tv/${stationId}/catalog`),
          fetch(`${API_BASE}/api/tv/${stationId}/videos?limit=12`),
        ]);

        const videoData = await videoRes.json();
        const relatedData = await relatedRes.json();

        if (videoData.success || videoData.ok) {
          setStation(videoData.station);
          
          // Find the specific video
          const allVideos = videoData.videos || [];
          const foundVideo = allVideos.find(v => v._id === videoId);
          
          if (foundVideo) {
            setVideo(foundVideo);
            
            // Filter related videos (same category, excluding current)
            const related = allVideos
              .filter(v => v._id !== videoId)
              .filter(v => 
                v.category === foundVideo.category || 
                v.tags?.some(t => foundVideo.tags?.includes(t))
              )
              .slice(0, 10);
            
            setRelatedVideos(related.length > 0 ? related : allVideos.filter(v => v._id !== videoId).slice(0, 10));
          } else {
            setError("Video not found");
          }
        } else {
          setError("Failed to load video");
        }
      } catch (err) {
        console.error("[StationVideoPlayer] Error:", err);
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [stationId, videoId]);

  // Resume playback position
  useEffect(() => {
    if (video && videoRef.current) {
      const savedPosition = localStorage.getItem(resumeKey);
      if (savedPosition) {
        const position = parseFloat(savedPosition);
        if (position > 0 && position < duration - 10) {
          videoRef.current.currentTime = position;
        }
      }
    }
  }, [video, duration, resumeKey]);

  // Save playback position
  useEffect(() => {
    if (currentTime > 0 && duration > 0) {
      localStorage.setItem(resumeKey, currentTime.toString());
    }
  }, [currentTime, resumeKey, duration]);

  // Log view after 30 seconds
  useEffect(() => {
    if (currentTime >= 30 && !viewLogged && videoId) {
      logEngagement("view");
      setViewLogged(true);
    }
  }, [currentTime, viewLogged, videoId]);

  // Show skip intro button for first 10 seconds
  useEffect(() => {
    setShowSkipIntro(currentTime < 10 && currentTime > 0);
  }, [currentTime]);

  // Hide controls after inactivity
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  // Log engagement
  const logEngagement = async (type) => {
    try {
      await fetch(`${API_BASE}/api/tv/videos/${videoId}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, stationId }),
      });
    } catch (err) {
      console.error("[StationVideoPlayer] Engagement log error:", err);
    }
  };

  // Player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const skipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 10;
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = document.querySelector(".video-player");
    if (!isFullscreen) {
      container?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleLike = async () => {
    await logEngagement("like");
    setHasLiked(true);
  };

  const handleNextVideo = () => {
    if (relatedVideos.length > 0) {
      navigate(`/tv/${stationId}/watch/${relatedVideos[0]._id}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Video events
  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);
  const onEnded = () => {
    localStorage.removeItem(resumeKey);
    if (relatedVideos.length > 0) {
      // Auto-play next video after 5 seconds
      setTimeout(handleNextVideo, 5000);
    }
  };

  if (loading) {
    return (
      <div className="video-player video-player--loading">
        <div className="video-player__spinner" />
        <p>Loading video...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="video-player video-player--error">
        <h2>⚠️ {error || "Video not found"}</h2>
        <button onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const videoUrl = video.url || video.videoUrl;
  const posterUrl = video.thumbnail || video.thumbnailUrl || video.posterUrl;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-player-page">
      {/* Video player */}
      <div 
        className={`video-player ${isFullscreen ? "video-player--fullscreen" : ""}`}
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          onClick={togglePlay}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          playsInline
        />

        {/* Skip intro button */}
        {showSkipIntro && (
          <button className="video-player__skip-intro" onClick={skipIntro}>
            Skip Intro
          </button>
        )}

        {/* Controls overlay */}
        <div className={`video-player__controls ${showControls ? "visible" : ""}`}>
          {/* Top bar */}
          <div className="video-player__top-bar">
            <button className="video-player__back" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div className="video-player__title-bar">
              <h2>{video.title}</h2>
              {station?.name && <span>{station.name}</span>}
            </div>
          </div>

          {/* Center play button */}
          <button className="video-player__center-play" onClick={togglePlay}>
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Bottom bar */}
          <div className="video-player__bottom-bar">
            {/* Progress bar */}
            <div className="video-player__progress" onClick={handleSeek}>
              <div 
                className="video-player__progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="video-player__controls-row">
              {/* Left controls */}
              <div className="video-player__left-controls">
                <button onClick={togglePlay}>
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button onClick={handleNextVideo} disabled={relatedVideos.length === 0}>
                  ⏭
                </button>
                <div className="video-player__volume">
                  <button onClick={toggleMute}>
                    {isMuted || volume === 0 ? "🔇" : "🔊"}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                  />
                </div>
                <span className="video-player__time">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="video-player__right-controls">
                <button 
                  onClick={handleLike}
                  className={hasLiked ? "active" : ""}
                  disabled={hasLiked}
                >
                  {hasLiked ? "❤️" : "🤍"}
                </button>
                <button onClick={toggleFullscreen}>
                  {isFullscreen ? "⛶" : "⛶"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video info */}
      <div className="video-player__info">
        <h1>{video.title}</h1>
        <div className="video-player__meta">
          {video.category && <span className="video-player__category">{video.category}</span>}
          {video.views > 0 && <span>{video.views.toLocaleString()} views</span>}
          {video.uploadedAt && (
            <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
          )}
        </div>
        {video.description && (
          <p className="video-player__description">{video.description}</p>
        )}
        {video.tags && video.tags.length > 0 && (
          <div className="video-player__tags">
            {video.tags.map((tag, i) => (
              <span key={i} className="video-player__tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Related videos */}
      {relatedVideos.length > 0 && (
        <div className="video-player__related">
          <h3>Up Next</h3>
          <div className="video-player__related-grid">
            {relatedVideos.map((rv, i) => (
              <FilmCard 
                key={rv._id || i}
                video={rv}
                stationId={stationId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



