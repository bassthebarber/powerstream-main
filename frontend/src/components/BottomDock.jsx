import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

const dockItems = [
  { label: "Home", path: "/", emoji: "🏠" },
  { label: "Feed", path: "/powerfeed", emoji: "📰" },
  { label: "PowerGram", path: "/powergram", emoji: "📸" },
  { label: "PowerReel", path: "/powerreel", emoji: "🎬" },
  { label: "PowerLine", path: "/powerline", emoji: "💬" },
  { label: "Menu", path: "/feed/menu", emoji: "☰" },
  { label: "Profile", path: "/profile", emoji: "👤" },
];

const BottomDock = ({ currentPath }) => {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--ps-black)",
        borderTop: `1px solid var(--ps-border)`,
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.45)",
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        gap: "8px",
        zIndex: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      {dockItems.map((item) => {
        const isActive =
          currentPath === item.path ||
          (item.path !== "/" && currentPath.startsWith(item.path));

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: "12px",
              padding: "10px 6px",
              background: isActive
                ? "var(--ps-btn-secondary-bg)"
                : "rgba(255, 255, 255, 0.05)",
              color: isActive ? "var(--ps-gold)" : "var(--ps-gray-lighter)",
              fontSize: "0.75rem",
              fontWeight: isActive ? 700 : 500,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomDock;


