const required = [
  'VITE_API_BASE',
  'VITE_SOCKET_URL',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SOCIAL_BUCKET'
];
const missing = required.filter((k) => !import.meta.env[k]);
if (missing.length) {
  console.warn('Missing env:', missing);
}


