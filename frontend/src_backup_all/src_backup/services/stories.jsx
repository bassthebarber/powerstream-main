import { supabase } from "../supabaseClient";
const BUCKET = import.meta.env.VITE_SOCIAL_BUCKET || "social";

export async function fetchStories(limit=50){
  const { data, error } = await supabase
    .from("stories")
    .select("id, author, media_url, media_type, created_at, expires_at")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending:false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function uploadStoryFile(file, author="You"){
  const fileType = file.type || "application/octet-stream";
  const id = crypto.randomUUID();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `stories/${id}.${ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert:false, contentType:fileType });
  if (upErr) throw upErr;
  const { data:pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const media_url = pub?.publicUrl;

  const { error } = await supabase
    .from("stories")
    .insert([{ author, media_url, media_type:fileType }]);
  if (error) throw error;
}
 


