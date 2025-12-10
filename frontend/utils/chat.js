// utils/chat.js
import { supabase } from './supabaseClient';

export async function sendMessage({ threadId = null, text }) {
  const {
    data: { user },
    error: authErr
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error('Sign in first');

  const { error } = await supabase
    .from('messages')
    .insert([{ thread_id: threadId, author_id: user.id, text }]);

  if (error) throw error;
}
