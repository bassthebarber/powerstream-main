// Central place for URLs so you can override with Vite envs in prod.
// In development, defaults to localhost. In production, falls back to production URLs.

// Main PowerStream API (port 5001)
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5001";

// Recording Studio API (port 5100)
export const STUDIO_API_BASE =
  import.meta.env.VITE_STUDIO_API_BASE_URL || "http://localhost:5100";

// Socket connections
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5100";
