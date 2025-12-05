// frontend/src/lib/streamConfig.js
// Centralized streaming configuration for PowerStream
// Uses centralized config from apiConfig.js
import { SOCKET_URL } from "../config/apiConfig.js";

export const MAIN_API_URL = SOCKET_URL;

export const STUDIO_API_URL =
  import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100";

export const LIVEPEER_API_URL =
  import.meta.env.VITE_LIVEPEER_API_URL || "https://livepeer.studio/api";

export const LIVEPEER_API_KEY =
  import.meta.env.VITE_LIVEPEER_API_KEY || "";








