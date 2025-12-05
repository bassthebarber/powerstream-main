import axios from "axios";
import {
  MAIN_API_URL,
  STUDIO_API_URL,
} from "./streamConfig.js";

// Attach bearer token from localStorage if present
function attachAuthToken(config) {
  try {
    const token =
      localStorage.getItem("powerstream_token") ||
      localStorage.getItem("ps_token");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // localStorage unavailable (SSR or private mode); ignore
  }
  return config;
}

export const apiClient = axios.create({
  baseURL: MAIN_API_URL,
  withCredentials: true,
});

export const studioClient = axios.create({
  baseURL: STUDIO_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(attachAuthToken, (error) =>
  Promise.reject(error)
);
studioClient.interceptors.request.use(attachAuthToken, (error) =>
  Promise.reject(error)
);

export default apiClient;

