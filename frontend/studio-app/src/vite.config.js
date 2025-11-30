// Central place for URLs so you can override with Vite envs in prod.
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://studio-api.southernpowertvmusic.com";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://studio-api.southernpowertvmusic.com";
