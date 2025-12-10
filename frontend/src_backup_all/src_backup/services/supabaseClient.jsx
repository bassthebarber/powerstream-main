import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Visible in console only, helpful during setup
  console.warn('Supabase env vars missing. Check .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true }
});


