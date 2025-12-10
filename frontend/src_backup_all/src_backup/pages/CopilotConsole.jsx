// frontend/src/pages/CopilotConsole.jsx
import React, { useState } from "react";

const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE) ||
  "http://127.0.0.1:5001/api";

export default function CopilotConsole() {
  const [cmd, setCmd] = useState("build all");
  const [ctx, setCtx] = useState(
    JSON.stringify(
      {
        routes: { autofix: true, splitPages: true },
        theme: {
          name: "powerstream-dark",
          primary: "#d4af37",
          accent: "#d4af37",
          background: "#0a0a0a",
          logo: "/logos/powerstream-logo.png",
        },
      },
      null,
      2
    )
  );
  const [out, setOut] = useState("");

  async function run() {
    setOut("⏳ Running…");
    try {
      const payload = {
        command: cmd.trim(),
        context: ctx ? JSON.parse(ctx) : {},
      };
      const res = await fetch(`${API_BASE}/copilot/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setOut(`❌ ${e.message}`);
    }
  }

  return (
    <div style={{ padding: 16, color: "#e8e8e8", background: "#0a0a0a", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 12 }}>🧠 Copilot Console</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
        <label>
          <div>Command</div>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            style={{ width: "100%", padding: 8, background: "#111", color: "#e8e8e8", border: "1px solid #333" }}
            placeholder='e.g., build powerfeed'
          />
        </label>

        <label>
          <div>Context (JSON)</div>
          <textarea
            rows={10}
            value={ctx}
            onChange={(e) => setCtx(e.target.value)}
            style={{ width: "100%", padding: 8, background: "#111", color: "#e8e8e8", border: "1px solid #333", fontFamily: "mono" }}
          />
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setCmd("build powerfeed")}>build powerfeed</button>
          <button onClick={() => setCmd("build powergram")}>build powergram</button>
          <button onClick={() => setCmd("build powerreels")}>build powerreels</button>
          <button onClick={() => setCmd("build tv")}>build tv</button>
          <button onClick={() => setCmd("build all")}>build all</button>
          <button onClick={run} style={{ marginLeft: "auto" }}>Run</button>
        </div>

        <label>
          <div>Output</div>
          <pre style={{ background: "#111", color: "#9fe89f", padding: 12, border: "1px solid #333", overflowX: "auto" }}>
            {out || "—"}
          </pre>
        </label>
      </div>
    </div>
  );
}


