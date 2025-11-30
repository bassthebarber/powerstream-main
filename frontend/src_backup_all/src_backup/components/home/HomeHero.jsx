import React, { useEffect } from "react";
import css from "../../styles/HomeHero.module.css"; // keep this path if your module is here

export default function HomeHero() {
  // Play welcome audio on first user gesture (autoplay-safe)
  useEffect(() => {
    const src = import.meta.env.VITE_WELCOME_MP3 || "/audio/welcome.mp3";
    const audio = new Audio(src);
    audio.volume = 0.4;

    const playOnce = () => {
      audio.play().catch(() => {/* ignore autoplay block */});
      window.removeEventListener("click", playOnce);
      window.removeEventListener("touchstart", playOnce);
      window.removeEventListener("keydown", playOnce);
    };

    window.addEventListener("click", playOnce);
    window.addEventListener("touchstart", playOnce);
    window.addEventListener("keydown", playOnce);

    return () => {
      window.removeEventListener("click", playOnce);
      window.removeEventListener("touchstart", playOnce);
      window.removeEventListener("keydown", playOnce);
    };
  }, []);

  return (
    <section className={css.heroWrap}>
      <div className={css.logoHalo}>
        <img
          className={css.spin}
          src="/logos/powerstream-logo.png"
          alt="PowerStream"
          width={220}
          height={220}
          draggable={false}
        />
      </div>

      <h1 className={css.title}>Welcome to PowerStream</h1>

      <p className={css.subtitle}>
        <span>Stream audio</span> • <span>video</span> • <span>Live TV</span> •{" "}
        <span>chat</span> • <span>community</span>
      </p>
    </section>
  );
}


