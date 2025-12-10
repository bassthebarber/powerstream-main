import React from "react";
import { Link, useLocation } from "react-router-dom";

const btn = (active) => ({
  flex: 1,
  padding: "10px 6px",
  textAlign: "center",
  fontWeight: active ? 700 : 500,
  borderTop: active ? "2px solid #ffb34d" : "2px solid transparent"
});

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 64,
      display: "flex", gap: 6, background: "rgba(0,0,0,.85)",
      borderTop: "1px solid rgba(255,179,77,.35)", zIndex: 50
    }}>
      <Link to="/" style={btn(pathname === "/")}>Home</Link>
      <Link to="/friends" style={btn(pathname === "/friends")}>Friends</Link>
      <Link to="/upload" style={{ ...btn(pathname === "/upload"), fontSize: 22 }}>＋</Link>
      <Link to="/inbox" style={btn(pathname === "/inbox")}>Inbox</Link>
      <Link to="/profile" style={btn(pathname === "/profile")}>Profile</Link>
    </nav>
  );
}


