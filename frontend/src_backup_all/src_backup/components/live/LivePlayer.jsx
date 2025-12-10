// src/components/live/LivePlayer.jsx
import React, { useEffect, useRef } from 'react';
import { attachHls } from '../../lib/hlsPlayer';
export default function LivePlayer({ playbackId, src, autoPlay=false, muted=false, height=420 }) {
  const ref = useRef(null);
  const hlsSrc = src || (playbackId ? `https://livepeercdn.com/hls/${playbackId}/index.m3u8` : null);
  useEffect(()=>{ if(!ref.current||!hlsSrc) return; const hls=attachHls(ref.current,hlsSrc); return ()=>hls?.destroy?.(); },[hlsSrc]);
  return <video ref={ref} controls playsInline autoPlay={autoPlay} muted={muted} style={{width:'100%',height,background:'#000',borderRadius:12}} />;
}


