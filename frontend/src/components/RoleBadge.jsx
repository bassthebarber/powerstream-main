import React from "react";

export default function RoleBadge({ user }) {
  if (!user) return null;

  const roles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : [user.role].filter(Boolean);

  if (!roles.length || roles[0] === "user") return null;

  const primary = roles[0];

  const labelMap = {
    admin: "Admin",
    stationOwner: "Station Owner",
  };

  const label = labelMap[primary] || primary;

  return (
    <span
      style={{
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid rgba(255, 184, 77, 0.7)",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: "#ffb84d",
        background: "rgba(0,0,0,0.6)",
      }}
    >
      {label}
    </span>
  );
}





