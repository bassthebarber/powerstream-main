// frontend/src/components/powerreel/ReelPlayer.jsx
// TikTok-style video player with auto-play/pause
import React, { useEffect, useRef, useState, useMemo } from "react";

export default function ReelPlayer({ reel, active }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [active]);

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

  // Get author info
  const author = useMemo(() => {
    if (reel?.user && typeof reel.user === "object") {
      return {
        name: reel.user.name || reel.user.displayName || "User",
        username: reel.user.username || reel.username || "user",
      };
    }
    return {
      name: reel?.authorName || reel?.username || "User",
      username: reel?.username || "user",
    };
  }, [reel]);

  if (!reel) return null;

  const src = reel.videoUrl || reel.hlsUrl || reel.mediaUrl;

  // Extract hashtags from caption
  const hashtags = reel.caption?.match(/#\w+/g) || [];
  const captionWithoutTags = reel.caption?.replace(/#\w+/g, "").trim();

  return (
    <div className="pr-video-container" onClick={togglePlay}>
      {src ? (
        <video
          ref={videoRef}
          src={src}
          className="pr-video"
          muted={muted}
          loop
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
      {!playing && active && (
        <div className="pr-play-indicator">
          <span>▶</span>
        </div>
      )}

      {/* Mute toggle */}
      <button
        className="pr-sound-btn"
        onClick={toggleMute}
        style={{
          position: "absolute",
          right: 16,
          top: 16,
          zIndex: 30,
        }}
      >
        <span className="pr-sidebar-icon">{muted ? "🔇" : "🔊"}</span>
      </button>

      {/* Bottom overlay - user info and caption */}
      <div className="pr-bottom-overlay">
        <div className="pr-user-info">
          <span className="pr-username">@{author.username}</span>
          {reel.isVerified && <span className="pr-verified">✓</span>}
        </div>

        {captionWithoutTags && (
          <p className="pr-caption">{captionWithoutTags}</p>
        )}

        {hashtags.length > 0 && (
          <div className="pr-hashtags">
            {hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="pr-hashtag">{tag}</span>
            ))}
          </div>
        )}

        {reel.trackName && (
          <div className="pr-music-info">
            <span className="pr-music-icon">🎵</span>
            <span className="pr-music-name">{reel.trackName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
