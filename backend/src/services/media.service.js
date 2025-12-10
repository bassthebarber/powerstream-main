// backend/src/services/media.service.js
// Media service - business logic for media uploads and processing
import mediaRepository from "../domain/repositories/media.repository.js";
import { logger } from "../config/logger.js";
import env from "../config/env.js";

/**
 * Media service
 * Handles business logic for media uploads, processing, and management
 */
const mediaService = {
  /**
   * Upload media to Cloudinary
   */
  async uploadMedia(userId, file, options = {}) {
    try {
      // Dynamically import cloudinary to avoid issues if not configured
      let cloudinary;
      try {
        const { v2 } = await import("cloudinary");
        cloudinary = v2;
        cloudinary.config({
          cloud_name: env.CLOUDINARY_CLOUD_NAME,
          api_key: env.CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET,
        });
      } catch (err) {
        logger.error("Cloudinary not configured:", err.message);
        throw new Error("Media storage not configured");
      }

      const {
        folder = "powerstream",
        resourceType = "auto",
        transformation,
        context: mediaContext,
      } = options;

      // Determine resource type
      const type = file.mimetype?.startsWith("video/") ? "video" :
                   file.mimetype?.startsWith("audio/") ? "video" : // Cloudinary uses 'video' for audio too
                   file.mimetype?.startsWith("image/") ? "image" : "raw";

      // Upload to Cloudinary
      const uploadOptions = {
        folder: `${folder}/${userId}`,
        resource_type: resourceType,
        transformation,
      };

      let result;
      if (file.path) {
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
      } else if (file.buffer) {
        result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
          stream.end(file.buffer);
        });
      } else if (typeof file === "string") {
        // Base64 or URL
        result = await cloudinary.uploader.upload(file, uploadOptions);
      } else {
        throw new Error("Invalid file format");
      }

      // Create media asset record
      const mediaAsset = await mediaRepository.createMediaAsset({
        owner: userId,
        type: type === "video" && file.mimetype?.startsWith("audio/") ? "audio" : type,
        url: result.secure_url,
        thumbnailUrl: result.format === "mp4" ? 
          result.secure_url.replace(/\.[^/.]+$/, ".jpg") : null,
        filename: result.public_id,
        originalFilename: file.originalname || file.name,
        mimeType: file.mimetype,
        size: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
        provider: "cloudinary",
        publicId: result.public_id,
        context: mediaContext,
        status: "ready",
      });

      logger.info(`Media uploaded: ${mediaAsset._id} for user ${userId}`);

      return {
        success: true,
        mediaAsset,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error("Error uploading media:", error);
      throw error;
    }
  },

  /**
   * Upload image specifically
   */
  async uploadImage(userId, file, options = {}) {
    return this.uploadMedia(userId, file, {
      ...options,
      resourceType: "image",
      folder: options.folder || "powerstream/images",
    });
  },

  /**
   * Upload video specifically
   */
  async uploadVideo(userId, file, options = {}) {
    return this.uploadMedia(userId, file, {
      ...options,
      resourceType: "video",
      folder: options.folder || "powerstream/video",
    });
  },

  /**
   * Upload audio specifically
   */
  async uploadAudio(userId, file, options = {}) {
    return this.uploadMedia(userId, file, {
      ...options,
      resourceType: "video", // Cloudinary uses 'video' for audio
      folder: options.folder || "powerstream/audio",
    });
  },

  /**
   * Get media asset by ID
   */
  async getMediaById(assetId) {
    return mediaRepository.getMediaAssetById(assetId);
  },

  /**
   * Get user's media library
   */
  async getUserMedia(userId, options = {}) {
    return mediaRepository.getUserMediaAssets(userId, options);
  },

  /**
   * Delete media
   */
  async deleteMedia(assetId, userId) {
    try {
      const asset = await mediaRepository.getMediaAssetById(assetId);
      
      if (!asset) {
        throw new Error("Media asset not found");
      }

      if (asset.owner.toString() !== userId.toString()) {
        throw new Error("Not authorized to delete this media");
      }

      // Delete from Cloudinary
      if (asset.publicId && asset.provider === "cloudinary") {
        try {
          const { v2: cloudinary } = await import("cloudinary");
          cloudinary.config({
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            api_secret: env.CLOUDINARY_API_SECRET,
          });
          await cloudinary.uploader.destroy(asset.publicId, {
            resource_type: asset.type === "video" || asset.type === "audio" ? "video" : "image",
          });
        } catch (err) {
          logger.warn("Failed to delete from Cloudinary:", err.message);
        }
      }

      // Delete record
      await mediaRepository.deleteMediaAsset(assetId, userId);

      logger.info(`Media deleted: ${assetId} by user ${userId}`);

      return { success: true };
    } catch (error) {
      logger.error("Error deleting media:", error);
      throw error;
    }
  },

  /**
   * Get user's storage usage
   */
  async getStorageUsage(userId) {
    return mediaRepository.getUserStorageUsage(userId);
  },

  /**
   * Generate thumbnail for video
   */
  async generateThumbnail(videoUrl, options = {}) {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });

      // Extract public ID from URL
      const urlParts = videoUrl.split("/");
      const publicIdWithExt = urlParts.slice(-2).join("/");
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

      // Generate thumbnail URL
      const thumbnailUrl = cloudinary.url(publicId, {
        resource_type: "video",
        format: "jpg",
        transformation: [
          { width: options.width || 480, height: options.height || 270, crop: "fill" },
          { start_offset: options.time || "auto" },
        ],
      });

      return thumbnailUrl;
    } catch (error) {
      logger.error("Error generating thumbnail:", error);
      throw error;
    }
  },

  /**
   * Optimize image
   */
  async optimizeImage(imageUrl, options = {}) {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });

      // Extract public ID from URL
      const urlParts = imageUrl.split("/");
      const publicIdWithExt = urlParts.slice(-2).join("/");
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

      // Generate optimized URL
      const optimizedUrl = cloudinary.url(publicId, {
        quality: options.quality || "auto",
        fetch_format: options.format || "auto",
        width: options.width,
        height: options.height,
        crop: options.crop || "fill",
      });

      return optimizedUrl;
    } catch (error) {
      logger.error("Error optimizing image:", error);
      throw error;
    }
  },

  /**
   * Flag media for moderation
   */
  async flagMedia(assetId, reason, reporterId) {
    try {
      await mediaRepository.flagMedia(assetId, reason);
      logger.info(`Media flagged: ${assetId} by ${reporterId} - ${reason}`);
      return { success: true };
    } catch (error) {
      logger.error("Error flagging media:", error);
      throw error;
    }
  },

  /**
   * Approve media (admin)
   */
  async approveMedia(assetId, adminUserId) {
    try {
      await mediaRepository.approveMedia(assetId);
      logger.info(`Media approved: ${assetId} by admin ${adminUserId}`);
      return { success: true };
    } catch (error) {
      logger.error("Error approving media:", error);
      throw error;
    }
  },

  /**
   * Get flagged media for moderation (admin)
   */
  async getFlaggedMedia(options = {}) {
    return mediaRepository.getFlaggedMedia(options);
  },
};

export default mediaService;




