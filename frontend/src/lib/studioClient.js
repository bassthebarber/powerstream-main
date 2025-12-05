// frontend/src/lib/studioClient.js
// Client for Recording Studio server (port 5100)
import axios from "axios";
import { getToken } from "../utils/auth.js";

const STUDIO_API_BASE = import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100/api";

const studioClient = axios.create({
  baseURL: STUDIO_API_BASE,
  withCredentials: false,
});

// Attach token to requests
studioClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Beat generation
export async function generateBeat(payload) {
  try {
    const res = await studioClient.post("/studio/ai/generate-beat", payload);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Beat generation error:", err);
    return {
      success: false,
      error: err.response?.data?.message || "Beat generation failed",
    };
  }
}

// Activate AI Studio
export async function activateStudio() {
  try {
    const res = await studioClient.post("/studio/activate");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Run mixing sequence
export async function runMixingSequence(payload) {
  try {
    const res = await studioClient.post("/studio/sequence", payload);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Export project
export async function exportProject(payload) {
  try {
    const res = await studioClient.post("/studio/export", payload);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export default studioClient;



