import React from "react";
import { Link } from "react-router-dom";

export default function Menu(){
  const items = [
    ["Settings","/settings","⚙️"],
    ["Marketplace","/market","🛒"],
    ["Message requests","/powerline","💬"],
    ["Archive","/archive","🗂️"],
    ["Friend requests","/friends","👤＋"],
    ["Channel invites","/channels","📢"],
    ["Chat with AIs","/ai","🤖"],
    ["Create an AI","/ai/new","➕🤖"],
    ["Create community","/communities/new","👥＋"],
  ];
  return (
    <div style={{ padding:"12px", display:"grid", gap:12 }}>
      <div style={{ padding:"10px 12px", borderRadius:12, border:"1px solid rgba(255,179,77,.35)" }}>
        <strong>Marcus Bass</strong>
        <div style={{ opacity:.7 }}>Switch profile · @marcus.bass.463626</div>
      </div>
      {items.map(([label,href,icon])=>(
        <Link key={href} to={href} style={item}>{icon} {label}</Link>
      ))}
    </div>
  );
}
const item = {
  padding:"12px", borderRadius:12, border:"1px solid rgba(255,179,77,.25)",
  background:"rgba(255,255,255,.03)", color:"inherit", textDecoration:"none"
};


