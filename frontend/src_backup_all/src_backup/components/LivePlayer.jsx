// src/components/LivePlayer.jsx
import { useEffect, useRef, useState } from "react";

export default function LivePlayer({ hlsUrl, poster, autoPlay=true }) {
  const videoRef = useRef(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Native HLS in Safari / some mobile
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      return;
    }
    // hls.js for other browsers
    import('hls\.jsx').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({ liveSyncDurationCount: 3 });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
      } else {
        setSupported(false);
      }
    });
  }, [hlsUrl]);

  if (!hlsUrl) return <div className="panel">Live stream not configured.</div>;
  if (!supported) {
    return (
      <div className="panel">
        Your browser can’t play HLS inline. <a href={hlsUrl}>Open stream</a>.
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay={autoPlay}
      playsInline
      poster={poster}
      style={{ width: "100%", borderRadius: 12, background: "#000" }}
    />
  );
}


