import { supabase } from "../lib/supabaseClient.jsx";

export async function fetchReels() {
  const { data, error } = await supabase
    .from("reel_videos")
    .select("video_url, thumb_url, caption, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}


