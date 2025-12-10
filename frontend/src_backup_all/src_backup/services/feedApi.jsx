// src/services/feedApi.js
import { supabase } from "../supabaseClient";

export async function listPosts() {
  const { data, error } = await supabase
    .from("feed_posts")
    .select("*, v_post_counts(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(p => ({
    ...p,
    counts: p.v_post_counts?.[0] ?? { reactions:0, comments:0, shares:0, bookmarks:0 }
  }));
}

export async function createPost({ text, media_url }) {
  const { error } = await supabase.from("feed_posts").insert([{ text, media_url }]);
  if (error) throw error;
}

export async function addReaction(postId, emoji) {
  const { error } = await supabase.from("feed_reactions").insert([{ post_id: postId, emoji }]);
  if (error) throw error;
}

export async function addComment(postId, body, parent_id=null) {
  const { error } = await supabase.from("feed_comments").insert([{ post_id: postId, body, parent_id }]);
  if (error) throw error;
}

export async function sharePost(postId) {
  const { error } = await supabase.from("feed_shares").insert([{ post_id: postId }]);
  if (error) throw error;
}

export async function toggleBookmark(postId, userId="anon") {
  // naïve: try insert; if unique violation, ignore
  const { error } = await supabase.from("feed_bookmarks").insert([{ post_id: postId }]);
  if (error && !String(error.message).includes("duplicate key")) throw error;
}

export function subscribePosts(onInsert) {
  return supabase
    .channel("feed_posts")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_posts" }, payload => {
      onInsert(payload.new);
    })
    .subscribe();
}


