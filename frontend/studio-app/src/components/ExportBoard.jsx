import { useState } from "react";
import { sendExportEmail } from "../api/studioApi";

export default function ExportBoard() {
  const [to, setTo] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");

  const send = async () => {
    try {
      setMsg("Sending…");
      await sendExportEmail({ to, url });
      setMsg("✅ Sent!");
    } catch (e) {
      setMsg("❌ " + e.message);
    }
  };

  return (
    <div style={panel}>
      <h3 style={h}>Export & Email</h3>
      <input placeholder="Recipient Email" value={to} onChange={e=>setTo(e.target.value)} style={input} />
      <input placeholder="File URL (from Library)" value={url} onChange={e=>setUrl(e.target.value)} style={{ ...input, marginTop: 8 }} />
      <div style={{ marginTop: 10 }}><button style={btn} onClick={send} disabled={!to || !url}>Send</button></div>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}

const panel = { background: "#000", color: "gold", padding: 16, borderRadius: 12 };
const h = { fontWeight: 800, margin: 0, marginBottom: 8 };
const btn = { background: "gold", color: "#000", fontWeight: 700, padding: "8px 14px", borderRadius: 10, border: 0, cursor: "pointer" };
const input = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #444" };
