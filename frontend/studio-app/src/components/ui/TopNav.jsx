import { Link, useLocation } from "react-router-dom";

const link = { marginRight: 16, color: "gold", textDecoration: "none" };
const active = { ...link, fontWeight: 700, textDecoration: "underline" };

export default function TopNav() {
  const { pathname } = useLocation();
  const L = (to, label) => (
    <Link key={to} to={to} style={pathname === to ? active : link}>
      {label}
    </Link>
  );
  return (
    <nav style={{ padding: 12, background: "#222", position: "sticky", top: 0 }}>
      {L("/", "Home")}
      {L("/record", "Record")}
      {L("/mix", "Mix")}
      {L("/master", "Master")}
      {L("/export", "Export")}
      {L("/settings", "Settings")}
      {L("/upload", "Upload")}
      {L("/library", "Library")}
    </nav>
  );
}
 