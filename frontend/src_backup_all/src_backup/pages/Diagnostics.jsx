import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Diagnostics(){
  const [api, setApi] = useState("…");
  const [sb, setSb] = useState("…");
  const [env, setEnv] = useState({});

  useEffect(() => {
    // API check: requires vite proxy -> '/api/ping'
    fetch("/api/ping").then(r=>r.ok?setApi("OK"):setApi("Bad response"))
      .catch(()=>setApi("FAILED"));

    // Supabase check (anonymous SELECT on feed_gallery)
    (async ()=>{
      try{
        const { data, error } = await supabase
          .from("feed_gallery")
          .select("id")
          .limit(1);
        setSb(error ? `ERROR: ${error.message}` : "OK");
      }catch(e){ setSb("FAILED"); }
    })();

    setEnv({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? "set" : "missing",
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "set" : "missing",
      VITE_LIVEPEER_API_KEY: import.meta.env.VITE_LIVEPEER_API_KEY ? "set" : "missing"
    });
  },[]);

  const box = {background:"#111",border:"1px solid #333",borderRadius:12,padding:16,marginBottom:16,color:"#ffd700"};

  return (
    <div style={{minHeight:"100vh",background:"#000",padding:24,color:"#fff"}}>
      <h1 style={{color:"#ffd700"}}>PowerStream – Diagnostics</h1>
      <div style={box}><b>API /api/ping:</b> {api}</div>
      <div style={box}><b>Supabase:</b> {sb}</div>
      <div style={box}>
        <b>Env:</b>
        <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(env,null,2)}</pre>
      </div>
      <div style={box}>
        <b>Quick Links</b>
        <p>
          <a href="/feed">Feed</a> · <a href="/gram">Gram</a> · <a href="/reel">Reel</a> ·
          {" "}<a href="/gallery">Gallery Hub</a> · <a href="/line">PowerLine</a> ·
          {" "}<a href="/network">Network</a>
        </p>
      </div>
    </div>
  );
}


