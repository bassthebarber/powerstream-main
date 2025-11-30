import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function TopBar() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <header style={{
      position:"sticky", top:0, zIndex:60,
      display:"flex", alignItems:"center", gap:10,
      padding:"8px 12px", background:"rgba(0,0,0,.9)",
      borderBottom:"1px solid rgba(255,179,77,.35)"
    }}>
      {/* brand */}
      <Link to="/" style={{ fontWeight:800, letterSpacing:.3, color:"#ffb34d", textDecoration:"none" }}>
        PowerStream
      </Link>

      {/* fake search box */}
      <button onClick={()=>nav("/search")}
        style={{ marginLeft:8, flex:1, padding:"8px 10px", textAlign:"left",
                 borderRadius:10, border:"1px solid rgba(255,179,77,.25)",
                 background:"rgba(255,255,255,.03)", color:"#ddd" }}>
        Search PowerStream…
      </button>

      {/* create (+) */}
      <Link to="/create" title="Create"
        style={{ fontSize:20, padding:"6px 10px", borderRadius:10, border:"1px solid rgba(255,179,77,.35)" }}>
        ＋
      </Link>

      {/* PowerLine messenger — lightning icon */}
      <Link to="/powerline" title="PowerLine" aria-label="PowerLine"
        style={{ fontSize:20, padding:"6px 10px", borderRadius:10, border:"1px solid rgba(255,179,77,.35)" }}>
        ⚡
      </Link>
    </header>
  );
}


