import React from "react";

const itemsTop = [
  { id: "me",  label: "Your Profile", icon: "👤" },
  { id: "home", label: "Home", icon: "🏠" },
  { id: "watch", label: "Watch", icon: "📺" },
  { id: "market", label: "Marketplace", icon: "🛒" },
  { id: "groups", label: "Groups", icon: "👥" },
  { id: "memories", label: "Memories", icon: "🗓️" },
];

const shortcuts = [
  { id: "ps-station", label: "PowerStation", icon: "⚡" },
  { id: "ps-live", label: "Live Sessions", icon: "🔴" },
  { id: "ps-creator", label: "Creator Studio", icon: "🎬" },
];

export default function SidebarLeft() {
  return (
    <aside className="sidebar-left">
      <div className="card" style={{ position: "sticky", top: 16 }}>
        <div style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 10 }}>Menu</div>
        <nav style={{ display: "grid", gap: 8 }}>
          {itemsTop.map((it) => (
            <button
              key={it.id}
              className="button"
              style={{
                justifyContent: "flex-start",
                gap: 10,
                background: "transparent",
                color: "var(--text)",
                border: "1px solid #222",
              }}
            >
              <span style={{ width: 22, textAlign: "center" }}>{it.icon}</span>
              {it.label}
            </button>
          ))}
        </nav>

        <div style={{ height: 1, background: "#242424", margin: "12px 0" }} />

        <div style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 10 }}>Your shortcuts</div>
        <nav style={{ display: "grid", gap: 8 }}>
          {shortcuts.map((it) => (
            <button
              key={it.id}
              className="button"
              style={{
                justifyContent: "flex-start",
                gap: 10,
                background: "transparent",
                color: "var(--text)",
                border: "1px solid #222",
              }}
            >
              <span style={{ width: 22, textAlign: "center" }}>{it.icon}</span>
              {it.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}


