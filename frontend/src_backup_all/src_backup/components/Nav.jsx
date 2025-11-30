import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { brandForPath } from "../lib/api/brand";

const linkClass = ({ isActive }) =>
  "px-3 py-2 rounded-md " + (isActive ? "bg-yellow-600 text-black" : "text-yellow-400 hover:bg-yellow-800");

export default function Nav() {
  const { pathname } = useLocation();
  const { logo, alt } = brandForPath(pathname);

  return (
    <nav style={{display:"flex",gap:12,alignItems:"center",padding:12,background:"#0a0a0a",borderBottom:"1px solid #333"}}>
      <img src={logo} alt={alt} height={32} />
      <NavLink to="/feed" className={linkClass}>Feed</NavLink>
      <NavLink to="/gram" className={linkClass}>Gram</NavLink>
      <NavLink to="/reel" className={linkClass}>Reel</NavLink>
      <NavLink to="/tv"   className={linkClass}>TV</NavLink>
      <NavLink to="/copilot" className={linkClass}>Copilot</NavLink>
    </nav>
  );
}


