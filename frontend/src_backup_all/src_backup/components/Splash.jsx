import React, { useEffect, useState } from "react";

export default function Splash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const audio = new Audio("/audio/welcome-voice.mp3"); // optional
    audio.volume = 0.4;
    audio.play().catch(() => {});
    const t = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position:"fixed", inset:0, background:"#0a0a0a", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:9999
    }}>
      <div style={{textAlign:"center"}}>
        <img src="/logos/powerstream-logo.png" alt="PowerStream" style={{
          width:140, height:140, animation:"spin 2.2s linear infinite"
        }} />
        <div style={{color:"#d4af37", marginTop:12, fontSize:18}}>PowerStream</div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}


