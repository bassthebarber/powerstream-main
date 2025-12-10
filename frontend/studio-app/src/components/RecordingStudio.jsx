import { useEffect, useRef, useState } from "react";

/**
 * Config
 * - Reads your API/HLS from env if present, otherwise uses your domains.
 * - Vite: define VITE_STUDIO_API and VITE_HLS_BASE in .env
 */
const API_BASE =
  import.meta?.env?.VITE_STUDIO_API ||
  "https://studio.southernpowertvmusic.com/api";
const HLS_BASE =
  import.meta?.env?.VITE_HLS_BASE ||
  "https://api.southernpowertvmusic.com/hls";

export default function RecordingStudio() {
  const [recState, setRecState] = useState("idle"); // idle | recording | stopped | uploading
  const [audioURL, setAudioURL] = useState("");
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // --- Mic recording with MediaRecorder ---
  const startRecording = async () => {
    try {
      setStatus("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setRecState("stopped");
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecState("recording");
    } catch (err) {
      console.error(err);
      setStatus("Mic permission denied or unsupported browser.");
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream?.getTracks()?.forEach((t) => t.stop());
    } catch {}
  };

  const uploadRecording = async () => {
    if (!audioURL) return;
    setRecState("uploading");
    setStatus("Uploading…");

    // fetch blob from object URL
    const blob = await fetch(audioURL).then((r) => r.blob());
    const form = new FormData();
    form.append("file", new File([blob], `studio_${Date.now()}.webm`, { type: "audio/webm" }));

    try {
      // expects your studio backend route: POST /api/upload/audio (multer)
      const res = await fetch(`${API_BASE}/upload/audio`, {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      setStatus("✅ Uploaded!");
      setRecState("idle");
    } catch (e) {
      console.error(e);
      setStatus("Upload error: " + e.message);
      setRecState("stopped");
    }
  };

  // --- Live HLS player (simple <video> tag; works if nginx proxies /hls/) ---
  const liveSrc = `${HLS_BASE}/live/powerstream-secret-001/index.m3u8`;

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.title}>Southern Power Syndicate — AI Recording Studio</h1>
        <p style={styles.sub}>Black & Gold edition · Live · Record · Upload · Beats</p>
      </header>

      {/* LIVE PLAYER */}
      <section style={styles.card}>
        <h2 style={styles.h2}>Live Stream Monitor (HLS)</h2>
        <video
          style={styles.video}
          src={liveSrc}
          controls
          playsInline
          autoPlay
          muted
        />
        <div style={styles.note}>
          If the video doesn’t start, make sure a stream is live at:
          <code style={styles.code}> {liveSrc} </code>
        </div>
      </section>

      {/* RECORD / UPLOAD */}
      <section style={styles.card}>
        <h2 style={styles.h2}>Record & Upload (Mic)</h2>
        <div style={styles.row}>
          {recState === "idle" && (
            <button style={styles.btn} onClick={startRecording}>🎙️ Start</button>
          )}
          {recState === "recording" && (
            <button style={styles.btnWarn} onClick={stopRecording}>⏹ Stop</button>
          )}
          {recState === "stopped" && (
            <>
              <audio src={audioURL} controls />
              <button style={styles.btn} onClick={uploadRecording}>⬆️ Upload</button>
              <button style={styles.btnGhost} onClick={() => { setAudioURL(""); setRecState("idle"); }}>♻️ Reset</button>
            </>
          )}
          {recState === "uploading" && <span>Uploading…</span>}
        </div>
        {status && <div style={styles.status}>{status}</div>}
      </section>

      {/* QUICK LINKS */}
      <section style={styles.grid}>
        <a href="/#/beat-player" style={styles.tile}>🔊 Beat Player</a>
        <a href="/#/buy-beat" style={styles.tile}>💳 Buy Beat / Contact</a>
      </section>

      <footer style={styles.footer}>© {new Date().getFullYear()} Southern Power Syndicate · Studio</footer>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", background:"#000", color:"#f5d76e", fontFamily:"system-ui,Segoe UI,Arial", padding:"28px" },
  header: { marginBottom: 20 },
  title: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: 0.5 },
  sub: { marginTop: 6, color:"#f6e7a8" },
  h2: { marginTop: 0, marginBottom: 10, fontSize: 20 },
  card: { background:"#0b0b0b", border:"1px solid #3a2c00", borderRadius:14, padding:16, marginBottom:16, boxShadow:"0 0 24px rgba(255,215,0,0.06)" },
  video: { width:"100%", maxWidth:900, borderRadius:12, outline:"1px solid #3a2c00" },
  note: { fontSize:12, opacity:0.8, marginTop:6 },
  code: { background:"#161616", padding:"2px 6px", borderRadius:6, color:"#ffe082" },
  row: { display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" },
  btn: { background:"#d4af37", color:"#000", border:"none", padding:"10px 16px", borderRadius:10, cursor:"pointer", fontWeight:700 },
  btnWarn: { background:"#ff5c5c", color:"#000", border:"none", padding:"10px 16px", borderRadius:10, cursor:"pointer", fontWeight:700 },
  btnGhost: { background:"transparent", color:"#f5d76e", border:"1px solid #3a2c00", padding:"10px 16px", borderRadius:10, cursor:"pointer" },
  status: { marginTop: 8, color:"#ffd54f" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:12, marginTop:8 },
  tile: { display:"block", padding:"14px 16px", borderRadius:12, textDecoration:"none", color:"#000", background:"#f5d76e", fontWeight:800, textAlign:"center" },
  footer: { marginTop:24, fontSize:12, opacity:0.7 }
};
