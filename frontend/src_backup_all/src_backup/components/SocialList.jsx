import React, { useEffect, useState } from "react";
const apiBase = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5001/api";

export default function SocialList({ endpoint, title }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [err, setErr] = useState("");
  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true); setErr("");
      try {
        const res = await fetch(`${apiBase}/social/${endpoint}`);
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data?.error || "Load failed");
        if (on) setItems(data.items || []);
      } catch (e) { if (on) setErr(e.message); } finally { if (on) setLoading(false); }
    })();
    return () => (on = false);
  }, [endpoint]);

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {loading && <div>Loading…</div>}
      {err && <div style={{ color: "#e66" }}>❌ {err}</div>}
      {!loading && !err && items.length === 0 && <div>No posts yet.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {items.map((p) => (
          <article key={p._id} style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
              {new Date(p.createdAt).toLocaleString()} • {p.author || "PowerStream"}
            </div>
            <div style={{ marginBottom: 8 }}>{p.text}</div>
            {p.mediaUrl && <img src={p.mediaUrl} alt="" style={{ width: "100%", borderRadius: 6, display: "block" }} />}
            {p.playbackUrl && (
              <a href={p.playbackUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8 }}>
                ▶️ Open Playback (m3u8)
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}


