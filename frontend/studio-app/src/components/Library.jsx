import { useEffect, useState } from "react";
import { listFiles } from "../api/studioApi";

export default function Library() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const f = await listFiles();
        setFiles(f);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={panel}>
      <h3 style={h}>Library</h3>
      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "salmon" }}>Error: {err}</p>}
      {!loading && files.length === 0 && <p>No files yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {files.map(f => (
          <li key={f.name} style={{ marginBottom: 10 }}>
            <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
            <div><audio controls src={f.url} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const panel = { background: "#000", color: "gold", padding: 16, borderRadius: 12 };
const h = { fontWeight: 800, margin: 0, marginBottom: 8 };
