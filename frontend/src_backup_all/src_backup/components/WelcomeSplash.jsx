import React, { useEffect, useRef, useState } from "react";

export default function WelcomeSplash({
  logo = "/logos/powerstream-logo.png",        // spinning logo
  audio = "/audio/powerstream-intro.mp3",      // << PowerStream audio
  size = 300,
  ms = 2500,
  onDone = () => {}
}) {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // try to play; some browsers require user gesture—if it fails, we just continue
    audioRef.current?.play().catch(() => {});
    const t = setTimeout(() => {
      setVisible(false);
      onDone();
    }, ms);
    return () => clearTimeout(t);
  }, [ms, onDone]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
      display: 'grid', placeItems: 'center', zIndex: 9999
    }}>
      <div style={{ textAlign: 'center' }}>
        <img
          src={logo}
          alt="PowerStream"
          width={size} height={size}
          style={{ borderRadius: 24, animation: 'spin 4s linear infinite' }}
        />
        <h2 style={{ marginTop: 12, color: '#fff' }}>Welcome to PowerStream</h2>
        <audio ref={audioRef} src={audio} preload="auto" />
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}


