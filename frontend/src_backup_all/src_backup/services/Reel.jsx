import { supabase } from '../supabaseClient';

// List Reel posts
export const listReelPosts = async () => {
  const { data, error } = await supabase
    .from('reel_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Upload new Reel post
export const uploadReelPost = async ({ video_url, caption, user_id }) => {
  const { data, error } = await supabase
    .from('reel_posts')
    .insert([{ video_url, caption, user_id }]);

  if (error) throw error;
  return data;
};


