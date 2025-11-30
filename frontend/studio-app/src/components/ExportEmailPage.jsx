import { useState } from "react";
const API = import.meta.env.VITE_STUDIO_API || "https://studio.southernpowertvmusic.com/api";

export default function ExportEmailPage(){
  const [email,setEmail]=useState(""); const [link,setLink]=useState(""); const [msg,setMsg]=useState("");
  const send=async(e)=>{ e.preventDefault(); setMsg("Sending…");
    const r=await fetch(`${API}/email/send`,{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({email,link})});
    const d=await r.json().catch(()=>({})); setMsg(r.ok?"✅ Sent":"❌ "+(d.message||"failed"));
  };
  return (
    <section style={s.wrap}>
      <h2 style={s.h2}>Export & Email</h2>
      <form onSubmit={send} style={s.card}>
        <input placeholder="Recipient email" value={email} onChange={e=>setEmail(e.target.value)} style={s.inp}/>
        <input placeholder="Link to file (Cloudinary/S3)" value={link} onChange={e=>setLink(e.target.value)} style={s.inp}/>
        <button style={s.btn}>Send</button>
      </form>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
    </section>
  );
}
const s={wrap:{background:"#000",color:"#f5d76e",padding:16},h2:{marginTop:0},card:{background:"#0b0b0b",border:"1px solid #3a2c00",borderRadius:12,padding:12,display:"grid",gap:10},
inp:{background:"#111",color:"#f5d76e",border:"1px solid #3a2c00",borderRadius:10,padding:"10px 12px"},btn:{background:"#f5d76e",color:"#000",border:"none",padding:"10px 14px",borderRadius:10,fontWeight:800,cursor:"pointer"}};
