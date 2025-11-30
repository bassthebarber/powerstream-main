// frontend/src/services/gramApi.js
import { supabase } from '../supabaseClient';

export const listGramPosts = async () => {
  const { data, error } = await supabase.from('gram_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const uploadGramPost = async (post) => {
  const { data, error } = await supabase.from('gram_posts').insert([post]);
  if (error) throw error;
  return data;
};


