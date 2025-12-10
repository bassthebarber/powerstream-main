// src/services/profile.js
import supabase from "../supabaseClient";

const AVATAR_BUCKET = "social";

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getMyProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMyProfile({ displayName, avatarUrl }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    display_name: displayName ?? null,
    avatar_url: avatarUrl ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function uploadAvatar(file) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  if (!file) throw new Error("No file selected");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `avatars/${user.id}.${ext}`;

  // Upload (overwrite if exists)
  const { error: upErr } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (upErr) throw upErr;

  // Get public URL
  const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}


