// backend/services/monetization/ads.service.js
// Ads service per Overlord Spec
import AdSlot from "../../models/AdSlot.js";
import { logger } from "../../utils/logger.js";

const adsService = {
  /**
   * Get active ads for a location
   */
  async getActiveAds(location, limit = 3) {
    const now = new Date();
    
    return AdSlot.find({
      location,
      active: true,
      status: "active",
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null },
      ],
    })
      .sort({ price: -1 }) // Higher paying ads first
      .limit(limit)
      .select("-advertiser -targeting")
      .lean();
  },

  /**
   * Get all ad slots (admin)
   */
  async getAllSlots(options = {}) {
    const { status, location, limit = 50, skip = 0 } = options;
    
    const query = {};
    if (status) query.status = status;
    if (location) query.location = location;
    
    return AdSlot.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("advertiser", "name email")
      .lean();
  },

  /**
   * Create a new ad slot
   */
  async createSlot(data) {
    try {
      const slot = await AdSlot.create(data);
      logger.info(`Ad slot created: ${slot._id}`);
      return { success: true, slot };
    } catch (error) {
      logger.error("Error creating ad slot:", error);
      return { success: false, message: error.message, code: "CREATE_FAILED" };
    }
  },

  /**
   * Update an ad slot
   */
  async updateSlot(slotId, userId, updates) {
    const slot = await AdSlot.findById(slotId);
    
    if (!slot) {
      return { success: false, message: "Ad slot not found", code: "NOT_FOUND" };
    }
    
    // Check ownership (unless admin)
    // For now, allow any authenticated user to update their own ads
    if (slot.advertiser.toString() !== userId) {
      return { success: false, message: "Not authorized", code: "UNAUTHORIZED" };
    }
    
    // Apply updates
    Object.assign(slot, updates);
    await slot.save();
    
    return { success: true, slot };
  },

  /**
   * Delete an ad slot
   */
  async deleteSlot(slotId, userId) {
    const slot = await AdSlot.findById(slotId);
    
    if (!slot) {
      return { success: false, message: "Ad slot not found", code: "NOT_FOUND" };
    }
    
    if (slot.advertiser.toString() !== userId) {
      return { success: false, message: "Not authorized", code: "UNAUTHORIZED" };
    }
    
    await slot.deleteOne();
    logger.info(`Ad slot deleted: ${slotId}`);
    
    return { success: true };
  },

  /**
   * Record an impression
   */
  async recordImpression(slotId) {
    const slot = await AdSlot.findById(slotId);
    if (!slot) return;
    
    slot.impressions += 1;
    if (slot.pricingModel === "cpm") {
      slot.spent += slot.price / 1000;
    }
    await slot.save();
  },

  /**
   * Record a click
   */
  async recordClick(slotId) {
    const slot = await AdSlot.findById(slotId);
    if (!slot) return;
    
    slot.clicks += 1;
    if (slot.pricingModel === "cpc") {
      slot.spent += slot.price;
    }
    await slot.save();
  },

  /**
   * Get ad statistics
   */
  async getStats(slotId, userId) {
    const slot = await AdSlot.findById(slotId);
    
    if (!slot) return null;
    
    // Check ownership
    if (slot.advertiser.toString() !== userId) {
      return null;
    }
    
    const ctr = slot.impressions > 0
      ? ((slot.clicks / slot.impressions) * 100).toFixed(2)
      : 0;
    
    return {
      impressions: slot.impressions,
      clicks: slot.clicks,
      ctr: `${ctr}%`,
      spent: slot.spent,
      budget: slot.budget,
      remaining: slot.budget - slot.spent,
    };
  },
};

export default adsService;


