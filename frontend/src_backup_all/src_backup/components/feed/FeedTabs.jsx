import React, { useState } from "react";

export default function FeedTabs({ onChange }) {
  const [tab, setTab] = useState("all");
  const click = (v) => { setTab(v); onChange?.(v); };

  const btn = (v, label) => (
    <button
      key={v}
      onClick={() => click(v)}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #5b4b1a",
        background: tab === v ? "#1a1207" : "#0f0f0f",
        color: tab === v ? "gold" : "#ffcc99",
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {btn("all","All")}
      {btn("image","Photos")}
      {btn("video","Videos")}
    </div>
  );
}


