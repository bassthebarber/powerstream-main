// backend/src/domain/repositories/media.repository.js
// Media repository - data access layer for media assets
import mongoose from "mongoose";
import { logger } from "../../config/logger.js";

/**
 * MediaAsset Schema (inline since we don't have a dedicated model yet)
 * This can be moved to a separate model file if needed
 */
const MediaAssetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio", "document"],
      required: true,
    },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    
    // File metadata
    filename: { type: String },
    originalFilename: { type: String },
    mimeType: { type: String },
    size: { type: Number }, // bytes
    
    // Media-specific metadata
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number }, // seconds (for video/audio)
    
    // Storage info
    provider: {
      type: String,
      enum: ["cloudinary", "s3", "local"],
      default: "cloudinary",
    },
    publicId: { type: String }, // Cloudinary public ID
    bucket: { type: String }, // S3 bucket
    key: { type: String }, // S3 key
    
    // Processing status
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "ready",
    },
    processingError: { type: String },
    
    // Usage context
    context: {
      type: { type: String, enum: ["post", "message", "profile", "station", "reel", "story"] },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
    
    // Moderation
    isApproved: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    
    // Analytics
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MediaAssetSchema.index({ owner: 1, type: 1, createdAt: -1 });
MediaAssetSchema.index({ "context.type": 1, "context.entityId": 1 });
MediaAssetSchema.index({ publicId: 1 });

const MediaAsset = mongoose.models.MediaAsset || mongoose.model("MediaAsset", MediaAssetSchema);

/**
 * Media repository
 * Handles all data access for media files
 */
const mediaRepository = {
  /**
   * Create a media asset record
   */
  async createMediaAsset(data) {
    const asset = new MediaAsset(data);
    await asset.save();
    return asset;
  },

  /**
   * Get media asset by ID
   */
  async getMediaAssetById(assetId) {
    return MediaAsset.findById(assetId)
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Get media asset by public ID (Cloudinary)
   */
  async getMediaAssetByPublicId(publicId) {
    return MediaAsset.findOne({ publicId });
  },

  /**
   * Get user's media assets
   */
  async getUserMediaAssets(userId, options = {}) {
    const { limit = 50, skip = 0, type } = options;

    const query = { owner: userId };
    if (type) query.type = type;

    const assets = await MediaAsset.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MediaAsset.countDocuments(query);

    return { assets, total, hasMore: skip + assets.length < total };
  },

  /**
   * Get media assets by context (e.g., all images for a post)
   */
  async getMediaByContext(contextType, entityId) {
    return MediaAsset.find({
      "context.type": contextType,
      "context.entityId": entityId,
    }).sort({ createdAt: 1 });
  },

  /**
   * Update media asset
   */
  async updateMediaAsset(assetId, updates) {
    return MediaAsset.findByIdAndUpdate(
      assetId,
      { $set: updates },
      { new: true }
    );
  },

  /**
   * Delete media asset
   */
  async deleteMediaAsset(assetId, userId) {
    return MediaAsset.findOneAndDelete({ _id: assetId, owner: userId });
  },

  /**
   * Mark media as processing
   */
  async markProcessing(assetId) {
    return MediaAsset.findByIdAndUpdate(
      assetId,
      { $set: { status: "processing" } },
      { new: true }
    );
  },

  /**
   * Mark media as ready
   */
  async markReady(assetId, metadata = {}) {
    return MediaAsset.findByIdAndUpdate(
      assetId,
      { 
        $set: { 
          status: "ready",
          ...metadata,
        } 
      },
      { new: true }
    );
  },

  /**
   * Mark media as failed
   */
  async markFailed(assetId, error) {
    return MediaAsset.findByIdAndUpdate(
      assetId,
      { 
        $set: { 
          status: "failed",
          processingError: error,
        } 
      },
      { new: true }
    );
  },

  /**
   * Increment view count
   */
  async incrementViewCount(assetId) {
    return MediaAsset.findByIdAndUpdate(
      assetId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  },

  /**
   * Flag media for moderation
   */
  async flagMedia(assetId, reason) {
    return MediaAsset.findByIdAndUpdate(
      assetId,
      { 
        $set: { 
          isFlagged: true,
          flagReason: reason,
          isApproved: false,
        } 
      },
      { new: true }
    );
  },

  /**
   * Approve media
   */
  async approveMedia(assetId) {
    return MediaAsset.findByIdAndUpdate(
      assetId,
      { 
        $set: { 
          isApproved: true,
          isFlagged: false,
          flagReason: null,
        } 
      },
      { new: true }
    );
  },

  /**
   * Get user's storage usage
   */
  async getUserStorageUsage(userId) {
    const result = await MediaAsset.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          totalSize: { $sum: "$size" },
          count: { $sum: 1 },
        },
      },
    ]);

    const usage = {
      total: 0,
      byType: {},
    };

    for (const item of result) {
      usage.byType[item._id] = { size: item.totalSize, count: item.count };
      usage.total += item.totalSize;
    }

    return usage;
  },

  /**
   * Get flagged media (for moderation)
   */
  async getFlaggedMedia(options = {}) {
    const { limit = 50, skip = 0 } = options;

    return MediaAsset.find({ isFlagged: true, isApproved: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username avatarUrl");
  },

  /**
   * Search media by filename
   */
  async searchMedia(query, userId, options = {}) {
    const { limit = 50, skip = 0 } = options;

    return MediaAsset.find({
      owner: userId,
      $or: [
        { filename: { $regex: query, $options: "i" } },
        { originalFilename: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  /**
   * Get media analytics
   */
  async getMediaAnalytics(startDate, endDate) {
    return MediaAsset.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalSize: { $sum: "$size" },
          totalViews: { $sum: "$viewCount" },
        },
      },
    ]);
  },
};

export { MediaAsset };
export default mediaRepository;




