// components/Welcome/IntroPlayer.jsx
import React, { useEffect } from "react";
import branding from "../../configs/branding";

const IntroPlayer = () => {
  useEffect(() => {
    const audio = new Audio(branding.audio.welcome);
    audio.play().catch((e) => console.log("Autoplay blocked:", e));
  }, []);

  return null; // No UI, just background audio
};

export default IntroPlayer;


