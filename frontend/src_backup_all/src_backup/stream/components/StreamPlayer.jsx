import React from "react";
import Hls from "hls.jsx";

export default function StreamPlayer({ playbackId }) {
  const videoRef = React.useRef();

  React.useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(`https://lp-playback.com/hls/${playbackId}/index.m3u8`);
        hls.attachMedia(videoRef.current);
      } else {
        videoRef.current.src = `https://lp-playback.com/hls/${playbackId}/index.m3u8`;
      }
    }
  }, [playbackId]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      style={{ width: "100%", maxHeight: "600px", background: "black" }}
    />
  );
}


