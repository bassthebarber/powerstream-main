import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",      // right aligned
        padding: "10px 14px",
        color: "#ffb34d",
        borderTop: "1px solid rgba(255,179,77,.25)",
        background: "transparent",
        zIndex: 10,
      }}
    >
      <small>© {new Date().getFullYear()} PowerStream — All Rights Reserved</small>
    </footer>
  );
}


