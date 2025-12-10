import React from "react";
export default function Notifications(){
  return (
    <div style={{ padding:"12px" }}>
      <h2>Notifications</h2>
      <ul style={{ display:"grid", gap:10, marginTop:12 }}>
        <li style={row}>Brad liked your photo · 23m</li>
        <li style={row}>Calvin added a new photo · 1h</li>
        <li style={row}>New friend request from Madeline · 2h</li>
      </ul>
    </div>
  );
}
const row = { padding:"12px", borderRadius:10, border:"1px solid rgba(255,179,77,.25)", background:"rgba(255,255,255,.03)" };


