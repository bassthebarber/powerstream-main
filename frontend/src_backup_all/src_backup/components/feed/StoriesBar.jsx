import React from "react";

const stories = [
  { id: 1, name: "You", img: "", add: true },
  { id: 2, name: "Ava", img: "" },
  { id: 3, name: "Mack", img: "" },
  { id: 4, name: "Jai", img: "" },
  { id: 5, name: "Zara", img: "" },
];

export default function StoriesBar() {
  return (
    <div className="stories">
      {stories.map((s) => (
        <div
          key={s.id}
          className="card"
          style={{
            width: 140,
            height: 200,
            padding: 0,
            overflow: "hidden",
            position: "relative",
            borderColor: "var(--gold)",
          }}
        >
          <div
            style={{
              height: 140,
              background: "#0f0f0f",
              display: "grid",
              placeItems: "center",
              borderBottom: "1px solid #222",
            }}
          >
            {/* Placeholder media; plug your img/thumb here */}
            <span className="sub">Story</span>
          </div>

          <div style={{ padding: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#151515",
                display: "grid",
                placeItems: "center",
                border: "1px solid var(--gold)",
                flexShrink: 0,
              }}
              title={s.name}
            >
              {s.add ? "+" : s.name[0]}
            </div>
            <div style={{ fontWeight: 700 }}>{s.name}</div>
          </div>

          {/* Gold ring accent */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--gold)",
              boxShadow: "0 0 0 3px rgba(247,201,72,.2)",
            }}
          />
        </div>
      ))}
    </div>
  );
}


