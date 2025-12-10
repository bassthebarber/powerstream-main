import { supabase } from "../supabaseClient";

/* ========== REACTIONS ========== */
export async function setReaction(post_id, emoji, user_id = "anon") {
  // Upsert single reaction per user
  await supabase.from("feed_reactions").delete().eq("post_id", post_id).eq("user_id", user_id);
  const { error } = await supabase.from("feed_reactions").insert([{ post_id, user_id, emoji }]);
  if (error) throw error;
}

export async function getReactionCounts(post_id) {
  const { data, error } = await supabase
    .from("feed_reactions")
    .select("emoji, count:emoji")
    .eq("post_id", post_id)
    .group("emoji");
  if (error) throw error;
  const map = { like:0,love:0,haha:0,wow:0,sad:0,angry:0 };
  (data||[]).forEach(r => map[r.emoji] = Number(r.count));
  return map;
}

/* ========== COMMENTS ========== */
export async function addComment({ post_id, body, user_name }) {
  const { data, error } = await supabase.from("feed_comments")
    .insert([{ post_id, body, user_name: user_name || null }])
    .select().single();
  if (error) throw error;
  return data;
}

export async function fetchComments(post_id) {
  const { data, error } = await supabase
    .from("feed_comments")
    .select("*")
    .eq("post_id", post_id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

/* ========== SHARES ========== */
export async function sharePost(post_id, user_name = "Guest") {
  const { data, error } = await supabase
    .from("feed_shares")
    .insert([{ post_id, user_name }])
    .select().single();
  if (error) throw error;
  return data;
}

/* ========== POLLS ========== */
export async function createPoll(post_id, question, options) {
  const { data: poll, error: e1 } = await supabase
    .from("feed_polls")
    .insert([{ post_id, question }])
    .select().single();
  if (e1) throw e1;
  const opts = options.map(label => ({ poll_id: poll.id, label }));
  const { error: e2 } = await supabase.from("feed_poll_options").insert(opts);
  if (e2) throw e2;
  return poll;
}

export async function votePoll(poll_id, option_id, user_id = "anon") {
  // one vote per user per poll
  await supabase.from("feed_poll_votes").delete().eq("poll_id", poll_id).eq("user_id", user_id);
  const { error } = await supabase.from("feed_poll_votes").insert([{ poll_id, option_id, user_id }]);
  if (error) throw error;
}

export async function pollResults(poll_id) {
  // return options + votes
  const { data: options, error: eo } = await supabase
    .from("feed_poll_options").select("*").eq("poll_id", poll_id);
  if (eo) throw eo;
  const { data: votes, error: ev } = await supabase
    .from("feed_poll_votes").select("option_id").eq("poll_id", poll_id);
  if (ev) throw ev;
  const counts = {};
  options.forEach(o => counts[o.id] = 0);
  votes.forEach(v => counts[v.option_id] = (counts[v.option_id]||0) + 1);
  return { options, counts };
}

/* ========== BOOKMARKS ========== */
export async function toggleBookmark(post_id, user_id = "anon") {
  const { data, error } = await supabase
    .from("feed_bookmarks")
    .select("*").eq("post_id", post_id).eq("user_id", user_id).maybeSingle();
  if (error) throw error;
  if (data) {
    await supabase.from("feed_bookmarks").delete().eq("post_id", post_id).eq("user_id", user_id);
    return { saved: false };
  }
  await supabase.from("feed_bookmarks").insert([{ post_id, user_id }]);
  return { saved: true };
}

/* ========== STORIES (24h) ========== */
export async function addStory({ user_name, media_url }) {
  const { error } = await supabase.from("feed_stories").insert([{ user_name, media_url }]);
  if (error) throw error;
}
export async function fetchActiveStories(limit = 50) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("feed_stories")
    .select("*")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/* ========== NOTIFICATIONS (simple) ========== */
export async function notify({ user_id, type, from_user_name, post_id }) {
  const { error } = await supabase.from("feed_notifications")
    .insert([{ user_id, type, from_user_name, post_id }]);
  if (error) throw error;
}

export async function fetchNotifications(user_id, limit = 20) {
  const { data, error } = await supabase
    .from("feed_notifications")
    .select("*").eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}


