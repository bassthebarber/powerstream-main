// backend/src/api/controllers/media.controller.js
// Canonical media controller - handles uploads and media management
import mediaService from "../../services/media.service.js";
import eventsService from "../../services/events.service.js";
import { logger } from "../../config/logger.js";

const mediaController = {
  /**
   * POST /api/media/upload
   * Upload a media file
   */
  async upload(req, res, next) {
    try {
      const userId = req.user.id;
      const { file, type, folder } = req.body;

      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }

      const result = await mediaService.uploadMediaFile(userId, {
        file,
        type: type || "auto",
        folder: folder || "uploads",
      });

      res.status(201).json({
        success: true,
        media: result,
      });
    } catch (error) {
      logger.error("Error uploading media:", error);
      next(error);
    }
  },

  /**
   * POST /api/media/upload-url
   * Get a signed upload URL for direct upload
   */
  async getUploadUrl(req, res, next) {
    try {
      const userId = req.user.id;
      const { filename, contentType, folder } = req.body;

      if (!filename || !contentType) {
        return res.status(400).json({ message: "Filename and content type required" });
      }

      const result = await mediaService.getSignedUploadUrl({
        userId,
        filename,
        contentType,
        folder: folder || "uploads",
      });

      res.json({
        success: true,
        uploadUrl: result.uploadUrl,
        publicUrl: result.publicUrl,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      logger.error("Error getting upload URL:", error);
      next(error);
    }
  },

  /**
   * DELETE /api/media/:id
   * Delete a media file
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await mediaService.deleteMedia(id, userId);

      if (!result) {
        return res.status(404).json({ message: "Media not found or unauthorized" });
      }

      res.json({ success: true, message: "Media deleted" });
    } catch (error) {
      logger.error("Error deleting media:", error);
      next(error);
    }
  },

  /**
   * GET /api/media/:id
   * Get media info
   */
  async getMedia(req, res, next) {
    try {
      const { id } = req.params;

      const media = await mediaService.getMediaInfo(id);

      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.json({ success: true, media });
    } catch (error) {
      logger.error("Error getting media:", error);
      next(error);
    }
  },

  /**
   * GET /api/media/my
   * Get user's uploaded media
   */
  async getMyMedia(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      const type = req.query.type; // image, video, audio

      const media = await mediaService.getUserMedia(userId, { page, limit, type });

      res.json({
        success: true,
        media,
        page,
        limit,
      });
    } catch (error) {
      logger.error("Error getting my media:", error);
      next(error);
    }
  },

  /**
   * POST /api/media/process
   * Trigger media processing (transcoding, thumbnails, etc.)
   */
  async processMedia(req, res, next) {
    try {
      const { mediaId, operations } = req.body;
      const userId = req.user.id;

      if (!mediaId) {
        return res.status(400).json({ message: "Media ID is required" });
      }

      const result = await mediaService.processVideo(mediaId, userId, operations);

      res.json({
        success: true,
        job: result,
      });
    } catch (error) {
      logger.error("Error processing media:", error);
      next(error);
    }
  },

  /**
   * GET /api/media/process/:jobId
   * Get processing job status
   */
  async getProcessingStatus(req, res, next) {
    try {
      const { jobId } = req.params;

      const status = await mediaService.getProcessingStatus(jobId);

      if (!status) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ success: true, status });
    } catch (error) {
      logger.error("Error getting processing status:", error);
      next(error);
    }
  },
};

export default mediaController;



