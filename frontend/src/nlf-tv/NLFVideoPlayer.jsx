// frontend/src/nlf-tv/NLFVideoPlayer.jsx
// No Limit Forever TV - Video Player with View Tracking and Ratings

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js";
import NLFRatingStars, { NLFRatingCompact } from "./NLFRatingStars.jsx";
import styles from "./styles/NLF.module.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function NLFVideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const viewTrackedRef = useRef(false);
  const watchTimeRef = useRef(0);
  const lastUpdateRef = useRef(0);
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    fetchVideoData();
    return () => {
      // Track final watch time on unmount
      if (watchTimeRef.current > 0 && !viewTrackedRef.current) {
        trackView(watchTimeRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [id]);

  useEffect(() => {
    if (video && videoRef.current) {
      setupPlayer();
    }
  }, [video]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      viewTrackedRef.current = false;
      watchTimeRef.current = 0;
      
      const res = await fetch(`${API_BASE}/api/nlf/videos/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setVideo(data.video);
      } else {
        setError(data.error || "Video not found");
      }

      // Fetch related videos
      const relatedRes = await fetch(`${API_BASE}/api/nlf/videos?limit=6`);
      const relatedData = await relatedRes.json();
      
      if (relatedData.success) {
        setRelatedVideos(relatedData.videos.filter(v => v._id !== id).slice(0, 4));
      }

      setLoading(false);
    } catch (err) {
      console.error("[NLF] Error fetching video:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const setupPlayer = () => {
    const videoUrl = video.hlsUrl || video.videoUrl;
    
    if (!videoUrl) {
      console.warn("[NLF] No video URL available");
      return;
    }

    if (videoUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current.loadSource(videoUrl);
        hlsRef.current.attachMedia(videoRef.current);
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          // Don't auto-play, let user click
        });
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          console.error("[NLF] HLS Error:", data);
        });
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = videoUrl;
      }
    } else {
      videoRef.current.src = videoUrl;
    }
  };

  // Track view with watch duration
  const trackView = useCallback(async (duration) => {
    if (viewTrackedRef.current) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/nlf/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: id,
          watchDuration: Math.floor(duration),
          deviceType: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        viewTrackedRef.current = true;
        setViewTracked(true);
        console.log(`[NLF] View tracked: ${duration}s, qualified: ${data.qualifiedView}`);
        
        if (data.qualifiedView && data.royaltyEntry) {
          console.log(`[NLF] Royalty earned: $${data.royaltyEntry.creatorCut.toFixed(4)}`);
        }
      }
    } catch (err) {
      console.error("[NLF] Error tracking view:", err);
    }
  }, [id]);

  // Handle video time update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    watchTimeRef.current = currentTime;

    // Track view after 30 seconds (qualified view)
    if (currentTime >= 30 && !viewTrackedRef.current) {
      trackView(currentTime);
    }

    // Update every 30 seconds for longer videos
    if (currentTime - lastUpdateRef.current >= 30) {
      lastUpdateRef.current = currentTime;
      // Could send progress updates here
    }
  }, [trackView]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    // Track partial view on pause
    if (watchTimeRef.current > 5 && !viewTrackedRef.current) {
      trackView(watchTimeRef.current);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Track full view on end
    if (!viewTrackedRef.current) {
      trackView(video?.duration || watchTimeRef.current);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatViews = (count) => {
    if (!count) return "0 views";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  if (loading) {
    return (
      <div className={styles.playerPage}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className={styles.playerPage}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Video Not Found</h2>
          <p style={{ color: "#888", marginBottom: "2rem" }}>{error}</p>
          <Link to="/nlf" className={styles.btnPrimary}>
            Back to NLF TV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playerPage}>
      <div className={styles.playerContainer}>
        {/* Video Player */}
        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            className={styles.videoPlayer}
            controls
            poster={video.thumbnailUrl || "https://via.placeholder.com/1920x1080/000/FFD700?text=NLF+TV"}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
          >
            {video.videoUrl && !video.hlsUrl && (
              <source src={video.videoUrl} type="video/mp4" />
            )}
            Your browser does not support video playback.
          </video>
        </div>

        {/* Video Info */}
        <div className={styles.playerInfo}>
          {/* Badges */}
          <div className={styles.badgeRow}>
            {video.isPremiere && (
              <span className={`${styles.cardBadge} ${styles.badgePremiere}`}>
                Premiere
              </span>
            )}
            {video.isExclusive && (
              <span className={`${styles.cardBadge} ${styles.badgeExclusive}`}>
                Exclusive
              </span>
            )}
            <span className={styles.typeBadge}>{video.type}</span>
          </div>

          {/* Title */}
          <h1 className={styles.playerTitle}>{video.title}</h1>
          
          {/* Artist */}
          {video.artist && (
            <p className={styles.playerArtist}>{video.artist}</p>
          )}

          {/* Meta Info */}
          <div className={styles.playerMeta}>
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatDate(video.createdAt || video.releaseDate)}</span>
          </div>

          {/* Rating Section */}
          <div className={styles.ratingSection}>
            <h4>Rate this video</h4>
            <NLFRatingStars
              videoId={video._id}
              initialRating={video.rating}
              ratingCount={video.ratingCount}
              size="large"
              showCount={true}
            />
          </div>

          {/* Description */}
          <p className={styles.playerDescription}>
            {video.description || "No description available."}
          </p>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className={styles.tagList}>
              {video.tags.map((tag, i) => (
                <span key={i} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}

          {/* View Tracking Status */}
          {viewTracked && (
            <div className={styles.viewTrackedBadge}>
              ✓ View recorded
            </div>
          )}
        </div>

        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>More From NLF TV</h2>
            <div className={styles.contentGrid}>
              {relatedVideos.map((vid) => (
                <div
                  key={vid._id}
                  className={styles.videoCard}
                  onClick={() => navigate(`/nlf/watch/${vid._id}`)}
                >
                  <div className={styles.cardThumbnail}>
                    <img
                      src={vid.thumbnailUrl || "https://via.placeholder.com/400x225/1a1a1a/FFD700?text=NLF"}
                      alt={vid.title}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x225/1a1a1a/FFD700?text=NLF";
                      }}
                    />
                    <div className={styles.playButton}></div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardType}>{vid.type}</div>
                    <h3 className={styles.cardTitle}>{vid.title}</h3>
                    <NLFRatingCompact rating={vid.rating} count={vid.ratingCount} />
                    <div className={styles.cardMeta}>
                      <span>{formatViews(vid.views)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Link to="/nlf" className={styles.btnSecondary}>
            ← Back to NLF TV
          </Link>
        </div>
      </div>
    </div>
  );
}
