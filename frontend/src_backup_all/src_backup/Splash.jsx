// frontend/src/components/Splash.jsx
import React, { useEffect, useRef, useState } from "react";

export default function Splash({
  logo = "/logos/powerstream-logo.png", // <-- your real logo
  audio = "/audio/powerstream-intro.mp3", // <-- keep name exactly if you have it
  size = 300,
  ms = 2500,
}) {
  const [show, setShow] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    let t;
    // try to play audio if present; ignore errors
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    t = setTimeout(() => setShow(false), ms);
    return () => clearTimeout(t);
  }, [ms]);

  if (!show) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, display: "grid", placeItems: "center",
      background: "rgba(0,0,0,0.85)", zIndex: 9999
    }}>
      <div style={{ textAlign: "center" }}>
        <img
          src={logo}
          alt="PowerStream"
          width={size}
          height={size}
          style={{
            borderRadius: 24,
            animation: "pspin 3s linear infinite",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <h2 style={{ marginTop: 14 }}>Welcome to PowerStream</h2>
        <audio ref={audioRef} src={audio} preload="auto" />
      </div>
      <style>{`
        @keyframes pspin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}


