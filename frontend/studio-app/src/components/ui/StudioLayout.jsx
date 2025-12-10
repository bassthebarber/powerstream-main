import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const nav = [
  { to: "/record",  label: "Record",  emoji: "🎙️" },
  { to: "/mix",     label: "Mix",     emoji: "🎚️" },
  { to: "/master",  label: "Master",  emoji: "🎛️" },
  { to: "/export",  label: "Export",  emoji: "📤" },
  { to: "/settings",label: "Settings",emoji: "⚙️" },
  { to: "/upload",  label: "Upload",  emoji: "⤴️" },
  { to: "/library", label: "Library", emoji: "📚" },
];

export default function StudioLayout() {
  const loc = useLocation();

  // Keyboard shortcuts: G-library, R-record, M-mix, E-export, S-settings, U-upload
  useEffect(() => {
    const go = (path) => () => (window.location.href = `${window.location.origin}/studio${path}`);
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "g") go("/library")();
      if (k === "r") go("/record")();
      if (k === "m") go("/mix")();
      if (k === "e") go("/export")();
      if (k === "s") go("/settings")();
      if (k === "u") go("/upload")();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={outer}>
      <header style={header}>
        <Link to="/record" style={brand}>PowerStream Studio</Link>
        <nav style={navWrap}>
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              style={({ isActive }) => ({
                ...navLink,
                ...(isActive || loc.pathname === `/studio${n.to}` ? active : {}),
              })}
            >
              <span style={{ marginRight: 6 }}>{n.emoji}</span>{n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main style={main}>
        <Outlet />
      </main>

      <footer style={foot}>
        Tips: Press <kbd>R</kbd> for Record, <kbd>M</kbd> Mix, <kbd>G</kbd> Library • All routes under <code>/studio</code>
      </footer>
    </div>
  );
}

const outer  = { minHeight:"100vh", background:"#0a0a0a", color:"#f6d74c", display:"flex", flexDirection:"column" };
const header = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", background:"#121212", borderBottom:"1px solid #222", position:"sticky", top:0, zIndex:5 };
const brand  = { color:"#f6d74c", fontWeight:900, textDecoration:"none", letterSpacing:0.5 };
const navWrap= { display:"flex", gap:8, flexWrap:"wrap" };
const navLink= { color:"#ddd", textDecoration:"none", padding:"8px 12px", borderRadius:10, background:"#1a1a1a", border:"1px solid #2a2a2a", fontWeight:800 };
const active = { background:"#f6d74c", color:"#121212", border:"1px solid #f6d74c" };
const main   = { maxWidth:1200, width:"100%", margin:"0 auto", padding:"18px" };
const foot   = { marginTop:"auto", padding:"10px 18px", color:"#aaa", fontSize:12, borderTop:"1px solid #222" };
