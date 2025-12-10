// frontend/src/studio-app/StudioDAW.jsx
import { useEffect, useState } from "react";
import {
  uploadToStudio,
  listAssets,
  deleteAsset,
  aiMix,
  aiMaster,
  requestExport,
} from "../api/studioApi.js";

export default function StudioDAW() {
  const [assets, setAssets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function refresh() {
    try {
      setBusy(true);
      const data = await listAssets();
      setAssets(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setMsg(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Uploading…");
    try {
      await uploadToStudio(file, { title: file.name });
      setMsg("✅ Uploaded");
      await refresh();
    } catch (e) {
      setMsg("❌ " + String(e.message || e));
    }
  }

  async function onMix(id) {
    setMsg("Mixing…");
    try {
      await aiMix(id, { style: "radio" });
      setMsg("✅ Mix job queued");
    } catch (e) {
      setMsg("❌ " + String(e.message || e));
    }
  }

  async function onMaster(id) {
    setMsg("Mastering…");
    try {
      await aiMaster(id, { loudness: -14 });
      setMsg("✅ Master job queued");
    } catch (e) {
      setMsg("❌ " + String(e.message || e));
    }
  }

  async function onExport(id) {
    setMsg("Exporting…");
    try {
      await requestExport(id, "wav");
      setMsg("✅ Export job queued");
    } catch (e) {
      setMsg("❌ " + String(e.message || e));
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this item?")) return;
    setMsg("Deleting…");
    try {
      await deleteAsset(id);
      setMsg("✅ Deleted");
      await refresh();
    } catch (e) {
      setMsg("❌ " + String(e.message || e));
    }
  }

  return (
    <div className="page-wrap">
      <h1 className="h1">Studio DAW</h1>
      <p className="subtitle">
        Upload, list, mix, master, and export tracks. (Wires to your backend.)
      </p>

      <div className="tile" style={{ marginBottom: 16 }}>
        <input type="file" accept="audio/*" onChange={onUpload} />
        <div style={{ marginTop: 8 }}>{msg}</div>
      </div>

      <div className="tile">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Assets</strong>
          <button onClick={refresh} disabled={busy}>
            {busy ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
          {assets.map((a) => (
            <li
              key={a.id || a._id || a.public_id || a.key}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto auto",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid #1a1a1d",
              }}
            >
              <span>{a.title || a.filename || a.name || a._id}</span>
              <button onClick={() => onMix(a.id || a._id)}>Mix</button>
              <button onClick={() => onMaster(a.id || a._id)}>Master</button>
              <button onClick={() => onExport(a.id || a._id)}>Export</button>
              <button onClick={() => onDelete(a.id || a._id)}>Delete</button>
            </li>
          ))}
          {!assets.length && <li>No assets yet.</li>}
        </ul>
      </div>
    </div>
  );
}
