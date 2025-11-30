// frontend/src/utils/API.js

// Pull API base URL from .env
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Simple helper for GET requests
export const apiGet = async (endpoint) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    return await res.json();
  } catch (err) {
    console.error(`❌ API GET ${endpoint} failed:`, err);
    throw err;
  }
};

// Simple helper for POST requests
export const apiPost = async (endpoint, data = {}) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error(`❌ API POST ${endpoint} failed:`, err);
    throw err;
  }
};

// Example usage:
// import { apiGet, apiPost } from "../utils/API";
// const status = await apiGet("/api/ai/status");
// const build = await apiPost("/api/ai/command", { command: "PowerStream, initiate global build." });

export default {
  apiGet,
  apiPost
};
