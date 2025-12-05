import React from "react";
import { useNavigate } from "react-router-dom";

const gold = "#ffb84d";

export default function MenuGridItem({ icon, label, path, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    } else {
      console.log(`Menu item clicked: ${label}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "20px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255, 184, 77, 0.2)",
        background: "rgba(255, 184, 77, 0.05)",
        color: gold,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: 100,
        width: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 184, 77, 0.12)";
        e.currentTarget.style.borderColor = gold;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 184, 77, 0.05)";
        e.currentTarget.style.borderColor = "rgba(255, 184, 77, 0.2)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{ fontSize: "2rem" }}>{icon}</span>
      <span style={{ fontSize: "0.9rem", fontWeight: 600, textAlign: "center" }}>
        {label}
      </span>
    </button>
  );
}


