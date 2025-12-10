// frontend/src/components/tv/TVFeaturedBanner.jsx
// Featured video banner for TV station pages
import React, { useState, useRef, useEffect } from "react";
import styles from "./TVStation.module.css";

const TVFeaturedBanner = ({ 
  video, 
  stationName, 
  isLive = false,
  onVideoEnd,
  autoPlay = false 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && videoRef.current && video) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, that's ok
      });
    }
  }, [video, autoPlay]);

  // Empty state
  if (!video) {
    return (
      <div className={styles.featuredCard}>
        <div className={styles.featuredVideoWrapper}>
          <div className={styles.featuredPlaceholder}>
            <div className={styles.featuredPlaceholderIcon}>📺</div>
            <div className={styles.featuredPlaceholderText}>
              No featured video
            </div>
          </div>
        </div>
        <div className={styles.featuredMeta}>
          <div className={styles.featuredTitle}>Welcome to {stationName || "PowerStream TV"}</div>
          <div className={styles.featuredDescription}>
            Upload your first broadcast to feature it here.
          </div>
        </div>
      </div>
    );
  }

  const poster = video.thumbnailUrl || video.thumbnail || `${video.videoUrl || video.url}#t=1`;
  const videoUrl = video.videoUrl || video.url;

  return (
    <div className={styles.featuredCard}>
      <div className={styles.featuredVideoWrapper}>
        <video
          ref={videoRef}
          className={styles.featuredVideo}
          src={videoUrl}
          poster={poster}
          controls
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (onVideoEnd) onVideoEnd();
          }}
        />
        <div className={styles.featuredOverlay} />
        
        {/* Live badge */}
        {isLive && (
          <div className={styles.featuredLiveBadge}>
            <span className={styles.featuredLiveDot} />
            LIVE
          </div>
        )}
      </div>

      <div className={styles.featuredMeta}>
        <div className={styles.featuredTitle}>
          {video.title || "Untitled Broadcast"}
        </div>
        <div className={styles.featuredDescription}>
          {video.description || `Now streaming on ${stationName || "PowerStream TV"}`}
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaChip}>
            {isLive ? "🔴 Live" : "▶️ On Demand"}
          </span>
          {video.durationSeconds > 0 && !isLive && (
            <span className={styles.metaChip}>
              ⏱ {formatTime(video.durationSeconds)}
            </span>
          )}
          {video.uploadedAt && (
            <span className={styles.metaChip}>
              📅 {new Date(video.uploadedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TVFeaturedBanner;



