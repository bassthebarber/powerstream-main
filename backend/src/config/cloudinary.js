// backend/src/config/cloudinary.js
// Cloudinary configuration and upload helpers
import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";
import { logger } from "./logger.js";

let isConfigured = false;

/**
 * Initialize Cloudinary configuration
 */
export const initCloudinary = () => {
  if (isConfigured) return true;
  
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    logger.warn("⚠️ Cloudinary: Not configured (missing credentials)");
    return false;
  }
  
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  
  isConfigured = true;
  logger.info("✅ Cloudinary: Configured");
  return true;
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = () => isConfigured;

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path or base64 data
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  if (!isConfigured) {
    throw new Error("Cloudinary not configured");
  }
  
  const defaultOptions = {
    resource_type: "auto",
    folder: "powerstream",
    ...options,
  };
  
  try {
    const result = await cloudinary.uploader.upload(filePath, defaultOptions);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      duration: result.duration,
      bytes: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (err) {
    logger.error("Cloudinary upload failed:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!isConfigured) {
    throw new Error("Cloudinary not configured");
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return { success: result.result === "ok" };
  } catch (err) {
    logger.error("Cloudinary delete failed:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Generate optimized URL with transformations
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  if (!isConfigured) return null;
  
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    ...options,
  });
};

/**
 * Generate video thumbnail
 */
export const getVideoThumbnail = (publicId, options = {}) => {
  if (!isConfigured) return null;
  
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      { width: options.width || 480, crop: "scale" },
      { start_offset: options.offset || "0" },
    ],
    ...options,
  });
};

export default {
  initCloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
  getVideoThumbnail,
  cloudinary,
};

