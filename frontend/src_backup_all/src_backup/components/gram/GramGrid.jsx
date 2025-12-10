import React, { useEffect, useState } from "react";
import { fetchGramGallery } from "../../services/gramApi";

const wrap = { padding: 16 };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 12,
};
const tile = {
  background: "#0f1116",
  border: "1px solid #a87334",
  borderRadius: 14,
  padding: 8,
  boxShadow: "0 0 18px rgba(168,115,52,0.08)",
};
const img = {
  width: "100%",
  height: 160,
  objectFit: "cover",
  borderRadius: 10,
  display: "block",
};
const cap = { marginTop: 6, color: "#f3f3f3", fontSize: 12 };

export default function GramGrid() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchGramGallery();
        setItems(data);
        setState("ready");
      } catch (e) {
        console.error(e);
        setState("error");
      }
    })();
  }, []);

  if (state === "loading") return <div style={wrap}>Loading gallery…</div>;
  if (state === "error") return <div style={wrap}>Couldn’t load gallery.</div>;
  if (!items.length) return <div style={wrap}>No images yet.</div>;

  return (
    <div style={wrap}>
      <div style={grid}>
        {items.map((m) => (
          <div key={(m.id || m.created_at) + m.media_url} style={tile}>
            {m.media_type === "video" ? (
              <video src={m.media_url} controls style={img} />
            ) : (
              <img src={m.media_url} alt={m.caption || ""} style={img} />
            )}
            {m.caption ? <div style={cap}>{m.caption}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}


