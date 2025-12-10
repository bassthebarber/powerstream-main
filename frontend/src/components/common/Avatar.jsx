// frontend/src/components/common/Avatar.jsx
// Avatar component per Overlord Spec
import React from "react";
import "./common.css";

// Generate consistent color from string
function stringToColor(str) {
  if (!str) return "#e6b800";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#e6b800", "#ff6b6b", "#4ecdc4", "#45b7d1", 
    "#96ceb4", "#ffeaa7", "#dfe6e9", "#fd79a8",
    "#a29bfe", "#74b9ff", "#00b894", "#fdcb6e",
  ];
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = "medium", // small, medium, large, xlarge
  online = false,
  className = "",
  onClick,
}) {
  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`ps-avatar ps-avatar--${size} ${className}`}
      style={{ "--avatar-bg": bgColor }}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={name || "Avatar"} className="ps-avatar-img" />
      ) : (
        <span className="ps-avatar-initials">{initials}</span>
      )}
      {online && <span className="ps-avatar-online" />}
    </div>
  );
}


