import { useState } from "react";
const API = import.meta.env.VITE_STUDIO_API || "https://studio.southernpowertvmusic.com/api";

export default function SettingsPage(){
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [msg,setMsg]=useState("");
  const login=async(e)=>{ e.preventDefault(); setMsg("Signing in…");
    const r=await fetch(`${API}/auth/login`,{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})});
    const d=await r.json().catch(()=>({})); setMsg(r.ok?`✅ Welcome`: `❌ ${d.message||"login failed"}`);
    if(r.ok) localStorage.setItem("studio_jwt", d.token);
  };
  return (
    <section style={{minHeight:"100vh",background:"#000",color:"#f5d76e",padding:16}}>
      <h2>Settings / Sign In</h2>
      <form onSubmit={login} style={{display:"grid",gap:8,maxWidth:400}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
        <input placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} style={inp}/>
        <button style={btn}>Sign in</button>
      </form>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
    </section>
  );
}
const inp={background:"#111",color:"#f5d76e",border:"1px solid #3a2c00",borderRadius:10,padding:"10px 12px"};
const btn={background:"#f5d76e",color:"#000",border:"none",padding:"10px 14px",borderRadius:10,fontWeight:800,cursor:"pointer"};
