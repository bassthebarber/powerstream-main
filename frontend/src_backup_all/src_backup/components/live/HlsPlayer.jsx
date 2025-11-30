import React, { useEffect, useRef } from "react";
import Hls from "hls\.jsx";

export default function HlsPlayer({ playbackId }){
  const videoRef = useRef(null);
  const src = playbackId ? `https://lp-playback.com/hls/${playbackId}/index.m3u8` : null;

  useEffect(()=>{
    const video = videoRef.current;
    if(!video || !src) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src; return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker:true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  },[src]);

  return <video ref={videoRef} controls style={{width:"100%",maxHeight:"65vh",background:"#000",borderRadius:12}}/>;
}


