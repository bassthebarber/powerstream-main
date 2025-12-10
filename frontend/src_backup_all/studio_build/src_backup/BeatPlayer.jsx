import React, { useEffect, useMemo, useRef, useState } from "react";

function fmtTime(s) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * BeatPlayer
 * Props:
 *  - src: string (audio url)
 *  - title?: string
 *  - artwork?: string
 *  - onEnded?: () => void
 *  - initialVolume?: number (0..1)
 */
export default function BeatPlayer({
  src,
  title = "Untitled Beat",
  artwork,
  onEnded,
  initialVolume = 0.9,
}) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dur, setDur] = useState(0);
  const [loop, setLoop] = useState(false);
  const [vol, setVol] = useState(initialVolume);

  // Load/attach listeners
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.volume = vol;
    const onLoaded = () => {
      setDur(a.duration || 0);
      setReady(true);
    };
    const onTime = () => setCurrent(a.currentTime || 0);
    const onEnd = () => {
      setPlaying(false);
      onEnded && onEnded();
    };

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [src]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.loop = loop;
  }, [loop]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = vol;
  }, [vol]);

  const pct = useMemo(
    () => (dur > 0 ? Math.min(100, Math.max(0, (current / dur) * 100)) : 0),
    [current, dur]
  );

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
      } catch (e) {
        console.warn("Autoplay blocked:", e);
      }
    }
  };

  const onScrub = (e) => {
    const a = audioRef.current;
    if (!a || dur <= 0) return;
    const val = Number(e.target.value);
    a.currentTime = (val / 100) * dur;
    setCurrent(a.currentTime);
  };

  const step = (secs) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(dur, a.currentTime + secs));
  };

  // Hotkeys: space (play/pause), left/right arrows, L loop
  useEffect(() => {
    const h = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight") {
        step(5);
      } else if (e.code === "ArrowLeft") {
        step(-5);
      } else if (e.key.toLowerCase() === "l") {
        setLoop((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [dur, playing]);

  return (
    <div
      className="beat-player"
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr",
        gap: "16px",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(0,0,0,0.35)",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 12,
          overflow: "hidden",
          background: "#111",
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {artwork ? (
          <img src={artwork} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 12, opacity: 0.7 }}>No Art</span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <button
            onClick={toggle}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: playing ? "#d97706" : "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? "Pause" : "Play"}
          </button>

          <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>

          <div style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", opacity: 0.8 }}>
            {fmtTime(current)} / {fmtTime(dur)}
          </div>
        </div>

        <input
          ref={progressRef}
          type="range"
          min={0}
          max={100}
          value={pct}
          step={0.1}
          onChange={onScrub}
          style={{ width: "100%" }}
        />

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Vol
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vol}
              onChange={(e) => setVol(Number(e.target.value))}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Loop
          </label>

          <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
            ⎵ Space • ←/→ ±5s • L loop
          </div>
        </div>
      </div>
    </div>
  );
}
