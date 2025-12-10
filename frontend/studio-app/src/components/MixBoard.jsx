import { useState } from "react";
import { runProcess } from "../api/studioApi";

export default function MixBoard() {
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");

  const run = async () => {
    try {
      if (!url.trim()) return alert("Paste a file URL from Library");
      setMsg("Mixing…");
      const r = await runProcess({ file: url, operation: "auto-mix" });
      setMsg("✅ " + (r.message || "Mix started"));
    } catch (e) {
      setMsg("❌ " + e.message);
    }
  };

  return (
    <div style={panel}>
      <h3 style={h}>Mix Board</h3>
      <input
        placeholder="Paste file URL (from Library)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={input}
      />
      <div style={{ marginTop: 10 }}>
        <button style={btn} onClick={run}>Run Mix</button>
      </div>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}

const panel = { background: "#000", color: "gold", padding: 16, borderRadius: 12 };
const h = { fontWeight: 800, margin: 0, marginBottom: 8 };
const btn = { background: "gold", color: "#000", fontWeight: 700, padding: "8px 14px", borderRadius: 10, border: 0, cursor: "pointer" };
const input = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #444" };
