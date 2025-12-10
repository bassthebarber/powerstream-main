import { useState } from "react";
import { uploadToStudio } from "../api/studioApi";

export default function UploadTrackPage() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");

  const upload = async () => {
    try {
      if (!file) return;
      setMsg("Uploading…");
      const j = await uploadToStudio(file, file.name || "track.wav");
      setUrl(j.url);
      setMsg("✅ Uploaded");
    } catch (e) {
      setMsg("❌ " + e.message);
    }
  };

  return (
    <div style={panel}>
      <h3 style={h}>Upload Track</h3>
      <input type="file" accept="audio/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
      <div style={{ marginTop: 10 }}>
        <button style={btn} onClick={upload} disabled={!file}>Upload</button>
      </div>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      {url && <p>URL: <a href={url} target="_blank" rel="noreferrer">{url}</a></p>}
    </div>
  );
}

const panel = { background: "#000", color: "gold", padding: 16, borderRadius: 12 };
const h = { fontWeight: 800, margin: 0, marginBottom: 8 };
const btn = { background: "gold", color: "#000", fontWeight: 700, padding: "8px 14px", borderRadius: 10, border: 0, cursor: "pointer" };
