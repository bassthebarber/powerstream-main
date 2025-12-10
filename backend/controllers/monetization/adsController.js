// backend/controllers/monetization/adsController.js
// Ads controller per Overlord Spec
import { sendSuccess, sendError, sendNotFound, sendCreated } from "../../utils/response.js";
import adsService from "../../services/monetization/ads.service.js";

/**
 * GET /api/ads/active/:location
 * Get active ads for a specific location
 */
export async function getActiveAds(req, res, next) {
  try {
    const { location } = req.params;
    const { limit = 3 } = req.query;
    
    const ads = await adsService.getActiveAds(location, parseInt(limit));
    
    return sendSuccess(res, { ads });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ads/slots
 * Get all ad slots (admin only)
 */
export async function getAdSlots(req, res, next) {
  try {
    const { status, location, limit = 50, skip = 0 } = req.query;
    
    const slots = await adsService.getAllSlots({
      status,
      location,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
    
    return sendSuccess(res, { slots });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ads/slots
 * Create a new ad slot (admin only)
 */
export async function createAdSlot(req, res, next) {
  try {
    const advertiserId = req.user.id;
    const slotData = req.body;
    
    const result = await adsService.createSlot({
      ...slotData,
      advertiser: advertiserId,
    });
    
    if (!result.success) {
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendCreated(res, { slot: result.slot }, "Ad slot created");
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/ads/slots/:id
 * Update an ad slot
 */
export async function updateAdSlot(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    
    const result = await adsService.updateSlot(id, userId, updates);
    
    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return sendNotFound(res, result.message);
      }
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, { slot: result.slot }, "Ad slot updated");
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/ads/slots/:id
 * Delete an ad slot
 */
export async function deleteAdSlot(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await adsService.deleteSlot(id, userId);
    
    if (!result.success) {
      if (result.code === "NOT_FOUND") {
        return sendNotFound(res, result.message);
      }
      return sendError(res, result.message, 400, result.code);
    }
    
    return sendSuccess(res, null, "Ad slot deleted");
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ads/:id/impression
 * Record an ad impression
 */
export async function recordImpression(req, res, next) {
  try {
    const { id } = req.params;
    
    await adsService.recordImpression(id);
    
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ads/:id/click
 * Record an ad click
 */
export async function recordClick(req, res, next) {
  try {
    const { id } = req.params;
    
    await adsService.recordClick(id);
    
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ads/stats/:id
 * Get statistics for an ad
 */
export async function getAdStats(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const stats = await adsService.getStats(id, userId);
    
    if (!stats) {
      return sendNotFound(res, "Ad not found");
    }
    
    return sendSuccess(res, { stats });
  } catch (error) {
    next(error);
  }
}

export default {
  getActiveAds,
  getAdSlots,
  createAdSlot,
  updateAdSlot,
  deleteAdSlot,
  recordImpression,
  recordClick,
  getAdStats,
};


