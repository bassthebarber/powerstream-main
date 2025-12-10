import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const s = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function GramMasonry(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ (async()=>{
    const { data } = await s.from("gram_gallery").select("*").order("created_at",{ascending:false}).limit(80);
    setItems(data||[]);
  })(); },[]);
  const base = import.meta.env.VITE_SUPABASE_MEDIA_PUBLIC_URL || "";
  return (
    <div style={{columnCount:3,columnGap:"12px"}}>
      {items.map(m=>(
        <div key={m.id} style={{breakInside:"avoid",marginBottom:"12px"}}>
          {m.media_type==="video"
            ? <video src={`${base}/${m.media_url}`} controls style={{width:"100%",borderRadius:12}}/>
            : <img src={`${base}/${m.media_url}`} style={{width:"100%",borderRadius:12}}/>
          }
        </div>
      ))}
    </div>
  );
}


