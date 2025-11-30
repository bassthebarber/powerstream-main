import React, { useEffect, useState } from "react";
import { fetchReels } from "../../services/reel";

const wrap = { padding: 16 };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 14,
};
const tile = {
  background: "#0f1116",
  border: "1px solid #a87334",
  borderRadius: 14,
  padding: 8,
  boxShadow: "0 0 18px rgba(168,115,52,0.08)",
};
const vid = {
  width: "100%",
  height: 380,
  objectFit: "cover",
  borderRadius: 10,
  display: "block",
};
const cap = { marginTop: 6, color: "#f3f3f3", fontSize: 12 };

export default function ReelGrid() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchReels();
        setItems(data);
        setState("ready");
      } catch (e) {
        console.error(e);
        setState("error");
      }
    })();
  }, []);

  if (state === "loading") return <div style={wrap}>Loading reels…</div>;
  if (state === "error") return <div style={wrap}>Couldn’t load reels.</div>;
  if (!items.length) return <div style={wrap}>No reels yet.</div>;

  return (
    <div style={wrap}>
      <div style={grid}>
        {items.map((r) => (
          <div key={(r.id || r.created_at) + r.video_url} style={tile}>
            <video src={r.video_url} controls playsInline style={vid} />
            {r.caption ? <div style={cap}>{r.caption}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}


