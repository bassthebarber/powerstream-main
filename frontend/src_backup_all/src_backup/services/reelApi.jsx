// frontend/src/services/reelApi.js
import { supabase } from '../supabaseClient';

export const listReels = async () => {
  const { data, error } = await supabase.from('reel_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const uploadReel = async (reel) => {
  const { data, error } = await supabase.from('reel_posts').insert([reel]);
  if (error) throw error;
  return data;
};


