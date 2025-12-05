// StreamPlayer component for live HLS streaming
import React, { useEffect, useRef, useState } from "react";
import { getLivepeerPlaybackUrl } from "../lib/livepeer.js";

export default function StreamPlayer({
  streamUrl,
  playbackId,
  stationId,
  autoPlay = true,
  muted = false,
}) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const finalUrl = streamUrl || getLivepeerPlaybackUrl(playbackId);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !finalUrl) {
      setLoading(false);
      return;
    }

    // Check for native HLS support (Safari, iOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = finalUrl;
      video.addEventListener("loadedmetadata", () => {
        setLoading(false);
        setError(null);
      });
      video.addEventListener("error", () => {
        setError("Failed to load stream");
        setLoading(false);
      });
      return;
    }

    // For other browsers, try native video element first
    // If hls.js is available via CDN or installed, it can be loaded separately
    video.src = finalUrl;
    video.addEventListener("loadedmetadata", () => {
      setLoading(false);
      setError(null);
    });
    video.addEventListener("error", (e) => {
      // Check if HLS.js is available globally (loaded via script tag)
      if (window.Hls && window.Hls.isSupported()) {
        try {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          
          hls.loadSource(finalUrl);
          hls.attachMedia(video);
          
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            setError(null);
            if (autoPlay) {
              video.play().catch(() => {
                // Autoplay blocked, user will need to click play
              });
            }
          });
          
          hls.on(window.Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setError("Stream error: " + (data.message || "Unknown error"));
              setLoading(false);
            }
          });
          
          return () => {
            hls.destroy();
          };
        } catch (err) {
          console.error("Error initializing HLS.js:", err);
          setError("Stream not available or browser doesn't support HLS");
          setLoading(false);
        }
      } else {
        setError("Stream not available or browser doesn't support HLS");
        setLoading(false);
      }
    });
  }, [finalUrl, autoPlay]);

  if (!finalUrl) {
    return (
      <div className="stream-player-placeholder">
        <div className="stream-player-message">
          <p>No playback ID or stream URL configured for this stream.</p>
          <p style={{ fontSize: "14px", opacity: 0.7, marginTop: "8px" }}>
            Start a live stream from the Studio or TV Station dashboard and ensure a playbackId is configured.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stream-player-placeholder">
        <div className="stream-player-message stream-player-error">
          <p>⚠️ {error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              background: "#f5b301",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stream-player-container">
      {loading && (
        <div className="stream-player-loading">
          <div className="stream-player-spinner"></div>
          <p>Loading stream...</p>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        className="stream-player-video"
        style={{
          width: "100%",
          background: "#000",
          borderRadius: "12px",
          display: loading ? "none" : "block",
        }}
      />
    </div>
  );
}

