import React from "react";

export default function StoryBarPro() {
  return (
    <div style={{
      display:"flex", gap:12, padding:12, border:"1px solid #333",
      borderRadius:14, background:"#0c0c0f", marginBottom:16
    }}>
      {["A","M","F","B"].map((x) => (
        <div key={x} style={{
          width:60, height:60, borderRadius:"50%", background:"#111",
          border:"2px dashed #ff9f3b", display:"grid", placeItems:"center", color:"#fff"
        }}>{x}</div>
      ))}
    </div>
  );
}


