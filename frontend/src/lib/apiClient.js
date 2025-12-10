import axios from "axios";
import { getToken } from "../utils/auth.js";
import {
  MAIN_API_URL,
  STUDIO_API_URL,
} from "./streamConfig.js";

// Attach bearer token using unified auth module
function attachAuthToken(config) {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

