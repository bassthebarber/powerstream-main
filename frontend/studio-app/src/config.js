// src/config.js
// DEPRECATED: Please use config/api.js for all API configuration
// This file re-exports from the central config for backwards compatibility

export * from "./config/api.js";

// Legacy exports (redirect to central config)
import { API_BASE as MainAPI, STUDIO_API_BASE as StudioAPI } from "./config/api.js";
export const API_BASE = StudioAPI; // Studio pages should use studio API
export const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload";
export const CLOUDINARY_PRESET = "YOUR_UPLOAD_PRESET";
