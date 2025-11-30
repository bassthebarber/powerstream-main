// frontend/src/config/env.config.jsx
const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  BACKEND_API: import.meta.env.VITE_BACKEND_API || "http://localhost:5001",
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
};

export default env;
