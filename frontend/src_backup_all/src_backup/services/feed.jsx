import { supabase } from "../supabaseClient";

export async function fetchPosts(limit=50){
  const { data, error } = await supabase
    .from("feed_posts")
    .select("id, author, body, media_url, media_type, created_at")
    .order("created_at", { ascending:false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function createPost(row){
  const { error } = await supabase.from("feed_posts").insert([row]);
  if (error) throw error;
}


