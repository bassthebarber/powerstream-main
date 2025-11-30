import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function FeedUploadGallery(){
  const [file,setFile] = useState(null);
  const [msg,setMsg] = useState("");

  const handleUpload = async ()=>{
    if(!file){ setMsg("Pick a file"); return; }
    const ext = file.name.split(".").pop();
    const path = `feed/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, file);
    if(upErr){ setMsg("Upload failed"); console.error(upErr); return; }

    const media_type = file.type.includes("video") ? "video" : "image";
    const { error: dbErr } = await supabase.from("feed_gallery").insert({ media_url: path, media_type });
    if(dbErr){ setMsg("DB insert failed"); console.error(dbErr); return; }
    setMsg("Uploaded!");
    setFile(null);
  };

  return (
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0]||null)}/>
      <button onClick={handleUpload}>Upload</button>
      <span style={{color:"var(--muted)"}}>{msg}</span>
    </div>
  );
}


