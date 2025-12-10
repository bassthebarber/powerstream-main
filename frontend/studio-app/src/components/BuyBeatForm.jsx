import { useState } from "react";

const API_BASE =
  import.meta?.env?.VITE_STUDIO_API ||
  "https://studio.southernpowertvmusic.com/api";

export default function BuyBeatForm() {
  const [form, setForm] = useState({ name:"", email:"", beatLink:"", message:"" });
  const [status, setStatus] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus("Sending…");
    try {
      // Expect a backend route POST /api/email/buy-beat {name,email,beatLink,message}
      const res = await fetch(`${API_BASE}/email/buy-beat`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(()=> ({}));
      if (!res.ok) throw new Error(data?.message || "Request failed");
      setStatus("✅ Sent! We’ll email you back soon.");
      setForm({ name:"", email:"", beatLink:"", message:"" });
    } catch (e) {
      setStatus("❌ " + e.message);
    }
  };

  return (
    <form onSubmit={submit} style={s.card}>
      <h2 style={s.h2}>Buy Beat / Contact</h2>
      <label style={s.label}>Artist Name
        <input style={s.input} name="name" value={form.name} onChange={onChange} required />
      </label>
      <label style={s.label}>Email
        <input style={s.input} type="email" name="email" value={form.email} onChange={onChange} required />
      </label>
      <label style={s.label}>Beat Link (YouTube/Cloudinary/etc.)
        <input style={s.input} name="beatLink" value={form.beatLink} onChange={onChange} />
      </label>
      <label style={s.label}>Message
        <textarea style={s.textarea} name="message" rows={5} value={form.message} onChange={onChange} />
      </label>
      <button style={s.btn} type="submit">Send</button>
      {status && <div style={s.status}>{status}</div>}
    </form>
  );
}

const s = {
  card:{ background:"#0b0b0b", color:"#f5d76e", padding:16, border:"1px solid #3a2c00", borderRadius:14, maxWidth:640 },
  h2:{ marginTop:0 },
  label:{ display:"block", margin:"10px 0 6px 0" },
  input:{ width:"100%", padding:"10px 12px", background:"#111", color:"#f5d76e", border:"1px solid #3a2c00", borderRadius:10 },
  textarea:{ width:"100%", padding:"10px 12px", background:"#111", color:"#f5d76e", border:"1px solid #3a2c00", borderRadius:10 },
  btn:{ marginTop:10, background:"#f5d76e", color:"#000", border:"none", padding:"10px 16px", borderRadius:10, fontWeight:800, cursor:"pointer" },
  status:{ marginTop:10, color:"#ffd54f" }
};
