// src/components/UploadMedia.jsx
import { useState } from "react";
import { uploadMedia } from "@/services/UploadMedia\.jsx";

export default function UploadMedia() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("auto");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setResult(null);

    try {
      setLoading(true);
      const data = await uploadMedia({ file, title, kind });
      setResult(data);
      setStatus("✅ Upload complete");
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16, border: "1px solid #222", borderRadius: 12 }}>
      <h2 style={{ marginBottom: 12 }}>Upload Media</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Title</label>
          <input
            type="text"
            placeholder="(optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Type</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 6 }}>
            <option value="auto">Auto-detect</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>

        <button
          disabled={!file || loading}
          type="submit"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: loading ? "#666" : "#111",
            color: "#f6d365",
            cursor: !file || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}

      {result && (
        <div style={{ marginTop: 12 }}>
          <pre style={{ background: "#0b0b0b", padding: 10, borderRadius: 8, overflowX: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.url && (
            <p>
              <a href={result.url} target="_blank" rel="noreferrer">Open uploaded file</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}


