import React, { useEffect, useRef, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://studio-api.southernpowertvmusic.com";

export default function StudioRecord() {
  const [status, setStatus] = useState("idle"); // idle|ready|recording|paused|stopped|saving|saved|denied|in_use|no_device|insecure|error
  const [msg, setMsg] = useState("");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [savedUrl, setSavedUrl] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const tickRef = useRef(null);

  // Meter
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const dataArrRef = useRef(null);

  useEffect(() => {
    // list audio inputs once we have permissions
    navigator.mediaDevices?.enumerateDevices?.().then((list) => {
      setDevices(list.filter((d) => d.kind === "audioinput"));
    });
  }, []);

  function stopMeter() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try { audioCtxRef.current && audioCtxRef.current.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  function startMeter(stream) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AC();
    const source = audioCtxRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioCtxRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    source.connect(analyserRef.current);

    dataArrRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

    const draw = () => {
      analyserRef.current.getByteTimeDomainData(dataArrRef.current);
      let sum = 0;
      for (let i = 0; i < dataArrRef.current.length; i++) {
        const v = (dataArrRef.current[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArrRef.current.length);
      const level = Math.min(1, rms * 4); // boost a bit

      // draw vertical meter
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const h = canvas.height * level;
      ctx.fillStyle = "#ffd166"; // gold-ish
      ctx.fillRect(0, canvas.height - h, canvas.width, h);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
  }

  async function requestMic() {
    setMsg("");
    setSavedUrl("");
    try {
      if (window.isSecureContext !== true) {
        setStatus("insecure");
        setMsg("This page must be loaded over HTTPS.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });

      streamRef.current = stream;
      startMeter(stream);

      const mime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        // release device when fully done
        stream.getTracks().forEach((t) => t.stop());
        stopMeter();
      };

      setStatus("ready");
      setMsg("Mic is ready.");
    } catch (err) {
      console.warn(err);
      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        setMsg("Mic permission denied. Click the lock icon → Allow Microphone, then reload.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setStatus("no_device");
        setMsg("No microphone found. Plug one in or pick a device.");
      } else if (name === "NotReadableError") {
        setStatus("in_use");
        setMsg("Microphone is in use by another app. Close Zoom/Teams and try again.");
      } else {
        setStatus("error");
        setMsg(`Error: ${name || "unknown"}`);
      }
    }
  }

  function start() {
    if (!mediaRecorderRef.current) return;
    chunksRef.current = [];
    mediaRecorderRef.current.start(250);
    setElapsed(0);
    tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    setStatus("recording");
  }
  function pause() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
    }
  }
  function resume() {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
    }
  }
  function stop() {
    if (!mediaRecorderRef.current) return;
    try { mediaRecorderRef.current.stop(); } catch {}
    clearInterval(tickRef.current);
    setStatus("stopped");
  }
  function del() {
    chunksRef.current = [];
    setSavedUrl("");
    setElapsed(0);
    setStatus("ready");
  }

  async function save() {
    if (!chunksRef.current.length) return;
    setStatus("saving");
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const fd = new FormData();
    fd.append("audio", blob, `take-${Date.now()}.webm`);

    try {
      const res = await fetch(`${API_BASE}/api/recordings`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setSavedUrl(data.url || "");
      setStatus("saved");
      setMsg("Saved!");
    } catch (e) {
      setStatus("error");
      setMsg(e.message || "Save failed");
    }
  }

  const canRecord = status === "ready" || status === "paused" || status === "stopped";
  const sec = String(elapsed % 60).padStart(2, "0");
  const min = String(Math.floor(elapsed / 60)).padStart(2, "0");

  return (
    <div style={{ color: "#fff", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Studio Record</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <select
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          style={{ background: "#111", color: "#ffd166", borderRadius: 10, padding: "8px 10px" }}
        >
          <option value="">Default microphone</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || "Mic"}</option>
          ))}
        </select>

        <button onClick={requestMic} style={btn("outline")}>Enable Mic</button>
        <canvas ref={canvasRef} width={12} height={48} style={{ background: "#222", borderRadius: 6 }} />
        <span style={{ opacity: 0.8 }}>{min}:{sec}</span>
        <StatusPill status={status} msg={msg} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={start} disabled={!canRecord} style={btn("solid")}>● Record</button>
        <button onClick={pause} disabled={status !== "recording"} style={btn("outline")}>‖ Pause</button>
        <button onClick={resume} disabled={status !== "paused"} style={btn("outline")}>▶ Resume</button>
        <button onClick={stop} disabled={status !== "recording" && status !== "paused"} style={btn("outline")}>■ Stop</button>
        <button onClick={del} disabled={!chunksRef.current.length} style={btn("ghost")}>✖ Delete</button>
        <button onClick={save} disabled={status !== "stopped"} style={btn("solid")}>⬆ Save</button>
      </div>

      {savedUrl && (
        <p style={{ marginTop: 10 }}>
          Saved to: <a href={savedUrl} target="_blank" rel="noreferrer" style={{ color: "#ffd166" }}>{savedUrl}</a>
        </p>
      )}
    </div>
  );
}

function StatusPill({ status, msg }) {
  const colors = {
    idle: "#666",
    ready: "#3fb950",
    recording: "#e11d48",
    paused: "#ffd166",
    stopped: "#888",
    saving: "#0891b2",
    saved: "#22c55e",
    denied: "#f43f5e",
    in_use: "#f97316",
    no_device: "#f97316",
    insecure: "#f43f5e",
    error: "#ef4444"
  };
  const text = {
    idle: "Idle",
    ready: "Ready",
    recording: "Recording…",
    paused: "Paused",
    stopped: "Stopped",
    saving: "Saving…",
    saved: "Saved",
    denied: "Mic denied",
    in_use: "Mic in use",
    no_device: "No mic",
    insecure: "HTTPS required",
    error: "Error"
  }[status] || "Status";

  return (
    <span style={{
      background: colors[status] || "#666",
      color: "#000",
      borderRadius: 12,
      fontWeight: 700,
      padding: "6px 10px"
    }}>
      {text}{msg ? ` — ${msg}` : ""}
    </span>
  );
}

function btn(variant) {
  const base = {
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    border: "2px solid #ffd166"
  };
  if (variant === "solid") return { ...base, background: "linear-gradient(180deg,#ffda5c 0%,#e6b800 100%)", color: "#000" };
  if (variant === "outline") return { ...base, background: "#111", color: "#ffd166" };
  return { ...base, background: "transparent", color: "#ffd166" }; // ghost
}
