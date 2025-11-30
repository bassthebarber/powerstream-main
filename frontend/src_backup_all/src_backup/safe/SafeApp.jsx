import React from "react";

export default function SafeApp() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#f3f3f3",
      padding: 24,
      fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
    }}>
      <h1 style={{marginTop:0}}>✅ PowerStream Safe Boot</h1>
      <p>If you can read this, React is running. The router/layout are temporarily disabled.</p>

      <div style={{display:"flex", gap:12, marginTop:16, flexWrap:"wrap"}}>
        <button onClick={() => location.reload()} style={btn}>Reload</button>
        <button onClick={() => alert("It works")} style={btn}>Test Button</button>
      </div>

      <div style={{marginTop:24, opacity:.75, fontSize:12}}>
        If the screen ever goes black again, restore this Safe Boot, then we can re-enable pages one by one.
      </div>
    </div>
  );
}

const btn = {
  border: "1.5px solid #F7C948",
  color: "#F7C948",
  padding: "8px 12px",
  borderRadius: 10,
  background: "transparent",
  cursor: "pointer"
};


