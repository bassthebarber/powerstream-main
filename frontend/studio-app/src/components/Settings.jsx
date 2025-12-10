import { useEffect, useState } from "react";

export default function Settings() {
  const [sampleRate, setSampleRate] = useState(48000);
  const [latency, setLatency] = useState("interactive");
  const [theme, setTheme] = useState("black-gold");

  useEffect(() => {
    const saved = localStorage.getItem("studio.settings");
    if (saved) {
      try {
        const j = JSON.parse(saved);
        if (j.sampleRate) setSampleRate(j.sampleRate);
        if (j.latency) setLatency(j.latency);
        if (j.theme) setTheme(j.theme);
      } catch {}
    }
  }, []);

  function save() {
    localStorage.setItem("studio.settings", JSON.stringify({ sampleRate, latency, theme }));
    alert("Settings saved");
  }

  return (
    <div style={panel}>
      <h3 style={h}>Settings</h3>
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label>Sample Rate
          <input type="number" value={sampleRate} onChange={e=>setSampleRate(Number(e.target.value || 48000))} style={input}/>
        </label>
        <label>Latency
          <select value={latency} onChange={e=>setLatency(e.target.value)} style={input}>
            <option value="interactive">interactive</option>
            <option value="balanced">balanced</option>
            <option value="quality">quality</option>
          </select>
        </label>
        <label>Theme
          <select value={theme} onChange={e=>setTheme(e.target.value)} style={input}>
            <option value="black-gold">black-gold</option>
            <option value="light">light</option>
          </select>
        </label>
        <button style={btn} onClick={save}>Save</button>
      </div>
    </div>
  );
}

const panel = { background: "#000", color: "gold", padding: 16, borderRadius: 12 };
const h = { fontWeight: 800, margin: 0, marginBottom: 8 };
const btn = { background: "gold", color: "#000", fontWeight: 700, padding: "8px 14px", borderRadius: 10, border: 0, cursor: "pointer" };
const input = { width: "100%", padding: 8, borderRadius: 8, border: "1px solid #444" };
