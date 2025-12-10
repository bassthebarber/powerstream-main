import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchPosts } from "../services/feed";

export default function useFeed(){
  const [posts,setPosts] = useState([]), [loading,setLoading] = useState(true);

  useEffect(()=>{
    let on = true;
    (async()=>{ try{ const p = await fetchPosts(); if(on) setPosts(p); } finally{ if(on) setLoading(false); } })();
    const ch = supabase.channel("feed_posts_changes")
      .on("postgres_changes",{ event:"INSERT", schema:"public", table:"feed_posts" },payload=>{
        setPosts(prev=>[payload.new, ...prev]);
      }).subscribe();
    return ()=>{ on=false; supabase.removeChannel(ch); };
  },[]);
  return { posts, loading };
}


