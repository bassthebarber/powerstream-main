import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const s = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function ReelWall(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ (async()=>{
    const { data } = await s.from("reel_gallery").select("*").order("created_at",{ascending:false}).limit(40);
    setItems(data||[]);
  })(); },[]);
  const base = import.meta.env.VITE_SUPABASE_MEDIA_PUBLIC_URL || "";
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
      {items.map(m=>(
        <video key={m.id} src={`${base}/${m.media_url}`} controls
          style={{width:"100%",height:"470px",objectFit:"cover",borderRadius:14}}/>
      ))}
    </div>
  );
}


