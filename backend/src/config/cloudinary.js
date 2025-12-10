// backend/src/config/cloudinary.js
// Re-export from central config to avoid duplicates
import cloudinary from "../../config/cloudinary.js";

// Legacy exports for backwards compatibility
export const initCloudinary = () => {
  console.log("✅ Cloudinary: Using central config from backend/config/cloudinary.js");
  return true;
};

export const isCloudinaryConfigured = () => {
  const cfg = cloudinary.config();
  return !!(cfg.cloud_name && cfg.api_key && cfg.api_secret);
};

export default cloudinary;
