import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function FeedGallery(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from("feed_gallery").select("*").order("created_at",{ascending:false}).limit(60);
    setItems(data||[]);
  })(); },[]);

  const base = import.meta.env.VITE_SUPABASE_MEDIA_PUBLIC_URL || "";
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
      {items.map(m=> m.media_type==="video"
        ? <video key={m.id} src={`${base}/${m.media_url}`} controls style={{width:"100%",borderRadius:10}}/>
        : <img   key={m.id} src={`${base}/${m.media_url}`} style={{width:"100%",aspectRatio:"1/1",objectFit:"cover",borderRadius:10}}/>
      )}
    </div>
  );
}


